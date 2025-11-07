import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

export function LoginPage() {
  const navigate = useNavigate();
  const { checkAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true); // 기본값: 로그인 유지
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check email verification
      if (!authData.user.email_confirmed_at) {
        await supabase.auth.signOut();
        throw new Error('이메일 인증이 필요합니다. 이메일을 확인해주세요.');
      }

      // Check user status from database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('status')
        .eq('id', authData.user.id)
        .single();

      if (userError) throw userError;

      // Block login if user is not active
      if (userData.status !== 'active') {
        await supabase.auth.signOut();
        throw new Error('관리자의 승인을 기다리고 있습니다. 승인 후 로그인할 수 있습니다.');
      }

      // rememberMe는 Supabase Client의 persistSession 설정으로 제어됨
      // 기본적으로 로그인 상태는 유지됨 (refresh token 사용)
      await checkAuth();
      navigate('/');
    } catch (err: any) {
      setError(err.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            동아리 커뮤니티
          </h1>
          <p className="mt-2 text-gray-600">로그인하여 시작하세요</p>
        </div>

        <div className="bg-white py-8 px-6 shadow-md rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                이메일
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-700"
              >
                로그인 상태 유지
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              계정이 없으신가요?{' '}
              <Link
                to="/auth/signup"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                회원가입
              </Link>
            </p>
            <p className="text-sm text-gray-600">
              <Link
                to="/auth/reset-password"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                비밀번호를 잊으셨나요?
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
