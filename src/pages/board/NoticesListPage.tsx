import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNoticeStore } from '@/store/noticeStore';
import { useAuthStore } from '@/store/authStore';

export function NoticesListPage() {
  const { user } = useAuthStore();
  const { notices, isLoading, error, fetchNotices, searchNotices } = useNoticeStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchNotices(searchQuery);
      } else {
        fetchNotices();
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchNotices, fetchNotices]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getAuthorName = () => {
    // In a real app, we'd fetch this from the users table
    // For now, we'll use a placeholder
    return '관리자';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">공지사항</h1>
        {user?.role === 'president' && (
          <Link
            to="/notices/new"
            className="bg-blue-600 !text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            새 공지 작성
          </Link>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="제목이나 내용으로 검색..."
            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="mt-2 text-sm text-gray-600">
            '{searchQuery}' 검색 결과: {notices.length}개
          </p>
        )}
      </div>

      {/* Notices List */}
      {notices.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">아직 공지사항이 없습니다.</p>
          {user?.role === 'president' && (
            <Link
              to="/notices/new"
              className="inline-block mt-4 text-blue-600 hover:text-blue-700"
            >
              첫 공지사항을 작성해보세요 →
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => (
            <Link
              key={notice.id}
              to={`/notices/${notice.id}`}
              className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {notice.is_pinned && (
                      <span className="text-primary-600" aria-label="고정된 공지">
                        📌
                      </span>
                    )}
                    <h2 className="text-xl font-semibold text-gray-900">
                      {notice.title}
                    </h2>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{getAuthorName()}</span>
                    <span>•</span>
                    <span>{formatDate(notice.created_at)}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <span aria-label="조회수">👁️</span>
                      {notice.viewed_by.length}명 읽음
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
