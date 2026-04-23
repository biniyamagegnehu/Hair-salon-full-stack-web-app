/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { 
  fetchCustomers, 
  fetchCustomerDetails,
  updateCustomerStatus 
} from '../../store/slices/adminSlice';
import Skeleton from '../../components/ui/Skeleton/Skeleton';

const AdminCustomers = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  const adminState = useSelector((state) => state.admin || {});
  const customersData = adminState.customers || { list: [], pagination: { page: 1, limit: 20, total: 0, pages: 1 } };
  const isLoading = adminState.isLoading || false;
  const error = adminState.error || null;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('all');

  const loadCustomers = () => {
    dispatch(fetchCustomers({ 
      page, 
      limit: 20, 
      search: searchTerm,
      status: filterStatus !== 'all' ? filterStatus : undefined
    }));
  };

  useEffect(() => {
    loadCustomers();
  }, [page, searchTerm, filterStatus, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadCustomers();
  };

  const handleViewDetails = async (customer) => {
    setSelectedCustomer(customer);
    try {
      const result = await dispatch(fetchCustomerDetails(customer._id));
      if (result.payload) {
        setSelectedCustomer(result.payload.customer || result.payload);
        setShowDetailsModal(true);
      }
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  const handleStatusToggle = async (customerId, currentStatus) => {
    try {
      await dispatch(updateCustomerStatus({ 
        customerId, 
        isActive: !currentStatus 
      })).unwrap();
      toast.success(t('common.success'));
      loadCustomers();
    } catch (error) {
      toast.error(error?.message || t('common.error'));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const customersList = customersData?.list || [];
  const pagination = customersData?.pagination || { page: 1, limit: 20, total: 0, pages: 1 };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8 sm:mb-12">
        <div>
          <span className="inline-flex px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-xs font-bold uppercase tracking-widest mb-4">Client Relations</span>
          <h1 className="text-3xl sm:text-5xl font-bold text-zinc-50 tracking-tight">Customer Database</h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest mt-2 text-xs">Comprehensive management of your elite clientele and history</p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full md:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
            className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-zinc-950 text-zinc-100 border border-zinc-800 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-widest cursor-pointer hover:border-amber-500/50 outline-none transition-colors"
          >
            <option value="all">All Clients</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive</option>
          </select>
          <button
            onClick={() => window.location.href = '/admin/customers/new'}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 h-[44px] bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl font-bold transition-all active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
          >
            <span className="text-xl">+</span> Add Client
          </button>
        </div>
      </div>

      {/* Search Matrix */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl mb-8 p-6 sm:p-8">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, email, or telephone network identifier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm font-bold text-zinc-100 focus:border-amber-500 outline-none placeholder:text-zinc-600 transition-colors"
            />
          </div>
          <button type="submit" className="px-8 h-[46px] bg-zinc-100 text-zinc-900 rounded-xl font-bold hover:bg-white transition-colors active:scale-95">
            Execute Search
          </button>
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setPage(1);
              }}
              className="px-6 h-[46px] bg-transparent border border-zinc-700 text-zinc-300 rounded-xl font-bold hover:bg-zinc-800 transition-colors active:scale-95"
            >
              Reset
            </button>
          )}
        </form>
      </div>

      {/* Database View */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
        <div className="bg-zinc-950 p-6 flex justify-between items-center border-b border-zinc-800">
          <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-widest">Customer Ledger</h3>
          <span className="px-3 py-1 bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full text-[10px] font-bold uppercase tracking-widest">
            {pagination.total} Registered
          </span>
        </div>
        <div className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-zinc-800 rounded-xl animate-pulse"></div>)}
            </div>
          ) : customersList.length === 0 ? (
            <div className="py-24 text-center border-t border-zinc-800 border-dashed">
              <p className="text-sm font-bold text-zinc-600 uppercase tracking-widest">No matching records</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950/50 border-b border-zinc-800/50 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                  <th className="p-4 pl-6 font-medium">Customer Identity</th>
                  <th className="p-4 font-medium">Contact Details</th>
                  <th className="p-4 font-medium">Engagement</th>
                  <th className="p-4 font-medium">Value Assets</th>
                  <th className="p-4 font-medium">Access Status</th>
                  <th className="p-4 pr-6 text-right font-medium">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {customersList.map((customer) => (
                  <tr key={customer._id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 text-amber-500 flex items-center justify-center rounded-xl font-bold text-xl">
                          {customer.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-zinc-100 uppercase text-sm">{customer.fullName || 'Anonymous'}</p>
                          <p className="text-[10px] font-bold text-zinc-600">ID: {customer._id.slice(-8).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-zinc-100 text-sm">{customer.phoneNumber}</p>
                      <p className="text-[10px] font-bold text-zinc-500">{customer.email || 'NO_MAIL_SYNC'}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-bold text-zinc-100">{formatDate(customer.createdAt)}</p>
                      <p className="text-[10px] font-bold text-zinc-600 uppercase">Registration Date</p>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase text-zinc-500">Sessions:</span>
                          <span className="text-sm font-bold text-zinc-100">{customer.stats?.totalAppointments || 0}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase text-zinc-500">Revenue:</span>
                          <span className="text-sm font-bold text-emerald-500">{formatCurrency(customer.stats?.totalSpent)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border ${
                        customer.isActive !== false ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}>
                        {customer.isActive !== false ? 'AUTHENTICATED' : 'RESTRICTED'}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center hover:bg-amber-500 hover:text-zinc-950 transition-colors"
                          title="Profile View"
                          onClick={() => handleViewDetails(customer)}
                        >👤</button>
                        <button 
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${customer.isActive !== false ? 'bg-zinc-800 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-zinc-800 text-emerald-500 hover:bg-emerald-500 hover:text-white'}`}
                          title={customer.isActive !== false ? 'Block' : 'Authorize'}
                          onClick={() => handleStatusToggle(customer._id, customer.isActive)}
                        >
                          {customer.isActive !== false ? '🚫' : '✅'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="mt-8 flex items-center justify-between bg-zinc-950 border border-zinc-800 p-4 rounded-xl text-zinc-100">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Node {page} of {pagination.pages}
          </p>
          <div className="flex gap-2">
            <button 
              className="px-4 py-2 border border-zinc-700 text-zinc-300 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <button 
              className="px-4 py-2 bg-zinc-100 text-zinc-900 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={page === pagination.pages}
              onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* CRM Profile Modal */}
      {showDetailsModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center sticky top-0 bg-zinc-950/90 backdrop-blur-md z-10">
              <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-widest">Client Intelligence</h3>
              <button onClick={() => setShowDetailsModal(false)} className="text-zinc-500 hover:text-zinc-300">✕</button>
            </div>
            
            <div className="p-6 space-y-8 flex-1">
              <div className="flex items-center gap-6 bg-zinc-900 p-8 rounded-2xl relative overflow-hidden group border border-zinc-800">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:bg-amber-500/20" />
                <div className="w-24 h-24 bg-amber-500 text-zinc-950 flex items-center justify-center rounded-2xl font-bold text-4xl shadow-[0_0_20px_rgba(245,158,11,0.2)] border-4 border-zinc-900">
                  {selectedCustomer.fullName?.charAt(0).toUpperCase()}
                </div>
                <div className="relative z-10">
                  <h4 className="text-3xl font-bold text-zinc-50 uppercase tracking-tight mb-2">{selectedCustomer.fullName}</h4>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded text-[10px] font-bold uppercase tracking-widest">Level: Platinum</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${selectedCustomer.isActive !== false ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                      {selectedCustomer.isActive !== false ? 'ACTIVE_ACCOUNT' : 'SUSPENDED'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h5 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Communication nodes</h5>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                      <span className="text-xl">📞</span>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-zinc-500">Secure Line</p>
                        <p className="font-bold text-zinc-100">{selectedCustomer.phoneNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                      <span className="text-xl">✉️</span>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-zinc-500">Digital Relay</p>
                        <p className="font-bold text-zinc-100">{selectedCustomer.email || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Performance metrics</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                      <p className="text-[10px] font-bold uppercase text-zinc-500 mb-1">Lifetime Value</p>
                      <p className="text-xl font-bold text-emerald-500">{formatCurrency(selectedCustomer.stats?.totalSpent)}</p>
                    </div>
                    <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                      <p className="text-[10px] font-bold uppercase text-zinc-500 mb-1">Session Count</p>
                      <p className="text-xl font-bold text-amber-500">{selectedCustomer.stats?.totalAppointments || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Operational history (Recent)</h5>
                {selectedCustomer.recentAppointments?.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCustomer.recentAppointments.slice(0, 3).map((apt) => (
                      <div key={apt._id} className="flex items-center justify-between p-4 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-amber-500/50 transition-colors">
                        <div>
                          <p className="font-bold text-zinc-100 uppercase text-sm">{apt.service?.name?.en}</p>
                          <p className="text-[10px] font-bold text-zinc-400">{formatDate(apt.scheduledDate)} at {apt.scheduledTime}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border ${apt.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                          {apt.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-zinc-900 rounded-xl border border-dashed border-zinc-800">
                    <p className="text-[10px] font-bold uppercase text-zinc-600">No historical data available</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-950 sticky bottom-0 z-10">
              <button 
                className="px-6 py-3 bg-transparent border border-zinc-700 text-zinc-300 rounded-xl font-bold hover:bg-zinc-800 transition-colors"
                onClick={() => setShowDetailsModal(false)}
              >Close Portal</button>
              <button 
                className={`px-6 py-3 rounded-xl font-bold transition-colors ${selectedCustomer?.isActive !== false ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-zinc-950'}`}
                onClick={() => {
                  handleStatusToggle(selectedCustomer._id, selectedCustomer.isActive);
                  setShowDetailsModal(false);
                }}
              >
                {selectedCustomer?.isActive !== false ? 'Restrain Account' : 'Re-Authorize Client'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
