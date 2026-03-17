import { motion } from 'framer-motion';
import './Card.css';

/**
 * Card Component
 * 
 * Variants: default, gold-border, brown, interactive
 */
const Card = ({ 
  children, 
  variant = 'default', 
  className = '', 
  padding = true,
  onClick,
  ...props 
}) => {
  const cardClasses = [
    'card',
    `card-${variant}`,
    padding ? 'card-padding' : '',
    onClick ? 'card-clickable' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <motion.div 
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
      whileHover={onClick || variant === 'interactive' ? { 
        y: -5, 
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        borderColor: "var(--accent-gold)"
      } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`card-header ${className}`}>
    {children}
  </div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`card-body ${className}`}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`card-footer ${className}`}>
    {children}
  </div>
);

export const CardImage = ({ src, alt, className = '' }) => (
  <div className={`card-image ${className}`}>
    <img src={src} alt={alt} />
  </div>
);

export default Card;
