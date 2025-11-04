import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDonationStore } from '@/store/donationStore';
import { useAuthStore } from '@/store/authStore';
import type { CreateDonationInput } from '@/types';

export function DonationManagePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    donations,
    totalAmount,
    activeMembers,
    isLoading,
    error,
    fetchAllDonations,
    fetchActiveMembers,
    createDonation,
    updateDonation,
    deleteDonation,
    clearError,
  } = useDonationStore();

  // Check if user is president
  useEffect(() => {
    if (user && user.role !== 'president') {
      navigate('/donations');
    }
  }, [user, navigate]);

  // Load data
  useEffect(() => {
    fetchAllDonations();
    fetchActiveMembers();
  }, [fetchAllDonations, fetchActiveMembers]);

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');

  // Add form state
  const [formData, setFormData] = useState<CreateDonationInput>({
    donor_id: '',
    amount: 0,
    donated_at: new Date().toISOString().split('T')[0],
  });

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('ko-KR') + '원';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).replace(/\. /g, '.').replace(/\.$/, '');
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.donor_id || formData.amount <= 0) {
      alert('후원자와 금액을 입력해주세요.');
      return;
    }

    try {
      await createDonation(formData);
      setShowAddForm(false);
      setFormData({
        donor_id: '',
        amount: 0,
        donated_at: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      // Error already handled in store
    }
  };

  const handleEdit = (id: string, currentAmount: number) => {
    setEditingId(id);
    setEditAmount(currentAmount.toString());
  };

  const handleEditSubmit = async (id: string) => {
    const amount = parseInt(editAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      alert('올바른 금액을 입력해주세요.');
      return;
    }

    try {
      await updateDonation(id, amount);
      setEditingId(null);
      setEditAmount('');
    } catch (error) {
      // Error already handled in store
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말로 이 후원 내역을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteDonation(id);
    } catch (error) {
      // Error already handled in store
    }
  };

  if (isLoading && donations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          후원 내역 관리
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          후원 내역을 등록하고 관리할 수 있습니다.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-600"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Total Amount Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 mb-8">
        <div className="text-center">
          <p className="text-blue-100 text-sm font-medium mb-2">누적 총액</p>
          <p className="text-white text-3xl sm:text-4xl font-bold">
            {formatAmount(totalAmount)}
          </p>
        </div>
      </div>

      {/* Add Donation Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          {showAddForm ? '취소' : '+ 새 후원 추가'}
        </button>
      </div>

      {/* Add Donation Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            새 후원 추가
          </h2>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                후원자 선택
              </label>
              <select
                value={formData.donor_id}
                onChange={(e) =>
                  setFormData({ ...formData, donor_id: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">후원자를 선택하세요</option>
                {activeMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.generation}기)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                금액 (원)
              </label>
              <input
                type="number"
                value={formData.amount || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    amount: parseInt(e.target.value, 10) || 0,
                  })
                }
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="10000"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                후원 날짜
              </label>
              <input
                type="date"
                value={formData.donated_at}
                onChange={(e) =>
                  setFormData({ ...formData, donated_at: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                {isLoading ? '등록 중...' : '등록'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Donations Table */}
      {donations.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">아직 후원 내역이 없습니다.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    후원자
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    금액
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    등록일
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {donations.map((donation) => (
                  <tr key={donation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 text-xs font-semibold">
                            {donation.donor?.generation || '?'}기
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {donation.donor?.name || '알 수 없음'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {donation.donor?.generation || '?'}기
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {editingId === donation.id ? (
                        <input
                          type="number"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          onWheel={(e) => e.currentTarget.blur()}
                          className="w-32 px-3 py-1 text-right border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          min="1"
                        />
                      ) : (
                        <div className="text-base font-semibold text-blue-600">
                          {formatAmount(donation.amount)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      {formatDate(donation.donated_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {editingId === donation.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditSubmit(donation.id)}
                            className="text-green-600 hover:text-green-800"
                            title="저장"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditAmount('');
                            }}
                            className="text-gray-600 hover:text-gray-800"
                            title="취소"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() =>
                              handleEdit(donation.id, donation.amount)
                            }
                            className="text-blue-600 hover:text-blue-800"
                            title="수정"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(donation.id)}
                            className="text-red-600 hover:text-red-800"
                            title="삭제"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden divide-y divide-gray-200">
            {donations.map((donation) => (
              <div key={donation.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 text-xs font-semibold">
                        {donation.donor?.generation || '?'}기
                      </span>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {donation.donor?.name || '알 수 없음'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {donation.donor?.generation || '?'}기
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(donation.donated_at)}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  {editingId === donation.id ? (
                    <input
                      type="number"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      onWheel={(e) => e.currentTarget.blur()}
                      className="flex-1 mr-3 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                  ) : (
                    <div className="text-lg font-semibold text-blue-600">
                      {formatAmount(donation.amount)}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {editingId === donation.id ? (
                      <>
                        <button
                          onClick={() => handleEditSubmit(donation.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditAmount('');
                          }}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() =>
                            handleEdit(donation.id, donation.amount)
                          }
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(donation.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
