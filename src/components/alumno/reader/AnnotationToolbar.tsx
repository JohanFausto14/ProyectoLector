'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  SelectionState,
  AnnotationType,
  HighlightColor,
  HIGHLIGHT_COLORS,
  HIGHLIGHT_BORDER,
  HIGHLIGHT_SOLID,
} from '../../../hooks/useAnnotations';
import { AlumnoLibrosService } from '../../../service/alumno/libros.service';

interface AnnotationToolbarProps {
  selection:      SelectionState | null;
  pendingType:    AnnotationType | null;
  setPendingType: (t: AnnotationType | null) => void;
  commentDraft:   string;
  setCommentDraft:(v: string) => void;
  onHighlight:    (color: HighlightColor) => void;
  onComentario:   (texto: string) => void;
  onClear:        () => void;
}

const COLORS: HighlightColor[] = ['amarillo', 'verde', 'rosa', 'azul'];

// Gradientes suaves para los swatches
const SWATCH_GRADIENTS: Record<HighlightColor, string> = {
  amarillo: 'radial-gradient(circle at 30% 30%, #fde68a, #f59e0b)',
  verde:    'radial-gradient(circle at 30% 30%, #86efac, #16a34a)',
  rosa:     'radial-gradient(circle at 30% 30%, #f9a8d4, #db2777)',
  azul:     'radial-gradient(circle at 30% 30%, #93c5fd, #2563eb)',
};

const COLOR_LABELS: Record<HighlightColor, string> = {
  amarillo: 'Amarillo',
  verde:    'Verde',
  rosa:     'Rosa',
  azul:     'Azul',
};

export default function AnnotationToolbar({
  selection,
  pendingType,
  setPendingType,
  commentDraft,
  setCommentDraft,
  onHighlight,
  onComentario,
  onClear,
}: AnnotationToolbarProps) {
  const toolbarRef  = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [pos, setPos]       = useState({ top: 0, left: 0 });
  const [visible, setVisible] = useState(false);
  const [hoveredColor, setHoveredColor] = useState<HighlightColor | null>(null);
  const [showBelow, setShowBelow] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [showGlosario, setShowGlosario] = useState(false);
  const [isLoadingGlosario, setIsLoadingGlosario] = useState(false);
  const [remoteDefinicion, setRemoteDefinicion] = useState<{ palabra: string, definicion: string | null } | null>(null);
  const [glosarioError, setGlosarioError] = useState<string | null>(null);

  // Detectar vista móvil de forma responsiva
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calcular posición sobre la selección (position:fixed)
  useEffect(() => {
    if (!selection) { setVisible(false); return; }
    const { rect } = selection;
    const toolbarW = 280;
    const gap = 10;

    let left = rect.left + rect.width / 2 - toolbarW / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - toolbarW - 8));

    const shouldBelow = rect.top < 150;
    setShowBelow(shouldBelow);

    if (shouldBelow) {
      setPos({ top: rect.bottom + gap, left });
    } else {
      setPos({ top: rect.top - gap, left });
    }

    // Pequeño delay para permitir la animación de entrada
    const timer = setTimeout(() => setVisible(true), 10);
    
    setShowGlosario(false);
    setRemoteDefinicion(null);
    setGlosarioError(null);

    return () => clearTimeout(timer);
  }, [selection]);

  // Focus en textarea al abrir comentario
  useEffect(() => {
    if (pendingType === 'comentario') {
      const timer = setTimeout(() => textareaRef.current?.focus(), 80);
      return () => clearTimeout(timer);
    }
  }, [pendingType]);

  if (!selection) return null;

  const showColorPicker = pendingType === 'highlight';
  const showCommentModal = pendingType === 'comentario';

  return (
    <>
      {/* ── Toolbar flotante ────────────────────────────────────── */}
      <div
        ref={toolbarRef}
        style={isMobile ? {
          bottom: '84px',
          left: '50%',
          transform: visible ? 'translateX(-50%) scale(1)' : 'translateX(-50%) scale(0.92)',
          width: 'calc(100% - 24px)',
          maxWidth: '340px',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.18s ease, transform 0.22s cubic-bezier(0.34,1.56,0.64,1)',
        } : {
          top: pos.top,
          left: pos.left,
          width: '280px',
          opacity: visible ? 1 : 0,
          transform: visible
            ? (showBelow ? 'translateY(0) scale(1)' : 'translateY(-100%) scale(1)')
            : (showBelow ? 'translateY(10%) scale(0.92)' : 'translateY(-90%) scale(0.92)'),
          transition: 'opacity 0.18s ease, transform 0.22s cubic-bezier(0.34,1.56,0.64,1)',
        }}
        className="fixed z-[500]"
      >
        {/* Flecha apuntando hacia arriba (cuando el toolbar está abajo de la selección) */}
        {showBelow && !isMobile && (
          <div className="flex justify-center mb-[-1px]">
            <div
              className="w-3 h-3 rotate-45 rounded-sm"
              style={{
                background: 'rgba(10, 22, 40, 0.95)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderBottom: 'none',
                borderRight: 'none',
              }}
            />
          </div>
        )}

        {/* Contenedor principal */}
        <div
          className="rounded-2xl shadow-2xl"
          style={{
            background: 'rgba(10, 22, 40, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
        >
          {/* Sub-panel: Glosario / Definición */}
          {showGlosario && (
            <div
              className="px-3 py-3 flex flex-col gap-2"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
            >
              {isLoadingGlosario ? (
                <div className="flex flex-col items-center justify-center py-4 gap-2">
                  <div className="w-4 h-4 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] text-[#d4af37]/60 uppercase tracking-widest font-black">Buscando...</span>
                </div>
              ) : glosarioError ? (
                <div className="py-2 text-center">
                  <p className="text-xs text-red-400 font-medium">{glosarioError}</p>
                </div>
              ) : remoteDefinicion ? (
                <div className="flex flex-col gap-1.5">
                  <h4 className="text-base font-bold text-[#d4af37] capitalize tracking-wide border-b border-white/10 pb-1">
                    {remoteDefinicion.palabra}
                  </h4>
                  <p className="text-sm text-white/85 leading-relaxed font-lora">
                    {remoteDefinicion.definicion || 'No se encontró una definición exacta para esta palabra.'}
                  </p>
                </div>
              ) : null}
            </div>
          )}

          {/* Barra de acciones */}
          <div className="flex items-center gap-1 px-2 py-2">

            {/* Botón Marcatextos */}
            <button
              onMouseDown={e => { e.preventDefault(); setPendingType('highlight'); setShowGlosario(false); }}
              onTouchStart={e => { e.preventDefault(); setPendingType('highlight'); setShowGlosario(false); }}
              title="Marcar texto"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                pendingType === 'highlight'
                  ? 'bg-[#d4af37]/25 text-[#f5d060] outline outline-1 outline-[#d4af37]/40'
                  : 'bg-transparent text-[#d4af37]/70 hover:bg-white/10 hover:text-[#f5d060]'
              }`}
            >
              {/* Ícono marcatextos */}
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                <path d="M9 3h6l3 7H6L9 3z" fill="currentColor" opacity="0.5"/>
                <path d="M6 10l3 7h6l3-7" fill="currentColor" opacity="0.25"/>
                <path d="M8 20h8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
              <span className="uppercase tracking-wider text-[10px]">Marcar</span>
            </button>

            {/* Botón Nota */}
            <button
              onMouseDown={e => { e.preventDefault(); setPendingType('comentario'); setShowGlosario(false); }}
              onTouchStart={e => { e.preventDefault(); setPendingType('comentario'); setShowGlosario(false); }}
              title="Agregar nota"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                pendingType === 'comentario'
                  ? 'bg-[#d4af37]/25 text-[#f5d060] outline outline-1 outline-[#d4af37]/40'
                  : 'bg-transparent text-[#d4af37]/70 hover:bg-white/10 hover:text-[#f5d060]'
              }`}
            >
              {/* Ícono nota */}
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" fill="currentColor" opacity="0.2"/>
              </svg>
              <span className="uppercase tracking-wider text-[10px]">Nota</span>
            </button>

            {/* Botón Lupa (glosario) */}
            <button
              onMouseDown={async e => {
                e.preventDefault();
                const nextShow = !showGlosario;
                setShowGlosario(nextShow);
                setPendingType(null);

                if (nextShow && selection?.text && !remoteDefinicion && !isLoadingGlosario) {
                  try {
                    setIsLoadingGlosario(true);
                    setGlosarioError(null);
                    
                    const selWord = selection.text.trim();
                    if (selWord.length < 2 || selWord.length > 80) {
                        setGlosarioError('Selección inválida para glosario.');
                        setIsLoadingGlosario(false);
                        return;
                    }

                    const data = await AlumnoLibrosService.registrarGlosario(selWord);
                    setRemoteDefinicion({ palabra: data.palabra, definicion: data.definicion });
                  } catch (err: any) {
                    setGlosarioError('Palabra no encontrada o no válida.');
                  } finally {
                    setIsLoadingGlosario(false);
                  }
                }
              }}
              onTouchStart={async e => {
                e.preventDefault();
                const nextShow = !showGlosario;
                setShowGlosario(nextShow);
                setPendingType(null);

                if (nextShow && selection?.text && !remoteDefinicion && !isLoadingGlosario) {
                  try {
                    setIsLoadingGlosario(true);
                    setGlosarioError(null);
                    
                    const selWord = selection.text.trim();
                    if (selWord.length < 2 || selWord.length > 80) {
                        setGlosarioError('Selección inválida para glosario.');
                        setIsLoadingGlosario(false);
                        return;
                    }

                    const data = await AlumnoLibrosService.registrarGlosario(selWord);
                    setRemoteDefinicion({ palabra: data.palabra, definicion: data.definicion });
                  } catch (err: any) {
                    setGlosarioError('Palabra no encontrada o no válida.');
                  } finally {
                    setIsLoadingGlosario(false);
                  }
                }
              }}
              title="Ver definición"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                showGlosario
                  ? 'bg-[#d4af37]/25 text-[#f5d060] outline outline-1 outline-[#d4af37]/40'
                  : 'bg-transparent text-[#d4af37]/70 hover:bg-white/10 hover:text-[#f5d060]'
              }`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
              <span className="uppercase tracking-wider text-[10px]">Definir</span>
            </button>

            {/* Separador */}
            <div className="w-px h-5 mx-1" style={{ background: 'rgba(255,255,255,0.1)' }} />

            {/* Cerrar */}
            <button
              onMouseDown={e => { e.preventDefault(); onClear(); }}
              onTouchStart={e => { e.preventDefault(); onClear(); }}
              title="Cancelar"
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 text-white/30 hover:text-white/80 hover:bg-white/10"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Sub-barra: selector de colores */}
          {showColorPicker && (
            <div
              className="flex items-center justify-center gap-3 px-4 py-2.5"
              style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
            >
              {COLORS.map(color => {
                const isHovered = hoveredColor === color;
                return (
                  <button
                    key={color}
                    onMouseDown={e => { e.preventDefault(); onHighlight(color); }}
                    onTouchStart={e => { e.preventDefault(); onHighlight(color); }}
                    onMouseEnter={() => setHoveredColor(color)}
                    onMouseLeave={() => setHoveredColor(null)}
                    title={COLOR_LABELS[color]}
                    className="relative flex flex-col items-center gap-1 transition-all duration-150"
                    style={{ transform: isHovered ? 'scale(1.2) translateY(-2px)' : 'scale(1)' }}
                  >
                    {/* Swatch circular */}
                    <div
                      className="w-7 h-7 rounded-full transition-all duration-150"
                      style={{
                        background: SWATCH_GRADIENTS[color],
                        boxShadow: isHovered
                          ? `0 4px 16px ${HIGHLIGHT_SOLID[color]}80, 0 0 0 2px ${HIGHLIGHT_SOLID[color]}60`
                          : `0 2px 8px ${HIGHLIGHT_SOLID[color]}40`,
                        border: `2px solid ${HIGHLIGHT_BORDER[color]}`,
                      }}
                    />
                    {/* Label */}
                    <span
                      className="text-[7px] font-black uppercase tracking-widest transition-all"
                      style={{
                        color: isHovered ? '#fff' : 'rgba(255,255,255,0.35)',
                        opacity: isHovered ? 1 : 0.7,
                      }}
                    >
                      {COLOR_LABELS[color].slice(0, 3)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Flecha apuntando hacia abajo (cuando el toolbar está arriba de la selección) */}
        {!showBelow && !isMobile && (
          <div className="flex justify-center mt-[-1px]">
            <div
              className="w-3 h-3 rotate-45 rounded-sm"
              style={{
                background: 'rgba(10, 22, 40, 0.95)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderTop: 'none',
                borderLeft: 'none',
              }}
            />
          </div>
        )}
      </div>

      {/* ── Modal de comentario ─────────────────────────────────── */}
      {showCommentModal && (
        <div
          className="fixed inset-0 z-[600] flex items-center justify-center p-4"
          style={{
            background: 'rgba(10, 22, 40, 0.4)',
            backdropFilter: 'blur(12px)',
            animation: 'fadeInBackdrop 0.2s ease both',
          }}
        >
          <div
            className="w-full max-w-sm rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.90)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1), 0 0 0 1px rgba(226, 232, 240, 0.5)',
              animation: 'scaleInModal 0.25s cubic-bezier(0.34,1.56,0.64,1) both',
            }}
          >
            {/* Header del modal */}
            <div
              className="px-6 pt-6 pb-4"
              style={{ borderBottom: '1px solid rgba(226, 232, 240, 0.8)' }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  {/* Ícono + Título */}
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'linear-gradient(135deg, #0a1628, #1e3a8a)' }}
                    >
                      <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M12 20h9"/>
                        <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                      </svg>
                    </div>
                    <h3 className="font-playfair font-bold text-[#0a1628] text-base">
                      Nueva nota
                    </h3>
                  </div>
                  {/* Texto seleccionado */}
                  <p className="text-[10px] text-[#6b8cba] italic line-clamp-2 pl-9">
                    &ldquo;{selection.text.slice(0, 80)}{selection.text.length > 80 ? '…' : ''}&rdquo;
                  </p>
                </div>
                <button
                  onClick={() => setPendingType(null)}
                  className="p-1.5 rounded-full hover:bg-slate-100 transition-colors shrink-0 mt-0.5"
                >
                  <svg className="w-3.5 h-3.5 text-[#94a3b8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Cuerpo */}
            <div className="px-6 py-4">
              <textarea
                ref={textareaRef}
                value={commentDraft}
                onChange={e => setCommentDraft(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) onComentario(commentDraft);
                  if (e.key === 'Escape') setPendingType(null);
                }}
                placeholder="Escribe tu nota aquí..."
                rows={4}
                className="w-full resize-none rounded-xl p-3.5 text-sm font-lora text-[#0a1628] placeholder-[#94a3b8] transition-all"
                style={{
                  background: '#f8fafc',
                  border: '1.5px solid rgba(226, 232, 240, 1)',
                  outline: 'none',
                }}
                onFocus={e => {
                  e.target.style.border = '1.5px solid #0a1628';
                  e.target.style.boxShadow = '0 0 0 3px rgba(10, 22, 40, 0.08)';
                }}
                onBlur={e => {
                  e.target.style.border = '1.5px solid rgba(226, 232, 240, 1)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <p className="text-[9px] text-[#94a3b8] mt-1.5 text-right select-none">
                Ctrl+Enter para guardar · Esc para cancelar
              </p>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setPendingType(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all text-slate-700"
                style={{
                  background: 'transparent',
                  border: '1.5px solid rgba(226, 232, 240, 1)',
                }}
                onMouseEnter={e => {
                  (e.target as HTMLElement).style.background = '#f1f5f9';
                }}
                onMouseLeave={e => {
                  (e.target as HTMLElement).style.background = 'transparent';
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => onComentario(commentDraft)}
                disabled={!commentDraft.trim()}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #0a1628, #1e3a8a)',
                  boxShadow: '0 4px 12px rgba(10, 22, 40, 0.15)',
                }}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 13l4 4L19 7"/>
                </svg>
                Guardar nota
              </button>
            </div>
          </div>
        </div>
      )}


    </>
  );
}