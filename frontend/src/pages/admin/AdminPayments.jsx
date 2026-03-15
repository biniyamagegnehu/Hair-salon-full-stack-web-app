import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { paymentService } from '../../services/api/payment';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Modal
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Refund state
  const [isRefunding, setIsRefunding] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [showRefundConfirm, setShowRefundConfirm] = useState(false);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      
      if (search) queryParams.append('search', search);
      if (statusFilter !== 'ALL') queryParams.append('status', statusFilter);
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const res = await axios.get(`${API_URL}/admin/payments?${queryParams.toString()}`, {
        withCredentials: true
      });
      
      setPayments(res.data.data.transactions);
      setPagination(res.data.data.pagination);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search slightly for better UX
    const timer = setTimeout(() => {
      fetchPayments();
    }, 300);
    return () => clearTimeout(timer);
  }, [pagination.page, pagination.limit, search, statusFilter, startDate, endDate]);

  const handleExportCSV = () => {
    if (payments.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = ['Date', 'Transaction ID', 'Customer', 'Email', 'Service', 'Total (ETB)', 'Advance (ETB)', 'Status'];
    const csvContent = [
      headers.join(','),
      ...payments.map(p => {
        return [
          new Date(p.date).toLocaleString(),
          p.transactionId,
          `"${p.customer?.name || 'N/A'}"`,
          p.customer?.email || 'N/A',
          `"${p.service?.name || 'N/A'}"`,
          p.amount.total,
          p.amount.advance,
          p.status
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `payment-history-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRefundSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!refundReason.trim()) {
      toast.error('Refund reason is required');
      return;
    }

    try {
      setIsRefunding(true);
      await paymentService.refundPayment(selectedPayment.id, refundReason);
      
      toast.success('Refund processed successfully');
      
      // Reset and close
      setRefundReason('');
      setShowRefundConfirm(false);
      setIsModalOpen(false);
      
      // Refresh
      fetchPayments();
    } catch (error) {
      console.error('Refund error:', error);
      toast.error(error.response?.data?.message || 'Failed to process refund');
    } finally {
      setIsRefunding(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    const map = {
      'COMPLETED': 'bg-green-100 text-green-800 border-green-200',
      'PARTIAL': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'FAILED': 'bg-red-100 text-red-800 border-red-200',
      'REFUNDED': 'bg-gray-100 text-gray-800 border-gray-200',
      'PENDING': 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payment History</h1>
          <p className="text-gray-600 outline-none text-sm mt-1">Track and manage salon transactions</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center shadow-sm text-sm font-medium"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Search</label>
            <input
              type="text"
              placeholder="Name, email, or TX ID..."
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Status</label>
            <select
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="PARTIAL">Partial (Advance Paid)</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Start Date</label>
            <input
              type="date"
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">End Date</label>
            <input
              type="date"
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase font-semibold text-gray-700">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    Loading payments...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No transactions found matching your criteria.
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(payment.date).toLocaleDateString()}<br/>
                      <span className="text-xs text-gray-400">{new Date(payment.date).toLocaleTimeString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{payment.customer?.name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{payment.customer?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-gray-500">
                      {payment.transactionId}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-semibold text-gray-900">{payment.amount.total} ETB</div>
                      {payment.amount.advance > 0 && (
                        <div className="text-xs text-gray-500">Adv: {payment.amount.advance} ETB</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeClass(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedPayment(payment);
                          setIsModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm transition"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && pagination.pages > 1 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Showing page {pagination.page} of {pagination.pages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {isModalOpen && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-[scale-up_0.2s_ease-out]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">{showRefundConfirm ? 'Confirm Refund' : 'Transaction Details'}</h3>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setShowRefundConfirm(false);
                  setRefundReason('');
                }} 
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              {showRefundConfirm ? (
                <div className="space-y-4">
                  <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                    <p className="text-red-800 text-sm font-medium">Are you sure you want to refund this payment?</p>
                    <p className="text-red-600 text-xs mt-1">This action will reverse the transaction via Chapa and cannot be undone.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Reason for Refund</label>
                    <textarea
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      rows="3"
                      placeholder="e.g., Appointment cancelled by customer..."
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      disabled={isRefunding}
                    ></textarea>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        setShowRefundConfirm(false);
                        setRefundReason('');
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                      disabled={isRefunding}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRefundSubmit}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition flex items-center justify-center gap-2"
                      disabled={isRefunding || !refundReason.trim()}
                    >
                      {isRefunding ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Refunding...
                        </>
                      ) : 'Confirm Refund'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-y-4 text-sm">
                    <div>
                      <p className="text-gray-500 font-medium uppercase text-xs mb-1">Status</p>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-md border inline-block mt-1 ${getStatusBadgeClass(selectedPayment.status)}`}>
                        {selectedPayment.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium uppercase text-xs mb-1">Date</p>
                      <p className="font-semibold text-gray-800">{new Date(selectedPayment.date).toLocaleString()}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-500 font-medium uppercase text-xs mb-1">Chapa Transaction Ref</p>
                      <p className="font-mono bg-gray-100 text-gray-800 p-2 rounded border border-gray-200 text-xs break-all">
                        {selectedPayment.transactionId}
                      </p>
                    </div>
                    {selectedPayment.refund && (
                      <div className="col-span-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <p className="text-blue-800 font-bold text-xs uppercase mb-1">Refund Information</p>
                        <p className="text-blue-700 text-sm"><span className="font-semibold">Reason:</span> {selectedPayment.refund.reason}</p>
                        <p className="text-blue-600 text-xs mt-1">Processed on {new Date(selectedPayment.refund.processedAt).toLocaleString()}</p>
                      </div>
                    )}
                    <div className="col-span-2 border-t border-gray-100 pt-4 mt-2">
                      <p className="text-gray-500 font-medium uppercase text-xs mb-2">Customer Profile</p>
                      <p className="font-semibold text-gray-800">{selectedPayment.customer?.name}</p>
                      <p className="text-gray-600">{selectedPayment.customer?.email}</p>
                      <p className="text-gray-600">{selectedPayment.customer?.phone}</p>
                    </div>
                    <div className="col-span-2 border-t border-gray-100 pt-4 mt-2">
                      <p className="text-gray-500 font-medium uppercase text-xs mb-2">Financial Breakdown</p>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                          <span className="text-gray-600">Service:</span>
                          <span className="font-medium">{selectedPayment.service?.name}</span>
                        </div>
                        <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                          <span className="text-gray-600">Advance Paid:</span>
                          <span className="font-medium text-blue-600">{selectedPayment.amount.advance} ETB</span>
                        </div>
                        <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                          <span className="text-gray-600">Total Price:</span>
                          <span className="font-bold text-gray-900">{selectedPayment.amount.total} ETB</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    {(selectedPayment.status === 'PARTIAL' || selectedPayment.status === 'COMPLETED') && (
                      <button
                        onClick={() => setShowRefundConfirm(true)}
                        className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 font-medium transition text-sm"
                      >
                        Refund Payment
                      </button>
                    )}
                    <button 
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 font-medium transition text-sm"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
