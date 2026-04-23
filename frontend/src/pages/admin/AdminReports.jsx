/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import {
  fetchRevenueReport,
  fetchAppointmentReport,
  fetchCustomerReport,
  fetchServicePopularityReport
} from '../../store/slices/adminSlice';
import Skeleton from '../../components/ui/Skeleton/Skeleton';
import { ShareIcon } from '@heroicons/react/24/outline';

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

const VisualChart = ({ data, type = 'revenue' }) => {
  if (!data || !data.daily) return (
    <div className="py-20 text-center border-t border-zinc-800 border-dashed">
      <p className="text-[10px] font-bold uppercase text-zinc-500">No historical data in buffer</p>
    </div>
  );
  
  const maxVal = Math.max(...data.daily.map(d => type === 'revenue' ? d.revenue : d.count), 1);
  const colorClass = type === 'revenue' ? 'bg-amber-500' : 'bg-zinc-100';
  
  return (
    <div className="space-y-4">
      {data.daily.slice(0, 10).map((day, index) => (
        <div key={index} className="space-y-1 group">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest mb-1">
            <span className="text-zinc-500 group-hover:text-zinc-300 transition-colors">{day.date}</span>
            <span className="text-zinc-100">{type === 'revenue' ? formatCurrency(day.revenue) : `${day.count} SESSIONS`}</span>
          </div>
          <div className="h-4 bg-zinc-950 rounded-full border border-zinc-800 overflow-hidden relative">
            <div 
              className={`h-full ${colorClass} transition-all duration-1000 ease-out relative`}
              style={{ width: `${(type === 'revenue' ? day.revenue : day.count) / maxVal * 100}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const ServiceVisual = ({ data }) => {
  if (!data || !data.services) return null;
  const maxCount = Math.max(...data.services.map(s => s.count), 1);
  
  return (
    <div className="space-y-6">
      {data.services.map((service, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between items-end">
            <div>
              <p className="font-bold text-zinc-100 uppercase text-sm">{service.name}</p>
              <p className="text-[10px] font-bold text-zinc-500">MARKET DOMINANCE: {formatPercentage(service.count, data.total)}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-zinc-100 text-sm">{service.count}</p>
              <p className="text-[10px] font-bold text-amber-500 uppercase">Engagements</p>
            </div>
          </div>
          <div className="h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
            <div 
              className="h-full bg-amber-500 transition-all duration-700" 
              style={{ width: `${service.count / maxCount * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const AdminReports = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  const { reports, isLoading } = useSelector((state) => state.admin || {});
  
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  
  const [activeTab, setActiveTab] = useState('revenue');

  const loadReports = () => {
    dispatch(fetchRevenueReport({ startDate: dateRange.start, endDate: dateRange.end }));
    dispatch(fetchAppointmentReport({ startDate: dateRange.start, endDate: dateRange.end }));
    dispatch(fetchCustomerReport());
    dispatch(fetchServicePopularityReport());
  };

  useEffect(() => {
    loadReports();
  }, [dateRange, dispatch]);

  const handleShare = async () => {
    const shareData = {
      title: 'Salon Analytics Report',
      text: `Performance Report (${dateRange.start} to ${dateRange.end})`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        toast.success('Report link copied to clipboard!');
        navigator.clipboard.writeText(window.location.href);
      }
    } catch (err) {
      console.log('Error sharing:', err);
    }
  };

  const tabOptions = [
    { id: 'revenue', label: 'Fiscal Revenue', icon: '💰' },
    { id: 'appointments', label: 'Session Velocity', icon: '📅' },
    { id: 'customers', label: 'Client Retention', icon: '👥' },
    { id: 'services', label: 'Service Catalog', icon: '💇' }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Area */}
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6 mb-8 sm:mb-12">
        <div>
          <span className="inline-flex px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-xs font-bold uppercase tracking-widest mb-4">Intelligence Portal</span>
          <h1 className="text-3xl sm:text-5xl font-bold text-zinc-50 tracking-tight">Business Analytics</h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest mt-2 text-xs">Deep-dive into operational performance and growth vectors</p>
        </div>
        
        {/* Date Range Controller */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-zinc-950 border border-zinc-800 p-4 sm:p-5 rounded-3xl shadow-xl w-full xl:w-auto">
          <div className="flex items-center gap-3 flex-1 sm:flex-none">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest sm:ml-2">From</span>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="flex-1 sm:flex-none px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-100 focus:border-amber-500 outline-none transition-colors"
              style={{ colorScheme: 'dark' }}
            />
          </div>
          <div className="flex items-center gap-3 flex-1 sm:flex-none">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">To</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="flex-1 sm:flex-none px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-100 focus:border-amber-500 outline-none transition-colors"
              style={{ colorScheme: 'dark' }}
            />
          </div>
          <div className="hidden sm:block h-8 w-px bg-zinc-800 mx-1" />
          <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            <button
              className="flex-1 sm:flex-none px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
              onClick={() => {
                setDateRange({
                  start: new Date(new Date().setDate(1)).toISOString().split('T')[0],
                  end: new Date().toISOString().split('T')[0]
                });
              }}
            >
              This Month
            </button>
            <button
              onClick={handleShare}
              className="h-[38px] px-4 rounded-xl border border-zinc-700 text-zinc-300 flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors"
              title="Share Report"
            >
              <ShareIcon className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest sm:hidden lg:inline-block">Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl relative group overflow-hidden p-6 sm:p-8">
          <div className="absolute -right-4 -top-4 text-7xl opacity-[0.03] group-hover:scale-110 transition-transform">💰</div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Aggregate Revenue</p>
          <h4 className="text-2xl sm:text-3xl font-bold text-zinc-50 mb-2">{formatCurrency(reports?.revenue?.total || 0)}</h4>
          <span className="inline-flex px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded text-[8px] font-bold uppercase tracking-widest">
            ↑ 12.5% Growth
          </span>
        </div>
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl relative group overflow-hidden p-6 sm:p-8">
          <div className="absolute -right-4 -top-4 text-7xl opacity-[0.03] group-hover:scale-110 transition-transform">📅</div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Total Engagements</p>
          <h4 className="text-2xl sm:text-3xl font-bold text-zinc-50 mb-2">{formatNumber(reports?.appointments?.total || 0)}</h4>
          <span className="inline-flex px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded text-[8px] font-bold uppercase tracking-widest">
            ↑ 8.2% vs Last PRD
          </span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl relative group overflow-hidden p-6 sm:p-8">
          <div className="absolute -right-4 -top-4 text-7xl opacity-[0.03] group-hover:scale-110 transition-transform">👥</div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Unique Clients</p>
          <h4 className="text-2xl sm:text-3xl font-bold text-zinc-50 mb-2">{formatNumber(reports?.customers?.total || 0)}</h4>
          <span className="inline-flex px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded text-[8px] font-bold uppercase tracking-widest">
            PLATINUM LEVEL REACHED
          </span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl relative group overflow-hidden p-6 sm:p-8">
          <div className="absolute -right-4 -top-4 text-7xl opacity-[0.03] group-hover:scale-110 transition-transform">📊</div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Session Density</p>
          <h4 className="text-2xl sm:text-3xl font-bold text-zinc-50 mb-2">{formatNumber(reports?.appointments?.averagePerDay || 0)}</h4>
          <p className="text-[10px] font-bold text-zinc-600 uppercase mt-1">Daily Average</p>
        </div>
      </div>

      {/* Detailed Analysis Tabs */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 mb-8 bg-zinc-950 p-2 rounded-2xl border border-zinc-800">
        {tabOptions.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
              activeTab === tab.id 
                ? 'bg-zinc-900 text-amber-500 shadow-sm border border-zinc-800' 
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {isLoading ? (
          <div className="space-y-6">
            <div className="h-[300px] bg-zinc-900 rounded-3xl animate-pulse"></div>
            <div className="grid grid-cols-2 gap-6">
              <div className="h-[150px] bg-zinc-900 rounded-3xl animate-pulse"></div>
              <div className="h-[150px] bg-zinc-900 rounded-3xl animate-pulse"></div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            {activeTab === 'revenue' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl lg:col-span-2 overflow-hidden">
                  <div className="flex justify-between items-center p-6 bg-zinc-950 border-b border-zinc-800">
                    <h5 className="font-bold text-zinc-100 uppercase text-sm tracking-widest">Revenue Flow (Daily)</h5>
                    <span className="inline-flex px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded text-[8px] font-bold uppercase tracking-widest">
                      Fiscal Analysis
                    </span>
                  </div>
                  <div className="p-8">
                    <VisualChart data={reports?.revenue} type="revenue" />
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Settled Advance</p>
                      <p className="text-xl font-bold text-amber-500">{formatCurrency(reports?.revenue?.advance || 0)}</p>
                    </div>
                    <div className="h-px bg-zinc-800" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Projected Balance</p>
                      <p className="text-xl font-bold text-zinc-100">{formatCurrency(reports?.revenue?.pending || 0)}</p>
                    </div>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Peak Performance Day</p>
                      <p className="text-lg font-bold text-zinc-100">{reports?.revenue?.bestDay || 'N/A'}</p>
                    </div>
                    <div className="h-px bg-zinc-800" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Average Unit Revenue</p>
                      <p className="text-lg font-bold text-zinc-100">{formatCurrency(reports?.revenue?.average || 0)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appointments' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl lg:col-span-2 overflow-hidden">
                  <div className="flex justify-between items-center p-6 bg-zinc-950 border-b border-zinc-800">
                    <h5 className="font-bold text-zinc-100 uppercase text-sm tracking-widest">Operational Density</h5>
                    <span className="inline-flex px-2 py-0.5 bg-zinc-800 text-zinc-400 border border-zinc-700 rounded text-[8px] font-bold uppercase tracking-widest">
                      Activity Metrics
                    </span>
                  </div>
                  <div className="p-8">
                    <VisualChart data={reports?.appointments} type="appointments" />
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-emerald-500 text-center">
                      <p className="text-[10px] font-bold uppercase mb-1">Success</p>
                      <p className="text-xl font-bold">{reports?.appointments?.completed || 0}</p>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-center">
                      <p className="text-[10px] font-bold uppercase text-zinc-500 mb-1">Pending</p>
                      <p className="text-xl font-bold text-zinc-100">{reports?.appointments?.pending || 0}</p>
                    </div>
                    <div className="bg-red-500/10 p-4 rounded-2xl border border-red-500/20 text-center">
                      <p className="text-[10px] font-bold uppercase text-red-500 mb-1">Dropped</p>
                      <p className="text-xl font-bold text-red-500">{reports?.appointments?.cancelled || 0}</p>
                    </div>
                    <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20 text-center">
                      <p className="text-[10px] font-bold uppercase text-amber-500 mb-1">No-Show</p>
                      <p className="text-xl font-bold text-amber-500">{reports?.appointments?.noShow || 0}</p>
                    </div>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                    <p className="text-[10px] font-bold uppercase text-zinc-500 mb-1">Completion Efficiency</p>
                    <p className="text-3xl font-bold text-zinc-50">
                      {formatPercentage(reports?.appointments?.completed || 0, reports?.appointments?.total || 1)}
                    </p>
                    <div className="w-full bg-zinc-950 h-2 rounded-full mt-4 overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-1000" 
                        style={{ width: formatPercentage(reports?.appointments?.completed || 0, reports?.appointments?.total || 1) }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'customers' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 text-center">
                    <p className="text-[10px] font-bold uppercase text-zinc-500 mb-2">New Acquisitions</p>
                    <p className="text-4xl font-bold text-amber-500">{reports?.customers?.new || 0}</p>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-center">
                    <p className="text-[10px] font-bold uppercase text-zinc-500 mb-2">Returning Assets</p>
                    <p className="text-4xl font-bold text-zinc-100">{reports?.customers?.returning || 0}</p>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-center">
                    <p className="text-[10px] font-bold uppercase text-zinc-500 mb-2">Lifetime Avg Spend</p>
                    <p className="text-4xl font-bold text-zinc-100">{formatCurrency(reports?.customers?.avgSpent)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
                    <div className="p-6 bg-zinc-950 border-b border-zinc-800">
                      <h5 className="font-bold text-zinc-100 uppercase text-sm tracking-widest">Market Demographics</h5>
                    </div>
                    <div className="p-8">
                      <div className="flex gap-4 items-end h-32 relative">
                        <div className="flex-1 flex flex-col items-center gap-2">
                          <div className="h-24 w-full rounded-t-lg bg-zinc-700 transition-all duration-700" />
                          <p className="text-[10px] font-bold text-zinc-400 uppercase">Male ({reports?.customers?.male || 0})</p>
                        </div>
                        <div className="flex-1 flex flex-col items-center gap-2">
                          <div className="h-20 w-full rounded-t-lg bg-amber-500 transition-all duration-700" />
                          <p className="text-[10px] font-bold text-amber-500 uppercase">Female ({reports?.customers?.female || 0})</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
                    <div className="p-6 bg-zinc-950 border-b border-zinc-800">
                      <h5 className="font-bold text-zinc-100 uppercase text-sm tracking-widest">Engagement Depth</h5>
                    </div>
                    <div className="p-8">
                      <div className="flex justify-between items-center bg-zinc-950 border border-zinc-800 p-6 rounded-2xl">
                        <div>
                          <p className="text-[10px] font-bold uppercase text-zinc-500">Visits Per Client</p>
                          <p className="text-4xl font-bold text-zinc-50 mt-1">{reports?.customers?.avgVisits || 0}</p>
                        </div>
                        <div className="text-5xl opacity-20">📈</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'services' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
                  <div className="p-6 bg-zinc-950 border-b border-zinc-800 flex justify-between items-center">
                    <h5 className="font-bold text-zinc-100 uppercase text-sm tracking-widest">Service Dominance Matrix</h5>
                    <span className="inline-flex px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded text-[8px] font-bold uppercase tracking-widest">
                      Popularity
                    </span>
                  </div>
                  <div className="p-8">
                    <ServiceVisual data={reports?.services} />
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 text-center">
                      <p className="text-[10px] font-bold uppercase text-zinc-500 mb-2">Portfolio Size</p>
                      <p className="text-3xl font-bold text-zinc-100">{reports?.services?.total || 0}</p>
                    </div>
                    <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-3xl p-6 text-center">
                      <p className="text-[10px] font-bold uppercase text-amber-500 mb-2">Flagship Service</p>
                      <p className="text-xl font-bold text-amber-500 uppercase">{reports?.services?.mostPopular?.name || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-3xl relative group overflow-hidden p-8 space-y-4">
                    <div className="absolute right-0 bottom-0 text-9xl opacity-[0.03] translate-x-4 translate-y-4">✂️</div>
                    <h6 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Operational Insight</h6>
                    <p className="text-zinc-400 font-bold text-sm leading-relaxed relative z-10">
                      The current most popular service is <span className="text-zinc-100 font-bold uppercase">"{reports?.services?.mostPopular?.name}"</span>. 
                      Maintaining high throughput for this category is critical for session density stabilization.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReports;
