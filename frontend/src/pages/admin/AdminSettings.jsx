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

const AdminSettings = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  const { salonConfig, auditLogs, isLoading } = useSelector((state) => state.admin || {});
  
  const [activeTab, setActiveTab] = useState('general');
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
      toast.success(t('common.success'));
    } catch (error) {
      toast.error(error || t('common.error'));
    }
  };

  const handleSaveWorkingHours = async () => {
    try {
      await dispatch(updateSalonConfig({
        workingHours: formData.workingHours
      })).unwrap();
      toast.success(t('common.success'));
    } catch (error) {
      toast.error(error || t('common.error'));
    }
  };

  const handleSaveNotifications = async () => {
    try {
      await dispatch(updateSalonConfig({
        notifications: formData.notifications
      })).unwrap();
      toast.success(t('common.success'));
    } catch (error) {
      toast.error(error || t('common.error'));
    }
  };

  const handleSaveBusinessHours = async () => {
    try {
      await dispatch(updateSalonConfig({
        businessHours: formData.businessHours
      })).unwrap();
      toast.success(t('common.success'));
    } catch (error) {
      toast.error(error || t('common.error'));
    }
  };

  const handleChangePassword = async () => {
    // Validate passwords
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
      
      toast.success(t('settings.passwordChanged', 'Password changed successfully'));
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

  const tabs = [
    { id: 'general', label: t('settings.general', 'General'), icon: '⚙️' },
    { id: 'working-hours', label: t('settings.workingHours', 'Working Hours'), icon: '⏰' },
    { id: 'notifications', label: t('settings.notifications', 'Notifications'), icon: '🔔' },
    { id: 'business', label: t('settings.business', 'Business Hours'), icon: '📅' },
    { id: 'security', label: t('settings.security', 'Security'), icon: '🔒' },
    { id: 'audit', label: t('settings.auditLogs', 'Audit Logs'), icon: '📋' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">{t('admin.settings')}</h1>
        <p className="text-gray-500 mt-1">{t('settings.description', 'Manage salon configuration and preferences')}</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <nav className="flex space-x-8 min-w-max">
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
            {/* General Settings Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Salon Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('settings.salonName')} (English) *
                    </label>
                    <input
                      type="text"
                      value={formData.salonName?.en || ''}
                      onChange={(e) => handleInputChange('salonName', 'en', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('settings.salonName')} (Amharic) *
                    </label>
                    <input
                      type="text"
                      value={formData.salonName?.am || ''}
                      onChange={(e) => handleInputChange('salonName', 'am', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('settings.location')} (English) *
                    </label>
                    <input
                      type="text"
                      value={formData.location?.en || ''}
                      onChange={(e) => handleInputChange('location', 'en', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('settings.location')} (Amharic) *
                    </label>
                    <input
                      type="text"
                      value={formData.location?.am || ''}
                      onChange={(e) => handleInputChange('location', 'am', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Description */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('settings.description')} (English)
                    </label>
                    <textarea
                      value={formData.description?.en || ''}
                      onChange={(e) => handleInputChange('description', 'en', e.target.value)}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('settings.description')} (Amharic)
                    </label>
                    <textarea
                      value={formData.description?.am || ''}
                      onChange={(e) => handleInputChange('description', 'am', e.target.value)}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Contact Info */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('settings.phoneNumber')} *
                    </label>
                    <input
                      type="tel"
                      value={formData.contactPhone || ''}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+251911223344"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('settings.email')} *
                    </label>
                    <input
                      type="email"
                      value={formData.contactEmail || ''}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="info@xsalon.com"
                    />
                  </div>

                  {/* Advance Payment Percentage */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('settings.advancePaymentPercentage')}
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={formData.advancePaymentPercentage || 50}
                        onChange={(e) => setFormData({ ...formData, advancePaymentPercentage: parseInt(e.target.value) })}
                        className="flex-1"
                      />
                      <span className="text-lg font-semibold text-blue-600 w-16">
                        {formData.advancePaymentPercentage || 50}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {t('settings.advancePaymentInfo', 'Percentage of total price required as advance payment')}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSaveGeneral}
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    {t('common.save')}
                  </button>
                </div>
              </div>
            )}

            {/* Working Hours Tab */}
            {activeTab === 'working-hours' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                    <div key={day} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-24">
                        <span className="font-medium text-gray-700">
                          {t(`days.${day}`, day.charAt(0).toUpperCase() + day.slice(1))}
                        </span>
                      </div>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={!formData.workingHours?.[day]?.closed}
                          onChange={(e) => handleWorkingHoursChange(day, 'closed', !e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-600">{t('settings.open', 'Open')}</span>
                      </label>

                      {!formData.workingHours?.[day]?.closed && (
                        <>
                          <div className="flex items-center gap-2">
                            <input
                              type="time"
                              value={formData.workingHours?.[day]?.open || '09:00'}
                              onChange={(e) => handleWorkingHoursChange(day, 'open', e.target.value)}
                              className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-gray-500">-</span>
                            <input
                              type="time"
                              value={formData.workingHours?.[day]?.close || '17:00'}
                              onChange={(e) => handleWorkingHoursChange(day, 'close', e.target.value)}
                              className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSaveWorkingHours}
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    {t('common.save')}
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-gray-800">{t('settings.emailNotifications', 'Email Notifications')}</h4>
                      <p className="text-sm text-gray-500">{t('settings.emailNotificationsDesc', 'Receive email updates about appointments')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.notifications?.email || false}
                        onChange={(e) => handleNotificationChange('email', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-gray-800">{t('settings.smsNotifications', 'SMS Notifications')}</h4>
                      <p className="text-sm text-gray-500">{t('settings.smsNotificationsDesc', 'Receive SMS updates about appointments')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.notifications?.sms || false}
                        onChange={(e) => handleNotificationChange('sms', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-gray-800">{t('settings.appointmentReminders', 'Appointment Reminders')}</h4>
                      <p className="text-sm text-gray-500">{t('settings.appointmentRemindersDesc', 'Send reminders before appointments')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.notifications?.appointmentReminders || false}
                        onChange={(e) => handleNotificationChange('appointmentReminders', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-gray-800">{t('settings.marketingEmails', 'Marketing Emails')}</h4>
                      <p className="text-sm text-gray-500">{t('settings.marketingEmailsDesc', 'Receive promotional offers and updates')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.notifications?.marketingEmails || false}
                        onChange={(e) => handleNotificationChange('marketingEmails', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSaveNotifications}
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    {t('common.save')}
                  </button>
                </div>
              </div>
            )}

            {/* Business Hours Tab */}
            {activeTab === 'business' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('settings.timezone', 'Timezone')}
                    </label>
                    <select
                      value={formData.businessHours?.timezone || 'Africa/Addis_Ababa'}
                      onChange={(e) => setFormData({
                        ...formData,
                        businessHours: { ...formData.businessHours, timezone: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Africa/Addis_Ababa">Addis Ababa (GMT+3)</option>
                      <option value="Africa/Nairobi">Nairobi (GMT+3)</option>
                      <option value="Africa/Cairo">Cairo (GMT+2)</option>
                      <option value="Africa/Johannesburg">Johannesburg (GMT+2)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('settings.dateFormat', 'Date Format')}
                    </label>
                    <select
                      value={formData.businessHours?.dateFormat || 'MM/DD/YYYY'}
                      onChange={(e) => setFormData({
                        ...formData,
                        businessHours: { ...formData.businessHours, dateFormat: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('settings.timeFormat', 'Time Format')}
                    </label>
                    <select
                      value={formData.businessHours?.timeFormat || '12h'}
                      onChange={(e) => setFormData({
                        ...formData,
                        businessHours: { ...formData.businessHours, timeFormat: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="12h">12-hour (AM/PM)</option>
                      <option value="24h">24-hour</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSaveBusinessHours}
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    {t('common.save')}
                  </button>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6 max-w-md">
                <h3 className="text-lg font-semibold text-gray-800">{t('settings.changePassword', 'Change Password')}</h3>
                
                {passwordError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
                    {passwordError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('settings.currentPassword', 'Current Password')}
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('settings.newPassword', 'New Password')}
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('settings.confirmPassword', 'Confirm Password')}
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleChangePassword}
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    {t('settings.updatePassword', 'Update Password')}
                  </button>
                </div>
              </div>
            )}

            {/* Audit Logs Tab */}
            {activeTab === 'audit' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800">{t('settings.recentActivity', 'Recent Activity')}</h3>
                
                <div className="space-y-3">
                  {auditLogs?.logs?.map((log, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                      <div className={`p-2 rounded-lg ${
                        log.action === 'CREATE' ? 'bg-green-100' :
                        log.action === 'UPDATE' ? 'bg-blue-100' :
                        log.action === 'DELETE' ? 'bg-red-100' : 'bg-gray-100'
                      }`}>
                        <span className="text-sm font-medium">
                          {log.action}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{log.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(log.timestamp)} • {log.user}
                        </p>
                      </div>
                    </div>
                  ))}

                  {(!auditLogs?.logs || auditLogs.logs.length === 0) && (
                    <div className="text-center py-8 text-gray-400">
                      {t('settings.noActivity', 'No recent activity')}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;