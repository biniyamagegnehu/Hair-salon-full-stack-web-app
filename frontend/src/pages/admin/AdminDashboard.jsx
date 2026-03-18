import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
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
import './AdminPages.css';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isConnected, onQueueUpdate, onAppointmentUpdate } = useSocket();
  
  const { stats, analytics, queue, isLoading } = useSelector((state) => state.admin || {});
  const [period, setPeriod] = useState('week');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState([]);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Initial data fetch
  useEffect(() => {
    refreshData();
  }, [period]);

  // WebSocket real-time updates
  useEffect(() => {
    const unsubscribeQueue = onQueueUpdate((data) => {
      console.log('Real-time queue update:', data);
      showNotification('Queue updated', 'The queue has been updated', 'info');
      dispatch(fetchTodayQueue());
    });

    const unsubscribeAppointment = onAppointmentUpdate((data) => {
      console.log('Real-time appointment update:', data);
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

  if (isLoading && !stats) {
    return (
      <div className="admin-page animate-fade-in">
        <div className="admin-stats-grid">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} height="120px" variant="rectangle" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton height="500px" variant="rectangle" />
          <Skeleton height="500px" variant="rectangle" />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-black uppercase tracking-tight">{t('admin.dashboard')}</h1>
          <p className="text-secondary-brown font-bold opacity-60 text-sm sm:text-base">{formatDate(currentTime)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-cream/30 px-4 py-2 rounded-full border border-border-primary">
            <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`}></div>
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-secondary-brown">
              {isConnected ? t('common.live') : t('common.connecting')}
            </span>
          </div>

          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 sm:px-4 py-2 bg-white border border-border-primary rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest text-secondary-brown focus:outline-none focus:ring-2 focus:ring-accent-gold"
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
          >
            <span className="text-base sm:text-lg">🔄</span>
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">💰</div>
          <div className="admin-stat-info">
            <p className="admin-stat-label">Daily Revenue</p>
            <p className="admin-stat-value">{formatCurrency(stats?.revenue?.today?.total || 0)}</p>
            <p className="text-[10px] font-bold text-green-600 uppercase mt-1">↑ 12% vs yesterday</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon">👤</div>
          <div className="admin-stat-info">
            <p className="admin-stat-label">Total Clients</p>
            <p className="admin-stat-value">{formatNumber(stats?.customers?.total || 0)}</p>
            <p className="text-[10px] font-bold text-secondary-brown opacity-40 uppercase mt-1">All time records</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon">📅</div>
          <div className="admin-stat-info">
            <p className="admin-stat-label">Today Appts</p>
            <p className="admin-stat-value">{stats?.appointments?.today || 0}</p>
            <p className="text-[10px] font-bold text-accent-gold uppercase mt-1">{stats?.appointments?.completedToday || 0} COMPLETED</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon">✂️</div>
          <div className="admin-stat-info">
            <p className="admin-stat-label">Active Svcs</p>
            <p className="admin-stat-value">{stats?.services?.active || 0}</p>
            <p className="text-[10px] font-bold text-secondary-brown opacity-40 uppercase mt-1">Catalog items</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
        {/* Live Queue */}
        <div className="xl:col-span-1">
          <Card variant="gold-border" className="h-full">
            <CardHeader className="flex justify-between items-center p-4 sm:p-6 border-b border-border-primary text-black">
              <div>
                <h3 className="text-base sm:text-lg font-black uppercase tracking-widest">{t('queue.currentlyServing')}</h3>
                <p className="text-[10px] font-bold text-accent-gold uppercase">Real-time update</p>
              </div>
              <Link to="/admin/queue">
                <Button variant="text" size="xs">View All</Button>
              </Link>
            </CardHeader>
            <CardBody className="p-4 sm:p-6">
              <div className="space-y-4">
                {queue?.appointments?.inProgress?.length > 0 ? (
                  queue.appointments.inProgress.map((apt, index) => (
                    <div key={apt._id} className="activity-item">
                      <div className="w-10 h-10 bg-black text-gold rounded-lg flex items-center justify-center font-black">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-black uppercase text-sm">{apt.customer?.fullName}</p>
                        <p className="text-xs font-bold text-secondary-brown opacity-60">{apt.service?.name?.en} • {apt.scheduledTime}</p>
                      </div>
                      <Badge variant="gold" size="xs">ACTIVE</Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-border-primary rounded-xl">
                    <p className="text-sm font-bold text-secondary-brown opacity-30">{t('queue.noQueue')}</p>
                  </div>
                )}

                {/* Queue Summary Ring */}
                <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-border-primary">
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase text-secondary-brown opacity-50">{t('queue.inProgress')}</p>
                    <p className="text-2xl font-black text-black">{queue?.stats?.inProgress || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase text-secondary-brown opacity-50">{t('queue.checkedIn')}</p>
                    <p className="text-2xl font-black text-accent-gold">{queue?.stats?.checkedIn || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase text-secondary-brown opacity-50">{t('queue.confirmed')}</p>
                    <p className="text-2xl font-black text-secondary-brown">{queue?.stats?.confirmed || 0}</p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Appointment Trends Chart Placeholder */}
        <div className="xl:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex justify-between items-center bg-black p-4 sm:p-6 rounded-t-xl text-white">
              <div>
                <h3 className="text-base sm:text-lg font-black uppercase tracking-widest">{t('admin.appointmentTrends')}</h3>
                <p className="text-[10px] font-bold text-gold uppercase">Performance analytics</p>
              </div>
              <Badge variant="gold">+{analytics?.trends?.increase || 0}% Increase</Badge>
            </CardHeader>
            <CardBody className="p-4 sm:p-8">
              {analytics?.trends?.daily?.length > 0 ? (
                <div className="space-y-4 sm:space-y-6">
                  {analytics.trends.daily.slice(0, 7).map((day, index) => {
                    const max = Math.max(...analytics.trends.daily.map(d => d.count));
                    const percentage = (day.count / max) * 100;
                    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
                    
                    return (
                      <div key={index} className="flex items-center gap-3 sm:gap-4 group">
                        <span className="text-[10px] font-black text-secondary-brown opacity-50 w-8">{days[index]}</span>
                        <div className="flex-1 h-8 sm:h-10 bg-cream rounded-lg overflow-hidden relative border border-border-primary">
                          <div 
                            className="h-full bg-black group-hover:bg-accent-gold transition-all duration-500"
                            style={{ width: `${Math.max(percentage, 5)}%` }}
                          >
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-black bg-gold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              {day.count}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs sm:text-sm font-black text-black w-8 text-right">{day.count}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-48 sm:h-64 flex items-center justify-center border-2 border-dashed border-border-primary rounded-xl">
                  <p className="text-xs sm:text-sm font-bold text-secondary-brown opacity-30 uppercase tracking-widest">No historical data</p>
                </div>
              )}

              {/* Summary Totals */}
              <div className="grid grid-cols-3 gap-8 mt-10 pt-8 border-t border-border-primary">
                <div className="text-center">
                  <p className="text-3xl font-black text-black">{analytics?.summary?.weeklyTotal || 0}</p>
                  <p className="text-[10px] font-black uppercase text-secondary-brown opacity-50">{t('common.thisWeek')}</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-black text-black">{analytics?.summary?.monthlyTotal || 0}</p>
                  <p className="text-[10px] font-black uppercase text-secondary-brown opacity-50">{t('common.thisMonth')}</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-black text-black">{analytics?.summary?.yearlyTotal || 0}</p>
                  <p className="text-[10px] font-black uppercase text-secondary-brown opacity-50">{t('common.thisYear')}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Popular Services */}
        <Card className="lg:col-span-2">
          <CardHeader className="p-6 border-b border-border-primary">
            <h3 className="text-lg font-black uppercase tracking-widest">{t('admin.popularServices')}</h3>
          </CardHeader>
          <CardBody className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analytics?.popularServices?.length > 0 ? (
                analytics.popularServices.map((service, index) => (
                  <div key={service._id} className="p-4 rounded-xl border border-border-primary hover:border-gold transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-black text-black uppercase text-xs">{service.serviceDetails?.name?.en}</h4>
                      <Badge variant="gold" size="xs">{service.count}x</Badge>
                    </div>
                    <div className="w-full h-1 bg-cream rounded-full overflow-hidden mb-2">
                      <div 
                        className="h-full bg-black" 
                        style={{ width: `${(service.count / Math.max(...analytics.popularServices.map(s => s.count))) * 100}%` }}
                      />
                    </div>
                    <p className="text-[10px] font-bold text-secondary-brown text-right uppercase">Yield: {formatCurrency(service.revenue)}</p>
                  </div>
                ))
              ) : (
                <p className="col-span-2 text-center py-8 text-sm font-bold text-secondary-brown opacity-30 uppercase tracking-widest">No service data</p>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Live Updates & Actions */}
        <div className="space-y-6">
          <Card variant="gold-border">
            <CardHeader className="p-6 border-b border-border-primary">
              <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                System Logs
              </h3>
            </CardHeader>
            <CardBody className="p-4 max-h-[300px] overflow-auto">
              {notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.map(n => (
                    <div key={n.id} className={`p-3 rounded-lg border-l-4 ${n.type === 'success' ? 'border-green-500 bg-green-50/10' : 'border-gold bg-gold/5'}`}>
                      <p className="text-[10px] font-black text-black uppercase">{n.title}</p>
                      <p className="text-[10px] font-bold text-secondary-brown">{n.message}</p>
                      <p className="text-[8px] font-black text-secondary-brown opacity-50 mt-1 uppercase">{formatTime(n.timestamp)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] font-black text-secondary-brown opacity-30 text-center py-8 uppercase">No active notifications</p>
              )}
            </CardBody>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Link to="/admin/reports">
              <Button variant="outline" fullWidth size="sm" className="h-full py-4 flex flex-col gap-2">
                <span className="text-xl">📊</span>
                <span className="text-[10px] font-black uppercase">Reports</span>
              </Button>
            </Link>
            <Link to="/admin/settings">
              <Button variant="outline" fullWidth size="sm" className="h-full py-4 flex flex-col gap-2">
                <span className="text-xl">⚙️</span>
                <span className="text-[10px] font-black uppercase">Setup</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;