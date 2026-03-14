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
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border-4 border-white">
        <svg className="h-10 w-10 text-green-600 animate-[bounce_1s_ease-in-out_infinite]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Payment Successful!</h2>
      <p className="text-gray-600 text-lg mb-8 leading-relaxed max-w-sm mx-auto">
        {message || 'Your appointment is now confirmed.'}
      </p>
      
      <div className="bg-gray-50 rounded-lg p-4 mb-8">
        <p className="text-sm text-gray-500 font-medium">
          Redirecting to your queue position in <span className="text-blue-600 font-bold">{countdown}</span> seconds...
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => navigate('/queue')}
          className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
        >
          View Live Queue
        </button>
        <button
          onClick={() => navigate('/profile')}
          className="w-full bg-white text-gray-700 font-semibold py-3 px-4 rounded-xl border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
        >
          My Appointments
        </button>
      </div>
    </>
  );
};

export default PaymentSuccessPage;
