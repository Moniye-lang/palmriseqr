import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  inverted?: boolean;
}

export default function PalmriseLogo({
  className = '',
  size = 'md',
  showSubtitle = true,
}: LogoProps) {
  const iconSizes = {
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const subSizes = {
    sm: 'text-[9px] tracking-[0.22em]',
    md: 'text-[10px] tracking-[0.26em]',
    lg: 'text-xs tracking-[0.3em]',
    xl: 'text-sm tracking-[0.35em]',
  };

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <div className={`relative ${iconSizes[size]} shrink-0 rounded-full overflow-hidden bg-[#faf8f0] border border-slate-200 shadow-sm flex items-center justify-center`}>
        <img
          src="/palmrise-logo.png"
          alt="Palmrise Interior Design Logo"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-black ${titleSizes[size]} text-slate-900 tracking-tight font-sans`}>
            PALM<span className="text-[#1D4ED8]">RISE</span>
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
        </div>
        {showSubtitle && (
          <span className={`font-bold uppercase ${subSizes[size]} text-[#1D4ED8] mt-1`}>
            Event Access System
          </span>
        )}
      </div>
    </div>
  );
}
