import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { paymentService } from '../../services/api/payment';
import Skeleton from '../../components/ui/Skeleton/Skeleton';

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
      
      setRefundReason('');
      setShowRefundConfirm(false);
      setIsModalOpen(false);
      
      fetchPayments();
    } catch (error) {
      console.error('Refund error:', error);
      toast.error(error.response?.data?.message || 'Failed to process refund');
    } finally {
      setIsRefunding(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      'COMPLETED': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      'PARTIAL': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      'FAILED': 'bg-red-500/10 text-red-500 border-red-500/20',
      'REFUNDED': 'bg-zinc-800 text-zinc-400 border-zinc-700',
      'PENDING': 'bg-zinc-900 text-zinc-300 border-zinc-800',
    };
    const style = map[status] || 'bg-zinc-900 text-zinc-500 border-zinc-800';
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border ${style}`}>
        {status}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8 sm:mb-12">
        <div>
          <span className="inline-flex px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-xs font-bold uppercase tracking-widest mb-4">Financial Records</span>
          <h1 className="text-3xl sm:text-5xl font-bold text-zinc-50 tracking-tight">Revenue Ledger</h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest mt-2 text-xs">Audit transactions and manage payment reversals</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 px-6 h-[44px] bg-zinc-100 hover:bg-white text-zinc-900 rounded-xl font-bold transition-all active:scale-95 shadow-sm group w-full md:w-auto"
        >
          <span className="group-hover:translate-y-0.5 transition-transform">📥</span>
          Export Audit Log
        </button>
      </div>

      {/* Filter Matrix */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl mb-8 p-6 sm:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Identifier Scan</label>
            <input
              type="text"
              placeholder="TX ID, Name, Email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm font-bold text-zinc-100 focus:border-amber-500 outline-none placeholder:text-zinc-600 transition-colors"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Settlement Status</label>
            <select
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm font-bold text-zinc-100 focus:border-amber-500 outline-none transition-colors uppercase h-[46px]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="PARTIAL">Partial Payment</option>
              <option value="FAILED">Failed Attempt</option>
              <option value="REFUNDED">Reversed / Refunded</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Timeframe Start</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm font-bold text-zinc-100 focus:border-amber-500 outline-none transition-colors h-[46px]"
              style={{ colorScheme: 'dark' }}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Timeframe End</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm font-bold text-zinc-100 focus:border-amber-500 outline-none transition-colors h-[46px]"
              style={{ colorScheme: 'dark' }}
            />
          </div>
        </div>
      </div>

      {/* Transaction Database */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
        <div className="bg-zinc-950 p-6 flex justify-between items-center border-b border-zinc-800">
          <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-widest">Transaction Matrix</h3>
          <div className="flex gap-2 items-center">
            <span className="text-[10px] uppercase text-zinc-500 font-bold">Total Operations:</span>
            <span className="px-3 py-1 bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full text-[10px] font-bold uppercase tracking-widest">
              {pagination.total}
            </span>
          </div>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/50 border-b border-zinc-800/50 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                <th className="p-4 pl-6 font-medium">Timestamp</th>
                <th className="p-4 font-medium">Client Data</th>
                <th className="p-4 font-medium">Operational ID</th>
                <th className="p-4 text-right font-medium">Financial Value</th>
                <th className="p-4 text-center font-medium">Protocol Status</th>
                <th className="p-4 pr-6 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-4 space-y-2">
                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-14 bg-zinc-800 rounded-xl animate-pulse"></div>)}
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-24 text-center border-t border-zinc-800 border-dashed">
                    <p className="text-sm font-bold text-zinc-600 uppercase tracking-widest">No transaction records found</p>
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="p-4 pl-6">
                      <p className="font-bold text-zinc-100 text-sm">{new Date(payment.date).toLocaleDateString()}</p>
                      <p className="text-[10px] font-bold text-zinc-500">{new Date(payment.date).toLocaleTimeString()}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-zinc-100 uppercase text-sm">{payment.customer?.name || 'Anonymous'}</p>
                      <p className="text-[10px] font-bold text-zinc-500">{payment.customer?.email}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-mono text-[10px] font-bold text-zinc-500 break-all max-w-[150px]">
                        {payment.transactionId}
                      </p>
                    </td>
                    <td className="p-4 text-right">
                      <p className="font-bold text-zinc-100 text-sm">{formatCurrency(payment.amount.total)}</p>
                      {payment.amount.advance > 0 && (
                        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-1">Deposit: {formatCurrency(payment.amount.advance)}</p>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button
                        onClick={() => {
                          setSelectedPayment(payment);
                          setIsModalOpen(true);
                        }}
                        className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center hover:bg-amber-500 hover:text-zinc-950 transition-colors ml-auto"
                        title="View Invoice"
                      >🔍</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Protocol */}
      {!loading && pagination.pages > 1 && (
        <div className="mt-8 flex items-center justify-between bg-zinc-950 border border-zinc-800 p-4 rounded-xl text-zinc-100">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Sector {pagination.page} / {pagination.pages}
          </p>
          <div className="flex gap-2">
            <button 
              className="px-4 py-2 border border-zinc-700 text-zinc-300 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={pagination.page === 1}
              onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
            >
              Previous Block
            </button>
            <button 
              className="px-4 py-2 bg-zinc-100 text-zinc-900 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={pagination.page === pagination.pages}
              onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
            >
              Next Block
            </button>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {isModalOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center sticky top-0 bg-zinc-950/90 backdrop-blur-md z-10">
              <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-widest">{showRefundConfirm ? 'Protocol Reversal' : 'Financial Statement'}</h3>
              <button onClick={() => { setIsModalOpen(false); setShowRefundConfirm(false); }} className="text-zinc-500 hover:text-zinc-300">✕</button>
            </div>
            
            <div className="p-6 space-y-8 flex-1">
              {showRefundConfirm ? (
                <div className="space-y-6">
                  <div className="bg-red-500/10 p-6 rounded-2xl border border-red-500/20 flex gap-4">
                    <span className="text-3xl">⚠️</span>
                    <div>
                      <p className="text-red-500 font-bold uppercase text-sm tracking-tight">Financial Reversal Warning</p>
                      <p className="text-red-500/70 text-xs font-bold mt-1">This operation will authorize Chapa to return funds to the client. This action cannot be revoked once executed.</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Justification for Refund</label>
                    <textarea
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:border-red-500 transition-colors outline-none font-bold text-zinc-100 text-sm min-h-[120px] placeholder:text-zinc-600"
                      placeholder="Input required reason for reversal..."
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      disabled={isRefunding}
                    ></textarea>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Digital Receipt View */}
                  <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                    <div className="relative z-10 flex justify-between items-start">
                      <div>
                        <span className="inline-flex px-2 py-0.5 bg-zinc-800 text-zinc-400 border border-zinc-700 rounded text-[10px] font-bold uppercase tracking-widest mb-4">Official Receipt</span>
                        <h4 className="text-4xl font-bold text-zinc-50 uppercase tracking-tight leading-none">{formatCurrency(selectedPayment.amount.total)}</h4>
                        <p className="text-zinc-500 font-bold uppercase text-[10px] mt-2 tracking-widest font-mono">{selectedPayment.transactionId}</p>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        {getStatusBadge(selectedPayment.status)}
                        <p className="text-zinc-100 font-bold text-xs mt-4">{new Date(selectedPayment.date).toLocaleDateString()}</p>
                        <p className="text-zinc-500 text-[10px] font-bold uppercase">{new Date(selectedPayment.date).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </div>

                  {selectedPayment.refund && (
                    <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20">
                      <p className="text-amber-500 font-bold uppercase text-[10px] tracking-widest mb-1">Refund Internal Note</p>
                      <p className="text-amber-500/80 font-bold text-sm italic">"{selectedPayment.refund.reason}"</p>
                      <p className="text-[10px] font-bold text-amber-500/50 mt-2">EXECUTED ON {new Date(selectedPayment.refund.processedAt).toLocaleString().toUpperCase()}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                    <div className="space-y-4">
                      <h5 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Client Intelligence</h5>
                      <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                        <p className="font-bold text-zinc-100 uppercase text-sm mb-1">{selectedPayment.customer?.name}</p>
                        <p className="text-xs font-bold text-zinc-400">{selectedPayment.customer?.email}</p>
                        <p className="text-xs font-bold text-zinc-400 mt-2">UID: {selectedPayment.customer?.phone || 'PARTICIPANT_EXTERNAL'}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h5 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Service Breakdown</h5>
                      <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 space-y-3">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-zinc-500 uppercase tracking-widest">Line Item:</span>
                          <span className="text-zinc-100 uppercase">{selectedPayment.service?.name}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-zinc-500 uppercase tracking-widest">Deposit Paid:</span>
                          <span className="text-amber-500">{formatCurrency(selectedPayment.amount.advance)}</span>
                        </div>
                        <div className="h-px bg-zinc-800 w-full" />
                        <div className="flex justify-between items-center text-sm font-bold">
                          <span className="text-zinc-300 uppercase tracking-widest">Total Due:</span>
                          <span className="text-zinc-50">{formatCurrency(selectedPayment.amount.total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-950 sticky bottom-0 z-10">
              {showRefundConfirm ? (
                <>
                  <button 
                    className="px-6 py-3 bg-transparent border border-zinc-700 text-zinc-300 rounded-xl font-bold hover:bg-zinc-800 transition-colors disabled:opacity-50"
                    onClick={() => setShowRefundConfirm(false)} 
                    disabled={isRefunding}
                  >Abort</button>
                  <button 
                    className="px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    onClick={handleRefundSubmit}
                    disabled={!refundReason.trim() || isRefunding}
                  >
                    {isRefunding ? 'Processing...' : 'Confirm Reversal'}
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className="px-6 py-3 bg-transparent border border-zinc-700 text-zinc-300 rounded-xl font-bold hover:bg-zinc-800 transition-colors"
                    onClick={() => setIsModalOpen(false)}
                  >Close Statement</button>
                  {(selectedPayment?.status === 'PARTIAL' || selectedPayment?.status === 'COMPLETED') && (
                    <button 
                      className="px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-colors"
                      onClick={() => setShowRefundConfirm(true)}
                    >Authorize Refund</button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
