'use client';

import { useState, useCallback, useEffect } from 'react';
import { AlumnoLibrosService } from '../service/alumno/libros.service';
import { AnotacionResponse, AnotacionPayload } from '../types/alumno/libros';

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type AnnotationType  = 'highlight' | 'comentario';
export type HighlightColor  = 'amarillo' | 'verde' | 'rosa' | 'azul';

// Herramienta activa: un color de highlight, 'comentario', o null (ninguna)
export type ActiveTool = HighlightColor | 'comentario' | null;

export interface Anotacion {
    id:                string | number;
    alumnoId:          number | string;
    libroId:           number;
    segmentoId:        number;
    tipo:              AnnotationType;
    textoSeleccionado: string;
    offsetInicio:      number;
    offsetFin:         number;
    color:             HighlightColor | null;
    comentario:        string | null;
    creadoEn:          string;
}

export interface SelectionState {
    text:         string;
    offsetInicio: number;
    offsetFin:    number;
    rect:         DOMRect;
}

// ── Colores ───────────────────────────────────────────────────────────────────

export const HIGHLIGHT_COLORS: Record<HighlightColor, string> = {
    amarillo: 'rgba(255, 236, 66, 0.45)',
    verde:    'rgba(134, 239, 172, 0.45)',
    rosa:     'rgba(249, 168, 212, 0.45)',
    azul:     'rgba(147, 197, 253, 0.45)',
};

export const HIGHLIGHT_BORDER: Record<HighlightColor, string> = {
    amarillo: 'rgba(202, 138, 4, 0.6)',
    verde:    'rgba(22, 163, 74, 0.6)',
    rosa:     'rgba(219, 39, 119, 0.6)',
    azul:     'rgba(37, 99, 235, 0.6)',
};

export const HIGHLIGHT_SOLID: Record<HighlightColor, string> = {
    amarillo: '#f59e0b',
    verde:    '#16a34a',
    rosa:     '#db2777',
    azul:     '#2563eb',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateTempId(): string {
    return `temp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
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

function getTextOffsetInElement(
    target:       Node,
    offsetInNode: number,
    root:         Element,
): number {
    const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode(node: Node) {
                let el = node.parentElement;
                while (el && el !== root) {
                    if (el.getAttribute('data-annotation-ignore') === 'true') {
                        return NodeFilter.FILTER_REJECT;
                    }
                    el = el.parentElement;
                }
                return NodeFilter.FILTER_ACCEPT;
            },
        },
    );

    let total = 0;
    let node  = walker.nextNode();
    while (node) {
        if (node === target) return total + offsetInNode;
        total += node.textContent?.length ?? 0;
        node = walker.nextNode();
    }
    return total;
}

function buildParaOffsets(contenido: string): number[] {
    const parrafos = contenido.split('\n');
    const offsets: number[] = [];
    let acc = 0;
    for (const p of parrafos) {
        offsets.push(acc);
        acc += p.length + 1;
    }
    return offsets;
}

export function getSelectionOffsets(
    selection: Selection,
    contenido:  string,
    contenidoHtml?: string,
): { offsetInicio: number; offsetFin: number } | null {
    if (!selection || selection.rangeCount === 0) return null;
    const range = selection.getRangeAt(0);
    if (range.collapsed) return null;

    if (contenidoHtml) {
        const startNode = range.startContainer;
        const container = (
            startNode.nodeType === Node.TEXT_NODE
                ? startNode.parentElement
                : startNode as Element
        )?.closest('.segmento-contenido') as Element | null;

        if (!container) return null;

        const offsetDentroInicio = getTextOffsetInElement(range.startContainer, range.startOffset, container);
        const offsetDentroFin    = getTextOffsetInElement(range.endContainer,   range.endOffset,   container);

        const htmlText = container.textContent || '';
        const selectedText = selection.toString();

        const targetContenidoIndex = offsetDentroInicio * (contenido.length / (htmlText.length || 1));
        const offsetInicio = findClosestSubstring(contenido, selectedText, targetContenidoIndex);
        
        if (offsetInicio === -1) return null;
        
        const offsetFin = offsetInicio + selectedText.length;
        return { offsetInicio, offsetFin };
    }

    const paraOffsets = buildParaOffsets(contenido);
    const startNode   = range.startContainer;
    const endNode     = range.endContainer;

    const startParaEl = (
        startNode.nodeType === Node.TEXT_NODE
            ? startNode.parentElement
            : startNode as Element
    )?.closest('[data-para-index]') as Element | null;

    const endParaEl = (
        endNode.nodeType === Node.TEXT_NODE
            ? endNode.parentElement
            : endNode as Element
    )?.closest('[data-para-index]') as Element | null;

    if (!startParaEl || !endParaEl) return null;

    const startParaIdx = parseInt(startParaEl.getAttribute('data-para-index') ?? '0', 10);
    const endParaIdx   = parseInt(endParaEl.getAttribute('data-para-index') ?? '0', 10);

    const offsetDentroInicio = getTextOffsetInElement(range.startContainer, range.startOffset, startParaEl);
    const offsetDentroFin    = getTextOffsetInElement(range.endContainer,   range.endOffset,   endParaEl);

    const offsetInicio = (paraOffsets[startParaIdx] ?? 0) + offsetDentroInicio;
    const offsetFin    = (paraOffsets[endParaIdx]   ?? 0) + offsetDentroFin;

    if (offsetInicio >= offsetFin) return null;
    return { offsetInicio, offsetFin };
}

// ── Hook ──────────────────────────────────────────────────────────────────────

interface UseAnnotationsOptions {
    alumnoId:   number | string;
    libroId:    number;
    segmentoId: number;
}

export function useAnnotations({ alumnoId, libroId, segmentoId }: UseAnnotationsOptions) {
    const [todas,        setTodas]        = useState<Anotacion[]>([]);
    const [selection,    setSelection]    = useState<SelectionState | null>(null);
    const [pendingType,  setPendingType]  = useState<AnnotationType | null>(null);
    const [commentDraft, setCommentDraft] = useState('');
    const [activeTool,   setActiveTool]   = useState<ActiveTool>(null);

    // Cargar anotaciones desde la API
    useEffect(() => {
        let mounted = true;
        AlumnoLibrosService.getAnotaciones(libroId)
            .then(res => {
                if (mounted) {
                    setTodas(res as Anotacion[]);
                }
            })
            .catch(console.error);
        return () => { mounted = false; };
    }, [libroId]);

    const anotacionesDelSegmento = todas.filter(a => String(a.segmentoId) === String(segmentoId));

    const toggleTool = useCallback((tool: ActiveTool) => {
        setActiveTool(prev => prev === tool ? null : tool);
        setSelection(null);
        setPendingType(null);
    }, []);

    // ── Lógica Optimista ──────────────────────────────────────────────────────

    const applyOptimisticAdd = useCallback((payload: AnotacionPayload) => {
        const tempId = generateTempId();
        const optimista: Anotacion = {
            id: tempId,
            alumnoId,
            libroId,
            ...payload,
            creadoEn: new Date().toISOString()
        };

        setTodas(prev => [...prev, optimista]);

        AlumnoLibrosService.crearAnotacion(libroId, payload)
            .then(res => {
                setTodas(prev => prev.map(a => a.id === tempId ? (res as Anotacion) : a));
            })
            .catch(e => {
                console.error('Error guardando anotación:', e);
                setTodas(prev => prev.filter(a => a.id !== tempId));
            });
    }, [alumnoId, libroId]);

    // ── Capturar selección ────────────────────────────────────────────────────

    const handleTextSelection = useCallback((contenido: string, contenidoHtml?: string) => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || !sel.toString().trim()) {
            setSelection(null);
            return;
        }
        const offsets = getSelectionOffsets(sel, contenido, contenidoHtml);
        if (!offsets) { setSelection(null); return; }

        const rect = sel.getRangeAt(0).getBoundingClientRect();
        const state: SelectionState = {
            text:         sel.toString(),
            offsetInicio: offsets.offsetInicio,
            offsetFin:    offsets.offsetFin,
            rect,
        };

        if (activeTool !== null) {
            if (activeTool === 'comentario') {
                setSelection(state);
                setPendingType('comentario');
            } else {
                applyOptimisticAdd({
                    segmentoId,
                    tipo: 'highlight',
                    textoSeleccionado: state.text,
                    offsetInicio: state.offsetInicio,
                    offsetFin: state.offsetFin,
                    color: activeTool,
                    comentario: null
                });
                window.getSelection()?.removeAllRanges();
            }
            return;
        }

        setSelection(state);
        setPendingType(null);
    }, [activeTool, segmentoId, applyOptimisticAdd]);

    const clearSelection = useCallback(() => {
        setSelection(null);
        setPendingType(null);
        setCommentDraft('');
        window.getSelection()?.removeAllRanges();
    }, []);

    const addHighlight = useCallback((color: HighlightColor) => {
        if (!selection) return;
        applyOptimisticAdd({
            segmentoId,
            tipo: 'highlight',
            textoSeleccionado: selection.text,
            offsetInicio: selection.offsetInicio,
            offsetFin: selection.offsetFin,
            color,
            comentario: null
        });
        clearSelection();
    }, [selection, segmentoId, applyOptimisticAdd, clearSelection]);

    const addComentario = useCallback((texto: string) => {
        if (!selection || !texto.trim()) return;
        applyOptimisticAdd({
            segmentoId,
            tipo: 'comentario',
            textoSeleccionado: selection.text,
            offsetInicio: selection.offsetInicio,
            offsetFin: selection.offsetFin,
            color: null,
            comentario: texto.trim()
        });
        clearSelection();
        setCommentDraft('');
    }, [selection, segmentoId, applyOptimisticAdd, clearSelection]);

    const addComentarioDirect = useCallback((textoSeleccionado: string, offsetInicio: number, offsetFin: number, comentario: string) => {
        if (!comentario.trim()) return;
        applyOptimisticAdd({
            segmentoId,
            tipo: 'comentario',
            textoSeleccionado,
            offsetInicio,
            offsetFin,
            color: null,
            comentario: comentario.trim()
        });
    }, [segmentoId, applyOptimisticAdd]);

    const removeAnotacion = useCallback((id: string | number) => {
        const toDelete = todas.find(a => a.id === id);
        setTodas(prev => prev.filter(a => a.id !== id));

        if (typeof id === 'string' && id.startsWith('temp_')) return;

        AlumnoLibrosService.eliminarAnotacion(libroId, id)
            .catch(e => {
                console.error('Error eliminando anotación:', e);
                if (toDelete) setTodas(prev => [...prev, toDelete]);
            });
    }, [todas, libroId]);

    const getPayloadParaBack = useCallback(() => todas, [todas]);

    return {
        anotacionesDelSegmento,
        selection, pendingType, setPendingType,
        commentDraft, setCommentDraft,
        activeTool, toggleTool,
        handleTextSelection, clearSelection,
        addHighlight, addComentario, addComentarioDirect, removeAnotacion,
        getPayloadParaBack,
    };
}