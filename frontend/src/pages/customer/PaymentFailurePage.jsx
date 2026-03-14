import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentFailurePage = ({ message, appointmentId }) => {
  const navigate = useNavigate();

  return (
    <>
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border-4 border-white">
        <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h2 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Payment Failed</h2>
      <p className="text-gray-600 text-lg mb-8 leading-relaxed max-w-sm mx-auto">
        {message || 'Your payment could not be completed.'}
      </p>

      <div className="space-y-4">
        <button
          onClick={() => navigate(`/payment/${appointmentId}`)}
          className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
        >
          Try Payment Again
        </button>
        <button
          onClick={() => navigate('/booking')}
          className="w-full bg-white text-gray-700 font-semibold py-3 px-4 rounded-xl border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
        >
          Book New Appointment
        </button>
      </div>
    </>
  );
};

export default PaymentFailurePage;
