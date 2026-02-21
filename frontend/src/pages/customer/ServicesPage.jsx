import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchServices } from '../../store/slices/serviceSlice';

const ServicesPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { services, isLoading, error } = useSelector((state) => state.services);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]);

  const handleBookNow = (serviceId) => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate('/booking', { state: { selectedServiceId: serviceId } });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {t('common.error')}: {error}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">{t('nav.services')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div key={service._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {service.name?.en || t('common.service')}
              </h2>
              <p className="text-gray-600 mb-4 h-12">
                {service.description?.en || ''}
              </p>
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-2xl font-bold text-blue-600">{service.price} ETB</span>
                <span className="text-sm text-gray-500">{service.duration} {t('booking.minutes')}</span>
              </div>
              
              <button
                onClick={() => handleBookNow(service._id)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('booking.confirmBooking')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesPage;