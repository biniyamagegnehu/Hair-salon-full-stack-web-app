import React, { useId } from 'react';
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
  const generatedId = useId();
  const inputId = id || generatedId;
  const containerClasses = ['space-y-2', className].filter(Boolean).join(' ');
  const baseInput =
    'w-full rounded-xl border px-4 py-3 text-sm text-text-black placeholder:text-secondary-brown/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold/50';
  const inputClasses = [
    baseInput,
    error ? 'border-red-300 bg-red-50/50' : 'border-black/10 bg-white',
    icon ? 'pl-10' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-secondary-brown">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-secondary-brown/50">{icon}</span>}
        
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
        <p className={`text-xs ${error ? 'text-red-600' : 'text-secondary-brown/65'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default Input;
