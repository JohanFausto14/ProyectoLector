'use client';

import { useState, useEffect } from 'react';
import { TarjetaEstadistica } from '../../../components/alumno/TarjetaEstadistica';
import { AlumnoService } from '../../../service/alumno/alumno.service';
import { AlumnoLibrosService } from '../../../service/alumno/libros.service';
import { EstadisticasAlumno } from '../../../types/alumno/alumno';
import { LibroAlumno } from '../../../types/alumno/libros';

// ── Barra de progreso animada ──────────────────────────────────────────────
function BarraProgreso({ porcentaje, color = '#d4af37' }: { porcentaje: number; color?: string }) {
    const [width, setWidth] = useState(0);
    useEffect(() => {
        const t = setTimeout(() => setWidth(Math.min(porcentaje, 100)), 120);
        return () => clearTimeout(t);
    }, [porcentaje]);
    return (
        <div className="w-full h-2.5 bg-[#e3dac9]/60 rounded-full overflow-hidden">
            <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${width}%`, background: `linear-gradient(90deg, ${color}cc, ${color})` }}
            />
        </div>
    );
}

// ── Gráfica de barras verticales (SVG puro) ───────────────────────────────
function GraficaBarras({ libros }: { libros: LibroAlumno[] }) {
    const top = libros.slice(0, 6);
    const maxH = 120;
    const barW = 36;
    const gap = 16;
    const totalW = top.length * (barW + gap) - gap;

    return (
        <div className="overflow-x-auto">
            <svg width={Math.max(totalW, 300)} height={160} className="mx-auto">
                {top.map((libro, i) => {
                    const h = Math.max(4, (libro.progresoPorcentaje / 100) * maxH);
                    const x = i * (barW + gap);
                    const y = maxH - h;
                    return (
                        <g key={libro.libroId}>
                            {/* Barra fondo */}
                            <rect x={x} y={0} width={barW} height={maxH} rx={6} fill="#e3dac9" opacity={0.4} />
                            {/* Barra progreso */}
                            <rect x={x} y={y} width={barW} height={h} rx={6} fill="url(#grad)" />
                            {/* Porcentaje */}
                            <text
                                x={x + barW / 2}
                                y={y - 6}
                                textAnchor="middle"
                                fontSize={10}
                                fontWeight="bold"
                                fill="#2b1b17"
                            >
                                {libro.progresoPorcentaje}%
                            </text>
                            {/* Etiqueta abajo */}
                            <text
                                x={x + barW / 2}
                                y={maxH + 18}
                                textAnchor="middle"
                                fontSize={9}
                                fill="#8d6e3f"
                            >
                                {libro.materia.length > 7 ? libro.materia.slice(0, 7) + '…' : libro.materia}
                            </text>
                        </g>
                    );
                })}
                <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#d4af37" />
                        <stop offset="100%" stopColor="#b8891a" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
}

// ── Indicador circular (SVG) ───────────────────────────────────────────────
function CircularProgress({ value, max, label, color = '#d4af37' }: {
    value: number; max: number; label: string; color?: string;
}) {
    const r = 36;
    const circ = 2 * Math.PI * r;
    const pct = Math.min(value / max, 1);
    const dash = pct * circ;
    return (
        <div className="flex flex-col items-center gap-2">
            <svg width={90} height={90} viewBox="0 0 90 90">
                <circle cx={45} cy={45} r={r} fill="none" stroke="#e3dac9" strokeWidth={8} />
                <circle
                    cx={45} cy={45} r={r} fill="none"
                    stroke={color} strokeWidth={8}
                    strokeDasharray={`${dash} ${circ}`}
                    strokeLinecap="round"
                    transform="rotate(-90 45 45)"
                    style={{ transition: 'stroke-dasharray 1s ease' }}
                />
                <text x={45} y={50} textAnchor="middle" fontSize={15} fontWeight="bold" fill="#2b1b17">
                    {value}
                </text>
            </svg>
            <p className="text-xs text-[#8d6e3f] font-medium text-center">{label}</p>
        </div>
    );
}

// ── Página principal ───────────────────────────────────────────────────────
export default function StatsPage() {
    const [stats, setStats] = useState<EstadisticasAlumno | null>(null);
    const [libros, setLibros] = useState<LibroAlumno[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [tabActiva, setTabActiva] = useState<'resumen' | 'libros'>('resumen');

    useEffect(() => {
        let mounted = true;
        Promise.all([
            AlumnoService.getEstadisticas(),
            AlumnoLibrosService.getMisLibros(),
        ])
            .then(([statsData, librosData]) => {
                if (mounted) {
                    setStats(statsData);
                    setLibros(librosData);
                }
            })
            .catch(console.error)
            .finally(() => { if (mounted) setIsLoading(false); });
        return () => { mounted = false; };
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center h-64 gap-4">
                <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-[#a1887f] font-lora italic">Cargando estadísticas…</p>
            </div>
        );
    }

    if (!stats) return null;

    const horasTotales = Math.floor(stats.tiempoTotalMinutos / 60);
    const minsTotales = stats.tiempoTotalMinutos % 60;
    const tiempoLeidoFormat = horasTotales > 0 ? `${horasTotales}h ${minsTotales}m` : `${minsTotales}m`;

    const librosEnProgreso = libros.filter(l => l.progresoPorcentaje > 0 && l.progresoPorcentaje < 100);
    const librosCompletos = libros.filter(l => l.progresoPorcentaje >= 100);
    const promedioProgreso = libros.length
        ? Math.round(libros.reduce((s, l) => s + l.progresoPorcentaje, 0) / libros.length)
        : 0;

    const tabs = [
        { key: 'resumen', label: 'Resumen General' },
        { key: 'libros', label: 'Progreso por Libro' },
    ] as const;

    return (
        <div className="animate-fade-in space-y-8">

            {/* ── Tabs ── */}
            <div className="flex gap-2 border-b border-[#e3dac9] pb-0">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setTabActiva(tab.key)}
                        className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-all duration-200 border-b-2
                            ${tabActiva === tab.key
                                ? 'border-[#d4af37] text-[#2b1b17] bg-white shadow-sm'
                                : 'border-transparent text-[#a1887f] hover:text-[#2b1b17]'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ══ TAB: RESUMEN ══════════════════════════════════════════════ */}
            {tabActiva === 'resumen' && (
                <div className="space-y-8">

                    {/* Tarjetas KPI */}
                    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <TarjetaEstadistica
                            label="Libros Leídos"
                            value={stats.librosLeidos.toString()}
                            subtext={`${stats.librosEnProgreso} en progreso`}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </TarjetaEstadistica>

                        <TarjetaEstadistica
                            label="Tiempo de Lectura"
                            value={tiempoLeidoFormat}
                            subtext={`${stats.tiempoEsteMesMinutos}m este mes`}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </TarjetaEstadistica>

                        <TarjetaEstadistica
                            label="Puntaje Promedio"
                            value={`${stats.promedioEvaluaciones}%`}
                            subtext={`${stats.segmentosCompletados} secciones completadas`}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </TarjetaEstadistica>

                        <TarjetaEstadistica
                            label="Racha Actual"
                            value={`${stats.rachaActualDias} días`}
                            subtext={`Máxima: ${stats.rachaMaximaDias} días`}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                            </svg>
                        </TarjetaEstadistica>
                    </section>

                    {/* Gráfica + Métricas circulares */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Gráfica de barras */}
                        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-[#e3dac9]/50 p-6">
                            <h3 className="font-playfair text-lg font-bold text-[#2b1b17] mb-1">
                                Progreso por Materia
                            </h3>
                            <p className="text-xs text-[#a1887f] font-lora italic mb-5">
                                Porcentaje de avance en cada libro asignado
                            </p>
                            {libros.length > 0
                                ? <GraficaBarras libros={libros} />
                                : <p className="text-center text-[#a1887f] text-sm py-8">Sin libros asignados aún</p>
                            }
                        </div>

                        {/* Métricas circulares */}
                        <div className="bg-white rounded-2xl shadow-md border border-[#e3dac9]/50 p-6">
                            <h3 className="font-playfair text-lg font-bold text-[#2b1b17] mb-5">
                                Indicadores Clave
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <CircularProgress
                                    value={stats.rachaActualDias}
                                    max={Math.max(stats.rachaMaximaDias, 30)}
                                    label="Racha actual"
                                    color="#d4af37"
                                />
                                <CircularProgress
                                    value={stats.promedioEvaluaciones}
                                    max={100}
                                    label="Promedio eval."
                                    color="#4caf50"
                                />
                                <CircularProgress
                                    value={promedioProgreso}
                                    max={100}
                                    label="Progreso global"
                                    color="#2196f3"
                                />
                                <CircularProgress
                                    value={stats.anotacionesTotales}
                                    max={Math.max(stats.anotacionesTotales, 20)}
                                    label="Anotaciones"
                                    color="#9c27b0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actividad reciente */}
                    <div className="bg-white rounded-2xl shadow-md border border-[#e3dac9]/50 p-6">
                        <h3 className="font-playfair text-lg font-bold text-[#2b1b17] mb-4">
                            Actividad Reciente
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                                { label: 'Secciones completadas', value: stats.segmentosCompletados, icon: '📖', color: '#d4af37' },
                                { label: 'Anotaciones totales', value: stats.anotacionesTotales, icon: '✏️', color: '#9c27b0' },
                                { label: 'Libros completos', value: librosCompletos.length, icon: '✅', color: '#4caf50' },
                                { label: 'En progreso', value: librosEnProgreso.length, icon: '🔄', color: '#2196f3' },
                            ].map(item => (
                                <div key={item.label}
                                    className="flex flex-col items-center p-4 rounded-xl border border-[#e3dac9]/60 bg-[#faf8f5] hover:shadow-md transition-shadow duration-200">
                                    <span className="text-2xl mb-2">{item.icon}</span>
                                    <span className="text-2xl font-playfair font-bold" style={{ color: item.color }}>
                                        {item.value}
                                    </span>
                                    <span className="text-xs text-[#a1887f] text-center mt-1">{item.label}</span>
                                </div>
                            ))}
                        </div>
                        {stats.ultimaActividad && (
                            <p className="text-xs text-[#a1887f] font-lora italic mt-4 text-right">
                                Última actividad: {new Date(stats.ultimaActividad).toLocaleDateString('es-MX', {
                                    day: 'numeric', month: 'long', year: 'numeric',
                                })}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* ══ TAB: LIBROS ══════════════════════════════════════════════ */}
            {tabActiva === 'libros' && (
                <div className="space-y-4">
                    {libros.length === 0 ? (
                        <div className="text-center py-16 text-[#a1887f] font-lora italic">
                            No tienes libros asignados aún.
                        </div>
                    ) : (
                        libros
                            .slice()
                            .sort((a, b) => b.progresoPorcentaje - a.progresoPorcentaje)
                            .map(libro => {
                                const completado = libro.progresoPorcentaje >= 100;
                                const sinIniciar = libro.progresoPorcentaje === 0;
                                const barColor = completado ? '#4caf50' : sinIniciar ? '#a1887f' : '#d4af37';
                                const badge = completado ? '✅ Completado' : sinIniciar ? '📌 Sin iniciar' : '📖 En progreso';
                                const badgeBg = completado
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : sinIniciar
                                        ? 'bg-gray-50 text-gray-500 border-gray-200'
                                        : 'bg-amber-50 text-amber-700 border-amber-200';

                                return (
                                    <div key={libro.libroId}
                                        className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-[#e3dac9]/50 p-5 transition-all duration-200">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                                            {/* Info libro */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <h4 className="font-playfair font-bold text-[#2b1b17] text-base truncate">
                                                        {libro.titulo}
                                                    </h4>
                                                    <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${badgeBg}`}>
                                                        {badge}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-[#a1887f] mb-3">
                                                    {libro.materia} · {libro.grado}
                                                    {libro.autor && ` · ${libro.autor}`}
                                                </p>
                                                <BarraProgreso porcentaje={libro.progresoPorcentaje} color={barColor} />
                                            </div>

                                            {/* Porcentaje */}
                                            <div className="flex flex-col items-center shrink-0">
                                                <span className="text-3xl font-playfair font-bold"
                                                    style={{ color: barColor }}>
                                                    {libro.progresoPorcentaje}%
                                                </span>
                                                {libro.ultimaLectura && (
                                                    <span className="text-[10px] text-[#a1887f] mt-1 whitespace-nowrap">
                                                        Última lectura: {new Date(libro.ultimaLectura).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                    )}
                </div>
            )}
        </div>
    );
}
