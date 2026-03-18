import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useSocket } from '../../contexts/SocketContext';
import { toast } from 'react-hot-toast';
import { 
  fetchQueueStatus, 
  checkInToAppointment,
  clearQueueError,
  updateQueueData
} from '../../store/slices/queueSlice';
import { fetchMyAppointments } from '../../store/slices/appointmentSlice';
import Button from '../../components/ui/Button/Button';
import Card, { CardBody } from '../../components/ui/Card/Card';
import Badge from '../../components/ui/Badge/Badge';
import Tabs, { TabList, TabTrigger, TabContent } from '../../components/ui/Tabs/Tabs';
import Modal, { ModalHeader, ModalContent, ModalFooter } from '../../components/ui/Modal/Modal';
import './QueuePage.css';

const QueuePage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isConnected, onQueueUpdate, onAppointmentUpdate, onCheckInConfirmed } = useSocket();
  const { queue, stats, lastUpdated, isLoading, error } = useSelector((state) => state.queue);
  const { appointments } = useSelector((state) => state.appointments);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  const [activeTab, setActiveTab] = useState('live');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Initial fetch
  useEffect(() => {
    dispatch(fetchQueueStatus());
  }, [dispatch]);

  // WebSocket real-time updates
  useEffect(() => {
    const unsubscribeQueue = onQueueUpdate((data) => {
      dispatch(updateQueueData(data));
    });

    const unsubscribeAppointment = onAppointmentUpdate((data) => {
      dispatch(fetchMyAppointments());
      
      if (data.status === 'IN_PROGRESS') {
        toast.success(t('queue.appointmentStarted', 'Your appointment has started!'), {
          icon: '🔄',
          duration: 5000
        });
      } else if (data.status === 'COMPLETED') {
        toast.success(t('queue.appointmentCompleted', 'Your appointment is completed! Thank you!'), {
          icon: '✓',
          duration: 5000
        });
      }
    });

    const unsubscribeCheckIn = onCheckInConfirmed((data) => {
      setShowSuccessMessage(true);
      toast.success(t('queue.checkInSuccess', 'Successfully checked in!'), {
        icon: '✅',
        duration: 4000
      });
      setTimeout(() => setShowSuccessMessage(false), 3000);
    });

    return () => {
      unsubscribeQueue();
      unsubscribeAppointment();
      unsubscribeCheckIn();
    };
  }, [onQueueUpdate, onAppointmentUpdate, onCheckInConfirmed, dispatch, t]);

  // Fallback polling
  useEffect(() => {
    if (!isConnected) {
      const interval = setInterval(() => {
        dispatch(fetchQueueStatus());
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isConnected, dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchMyAppointments());
    }
  }, [dispatch, isAuthenticated]);

  const handleCheckIn = async (appointmentId) => {
    setCheckInLoading(true);
    try {
      const result = await dispatch(checkInToAppointment(appointmentId));
      if (checkInToAppointment.fulfilled.match(result)) {
        setSelectedAppointment(null);
      } else if (checkInToAppointment.rejected.match(result)) {
        toast.error(result.payload || t('common.error'));
      }
    } catch (error) {
      toast.error(t('common.error'));
    } finally {
      setCheckInLoading(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (e) {
      return '';
    }
  };

  // Filter appointments
  const todaysAppointments = appointments.filter(apt => {
    if (!apt.scheduledDate) return false;
    const aptDate = new Date(apt.scheduledDate);
    const today = new Date();
    return aptDate.toDateString() === today.toDateString() && 
           ['CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS', 'PENDING_PAYMENT'].includes(apt.status);
  });

  const canCheckIn = (appointment) => {
    if (appointment.status !== 'CONFIRMED') return false;
    const now = new Date();
    const appointmentTime = new Date(appointment.scheduledDate);
    const [hours, minutes] = appointment.scheduledTime.split(':').map(Number);
    appointmentTime.setHours(hours, minutes, 0, 0);
    const minutesUntil = (appointmentTime - now) / (1000 * 60);
    return minutesUntil <= 30 && minutesUntil >= -15;
  };

  return (
    <div className="queue-page animate-fade-in">
      <div className="container">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <Badge variant={isConnected ? 'success' : 'error'} className="mb-4">
              {isConnected ? 'LIVE CONNECTION' : 'POLLING MODE'}
            </Badge>
            <h1 className="text-5xl font-black text-black leading-tight">Live Salon Queue</h1>
            <p className="text-secondary-brown opacity-60 font-medium">Real-time status of our master barbers at work.</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-black uppercase tracking-widest opacity-40 mb-1">Last Sync</p>
            <p className="text-lg font-bold">{lastUpdated ? formatTime(lastUpdated) : '--:--'}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-white border-2 border-border-primary rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300">
            <span className="text-4xl block mb-4">👥</span>
            <span className="text-4xl font-black text-black block mb-1">{stats.totalInQueue || 0}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-secondary-brown opacity-40">Total in Queue</span>
          </div>
          <div className="bg-white border-2 border-gold rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300">
            <span className="text-4xl block mb-4">✂️</span>
            <span className="text-4xl font-black text-gold block mb-1">{stats.inProgress || 0}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-secondary-brown opacity-40">Being Served</span>
          </div>
          <div className="bg-white border-2 border-border-primary rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300">
            <span className="text-4xl block mb-4">📅</span>
            <span className="text-4xl font-black text-black block mb-1">{stats.checkedIn || 0}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-secondary-brown opacity-40">Checked In</span>
          </div>
          <div className="bg-white border-2 border-border-primary rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300">
            <span className="text-4xl block mb-4">⏰</span>
            <span className="text-4xl font-black text-black block mb-1">{stats.estimatedCurrentWait || 0}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-secondary-brown opacity-40">Avg. Wait (Min)</span>
          </div>
        </div>

        {/* My Current Status (If serving today) */}
        {isAuthenticated && todaysAppointments.length > 0 && (
          <div className="bg-black text-white rounded-[40px] p-10 lg:p-16 mb-16 relative overflow-hidden shadow-2xl animate-slide-up">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
              <span className="text-gold">Your</span> Status Today
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              <div className="position-display">
                <p className="text-xs uppercase font-black tracking-widest opacity-60 mb-2">Queue Position</p>
                <p className="position-num">{todaysAppointments[0].queuePosition || '—'}</p>
              </div>
              <div className="lg:col-span-2">
                <h3 className="text-xl font-bold mb-2">{todaysAppointments[0].service?.name?.en}</h3>
                <p className="opacity-70 mb-6">Scheduled for {todaysAppointments[0].scheduledTime}</p>
                
                {canCheckIn(todaysAppointments[0]) && (
                  <div className="check-in-window">
                    <p className="font-bold">You are at the salon? Check in now to join the live queue!</p>
                    <Button variant="black" onClick={() => setSelectedAppointment(todaysAppointments[0])}>
                      Check In Now
                    </Button>
                  </div>
                )}
                
                {todaysAppointments[0].status === 'CHECKED_IN' && (
                  <div className="bg-white/10 p-4 rounded-lg border border-gold/30">
                    <p className="font-bold text-gold">✓ You are checked in and in the live queue.</p>
                    <p className="text-sm opacity-60">Please stay in the lounge. We'll call your name soon.</p>
                  </div>
                )}

                {todaysAppointments[0].status === 'IN_PROGRESS' && (
                  <div className="bg-success/20 p-4 rounded-lg border border-success/30">
                    <p className="font-bold text-white animate-pulse">✨ Your transformation is currently in progress!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Queue Table */}
        <div className="queue-table-container">
          <div className="queue-header">
            <h2 className="text-xl font-black uppercase tracking-widest">Live Live Flow</h2>
            <span className="text-xs font-bold opacity-60">Current Status</span>
          </div>
          
          {queue.length === 0 ? (
            <div className="py-20 text-center">
              <span className="text-6xl block mb-6">🪑</span>
              <p className="text-xl font-bold opacity-40">The lounge is currently empty.</p>
              <Button variant="gold" className="mt-6" onClick={() => window.location.href = '/booking'}>
                Book a Session
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border-primary/50">
              {queue.map((item, index) => (
                <div key={item._id} className={`flex items-center gap-6 p-8 transition-all duration-300 ${item.status === 'IN_PROGRESS' ? 'bg-gold/5' : 'hover:bg-cream'}`}>
                  <div className="text-2xl font-black text-secondary-brown opacity-20 w-8">{index + 1}</div>
                  <div className="flex-1">
                    <h3 className="font-black text-xl text-black uppercase tracking-tight">
                      {item.customer?.fullName || 'Valued Customer'}
                    </h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-secondary-brown opacity-40">
                      {item.service?.name?.en} • {item.scheduledTime}
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <Badge variant={
                      item.status === 'IN_PROGRESS' ? 'success' : 
                      item.status === 'CHECKED_IN' ? 'gold' : 'brown'
                    }>
                      {item.status.replace('_', ' ')}
                    </Badge>
                    {item.estimatedWaitTime > 0 && item.status !== 'IN_PROGRESS' && (
                      <span className="text-[10px] font-black text-gold uppercase tracking-widest">
                        ~{item.estimatedWaitTime} MIN WAIT
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Check-in Modal */}
      {selectedAppointment && (
        <Modal isOpen={!!selectedAppointment} onClose={() => setSelectedAppointment(null)}>
          <ModalHeader>Confirm Check-In</ModalHeader>
          <ModalContent>
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-cream rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-gold text-4xl">
                📍
              </div>
              <p className="text-lg font-bold mb-2">Ready for your transformation?</p>
              <p className="opacity-60">Checking in confirms you are physically at the salon and ready to be served.</p>
            </div>
          </ModalContent>
          <ModalFooter>
            <Button variant="outline" onClick={() => setSelectedAppointment(null)}>Not Yet</Button>
            <Button 
              variant="gold" 
              loading={checkInLoading} 
              onClick={() => handleCheckIn(selectedAppointment.id)}
            >
              I Am Here
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
};

export default QueuePage;