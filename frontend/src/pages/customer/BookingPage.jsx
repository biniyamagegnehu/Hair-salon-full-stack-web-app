import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { format, addDays } from 'date-fns';
import { toast } from 'react-hot-toast';
import "react-datepicker/dist/react-datepicker.css";

import { fetchServices } from '../../store/slices/serviceSlice';
import { appointmentsService } from '../../services/api/appointments';
import { createAppointment } from '../../store/slices/appointmentSlice'; // This should now work

const BookingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { services, isLoading: servicesLoading } = useSelector((state) => state.services);
  const { isLoading } = useSelector((state) => state.appointments);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch services on mount
  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]);

  // Check if service was passed from Services page
  useEffect(() => {
    if (location.state?.selectedServiceId && services.length > 0) {
      const service = services.find(s => s._id === location.state.selectedServiceId);
      if (service) {
        setSelectedService(service);
        setStep(2);
      }
    }
  }, [location.state, services]);

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setStep(2);
  };

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    
    if (date && selectedService) {
      setLoadingSlots(true);
      try {
        const formattedDate = format(date, 'yyyy-MM-dd');
        const response = await appointmentsService.getAvailableSlots(
          formattedDate,
          selectedService._id
        );
        setAvailableSlots(response.data.slots.filter(slot => slot.available));
      } catch (error) {
        toast.error('Failed to load available slots');
      } finally {
        setLoadingSlots(false);
      }
    }
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setStep(3);
  };

  const handleConfirmBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime) return;

    const appointmentData = {
      serviceId: selectedService._id,
      scheduledDate: format(selectedDate, 'yyyy-MM-dd'),
      scheduledTime: selectedTime.time,
      notes: ''
    };

    const result = await dispatch(createAppointment(appointmentData));
    
    if (createAppointment.fulfilled.match(result)) {
      toast.success('Appointment created successfully!');
      // Navigate to payment
      navigate(`/payment/${result.payload.appointment.id}`);
    } else {
      toast.error(result.payload || 'Failed to create appointment');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Book an Appointment</h1>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: 'Select Service' },
            { num: 2, label: 'Select Date & Time' },
            { num: 3, label: 'Confirm Booking' }
          ].map((s) => (
            <div key={s.num} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center font-medium
                ${s.num < step ? 'bg-green-500 text-white' : 
                  s.num === step ? 'bg-blue-600 text-white' : 
                  'bg-gray-200 text-gray-600'}
              `}>
                {s.num < step ? '✓' : s.num}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700 hidden sm:block">
                {s.label}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Select Service */}
      {step === 1 && (
        <div>
          {servicesLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((service) => (
                <button
                  key={service._id}
                  onClick={() => handleServiceSelect(service)}
                  className="text-left p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-500"
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{service.name?.en || 'Service'}</h3>
                  <p className="text-gray-600 mb-4">{service.description?.en || 'Premium service'}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-blue-600">{service.price} ETB</span>
                    <span className="text-sm text-gray-500">{service.duration} min</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Select Date & Time */}
      {step === 2 && selectedService && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <button
              onClick={handleBack}
              className="text-gray-600 hover:text-gray-800 mr-4"
            >
              ← Back
            </button>
            <h2 className="text-xl font-semibold">Selected Service: {selectedService.name?.en}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                minDate={new Date()}
                maxDate={addDays(new Date(), 30)}
                dateFormat="MMMM d, yyyy"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholderText="Click to select date"
              />
            </div>

            {selectedDate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Time Slots
                </label>
                {loadingSlots ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => handleTimeSelect(slot)}
                        className={`
                          p-2 text-sm font-medium rounded-lg border transition-colors
                          ${selectedTime?.time === slot.time
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                          }
                        `}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No available slots for this date</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Confirm Booking */}
      {step === 3 && selectedService && selectedDate && selectedTime && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <button
              onClick={handleBack}
              className="text-gray-600 hover:text-gray-800 mr-4"
            >
              ← Back
            </button>
            <h2 className="text-2xl font-bold text-gray-800">Confirm Your Booking</h2>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Service:</span>
              <span className="font-medium">{selectedService.name?.en}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{format(selectedDate, 'MMMM d, yyyy')}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Time:</span>
              <span className="font-medium">{selectedTime.time}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium">{selectedService.duration} minutes</span>
            </div>
            <div className="flex justify-between py-2 border-b text-lg font-bold">
              <span>Total Amount:</span>
              <span className="text-blue-600">{selectedService.price} ETB</span>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                Note: 50% advance payment is required to confirm your booking.
              </p>
            </div>
          </div>

          <button
            onClick={handleConfirmBooking}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-medium"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Confirm & Proceed to Payment'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingPage;