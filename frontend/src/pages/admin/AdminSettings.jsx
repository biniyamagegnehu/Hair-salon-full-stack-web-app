import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import {
  fetchSalonConfig,
  updateSalonConfig,
  changeAdminPassword,
  fetchAuditLogs
} from '../../store/slices/adminSlice';
import Skeleton from '../../components/ui/Skeleton/Skeleton';

const AccordionItem = ({ id, label, icon, children, activeTab, expandedSection, setExpandedSection }) => {
  return (
    <div className={`mb-4 lg:mb-0 lg:block ${activeTab === id ? '' : 'lg:hidden'}`}>
      <button 
        className={`w-full p-5 flex justify-between items-center font-bold uppercase text-sm lg:hidden bg-zinc-900 border border-zinc-800 shadow-sm ${expandedSection === id ? 'rounded-t-2xl' : 'rounded-2xl'}`}
        onClick={() => setExpandedSection(expandedSection === id ? '' : id)}
      >
        <div className="flex items-center gap-3 text-zinc-100">
          <span className="text-xl">{icon}</span> 
          <span>{label}</span>
        </div>
        <span className="text-amber-500 text-lg">{expandedSection === id ? '−' : '+'}</span>
      </button>
      <div className={`
        ${expandedSection === id ? 'block' : 'hidden lg:block'} 
        p-5 lg:p-0 border-x border-b lg:border-none border-zinc-800 rounded-b-2xl lg:rounded-none bg-zinc-900 lg:bg-transparent
      `}>
        {children}
      </div>
    </div>
  );
};

