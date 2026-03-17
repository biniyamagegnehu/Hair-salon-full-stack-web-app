import React from 'react';
import './Input.css';

/**
 * Input Component
 * 
 * Supports text, email, password, number, tel, textarea, select
 */
const Input = ({ 
  label, 
  error, 
  helperText, 
  type = 'text', 
  icon, 
  className = '', 
  id,
  options = [], // For select type
  ...props 
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const containerClasses = ['input-group', className].filter(Boolean).join(' ');
  const inputClasses = [
    'input-field',
    error ? 'input-error' : '',
    icon ? 'input-with-icon' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}
      
      <div className="input-wrapper">
        {icon && <span className="input-icon">{icon}</span>}
        
        {type === 'textarea' ? (
          <textarea 
            id={inputId} 
            className={inputClasses} 
            {...props} 
          />
        ) : type === 'select' ? (
          <select 
            id={inputId} 
            className={inputClasses} 
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input 
            id={inputId} 
            type={type} 
            className={inputClasses} 
            {...props} 
          />
        )}
      </div>
      
      {(error || helperText) && (
        <p className={`input-message ${error ? 'error' : 'helper'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default Input;
