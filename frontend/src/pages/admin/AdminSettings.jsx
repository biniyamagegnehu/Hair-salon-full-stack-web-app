import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { fetchSalonConfig, updateSalonConfig } from '../../store/slices/adminSlice';

const AdminSettings = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { salonConfig, isLoading } = useSelector((state) => state.admin);
  const [formData, setFormData] = useState({
    salonName: { am: '', en: '' },
    location: { am: '', en: '' },
    description: { am: '', en: '' },
    contactPhone: '',
    contactEmail: '',
    advancePaymentPercentage: 50
  });

  useEffect(() => {
    dispatch(fetchSalonConfig());
  }, [dispatch]);

  useEffect(() => {
    if (salonConfig) {
      setFormData({
        salonName: salonConfig.salonName || { am: '', en: '' },
        location: salonConfig.location || { am: '', en: '' },
        description: salonConfig.description || { am: '', en: '' },
        contactPhone: salonConfig.contactPhone || '',
        contactEmail: salonConfig.contactEmail || '',
        advancePaymentPercentage: salonConfig.advancePaymentPercentage || 50
      });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateSalonConfig(formData)).unwrap();
      toast.success(t('common.success'));
    } catch (error) {
      toast.error(error || t('common.error'));
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('admin.settings')}</h2>

      <div className="bg-white rounded-lg shadow-md p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Salon Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.salonName')} (English) *
                </label>
                <input
                  type="text"
                  value={formData.salonName.en}
                  onChange={(e) => handleInputChange('salonName', 'en', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.salonName')} (Amharic) *
                </label>
                <input
                  type="text"
                  value={formData.salonName.am}
                  onChange={(e) => handleInputChange('salonName', 'am', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.location')} (English) *
                </label>
                <input
                  type="text"
                  value={formData.location.en}
                  onChange={(e) => handleInputChange('location', 'en', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.location')} (Amharic) *
                </label>
                <input
                  type="text"
                  value={formData.location.am}
                  onChange={(e) => handleInputChange('location', 'am', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.description')} (English)
                </label>
                <textarea
                  value={formData.description.en}
                  onChange={(e) => handleInputChange('description', 'en', e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.description')} (Amharic)
                </label>
                <textarea
                  value={formData.description.am}
                  onChange={(e) => handleInputChange('description', 'am', e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.phoneNumber')}
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.email')}
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Advance Payment Percentage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.advancePaymentPercentage')}
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.advancePaymentPercentage}
                  onChange={(e) => setFormData({ ...formData, advancePaymentPercentage: parseInt(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-lg font-semibold text-blue-600 w-16">
                  {formData.advancePaymentPercentage}%
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {t('admin.advancePaymentInfo', 'Percentage of total price required as advance payment')}
              </p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('common.save')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;