const AdminSettings = () => {
  const { i18n, t } = useTranslation();
  const dispatch = useDispatch();
  
  const { salonConfig, auditLogs, isLoading } = useSelector((state) => state.admin || {});
  
  const [activeTab, setActiveTab] = useState('general');
  const [expandedSection, setExpandedSection] = useState('general'); // For mobile accordion
  const [formData, setFormData] = useState({
    salonName: { am: '', en: '' },
    location: { am: '', en: '' },
    description: { am: '', en: '' },
    contactPhone: '',
    contactEmail: '',
    advancePaymentPercentage: 50,
    workingHours: {
      monday: { open: '08:00', close: '20:00', closed: false },
      tuesday: { open: '08:00', close: '20:00', closed: false },
      wednesday: { open: '08:00', close: '20:00', closed: false },
      thursday: { open: '08:00', close: '20:00', closed: false },
      friday: { open: '08:00', close: '20:00', closed: false },
      saturday: { open: '08:00', close: '20:00', closed: false },
      sunday: { open: '09:00', close: '17:00', closed: true }
    },
    notifications: {
      email: true,
      sms: true,
      appointmentReminders: true,
      marketingEmails: false
    },
    businessHours: {
      timezone: 'Africa/Addis_Ababa',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h'
    }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    dispatch(fetchSalonConfig());
    dispatch(fetchAuditLogs({ page: 1, limit: 10 }));
  }, [dispatch]);

  useEffect(() => {
    if (salonConfig) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(prev => ({
        ...prev,
        ...salonConfig
      }));
    }
  }, [salonConfig]);

  const handleInputChange = (field, lang, value) => {
    if (field === 'salonName' || field === 'location' || field === 'description') {
      setFormData({
        ...formData,
        [field]: {
          ...formData[field],
          [lang]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [field]: value
      });
    }
  };

  const handleWorkingHoursChange = (day, field, value) => {
    setFormData({
      ...formData,
      workingHours: {
        ...formData.workingHours,
        [day]: {
          ...formData.workingHours[day],
          [field]: value
        }
      }
    });
  };

  const handleNotificationChange = (key, value) => {
    setFormData({
      ...formData,
      notifications: {
        ...formData.notifications,
        [key]: value
      }
    });
  };

  const handleSaveGeneral = async () => {
    try {
      await dispatch(updateSalonConfig({
        salonName: formData.salonName,
        location: formData.location,
        description: formData.description,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        advancePaymentPercentage: formData.advancePaymentPercentage
      })).unwrap();
      toast.success('Core configuration synchronized');
    } catch (error) {
      toast.error(error || t('common.error'));
    }
  };

  const handleSaveWorkingHours = async () => {
    try {
      await dispatch(updateSalonConfig({
        workingHours: formData.workingHours
      })).unwrap();
      toast.success('Operational window updated');
    } catch (error) {
      toast.error(error || t('common.error'));
    }
  };

  const handleSaveNotifications = async () => {
    try {
      await dispatch(updateSalonConfig({
        notifications: formData.notifications
      })).unwrap();
      toast.success('Communication protocols set');
    } catch (error) {
      toast.error(error || t('common.error'));
    }
  };

  const handleSaveBusinessHours = async () => {
    try {
      await dispatch(updateSalonConfig({
        businessHours: formData.businessHours
      })).unwrap();
      toast.success('Regional settings synchronized');
    } catch (error) {
      toast.error(error || t('common.error'));
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError(t('settings.passwordsDoNotMatch', 'Passwords do not match'));
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError(t('settings.passwordTooShort', 'Password must be at least 8 characters'));
      return;
    }

    try {
      await dispatch(changeAdminPassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })).unwrap();
      
      toast.success(t('settings.passwordChanged', 'Security credentials updated'));
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordError('');
    } catch (error) {
      toast.error(error || t('common.error'));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const settingTabs = [
    { id: 'general', label: t('settings.general', 'General'), icon: '⚙️' },
    { id: 'working-hours', label: t('settings.workingHours', 'Working Hours'), icon: '⏰' },
    { id: 'notifications', label: t('settings.notifications', 'Notifications'), icon: '🔔' },
    { id: 'business', label: t('settings.business', 'Business'), icon: '📅' },
    { id: 'security', label: t('settings.security', 'Security'), icon: '🔒' },
    { id: 'audit', label: t('settings.auditLogs', 'Audit Logs'), icon: '📋' }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 px-4 md:px-0">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8 sm:mb-12">
        <div>
          <span className="inline-flex px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-xs font-bold uppercase tracking-widest mb-4">System Architecture</span>
          <h1 className="text-3xl sm:text-5xl font-bold text-zinc-50 tracking-tight">Global Settings</h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest mt-2 text-xs">Configure core salon parameters and security protocols</p>
        </div>
        <div className="flex items-center gap-3 bg-zinc-900 px-5 py-3 rounded-xl border border-zinc-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Language</span>
          <select 
            className="bg-transparent font-bold text-xs outline-none text-zinc-100 uppercase"
            value={i18n.language}
            onChange={(e) => i18n.changeLanguage(e.target.value)}
          >
            <option value="en">ENGLISH</option>
            <option value="am">AMHARIC</option>
          </select>
        </div>
      </div>

      <div className="hidden lg:flex overflow-x-auto no-scrollbar gap-2 mb-8 bg-zinc-950 p-2 rounded-2xl border border-zinc-800">
        {settingTabs.map((tab) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl min-h-[600px] overflow-hidden">
            <div className="p-8 md:p-12">
              {isLoading ? (
                <div className="space-y-8">
                  <div className="h-[60px] bg-zinc-800 rounded-xl animate-pulse"></div>
                  <div className="h-[120px] bg-zinc-800 rounded-xl animate-pulse"></div>
                  <div className="h-[60px] bg-zinc-800 rounded-xl animate-pulse"></div>
                </div>
              ) : (
                <>
                  {/* General Settings */}
                  <AccordionItem id="general" label={t('settings.general', 'General')} icon="⚙️" activeTab={activeTab} expandedSection={expandedSection} setExpandedSection={setExpandedSection}>
                    <div className="space-y-10 animate-in fade-in duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Salon Label (EN)</label>
                          <input
                            type="text"
                            placeholder="X Men's Hair Salon"
                            value={formData.salonName?.en || ''}
                            onChange={(e) => handleInputChange('salonName', 'en', e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm font-bold text-zinc-100 focus:border-amber-500 outline-none placeholder:text-zinc-600 transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Salon Label (AM)</label>
                          <input
                            type="text"
                            placeholder="ኤክስ የወንዶች ፀጉር ቤት"
                            value={formData.salonName?.am || ''}
                            onChange={(e) => handleInputChange('salonName', 'am', e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm font-bold text-zinc-100 focus:border-amber-500 outline-none placeholder:text-zinc-600 transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Deployment Area (EN)</label>
                          <input
                            type="text"
                            placeholder="Addis Ababa, Ethiopia"
                            value={formData.location?.en || ''}
                            onChange={(e) => handleInputChange('location', 'en', e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm font-bold text-zinc-100 focus:border-amber-500 outline-none placeholder:text-zinc-600 transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Deployment Area (AM)</label>
                          <input
                            type="text"
                            placeholder="አዲስ አበባ ፣ ኢትዮጵያ"
                            value={formData.location?.am || ''}
                            onChange={(e) => handleInputChange('location', 'am', e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm font-bold text-zinc-100 focus:border-amber-500 outline-none placeholder:text-zinc-600 transition-colors"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Brand Manifesto</label>
                        <textarea
                          className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:border-amber-500 transition-colors outline-none font-bold text-zinc-100 text-sm min-h-[120px] placeholder:text-zinc-600"
                          value={formData.description?.en || ''}
                          onChange={(e) => handleInputChange('description', 'en', e.target.value)}
                          placeholder="Describe the premium experience..."
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Comms Channel (Phone)</label>
                          <input
                            type="text"
                            value={formData.contactPhone || ''}
                            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                            placeholder="+251 911 223344"
                            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm font-bold text-zinc-100 focus:border-amber-500 outline-none placeholder:text-zinc-600 transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Comms Channel (Email)</label>
                          <input
                            type="email"
                            value={formData.contactEmail || ''}
                            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                            placeholder="hq@xmensalon.com"
                            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm font-bold text-zinc-100 focus:border-amber-500 outline-none placeholder:text-zinc-600 transition-colors"
                          />
                        </div>
                      </div>

                      <div className="p-8 bg-zinc-950 rounded-3xl border border-zinc-800">
                        <div className="flex justify-between items-center mb-6">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Engagement Deposit (%)</label>
                          <span className="text-2xl font-bold text-amber-500">{formData.advancePaymentPercentage || 50}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={formData.advancePaymentPercentage || 50}
                          onChange={(e) => setFormData({ ...formData, advancePaymentPercentage: parseInt(e.target.value) })}
                          className="w-full accent-amber-500 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      <div className="flex justify-end pt-4">
                        <button 
                          onClick={handleSaveGeneral} 
                          className="w-full md:w-auto px-6 h-[46px] bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl font-bold transition-all active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                        >
                          Commit Core Settings
                        </button>
                      </div>
                    </div>
                  </AccordionItem>

                  {/* Working Hours */}
                  <AccordionItem id="working-hours" label={t('settings.workingHours', 'Working Hours')} icon="⏰" activeTab={activeTab} expandedSection={expandedSection} setExpandedSection={setExpandedSection}>
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="grid grid-cols-1 gap-4">
                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                          <div key={day} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 rounded-2xl border transition-all gap-4 ${
                            formData.workingHours?.[day]?.closed 
                              ? 'bg-zinc-950 border-zinc-800 opacity-50' 
                              : 'bg-zinc-900 border-zinc-700 hover:border-amber-500/50'
                          }`}>
                            <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-start">
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                                  formData.workingHours?.[day]?.closed ? 'bg-zinc-900 text-zinc-600' : 'bg-zinc-950 text-zinc-100 border border-zinc-800'
                                }`}>
                                  {day.substring(0, 3).toUpperCase()}
                                </div>
                                <span className="font-bold text-zinc-100 uppercase text-sm tracking-widest">
                                  {t(`days.${day}`, day.charAt(0).toUpperCase() + day.slice(1))}
                                </span>
                              </div>
                              <label className="flex sm:hidden items-center gap-2 cursor-pointer group">
                                <div 
                                  onClick={() => handleWorkingHoursChange(day, 'closed', !formData.workingHours?.[day]?.closed)}
                                  className={`w-12 h-6 rounded-full relative transition-colors ${
                                    formData.workingHours?.[day]?.closed ? 'bg-zinc-800' : 'bg-amber-500'
                                  }`}
                                >
                                  <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                                    formData.workingHours?.[day]?.closed ? 'translate-x-0' : 'translate-x-6'
                                  }`} />
                                </div>
                              </label>
                            </div>
                            
                            <div className="flex items-center gap-4 sm:gap-8 w-full sm:w-auto justify-between sm:justify-start">
                              <label className="hidden sm:flex items-center gap-3 cursor-pointer group">
                                <div 
                                  onClick={() => handleWorkingHoursChange(day, 'closed', !formData.workingHours?.[day]?.closed)}
                                  className={`w-12 h-6 rounded-full relative transition-colors ${
                                    formData.workingHours?.[day]?.closed ? 'bg-zinc-800' : 'bg-amber-500'
                                  }`}
                                >
                                  <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                                    formData.workingHours?.[day]?.closed ? 'translate-x-0' : 'translate-x-6'
                                  }`} />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-zinc-300 transition-colors">
                                  {formData.workingHours?.[day]?.closed ? 'Disabled' : 'Enabled'}
                                </span>
                              </label>

                              {!formData.workingHours?.[day]?.closed && (
                                <div className="flex items-center gap-3 bg-zinc-950 p-2 rounded-xl border border-zinc-800 w-full sm:w-auto justify-center">
                                  <input
                                    type="time"
                                    value={formData.workingHours?.[day]?.open || '09:00'}
                                    onChange={(e) => handleWorkingHoursChange(day, 'open', e.target.value)}
                                    className="bg-transparent font-bold text-zinc-100 text-sm outline-none focus:text-amber-500 transition-colors w-24"
                                    style={{ colorScheme: 'dark' }}
                                  />
                                  <span className="text-zinc-600 font-bold">/</span>
                                  <input
                                    type="time"
                                    value={formData.workingHours?.[day]?.close || '17:00'}
                                    onChange={(e) => handleWorkingHoursChange(day, 'close', e.target.value)}
                                    className="bg-transparent font-bold text-zinc-100 text-sm outline-none focus:text-amber-500 transition-colors w-24"
                                    style={{ colorScheme: 'dark' }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-end pt-4 sm:pt-8">
                        <button 
                          onClick={handleSaveWorkingHours} 
                          className="w-full md:w-auto px-6 h-[46px] bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl font-bold transition-all active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                        >
                          Synchronize Timeline
                        </button>
                      </div>
                    </div>
                  </AccordionItem>

                  {/* Notifications */}
                  <AccordionItem id="notifications" label={t('settings.notifications', 'Notifications')} icon="🔔" activeTab={activeTab} expandedSection={expandedSection} setExpandedSection={setExpandedSection}>
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="grid grid-cols-1 gap-4 sm:gap-6">
                        {[
                          { id: 'email', label: 'Electronic Dispatch', desc: 'Core system alerts via secure email servers' },
                          { id: 'sms', label: 'Tactical SMS', desc: 'Direct-to-mobile operational updates' },
                          { id: 'appointmentReminders', label: 'Engagement Pings', desc: 'Automated reminders for pending studio sessions' },
                          { id: 'marketingEmails', label: 'Portfolio Updates', desc: 'Bespoke marketing and new service catalogs' }
                        ].map((node) => (
                          <div key={node.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-zinc-950 border border-zinc-800 rounded-3xl hover:-translate-y-1 transition-all hover:border-amber-500/50 group gap-4">
                            <div className="max-w-md">
                              <h4 className="font-bold text-zinc-100 uppercase text-sm tracking-widest mb-2 group-hover:text-amber-500 transition-colors">{node.label}</h4>
                              <p className="text-xs font-bold text-zinc-500 italic">{node.desc}</p>
                            </div>
                            <button
                              onClick={() => handleNotificationChange(node.id, !formData.notifications?.[node.id])}
                              className={`w-16 h-8 rounded-full relative transition-all duration-500 flex-shrink-0 self-end sm:self-auto ${
                                formData.notifications?.[node.id] ? 'bg-amber-500' : 'bg-zinc-800'
                              }`}
                            >
                              <div className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white transition-transform duration-500 ${
                                formData.notifications?.[node.id] ? 'translate-x-8' : 'translate-x-0'
                              }`} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-end pt-4 sm:pt-8">
                        <button 
                          onClick={handleSaveNotifications} 
                          className="w-full md:w-auto px-6 h-[46px] bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl font-bold transition-all active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                        >
                          Broadcast Protocols
                        </button>
                      </div>
                    </div>
                  </AccordionItem>

                  {/* Business Tab */}
                  <AccordionItem id="business" label={t('settings.business', 'Business')} icon="📅" activeTab={activeTab} expandedSection={expandedSection} setExpandedSection={setExpandedSection}>
                    <div className="space-y-10 animate-in fade-in duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                        <div className="space-y-4">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Operational Timezone</label>
                          <select
                            value={formData.businessHours?.timezone || 'Africa/Addis_Ababa'}
                            onChange={(e) => setFormData({
                              ...formData,
                              businessHours: { ...formData.businessHours, timezone: e.target.value }
                            })}
                            className="w-full px-5 py-4 bg-zinc-950 border border-zinc-800 rounded-xl focus:border-amber-500 outline-none font-bold text-zinc-100 text-sm transition-colors uppercase"
                          >
                            <option value="Africa/Addis_Ababa">ADDIS ABABA (GMT+3)</option>
                            <option value="Africa/Nairobi">NAIROBI (GMT+3)</option>
                            <option value="Africa/Cairo">CAIRO (GMT+2)</option>
                            <option value="Africa/Johannesburg">JOHANNESBURG (GMT+2)</option>
                          </select>
                        </div>

                        <div className="space-y-4">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Chronicle Format</label>
                          <select
                            value={formData.businessHours?.dateFormat || 'MM/DD/YYYY'}
                            onChange={(e) => setFormData({
                              ...formData,
                              businessHours: { ...formData.businessHours, dateFormat: e.target.value }
                            })}
                            className="w-full px-5 py-4 bg-zinc-950 border border-zinc-800 rounded-xl focus:border-amber-500 outline-none font-bold text-zinc-100 text-sm transition-colors uppercase"
                          >
                            <option value="MM/DD/YYYY">MM / DD / YYYY</option>
                            <option value="DD/MM/YYYY">DD / MM / YYYY</option>
                            <option value="YYYY-MM-DD">YYYY - MM - DD</option>
                          </select>
                        </div>

                        <div className="space-y-4">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Extraction Format</label>
                          <select
                            value={formData.businessHours?.timeFormat || '12h'}
                            onChange={(e) => setFormData({
                              ...formData,
                              businessHours: { ...formData.businessHours, timeFormat: e.target.value }
                            })}
                            className="w-full px-5 py-4 bg-zinc-950 border border-zinc-800 rounded-xl focus:border-amber-500 outline-none font-bold text-zinc-100 text-sm transition-colors uppercase"
                          >
                            <option value="12h">12-HOUR (AM/PM)</option>
                            <option value="24h">24-HOUR MILITARY</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end pt-4 sm:pt-8">
                        <button 
                          onClick={handleSaveBusinessHours} 
                          className="w-full md:w-auto px-6 h-[46px] bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl font-bold transition-all active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                        >
                          Sync Regional Config
                        </button>
                      </div>
                    </div>
                  </AccordionItem>

                  {/* Security Tab */}
                  <AccordionItem id="security" label={t('settings.security', 'Security')} icon="🔒" activeTab={activeTab} expandedSection={expandedSection} setExpandedSection={setExpandedSection}>
                    <div className="animate-in fade-in duration-300 md:max-w-lg mx-auto md:mx-0">
                      <div className="mb-8 md:mb-10 text-center md:text-left">
                        <span className="inline-flex px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-xs font-bold uppercase tracking-widest mb-4">Identity Verification</span>
                        <h3 className="text-2xl md:text-3xl font-bold text-zinc-50 uppercase tracking-tighter">Credential Rotation</h3>
                        <p className="text-zinc-500 font-bold mt-2 text-xs md:text-sm uppercase tracking-widest">Update administrative access keys</p>
                      </div>
                      
                      {passwordError && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-xl font-bold text-xs mb-8 text-center md:text-left uppercase tracking-widest">
                          {passwordError}
                        </div>
                      )}

                      <div className="space-y-6 md:space-y-8">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Current Authorization Key</label>
                          <input
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            className="w-full px-5 py-4 bg-zinc-950 border border-zinc-800 rounded-xl focus:border-amber-500 outline-none font-bold text-zinc-100 tracking-widest transition-colors"
                            placeholder="••••••••••••"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">New Deployment Key</label>
                          <input
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="w-full px-5 py-4 bg-zinc-950 border border-zinc-800 rounded-xl focus:border-amber-500 outline-none font-bold text-zinc-100 tracking-widest transition-colors"
                            placeholder="Min 8 characters"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Confirm Deployment Key</label>
                          <input
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            className="w-full px-5 py-4 bg-zinc-950 border border-zinc-800 rounded-xl focus:border-amber-500 outline-none font-bold text-zinc-100 tracking-widest transition-colors"
                            placeholder="Repeat new key"
                          />
                        </div>

                        <div className="pt-4 pb-4 lg:pb-0">
                          <button 
                            onClick={handleChangePassword} 
                            className="w-full px-6 h-[46px] bg-zinc-100 hover:bg-white text-zinc-900 rounded-xl font-bold transition-all active:scale-95 uppercase tracking-widest text-xs"
                          >
                            Update Security Protocol
                          </button>
                        </div>
                      </div>
                    </div>
                  </AccordionItem>

                  {/* Audit Logs Tab */}
                  <AccordionItem id="audit" label={t('settings.auditLogs', 'Audit Logs')} icon="📋" activeTab={activeTab} expandedSection={expandedSection} setExpandedSection={setExpandedSection}>
                    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300 pt-2">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
                        <div>
                          <h3 className="text-xl md:text-2xl font-bold text-zinc-100 uppercase tracking-tighter">System Ledger</h3>
                          <p className="text-zinc-500 font-bold mt-1 text-[10px] md:text-xs uppercase tracking-widest">Immutable chronicle of system operations</p>
                        </div>
                        <span className="inline-flex px-2 py-0.5 bg-zinc-800 text-zinc-400 border border-zinc-700 rounded text-[8px] font-bold uppercase tracking-widest self-start sm:self-auto">Live Registry</span>
                      </div>
                      
                      <div className="space-y-3">
                        {auditLogs?.logs?.map((log, index) => (
                          <div key={index} className="flex items-start gap-4 sm:gap-6 p-4 sm:p-6 bg-zinc-950 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-colors group">
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-bold text-[8px] sm:text-[10px] flex-shrink-0 border ${
                              log.action === 'CREATE' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                              log.action === 'UPDATE' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                              log.action === 'DELETE' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                            }`}>
                              {log.action}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm font-bold text-zinc-100 leading-tight uppercase tracking-tighter group-hover:text-amber-500 transition-colors truncate">{log.description}</p>
                              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
                                <p className="text-[9px] sm:text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                  {formatDate(log.timestamp)}
                                </p>
                                <span className="w-1 h-1 rounded-full bg-zinc-700 hidden sm:block" />
                                <p className="text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase tracking-widest truncate">
                                  Operator: {log.user}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}

                        {(!auditLogs?.logs || auditLogs.logs.length === 0) && (
                          <div className="text-center py-16 sm:py-32 border border-dashed border-zinc-800 rounded-3xl bg-zinc-950/50">
                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Registry Vacuum Detected</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </AccordionItem>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl relative overflow-hidden">
            <div className="absolute right-0 bottom-0 text-9xl opacity-[0.03] translate-x-12 translate-y-12 pointer-events-none">⚙️</div>
            <div className="p-10">
              <span className="inline-flex px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-xs font-bold uppercase tracking-widest mb-6">Global Master</span>
              <h4 className="text-3xl font-bold text-zinc-50 uppercase tracking-tighter mb-6 leading-none">System Core</h4>
              <p className="text-zinc-400 font-bold text-sm leading-relaxed mb-8">
                This console provides high-level overrides for the salon's operational parameters. Changes here propagate across all clusters in real-time.
              </p>
              
              <div className="space-y-4">
                <div className="p-5 bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center gap-4">
                  <span className="text-amber-500 text-xl">🛡️</span>
                  <div>
                    <h5 className="text-[10px] font-bold text-zinc-100 uppercase tracking-widest">Protocol Guard</h5>
                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">AES-256 Layer Active</p>
                  </div>
                </div>
                <div className="p-5 bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center gap-4">
                  <span className="text-amber-500 text-xl">🌐</span>
                  <div>
                    <h5 className="text-[10px] font-bold text-zinc-100 uppercase tracking-widest">Registry Sync</h5>
                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Multi-Region Redundancy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-10 bg-zinc-900 rounded-[40px] border border-zinc-800 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full -translate-y-16 translate-x-16" />
            <h5 className="font-bold text-zinc-100 uppercase text-xs tracking-widest mb-6">Security Posture</h5>
            <div className="space-y-6 relative z-10">
              <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Auth Level</span>
                <span className="inline-flex px-2 py-0.5 bg-zinc-800 text-zinc-400 border border-zinc-700 rounded text-[8px] font-bold uppercase tracking-widest">Root Admin</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">System Health</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-zinc-100 uppercase tracking-widest">Optimal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
