import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

/**
 * Modal Component
 * 
 * Features: cream background, gold accents, backdrop, slide-up animation
 */
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
    if (closeOnOutsideClick && e.target.classList.contains('modal-backdrop')) {
      onClose();
    }
  };

  return createPortal(
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className={`modal-container modal-${size} ${className} animate-slide-up`}>
        {/* Close Button - Always visible regardless of structure */}
        <button 
          className="modal-close" 
          onClick={onClose} 
          aria-label="Close"
          style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 10 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Support both prop-based and composition-based rendering */}
        {title ? (
          <>
            <div className="modal-header">
              <h3 className="modal-title text-2xl font-black uppercase tracking-tight">{title}</h3>
            </div>
            <div className="modal-content">
              {children}
            </div>
            {footer && (
              <div className="modal-footer">
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
  <div className={`modal-header ${className}`}>
    <h3 className="modal-title text-2xl font-black uppercase tracking-tight">{children}</h3>
  </div>
);

export const ModalContent = ({ children, className = '' }) => (
  <div className={`modal-content ${className}`}>
    {children}
  </div>
);

export const ModalFooter = ({ children, className = '' }) => (
  <div className={`modal-footer ${className}`}>
    {children}
  </div>
);

export default Modal;
