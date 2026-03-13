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

  const StatCard = ({ title, value, icon, trend, color = 'blue', subtitle, onClick }) => (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-gray-100 cursor-pointer transform hover:-translate-y-1"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 bg-${color}-50 rounded-xl`}>
          <span className="text-2xl">{icon}</span>
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-800 mb-1">{value}</p>
      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
    </div>
  );

  const QuickAction = ({ icon, label, color, to, count }) => (
    <Link
      to={to}
      className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-white hover:shadow-md transition-all duration-300 border border-transparent hover:border-gray-200 group relative"
    >
      {count > 0 && (
        <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
          {count}
        </span>
      )}
      <div className={`w-12 h-12 bg-${color}-50 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
        <span className="text-2xl">{icon}</span>
      </div>
      <span className="text-xs font-medium text-gray-600 text-center">{label}</span>
    </Link>
  );

  const NotificationItem = ({ notification }) => (
    <div className={`p-3 rounded-lg ${
      notification.type === 'success' ? 'bg-green-50' :
      notification.type === 'error' ? 'bg-red-50' :
      'bg-blue-50'
    }`}>
      <div className="flex items-start gap-2">
        <div className={`p-1 rounded-full ${
          notification.type === 'success' ? 'bg-green-200' :
          notification.type === 'error' ? 'bg-red-200' :
          'bg-blue-200'
        }`}>
          <span className="text-xs">
            {notification.type === 'success' ? '✓' :
             notification.type === 'error' ? '✗' : 'ℹ'}
          </span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-800">{notification.title}</p>
          <p className="text-xs text-gray-600">{notification.message}</p>
          <p className="text-xs text-gray-400 mt-1">{formatTime(notification.timestamp)}</p>
        </div>
      </div>
    </div>
  );

  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-400">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Connection Status */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{t('admin.dashboard')}</h1>
          <p className="text-gray-500 mt-1">{formatDate(currentTime)}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Connection Status */}
          <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-xl">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-600">
              {isConnected ? t('common.live') : t('common.connecting', 'Connecting...')}
            </span>
          </div>

          {/* Period Selector */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">{t('common.last7Days')}</option>
            <option value="month">{t('common.last30Days')}</option>
            <option value="year">{t('common.last12Months')}</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={refreshData}
            className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            title={t('common.refresh')}
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('admin.totalRevenue')}
          value={formatCurrency(stats?.revenue?.today?.total || 0)}
          icon="💰"
          trend={12}
          color="green"
          subtitle={`${formatCurrency(stats?.revenue?.today?.advance || 0)} ${t('payment.advancePayment')}`}
          onClick={() => window.location.href = '/admin/reports?tab=revenue'}
        />
        <StatCard
          title={t('admin.totalCustomers')}
          value={formatNumber(stats?.customers?.total || 0)}
          icon="👥"
          trend={8}
          color="blue"
          subtitle={`+24 ${t('common.thisMonth')}`}
          onClick={() => window.location.href = '/admin/customers'}
        />
        <StatCard
          title={t('admin.todayAppointments')}
          value={stats?.appointments?.today || 0}
          icon="📅"
          trend={-5}
          color="purple"
          subtitle={`${stats?.appointments?.completedToday || 0} ${t('common.completed')}`}
          onClick={() => window.location.href = '/admin/appointments'}
        />
        <StatCard
          title={t('admin.activeServices')}
          value={stats?.services?.active || 0}
          icon="💇"
          color="orange"
          subtitle={t('admin.servicesOffered')}
          onClick={() => window.location.href = '/admin/services'}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Queue Status */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">{t('queue.currentlyServing')}</h3>
            <Link to="/admin/queue" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              {t('common.viewAll')} 
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="space-y-4">
            {queue?.appointments?.inProgress?.length > 0 ? (
              queue.appointments.inProgress.map((apt, index) => (
                <div key={apt._id} className="flex items-center p-3 bg-green-50 rounded-xl border border-green-100">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-green-600 font-bold">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{apt.customer?.fullName}</p>
                    <p className="text-xs text-gray-500">{apt.service?.name?.en} • {apt.scheduledTime}</p>
                  </div>
                  <span className="px-2 py-1 bg-green-200 text-green-800 text-xs font-medium rounded-full">
                    {t('queue.inProgress')}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-500">{t('queue.noQueue')}</p>
              </div>
            )}

            {/* Queue Summary */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <p className="text-xs text-gray-500">{t('queue.inProgress')}</p>
                <p className="text-lg font-bold text-green-600">{queue?.stats?.inProgress || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">{t('queue.checkedIn')}</p>
                <p className="text-lg font-bold text-blue-600">{queue?.stats?.checkedIn || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">{t('queue.confirmed')}</p>
                <p className="text-lg font-bold text-yellow-600">{queue?.stats?.confirmed || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Appointment Trends */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">{t('admin.appointmentTrends')}</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full">
                +{analytics?.trends?.increase || 0}% {t('common.versus', 'vs last period')}
              </span>
            </div>
          </div>

          {analytics?.trends?.daily?.length > 0 ? (
            <div className="space-y-4">
              {analytics.trends.daily.slice(0, 7).map((day, index) => {
                const max = Math.max(...analytics.trends.daily.map(d => d.count));
                const percentage = (day.count / max) * 100;
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                
                return (
                  <div key={index} className="flex items-center group">
                    <span className="text-xs font-medium text-gray-500 w-12">{days[index]}</span>
                    <div className="flex-1 mx-4">
                      <div className="h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-lg group-hover:from-blue-600 group-hover:to-blue-500 transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        >
                          <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            {day.count}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 w-12 text-right">{day.count}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-400">{t('common.noData')}</p>
            </div>
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{analytics?.summary?.weeklyTotal || 0}</p>
              <p className="text-xs text-gray-500">{t('common.thisWeek')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{analytics?.summary?.monthlyTotal || 0}</p>
              <p className="text-xs text-gray-500">{t('common.thisMonth')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{analytics?.summary?.yearlyTotal || 0}</p>
              <p className="text-xs text-gray-500">{t('common.thisYear')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Popular Services */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">{t('admin.popularServices')}</h3>
            <Link to="/admin/reports?tab=services" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              {t('common.viewAll')} 
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {analytics?.popularServices?.length > 0 ? (
            <div className="space-y-4">
              {analytics.popularServices.map((service, index) => {
                const max = Math.max(...analytics.popularServices.map(s => s.count));
                const percentage = (service.count / max) * 100;
                
                return (
                  <div key={service._id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">
                        {service.serviceDetails?.name?.en || t('common.service')}
                      </span>
                      <span className="text-gray-600">{service.count} {t('booking.bookings')}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 text-right">{formatCurrency(service.revenue)}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">{t('common.noData')}</p>
            </div>
          )}
        </div>

        {/* Notifications & Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">{t('admin.quickActions')}</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <QuickAction 
                icon="📊" 
                label={t('admin.reports')} 
                color="blue"
                to="/admin/reports"
                count={0}
              />
              <QuickAction 
                icon="📅" 
                label={t('admin.appointments')} 
                color="green"
                to="/admin/appointments"
                count={stats?.appointments?.pending || 0}
              />
              <QuickAction 
                icon="👥" 
                label={t('admin.customers')} 
                color="purple"
                to="/admin/customers"
                count={0}
              />
              <QuickAction 
                icon="🔄" 
                label={t('admin.queue')} 
                color="orange"
                to="/admin/queue"
                count={queue?.stats?.total || 0}
              />
              <QuickAction 
                icon="💇" 
                label={t('admin.services')} 
                color="pink"
                to="/admin/services"
                count={0}
              />
              <QuickAction 
                icon="⏰" 
                label={t('admin.workingHours')} 
                color="yellow"
                to="/admin/working-hours"
                count={0}
              />
            </div>
          </div>

          {/* Real-time Notifications */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              {t('common.liveUpdates', 'Live Updates')}
            </h3>
            
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map(notification => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))
              ) : (
                <div className="text-center py-4 text-gray-400 text-sm">
                  {t('common.noNotifications', 'No new notifications')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;