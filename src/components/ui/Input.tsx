import React, { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  error?: boolean;
  helperText?: string;
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    variant = 'default', 
    size = 'md', 
    error = false,
    helperText,
    label,
    leftIcon,
    rightIcon,
    className = '', 
    ...props 
  }, ref) => {
    const baseClasses = 'w-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-color-accent focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClasses = {
      default: 'bg-bg-primary border border-color-text-muted/30 hover:border-color-text-muted/50',
      filled: 'bg-color-text-muted/10 border border-transparent hover:bg-color-text-muted/20',
      outlined: 'bg-transparent border-2 border-color-primary/30 hover:border-color-primary/50',
    };
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm rounded-md',
      md: 'px-4 py-2 text-body rounded-lg',
      lg: 'px-5 py-3 text-lg rounded-lg',
    };
    
    const errorClasses = error 
      ? 'border-red-500 focus:ring-red-500' 
      : '';
    
    const inputClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${errorClasses} ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} ${className}`;
    
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-color-text mb-2">
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="text-color-text-muted">
                {leftIcon}
              </div>
            </div>
          )}
          
          <input
            ref={ref}
            className={inputClasses}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <div className="text-color-text-muted">
                {rightIcon}
              </div>
            </div>
          )}
        </div>
        
        {helperText && (
          <p className={`mt-1 text-sm ${error ? 'text-red-500' : 'text-color-text-muted'}`}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Textarea component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'filled' | 'outlined';
  error?: boolean;
  helperText?: string;
  label?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    variant = 'default', 
    error = false,
    helperText,
    label,
    className = '', 
    ...props 
  }, ref) => {
    const baseClasses = 'w-full px-4 py-2 text-body rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-color-accent focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none';
    
    const variantClasses = {
      default: 'bg-bg-primary border border-color-text-muted/30 hover:border-color-text-muted/50',
      filled: 'bg-color-text-muted/10 border border-transparent hover:bg-color-text-muted/20',
      outlined: 'bg-transparent border-2 border-color-primary/30 hover:border-color-primary/50',
    };
    
    const errorClasses = error 
      ? 'border-red-500 focus:ring-red-500' 
      : '';
    
    const textareaClasses = `${baseClasses} ${variantClasses[variant]} ${errorClasses} ${className}`;
    
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-color-text mb-2">
            {label}
          </label>
        )}
        
        <textarea
          ref={ref}
          className={textareaClasses}
          {...props}
        />
        
        {helperText && (
          <p className={`mt-1 text-sm ${error ? 'text-red-500' : 'text-color-text-muted'}`}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';