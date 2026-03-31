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
import Card, { CardHeader, CardBody } from '../../components/ui/Card/Card';
import Badge from '../../components/ui/Badge/Badge';
import Button from '../../components/ui/Button/Button';
import Input from '../../components/ui/Input/Input';
import Modal, { ModalHeader, ModalContent, ModalFooter } from '../../components/ui/Modal/Modal';
import Skeleton from '../../components/ui/Skeleton/Skeleton';
import './AdminPages.css';

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
    <div className="admin-page animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8 sm:mb-12">
        <div>
          <Badge variant="gold" className="mb-4">Client Relations</Badge>
          <h1 className="text-3xl sm:text-5xl font-black text-black uppercase tracking-tight">Customer Database</h1>
          <p className="text-secondary-brown font-bold opacity-40 mt-1 text-sm sm:text-base">Comprehensive management of your elite clientele and history</p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full md:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
            className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-black text-white border-none rounded-xl text-xs sm:text-sm font-black uppercase tracking-widest cursor-pointer hover:bg-zinc-800 transition-colors"
          >
            <option value="all">All Clients</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive</option>
          </select>
          <Button
            variant="gold"
            onClick={() => window.location.href = '/admin/customers/new'}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2"
          >
            <span className="text-xl">+</span> Add Client
          </Button>
        </div>
      </div>

      {/* Search Matrix */}
      <Card variant="default" className="mb-8">
        <CardBody className="p-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name, email, or telephone network identifier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                noMargin
              />
            </div>
            <Button type="submit" variant="black" className="px-8">Execute Search</Button>
            {searchTerm && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setPage(1);
                }}
              >
                Reset
              </Button>
            )}
          </form>
        </CardBody>
      </Card>

      {/* Database View */}
      <Card className="overflow-visible">
        <CardHeader className="bg-black p-6 rounded-t-xl flex justify-between items-center text-white">
          <h3 className="text-sm font-black uppercase tracking-widest">Customer Ledger</h3>
          <Badge variant="gold">{pagination.total} Registered</Badge>
        </CardHeader>
        <CardBody className="p-0">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} height="70px" variant="rectangle" />)}
            </div>
          ) : customersList.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-xl font-black text-secondary-brown opacity-20 uppercase tracking-widest">No matching records</p>
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Customer Identity</th>
                    <th>Contact Details</th>
                    <th>Engagement</th>
                    <th>Value Assets</th>
                    <th>Access Status</th>
                    <th className="text-right">Operations</th>
                  </tr>
                </thead>
                <tbody>
                  {customersList.map((customer) => (
                    <tr key={customer._id}>
                      <td>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-black text-gold flex items-center justify-center rounded-xl font-black text-xl shadow-card">
                            {customer.fullName?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-black text-black uppercase text-sm">{customer.fullName || 'Anonymous'}</p>
                            <p className="text-[10px] font-bold text-secondary-brown opacity-40">ID: {customer._id.slice(-8).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <p className="font-bold text-black text-sm">{customer.phoneNumber}</p>
                        <p className="text-[10px] font-medium text-secondary-brown">{customer.email || 'NO_MAIL_SYNC'}</p>
                      </td>
                      <td>
                        <p className="text-xs font-bold text-black">{formatDate(customer.createdAt)}</p>
                        <p className="text-[10px] font-black text-secondary-brown opacity-40 uppercase">Registration Date</p>
                      </td>
                      <td>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase opacity-40">Sessions:</span>
                            <span className="text-sm font-black text-black">{customer.stats?.totalAppointments || 0}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase opacity-40">Revenue:</span>
                            <span className="text-sm font-black text-green-600">{formatCurrency(customer.stats?.totalSpent)}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge variant={customer.isActive !== false ? 'success' : 'brown'} size="sm">
                          {customer.isActive !== false ? 'AUTHENTICATED' : 'RESTRICTED'}
                        </Badge>
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            className="admin-btn-icon" 
                            title="Profile View"
                            onClick={() => handleViewDetails(customer)}
                          >👤</button>
                          <button 
                            className={`admin-btn-icon ${customer.isActive !== false ? 'text-error hover:bg-error/10' : 'text-green-600 hover:bg-green-50'}`}
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
            </div>
          )}
        </CardBody>
      </Card>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="mt-8 flex items-center justify-between bg-black p-4 rounded-xl text-white">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
            Node {page} of {pagination.pages}
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-white/20 text-white hover:bg-white/10"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button 
              variant="gold" 
              size="sm" 
              disabled={page === pagination.pages}
              onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* CRM Profile Modal */}
      <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)}>
        <ModalHeader>Client Intelligence</ModalHeader>
        <ModalContent>
          {selectedCustomer && (
            <div className="space-y-8 py-4">
              <div className="flex items-center gap-6 bg-black p-8 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:bg-gold/20" />
                <div className="w-24 h-24 bg-gold text-black flex items-center justify-center rounded-2xl font-black text-4xl shadow-xl border-4 border-zinc-900">
                  {selectedCustomer.fullName?.charAt(0).toUpperCase()}
                </div>
                <div className="relative z-10">
                  <h4 className="text-3xl font-black text-white uppercase tracking-tight mb-2">{selectedCustomer.fullName}</h4>
                  <div className="flex gap-2">
                    <Badge variant="gold">Level: Platinum</Badge>
                    <Badge variant={selectedCustomer.isActive !== false ? 'success' : 'error'}>
                      {selectedCustomer.isActive !== false ? 'ACTIVE_ACCOUNT' : 'SUSPENDED'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-secondary-brown opacity-50">Communication nodes</h5>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 bg-cream/30 p-4 rounded-xl border border-border-primary">
                      <span className="text-xl">📞</span>
                      <div>
                        <p className="text-[10px] font-black uppercase opacity-40">Secure Line</p>
                        <p className="font-bold text-black">{selectedCustomer.phoneNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-cream/30 p-4 rounded-xl border border-border-primary">
                      <span className="text-xl">✉️</span>
                      <div>
                        <p className="text-[10px] font-black uppercase opacity-40">Digital Relay</p>
                        <p className="font-bold text-black">{selectedCustomer.email || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-secondary-brown opacity-50">Performance metrics</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black text-white p-4 rounded-xl border border-white/10">
                      <p className="text-[10px] font-black uppercase opacity-40 mb-1">Lifetime Value</p>
                      <p className="text-xl font-black text-gold">{formatCurrency(selectedCustomer.stats?.totalSpent)}</p>
                    </div>
                    <div className="bg-black text-white p-4 rounded-xl border border-white/10">
                      <p className="text-[10px] font-black uppercase opacity-40 mb-1">Session Count</p>
                      <p className="text-xl font-black text-gold">{selectedCustomer.stats?.totalAppointments || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-secondary-brown opacity-50">Operational history (Recent)</h5>
                {selectedCustomer.recentAppointments?.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCustomer.recentAppointments.slice(0, 3).map((apt) => (
                      <div key={apt._id} className="flex items-center justify-between p-4 bg-background-cream rounded-xl border border-border-primary hover:border-accent-gold transition-colors">
                        <div>
                          <p className="font-black text-black uppercase text-sm">{apt.service?.name?.en}</p>
                          <p className="text-[10px] font-bold text-secondary-brown">{formatDate(apt.scheduledDate)} at {apt.scheduledTime}</p>
                        </div>
                        <Badge variant={apt.status === 'COMPLETED' ? 'success' : 'brown'} size="xs">{apt.status}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-background-cream rounded-xl border border-dashed border-border-primary">
                    <p className="text-[10px] font-black uppercase opacity-40">No historical data available</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </ModalContent>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowDetailsModal(false)}>Close Portal</Button>
          <Button 
            variant={selectedCustomer?.isActive !== false ? 'error' : 'success'}
            onClick={() => handleStatusToggle(selectedCustomer._id, selectedCustomer.isActive)}
          >
            {selectedCustomer?.isActive !== false ? 'Restrain Account' : 'Re-Authorize Client'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default AdminCustomers;