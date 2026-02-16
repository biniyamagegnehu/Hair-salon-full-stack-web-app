import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import PhoneUpdateModal from '../../components/auth/PhoneUpdateModal';
import { fetchMyAppointments } from '../../store/slices/appointmentSlice';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user, requiresPhoneUpdate } = useSelector((state) => state.auth);
  const { appointments, isLoading } = useSelector((state) => state.appointments);
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  useEffect(() => {
    dispatch(fetchMyAppointments());
    
    // Check if phone update is required
    const params = new URLSearchParams(location.search);
    if (params.get('phoneRequired') === 'true' || requiresPhoneUpdate) {
      setShowPhoneModal(true);
    }
  }, [dispatch, location, requiresPhoneUpdate]);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PhoneUpdateModal 
        isOpen={showPhoneModal} 
        onClose={() => setShowPhoneModal(false)} 
      />

      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center mb-4">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-blue-600">
                  {user.fullName?.charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800">{user.fullName}</h2>
              <p className="text-sm text-gray-500 capitalize">{user.role}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-gray-600">{user.phoneNumber}</span>
              </div>

              {user.email && (
                <div className="flex items-center text-sm">
                  <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-600">{user.email}</span>
                </div>
              )}

              <div className="flex items-center text-sm">
                <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-600">
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowPhoneModal(true)}
              className="w-full mt-4 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Update Phone Number
            </button>
          </div>
        </div>

        {/* Appointments */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">My Appointments</h3>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No appointments yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {appointment.service?.name?.en || 'Service'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {new Date(appointment.scheduledDate).toLocaleDateString()} at {appointment.scheduledTime}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        appointment.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'PENDING_PAYMENT' ? 'bg-yellow-100 text-yellow-800' :
                        appointment.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {appointment.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    {appointment.queuePosition && (
                      <div className="mt-2 text-sm">
                        <span className="text-gray-600">Queue Position: </span>
                        <span className="font-medium text-blue-600">{appointment.queuePosition}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;