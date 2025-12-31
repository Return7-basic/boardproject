'use client';

export default function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`
        bg-slate-800/50 backdrop-blur-sm
        border border-slate-700/50
        rounded-xl
        ${hover ? 'hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

