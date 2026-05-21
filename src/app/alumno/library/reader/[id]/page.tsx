'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { AlumnoLibrosService } from '../../../../../service/alumno/libros.service';
import { LibroDetalle } from '../../../../../types/alumno/libros';
import { AlumnoService } from '../../../../../service/alumno/alumno.service';
import { PreferenciasAlumno } from '../../../../../types/alumno/alumno';
import { toast } from '../../../../../utils/toast';
import { useReadingTimer, getFinishMessage } from '../../../../../hooks/useReadingTimer';
import ReadingTimer from '../../../../../components/alumno/reader/ReadingTimer';
import { useAnnotations } from '../../../../../hooks/useAnnotations';
import AnnotationToolbar from '../../../../../components/alumno/reader/AnnotationToolbar';
import AnnotationSidebar from '../../../../../components/alumno/reader/AnnotationSidebar';
import AnnotatedContent from '../../../../../components/alumno/reader/AnnotatedContent';
import GlosarioTutorialModal from '../../../../../components/alumno/reader/GlosarioTutorialModal';
import EvaluacionPanel from '../../../../../components/alumno/reader/EvaluacionPanel';
import DiagnosticoModal from '../../../../../components/alumno/reader/DiagnosticoModal';
import { useAuth } from '../../../../../context/AuthContext';
import { useEvaluacion } from '../../../../../hooks/useEvaluacion';
import { EvaluacionService } from '../../../../../service/alumno/evaluacion.service';
import {
  DiagnosticoNecesarioResponse,
  DiagnosticoResultado,
} from '../../../../../types/alumno/evaluacion';

