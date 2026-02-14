import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DatePicker from 'react-datepicker';
import { format, addDays } from 'date-fns';
import { toast } from 'react-toastify';
import 'react-datepicker/dist/react-datepicker.css';

import { servicesService } from '../../services/api/services';
import { appointmentsService } from '../../services/api/appointments';
import { queueService } from '../../services/api/queue';

const BookingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [queueStatus, setQueueStatus] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
    loadServices();
    loadQueueStatus();
  }, [isAuthenticated, navigate]);

  const loadServices = async () => {
    try {
      const response = await servicesService.getAllServices();
      setServices(response.data.services);
    } catch (error) {
      toast.error('Failed to load services');
    }
  };

  const loadQueueStatus = async () => {
    try {
      const response = await queueService.getQueueStatus();
      setQueueStatus(response.data);
    } catch (error) {
      console.error('Failed to load queue status');
    }
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setStep(2);
  };

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    
    if (date && selectedService) {
      setLoading(true);
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
        setLoading(false);
      }
    }
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setStep(3);
  };

  const handleConfirmBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime) return;

    setLoading(true);
    try {
      const response = await appointmentsService.createAppointment({
        serviceId: selectedService._id,
        scheduledDate: format(selectedDate, 'yyyy-MM-dd'),
        scheduledTime: selectedTime.time,
      });

      if (response.success) {
        toast.success(t('booking.bookingSuccess'));
        // Redirect to payment
        navigate(`/payment/${response.data.appointment.id}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t('booking.bookingError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('booking.title')}</h1>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex items-center ${
                s < step ? 'text-primary-600' : s === step ? 'text-primary-800' : 'text-gray-400'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  s < step
                    ? 'border-primary-600 bg-primary-600 text-white'
                    : s === step
                    ? 'border-primary-800 bg-white text-primary-800'
                    : 'border-gray-300 bg-white text-gray-400'
                }`}
              >
                {s < step ? '✓' : s}
              </div>
              <span className="ml-2 text-sm font-medium">
                {s === 1 && t('booking.selectService')}
                {s === 2 && t('booking.selectDate')}
                {s === 3 && t('booking.confirmBooking')}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-primary-600 rounded-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Select Service */}
      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => (
            <button
              key={service._id}
              onClick={() => handleServiceSelect(service)}
              className="text-left p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary-500"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {service.name.en}
              </h3>
              <p className="text-gray-600 mb-4">{service.description?.en}</p>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-primary-600">
                  {service.price} ETB
                </span>
                <span className="text-sm text-gray-500">
                  {service.duration} {t('booking.minutes')}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Select Date & Time */}
      {step === 2 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('booking.selectDate')}
            </label>
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              minDate={new Date()}
              maxDate={addDays(new Date(), 30)}
              dateFormat="MMMM d, yyyy"
              className="input-field"
              placeholderText="Select a date"
            />
          </div>

          {selectedDate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('booking.selectTime')}
              </label>
              {loading ? (
                <p>{t('common.loading')}</p>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => handleTimeSelect(slot)}
                      className={`p-2 text-sm font-medium rounded-lg border ${
                        selectedTime?.time === slot.time
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-primary-500'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">{t('booking.noSlots')}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Confirm Booking */}
      {step === 3 && selectedService && selectedDate && selectedTime && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('booking.confirmBooking')}
          </h2>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">{t('booking.selectService')}:</span>
              <span className="font-medium">{selectedService.name.en}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">{t('booking.selectDate')}:</span>
              <span className="font-medium">
                {format(selectedDate, 'MMMM d, yyyy')}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">{t('booking.selectTime')}:</span>
              <span className="font-medium">{selectedTime.time}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">{t('booking.duration')}:</span>
              <span className="font-medium">
                {selectedService.duration} {t('booking.minutes')}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b text-lg font-bold">
              <span>{t('booking.totalAmount')}:</span>
              <span className="text-primary-600">{selectedService.price} ETB</span>
            </div>
          </div>

          <button
            onClick={handleConfirmBooking}
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50"
          >
            {loading ? t('common.loading') : t('booking.confirmBooking')}
          </button>
        </div>
      )}

      {/* Queue Status Sidebar */}
      {queueStatus && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {t('queue.title')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">{t('queue.currentlyServing')}</p>
              <p className="text-2xl font-bold text-primary-600">
                {queueStatus.stats.inProgress}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('queue.checkedIn')}</p>
              <p className="text-2xl font-bold text-green-600">
                {queueStatus.stats.checkedIn}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('queue.estimatedWait')}</p>
              <p className="text-2xl font-bold text-orange-600">
                {queueStatus.stats.estimatedCurrentWait} min
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('queue.lastUpdated')}</p>
              <p className="text-sm text-gray-900">
                {new Date(queueStatus.lastUpdated).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;