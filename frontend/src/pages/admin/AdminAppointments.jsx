import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { 
  fetchAllAppointments, 
  updateAppointment,
  deleteAppointment,
  setAppointmentFilters,
  clearCurrentAppointment
} from '../../store/slices/adminSlice';

const AdminAppointments = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { appointments, isLoading, filters } = useSelector((state) => state.admin.appointments || {
    appointments: [],
    isLoading: false,
    filters: {}
  });
  const { services } = useSelector((state) => state.services || { services: [] });
  
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Status options
  const statusOptions = [
    { value: 'all', label: t('common.all', 'All'), color: 'gray' },
    { value: 'PENDING_PAYMENT', label: t('payment.pending', 'Pending Payment'), color: 'yellow' },
    { value: 'CONFIRMED', label: t('queue.confirmed', 'Confirmed'), color: 'green' },
    { value: 'CHECKED_IN', label: t('queue.checkedIn'), color: 'blue' },
    { value: 'IN_PROGRESS', label: t('queue.inProgress'), color: 'purple' },
    { value: 'COMPLETED', label: t('queue.completed'), color: 'gray' },
    { value: 'CANCELLED', label: t('common.cancelled', 'Cancelled'), color: 'red' },
    { value: 'NO_SHOW', label: t('queue.noShow', 'No Show'), color: 'orange' }
  ];

  useEffect(() => {
    loadAppointments();
  }, [dateRange, statusFilter, searchTerm]);

  const loadAppointments = () => {
    const filters = {
      startDate: dateRange.start,
      endDate: dateRange.end,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      search: searchTerm || undefined
    };
    dispatch(fetchAllAppointments(filters));
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const handleEdit = (appointment) => {
    setSelectedAppointment(appointment);
    setShowEditModal(true);
  };

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      await dispatch(updateAppointment({ 
        appointmentId, 
        data: { status: newStatus } 
      })).unwrap();
      toast.success(t('common.success'));
      loadAppointments();
    } catch (error) {
      toast.error(error || t('common.error'));
    }
  };

  const handleDelete = async (appointmentId) => {
    if (window.confirm(t('admin.confirmDelete', 'Are you sure you want to delete this appointment?'))) {
      try {
        await dispatch(deleteAppointment(appointmentId)).unwrap();
        toast.success(t('common.success'));
        loadAppointments();
      } catch (error) {
        toast.error(error || t('common.error'));
      }
    }
  };

  const getStatusBadge = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    const colors = {
      gray: 'bg-gray-100 text-gray-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      green: 'bg-green-100 text-green-800',
      blue: 'bg-blue-100 text-blue-800',
      purple: 'bg-purple-100 text-purple-800',
      red: 'bg-red-100 text-red-800',
      orange: 'bg-orange-100 text-orange-800'
    };
    return colors[option?.color || 'gray'];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
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

  // Safely get appointments array
  const appointmentsList = appointments?.list || [];
  const appointmentsPagination = appointments?.pagination || { page: 1, limit: 20, total: 0, pages: 1 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{t('admin.appointments')}</h1>
          <p className="text-gray-500 mt-1">{t('admin.manageAppointments', 'Manage and track all appointments')}</p>
        </div>
        <button
          onClick={() => window.location.href = '/admin/appointments/new'}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2 self-start"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          {t('admin.newAppointment', 'New Appointment')}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Date Range */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              {t('common.from', 'From')}
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              {t('common.to', 'To')}
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              {t('common.status', 'Status')}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              {t('common.search', 'Search')}
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('common.searchPlaceholder', 'Customer name or email...')}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Active Filters */}
        {(statusFilter !== 'all' || searchTerm) && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
            <span className="text-xs text-gray-500">{t('common.activeFilters', 'Active filters:')}</span>
            {statusFilter !== 'all' && (
              <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium">
                {statusOptions.find(o => o.value === statusFilter)?.label}
              </span>
            )}
            {searchTerm && (
              <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium">
                {t('common.search')}: {searchTerm}
              </span>
            )}
            <button
              onClick={() => {
                setStatusFilter('all');
                setSearchTerm('');
                setDateRange({
                  start: new Date().toISOString().split('T')[0],
                  end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                });
              }}
              className="text-xs text-red-600 hover:text-red-700 ml-auto"
            >
              {t('common.clearAll', 'Clear all')}
            </button>
          </div>
        )}
      </div>

      {/* Appointments Table */}
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
        ) : appointmentsList.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-1">{t('admin.noAppointments', 'No appointments found')}</h3>
            <p className="text-sm text-gray-400">{t('admin.tryAdjustingFilters', 'Try adjusting your filters')}</p>
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
                    {t('booking.service', 'Service')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('booking.date', 'Date & Time')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.status', 'Status')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('payment.amount', 'Amount')}
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.actions', 'Actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appointmentsList.map((apt) => (
                  <tr key={apt._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-white text-sm font-medium">
                            {apt.customer?.fullName?.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{apt.customer?.fullName || 'Unknown'}</p>
                          <p className="text-xs text-gray-400">{apt.customer?.phoneNumber || 'No phone'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">{apt.service?.name?.en || 'Unknown Service'}</p>
                      <p className="text-xs text-gray-400">{apt.service?.duration || '?'} min</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-800">{formatDate(apt.scheduledDate)}</p>
                      <p className="text-xs text-gray-400">{apt.scheduledTime || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(apt.status)}`}>
                        {statusOptions.find(o => o.value === apt.status)?.label || apt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">{formatCurrency(apt.payment?.totalAmount)}</p>
                      <p className="text-xs text-gray-400">
                        {apt.payment?.paymentStatus === 'COMPLETED' ? t('payment.paid', 'Paid') : 
                         apt.payment?.paymentStatus === 'PARTIAL' ? t('payment.partial', 'Partial') : 
                         t('payment.pending', 'Pending')}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(apt)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={t('common.view', 'View')}
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEdit(apt)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title={t('common.edit', 'Edit')}
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(apt._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title={t('common.delete', 'Delete')}
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
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
        {appointmentsPagination.pages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {t('common.showing', 'Showing')} {((appointmentsPagination.page - 1) * appointmentsPagination.limit) + 1} -{' '}
              {Math.min(appointmentsPagination.page * appointmentsPagination.limit, appointmentsPagination.total)} of{' '}
              {appointmentsPagination.total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => dispatch(fetchAllAppointments({ 
                  ...filters, 
                  page: appointmentsPagination.page - 1 
                }))}
                disabled={appointmentsPagination.page === 1}
                className="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                {t('common.previous', 'Previous')}
              </button>
              <button
                onClick={() => dispatch(fetchAllAppointments({ 
                  ...filters, 
                  page: appointmentsPagination.page + 1 
                }))}
                disabled={appointmentsPagination.page === appointmentsPagination.pages}
                className="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                {t('common.next', 'Next')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Status Update Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statusOptions.filter(opt => opt.value !== 'all').map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={`p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all text-left ${
              statusFilter === opt.value ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusBadge(opt.value)}`}>
              {opt.label}
            </span>
            <p className="text-2xl font-bold text-gray-800 mt-2">
              {appointmentsList.filter(a => a.status === opt.value).length || 0}
            </p>
          </button>
        ))}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">{t('admin.appointmentDetails', 'Appointment Details')}</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Details content */}
              <div className="space-y-4">
                {/* Customer Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">{t('common.customer', 'Customer Information')}</h4>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                      <span className="text-white text-lg font-medium">
                        {selectedAppointment.customer?.fullName?.charAt(0).toUpperCase() || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{selectedAppointment.customer?.fullName || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">{selectedAppointment.customer?.email || 'No email'}</p>
                      <p className="text-sm text-gray-500">{selectedAppointment.customer?.phoneNumber || 'No phone'}</p>
                    </div>
                  </div>
                </div>

                {/* Appointment Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">{t('booking.service', 'Service')}</p>
                    <p className="font-medium text-gray-800">{selectedAppointment.service?.name?.en || 'Unknown'}</p>
                    <p className="text-xs text-gray-400 mt-1">{selectedAppointment.service?.duration || '?'} min</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">{t('booking.date', 'Date & Time')}</p>
                    <p className="font-medium text-gray-800">{formatDate(selectedAppointment.scheduledDate)}</p>
                    <p className="text-xs text-gray-400 mt-1">{selectedAppointment.scheduledTime || 'N/A'}</p>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">{t('payment.paymentDetails', 'Payment Details')}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t('payment.totalAmount')}:</span>
                      <span className="font-medium text-gray-800">{formatCurrency(selectedAppointment.payment?.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t('payment.advancePayment')}:</span>
                      <span className="font-medium text-green-600">{formatCurrency(selectedAppointment.payment?.advanceAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                      <span className="text-gray-600">{t('payment.status')}:</span>
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${getStatusBadge(selectedAppointment.payment?.paymentStatus)}`}>
                        {selectedAppointment.payment?.paymentStatus || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedAppointment.notes && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">{t('common.notes', 'Notes')}</h4>
                    <p className="text-sm text-gray-700">{selectedAppointment.notes}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleEdit(selectedAppointment);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  {t('common.edit', 'Edit')}
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

      {/* Edit Modal */}
      {showEditModal && selectedAppointment && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">{t('admin.editAppointment', 'Edit Appointment')}</h3>
              
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                {/* Status Update */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('common.status', 'Status')}
                  </label>
                  <select
                    value={selectedAppointment.status}
                    onChange={(e) => setSelectedAppointment({ ...selectedAppointment, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {statusOptions.filter(opt => opt.value !== 'all').map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('booking.date', 'Date')}
                  </label>
                  <input
                    type="date"
                    value={selectedAppointment.scheduledDate?.split('T')[0] || ''}
                    onChange={(e) => setSelectedAppointment({ ...selectedAppointment, scheduledDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('booking.time', 'Time')}
                  </label>
                  <input
                    type="time"
                    value={selectedAppointment.scheduledTime || ''}
                    onChange={(e) => setSelectedAppointment({ ...selectedAppointment, scheduledTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('common.notes', 'Notes')}
                  </label>
                  <textarea
                    value={selectedAppointment.notes || ''}
                    onChange={(e) => setSelectedAppointment({ ...selectedAppointment, notes: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('admin.notesPlaceholder', 'Add any notes about this appointment...')}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    {t('common.cancel', 'Cancel')}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await dispatch(updateAppointment({
                          appointmentId: selectedAppointment._id,
                          data: {
                            status: selectedAppointment.status,
                            scheduledDate: selectedAppointment.scheduledDate,
                            scheduledTime: selectedAppointment.scheduledTime,
                            notes: selectedAppointment.notes
                          }
                        })).unwrap();
                        toast.success(t('common.success'));
                        setShowEditModal(false);
                        loadAppointments();
                      } catch (error) {
                        toast.error(error || t('common.error'));
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    {t('common.save', 'Save Changes')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAppointments;