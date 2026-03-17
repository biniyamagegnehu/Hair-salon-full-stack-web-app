import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import {
  fetchTodayQueue,
  updateAppointmentStatus,
  reorderQueue
} from '../../store/slices/adminSlice';
import Card, { CardHeader, CardBody } from '../../components/ui/Card/Card';
import Badge from '../../components/ui/Badge/Badge';
import Button from '../../components/ui/Button/Button';
import Skeleton from '../../components/ui/Skeleton/Skeleton';
import './AdminPages.css';

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
    confirmed: 0, 
    estimatedRevenue: 0 
  };
  const isLoading = adminState.isLoading || false;

  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);

  useEffect(() => {
    dispatch(fetchTodayQueue());
    const interval = setInterval(() => {
      dispatch(fetchTodayQueue());
    }, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const handleDragStart = (e, item, category, index) => {
    setDraggedItem({ item, category, index });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, category, index) => {
    e.preventDefault();
    setDragOverItem({ category, index });
  };

  const handleDrop = async (e, targetCategory, targetIndex) => {
    e.preventDefault();
    if (!draggedItem) return;

    const { item, category: sourceCategory, index: sourceIndex } = draggedItem;
    if (sourceCategory === targetCategory && sourceIndex === targetIndex) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    const newInProgress = [...(appointments.inProgress || [])];
    const newCheckedIn = [...(appointments.checkedIn || [])];
    const newConfirmed = [...(appointments.confirmed || [])];
    
    let movedItem;
    if (sourceCategory === 'inProgress') movedItem = newInProgress.splice(sourceIndex, 1)[0];
    else if (sourceCategory === 'checkedIn') movedItem = newCheckedIn.splice(sourceIndex, 1)[0];
    else if (sourceCategory === 'confirmed') movedItem = newConfirmed.splice(sourceIndex, 1)[0];
    
    if (!movedItem) return;
    
    if (targetCategory === 'inProgress') newInProgress.splice(targetIndex, 0, movedItem);
    else if (targetCategory === 'checkedIn') newCheckedIn.splice(targetIndex, 0, movedItem);
    else if (targetCategory === 'confirmed') newConfirmed.splice(targetIndex, 0, movedItem);

    const reorderedAppointments = [];
    let position = 1;
    [...newInProgress, ...newCheckedIn, ...newConfirmed].forEach(apt => {
      reorderedAppointments.push({
        appointmentId: apt._id,
        newPosition: position++
      });
    });

    try {
      await dispatch(reorderQueue(reorderedAppointments)).unwrap();
      toast.success(t('queue.reordered', 'Operations sequence updated'));
      dispatch(fetchTodayQueue());
    } catch (error) {
      toast.error(error || t('common.error'));
    }

    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await dispatch(updateAppointmentStatus({
        appointmentId: id,
        status: status,
        notes: 'Protocol automation update'
      })).unwrap();
      toast.success('Status synchronized');
      dispatch(fetchTodayQueue());
    } catch (error) {
      toast.error(error || t('common.error'));
    }
  };

  const QueueItem = ({ appointment, status, index }) => (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, appointment, status, index)}
      onDragOver={(e) => handleDragOver(e, status, index)}
      onDrop={(e) => handleDrop(e, status, index)}
      className={`bg-white rounded-xl p-5 border-2 transition-all cursor-grab active:cursor-grabbing mb-4 group ${
        dragOverItem?.category === status && dragOverItem?.index === index
          ? 'border-gold bg-gold/5 scale-[1.02]'
          : 'border-border-primary hover:border-black hover:shadow-xl'
      } ${draggedItem?.item?._id === appointment._id ? 'opacity-20 grayscale scale-95' : ''}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-black text-black uppercase text-sm tracking-tighter group-hover:text-gold transition-colors">
            {appointment.customer?.fullName || 'Anonymous Resident'}
          </h4>
          <p className="text-[10px] font-black text-secondary-brown opacity-40 uppercase tracking-widest mt-0.5">
            {appointment.service?.name?.en || 'Standard Operation'}
          </p>
        </div>
        <Badge variant="dark" size="xs">#{appointment.queuePosition || index + 1}</Badge>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-background-cream flex items-center justify-center border border-border-primary">
            <span className="text-xs">⌚</span>
          </div>
          <p className="text-xs font-black text-black">{appointment.scheduledTime || 'ON CALL'}</p>
        </div>
        <div className="flex gap-1">
          {status === 'confirmed' && (
            <button 
              onClick={() => handleStatusUpdate(appointment._id, 'CHECKED_IN')}
              className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center hover:bg-gold transition-colors text-xs"
              title="Check In"
            >✓</button>
          )}
          {status === 'checkedIn' && (
            <button 
              onClick={() => handleStatusUpdate(appointment._id, 'IN_PROGRESS')}
              className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center hover:bg-gold transition-colors text-xs"
              title="Start Session"
            >▶</button>
          )}
          {status === 'inProgress' && (
            <button 
              onClick={() => handleStatusUpdate(appointment._id, 'COMPLETED')}
              className="w-8 h-8 bg-success text-white rounded-lg flex items-center justify-center hover:bg-black transition-colors text-xs"
              title="Finalize"
            >🏁</button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-page animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
        <div>
          <Badge variant="gold" className="mb-4">Real-Time Operations</Badge>
          <h1 className="text-5xl font-black text-black uppercase tracking-tight">Studio Monitor</h1>
          <p className="text-secondary-brown font-bold opacity-40 mt-1">Live tactical deployment and floor control</p>
        </div>
        <div className="flex gap-3">
          <div className="px-6 py-3 bg-zinc-900 rounded-2xl border border-white/5 flex items-center gap-4">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse shadow-[0_0_10px_rgba(0,255,0,0.5)]" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">System Link Active</span>
          </div>
        </div>
      </div>

      {/* Logistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <Card variant="black" className="relative group overflow-hidden">
          <div className="absolute right-0 bottom-0 text-6xl opacity-10 translate-x-4 translate-y-4">👥</div>
          <CardBody className="p-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Total Manifest</p>
            <p className="text-4xl font-black text-white">{stats.total || 0}</p>
          </CardBody>
        </Card>
        <Card className="relative group overflow-hidden">
          <div className="absolute right-0 bottom-0 text-6xl opacity-5 translate-x-4 translate-y-4">🔄</div>
          <CardBody className="p-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-secondary-brown opacity-40 mb-1">Active Now</p>
            <p className="text-4xl font-black text-success">{stats.inProgress || 0}</p>
          </CardBody>
        </Card>
        <Card className="relative group overflow-hidden">
          <div className="absolute right-0 bottom-0 text-6xl opacity-5 translate-x-4 translate-y-4">✅</div>
          <CardBody className="p-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-secondary-brown opacity-40 mb-1">Staging Area</p>
            <p className="text-4xl font-black text-blue-600">{stats.checkedIn || 0}</p>
          </CardBody>
        </Card>
        <Card className="relative group overflow-hidden">
          <div className="absolute right-0 bottom-0 text-6xl opacity-5 translate-x-4 translate-y-4">⏳</div>
          <CardBody className="p-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-secondary-brown opacity-40 mb-1">Confirmed</p>
            <p className="text-4xl font-black text-gold">{stats.confirmed || 0}</p>
          </CardBody>
        </Card>
      </div>

      {/* Performance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Sector */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-black text-black uppercase text-sm tracking-widest">Execution Tier</h3>
            <Badge variant="success" size="xs">Live Now</Badge>
          </div>
          <div className="bg-background-cream/30 p-4 rounded-3xl border-2 border-dashed border-border-primary min-h-[600px] transition-colors hover:bg-background-cream/50">
            {isLoading && !appointments.inProgress.length ? (
              <Skeleton height="150px" variant="rectangle" className="mb-4" />
            ) : appointments.inProgress?.length > 0 ? (
              appointments.inProgress.map((apt, i) => (
                <QueueItem key={apt._id} appointment={apt} status="inProgress" index={i} />
              ))
            ) : (
              <div className="py-24 text-center">
                <p className="text-[10px] font-black text-secondary-brown opacity-30 uppercase tracking-widest">Tier Vacant</p>
              </div>
            )}
          </div>
        </div>

        {/* Staging Sector */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-black text-black uppercase text-sm tracking-widest">Staging Area</h3>
            <Badge variant="dark" size="xs">Checked In</Badge>
          </div>
          <div className="bg-background-cream/30 p-4 rounded-3xl border-2 border-dashed border-border-primary min-h-[600px] transition-colors hover:bg-background-cream/50">
            {isLoading && !appointments.checkedIn.length ? (
              <Skeleton height="150px" variant="rectangle" className="mb-4" />
            ) : appointments.checkedIn?.length > 0 ? (
              appointments.checkedIn.map((apt, i) => (
                <QueueItem key={apt._id} appointment={apt} status="checkedIn" index={i} />
              ))
            ) : (
              <div className="py-24 text-center">
                <p className="text-[10px] font-black text-secondary-brown opacity-30 uppercase tracking-widest">Staging Empty</p>
              </div>
            )}
          </div>
        </div>

        {/* Confirmed Sector */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-black text-black uppercase text-sm tracking-widest">Confirmed Manifest</h3>
            <Badge variant="gold" size="xs">Awaiting Entry</Badge>
          </div>
          <div className="bg-background-cream/30 p-4 rounded-3xl border-2 border-dashed border-border-primary min-h-[600px] transition-colors hover:bg-background-cream/50">
            {isLoading && !appointments.confirmed.length ? (
              <Skeleton height="150px" variant="rectangle" className="mb-4" />
            ) : appointments.confirmed?.length > 0 ? (
              appointments.confirmed.map((apt, i) => (
                <QueueItem key={apt._id} appointment={apt} status="confirmed" index={i} />
              ))
            ) : (
              <div className="py-24 text-center">
                <p className="text-[10px] font-black text-secondary-brown opacity-30 uppercase tracking-widest">Manifest Clear</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminQueue;