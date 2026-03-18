import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

const PaymentSuccessPage = ({ message, appointmentId }) => {
  const navigate = useNavigate();
  const { width, height } = useWindowSize();
  const [countdown, setCountdown] = useState(5);

  // Auto redirect countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/queue');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <>
      <Confetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={400}
        gravity={0.15}
      />
      <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border-4 border-white">
        <svg className="h-10 w-10 text-success animate-[bounce_1s_ease-in-out_infinite]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-4xl font-black text-black mb-3 tracking-tighter uppercase">Payment Successful!</h2>
      <p className="text-secondary-brown font-bold opacity-60 text-lg mb-8 leading-relaxed max-w-sm mx-auto italic">
        {message || 'Your appointment is now confirmed.'}
      </p>
      
      <div className="bg-cream rounded-2xl p-6 mb-8 border border-border-primary">
        <p className="text-[10px] font-black uppercase tracking-widest text-secondary-brown mb-2 opacity-40">
          Redirecting to your queue position in <span className="text-gold">{countdown}</span> seconds...
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => navigate('/queue')}
          className="w-full bg-black text-white font-black uppercase tracking-widest py-4 px-4 rounded-xl shadow-xl hover:bg-gold hover:text-black transition-all duration-300 transform hover:-translate-y-1"
        >
          View Live Queue
        </button>
        <button
          onClick={() => navigate('/profile')}
          className="w-full bg-white text-secondary-brown font-black uppercase tracking-widest py-4 px-4 rounded-xl border border-border-primary hover:bg-cream transition-colors mt-4"
        >
          My Appointments
        </button>
      </div>
    </>
  );
};

export default PaymentSuccessPage;
