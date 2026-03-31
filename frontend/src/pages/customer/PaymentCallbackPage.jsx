import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams, useSearchParams } from 'react-router-dom';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { verifyPayment } from '../../store/slices/paymentSlice';
import PaymentSuccessPage from './PaymentSuccessPage';
import PaymentFailurePage from './PaymentFailurePage';

const PaymentCallbackPage = () => {
  const dispatch = useDispatch();
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
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-full max-w-md rounded-[32px] border border-black/5 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#F8F4EC] text-[#C9A227]">
            <ArrowPathIcon className="h-10 w-10 animate-spin" />
          </div>
          <h3 className="mt-6 text-3xl font-bold tracking-[-0.04em] text-[#0F0F0F]">Verifying payment</h3>
          <p className="mt-4 text-base leading-8 text-gray-700">Please keep this page open while we confirm the provider response.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-xl rounded-[32px] border border-black/5 bg-white p-8 text-center shadow-sm sm:p-10">
        {status === 'success' ? (
          <PaymentSuccessPage message={message} appointmentId={appointmentId} />
        ) : (
          <PaymentFailurePage message={message} appointmentId={appointmentId} />
        )}
      </div>
    </div>
  );
};

export default PaymentCallbackPage;
