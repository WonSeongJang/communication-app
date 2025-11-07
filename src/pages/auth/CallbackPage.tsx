import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

/**
 * CallbackPage handles email verification callback from Supabase Auth
 *
 * Flow:
 * 1. User clicks verification link in email
 * 2. Supabase automatically verifies email and creates session
 * 3. This page syncs email_confirmed_at to users table
 * 4. Redirects to login with success message
 */
export function CallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('이메일 인증을 처리하고 있습니다...');

  useEffect(() => {
    handleEmailVerification();
  }, []);

  const handleEmailVerification = async () => {
    try {
      // Get current session (Supabase automatically handles token from URL)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!session) {
        throw new Error('세션을 찾을 수 없습니다. 다시 시도해주세요.');
      }

      // Check if email is verified
      if (!session.user.email_confirmed_at) {
        throw new Error('이메일 인증이 완료되지 않았습니다.');
      }

      // Sync email_confirmed_at to users table
      const { error: updateError } = await supabase
        .from('users')
        .update({
          email_confirmed_at: session.user.email_confirmed_at,
        })
        .eq('id', session.user.id);

      if (updateError) {
        console.error('Failed to update email_confirmed_at:', updateError);
        // Don't throw - verification is still successful
      }

      // Success!
      setStatus('success');
      setMessage('이메일 인증이 완료되었습니다! 관리자 승인 후 로그인할 수 있습니다.');

      // Sign out user (they need admin approval before they can actually use the app)
      await supabase.auth.signOut();

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/auth/login', {
          state: {
            message: '이메일 인증이 완료되었습니다. 관리자 승인을 기다려주세요.',
          },
        });
      }, 3000);
    } catch (error: any) {
      console.error('Email verification error:', error);
      setStatus('error');
      setMessage(error.message || '이메일 인증 처리 중 오류가 발생했습니다.');

      // Redirect to login after 5 seconds
      setTimeout(() => {
        navigate('/auth/login');
      }, 5000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div
            className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 ${
              status === 'processing'
                ? 'bg-blue-100'
                : status === 'success'
                ? 'bg-green-100'
                : 'bg-red-100'
            }`}
          >
            {status === 'processing' && (
              <svg
                className="animate-spin h-10 w-10 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            {status === 'success' && (
              <svg
                className="h-10 w-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
            {status === 'error' && (
              <svg
                className="h-10 w-10 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
          </div>
          <h1
            className={`text-2xl font-bold mb-2 ${
              status === 'processing'
                ? 'text-gray-900'
                : status === 'success'
                ? 'text-green-900'
                : 'text-red-900'
            }`}
          >
            {status === 'processing'
              ? '처리 중...'
              : status === 'success'
              ? '인증 완료!'
              : '오류 발생'}
          </h1>
          <p className="text-gray-600">{message}</p>
        </div>

        <div className="bg-white py-8 px-6 shadow-md rounded-lg">
          {status === 'success' && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  ✅ 이메일 인증이 성공적으로 완료되었습니다.
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 mb-2">
                  <strong>다음 단계:</strong>
                </p>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>관리자의 승인을 기다립니다</li>
                  <li>승인 완료 후 로그인할 수 있습니다</li>
                </ol>
              </div>
              <p className="text-sm text-gray-500 text-center">
                3초 후 로그인 페이지로 이동합니다...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  ❌ 이메일 인증 처리 중 문제가 발생했습니다.
                </p>
              </div>
              <p className="text-sm text-gray-500 text-center">
                5초 후 로그인 페이지로 이동합니다...
              </p>
            </div>
          )}

          {status === 'processing' && (
            <div className="text-center">
              <p className="text-sm text-gray-500">잠시만 기다려주세요...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
