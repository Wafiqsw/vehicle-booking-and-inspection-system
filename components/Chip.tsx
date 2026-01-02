import React from 'react';

interface ChipProps {
  variant: 'success' | 'warning' | 'pending' | 'info' | 'error' | 'default';
  children: React.ReactNode;
  className?: string;
}

const Chip = ({ variant, children, className = '' }: ChipProps) => {
  const variantStyles = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    pending: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800',
    error: 'bg-red-100 text-red-800',
    default: 'bg-gray-100 text-gray-600',
  };

  return (
    <span
      className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export { Chip };
