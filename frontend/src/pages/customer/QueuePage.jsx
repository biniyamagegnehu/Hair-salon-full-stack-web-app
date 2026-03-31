import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useSocket } from '../../contexts/SocketContext';
import { toast } from 'react-hot-toast';
import {
  CheckCircleIcon,
  ClockIcon,
  SignalIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import {
  fetchQueueStatus,
  checkInToAppointment,
  updateQueueData
} from '../../store/slices/queueSlice';
import { fetchMyAppointments } from '../../store/slices/appointmentSlice';

const primaryButton = 'bg-[#0F0F0F] text-white px-6 py-3 rounded-lg hover:bg-[#2A2A2A] transition-all duration-300 font-medium shadow-md hover:shadow-lg';
const goldButton = 'bg-[#C9A227] text-[#0F0F0F] px-6 py-3 rounded-lg hover:bg-[#DAA520] transition-all duration-300 font-medium shadow-md';
const outlineButton = 'border-2 border-[#C9A227] text-[#C9A227] px-6 py-3 rounded-lg hover:bg-[#C9A227] hover:text-[#0F0F0F] transition-all duration-300';

const statusBadge = (status) => {
  if (status === 'IN_PROGRESS') return 'bg-[#C9A227] text-[#0F0F0F]';
  if (status === 'CHECKED_IN') return 'bg-[#3B2F2F] text-white';
  return 'bg-[#0F0F0F] text-white';
};

const QueuePage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isConnected, onQueueUpdate, onAppointmentUpdate, onCheckInConfirmed } = useSocket();
  const { queue, stats, lastUpdated } = useSelector((state) => state.queue);
  const { appointments } = useSelector((state) => state.appointments);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [checkInLoading, setCheckInLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchQueueStatus());
  }, [dispatch]);

  useEffect(() => {
    const unsubscribeQueue = onQueueUpdate((data) => {
      dispatch(updateQueueData(data));
    });

    const unsubscribeAppointment = onAppointmentUpdate((data) => {
      dispatch(fetchMyAppointments());

      if (data.status === 'IN_PROGRESS') {
        toast.success(t('queue.appointmentStarted', 'Your appointment has started!'));
      } else if (data.status === 'COMPLETED') {
        toast.success(t('queue.appointmentCompleted', 'Your appointment is completed! Thank you!'));
      }
    });

    const unsubscribeCheckIn = onCheckInConfirmed(() => {
      toast.success(t('queue.checkInSuccess', 'Successfully checked in!'));
    });

    return () => {
      unsubscribeQueue();
      unsubscribeAppointment();
      unsubscribeCheckIn();
    };
  }, [onQueueUpdate, onAppointmentUpdate, onCheckInConfirmed, dispatch, t]);

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

  const todaysAppointments = appointments.filter((appointment) => {
    if (!appointment.scheduledDate) return false;
    const aptDate = new Date(appointment.scheduledDate);
    const today = new Date();
    return aptDate.toDateString() === today.toDateString() &&
      ['CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS', 'PENDING_PAYMENT'].includes(appointment.status);
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

  const myAppointment = todaysAppointments[0];

  return (
    <div className="space-y-8 lg:space-y-10">
      <section className="rounded-[32px] border border-black/5 bg-white px-6 py-10 shadow-sm sm:px-8 lg:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${isConnected ? 'bg-[#C9A227] text-[#0F0F0F]' : 'bg-[#3B2F2F] text-white'}`}>
              {isConnected ? 'Live connection' : 'Polling mode'}
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-[-0.05em] text-[#0F0F0F] sm:text-5xl">Real-time queue visibility with a cleaner salon flow.</h1>
            <p className="mt-4 text-base leading-8 text-gray-700">
              Track the live queue, see average wait conditions, and check yourself in when it is time to join the active line.
            </p>
          </div>
          <div className="rounded-2xl bg-[#F8F4EC] px-5 py-4">
            <p className="text-sm font-medium text-[#3B2F2F]/60">Last synced</p>
            <p className="mt-1 text-2xl font-bold tracking-[-0.03em] text-[#0F0F0F]">{lastUpdated ? formatTime(lastUpdated) : '--:--'}</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: 'Total in queue', value: stats.totalInQueue || 0, icon: UserGroupIcon },
            { label: 'Being served', value: stats.inProgress || 0, icon: SignalIcon },
            { label: 'Checked in', value: stats.checkedIn || 0, icon: CheckCircleIcon },
            { label: 'Avg. wait min', value: stats.estimatedCurrentWait || 0, icon: ClockIcon }
          ].map((item, index) => (
            <article key={item.label} className={`rounded-3xl border p-5 shadow-sm ${index === 1 ? 'border-[#C9A227]/40 bg-[#F8F4EC]' : 'border-gray-100 bg-white'}`}>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F0F0F] text-[#C9A227]">
                <item.icon className="h-6 w-6" />
              </div>
              <p className="mt-5 text-3xl font-bold tracking-[-0.04em] text-[#0F0F0F]">{item.value}</p>
              <p className="mt-2 text-sm font-medium text-[#3B2F2F]/65">{item.label}</p>
            </article>
          ))}
        </div>
      </section>

      {isAuthenticated && myAppointment && (
        <section className="rounded-[32px] bg-[#0F0F0F] px-6 py-8 text-white shadow-[0_24px_60px_rgba(15,15,15,0.14)] sm:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#C9A227]">Your position</p>
              <p className="mt-4 text-6xl font-bold tracking-[-0.06em]">{myAppointment.queuePosition || '-'}</p>
              <p className="mt-3 text-sm text-white/65">Current queue placement for today&apos;s appointment.</p>
            </div>

            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#C9A227]">Today&apos;s booking</p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">{myAppointment.service?.name?.en}</h2>
              <p className="mt-3 text-base leading-7 text-white/68">Scheduled for {myAppointment.scheduledTime}. Follow the live queue and check in when you arrive at the salon.</p>

              {canCheckIn(myAppointment) && (
                <div className="mt-6 rounded-3xl border border-[#C9A227]/20 bg-[#C9A227]/10 p-5">
                  <p className="text-lg font-bold text-white">You can check in now.</p>
                  <p className="mt-2 text-base leading-7 text-white/70">Confirm your arrival to join the live queue and keep your service moving on time.</p>
                  <button type="button" onClick={() => setSelectedAppointment(myAppointment)} className={`${goldButton} mt-4`}>
                    Check in now
                  </button>
                </div>
              )}

              {myAppointment.status === 'CHECKED_IN' && (
                <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-lg font-bold text-[#C9A227]">You are checked in.</p>
                  <p className="mt-2 text-base leading-7 text-white/70">Please stay nearby. The salon team will call you as your turn approaches.</p>
                </div>
              )}

              {myAppointment.status === 'IN_PROGRESS' && (
                <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-lg font-bold text-white">Your service is in progress.</p>
                  <p className="mt-2 text-base leading-7 text-white/70">You are currently being served by the salon team.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="rounded-[32px] border border-black/5 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <h2 className="text-3xl font-bold tracking-[-0.04em] text-[#0F0F0F]">Live queue</h2>
            <p className="mt-2 text-base text-gray-700">Current salon flow with live position and status updates.</p>
          </div>
          <span className="text-sm font-medium text-[#3B2F2F]/60">Current status</span>
        </div>

        {queue.length === 0 ? (
          <div className="px-6 py-16 text-center sm:px-8">
            <p className="text-2xl font-bold tracking-[-0.03em] text-[#0F0F0F]">The queue is clear right now.</p>
            <p className="mt-3 text-base leading-7 text-gray-700">Book a session to reserve your place before the next busy window.</p>
            <button type="button" onClick={() => { window.location.href = '/booking'; }} className={`${goldButton} mt-6`}>
              Book a session
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {queue.map((item, index) => (
              <article key={item._id} className={`flex flex-col gap-4 px-6 py-5 transition-colors duration-300 sm:px-8 lg:flex-row lg:items-center lg:justify-between ${item.status === 'IN_PROGRESS' ? 'bg-[#F8F4EC]' : 'hover:bg-[#F8F4EC]/45'}`}>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F0F0F] text-lg font-bold text-[#C9A227]">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold tracking-[-0.03em] text-[#0F0F0F]">{item.customer?.fullName || 'Valued Customer'}</h3>
                    <p className="mt-1 text-sm text-[#3B2F2F]/65">{item.service?.name?.en} • {item.scheduledTime}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 lg:items-end">
                  <span className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-medium ${statusBadge(item.status)}`}>
                    {item.status.replace('_', ' ')}
                  </span>
                  {item.estimatedWaitTime > 0 && item.status !== 'IN_PROGRESS' && (
                    <span className="text-sm font-medium text-[#C9A227]">Approx. {item.estimatedWaitTime} min wait</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-[#0F0F0F]/55 backdrop-blur-sm" onClick={() => setSelectedAppointment(null)} aria-label="Close check-in dialog" />
          <div className="relative z-10 w-full max-w-md rounded-[32px] border border-black/5 bg-white p-8 shadow-2xl">
            <h3 className="text-3xl font-bold tracking-[-0.04em] text-[#0F0F0F]">Confirm check-in</h3>
            <p className="mt-4 text-base leading-7 text-gray-700">
              Checking in confirms that you are physically at the salon and ready to join the active queue.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={() => setSelectedAppointment(null)} className={`${outlineButton} sm:flex-1`}>
                Not yet
              </button>
              <button
                type="button"
                onClick={() => handleCheckIn(selectedAppointment._id || selectedAppointment.id)}
                disabled={checkInLoading}
                className={`${goldButton} sm:flex-1 ${checkInLoading ? 'cursor-not-allowed opacity-70' : ''}`}
              >
                {checkInLoading ? 'Checking in...' : 'I am here'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueuePage;
