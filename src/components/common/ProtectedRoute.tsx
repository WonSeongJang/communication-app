import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresRole?: 'president' | 'member';
}

export function ProtectedRoute({
  children,
  requiresRole,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // Check if user is approved
  if (user?.status !== 'active') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            승인 대기 중
          </h2>
          <p className="text-gray-600">
            관리자의 승인을 기다리고 있습니다.
            <br />
            승인이 완료되면 이메일로 알림을 받게 됩니다.
          </p>
        </div>
      </div>
    );
  }

  // Check role if required
  if (requiresRole && user?.role !== requiresRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
