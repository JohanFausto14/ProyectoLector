'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Anotacion, HIGHLIGHT_COLORS, HIGHLIGHT_BORDER, HIGHLIGHT_SOLID } from '../../../hooks/useAnnotations';
import { AlumnoLibrosService } from '../../../service/alumno/libros.service';

interface AnnotatedContentProps {
  contenido:   string;
  contenidoHtml?: string;
  anotaciones: Anotacion[];
  onRemove:    (id: string) => void;
  onMouseUp:   () => void;
  onAddComentario?: (ann: Anotacion, comentario: string) => void;
  theme?:      'normal' | 'sepia' | 'oscuro_calido' | 'oscuro_neutro';
  activeTool?: string | null;
}

const HIGHLIGHT_GRADIENTS: Record<string, string> = {
  amarillo: 'linear-gradient(180deg, rgba(253,230,138,0.6) 0%, rgba(251,191,36,0.4) 100%)',
  verde:    'linear-gradient(180deg, rgba(134,239,172,0.6) 0%, rgba(74,222,128,0.4)  100%)',
  rosa:     'linear-gradient(180deg, rgba(249,168,212,0.6) 0%, rgba(244,114,182,0.4) 100%)',
  azul:     'linear-gradient(180deg, rgba(191,219,254,0.6) 0%, rgba(147,197,253,0.4) 100%)',
};

// ── Helpers para mapeo y parsing de HTML ─────────────────────────────────────

interface HtmlBlock {
    node: Element;
    text: string;
    start: number;
    end: number;
}

function findClosestSubstring(s: string, sub: string, target: number): number {
    if (!sub) return target;
    
    let bestIndex = -1;
    let minDiff = Infinity;
    let index = s.indexOf(sub);
    
    while (index !== -1) {
        const diff = Math.abs(index - target);
        if (diff < minDiff) {
            minDiff = diff;
            bestIndex = index;
        }
        index = s.indexOf(sub, index + 1);
    }
    
    return bestIndex !== -1 ? bestIndex : s.indexOf(sub);
}

function parseHtmlBlocks(html: string): { htmlText: string; blocks: HtmlBlock[]; doc: Document } {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const body = doc.body;

    const blocks: HtmlBlock[] = [];
    let accumulatedText = '';

    const traverse = (node: Node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as Element;
            const tagName = el.tagName.toLowerCase();
            if (['p', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'blockquote'].includes(tagName)) {
                const start = accumulatedText.length;
                const text = el.textContent || '';
                accumulatedText += text + '\n';
                const end = accumulatedText.length;
                blocks.push({
                    node: el,
                    text,
                    start,
                    end
                });
                return;
            }
        }
        for (let i = 0; i < node.childNodes.length; i++) {
            traverse(node.childNodes[i]!);
        }
    };

    traverse(body);

    if (blocks.length === 0) {
        const text = body.textContent || '';
        blocks.push({
            node: body,
            text,
            start: 0,
            end: text.length
        });
        accumulatedText = text;
    }

    return { htmlText: accumulatedText, blocks, doc };
}

function getTextNodes(root: Node): { node: Text; start: number; end: number }[] {
    const nodes: { node: Text; start: number; end: number }[] = [];
    let currentOffset = 0;

    const traverse = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            const textNode = node as Text;
            const length = textNode.nodeValue?.length ?? 0;
            if (length > 0) {
                nodes.push({
                    node: textNode,
                    start: currentOffset,
                    end: currentOffset + length
                });
                currentOffset += length;
            }
        } else {
            if (node.nodeType === Node.ELEMENT_NODE && (node as Element).getAttribute('data-annotation-ignore') === 'true') {
                return;
            }
            for (let i = 0; i < node.childNodes.length; i++) {
                traverse(node.childNodes[i]!);
            }
        }
    };

    traverse(root);
    return nodes;
}

// ── Panel de nota en el margen (click-to-open) ───────────────────────────────

interface NoteCardProps {
  ann:      Anotacion;
  noteIdx:  number;
  onRemove: (id: string) => void;
  isOpen:   boolean;
  onOpen:   () => void;
  onClose:  () => void;
  onHover:  (id: string | null) => void;
}

