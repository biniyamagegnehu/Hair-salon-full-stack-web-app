import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  fetchRevenueReport,
  fetchAppointmentReport,
  fetchCustomerReport,
  fetchServicePopularityReport
} from '../../store/slices/adminSlice';

const AdminReports = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  const { reports, isLoading } = useSelector((state) => state.admin || {});
  
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(1)).toISOString().split('T')[0], // First day of current month
    end: new Date().toISOString().split('T')[0] // Today
  });
  
  const [activeTab, setActiveTab] = useState('revenue');

  useEffect(() => {
    loadReports();
  }, [dateRange]);

  const loadReports = () => {
    dispatch(fetchRevenueReport({ startDate: dateRange.start, endDate: dateRange.end }));
    dispatch(fetchAppointmentReport({ startDate: dateRange.start, endDate: dateRange.end }));
    dispatch(fetchCustomerReport());
    dispatch(fetchServicePopularityReport());
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

  const formatPercentage = (value, total) => {
    if (!total) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  const RevenueChart = ({ data }) => {
    if (!data || !data.daily) return null;
    
    const maxRevenue = Math.max(...data.daily.map(d => d.revenue), 1);
    
    return (
      <div className="space-y-2">
        {data.daily.slice(0, 7).map((day, index) => (
          <div key={index} className="flex items-center group">
            <span className="text-xs font-medium text-gray-500 w-16">{day.date}</span>
            <div className="flex-1 mx-4">
              <div className="h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-lg group-hover:from-green-600 group-hover:to-green-500 transition-all duration-300"
                  style={{ width: `${(day.revenue / maxRevenue) * 100}%` }}
                >
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatCurrency(day.revenue)}
                  </span>
                </div>
              </div>
            </div>
            <span className="text-sm font-medium text-gray-700 w-24 text-right">{formatCurrency(day.revenue)}</span>
          </div>
        ))}
      </div>
    );
  };

  const AppointmentChart = ({ data }) => {
    if (!data || !data.daily) return null;
    
    const maxCount = Math.max(...data.daily.map(d => d.count), 1);
    
    return (
      <div className="space-y-2">
        {data.daily.slice(0, 7).map((day, index) => (
          <div key={index} className="flex items-center group">
            <span className="text-xs font-medium text-gray-500 w-16">{day.date}</span>
            <div className="flex-1 mx-4">
              <div className="h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-lg group-hover:from-blue-600 group-hover:to-blue-500 transition-all duration-300"
                  style={{ width: `${(day.count / maxCount) * 100}%` }}
                >
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    {day.count}
                  </span>
                </div>
              </div>
            </div>
            <span className="text-sm font-medium text-gray-700 w-16 text-right">{day.count}</span>
          </div>
        ))}
      </div>
    );
  };

  const ServicePopularityChart = ({ data }) => {
    if (!data || !data.services) return null;
    
    const maxCount = Math.max(...data.services.map(s => s.count), 1);
    
    return (
      <div className="space-y-4">
        {data.services.map((service, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">{service.name}</span>
              <span className="text-gray-600">{service.count} ({formatPercentage(service.count, data.total)})</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full"
                style={{ width: `${(service.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const StatCard = ({ title, value, icon, color = 'blue', trend }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 bg-${color}-50 rounded-lg`}>
          <span className="text-2xl">{icon}</span>
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            trend >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );

  const tabs = [
    { id: 'revenue', label: t('reports.revenue', 'Revenue'), icon: '💰' },
    { id: 'appointments', label: t('reports.appointments', 'Appointments'), icon: '📅' },
    { id: 'customers', label: t('reports.customers', 'Customers'), icon: '👥' },
    { id: 'services', label: t('reports.services', 'Services'), icon: '💇' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{t('admin.reports', 'Reports & Analytics')}</h1>
          <p className="text-gray-500 mt-1">{t('reports.description', 'View business insights and performance metrics')}</p>
        </div>
        
        {/* Date Range Picker */}
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 ml-2">{t('common.from')}:</span>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{t('common.to')}:</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => {
              setDateRange({
                start: new Date(new Date().setDate(1)).toISOString().split('T')[0],
                end: new Date().toISOString().split('T')[0]
              });
            }}
            className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            {t('common.thisMonth', 'This Month')}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title={t('reports.totalRevenue', 'Total Revenue')}
          value={formatCurrency(reports?.revenue?.total || 0)}
          icon="💰"
          color="green"
          trend={12}
        />
        <StatCard
          title={t('reports.totalAppointments', 'Total Appointments')}
          value={formatNumber(reports?.appointments?.total || 0)}
          icon="📅"
          color="blue"
          trend={8}
        />
        <StatCard
          title={t('reports.totalCustomers', 'Total Customers')}
          value={formatNumber(reports?.customers?.total || 0)}
          icon="👥"
          color="purple"
          trend={15}
        />
        <StatCard
          title={t('reports.averagePerDay', 'Average per Day')}
          value={formatNumber(reports?.appointments?.averagePerDay || 0)}
          icon="📊"
          color="orange"
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-1 flex items-center gap-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Revenue Tab */}
            {activeTab === 'revenue' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-xl p-4">
                    <p className="text-xs text-green-600 mb-1">{t('reports.totalRevenue')}</p>
                    <p className="text-2xl font-bold text-green-700">{formatCurrency(reports?.revenue?.total || 0)}</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-xs text-blue-600 mb-1">{t('payment.advancePayment')}</p>
                    <p className="text-2xl font-bold text-blue-700">{formatCurrency(reports?.revenue?.advance || 0)}</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4">
                    <p className="text-xs text-purple-600 mb-1">{t('reports.pendingPayments')}</p>
                    <p className="text-2xl font-bold text-purple-700">{formatCurrency(reports?.revenue?.pending || 0)}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('reports.dailyRevenue', 'Daily Revenue')}</h3>
                  <RevenueChart data={reports?.revenue} />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-sm text-gray-500">{t('reports.averageRevenue', 'Average Revenue')}</p>
                    <p className="text-xl font-bold text-gray-800">{formatCurrency(reports?.revenue?.average || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('reports.bestDay', 'Best Day')}</p>
                    <p className="text-xl font-bold text-gray-800">{reports?.revenue?.bestDay || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Appointments Tab */}
            {activeTab === 'appointments' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-xs text-blue-600 mb-1">{t('reports.completed')}</p>
                    <p className="text-2xl font-bold text-blue-700">{reports?.appointments?.completed || 0}</p>
                  </div>
                  <div className="bg-yellow-50 rounded-xl p-4">
                    <p className="text-xs text-yellow-600 mb-1">{t('reports.pending')}</p>
                    <p className="text-2xl font-bold text-yellow-700">{reports?.appointments?.pending || 0}</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4">
                    <p className="text-xs text-red-600 mb-1">{t('reports.cancelled')}</p>
                    <p className="text-2xl font-bold text-red-700">{reports?.appointments?.cancelled || 0}</p>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-4">
                    <p className="text-xs text-orange-600 mb-1">{t('reports.noShow')}</p>
                    <p className="text-2xl font-bold text-orange-700">{reports?.appointments?.noShow || 0}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('reports.dailyAppointments', 'Daily Appointments')}</h3>
                  <AppointmentChart data={reports?.appointments} />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-sm text-gray-500">{t('reports.completionRate', 'Completion Rate')}</p>
                    <p className="text-xl font-bold text-gray-800">
                      {formatPercentage(reports?.appointments?.completed || 0, reports?.appointments?.total || 1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('reports.busiestDay', 'Busiest Day')}</p>
                    <p className="text-xl font-bold text-gray-800">{reports?.appointments?.busiestDay || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Customers Tab */}
            {activeTab === 'customers' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-purple-50 rounded-xl p-4">
                    <p className="text-xs text-purple-600 mb-1">{t('reports.totalCustomers')}</p>
                    <p className="text-2xl font-bold text-purple-700">{reports?.customers?.total || 0}</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <p className="text-xs text-green-600 mb-1">{t('reports.newCustomers')}</p>
                    <p className="text-2xl font-bold text-green-700">{reports?.customers?.new || 0}</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-xs text-blue-600 mb-1">{t('reports.returningCustomers')}</p>
                    <p className="text-2xl font-bold text-blue-700">{reports?.customers?.returning || 0}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">{t('reports.customerDemographics', 'Customer Demographics')}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{t('reports.male')}</span>
                        <span className="font-medium text-gray-800">{reports?.customers?.male || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{t('reports.female')}</span>
                        <span className="font-medium text-gray-800">{reports?.customers?.female || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">{t('reports.averageMetrics', 'Average Metrics')}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{t('reports.visitsPerCustomer')}</span>
                        <span className="font-medium text-gray-800">{reports?.customers?.avgVisits || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{t('reports.spentPerCustomer')}</span>
                        <span className="font-medium text-gray-800">{formatCurrency(reports?.customers?.avgSpent)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-orange-50 rounded-xl p-4">
                    <p className="text-xs text-orange-600 mb-1">{t('reports.totalServices')}</p>
                    <p className="text-2xl font-bold text-orange-700">{reports?.services?.total || 0}</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <p className="text-xs text-green-600 mb-1">{t('reports.activeServices')}</p>
                    <p className="text-2xl font-bold text-green-700">{reports?.services?.active || 0}</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-xs text-blue-600 mb-1">{t('reports.mostPopular')}</p>
                    <p className="text-2xl font-bold text-blue-700">{reports?.services?.mostPopular?.name || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('reports.servicePopularity', 'Service Popularity')}</h3>
                  <ServicePopularityChart data={reports?.services} />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminReports;