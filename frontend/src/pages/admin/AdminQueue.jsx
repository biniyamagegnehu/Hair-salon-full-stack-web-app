import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import {
  fetchTodayQueue,
  updateAppointmentStatus
} from '../../store/slices/adminSlice';
import Skeleton from '../../components/ui/Skeleton/Skeleton';
import BottomSheet from '../../components/ui/BottomSheet/BottomSheet';
import {
  ClockIcon,
  PlayCircleIcon,
  CheckCircleIcon,
  UserIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';


const MobileCard = ({ appointment, status, index, setSelectedApt, setShowActionSheet }) => (
  <div 
    className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 shadow-sm mb-3 flex items-center justify-between cursor-pointer hover:border-zinc-700 transition-colors active:scale-[0.98]"
    onClick={() => {
      setSelectedApt({ ...appointment, currentStatus: status });
      setShowActionSheet(true);
    }}
  >
    <div className="flex items-center gap-3">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${
        status === 'inProgress' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse' :
        status === 'checkedIn' ? 'bg-zinc-800 text-zinc-100 border border-zinc-700' :
        'bg-zinc-950 text-zinc-500 border border-zinc-800/50'
      }`}>
        {appointment.customer?.fullName?.charAt(0) || <UserIcon className="w-6 h-6" />}
      </div>
      <div>
        <h4 className="font-semibold text-zinc-100 uppercase text-sm">{appointment.customer?.fullName || 'Walk-in'}</h4>
        <p className="text-[10px] font-bold text-zinc-500 truncate max-w-[150px]">{appointment.service?.name?.en}</p>
      </div>
    </div>
    
    <div className="flex items-center gap-2">
      <div className="text-right mr-2">
        <p className="text-xs font-bold text-zinc-100">{appointment.scheduledTime}</p>
        <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-500">#{appointment.queuePosition || index + 1}</p>
      </div>
      <button className="w-8 h-8 rounded-full bg-zinc-950 flex items-center justify-center text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors">
        <EllipsisHorizontalIcon className="w-5 h-5" />
      </button>
    </div>
  </div>
);

const DesktopCol = ({ title, items, status, colorClass, isLoading, setSelectedApt, setShowActionSheet }) => (
  <div className="bg-zinc-950/50 rounded-3xl p-4 min-h-[500px] border border-zinc-800/50">
    <div className="flex items-center justify-between mb-4 px-2">
      <h3 className="font-bold text-zinc-300 uppercase text-xs tracking-widest">{title}</h3>
      <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${colorClass}`}>
        {items.length}
      </div>
    </div>
    <div className="space-y-3">
      {isLoading && !items.length ? (
         <div className="h-20 bg-zinc-900 rounded-2xl animate-pulse"></div>
      ) : items.length > 0 ? (
        items.map((apt, i) => <MobileCard key={apt._id} appointment={apt} status={status} index={i} setSelectedApt={setSelectedApt} setShowActionSheet={setShowActionSheet} />)
      ) : (
        <div className="py-12 flex items-center justify-center border-2 border-dashed border-zinc-800/50 rounded-2xl">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Empty Queue</p>
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

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6 lg:mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-zinc-50 tracking-tight">Today's Queue</h1>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Live Floor Monitor</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="px-4 h-[44px] bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex flex-1 lg:flex-none items-center justify-center gap-2 shadow-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Live Sync</span>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4 lg:grid lg:grid-cols-4 lg:pb-8">
        <div className="flex-none w-36 lg:w-auto bg-zinc-950 border border-zinc-800/50 rounded-2xl p-5 flex flex-col justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Total</p>
          <p className="text-3xl font-bold text-zinc-100 mt-2">{stats.total || 0}</p>
        </div>
        <div className="flex-none w-36 lg:w-auto bg-amber-500/5 border border-amber-500/10 rounded-2xl p-5 flex flex-col justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500">In Progress</p>
          <p className="text-3xl font-bold text-amber-500 mt-2">{stats.inProgress || 0}</p>
        </div>
        <div className="flex-none w-36 lg:w-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Checked In</p>
          <p className="text-3xl font-bold text-zinc-100 mt-2">{stats.checkedIn || 0}</p>
        </div>
        <div className="flex-none w-36 lg:w-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Scheduled</p>
          <p className="text-3xl font-bold text-zinc-400 mt-2">{stats.confirmed || 0}</p>
        </div>
      </div>

      {/* Mobile Accordion View vs Desktop Kanban */}
      <div className="lg:hidden space-y-6">
        {/* In Progress */}
        <div className="space-y-3">
          <h3 className="font-bold text-zinc-300 uppercase text-xs tracking-widest flex justify-between items-center bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/50">
            <span>In Progress</span>
            <div className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500">{appointments.inProgress.length}</div>
          </h3>
          {isLoading ? <div className="h-20 bg-zinc-900 rounded-2xl animate-pulse"></div> : appointments.inProgress.map((apt, i) => <MobileCard key={apt._id} appointment={apt} status="inProgress" index={i} setSelectedApt={setSelectedApt} setShowActionSheet={setShowActionSheet} />)}
          {!isLoading && !appointments.inProgress.length && <p className="text-center text-xs opacity-40 font-bold uppercase py-4 text-zinc-500">None active</p>}
        </div>

        {/* Checked In */}
        <div className="space-y-3">
          <h3 className="font-bold text-zinc-300 uppercase text-xs tracking-widest flex justify-between items-center bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/50">
            <span>Checked In & Waiting</span>
            <div className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-300">{appointments.checkedIn.length}</div>
          </h3>
          {isLoading ? <div className="h-20 bg-zinc-900 rounded-2xl animate-pulse"></div> : appointments.checkedIn.map((apt, i) => <MobileCard key={apt._id} appointment={apt} status="checkedIn" index={i} setSelectedApt={setSelectedApt} setShowActionSheet={setShowActionSheet} />)}
          {!isLoading && !appointments.checkedIn.length && <p className="text-center text-xs opacity-40 font-bold uppercase py-4 text-zinc-500">Queue empty</p>}
        </div>

        {/* Confirmed */}
        <div className="space-y-3 pb-8">
          <h3 className="font-bold text-zinc-300 uppercase text-xs tracking-widest flex justify-between items-center bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/50">
            <span>Upcoming Manifest</span>
            <div className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-900 text-zinc-500 border border-zinc-800">{appointments.confirmed.length}</div>
          </h3>
          {isLoading ? <div className="h-20 bg-zinc-900 rounded-2xl animate-pulse"></div> : appointments.confirmed.map((apt, i) => <MobileCard key={apt._id} appointment={apt} status="confirmed" index={i} setSelectedApt={setSelectedApt} setShowActionSheet={setShowActionSheet} />)}
          {!isLoading && !appointments.confirmed.length && <p className="text-center text-xs opacity-40 font-bold uppercase py-4 text-zinc-500">No upcoming bookings</p>}
        </div>
      </div>

      <div className="hidden lg:grid lg:grid-cols-3 lg:gap-6">
        <DesktopCol title="Active Operations" items={appointments.inProgress} status="inProgress" colorClass="bg-amber-500/10 text-amber-500" isLoading={isLoading} setSelectedApt={setSelectedApt} setShowActionSheet={setShowActionSheet} />
        <DesktopCol title="Staging Area" items={appointments.checkedIn} status="checkedIn" colorClass="bg-zinc-800 text-zinc-300" isLoading={isLoading} setSelectedApt={setSelectedApt} setShowActionSheet={setShowActionSheet} />
        <DesktopCol title="Confirmed Manifest" items={appointments.confirmed} status="confirmed" colorClass="bg-zinc-900 text-zinc-500 border border-zinc-800" isLoading={isLoading} setSelectedApt={setSelectedApt} setShowActionSheet={setShowActionSheet} />
      </div>

      {/* Status Action BottomSheet */}
      <BottomSheet
        isOpen={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        title="Manage Entry"
      >
        {selectedApt && (
          <div className="space-y-5 pb-6">
            <div className="bg-zinc-900 p-4 rounded-2xl flex items-center justify-between border border-zinc-800">
              <div>
                <h4 className="font-bold text-zinc-100 uppercase">{selectedApt.customer?.fullName || 'Walk-in'}</h4>
                <p className="text-xs font-bold text-zinc-400">{selectedApt.service?.name?.en}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-zinc-100">{selectedApt.scheduledTime}</p>
                <div className={`mt-1 inline-flex px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${
                  selectedApt.currentStatus === 'inProgress' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                  selectedApt.currentStatus === 'checkedIn' ? 'bg-zinc-800 text-zinc-300 border border-zinc-700' : 'bg-zinc-950 text-zinc-500 border border-zinc-800'
                }`}>{selectedApt.currentStatus}</div>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 pl-1">Actions</h5>
              
              {selectedApt.currentStatus === 'confirmed' && (
                <button 
                  className="w-full h-14 bg-zinc-100 text-zinc-900 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-white active:scale-[0.98] transition-all"
                  onClick={() => handleStatusUpdate(selectedApt._id, 'CHECKED_IN')}
                >
                  <UserIcon className="w-5 h-5" /> Mark Checked In
                </button>
              )}
              
              {selectedApt.currentStatus === 'checkedIn' && (
                <button 
                  className="w-full h-14 bg-amber-500 text-zinc-950 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-amber-400 active:scale-[0.98] transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                  onClick={() => handleStatusUpdate(selectedApt._id, 'IN_PROGRESS')}
                >
                  <PlayCircleIcon className="w-5 h-5" /> Start Service
                </button>
              )}
              
              {selectedApt.currentStatus === 'inProgress' && (
                <button 
                  className="w-full h-14 bg-emerald-500 text-zinc-950 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-400 active:scale-[0.98] transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  onClick={() => handleStatusUpdate(selectedApt._id, 'COMPLETED')}
                >
                  <CheckCircleIcon className="w-5 h-5" /> Complete Service
                </button>
              )}
              
              <button 
                className="w-full h-14 bg-transparent border border-zinc-800 text-zinc-400 rounded-xl font-bold text-sm flex flex-col items-center justify-center hover:bg-zinc-900 hover:text-zinc-300 active:scale-[0.98] transition-all"
                onClick={() => {
                  setShowActionSheet(false);
                  window.location.href = `/admin/appointments/${selectedApt._id}`;
                }}
              >
                <span>Full Details</span>
              </button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
};

export default AdminQueue;
