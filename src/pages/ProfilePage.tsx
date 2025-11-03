import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { profileService } from '@/services/profileService';
import type { UpdateProfileInput } from '@/services/profileService';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, setUser, signOut } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 프로필 편집 폼 상태
  const [profileForm, setProfileForm] = useState({
    name: '',
    occupation: '',
    phone: '',
    messenger_id: '',
  });

  // 비밀번호 변경 폼 상태
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // 사용자 정보로 폼 초기화
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        occupation: user.occupation || '',
        phone: user.phone || '',
        messenger_id: user.messenger_id || '',
      });
    }
  }, [user]);

  // 프로필 편집 토글
  const handleEditToggle = () => {
    if (isEditing) {
      // 취소 시 원래 값으로 복원
      if (user) {
        setProfileForm({
          name: user.name || '',
          occupation: user.occupation || '',
          phone: user.phone || '',
          messenger_id: user.messenger_id || '',
        });
      }
      setError(null);
    }
    setIsEditing(!isEditing);
  };

  // 프로필 업데이트 처리
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // 변경된 필드만 전송
      const updateData: UpdateProfileInput = {};
      if (profileForm.name !== user.name) updateData.name = profileForm.name;
      if (profileForm.occupation !== user.occupation)
        updateData.occupation = profileForm.occupation;
      if (profileForm.phone !== user.phone) updateData.phone = profileForm.phone;
      if (profileForm.messenger_id !== user.messenger_id)
        updateData.messenger_id = profileForm.messenger_id || null;

      // 변경 사항이 없으면 종료
      if (Object.keys(updateData).length === 0) {
        setError('변경된 정보가 없습니다.');
        setIsLoading(false);
        return;
      }

      const updatedUser = await profileService.updateProfile(user.id, updateData);
      setUser(updatedUser);
      setSuccessMessage('프로필이 성공적으로 업데이트되었습니다.');
      setIsEditing(false);

      // 성공 메시지 자동 제거
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '프로필 업데이트에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 비밀번호 변경 처리
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    // 유효성 검증
    if (!passwordForm.currentPassword) {
      setPasswordError('현재 비밀번호를 입력해주세요.');
      return;
    }

    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      setPasswordError('새 비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setPasswordError('현재 비밀번호와 새 비밀번호가 동일합니다.');
      return;
    }

    setIsChangingPassword(true);

    try {
      await profileService.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );

      setPasswordSuccess('비밀번호가 성공적으로 변경되었습니다.');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      // 성공 메시지 자동 제거
      setTimeout(() => setPasswordSuccess(null), 3000);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : '비밀번호 변경에 실패했습니다.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // 로그아웃 처리
  const handleSignOut = async () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      await signOut();
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // 역할 한글 변환
  const getRoleText = (role: string) => {
    return role === 'president' ? '회장' : '회원';
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">로그인이 필요합니다.</p>
          <button
            onClick={() => navigate('/auth/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            로그인하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">프로필 관리</h1>

      {/* 프로필 정보 카드 */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">프로필 정보</h2>
          {!isEditing && (
            <button
              onClick={handleEditToggle}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              편집
            </button>
          )}
        </div>

        {/* 성공/에러 메시지 */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 text-sm">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {isEditing ? (
          // 편집 모드
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 이름 (수정 가능) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* 이메일 (수정 불가) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이메일
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>

              {/* 기수 (수정 불가) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  기수
                </label>
                <input
                  type="text"
                  value={`${user.generation}기`}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>

              {/* 직업 (수정 가능) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  직업 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={profileForm.occupation}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, occupation: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* 전화번호 (수정 가능) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  전화번호 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, phone: e.target.value })
                  }
                  placeholder="010-1234-5678"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* 메신저 ID (수정 가능) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  메신저 ID
                </label>
                <input
                  type="text"
                  value={profileForm.messenger_id}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, messenger_id: e.target.value })
                  }
                  placeholder="선택사항"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 역할 (수정 불가) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  역할
                </label>
                <input
                  type="text"
                  value={getRoleText(user.role)}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>

              {/* 가입일 (수정 불가) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  가입일
                </label>
                <input
                  type="text"
                  value={formatDate(user.created_at)}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? '저장 중...' : '저장'}
              </button>
              <button
                type="button"
                onClick={handleEditToggle}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              >
                취소
              </button>
            </div>
          </form>
        ) : (
          // 보기 모드
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">이름</p>
              <p className="mt-1 text-gray-900">{user.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">이메일</p>
              <p className="mt-1 text-gray-900">{user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">기수</p>
              <p className="mt-1 text-gray-900">{user.generation}기</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">직업</p>
              <p className="mt-1 text-gray-900">{user.occupation}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">전화번호</p>
              <p className="mt-1 text-gray-900">{user.phone}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">메신저 ID</p>
              <p className="mt-1 text-gray-900">{user.messenger_id || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">역할</p>
              <p className="mt-1 text-gray-900">{getRoleText(user.role)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">가입일</p>
              <p className="mt-1 text-gray-900">{formatDate(user.created_at)}</p>
            </div>
          </div>
        )}
      </div>

      {/* 비밀번호 변경 카드 */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">비밀번호 변경</h2>

        {/* 비밀번호 성공/에러 메시지 */}
        {passwordSuccess && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 text-sm">{passwordSuccess}</p>
          </div>
        )}

        {passwordError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">{passwordError}</p>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              현재 비밀번호 <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              새 비밀번호 <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, newPassword: e.target.value })
              }
              placeholder="최소 6자 이상"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              새 비밀번호 확인 <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
              }
              placeholder="새 비밀번호 재입력"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isChangingPassword}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isChangingPassword ? '변경 중...' : '비밀번호 변경'}
          </button>
        </form>
      </div>

      {/* 로그아웃 버튼 */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <button
          onClick={handleSignOut}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}
