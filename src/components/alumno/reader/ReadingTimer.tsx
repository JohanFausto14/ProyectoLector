'use client';

import React, { useEffect, useState } from 'react';

interface ReadingTimerProps {
  formattedTime: string;
  isRunning: boolean;
}

export default function ReadingTimer({ formattedTime, isRunning }: ReadingTimerProps) {
  // Sutil tick visual cada segundo cuando está corriendo
  const [tick, setTick] = useState(false);

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => setTick(t => !t), 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  return (
    <div
      className="flex items-center gap-1.5 sm:gap-2.5 px-2 py-0.5 sm:px-3.5 sm:py-1.5 rounded-full transition-all duration-500"
      style={{
        background: isRunning
          ? 'linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(212,175,55,0.06) 100%)'
          : 'rgba(161,136,127,0.08)',
        border: isRunning
          ? '1px solid rgba(212,175,55,0.35)'
          : '1px solid rgba(161,136,127,0.2)',
        backdropFilter: 'blur(8px)',
        boxShadow: isRunning
          ? '0 0 16px rgba(212,175,55,0.12), inset 0 1px 0 rgba(255,255,255,0.1)'
          : 'none',
      }}
      title="Tiempo de lectura activo"
    >
      {/* Ícono reloj */}
      <svg
        className="w-3.5 h-3.5 shrink-0 transition-all duration-700"
        style={{
          color: isRunning ? '#d4af37' : '#6b8cba',
          filter: isRunning ? 'drop-shadow(0 0 4px rgba(212,175,55,0.6))' : 'none',
          transform: isRunning
            ? `rotate(${tick ? '6deg' : '-6deg'})`
            : 'rotate(0deg)',
        }}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3.5 2" />
      </svg>

      {/* Tiempo */}
      <span
        className="font-mono text-xs sm:text-sm font-bold tabular-nums tracking-widest transition-all duration-500 select-none"
        style={{
          color: isRunning ? '#d4af37' : '#6b8cba',
          textShadow: isRunning ? '0 0 12px rgba(212,175,55,0.4)' : 'none',
          letterSpacing: '0.1em',
        }}
      >
        {formattedTime}
      </span>

      {/* Indicador EN VIVO */}
      <div className="flex items-center gap-1">
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-500"
          style={{
            background: isRunning ? '#d4af37' : '#c5b9ad',
            animation: isRunning ? 'pulse 1.5s ease-in-out infinite' : 'none',
            boxShadow: isRunning ? '0 0 6px rgba(212,175,55,0.8)' : 'none',
          }}
        />
      </div>
    </div>
  );
}
