import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import {
  fetchTodayQueue,
  updateAppointmentStatus
} from '../../store/slices/adminSlice';
import Button from '../../components/ui/Button/Button';
import Badge from '../../components/ui/Badge/Badge';
import Skeleton from '../../components/ui/Skeleton/Skeleton';
import BottomSheet from '../../components/ui/BottomSheet/BottomSheet';
import {
  ClockIcon,
  PlayCircleIcon,
  CheckCircleIcon,
  UserIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import './AdminPages.css';

const MobileCard = ({ appointment, status, index, setSelectedApt, setShowActionSheet }) => (
  <div 
    className="bg-white rounded-2xl p-4 border border-accent-gold/10 shadow-sm mb-3 flex items-center justify-between"
    onClick={() => {
      setSelectedApt({ ...appointment, currentStatus: status });
      setShowActionSheet(true);
    }}
  >
    <div className="flex items-center gap-3">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black ${
        status === 'inProgress' ? 'bg-black text-accent-gold animate-pulse' :
        status === 'checkedIn' ? 'bg-accent-gold/20 text-black' :
        'bg-background-cream text-secondary-brown/50'
      }`}>
        {appointment.customer?.fullName?.charAt(0) || <UserIcon className="w-6 h-6" />}
      </div>
      <div>
        <h4 className="font-black text-black uppercase text-sm">{appointment.customer?.fullName || 'Walk-in'}</h4>
        <p className="text-[10px] font-bold text-secondary-brown/60 truncate max-w-[150px]">{appointment.service?.name?.en}</p>
      </div>
    </div>
    
    <div className="flex items-center gap-2">
      <div className="text-right mr-2">
        <p className="text-xs font-black text-black">{appointment.scheduledTime}</p>
        <p className="text-[8px] font-black uppercase tracking-widest text-secondary-brown/40">#{appointment.queuePosition || index + 1}</p>
      </div>
      <button className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-secondary-brown/50 hover:bg-black hover:text-white transition-colors">
        <EllipsisHorizontalIcon className="w-5 h-5" />
      </button>
    </div>
  </div>
);

const DesktopCol = ({ title, items, status, color, isLoading, setSelectedApt, setShowActionSheet }) => (
  <div className="bg-gray-50 rounded-3xl p-4 min-h-[500px] border border-gray-100">
    <div className="flex items-center justify-between mb-4 px-2">
      <h3 className="font-black text-black uppercase text-xs tracking-widest">{title}</h3>
      <Badge variant={color} size="xs">{items.length}</Badge>
    </div>
    <div className="space-y-3">
      {isLoading && !items.length ? (
         <Skeleton height="80px" variant="rectangle" className="rounded-2xl" />
      ) : items.length > 0 ? (
        items.map((apt, i) => <MobileCard key={apt._id} appointment={apt} status={status} index={i} setSelectedApt={setSelectedApt} setShowActionSheet={setShowActionSheet} />)
      ) : (
        <div className="py-12 text-center">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-30 text-secondary-brown">Empty Data</p>
        </div>
      )}
    </div>
  </div>
);

const AdminQueue = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  const adminState = useSelector((state) => state.admin || {});
  const queueData = adminState.queue || {};
  const appointments = queueData.appointments || { 
    inProgress: [], 
    checkedIn: [], 
    confirmed: [] 
  };
  const stats = queueData.stats || { 
    total: 0, 
    inProgress: 0, 
    checkedIn: 0, 
    confirmed: 0 
  };
  const isLoading = adminState.isLoading || false;

  const [selectedApt, setSelectedApt] = useState(null);
  const [showActionSheet, setShowActionSheet] = useState(false);

  useEffect(() => {
    dispatch(fetchTodayQueue());
    const interval = setInterval(() => {
      dispatch(fetchTodayQueue());
    }, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await dispatch(updateAppointmentStatus({
        appointmentId: id,
        status: status,
        notes: 'Protocol automation update'
      })).unwrap();
      toast.success('Status synchronized');
      setShowActionSheet(false);
      dispatch(fetchTodayQueue());
    } catch (error) {
      toast.error(error || t('common.error'));
    }
  };

  // Extracted to module scope

  return (
    <div className="admin-page animate-fade-in px-4 lg:px-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6 lg:mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-black uppercase tracking-tight">Today's Queue</h1>
          <p className="text-xs font-bold opacity-50 uppercase tracking-widest mt-1">Live Floor Monitor</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="px-4 h-[44px] bg-black rounded-2xl flex flex-1 lg:flex-none items-center justify-center gap-2 shadow-md">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Sync</span>
          </div>
        </div>
      </div>

      {/* Stats Summary Mobile Scrollable */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-4 lg:pb-8">
        <div className="flex-none w-36 lg:w-auto bg-black rounded-2xl p-4 flex flex-col justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Total</p>
          <p className="text-2xl font-black text-white mt-2">{stats.total || 0}</p>
        </div>
        <div className="flex-none w-36 lg:w-auto bg-white border border-accent-gold/20 rounded-2xl p-4 flex flex-col justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-secondary-brown/50">In Progress</p>
          <p className="text-2xl font-black text-success mt-2">{stats.inProgress || 0}</p>
        </div>
        <div className="flex-none w-36 lg:w-auto bg-white border border-accent-gold/20 rounded-2xl p-4 flex flex-col justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-secondary-brown/50">Checked In</p>
          <p className="text-2xl font-black text-black mt-2">{stats.checkedIn || 0}</p>
        </div>
        <div className="flex-none w-36 lg:w-auto bg-white border border-accent-gold/20 rounded-2xl p-4 flex flex-col justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-secondary-brown/50">Scheduled</p>
          <p className="text-2xl font-black text-accent-gold mt-2">{stats.confirmed || 0}</p>
        </div>
      </div>

      {/* Mobile Accordion View vs Desktop Kanban */}
      <div className="lg:hidden space-y-6">
        {/* In Progress */}
        <div className="space-y-3">
          <h3 className="font-black text-black uppercase text-xs tracking-widest flex justify-between items-center bg-gray-50 p-2 rounded-lg">
            <span>In Progress</span>
            <Badge variant="success" size="xs">{appointments.inProgress.length}</Badge>
          </h3>
          {isLoading ? <Skeleton height="80px" /> : appointments.inProgress.map((apt, i) => <MobileCard key={apt._id} appointment={apt} status="inProgress" index={i} setSelectedApt={setSelectedApt} setShowActionSheet={setShowActionSheet} />)}
          {!isLoading && !appointments.inProgress.length && <p className="text-center text-xs opacity-40 font-bold uppercase py-4">None active</p>}
        </div>

        {/* Checked In */}
        <div className="space-y-3">
          <h3 className="font-black text-black uppercase text-xs tracking-widest flex justify-between items-center bg-gray-50 p-2 rounded-lg">
            <span>Checked In & Waiting</span>
            <Badge variant="black" size="xs">{appointments.checkedIn.length}</Badge>
          </h3>
          {isLoading ? <Skeleton height="80px" /> : appointments.checkedIn.map((apt, i) => <MobileCard key={apt._id} appointment={apt} status="checkedIn" index={i} setSelectedApt={setSelectedApt} setShowActionSheet={setShowActionSheet} />)}
          {!isLoading && !appointments.checkedIn.length && <p className="text-center text-xs opacity-40 font-bold uppercase py-4">Queue empty</p>}
        </div>

        {/* Confirmed */}
        <div className="space-y-3 pb-8">
          <h3 className="font-black text-black uppercase text-xs tracking-widest flex justify-between items-center bg-gray-50 p-2 rounded-lg">
            <span>Upcoming Manifest</span>
            <Badge variant="gold" size="xs">{appointments.confirmed.length}</Badge>
          </h3>
          {isLoading ? <Skeleton height="80px" /> : appointments.confirmed.map((apt, i) => <MobileCard key={apt._id} appointment={apt} status="confirmed" index={i} setSelectedApt={setSelectedApt} setShowActionSheet={setShowActionSheet} />)}
          {!isLoading && !appointments.confirmed.length && <p className="text-center text-xs opacity-40 font-bold uppercase py-4">No upcoming bookings</p>}
        </div>
      </div>

      <div className="hidden lg:grid lg:grid-cols-3 lg:gap-6">
        <DesktopCol title="Active Operations" items={appointments.inProgress} status="inProgress" color="success" isLoading={isLoading} setSelectedApt={setSelectedApt} setShowActionSheet={setShowActionSheet} />
        <DesktopCol title="Staging Area" items={appointments.checkedIn} status="checkedIn" color="black" isLoading={isLoading} setSelectedApt={setSelectedApt} setShowActionSheet={setShowActionSheet} />
        <DesktopCol title="Confirmed Manifest" items={appointments.confirmed} status="confirmed" color="gold" isLoading={isLoading} setSelectedApt={setSelectedApt} setShowActionSheet={setShowActionSheet} />
      </div>

      {/* Status Action BottomSheet */}
      <BottomSheet
        isOpen={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        title="Manage Entry"
      >
        {selectedApt && (
          <div className="space-y-5 pb-6">
            <div className="bg-background-cream p-4 rounded-2xl flex items-center justify-between">
              <div>
                <h4 className="font-black text-black uppercase">{selectedApt.customer?.fullName || 'Walk-in'}</h4>
                <p className="text-xs font-bold text-secondary-brown/60">{selectedApt.service?.name?.en}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-black">{selectedApt.scheduledTime}</p>
                <Badge variant={
                  selectedApt.currentStatus === 'inProgress' ? 'success' :
                  selectedApt.currentStatus === 'checkedIn' ? 'black' : 'gold'
                }>{selectedApt.currentStatus}</Badge>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-secondary-brown/50 pl-1">Actions</h5>
              
              {selectedApt.currentStatus === 'confirmed' && (
                <Button 
                  variant="black" 
                  className="w-full h-14 flex items-center justify-center gap-2"
                  onClick={() => handleStatusUpdate(selectedApt._id, 'CHECKED_IN')}
                >
                  <UserIcon className="w-5 h-5" /> Mark Checked In
                </Button>
              )}
              
              {selectedApt.currentStatus === 'checkedIn' && (
                <Button 
                  variant="gold" 
                  className="w-full h-14 flex items-center justify-center gap-2"
                  onClick={() => handleStatusUpdate(selectedApt._id, 'IN_PROGRESS')}
                >
                  <PlayCircleIcon className="w-5 h-5" /> Start Service
                </Button>
              )}
              
              {selectedApt.currentStatus === 'inProgress' && (
                <Button 
                  variant="success" 
                  className="w-full h-14 flex items-center justify-center gap-2"
                  onClick={() => handleStatusUpdate(selectedApt._id, 'COMPLETED')}
                >
                  <CheckCircleIcon className="w-5 h-5" /> Complete Service
                </Button>
              )}
              
              <Button 
                variant="outline" 
                className="w-full h-14 flex flex-col justify-center"
                onClick={() => {
                  setShowActionSheet(false);
                  window.location.href = `/admin/appointments/${selectedApt._id}`; // Simple navigation hack or could redirect
                }}
              >
                <span>Full Details</span>
              </Button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
};

export default AdminQueue;