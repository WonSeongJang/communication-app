import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNoticeStore } from '@/store/noticeStore';
import { useAuthStore } from '@/store/authStore';
import { pushSubscriptionService } from '@/services/pushSubscriptionService';

export function NoticeCreatePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { createNotice, isLoading } = useNoticeStore();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isPinned: false,
    sendPushNotification: true, // 기본값: 알림 전송
  });

  const [errors, setErrors] = useState({
    title: '',
    content: '',
  });

  // Redirect if not president
  if (user?.role !== 'president') {
    navigate('/notices');
    return null;
  }

  const validateForm = (): boolean => {
    const newErrors = {
      title: '',
      content: '',
    };

    const trimmedTitle = formData.title.trim();
    const trimmedContent = formData.content.trim();

    if (!trimmedTitle) {
      newErrors.title = '제목을 입력해주세요.';
    } else if (trimmedTitle.length > 100) {
      newErrors.title = '제목은 100자 이내로 입력해주세요.';
    }

    if (!trimmedContent) {
      newErrors.content = '내용을 입력해주세요.';
    } else if (trimmedContent.length > 5000) {
      newErrors.content = '내용은 5000자 이내로 입력해주세요.';
    }

    setErrors(newErrors);
    return !newErrors.title && !newErrors.content;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !user) {
      return;
    }

    try {
      await createNotice(
        {
          title: formData.title.trim(),
          content: formData.content.trim(),
          isPinned: formData.isPinned,
        },
        user.id
      );

      // Send push notification if checkbox is checked
      if (formData.sendPushNotification) {
        try {
          const result = await pushSubscriptionService.sendNotificationToAll({
            title: '새 공지사항',
            body: formData.title.trim(),
            url: '/notices',
          });
          console.log('Push notification sent:', result);
        } catch (pushError) {
          console.error('Failed to send push notification:', pushError);
          // Don't block navigation if push fails
        }
      }

      // Navigate to the notices list
      navigate('/notices');
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleCancel = () => {
    if (
      formData.title.trim() ||
      formData.content.trim() ||
      window.confirm('작성 중인 내용이 있습니다. 정말 취소하시겠습니까?')
    ) {
      navigate('/notices');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">새 공지 작성</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-8">
        {/* Title Field */}
        <div className="mb-6">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="공지사항 제목을 입력하세요"
            maxLength={100}
            disabled={isLoading}
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          <p className="mt-1 text-sm text-gray-500">
            {formData.title.length} / 100자
          </p>
        </div>

        {/* Content Field */}
        <div className="mb-6">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            내용 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[300px] ${
              errors.content ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="공지사항 내용을 입력하세요"
            maxLength={5000}
            disabled={isLoading}
          />
          {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
          <p className="mt-1 text-sm text-gray-500">
            {formData.content.length} / 5000자
          </p>
        </div>

        {/* Pin Checkbox */}
        <div className="mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isPinned}
              onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={isLoading}
            />
            <span className="text-sm text-gray-700">
              📌 상단 고정 (목록 최상단에 표시됩니다)
            </span>
          </label>
        </div>

        {/* Push Notification Checkbox */}
        <div className="mb-8">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.sendPushNotification}
              onChange={(e) => setFormData({ ...formData, sendPushNotification: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={isLoading}
            />
            <span className="text-sm text-gray-700">
              🔔 전체 알림 보내기 (알림을 허용한 회원에게 푸시 알림을 전송합니다)
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            취소
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  );
}
