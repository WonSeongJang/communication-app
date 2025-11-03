import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDonationStore } from '@/store/donationStore';
import { useAuthStore } from '@/store/authStore';

export function DonationsPage() {
  const { user } = useAuthStore();
  const { summary, totalAmount, isLoading, error, fetchDonationsSummary } =
    useDonationStore();

  useEffect(() => {
    fetchDonationsSummary();
  }, [fetchDonationsSummary]);

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('ko-KR') + '원';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              후원 내역
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              동문회 발전을 위해 후원해주신 분들입니다.
            </p>
          </div>
          {user?.role === 'president' && (
            <Link
              to="/donations/manage"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              관리
            </Link>
          )}
        </div>
      </div>

      {/* Total Amount Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 mb-8">
        <div className="text-center">
          <p className="text-blue-100 text-sm font-medium mb-2">
            누적 총액
          </p>
          <p className="text-white text-3xl sm:text-4xl font-bold">
            {formatAmount(totalAmount)}
          </p>
        </div>
      </div>

      {/* Donations Summary Table */}
      {summary.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">아직 후원 내역이 없습니다.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    후원자
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    총 후원 금액
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {summary.map((item) => (
                  <tr key={item.donor_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {item.donor_generation}기
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {item.donor_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.donor_generation}기
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-lg font-semibold text-blue-600">
                        {formatAmount(item.total_amount)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="sm:hidden divide-y divide-gray-200">
            {summary.map((item) => (
              <div key={item.donor_id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 text-xs font-semibold">
                        {item.donor_generation}기
                      </span>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {item.donor_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.donor_generation}기
                      </div>
                    </div>
                  </div>
                  <div className="text-base font-semibold text-blue-600">
                    {formatAmount(item.total_amount)}
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
