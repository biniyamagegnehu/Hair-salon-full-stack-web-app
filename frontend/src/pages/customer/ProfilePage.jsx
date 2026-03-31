import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchMyAppointments } from '../../store/slices/appointmentSlice';
import { updatePhoneNumber } from '../../store/slices/authSlice';
import Skeleton from '../../components/ui/Skeleton/Skeleton';

const primaryButton = 'bg-[#0F0F0F] text-white px-6 py-3 rounded-lg hover:bg-[#2A2A2A] transition-all duration-300 font-medium shadow-md hover:shadow-lg';
const goldButton = 'bg-[#C9A227] text-[#0F0F0F] px-6 py-3 rounded-lg hover:bg-[#DAA520] transition-all duration-300 font-medium shadow-md';
const outlineButton = 'border-2 border-[#C9A227] text-[#C9A227] px-6 py-3 rounded-lg hover:bg-[#C9A227] hover:text-[#0F0F0F] transition-all duration-300';
const inputClass = 'w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A227] focus:border-transparent transition-all duration-300';

const ProfilePage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
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

  const getStatusClasses = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-[#C9A227] text-[#0F0F0F]';
      case 'PENDING_PAYMENT':
        return 'bg-[#3B2F2F] text-white';
      case 'CHECKED_IN':
        return 'bg-[#0F0F0F] text-white';
      case 'IN_PROGRESS':
        return 'bg-[#F8F4EC] text-[#0F0F0F] border border-[#C9A227]/30';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-[#F8F4EC] text-[#3B2F2F]';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDateParts = (dateString) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleString('en-US', { month: 'short' }).toUpperCase()
    };
  };

  if (authLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Skeleton height="420px" variant="rectangle" className="rounded-[32px]" />
        <Skeleton height="620px" variant="rectangle" className="rounded-[32px]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 lg:space-y-10">
      <section className="rounded-[32px] border border-black/5 bg-white px-6 py-10 shadow-sm sm:px-8 lg:px-10">
        <span className="inline-flex rounded-full bg-[#C9A227] px-3 py-1 text-sm font-medium text-[#0F0F0F]">Member profile</span>
        <h1 className="mt-4 text-4xl font-bold tracking-[-0.05em] text-[#0F0F0F] sm:text-5xl">Your appointment history and profile details in one place.</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-gray-700">
          Review past and upcoming appointments, keep your contact details current, and stay ready for booking and queue updates.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-[32px] border border-black/5 bg-white p-6 shadow-sm sm:p-8">
          <div className="rounded-[28px] bg-[#0F0F0F] p-8 text-center text-white">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-[#C9A227]/30 bg-[#C9A227]/10 text-4xl font-bold text-[#C9A227]">
              {user?.fullName?.charAt(0).toUpperCase()}
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-[-0.04em]">{user?.fullName}</h2>
            <span className="mt-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white">{user?.role}</span>
          </div>

          <div className="mt-6 space-y-4">
            {[
              ['Phone', user?.phoneNumber || 'Not set'],
              ['Email', user?.email || 'Not provided'],
              ['Joined', formatDate(user?.createdAt)]
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-[#F8F4EC] px-4 py-4">
                <p className="text-sm font-medium text-[#3B2F2F]/60">{label}</p>
                <p className="mt-2 text-base font-medium text-[#0F0F0F]">{value}</p>
              </div>
            ))}
          </div>

          <button type="button" onClick={() => setShowPhoneModal(true)} className={`${outlineButton} mt-6 w-full`}>
            Edit information
          </button>
        </section>

        <section className="rounded-[32px] border border-black/5 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-100 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div>
              <h2 className="text-3xl font-bold tracking-[-0.04em] text-[#0F0F0F]">Appointment history</h2>
              <p className="mt-2 text-base text-gray-700">A clean timeline of your sessions with current service status.</p>
            </div>
            <span className="inline-flex rounded-full bg-[#C9A227] px-3 py-1 text-sm font-medium text-[#0F0F0F]">
              {appointments.length} total
            </span>
          </div>

          <div className="px-6 py-6 sm:px-8">
            {appointmentsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <Skeleton key={item} height="112px" variant="rectangle" className="rounded-3xl" />
                ))}
              </div>
            ) : appointments.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-gray-200 bg-[#F8F4EC]/50 px-6 py-16 text-center">
                <p className="text-2xl font-bold tracking-[-0.03em] text-[#0F0F0F]">No appointments yet.</p>
                <p className="mt-3 text-base leading-7 text-gray-700">Once you book your first session, it will appear here for easy tracking.</p>
                <button type="button" onClick={() => navigate('/booking')} className={`${goldButton} mt-6`}>
                  Book your first session
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => {
                  const { day, month } = getDateParts(appointment.scheduledDate);
                  return (
                    <article key={appointment.id || appointment._id} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-md">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-4">
                          <div className="flex min-h-[72px] min-w-[72px] flex-col items-center justify-center rounded-2xl bg-[#0F0F0F] text-white">
                            <span className="text-xs font-medium tracking-[0.18em] text-[#C9A227]">{month}</span>
                            <span className="mt-1 text-2xl font-bold tracking-[-0.03em]">{day}</span>
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold tracking-[-0.03em] text-[#0F0F0F]">{appointment.service?.name?.en || 'Premium Service'}</h3>
                            <p className="mt-2 text-base text-gray-700">{appointment.scheduledTime} • {appointment.service?.duration || 30} minutes</p>
                            <p className="mt-2 text-sm text-[#3B2F2F]/60">{formatDate(appointment.scheduledDate)}</p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 lg:items-end">
                          <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getStatusClasses(appointment.status)}`}>
                            {appointment.status.replace('_', ' ')}
                          </span>
                          {appointment.queuePosition && (
                            <p className="text-sm font-medium text-[#C9A227]">Queue position #{appointment.queuePosition}</p>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>

      {showPhoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-[#0F0F0F]/55 backdrop-blur-sm" onClick={() => setShowPhoneModal(false)} aria-label="Close phone update dialog" />
          <div className="relative z-10 w-full max-w-lg rounded-[32px] border border-black/5 bg-white p-8 shadow-2xl">
            <h3 className="text-3xl font-bold tracking-[-0.04em] text-[#0F0F0F]">Update phone number</h3>
            <p className="mt-4 text-base leading-7 text-gray-700">
              We use your phone number for appointment coordination and important updates related to your visit.
            </p>

            <div className="mt-6">
              <label htmlFor="profile-phone" className="block text-sm font-medium text-gray-600">Phone Number</label>
              <input
                id="profile-phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  setPhoneError('');
                }}
                placeholder="+251911223344"
                className={`${inputClass} mt-2`}
              />
              {phoneError ? (
                <p className="mt-2 text-sm text-red-600">{phoneError}</p>
              ) : (
                <p className="mt-2 text-sm text-gray-500">Format: +251 9/7 [8 digits]</p>
              )}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={() => setShowPhoneModal(false)} className={`${outlineButton} sm:flex-1`}>
                Discard
              </button>
              <button type="button" onClick={handleUpdatePhone} disabled={updatingPhone} className={`${goldButton} sm:flex-1 ${updatingPhone ? 'cursor-not-allowed opacity-70' : ''}`}>
                {updatingPhone ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
