import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePostStore } from '@/store/postStore';
import { usePagination } from '@/hooks/usePagination';
import { Pagination } from '@/components/common/Pagination';

export function PostsListPage() {
  const { posts, isLoading, error, fetchPosts, searchPosts } = usePostStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const { currentPage, totalPages, currentItems, handlePageChange, resetPage } = usePagination({
    items: posts,
    itemsPerPage: 10,
  });

  // Fetch posts on initial mount only
  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search - only depends on searchQuery
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchPosts(searchQuery);
      } else {
        fetchPosts();
      }
      resetPage(); // Reset to first page when search changes
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

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
        <h1 className="text-3xl font-bold text-gray-900">자유게시판</h1>
        <Link
          to="/posts/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          글 작성
        </Link>
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
            '{searchQuery}' 검색 결과: {posts.length}개
          </p>
        )}
      </div>

      {/* Posts Table */}
      {posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">
            {searchQuery ? '검색 결과가 없습니다.' : '아직 게시글이 없습니다.'}
          </p>
          {!searchQuery && (
            <Link
              to="/posts/new"
              className="inline-block mt-4 text-blue-600 hover:text-blue-700"
            >
              첫 게시글을 작성해보세요 →
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    번호
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    제목
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    작성자
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                    작성일
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map((post, index) => (
                  <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center">
                      {posts.length - ((currentPage - 1) * 10 + index)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/posts/${post.id}`}
                        className="text-gray-900 hover:text-blue-600 font-medium block truncate max-w-md"
                        title={post.title}
                      >
                        {post.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {post.author?.name} ({post.author?.generation}기)
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(post.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {currentItems.map((post, index) => (
              <Link
                key={post.id}
                to={`/posts/${post.id}`}
                className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3 mb-2">
                  <span className="text-xs text-gray-500 font-medium pt-1 flex-shrink-0">
                    #{posts.length - ((currentPage - 1) * 10 + index)}
                  </span>
                  <h2 className="text-base font-semibold text-gray-900 flex-1 truncate" title={post.title}>
                    {post.title}
                  </h2>
                </div>
                <div className="flex items-center text-xs text-gray-500 ml-8">
                  <span>{post.author?.name} ({post.author?.generation}기)</span>
                  <span className="mx-2">•</span>
                  <span>{formatDate(post.created_at)}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}