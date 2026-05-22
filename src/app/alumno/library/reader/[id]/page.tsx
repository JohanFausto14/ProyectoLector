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

const themeConfig = {
  normal: {
    wrapperBg: 'bg-[#f8fafc]',
    cardBg: 'bg-white',
    cardBorder: 'border-[#e2e8f0]',
    textColor: 'text-[#0a1628]',
    titleColor: 'text-[#1e3a6e]',
    subtitleColor: 'text-[#6b8cba]',
    dividerBg: 'bg-[#d4af37]',
    navBorder: 'border-[#c8d8f0]',
    navButtonBg: 'bg-[#0a1628]',
    navButtonText: 'text-white',
    navButtonHover: 'hover:bg-[#1e3a6e]',
    prevButtonHover: 'hover:bg-white hover:text-[#0a1628]',
    prevButtonText: 'text-[#1e3a6e]',
    headerBg: 'bg-white/80 border-[#e2e8f0]',
    headerTitle: 'text-[#0a1628]',
    headerSub: 'text-[#d4af37]',
    headerProgressLabel: 'text-[#6b8cba]',
    headerProgressBg: 'bg-[#f1f5f9] border-[#94a3b8]',
    headerProgressFill: 'from-[#3b82f6] to-[#1d4ed8]',
    headerBtnBorder: 'border-[#c8d8f0] text-[#1e3a6e] hover:border-[#d4af37] hover:text-[#0a1628]',
    headerBtnIcon: 'text-[#1e3a6e] group-hover:text-[#0a1628]',
    headerIconBtnHover: 'hover:bg-slate-200/60',
    headerChaptersBtn: 'bg-[#0a1628] text-white hover:bg-[#1e3a6e]',
    sidebarBg: 'bg-white',
    sidebarBorder: 'border-gray-100',
    sidebarTitle: 'text-[#0a1628]',
    sidebarText: 'text-gray-600',
    sidebarItemActive: 'bg-[#f5f8ff] border-[#d4af37]',
    sidebarItemHover: 'hover:bg-gray-50',
  },
  sepia: {
    wrapperBg: 'bg-[#F5F0E8]',
    cardBg: 'bg-[#faf6eb]',
    cardBorder: 'border-[#e4dcbf]',
    textColor: 'text-[#3D2E1A]',
    titleColor: 'text-[#5c4015]',
    subtitleColor: 'text-[#80705a]',
    dividerBg: 'bg-[#c59e3a]',
    navBorder: 'border-[#e4dcbf]',
    navButtonBg: 'bg-[#5c4015]',
    navButtonText: 'text-[#faf6eb]',
    navButtonHover: 'hover:bg-[#452e0e]',
    prevButtonHover: 'hover:bg-[#faf6eb] hover:text-[#3D2E1A]',
    prevButtonText: 'text-[#5c4015]',
    headerBg: 'bg-[#faf6eb]/80 border-[#e4dcbf]',
    headerTitle: 'text-[#3D2E1A]',
    headerSub: 'text-[#c59e3a]',
    headerProgressLabel: 'text-[#80705a]',
    headerProgressBg: 'bg-[#f0e6d2] border-[#bda87f]',
    headerProgressFill: 'from-[#d97706] to-[#b45309]',
    headerBtnBorder: 'border-[#e4dcbf] text-[#5c4015] hover:border-[#c59e3a] hover:text-[#3D2E1A]',
    headerBtnIcon: 'text-[#5c4015] group-hover:text-[#3D2E1A]',
    headerIconBtnHover: 'hover:bg-[#e4dcbf]',
    headerChaptersBtn: 'bg-[#5c4015] text-[#faf6eb] hover:bg-[#452e0e]',
    sidebarBg: 'bg-[#faf6eb]',
    sidebarBorder: 'border-[#e4dcbf]',
    sidebarTitle: 'text-[#3D2E1A]',
    sidebarText: 'text-[#80705a]',
    sidebarItemActive: 'bg-[#F5F0E8] border-[#c59e3a]',
    sidebarItemHover: 'hover:bg-[#F5F0E8]/60',
  },
  oscuro_calido: {
    wrapperBg: 'bg-[#1B1612]',
    cardBg: 'bg-[#241e19]',
    cardBorder: 'border-[#362e26]',
    textColor: 'text-[#E8D5B0]',
    titleColor: 'text-[#f5e6cc]',
    subtitleColor: 'text-[#a89578]',
    dividerBg: 'bg-[#c4a062]',
    navBorder: 'border-[#362e26]',
    navButtonBg: 'bg-[#3d3025]',
    navButtonText: 'text-[#f5e6cc]',
    navButtonHover: 'hover:bg-[#524132]',
    prevButtonHover: 'hover:bg-[#3d3025] hover:text-white',
    prevButtonText: 'text-[#E8D5B0]',
    headerBg: 'bg-[#241e19]/85 border-[#362e26]',
    headerTitle: 'text-[#f5e6cc]',
    headerSub: 'text-[#c4a062]',
    headerProgressLabel: 'text-[#a89578]',
    headerProgressBg: 'bg-[#16120f] border-[#524132]',
    headerProgressFill: 'from-[#c4a062] to-[#8c6d3b]',
    headerBtnBorder: 'border-[#362e26] text-[#E8D5B0] hover:border-[#c4a062] hover:text-white',
    headerBtnIcon: 'text-[#E8D5B0] group-hover:text-white',
    headerIconBtnHover: 'hover:bg-[#362e26]',
    headerChaptersBtn: 'bg-[#3d3025] text-[#f5e6cc] hover:bg-[#524132]',
    sidebarBg: 'bg-[#241e19]',
    sidebarBorder: 'border-[#362e26]',
    sidebarTitle: 'text-[#f5e6cc]',
    sidebarText: 'text-[#a89578]',
    sidebarItemActive: 'bg-[#1B1612] border-[#c4a062]',
    sidebarItemHover: 'hover:bg-[#1B1612]/60',
  },
  oscuro_neutro: {
    wrapperBg: 'bg-[#121212]',
    cardBg: 'bg-[#1e1e1e]',
    cardBorder: 'border-[#2c2c2c]',
    textColor: 'text-[#D4D4D4]',
    titleColor: 'text-[#e0e0e0]',
    subtitleColor: 'text-[#a0a0a0]',
    dividerBg: 'bg-[#888888]',
    navBorder: 'border-[#2c2c2c]',
    navButtonBg: 'bg-[#2c2c2c]',
    navButtonText: 'text-[#e0e0e0]',
    navButtonHover: 'hover:bg-[#3d3d3d]',
    prevButtonHover: 'hover:bg-[#2c2c2c] hover:text-white',
    prevButtonText: 'text-[#D4D4D4]',
    headerBg: 'bg-[#1e1e1e]/85 border-[#2c2c2c]',
    headerTitle: 'text-[#e0e0e0]',
    headerSub: 'text-[#888888]',
    headerProgressLabel: 'text-[#a0a0a0]',
    headerProgressBg: 'bg-[#0a0a0a] border-[#444444]',
    headerProgressFill: 'from-[#777777] to-[#555555]',
    headerBtnBorder: 'border-[#2c2c2c] text-[#D4D4D4] hover:border-[#888888] hover:text-white',
    headerBtnIcon: 'text-[#D4D4D4] group-hover:text-white',
    headerIconBtnHover: 'hover:bg-[#2c2c2c]',
    headerChaptersBtn: 'bg-[#2c2c2c] text-[#e0e0e0] hover:bg-[#3d3d3d]',
    sidebarBg: 'bg-[#1e1e1e]',
    sidebarBorder: 'border-[#2c2c2c]',
    sidebarTitle: 'text-[#e0e0e0]',
    sidebarText: 'text-[#a0a0a0]',
    sidebarItemActive: 'bg-[#121212] border-[#888888]',
    sidebarItemHover: 'hover:bg-[#121212]/60',
  }
};

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

  // ── Filtro de lectura (Temas y Brillo) ──────────────────────────────────
  const [theme, setTheme] = useState<'normal' | 'sepia' | 'oscuro_calido' | 'oscuro_neutro'>('normal');
  const [brightness, setBrightness] = useState<number>(1.0);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('reader-theme');
      if (saved === 'normal' || saved === 'sepia' || saved === 'oscuro_calido' || saved === 'oscuro_neutro') {
        setTheme(saved as any);
      }
      const savedBrightness = localStorage.getItem('reader-brightness');
      if (savedBrightness) {
        const val = parseFloat(savedBrightness);
        if (!isNaN(val) && val >= 0.70 && val <= 1.0) {
          setBrightness(val);
        }
      }
    }
  }, []);

  const changeTheme = (newTheme: 'normal' | 'sepia' | 'oscuro_calido' | 'oscuro_neutro') => {
    if (typeof document !== 'undefined' && (document as any).startViewTransition) {
      (document as any).startViewTransition(() => {
        setTheme(newTheme);
        localStorage.setItem('reader-theme', newTheme);
      });
    } else {
      setTheme(newTheme);
      localStorage.setItem('reader-theme', newTheme);
    }
  };

  const changeBrightness = (newBrightness: number) => {
    setBrightness(newBrightness);
    localStorage.setItem('reader-brightness', newBrightness.toString());
  };

  useEffect(() => {
    if (!showThemeMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setShowThemeMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showThemeMenu]);

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
      <div className="fixed inset-0 bg-[#f5f8ff] flex flex-col items-center justify-center z-200">
        <div className="w-16 h-16 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-playfair text-xl text-[#0a1628] animate-pulse">Abriendo el libro...</p>
      </div>
    );
  }
  if (!libro || !currentSegment) return null;

  const cfg = themeConfig[theme];
  const totalAnotaciones = annotations.getPayloadParaBack().length;

  return (
    <div 
      className={`min-h-screen ${cfg.wrapperBg} flex flex-col font-lora ${cfg.textColor} w-full max-w-full overflow-x-hidden transition-colors duration-300`}
    >
      {/* Overlay global de brillo para toda la vista (incluyendo sidebars y modales) */}
      <div 
        className="pointer-events-none fixed inset-0 z-[999999] bg-black transition-opacity duration-200"
        style={{ opacity: 1 - brightness }}
      />
      <style>{`
        ::view-transition-group(*),
        ::view-transition-old(*),
        ::view-transition-new(*) {
          animation-duration: 0.25s;
          animation-timing-function: cubic-bezier(0.19, 1, 0.22, 1);
        }
      `}</style>
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
      <header className={`sticky top-0 z-110 ${cfg.headerBg} backdrop-blur-md px-2 sm:px-4 md:px-8 py-3 flex items-center justify-between shadow-sm gap-1 sm:gap-2 relative transition-colors duration-300`}>


        <div className="flex items-center gap-1 md:gap-3 min-w-0 flex-1">
          <button onClick={handleExit}
            className={`p-2 ${cfg.headerIconBtnHover} rounded-full transition-all duration-200 hover:scale-110 active:scale-95 group shrink-0`} title="Volver a la Biblioteca">
            <svg className={`w-5 h-5 md:w-6 md:h-6 ${cfg.headerBtnIcon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('open-student-sidebar'))}
            className={`p-2 ${cfg.headerIconBtnHover} rounded-full transition-all duration-200 hover:scale-110 active:scale-95 group shrink-0`} 
            title="Menú Principal"
          >
            <svg className={`w-5 h-5 md:w-6 md:h-6 ${cfg.headerBtnIcon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="min-w-0 flex-1 pl-1">
            <h1 className={`font-playfair font-bold text-sm md:text-xl ${cfg.headerTitle} truncate`}>{libro.titulo}</h1>
            <p className={`text-[9px] md:text-[10px] font-black ${cfg.headerSub} uppercase tracking-widest truncate`}>
              {currentSegment.unidadNombre || 'Contenido'} &bull; {currentIdx + 1} de {totalSegments}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-3 md:gap-4 shrink-0">
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className={`text-[10px] font-black ${cfg.headerProgressLabel}`}>PROGRESO</span>
            <div className={`w-32 h-2.5 border ${cfg.headerProgressBg} rounded-full overflow-hidden mt-1 p-[1px]`}>
              <div 
                className={`h-full bg-gradient-to-r ${cfg.headerProgressFill} rounded-full transition-all duration-500`} 
                style={{ width: `${progressPercent}%` }} 
              />
            </div>
          </div>
          <ReadingTimer formattedTime={timer.formattedTime} isRunning={timer.isRunning} />

          {totalAnotaciones > 0 && (
            <div className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full ${(theme === 'oscuro_calido' || theme === 'oscuro_neutro') ? 'bg-[#292420] border-[#362e26]' : theme === 'sepia' ? 'bg-[#ebdcb9]/40 border-[#e4dcbf]' : 'bg-[#f5f8ff] border-[#c8d8f0]'}`}>
              <span className="text-xs">🖍</span>
              <span className={`text-[10px] font-black ${(theme === 'oscuro_calido' || theme === 'oscuro_neutro') ? 'text-white' : theme === 'sepia' ? 'text-[#3D2E1A]' : 'text-[#1e3a6e]'} uppercase tracking-widest`}>{totalAnotaciones}</span>
            </div>
          )}

          <div className={`hidden md:block w-px h-6 ${(theme === 'oscuro_calido' || theme === 'oscuro_neutro') ? 'bg-[#362e26]' : theme === 'sepia' ? 'bg-[#e4dcbf]' : 'bg-[#c8d8f0]'}`} />

          {/* Selector de Filtro de Lectura */}
          <div className="relative" ref={themeMenuRef}>
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className={`p-1.5 sm:p-2 rounded-lg border transition-all shadow-sm flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 ${cfg.headerBtnBorder}`}
              title="Filtro de Lectura"
            >
              {theme === 'normal' && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              )}
              {theme === 'sepia' && (
                <svg className="w-4 h-4 text-[#d97706]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464-6.364a1 1 0 010 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-5.464 5.036a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zM7 17a1 1 0 100-2H6a1 1 0 100 2h1zm-5.464-5.036a1 1 0 010-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707a1 1 0 01-1.414 0zM3 11a1 1 0 100-2H2a1 1 0 100 2h1zm5.464-9.036a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
              {(theme === 'oscuro_calido' || theme === 'oscuro_neutro') && (
                <svg className="w-4 h-4 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
              <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest">
                {theme === 'normal' ? 'Luz' : theme === 'sepia' ? 'Sepia' : theme === 'oscuro_calido' ? 'Cálido' : 'Neutro'}
              </span>
            </button>

            {showThemeMenu && (
              <div 
                className="absolute right-0 mt-2 w-52 rounded-xl shadow-xl border overflow-hidden z-200 animate-fade"
                style={{
                  backgroundColor: (theme === 'oscuro_calido' || theme === 'oscuro_neutro') ? (theme === 'oscuro_calido' ? '#241e19' : '#1e1e1e') : theme === 'sepia' ? '#faf6eb' : 'white',
                  borderColor: (theme === 'oscuro_calido' || theme === 'oscuro_neutro') ? (theme === 'oscuro_calido' ? '#362e26' : '#2c2c2c') : theme === 'sepia' ? '#ebdcb9' : '#e2e8f0',
                }}
              >
                <div className="p-2 space-y-1">
                  <p className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 ${
                    (theme === 'oscuro_calido' || theme === 'oscuro_neutro') ? 'text-slate-400' : theme === 'sepia' ? 'text-amber-800/60' : 'text-slate-500'
                  }`}>
                    Filtro de lectura
                  </p>
                  
                  {/* Luz */}
                  <button
                    onClick={() => { changeTheme('normal'); setShowThemeMenu(false); }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-bold transition-all text-left ${
                      theme === 'normal' 
                        ? 'bg-slate-100 text-[#0a1628] shadow-sm' 
                        : (theme === 'oscuro_calido' || theme === 'oscuro_neutro') ? 'text-slate-300 hover:bg-slate-800' : 'text-[#4a3525] hover:bg-[#ebdcb9]/40'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full border border-slate-300 bg-white flex items-center justify-center shrink-0 shadow-sm">
                      {theme === 'normal' && <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />}
                    </span>
                    <span>Modo Claro (Luz)</span>
                  </button>

                  {/* Sepia */}
                  <button
                    onClick={() => { changeTheme('sepia'); setShowThemeMenu(false); }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-bold transition-all text-left ${
                      theme === 'sepia' 
                        ? 'bg-amber-100/50 text-[#5d401b] shadow-sm' 
                        : (theme === 'oscuro_calido' || theme === 'oscuro_neutro') ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-black/5'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full border border-amber-300 bg-[#fbf6e9] flex items-center justify-center shrink-0 shadow-sm">
                      {theme === 'sepia' && <span className="w-1.5 h-1.5 rounded-full bg-[#d97706]" />}
                    </span>
                    <span>Sepia (Día)</span>
                  </button>

                  {/* Oscuro Cálido */}
                  <button
                    onClick={() => { changeTheme('oscuro_calido'); setShowThemeMenu(false); }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-bold transition-all text-left ${
                      theme === 'oscuro_calido' 
                        ? 'bg-amber-950/40 text-[#f5e6cc] shadow-sm border border-amber-800/30' 
                        : theme === 'oscuro_neutro' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-black/5'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full border border-amber-700 bg-[#1B1612] flex items-center justify-center shrink-0 shadow-sm">
                      {theme === 'oscuro_calido' && <span className="w-1.5 h-1.5 rounded-full bg-[#E8D5B0]" />}
                    </span>
                    <span>Oscuro Cálido (Ámbar)</span>
                  </button>

                  {/* Oscuro Neutro */}
                  <button
                    onClick={() => { changeTheme('oscuro_neutro'); setShowThemeMenu(false); }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-bold transition-all text-left ${
                      theme === 'oscuro_neutro' 
                        ? 'bg-slate-850 text-white shadow-inner border border-slate-700' 
                        : theme === 'oscuro_calido'
                          ? 'text-slate-300 hover:bg-slate-800'
                          : theme === 'sepia' ? 'text-[#4a3525] hover:bg-[#ebdcb9]/40' : 'text-slate-700 hover:bg-black/5'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full border border-slate-600 bg-[#121212] flex items-center justify-center shrink-0 shadow-sm">
                      {theme === 'oscuro_neutro' && <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />}
                    </span>
                    <span>Oscuro Neutro (Gris)</span>
                  </button>

                  {/* Separador */}
                  <div className={`h-px my-2 ${
                    (theme === 'oscuro_calido' || theme === 'oscuro_neutro') ? 'bg-slate-700' : theme === 'sepia' ? 'bg-[#ebdcb9]' : 'bg-slate-200'
                  }`} />

                  {/* Brillo Slider */}
                  <div className="px-2.5 py-1.5 space-y-1.5">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider">
                      <span className={(theme === 'oscuro_calido' || theme === 'oscuro_neutro') ? 'text-slate-400' : theme === 'sepia' ? 'text-amber-800/60' : 'text-slate-500'}>
                        Brillo
                      </span>
                      <span className={(theme === 'oscuro_calido' || theme === 'oscuro_neutro') ? 'text-slate-300' : theme === 'sepia' ? 'text-[#5c4015]' : 'text-slate-700'}>
                        {Math.round(brightness * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.70"
                      max="1.0"
                      step="0.05"
                      value={brightness}
                      onChange={(e) => changeBrightness(parseFloat(e.target.value))}
                      className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#d4af37] dark:bg-slate-700"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleExit}
            className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-bold uppercase tracking-widest transition-all ${cfg.headerBtnBorder}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Finalizar
          </button>
          <button onClick={() => setShowSidebar(true)}
            className={`p-1.5 sm:p-2 rounded-lg transition-all shadow-md flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 ${cfg.headerChaptersBtn}`}>
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="hidden md:inline text-xs font-bold uppercase tracking-widest">Capítulos</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main 
        className="flex-1 max-w-4xl mx-auto w-full px-2.5 sm:px-6 md:px-8 py-4 sm:py-6 md:py-12 relative" 
        style={cursorStyle}
      >
        <div className={`${cfg.cardBg} ${cfg.textColor} shadow-[0_8px_30px_rgb(0,0,0,0.04)] border ${cfg.cardBorder} rounded-2xl md:rounded-3xl p-4 sm:p-8 md:p-16 relative transition-colors duration-300`}>
          <div className={`hidden sm:block pointer-events-none absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 ${(theme === 'oscuro_calido' || theme === 'oscuro_neutro') ? 'border-[#d4af37]/35' : 'border-[#d4af37]/20'} rounded-tl-2xl md:rounded-tl-3xl translate-x-4 translate-y-4`} />
          <div className={`hidden sm:block pointer-events-none absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 ${(theme === 'oscuro_calido' || theme === 'oscuro_neutro') ? 'border-[#d4af37]/35' : 'border-[#d4af37]/20'} rounded-tr-2xl md:rounded-tr-3xl -translate-x-4 translate-y-4`} />

          <article className={`prose prose-stone prose-lg max-w-none ${(theme === 'oscuro_calido' || theme === 'oscuro_neutro') ? 'prose-invert' : ''} ${cfg.textColor}`}>
            <div className="text-center mb-12">
              <span className={`inline-block w-12 h-0.5 ${cfg.dividerBg} mb-4`} />
              <h2 className={`font-playfair italic text-2xl md:text-4xl ${cfg.titleColor} mb-2`}>{currentSegment.titulo}</h2>
              {currentSegment.numeroPagina && (
                <p className={`${cfg.subtitleColor} text-xs md:text-sm font-semibold`}>Página {currentSegment.numeroPagina}</p>
              )}
            </div>

            {currentSegment.contenido ? (
              <AnnotatedContent
                theme={theme}
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
              <p className={`${cfg.subtitleColor} italic text-center`}>Este segmento no tiene contenido.</p>
            )}
          </article>
        </div>

        {/* Navigation */}
        <div className={`mt-8 pt-6 border-t ${cfg.navBorder}/60 flex items-center justify-between gap-1.5 sm:gap-2`}>
          <button onClick={handlePrev} disabled={currentIdx === 0}
            className={`flex items-center gap-1 sm:gap-3 px-2 sm:px-6 py-2 sm:py-3 rounded-xl border ${cfg.navBorder} ${cfg.prevButtonText} font-bold text-[11px] sm:text-base ${cfg.prevButtonHover} disabled:opacity-30 disabled:pointer-events-none transition-all`}>
            <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Anterior
          </button>

          <span className={`text-[10px] sm:text-xs font-black ${cfg.subtitleColor} uppercase tracking-widest whitespace-nowrap`}>
            {currentIdx + 1} / {totalSegments}
          </span>

          {/* Botón Siguiente — dinámico */}
          {(() => {
            if (!isFrontier) {
              return (
                <button onClick={handleNext} disabled={currentIdx === totalSegments - 1}
                  className={`flex items-center gap-1 sm:gap-3 px-3.5 sm:px-10 py-2 sm:py-3 rounded-xl ${cfg.navButtonBg} ${cfg.navButtonText} font-bold text-[11px] sm:text-base ${cfg.navButtonHover} hover:-translate-y-0.5 transition-all shadow-lg active:translate-y-0 disabled:opacity-40 disabled:pointer-events-none`}>
                  Siguiente
                  <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              );
            }
            if (currentIdx === totalSegments - 1) {
              return (
                <button disabled className={`flex items-center gap-1 sm:gap-3 px-3.5 sm:px-10 py-2 sm:py-3 rounded-xl ${cfg.navButtonBg} ${cfg.navButtonText} font-bold text-[11px] sm:text-base opacity-40 pointer-events-none`}>
                  Fin
                </button>
              );
            }
            if (isWaiting) {
              return (
                <button disabled className={`flex items-center gap-1 sm:gap-3 px-2 sm:px-10 py-2 sm:py-3 rounded-xl ${cfg.navButtonBg} ${cfg.navButtonText} font-bold text-[11px] sm:text-base opacity-40 pointer-events-none`}>
                  <span className="hidden xs:inline">Leyendo... </span>{waitTime}s
                  <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              );
            }
            if (evaluacion.estado === 'cargando') {
              return (
                <button disabled className={`flex items-center gap-1 sm:gap-3 px-2 sm:px-10 py-2 sm:py-3 rounded-xl ${cfg.navButtonBg} ${cfg.navButtonText} font-bold text-[11px] sm:text-base opacity-60 pointer-events-none`}>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Evaluando...
                </button>
              );
            }
            if (evaluacion.estado === 'pendiente') {
              return (
                <button onClick={() => evaluacion.abrirPanel()}
                  className="flex items-center gap-1 sm:gap-3 px-2 sm:px-5 py-2 sm:py-3 rounded-xl bg-[#d4af37] text-[#0a1628] font-bold text-[11px] sm:text-base hover:bg-[#c19b2f] hover:-translate-y-0.5 transition-all shadow-lg">
                  <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Responder ({evaluacion.evaluacion?.preguntas.length ?? 0})
                </button>
              );
            }
            if (evaluacion.estado === 'refuerzo') {
              return (
                <button onClick={() => evaluacion.abrirPanel()}
                  className="flex items-center gap-1 sm:gap-3 px-2 sm:px-5 py-2 sm:py-3 rounded-xl bg-amber-500 text-white font-bold text-[11px] sm:text-base hover:bg-amber-600 hover:-translate-y-0.5 transition-all shadow-lg">
                  <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reintentar
                </button>
              );
            }
            return (
              <button onClick={handleNext}
                className={`flex items-center gap-1 sm:gap-3 px-3.5 sm:px-10 py-2 sm:py-3 rounded-xl font-bold text-[11px] sm:text-base hover:-translate-y-0.5 transition-all shadow-lg ${
                  evaluacion.estado === 'aprobado'
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : `${cfg.navButtonBg} ${cfg.navButtonText} ${cfg.navButtonHover}`
                }`}>
                {evaluacion.estado === 'aprobado' && (
                  <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" />
                  </svg>
                )}
                Siguiente
                <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            );
          })()}
        </div>
      </main>

      {/* Sidebar capítulos */}
      <div className={`fixed inset-0 z-150 overflow-hidden transition-opacity duration-300 ${showSidebar ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setShowSidebar(false)}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <aside className={`absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] ${cfg.sidebarBg} border-l ${cfg.sidebarBorder} shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${showSidebar ? 'translate-x-0' : 'translate-x-full'} transition-colors duration-300`}
          onClick={e => e.stopPropagation()}>
          <div className={`p-6 border-b ${cfg.sidebarBorder} flex items-center justify-between`}>
            <h3 className={`font-playfair font-bold text-xl ${cfg.sidebarTitle}`}>Capítulos</h3>
            <button onClick={() => setShowSidebar(false)} className={`p-2 rounded-full transition-colors ${cfg.sidebarItemHover}`}>
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
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 ${isActive ? `${cfg.sidebarItemActive} shadow-sm` : isLocked ? 'opacity-40 cursor-not-allowed grayscale' : `border-transparent ${cfg.sidebarItemHover}`}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${isActive ? `${cfg.navButtonBg} ${cfg.navButtonText}` : isLocked ? ((theme === 'oscuro_calido' || theme === 'oscuro_neutro') ? 'bg-slate-800 text-slate-600' : 'bg-gray-200 text-gray-400') : ((theme === 'oscuro_calido' || theme === 'oscuro_neutro') ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-500')}`}>
                    {isLocked ? (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    ) : (idx + 1)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${isActive ? cfg.sidebarTitle : cfg.sidebarText}`}>{seg.titulo}</p>
                    <p className={`text-[10px] uppercase tracking-tighter ${(theme === 'oscuro_calido' || theme === 'oscuro_neutro') ? 'text-slate-400' : 'text-gray-400'}`}>{seg.unidadNombre || 'Sección'}</p>
                  </div>
                  {segAnns.length > 0 && (
                    <span className={`text-[9px] font-black text-[#d4af37] rounded-full px-1.5 py-0.5 shrink-0 border ${
                      (theme === 'oscuro_calido' || theme === 'oscuro_neutro')
                        ? 'bg-[#1e293b] border-[#334155]' 
                        : theme === 'sepia'
                          ? 'bg-[#fbf6e9] border-[#ebdcb9]'
                          : 'bg-[#f5f8ff] border-[#c8d8f0]'
                    }`}>
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
        <div className="fixed bottom-8 right-8 z-200 bg-white/90 backdrop-blur-sm border border-[#c8d8f0] px-4 py-2 rounded-full shadow-lg flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
          <span className="text-[10px] font-black text-[#1e3a6e] uppercase tracking-widest">Sincronizando...</span>
        </div>
      )}
    </div>
  );
}