// src/components/UI/LoadingSpinner.js
import React from 'react';

function LoadingSpinner({ size = 'default', text = '' }) {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div
        className={`${sizeClasses[size]} border-2 border-gray-200 border-t-primary-600 rounded-full animate-spin`}
      />
      {text && (
        <p className="text-sm text-gray-600">{text}</p>
      )}
    </div>
  );
}

export default LoadingSpinner;