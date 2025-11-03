import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export function Header() {
  const { user, isAuthenticated, signOut } = useAuthStore();

  const handleSignOut = async () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      await signOut();
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <h1 className="text-xl font-bold text-blue-600">
              동아리 커뮤니티
            </h1>
          </Link>

          {/* Navigation */}
          {isAuthenticated && (
            <nav className="hidden md:flex space-x-8">
              <Link
                to="/notices"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
              >
                공지사항
              </Link>
              <Link
                to="/posts"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
              >
                자유게시판
              </Link>
              <Link
                to="/donations"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
              >
                후원 내역
              </Link>
            </nav>
          )}

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-blue-600 text-sm"
                >
                  {user?.name}님
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-gray-700 hover:text-blue-600"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <Link
                to="/auth/login"
                className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                로그인
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
