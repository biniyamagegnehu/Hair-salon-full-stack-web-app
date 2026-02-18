import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { initializePayment, verifyPayment, clearPaymentState } from '../../store/slices/paymentSlice';

const PaymentPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { appointmentId } = useParams();
  
  const { paymentUrl, transactionId, isLoading, error } = useSelector((state) => state.payment);
  const { currentAppointment } = useSelector((state) => state.appointments);
  
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, processing, success, failed
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (appointmentId) {
      dispatch(initializePayment(appointmentId));
    }

    return () => {
      dispatch(clearPaymentState());
    };
  }, [dispatch, appointmentId]);

  // Poll for payment verification
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
      }, 3000); // Check every 3 seconds
    }
    return () => clearInterval(interval);
  }, [dispatch, transactionId, paymentStatus]);

  // Redirect countdown after success
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/booking')}
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back to Booking
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-4">
            Your appointment has been confirmed. You'll be redirected to the queue page in {countdown} seconds.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/queue')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Queue Now
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              View My Appointments
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h2>
          <p className="text-gray-600 mb-4">
            Your payment could not be processed. Please try again.
          </p>
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/booking')}
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back to Booking
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8 text-white">
            <h1 className="text-3xl font-bold mb-2">Complete Your Payment</h1>
            <p className="text-blue-100">
              Please pay 50% advance to confirm your appointment
            </p>
          </div>

          {/* Appointment Summary */}
          {currentAppointment && (
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Appointment Summary</h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium text-gray-800">
                    {currentAppointment.service?.name?.en || 'Service'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium text-gray-800">
                    {new Date(currentAppointment.scheduledDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium text-gray-800">
                    {currentAppointment.scheduledTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-medium text-gray-800">
                    {currentAppointment.payment?.totalAmount} ETB
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-lg font-semibold text-gray-800">Advance Payment:</span>
                  <span className="text-lg font-bold text-blue-600">
                    {currentAppointment.payment?.advanceAmount} ETB
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Options */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment Method</h2>
            
            <div className="space-y-4">
              {/* Chapa Payment Option */}
              <div className="border rounded-lg p-4 hover:border-blue-500 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <img 
                      src="https://chapa.co/logo.png" 
                      alt="Chapa" 
                      className="h-8 mr-3"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/100x30?text=Chapa';
                      }}
                    />
                    <span className="font-medium text-gray-800">Pay with Chapa</span>
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Recommended
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Pay securely with Chapa using Telebirr, CBE Birr, or any Ethiopian bank card.
                </p>
                <button
                  onClick={handlePaymentRedirect}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Pay {currentAppointment?.payment?.advanceAmount || '0'} ETB
                </button>
              </div>

              {/* Pay at Salon Option */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center mb-4">
                  <svg className="h-8 w-8 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="font-medium text-gray-800">Pay at Salon</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  You can also pay the advance amount when you arrive at the salon. Please note that online payment is recommended to secure your slot.
                </p>
                <button
                  onClick={() => navigate('/queue')}
                  className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Pay Later at Salon
                </button>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-6 flex items-center justify-center text-sm text-gray-500">
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Secure payment powered by Chapa</span>
            </div>
          </div>

          {/* Processing State */}
          {paymentStatus === 'processing' && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Waiting for Payment</h3>
                  <p className="text-sm text-gray-500">
                    Please complete the payment in the opened tab. We're waiting for confirmation...
                  </p>
                  <button
                    onClick={() => setPaymentStatus('pending')}
                    className="mt-4 text-sm text-blue-600 hover:text-blue-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;