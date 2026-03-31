import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { initializePayment, verifyPayment, clearPaymentState } from '../../store/slices/paymentSlice';

const blackButton = 'bg-[#0F0F0F] text-white px-6 py-3 rounded-lg hover:bg-[#2A2A2A] transition-all duration-300 font-medium shadow-md hover:shadow-lg';
const goldButton = 'bg-[#C9A227] text-[#0F0F0F] px-6 py-3 rounded-lg hover:bg-[#DAA520] transition-all duration-300 font-medium shadow-md';
const outlineButton = 'border-2 border-[#C9A227] text-[#C9A227] px-6 py-3 rounded-lg hover:bg-[#C9A227] hover:text-[#0F0F0F] transition-all duration-300';

const StateCard = ({ icon: Icon, title, message, children, accent }) => (
  <div className="mx-auto max-w-xl rounded-[32px] border border-black/5 bg-white p-8 text-center shadow-sm sm:p-10">
    <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${accent}`}>
      <Icon className="h-10 w-10" />
    </div>
    <h2 className="mt-6 text-4xl font-bold tracking-[-0.04em] text-[#0F0F0F]">{title}</h2>
    <p className="mt-4 text-base leading-8 text-gray-700">{message}</p>
    <div className="mt-8 space-y-3">{children}</div>
  </div>
);

const PaymentPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { appointmentId } = useParams();

  const { paymentUrl, transactionId, isLoading, error } = useSelector((state) => state.payment);
  const { currentAppointment } = useSelector((state) => state.appointments);

  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (appointmentId) {
      dispatch(initializePayment(appointmentId));
    }

    return () => {
      dispatch(clearPaymentState());
    };
  }, [dispatch, appointmentId]);

  useEffect(() => {
    let interval;
    if (transactionId && paymentStatus === 'pending') {
      interval = setInterval(async () => {
        const result = await dispatch(verifyPayment(transactionId));
        if (verifyPayment.fulfilled.match(result)) {
          const status = result.payload?.paymentStatus;
          if (status === 'PARTIAL' || status === 'COMPLETED') {
            setPaymentStatus('success');
            clearInterval(interval);
          } else if (status === 'FAILED') {
            setPaymentStatus('failed');
            clearInterval(interval);
          }
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [dispatch, transactionId, paymentStatus]);

  useEffect(() => {
    let timer;
    if (paymentStatus === 'success') {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/queue');
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [paymentStatus, navigate]);

  const handlePaymentRedirect = () => {
    if (paymentUrl) {
      window.open(paymentUrl, '_blank');
      setPaymentStatus('processing');
    }
  };

  const handleRetry = () => {
    setPaymentStatus('pending');
    dispatch(initializePayment(appointmentId));
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <StateCard
          icon={ArrowPathIcon}
          title={t('payment.processing')}
          message="We are preparing your secure payment session."
          accent="bg-[#F8F4EC] text-[#C9A227]"
        >
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#C9A227] border-t-[#F8F4EC]" />
        </StateCard>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <StateCard
          icon={XCircleIcon}
          title={t('payment.paymentFailed')}
          message={error}
          accent="bg-red-100 text-red-600"
        >
          <button type="button" onClick={handleRetry} className={`${blackButton} w-full`}>
            {t('common.tryAgain', 'Try Again')}
          </button>
          <button type="button" onClick={() => navigate('/booking')} className={`${outlineButton} w-full`}>
            {t('common.back')}
          </button>
        </StateCard>
      </div>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <StateCard
          icon={CheckCircleIcon}
          title={t('payment.paymentSuccess')}
          message={`${t('payment.redirecting')} ${countdown} ${t('common.seconds')}`}
          accent="bg-green-100 text-green-600"
        >
          <button type="button" onClick={() => navigate('/queue')} className={`${blackButton} w-full`}>
            {t('queue.title')}
          </button>
          <button type="button" onClick={() => navigate('/profile')} className={`${outlineButton} w-full`}>
            {t('profile.title')}
          </button>
        </StateCard>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <StateCard
          icon={XCircleIcon}
          title={t('payment.paymentFailed')}
          message={t('payment.paymentFailedMessage', 'Your payment could not be processed. Please try again.')}
          accent="bg-red-100 text-red-600"
        >
          <button type="button" onClick={handleRetry} className={`${blackButton} w-full`}>
            {t('common.tryAgain')}
          </button>
          <button type="button" onClick={() => navigate('/booking')} className={`${outlineButton} w-full`}>
            {t('common.back')}
          </button>
        </StateCard>
      </div>
    );
  }

  return (
    <div className="space-y-8 lg:space-y-10">
      <section className="rounded-[32px] border border-black/5 bg-white px-6 py-10 shadow-sm sm:px-8 lg:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full bg-[#C9A227] px-3 py-1 text-sm font-medium text-[#0F0F0F]">Secure payment</span>
            <h1 className="mt-4 text-4xl font-bold tracking-[-0.05em] text-[#0F0F0F] sm:text-5xl">Complete the advance payment to secure your appointment.</h1>
            <p className="mt-4 text-base leading-8 text-gray-700">
              Review your booking details, pay the required advance, and return to the live queue with confirmation in place.
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_0.85fr]">
        <section className="rounded-[32px] border border-black/5 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-6 sm:px-8">
            <h2 className="text-3xl font-bold tracking-[-0.04em] text-[#0F0F0F]">Booking summary</h2>
            <p className="mt-2 text-base text-gray-700">A quick review of the appointment you are confirming.</p>
          </div>

          {currentAppointment && (
            <div className="px-6 py-6 sm:px-8">
              <div className="rounded-[28px] bg-[#F8F4EC] p-6">
                <div className="space-y-4">
                  {[
                    [t('booking.service'), currentAppointment.service?.name?.en || t('common.service')],
                    [t('booking.date'), new Date(currentAppointment.scheduledDate).toLocaleDateString()],
                    [t('booking.time'), currentAppointment.scheduledTime]
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between gap-4 border-b border-black/5 pb-4">
                      <span className="text-sm font-medium text-[#3B2F2F]/60">{label}</span>
                      <span className="text-base font-medium text-[#0F0F0F]">{value}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between gap-4 border-b border-black/5 pb-4">
                    <span className="text-sm font-medium text-[#3B2F2F]/60">{t('payment.totalAmount')}</span>
                    <span className="text-xl font-bold tracking-[-0.03em] text-[#0F0F0F]">{currentAppointment.payment?.totalAmount} ETB</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 pt-2">
                    <span className="text-xl font-bold tracking-[-0.03em] text-[#0F0F0F]">{t('payment.advancePayment')} due</span>
                    <span className="text-2xl font-bold tracking-[-0.03em] text-[#C9A227]">{currentAppointment.payment?.advanceAmount} ETB</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-[32px] border border-black/5 bg-white px-6 py-6 shadow-sm sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F0F0F] text-[#C9A227]">
              <CreditCardIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-[-0.04em] text-[#0F0F0F]">Payment method</h2>
              <p className="mt-1 text-base text-gray-700">Choose how you want to continue.</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <button
              type="button"
              onClick={handlePaymentRedirect}
              className="w-full rounded-3xl border border-gray-100 bg-white p-5 text-left shadow-sm transition-all duration-300 hover:border-[#C9A227]/40 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-bold text-[#0F0F0F]">Chapa secure payment</p>
                  <p className="mt-2 text-base leading-7 text-gray-700">
                    Telebirr, CBE Birr, or local bank card in one secure redirect flow.
                  </p>
                </div>
                <span className="rounded-full bg-[#C9A227] px-3 py-1 text-sm font-medium text-[#0F0F0F]">
                  {t('common.recommended')}
                </span>
              </div>
              <div className="mt-5">
                <span className={blackButton}>Pay {currentAppointment?.payment?.advanceAmount || '0'} ETB</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => navigate('/queue')}
              className="w-full rounded-3xl border border-dashed border-gray-200 bg-[#F8F4EC]/50 p-5 text-left transition-colors duration-300 hover:border-[#C9A227]/40"
            >
              <p className="text-lg font-bold text-[#0F0F0F]">{t('payment.payLater')}</p>
              <p className="mt-2 text-base leading-7 text-gray-700">
                {t('payment.payLaterDescription', 'Proceed to queue and pay the advance on arrival.')}
              </p>
              <div className="mt-5">
                <span className={outlineButton}>Skip for now</span>
              </div>
            </button>
          </div>

          <div className="mt-8 rounded-3xl border border-[#C9A227]/20 bg-[linear-gradient(135deg,#fff_0%,#f7f2e7_100%)] p-5">
            <div className="flex items-start gap-3">
              <ShieldCheckIcon className="mt-0.5 h-5 w-5 text-[#C9A227]" />
              <p className="text-sm leading-7 text-gray-700">
                Powered by secure payment processing. Confirmation is checked automatically after you complete payment in the provider tab.
              </p>
            </div>
          </div>
        </section>
      </div>

      {paymentStatus === 'processing' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0F0F0F]/55 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-md rounded-[32px] border border-black/5 bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#C9A227] border-t-[#F8F4EC]" />
            <h3 className="mt-6 text-3xl font-bold tracking-[-0.04em] text-[#0F0F0F]">{t('payment.processing')}</h3>
            <p className="mt-4 text-base leading-7 text-gray-700">
              {t('payment.waitingConfirmation', 'Please complete the payment in the provider tab while we wait for confirmation here.')}
            </p>
            <button type="button" onClick={() => setPaymentStatus('pending')} className={`${outlineButton} mt-8 w-full`}>
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
