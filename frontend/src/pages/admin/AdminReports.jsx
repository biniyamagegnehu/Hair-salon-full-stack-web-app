import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  fetchRevenueReport,
  fetchAppointmentReport,
  fetchCustomerReport,
  fetchServicePopularityReport
} from '../../store/slices/adminSlice';
import Card, { CardHeader, CardBody } from '../../components/ui/Card/Card';
import Badge from '../../components/ui/Badge/Badge';
import Button from '../../components/ui/Button/Button';
import Input from '../../components/ui/Input/Input';
import Tabs from '../../components/ui/Tabs/Tabs';
import Skeleton from '../../components/ui/Skeleton/Skeleton';
import './AdminPages.css';

const AdminReports = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  const { reports, isLoading } = useSelector((state) => state.admin || {});
  
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  
  const [activeTab, setActiveTab] = useState('revenue');

  useEffect(() => {
    loadReports();
  }, [dateRange, dispatch]);

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

  const VisualChart = ({ data, type = 'revenue' }) => {
    if (!data || !data.daily) return (
      <div className="py-20 text-center">
        <p className="text-[10px] font-black uppercase text-secondary-brown opacity-40">No historical data in buffer</p>
      </div>
    );
    
    const maxVal = Math.max(...data.daily.map(d => type === 'revenue' ? d.revenue : d.count), 1);
    const colorClass = type === 'revenue' ? 'bg-gold' : 'bg-black';
    
    return (
      <div className="space-y-4">
        {data.daily.slice(0, 10).map((day, index) => (
          <div key={index} className="space-y-1 group">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest mb-1">
              <span className="text-secondary-brown opacity-60 group-hover:opacity-100 transition-opacity">{day.date}</span>
              <span className="text-black">{type === 'revenue' ? formatCurrency(day.revenue) : `${day.count} SESSIONS`}</span>
            </div>
            <div className="h-4 bg-background-cream rounded-full border border-border-primary overflow-hidden relative">
              <div 
                className={`h-full ${colorClass} transition-all duration-1000 ease-out relative`}
                style={{ width: `${((type === 'revenue' ? day.revenue : day.count) / maxVal) * 100}%` }}
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
                <p className="font-black text-black uppercase text-sm tracking-tighter">{service.name}</p>
                <p className="text-[10px] font-bold text-secondary-brown opacity-40">MARKET DOMINANCE: {formatPercentage(service.count, data.total)}</p>
              </div>
              <div className="text-right">
                <p className="font-black text-black text-sm">{service.count}</p>
                <p className="text-[10px] font-black text-gold uppercase">Engagements</p>
              </div>
            </div>
            <div className="h-2 bg-background-cream rounded-full overflow-hidden border border-border-primary">
              <div 
                className="h-full bg-black transition-all duration-700"
                style={{ width: `${(service.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const tabOptions = [
    { id: 'revenue', label: 'Fiscal Revenue', icon: '💰' },
    { id: 'appointments', label: 'Session Velocity', icon: '📅' },
    { id: 'customers', label: 'Client Retention', icon: '👥' },
    { id: 'services', label: 'Service Catalog', icon: '💇' }
  ];

  return (
    <div className="admin-page animate-fade-in">
      {/* Header Area */}
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6 mb-8 sm:mb-12">
        <div>
          <Badge variant="gold" className="mb-4">Intelligence Portal</Badge>
          <h1 className="text-3xl sm:text-5xl font-black text-black uppercase tracking-tight">Business Analytics</h1>
          <p className="text-secondary-brown font-bold opacity-40 mt-1 text-sm sm:text-base">Deep-dive into operational performance and growth vectors</p>
        </div>
        
        {/* Date Range Controller */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-black p-4 sm:p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-2">From</span>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="flex-1 sm:flex-none px-4 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs font-bold text-white focus:border-gold outline-none transition-colors"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">To</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="flex-1 sm:flex-none px-4 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs font-bold text-white focus:border-gold outline-none transition-colors"
            />
          </div>
          <div className="hidden sm:block h-8 w-px bg-white/10 mx-2" />
          <Button
            variant="gold"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => {
              setDateRange({
                start: new Date(new Date().setDate(1)).toISOString().split('T')[0],
                end: new Date().toISOString().split('T')[0]
              });
            }}
          >
            Current Month
          </Button>
        </div>
      </div>
          {/* Primary KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
        <Card variant="black" className="relative group overflow-hidden">
          <div className="absolute -right-4 -top-4 text-7xl opacity-5 group-hover:scale-110 transition-transform">💰</div>
          <CardBody className="p-6 sm:p-8">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Aggregate Revenue</p>
            <h4 className="text-2xl sm:text-3xl font-black text-white mb-2">{formatCurrency(reports?.revenue?.total || 0)}</h4>
            <Badge variant="gold" size="xs">↑ 12.5% Growth</Badge>
          </CardBody>
        </Card>
        
        <Card className="relative group overflow-hidden">
          <div className="absolute -right-4 -top-4 text-7xl opacity-5 group-hover:scale-110 transition-transform">📅</div>
          <CardBody className="p-6 sm:p-8">
            <p className="text-[10px] font-black uppercase tracking-widest text-secondary-brown mb-2">Total Engagements</p>
            <h4 className="text-2xl sm:text-3xl font-black text-black mb-2">{formatNumber(reports?.appointments?.total || 0)}</h4>
            <Badge variant="success" size="xs">↑ 8.2% vs Last PRD</Badge>
          </CardBody>
        </Card>
 
        <Card className="relative group overflow-hidden">
          <div className="absolute -right-4 -top-4 text-7xl opacity-5 group-hover:scale-110 transition-transform">👥</div>
          <CardBody className="p-6 sm:p-8">
            <p className="text-[10px] font-black uppercase tracking-widest text-secondary-brown mb-2">Unique Clients</p>
            <h4 className="text-2xl sm:text-3xl font-black text-black mb-2">{formatNumber(reports?.customers?.total || 0)}</h4>
            <Badge variant="gold" size="xs">PLATINUM LEVEL REACHED</Badge>
          </CardBody>
        </Card>
 
        <Card className="relative group overflow-hidden">
          <div className="absolute -right-4 -top-4 text-7xl opacity-5 group-hover:scale-110 transition-transform">📊</div>
          <CardBody className="p-6 sm:p-8">
            <p className="text-[10px] font-black uppercase tracking-widest text-secondary-brown mb-2">Session Density</p>
            <h4 className="text-2xl sm:text-3xl font-black text-black mb-2">{formatNumber(reports?.appointments?.averagePerDay || 0)}</h4>
            <p className="text-[10px] font-bold text-secondary-brown opacity-40 uppercase mt-1">Daily Average</p>
          </CardBody>
        </Card>
      </div>

      {/* Detailed Analysis Tabs */}
      <Tabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={tabOptions}
        variant="gold"
      />

      <div className="mt-8">
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton height="300px" variant="rectangle" />
            <div className="grid grid-cols-2 gap-6">
              <Skeleton height="150px" variant="rectangle" />
              <Skeleton height="150px" variant="rectangle" />
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            {activeTab === 'revenue' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2">
                  <CardHeader className="flex justify-between items-center p-6 border-b border-border-primary">
                    <h5 className="font-black text-black uppercase text-sm tracking-widest">Revenue Flow (Daily)</h5>
                    <Badge variant="gold">Fiscal Analysis</Badge>
                  </CardHeader>
                  <CardBody className="p-8">
                    <VisualChart data={reports?.revenue} type="revenue" />
                  </CardBody>
                </Card>
                <div className="space-y-6">
                  <Card variant="black">
                    <CardBody className="p-6 space-y-4 text-white">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Settled Advance</p>
                        <p className="text-xl font-black text-gold">{formatCurrency(reports?.revenue?.advance || 0)}</p>
                      </div>
                      <div className="h-px bg-white/10" />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Projected Balance</p>
                        <p className="text-xl font-black">{formatCurrency(reports?.revenue?.pending || 0)}</p>
                      </div>
                    </CardBody>
                  </Card>
                  <Card variant="default">
                    <CardBody className="p-6 space-y-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-secondary-brown opacity-40">Peak Performance Day</p>
                        <p className="text-lg font-black text-black">{reports?.revenue?.bestDay || 'N/A'}</p>
                      </div>
                      <div className="h-px bg-border-primary" />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-secondary-brown opacity-40">Average Unit Revenue</p>
                        <p className="text-lg font-black text-black">{formatCurrency(reports?.revenue?.average || 0)}</p>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'appointments' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2">
                  <CardHeader className="flex justify-between items-center p-6 border-b border-border-primary">
                    <h5 className="font-black text-black uppercase text-sm tracking-widest">Operational Density</h5>
                    <Badge variant="dark">Activity Metrics</Badge>
                  </CardHeader>
                  <CardBody className="p-8">
                    <VisualChart data={reports?.appointments} type="appointments" />
                  </CardBody>
                </Card>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black p-4 rounded-xl text-white text-center">
                      <p className="text-[10px] font-black uppercase text-white/40 mb-1">Success</p>
                      <p className="text-xl font-black">{reports?.appointments?.completed || 0}</p>
                    </div>
                    <div className="bg-background-cream p-4 rounded-xl border border-border-primary text-center">
                      <p className="text-[10px] font-black uppercase text-secondary-brown opacity-40 mb-1">Pending</p>
                      <p className="text-xl font-black">{reports?.appointments?.pending || 0}</p>
                    </div>
                    <div className="bg-error/10 p-4 rounded-xl border border-error/10 text-center">
                      <p className="text-[10px] font-black uppercase text-error mb-1">Dropped</p>
                      <p className="text-xl font-black text-error">{reports?.appointments?.cancelled || 0}</p>
                    </div>
                    <div className="bg-secondary-brown/10 p-4 rounded-xl border border-secondary-brown/10 text-center">
                      <p className="text-[10px] font-black uppercase text-secondary-brown mb-1">No-Show</p>
                      <p className="text-xl font-black">{reports?.appointments?.noShow || 0}</p>
                    </div>
                  </div>
                  <Card>
                    <CardBody className="p-6">
                      <p className="text-[10px] font-black uppercase text-secondary-brown opacity-40 mb-1">Completion Efficiency</p>
                      <p className="text-3xl font-black text-black">
                        {formatPercentage(reports?.appointments?.completed || 0, reports?.appointments?.total || 1)}
                      </p>
                      <div className="w-full bg-background-cream h-1 rounded-full mt-4 overflow-hidden">
                        <div 
                          className="bg-black h-full transition-all duration-1000" 
                          style={{ width: formatPercentage(reports?.appointments?.completed || 0, reports?.appointments?.total || 1)}} 
                        />
                      </div>
                    </CardBody>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'customers' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card variant="black" className="p-6 text-center text-white">
                    <p className="text-[10px] font-black uppercase opacity-40 mb-2">New Acquisitions</p>
                    <p className="text-4xl font-black text-gold">{reports?.customers?.new || 0}</p>
                  </Card>
                  <Card className="p-6 text-center">
                    <p className="text-[10px] font-black uppercase opacity-40 mb-2 text-secondary-brown">Returning Assets</p>
                    <p className="text-4xl font-black text-black">{reports?.customers?.returning || 0}</p>
                  </Card>
                  <Card className="p-6 text-center">
                    <p className="text-[10px] font-black uppercase opacity-40 mb-2 text-secondary-brown">Lifetime Avg Spend</p>
                    <p className="text-4xl font-black text-black">{formatCurrency(reports?.customers?.avgSpent)}</p>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card>
                    <CardHeader className="p-6 border-b border-border-primary">
                      <h5 className="font-black text-black uppercase text-sm tracking-widest">Market Demographics</h5>
                    </CardHeader>
                    <CardBody className="p-8">
                      <div className="flex gap-4 items-end h-32 relative">
                        <div className="flex-1 flex flex-col items-center gap-2">
                          <div className="w-full bg-black rounded-t-lg transition-all duration-700" style={{ height: `${(reports?.customers?.male / (reports?.customers?.male + reports?.customers?.female)) * 100}%` }} />
                          <p className="text-[10px] font-black uppercase">Male ({reports?.customers?.male || 0})</p>
                        </div>
                        <div className="flex-1 flex flex-col items-center gap-2">
                          <div className="w-full bg-gold rounded-t-lg transition-all duration-700" style={{ height: `${(reports?.customers?.female / (reports?.customers?.male + reports?.customers?.female)) * 100}%` }} />
                          <p className="text-[10px] font-black uppercase">Female ({reports?.customers?.female || 0})</p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                  <Card>
                    <CardHeader className="p-6 border-b border-border-primary">
                      <h5 className="font-black text-black uppercase text-sm tracking-widest">Engagement Depth</h5>
                    </CardHeader>
                    <CardBody className="p-8">
                      <div className="flex justify-between items-center bg-background-cream p-6 rounded-2xl">
                        <div>
                          <p className="text-[10px] font-black uppercase text-secondary-brown opacity-40">Visits Per Client</p>
                          <p className="text-4xl font-black text-black mt-1">{reports?.customers?.avgVisits || 0}</p>
                        </div>
                        <div className="text-5xl opacity-10">📈</div>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'services' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader className="p-6 border-b border-border-primary flex justify-between items-center">
                    <h5 className="font-black text-black uppercase text-sm tracking-widest">Service Dominance Matrix</h5>
                    <Badge variant="gold">Popularity</Badge>
                  </CardHeader>
                  <CardBody className="p-8">
                    <ServiceVisual data={reports?.services} />
                  </CardBody>
                </Card>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <Card variant="black" className="p-6 text-center text-white">
                      <p className="text-[10px] font-black uppercase opacity-40 mb-2">Portfolio Size</p>
                      <p className="text-3xl font-black">{reports?.services?.total || 0}</p>
                    </Card>
                    <Card className="p-6 text-center border-accent-gold border-2">
                      <p className="text-[10px] font-black uppercase text-gold mb-2">Flagship Service</p>
                      <p className="text-xl font-black text-black uppercase">{reports?.services?.mostPopular?.name || 'N/A'}</p>
                    </Card>
                  </div>
                  <Card variant="default" className="relative group overflow-hidden">
                    <div className="absolute right-0 bottom-0 text-9xl opacity-5 translate-x-4 translate-y-4">✂️</div>
                    <CardBody className="p-8 space-y-4">
                      <h6 className="text-[10px] font-black uppercase tracking-widest text-secondary-brown opacity-50">Operational Insight</h6>
                      <p className="text-secondary-brown font-bold text-sm leading-relaxed">
                        The current most popular service is <span className="text-black font-black uppercase">"{reports?.services?.mostPopular?.name}"</span>. 
                        Maintaining high throughput for this category is critical for session density stabilization.
                      </p>
                    </CardBody>
                  </Card>
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