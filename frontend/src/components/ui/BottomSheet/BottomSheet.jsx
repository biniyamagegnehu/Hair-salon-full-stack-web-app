import React, { useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const BottomSheet = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  showClose = true,
  actionButton = null 
}) => {
  const sheetRef = useRef(null);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
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

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
        <div 
          className="fixed inset-0 z-[1100] flex flex-col justify-end lg:items-center lg:justify-center"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={handleBackdropClick}
            aria-hidden="true"
          />

          {/* Sheet */}
          <div
            ref={sheetRef}
            className="z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-3xl border border-accent-gold/20 bg-white shadow-2xl lg:m-4 lg:max-w-md lg:rounded-3xl lg:border-none"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bottom-sheet-title"
          >
            {/* Drag Handle (Mobile only) */}
            <div 
              className="lg:hidden w-full flex justify-center pt-4 pb-2 active:bg-gray-50 transition-colors shrink-0"
              onClick={onClose}
            >
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            {(title || showClose || actionButton) && (
              <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 shrink-0">
                {title ? (
                  <h2 id="bottom-sheet-title" className="text-xl font-black uppercase text-black">
                    {title}
                  </h2>
                ) : <div />}
                
                <div className="flex items-center gap-2">
                  {actionButton}
                  {showClose && (
                    <button
                      onClick={onClose}
                      className="p-2 -mr-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors active:scale-95"
                      aria-label="Close"
                    >
                      <XMarkIcon className="w-6 h-6 stroke-2" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {children}
            </div>

            {/* Sticky Footer */}
            {footer && (
              <div className="p-6 border-t border-gray-100 bg-white shrink-0 pb-[calc(1.5rem+env(safe-area-inset-bottom))] lg:pb-6">
                {footer}
              </div>
            )}
          </div>
        </div>
  );
};

export default BottomSheet;
