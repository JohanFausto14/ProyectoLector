'use client';

import React, { useState, useEffect } from 'react';
import {
  ActiveTool,
  HighlightColor,
  HIGHLIGHT_SOLID,
} from '../../../hooks/useAnnotations';

interface AnnotationSidebarProps {
  activeTool: ActiveTool;
  onToggle:   (tool: ActiveTool) => void;
  forceMinimized?: boolean;
}

const COLORS: HighlightColor[] = ['amarillo', 'verde', 'rosa', 'azul'];

const COLOR_LABELS: Record<HighlightColor, string> = {
  amarillo: 'Amarillo',
  verde:    'Verde',
  rosa:     'Rosa',
  azul:     'Azul',
};

const COLOR_GRADIENTS: Record<HighlightColor, string> = {
  amarillo: 'radial-gradient(circle at 30% 30%, #fde68a, #f59e0b)',
  verde:    'radial-gradient(circle at 30% 30%, #86efac, #16a34a)',
  rosa:     'radial-gradient(circle at 30% 30%, #f9a8d4, #db2777)',
  azul:     'radial-gradient(circle at 30% 30%, #93c5fd, #2563eb)',
};

// ── Íconos ───────────────────────────────────────────────────────────────────

function IconHighlighter({ color, active }: { color: string; active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
      <path d="M9 3h6l3 7H6L9 3z"
        fill={active ? 'white' : color}
        stroke={active ? 'white' : color}
        strokeWidth="0.5"
        opacity={active ? 1 : 0.8}/>
      <path d="M6 10l3 7h6l3-7"
        fill={active ? 'rgba(255,255,255,0.35)' : `${color}44`}
        stroke={active ? 'white' : color}
        strokeWidth="0.5"/>
      <path d="M8 20h8" stroke={active ? 'white' : color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function IconPen({ active }: { active: boolean }) {
  const c = active ? '#fff' : '#1e3a6e';
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
      <path d="M12 20h9" stroke={c} strokeWidth="2" strokeLinecap="round"/>
      <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
        stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        fill={active ? 'rgba(255,255,255,0.15)' : 'transparent'}/>
    </svg>
  );
}

// ── Tooltip ───────────────────────────────────────────────────────────────────

interface TooltipProps { label: string; sublabel?: string; visible: boolean; }

function Tooltip({ label, sublabel, visible }: TooltipProps) {
  if (!visible) return null;
  return (
    <div
      className="absolute right-full mr-2.5 top-1/2 -translate-y-1/2 pointer-events-none hidden md:block"
      style={{ animation: 'fadeInLeft 0.14s ease both', zIndex: 300 }}
    >
      <div
        className="flex flex-col px-2.5 py-1.5 rounded-lg whitespace-nowrap bg-[#0a1628]/95 border border-[#c8d8f0]/20 shadow-lg"
      >
        <span className="text-[9px] font-black uppercase tracking-widest text-white/90">{label}</span>
        {sublabel && <span className="text-[7px] font-medium text-[#6b8cba] mt-0.5 tracking-wide">{sublabel}</span>}
      </div>
      <div
        className="absolute left-full top-1/2 -translate-y-1/2 -ml-px w-1.5 h-1.5 rotate-45 bg-[#0a1628]/95 border-r border-[#c8d8f0]/20 border-t border-[#c8d8f0]/20"
      />
    </div>
  );
}

type HoverId = 'minimize' | 'comentario' | 'clear' | HighlightColor | null;

export default function AnnotationSidebar({ activeTool, onToggle, forceMinimized = false }: AnnotationSidebarProps) {
  const [minimizedState, setMinimizedState] = useState(false);
  const [hovered,   setHovered]   = useState<HoverId>(null);

  const minimized = forceMinimized || minimizedState;

  // Botón compacto para expandir
  if (minimized) {
    return (
      <button
        onClick={() => setMinimizedState(false)}
        title="Abrir herramientas de anotación"
        className={`fixed z-[120] left-1/2 -translate-x-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-white border border-[#c8d8f0]/80 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-300 md:bottom-auto md:left-auto md:translate-x-0 md:right-6 md:top-1/2 md:-translate-y-1/2 ${
          forceMinimized ? 'bottom-20' : 'bottom-6'
        }`}
      >
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-[#0a1628] to-[#1e3a6e] shadow-sm">
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
        </div>
      </button>
    );
  }

  return (
    <div
      className="fixed z-[120] bg-white/95 backdrop-blur-md border border-[#c8d8f0]/80 shadow-[0_8px_30px_rgb(0,0,0,0.08)] items-center transition-all duration-300
                 md:fixed md:right-6 md:top-1/2 md:-translate-y-1/2 md:bottom-auto md:left-auto md:translate-x-0 md:flex md:flex-col md:gap-2.5 md:p-2 md:rounded-full
                 fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-row gap-1 sm:gap-2 py-2 px-2.5 sm:px-4 rounded-full w-auto max-w-[95vw] justify-center md:w-auto md:max-w-none md:justify-start"
    >
      {/* Marcatextos de color */}
      {COLORS.map(color => {
        const isActive = activeTool === color;
        const solid    = HIGHLIGHT_SOLID[color];
        return (
          <div key={color} className="relative flex justify-center">
            <Tooltip
              label={`Resaltar en ${COLOR_LABELS[color]}`}
              sublabel="Selecciona texto para marcar"
              visible={hovered === color}
            />
            <button
              onClick={() => onToggle(color)}
              onMouseEnter={() => setHovered(color as HighlightColor)}
              onMouseLeave={() => setHovered(null)}
              className="relative flex items-center justify-center rounded-full transition-all duration-150"
              style={{
                width:         '36px',
                height:        '36px',
                background:    isActive ? `${solid}12` : 'transparent',
                outline:       isActive ? `1.5px solid ${solid}40` : '1.5px solid transparent',
                outlineOffset: '2px',
                transform:     isActive ? 'scale(1.06)' : 'scale(1)',
              }}
            >
              <div
                className="flex items-center justify-center rounded-full transition-all duration-150"
                style={{
                  width:      isActive ? '26px' : '22px',
                  height:     isActive ? '26px' : '22px',
                  background: isActive ? COLOR_GRADIENTS[color] : `${solid}26`,
                  boxShadow:  isActive ? `0 2px 8px ${solid}50` : 'none',
                }}
              >
                <IconHighlighter color={solid} active={isActive} />
              </div>
              {isActive && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full"
                  style={{ background: solid, boxShadow: `0 0 4px ${solid}`, animation: 'pulse 1.5s ease-in-out infinite' }}
                />
              )}
            </button>
          </div>
        );
      })}

      {/* Divisor */}
      <div className="w-[1px] h-6 bg-[#c8d8f0]/80 mx-1 md:w-7 md:h-[1px] md:my-1 md:mx-0" />

      {/* Nota / comentario */}
      <div className="relative flex justify-center">
        <Tooltip
          label="Añadir nota"
          sublabel="Selecciona texto y escribe"
          visible={hovered === 'comentario'}
        />
        <button
          onClick={() => onToggle('comentario')}
          onMouseEnter={() => setHovered('comentario')}
          onMouseLeave={() => setHovered(null)}
          className="relative flex items-center justify-center rounded-full transition-all duration-150"
          style={{
            width:         '36px',
            height:        '36px',
            background:    activeTool === 'comentario' ? 'rgba(212,175,55,0.12)' : 'transparent',
            outline:       activeTool === 'comentario' ? '1.5px solid rgba(212,175,55,0.40)' : '1.5px solid transparent',
            outlineOffset: '2px',
            transform:     activeTool === 'comentario' ? 'scale(1.06)' : 'scale(1)',
          }}
        >
          <div
            className="flex items-center justify-center rounded-full transition-all duration-150"
            style={{
              width:      activeTool === 'comentario' ? '26px' : '22px',
              height:     activeTool === 'comentario' ? '26px' : '22px',
              background: activeTool === 'comentario' ? 'linear-gradient(135deg,#f59e0b,#d4af37)' : 'rgba(30,58,110,0.1)',
              boxShadow:  activeTool === 'comentario' ? '0 2px 8px rgba(212,175,55,0.45)' : 'none',
            }}
          >
            <IconPen active={activeTool === 'comentario'} />
          </div>
          {activeTool === 'comentario' && (
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#d4af37]"
              style={{ boxShadow: '0 0 4px rgba(212,175,55,0.8)', animation: 'pulse 1.5s ease-in-out infinite' }}/>
          )}
        </button>
      </div>

      {/* Desactivar herramienta activa */}
      {activeTool !== null && (
        <div className="relative flex justify-center">
          <Tooltip label="Desactivar" sublabel="Volver a modo lectura" visible={hovered === 'clear'} />
          <button
            onClick={() => onToggle(null)}
            onMouseEnter={() => setHovered('clear')}
            onMouseLeave={() => setHovered(null)}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-red-50 hover:text-red-500 text-red-400"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      )}

      {/* Botón Minimizar */}
      <div className="relative flex justify-center">
        <Tooltip label="Minimizar panel" sublabel="Reducir a un botón flotante" visible={hovered === 'minimize'} />
        <button
          onClick={() => setMinimizedState(true)}
          onMouseEnter={() => setHovered('minimize')}
          onMouseLeave={() => setHovered(null)}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-gray-100 text-[#6b8cba] hover:text-[#0a1628]"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 12H6"/>
          </svg>
        </button>
      </div>
    </div>
  );
}