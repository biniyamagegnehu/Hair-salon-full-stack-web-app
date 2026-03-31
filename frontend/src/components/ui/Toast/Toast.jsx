import React from 'react';
const Toast = ({ 
  message, 
  type = 'info', 
  onClose,
  visible = true,
  className = ''
}) => {
  if (!visible) return null;

  const iconMap = {
    success: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    info: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    )
  };

  return (
    <div className={`flex w-full max-w-sm items-start gap-3 rounded-2xl border bg-white p-4 shadow-lg ${
      type === 'error' ? 'border-red-200' : type === 'success' ? 'border-emerald-200' : 'border-black/10'
    } ${className}`}>
      <div className="mt-0.5 text-accent-gold">
        {iconMap[type]}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-text-black">{message}</p>
      </div>
      {onClose && (
        <button className="rounded-lg p-1 text-secondary-brown/60 transition hover:bg-background-cream hover:text-primary-black" onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Toast;
