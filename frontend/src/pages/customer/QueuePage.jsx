import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQueueStatus, checkInToAppointment, fetchQueuePosition } from '../../store/slices/queueSlice';
import { fetchMyAppointments } from '../../store/slices/appointmentSlice';

const QueuePage = () => {
  const dispatch = useDispatch();
  const { queue, stats, userPosition, lastUpdated, isLoading } = useSelector((state) => state.queue);
  const { appointments } = useSelector((state) => state.appointments);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  const [activeTab, setActiveTab] = useState('live');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [checkInLoading, setCheckInLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchQueueStatus());
    
    // Set up polling every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchQueueStatus());
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchMyAppointments());
    }
  }, [dispatch, isAuthenticated]);

  const handleCheckIn = async (appointmentId) => {
    setCheckInLoading(true);
    await dispatch(checkInToAppointment(appointmentId));
    await dispatch(fetchQueueStatus());
    if (user) {
      dispatch(fetchQueuePosition(appointmentId));
    }
    setCheckInLoading(false);
    setSelectedAppointment(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CHECKED_IN':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CONFIRMED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
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
      default:
        return status;
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get today's appointments for the user that are check-in eligible
  const todaysAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.scheduledDate);
    const today = new Date();
    return aptDate.toDateString() === today.toDateString() && 
           ['CONFIRMED', 'CHECKED_IN'].includes(apt.status);
  });

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Queue Status</h1>

      {/* Queue Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600 mb-1">Total in Queue</p>
          <p className="text-2xl font-bold text-blue-600">{stats.totalInQueue}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600 mb-1">In Progress</p>
          <p className="text-2xl font-bold text-green-600">{stats.inProgress}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600 mb-1">Checked In</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.checkedIn}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600 mb-1">Est. Wait Time</p>
          <p className="text-2xl font-bold text-purple-600">{stats.estimatedCurrentWait} min</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('live')}
            className={`pb-2 px-1 font-medium text-sm border-b-2 transition-colors ${
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
              className={`pb-2 px-1 font-medium text-sm border-b-2 transition-colors ${
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
              <p className="text-gray-500">No one in queue right now</p>
              <p className="text-sm text-gray-400 mt-2">Be the first to book an appointment!</p>
            </div>
          ) : (
            <div className="divide-y">
              {queue.map((item, index) => (
                <div key={item._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
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
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                        {getStatusText(item.status)}
                      </span>
                      {item.estimatedWaitTime > 0 && item.status !== 'IN_PROGRESS' && (
                        <span className="text-sm text-gray-600">
                          ~{item.estimatedWaitTime} min wait
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
              <div className="p-4 bg-blue-50 border-b">
                <h2 className="font-semibold text-blue-800">Today's Appointments</h2>
              </div>
              <div className="divide-y">
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
                    
                    {/* Estimated Wait Time */}
                    {appointment.queuePosition && appointment.status !== 'IN_PROGRESS' && (
                      <div className="mt-3 bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Estimated wait time:</span>
                          <span className="font-medium text-orange-600">
                            {appointment.queuePosition * 30} minutes
                          </span>
                        </div>
                        <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-orange-500 rounded-full"
                            style={{ width: `${Math.min(100, (appointment.queuePosition / stats.totalInQueue) * 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {appointment.queuePosition} people ahead of you
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Appointments */}
          {appointments.filter(apt => {
            const aptDate = new Date(apt.scheduledDate);
            const today = new Date();
            return aptDate > today;
          }).length > 0 && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 bg-gray-50 border-b">
                <h2 className="font-semibold text-gray-700">Upcoming Appointments</h2>
              </div>
              <div className="divide-y">
                {appointments
                  .filter(apt => {
                    const aptDate = new Date(apt.scheduledDate);
                    const today = new Date();
                    return aptDate > today;
                  })
                  .map((appointment) => (
                    <div key={appointment.id} className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-800">
                            {appointment.service?.name?.en || 'Service'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(appointment.scheduledDate).toLocaleDateString()} at {appointment.scheduledTime}
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

          {todaysAppointments.length === 0 && appointments.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500">No appointments found</p>
              <p className="text-sm text-gray-400 mt-2">
                Book an appointment to see your queue position
              </p>
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
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkInLoading ? 'Checking in...' : 'Confirm Check-in'}
                </button>
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
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