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
      <div className="min-h-screen flex items-center justify-center p-4 bg-cream">
        <div className="text-center p-8 bg-white rounded-2xl shadow-2xl border border-border-primary max-w-sm w-full">
          <div className="relative mx-auto mb-6 w-20 h-20">
            <div className="absolute inset-0 animate-ping rounded-full bg-gold/20 opacity-75"></div>
            <div className="relative animate-spin rounded-full h-20 w-20 border-4 border-t-gold border-r-gold border-b-border-primary border-l-border-primary"></div>
          </div>
          <h3 className="text-xl font-black text-black mb-2 tracking-tight uppercase">Verifying Payment...</h3>
          <p className="text-secondary-brown font-bold opacity-40">Please do not close this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-cream flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 sm:p-10 text-center relative overflow-hidden border border-border-primary">
        {/* Subtle decorative background blob */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-gold/10 opacity-50 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 rounded-full bg-gold/10 opacity-50 blur-2xl"></div>

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