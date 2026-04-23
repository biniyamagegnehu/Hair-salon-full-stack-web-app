import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { fetchWorkingHours, updateWorkingHours } from '../../store/slices/adminSlice';
import Skeleton from '../../components/ui/Skeleton/Skeleton';

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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHours(workingHours);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8 sm:mb-12">
        <div>
          <span className="inline-flex px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-xs font-bold uppercase tracking-widest mb-4">Operational Timeline</span>
          <h1 className="text-3xl sm:text-5xl font-bold text-zinc-50 tracking-tight">Studio Access</h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest mt-2 text-xs">Define the tactical availability and deployment window</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={handleReset} 
            className="flex-1 md:flex-none px-6 h-[46px] bg-transparent border border-zinc-700 text-zinc-300 rounded-xl font-bold hover:bg-zinc-800 transition-colors"
          >
            Abort Changes
          </button>
          <button 
            onClick={handleSave} 
            className="flex-1 md:flex-none px-6 h-[46px] bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl font-bold transition-all active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
          >
            Sync Operations
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
            <div>
              {isLoading ? (
                <div className="p-8 space-y-4">
                  {[1, 2, 3, 4, 5, 6, 7].map(i => <div key={i} className="h-[80px] bg-zinc-800 rounded-2xl animate-pulse" />)}
                </div>
              ) : (
                <div className="divide-y divide-zinc-800/50">
                  {hours.map((day, index) => (
                    <div 
                      key={day.dayOfWeek} 
                      className={`flex flex-col md:flex-row md:items-center justify-between p-8 group transition-colors ${
                        day.isClosed ? 'bg-zinc-950' : 'hover:bg-zinc-800/30'
                      }`}
                    >
                      <div className="flex items-center gap-6 mb-4 md:mb-0">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm border transition-all ${
                          day.isClosed 
                            ? 'bg-zinc-900 border-zinc-800 text-zinc-600' 
                            : 'bg-zinc-950 border-zinc-700 text-zinc-100 group-hover:border-amber-500/50 group-hover:text-amber-500'
                        }`}>
                          {days[day.dayOfWeek].substring(0, 3).toUpperCase()}
                        </div>
                        <div>
                          <h3 className={`text-xl font-bold uppercase tracking-tighter ${day.isClosed ? 'text-zinc-600' : 'text-zinc-100'}`}>
                            {days[day.dayOfWeek]}
                          </h3>
                          <span className={`inline-flex px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest mt-1 border ${
                            day.isClosed 
                              ? 'bg-zinc-900 text-zinc-500 border-zinc-800' 
                              : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          }`}>
                            {day.isClosed ? 'OFF GRID' : 'OPERATIONAL'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-8">
                        <div className="flex flex-col items-end">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2 select-none cursor-pointer">
                            Status Toggle
                          </label>
                          <button
                            onClick={() => handleToggleClosed(index)}
                            className={`relative w-14 h-8 rounded-full transition-all duration-500 ${
                              day.isClosed ? 'bg-zinc-800' : 'bg-amber-500'
                            }`}
                          >
                            <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-lg transition-transform duration-500 ${
                              day.isClosed ? 'translate-x-0' : 'translate-x-6'
                            }`} />
                          </button>
                        </div>

                        {!day.isClosed && (
                          <div className="flex items-center gap-4 bg-zinc-950 p-2 rounded-2xl border border-zinc-800 shadow-sm">
                            <div className="flex flex-col px-4">
                              <label className="text-[8px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Deployment</label>
                              <input
                                type="time"
                                value={day.openingTime}
                                onChange={(e) => handleTimeChange(index, 'openingTime', e.target.value)}
                                className="bg-transparent text-zinc-100 font-bold text-lg outline-none focus:text-amber-500 transition-colors"
                                style={{ colorScheme: 'dark' }}
                              />
                            </div>
                            <div className="w-px h-8 bg-zinc-800" />
                            <div className="flex flex-col px-4">
                              <label className="text-[8px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Extraction</label>
                              <input
                                type="time"
                                value={day.closingTime}
                                onChange={(e) => handleTimeChange(index, 'closingTime', e.target.value)}
                                className="bg-transparent text-zinc-100 font-bold text-lg outline-none focus:text-amber-500 transition-colors"
                                style={{ colorScheme: 'dark' }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl relative overflow-hidden">
            <div className="absolute right-0 bottom-0 text-9xl opacity-[0.03] translate-x-8 translate-y-8 pointer-events-none">⌚</div>
            <div className="p-8">
              <span className="inline-flex px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-xs font-bold uppercase tracking-widest mb-4">System Protocol</span>
              <h4 className="text-2xl font-bold text-zinc-50 uppercase tracking-tighter mb-4 leading-tight">Timeline Management</h4>
              <p className="text-zinc-400 font-bold text-sm leading-relaxed mb-6">
                These settings dictate the window of engagement for all incoming client booking requests. Execution times are absolute and will immediately propagate to the frontend booking interface.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-zinc-900 rounded-2xl border border-zinc-800">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 text-xs font-bold border border-amber-500/20">i</div>
                  <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest leading-relaxed">Changes synchronize across all client clusters instantly.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 bg-zinc-900 rounded-3xl border border-dashed border-zinc-700">
            <h5 className="font-bold text-zinc-100 uppercase text-xs tracking-widest mb-4">Tactical Summary</h5>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Weekly Capacity</span>
                <span className="text-sm font-bold text-zinc-100">{hours.filter(h => !h.isClosed).length} / 7 Days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Status</span>
                <span className="inline-flex px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded text-[8px] font-bold uppercase tracking-widest">Live Monitor</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminWorkingHours;
