import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchQueueStatus, 
  checkInToAppointment, 
  fetchQueuePosition,
  clearQueueError 
} from '../../store/slices/queueSlice';
import { fetchMyAppointments } from '../../store/slices/appointmentSlice';

const QueuePage = () => {
  const dispatch = useDispatch();
  const { queue, stats, userPosition, lastUpdated, isLoading, error } = useSelector((state) => state.queue);
  const { appointments } = useSelector((state) => state.appointments);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  const [activeTab, setActiveTab] = useState('live');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Initial fetch and set up polling
  useEffect(() => {
    dispatch(fetchQueueStatus());
    
    // Set up polling every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchQueueStatus());
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

  // Fetch user appointments if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchMyAppointments());
    }
  }, [dispatch, isAuthenticated]);

  // Clear any errors after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearQueueError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleCheckIn = async (appointmentId) => {
    setCheckInLoading(true);
    try {
      const result = await dispatch(checkInToAppointment(appointmentId));
      if (checkInToAppointment.fulfilled.match(result)) {
        await dispatch(fetchQueueStatus());
        if (user) {
          dispatch(fetchQueuePosition(appointmentId));
        }
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      }
    } catch (error) {
      console.error('Check-in failed:', error);
    } finally {
      setCheckInLoading(false);
      setSelectedAppointment(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CHECKED_IN':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CONFIRMED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'IN_PROGRESS':
        return '🔄 In Progress';
      case 'CHECKED_IN':
        return '✅ Checked In';
      case 'CONFIRMED':
        return '⏳ Confirmed';
      case 'COMPLETED':
        return '✓ Completed';
      case 'CANCELLED':
        return '✗ Cancelled';
      default:
        return status;
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (e) {
      return '';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      if (date.toDateString() === today.toDateString()) {
        return 'Today';
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
      } else {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        });
      }
    } catch (e) {
      return '';
    }
  };

  // Filter today's appointments that are check-in eligible
  const todaysAppointments = appointments.filter(apt => {
    if (!apt.scheduledDate) return false;
    const aptDate = new Date(apt.scheduledDate);
    const today = new Date();
    return aptDate.toDateString() === today.toDateString() && 
           ['CONFIRMED', 'CHECKED_IN'].includes(apt.status);
  });

  // Filter upcoming appointments
  const upcomingAppointments = appointments.filter(apt => {
    if (!apt.scheduledDate) return false;
    const aptDate = new Date(apt.scheduledDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return aptDate > today && apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED';
  }).sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));

  // Filter past appointments
  const pastAppointments = appointments.filter(apt => {
    if (!apt.scheduledDate) return false;
    const aptDate = new Date(apt.scheduledDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return aptDate < today || apt.status === 'COMPLETED' || apt.status === 'CANCELLED';
  }).slice(0, 5); // Only show last 5

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Queue Status</h1>
        <p className="text-gray-600">
          Track your position in line and check in for your appointment
        </p>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="font-medium">Successfully checked in! Your position has been updated.</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Queue Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600 mb-1">Total in Queue</p>
          <p className="text-2xl font-bold text-blue-600">{stats.totalInQueue || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-600 mb-1">In Progress</p>
          <p className="text-2xl font-bold text-green-600">{stats.inProgress || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-600 mb-1">Checked In</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.checkedIn || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
          <p className="text-sm text-gray-600 mb-1">Est. Wait Time</p>
          <p className="text-2xl font-bold text-purple-600">
            {stats.estimatedCurrentWait || 0} <span className="text-sm">min</span>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('live')}
            className={`pb-3 px-1 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'live'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Live Queue
          </button>
          {isAuthenticated && (
            <button
              onClick={() => setActiveTab('my-queue')}
              className={`pb-3 px-1 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'my-queue'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Queue
            </button>
          )}
        </nav>
      </div>

      {/* Live Queue Tab */}
      {activeTab === 'live' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
            <h2 className="font-semibold text-gray-700">Current Queue</h2>
            {lastUpdated && (
              <p className="text-xs text-gray-500">
                Last updated: {formatTime(lastUpdated)}
              </p>
            )}
          </div>

          {isLoading && queue.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : queue.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500 text-lg">No one in queue right now</p>
              <p className="text-sm text-gray-400 mt-2">Be the first to book an appointment!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {queue.map((item, index) => (
                <div key={item._id || index} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                        item.status === 'IN_PROGRESS' 
                          ? 'bg-green-100 text-green-600 animate-pulse' 
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {item.customer?.fullName || 'Customer'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.service?.name?.en || 'Service'} • {item.scheduledTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                        {getStatusText(item.status)}
                      </span>
                      {item.estimatedWaitTime > 0 && item.status !== 'IN_PROGRESS' && (
                        <span className="text-sm font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded">
                          ~{item.estimatedWaitTime} min
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Queue Tab */}
      {activeTab === 'my-queue' && isAuthenticated && (
        <div className="space-y-6">
          {/* Today's Appointments */}
          {todaysAppointments.length > 0 && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 bg-blue-50 border-b border-blue-100">
                <h2 className="font-semibold text-blue-800 flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Today's Appointments
                </h2>
              </div>
              <div className="divide-y divide-gray-100">
                {todaysAppointments.map((appointment) => (
                  <div key={appointment.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">
                          {appointment.service?.name?.en || 'Service'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {appointment.scheduledTime} • {appointment.service?.duration || 30} min
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        {appointment.queuePosition && (
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Position</p>
                            <p className="text-2xl font-bold text-blue-600">{appointment.queuePosition}</p>
                          </div>
                        )}
                        {appointment.status === 'CONFIRMED' && (
                          <button
                            onClick={() => setSelectedAppointment(appointment)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                          >
                            Check In
                          </button>
                        )}
                        {appointment.status === 'CHECKED_IN' && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            Checked In
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Wait Time Progress */}
                    {appointment.queuePosition && appointment.status !== 'IN_PROGRESS' && appointment.status !== 'COMPLETED' && (
                      <div className="mt-3 bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Estimated wait time:</span>
                          <span className="font-medium text-orange-600">
                            {appointment.queuePosition * 30} minutes
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-orange-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, ((appointment.queuePosition - 1) / (stats.totalInQueue || 1)) * 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {appointment.queuePosition - 1} people ahead of you
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Appointments */}
          {upcomingAppointments.length > 0 && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 bg-gray-50 border-b">
                <h2 className="font-semibold text-gray-700">Upcoming Appointments</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-800">
                          {appointment.service?.name?.en || 'Service'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDate(appointment.scheduledDate)} at {appointment.scheduledTime}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        appointment.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past Appointments */}
          {pastAppointments.length > 0 && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 bg-gray-50 border-b">
                <h2 className="font-semibold text-gray-700">Past Appointments</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {pastAppointments.map((appointment) => (
                  <div key={appointment.id} className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-800">
                          {appointment.service?.name?.en || 'Service'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDate(appointment.scheduledDate)} at {appointment.scheduledTime}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        appointment.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Appointments */}
          {todaysAppointments.length === 0 && upcomingAppointments.length === 0 && pastAppointments.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500 text-lg">No appointments found</p>
              <p className="text-sm text-gray-400 mt-2">
                Book an appointment to see your queue position
              </p>
              <button
                onClick={() => window.location.href = '/services'}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Book Now
              </button>
            </div>
          )}
        </div>
      )}

      {/* Check-in Confirmation Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="text-center mb-4">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Check In to Appointment
                </h3>
                <p className="text-sm text-gray-500">
                  You're checking in for your appointment at {selectedAppointment.scheduledTime}
                </p>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      You can only check in up to 30 minutes before your appointment time.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => handleCheckIn(selectedAppointment.id)}
                  disabled={checkInLoading}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {checkInLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Checking in...
                    </span>
                  ) : 'Confirm Check-in'}
                </button>
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueuePage;