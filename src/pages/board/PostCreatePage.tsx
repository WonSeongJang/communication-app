import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePostStore } from '@/store/postStore';
import { useAuthStore } from '@/store/authStore';

export function PostCreatePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { createPost, isLoading, error } = usePostStore();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    title?: string;
    content?: string;
  }>({});

  const validateForm = () => {
    const errors: { title?: string; content?: string } = {};

    if (!title.trim()) {
      errors.title = '제목을 입력해주세요.';
    } else if (title.trim().length < 2) {
      errors.title = '제목은 최소 2자 이상이어야 합니다.';
    } else if (title.trim().length > 100) {
      errors.title = '제목은 100자를 초과할 수 없습니다.';
    }

    if (!content.trim()) {
      errors.content = '내용을 입력해주세요.';
    } else if (content.trim().length < 10) {
      errors.content = '내용은 최소 10자 이상이어야 합니다.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !user) {
      return;
    }

    setIsSubmitting(true);
    try {
      await createPost(
        {
          title: title.trim(),
          content: content.trim(),
        },
        user.id
      );
      navigate('/posts');
    } catch (error) {
      console.error('게시글 작성 실패:', error);
      // Error is handled by the store
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/posts"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          목록으로 돌아가기
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">게시글 작성</h1>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-8">
        {/* Title input */}
        <div className="mb-6">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (validationErrors.title) {
                setValidationErrors({ ...validationErrors, title: undefined });
              }
            }}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
              validationErrors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="제목을 입력하세요"
            maxLength={100}
          />
          {validationErrors.title && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {title.length}/100
          </p>
        </div>

        {/* Content textarea */}
        <div className="mb-6">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            내용 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (validationErrors.content) {
                setValidationErrors({ ...validationErrors, content: undefined });
              }
            }}
            rows={12}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none ${
              validationErrors.content ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="내용을 입력하세요"
          />
          {validationErrors.content && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.content}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <Link
            to="/posts"
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '작성 중...' : '작성하기'}
          </button>
        </div>
      </form>
    </div>
  );
}