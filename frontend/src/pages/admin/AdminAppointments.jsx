import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { 
  fetchAllAppointments, 
  updateAppointment,
  deleteAppointment
} from '../../store/slices/adminSlice';
import BottomSheet from '../../components/ui/BottomSheet/BottomSheet';
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
    { value: 'all', label: 'All', color: 'bg-zinc-800 text-zinc-100 border-zinc-700' },
    { value: 'PENDING_PAYMENT', label: 'Pending', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    { value: 'CONFIRMED', label: 'Confirmed', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    { value: 'CHECKED_IN', label: 'Checked In', color: 'bg-zinc-100 text-zinc-900 border-zinc-300' },
    { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-amber-500 text-zinc-950 border-amber-500' },
    { value: 'COMPLETED', label: 'Completed', color: 'bg-zinc-900 text-zinc-500 border-zinc-800' },
    { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-500/10 text-red-500 border-red-500/20' }
  ];

  const loadAppointments = React.useCallback(() => {
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
      'PENDING_PAYMENT': { label: 'Pending', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
      'CONFIRMED': { label: 'Confirmed', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
      'CHECKED_IN': { label: 'Checked In', color: 'bg-zinc-800 text-zinc-300 border-zinc-700' },
      'IN_PROGRESS': { label: 'In Progress', color: 'bg-amber-500/20 text-amber-500 border-amber-500/30', pulse: true },
      'COMPLETED': { label: 'Completed', color: 'bg-zinc-950 text-zinc-500 border-zinc-800' },
      'CANCELLED': { label: 'Cancelled', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
      'NO_SHOW': { label: 'No Show', color: 'bg-red-500/10 text-red-500 border-red-500/20' }
    };
    const mapped = map[status] || { label: status, color: 'bg-zinc-800 text-zinc-400 border-zinc-700' };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border ${mapped.color}`}>
        {mapped.pulse && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4 lg:mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-zinc-50 tracking-tight">Appointments</h1>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Manage Schedule</p>
        </div>
        <button
          onClick={() => window.location.href = '/admin/appointments/new'}
          className="w-full md:w-auto flex items-center justify-center gap-2 h-[44px] px-6 bg-zinc-100 hover:bg-white text-zinc-900 rounded-xl font-bold transition-all active:scale-95 shadow-sm"
        >
          <span className="text-xl">+</span> Add Booking
        </button>
      </div>

      {/* Sticky Horizontal Calendar */}
      <div className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl pb-4 pt-2 -mx-4 px-4 lg:mx-0 lg:px-0 lg:static lg:bg-transparent lg:pb-0 lg:pt-0 mb-4 border-b lg:border-none border-zinc-800/50">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
          {dateOptions.map((dateObj) => (
            <button
              key={dateObj.dateStr}
              onClick={() => setSelectedDate(dateObj.dateStr)}
              className={`flex flex-col items-center justify-center w-14 h-16 rounded-2xl shrink-0 transition-all border ${
                selectedDate === dateObj.dateStr
                  ? 'bg-amber-500 border-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                  : dateObj.isToday
                    ? 'bg-zinc-900 border-amber-500/50 text-zinc-100'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <span className={`text-[10px] font-bold uppercase tracking-widest ${selectedDate === dateObj.dateStr ? 'text-zinc-900' : ''}`}>
                {dateObj.dayName}
              </span>
              <span className={`text-xl font-bold mt-0.5 ${selectedDate === dateObj.dateStr ? 'text-zinc-950' : 'text-zinc-100'}`}>
                {dateObj.dayNum}
              </span>
              {dateObj.isToday && selectedDate !== dateObj.dateStr && (
                <div className="w-1 h-1 rounded-full bg-amber-500 mt-1" />
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
              className={`whitespace-nowrap px-4 h-8 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${
                statusFilter === opt.value
                  ? opt.color
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-zinc-900 rounded-2xl animate-pulse"></div>)}
        </div>
      ) : sortedAppointments.length === 0 ? (
        <div className="py-24 text-center bg-zinc-900/50 rounded-3xl border-2 border-dashed border-zinc-800">
          <CalendarDaysIcon className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-1">No appointments</p>
          <p className="text-xs font-bold text-zinc-600">Try selecting a different date</p>
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
              className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 shadow-sm hover:border-zinc-700 cursor-pointer transition-all active:scale-[0.98]"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-amber-500" />
                  <span className="text-lg font-bold text-zinc-100">{apt.scheduledTime}</span>
                </div>
                {getStatusBadge(apt.status)}
              </div>
              
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center font-bold text-zinc-300">
                  {apt.customer?.fullName?.charAt(0).toUpperCase() || 'W'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-zinc-100 uppercase text-sm truncate pr-2">
                    {apt.customer?.fullName || 'Walk-in Client'}
                  </h3>
                  <p className="text-xs font-bold text-zinc-500 truncate flex items-center gap-1 mt-0.5">
                    <ScissorsIcon className="w-3 h-3" />
                    {apt.service?.name?.en}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-800/50">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  <CurrencyDollarIcon className="w-4 h-4" />
                  {formatCurrency(apt.payment?.totalAmount)} 
                  {apt.payment?.paymentStatus === 'COMPLETED' ? (
                    <span className="text-emerald-500 ml-1">Paid</span>
                  ) : (
                    <span className="text-red-500 ml-1">Unpaid</span>
                  )}
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if(apt.customer?.phoneNumber) window.location.href = `tel:${apt.customer.phoneNumber}`;
                  }}
                  className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center hover:bg-amber-500 hover:text-zinc-950 transition-colors"
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
          setTimeout(() => setIsEditMode(false), 300);
        }}
        title={isEditMode ? "Edit Setup" : "Session Details"}
        actionButton={
          !isEditMode && selectedAppointment && (
            <button 
              onClick={() => setIsEditMode(true)}
              className="p-2 text-zinc-400 hover:text-amber-500 transition-colors"
            >
              <PencilSquareIcon className="w-6 h-6" />
            </button>
          )
        }
      >
        {selectedAppointment && !isEditMode && (
          <div className="space-y-6 pb-6">
            <div className="flex items-center gap-4 bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
              <div className="w-16 h-16 bg-zinc-950 border border-zinc-800 text-amber-500 flex items-center justify-center rounded-2xl font-bold text-3xl">
                {selectedAppointment.customer?.fullName?.charAt(0).toUpperCase() || 'W'}
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-zinc-100 uppercase">{selectedAppointment.customer?.fullName || 'Walk-in Client'}</h4>
                <p className="text-xs font-bold text-zinc-500 mt-1">{selectedAppointment.customer?.phoneNumber || 'No phone provided'}</p>
              </div>
              <button 
                onClick={() => { if(selectedAppointment.customer?.phoneNumber) window.location.href = `tel:${selectedAppointment.customer.phoneNumber}`; }}
                className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 border border-zinc-700 shadow-sm hover:text-amber-500 hover:bg-zinc-700 transition-colors"
              >
                <PhoneIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Time</p>
                <div className="flex items-center gap-1.5 font-bold text-zinc-100">
                  <ClockIcon className="w-4 h-4 text-amber-500" />
                  {selectedAppointment.scheduledTime}
                </div>
                <p className="text-[10px] font-bold text-zinc-600 mt-1">{selectedAppointment.scheduledDate.split('T')[0]}</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Service</p>
                <p className="text-xs font-bold text-zinc-100 line-clamp-2 leading-tight">{selectedAppointment.service?.name?.en}</p>
                <p className="text-[10px] font-bold text-amber-500 mt-1">{selectedAppointment.service?.duration} mins</p>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 text-zinc-100 p-5 rounded-2xl shadow-sm">
              <div className="flex justify-between items-center mb-3 pb-3 border-b border-zinc-800">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Status</span>
                <span className="text-xs font-bold uppercase text-amber-500">{selectedAppointment.status.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between items-center mb-3 pb-3 border-b border-zinc-800">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Payment</span>
                <span className={`text-xs font-bold uppercase ${selectedAppointment.payment?.paymentStatus === 'COMPLETED' ? 'text-emerald-500' : 'text-red-500'}`}>
                  {selectedAppointment.payment?.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between items-end pt-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Total Bill</span>
                <span className="text-2xl font-bold text-zinc-50">{formatCurrency(selectedAppointment.payment?.totalAmount)}</span>
              </div>
            </div>

            {selectedAppointment.notes && (
              <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                <div className="flex items-center gap-1.5 text-amber-500 mb-2">
                  <EllipsisVerticalIcon className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Notes</span>
                </div>
                <p className="text-xs font-bold text-amber-500/80">{selectedAppointment.notes}</p>
              </div>
            )}

            {/* Quick Actions Footer */}
            <div className="pt-2 grid grid-cols-2 gap-3">
              {selectedAppointment.status === 'PENDING_PAYMENT' || selectedAppointment.status === 'CONFIRMED' ? (
                <>
                  <button 
                    className="w-full h-12 bg-zinc-100 text-zinc-900 rounded-xl font-bold text-sm hover:bg-white active:scale-95 transition-all"
                    onClick={() => handleUpdateStatus(selectedAppointment._id, 'CHECKED_IN')}
                  >Check In
                  </button>
                  <button 
                    className="w-full h-12 bg-transparent border border-red-500 text-red-500 rounded-xl font-bold text-sm hover:bg-red-500/10 active:scale-95 transition-all"
                    onClick={() => handleUpdateStatus(selectedAppointment._id, 'CANCELLED')}
                  >Cancel
                  </button>
                </>
              ) : selectedAppointment.status === 'CHECKED_IN' ? (
                <button 
                  className="w-full col-span-2 h-12 bg-amber-500 text-zinc-950 rounded-xl font-bold text-sm hover:bg-amber-400 active:scale-95 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                  onClick={() => handleUpdateStatus(selectedAppointment._id, 'IN_PROGRESS')}
                >Start Service
                </button>
              ) : selectedAppointment.status === 'IN_PROGRESS' ? (
                <button 
                  className="w-full col-span-2 h-12 bg-emerald-500 text-zinc-950 rounded-xl font-bold text-sm hover:bg-emerald-400 active:scale-95 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  onClick={() => handleUpdateStatus(selectedAppointment._id, 'COMPLETED')}
                >Complete Service
                </button>
              ) : (
                <button 
                  className="w-full col-span-2 h-12 bg-zinc-800 text-zinc-300 rounded-xl font-bold text-sm hover:bg-zinc-700 active:scale-95 transition-all"
                  onClick={() => setShowDetailsSheet(false)}
                >Close
                </button>
              )}
            </div>
          </div>
        )}

        {selectedAppointment && isEditMode && (
          <div className="space-y-5 pb-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Current Status</label>
              <select
                value={selectedAppointment.status}
                onChange={(e) => setSelectedAppointment({ ...selectedAppointment, status: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm font-bold text-zinc-100 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              >
                {statusOptions.filter(o => o.value !== 'all').map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Date</label>
                <input
                  type="date"
                  value={selectedAppointment.scheduledDate?.split('T')[0] || ''}
                  onChange={(e) => setSelectedAppointment({ ...selectedAppointment, scheduledDate: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm font-bold text-zinc-100 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none style-color-scheme-dark"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Time</label>
                <input
                  type="time"
                  value={selectedAppointment.scheduledTime || ''}
                  onChange={(e) => setSelectedAppointment({ ...selectedAppointment, scheduledTime: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm font-bold text-zinc-100 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Notes</label>
              <textarea
                value={selectedAppointment.notes || ''}
                onChange={(e) => setSelectedAppointment({ ...selectedAppointment, notes: e.target.value })}
                rows="3"
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm font-bold text-zinc-100 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none placeholder:text-zinc-600"
                placeholder="Optional notes..."
              />
            </div>

            <div className="pt-4 border-t border-zinc-800/50 space-y-3">
              <button 
                className="w-full h-12 bg-zinc-100 text-zinc-900 rounded-xl font-bold text-sm hover:bg-white active:scale-95 transition-all"
                onClick={handleSaveEdit}
              >Save Changes</button>
              <div className="flex gap-3">
                <button 
                  className="flex-1 h-12 bg-transparent border border-zinc-700 text-zinc-300 rounded-xl font-bold text-sm hover:bg-zinc-800 active:scale-95 transition-all"
                  onClick={() => setIsEditMode(false)}
                >Cancel</button>
                <button 
                  onClick={() => handleDelete(selectedAppointment._id)}
                  className="w-12 h-12 rounded-xl border border-red-500 text-red-500 flex items-center justify-center hover:bg-red-500/10 active:scale-95 transition-all"
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
