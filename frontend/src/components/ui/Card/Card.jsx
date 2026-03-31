const Card = ({ 
  children, 
  variant = 'default', 
  className = '', 
  padding = true,
  fullHeight = true,
  onClick,
  ...props 
}) => {
  const variantClasses = {
    default: 'border border-black/8 bg-white',
    black: 'border border-black bg-primary-black text-white',
    brown: 'border border-secondary-brown/30 bg-secondary-brown text-white',
    'gold-border': 'border border-accent-gold/40 bg-white',
    interactive: 'border border-black/8 bg-white',
  };

  const cardClasses = [
    'rounded-3xl shadow-sm transition-all duration-200',
    variantClasses[variant] || variantClasses.default,
    padding ? 'p-6' : '',
    fullHeight ? 'h-full' : '',
    onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={cardClasses} 
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`border-b border-black/8 p-6 ${className}`}>
    {children}
  </div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={className}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`border-t border-black/8 p-6 ${className}`}>
    {children}
  </div>
);

export const CardImage = ({ src, alt, className = '' }) => (
  <div className={`overflow-hidden rounded-2xl ${className}`}>
    <img src={src} alt={alt} className="h-full w-full object-cover" />
  </div>
);

export default Card;
