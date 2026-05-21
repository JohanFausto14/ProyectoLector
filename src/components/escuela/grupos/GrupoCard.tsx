'use client';

// ============================================================
// COMPONENT — GrupoCard (Refined Detail View)
// src/components/escuela/grupos/GrupoCard.tsx
// ============================================================

import React, { useState } from 'react';
import type { GrupoListItem } from '../../../types/escuela/grupos/grupo';

interface GrupoCardProps {
    grupo: GrupoListItem;
    onEdit: (grupo: GrupoListItem) => void;
    onDelete: (grupo: GrupoListItem) => void;
}

const gradoColors: Record<number, { gradient: string; text: string; bg: string }> = {
    1: { gradient: 'from-blue-500 to-blue-600', text: 'text-blue-700', bg: 'bg-blue-50' },
    2: { gradient: 'from-purple-500 to-purple-600', text: 'text-purple-700', bg: 'bg-purple-50' },
    3: { gradient: 'from-emerald-500 to-emerald-600', text: 'text-emerald-700', bg: 'bg-emerald-50' },
    4: { gradient: 'from-orange-500 to-orange-600', text: 'text-orange-700', bg: 'bg-orange-50' },
    5: { gradient: 'from-rose-500 to-rose-600', text: 'text-rose-700', bg: 'bg-rose-50' },
    6: { gradient: 'from-teal-500 to-teal-600', text: 'text-teal-700', bg: 'bg-teal-50' },
};

const getGradoColor = (grado: any) => {
    const g = parseInt(String(grado), 10);
    return gradoColors[g] ?? { gradient: 'from-[#d4af37] to-[#c19a2e]', text: 'text-[#1e3a6e]', bg: 'bg-[#f5f8ff]' };
};

const getGradoLabel = (grado: any) => {
    const g = parseInt(String(grado), 10);
    const suffixes: Record<number, string> = { 1: '1er', 2: '2do', 3: '3er' };
    return `${suffixes[g] ?? `${g}°`} Grado`;
};

