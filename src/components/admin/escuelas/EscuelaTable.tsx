'use client';

import React, { useState } from 'react';
import type { EscuelaListItem } from '../../../types/admin/escuelas/escuela';

interface EscuelaTableProps {
    escuelas: EscuelaListItem[];
    onEdit: (escuela: EscuelaListItem) => void;
    onDelete: (escuela: EscuelaListItem) => void;
}

// ── Fila individual con detalle expandible ───────────────────
const EscuelaRow: React.FC<{
    escuela: EscuelaListItem;
    onEdit: (e: EscuelaListItem) => void;
    onDelete: (e: EscuelaListItem) => void;
}> = ({ escuela, onEdit, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const estadoConfig = {
        activa: { color: 'bg-emerald-100 text-emerald-700', label: '✓ Activa' },
        suspendida: { color: 'bg-red-100 text-red-700', label: '✗ Suspendida' },
        inactiva: { color: 'bg-gray-100 text-gray-600', label: '○ Inactiva' },
    };

    const estado = estadoConfig[escuela.estado] ?? estadoConfig.inactiva;
    const directoresTexto = escuela.directores && escuela.directores.length > 0
        ? escuela.directores.join(', ')
        : (escuela.director ? `${escuela.director.nombre} ${escuela.director.apellido}` : null);

    return (
        <>
            {/* ── Fila principal ── */}
            <tr className={`block md:table-row bg-white md:bg-transparent mb-4 md:mb-0 rounded-xl md:rounded-none shadow-sm md:shadow-none border border-[#c8d8f0] md:border-0 hover:bg-[#f5f8ff] transition-colors duration-200 ${isExpanded ? 'bg-[#f5f8ff] md:bg-[#f5f8ff]' : ''}`}>

                {/* Escuela */}
                <td className="block md:table-cell px-4 md:px-6 py-3 md:py-4 border-b border-[#c8d8f0]/30 md:border-0 relative">
                    <span className="md:hidden text-[10px] font-bold uppercase text-[#6b8cba] mb-2 block">Escuela</span>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#c19a2e] flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
                            {escuela.nombre.charAt(0)}
                        </div>
                        <div>
                            <div className="font-playfair font-bold text-[#0a1628]">{escuela.nombre}</div>
                            <div className="text-xs text-[#6b8cba] mt-0.5">{escuela.nivel}</div>
                            {escuela.clave && (
                                <div className="text-xs text-[#6b8cba] font-mono">{escuela.clave}</div>
                            )}
                        </div>
                    </div>
                </td>

                {/* Director */}
                <td className="block md:table-cell px-4 md:px-6 py-3 md:py-4 border-b border-[#c8d8f0]/30 md:border-0">
                    <span className="md:hidden text-[10px] font-bold uppercase text-[#6b8cba] mb-2 block">Director</span>
                    {directoresTexto ? (
                        <div>
                            <div className="font-medium text-[#0a1628] text-sm">{directoresTexto}</div>
                            {escuela.director?.correo && (
                                <div className="text-xs text-[#6b8cba]">{escuela.director.correo}</div>
                            )}
                        </div>
                    ) : (
                        <span className="text-sm text-[#6b8cba] italic">Sin director asignado</span>
                    )}
                </td>

                {/* Ubicación */}
                <td className="block md:table-cell px-4 md:px-6 py-3 md:py-4 border-b border-[#c8d8f0]/30 md:border-0">
                    <span className="md:hidden text-[10px] font-bold uppercase text-[#6b8cba] mb-2 block">Ubicación</span>
                    {escuela.ciudad || escuela.estadoRegion ? (
                        <div className="text-sm">
                            <div className="font-medium text-[#0a1628] flex items-center gap-1">
                                <svg className="w-3.5 h-3.5 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {escuela.ciudad ?? '—'}
                            </div>
                            <div className="text-xs text-[#6b8cba]">{escuela.estadoRegion ?? ''}</div>
                        </div>
                    ) : (
                        <span className="text-sm text-[#6b8cba] italic">Sin ubicación</span>
                    )}
                </td>

                {/* Estadísticas */}
                <td className="block md:table-cell px-4 md:px-6 py-3 md:py-4 border-b border-[#c8d8f0]/30 md:border-0">
                    <span className="md:hidden text-[10px] font-bold uppercase text-[#6b8cba] mb-2 block">Estadísticas</span>
                    <div className="flex gap-3">
                        <div className="text-center flex-1 md:flex-none">
                            <div className="text-xs text-[#6b8cba] font-bold uppercase">Alumnos</div>
                            <div className="text-base font-playfair font-bold text-blue-600">
                                {escuela.alumnosRegistrados ?? escuela.estadisticas?.alumnos ?? 0}
                            </div>
                        </div>
                        <div className="text-center border-l border-r border-[#c8d8f0] px-3 flex-1 md:flex-none">
                            <div className="text-xs text-[#6b8cba] font-bold uppercase">Profes</div>
                            <div className="text-base font-playfair font-bold text-purple-600">
                                {escuela.profesores ?? escuela.estadisticas?.profesores ?? 0}
                            </div>
                        </div>
                        <div className="text-center flex-1 md:flex-none">
                            <div className="text-xs text-[#6b8cba] font-bold uppercase">Grupos</div>
                            <div className="text-base font-playfair font-bold text-emerald-600">
                                {escuela.grupos ?? escuela.estadisticas?.grupos ?? 0}
                            </div>
                        </div>
                    </div>
                </td>

                {/* Estado */}
                <td className="block md:table-cell px-4 md:px-6 py-3 md:py-4 border-b border-[#c8d8f0]/30 md:border-0 md:text-center">
                    <span className="md:hidden text-[10px] font-bold uppercase text-[#6b8cba] mb-2 block">Estado</span>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold inline-block whitespace-nowrap ${estado.color}`}>
                        {estado.label}
                    </span>
                </td>

                {/* Acciones */}
                <td className="block md:table-cell px-4 md:px-6 py-3 md:py-4 flex md:table-cell justify-between items-center bg-[#f5f8ff]/50 md:bg-transparent rounded-b-xl md:rounded-none">
                    <span className="md:hidden text-[10px] font-bold uppercase text-[#6b8cba]">Acciones</span>
                    <div className="flex items-center gap-2 md:justify-center">
                        {/* Expandir */}
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className={`p-2 rounded-lg transition-all duration-200 ${isExpanded
                                ? 'bg-[#d4af37] text-white'
                                : 'hover:bg-[#d4af37]/10 text-[#6b8cba]'
                                }`}
                            title="Ver detalles"
                        >
                            <svg
                                className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Editar */}
                        <button
                            onClick={() => onEdit(escuela)}
                            className="p-2 hover:bg-blue-50 rounded-lg text-[#6b8cba] hover:text-blue-600 transition-colors"
                            title="Editar"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>

                        {/* Eliminar */}
                        <button
                            onClick={() => onDelete(escuela)}
                            className="p-2 hover:bg-red-50 rounded-lg text-[#6b8cba] hover:text-red-600 transition-colors"
                            title="Eliminar"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>

            {/* ── Fila expandible con detalle ── */}
            {isExpanded && (
                <tr className="block md:table-row bg-[#f5f8ff]/30 rounded-b-xl md:rounded-none">
                    <td colSpan={6} className="block md:table-cell px-4 md:px-8 py-4 md:py-6">
                        <div className="bg-white rounded-xl border border-[#c8d8f0] shadow-sm overflow-hidden">
                            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#c8d8f0]">

                                {/* Datos generales */}
                                <div className="p-5">
                                    <h4 className="text-[#d4af37] font-bold text-xs uppercase tracking-wider mb-4">
                                        🏫 Datos Generales
                                    </h4>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-[10px] text-[#6b8cba] font-bold uppercase">Nombre</p>
                                            <p className="text-sm text-[#0a1628]">{escuela.nombre}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <p className="text-[10px] text-[#6b8cba] font-bold uppercase">Nivel</p>
                                                <p className="text-sm text-[#0a1628]">{escuela.nivel}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-[#6b8cba] font-bold uppercase">Clave</p>
                                                <p className="text-sm text-[#0a1628] font-mono">{escuela.clave ?? '—'}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-[#6b8cba] font-bold uppercase">ID</p>
                                            <p className="text-sm text-[#0a1628]">#{escuela.id}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Contacto y ubicación */}
                                <div className="p-5 bg-[#f5f8ff]/20">
                                    <h4 className="text-[#d4af37] font-bold text-xs uppercase tracking-wider mb-4">
                                        📍 Contacto y Ubicación
                                    </h4>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-[10px] text-[#6b8cba] font-bold uppercase">Teléfono</p>
                                            <p className="text-sm text-[#0a1628]">{escuela.telefono ?? '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-[#6b8cba] font-bold uppercase">Dirección</p>
                                            <p className="text-sm text-[#0a1628]">{escuela.direccion ?? '—'}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <p className="text-[10px] text-[#6b8cba] font-bold uppercase">Ciudad</p>
                                                <p className="text-sm text-[#0a1628]">{escuela.ciudad ?? '—'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-[#6b8cba] font-bold uppercase">Estado</p>
                                                <p className="text-sm text-[#0a1628]">{escuela.estadoRegion ?? '—'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Director y estadísticas */}
                                <div className="p-5">
                                    <h4 className="text-[#d4af37] font-bold text-xs uppercase tracking-wider mb-4">
                                        👤 Director y Estadísticas
                                    </h4>
                                    <div className="space-y-3">
                                        {directoresTexto ? (
                                            <>
                                                <div>
                                                    <p className="text-[10px] text-[#6b8cba] font-bold uppercase">Director(es)</p>
                                                    <p className="text-sm text-[#0a1628]">{directoresTexto}</p>
                                                </div>
                                                {escuela.director?.correo && (
                                                    <div>
                                                        <p className="text-[10px] text-[#6b8cba] font-bold uppercase">Correo Director</p>
                                                        <p className="text-sm text-[#0a1628] break-all">{escuela.director.correo}</p>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <p className="text-sm text-[#6b8cba] italic">Sin director asignado</p>
                                        )}
                                        <div className="pt-2 border-t border-[#c8d8f0]">
                                            <div className="grid grid-cols-3 gap-2 text-center">
                                                <div>
                                                    <p className="text-[10px] text-[#6b8cba] font-bold uppercase">Alumnos</p>
                                                    <p className="text-lg font-playfair font-bold text-blue-600">{escuela.alumnosRegistrados ?? escuela.estadisticas?.alumnos ?? 0}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-[#6b8cba] font-bold uppercase">Profes</p>
                                                    <p className="text-lg font-playfair font-bold text-purple-600">{escuela.profesores ?? escuela.estadisticas?.profesores ?? 0}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-[#6b8cba] font-bold uppercase">Grupos</p>
                                                    <p className="text-lg font-playfair font-bold text-emerald-600">{escuela.grupos ?? escuela.estadisticas?.grupos ?? 0}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

// ── Tabla principal ──────────────────────────────────────────
export const EscuelaTable: React.FC<EscuelaTableProps> = ({
    escuelas,
    onEdit,
    onDelete,
}) => {
    if (escuelas.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-20 h-20 bg-[#f5f8ff] rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-10 h-10 text-[#6b8cba]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                </div>
                <h3 className="font-playfair text-xl font-bold text-[#0a1628] mb-2">No se encontraron escuelas</h3>
                <p className="text-[#6b8cba]">Intenta con otros términos de búsqueda o filtros</p>
            </div>
        );
    }

    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full block md:table">
                <thead className="hidden md:table-header-group bg-[#dce8f8]">
                    <tr className="block md:table-row">
                        <th className="px-6 py-4 text-center text-xs font-bold text-[#1a2d5a] uppercase tracking-wider">Escuela</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-[#1a2d5a] uppercase tracking-wider">Director</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-[#1a2d5a] uppercase tracking-wider">Ubicación</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-[#1a2d5a] uppercase tracking-wider">Estadísticas</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-[#1a2d5a] uppercase tracking-wider">Estado</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-[#1a2d5a] uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody className="block md:table-row-group divide-y md:divide-y md:divide-[#c8d8f0] space-y-4 md:space-y-0 p-4 md:p-0">
                    {escuelas.map((escuela) => (
                        <EscuelaRow
                            key={escuela.id}
                            escuela={escuela}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};