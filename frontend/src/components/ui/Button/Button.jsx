import { motion } from 'framer-motion';
import './Button.css';

/**
 * Button Component
 * 
 * Variants: primary, secondary, gold, outline, text
 * Sizes: sm, md, lg
 */
const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false, 
  leftIcon, 
  rightIcon, 
  fullWidth = false,
  className = '',
  disabled,
  ...props 
}) => {
  const buttonClasses = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth ? 'btn-full-width' : '',
    isLoading ? 'btn-loading' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <motion.button 
      className={buttonClasses} 
      disabled={disabled || isLoading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading && (
        <span className="btn-spinner" role="status" aria-label="Loading"></span>
      )}
      
      {!isLoading && leftIcon && (
        <span className="btn-icon-left" aria-hidden="true">{leftIcon}</span>
      )}
      
      <span className="btn-content">{children}</span>
      
      {!isLoading && rightIcon && (
        <span className="btn-icon-right" aria-hidden="true">{rightIcon}</span>
      )}
    </motion.button>
  );
};

export default Button;
