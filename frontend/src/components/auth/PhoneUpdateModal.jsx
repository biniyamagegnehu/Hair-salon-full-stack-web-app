import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updatePhoneNumber, setRequiresPhoneUpdate } from '../../store/slices/authSlice';

const PhoneUpdateModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.auth);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const validatePhoneNumber = (phone) => {
    const ethiopianPhoneRegex = /^\+251[79]\d{8}$/;
    return ethiopianPhoneRegex.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid Ethiopian phone number (+251XXXXXXXXX)');
      return;
    }

    const result = await dispatch(updatePhoneNumber(phoneNumber));
    if (updatePhoneNumber.fulfilled.match(result)) {
      dispatch(setRequiresPhoneUpdate(false));
      onClose();
      navigate('/');
    }
  };

  const handleSkip = () => {
    dispatch(setRequiresPhoneUpdate(false));
    onClose();
    navigate('/');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden border border-border-primary">
        <div className="p-10">
          <div className="text-center mb-10">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gold/10 mb-6 border-2 border-gold/20 shadow-inner">
              <svg className="h-10 w-10 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="text-3xl font-black text-black mb-3 tracking-tighter uppercase italic">
              Legacy <span className="text-gold">Connection</span>
            </h3>
            <p className="text-secondary-brown font-bold opacity-60 text-sm leading-relaxed">
              We require your Ethiopian phone number to keep you updated on your master transformation and queue status.
            </p>
          </div>
 
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-[10px] font-black uppercase tracking-widest text-gold mb-2 pl-1">
                Ethiopian Phone Number
              </label>
              <div className="relative">
                <input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    setError('');
                  }}
                  className={`w-full bg-cream px-6 py-4 rounded-2xl font-bold text-black border-2 transition-all outline-none ${
                    error ? 'border-error ring-4 ring-error/5' : 'border-transparent focus:border-gold focus:ring-4 focus:ring-gold/5'
                  }`}
                  placeholder="+251911223344"
                  required
                />
              </div>
              {error && (
                <p className="text-[10px] font-black text-error uppercase tracking-widest mt-2 pl-1">{error}</p>
              )}
              <p className="text-[10px] font-black text-secondary-brown opacity-30 uppercase tracking-widest mt-2 pl-1">
                Ex: +251 911 22 33 44
              </p>
            </div>
 
            <div className="flex flex-col gap-3 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white font-black uppercase tracking-widest py-5 px-4 rounded-2xl shadow-xl hover:bg-gold hover:text-black transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying...' : 'Authenticate Number'}
              </button>
              <button
                type="button"
                onClick={handleSkip}
                className="w-full bg-white text-secondary-brown font-black uppercase tracking-widest py-4 px-4 rounded-2xl border border-border-primary hover:bg-cream transition-colors text-xs"
              >
                Decide Later
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PhoneUpdateModal;