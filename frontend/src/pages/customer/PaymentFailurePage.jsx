import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircleIcon } from '@heroicons/react/24/outline';

const blackButton = 'bg-[#0F0F0F] text-white px-6 py-3 rounded-lg hover:bg-[#2A2A2A] transition-all duration-300 font-medium shadow-md hover:shadow-lg';
const outlineButton = 'border-2 border-[#C9A227] text-[#C9A227] px-6 py-3 rounded-lg hover:bg-[#C9A227] hover:text-[#0F0F0F] transition-all duration-300';

const PaymentFailurePage = ({ message, appointmentId }) => {
  const navigate = useNavigate();

  return (
    <>
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600">
        <XCircleIcon className="h-10 w-10" />
      </div>
      <h2 className="mt-6 text-4xl font-bold tracking-[-0.04em] text-[#0F0F0F]">Payment failed</h2>
      <p className="mt-4 text-base leading-8 text-gray-700">
        {message || 'Your payment could not be completed.'}
      </p>
      <div className="mt-8 space-y-3">
        <button type="button" onClick={() => navigate(`/payment/${appointmentId}`)} className={`${blackButton} w-full`}>
          Try payment again
        </button>
        <button type="button" onClick={() => navigate('/booking')} className={`${outlineButton} w-full`}>
          Book new appointment
        </button>
      </div>
    </>
  );
};

export default PaymentFailurePage;
