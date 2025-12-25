import React from 'react';

interface FynmanLogoProps {
  size?: number;
  className?: string;
}

const FynmanLogo: React.FC<FynmanLogoProps> = ({ size = 32, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Stylized F with orbital/wave curve */}
      <path
        d="M14 10h20M14 10v28M14 24h14"
        stroke="hsl(var(--primary))"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Orbital curve suggesting physics/atom */}
      <ellipse
        cx="30"
        cy="24"
        rx="8"
        ry="12"
        stroke="hsl(var(--primary))"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
        transform="rotate(30 30 24)"
      />
      {/* Small dot representing particle/electron */}
      <circle
        cx="36"
        cy="18"
        r="2"
        fill="hsl(var(--primary))"
      />
    </svg>
  );
};

export default FynmanLogo;
