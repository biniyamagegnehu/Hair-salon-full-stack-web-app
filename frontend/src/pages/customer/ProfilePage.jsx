import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { fetchMyAppointments } from '../../store/slices/appointmentSlice';
import { updatePhoneNumber } from '../../store/slices/authSlice';

const ProfilePage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const location = useLocation();
  const { user, isLoading: authLoading } = useSelector((state) => state.auth);
  const { appointments, isLoading: appointmentsLoading } = useSelector((state) => state.appointments);
  
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [updatingPhone, setUpdatingPhone] = useState(false);

  useEffect(() => {
    dispatch(fetchMyAppointments());
    
    const params = new URLSearchParams(location.search);
    if (params.get('phoneRequired') === 'true') {
      setShowPhoneModal(true);
    }
  }, [dispatch, location]);

  const validatePhoneNumber = (phone) => {
    const ethiopianPhoneRegex = /^\+251[79]\d{8}$/;
    return ethiopianPhoneRegex.test(phone);
  };

  const handleUpdatePhone = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      setPhoneError(t('auth.invalidPhone'));
      return;
    }

    setUpdatingPhone(true);
    const result = await dispatch(updatePhoneNumber(phoneNumber));
    if (updatePhoneNumber.fulfilled.match(result)) {
      setShowPhoneModal(false);
      setPhoneNumber('');
      setPhoneError('');
    }
    setUpdatingPhone(false);
  };

  const getStatusBadge = (status) => {
    const colors = {
      'CONFIRMED': 'bg-green-100 text-green-800',
      'PENDING_PAYMENT': 'bg-yellow-100 text-yellow-800',
      'CHECKED_IN': 'bg-blue-100 text-blue-800',
      'IN_PROGRESS': 'bg-purple-100 text-purple-800',
      'COMPLETED': 'bg-gray-100 text-gray-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">{t('profile.title')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center mb-4">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-blue-600">
                  {user?.fullName?.charAt(0).toUpperCase() || '?'}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800">{user?.fullName}</h2>
              <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <span className="font-medium text-gray-600 w-24">{t('auth.phone')}:</span>
                <span className="text-gray-800">{user?.phoneNumber}</span>
              </div>

              {user?.email && (
                <div className="flex items-center text-sm">
                  <span className="font-medium text-gray-600 w-24">{t('auth.email')}:</span>
                  <span className="text-gray-800">{user.email}</span>
                </div>
              )}

              <div className="flex items-center text-sm">
                <span className="font-medium text-gray-600 w-24">{t('profile.memberSince')}:</span>
                <span className="text-gray-800">
                  {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowPhoneModal(true)}
              className="w-full mt-4 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              {t('profile.updatePhone')}
            </button>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('profile.myAppointments')}</h3>
            
            {appointmentsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">{t('profile.noAppointments')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {appointment.service?.name?.en || t('common.service')}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {formatDate(appointment.scheduledDate)} {t('common.at', 'at')} {appointment.scheduledTime}
                        </p>
                        {appointment.queuePosition && (
                          <p className="text-xs text-blue-600 mt-1">
                            {t('queue.yourPosition')}: {appointment.queuePosition}
                          </p>
                        )}
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(appointment.status)}`}>
                        {appointment.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showPhoneModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('profile.updatePhone')}</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.phone')}
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  setPhoneError('');
                }}
                placeholder="+251911223344"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  phoneError ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {phoneError && (
                <p className="text-sm text-red-600 mt-1">{phoneError}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {t('auth.phoneFormat')}
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleUpdatePhone}
                disabled={updatingPhone}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {updatingPhone ? t('common.loading') : t('common.save')}
              </button>
              <button
                onClick={() => {
                  setShowPhoneModal(false);
                  setPhoneNumber('');
                  setPhoneError('');
                }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;