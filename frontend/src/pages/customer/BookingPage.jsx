import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { format, addDays } from 'date-fns';
import { toast } from 'react-hot-toast';
import "react-datepicker/dist/react-datepicker.css";

import { fetchServices } from '../../store/slices/serviceSlice';
import { appointmentsService } from '../../services/api/appointments';
import { createAppointment } from '../../store/slices/appointmentSlice';
import Button from '../../components/ui/Button/Button';
import Card, { CardBody } from '../../components/ui/Card/Card';
import Badge from '../../components/ui/Badge/Badge';
import Skeleton from '../../components/ui/Skeleton/Skeleton';
import './BookingPage.css';

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

  const getServiceIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes('haircut')) return '💇‍♂️';
    if (n.includes('beard')) return '🧔';
    if (n.includes('shave')) return '🪒';
    return '✨';
  };

  return (
    <div className="booking-page animate-fade-in">
      <div className="container max-w-5xl">
        <div className="text-center mb-12">
          <Badge variant="gold" size="lg" className="mb-4">Appointment</Badge>
          <h1 className="text-5xl font-black text-black">Reserve Your Chair</h1>
        </div>

        {/* Progress Stepper */}
        <div className="booking-stepper max-w-2xl mx-auto">
          {[
            { num: 1, label: 'Service' },
            { num: 2, label: 'Schedule' },
            { num: 3, label: 'Confirm' }
          ].map((s) => (
            <div key={s.num} className={`step-item ${step === s.num ? 'active' : ''} ${step > s.num ? 'completed' : ''}`}>
              <div className="step-number">
                {step > s.num ? '✓' : s.num}
              </div>
              <span className="step-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Step 1: Select Service */}
        {step === 1 && (
          <div className="animate-slide-up">
            {servicesLoading ? (
              <div className="booking-services-grid">
                {[1, 2, 4, 5].map(i => (
                  <Skeleton key={i} height="120px" variant="rectangle" className="rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="booking-services-grid">
                {services.map((service) => (
                  <button
                    key={service._id}
                    onClick={() => handleServiceSelect(service)}
                    className={`booking-service-btn ${selectedService?._id === service._id ? 'selected' : ''}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-3xl p-3 bg-cream rounded-lg">
                        {getServiceIcon(service.name?.en || '')}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="text-lg font-bold">{service.name?.en || 'Service'}</h3>
                          <span className="text-gold font-black">{service.price} ETB</span>
                        </div>
                        <p className="text-sm opacity-60 line-clamp-2 mb-2">{service.description?.en}</p>
                        <span className="text-xs font-bold opacity-40 uppercase tracking-widest">{service.duration} MIN</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Select Date & Time */}
        {step === 2 && selectedService && (
          <div className="animate-slide-up bg-white p-8 rounded-2xl border border-gold/20 shadow-xl">
            <div className="flex items-center justify-between mb-10 pb-6 border-b">
              <div className="flex items-center gap-4">
                <div className="text-3xl">{getServiceIcon(selectedService.name?.en)}</div>
                <div>
                  <h2 className="text-2xl font-black">{selectedService.name?.en}</h2>
                  <p className="text-sm opacity-50">Select your preferred time</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleBack}>
                Changing Service?
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="flex flex-col items-center">
                <label className="text-xs font-black uppercase tracking-widest mb-6 self-start text-gold">
                  1. Choose Date
                </label>
                <div className="custom-datepicker-container">
                  <DatePicker
                    selected={selectedDate}
                    onChange={handleDateChange}
                    minDate={new Date()}
                    maxDate={addDays(new Date(), 30)}
                    inline
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest mb-6 block text-gold">
                  2. Choose Time
                </label>
                {!selectedDate ? (
                  <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-gold/10 rounded-xl bg-cream/30 text-center px-4">
                    <span className="text-4xl mb-4">📅</span>
                    <p className="text-sm font-bold opacity-40">Please select a date first <br />to see available slots</p>
                  </div>
                ) : loadingSlots ? (
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <Skeleton key={i} height="40px" variant="rectangle" />
                    ))}
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="time-slots-grid">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => handleTimeSelect(slot)}
                        className={`slot-btn ${selectedTime?.time === slot.time ? 'selected' : ''}`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-error font-bold">
                    No slots available for this day. <br />Please try another date.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Confirm Booking */}
        {step === 3 && selectedService && selectedDate && selectedTime && (
          <div className="animate-slide-up max-w-2xl mx-auto">
            <Card variant="gold-border" className="overflow-hidden">
              <div className="bg-primary-black p-6 text-center text-white">
                <h2 className="text-3xl font-black mb-1">Confirm Booking</h2>
                <p className="text-gold text-sm font-bold uppercase tracking-widest">Review Your Appointment</p>
              </div>
              
              <CardBody className="p-8">
                <div className="space-y-2 mb-10">
                  <div className="summary-row">
                    <span className="font-bold opacity-50">Service</span>
                    <span className="font-black text-lg">{selectedService.name?.en}</span>
                  </div>
                  <div className="summary-row">
                    <span className="font-bold opacity-50">Date</span>
                    <span className="font-bold">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                  <div className="summary-row">
                    <span className="font-bold opacity-50">Time</span>
                    <span className="font-bold text-accent-gold">{selectedTime.time}</span>
                  </div>
                  <div className="summary-row">
                    <span className="font-bold opacity-50">Duration</span>
                    <span className="font-bold">{selectedService.duration} Minutes</span>
                  </div>
                  <div className="summary-row items-center border-t-2 border-gold/10 mt-6 pt-6">
                    <span className="font-black text-xl uppercase tracking-tighter">Total Investment</span>
                    <span className="summary-total">{selectedService.price} ETB</span>
                  </div>
                </div>

                <div className="bg-black p-4 rounded-xl mb-8 flex items-start gap-4">
                  <div className="text-2xl mt-1">💳</div>
                  <p className="text-xs text-white/70 leading-relaxed font-medium">
                    <strong className="text-gold uppercase block mb-1">Payment Policy</strong>
                    A 50% advance payment is required to secure your appointment. You will be redirected to our secure payment portal.
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" className="flex-1" onClick={handleBack}>
                    Go Back
                  </Button>
                  <Button
                    onClick={handleConfirmBooking}
                    variant="gold"
                    fullWidth
                    isLoading={isLoading}
                    className="flex-[2] py-4 text-black font-black uppercase tracking-widest"
                  >
                    Confirm & Pay
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;