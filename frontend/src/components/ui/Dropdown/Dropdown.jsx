import React, { useState, useRef, useEffect } from 'react';
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
  const positionClasses = {
    'bottom-right': 'right-0 top-full mt-2',
    'bottom-left': 'left-0 top-full mt-2',
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button type="button" className="inline-flex" onClick={toggleDropdown}>
        {trigger}
      </button>
      
      {isOpen && (
        <div className={`absolute z-40 min-w-[180px] overflow-hidden rounded-xl border border-black/10 bg-white shadow-xl ${positionClasses[position] || positionClasses['bottom-right']}`}>
          {items.map((item, index) => (
            <button
              type="button"
              key={index} 
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-text-black transition hover:bg-background-cream ${item.className || ''}`}
              onClick={() => {
                if (item.onClick) item.onClick();
                setIsOpen(false);
              }}
            >
              {item.icon && <span>{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
