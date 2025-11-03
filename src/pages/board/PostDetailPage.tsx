import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePostStore } from '@/store/postStore';
import { useAuthStore } from '@/store/authStore';

export function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { selectedPost, isLoading, error, fetchPostById, deletePost, clearError } = usePostStore();
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPostById(id);
    }
  }, [id, fetchPostById]);

  useEffect(() => {
    // Clear error when component unmounts
    return () => {
      clearError();
    };
  }, [clearError]);

  const handleDelete = async () => {
    if (!selectedPost || !user) return;

    if (!window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deletePost(selectedPost.id, user.id, user.role);
      navigate('/posts');
    } catch (error) {
      console.error('게시글 삭제 실패:', error);
      // Error is handled by the store
    } finally {
      setIsDeleting(false);
    }
  };

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

  // Check if user can edit/delete this post
  const canEdit = user && selectedPost && user.id === selectedPost.author_id;
  const canDelete = user && selectedPost && (user.id === selectedPost.author_id || user.role === 'president');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
        <Link
          to="/posts"
          className="text-blue-600 hover:text-blue-700"
        >
          ← 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  if (!selectedPost) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back button */}
      <Link
        to="/posts"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        목록으로 돌아가기
      </Link>

      {/* Post content */}
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        {/* Header */}
        <div className="border-b border-gray-200 pb-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {selectedPost.title}
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="font-medium text-gray-900">
                {selectedPost.author?.name} ({selectedPost.author?.generation}기)
              </span>
              <span>•</span>
              <span>{formatDate(selectedPost.created_at)}</span>
              {selectedPost.updated_at !== selectedPost.created_at && (
                <>
                  <span>•</span>
                  <span className="text-gray-500">
                    수정됨: {formatDate(selectedPost.updated_at)}
                  </span>
                </>
              )}
            </div>

            {/* Action buttons */}
            {(canEdit || canDelete) && (
              <div className="flex items-center gap-2">
                {canEdit && (
                  <Link
                    to={`/posts/${selectedPost.id}/edit`}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    수정
                  </Link>
                )}
                {canDelete && (
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? '삭제 중...' : '삭제'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-gray max-w-none">
          <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
            {selectedPost.content}
          </div>
        </div>
      </div>
    </div>
  );
}