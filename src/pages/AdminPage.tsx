import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { PendingUsersTable } from '@/components/admin';

export function AdminPage() {
  const { user, isLoading } = useAuthStore();

  // 로딩 중이면 로딩 표시
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // President가 아니면 홈으로 리다이렉트
  if (!user || user.role !== 'president') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          관리자 대시보드
        </h1>
        <p className="text-gray-600">
          가입 대기 중인 회원을 승인하거나 거부할 수 있습니다
        </p>
      </div>

      <PendingUsersTable />
    </div>
  );
}
