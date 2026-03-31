import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { 
  fetchAllAppointments, 
  updateAppointment,
  deleteAppointment
} from '../../store/slices/adminSlice';
import Button from '../../components/ui/Button/Button';
import Badge from '../../components/ui/Badge/Badge';
import BottomSheet from '../../components/ui/BottomSheet/BottomSheet';
import Skeleton from '../../components/ui/Skeleton/Skeleton';
import {
  CalendarDaysIcon,
  ClockIcon,
  PhoneIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  EllipsisVerticalIcon,
  ScissorsIcon,
  CurrencyDollarIcon,
  PencilSquareIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import './AdminPages.css';

const AdminAppointments = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { appointments, isLoading } = useSelector((state) => state.admin.appointments || {
    appointments: [],
    isLoading: false
  });
  
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsSheet, setShowDetailsSheet] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Date selection state
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('all');

  // Generate an array of dates around today for the horizontal selector
  const dateOptions = useMemo(() => {
    const dates = [];
    const today = new Date();
    // 3 days ago to 14 days ahead
    for (let i = -3; i <= 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push({
        dateStr: d.toISOString().split('T')[0],
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
        isToday: i === 0
      });
    }
    return dates;
  }, []);

  // Status options with style mapping
  const statusOptions = [
    { value: 'all', label: 'All', color: 'bg-black text-white border-black' },
    { value: 'PENDING_PAYMENT', label: 'Pending', color: 'bg-white text-secondary-brown border-accent-gold/20' },
    { value: 'CONFIRMED', label: 'Confirmed', color: 'bg-white text-success border-success/30' },
    { value: 'CHECKED_IN', label: 'Checked In', color: 'bg-accent-gold md:text-black border-accent-gold' },
    { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-black text-accent-gold border-black' },
    { value: 'COMPLETED', label: 'Completed', color: 'bg-gray-100 text-gray-400 border-gray-200' },
    { value: 'CANCELLED', label: 'Cancelled', color: 'bg-error/10 text-error border-error/20' }
  ];

  const loadAppointments = React.useCallback(() => {
    // We only fetch for the selected date on mobile for simplicity, 
    // or we could construct a dateRange for desktop
    const activeFilters = {
      startDate: selectedDate,
      endDate: selectedDate,
      status: statusFilter !== 'all' ? statusFilter : undefined
    };
    dispatch(fetchAllAppointments(activeFilters));
  }, [selectedDate, statusFilter, dispatch]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      await dispatch(updateAppointment({ 
        appointmentId, 
        data: { status: newStatus } 
      })).unwrap();
      toast.success(t('common.success') || 'Status updated');
      loadAppointments();
      if (selectedAppointment && selectedAppointment._id === appointmentId) {
        setSelectedAppointment({...selectedAppointment, status: newStatus});
      }
    } catch (error) {
      toast.error(error?.message || t('common.error'));
    }
  };

  const handleSaveEdit = async () => {
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
      setIsEditMode(false);
      loadAppointments();
    } catch (error) {
      toast.error(error?.message || 'Update failed');
    }
  };

  const handleDelete = async (appointmentId) => {
    if (window.confirm('Permanent deletion. Are you sure?')) {
      try {
        await dispatch(deleteAppointment(appointmentId)).unwrap();
        toast.success('Successfully deleted');
        setShowDetailsSheet(false);
        loadAppointments();
      } catch (error) {
        toast.error(error?.message || 'Error deleting');
      }
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      'PENDING_PAYMENT': { label: 'Pending', variant: 'gold' },
      'CONFIRMED': { label: 'Confirmed', variant: 'success' },
      'CHECKED_IN': { label: 'Checked In', variant: 'black' },
      'IN_PROGRESS': { label: 'In Progress', variant: 'gold', pulse: true },
      'COMPLETED': { label: 'Completed', variant: 'default' },
      'CANCELLED': { label: 'Cancelled', variant: 'error' },
      'NO_SHOW': { label: 'No Show', variant: 'error' }
    };
    const mapped = map[status] || { label: status, variant: 'brown' };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border
        ${mapped.variant === 'gold' ? 'bg-accent-gold/10 text-accent-gold border-accent-gold/20' : ''}
        ${mapped.variant === 'success' ? 'bg-success/10 text-success border-success/20' : ''}
        ${mapped.variant === 'black' ? 'bg-black text-white border-black' : ''}
        ${mapped.variant === 'error' ? 'bg-error/10 text-error border-error/20' : ''}
        ${mapped.variant === 'default' ? 'bg-gray-100 text-gray-500 border-gray-200' : ''}
        ${mapped.variant === 'brown' ? 'bg-secondary-brown/10 text-secondary-brown border-secondary-brown/20' : ''}
      `}>
        {mapped.pulse && <span className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-pulse" />}
        {mapped.label}
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

  const appointmentsList = appointments?.list || [];
  
  // Sort appointments by time
  const sortedAppointments = [...appointmentsList].sort((a, b) => {
    return a.scheduledTime.localeCompare(b.scheduledTime);
  });

  return (
    <div className="admin-page animate-fade-in px-4 lg:px-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4 lg:mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-black uppercase tracking-tight">Appointments</h1>
          <p className="text-xs font-bold opacity-50 uppercase tracking-widest mt-1">Manage Schedule</p>
        </div>
        <Button
          variant="black"
          onClick={() => window.location.href = '/admin/appointments/new'}
          className="w-full md:w-auto flex items-center justify-center gap-2 h-[44px]"
        >
          <span className="text-xl">+</span> Add Booking
        </Button>
      </div>

      {/* Sticky Horizontal Calendar */}
      <div className="sticky top-0 z-40 bg-background-cream pb-4 pt-2 -mx-4 px-4 lg:mx-0 lg:px-0 lg:static lg:bg-transparent lg:pb-0 lg:pt-0 mb-4">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
          {dateOptions.map((dateObj) => (
            <button
              key={dateObj.dateStr}
              onClick={() => setSelectedDate(dateObj.dateStr)}
              className={`flex flex-col items-center justify-center w-14 h-16 rounded-2xl shrink-0 transition-all border ${
                selectedDate === dateObj.dateStr
                  ? 'bg-black border-black text-accent-gold shadow-md'
                  : dateObj.isToday
                    ? 'bg-white border-accent-gold text-black'
                    : 'bg-white border-transparent text-secondary-brown/60 hover:border-accent-gold/20'
              }`}
            >
              <span className={`text-[10px] font-black uppercase ${selectedDate === dateObj.dateStr ? 'text-white' : ''}`}>
                {dateObj.dayName}
              </span>
              <span className={`text-xl font-black mt-0.5 ${selectedDate === dateObj.dateStr ? 'text-accent-gold' : 'text-black'}`}>
                {dateObj.dayNum}
              </span>
              {dateObj.isToday && selectedDate !== dateObj.dateStr && (
                <div className="w-1 h-1 rounded-full bg-accent-gold mt-1" />
              )}
            </button>
          ))}
        </div>
        
        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mt-2 pb-1">
          {statusOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`whitespace-nowrap px-4 h-8 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                statusFilter === opt.value
                  ? opt.color
                  : 'bg-white border-gray-200 text-secondary-brown/60 hover:border-accent-gold/20'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} height="120px" variant="rectangle" className="rounded-2xl" />)}
        </div>
      ) : sortedAppointments.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-3xl border border-dashed border-accent-gold/20">
          <CalendarDaysIcon className="w-12 h-12 text-secondary-brown/20 mx-auto mb-3" />
          <p className="text-sm font-black text-secondary-brown opacity-40 uppercase tracking-widest mb-1">No appointments</p>
          <p className="text-xs font-bold text-secondary-brown/40">Try selecting a different date</p>
        </div>
      ) : (
        <div className="space-y-4 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:space-y-0 lg:gap-4">
          {sortedAppointments.map((apt) => (
            <div 
              key={apt._id}
              onClick={() => {
                setSelectedAppointment(apt);
                setIsEditMode(false);
                setShowDetailsSheet(true);
              }}
              className="bg-white p-4 rounded-2xl border border-accent-gold/10 shadow-sm hover:border-accent-gold/50 cursor-pointer transition-all active:scale-[0.98]"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-accent-gold" />
                  <span className="text-lg font-black text-black">{apt.scheduledTime}</span>
                </div>
                {getStatusBadge(apt.status)}
              </div>
              
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-background-cream flex items-center justify-center font-black text-black">
                  {apt.customer?.fullName?.charAt(0).toUpperCase() || 'W'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-black uppercase text-sm truncate pr-2">
                    {apt.customer?.fullName || 'Walk-in Client'}
                  </h3>
                  <p className="text-xs font-bold text-secondary-brown/60 truncate flex items-center gap-1 mt-0.5">
                    <ScissorsIcon className="w-3 h-3" />
                    {apt.service?.name?.en}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-secondary-brown/50">
                  <CurrencyDollarIcon className="w-4 h-4" />
                  {formatCurrency(apt.payment?.totalAmount)} 
                  {apt.payment?.paymentStatus === 'COMPLETED' ? (
                    <span className="text-success ml-1">Paid</span>
                  ) : (
                    <span className="text-error ml-1">Unpaid</span>
                  )}
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if(apt.customer?.phoneNumber) window.location.href = `tel:${apt.customer.phoneNumber}`;
                  }}
                  className="w-8 h-8 rounded-full bg-accent-gold/10 text-accent-gold flex items-center justify-center hover:bg-accent-gold hover:text-white transition-colors"
                >
                  <PhoneIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details / Edit BottomSheet */}
      <BottomSheet 
        isOpen={showDetailsSheet} 
        onClose={() => {
          setShowDetailsSheet(false);
          // Wait for animation to finish before resetting mode
          setTimeout(() => setIsEditMode(false), 300);
        }}
        title={isEditMode ? "Edit Setup" : "Session Details"}
        actionButton={
          !isEditMode && selectedAppointment && (
            <button 
              onClick={() => setIsEditMode(true)}
              className="p-2 text-secondary-brown hover:text-black"
            >
              <PencilSquareIcon className="w-6 h-6" />
            </button>
          )
        }
      >
        {selectedAppointment && !isEditMode && (
          <div className="space-y-6 pb-6">
            <div className="flex items-center gap-4 bg-background-cream p-4 rounded-2xl border border-accent-gold/10">
              <div className="w-16 h-16 bg-black text-accent-gold flex items-center justify-center rounded-2xl font-black text-3xl">
                {selectedAppointment.customer?.fullName?.charAt(0).toUpperCase() || 'W'}
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-black text-black uppercase">{selectedAppointment.customer?.fullName || 'Walk-in Client'}</h4>
                <p className="text-xs font-bold text-secondary-brown/60 mt-1">{selectedAppointment.customer?.phoneNumber || 'No phone provided'}</p>
              </div>
              <button 
                onClick={() => { if(selectedAppointment.customer?.phoneNumber) window.location.href = `tel:${selectedAppointment.customer.phoneNumber}`; }}
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black border border-gray-100 shadow-sm hover:text-accent-gold"
              >
                <PhoneIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-secondary-brown/50 mb-1">Time</p>
                <div className="flex items-center gap-1.5 font-black text-black">
                  <ClockIcon className="w-4 h-4 text-accent-gold" />
                  {selectedAppointment.scheduledTime}
                </div>
                <p className="text-[10px] font-bold text-secondary-brown/60 mt-1">{selectedAppointment.scheduledDate.split('T')[0]}</p>
              </div>
              <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-secondary-brown/50 mb-1">Service</p>
                <p className="text-xs font-black text-black line-clamp-2 leading-tight">{selectedAppointment.service?.name?.en}</p>
                <p className="text-[10px] font-bold text-accent-gold mt-1">{selectedAppointment.service?.duration} mins</p>
              </div>
            </div>

            <div className="bg-black text-white p-5 rounded-2xl">
              <div className="flex justify-between items-center mb-3 pb-3 border-b border-white/10">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Status</span>
                <span className="text-xs font-black uppercase text-accent-gold">{selectedAppointment.status.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between items-center mb-3 pb-3 border-b border-white/10">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Payment</span>
                <span className={`text-xs font-black uppercase ${selectedAppointment.payment?.paymentStatus === 'COMPLETED' ? 'text-success' : 'text-error'}`}>
                  {selectedAppointment.payment?.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between items-end pt-1">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Bill</span>
                <span className="text-2xl font-black text-white">{formatCurrency(selectedAppointment.payment?.totalAmount)}</span>
              </div>
            </div>

            {selectedAppointment.notes && (
              <div className="p-4 bg-accent-gold/10 rounded-2xl border border-accent-gold/20">
                <div className="flex items-center gap-1.5 text-accent-gold mb-2">
                  <EllipsisVerticalIcon className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Notes</span>
                </div>
                <p className="text-xs font-bold text-secondary-brown">{selectedAppointment.notes}</p>
              </div>
            )}

            {/* Quick Actions Footer */}
            <div className="pt-2 grid grid-cols-2 gap-3">
              {selectedAppointment.status === 'PENDING_PAYMENT' || selectedAppointment.status === 'CONFIRMED' ? (
                <>
                  <Button 
                    variant="black" 
                    className="w-full text-xs"
                    onClick={() => handleUpdateStatus(selectedAppointment._id, 'CHECKED_IN')}
                  >Check In
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full text-xs text-error border-error hover:bg-error/10"
                    onClick={() => handleUpdateStatus(selectedAppointment._id, 'CANCELLED')}
                  >Cancel
                  </Button>
                </>
              ) : selectedAppointment.status === 'CHECKED_IN' ? (
                <Button 
                  variant="gold" 
                  className="w-full col-span-2 text-xs"
                  onClick={() => handleUpdateStatus(selectedAppointment._id, 'IN_PROGRESS')}
                >Start Service
                </Button>
              ) : selectedAppointment.status === 'IN_PROGRESS' ? (
                <Button 
                  variant="success" 
                  className="w-full col-span-2 text-xs"
                  onClick={() => handleUpdateStatus(selectedAppointment._id, 'COMPLETED')}
                >Complete Service
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full col-span-2 text-xs"
                  onClick={() => setShowDetailsSheet(false)}
                >Close
                </Button>
              )}
            </div>
          </div>
        )}

        {selectedAppointment && isEditMode && (
          <div className="space-y-5 pb-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brown/70 ml-1">Current Status</label>
              <select
                value={selectedAppointment.status}
                onChange={(e) => setSelectedAppointment({ ...selectedAppointment, status: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:border-accent-gold focus:ring-0"
              >
                {statusOptions.filter(o => o.value !== 'all').map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brown/70 ml-1">Date</label>
                <input
                  type="date"
                  value={selectedAppointment.scheduledDate?.split('T')[0] || ''}
                  onChange={(e) => setSelectedAppointment({ ...selectedAppointment, scheduledDate: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:border-accent-gold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brown/70 ml-1">Time</label>
                <input
                  type="time"
                  value={selectedAppointment.scheduledTime || ''}
                  onChange={(e) => setSelectedAppointment({ ...selectedAppointment, scheduledTime: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:border-accent-gold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brown/70 ml-1">Notes</label>
              <textarea
                value={selectedAppointment.notes || ''}
                onChange={(e) => setSelectedAppointment({ ...selectedAppointment, notes: e.target.value })}
                rows="3"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:border-accent-gold"
                placeholder="Optional notes..."
              />
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-3">
              <Button 
                variant="black" 
                className="w-full"
                onClick={handleSaveEdit}
              >Save Changes</Button>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIsEditMode(false)}
                >Cancel</Button>
                <button 
                  onClick={() => handleDelete(selectedAppointment._id)}
                  className="w-12 h-[38px] rounded-xl border border-error text-error flex items-center justify-center hover:bg-error/10 active:scale-95 transition-all"
                  aria-label="Delete Appointment"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
};

export default AdminAppointments;