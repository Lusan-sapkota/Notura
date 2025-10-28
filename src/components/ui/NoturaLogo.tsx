interface NoturaLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function NoturaLogo({ size = 'md', className = '' }: NoturaLogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <svg 
      className={`${sizeClasses[size]} ${className}`}
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Simplified "N" for small sizes */}
      <path 
        d="M8 10 L8 22 L10 22 L10 14 L18 22 L20 22 L20 14 L22 22 L24 22 L24 10 L22 10 L22 18 L14 10 L12 10 L12 18 L10 10 L8 10 Z" 
        fill="currentColor"
      />
      
      {/* Single accent line */}
      <rect 
        x="11" 
        y="12" 
        width="6" 
        height="1" 
        rx="0.5" 
        fill="var(--color-accent, #00ADB5)" 
        opacity="0.6"
      />
    </svg>
  );
}