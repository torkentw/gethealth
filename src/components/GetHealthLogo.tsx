import React from 'react';
import logoUrl from '../assets/logo.png';

interface LogoProps {
  className?: string; // Classes for the image container
  iconOnly?: boolean; // Whether to hide text
  variant?: 'light' | 'dark' | 'theme'; // Color variant
}

export const GetHealthLogo: React.FC<LogoProps> = ({
  className = "w-10 h-10",
  iconOnly = false,
  variant = 'theme'
}) => {
  // Determine text color based on variant
  let textColor = "text-white animate-pulse";

  if (variant === 'light') {
    textColor = "text-[#243565]";
  } else if (variant === 'dark') {
    textColor = "text-white";
  } else {
    // theme adaptive (white text)
    textColor = "text-white";
  }

  return (
    <div className="flex items-center gap-3 select-none">
      {/* High-fidelity Logo Image from logo.png */}
      <img
        src={logoUrl}
        alt="GET HEALTH"
        className={`${className} shrink-0 rounded-full object-contain bg-white border border-slate-200 shadow-sm transition-all duration-300 group-hover:scale-105`}
        referrerPolicy="no-referrer"
      />

      {!iconOnly && (
        <span className={`text-lg sm:text-xl font-black tracking-wider sm:tracking-widest font-serif ${textColor} flex items-center gap-2 flex-nowrap whitespace-nowrap`}>
          <span className="shrink-0">GET <span className={variant === 'light' ? "text-[#243565]" : "text-teal-400 group-hover:text-emerald-300 transition-colors"}>HEALTH</span></span>
          <span className="text-lg sm:text-xl font-black font-sans tracking-normal select-none bg-gradient-to-r from-orange-400 via-amber-400 to-teal-400 bg-clip-text text-transparent transition-all duration-300 shrink-0">美麗大地</span>
        </span>
      )}
    </div>
  );
};
