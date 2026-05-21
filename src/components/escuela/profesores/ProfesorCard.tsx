'use client';

// ============================================================
// COMPONENT — ProfesorCard (Refined Detail View)
// src/components/escuela/profesores/ProfesorCard.tsx
// ============================================================

import React from 'react';

interface ProfesorCardShape {
    id: number;
    nombre: string;
    email: string;
    especialidad: string;
    cantidadGrupos: number;
    cantidadAlumnos: number;
    grupos: { id: number; grado: number; nombre: string; cantidadAlumnos: number }[];
    estado: 'activo' | 'inactivo';
    telefono: string;
    fechaIngreso?: string | null;
}

interface Props {
    profesor: ProfesorCardShape;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
}

export default function ProfesorCard({ profesor, onEdit, onDelete }: Props) {
    // Iniciales
    const palabras = profesor.nombre.trim().split(' ');
    const inicial1 = palabras[0]?.charAt(0).toUpperCase() ?? '';
    const inicial2 = palabras[palabras.length - 1]?.charAt(0).toUpperCase() ?? '';
    const iniciales = `${inicial1}${inicial2}`;

    const formatFecha = (fecha?: string | null) => {
        if (!fecha) return null;
        const d = new Date(fecha);
        return d.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <div className="group bg-gradient-to-br from-white to-[#faf8f5] rounded-2xl p-6 shadow-md hover:shadow-xl border border-[#c8d8f0]/50 hover:border-[#d4af37]/40 transition-all duration-500 hover:-translate-y-1 relative overflow-hidden flex flex-col h-full uppercase-titles">
            {/* Línea acento superior */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#d4af37] to-[#c19a2e]" />

            <div className="relative z-10 flex flex-col h-full">
                {/* ── Header ──────────────────────────────────────────────── */}
                <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0a1628] to-[#1e3a6e] flex items-center justify-center text-[#f5f8ff] font-playfair font-black text-2xl shadow-lg transform group-hover:scale-110 transition-transform duration-500">
                            {iniciales}
                        </div>
                        <div className="min-w-0">
                            <h4 className="font-playfair font-black text-xl text-[#0a1628] group-hover:text-[#d4af37] transition-colors leading-tight truncate">
                                {profesor.nombre}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="px-2 py-0.5 bg-[#d4af37]/10 text-[#d4af37] text-[10px] font-black uppercase tracking-widest rounded-md">
                                    {profesor.especialidad || 'General'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm border ${
                        profesor.estado === 'activo'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-gray-50 text-gray-400 border-gray-100'
                    }`}>
                        {profesor.estado === 'activo' ? '● Activo' : '○ Inactivo'}
                    </span>
                </div>

                {/* ── Contacto ────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 gap-2 mb-5 p-3 bg-white/50 rounded-xl border border-[#c8d8f0]/30">
                    <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-lg bg-[#faf8f5] flex items-center justify-center text-[#d4af37] border border-[#c8d8f0]/20">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span className="text-[#1e3a6e] font-medium truncate">{profesor.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-lg bg-[#faf8f5] flex items-center justify-center text-[#d4af37] border border-[#c8d8f0]/20">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                        </div>
                        <span className="text-[#1e3a6e] font-medium">{profesor.telefono || 'Sin teléfono'}</span>
                    </div>
                </div>

                {/* ── Stats ───────────────────────────────────────────────── */}
                <div className="grid grid-cols-2 gap-4 mb-5">
                    <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-4 border border-blue-100 shadow-sm text-center">
                        <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mb-1">Grupos</p>
                        <p className="text-3xl font-playfair font-black text-blue-700 leading-none">
                            {profesor.cantidadGrupos}
                        </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-4 border border-purple-100 shadow-sm text-center">
                        <p className="text-[10px] text-purple-600 font-black uppercase tracking-widest mb-1">Estudiantes</p>
                        <p className="text-3xl font-playfair font-black text-purple-700 leading-none">
                            {profesor.cantidadAlumnos}
                        </p>
                    </div>
                </div>

                {/* ── Grupos Asignados Detalle ─────────────────────────────── */}
                <div className="flex-grow">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] text-[#6b8cba] font-black uppercase tracking-widest">Desglose de Grupos</p>
                        <span className="w-1/2 h-px bg-gradient-to-r from-[#c8d8f0] to-transparent" />
                    </div>
                    {profesor.grupos.length > 0 ? (
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                            {profesor.grupos.map((g) => (
                                <div key={g.id} className="flex items-center justify-between p-2 bg-white rounded-xl border border-[#c8d8f0]/30 hover:border-[#d4af37]/30 transition-colors shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                                            {g.nombre}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-[#0a1628]">{g.grado}° {g.nombre}</p>
                                            <p className="text-[10px] text-[#6b8cba] font-bold uppercase">Grado {g.grado}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end min-w-[60px]">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-sm font-black text-[#0a1628] leading-none">{g.cantidadAlumnos}</span>
                                            <svg className="w-3 h-3 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <p className="text-[8px] text-[#6b8cba] font-black uppercase tracking-widest mt-1">Estudiantes</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-4 text-center bg-[#f5f8ff]/50 rounded-xl border border-dashed border-[#c8d8f0]">
                            <p className="text-xs text-[#6b8cba] italic">Sin grupos activos</p>
                        </div>
                    )}
                </div>

                {/* ── Acciones ────────────────────────────────────────────── */}
                <div className="flex gap-3 pt-5 border-t border-[#c8d8f0]/40 mt-6">
                    <button
                        onClick={() => onEdit(profesor.id)}
                        className="flex-1 h-11 bg-gradient-to-r from-[#0a1628] to-[#1e3a6e] text-[#f5f8ff] rounded-xl font-black text-[10px] uppercase tracking-widest hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                    </button>
                    <button
                        onClick={() => onDelete(profesor.id)}
                        className="w-11 h-11 flex items-center justify-center border-2 border-[#c8d8f0] text-[#6b8cba] rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all shadow-sm"
                        title="Eliminar"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
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
            `}</style>
        </div>
    );
}