import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { verifyPayment } from '../../store/slices/paymentSlice';

const PaymentCallbackPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { appointmentId } = useParams();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  const transactionId = searchParams.get('transaction_id');
  const paymentStatus = searchParams.get('status');

  useEffect(() => {
    const verifyTransaction = async () => {
      if (transactionId) {
        try {
          const result = await dispatch(verifyPayment(transactionId));
          if (verifyPayment.fulfilled.match(result)) {
            const status = result.payload?.paymentStatus;
            if (status === 'PARTIAL' || status === 'COMPLETED') {
              setStatus('success');
              setMessage('Payment successful! Your appointment is confirmed.');
            } else {
              setStatus('failed');
              setMessage('Payment verification failed. Please contact support.');
            }
          } else {
            setStatus('failed');
            setMessage('Payment verification failed. Please contact support.');
          }
        } catch (error) {
          setStatus('failed');
          setMessage('An error occurred during verification.');
        }
      } else if (paymentStatus === 'success') {
        setStatus('success');
        setMessage('Payment successful! Your appointment is confirmed.');
      } else {
        setStatus('failed');
        setMessage('Payment was not completed. Please try again.');
      }
    };

    verifyTransaction();
  }, [dispatch, transactionId, paymentStatus]);

  if (status === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
        {status === 'success' ? (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/queue')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Queue
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                My Appointments
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/payment/${appointmentId}`)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/booking')}
                className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Book Another
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentCallbackPage;