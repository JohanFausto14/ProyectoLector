'use client';

import { useState, useCallback, useEffect } from 'react';
import { EvaluacionService } from '../service/alumno/evaluacion.service';
import {
  EstadoEvaluacion,
  EvaluacionData,
  EvaluacionResultado,
  RespuestaItem,
} from '../types/alumno/evaluacion';

interface UseEvaluacionOptions {
  libroId: number;
  segmentoId: number;
}

export interface UseEvaluacionReturn {
  estado: EstadoEvaluacion;
  evaluacion: EvaluacionData | null;
  resultado: EvaluacionResultado | null;
  /** true cuando el alumno puede avanzar al siguiente segmento */
  puedeAvanzar: boolean;
  /** Tiempo mínimo en segundos que debe leer antes de evaluar */
  tiempoMinimoSegundos: number;
  /** controla visibilidad del panel de preguntas */
  isOpen: boolean;
  cargarEvaluacion: () => Promise<void>;
  enviarRespuestas: (respuestas: RespuestaItem[]) => Promise<void>;
  solicitarReintento: () => Promise<void>;
  abrirPanel: () => void;
  cerrarPanel: () => void;
  resetear: () => void;
}

export function useEvaluacion({ libroId, segmentoId }: UseEvaluacionOptions): UseEvaluacionReturn {
  const [estado, setEstado] = useState<EstadoEvaluacion>('sin_evaluacion');
  const [evaluacion, setEvaluacion] = useState<EvaluacionData | null>(null);
  const [resultado, setResultado] = useState<EvaluacionResultado | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [tiempoMinimoSegundos, setTiempoMinimoSegundos] = useState(0);

  // Resetear al cambiar de segmento
  useEffect(() => {
    setEstado('sin_evaluacion');
    setEvaluacion(null);
    setResultado(null);
    setIsOpen(false);
    setTiempoMinimoSegundos(0);
  }, [segmentoId]);

  // Puede avanzar si no hay preguntas, aprobó o agotó intentos
  const puedeAvanzar =
    estado === 'sin_preguntas' ||
    estado === 'aprobado' ||
    estado === 'intentos_agotados';

  const cargarEvaluacion = useCallback(async () => {
    setEstado(prev => {
      if (prev !== 'sin_evaluacion') return prev;
      return 'cargando';
    });

    try {
      const data = await EvaluacionService.getEvaluacion(libroId, segmentoId);

      if (!data?.preguntas?.length) {
        setEstado('sin_preguntas');
        return;
      }

      // Guardar el tiempoMinimoSegundos que viene del back
      setTiempoMinimoSegundos(data.tiempoMinimoSegundos ?? 0);
      setEvaluacion(data);
      setEstado('pendiente');
    } catch {
      // Sin preguntas disponibles → puede avanzar libremente
      setEstado('sin_preguntas');
    }
  }, [libroId, segmentoId]);

  const enviarRespuestas = useCallback(async (respuestas: RespuestaItem[]) => {
    if (!evaluacion) return;
    setEstado('enviando');
    try {
      const res = await EvaluacionService.enviarRespuestas(libroId, segmentoId, {
        respuestas,
      });
      setResultado(res);

      if (res.aprobado || res.puedeAvanzar) {
        setEstado('aprobado');
      } else {
        // Calcular intentos restantes: el back no los devuelve en el resultado,
        // así que los decrementamos localmente
        const intentosRestantes = (evaluacion.intentosRestantes ?? 3) - 1;
        setEvaluacion(prev => prev ? { ...prev, intentosRestantes } : null);
        setEstado(intentosRestantes <= 0 ? 'intentos_agotados' : 'refuerzo');
      }
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      setEstado(status === 400 ? 'intentos_agotados' : 'sin_preguntas');
    }
  }, [evaluacion, libroId, segmentoId]);

  const solicitarReintento = useCallback(async () => {
    setEstado('cargando');
    try {
      // El back rota las preguntas automáticamente al hacer GET nuevamente
      const data = await EvaluacionService.solicitarReintento(libroId, segmentoId);
      setEvaluacion(prev => prev ? {
        ...prev,
        nivel: data.nivel,
        preguntas: data.preguntas,
        intentosRestantes: data.intentosRestantes,
        tiempoMinimoSegundos: data.tiempoMinimoSegundos ?? prev.tiempoMinimoSegundos,
      } : null);
      setResultado(null);
      setEstado('pendiente');
    } catch {
      setEstado('intentos_agotados');
    }
  }, [libroId, segmentoId]);

  const abrirPanel = useCallback(() => setIsOpen(true), []);
  const cerrarPanel = useCallback(() => setIsOpen(false), []);

  const resetear = useCallback(() => {
    setEstado('sin_evaluacion');
    setEvaluacion(null);
    setResultado(null);
    setIsOpen(false);
    setTiempoMinimoSegundos(0);
  }, []);

  return {
    estado,
    evaluacion,
    resultado,
    puedeAvanzar,
    tiempoMinimoSegundos,
    isOpen,
    cargarEvaluacion,
    enviarRespuestas,
    solicitarReintento,
    abrirPanel,
    cerrarPanel,
    resetear,
  };
}