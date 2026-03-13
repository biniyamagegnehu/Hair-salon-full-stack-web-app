import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import {
  fetchTodayQueue,
  updateAppointmentStatus,
  reorderQueue
} from '../../store/slices/adminSlice';

const AdminQueue = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  // Safely get state with defaults
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

  console.log('AdminQueue - Appointments:', appointments);

  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusNotes, setStatusNotes] = useState('');

  useEffect(() => {
    console.log('AdminQueue - Loading queue data');
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

    // Create new order arrays
    const newInProgress = [...(appointments.inProgress || [])];
    const newCheckedIn = [...(appointments.checkedIn || [])];
    const newConfirmed = [...(appointments.confirmed || [])];
    
    let movedItem;
    
    // Remove from source
    if (sourceCategory === 'inProgress') movedItem = newInProgress.splice(sourceIndex, 1)[0];
    else if (sourceCategory === 'checkedIn') movedItem = newCheckedIn.splice(sourceIndex, 1)[0];
    else if (sourceCategory === 'confirmed') movedItem = newConfirmed.splice(sourceIndex, 1)[0];
    
    if (!movedItem) return;
    
    // Add to target
    if (targetCategory === 'inProgress') newInProgress.splice(targetIndex, 0, movedItem);
    else if (targetCategory === 'checkedIn') newCheckedIn.splice(targetIndex, 0, movedItem);
    else if (targetCategory === 'confirmed') newConfirmed.splice(targetIndex, 0, movedItem);

    // Update queue positions
    const reorderedAppointments = [];
    let position = 1;
    
    newInProgress.forEach(apt => {
      reorderedAppointments.push({
        appointmentId: apt._id,
        newPosition: position++
      });
    });
    
    newCheckedIn.forEach(apt => {
      reorderedAppointments.push({
        appointmentId: apt._id,
        newPosition: position++
      });
    });
    
    newConfirmed.forEach(apt => {
      reorderedAppointments.push({
        appointmentId: apt._id,
        newPosition: position++
      });
    });

    try {
      await dispatch(reorderQueue(reorderedAppointments)).unwrap();
      toast.success(t('queue.reordered', 'Queue reordered successfully'));
      dispatch(fetchTodayQueue());
    } catch (error) {
      toast.error(error || t('common.error'));
    }

    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await dispatch(updateAppointmentStatus({
        appointmentId,
        status: newStatus,
        notes: statusNotes
      })).unwrap();
      toast.success(t('common.success'));
      setShowStatusModal(false);
      setSelectedAppointment(null);
      setStatusNotes('');
      dispatch(fetchTodayQueue());
    } catch (error) {
      toast.error(error || t('common.error'));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'IN_PROGRESS': return 'bg-green-100 text-green-800';
      case 'CHECKED_IN': return 'bg-blue-100 text-blue-800';
      case 'CONFIRMED': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'IN_PROGRESS': return '🔄';
      case 'CHECKED_IN': return '✅';
      case 'CONFIRMED': return '⏳';
      default: return '📅';
    }
  };

  const QueueColumn = ({ title, status, items, icon }) => (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <h3 className="font-semibold text-gray-700">{title}</h3>
        </div>
        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(status)}`}>
          {items?.length || 0}
        </span>
      </div>

      <div className="space-y-3 min-h-[400px]">
        {items && items.length > 0 ? items.map((appointment, index) => (
          <div
            key={appointment._id}
            draggable
            onDragStart={(e) => handleDragStart(e, appointment, status, index)}
            onDragOver={(e) => handleDragOver(e, status, index)}
            onDrop={(e) => handleDrop(e, status, index)}
            className={`bg-white rounded-xl p-4 shadow-sm border-2 transition-all cursor-move ${
              dragOverItem?.category === status && dragOverItem?.index === index
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-100 hover:border-blue-200 hover:shadow-md'
            } ${draggedItem?.item?._id === appointment._id ? 'opacity-50' : ''}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-medium text-gray-800">{appointment.customer?.fullName || 'Unknown'}</p>
                <p className="text-xs text-gray-500">{appointment.service?.name?.en || 'Service'}</p>
              </div>
              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(appointment.status)}`}>
                {getStatusIcon(appointment.status)} {appointment.status}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{appointment.scheduledTime || '--:--'}</span>
              </div>
              {appointment.queuePosition && (
                <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-lg text-xs font-medium">
                  #{appointment.queuePosition}
                </span>
              )}
            </div>
          </div>
        )) : (
          <div className="bg-white rounded-xl p-8 text-center border-2 border-dashed border-gray-200">
            <p className="text-sm text-gray-400">{t('queue.noAppointments', 'No appointments')}</p>
          </div>
        )}
      </div>
    </div>
  );

  // If still loading, show spinner
  if (isLoading && !appointments.inProgress.length && !appointments.checkedIn.length && !appointments.confirmed.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">{t('queue.title', 'Queue Management')}</h1>
        <p className="text-gray-500 mt-1">{t('admin.manageLiveQueue', 'Manage live queue')}</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500 mb-1">{t('queue.totalInQueue')}</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500 mb-1">{t('queue.inProgress')}</p>
          <p className="text-2xl font-bold text-green-600">{stats.inProgress || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500 mb-1">{t('queue.checkedIn')}</p>
          <p className="text-2xl font-bold text-blue-600">{stats.checkedIn || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500 mb-1">{t('queue.confirmed')}</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.confirmed || 0}</p>
        </div>
      </div>

      {/* Queue Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QueueColumn
          title={t('queue.inProgress')}
          status="inProgress"
          items={appointments.inProgress || []}
          icon="🔄"
        />
        <QueueColumn
          title={t('queue.checkedIn')}
          status="checkedIn"
          items={appointments.checkedIn || []}
          icon="✅"
        />
        <QueueColumn
          title={t('queue.confirmed')}
          status="confirmed"
          items={appointments.confirmed || []}
          icon="⏳"
        />
      </div>
    </div>
  );
};

export default AdminQueue;