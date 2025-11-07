import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export function EmailVerificationPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState('');

  const handleResendEmail = async () => {
    if (!email) {
      setMessage('이메일 주소가 올바르지 않습니다.');
      return;
    }

    setIsResending(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      setMessage('✅ 인증 메일이 재발송되었습니다.');
    } catch (error: any) {
      setMessage('❌ ' + (error.message || '메일 재발송에 실패했습니다.'));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
            <svg
              className="h-10 w-10 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            이메일을 확인해주세요
          </h1>
          <p className="text-gray-600">회원가입이 거의 완료되었습니다!</p>
        </div>

        <div className="bg-white py-8 px-6 shadow-md rounded-lg">
          <div className="space-y-6">
            {/* Email Address */}
            {email && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 mb-1">인증 메일 발송 주소:</p>
                <p className="text-base font-semibold text-blue-900">{email}</p>
              </div>
            )}

            {/* Instructions */}
            <div className="space-y-3">
              <p className="text-gray-700">
                위 이메일 주소로 인증 메일을 발송했습니다.
                <br />
                이메일의 <strong>인증 링크</strong>를 클릭하여 가입을 완료해주세요.
              </p>

              {/* Tips */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-900 mb-2">💡 팁</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• 이메일이 보이지 않으면 <strong>스팸함</strong>을 확인해주세요</li>
                  <li>• 메일 수신까지 <strong>최대 5분</strong> 정도 소요될 수 있습니다</li>
                  <li>• 이메일 확인 후 <strong>관리자 승인</strong>을 기다려주세요</li>
                </ul>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div
                className={`p-3 rounded-md text-sm ${
                  message.startsWith('✅')
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {message}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleResendEmail}
                disabled={isResending}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isResending ? '재발송 중...' : '📧 인증 메일 재발송'}
              </button>

              <Link
                to="/auth/login"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                로그인 페이지로 이동
              </Link>
            </div>

            {/* Additional Info */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                이메일 주소가 잘못되었나요?{' '}
                <Link
                  to="/auth/signup"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  다시 가입하기
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
