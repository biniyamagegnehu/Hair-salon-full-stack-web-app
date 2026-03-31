import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

const blackButton = 'bg-[#0F0F0F] text-white px-6 py-3 rounded-lg hover:bg-[#2A2A2A] transition-all duration-300 font-medium shadow-md hover:shadow-lg';
const outlineButton = 'border-2 border-[#C9A227] text-[#C9A227] px-6 py-3 rounded-lg hover:bg-[#C9A227] hover:text-[#0F0F0F] transition-all duration-300';

const PaymentSuccessPage = ({ message }) => {
  const navigate = useNavigate();
  const { width, height } = useWindowSize();
  const [countdown, setCountdown] = useState(5);

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
      <Confetti width={width} height={height} recycle={false} numberOfPieces={320} gravity={0.15} />
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
        <CheckCircleIcon className="h-10 w-10" />
      </div>
      <h2 className="mt-6 text-4xl font-bold tracking-[-0.04em] text-[#0F0F0F]">Payment successful</h2>
      <p className="mt-4 text-base leading-8 text-gray-700">
        {message || 'Your appointment is now confirmed.'}
      </p>
      <div className="mt-6 rounded-2xl bg-[#F8F4EC] px-5 py-4">
        <p className="text-sm font-medium text-[#3B2F2F]/65">Redirecting to your queue position in <span className="text-[#C9A227]">{countdown}</span> seconds.</p>
      </div>
      <div className="mt-8 space-y-3">
        <button type="button" onClick={() => navigate('/queue')} className={`${blackButton} w-full`}>
          View live queue
        </button>
        <button type="button" onClick={() => navigate('/profile')} className={`${outlineButton} w-full`}>
          My appointments
        </button>
      </div>
    </>
  );
};

export default PaymentSuccessPage;
