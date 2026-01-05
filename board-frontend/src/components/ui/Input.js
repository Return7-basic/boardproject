'use client';

import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  {
    label,
    error,
    type = 'text',
    className = '',
    ...props
  },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        className={`
          w-full px-4 py-3
          bg-slate-800/50 border border-slate-700
          rounded-lg text-white placeholder-slate-500
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
          transition-all duration-200
          ${error ? 'border-rose-500 focus:ring-rose-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-rose-400">{error}</p>
      )}
    </div>
  );
});

export default Input;