function NoteChip({ ann, noteIdx, onRemove, isOpen, onOpen, onClose, onHover }: NoteCardProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const timer = setTimeout(() => document.addEventListener('mousedown', handleClick), 100);
    return () => { clearTimeout(timer); document.removeEventListener('mousedown', handleClick); };
  }, [isOpen, onClose]);

  return (
    <div className="relative shrink-0" ref={panelRef}>
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

      <span
        data-annotation-ignore="true"
        className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-black text-white pointer-events-none"
        style={{ background: isOpen ? '#d4af37' : '#0a1628', transition: 'background 0.2s ease' }}
      >
        {noteIdx + 1}
      </span>

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

              <div data-annotation-ignore="true" className="px-3 py-3">
                <p
                  data-annotation-ignore="true"
                  className="text-[12px] font-lora text-white/85 leading-relaxed"
                >
                  {ann.comentario}
                </p>
              </div>

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

              <div data-annotation-ignore="true" className="px-4 py-4.5">
                <p
                  data-annotation-ignore="true"
                  className="text-[13px] font-lora text-white/90 leading-relaxed"
                >
                  {ann.comentario}
                </p>
              </div>

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

function AnnotatedContent({
  contenido,
  contenidoHtml,
  anotaciones,
  onRemove,
  onMouseUp,
  onAddComentario,
  theme = 'normal',
  activeTool = null,
}: AnnotatedContentProps) {
  const [hoveredHighlightId, setHoveredHighlightId] = useState<string | null>(null);
  const [activeHighlightId,  setActiveHighlightId]  = useState<string | null>(null);

  const startRangeRef = useRef<{ node: Node; offset: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!activeTool || activeTool === 'comentario') return;
    window.getSelection()?.removeAllRanges();

    const touch = e.touches[0];
    if (!touch) return;

    let range: Range | null = null;
    if (document.caretRangeFromPoint) {
      range = document.caretRangeFromPoint(touch.clientX, touch.clientY);
    } else if ((document as any).caretPositionFromPoint) {
      const pos = (document as any).caretPositionFromPoint(touch.clientX, touch.clientY);
      if (pos) {
        range = document.createRange();
        range.setStart(pos.offsetNode, pos.offset);
        range.setEnd(pos.offsetNode, pos.offset);
      }
    }

    if (range) {
      startRangeRef.current = {
        node: range.startContainer,
        offset: range.startOffset,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!activeTool || activeTool === 'comentario' || !startRangeRef.current) return;
    if (e.cancelable) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!activeTool || activeTool === 'comentario' || !startRangeRef.current) return;

    const touch = e.changedTouches[0];
    if (!touch) {
      startRangeRef.current = null;
      return;
    }

    let range: Range | null = null;
    if (document.caretRangeFromPoint) {
      range = document.caretRangeFromPoint(touch.clientX, touch.clientY);
    } else if ((document as any).caretPositionFromPoint) {
      const pos = (document as any).caretPositionFromPoint(touch.clientX, touch.clientY);
      if (pos) {
        range = document.createRange();
        range.setStart(pos.offsetNode, pos.offset);
        range.setEnd(pos.offsetNode, pos.offset);
      }
    }

    if (range && startRangeRef.current) {
      const startNode = startRangeRef.current.node;
      const startOffset = startRangeRef.current.offset;
      const endNode = range.startContainer;
      const endOffset = range.startOffset;

      const finalRange = document.createRange();
      const comparison = startNode.compareDocumentPosition(endNode);

      if (comparison === Node.DOCUMENT_POSITION_FOLLOWING || (startNode === endNode && startOffset <= endOffset)) {
        finalRange.setStart(startNode, startOffset);
        finalRange.setEnd(endNode, endOffset);
      } else {
        finalRange.setStart(endNode, endOffset);
        finalRange.setEnd(startNode, startOffset);
      }

      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(finalRange);
        onMouseUp();
        setTimeout(() => { sel.removeAllRanges(); }, 10);
      }
    }
    startRangeRef.current = null;
  };
  
  const [popoverMode, setPopoverMode] = useState<'menu' | 'nota' | 'definicion'>('menu');
  const [comentarioDraft, setComentarioDraft] = useState('');
  const [definicionData, setDefinicionData] = useState<{ palabra: string, definicion: string | null } | null>(null);
  const [isLoadingDef, setIsLoadingDef] = useState(false);
  const [defError, setDefError] = useState<string | null>(null);
  const popoverTextareaRef = useRef<HTMLTextAreaElement>(null);
  const activePopoverRef = useRef<HTMLElement>(null);
  const activePopoverMobileRef = useRef<HTMLElement>(null);
  
  const [hoveredCommentId,   setHoveredCommentId]   = useState<string | null>(null);
  const [openCommentId,      setOpenCommentId]      = useState<string | null>(null);

  const [portals, setPortals] = useState<React.ReactPortal[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Cerrar popover al hacer clic fuera
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

  const comentarios = anotaciones.filter(a => a.tipo === 'comentario');

  // Normalizar plain text a simple HTML si no viene contenidoHtml
  const htmlToNormalize = useMemo(() => {
    if (contenidoHtml) return contenidoHtml;
    return contenido.split('\n').filter(p => p.trim()).map(p => `<p>${p}</p>`).join('\n');
  }, [contenidoHtml, contenido]);

  // Procesar HTML: Parsear, inyectar highlights/comments en el DOM y ubicar placeholders
  const { renderedHtml, blocks, commentsForBlocks } = useMemo(() => {
    if (typeof window === 'undefined' || !htmlToNormalize) {
      return { renderedHtml: htmlToNormalize || '', blocks: [], commentsForBlocks: {} };
    }

    const { htmlText, blocks, doc } = parseHtmlBlocks(htmlToNormalize);
    const comments = anotaciones.filter(a => a.tipo === 'comentario');
    const highlights = anotaciones.filter(a => a.tipo === 'highlight');

    // 1. Inyectar highlights
    const mappedHighlights = highlights.map(ann => {
      const targetHtmlIndex = ann.offsetInicio * (htmlText.length / (contenido.length || 1));
      const start = findClosestSubstring(htmlText, ann.textoSeleccionado, targetHtmlIndex);
      const end = start + ann.textoSeleccionado.length;
      return { ...ann, start, end };
    }).filter(ann => ann.start !== -1);

    const sortedHighlights = [...mappedHighlights].sort((a, b) => b.start - a.start);

    for (const ann of sortedHighlights) {
      let annStart = ann.start;
      let annEnd = ann.end;
      
      while (true) {
        const textNodes = getTextNodes(doc.body);
        const overlappingNode = [...textNodes].reverse().find(tNode => annStart < tNode.end && annEnd > tNode.start);
        
        if (!overlappingNode) break;
        
        const localStart = Math.max(0, annStart - overlappingNode.start);
        const localEnd = Math.min(overlappingNode.end - overlappingNode.start, annEnd - overlappingNode.start);
        
        const tailNode = overlappingNode.node.splitText(localEnd);
        const middleNode = overlappingNode.node.splitText(localStart);
        
        const wrapper = doc.createElement('mark');
        wrapper.setAttribute('data-annotation-id', String(ann.id));
        wrapper.setAttribute('data-annotation-type', 'highlight');
        
        const color = ann.color || 'amarillo';
        wrapper.className = 'relative cursor-pointer rounded-[3px] px-[2px] py-[1px] transition-all duration-200';
        wrapper.style.background = HIGHLIGHT_GRADIENTS[color] || 'linear-gradient(180deg, rgba(253,230,138,0.6) 0%, rgba(251,191,36,0.4) 100%)';
        wrapper.style.borderBottom = `2.5px solid ${HIGHLIGHT_BORDER[color]}`;
        
        middleNode.parentNode?.insertBefore(wrapper, middleNode);
        wrapper.appendChild(middleNode);
        
        annEnd = overlappingNode.start + localStart;
        if (annEnd <= annStart) break;
      }
    }

    // 2. Inyectar comentarios (subrayado punteado)
    const commentsForBlocks: Record<number, Anotacion[]> = {};
    const mappedComments = comments.map(ann => {
      const targetHtmlIndex = ann.offsetInicio * (htmlText.length / (contenido.length || 1));
      const start = findClosestSubstring(htmlText, ann.textoSeleccionado, targetHtmlIndex);
      const end = start + ann.textoSeleccionado.length;
      return { ...ann, start, end };
    }).filter(ann => ann.start !== -1);

    const sortedComments = [...mappedComments].sort((a, b) => b.start - a.start);
    for (const ann of sortedComments) {
      let annStart = ann.start;
      let annEnd = ann.end;
      
      while (true) {
        const textNodes = getTextNodes(doc.body);
        const overlappingNode = [...textNodes].reverse().find(tNode => annStart < tNode.end && annEnd > tNode.start);
        
        if (!overlappingNode) break;
        
        const localStart = Math.max(0, annStart - overlappingNode.start);
        const localEnd = Math.min(overlappingNode.end - overlappingNode.start, annEnd - overlappingNode.start);
        
        const tailNode = overlappingNode.node.splitText(localEnd);
        const middleNode = overlappingNode.node.splitText(localStart);
        
        const wrapper = doc.createElement('span');
        wrapper.setAttribute('data-annotation-id', String(ann.id));
        wrapper.setAttribute('data-annotation-type', 'comentario');
        wrapper.className = 'relative rounded-[3px] px-[2px] py-[1px] transition-all duration-200';
        wrapper.style.borderBottom = '1.5px dashed rgba(212,175,55,0.5)';
        
        middleNode.parentNode?.insertBefore(wrapper, middleNode);
        wrapper.appendChild(middleNode);
        
        annEnd = overlappingNode.start + localStart;
        if (annEnd <= annStart) break;
      }
    }

    // Mapear comentarios a bloques para la columna de chips en el margen
    mappedComments.forEach(ann => {
      const blockIdx = blocks.findIndex(b => ann.start >= b.start && ann.start < b.end);
      if (blockIdx !== -1) {
        if (!commentsForBlocks[blockIdx]) {
          commentsForBlocks[blockIdx] = [];
        }
        commentsForBlocks[blockIdx]!.push(ann);
      }
    });

    // Inyectar placeholders para los chips flotantes en cada bloque correspondiente
    blocks.forEach((block, blockIdx) => {
      const blockComms = commentsForBlocks[blockIdx];
      if (blockComms && blockComms.length > 0) {
        const el = block.node as HTMLElement;
        el.style.position = 'relative';
        
        const placeholder = doc.createElement('div');
        placeholder.className = 'absolute left-full ml-2 sm:ml-4 top-1 flex flex-col gap-1.5 z-20';
        placeholder.setAttribute('data-comment-placeholder-for', String(blockIdx));
        placeholder.setAttribute('data-annotation-ignore', 'true');
        el.appendChild(placeholder);
      }
    });

    return { renderedHtml: doc.body.innerHTML, blocks, commentsForBlocks };
  }, [htmlToNormalize, anotaciones, contenido]);

  // Renderizar Portales en el cliente cuando el HTML se actualiza o cambian estados
  useEffect(() => {
    if (!isMounted) return;

    const newPortals: React.ReactPortal[] = [];

    // Portales para NoteChips en el margen
    blocks.forEach((block, blockIdx) => {
      const blockComms = commentsForBlocks[blockIdx];
      if (blockComms && blockComms.length > 0) {
        const placeholder = document.querySelector(`[data-comment-placeholder-for="${blockIdx}"]`);
        if (placeholder) {
          const portal = createPortal(
            <div className="flex flex-col gap-1.5 shrink-0" data-annotation-ignore="true">
              {blockComms.map((ann, noteIdx) => (
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
            </div>,
            placeholder
          );
          newPortals.push(portal);
        }
      }
    });

    // Portal para el Popover de Highlight activo
    if (activeHighlightId) {
      const activeElement = document.querySelector(`[data-annotation-id="${activeHighlightId}"][data-annotation-type="highlight"]`);
      const ann = anotaciones.find(a => String(a.id) === String(activeHighlightId));
      if (activeElement && ann) {
        const solid = HIGHLIGHT_SOLID[ann.color || 'amarillo'];
        const portal = createPortal(
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

            {/* Mobile Highlight Popover */}
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
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold text-[#d4af37]/90 hover:bg-[#d4af37]/10 transition-colors text-left"
                      style={{ border: '1px solid rgba(212,175,55,0.15)' }}
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="M21 21l-4.35-4.35"/>
                      </svg>
                      Consultar Glosario
                    </button>

                    <button
                      data-annotation-ignore="true"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPopoverMode('nota');
                        setTimeout(() => popoverTextareaRef.current?.focus(), 50);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold text-[#d4af37]/90 hover:bg-[#d4af37]/10 transition-colors text-left"
                      style={{ border: '1px solid rgba(212,175,55,0.15)' }}
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M12 20h9"/>
                        <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                      </svg>
                      Añadir Nota
                    </button>

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
          </>,
          activeElement
        );
        newPortals.push(portal);
      }
    }

    setPortals(newPortals);
  }, [
    isMounted,
    renderedHtml,
    blocks,
    commentsForBlocks,
    activeHighlightId,
    popoverMode,
    comentarioDraft,
    definicionData,
    isLoadingDef,
    defError,
    openCommentId,
    hoveredCommentId,
    anotaciones,
    onAddComentario,
    onRemove
  ]);

  // Event delegation en el contenedor principal
  const handleContainerClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const mark = target.closest('[data-annotation-id]');
    if (mark) {
      const type = mark.getAttribute('data-annotation-type');
      if (type === 'highlight') {
        e.stopPropagation();
        const annId = mark.getAttribute('data-annotation-id')!;
        setActiveHighlightId(activeHighlightId === annId ? null : annId);
        setPopoverMode('menu');
      }
    }
  };

  const handleContainerMouseOver = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const mark = target.closest('[data-annotation-id]');
    if (mark) {
      const annId = mark.getAttribute('data-annotation-id')!;
      const type = mark.getAttribute('data-annotation-type')!;
      if (type === 'highlight') {
        setHoveredHighlightId(annId);
      } else if (type === 'comentario') {
        setHoveredCommentId(annId);
      }
    } else {
      setHoveredHighlightId(null);
      setHoveredCommentId(null);
    }
  };

  const handleContainerMouseLeave = () => {
    setHoveredHighlightId(null);
    setHoveredCommentId(null);
  };

  // Generar estilo dinámico para comentarios activos / hovers
  const activeCommentId = openCommentId ?? hoveredCommentId;
  const dynamicStyleContent = useMemo(() => {
    let styles = '';
    
    if (hoveredHighlightId) {
      const ann = anotaciones.find(a => String(a.id) === String(hoveredHighlightId));
      if (ann && ann.color) {
        const color = ann.color;
        const solid = HIGHLIGHT_SOLID[color];
        styles += `
          [data-annotation-id="${hoveredHighlightId}"][data-annotation-type="highlight"] {
            background: ${HIGHLIGHT_COLORS[color].replace('0.45)', '0.7)')} !important;
            box-shadow: 0 2px 12px ${solid}40 !important;
            outline: 1px solid ${solid}30 !important;
          }
        `;
      }
    }

    if (activeHighlightId) {
      const ann = anotaciones.find(a => String(a.id) === String(activeHighlightId));
      if (ann && ann.color) {
        const color = ann.color;
        const solid = HIGHLIGHT_SOLID[color];
        styles += `
          [data-annotation-id="${activeHighlightId}"][data-annotation-type="highlight"] {
            background: ${HIGHLIGHT_COLORS[color].replace('0.45)', '0.7)')} !important;
            box-shadow: 0 2px 12px ${solid}40 !important;
            outline: 1px solid ${solid}30 !important;
          }
        `;
      }
    }

    if (activeCommentId) {
      styles += `
        [data-annotation-id="${activeCommentId}"][data-annotation-type="comentario"] {
          background: rgba(212,175,55,0.2) !important;
          border-bottom: 1.5px dashed rgba(212,175,55,0.7) !important;
        }
      `;
    }
    return styles;
  }, [hoveredHighlightId, activeHighlightId, activeCommentId, anotaciones]);

  const htmlToRender = isMounted ? renderedHtml : htmlToNormalize;

  return (
    <>
      {dynamicStyleContent && <style dangerouslySetInnerHTML={{ __html: dynamicStyleContent }} />}
      <div
        onMouseUp={onMouseUp}
        onTouchStart={activeTool && activeTool !== 'comentario' ? handleTouchStart : undefined}
        onTouchMove={activeTool && activeTool !== 'comentario' ? handleTouchMove : undefined}
        onTouchEnd={activeTool && activeTool !== 'comentario' ? handleTouchEnd : onMouseUp}
        onClick={handleContainerClick}
        onMouseOver={handleContainerMouseOver}
        onMouseLeave={handleContainerMouseLeave}
        className="segmento-contenido text-inherit leading-[2] text-justify font-lora text-lg md:text-xl"
        style={{ 
          hyphens: 'auto',
          userSelect: activeTool && activeTool !== 'comentario' ? 'none' : 'auto',
          WebkitUserSelect: activeTool && activeTool !== 'comentario' ? 'none' : 'auto'
        }}
        dangerouslySetInnerHTML={{ __html: htmlToRender }}
      />

      {/* Renderizar todos los Portales (Popovers y NoteChips) */}
      {portals}

      {/* ── Notas al pie ──────────────────────────────────────────────── */}
      {comentarios.length > 0 && (
        <div className="mt-12 pt-8" style={{
          borderTop: (theme === 'oscuro_calido' || theme === 'oscuro_neutro')
            ? '1px solid rgba(51, 65, 85, 0.6)' 
            : theme === 'sepia'
              ? '1px solid rgba(235, 220, 185, 1)'
              : '1px solid rgba(226,232,240,1)'
        }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background: (theme === 'oscuro_calido' || theme === 'oscuro_neutro')
                  ? 'linear-gradient(135deg, #1e293b, #334155)'
                  : theme === 'sepia'
                    ? 'linear-gradient(135deg, #5d401b, #87725a)'
                    : 'linear-gradient(135deg, #0a1628, #1e3a8a)'
              }}>
              <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </div>
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${
              (theme === 'oscuro_calido' || theme === 'oscuro_neutro')
                ? 'text-[#cbd5e1]' 
                : theme === 'sepia'
                  ? 'text-[#4a3525]'
                  : 'text-[#0a1628]'
            }`}>
              Mis notas · {comentarios.length}
            </p>
            <div className="flex-1 h-px" style={{
              background: (theme === 'oscuro_calido' || theme === 'oscuro_neutro')
                ? 'rgba(51, 65, 85, 0.6)'
                : theme === 'sepia'
                  ? 'rgba(235, 220, 185, 1)'
                  : 'rgba(226,232,240,1)'
            }}/>
          </div>

          <div className="space-y-3">
            {comentarios.map((ann, idx) => {
              const isActive = openCommentId === ann.id || hoveredCommentId === ann.id;
              
              let cardBg = 'rgba(248, 250, 252, 0.9)';
              let cardBorder = '1px solid rgba(226,232,240,1)';
              let borderLeftColor = isActive ? '#0a1628' : 'rgba(226,232,240,1)';
              let indexBg = isActive ? 'linear-gradient(135deg, #0a1628, #1e3a8a)' : '#6b8cba';
              let indexTextColor = 'text-white';
              let contentColor = 'text-[#0a1628]';
              
              if (theme === 'oscuro_calido') {
                cardBg = isActive ? 'rgba(36, 30, 25, 0.9)' : 'rgba(36, 30, 25, 0.5)';
                cardBorder = isActive ? '1px solid rgba(196, 160, 98, 0.4)' : '1px solid rgba(54, 46, 38, 0.6)';
                borderLeftColor = isActive ? '#c4a062' : 'rgba(54, 46, 38, 0.6)';
                indexBg = isActive ? 'linear-gradient(135deg, #c4a062, #8c6d3b)' : '#3d3025';
                indexTextColor = isActive ? 'text-[#1B1612]' : 'text-[#a89578]';
                contentColor = 'text-[#E8D5B0]';
              } else if (theme === 'oscuro_neutro') {
                cardBg = isActive ? 'rgba(30, 30, 30, 0.9)' : 'rgba(30, 30, 30, 0.5)';
                cardBorder = isActive ? '1px solid rgba(136, 136, 136, 0.4)' : '1px solid rgba(44, 44, 44, 0.6)';
                borderLeftColor = isActive ? '#888888' : 'rgba(44, 44, 44, 0.6)';
                indexBg = isActive ? 'linear-gradient(135deg, #888888, #555555)' : '#2c2c2c';
                indexTextColor = isActive ? 'text-white' : 'text-[#a0a0a0]';
                contentColor = 'text-[#D4D4D4]';
              } else if (theme === 'sepia') {
                cardBg = isActive ? 'rgba(92, 64, 21, 0.1)' : 'rgba(250, 246, 235, 0.9)';
                cardBorder = isActive ? '1px solid rgba(92, 64, 21, 0.35)' : '1px solid rgba(228, 220, 191, 1)';
                borderLeftColor = isActive ? '#5c4015' : 'rgba(228, 220, 191, 1)';
                indexBg = isActive ? 'linear-gradient(135deg, #5c4015, #80705a)' : '#e4dcbf';
                indexTextColor = isActive ? 'text-white' : 'text-[#3D2E1A]';
                contentColor = 'text-[#3D2E1A]';
              } else {
                cardBg = isActive ? 'rgba(30,58,138,0.05)' : 'rgba(248, 250, 252, 0.9)';
                cardBorder = isActive ? '1px solid rgba(10,22,40,0.25)' : '1px solid rgba(226,232,240,1)';
                borderLeftColor = isActive ? '#0a1628' : 'rgba(226,232,240,1)';
                indexBg = isActive ? 'linear-gradient(135deg, #0a1628, #1e3a8a)' : '#6b8cba';
                indexTextColor = 'text-white';
                contentColor = 'text-[#0a1628]';
              }

              return (
                <div
                  key={ann.id}
                  onMouseEnter={() => { if (!openCommentId) setHoveredCommentId(ann.id as string); }}
                  onMouseLeave={() => { if (!openCommentId) setHoveredCommentId(null); }}
                  className="group relative flex items-start gap-4 rounded-xl p-4 cursor-default transition-all duration-200"
                  style={{
                    background:  cardBg,
                    border:      cardBorder,
                    borderLeft:  `3px solid ${borderLeftColor}`,
                    transform:   isActive ? 'translateX(2px)' : 'translateX(0)',
                  }}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 transition-all duration-200 ${indexTextColor}`}
                    style={{
                      background: indexBg,
                      boxShadow:  isActive ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                    }}
                  >
                    {idx + 1}
                  </span>

                  <div className="flex-1 min-w-0">
                    <p className={`text-[9px] italic mb-1.5 line-clamp-1 ${
                      theme === 'oscuro_calido'
                        ? 'text-[#a89578]'
                        : theme === 'oscuro_neutro'
                          ? 'text-slate-400'
                          : theme === 'sepia'
                            ? 'text-amber-800/60'
                            : 'text-[#6b8cba]'
                    }`}>
                      &ldquo;{ann.textoSeleccionado.slice(0, 70)}{ann.textoSeleccionado.length > 70 ? '…' : ''}&rdquo;
                    </p>
                    <p className={`text-sm font-lora leading-relaxed ${contentColor}`}>
                      {ann.comentario}
                    </p>
                  </div>

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
    </>
  );
}

export default React.memo(AnnotatedContent);