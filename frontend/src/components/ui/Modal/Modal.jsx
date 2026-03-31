import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer, 
  size = 'md',
  closeOnOutsideClick = true,
  className = ''
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (closeOnOutsideClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const sizeClass = size === 'lg' ? 'max-w-4xl' : size === 'sm' ? 'max-w-md' : 'max-w-2xl';

  return createPortal(
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-primary-black/55 p-4 backdrop-blur-sm" onClick={handleBackdropClick}>
      <div className={`relative w-full ${sizeClass} rounded-3xl border border-black/10 bg-white shadow-2xl ${className}`}>
        <button 
          className="absolute right-5 top-5 z-10 rounded-xl p-2 text-secondary-brown/60 transition hover:bg-background-cream hover:text-primary-black" 
          onClick={onClose} 
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {title ? (
          <>
            <div className="border-b border-black/8 px-8 py-6">
              <h3 className="pr-10 text-2xl font-bold tracking-tight text-primary-black">{title}</h3>
            </div>
            <div className="px-8 py-6">
              {children}
            </div>
            {footer && (
              <div className="border-t border-black/8 px-8 py-5">
                {footer}
              </div>
            )}
          </>
        ) : children}
      </div>
    </div>,
    document.body
  );
};

export const ModalHeader = ({ children, className = '' }) => (
  <div className={`border-b border-black/8 px-8 py-6 ${className}`}>
    <h3 className="pr-10 text-2xl font-bold tracking-tight text-primary-black">{children}</h3>
  </div>
);

export const ModalContent = ({ children, className = '' }) => (
  <div className={`px-8 py-6 ${className}`}>
    {children}
  </div>
);

export const ModalFooter = ({ children, className = '' }) => (
  <div className={`border-t border-black/8 px-8 py-5 ${className}`}>
    {children}
  </div>
);

export default Modal;
