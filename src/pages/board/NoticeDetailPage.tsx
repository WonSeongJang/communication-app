import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useNoticeStore } from '@/store/noticeStore';
import { useAuthStore } from '@/store/authStore';

export function NoticeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    selectedNotice: notice,
    isLoading,
    error,
    fetchNoticeById,
    deleteNotice,
    togglePin,
    clearSelectedNotice,
  } = useNoticeStore();

  useEffect(() => {
    if (id && user) {
      fetchNoticeById(id, user.id);
    }

    return () => {
      clearSelectedNotice();
    };
  }, [id, user, fetchNoticeById, clearSelectedNotice]);

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

  const handleDelete = async () => {
    if (!notice || !window.confirm('정말 이 공지사항을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteNotice(notice.id);
      navigate('/notices', { replace: true });
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleTogglePin = async () => {
    if (!notice) return;

    try {
      await togglePin(notice.id, !notice.is_pinned);
    } catch (error) {
      // Error is handled by the store
    }
  };

  const isAuthor = user && notice && user.id === notice.author_id;
  const canEdit = user?.role === 'president' && isAuthor;
  const canManage = user?.role === 'president';

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !notice) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error || '공지사항을 찾을 수 없습니다.'}
        </div>
        <Link
          to="/notices"
          className="text-primary-600 hover:text-primary-700"
        >
          ← 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header with Actions */}
      <div className="flex justify-between items-start mb-8">
        <Link
          to="/notices"
          className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          ← 목록으로
        </Link>

        {canManage && (
          <div className="flex items-center gap-2">
            {canEdit && (
              <>
                <Link
                  to={`/notices/${notice.id}/edit`}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  수정
                </Link>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                >
                  삭제
                </button>
              </>
            )}
            <button
              onClick={handleTogglePin}
              className={`px-4 py-2 text-sm border rounded-lg transition-colors ${
                notice.is_pinned
                  ? 'bg-primary-50 border-primary-300 text-primary-700 hover:bg-primary-100'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {notice.is_pinned ? '📌 고정 해제' : '📌 상단 고정'}
            </button>
          </div>
        )}
      </div>

      {/* Notice Content */}
      <article className="bg-white border border-gray-200 rounded-lg p-8">
        {/* Title */}
        <div className="mb-6">
          {notice.is_pinned && (
            <span className="inline-block text-primary-600 mb-2" aria-label="고정된 공지">
              📌 고정됨
            </span>
          )}
          <h1 className="text-3xl font-bold text-gray-900">{notice.title}</h1>
        </div>

        {/* Meta Information */}
        <div className="flex items-center gap-4 text-sm text-gray-600 pb-6 border-b border-gray-200 mb-6">
          <span>관리자</span>
          <span>•</span>
          <span>{formatDate(notice.created_at)}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <span aria-label="조회수">👁️</span>
            {notice.viewed_by.length}명이 읽음
          </span>
        </div>

        {/* Content */}
        <div className="prose max-w-none">
          <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
            {notice.content}
          </div>
        </div>

        {/* Attachments (if any) */}
        {notice.attachments && notice.attachments.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">첨부파일</h3>
            <ul className="space-y-2">
              {notice.attachments.map((attachment, index) => (
                <li key={index}>
                  <a
                    href={attachment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 text-sm"
                  >
                    📎 {attachment.split('/').pop() || `첨부파일 ${index + 1}`}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </article>
    </div>
  );
}
