import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { format, addDays } from 'date-fns';
import { toast } from 'react-hot-toast';

import { CalendarDaysIcon, ClockIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { fetchServices } from '../../store/slices/serviceSlice';
import { appointmentsService } from '../../services/api/appointments';
import { createAppointment } from '../../store/slices/appointmentSlice';
import Skeleton from '../../components/ui/Skeleton/Skeleton';

const goldButton = 'bg-[#C9A227] text-[#0F0F0F] px-6 py-3 rounded-lg hover:bg-[#DAA520] transition-all duration-300 font-medium shadow-md';
const outlineButton = 'border-2 border-[#C9A227] text-[#C9A227] px-6 py-3 rounded-lg hover:bg-[#C9A227] hover:text-[#0F0F0F] transition-all duration-300';

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

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]);

  useEffect(() => {
    if (location.state?.selectedServiceId && services.length > 0) {
      const service = services.find((item) => item._id === location.state.selectedServiceId);
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
        const response = await appointmentsService.getAvailableSlots(formattedDate, selectedService._id);
        setAvailableSlots(response.data.slots.filter((slot) => slot.available));
      } catch {
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
    <div className="space-y-8 lg:space-y-10">
      <section className="rounded-[32px] border border-black/5 bg-white px-6 py-10 shadow-sm sm:px-8 lg:px-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full bg-[#C9A227] px-3 py-1 text-sm font-medium text-[#0F0F0F]">Appointment booking</span>
            <h1 className="mt-4 text-4xl font-bold tracking-[-0.05em] text-[#0F0F0F] sm:text-5xl">Reserve your chair with clear steps and real availability.</h1>
            <p className="mt-4 text-base leading-8 text-gray-700">
              Choose your service, select a date, and confirm your time in a simple booking flow designed to feel polished on every screen.
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { num: 1, label: 'Service' },
            { num: 2, label: 'Schedule' },
            { num: 3, label: 'Confirm' }
          ].map((item) => {
            const active = step === item.num;
            const completed = step > item.num;

            return (
              <div
                key={item.num}
                className={`rounded-2xl border px-4 py-4 transition-all duration-300 ${
                  active
                    ? 'border-[#C9A227] bg-[#F8F4EC]'
                    : completed
                      ? 'border-black/5 bg-[#0F0F0F] text-white'
                      : 'border-gray-100 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                    active ? 'bg-[#C9A227] text-[#0F0F0F]' : completed ? 'bg-white text-[#0F0F0F]' : 'bg-[#F8F4EC] text-[#3B2F2F]'
                  }`}>
                    {completed ? '✓' : item.num}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#0F0F0F]">{item.label}</p>
                    <p className={`text-sm ${completed ? 'text-white/65' : 'text-[#3B2F2F]/60'}`}>Step {item.num}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {step === 1 && (
        <section className="rounded-[32px] border border-black/5 bg-white px-6 py-8 shadow-sm sm:px-8">
          {servicesLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <Skeleton key={item} height="132px" variant="rectangle" className="rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {services.map((service) => (
                <button
                  key={service._id}
                  type="button"
                  onClick={() => handleServiceSelect(service)}
                  className={`rounded-2xl border p-5 text-left transition-all duration-300 ${
                    selectedService?._id === service._id
                      ? 'border-[#C9A227] bg-[#F8F4EC] shadow-md'
                      : 'border-gray-100 bg-white hover:border-[#C9A227]/40 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0F0F0F] text-lg font-bold text-[#C9A227]">
                      {service.name?.en?.charAt(0) || 'S'}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <h2 className="text-2xl font-bold tracking-[-0.03em] text-[#0F0F0F]">{service.name?.en || 'Service'}</h2>
                        <span className="text-sm font-medium text-[#C9A227]">{service.price} ETB</span>
                      </div>
                      <p className="mt-3 text-base leading-7 text-gray-700">{service.description?.en}</p>
                      <p className="mt-4 text-sm font-medium text-[#3B2F2F]/60">{service.duration} min service window</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {step === 2 && selectedService && (
        <section className="rounded-[32px] border border-black/5 bg-white px-6 py-8 shadow-sm sm:px-8">
          <div className="flex flex-col gap-4 border-b border-gray-100 pb-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0F0F0F] text-lg font-bold text-[#C9A227]">
                {selectedService.name?.en?.charAt(0) || 'S'}
              </div>
              <div>
                <h2 className="text-3xl font-bold tracking-[-0.04em] text-[#0F0F0F]">{selectedService.name?.en}</h2>
                <p className="mt-1 text-base text-[#3B2F2F]/60">Choose your preferred date and available slot.</p>
              </div>
            </div>
            <button type="button" onClick={handleBack} className={outlineButton}>
              Change service
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[0.85fr_1.15fr] items-start">
            <div className="rounded-3xl border border-gray-100 bg-[#F8F4EC]/55 p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-[#3B2F2F]">
                <CalendarDaysIcon className="h-5 w-5 text-[#C9A227]" />
                Select date
              </div>
              <div className="min-h-[320px] overflow-hidden rounded-2xl bg-white p-3 shadow-sm [&_.react-datepicker]:border-none [&_.react-datepicker]:font-sans [&_.react-datepicker]:w-full [&_.react-datepicker__current-month]:text-[#0F0F0F] [&_.react-datepicker__day--selected]:bg-[#0F0F0F] [&_.react-datepicker__day--keyboard-selected]:bg-[#C9A227] [&_.react-datepicker__header]:bg-[#F8F4EC] [&_.react-datepicker__header]:border-b [&_.react-datepicker__header]:border-gray-100">
                <DatePicker
                  selected={selectedDate}
                  onChange={handleDateChange}
                  minDate={new Date()}
                  maxDate={addDays(new Date(), 30)}
                  inline
                />
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm min-h-[320px] flex flex-col">
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-[#3B2F2F]">
                <ClockIcon className="h-5 w-5 text-[#C9A227]" />
                Available time slots
              </div>

              {!selectedDate ? (
                <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-[#F8F4EC]/45 px-6 text-center">
                  <p className="text-xl font-bold tracking-[-0.03em] text-[#0F0F0F]">Choose a date first</p>
                  <p className="mt-3 max-w-sm text-base leading-7 text-gray-700">Once you pick a day, we will show the best available times for this service.</p>
                </div>
              ) : loadingSlots ? (
                <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <Skeleton key={item} height="48px" variant="rectangle" className="rounded-xl" />
                  ))}
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.time}
                      type="button"
                      onClick={() => handleTimeSelect(slot)}
                      className={`rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                        selectedTime?.time === slot.time
                          ? 'bg-[#0F0F0F] text-white shadow-md'
                          : 'border border-gray-200 bg-white text-[#0F0F0F] hover:border-[#C9A227] hover:text-[#C9A227]'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border border-dashed border-red-200 bg-red-50 px-6 text-center">
                  <p className="text-xl font-bold tracking-[-0.03em] text-[#0F0F0F]">No slots available</p>
                  <p className="mt-3 max-w-sm text-base leading-7 text-gray-700">Please try another date to find an open appointment window.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {step === 3 && selectedService && selectedDate && selectedTime && (
        <section className="mx-auto max-w-3xl rounded-[32px] border border-black/5 bg-white px-6 py-8 shadow-sm sm:px-8">
          <div className="rounded-[28px] bg-[#0F0F0F] px-6 py-8 text-white">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#C9A227]">Confirmation</p>
            <h2 className="mt-3 text-4xl font-bold tracking-[-0.04em]">Review your appointment.</h2>
            <p className="mt-3 max-w-xl text-base leading-7 text-white/68">Everything is lined up. Confirm below and continue to payment to secure your chair.</p>
          </div>

          <div className="mt-8 rounded-3xl bg-[#F8F4EC] p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 border-b border-black/5 pb-4">
                <span className="text-sm font-medium text-[#3B2F2F]/60">Service</span>
                <span className="text-base font-medium text-[#0F0F0F]">{selectedService.name?.en}</span>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-black/5 pb-4">
                <span className="text-sm font-medium text-[#3B2F2F]/60">Date</span>
                <span className="text-base font-medium text-[#0F0F0F]">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-black/5 pb-4">
                <span className="text-sm font-medium text-[#3B2F2F]/60">Time</span>
                <span className="text-base font-medium text-[#C9A227]">{selectedTime.time}</span>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-black/5 pb-4">
                <span className="text-sm font-medium text-[#3B2F2F]/60">Duration</span>
                <span className="text-base font-medium text-[#0F0F0F]">{selectedService.duration} Minutes</span>
              </div>
              <div className="flex items-center justify-between gap-4 pt-2">
                <span className="text-xl font-bold tracking-[-0.03em] text-[#0F0F0F]">Total Investment</span>
                <span className="text-2xl font-bold tracking-[-0.03em] text-[#C9A227]">{selectedService.price} ETB</span>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-[#C9A227]/20 bg-[linear-gradient(135deg,#fff_0%,#f7f2e7_100%)] p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F0F0F] text-[#C9A227]">
                <CreditCardIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-lg font-bold text-[#0F0F0F]">Advance payment policy</p>
                <p className="mt-2 text-base leading-7 text-gray-700">
                  A 50% advance payment is required to secure this appointment. You will be redirected to our payment flow immediately after confirmation.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={handleBack} className={`${outlineButton} sm:flex-1`}>
              Go back
            </button>
            <button type="button" onClick={handleConfirmBooking} disabled={isLoading} className={`${goldButton} sm:flex-[1.4] ${isLoading ? 'cursor-not-allowed opacity-70' : ''}`}>
              {isLoading ? 'Confirming...' : 'Confirm and pay'}
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default BookingPage;
