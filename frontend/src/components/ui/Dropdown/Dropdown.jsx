import React, { useState, useRef, useEffect } from 'react';
import './Dropdown.css';

/**
 * Dropdown Component
 * 
 * Features: gold trigger, cream menu, gold hover items, smooth transitions
 */
const Dropdown = ({ 
  trigger, 
  items = [], 
  position = 'bottom-right',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <div className={`dropdown ${className}`} ref={dropdownRef}>
      <div className="dropdown-trigger" onClick={toggleDropdown}>
        {trigger}
      </div>
      
      {isOpen && (
        <div className={`dropdown-menu dropdown-pos-${position} animate-fade-in`}>
          {items.map((item, index) => (
            <div 
              key={index} 
              className={`dropdown-item ${item.className || ''}`}
              onClick={() => {
                if (item.onClick) item.onClick();
                setIsOpen(false);
              }}
            >
              {item.icon && <span className="dropdown-item-icon">{item.icon}</span>}
              <span className="dropdown-item-label">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
