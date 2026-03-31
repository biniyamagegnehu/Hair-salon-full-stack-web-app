import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import './FloatingActionButton.css';

const FloatingActionButton = ({
  icon = <PlusIcon className="w-6 h-6 stroke-2" />,
  onClick,
  actions = [], // Array of { icon, label, onClick }
  position = 'bottom-right'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-24 right-4 lg:bottom-8 lg:right-8',
    'bottom-left': 'bottom-24 left-4 lg:bottom-8 lg:left-8'
  };

  const hasActions = actions && actions.length > 0;

  // Handle outside click to close
  useEffect(() => {
    if (!hasActions || !isOpen) return;

    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, hasActions]);

  const handleClick = (e) => {
    if (hasActions) {
      setIsOpen(!isOpen);
    } else if (onClick) {
      onClick(e);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`fixed z-[1020] flex flex-col items-end gap-3 ${positionClasses[position]}`}
    >
      <AnimatePresence>
        {isOpen && hasActions && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-3 mb-2"
          >
            {actions.map((action, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 group"
              >
                <span className="bg-white px-3 py-1.5 rounded-lg shadow-sm text-xs font-black uppercase text-secondary-brown/80 opacity-0 lg:opacity-100 group-hover:opacity-100 transition-opacity">
                  {action.label}
                </span>
                <div className="w-12 h-12 rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] flex items-center justify-center text-accent-gold border border-accent-gold/20 hover:bg-accent-gold hover:text-white transition-colors active:scale-95">
                  {action.icon}
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        onClick={handleClick}
        className="w-14 h-14 rounded-full bg-black shadow-[0_4px_14px_rgba(201,162,39,0.4)] flex items-center justify-center text-accent-gold hover:scale-105 active:scale-95 transition-transform border border-accent-gold/20"
        aria-label="Primary Actions"
      >
        {isOpen && hasActions ? (
          <XMarkIcon className="w-6 h-6 stroke-2" />
        ) : (
          icon
        )}
      </motion.button>
    </div>
  );
};

export default FloatingActionButton;
