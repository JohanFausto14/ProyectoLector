'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { UseEvaluacionReturn } from '../../../hooks/useEvaluacion';
import { RespuestaItem, LetraRespuesta, PalabraGlosario } from '../../../types/alumno/evaluacion';

interface EvaluacionPanelProps {
    ev: UseEvaluacionReturn;
    tituloSegmento: string;
    onContinuar?: () => void;
}

const LETRAS: LetraRespuesta[] = ['A', 'B', 'C', 'D'];

// ── Gauge de score ───────────────────────────────────────────────────────────
function ScoreGauge({ score }: { score: number }) {
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const color = score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';

    return (
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 mx-auto">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r={radius} fill="none" stroke="#c8d8f0" strokeWidth="10" />
                <circle
                    cx="60" cy="60" r={radius} fill="none"
                    stroke={color} strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.5s ease' }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl sm:text-3xl font-playfair font-bold text-[#0a1628]">{score}</span>
                <span className="text-[10px] sm:text-xs text-[#1e3a6e] font-bold uppercase tracking-widest">puntos</span>
            </div>
        </div>
    );
}

// ── Panel principal ──────────────────────────────────────────────────────────
export default function EvaluacionPanel({ ev, tituloSegmento, onContinuar }: EvaluacionPanelProps) {
    const { estado, evaluacion, resultado, isOpen, cerrarPanel, enviarRespuestas, solicitarReintento } = ev;

    // Selección: preguntaId (number) → letra seleccionada
    const [seleccion, setSeleccion] = useState<Record<number, LetraRespuesta>>({});

    // Timestamps de inicio por pregunta (para calcular tiempoMs)
    const preguntaStartRef = useRef<Record<number, number>>({});

    // Bloquear scroll de fondo cuando la evaluación está abierta
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleSelect = useCallback((preguntaId: number, letra: LetraRespuesta) => {
        setSeleccion(prev => ({ ...prev, [preguntaId]: letra }));
    }, []);

    // Registrar cuándo el alumno empieza a ver cada pregunta
    const handlePreguntaVisible = useCallback((preguntaId: number) => {
        if (!preguntaStartRef.current[preguntaId]) {
            preguntaStartRef.current[preguntaId] = Date.now();
        }
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!evaluacion) return;

        const respuestas: RespuestaItem[] = evaluacion.preguntas.map(p => {
            const tiempoMs = preguntaStartRef.current[p.preguntaId]
                ? Date.now() - preguntaStartRef.current[p.preguntaId]
                : undefined;

            return {
                preguntaId: p.preguntaId,
                respuesta: seleccion[p.preguntaId],
                tiempoMs,
            };
        });

        if (respuestas.some(r => !r.respuesta)) return;

        setSeleccion({});
        preguntaStartRef.current = {};
        await enviarRespuestas(respuestas);
    }, [evaluacion, seleccion, enviarRespuestas]);

    const handleContinuar = useCallback(() => {
        cerrarPanel();
        onContinuar?.();
    }, [cerrarPanel, onContinuar]);

    const handleReintento = useCallback(async () => {
        setSeleccion({});
        preguntaStartRef.current = {};
        await solicitarReintento();
    }, [solicitarReintento]);

    const allAnswered = evaluacion?.preguntas.every(
        p => seleccion[p.preguntaId] !== undefined
    ) ?? false;

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 z-[180] bg-black/50 backdrop-blur-sm"
                onClick={estado === 'pendiente' ? undefined : cerrarPanel}
            />

            {/* Panel */}
            <div className="fixed inset-x-0 bottom-0 z-[190] md:inset-0 md:flex md:items-center md:justify-center">
                <div className="bg-[#f5f8ff] rounded-t-3xl md:rounded-3xl w-full md:max-w-2xl md:mx-4 shadow-2xl flex flex-col max-h-[95vh] md:max-h-[85vh] animate-in slide-in-from-bottom-4 duration-300">

                    {/* Header */}
                    <div className="flex items-center justify-between px-4 sm:px-6 pt-6 pb-4 border-b border-[#c8d8f0] shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#0a1628] flex items-center justify-center">
                                <svg className="w-5 h-5 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="font-playfair font-bold text-[#0a1628] text-lg leading-none">Evaluación de Comprensión</h2>
                                <p className="text-[10px] text-[#6b8cba] font-bold uppercase tracking-widest mt-0.5 line-clamp-1">{tituloSegmento}</p>
                            </div>
                        </div>

                        {evaluacion && (
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${evaluacion.nivel === 'avanzado' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                    evaluacion.nivel === 'intermedio' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                                }`}>
                                {evaluacion.nivel}
                            </span>
                        )}
                    </div>

                    {/* Body — scrollable */}
                    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">

                        {/* Cargando */}
                        {estado === 'cargando' && (
                            <div className="flex flex-col items-center justify-center py-16 gap-4">
                                <div className="w-10 h-10 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
                                <p className="text-[#1e3a6e] font-lora italic">Preparando tu evaluación...</p>
                            </div>
                        )}

                        {/* Preguntas — opciones reales del back */}
                        {estado === 'pendiente' && evaluacion && (
                            <div className="space-y-6">
                                {/* Info bar */}
                                <div className="flex items-center justify-between text-xs text-[#1e3a6e] bg-[#f5f0e8] rounded-xl px-4 py-2.5">
                                    <div className="flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        <span>Selecciona la mejor respuesta — umbral {evaluacion.umbralAprobacion}%</span>
                                    </div>
                                    <span className="font-bold">
                                        {evaluacion.intentosRestantes} intento{evaluacion.intentosRestantes !== 1 ? 's' : ''} restante{evaluacion.intentosRestantes !== 1 ? 's' : ''}
                                    </span>
                                </div>

                                {/* Preguntas con opciones reales */}
                                {evaluacion.preguntas.map((p, idx) => {
                                    // Registrar cuando el alumno ve la pregunta
                                    handlePreguntaVisible(p.preguntaId);

                                    const opciones: { letra: LetraRespuesta; texto: string }[] = [
                                        { letra: 'A', texto: p.opcionA },
                                        { letra: 'B', texto: p.opcionB },
                                        { letra: 'C', texto: p.opcionC },
                                        { letra: 'D', texto: p.opcionD },
                                    ];
                                    const letraSeleccionada = seleccion[p.preguntaId];

                                    return (
                                        <div key={p.preguntaId} className="bg-white rounded-2xl p-4 sm:p-5 border border-[#c8d8f0] shadow-sm">
                                            {/* Enunciado */}
                                            <div className="flex items-start gap-2.5 mb-4">
                                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#0a1628] text-[#d4af37] text-xs font-black shrink-0 mt-0.5">
                                                    {idx + 1}
                                                </span>
                                                <p className="font-medium text-[#0a1628] text-sm leading-relaxed">{p.texto}</p>
                                            </div>

                                            {/* Opciones A/B/C/D reales */}
                                            <div className="space-y-2.5">
                                                {opciones.map(({ letra, texto }) => {
                                                    const isSelected = letraSeleccionada === letra;
                                                    return (
                                                        <button
                                                            key={letra}
                                                            onClick={() => handleSelect(p.preguntaId, letra)}
                                                            className="w-full flex items-start gap-3 p-2.5 sm:p-3.5 rounded-xl border-2 text-left transition-all duration-200"
                                                            style={{
                                                                borderColor: isSelected ? '#d4af37' : '#c8d8f0',
                                                                background: isSelected
                                                                    ? 'linear-gradient(135deg,#d4af3712,#d4af3706)'
                                                                    : '#fafaf9',
                                                                boxShadow: isSelected ? '0 0 0 3px rgba(212,175,55,0.15)' : 'none',
                                                            }}
                                                        >
                                                            <span
                                                                className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black transition-all duration-200"
                                                                style={{
                                                                    background: isSelected ? '#d4af37' : '#f0ebe3',
                                                                    color: isSelected ? '#0a1628' : '#1e3a6e',
                                                                }}
                                                            >
                                                                {letra}
                                                            </span>
                                                            <span
                                                                className="text-sm leading-snug pt-0.5 transition-colors duration-200"
                                                                style={{ color: isSelected ? '#0a1628' : '#1e3a6e', fontWeight: isSelected ? 600 : 400 }}
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
                                    );
                                })}
                            </div>
                        )}

                        {/* Enviando */}
                        {estado === 'enviando' && (
                            <div className="flex flex-col items-center justify-center py-16 gap-4">
                                <div className="w-10 h-10 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
                                <p className="text-[#1e3a6e] font-lora italic">Evaluando tus respuestas...</p>
                            </div>
                        )}

                        {/* Aprobado */}
                        {estado === 'aprobado' && resultado && (
                            <div className="flex flex-col items-center text-center py-6 gap-5">
                                <ScoreGauge score={resultado.score} />
                                <div>
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full mb-3">
                                        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-emerald-700 font-black text-xs uppercase tracking-widest">¡Aprobado!</span>
                                    </div>
                                    <p className="text-[#1e3a6e] font-lora">Excelente comprensión del fragmento. Ya puedes avanzar al siguiente.</p>
                                </div>
                            </div>
                        )}

                        {/* Refuerzo */}
                        {estado === 'refuerzo' && resultado && (
                            <div className="space-y-5">
                                <div className="flex flex-col items-center text-center gap-4">
                                    <ScoreGauge score={resultado.score} />
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full">
                                        <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-amber-700 font-black text-xs uppercase tracking-widest">Necesitas refuerzo</span>
                                    </div>
                                    <p className="text-[#1e3a6e] font-lora text-sm">
                                        Necesitas al menos {resultado.score >= 0 ? '70' : '?'} puntos.
                                        {evaluacion && evaluacion.intentosRestantes > 0
                                            ? ` Te quedan ${evaluacion.intentosRestantes} intento${evaluacion.intentosRestantes !== 1 ? 's' : ''}.`
                                            : ''}
                                    </p>
                                </div>

                                {/* Apoyos pedagógicos */}
                                {resultado.apoyos?.map((apoyo, idx) => (
                                    <div key={idx} className="bg-white rounded-2xl p-4 border border-[#c8d8f0]">
                                        {apoyo.tipo === 'pista' && (
                                            <>
                                                <p className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest mb-2 flex items-center gap-1">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                    </svg>
                                                    Pista
                                                </p>
                                                <p className="text-sm text-[#1e3a6e] font-lora leading-relaxed">{apoyo.contenido}</p>
                                            </>
                                        )}

                                        {apoyo.tipo === 'glosario' && apoyo.palabras && (
                                            <>
                                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">📖 Palabras clave</p>
                                                <div className="space-y-2">
                                                    {(apoyo.palabras as PalabraGlosario[]).map((item, i) => (
                                                        <div key={i} className="flex gap-2">
                                                            <span className="font-bold text-blue-700 text-sm shrink-0">{item.palabra}:</span>
                                                            <span className="text-sm text-[#1e3a6e] font-lora">{item.definicion}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}

                                        {apoyo.tipo === 'resumen' && (
                                            <>
                                                <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-2">📄 Resumen del fragmento</p>
                                                <p className="text-sm text-[#1e3a6e] font-lora leading-relaxed">{apoyo.contenido}</p>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Intentos agotados */}
                        {estado === 'intentos_agotados' && (
                            <div className="space-y-5">
                                <div className="flex flex-col items-center text-center gap-4 py-4">
                                    {resultado && <ScoreGauge score={resultado.score} />}
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-200 rounded-full">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        <span className="text-gray-600 font-black text-xs uppercase tracking-widest">Intentos agotados</span>
                                    </div>
                                    <p className="text-[#1e3a6e] font-lora text-sm">Usaste todos tus intentos. Puedes continuar leyendo.</p>
                                </div>

                                {/* Todos los apoyos acumulados (pista + glosario + resumen) */}
                                {resultado?.apoyos?.map((apoyo, idx) => (
                                    <div key={idx} className="bg-white rounded-2xl p-4 border border-[#c8d8f0]">
                                        {apoyo.tipo === 'pista' && (
                                            <>
                                                <p className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest mb-2">💡 Pista</p>
                                                <p className="text-sm text-[#1e3a6e] font-lora leading-relaxed">{apoyo.contenido}</p>
                                            </>
                                        )}
                                        {apoyo.tipo === 'glosario' && apoyo.palabras && (
                                            <>
                                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">📖 Palabras clave</p>
                                                <div className="space-y-2">
                                                    {(apoyo.palabras as PalabraGlosario[]).map((item, i) => (
                                                        <div key={i} className="flex gap-2">
                                                            <span className="font-bold text-blue-700 text-sm shrink-0">{item.palabra}:</span>
                                                            <span className="text-sm text-[#1e3a6e] font-lora">{item.definicion}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                        {apoyo.tipo === 'resumen' && (
                                            <>
                                                <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-2">📄 Resumen</p>
                                                <p className="text-sm text-[#1e3a6e] font-lora leading-relaxed">{apoyo.contenido}</p>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 sm:px-6 pb-6 pt-4 border-t border-[#c8d8f0] shrink-0 flex gap-3">
                        {estado === 'pendiente' && (
                            <button
                                onClick={handleSubmit}
                                disabled={!allAnswered}
                                className="flex-1 py-3 rounded-xl bg-[#0a1628] text-[#f5f8ff] font-bold hover:bg-[#1e3a6e] transition-all shadow-lg disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                Enviar respuestas
                            </button>
                        )}

                        {estado === 'refuerzo' && (
                            <>
                                <button
                                    onClick={cerrarPanel}
                                    className="px-4 py-3 rounded-xl border border-[#c8d8f0] text-[#1e3a6e] font-bold hover:bg-white transition-all text-sm"
                                >
                                    Releer
                                </button>
                                <button
                                    onClick={handleReintento}
                                    className="flex-1 py-3 rounded-xl bg-[#d4af37] text-[#0a1628] font-bold hover:bg-[#c19b2f] transition-all shadow-lg flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Reintentar
                                </button>
                            </>
                        )}

                        {(estado === 'aprobado' || estado === 'intentos_agotados') && (
                            <button
                                onClick={handleContinuar}
                                className="flex-1 py-3 rounded-xl bg-[#0a1628] text-[#f5f8ff] font-bold hover:bg-[#1e3a6e] transition-all shadow-lg flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                                {estado === 'aprobado' ? 'Continuar lectura' : 'Seguir leyendo'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}