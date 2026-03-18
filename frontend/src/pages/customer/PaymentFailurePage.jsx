import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentFailurePage = ({ message, appointmentId }) => {
  const navigate = useNavigate();

  return (
    <>
      <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border-4 border-white">
        <svg className="h-10 w-10 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h2 className="text-4xl font-black text-black mb-3 tracking-tighter uppercase">Payment Failed</h2>
      <p className="text-secondary-brown font-bold opacity-60 text-lg mb-8 leading-relaxed max-w-sm mx-auto italic">
        {message || 'Your payment could not be completed.'}
      </p>

      <div className="space-y-4">
        <button
          onClick={() => navigate(`/payment/${appointmentId}`)}
          className="w-full bg-black text-white font-black uppercase tracking-widest py-4 px-4 rounded-xl shadow-xl hover:bg-gold hover:text-black transition-all duration-300 transform hover:-translate-y-1"
        >
          Try Payment Again
        </button>
        <button
          onClick={() => navigate('/booking')}
          className="w-full bg-white text-secondary-brown font-black uppercase tracking-widest py-4 px-4 rounded-xl border border-border-primary hover:bg-cream transition-colors mt-4"
        >
          Book New Appointment
        </button>
      </div>
    </>
  );
};

export default PaymentFailurePage;
