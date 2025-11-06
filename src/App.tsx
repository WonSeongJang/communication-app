import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { MainLayout } from './components/layout/MainLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ChangePasswordPage } from './pages/auth/ChangePasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { UpdatePasswordPage } from './pages/auth/UpdatePasswordPage';
import { HomePage } from './pages/HomePage';
import { AdminPage } from './pages/AdminPage';
import { NoticesListPage } from './pages/board/NoticesListPage';
import { NoticeDetailPage } from './pages/board/NoticeDetailPage';
import { NoticeCreatePage } from './pages/board/NoticeCreatePage';
import { NoticeEditPage } from './pages/board/NoticeEditPage';
import { PostsListPage } from './pages/board/PostsListPage';
import { PostDetailPage } from './pages/board/PostDetailPage';
import { PostCreatePage } from './pages/board/PostCreatePage';
import { PostEditPage } from './pages/board/PostEditPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { DonationsPage } from './pages/donation/DonationsPage';
import { DonationManagePage } from './pages/donation/DonationManagePage';

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/signup" element={<SignupPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/update-password" element={<UpdatePasswordPage />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="admin" element={<AdminPage />} />

          {/* Notice Board Routes */}
          <Route path="notices" element={<NoticesListPage />} />
          <Route path="notices/new" element={<NoticeCreatePage />} />
          <Route path="notices/:id" element={<NoticeDetailPage />} />
          <Route path="notices/:id/edit" element={<NoticeEditPage />} />

          {/* Free Board Routes */}
          <Route path="posts" element={<PostsListPage />} />
          <Route path="posts/new" element={<PostCreatePage />} />
          <Route path="posts/:id" element={<PostDetailPage />} />
          <Route path="posts/:id/edit" element={<PostEditPage />} />

          {/* Donation Routes */}
          <Route path="donations" element={<DonationsPage />} />
          <Route path="donations/manage" element={<DonationManagePage />} />

          {/* Profile Routes */}
          <Route path="profile" element={<ProfilePage />} />
          <Route path="profile/change-password" element={<ChangePasswordPage />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
