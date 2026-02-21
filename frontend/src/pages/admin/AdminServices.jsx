import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { fetchServices } from '../../store/slices/serviceSlice';
import { adminService } from '../../services/api/admin';

const AdminServices = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { services, isLoading } = useSelector((state) => state.services);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: { am: '', en: '' },
    description: { am: '', en: '' },
    price: '',
    duration: ''
  });

  useEffect(() => {
    dispatch(fetchServices(false));
  }, [dispatch]);

  const handleInputChange = (field, lang, value) => {
    if (field === 'name' || field === 'description') {
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
      if (editingService) {
        await adminService.updateService(editingService._id, formData);
        toast.success(t('common.success'));
      } else {
        await adminService.createService(formData);
        toast.success(t('common.success'));
      }
      
      dispatch(fetchServices(false));
      setShowModal(false);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || t('common.error'));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('admin.confirmDeactivate', 'Are you sure you want to deactivate this service?'))) {
      try {
        await adminService.deleteService(id);
        toast.success(t('common.success'));
        dispatch(fetchServices(false));
      } catch (error) {
        toast.error(error.response?.data?.message || t('common.error'));
      }
    }
  };

  const handleActivate = async (id) => {
    try {
      await adminService.activateService(id);
      toast.success(t('common.success'));
      dispatch(fetchServices(false));
    } catch (error) {
      toast.error(error.response?.data?.message || t('common.error'));
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || { am: '', en: '' },
      price: service.price,
      duration: service.duration
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingService(null);
    setFormData({
      name: { am: '', en: '' },
      description: { am: '', en: '' },
      price: '',
      duration: ''
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{t('admin.services')}</h2>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + {t('admin.addService', 'Add New Service')}
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service._id}
              className={`bg-white rounded-lg shadow-md p-6 ${
                !service.isActive ? 'opacity-60' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{service.name?.en}</h3>
                  <p className="text-sm text-gray-500">{service.name?.am}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  service.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {service.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4">{service.description?.en}</p>

              <div className="flex justify-between items-center mb-4">
                <span className="text-2xl font-bold text-blue-600">{service.price} ETB</span>
                <span className="text-sm text-gray-500">{service.duration} {t('booking.minutes')}</span>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(service)}
                  className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  {t('common.edit')}
                </button>
                {service.isActive ? (
                  <button
                    onClick={() => handleDelete(service._id)}
                    className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    {t('common.deactivate', 'Deactivate')}
                  </button>
                ) : (
                  <button
                    onClick={() => handleActivate(service._id)}
                    className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    {t('common.activate', 'Activate')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Service Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {editingService ? t('common.edit') : t('admin.addService')}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.serviceName')} (English) *
                  </label>
                  <input
                    type="text"
                    value={formData.name.en}
                    onChange={(e) => handleInputChange('name', 'en', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.serviceName')} (Amharic) *
                  </label>
                  <input
                    type="text"
                    value={formData.name.am}
                    onChange={(e) => handleInputChange('name', 'am', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.description')} (English)
                  </label>
                  <textarea
                    value={formData.description.en}
                    onChange={(e) => handleInputChange('description', 'en', e.target.value)}
                    rows="2"
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
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('booking.price')} (ETB) *
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', null, e.target.value)}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('booking.duration')} ({t('booking.minutes')}) *
                    </label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', null, e.target.value)}
                      min="5"
                      step="5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingService ? t('common.update', 'Update') : t('common.create', 'Create')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServices;