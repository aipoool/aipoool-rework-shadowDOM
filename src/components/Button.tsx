import React, { forwardRef } from 'react';

interface ButtonProps {
  onClick: () => void;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ onClick }, ref) => {
  return (
    <button
      ref={ref}
      className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 shadow-lg transition-all duration-300 ease-in-out animate-pulse"
      onClick={onClick}
      style={{
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span className="sr-only">Open Extension</span>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-white">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    </button>
  );
});

Button.displayName = 'Button';

export default Button;