export default function ReaderPage() {
  const params       = useParams();
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { user }     = useAuth();

  const libroId      = Number(params.id);
  const initialSegId = searchParams.get('segmento') ? Number(searchParams.get('segmento')) : null;
  const alumnoId     = user?.id ?? 0;

  const [libro,       setLibro]       = useState<LibroDetalle | null>(null);
  const [currentIdx,  setCurrentIdx]  = useState(0);
  const [isLoading,   setIsLoading]   = useState(true);
  const [isSaving,    setIsSaving]    = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [maxUnlockedIdx, setMaxUnlockedIdx] = useState(0);
  const [preferencias, setPreferencias] = useState<PreferenciasAlumno | null>(null);

  // ── Diagnóstico ──────────────────────────────────────────────────────────
  const [diagnosticoPendiente, setDiagnosticoPendiente] = useState<DiagnosticoNecesarioResponse | null>(null);
  const [diagnosticoListo, setDiagnosticoListo] = useState(false);

  // ── Timer de segmento (del back) ─────────────────────────────────────────
  // tiempoMinimoSegundos vendrá de useEvaluacion una vez que se cargue la evaluación
  const [segmentTimeElapsed, setSegmentTimeElapsed] = useState(0);

  const timer = useReadingTimer(libroId);
  const startNotifiedRef    = useRef(false);
  const segmentsReadRef     = useRef(0);
  const fechaInicioRef      = useRef<string | null>(null);
  const segmentoInicioIdRef = useRef<number | null>(null);

  // ── Load book ─────────────────────────────────────────────────────────────
  const fetchLibro = useCallback(async () => {
    try {
      setIsLoading(true);
      const [data, misLibros, prefs] = await Promise.all([
        AlumnoLibrosService.getLibroDetalle(libroId),
        AlumnoLibrosService.getMisLibros(),
        AlumnoService.getPreferencias(),
      ]);

      setPreferencias(prefs);

      const libroProgreso = misLibros.find(l => l.libroId === libroId);
      if (libroProgreso) {
        data.progresoPorcentaje = libroProgreso.progresoPorcentaje;
        data.ultimoSegmentoId   = libroProgreso.ultimoSegmentoId;
      } else {
        data.progresoPorcentaje = 0;
      }

      setLibro(data);

      if (data.segmentos?.length > 0) {
        const targetId = initialSegId || data.ultimoSegmentoId;
        const idx      = data.segmentos.findIndex(s => s.id === targetId);
        const current  = idx >= 0 ? idx : 0;
        let calculatedMax = Math.round((data.progresoPorcentaje * data.segmentos.length) / 100) - 1;
        if (isNaN(calculatedMax) || calculatedMax < 0) calculatedMax = 0;
        if (calculatedMax > data.segmentos.length - 1) calculatedMax = data.segmentos.length - 1;

        setMaxUnlockedIdx(calculatedMax);
        setCurrentIdx(current > calculatedMax ? calculatedMax : current);
      }

      // Verificar diagnóstico inicial
      try {
        const diagnostico = await EvaluacionService.checkDiagnostico(libroId);
        if (diagnostico.necesitaDiagnostico) {
          setDiagnosticoPendiente(diagnostico as DiagnosticoNecesarioResponse);
        } else {
          setDiagnosticoListo(true);
        }
      } catch {
        // Si el check falla, permitir continuar sin diagnóstico
        setDiagnosticoListo(true);
      }
    } catch {
      toast.error('No pudimos cargar el libro. Intenta de nuevo.');
      router.push('/alumno/library');
    } finally {
      setIsLoading(false);
    }
  }, [libroId, initialSegId, router]);

  useEffect(() => { fetchLibro(); }, [fetchLibro]);

  useEffect(() => {
    if (!isLoading && libro && !startNotifiedRef.current && diagnosticoListo) {
      startNotifiedRef.current  = true;
      segmentsReadRef.current   = 0;
      fechaInicioRef.current    = new Date().toISOString();
      segmentoInicioIdRef.current = libro.segmentos?.[currentIdx]?.id ?? null;
      toast.info(`¡Comenzando "${libro.titulo}"! Que disfrutes la lectura 📖`, 4000);
    }
  }, [isLoading, libro, currentIdx, diagnosticoListo]);

  const totalSegments  = libro?.segmentos?.length ?? 0;
  const currentSegment = libro?.segmentos?.[currentIdx] ?? null;

  // ── Evaluación por segmento ───────────────────────────────────────────────
  const evaluacion = useEvaluacion({
    libroId,
    segmentoId: currentSegment?.id ?? 0,
  });

  // tiempoMinimoSegundos viene del back a través de useEvaluacion
  const tiempoMinimoSegundos = evaluacion.tiempoMinimoSegundos;

  const progressPercent = useMemo(() => {
    if (!totalSegments) return 0;
    return Math.round(((currentIdx + 1) / totalSegments) * 100);
  }, [currentIdx, totalSegments]);

  // ── Anotaciones ───────────────────────────────────────────────────────────
  const annotations = useAnnotations({
    alumnoId,
    libroId,
    segmentoId: currentSegment?.id ?? 0,
  });

  const clearSelection      = annotations.clearSelection;
  const handleTextSelection = annotations.handleTextSelection;

  useEffect(() => { clearSelection(); }, [currentIdx, clearSelection]);

  const handleMouseUp = useCallback(() => {
    if (!currentSegment?.contenido) return;
    handleTextSelection(currentSegment.contenido);
  }, [currentSegment, handleTextSelection]);

  const cursorStyle = useMemo(() => {
    if (!annotations.activeTool) return {};
    return { cursor: 'crosshair' };
  }, [annotations.activeTool]);

  // ── Timer de segmento — se resetea al cambiar de segmento ─────────────────
  useEffect(() => {
    if (!currentSegment) return;
    const saved = sessionStorage.getItem(`segment_time_${currentSegment.id}`);
    setSegmentTimeElapsed(saved ? parseInt(saved, 10) : 0);
  }, [currentIdx, currentSegment]);

  useEffect(() => {
    if (currentSegment) {
      sessionStorage.setItem(`segment_time_${currentSegment.id}`, segmentTimeElapsed.toString());
    }
  }, [segmentTimeElapsed, currentSegment]);

  // Solo contar tiempo cuando estamos en la frontera y no hemos cumplido el mínimo
  useEffect(() => {
    if (currentIdx !== maxUnlockedIdx) return;
    if (tiempoMinimoSegundos <= 0) return; // si el back no mandó tiempo, no bloquear
    if (segmentTimeElapsed >= tiempoMinimoSegundos) return;

    const handleTick = () => {
      if (!document.hidden) {
        setSegmentTimeElapsed(prev => prev + 1);
      }
    };

    const interval = setInterval(handleTick, 1000);
    return () => clearInterval(interval);
  }, [currentIdx, maxUnlockedIdx, segmentTimeElapsed, tiempoMinimoSegundos]);

  const isFrontier = currentIdx === maxUnlockedIdx;
  // isWaiting: solo si tiempoMinimoSegundos > 0 y no se ha cumplido
  const isWaiting  = isFrontier && tiempoMinimoSegundos > 0 && segmentTimeElapsed < tiempoMinimoSegundos;
  const waitTime   = tiempoMinimoSegundos - segmentTimeElapsed;

  // Auto-cargar evaluación cuando el timer termina en el segmento frontera
  useEffect(() => {
    const esFronteraCompleta =
      isFrontier &&
      !isWaiting &&
      currentIdx < totalSegments - 1 &&
      evaluacion.estado === 'sin_evaluacion';

    if (esFronteraCompleta) {
      evaluacion.cargarEvaluacion();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFrontier, isWaiting, currentIdx, totalSegments, evaluacion.estado]);

  // ── Progreso ──────────────────────────────────────────────────────────────
  const saveProgress = useCallback(async (segId: number, idx: number, maxIdx: number) => {
    if (!libro) return;
    try {
      setIsSaving(true);
      const pct = Math.round(((maxIdx + 1) / totalSegments) * 100);
      await AlumnoLibrosService.updateProgreso(libroId, { ultimoSegmentoId: segId, porcentaje: pct });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  }, [libro, libroId, totalSegments]);

  const handleNext = useCallback(() => {
    if (!isWaiting && currentIdx < totalSegments - 1) {
      if (isFrontier && !evaluacion.puedeAvanzar) {
        if (evaluacion.estado === 'pendiente' || evaluacion.estado === 'refuerzo') {
          evaluacion.abrirPanel();
        }
        return;
      }

      const next   = currentIdx + 1;
      let newMax   = maxUnlockedIdx;
      if (currentIdx === maxUnlockedIdx) {
        newMax = next;
        setMaxUnlockedIdx(newMax);
      }

      setCurrentIdx(next);
      segmentsReadRef.current += 1;
      const seg = libro?.segmentos[next];
      if (seg) saveProgress(seg.id, next, newMax);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentIdx, totalSegments, libro, saveProgress, isWaiting, maxUnlockedIdx, isFrontier, evaluacion]);

  const handlePrev = useCallback(() => {
    if (currentIdx > 0) {
      const prev = currentIdx - 1;
      setCurrentIdx(prev);
      const seg = libro?.segmentos[prev];
      if (seg) saveProgress(seg.id, prev, maxUnlockedIdx);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentIdx, libro, saveProgress, maxUnlockedIdx]);

  const handleExit = useCallback(() => {
    const totalSeconds = timer.stop();
    if (fechaInicioRef.current && segmentoInicioIdRef.current) {
      AlumnoLibrosService.registrarSesion(libroId, {
        duracionSegundos: totalSeconds,
        segmentosLeidos: segmentsReadRef.current + 1,
        segmentoInicioId: segmentoInicioIdRef.current,
        segmentoFinId: currentSegment?.id ?? segmentoInicioIdRef.current,
        fechaInicio: fechaInicioRef.current,
        fechaFin: new Date().toISOString(),
      }).catch(e => console.error('Error guardando sesión:', e));
    }
    if (totalSeconds > 5) {
      const totalRead = segmentsReadRef.current + 1;
      toast.success(getFinishMessage(totalSeconds, totalRead), 6000);
    }
    router.push('/alumno/library');
  }, [timer, router, libroId, currentSegment]);

  const selectSegment = useCallback((idx: number) => {
    if (idx > maxUnlockedIdx) return;
    setShowSidebar(false);
    setCurrentIdx(idx);
    const seg = libro?.segmentos[idx];
    if (seg) saveProgress(seg.id, idx, maxUnlockedIdx);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [libro, saveProgress, maxUnlockedIdx]);

  const toolbarSelection = useMemo(() => {
    if (!annotations.selection) return null;
    if (annotations.activeTool && annotations.activeTool !== 'comentario') return null;
    return annotations.selection;
  }, [annotations.selection, annotations.activeTool]);

  // ── Handler diagnóstico completado ────────────────────────────────────────
  const handleDiagnosticoComplete = useCallback((resultado: DiagnosticoResultado) => {
    setDiagnosticoPendiente(null);
    setDiagnosticoListo(true);
    toast.success(`Nivel asignado: ${resultado.nivelAsignado}. ¡Comienza tu lectura! 📚`, 4000);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#fbf8f1] flex flex-col items-center justify-center z-200">
        <div className="w-16 h-16 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-playfair text-xl text-[#2b1b17] animate-pulse">Abriendo el libro...</p>
      </div>
    );
  }
  if (!libro || !currentSegment) return null;

  const totalAnotaciones = annotations.getPayloadParaBack().length;

  return (
    <div className="min-h-screen bg-[#fbf8f1] flex flex-col font-lora text-[#2b1b17]">
      {/* ── Diagnóstico modal (bloquea la lectura hasta completarse) ── */}
      {diagnosticoPendiente && (
        <DiagnosticoModal
          libroId={libroId}
          preguntas={diagnosticoPendiente.preguntas}
          onComplete={handleDiagnosticoComplete}
        />
      )}

      {preferencias && (
        <GlosarioTutorialModal
          hideTutorial={preferencias.ocultarTutorialLector}
          onClose={(hideNextTime) => {
            if (hideNextTime) {
              AlumnoService.updatePreferencias({ ocultarTutorialLector: true }).catch(console.error);
              setPreferencias(p => p ? { ...p, ocultarTutorialLector: true } : p);
            }
          }}
        />
      )}

      <EvaluacionPanel ev={evaluacion} tituloSegmento={currentSegment.titulo} onContinuar={handleNext} />

      {/* Toolbar de anotaciones */}
      <AnnotationToolbar
        selection={toolbarSelection}
        pendingType={annotations.pendingType}
        setPendingType={annotations.setPendingType}
        commentDraft={annotations.commentDraft}
        setCommentDraft={annotations.setCommentDraft}
        onHighlight={annotations.addHighlight}
        onComentario={annotations.addComentario}
        onClear={annotations.clearSelection}
      />

      <AnnotationSidebar
        activeTool={annotations.activeTool}
        onToggle={annotations.toggleTool}
      />

      {/* Header */}
      <header className="sticky top-0 z-110 bg-white/80 backdrop-blur-md border-b border-[#e3dac9] px-3 md:px-8 py-3 flex items-center justify-between shadow-sm gap-2">
        <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
          <button onClick={handleExit}
            className="p-2 hover:bg-[#fbf8f1] rounded-full transition-colors group shrink-0" title="Volver">
            <svg className="w-5 h-5 md:w-6 md:h-6 text-[#8d6e3f] group-hover:text-[#2b1b17]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="font-playfair font-bold text-sm md:text-xl truncate">{libro.titulo}</h1>
            <p className="text-[9px] md:text-[10px] font-black text-[#d4af37] uppercase tracking-widest truncate">
              {currentSegment.unidadNombre || 'Contenido'} &bull; {currentIdx + 1} de {totalSegments}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-[10px] font-black text-[#a1887f]">PROGRESO</span>
            <div className="w-32 h-1.5 bg-[#f0e6d2] rounded-full overflow-hidden mt-1">
              <div className="h-full bg-[#d4af37] transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
          <ReadingTimer formattedTime={timer.formattedTime} isRunning={timer.isRunning} />

          {totalAnotaciones > 0 && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fbf8f1] border border-[#e3dac9]">
              <span className="text-xs">🖍</span>
              <span className="text-[10px] font-black text-[#8d6e3f] uppercase tracking-widest">{totalAnotaciones}</span>
            </div>
          )}

          <div className="hidden md:block w-px h-6 bg-[#e3dac9]" />
          <button
            onClick={handleExit}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg border border-[#e3dac9] text-[#8d6e3f] text-xs font-bold uppercase tracking-widest hover:border-[#d4af37] hover:text-[#2b1b17] transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Finalizar
          </button>
          <button onClick={() => setShowSidebar(true)}
            className="p-2 bg-[#2b1b17] text-white rounded-lg hover:bg-[#3e2723] transition-all shadow-md flex items-center gap-1.5 px-3">
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="hidden md:inline text-xs font-bold uppercase tracking-widest">Capítulos</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 md:px-8 py-8 md:py-20 relative" style={cursorStyle}>
        <div className="pointer-events-none absolute top-0 left-0 w-24 h-24 border-l-2 border-t-2 border-[#d4af37]/20 -translate-x-4 -translate-y-4" />
        <div className="pointer-events-none absolute top-0 right-0 w-24 h-24 border-r-2 border-t-2 border-[#d4af37]/20 translate-x-4 -translate-y-4" />

        <article className="prose prose-stone prose-lg max-w-none">
          <div className="text-center mb-16">
            <span className="inline-block w-12 h-0.5 bg-[#d4af37] mb-6" />
            <h2 className="font-playfair italic text-3xl md:text-4xl text-[#8d6e3f] mb-4">{currentSegment.titulo}</h2>
            {currentSegment.numeroPagina && (
              <p className="text-[#a1887f] text-sm">Página {currentSegment.numeroPagina}</p>
            )}
          </div>

          {currentSegment.contenido ? (
            <AnnotatedContent
              contenido={currentSegment.contenido}
              anotaciones={annotations.anotacionesDelSegmento}
              onRemove={annotations.removeAnotacion}
              onMouseUp={handleMouseUp}
              onAddComentario={(ann, texto) => {
                annotations.addComentarioDirect(
                  ann.textoSeleccionado,
                  ann.offsetInicio,
                  ann.offsetFin,
                  texto,
                );
              }}
            />
          ) : (
            <p className="text-[#a1887f] italic text-center">Este segmento no tiene contenido.</p>
          )}
        </article>

        {/* Navigation */}
        <div className="mt-20 pt-8 border-t border-[#e3dac9] flex items-center justify-between">
          <button onClick={handlePrev} disabled={currentIdx === 0}
            className="flex items-center gap-3 px-6 py-3 rounded-xl border border-[#e3dac9] text-[#8d6e3f] font-bold hover:bg-white hover:text-[#2b1b17] disabled:opacity-30 disabled:pointer-events-none transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Anterior
          </button>

          <span className="text-xs font-black text-[#a1887f] uppercase tracking-widest">
            {currentIdx + 1} / {totalSegments}
          </span>

          {/* Botón Siguiente — dinámico */}
          {(() => {
            if (!isFrontier) {
              return (
                <button onClick={handleNext} disabled={currentIdx === totalSegments - 1}
                  className="flex items-center gap-3 px-10 py-3 rounded-xl bg-[#2b1b17] text-white font-bold hover:bg-[#3e2723] hover:-translate-y-0.5 transition-all shadow-lg active:translate-y-0 disabled:opacity-40 disabled:pointer-events-none">
                  Siguiente
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              );
            }
            if (currentIdx === totalSegments - 1) {
              return (
                <button disabled className="flex items-center gap-3 px-10 py-3 rounded-xl bg-[#2b1b17] text-white font-bold opacity-40 pointer-events-none">
                  Fin
                </button>
              );
            }
            if (isWaiting) {
              return (
                <button disabled className="flex items-center gap-3 px-10 py-3 rounded-xl bg-[#2b1b17] text-white font-bold opacity-40 pointer-events-none">
                  Leyendo... {waitTime}s
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              );
            }
            if (evaluacion.estado === 'cargando') {
              return (
                <button disabled className="flex items-center gap-3 px-10 py-3 rounded-xl bg-[#2b1b17] text-white font-bold opacity-60 pointer-events-none">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Evaluando...
                </button>
              );
            }
            if (evaluacion.estado === 'pendiente') {
              return (
                <button onClick={() => evaluacion.abrirPanel()}
                  className="flex items-center gap-3 px-7 py-3 rounded-xl bg-[#d4af37] text-[#2b1b17] font-bold hover:bg-[#c19b2f] hover:-translate-y-0.5 transition-all shadow-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Responder ({evaluacion.evaluacion?.preguntas.length ?? 0})
                </button>
              );
            }
            if (evaluacion.estado === 'refuerzo') {
              return (
                <button onClick={() => evaluacion.abrirPanel()}
                  className="flex items-center gap-3 px-7 py-3 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 hover:-translate-y-0.5 transition-all shadow-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reintentar
                </button>
              );
            }
            return (
              <button onClick={handleNext}
                className={`flex items-center gap-3 px-10 py-3 rounded-xl font-bold hover:-translate-y-0.5 transition-all shadow-lg ${
                  evaluacion.estado === 'aprobado'
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-[#2b1b17] text-white hover:bg-[#3e2723]'
                }`}>
                {evaluacion.estado === 'aprobado' && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" />
                  </svg>
                )}
                Siguiente
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            );
          })()}
        </div>
      </main>

      {/* Sidebar capítulos */}
      <div className={`fixed inset-0 z-150 transition-opacity duration-300 ${showSidebar ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setShowSidebar(false)}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <aside className={`absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${showSidebar ? 'translate-x-0' : 'translate-x-full'}`}
          onClick={e => e.stopPropagation()}>
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-playfair font-bold text-xl text-[#2b1b17]">Capítulos</h3>
            <button onClick={() => setShowSidebar(false)} className="p-2 hover:bg-gray-100 rounded-full">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {libro.segmentos.map((seg, idx) => {
              const isActive = idx === currentIdx;
              const isLocked = idx > maxUnlockedIdx;
              const segAnns  = annotations.getPayloadParaBack().filter(a => a.segmentoId === seg.id);
              return (
                <button key={seg.id} onClick={() => selectSegment(idx)}
                  disabled={isLocked}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 ${isActive ? 'bg-[#fbf8f1] border-[#d4af37] shadow-sm' : isLocked ? 'opacity-40 cursor-not-allowed grayscale' : 'border-transparent hover:bg-gray-50'}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${isActive ? 'bg-[#2b1b17] text-white' : isLocked ? 'bg-gray-200 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                    {isLocked ? (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    ) : (idx + 1)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${isActive ? 'text-[#2b1b17]' : 'text-gray-600'}`}>{seg.titulo}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-tighter">{seg.unidadNombre || 'Sección'}</p>
                  </div>
                  {segAnns.length > 0 && (
                    <span className="text-[9px] font-black text-[#d4af37] bg-[#fbf8f1] border border-[#e3dac9] rounded-full px-1.5 py-0.5 shrink-0">
                      {segAnns.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </aside>
      </div>

      {isSaving && (
        <div className="fixed bottom-8 right-8 z-200 bg-white/90 backdrop-blur-sm border border-[#e3dac9] px-4 py-2 rounded-full shadow-lg flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
          <span className="text-[10px] font-black text-[#8d6e3f] uppercase tracking-widest">Sincronizando...</span>
        </div>
      )}
    </div>
  );
}