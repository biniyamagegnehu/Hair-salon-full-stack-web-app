import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { paymentService } from '../../services/api/payment';
import Card, { CardHeader, CardBody } from '../../components/ui/Card/Card';
import Badge from '../../components/ui/Badge/Badge';
import Button from '../../components/ui/Button/Button';
import Input from '../../components/ui/Input/Input';
import Modal, { ModalHeader, ModalContent, ModalFooter } from '../../components/ui/Modal/Modal';
import Skeleton from '../../components/ui/Skeleton/Skeleton';
import './AdminPages.css';

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

  const getStatusVariant = (status) => {
    const map = {
      'COMPLETED': 'success',
      'PARTIAL': 'gold',
      'FAILED': 'error',
      'REFUNDED': 'brown',
      'PENDING': 'dark',
    };
    return map[status] || 'dark';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  return (
    <div className="admin-page animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8 sm:mb-12">
        <div>
          <Badge variant="gold" className="mb-4">Financial Records</Badge>
          <h1 className="text-3xl sm:text-5xl font-black text-black uppercase tracking-tight">Revenue Ledger</h1>
          <p className="text-secondary-brown font-bold opacity-40 mt-1 text-sm sm:text-base">Audit transactions and manage payment reversals</p>
        </div>
        <Button
          variant="black"
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 group w-full md:w-auto"
        >
          <span className="group-hover:translate-y-0.5 transition-transform">📥</span>
          Export Audit Log
        </Button>
      </div>

      {/* Filter Matrix */}
      <Card variant="default" className="mb-8">
        <CardBody className="p-4 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brown mb-2 block">Identifier Scan</label>
              <Input
                placeholder="TX ID, Name, Email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                noMargin
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brown mb-2 block">Settlement Status</label>
              <select
                className="w-full px-4 py-2 bg-cream/30 border border-border-primary rounded-xl focus:border-accent-gold transition-colors outline-none font-bold text-black uppercase text-xs h-[45px]"
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
              <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brown mb-2 block">Timeframe Start</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                noMargin
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brown mb-2 block">Timeframe End</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                noMargin
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Transaction Database */}
      <Card className="overflow-visible">
        <CardHeader className="bg-black p-6 rounded-t-xl flex justify-between items-center text-white">
          <h3 className="text-sm font-black uppercase tracking-widest">Transaction Matrix</h3>
          <div className="flex gap-2 items-center">
            <span className="text-[10px] uppercase opacity-40 font-bold">Total Operations:</span>
            <Badge variant="gold">{pagination.total}</Badge>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Timestamp</th>
                  <th scope="col">Client Data</th>
                  <th scope="col">Operational ID</th>
                  <th scope="col" className="text-right">Financial Value</th>
                  <th scope="col" className="text-center">Protocol Status</th>
                  <th scope="col" className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-0">
                      <div className="space-y-1 p-1">
                        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} height="70px" variant="rectangle" />)}
                      </div>
                    </td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-24 text-center">
                      <p className="text-xl font-black text-secondary-brown opacity-20 uppercase tracking-widest">No transaction records found</p>
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment.id}>
                      <td>
                        <p className="font-bold text-black text-sm">{new Date(payment.date).toLocaleDateString()}</p>
                        <p className="text-[10px] font-black text-secondary-brown opacity-40">{new Date(payment.date).toLocaleTimeString()}</p>
                      </td>
                      <td>
                        <p className="font-black text-black uppercase text-sm">{payment.customer?.name || 'Anonymous'}</p>
                        <p className="text-[10px] font-bold text-secondary-brown">{payment.customer?.email}</p>
                      </td>
                      <td>
                        <p className="font-mono text-[10px] font-black text-secondary-brown opacity-60 break-all max-w-[150px]">
                          {payment.transactionId}
                        </p>
                      </td>
                      <td className="text-right">
                        <p className="font-black text-black text-sm">{formatCurrency(payment.amount.total)}</p>
                        {payment.amount.advance > 0 && (
                          <p className="text-[10px] font-bold text-gold uppercase tracking-tighter">Deposit: {formatCurrency(payment.amount.advance)}</p>
                        )}
                      </td>
                      <td className="text-center">
                        <Badge variant={getStatusVariant(payment.status)} size="sm">
                          {payment.status}
                        </Badge>
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => {
                            setSelectedPayment(payment);
                            setIsModalOpen(true);
                          }}
                          className="admin-btn-icon"
                          title="View Invoice"
                        >🔍</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Pagination Protocol */}
      {!loading && pagination.pages > 1 && (
        <div className="mt-8 flex items-center justify-between bg-black p-4 rounded-xl text-white">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
            Sector {pagination.page} / {pagination.pages}
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-white/20 text-white hover:bg-white/10"
              disabled={pagination.page === 1}
              onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
            >
              Previous Block
            </Button>
            <Button 
              variant="gold" 
              size="sm" 
              disabled={pagination.page === pagination.pages}
              onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
            >
              Next Block
            </Button>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setShowRefundConfirm(false); }}>
        <ModalHeader>{showRefundConfirm ? 'Protocol Reversal' : 'Financial Statement'}</ModalHeader>
        <ModalContent>
          {selectedPayment && (
            <div className="py-2">
              {showRefundConfirm ? (
                <div className="space-y-6">
                  <div className="bg-error/5 p-6 rounded-2xl border border-error/20 flex gap-4">
                    <span className="text-3xl">⚠️</span>
                    <div>
                      <p className="text-error font-black uppercase text-sm tracking-tight">Financial Reversal Warning</p>
                      <p className="text-secondary-brown text-xs font-bold mt-1">This operation will authorize Chapa to return funds to the client. This action cannot be revoked once executed.</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brown">Justification for Refund</label>
                    <textarea
                      className="w-full px-4 py-3 bg-cream/30 border border-border-primary rounded-xl focus:border-error transition-colors outline-none font-bold text-black text-sm min-h-[120px]"
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
                  <div className="bg-black p-8 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                    <div className="relative z-10 flex justify-between items-start">
                      <div>
                        <Badge variant="gold" className="mb-4">Official Receipt</Badge>
                        <h4 className="text-4xl font-black text-white uppercase tracking-tight leading-none">{formatCurrency(selectedPayment.amount.total)}</h4>
                        <p className="text-white/40 font-bold uppercase text-[10px] mt-2 tracking-widest font-mono">{selectedPayment.transactionId}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={getStatusVariant(selectedPayment.status)} size="lg">{selectedPayment.status}</Badge>
                        <p className="text-white font-bold text-xs mt-4">{new Date(selectedPayment.date).toLocaleDateString()}</p>
                        <p className="text-white/40 text-[10px] font-bold uppercase">{new Date(selectedPayment.date).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </div>

                  {selectedPayment.refund && (
                    <div className="bg-gold/10 p-4 rounded-xl border border-gold/20">
                      <p className="text-gold font-black uppercase text-[10px] tracking-widest mb-1">Refund Internal Note</p>
                      <p className="text-black font-bold text-sm italic">"{selectedPayment.refund.reason}"</p>
                      <p className="text-[10px] font-black text-secondary-brown opacity-40 mt-2">EXECUTED ON {new Date(selectedPayment.refund.processedAt).toLocaleString().toUpperCase()}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                    <div className="space-y-4">
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-secondary-brown opacity-50">Client Intelligence</h5>
                      <div className="bg-background-cream p-4 rounded-xl border border-border-primary">
                        <p className="font-black text-black uppercase text-sm mb-1">{selectedPayment.customer?.name}</p>
                        <p className="text-xs font-bold text-secondary-brown">{selectedPayment.customer?.email}</p>
                        <p className="text-xs font-bold text-secondary-brown mt-2">UID: {selectedPayment.customer?.phone || 'PARTICIPANT_EXTERNAL'}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-secondary-brown opacity-50">Service Breakdown</h5>
                      <div className="bg-background-cream p-4 rounded-xl border border-border-primary space-y-3">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-secondary-brown uppercase tracking-tighter">Line Item:</span>
                          <span className="text-black uppercase">{selectedPayment.service?.name}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-secondary-brown uppercase tracking-tighter">Deposit Paid:</span>
                          <span className="text-gold">{formatCurrency(selectedPayment.amount.advance)}</span>
                        </div>
                        <div className="h-px bg-border-primary w-full" />
                        <div className="flex justify-between items-center text-sm font-black">
                          <span className="text-black uppercase tracking-tighter">Total Due:</span>
                          <span className="text-black">{formatCurrency(selectedPayment.amount.total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ModalContent>
        <ModalFooter>
          {showRefundConfirm ? (
            <>
              <Button variant="outline" onClick={() => setShowRefundConfirm(false)} disabled={isRefunding}>Abort</Button>
              <Button 
                variant="error" 
                onClick={handleRefundSubmit}
                isLoading={isRefunding}
                disabled={!refundReason.trim()}
              >
                Confirm Reversal
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Close Statement</Button>
              {(selectedPayment?.status === 'PARTIAL' || selectedPayment?.status === 'COMPLETED') && (
                <Button variant="error" onClick={() => setShowRefundConfirm(true)}>Authorize Refund</Button>
              )}
            </>
          )}
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default AdminPayments;

