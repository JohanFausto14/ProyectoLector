'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Anotacion, HIGHLIGHT_COLORS, HIGHLIGHT_BORDER, HIGHLIGHT_SOLID } from '../../../hooks/useAnnotations';
import { AlumnoLibrosService } from '../../../service/alumno/libros.service';

interface AnnotatedContentProps {
  contenido:   string;
  anotaciones: Anotacion[];
  onRemove:    (id: string) => void;
  onMouseUp:   () => void;
  onAddComentario?: (ann: Anotacion, comentario: string) => void;
}

interface Span {
  text:      string;
  highlight: Anotacion | null;
  comment:   Anotacion | null;
}

function buildSpans(paraText: string, paraStart: number, anotaciones: Anotacion[]): Span[] {
  const paraEnd    = paraStart + paraText.length;
  const relevantes = anotaciones.filter(
    a => a.offsetInicio < paraEnd && a.offsetFin > paraStart,
  );

  if (!relevantes.length) return [{ text: paraText, highlight: null, comment: null }];

  const cuts = new Set<number>([0, paraText.length]);
  for (const a of relevantes) {
    cuts.add(Math.max(0,               a.offsetInicio - paraStart));
    cuts.add(Math.min(paraText.length, a.offsetFin    - paraStart));
  }

  const sorted = Array.from(cuts).sort((a, b) => a - b);
  const spans: Span[] = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const from = sorted[i]!;
    const to   = sorted[i + 1]!;
    if (from >= to) continue;

    const midGlobal = paraStart + from + (to - from) / 2;

    const highlight = relevantes.find(
      a => a.tipo === 'highlight' && a.offsetInicio <= midGlobal && a.offsetFin > midGlobal,
    ) ?? null;

    const comment = relevantes.find(
      a => a.tipo === 'comentario' && a.offsetInicio <= midGlobal && a.offsetFin > midGlobal,
    ) ?? null;

    spans.push({ text: paraText.slice(from, to), highlight, comment });
  }
  return spans;
}

const HIGHLIGHT_GRADIENTS: Record<string, string> = {
  amarillo: 'linear-gradient(180deg, rgba(253,230,138,0.6) 0%, rgba(251,191,36,0.4) 100%)',
  verde:    'linear-gradient(180deg, rgba(134,239,172,0.6) 0%, rgba(74,222,128,0.4)  100%)',
  rosa:     'linear-gradient(180deg, rgba(249,168,212,0.6) 0%, rgba(244,114,182,0.4) 100%)',
  azul:     'linear-gradient(180deg, rgba(191,219,254,0.6) 0%, rgba(147,197,253,0.4) 100%)',
};

// ── Panel de nota en el margen (click-to-open) ───────────────────────────────

interface NoteCardProps {
  ann:      Anotacion;
  noteIdx:  number;
  onRemove: (id: string) => void;
  isOpen:   boolean;
  onOpen:   () => void;
  onClose:  () => void;
  /** Para resaltar el texto asociado en el párrafo */
  onHover:  (id: string | null) => void;
}

function NoteChip({ ann, noteIdx, onRemove, isOpen, onOpen, onClose, onHover }: NoteCardProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Pequeño delay para que el mismo clic de apertura no cierre
    const timer = setTimeout(() => document.addEventListener('mousedown', handleClick), 100);
    return () => { clearTimeout(timer); document.removeEventListener('mousedown', handleClick); };
  }, [isOpen, onClose]);

  return (
    <div className="relative shrink-0" ref={panelRef}>
      {/* Chip del marcador */}
      <button
        onClick={() => isOpen ? onClose() : onOpen()}
        onMouseEnter={() => onHover(ann.id as string)}
        onMouseLeave={() => { if (!isOpen) onHover(null); }}
        title="Ver nota"
        className="flex items-center justify-center transition-all duration-200 cursor-pointer"
        style={{
          width:        '22px',
          height:       '22px',
          borderRadius: '6px',
          background: isOpen
            ? 'linear-gradient(135deg, #f59e0b, #d4af37)'
            : 'rgba(212,175,55,0.15)',
          border: `1.5px solid ${isOpen ? 'transparent' : 'rgba(212,175,55,0.3)'}`,
          boxShadow: isOpen ? '0 4px 12px rgba(212,175,55,0.4)' : 'none',
          transform: isOpen ? 'scale(1.1)' : 'scale(1)',
        }}
      >
        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          style={{ color: isOpen ? 'white' : '#d4af37' }}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
      </button>

      {/* Número de nota */}
      <span
        data-annotation-ignore="true"
        className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-black text-white pointer-events-none"
        style={{ background: isOpen ? '#d4af37' : '#0a1628', transition: 'background 0.2s ease' }}
      >
        {noteIdx + 1}
      </span>

      {/* Panel flotante persistente — CLICK TO OPEN/CLOSE */}
      {isOpen && (
        <>
          {/* Vista Desktop */}
          <div
            data-annotation-ignore="true"
            className="hidden md:block absolute right-full top-0 mr-3 z-30"
            style={{
              width: '260px',
              animation: 'noteCardIn 0.2s cubic-bezier(0.34,1.56,0.64,1) both',
            }}
          >
            <div
              data-annotation-ignore="true"
              className="rounded-xl overflow-hidden"
              style={{
                background:     'rgba(10, 22, 40, 0.96)',
                backdropFilter: 'blur(20px)',
                border:         '1px solid rgba(255,255,255,0.12)',
                boxShadow:      '0 20px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.05)',
              }}
            >
              {/* Header: texto citado + cerrar */}
              <div
                data-annotation-ignore="true"
                className="flex items-start gap-2 px-3 py-2.5"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div data-annotation-ignore="true" className="flex-1 min-w-0">
                  <p
                    data-annotation-ignore="true"
                    className="text-[8px] font-black uppercase tracking-widest text-[#d4af37]/60 mb-0.5"
                  >
                    Nota #{noteIdx + 1}
                  </p>
                  <p
                    data-annotation-ignore="true"
                    className="italic text-[9px] text-[#d4af37]/75 line-clamp-2 leading-relaxed"
                  >
                    &ldquo;{ann.textoSeleccionado.slice(0, 70)}{ann.textoSeleccionado.length > 70 ? '…' : ''}&rdquo;
                  </p>
                </div>
                {/* Botón cerrar panel */}
                <button
                  data-annotation-ignore="true"
                  onClick={e => { e.stopPropagation(); onClose(); onHover(null); }}
                  className="w-5 h-5 rounded flex items-center justify-center text-white/25 hover:text-white/70 hover:bg-white/10 transition-all shrink-0 mt-0.5"
                >
                  <svg data-annotation-ignore="true" className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              {/* Contenido de la nota */}
              <div data-annotation-ignore="true" className="px-3 py-3">
                <p
                  data-annotation-ignore="true"
                  className="text-[12px] font-lora text-white/85 leading-relaxed"
                >
                  {ann.comentario}
                </p>
              </div>

              {/* Footer: botón eliminar */}
              <div
                data-annotation-ignore="true"
                className="flex items-center justify-between px-3 py-2"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div data-annotation-ignore="true" />
                <button
                  data-annotation-ignore="true"
                  onClick={e => { e.stopPropagation(); onRemove(ann.id as string); onHover(null); }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                  style={{
                    color:      'rgba(248,113,113,0.75)',
                    background: 'rgba(239,68,68,0.08)',
                    border:     '1px solid rgba(239,68,68,0.15)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.18)';
                    (e.currentTarget as HTMLElement).style.color = 'rgba(248,113,113,1)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)';
                    (e.currentTarget as HTMLElement).style.color = 'rgba(248,113,113,0.75)';
                  }}
                >
                  <svg data-annotation-ignore="true" className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
                  </svg>
                  Eliminar nota
                </button>
              </div>
            </div>

            {/* Flecha apuntando al chip */}
            <div
              data-annotation-ignore="true"
              className="absolute -right-1.5 top-3 w-3 h-3 rotate-45"
              style={{
                background: 'rgba(10, 22, 40, 0.96)',
                borderRight: '1px solid rgba(255,255,255,0.12)',
                borderTop:   '1px solid rgba(255,255,255,0.12)',
              }}
            />
          </div>

          {/* Vista Móvil (Modal Centrado con Backdrop) */}
          <div
            data-annotation-ignore="true"
            className="md:hidden fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => { onClose(); onHover(null); }}
          >
            <div
              data-annotation-ignore="true"
              className="w-full max-w-[290px] rounded-2xl overflow-hidden"
              style={{
                background:     'rgba(10, 22, 40, 0.98)',
                border:         '1px solid rgba(255,255,255,0.15)',
                boxShadow:      '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                animation:      'noteCardIn 0.2s ease-out both',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header: texto citado + cerrar */}
              <div
                data-annotation-ignore="true"
                className="flex items-start gap-2 px-4 py-3.5"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div data-annotation-ignore="true" className="flex-1 min-w-0">
                  <p
                    data-annotation-ignore="true"
                    className="text-[9px] font-black uppercase tracking-widest text-[#d4af37]/70 mb-0.5"
                  >
                    Nota #{noteIdx + 1}
                  </p>
                  <p
                    data-annotation-ignore="true"
                    className="italic text-[10px] text-[#d4af37]/80 line-clamp-2 leading-relaxed"
                  >
                    &ldquo;{ann.textoSeleccionado.slice(0, 70)}{ann.textoSeleccionado.length > 70 ? '…' : ''}&rdquo;
                  </p>
                </div>
                {/* Botón cerrar panel */}
                <button
                  data-annotation-ignore="true"
                  onClick={e => { e.stopPropagation(); onClose(); onHover(null); }}
                  className="w-6 h-6 rounded flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/10 transition-all shrink-0"
                >
                  <svg data-annotation-ignore="true" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              {/* Contenido de la nota */}
              <div data-annotation-ignore="true" className="px-4 py-4.5">
                <p
                  data-annotation-ignore="true"
                  className="text-[13px] font-lora text-white/90 leading-relaxed"
                >
                  {ann.comentario}
                </p>
              </div>

              {/* Footer: botón eliminar */}
              <div
                data-annotation-ignore="true"
                className="flex items-center justify-end px-4 py-3"
                style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
              >
                <button
                  data-annotation-ignore="true"
                  onClick={e => { e.stopPropagation(); onRemove(ann.id as string); onHover(null); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                  style={{
                    color:      'rgba(248,113,113,0.9)',
                    background: 'rgba(239,68,68,0.12)',
                    border:     '1px solid rgba(239,68,68,0.25)',
                  }}
                >
                  <svg data-annotation-ignore="true" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
                  </svg>
                  Eliminar nota
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function AnnotatedContent({
  contenido,
  anotaciones,
  onRemove,
  onMouseUp,
  onAddComentario,
}: AnnotatedContentProps) {
  // Para highlights: hover state (mostrar tooltip solo informativo si no está activo el popover)
  const [hoveredHighlightId, setHoveredHighlightId] = useState<string | null>(null);
  // Popover activo para el highlight (al hacer clic)
  const [activeHighlightId,  setActiveHighlightId]  = useState<string | null>(null);
  
  // Estado para las nuevas funciones del popover (Nota y Diccionario)
  const [popoverMode, setPopoverMode] = useState<'menu' | 'nota' | 'definicion'>('menu');
  const [comentarioDraft, setComentarioDraft] = useState('');
  const [definicionData, setDefinicionData] = useState<{ palabra: string, definicion: string | null } | null>(null);
  const [isLoadingDef, setIsLoadingDef] = useState(false);
  const [defError, setDefError] = useState<string | null>(null);
  const popoverTextareaRef = useRef<HTMLTextAreaElement>(null);
  const activePopoverRef = useRef<HTMLElement>(null);
  const activePopoverMobileRef = useRef<HTMLElement>(null);
  
  // Para comentarios: highlight del texto al interactuar con el chip
  const [hoveredCommentId,   setHoveredCommentId]   = useState<string | null>(null);
  // Chip abierto (click-to-toggle)
  const [openCommentId,      setOpenCommentId]      = useState<string | null>(null);

  // Cerrar popover de highlight al hacer clic en cualquier otro lado
  useEffect(() => {
    if (!activeHighlightId) return;
    const handleClick = (e: MouseEvent | TouchEvent) => {
      if (
        (activePopoverRef.current && activePopoverRef.current.contains(e.target as Node)) ||
        (activePopoverMobileRef.current && activePopoverMobileRef.current.contains(e.target as Node))
      ) {
        return;
      }
      setActiveHighlightId(null);
      setPopoverMode('menu');
      setComentarioDraft('');
      setDefinicionData(null);
      setDefError(null);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [activeHighlightId]);

  const parrafos    = contenido.split('\n');
  const comentarios = anotaciones.filter(a => a.tipo === 'comentario');

  let cursor = 0;
  const paraData = parrafos.map(text => {
    const start = cursor;
    cursor += text.length + 1;
    return { text, start };
  });

  function comentariosDelPara(paraStart: number, paraEnd: number): Anotacion[] {
    return comentarios.filter(
      c => c.offsetInicio >= paraStart && c.offsetInicio < paraEnd,
    );
  }

  return (
    <>
      <div
        onMouseUp={onMouseUp}
        onTouchEnd={onMouseUp}
        className="text-[#0a1628] leading-[2] text-justify font-lora text-lg md:text-xl"
        style={{ hyphens: 'auto' }}
      >
        {paraData.map(({ text, start }, paraIdx) => {
          if (!text.trim()) return null;

          const paraEnd   = start + text.length;
          const spans     = buildSpans(text, start, anotaciones);
          const paraComms = comentariosDelPara(start, paraEnd);

          return (
            <div key={paraIdx} className="relative flex items-start gap-1.5 sm:gap-3">

              <div
                data-para-index={paraIdx}
                className="flex-1 min-w-0 mb-8 indent-4 sm:indent-8 first:indent-0"
              >
                {spans.map((span, si) => {
                  // El comentario activo es el que está abierto o en hover
                  const activeCommentId = openCommentId ?? hoveredCommentId;
                  const isCommentActive  = span.comment !== null && activeCommentId === span.comment.id;
                  const isHighlightHov   = span.highlight !== null && hoveredHighlightId === span.highlight.id;

                  if (!span.highlight && !span.comment) {
                    return <span key={si}>{span.text}</span>;
                  }

                  // Solo comentario
                  if (!span.highlight && span.comment) {
                    return (
                      <span
                        key={si}
                        style={{
                          borderRadius:  '3px',
                          padding:       '1px 2px',
                          background:    isCommentActive ? 'rgba(212,175,55,0.2)' : 'transparent',
                          borderBottom:  isCommentActive ? '1.5px dashed rgba(212,175,55,0.5)' : '1.5px dashed transparent',
                          transition:    'all 0.2s ease',
                        }}
                      >
                        {span.text}
                      </span>
                    );
                  }

                  // Highlight
                  const ann   = span.highlight!;
                  const color = ann.color!;
                  const solid = HIGHLIGHT_SOLID[color];

                  return (
                    <mark
                      key={si}
                      onMouseEnter={() => setHoveredHighlightId(ann.id as string)}
                      onMouseLeave={() => setHoveredHighlightId(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveHighlightId(activeHighlightId === ann.id ? null : (ann.id as string));
                      }}
                      className="relative group cursor-pointer"
                      style={{
                        background: isCommentActive
                          ? 'rgba(212,175,55,0.45)'
                          : isHighlightHov || activeHighlightId === ann.id
                            ? HIGHLIGHT_COLORS[color].replace('0.45)', '0.7)')
                            : HIGHLIGHT_GRADIENTS[color],
                        borderBottom: `2.5px solid ${HIGHLIGHT_BORDER[color]}`,
                        borderRadius: '3px',
                        padding:      '1px 2px',
                        transition:   'background 0.2s ease, box-shadow 0.2s ease',
                        boxShadow:    isHighlightHov || activeHighlightId === ann.id ? `0 2px 12px ${solid}40` : 'none',
                        outline:      isHighlightHov || activeHighlightId === ann.id ? `1px solid ${solid}30`  : '1px solid transparent',
                      }}
                    >
                      {span.text}

                      {activeHighlightId === ann.id && (
                        <>
                          {/* Desktop Highlight Popover */}
                          <span
                            ref={activePopoverRef}
                            data-annotation-ignore="true"
                            className="
                              hidden md:flex absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                              flex-col gap-2 p-1.5 rounded-xl
                              select-none cursor-default z-50
                            "
                            style={{
                              background:     'rgba(10, 22, 40, 0.95)',
                              backdropFilter: 'blur(12px)',
                              border:         '1px solid rgba(255,255,255,0.12)',
                              boxShadow:      `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${solid}30`,
                              animation:      'noteCardIn 0.2s cubic-bezier(0.34,1.56,0.64,1) both',
                              width:          popoverMode === 'menu' ? 'max-content' : '260px',
                            }}
                            onClick={e => e.stopPropagation()}
                            onMouseDown={e => e.stopPropagation()}
                            onTouchStart={e => e.stopPropagation()}
                          >
                            {popoverMode === 'menu' && (
                              <div className="flex items-center gap-1.5">
                                {/* Botón Consultar Definición */}
                                <button
                                  data-annotation-ignore="true"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    setPopoverMode('definicion');
                                    setIsLoadingDef(true);
                                    setDefError(null);
                                    try {
                                      const selWord = ann.textoSeleccionado.trim();
                                      if (selWord.length < 2 || selWord.length > 80) {
                                        setDefError('Selección inválida para glosario.');
                                        return;
                                      }
                                      const data = await AlumnoLibrosService.registrarGlosario(selWord);
                                      setDefinicionData({ palabra: data.palabra, definicion: data.definicion });
                                    } catch (err) {
                                      setDefError('Palabra no encontrada o no válida.');
                                    } finally {
                                      setIsLoadingDef(false);
                                    }
                                  }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-[#d4af37]/80 hover:bg-[#d4af37]/15 hover:text-[#d4af37]"
                                >
                                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8"/>
                                    <path d="M21 21l-4.35-4.35"/>
                                  </svg>
                                  Definir
                                </button>

                                {/* Botón Añadir Nota */}
                                <button
                                  data-annotation-ignore="true"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPopoverMode('nota');
                                    setTimeout(() => popoverTextareaRef.current?.focus(), 50);
                                  }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-[#d4af37]/80 hover:bg-[#d4af37]/15 hover:text-[#d4af37]"
                                >
                                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <path d="M12 20h9"/>
                                    <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                                  </svg>
                                  Nota
                                </button>

                                <div className="w-px h-4" style={{ background: 'rgba(255,255,255,0.1)' }} />

                                <button
                                  data-annotation-ignore="true"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRemove(ann.id as string);
                                    setActiveHighlightId(null);
                                  }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-red-400 hover:bg-red-500/15 hover:text-red-500"
                                >
                                  <svg data-annotation-ignore="true" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
                                  </svg>
                                  Eliminar
                                </button>
                              </div>
                            )}

                            {popoverMode === 'nota' && (
                              <div className="p-2 w-full flex flex-col gap-2" onClick={e => e.stopPropagation()}>
                                <textarea
                                  ref={popoverTextareaRef}
                                  value={comentarioDraft}
                                  onChange={e => setComentarioDraft(e.target.value)}
                                  placeholder="Escribe tu nota aquí..."
                                  className="w-full bg-black/20 text-white/90 text-sm rounded-lg p-2.5 outline-none resize-none font-lora placeholder-white/30"
                                  style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                                  rows={3}
                                />
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => setPopoverMode('menu')} className="px-3 py-1.5 text-xs text-white/50 hover:text-white/90 transition-colors">
                                    Cancelar
                                  </button>
                                  <button 
                                    onClick={() => {
                                      if (onAddComentario && comentarioDraft.trim()) {
                                        onAddComentario(ann, comentarioDraft);
                                        setActiveHighlightId(null);
                                        setPopoverMode('menu');
                                        setComentarioDraft('');
                                      }
                                    }}
                                    disabled={!comentarioDraft.trim()}
                                    className="px-3 py-1.5 bg-[#d4af37] text-black text-xs font-bold rounded-md disabled:opacity-50"
                                  >
                                    Guardar Nota
                                  </button>
                                </div>
                              </div>
                            )}

                            {popoverMode === 'definicion' && (
                              <div className="p-2 w-full flex flex-col gap-2 whitespace-normal" onClick={e => e.stopPropagation()}>
                                {isLoadingDef ? (
                                  <div className="py-4 flex justify-center"><div className="w-4 h-4 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin"/></div>
                                ) : defError ? (
                                  <p className="text-xs text-red-400 text-center py-2">{defError}</p>
                                ) : definicionData ? (
                                  <div className="text-left">
                                    <h4 className="text-sm font-bold text-[#d4af37] mb-1 capitalize">{definicionData.palabra}</h4>
                                    <p className="text-xs text-white/80 leading-relaxed font-lora line-clamp-4">
                                      {definicionData.definicion || 'No se encontró definición para esta palabra.'}
                                    </p>
                                  </div>
                                ) : null}
                                <div className="flex justify-end pt-1">
                                  <button onClick={() => setPopoverMode('menu')} className="px-3 py-1 text-xs font-bold text-[#d4af37] hover:bg-white/5 rounded transition-colors">
                                    Volver
                                  </button>
                                </div>
                              </div>
                            )}

                            <span data-annotation-ignore="true"
                              className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-2.5 h-2.5 rotate-45"
                              style={{ 
                                  background: 'rgba(10, 22, 40, 0.95)',
                                  borderBottom: '1px solid rgba(255,255,255,0.12)',
                                  borderRight: '1px solid rgba(255,255,255,0.12)'
                              }}/>
                          </span>

                          {/* Mobile Highlight Popover (Backdrop Modal) */}
                          <span
                            data-annotation-ignore="true"
                            className="md:hidden fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none cursor-default"
                            onClick={e => {
                              e.stopPropagation();
                              setActiveHighlightId(null);
                              setPopoverMode('menu');
                              setComentarioDraft('');
                              setDefinicionData(null);
                              setDefError(null);
                            }}
                          >
                            <span
                              ref={activePopoverMobileRef}
                              data-annotation-ignore="true"
                              className="w-full max-w-[280px] flex flex-col gap-2.5 p-4 rounded-2xl"
                              style={{
                                background:     'rgba(10, 22, 40, 0.98)',
                                border:         '1px solid rgba(255,255,255,0.15)',
                                boxShadow:      `0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px ${solid}30`,
                                animation:      'noteCardIn 0.2s ease-out both',
                              }}
                              onClick={e => e.stopPropagation()}
                              onMouseDown={e => e.stopPropagation()}
                              onTouchStart={e => e.stopPropagation()}
                            >
                              {popoverMode === 'menu' && (
                                <div className="flex flex-col gap-2 w-full">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1 px-1">Opciones de Selección</p>
                                  {/* Botón Consultar Definición */}
                                  <button
                                    data-annotation-ignore="true"
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      setPopoverMode('definicion');
                                      setIsLoadingDef(true);
                                      setDefError(null);
                                      try {
                                        const selWord = ann.textoSeleccionado.trim();
                                        if (selWord.length < 2 || selWord.length > 80) {
                                          setDefError('Selección inválida para glosario.');
                                          return;
                                        }
                                        const data = await AlumnoLibrosService.registrarGlosario(selWord);
                                        setDefinicionData({ palabra: data.palabra, definicion: data.definicion });
                                      } catch (err) {
                                        setDefError('Palabra no encontrada o no válida.');
                                      } finally {
                                        setIsLoadingDef(false);
                                      }
                                    }}
                                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold text-[#d4af37]/90 hover:bg-[#d4af37]/10 transition-colors"
                                    style={{ border: '1px solid rgba(212,175,55,0.15)' }}
                                  >
                                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <circle cx="11" cy="11" r="8"/>
                                      <path d="M21 21l-4.35-4.35"/>
                                    </svg>
                                    Consultar Glosario
                                  </button>

                                  {/* Botón Añadir Nota */}
                                  <button
                                    data-annotation-ignore="true"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPopoverMode('nota');
                                      setTimeout(() => popoverTextareaRef.current?.focus(), 50);
                                    }}
                                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold text-[#d4af37]/90 hover:bg-[#d4af37]/10 transition-colors"
                                    style={{ border: '1px solid rgba(212,175,55,0.15)' }}
                                  >
                                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                      <path d="M12 20h9"/>
                                      <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                                    </svg>
                                    Añadir Nota
                                  </button>

                                  {/* Separador */}
                                  <div className="h-px w-full my-1" style={{ background: 'rgba(255,255,255,0.1)' }} />

                                  <button
                                    data-annotation-ignore="true"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onRemove(ann.id as string);
                                      setActiveHighlightId(null);
                                    }}
                                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors"
                                    style={{ border: '1px solid rgba(239,68,68,0.2)' }}
                                  >
                                    <svg data-annotation-ignore="true" className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
                                    </svg>
                                    Eliminar Subrayado
                                  </button>
                                </div>
                              )}

                              {popoverMode === 'nota' && (
                                <div className="w-full flex flex-col gap-3" onClick={e => e.stopPropagation()}>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-[#d4af37]/80 px-1">Nueva Nota</p>
                                  <textarea
                                    ref={popoverTextareaRef}
                                    value={comentarioDraft}
                                    onChange={e => setComentarioDraft(e.target.value)}
                                    placeholder="Escribe tu nota aquí..."
                                    className="w-full bg-black/35 text-white/95 text-sm rounded-xl p-3 outline-none resize-none font-lora placeholder-white/35"
                                    style={{ border: '1px solid rgba(255,255,255,0.15)' }}
                                    rows={4}
                                  />
                                  <div className="flex justify-end gap-2">
                                    <button onClick={() => setPopoverMode('menu')} className="px-3.5 py-2 text-xs font-bold text-white/50 hover:text-white/90 transition-colors">
                                      Cancelar
                                    </button>
                                    <button 
                                      onClick={() => {
                                        if (onAddComentario && comentarioDraft.trim()) {
                                          onAddComentario(ann, comentarioDraft);
                                          setActiveHighlightId(null);
                                          setPopoverMode('menu');
                                          setComentarioDraft('');
                                        }
                                      }}
                                      disabled={!comentarioDraft.trim()}
                                      className="px-4 py-2 bg-[#d4af37] hover:bg-[#d4af37]/90 text-black text-xs font-black uppercase tracking-wider rounded-lg disabled:opacity-50 transition-colors"
                                    >
                                      Guardar
                                    </button>
                                  </div>
                                </div>
                              )}

                              {popoverMode === 'definicion' && (
                                <div className="w-full flex flex-col gap-3 whitespace-normal text-left" onClick={e => e.stopPropagation()}>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-[#d4af37]/80 px-1">Glosario</p>
                                  {isLoadingDef ? (
                                    <div className="py-6 flex justify-center"><div className="w-5 h-5 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin"/></div>
                                  ) : defError ? (
                                    <p className="text-xs text-red-400 text-center py-4">{defError}</p>
                                  ) : definicionData ? (
                                    <div className="px-1">
                                      <h4 className="text-base font-bold text-[#d4af37] mb-2.5 capitalize">{definicionData.palabra}</h4>
                                      <p className="text-xs text-white/90 leading-relaxed font-lora max-h-[160px] overflow-y-auto pr-1">
                                        {definicionData.definicion || 'No se encontró definición para esta palabra.'}
                                      </p>
                                    </div>
                                  ) : null}
                                  <div className="flex justify-end pt-1">
                                    <button onClick={() => setPopoverMode('menu')} className="px-4 py-2 text-xs font-black uppercase tracking-widest text-[#d4af37] hover:bg-white/5 rounded-lg transition-colors">
                                      Volver
                                    </button>
                                  </div>
                                </div>
                              )}
                            </span>
                          </span>
                        </>
                      )}

                      {/* Tooltip informativo solo en hover, si el popover NO está abierto */}
                      {isHighlightHov && activeHighlightId !== ann.id && (
                        <span
                          data-annotation-ignore="true"
                          className="
                            absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                            hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full
                            whitespace-nowrap select-none pointer-events-none
                            z-40
                          "
                          style={{
                            background:     'rgba(10, 22, 40, 0.92)',
                            backdropFilter: 'blur(8px)',
                            border:         '1px solid rgba(255,255,255,0.12)',
                            boxShadow:      `0 4px 16px rgba(0,0,0,0.35), 0 0 0 1px ${solid}20`,
                            animation:      'fadeIn 0.15s ease-out forwards',
                          }}
                        >
                          <span data-annotation-ignore="true" className="text-[9px] font-black uppercase tracking-widest"
                            style={{ color: 'rgba(255,255,255,0.85)' }}>
                            Clic para opciones
                          </span>
                          <span data-annotation-ignore="true"
                            className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-2 h-2 rotate-45"
                            style={{ background: 'rgba(10, 22, 40, 0.92)' }}/>
                        </span>
                      )}
                    </mark>
                  );
                })}
              </div>

              {/* Chips de comentarios en el margen */}
              {paraComms.length > 0 && (
                <div className="flex flex-col gap-1.5 pt-1 shrink-0">
                  {paraComms.map((ann, noteIdx) => (
                    <NoteChip
                      key={ann.id}
                      ann={ann}
                      noteIdx={noteIdx}
                      onRemove={id => { onRemove(id); setOpenCommentId(null); setHoveredCommentId(null); }}
                      isOpen={openCommentId === ann.id}
                      onOpen={() => setOpenCommentId(ann.id as string)}
                      onClose={() => { setOpenCommentId(null); setHoveredCommentId(null); }}
                      onHover={id => setHoveredCommentId(id)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* ── Notas al pie ──────────────────────────────────────────────── */}
        {comentarios.length > 0 && (
          <div className="mt-12 pt-8" style={{ borderTop: '1px solid rgba(226,232,240,1)' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, #0a1628, #1e3a8a)' }}>
                <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              </div>
              <p className="text-[10px] font-black text-[#0a1628] uppercase tracking-[0.2em]">
                Mis notas · {comentarios.length}
              </p>
              <div className="flex-1 h-px" style={{ background: 'rgba(226,232,240,1)' }}/>
            </div>

            <div className="space-y-3">
              {comentarios.map((ann, idx) => {
                // La nota al pie también se resalta si el chip marginal está abierto o en hover
                const isActive = openCommentId === ann.id || hoveredCommentId === ann.id;
                return (
                  <div
                    key={ann.id}
                    onMouseEnter={() => { if (!openCommentId) setHoveredCommentId(ann.id as string); }}
                    onMouseLeave={() => { if (!openCommentId) setHoveredCommentId(null); }}
                    className="group relative flex items-start gap-4 rounded-xl p-4 cursor-default transition-all duration-200"
                    style={{
                      background:  isActive ? 'rgba(30,58,138,0.05)' : 'rgba(248, 250, 252, 0.9)',
                      border:      isActive ? '1px solid rgba(10,22,40,0.25)' : '1px solid rgba(226,232,240,1)',
                      borderLeft:  `3px solid ${isActive ? '#0a1628' : 'rgba(226,232,240,1)'}`,
                      transform:   isActive ? 'translateX(2px)' : 'translateX(0)',
                    }}
                  >
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0 transition-all duration-200"
                      style={{
                        background: isActive ? 'linear-gradient(135deg, #0a1628, #1e3a8a)' : '#6b8cba',
                        boxShadow:  isActive ? '0 2px 8px rgba(10,22,40,0.2)' : 'none',
                      }}
                    >
                      {idx + 1}
                    </span>

                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] text-[#6b8cba] italic mb-1.5 line-clamp-1">
                        &ldquo;{ann.textoSeleccionado.slice(0, 70)}{ann.textoSeleccionado.length > 70 ? '…' : ''}&rdquo;
                      </p>
                      <p className="text-sm font-lora text-[#0a1628] leading-relaxed">
                        {ann.comentario}
                      </p>
                    </div>

                    {/* Botón eliminar: siempre visible en hover, sin desaparecer */}
                    <button
                      onClick={() => onRemove(ann.id as string)}
                      className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200"
                      style={{
                        color:      'rgba(248,113,113,0.5)',
                        background: 'transparent',
                        border:     '1px solid transparent',
                        opacity:    0,
                      }}
                      onMouseEnter={e => {
                        const el = e.currentTarget;
                        el.style.opacity      = '1';
                        el.style.color        = 'rgba(248,113,113,1)';
                        el.style.background   = 'rgba(239,68,68,0.1)';
                        el.style.border       = '1px solid rgba(239,68,68,0.2)';
                      }}
                      onMouseLeave={e => {
                        const el = e.currentTarget;
                        el.style.opacity    = '0';
                        el.style.background = 'transparent';
                        el.style.border     = '1px solid transparent';
                      }}
                      // Hacerlo visible cuando el card está en hover o en pantallas touch (móvil)
                      ref={el => {
                        if (!el) return;
                        const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
                        if (isTouch) {
                          el.style.opacity = isActive ? '1' : '0.6';
                        } else {
                          el.style.opacity = isActive ? '0.5' : '0';
                        }
                      }}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>


    </>
  );
}