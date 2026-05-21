'use client';

import React, { useState, useCallback } from 'react';
import { PreguntaDiagnostico, DiagnosticoResultado, LetraRespuesta } from '../../../types/alumno/evaluacion';
import { EvaluacionService } from '../../../service/alumno/evaluacion.service';

interface DiagnosticoModalProps {
  libroId: number;
  preguntas: PreguntaDiagnostico[];
  onComplete: (resultado: DiagnosticoResultado) => void;
}

const LETRAS: LetraRespuesta[] = ['A', 'B', 'C', 'D'];

const NIVEL_LABELS: Record<string, { label: string; color: string; bg: string; desc: string }> = {
  basico: {
    label: 'Básico',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
    desc: 'Comenzarás con lecturas más pausadas y guiadas. ¡El ritmo adecuado es el mejor punto de partida!',
  },
  intermedio: {
    label: 'Intermedio',
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
    desc: 'Tienes una buena base lectora. Las evaluaciones estarán calibradas a tu nivel.',
  },
  avanzado: {
    label: 'Avanzado',
    color: 'text-purple-700',
    bg: 'bg-purple-50 border-purple-200',
    desc: '¡Excelente comprensión lectora! Tendrás evaluaciones más profundas y tiempos más ágiles.',
  },
};

export default function DiagnosticoModal({ libroId, preguntas, onComplete }: DiagnosticoModalProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<number, LetraRespuesta>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultado, setResultado] = useState<DiagnosticoResultado | null>(null);
  const [error, setError] = useState('');

  const totalPreguntas = preguntas.length;
  const preguntaActual = preguntas[currentIdx];
  const progressPct = Math.round(((currentIdx) / totalPreguntas) * 100);
  const letraSeleccionada = respuestas[preguntaActual?.preguntaId];

  const handleSeleccionar = useCallback((letra: LetraRespuesta) => {
    setRespuestas(prev => ({ ...prev, [preguntaActual.preguntaId]: letra }));
  }, [preguntaActual]);

  const handleSiguiente = useCallback(() => {
    if (!letraSeleccionada) return;
    if (currentIdx < totalPreguntas - 1) {
      setCurrentIdx(i => i + 1);
    }
  }, [letraSeleccionada, currentIdx, totalPreguntas]);

  const handleAnterior = useCallback(() => {
    if (currentIdx > 0) setCurrentIdx(i => i - 1);
  }, [currentIdx]);

  const handleEnviar = useCallback(async () => {
    if (!letraSeleccionada) return;
    setIsSubmitting(true);
    setError('');

    try {
      const payload = preguntas.map(p => ({
        preguntaId: p.preguntaId,
        respuesta: respuestas[p.preguntaId] ?? 'A',
      }));

      const res = await EvaluacionService.enviarDiagnostico(libroId, payload);
      setResultado(res);
    } catch {
      setError('Ocurrió un error al enviar el diagnóstico. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  }, [libroId, preguntas, respuestas, letraSeleccionada]);

  const esUltimaPregunta = currentIdx === totalPreguntas - 1;

  // ── Pantalla de resultado ──────────────────────────────────────────────────
  if (resultado) {
    const nivelInfo = NIVEL_LABELS[resultado.nivelAsignado] ?? NIVEL_LABELS.basico;
    const minutos = Math.floor(resultado.tiempoMinimo / 60);
    const segundos = resultado.tiempoMinimo % 60;
    const tiempoStr = segundos > 0 ? `${minutos} min ${segundos} seg` : `${minutos} min`;

    return (
      <div className="fixed inset-0 z-[300] flex items-center justify-center px-4"
        style={{ background: 'rgba(43,27,23,0.7)', backdropFilter: 'blur(8px)' }}>
        <div className="bg-[#fbf8f1] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
          style={{ animation: 'scaleInModal 0.35s cubic-bezier(0.34,1.56,0.64,1) both' }}>

          {/* Header dorado */}
          <div className="bg-[#2b1b17] px-8 pt-8 pb-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#d4af37] rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-[#2b1b17]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h2 className="font-playfair text-2xl font-bold text-[#d4af37]">¡Diagnóstico completado!</h2>
            <p className="text-white/60 font-lora text-sm mt-1">Puntuación: {resultado.score}%</p>
          </div>

          {/* Resultado */}
          <div className="px-8 py-6 space-y-4">
            <div className={`rounded-2xl p-4 border text-center ${nivelInfo.bg}`}>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Tu nivel de lectura</p>
              <p className={`font-playfair text-3xl font-bold ${nivelInfo.color}`}>{nivelInfo.label}</p>
            </div>

            <p className="text-sm text-[#5d4037] font-lora leading-relaxed text-center">
              {nivelInfo.desc}
            </p>

            <div className="flex items-center gap-3 bg-[#f5f0e8] rounded-xl px-4 py-3">
              <svg className="w-4 h-4 text-[#d4af37] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" />
              </svg>
              <p className="text-xs text-[#8d6e3f] font-lora">
                Tiempo mínimo de lectura por segmento: <strong>{tiempoStr}</strong>
              </p>
            </div>

            <button
              onClick={() => onComplete(resultado)}
              className="w-full py-3.5 rounded-xl bg-[#2b1b17] text-[#f0e6d2] font-bold hover:bg-[#3e2723] transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              ¡Empezar a leer!
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Pantalla del diagnóstico ───────────────────────────────────────────────
  const opciones: { letra: LetraRespuesta; texto: string }[] = [
    { letra: 'A', texto: preguntaActual.opcionA },
    { letra: 'B', texto: preguntaActual.opcionB },
    { letra: 'C', texto: preguntaActual.opcionC },
    { letra: 'D', texto: preguntaActual.opcionD },
  ];

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center px-4"
      style={{ background: 'rgba(43,27,23,0.75)', backdropFilter: 'blur(8px)' }}>
      <div className="bg-[#fbf8f1] rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]"
        style={{ animation: 'scaleInModal 0.3s cubic-bezier(0.34,1.56,0.64,1) both' }}>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#e3dac9] shrink-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-[#2b1b17] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="font-playfair font-bold text-[#2b1b17] text-lg leading-none">Diagnóstico inicial</h2>
              <p className="text-[10px] text-[#a1887f] font-bold uppercase tracking-widest mt-0.5">
                Evaluamos tu nivel de comprensión lectora
              </p>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-black text-[#a1887f] uppercase tracking-widest">
              <span>Pregunta {currentIdx + 1} de {totalPreguntas}</span>
              <span>{progressPct}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#e3dac9] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#d4af37] rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="bg-white rounded-2xl p-5 border border-[#e3dac9] shadow-sm">
            {/* Pregunta */}
            <div className="flex items-start gap-2.5 mb-5">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#2b1b17] text-[#d4af37] text-xs font-black shrink-0 mt-0.5">
                {currentIdx + 1}
              </span>
              <p className="font-medium text-[#2b1b17] text-sm leading-relaxed">{preguntaActual.texto}</p>
            </div>

            {/* Opciones */}
            <div className="space-y-2.5">
              {opciones.map(({ letra, texto }) => {
                const isSelected = letraSeleccionada === letra;
                return (
                  <button
                    key={letra}
                    onClick={() => handleSeleccionar(letra)}
                    className="w-full flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all duration-200"
                    style={{
                      borderColor: isSelected ? '#d4af37' : '#e3dac9',
                      background: isSelected ? 'linear-gradient(135deg,#d4af3712,#d4af3706)' : '#fafaf9',
                      boxShadow: isSelected ? '0 0 0 3px rgba(212,175,55,0.15)' : 'none',
                    }}
                  >
                    <span
                      className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black transition-all duration-200"
                      style={{
                        background: isSelected ? '#d4af37' : '#f0ebe3',
                        color: isSelected ? '#2b1b17' : '#8d6e3f',
                      }}
                    >
                      {letra}
                    </span>
                    <span
                      className="text-sm leading-snug pt-0.5 transition-colors duration-200"
                      style={{ color: isSelected ? '#2b1b17' : '#5d4037', fontWeight: isSelected ? 600 : 400 }}
                    >
                      {texto}
                    </span>
                    {isSelected && (
                      <svg className="w-4 h-4 text-[#d4af37] shrink-0 ml-auto mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center mt-3 font-lora">⚠ {error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 border-t border-[#e3dac9] shrink-0 flex gap-3">
          {currentIdx > 0 && (
            <button
              onClick={handleAnterior}
              className="px-4 py-3 rounded-xl border border-[#e3dac9] text-[#8d6e3f] font-bold hover:bg-white transition-all text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Anterior
            </button>
          )}

          {!esUltimaPregunta ? (
            <button
              onClick={handleSiguiente}
              disabled={!letraSeleccionada}
              className="flex-1 py-3 rounded-xl bg-[#2b1b17] text-[#f0e6d2] font-bold hover:bg-[#3e2723] transition-all shadow-lg disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              Siguiente
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleEnviar}
              disabled={!letraSeleccionada || isSubmitting}
              className="flex-1 py-3 rounded-xl bg-[#d4af37] text-[#2b1b17] font-bold hover:bg-[#c19b2f] transition-all shadow-lg disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#2b1b17] border-t-transparent rounded-full animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Finalizar diagnóstico
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}