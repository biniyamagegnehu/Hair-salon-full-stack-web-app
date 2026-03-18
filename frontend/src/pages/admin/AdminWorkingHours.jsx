import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { fetchWorkingHours, updateWorkingHours } from '../../store/slices/adminSlice';
import Card, { CardHeader, CardBody } from '../../components/ui/Card/Card';
import Badge from '../../components/ui/Badge/Badge';
import Button from '../../components/ui/Button/Button';
import Skeleton from '../../components/ui/Skeleton/Skeleton';
import './AdminPages.css';

const AdminWorkingHours = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { workingHours, isLoading } = useSelector((state) => state.admin);
  const [hours, setHours] = useState([]);

  const days = [
    t('days.sunday', 'Sunday'),
    t('days.monday', 'Monday'),
    t('days.tuesday', 'Tuesday'),
    t('days.wednesday', 'Wednesday'),
    t('days.thursday', 'Thursday'),
    t('days.friday', 'Friday'),
    t('days.saturday', 'Saturday')
  ];

  useEffect(() => {
    dispatch(fetchWorkingHours());
  }, [dispatch]);

  useEffect(() => {
    if (workingHours.length > 0) {
      setHours(workingHours);
    } else {
      setHours(
        days.map((_, index) => ({
          dayOfWeek: index,
          openingTime: index === 0 ? '09:00' : '08:00',
          closingTime: index === 0 ? '17:00' : '20:00',
          isClosed: index === 0
        }))
      );
    }
  }, [workingHours]);

  const handleToggleClosed = (index) => {
    const updated = [...hours];
    updated[index].isClosed = !updated[index].isClosed;
    setHours(updated);
  };

  const handleTimeChange = (index, field, value) => {
    const updated = [...hours];
    updated[index][field] = value;
    setHours(updated);
  };

  const handleSave = async () => {
    try {
      await dispatch(updateWorkingHours(hours)).unwrap();
      toast.success('Operational timeline synchronized');
    } catch (error) {
      toast.error(error || t('common.error'));
    }
  };

  const handleReset = () => {
    if (workingHours.length > 0) {
      setHours(workingHours);
    }
  };

  return (
    <div className="admin-page animate-fade-in">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8 sm:mb-12">
        <div>
          <Badge variant="gold" className="mb-4">Operational Timeline</Badge>
          <h1 className="text-3xl sm:text-5xl font-black text-black uppercase tracking-tight">Studio Access</h1>
          <p className="text-secondary-brown font-bold opacity-40 mt-1 text-sm sm:text-base">Define the tactical availability and deployment window</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button variant="outline" onClick={handleReset} className="flex-1 md:flex-none">Abort Changes</Button>
          <Button variant="gold" onClick={handleSave} className="flex-1 md:flex-none">Sync Operations</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8">
          <Card className="overflow-hidden bg-white">
            <CardBody className="p-0">
              {isLoading ? (
                <div className="p-8 space-y-4">
                  {[1, 2, 3, 4, 5, 6, 7].map(i => <Skeleton key={i} height="80px" variant="rectangle" />)}
                </div>
              ) : (
                <div className="divide-y divide-border-primary">
                  {hours.map((day, index) => (
                    <div 
                      key={day.dayOfWeek} 
                      className={`flex flex-col md:flex-row md:items-center justify-between p-8 group transition-colors ${
                        day.isClosed ? 'bg-background-cream/30' : 'hover:bg-background-cream/10'
                      }`}
                    >
                      <div className="flex items-center gap-6 mb-4 md:mb-0">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm border-2 transition-all ${
                          day.isClosed 
                            ? 'bg-zinc-100 border-zinc-200 text-zinc-400 grayscale' 
                            : 'bg-black border-black text-white group-hover:bg-gold group-hover:border-gold'
                        }`}>
                          {days[day.dayOfWeek].substring(0, 3).toUpperCase()}
                        </div>
                        <div>
                          <h3 className={`text-xl font-black uppercase tracking-tighter ${day.isClosed ? 'text-zinc-400' : 'text-black'}`}>
                            {days[day.dayOfWeek]}
                          </h3>
                          <Badge variant={day.isClosed ? 'dark' : 'success'} size="xs" className="mt-1">
                            {day.isClosed ? 'OFF GRID' : 'OPERATIONAL'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-8">
                        <div className="flex flex-col items-end">
                          <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brown opacity-40 mb-2 select-none cursor-pointer">
                            Status Toggle
                          </label>
                          <button
                            onClick={() => handleToggleClosed(index)}
                            className={`relative w-14 h-8 rounded-full transition-all duration-500 ${
                              day.isClosed ? 'bg-zinc-200' : 'bg-gold'
                            }`}
                          >
                            <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-lg transition-transform duration-500 ${
                              day.isClosed ? 'translate-x-0' : 'translate-x-6'
                            }`} />
                          </button>
                        </div>

                        {!day.isClosed && (
                          <div className="flex items-center gap-4 bg-black p-2 rounded-2xl shadow-xl">
                            <div className="flex flex-col px-4">
                              <label className="text-[8px] font-black uppercase tracking-widest text-white/30 mb-1">Deployment</label>
                              <input
                                type="time"
                                value={day.openingTime}
                                onChange={(e) => handleTimeChange(index, 'openingTime', e.target.value)}
                                className="bg-transparent text-white font-black text-lg outline-none focus:text-gold transition-colors"
                              />
                            </div>
                            <div className="w-px h-8 bg-white/10" />
                            <div className="flex flex-col px-4">
                              <label className="text-[8px] font-black uppercase tracking-widest text-white/30 mb-1">Extraction</label>
                              <input
                                type="time"
                                value={day.closingTime}
                                onChange={(e) => handleTimeChange(index, 'closingTime', e.target.value)}
                                className="bg-transparent text-white font-black text-lg outline-none focus:text-gold transition-colors"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card variant="black" className="relative overflow-hidden">
            <div className="absolute right-0 bottom-0 text-9xl opacity-10 translate-x-8 translate-y-8 pointer-events-none">⌚</div>
            <CardBody className="p-8">
              <Badge variant="gold" className="mb-4">System Protocol</Badge>
              <h4 className="text-2xl font-black text-white uppercase tracking-tighter mb-4 leading-tight">Timeline Management</h4>
              <p className="text-white/60 font-bold text-sm leading-relaxed mb-6 italic">
                These settings dictate the window of engagement for all incoming client booking requests. Execution times are absolute and will immediately propagate to the frontend booking interface.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold text-xs">ℹ</div>
                  <p className="text-[10px] font-bold text-white uppercase tracking-widest opacity-80 leading-relaxed">Changes synchronize across all client clusters instantly.</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <div className="p-8 bg-background-cream rounded-3xl border-2 border-dashed border-border-primary">
            <h5 className="font-black text-black uppercase text-xs tracking-widest mb-4">Tactical Summary</h5>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-secondary-brown uppercase tracking-widest opacity-60">Weekly Capacity</span>
                <span className="text-sm font-black text-black">{hours.filter(h => !h.isClosed).length} / 7 Days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-secondary-brown uppercase tracking-widest opacity-60">Status</span>
                <Badge variant="success" size="xs">Live Monitor</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminWorkingHours;