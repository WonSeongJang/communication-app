import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateProfile, isLoading } = useAuthStore();

  const [formData, setFormData] = useState({
    name: '',
    generation: 1,
    occupation: '',
    phone: '',
    messenger_id: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    generation: '',
    occupation: '',
    phone: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Initialize form with user data
    setFormData({
      name: user.name || '',
      generation: user.generation || 1,
      occupation: user.occupation || '',
      phone: user.phone || '',
      messenger_id: user.messenger_id || '',
    });
  }, [user, navigate]);

  const validateForm = (): boolean => {
    const newErrors = {
      name: '',
      generation: '',
      occupation: '',
      phone: '',
    };

    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = '이름은 최소 2자 이상이어야 합니다.';
    }

    if (formData.generation < 1 || formData.generation > 100) {
      newErrors.generation = '기수는 1~100 사이여야 합니다.';
    }

    if (!formData.occupation.trim()) {
      newErrors.occupation = '직업을 입력해주세요.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = '전화번호를 입력해주세요.';
    } else if (!/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/.test(formData.phone.trim())) {
      newErrors.phone = '올바른 전화번호 형식이 아닙니다.';
    }

    setErrors(newErrors);
    return !newErrors.name && !newErrors.generation && !newErrors.occupation && !newErrors.phone;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !user) {
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      await updateProfile(user.id, {
        name: formData.name.trim(),
        generation: formData.generation,
        occupation: formData.occupation.trim(),
        phone: formData.phone.trim(),
        messenger_id: formData.messenger_id.trim() || null,
      });

      setSuccessMessage('프로필이 성공적으로 업데이트되었습니다.');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">프로필 설정</h1>
        <p className="mt-2 text-sm text-gray-600">
          회원 정보를 수정할 수 있습니다.
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-600">{successMessage}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-8">
        {/* Email (Read-only) */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이메일
          </label>
          <input
            type="email"
            value={user.email}
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-gray-500">
            이메일은 변경할 수 없습니다.
          </p>
        </div>

        {/* Name */}
        <div className="mb-6">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            이름 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (errors.name) {
                setErrors({ ...errors, name: '' });
              }
            }}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="홍길동"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Generation */}
        <div className="mb-6">
          <label htmlFor="generation" className="block text-sm font-medium text-gray-700 mb-2">
            기수 <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="generation"
            value={formData.generation}
            onChange={(e) => {
              setFormData({ ...formData, generation: parseInt(e.target.value, 10) || 1 });
              if (errors.generation) {
                setErrors({ ...errors, generation: '' });
              }
            }}
            onWheel={(e) => e.currentTarget.blur()}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
              errors.generation ? 'border-red-500' : 'border-gray-300'
            }`}
            min="1"
            max="100"
          />
          {errors.generation && (
            <p className="mt-1 text-sm text-red-600">{errors.generation}</p>
          )}
        </div>

        {/* Occupation */}
        <div className="mb-6">
          <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 mb-2">
            직업 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="occupation"
            value={formData.occupation}
            onChange={(e) => {
              setFormData({ ...formData, occupation: e.target.value });
              if (errors.occupation) {
                setErrors({ ...errors, occupation: '' });
              }
            }}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
              errors.occupation ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="개발자"
          />
          {errors.occupation && (
            <p className="mt-1 text-sm text-red-600">{errors.occupation}</p>
          )}
        </div>

        {/* Phone */}
        <div className="mb-6">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            전화번호 <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => {
              setFormData({ ...formData, phone: e.target.value });
              if (errors.phone) {
                setErrors({ ...errors, phone: '' });
              }
            }}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="010-1234-5678"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        {/* Messenger ID */}
        <div className="mb-6">
          <label htmlFor="messenger_id" className="block text-sm font-medium text-gray-700 mb-2">
            카카오톡 ID (선택)
          </label>
          <input
            type="text"
            id="messenger_id"
            value={formData.messenger_id}
            onChange={(e) => setFormData({ ...formData, messenger_id: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            placeholder="kakao_id"
          />
          <p className="mt-1 text-xs text-gray-500">
            카카오톡 ID를 입력하면 다른 회원들이 연락하기 쉽습니다.
          </p>
        </div>

        {/* Role (Read-only) */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            권한
          </label>
          <input
            type="text"
            value={user.role === 'president' ? '회장' : '회원'}
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <Link
            to="/profile/change-password"
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            비밀번호 변경
          </Link>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="px-6 py-2 bg-blue-600 !text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
