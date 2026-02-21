import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { 
  fetchDashboardStats, 
  fetchAppointmentAnalytics 
} from '../../store/slices/adminSlice';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { stats, analytics, isLoading } = useSelector((state) => state.admin);
  const [period, setPeriod] = useState('week');

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchAppointmentAnalytics(period));
  }, [dispatch, period]);

  const StatCard = ({ title, value, icon, color = 'blue', subtitle }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 bg-${color}-100 rounded-lg`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <span className="text-sm text-gray-500">{subtitle}</span>
      </div>
      <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );

  if (isLoading && !stats) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('admin.dashboard')}</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title={t('admin.totalCustomers')}
          value={stats?.customers?.total || 0}
          icon="👥"
          color="blue"
          subtitle={t('common.allTime', 'All time')}
        />
        <StatCard
          title={t('admin.todayAppointments')}
          value={stats?.appointments?.today || 0}
          icon="📅"
          color="green"
          subtitle={`${stats?.appointments?.completedToday || 0} ${t('common.completed', 'completed')}`}
        />
        <StatCard
          title={t('admin.totalRevenue')}
          value={`${stats?.revenue?.today?.total || 0} ETB`}
          icon="💰"
          color="purple"
          subtitle={`${stats?.revenue?.today?.advance || 0} ${t('payment.advancePayment')}`}
        />
        <StatCard
          title={t('admin.activeServices')}
          value={stats?.services?.active || 0}
          icon="💇"
          color="orange"
          subtitle={t('admin.servicesOffered', 'Services offered')}
        />
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Appointment Trends */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">{t('admin.appointmentTrends', 'Appointment Trends')}</h3>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
            >
              <option value="week">{t('common.last7Days', 'Last 7 Days')}</option>
              <option value="month">{t('common.last30Days', 'Last 30 Days')}</option>
              <option value="year">{t('common.last12Months', 'Last 12 Months')}</option>
            </select>
          </div>
          
          {analytics?.trends && analytics.trends.length > 0 ? (
            <div className="space-y-3">
              {analytics.trends.slice(0, 7).map((trend) => (
                <div key={trend._id} className="flex items-center">
                  <span className="text-sm text-gray-600 w-24">{trend._id}</span>
                  <div className="flex-1 mx-4">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${(trend.count / Math.max(...analytics.trends.map(t => t.count))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{trend.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">{t('common.noData', 'No data available')}</p>
          )}
        </div>

        {/* Popular Services */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('admin.popularServices', 'Popular Services')}</h3>
          
          {analytics?.popularServices && analytics.popularServices.length > 0 ? (
            <div className="space-y-4">
              {analytics.popularServices.map((service) => (
                <div key={service._id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">
                      {service.serviceDetails?.name?.en || t('common.service')}
                    </p>
                    <p className="text-sm text-gray-500">{service.count} {t('booking.bookings', 'bookings')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{service.revenue} ETB</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">{t('common.noData', 'No data available')}</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('admin.quickActions')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-sm font-medium text-gray-700">{t('admin.reports')}</div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors">
            <div className="text-2xl mb-2">📅</div>
            <div className="text-sm font-medium text-gray-700">{t('admin.manageQueue', 'Manage Queue')}</div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors">
            <div className="text-2xl mb-2">💇</div>
            <div className="text-sm font-medium text-gray-700">{t('admin.addService', 'Add Service')}</div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors">
            <div className="text-2xl mb-2">⚙️</div>
            <div className="text-sm font-medium text-gray-700">{t('admin.settings')}</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;