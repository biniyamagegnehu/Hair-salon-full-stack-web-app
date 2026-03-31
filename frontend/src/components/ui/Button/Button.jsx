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
  const variantClasses = {
    primary: 'bg-primary-black text-white hover:bg-black/90',
    black: 'bg-primary-black text-white hover:bg-black/90',
    secondary: 'bg-secondary-brown text-white hover:bg-secondary-brown/90',
    gold: 'bg-accent-gold text-primary-black hover:bg-accent-gold/90',
    outline: 'border border-accent-gold text-accent-gold hover:bg-accent-gold hover:text-primary-black',
    text: 'text-secondary-brown hover:text-primary-black',
  };

  const sizeClasses = {
    sm: 'h-9 px-4 text-sm',
    md: 'h-11 px-5 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  const buttonClasses = [
    'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold/60',
    variantClasses[variant] || variantClasses.primary,
    sizeClasses[size] || sizeClasses.md,
    fullWidth ? 'w-full' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button 
      className={buttonClasses} 
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" role="status" aria-label="Loading"></span>
      )}
      
      {!isLoading && leftIcon && (
        <span aria-hidden="true">{leftIcon}</span>
      )}
      
      <span>{children}</span>
      
      {!isLoading && rightIcon && (
        <span aria-hidden="true">{rightIcon}</span>
      )}
    </button>
  );
};

export default Button;
