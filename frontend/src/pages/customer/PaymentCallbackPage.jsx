import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams, useSearchParams } from 'react-router-dom';
import { verifyPayment } from '../../store/slices/paymentSlice';

import PaymentSuccessPage from './PaymentSuccessPage';
import PaymentFailurePage from './PaymentFailurePage';

const PaymentCallbackPage = () => {
  const dispatch = useDispatch();
  const { appointmentId } = useParams();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'failed'
  const [message, setMessage] = useState('');

  const transactionId = searchParams.get('transaction_id');
  const paymentStatus = searchParams.get('status');

  useEffect(() => {
    const verifyTransaction = async () => {
      if (transactionId) {
        try {
          const result = await dispatch(verifyPayment(transactionId));
          if (verifyPayment.fulfilled.match(result)) {
            const returnedStatus = result.payload?.paymentStatus;
            if (returnedStatus === 'PARTIAL' || returnedStatus === 'COMPLETED') {
              setStatus('success');
              setMessage('Payment successful! Your appointment is confirmed.');
            } else {
              setStatus('failed');
              setMessage('Payment verification failed. Please contact support.');
            }
          } else {
            setStatus('failed');
            setMessage(result.payload || 'Payment verification failed. Please contact support.');
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
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100 max-w-sm w-full">
          <div className="relative mx-auto mb-6 w-20 h-20">
            <div className="absolute inset-0 animate-ping rounded-full bg-blue-100 opacity-75"></div>
            <div className="relative animate-spin rounded-full h-20 w-20 border-4 border-t-blue-600 border-r-blue-600 border-b-blue-200 border-l-blue-200"></div>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Verifying Payment...</h3>
          <p className="text-gray-500 font-medium">Please do not close this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8 sm:p-10 text-center relative overflow-hidden border border-gray-100">
        {/* Subtle decorative background blob */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-blue-50 opacity-50 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 rounded-full bg-blue-50 opacity-50 blur-2xl"></div>

        <div className="relative z-10">
          {status === 'success' ? (
            <PaymentSuccessPage message={message} appointmentId={appointmentId} />
          ) : (
            <PaymentFailurePage message={message} appointmentId={appointmentId} />
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentCallbackPage;