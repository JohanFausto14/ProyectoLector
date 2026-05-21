'use client';

import React, { useEffect, useState } from 'react';
import { toast as sonnerToast } from 'sonner';

// ─── Types ──────────────────────────────────────────────────────────────────

export type ToastVariant = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface CustomToastProps {
  id: string | number;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration?: number;
  action?: { label: string; onClick: () => void };
}

// ─── Icon SVGs ───────────────────────────────────────────────────────────────

const icons: Record<ToastVariant, React.ReactNode> = {
  success: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill="rgba(255,255,255,0.15)" />
      <path d="M5.5 10.5L8.5 13.5L14.5 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  error: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill="rgba(255,255,255,0.15)" />
      <path d="M6.5 6.5L13.5 13.5M13.5 6.5L6.5 13.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill="rgba(255,255,255,0.15)" />
      <path d="M10 6V11" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <circle cx="10" cy="13.5" r="1" fill="white" />
    </svg>
  ),
  info: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill="rgba(255,255,255,0.15)" />
      <path d="M10 9V14" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <circle cx="10" cy="6.5" r="1" fill="white" />
    </svg>
  ),
  loading: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="toast-spin">
      <circle cx="10" cy="10" r="8" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
      <path d="M10 2a8 8 0 018 8" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

// ─── Accent colors ─────────────────────────────────────────────────────────────

const accentColors: Record<ToastVariant, string> = {
  success: '#34d399',
  error:   '#f87171',
  warning: '#fbbf24',
  info:    '#60a5fa',
  loading: '#a78bfa',
};

// ─── Component ───────────────────────────────────────────────────────────────

export function CustomToast({
  id,
  variant,
  title,
  description,
  duration = 4000,
  action,
}: CustomToastProps) {
  const [progress, setProgress] = useState(100);
  const [mounted, setMounted] = useState(false);
  const isLoading = variant === 'loading';
  const accent = accentColors[variant];

  // Mount animation
  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  // Progress bar
  useEffect(() => {
    if (isLoading) return;
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining === 0) clearInterval(interval);
    }, 16);
    return () => clearInterval(interval);
  }, [duration, isLoading]);

  return (
    <div
      onClick={(e) => { 
        if (!isLoading) {
          e.preventDefault();
          sonnerToast.dismiss(id); 
        }
      }}
      style={{
        background: 'rgba(18, 18, 20, 0.95)',
        border: `1px solid rgba(255,255,255,0.08)`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3), 0 0 20px ${accent}15`,
        borderRadius: '14px',
        padding: '14px 16px',
        minWidth: '320px',
        maxWidth: '400px',
        cursor: isLoading ? 'default' : 'pointer',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'var(--font-lora), serif',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.97)',
        transition: 'opacity 0.25s ease, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      {/* Shimmer line at top */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '1px',
        background: `linear-gradient(90deg, transparent, ${accent}80, transparent)`,
      }} />

      {/* Content */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        {/* Icon */}
        <div style={{
          flexShrink: 0,
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: `${accent}20`,
          border: `1px solid ${accent}40`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '1px',
        }}>
          {icons[variant]}
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            margin: 0,
            color: '#f5f8ff',
            fontWeight: 600,
            fontSize: '14px',
            lineHeight: '1.4',
            letterSpacing: '0.01em',
          }}>
            {title}
          </p>
          {description && (
            <p style={{
              margin: '3px 0 0',
              color: 'rgba(240,230,210,0.65)',
              fontSize: '12.5px',
              lineHeight: '1.5',
              fontWeight: 400,
            }}>
              {description}
            </p>
          )}
          {action && (
            <button
              onClick={(e) => { e.stopPropagation(); action.onClick(); }}
              style={{
                marginTop: '8px',
                padding: '4px 12px',
                background: `${accent}20`,
                border: `1px solid ${accent}50`,
                borderRadius: '6px',
                color: accent,
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = `${accent}35`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = `${accent}20`;
              }}
            >
              {action.label}
            </button>
          )}
        </div>

        {/* Dismiss X (only non-loading) */}
        {!isLoading && (
          <button
            onClick={(e) => { 
              e.preventDefault(); 
              e.stopPropagation(); 
              sonnerToast.dismiss(id); 
            }}
            style={{
              flexShrink: 0,
              width: '28px',
              height: '28px',
              background: 'transparent',
              border: 'none',
              borderRadius: '6px',
              color: 'rgba(255,255,255,0.4)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              padding: 0,
              margin: '-4px -4px 0 0',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)';
              (e.currentTarget as HTMLButtonElement).style.color = '#fff';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)';
            }}
            aria-label="Cerrar notificación"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Progress bar */}
      {!isLoading && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '0 0 14px 14px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${accent}80, ${accent})`,
            borderRadius: '0 0 14px 14px',
            transition: 'width 0.1s linear',
            boxShadow: `0 0 8px ${accent}60`,
          }} />
        </div>
      )}
    </div>
  );
}
