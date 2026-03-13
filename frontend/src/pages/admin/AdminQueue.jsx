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
  
  const { queue, isLoading } = useSelector((state) => state.admin.queue || {
    appointments: { inProgress: [], checkedIn: [], confirmed: [] },
    stats: { total: 0, inProgress: 0, checkedIn: 0, confirmed: 0, estimatedRevenue: 0 }
  });

  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusNotes, setStatusNotes] = useState('');

  useEffect(() => {
    loadQueue();
    
    // Refresh queue every 30 seconds
    const interval = setInterval(loadQueue, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadQueue = () => {
    dispatch(fetchTodayQueue());
  };

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

    // Don't do anything if dropping in same position
    if (sourceCategory === targetCategory && sourceIndex === targetIndex) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    // Create new order arrays
    const newQueue = { ...queue.appointments };
    
    // Remove from source
    const [movedItem] = newQueue[sourceCategory].splice(sourceIndex, 1);
    
    // Add to target
    newQueue[targetCategory].splice(targetIndex, 0, movedItem);

    // Update queue positions
    const reorderedAppointments = [];
    let position = 1;
    
    // Reorder all categories
    ['inProgress', 'checkedIn', 'confirmed'].forEach(cat => {
      newQueue[cat].forEach(apt => {
        reorderedAppointments.push({
          appointmentId: apt._id,
          newPosition: position++
        });
      });
    });

    try {
      await dispatch(reorderQueue(reorderedAppointments)).unwrap();
      toast.success(t('queue.reordered', 'Queue reordered successfully'));
      loadQueue();
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
      loadQueue();
    } catch (error) {
      toast.error(error || t('common.error'));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CHECKED_IN':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CONFIRMED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'IN_PROGRESS':
        return '🔄';
      case 'CHECKED_IN':
        return '✅';
      case 'CONFIRMED':
        return '⏳';
      default:
        return '📅';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const QueueColumn = ({ title, status, appointments, color, icon }) => (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <h3 className="font-semibold text-gray-700">{title}</h3>
        </div>
        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(status)}`}>
          {appointments.length}
        </span>
      </div>

      <div className="space-y-3 min-h-[400px]">
        {appointments.map((appointment, index) => (
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
            } ${draggedItem?.item._id === appointment._id ? 'opacity-50' : ''}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-medium text-gray-800">{appointment.customer?.fullName}</p>
                <p className="text-xs text-gray-500">{appointment.service?.name?.en}</p>
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
                <span>{appointment.scheduledTime}</span>
              </div>
              {appointment.queuePosition && (
                <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-lg text-xs font-medium">
                  #{appointment.queuePosition}
                </span>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => {
                  setSelectedAppointment(appointment);
                  setShowStatusModal(true);
                }}
                className="flex-1 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {t('common.update', 'Update')}
              </button>
              {appointment.status === 'CHECKED_IN' && (
                <button
                  onClick={() => handleStatusUpdate(appointment._id, 'IN_PROGRESS')}
                  className="flex-1 px-2 py-1 text-xs bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                >
                  {t('queue.start', 'Start')}
                </button>
              )}
              {appointment.status === 'IN_PROGRESS' && (
                <button
                  onClick={() => handleStatusUpdate(appointment._id, 'COMPLETED')}
                  className="flex-1 px-2 py-1 text-xs bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                >
                  {t('queue.complete', 'Complete')}
                </button>
              )}
            </div>
          </div>
        ))}

        {appointments.length === 0 && (
          <div className="bg-white rounded-xl p-8 text-center border-2 border-dashed border-gray-200">
            <p className="text-sm text-gray-400">{t('queue.noAppointments', 'No appointments')}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{t('queue.title')}</h1>
          <p className="text-gray-500 mt-1">{t('admin.manageLiveQueue', 'Manage live queue with drag and drop')}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadQueue}
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {t('common.refresh', 'Refresh')}
          </button>
        </div>
      </div>

      {/* Queue Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500 mb-1">{t('queue.totalInQueue')}</p>
          <p className="text-2xl font-bold text-gray-800">{queue.stats?.total || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500 mb-1">{t('queue.inProgress')}</p>
          <p className="text-2xl font-bold text-green-600">{queue.stats?.inProgress || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500 mb-1">{t('queue.checkedIn')}</p>
          <p className="text-2xl font-bold text-blue-600">{queue.stats?.checkedIn || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500 mb-1">{t('queue.confirmed')}</p>
          <p className="text-2xl font-bold text-yellow-600">{queue.stats?.confirmed || 0}</p>
        </div>
      </div>

      {/* Drag & Drop Queue Columns */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-400">Loading...</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QueueColumn
            title={t('queue.inProgress')}
            status="IN_PROGRESS"
            appointments={queue.appointments?.inProgress || []}
            color="green"
            icon="🔄"
          />
          <QueueColumn
            title={t('queue.checkedIn')}
            status="CHECKED_IN"
            appointments={queue.appointments?.checkedIn || []}
            color="blue"
            icon="✅"
          />
          <QueueColumn
            title={t('queue.confirmed')}
            status="CONFIRMED"
            appointments={queue.appointments?.confirmed || []}
            color="yellow"
            icon="⏳"
          />
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedAppointment && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {t('admin.updateStatus', 'Update Appointment Status')}
              </h3>

              <div className="space-y-4">
                {/* Current Status */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">{t('common.current', 'Current')}</p>
                  <p className="font-medium text-gray-800">{selectedAppointment.customer?.fullName}</p>
                  <p className="text-sm text-gray-600">{selectedAppointment.service?.name?.en} at {selectedAppointment.scheduledTime}</p>
                </div>

                {/* Status Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('common.newStatus', 'New Status')}
                  </label>
                  <select
                    value={selectedAppointment.status}
                    onChange={(e) => setSelectedAppointment({
                      ...selectedAppointment,
                      status: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="CONFIRMED">{t('queue.confirmed')}</option>
                    <option value="CHECKED_IN">{t('queue.checkedIn')}</option>
                    <option value="IN_PROGRESS">{t('queue.inProgress')}</option>
                    <option value="COMPLETED">{t('queue.completed')}</option>
                    <option value="CANCELLED">{t('common.cancelled')}</option>
                    <option value="NO_SHOW">{t('queue.noShow')}</option>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('common.notes', 'Notes')}
                  </label>
                  <textarea
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('admin.notesPlaceholder', 'Add any notes...')}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleStatusUpdate(selectedAppointment._id, selectedAppointment.status)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    {t('common.update', 'Update')}
                  </button>
                  <button
                    onClick={() => {
                      setShowStatusModal(false);
                      setSelectedAppointment(null);
                      setStatusNotes('');
                    }}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    {t('common.cancel', 'Cancel')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-1">{t('queue.dragDropTitle', 'Drag & Drop Queue Management')}</h4>
            <p className="text-sm text-blue-600">
              {t('queue.dragDropInstructions', 'Drag appointments between columns to reorder the queue. Changes are saved automatically.')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminQueue;