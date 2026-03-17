import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { 
  fetchAllAppointments, 
  updateAppointment,
  deleteAppointment
} from '../../store/slices/adminSlice';
import Card, { CardHeader, CardBody } from '../../components/ui/Card/Card';
import Badge from '../../components/ui/Badge/Badge';
import Button from '../../components/ui/Button/Button';
import Input from '../../components/ui/Input/Input';
import Modal, { ModalHeader, ModalContent, ModalFooter } from '../../components/ui/Modal/Modal';
import Skeleton from '../../components/ui/Skeleton/Skeleton';
import './AdminPages.css';

const AdminAppointments = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { appointments, isLoading, filters } = useSelector((state) => state.admin.appointments || {
    appointments: [],
    isLoading: false,
    filters: {}
  });
  
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
    { value: 'all', label: 'All Status', variant: 'brown' },
    { value: 'PENDING_PAYMENT', label: 'Pending Payment', variant: 'gold' },
    { value: 'CONFIRMED', label: 'Confirmed', variant: 'success' },
    { value: 'CHECKED_IN', label: 'Checked In', variant: 'black' },
    { value: 'IN_PROGRESS', label: 'In Progress', variant: 'gold' },
    { value: 'COMPLETED', label: 'Completed', variant: 'cream' },
    { value: 'CANCELLED', label: 'Cancelled', variant: 'error' },
    { value: 'NO_SHOW', label: 'No Show', variant: 'error' }
  ];

  useEffect(() => {
    loadAppointments();
  }, [dateRange, statusFilter, searchTerm, dispatch]);

  const loadAppointments = () => {
    const activeFilters = {
      startDate: dateRange.start,
      endDate: dateRange.end,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      search: searchTerm || undefined
    };
    dispatch(fetchAllAppointments(activeFilters));
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
      toast.error(error?.message || t('common.error'));
    }
  };

  const handleDelete = async (appointmentId) => {
    if (window.confirm('Permanent deletion. Are you sure?')) {
      try {
        await dispatch(deleteAppointment(appointmentId)).unwrap();
        toast.success('Successfully deleted');
        loadAppointments();
      } catch (error) {
        toast.error(error?.message || 'Error deleting');
      }
    }
  };

  const getStatusVariant = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.variant || 'brown';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const appointmentsList = appointments?.list || [];
  const appointmentsPagination = appointments?.pagination || { page: 1, limit: 20, total: 0, pages: 1 };

  return (
    <div className="admin-page animate-fade-in">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
        <div>
          <Badge variant="gold" className="mb-4">Appointment Archive</Badge>
          <h1 className="text-5xl font-black text-black uppercase tracking-tight">Booking Portal</h1>
          <p className="text-secondary-brown font-bold opacity-40 mt-1">Manage, track, and optimize salon flow</p>
        </div>
        <Button
          variant="black"
          onClick={() => window.location.href = '/admin/appointments/new'}
          className="flex items-center gap-2"
        >
          <span className="text-xl">+</span> New Session
        </Button>
      </div>

      {/* Filter Matrix */}
      <Card variant="default" className="mb-8">
        <CardBody className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brown opacity-50">Timeline Start</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full px-4 py-2 bg-cream/30 border border-border-primary rounded-xl text-sm font-bold focus:ring-accent-gold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brown opacity-50">Timeline End</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full px-4 py-2 bg-cream/30 border border-border-primary rounded-xl text-sm font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brown opacity-50">Presence Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 bg-cream/30 border border-border-primary rounded-xl text-sm font-bold"
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brown opacity-50">Trace Customer</label>
              <Input
                placeholder="Name or Phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                noMargin
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Operations Table */}
      <Card className="overflow-visible">
        <CardHeader className="bg-black p-6 rounded-t-xl flex justify-between items-center text-white">
          <h3 className="text-sm font-black uppercase tracking-widest">Active Records</h3>
          <Badge variant="gold">{appointmentsPagination.total} Found</Badge>
        </CardHeader>
        <CardBody className="p-0">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} height="60px" variant="rectangle" />)}
            </div>
          ) : appointmentsList.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-xl font-black text-secondary-brown opacity-20 uppercase tracking-widest">No matching sessions found</p>
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Customer Detail</th>
                    <th>Selected Service</th>
                    <th>Schedule</th>
                    <th>Status</th>
                    <th>Financials</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointmentsList.map((apt) => (
                    <tr key={apt._id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-black text-gold flex items-center justify-center rounded-lg font-black text-lg">
                            {apt.customer?.fullName?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-black text-black uppercase text-sm">{apt.customer?.fullName || 'Walk-in'}</p>
                            <p className="text-[10px] font-bold text-secondary-brown opacity-60">+{apt.customer?.phoneNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <p className="font-bold text-black">{apt.service?.name?.en}</p>
                        <p className="text-[10px] font-black text-accent-gold uppercase">{apt.service?.duration} Min Session</p>
                      </td>
                      <td>
                        <p className="font-bold text-black">{formatDate(apt.scheduledDate)}</p>
                        <Badge variant="black" size="xs">{apt.scheduledTime}</Badge>
                      </td>
                      <td>
                        <Badge variant={getStatusVariant(apt.status)} size="sm">
                          {apt.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td>
                        <p className="font-black text-black">{formatCurrency(apt.payment?.totalAmount)}</p>
                        <p className={`text-[10px] font-black uppercase ${apt.payment?.paymentStatus === 'COMPLETED' ? 'text-green-600' : 'text-gold'}`}>
                          {apt.payment?.paymentStatus}
                        </p>
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            className="admin-btn-icon" 
                            title="Quick View"
                            onClick={() => {
                              setSelectedAppointment(apt);
                              setShowDetailsModal(true);
                            }}
                          >👁️</button>
                          <button 
                            className="admin-btn-icon" 
                            title="Edit"
                            onClick={() => {
                              setSelectedAppointment(apt);
                              setShowEditModal(true);
                            }}
                          >✏️</button>
                          <button 
                            className="admin-btn-icon text-error hover:bg-error/10" 
                            title="Delete"
                            onClick={() => handleDelete(apt._id)}
                          >🗑️</button>
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

      {/* Details Modal */}
      <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)}>
        <ModalHeader>Session Insight</ModalHeader>
        <ModalContent>
          {selectedAppointment && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 bg-cream p-4 rounded-xl border border-border-primary">
                <div className="w-16 h-16 bg-black text-gold flex items-center justify-center rounded-xl font-black text-3xl">
                  {selectedAppointment.customer?.fullName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xl font-black text-black uppercase">{selectedAppointment.customer?.fullName}</h4>
                  <p className="text-secondary-brown font-bold">{selectedAppointment.customer?.phoneNumber}</p>
                  <p className="text-xs text-secondary-brown opacity-50">{selectedAppointment.customer?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background-cream p-4 rounded-xl">
                  <p className="text-[10px] font-black uppercase text-secondary-brown opacity-50 mb-1">Service Type</p>
                  <p className="font-black text-black">{selectedAppointment.service?.name?.en}</p>
                  <p className="text-[10px] font-bold text-accent-gold uppercase">{selectedAppointment.service?.duration} Minutes</p>
                </div>
                <div className="bg-background-cream p-4 rounded-xl">
                  <p className="text-[10px] font-black uppercase text-secondary-brown opacity-50 mb-1">Scheduled Date</p>
                  <p className="font-black text-black">{formatDate(selectedAppointment.scheduledDate)}</p>
                  <p className="text-[10px] font-bold text-black uppercase">Clock: {selectedAppointment.scheduledTime}</p>
                </div>
              </div>

              <div className="bg-black text-white p-6 rounded-xl">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
                  <span className="text-xs font-black uppercase opacity-60">Total Billable</span>
                  <span className="text-2xl font-black text-gold">{formatCurrency(selectedAppointment.payment?.totalAmount)}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="opacity-60">Advance Deposited:</span>
                    <span className="font-bold text-green-400">{formatCurrency(selectedAppointment.payment?.advanceAmount)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="opacity-60">Payment Status:</span>
                    <span className="font-bold uppercase text-gold">{selectedAppointment.payment?.paymentStatus}</span>
                  </div>
                </div>
              </div>

              {selectedAppointment.notes && (
                <div className="p-4 bg-gold/5 rounded-xl border-l-4 border-gold">
                  <p className="text-[10px] font-black uppercase text-accent-gold mb-1">Manager Notes</p>
                  <p className="text-sm font-bold text-secondary-brown italic">"{selectedAppointment.notes}"</p>
                </div>
              )}
            </div>
          )}
        </ModalContent>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowDetailsModal(false)}>Close Archive</Button>
          <Button variant="gold" onClick={() => { setShowDetailsModal(false); setShowEditModal(true); }}>Enter Edit Mode</Button>
        </ModalFooter>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)}>
        <ModalHeader>Modify Records</ModalHeader>
        <ModalContent>
          {selectedAppointment && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brown opacity-50">Flow Status</label>
                <select
                  value={selectedAppointment.status}
                  onChange={(e) => setSelectedAppointment({ ...selectedAppointment, status: e.target.value })}
                  className="w-full px-4 py-3 bg-cream/30 border border-border-primary rounded-xl text-sm font-bold focus:ring-accent-gold"
                >
                  {statusOptions.filter(o => o.value !== 'all').map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brown opacity-50">Adjust Date</label>
                  <input
                    type="date"
                    value={selectedAppointment.scheduledDate?.split('T')[0] || ''}
                    onChange={(e) => setSelectedAppointment({ ...selectedAppointment, scheduledDate: e.target.value })}
                    className="w-full px-4 py-3 bg-cream/30 border border-border-primary rounded-xl text-sm font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brown opacity-50">Adjust Time</label>
                  <input
                    type="time"
                    value={selectedAppointment.scheduledTime || ''}
                    onChange={(e) => setSelectedAppointment({ ...selectedAppointment, scheduledTime: e.target.value })}
                    className="w-full px-4 py-3 bg-cream/30 border border-border-primary rounded-xl text-sm font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brown opacity-50">Administrative Notes</label>
                <textarea
                  value={selectedAppointment.notes || ''}
                  onChange={(e) => setSelectedAppointment({ ...selectedAppointment, notes: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-3 bg-cream/30 border border-border-primary rounded-xl text-sm font-bold"
                  placeholder="Internal notes about this session..."
                />
              </div>
            </div>
          )}
        </ModalContent>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowEditModal(false)}>Discard Changes</Button>
          <Button 
            variant="gold" 
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
                toast.success('Successfully synchronized');
                setShowEditModal(false);
                loadAppointments();
              } catch (error) {
                toast.error(error?.message || 'Update failed');
              }
            }}
          >Sync Changes</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default AdminAppointments;