import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}

const variants = {
  primary: 'bg-accent text-white hover:brightness-110 active:brightness-95',
  secondary: 'bg-accent-pale text-accent hover:bg-accent/20',
  ghost: 'bg-transparent text-fg-muted hover:bg-accent-pale',
  danger: 'bg-red text-white hover:brightness-110',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-[10px]',
  md: 'px-5 py-2.5 text-base rounded-[14px]',
  lg: 'px-6 py-3.5 text-lg rounded-[16px]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth, loading, children, className = '', disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        className={`
          font-heading font-bold transition-all duration-150
          ${variants[variant]}
          ${sizes[size]}
          ${fullWidth ? 'w-full' : ''}
          ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
        disabled={disabled || loading}
        {...(props as any)}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Cargando...
          </span>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
