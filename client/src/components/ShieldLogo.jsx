import React from 'react';

export default function ShieldLogo({ size = 60, className = "" }) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size * 0.8 }}>
      {/* Shield Background with Gradient */}
      <svg 
        width={size} 
        height={size * 0.8} 
        viewBox="0 0 120 96" 
        className="absolute inset-0"
      >
        <defs>
          <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e40af" />
            <stop offset="15%" stopColor="#3b82f6" />
            <stop offset="30%" stopColor="#8b5cf6" />
            <stop offset="45%" stopColor="#10b981" />
            <stop offset="60%" stopColor="#22c55e" />
            <stop offset="75%" stopColor="#f59e0b" />
            <stop offset="90%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
          <linearGradient id="lightningGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#fbbf24" />
            <stop offset="70%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Shield Shape */}
        <path 
          d="M18 84 A42 42 0 0 1 102 84 L102 54 A42 42 0 0 0 60 12 A42 42 0 0 0 18 54 Z" 
          fill="url(#shieldGradient)" 
          stroke="#0f172a" 
          strokeWidth="1.5"
          className="drop-shadow-2xl"
          filter="url(#glow)"
        />
        
        {/* Network Pattern Lines */}
        <g stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" fill="none">
          <line x1="30" y1="30" x2="50" y2="50" />
          <line x1="50" y1="50" x2="70" y2="30" />
          <line x1="30" y1="60" x2="50" y2="50" />
          <line x1="50" y1="50" x2="70" y2="60" />
          <line x1="40" y1="40" x2="60" y2="40" />
          <line x1="40" y1="60" x2="60" y2="60" />
        </g>
        
        {/* Network Nodes */}
        <g fill="rgba(255,255,255,0.8)">
          <circle cx="30" cy="30" r="1.5" />
          <circle cx="50" cy="50" r="2" />
          <circle cx="70" cy="30" r="1.5" />
          <circle cx="30" cy="60" r="1.5" />
          <circle cx="70" cy="60" r="1.5" />
          <circle cx="40" cy="40" r="1" />
          <circle cx="60" cy="40" r="1" />
          <circle cx="40" cy="60" r="1" />
          <circle cx="60" cy="60" r="1" />
        </g>
        
        {/* Lightning Bolt */}
        <path 
          d="M30 24 L54 42 L42 48 L66 72" 
          fill="none" 
          stroke="url(#lightningGradient)" 
          strokeWidth="4" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="drop-shadow-lg"
          filter="url(#glow)"
        />
        
        {/* ML Icon (Brain) */}
        <g transform="translate(24, 30)">
          <circle cx="10" cy="10" r="8" fill="none" stroke="white" strokeWidth="2" opacity="0.9"/>
          <text x="10" y="14" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" opacity="0.9">ML</text>
        </g>
        
        {/* IoT Icon (Snowflake/Asterisk) */}
        <g transform="translate(24, 60)">
          <circle cx="10" cy="10" r="8" fill="none" stroke="white" strokeWidth="2" opacity="0.9"/>
          <g fill="white" opacity="0.9">
            <path d="M10 6 L12 8 L10 10 L8 8 Z" />
            <path d="M14 10 L12 12 L10 10 L12 8 Z" />
            <path d="M10 14 L8 12 L10 10 L12 12 Z" />
            <path d="M6 10 L8 8 L10 10 L8 12 Z" />
          </g>
        </g>
        
        {/* Communication Icon (Satellite) */}
        <g transform="translate(78, 30)">
          <circle cx="10" cy="10" r="8" fill="none" stroke="white" strokeWidth="2" opacity="0.9"/>
          <g stroke="white" strokeWidth="1.5" fill="none" opacity="0.9">
            <circle cx="10" cy="10" r="3" />
            <path d="M6 10 L14 10 M10 6 L10 14" />
          </g>
        </g>
        
        {/* Web/Coding Icon */}
        <g transform="translate(78, 60)">
          <rect x="6" y="6" width="8" height="8" fill="none" stroke="white" strokeWidth="2" opacity="0.9"/>
          <text x="10" y="12" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold" opacity="0.9">&lt;/&gt;</text>
        </g>
      </svg>
    </div>
  );
}

export function ShieldLogoWithText({ size = 60, showText = true, className = "" }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <ShieldLogo size={size} />
      {showText && (
        <div className="flex flex-col">
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent drop-shadow-lg">
            SHIELD
          </span>
          <span className="text-sm text-slate-300 font-medium tracking-wide">
            INTELLIGENT MAINTENANCE. UNINTERRUPTED.
          </span>
        </div>
      )}
    </div>
  );
}
