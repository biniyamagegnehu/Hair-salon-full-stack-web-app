import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { 
  fetchCustomers, 
  fetchCustomerDetails,
  updateCustomerStatus 
} from '../../store/slices/adminSlice';

const AdminCustomers = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  // Get admin state with safe defaults
  const adminState = useSelector((state) => state.admin || {});
  const customersData = adminState.customers || { list: [], pagination: { page: 1, limit: 20, total: 0, pages: 1 } };
  const isLoading = adminState.isLoading || false;
  const error = adminState.error || null;
  
  console.log('AdminCustomers - Redux State:', { customersData, isLoading, error });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    console.log('Loading customers with params:', { page, searchTerm, filterStatus });
    loadCustomers();
  }, [page, searchTerm, filterStatus]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const loadCustomers = () => {
    dispatch(fetchCustomers({ 
      page, 
      limit: 20, 
      search: searchTerm,
      status: filterStatus !== 'all' ? filterStatus : undefined
    }));
  };

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
      toast.error(error || t('common.error'));
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

  console.log('Rendering with customersList:', customersList.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{t('admin.customers')}</h1>
          <p className="text-gray-500 mt-1">{t('admin.manageCustomers', 'Manage and view all customers')}</p>
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{t('common.all', 'All Customers')}</option>
            <option value="active">{t('common.active', 'Active')}</option>
            <option value="inactive">{t('common.inactive', 'Inactive')}</option>
          </select>
          <button
            onClick={() => window.location.href = '/admin/customers/new'}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            {t('admin.addCustomer', 'Add Customer')}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('common.searchCustomers', 'Search by name, email, or phone...')}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            {t('common.search', 'Search')}
          </button>
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setPage(1);
              }}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              {t('common.clear', 'Clear')}
            </button>
          )}
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={loadCustomers}
            className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
          >
            {t('common.retry', 'Retry')}
          </button>
        </div>
      )}

      {/* Customers Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-medium text-gray-400">Loading...</span>
              </div>
            </div>
          </div>
        ) : customersList.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-1">{t('admin.noCustomers', 'No customers found')}</h3>
            <p className="text-sm text-gray-400">{t('admin.tryAdjustingSearch', 'Try adjusting your search')}</p>
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setPage(1);
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                {t('common.clearSearch', 'Clear Search')}
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.customer', 'Customer')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('auth.phone', 'Phone')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.email', 'Email')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('profile.memberSince', 'Member Since')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.totalAppointments', 'Appointments')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.totalSpent', 'Total Spent')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.status', 'Status')}
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.actions', 'Actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customersList.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-white text-sm font-medium">
                            {customer.fullName?.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{customer.fullName || 'Unknown'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{customer.phoneNumber || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{customer.email || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{formatDate(customer.createdAt)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-800">{customer.stats?.totalAppointments || 0}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-green-600">{formatCurrency(customer.stats?.totalSpent)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        customer.isActive !== false 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {customer.isActive !== false ? t('common.active') : t('common.inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(customer)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={t('common.view', 'View')}
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleStatusToggle(customer._id, customer.isActive)}
                          className={`p-2 rounded-lg transition-colors ${
                            customer.isActive !== false
                              ? 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                              : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                          }`}
                          title={customer.isActive !== false ? t('common.deactivate') : t('common.activate')}
                        >
                          {customer.isActive !== false ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && customersList.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {t('common.showing', 'Showing')} {((pagination.page - 1) * pagination.limit) + 1} -{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                {t('common.previous', 'Previous')}
              </button>
              <span className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm">
                {page}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                {t('common.next', 'Next')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Customer Details Modal - Keep existing modal code */}
      {showDetailsModal && selectedCustomer && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          {/* Modal content - same as before */}
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">{t('admin.customerDetails', 'Customer Details')}</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="md:col-span-1">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                    <div className="w-20 h-20 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-4xl font-bold text-white">
                        {selectedCustomer.fullName?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <h4 className="text-xl font-bold text-center mb-1">{selectedCustomer.fullName}</h4>
                    <p className="text-center text-white/80 text-sm mb-4">{selectedCustomer.role}</p>
                    <div className="border-t border-white/20 pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/80">{t('common.status')}:</span>
                        <span className="font-medium">
                          {selectedCustomer.isActive !== false ? t('common.active') : t('common.inactive')}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/80">{t('profile.memberSince')}:</span>
                        <span className="font-medium">{formatDate(selectedCustomer.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details Card */}
                <div className="md:col-span-2 space-y-4">
                  {/* Contact Info */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-3">{t('common.contactInfo', 'Contact Information')}</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="text-gray-600">{selectedCustomer.email || 'No email provided'}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="text-gray-600">{selectedCustomer.phoneNumber}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 mb-1">{t('admin.totalAppointments')}</p>
                      <p className="text-2xl font-bold text-gray-800">{selectedCustomer.stats?.totalAppointments || 0}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 mb-1">{t('admin.totalSpent')}</p>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedCustomer.stats?.totalSpent)}</p>
                    </div>
                  </div>

                  {/* Recent Appointments */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-3">{t('admin.recentAppointments', 'Recent Appointments')}</h4>
                    {selectedCustomer.recentAppointments?.length > 0 ? (
                      <div className="space-y-2">
                        {selectedCustomer.recentAppointments.slice(0, 3).map((apt) => (
                          <div key={apt._id} className="flex items-center justify-between p-2 bg-white rounded-lg">
                            <div>
                              <p className="text-sm font-medium text-gray-800">{apt.service?.name?.en || 'Service'}</p>
                              <p className="text-xs text-gray-500">{formatDate(apt.scheduledDate)} at {apt.scheduledTime}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              apt.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                              apt.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {apt.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 text-center py-4">{t('admin.noRecentAppointments', 'No recent appointments')}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
                <button
                  onClick={() => handleStatusToggle(selectedCustomer._id, selectedCustomer.isActive)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    selectedCustomer.isActive !== false
                      ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {selectedCustomer.isActive !== false ? t('common.deactivate') : t('common.activate')}
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  {t('common.close', 'Close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;