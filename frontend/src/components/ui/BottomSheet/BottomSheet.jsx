import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import './BottomSheet.css';

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

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[1100] flex flex-col justify-end lg:items-center lg:justify-center"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={handleBackdropClick}
            aria-hidden="true"
          />

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            initial={{ y: '100%', opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.8 }}
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 200, 
              mass: 0.8,
              opacity: { duration: 0.2 }
            }}
            className="bottom-sheet z-10 w-full lg:w-full lg:max-w-md bg-white rounded-t-3xl lg:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden overscroll-none border border-accent-gold/20 lg:border-none lg:m-4"
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
            <div className="bottom-sheet-content flex-1 overflow-y-auto overscroll-contain p-6 custom-scrollbar">
              {children}
            </div>

            {/* Sticky Footer */}
            {footer && (
              <div className="p-6 border-t border-gray-100 bg-white shrink-0 pb-[calc(1.5rem+env(safe-area-inset-bottom))] lg:pb-6">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BottomSheet;
