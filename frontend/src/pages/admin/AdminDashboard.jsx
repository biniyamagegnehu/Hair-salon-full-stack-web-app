/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useSocket } from '../../contexts/SocketContext';
import { 
  fetchDashboardStats, 
  fetchAppointmentAnalytics,
  fetchTodayQueue
} from '../../store/slices/adminSlice';
import Card, { CardHeader, CardBody } from '../../components/ui/Card/Card';
import Badge from '../../components/ui/Badge/Badge';
import Button from '../../components/ui/Button/Button';
import Skeleton from '../../components/ui/Skeleton/Skeleton';
import FloatingActionButton from '../../components/ui/FloatingActionButton/FloatingActionButton';
import BottomSheet from '../../components/ui/BottomSheet/BottomSheet';
import { 
  CalendarDaysIcon, 
  UserPlusIcon, 
  QueueListIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ScissorsIcon,
  ArrowTrendingUpIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isConnected, onQueueUpdate, onAppointmentUpdate } = useSocket();
  
  const { stats, analytics, queue, isLoading } = useSelector((state) => state.admin || {});
  const [period, setPeriod] = useState('week');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState([]);
  const [showQuickActionsSheet, setShowQuickActionsSheet] = useState(false);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const refreshData = () => {
    dispatch(fetchDashboardStats());
    dispatch(fetchAppointmentAnalytics(period));
    dispatch(fetchTodayQueue());
  };

  const showNotification = (title, message, type = 'info') => {
    const newNotification = {
      id: Date.now(),
      title,
      message,
      type,
      timestamp: new Date()
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 5));
  };

  // Initial data fetch
  useEffect(() => {
    refreshData();
  }, [period]);

  // WebSocket real-time updates
  useEffect(() => {
    const unsubscribeQueue = onQueueUpdate((data) => {
      showNotification('Queue updated', 'The queue has been updated', 'info');
      dispatch(fetchTodayQueue());
    });

    const unsubscribeAppointment = onAppointmentUpdate((data) => {
      showNotification(
        'Appointment Updated',
        `Appointment status changed to ${data.status}`,
        'success'
      );
      refreshData();
    });

    return () => {
      unsubscribeQueue();
      unsubscribeAppointment();
    };
  }, [onQueueUpdate, onAppointmentUpdate]);





  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // FAB Actions
  const fabActions = [
    {
      icon: <CalendarDaysIcon className="w-6 h-6" />,
      label: 'New Appointment',
      onClick: () => navigate('/admin/appointments/new')
    },
    {
      icon: <UserPlusIcon className="w-6 h-6" />,
      label: 'Add Customer',
      onClick: () => navigate('/admin/customers/new')
    },
    {
      icon: <QueueListIcon className="w-6 h-6" />,
      label: 'Manage Queue',
      onClick: () => navigate('/admin/queue')
    }
  ];

  if (isLoading && !stats) {
    return (
      <div className="admin-page animate-fade-in px-4 lg:px-0">
        <div className="flex flex-col gap-4 mb-6 lg:mb-8">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} height="88px" variant="rectangle" className="rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <Skeleton height="300px" variant="rectangle" className="rounded-2xl" />
          <Skeleton height="300px" variant="rectangle" className="rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page animate-fade-in">
      {/* Header Mobile Summary */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 lg:mb-8">
        <div>
          <h2 className="text-sm font-black text-secondary-brown/50 uppercase tracking-widest mb-1">{formatDate(currentTime)}</h2>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-black text-black uppercase tracking-tight">Overview</h1>
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${isConnected ? 'bg-success/10 border-success/20 text-success' : 'bg-error/10 border-error/20 text-error'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-error'}`} />
              <span className="text-[9px] font-black uppercase tracking-widest">{isConnected ? 'Live' : 'Offline'}</span>
            </div>
          </div>
        </div>

        {/* Desktop Controls */}
        <div className="hidden lg:flex flex-wrap items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 bg-white border border-accent-gold/20 rounded-xl text-xs font-black uppercase tracking-widest text-black focus:outline-none focus:border-accent-gold cursor-pointer"
          >
            <option value="week">{t('common.last7Days')}</option>
            <option value="month">{t('common.last30Days')}</option>
            <option value="year">{t('common.last12Months')}</option>
          </select>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
            title={t('common.refresh')}
            className="h-[38px] w-[38px] p-0 flex items-center justify-center border-accent-gold/20 hover:border-accent-gold"
          >
            <span className="text-lg">↻</span>
          </Button>
        </div>
      </div>

      {/* Mobile Controls Sheet trigger - visible only on mobile */}
      <div className="lg:hidden mb-6 flex gap-2">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="flex-1 px-4 py-3 bg-white shadow-sm border border-accent-gold/10 rounded-xl text-xs font-black uppercase tracking-widest text-black focus:outline-none focus:border-accent-gold appearance-none text-center"
        >
          <option value="week">Past 7 Days</option>
          <option value="month">Past 30 Days</option>
          <option value="year">Past 12 Months</option>
        </select>
        <button 
          onClick={refreshData}
          className="w-12 h-[42px] bg-white shadow-sm border border-accent-gold/10 rounded-xl flex items-center justify-center text-secondary-brown hover:text-accent-gold active:scale-95 transition-all"
        >
          <span className="text-lg">↻</span>
        </button>
      </div>

      {/* Key Stats Mobile Stacked / Desktop Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <Card variant="default" padding={false} className="overflow-hidden group hover:border-accent-gold/50 transition-colors">
          <div className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center text-accent-gold shrink-0 group-hover:scale-110 transition-transform">
              <CurrencyDollarIcon className="w-6 h-6 stroke-2" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-secondary-brown/60 mb-0.5">Daily Revenue</p>
              <p className="text-xl font-black text-black leading-none">{formatCurrency(stats?.revenue?.today?.total || 0)}</p>
            </div>
            <div className="flex flex-col items-end shrink-0">
              <Badge variant="success" size="xs" className="mb-1">↑ 12%</Badge>
              <span className="text-[9px] font-bold text-secondary-brown/40 uppercase">vs yesterday</span>
            </div>
          </div>
        </Card>

        <Card variant="default" padding={false} className="overflow-hidden group hover:border-accent-gold/50 transition-colors">
          <div className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-background-cream border border-accent-gold/20 flex items-center justify-center text-black shrink-0 group-hover:scale-110 transition-transform">
              <UsersIcon className="w-6 h-6 stroke-2" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-secondary-brown/60 mb-0.5">Total Clients</p>
              <p className="text-xl font-black text-black leading-none">{formatNumber(stats?.customers?.total || 0)}</p>
            </div>
          </div>
        </Card>

        <Card variant="default" padding={false} className="overflow-hidden group hover:border-accent-gold/50 transition-colors">
          <div className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent-gold flex items-center justify-center text-black shrink-0 group-hover:scale-110 transition-transform">
              <CalendarDaysIcon className="w-6 h-6 stroke-2" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-secondary-brown/60 mb-0.5">Today's Appts</p>
              <div className="flex items-baseline gap-2">
                <p className="text-xl font-black text-black leading-none">{stats?.appointments?.today || 0}</p>
                <p className="text-[10px] font-bold text-success uppercase">({stats?.appointments?.completedToday || 0} Done)</p>
              </div>
            </div>
          </div>
        </Card>

        <Card variant="default" padding={false} className="overflow-hidden group hover:border-accent-gold/50 transition-colors">
          <div className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-secondary-brown flex items-center justify-center text-background-cream shrink-0 group-hover:scale-110 transition-transform">
              <ScissorsIcon className="w-6 h-6 stroke-2" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-secondary-brown/60 mb-0.5">Active Services</p>
              <p className="text-xl font-black text-black leading-none">{stats?.services?.active || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        {/* Live Queue - Dominant on Mobile */}
        <div className="xl:col-span-1 border border-accent-gold/20 rounded-2xl bg-white shadow-sm overflow-hidden flex flex-col h-full">
          <div className="p-4 lg:p-6 border-b border-accent-gold/10 flex justify-between items-center bg-background-cream/50">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-accent-gold" />
              <h3 className="text-sm lg:text-base font-black uppercase tracking-widest text-black">Live Queue</h3>
            </div>
            <Link to="/admin/queue" className="text-[10px] font-black uppercase text-accent-gold hover:text-black transition-colors">
              Manage
            </Link>
          </div>
          
          <div className="p-4 lg:p-6 flex-1 flex flex-col justify-between">
            <div className="space-y-3 mb-6">
              {queue?.appointments?.inProgress?.length > 0 ? (
                queue.appointments.inProgress.map((apt, index) => (
                  <div key={apt._id} className="flex items-center gap-3 p-3 rounded-xl bg-background-cream/50 border border-accent-gold/10">
                    <div className="w-8 h-8 rounded-lg bg-black text-accent-gold flex items-center justify-center text-xs font-black shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black uppercase text-black truncate">{apt.customer?.fullName}</p>
                      <p className="text-[9px] font-bold text-secondary-brown/60 truncate">{apt.service?.name?.en}</p>
                    </div>
                    <Badge variant="gold" size="xs" className="shrink-0 animate-pulse">Serving</Badge>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-sm font-bold text-secondary-brown/30 mt-4 rounded-xl border border-dashed border-secondary-brown/10">
                  {t('queue.noQueue')}
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 mt-auto pt-4 border-t border-accent-gold/10">
              <div className="text-center bg-background-cream py-2 rounded-xl">
                <p className="text-[9px] font-black uppercase tracking-widest text-secondary-brown/60">Waiting</p>
                <p className="text-lg font-black text-black">{queue?.stats?.checkedIn || 0}</p>
              </div>
              <div className="text-center bg-accent-gold/10 py-2 rounded-xl border border-accent-gold/20">
                <p className="text-[9px] font-black uppercase tracking-widest text-accent-gold">Active</p>
                <p className="text-lg font-black text-accent-gold">{queue?.stats?.inProgress || 0}</p>
              </div>
              <div className="text-center bg-black py-2 rounded-xl">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/50">Done</p>
                <p className="text-lg font-black text-white">{queue?.stats?.completed || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Swipeable Trend Chart */}
        <div className="xl:col-span-2 border border-gray-100 rounded-2xl bg-white shadow-sm overflow-hidden flex flex-col h-full">
          <div className="p-4 lg:p-6 bg-black flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ArrowTrendingUpIcon className="w-5 h-5 text-accent-gold" />
              <h3 className="text-sm lg:text-base font-black uppercase tracking-widest text-white">Trends</h3>
            </div>
            <Badge variant="gold" size="xs">+{analytics?.trends?.increase || 0}%</Badge>
          </div>
          
          <div className="p-4 lg:p-6 flex-1 flex flex-col">
            <div className="flex-1 overflow-x-auto no-scrollbar py-4 -mx-4 px-4 lg:mx-0 lg:px-0">
              {analytics?.trends?.daily?.length > 0 ? (
                <div className="flex lg:flex-col lg:space-y-4 space-x-4 lg:space-x-0 min-w-max lg:min-w-0">
                  {analytics.trends.daily.slice(0, 7).map((day, index) => {
                    const max = Math.max(...analytics.trends.daily.map(d => d.count));
                    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
                    
                    return (
                      <div key={index} className="flex flex-col lg:flex-row items-center justify-end lg:justify-start gap-2 lg:gap-4 h-32 lg:h-auto w-12 lg:w-auto shrink-0 group">
                        {/* Mobile: Label at bottom. Desktop: Label at start */}
                        <span className="text-[10px] font-black uppercase text-secondary-brown/40 w-full text-center lg:text-left lg:w-8 order-2 lg:order-1">{days[index]}</span>
                        
                        {/* Bar */}
                        <div className="w-6 lg:w-full h-full lg:h-8 bg-background-cream rounded-full lg:rounded-lg overflow-hidden relative border border-accent-gold/10 order-1 lg:order-2 flex flex-col lg:flex-row justify-end lg:justify-start">
                          <div className="relative h-full w-full rounded-full bg-black transition-all duration-500 group-hover:bg-accent-gold lg:h-full lg:rounded-none">
                            <span className="hidden lg:flex absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-black bg-accent-gold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              {day.count}
                            </span>
                          </div>
                        </div>
                        
                        {/* Value */}
                        <span className="text-xs font-black text-black order-0 lg:order-3 lg:w-8 lg:text-right hidden lg:block">{day.count}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-xl">
                  <p className="text-xs font-bold text-secondary-brown/30 uppercase tracking-widest">No historical data</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
              <div className="text-center">
                <p className="text-2xl lg:text-3xl font-black text-black">{analytics?.summary?.weeklyTotal || 0}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-secondary-brown/40">This Week</p>
              </div>
              <div className="text-center">
                <p className="text-2xl lg:text-3xl font-black text-black">{analytics?.summary?.monthlyTotal || 0}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-secondary-brown/40">This Month</p>
              </div>
              <div className="text-center">
                <p className="text-2xl lg:text-3xl font-black text-black">{analytics?.summary?.yearlyTotal || 0}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-secondary-brown/40">This Year</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FloatingActionButton actions={fabActions} />
    </div>
  );
};

export default AdminDashboard;
