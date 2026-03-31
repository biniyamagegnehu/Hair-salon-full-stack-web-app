import React from 'react';
const Badge = ({ 
  children, 
  variant = 'gold', 
  size = 'md', 
  className = '',
  pill = false,
  ...props 
}) => {
  const variantClasses = {
    gold: 'bg-accent-gold/20 text-primary-black',
    brown: 'bg-secondary-brown/15 text-secondary-brown',
    black: 'bg-primary-black text-white',
    cream: 'bg-background-cream text-secondary-brown',
    success: 'bg-emerald-100 text-emerald-700',
    error: 'bg-red-100 text-red-700',
    dark: 'bg-zinc-900 text-white',
  };

  const sizeClasses = {
    xs: 'px-2 py-1 text-[10px]',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-xs',
    lg: 'px-4 py-2 text-sm',
  };

  const badgeClasses = [
    'inline-flex items-center justify-center font-semibold uppercase tracking-wide',
    pill ? 'rounded-full' : 'rounded-lg',
    variantClasses[variant] || variantClasses.gold,
    sizeClasses[size] || sizeClasses.md,
    className,
  ].filter(Boolean).join(' ');

  return (
    <span className={badgeClasses} {...props}>
      {children}
    </span>
  );
};

export default Badge;
