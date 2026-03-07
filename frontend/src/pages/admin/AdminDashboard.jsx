import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  fetchDashboardStats, 
  fetchAppointmentAnalytics,
  fetchTodayQueue
} from '../../store/slices/adminSlice';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { stats, analytics, queue, isLoading } = useSelector((state) => state.admin);
  const [period, setPeriod] = useState('week');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchAppointmentAnalytics(period));
    dispatch(fetchTodayQueue());
  }, [dispatch, period]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Stat Card Component
  const StatCard = ({ title, value, icon, trend, color = 'blue', subtitle, onClick }) => (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-gray-100 cursor-pointer transform hover:-translate-y-1"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 bg-${color}-50 rounded-xl`}>
          <span className="text-2xl">{icon}</span>
        </div>
        {trend && (
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

  // Quick Action Button
  const QuickAction = ({ icon, label, color, to }) => (
    <Link
      to={to}
      className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-white hover:shadow-md transition-all duration-300 border border-transparent hover:border-gray-200 group"
    >
      <div className={`w-12 h-12 bg-${color}-50 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
        <span className="text-2xl">{icon}</span>
      </div>
      <span className="text-xs font-medium text-gray-600 text-center">{label}</span>
    </Link>
  );

  // Appointment Status Card
  const StatusCard = ({ status, count, icon, color }) => (
    <div className="flex items-center p-3 bg-gray-50 rounded-xl">
      <div className={`w-10 h-10 bg-${color}-100 rounded-lg flex items-center justify-center mr-3`}>
        <span className="text-lg">{icon}</span>
      </div>
      <div>
        <p className="text-xs text-gray-500">{status}</p>
        <p className="text-lg font-bold text-gray-800">{count}</p>
      </div>
    </div>
  );

  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-500">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{t('admin.dashboard')}</h1>
          <p className="text-gray-500 mt-1">{formatDate(currentTime)}</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="week">{t('common.last7Days', 'Last 7 Days')}</option>
            <option value="month">{t('common.last30Days', 'Last 30 Days')}</option>
            <option value="year">{t('common.last12Months', 'Last 12 Months')}</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            {t('common.export', 'Export Report')}
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
        />
        <StatCard
          title={t('admin.totalCustomers')}
          value={stats?.customers?.total || 0}
          icon="👥"
          trend={8}
          color="blue"
          subtitle="+24 this month"
        />
        <StatCard
          title={t('admin.todayAppointments')}
          value={stats?.appointments?.today || 0}
          icon="📅"
          trend={-5}
          color="purple"
          subtitle={`${stats?.appointments?.completedToday || 0} ${t('common.completed')}`}
        />
        <StatCard
          title={t('admin.activeServices')}
          value={stats?.services?.active || 0}
          icon="💇"
          color="orange"
          subtitle={t('admin.servicesOffered')}
        />
      </div>

      {/* Queue Status & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Queue Status */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">{t('queue.currentlyServing')}</h3>
            <Link to="/admin/queue" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              {t('common.viewAll', 'View All')} →
            </Link>
          </div>

          <div className="space-y-4">
            {queue?.appointments?.inProgress?.length > 0 ? (
              queue.appointments.inProgress.map((apt, index) => (
                <div key={apt._id} className="flex items-center p-3 bg-green-50 rounded-xl border border-green-100">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
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
                <p className="text-gray-500">{t('queue.noQueue', 'No active appointments')}</p>
              </div>
            )}

            {/* Queue Summary */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100">
              <StatusCard status={t('queue.inProgress')} count={queue?.stats?.inProgress || 0} icon="🔄" color="green" />
              <StatusCard status={t('queue.checkedIn')} count={queue?.stats?.checkedIn || 0} icon="✅" color="blue" />
              <StatusCard status={t('queue.confirmed')} count={queue?.stats?.confirmed || 0} icon="⏳" color="yellow" />
            </div>
          </div>
        </div>

        {/* Appointment Trends Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">{t('admin.appointmentTrends')}</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full">+24%</span>
            </div>
          </div>

          {analytics?.trends && analytics.trends.length > 0 ? (
            <div className="space-y-4">
              {analytics.trends.slice(0, 7).map((trend, index) => {
                const max = Math.max(...analytics.trends.map(t => t.count));
                const percentage = (trend.count / max) * 100;
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                
                return (
                  <div key={trend._id} className="flex items-center group">
                    <span className="text-xs font-medium text-gray-500 w-12">{days[index]}</span>
                    <div className="flex-1 mx-4">
                      <div className="h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-lg group-hover:from-blue-600 group-hover:to-blue-500 transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        >
                          <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            {trend.count}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 w-12 text-right">{trend.count}</span>
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
              <p className="text-2xl font-bold text-blue-600">{stats?.appointments?.thisWeek || 0}</p>
              <p className="text-xs text-gray-500">{t('common.thisWeek', 'This Week')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats?.appointments?.thisMonth || 0}</p>
              <p className="text-xs text-gray-500">{t('common.thisMonth', 'This Month')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats?.appointments?.thisYear || 0}</p>
              <p className="text-xs text-gray-500">{t('common.thisYear', 'This Year')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Services & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Popular Services */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">{t('admin.popularServices')}</h3>
            <Link to="/admin/services" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              {t('common.manage', 'Manage')} →
            </Link>
          </div>

          {analytics?.popularServices && analytics.popularServices.length > 0 ? (
            <div className="space-y-4">
              {analytics.popularServices.map((service, index) => {
                const max = Math.max(...analytics.popularServices.map(s => s.count));
                const percentage = (service.count / max) * 100;
                
                return (
                  <div key={service._id} className="flex items-center">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-sm font-bold text-gray-600">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-800">
                          {service.serviceDetails?.name?.en || t('common.service')}
                        </span>
                        <span className="text-sm font-semibold text-green-600">
                          {formatCurrency(service.revenue)}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{service.count} {t('booking.bookings')}</p>
                    </div>
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

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">{t('admin.quickActions')}</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <QuickAction 
              icon="📊" 
              label={t('admin.reports')} 
              color="blue"
              to="/admin/reports"
            />
            <QuickAction 
              icon="📅" 
              label={t('admin.appointments')} 
              color="green"
              to="/admin/appointments"
            />
            <QuickAction 
              icon="👥" 
              label={t('admin.customers')} 
              color="purple"
              to="/admin/customers"
            />
            <QuickAction 
              icon="💇" 
              label={t('admin.services')} 
              color="orange"
              to="/admin/services"
            />
            <QuickAction 
              icon="⏰" 
              label={t('admin.workingHours')} 
              color="yellow"
              to="/admin/working-hours"
            />
            <QuickAction 
              icon="⚙️" 
              label={t('admin.settings')} 
              color="gray"
              to="/admin/settings"
            />
          </div>

          {/* Recent Activity */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">{t('admin.recentActivity', 'Recent Activity')}</h4>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-600">New appointment booked</span>
                <span className="text-xs text-gray-400 ml-auto">2m ago</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-gray-600">Customer checked in</span>
                <span className="text-xs text-gray-400 ml-auto">15m ago</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-gray-600">Payment received</span>
                <span className="text-xs text-gray-400 ml-auto">25m ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;