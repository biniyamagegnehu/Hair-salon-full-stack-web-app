import React from 'react';
import './Badge.css';

/**
 * Badge Component
 * 
 * Variants: gold, brown, black, cream, success, error
 * Sizes: sm, md, lg
 */
const Badge = ({ 
  children, 
  variant = 'gold', 
  size = 'md', 
  className = '',
  pill = false,
  ...props 
}) => {
  const badgeClasses = [
    'badge',
    `badge-${variant}`,
    `badge-${size}`,
    pill ? 'badge-pill' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={badgeClasses} {...props}>
      {children}
    </span>
  );
};

export default Badge;
