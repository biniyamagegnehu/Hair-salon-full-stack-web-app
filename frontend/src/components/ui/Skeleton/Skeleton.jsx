import React from 'react';
const Skeleton = ({ 
  variant = 'text', 
  width,
  height,
  className = '',
  animate = 'shimmer' // 'shimmer' or 'pulse'
}) => {
  const variantClasses = {
    text: 'rounded-md',
    circle: 'rounded-full',
    rectangle: 'rounded-xl',
  };

  const skeletonClasses = [
    'bg-background-cream',
    variantClasses[variant] || variantClasses.text,
    animate === 'pulse' ? 'animate-pulse' : 'animate-pulse',
    className,
  ].filter(Boolean).join(' ');

  const widthClass = width ? '' : 'w-full';
  const heightClass = height ? '' : variant === 'text' ? 'h-4' : variant === 'circle' ? 'h-10 w-10' : 'h-24';

  return <div className={`${skeletonClasses} ${widthClass} ${heightClass}`} aria-hidden="true" />;
};

export default Skeleton;
