import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import PWAInstallButton from '@/components/pwa/PWAInstallButton';
import PushNotificationPrompt from '@/components/push/PushNotificationPrompt';

export function HomePage() {
  const { user } = useAuthStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {user ? `${user.name}님, 환영합니다!` : '동아리 커뮤니티'}
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          동아리 활동을 더 쉽고 편리하게
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {/* Admin 페이지 - president만 표시 */}
          {user?.role === 'president' && (
            <Link
              to="/admin"
              className="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="text-3xl mb-4">⚙️</div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                관리자
              </h3>
              <p className="text-sm text-blue-700">
                회원 승인 및 관리자 기능
              </p>
            </Link>
          )}

          <Link
            to="/notices"
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="text-3xl mb-4">📢</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              공지사항
            </h3>
            <p className="text-sm text-gray-600">
              중요한 공지사항을 확인하세요
            </p>
          </Link>

          <Link
            to="/posts"
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="text-3xl mb-4">💬</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              자유게시판
            </h3>
            <p className="text-sm text-gray-600">
              자유롭게 소통하고 정보를 공유하세요
            </p>
          </Link>

          <Link
            to="/donations"
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="text-3xl mb-4">💰</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              후원 내역
            </h3>
            <p className="text-sm text-gray-600">
              투명한 후원금 내역을 확인하세요
            </p>
          </Link>
        </div>
      </div>

      {/* PWA Install Button - 자동으로 숨김 */}
      <PWAInstallButton />

      {/* Push Notification Prompt - 자동으로 표시/숨김 */}
      <PushNotificationPrompt />
    </div>
  );
}