export const GrupoCard: React.FC<GrupoCardProps> = ({ grupo, onEdit, onDelete }) => {
    const [isViewMode, setIsViewMode] = useState(false);
    const color = getGradoColor(grupo.grado);
    const numAlumnos = grupo.alumnos?.length ?? 0;

    // Log para depuración solicitado por el usuario
    console.log(`🔍 [DEBUG Card] Grupo: ${grupo.nombre}`, {
        raw: grupo,
        keys: Object.keys(grupo),
        hasAlumnos: 'alumnos' in grupo,
        alumnosType: typeof (grupo as any).alumnos
    });

    return (
        <div className={`group bg-white rounded-2xl shadow-md hover:shadow-xl border border-[#c8d8f0]/50 transition-all duration-500 h-[360px] flex flex-col relative overflow-hidden hover:scale-[1.02] ${!grupo.activo ? 'opacity-70' : ''}`}>
            {/* Línea acento superior */}
            <div className="h-1 bg-gradient-to-r from-[#d4af37] to-[#c19a2e]" />

            {/* Status Badge in Corner */}
            {!isViewMode && (
                <div className="absolute top-4 right-4 z-20">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm border ${
                        grupo.activo
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-gray-50 text-gray-400 border-gray-100'
                    }`}>
                        {grupo.activo ? '● Activo' : '○ Inactivo'}
                    </span>
                </div>
            )}

            <div className="p-5 flex flex-col h-full z-10">
                {!isViewMode ? (
                    /* — VISTA GENERAL — */
                    <>
                        <div className="flex items-start justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color.gradient} flex items-center justify-center text-white font-playfair font-bold text-2xl shadow-md`}>
                                    {grupo.nombre}
                                </div>
                                <div>
                                    <h4 className="font-playfair font-black text-xl text-[#0a1628]">
                                        Grupo {grupo.nombre}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${color.text}`}>
                                            {getGradoLabel(grupo.grado)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 flex-grow">
                            {/* Maestro */}
                            <div className="flex items-center gap-3 bg-[#f5f8ff] rounded-xl p-3 border border-[#c8d8f0]/40">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#d4af37] border border-[#c8d8f0] shadow-sm font-bold text-sm">
                                    {grupo.maestros?.[0]?.nombre.charAt(0).toUpperCase() ?? '?'}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] text-[#6b8cba] font-black uppercase tracking-widest">Maestro</p>
                                    <p className="text-sm font-bold text-[#0a1628] truncate">
                                        {grupo.maestros?.[0]?.nombre ?? 'Sin asignar'}
                                    </p>
                                </div>
                            </div>

                            {/* Alumnos Summary */}
                            <div className="bg-white rounded-xl p-3 border border-[#c8d8f0]/30 flex items-center justify-between group-hover:border-[#d4af37]/40 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#faf8f5] flex items-center justify-center text-[#d4af37]">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-[#6b8cba] font-black uppercase tracking-widest">Estudiantes</p>
                                        <p className="text-sm font-black text-[#0a1628]">{numAlumnos} Inscritos</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsViewMode(true)}
                                    className="px-4 py-2 bg-[#0a1628] text-[#f5f8ff] rounded-lg text-xs font-black uppercase tracking-widest hover:bg-[#1e3a6e] transition-colors shadow-sm active:scale-95"
                                >
                                    Ver
                                </button>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex gap-2 pt-4 border-t border-[#c8d8f0]/30 mt-4">
                            <button
                                onClick={() => onEdit(grupo)}
                                className="flex-1 py-2.5 bg-[#f5f8ff] border border-[#c8d8f0] text-[#1e3a6e] rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#c8d8f0]/50 transition-all flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Editar
                            </button>
                            <button
                                onClick={() => onDelete(grupo)}
                                className="p-2.5 bg-white border border-[#c8d8f0] text-[#6b8cba] rounded-xl hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </>
                ) : (
                    /* — VISTA DE ALUMNOS (DETALLE) — */
                    <div className="flex flex-col h-full animate-fade-in">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h5 className="text-[10px] text-[#6b8cba] font-black uppercase tracking-widest">Lista de Alumnos</h5>
                                <p className="text-lg font-black text-[#0a1628]">Grupo {grupo.nombre}</p>
                            </div>
                            <button
                                onClick={() => setIsViewMode(false)}
                                className="p-2 hover:bg-[#f5f8ff] rounded-full text-[#6b8cba] hover:text-[#0a1628] transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-grow bg-[#f5f8ff]/50 border-2 border-[#f5f8ff] rounded-2xl overflow-hidden p-2">
                            {numAlumnos > 0 ? (
                                <div className="h-full overflow-y-auto pr-1 custom-scrollbar space-y-2">
                                    {(() => {
                                        // Intentar formatear y ordenar por apellidos
                                        // Formato esperado: "Nombre ApellidoPaterno ApellidoMaterno"
                                        // Queremos mostrar y ordenar como: "ApellidoPaterno ApellidoMaterno Nombre"
                                        const sortedAlumnos = [...(grupo.alumnos || [])].sort((a, b) => {
                                            const partsA = a.split(' ');
                                            const partsB = b.split(' ');
                                            
                                            // Asumimos que los apellidos están al final
                                            // (Esto es una aproximación para strings planos)
                                            const nameA = partsA[0];
                                            const surnamesA = partsA.slice(1).join(' ');
                                            const formattedA = `${surnamesA} ${nameA}`.trim();

                                            const nameB = partsB[0];
                                            const surnamesB = partsB.slice(1).join(' ');
                                            const formattedB = `${surnamesB} ${nameB}`.trim();

                                            return formattedA.localeCompare(formattedB);
                                        });

                                        return sortedAlumnos.map((rawName, idx) => {
                                            const parts = rawName.split(' ');
                                            const name = parts[0];
                                            const surnames = parts.slice(1).join(' ');
                                            const displayName = surnames ? `${surnames} ${name}` : name;

                                            return (
                                                <div key={idx} className="flex items-center gap-3 p-2 bg-white rounded-xl shadow-sm border border-[#c8d8f0]/20 group/item transition-all hover:translate-x-1">
                                                    <div className="w-6 h-6 rounded-full bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] text-[10px] font-black">
                                                        {idx + 1}
                                                    </div>
                                                    <span className="text-sm font-bold text-[#1e3a6e]">{displayName}</span>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 text-[#c8d8f0]">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-sm text-[#6b8cba] font-bold">Aún no hay alumnos</p>
                                    <p className="text-xs text-[#6b8cba]/60 mt-1">Sincroniza alumnos para verlos aquí.</p>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setIsViewMode(false)}
                            className="mt-4 w-full py-3 bg-[#faf8f5] text-[#1e3a6e] rounded-xl text-xs font-black uppercase tracking-widest border border-[#c8d8f0] hover:bg-[#c8d8f0]/30 transition-colors"
                        >
                            Regresar
                        </button>
                    </div>
                )}
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #c8d8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #d4af37;
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};