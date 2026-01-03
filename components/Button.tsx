'use client';

import React from 'react';
import { IconType } from 'react-icons';
import { ImSpinner2 } from 'react-icons/im';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: IconType;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled,
  className = '',
  children,
  type = 'button',
  ...props
}) => {
  // Base styles
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  // Variant styles
  const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
  };

  // Size styles
  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  // Icon size based on button size
  const iconSizeClass: Record<ButtonSize, string> = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  // Width styles
  const widthStyles = fullWidth ? 'w-full' : '';

  // Combine all styles
  const combinedStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`;

  return (
    <button
      type={type}
      className={combinedStyles}
      disabled={disabled || loading}
      {...props}
    >
      {/* Loading spinner or left icon */}
      {loading ? (
        <ImSpinner2 className={`${iconSizeClass[size]} animate-spin`} />
      ) : (
        Icon && iconPosition === 'left' && <Icon className={iconSizeClass[size]} />
      )}

      {/* Button text */}
      {children}

      {/* Right icon (only if not loading) */}
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className={iconSizeClass[size]} />
      )}
    </button>
  );
};

export default Button;
