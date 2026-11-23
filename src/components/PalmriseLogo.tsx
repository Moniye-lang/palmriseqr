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
  inverted = false,
}: LogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const subSizes = {
    sm: 'text-[9px] tracking-[0.25em]',
    md: 'text-[10px] tracking-[0.3em]',
    lg: 'text-xs tracking-[0.35em]',
    xl: 'text-sm tracking-[0.4em]',
  };

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Palmrise Stylized Emblem: Royal Blue & Crimson Red */}
      <div className={`relative ${iconSizes[size]} shrink-0 rounded-xl flex items-center justify-center bg-white shadow-sm border border-slate-200 overflow-hidden`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1.5"
        >
          {/* Blue Palm Fronds / Shield */}
          <path
            d="M24 4C14 4 6 12 6 22C6 32 15 39 24 44C33 39 42 32 42 22C42 12 34 4 24 4Z"
            fill="#1E40AF"
            fillOpacity="0.08"
          />
          {/* Palm Arch Left (Royal Blue) */}
          <path
            d="M24 38C24 28 17 21 11 20C17 23 21 28 22 35"
            stroke="#1D4ED8"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Palm Arch Right (Royal Blue) */}
          <path
            d="M24 38C24 28 31 21 37 20C31 23 27 28 26 35"
            stroke="#2563eb"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Palm Center Stem */}
          <path
            d="M24 40V12"
            stroke="#1E40AF"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Rising Sun / Horizon (Crimson Red) */}
          <circle cx="24" cy="14" r="5" fill="#DC2626" />
          {/* QR Scan Corner Marker (Red Accent) */}
          <path
            d="M17 10H14V13"
            stroke="#DC2626"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M31 10H34V13"
            stroke="#DC2626"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
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
            Event Management System
          </span>
        )}
      </div>
    </div>
  );
}
