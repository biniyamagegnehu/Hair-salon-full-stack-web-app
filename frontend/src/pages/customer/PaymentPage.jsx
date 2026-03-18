import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { initializePayment, verifyPayment, clearPaymentState } from '../../store/slices/paymentSlice';
import Button from '../../components/ui/Button/Button';
import Badge from '../../components/ui/Badge/Badge';

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
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-gold border-r-gold border-b-border-primary border-l-border-primary mx-auto mb-6"></div>
          <p className="text-secondary-brown font-black uppercase tracking-widest text-[10px] opacity-40">{t('payment.processing')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-cream">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 text-center border border-border-primary">
          <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-xl">
            <svg className="h-10 w-10 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-black mb-2 uppercase tracking-tighter">{t('payment.paymentFailed')}</h2>
          <p className="text-secondary-brown font-bold opacity-60 italic mb-8">{error}</p>
          <div className="space-y-4">
            <button
              onClick={handleRetry}
              className="w-full bg-black text-white font-black uppercase tracking-widest py-4 px-4 rounded-xl shadow-xl hover:bg-gold hover:text-black transition-all duration-300 transform hover:-translate-y-1"
            >
              {t('common.tryAgain', 'Try Again')}
            </button>
            <button
              onClick={() => navigate('/booking')}
              className="w-full bg-white text-secondary-brown font-black uppercase tracking-widest py-4 px-4 rounded-xl border border-border-primary hover:bg-cream transition-colors"
            >
              {t('common.back')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-cream">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 text-center border border-border-primary">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-xl">
            <svg className="h-10 w-10 text-success animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-black mb-2 uppercase tracking-tighter">{t('payment.paymentSuccess')}</h2>
          <p className="text-secondary-brown font-bold opacity-60 italic mb-8">
            {t('payment.redirecting')} {countdown} {t('common.seconds')}
          </p>
          <div className="space-y-4">
            <button
              onClick={() => navigate('/queue')}
              className="w-full bg-black text-white font-black uppercase tracking-widest py-4 px-4 rounded-xl shadow-xl hover:bg-gold hover:text-black transition-all duration-300 transform hover:-translate-y-1"
            >
              {t('queue.title')}
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="w-full bg-white text-secondary-brown font-black uppercase tracking-widest py-4 px-4 rounded-xl border border-border-primary hover:bg-cream transition-colors"
            >
              {t('profile.title')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-cream">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 text-center border border-border-primary">
          <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-xl">
            <svg className="h-10 w-10 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-black mb-2 uppercase tracking-tighter">{t('payment.paymentFailed')}</h2>
          <p className="text-secondary-brown font-bold opacity-60 italic mb-8">
            {t('payment.paymentFailedMessage', 'Your payment could not be processed. Please try again.')}
          </p>
          <div className="space-y-4">
            <button
              onClick={handleRetry}
              className="w-full bg-black text-white font-black uppercase tracking-widest py-4 px-4 rounded-xl shadow-xl hover:bg-gold hover:text-black transition-all duration-300 transform hover:-translate-y-1"
            >
              {t('common.tryAgain')}
            </button>
            <button
              onClick={() => navigate('/booking')}
              className="w-full bg-white text-secondary-brown font-black uppercase tracking-widest py-4 px-4 rounded-xl border border-border-primary hover:bg-cream transition-colors"
            >
              {t('common.back')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-border-primary">
          <div className="bg-black px-8 py-10 text-white relative">
            <div className="absolute top-0 right-0 p-8 opacity-10 text-6xl">💳</div>
            <h1 className="text-4xl font-black mb-2 uppercase tracking-tighter italic">
              <span className="text-gold">Premium</span> {t('payment.title')}
            </h1>
            <p className="text-secondary-brown font-bold">{t('payment.advancePayment')}</p>
          </div>

          {currentAppointment && (
            <div className="p-8 border-b border-border-primary bg-white">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-secondary-brown italic mb-6">
                {t('booking.yourBooking')}
              </h2>
              <div className="bg-cream rounded-2xl p-8 space-y-4 border border-border-primary/50 shadow-inner">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-secondary-brown opacity-40">{t('booking.service')}</span>
                  <span className="font-black text-black">
                    {currentAppointment.service?.name?.en || t('common.service')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-secondary-brown opacity-40">{t('booking.date')}</span>
                  <span className="font-black text-black">
                    {new Date(currentAppointment.scheduledDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-secondary-brown opacity-40">{t('booking.time')}</span>
                  <span className="font-black text-black">
                    {currentAppointment.scheduledTime}
                  </span>
                </div>
                <div className="pt-6 border-t border-border-primary/50 mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-secondary-brown opacity-40">{t('payment.totalAmount')}</span>
                    <span className="text-xl font-black text-black">
                      {currentAppointment.payment?.totalAmount} <span className="text-[10px] opacity-40">ETB</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gold italic">{t('payment.advancePayment')} Due</span>
                    <span className="text-2xl font-black text-gold">
                      {currentAppointment.payment?.advanceAmount} <span className="text-[10px] opacity-40">ETB</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="p-8 pb-10">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-secondary-brown italic mb-6">
              {t('payment.paymentMethod')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group border-2 border-border-primary rounded-2xl p-6 hover:border-gold transition-all duration-300 bg-white shadow-sm hover:shadow-xl cursor-pointer" onClick={handlePaymentRedirect}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <img 
                      src="https://chapa.co/logo.png" 
                      alt="Chapa" 
                      className="h-6 mr-3 grayscale group-hover:grayscale-0 transition-all"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/100x30?text=Chapa';
                      }}
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest text-black">Chapa Secure</span>
                  </div>
                  <Badge variant="gold" size="sm" className="scale-75 origin-right">
                    {t('common.recommended')}
                  </Badge>
                </div>
                <p className="text-xs font-bold text-secondary-brown opacity-60 mb-8 h-10">
                  {t('payment.chapaDescription', 'Telebirr, CBE Birr, or any local bank card.')}
                </p>
                <Button
                  variant="black"
                  fullWidth
                  className="group-hover:bg-gold group-hover:text-black transition-colors"
                >
                  Pay {currentAppointment?.payment?.advanceAmount || '0'} ETB
                </Button>
              </div>

              <div className="group border-2 border-dashed border-border-primary rounded-2xl p-6 hover:border-secondary-brown hover:bg-cream transition-all duration-300 shadow-sm cursor-pointer" onClick={() => navigate('/queue')}>
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-white rounded-xl shadow-sm mr-4 text-2xl">⏳</div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-secondary-brown">{t('payment.payLater')}</span>
                </div>
                <p className="text-xs font-bold text-secondary-brown opacity-60 mb-8 h-10">
                  {t('payment.payLaterDescription', 'Proceed to queue and pay the advance on arrival.')}
                </p>
                <Button
                  variant="outline"
                  fullWidth
                  className="group-hover:border-black group-hover:text-black"
                >
                  Skip for Now
                </Button>
              </div>
            </div>

            <div className="mt-10 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-secondary-brown opacity-30">
              <svg className="h-3 w-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>{t('payment.securePayment', 'Powered by chapa technology')}</span>
            </div>
          </div>

          {paymentStatus === 'processing' && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-3xl p-10 max-w-sm mx-4 text-center border border-gold/20 shadow-2xl">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-gold border-r-gold border-b-border-primary border-l-border-primary mx-auto mb-8"></div>
                <h3 className="text-xl font-black text-black mb-2 uppercase tracking-tight">{t('payment.processing')}</h3>
                <p className="text-secondary-brown font-bold opacity-60 italic mb-8">
                  {t('payment.waitingConfirmation', 'Please complete the payment in the system tab.')}
                </p>
                <button
                  onClick={() => setPaymentStatus('pending')}
                  className="text-[10px] font-black uppercase tracking-widest text-error hover:scale-110 transition-transform"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;