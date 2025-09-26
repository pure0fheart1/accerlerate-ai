import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "h-8 w-8" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="spark-gradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#4F46E5" />
        <stop offset="100%" stopColor="#22D3EE" />
      </linearGradient>
    </defs>
    {/* Left leg of 'A' */}
    <path
      d="M6 20L9.5 8H11L7.5 20H6Z"
      fill="url(#spark-gradient)"
    />
    {/* Right swoosh/arrow of 'A' */}
    <path
      d="M12.5 8C19 8 20 12 15 20H16.5C22 12 21 7 13.5 6L18 2L12.5 8Z"
      fill="url(#spark-gradient)"
    />
  </svg>
);
