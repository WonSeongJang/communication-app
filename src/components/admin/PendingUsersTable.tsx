import { useEffect } from 'react';
import { useApprovalStore } from '@/store/approvalStore';

/**
 * PendingUsersTable Component
 *
 * Admin interface for approving/rejecting pending member registrations.
 *
 * Features:
 * - Display all pending users in a table
 * - Individual approve/reject actions
 * - Bulk approve/reject selected users
 * - Select all/clear selection
 * - Loading states and error handling
 * - Confirmation dialogs
 *
 * Usage:
 * ```tsx
 * <PendingUsersTable />
 * ```
 */
export const PendingUsersTable = () => {
  const {
    pendingUsers,
    selectedUserIds,
    isLoading,
    error,
    fetchPendingUsers,
    approveUser,
    rejectUser,
    bulkApprove,
    bulkReject,
    toggleUserSelection,
    selectAll,
    clearSelection,
    clearError,
  } = useApprovalStore();

  // Fetch pending users on mount
  useEffect(() => {
    fetchPendingUsers();
  }, [fetchPendingUsers]);

  // Calculate selection state
  const allSelected = pendingUsers.length > 0 && selectedUserIds.size === pendingUsers.length;
  const someSelected = selectedUserIds.size > 0 && selectedUserIds.size < pendingUsers.length;

  // Format date to Korean locale
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Handle individual approve
  const handleApprove = async (userId: string, userName: string) => {
    if (window.confirm(`${userName} 회원을 승인하시겠습니까?`)) {
      await approveUser(userId);
    }
  };

  // Handle individual reject
  const handleReject = async (userId: string, userName: string) => {
    if (window.confirm(`${userName} 회원의 가입을 거부하시겠습니까?`)) {
      await rejectUser(userId);
    }
  };

  // Handle bulk approve
  const handleBulkApprove = async () => {
    const count = selectedUserIds.size;
    if (window.confirm(`선택한 ${count}명의 회원을 승인하시겠습니까?`)) {
      await bulkApprove();
    }
  };

  // Handle bulk reject
  const handleBulkReject = async () => {
    const count = selectedUserIds.size;
    if (window.confirm(`선택한 ${count}명의 가입을 거부하시겠습니까?`)) {
      await bulkReject();
    }
  };

  // Handle select all toggle
  const handleSelectAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      selectAll();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">가입 승인 대기 목록</h2>
        {isLoading && (
          <div className="flex items-center space-x-2 text-gray-600">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm">로딩 중...</span>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex justify-between items-start">
          <div className="flex items-start space-x-3">
            <svg className="h-5 w-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-800">{error}</p>
          </div>
          <button
            onClick={clearError}
            className="text-red-600 hover:text-red-800 transition-colors"
            aria-label="에러 메시지 닫기"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedUserIds.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between items-center">
          <span className="text-sm font-medium text-blue-900">
            {selectedUserIds.size}명 선택됨
          </span>
          <div className="flex space-x-2">
            <button
              onClick={handleBulkApprove}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              선택한 회원 승인
            </button>
            <button
              onClick={handleBulkReject}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              선택한 회원 거부
            </button>
            <button
              onClick={clearSelection}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              선택 해제
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {pendingUsers.length === 0 ? (
          // Empty State
          <div className="py-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-4 text-lg font-medium text-gray-900">대기 중인 가입 신청이 없습니다</p>
            <p className="mt-2 text-sm text-gray-500">모든 가입 신청이 처리되었습니다.</p>
          </div>
        ) : (
          // Table with data
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(input) => {
                        if (input) {
                          input.indeterminate = someSelected;
                        }
                      }}
                      onChange={handleSelectAll}
                      disabled={isLoading}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="모두 선택"
                    />
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    이름
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    기수
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    직업
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    전화번호
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    이메일
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    가입일
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingUsers.map((user) => (
                  <tr
                    key={user.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      selectedUserIds.has(user.id) ? 'bg-blue-50' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUserIds.has(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        disabled={isLoading}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={`${user.name} 선택`}
                      />
                    </td>

                    {/* Name with profile image */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        {user.profile_image ? (
                          <img
                            src={user.profile_image}
                            alt={user.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-sm font-medium">
                              {user.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-900">{user.name}</span>
                      </div>
                    </td>

                    {/* Generation */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{user.generation}기</span>
                    </td>

                    {/* Occupation */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{user.occupation}</span>
                    </td>

                    {/* Phone */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{user.phone}</span>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">{user.email}</span>
                    </td>

                    {/* Created At */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">{formatDate(user.created_at)}</span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(user.id, user.name)}
                          disabled={isLoading}
                          className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          승인
                        </button>
                        <button
                          onClick={() => handleReject(user.id, user.name)}
                          disabled={isLoading}
                          className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          거부
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer info */}
      {pendingUsers.length > 0 && (
        <div className="text-sm text-gray-500 text-right">
          총 {pendingUsers.length}명의 가입 대기자가 있습니다.
        </div>
      )}
    </div>
  );
};

export default PendingUsersTable;
