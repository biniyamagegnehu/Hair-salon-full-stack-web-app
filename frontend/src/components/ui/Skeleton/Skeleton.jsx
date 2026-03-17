import React from 'react';
import './Skeleton.css';

/**
 * Skeleton Component
 * 
 * Variants: text, circle, rectangle
 * Features: cream shimmer animation, gold pulse option
 */
const Skeleton = ({ 
  variant = 'text', 
  width, 
  height, 
  className = '',
  animate = 'shimmer' // 'shimmer' or 'pulse'
}) => {
  const skeletonClasses = [
    'skeleton',
    `skeleton-${variant}`,
    `skeleton-animate-${animate}`,
    className
  ].filter(Boolean).join(' ');

  const style = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'text' ? '1em' : undefined)
  };

  return <div className={skeletonClasses} style={style} />;
};

export default Skeleton;
