'use client';

import React from 'react';
import { Libro } from '../../../types/libros/libro';

interface AdminLibroTableProps {
    libros: Libro[];
    onView: (libro: Libro) => void;
    onDelete: (libro: Libro) => void;
    onAssign: (libro: Libro) => void;
    onDownload: (libro: Libro) => void;
    onToggleActivo?: (libro: Libro, activo: boolean) => void;
    isLoading?: boolean;
}

export const AdminLibroTable: React.FC<AdminLibroTableProps> = ({
    libros,
    onView,
    onDelete,
    onAssign,
    onDownload,
    onToggleActivo,
    isLoading = false,
}) => {
    if (libros.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-20 h-20 bg-[#f5f8ff] rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-10 h-10 text-[#6b8cba]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747 0-6.002-4.5-10.747-10-10.747z"></path>
                    </svg>
                </div>
                <h3 className="font-playfair text-xl font-bold text-[#0a1628] mb-2">No se encontraron libros</h3>
                <p className="text-[#6b8cba]">Carga un nuevo libro para comenzar</p>
            </div>
        );
    }

    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full block md:table">
                <thead className="hidden md:table-header-group bg-[#dce8f8]">
                    <tr className="block md:table-row">
                        <th className="px-6 py-4 text-center text-xs font-bold text-[#1a2d5a] uppercase tracking-wider">Título</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-[#1a2d5a] uppercase tracking-wider">Código</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-[#1a2d5a] uppercase tracking-wider">Grado</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-[#1a2d5a] uppercase tracking-wider">Materia</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-[#1a2d5a] uppercase tracking-wider">Páginas</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-[#1a2d5a] uppercase tracking-wider">Estado</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-[#1a2d5a] uppercase tracking-wider">Activo</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-[#1a2d5a] uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody className="block md:table-row-group divide-y md:divide-y md:divide-[#c8d8f0] space-y-4 md:space-y-0 p-4 md:p-0">
                    {libros.map(libro => (
                        <tr key={libro.id} className="block md:table-row bg-white md:bg-transparent mb-4 md:mb-0 rounded-xl md:rounded-none shadow-sm md:shadow-none border border-[#c8d8f0] md:border-b md:border-transparent hover:bg-[#f9f7f4] transition-colors relative">
                            <td className="block md:table-cell px-4 md:px-6 py-3 md:py-4 border-b border-[#c8d8f0]/30 md:border-0 relative">
                                <span className="md:hidden text-[10px] font-bold uppercase text-[#6b8cba] mb-2 block">Título</span>
                                <span className="font-semibold text-[#0a1628] hover:text-[#d4af37] cursor-pointer transition-colors block md:inline" onClick={() => onView(libro)}>
                                    {libro.titulo}
                                </span>
                            </td>
                            <td className="block md:table-cell px-4 md:px-6 py-3 md:py-4 border-b border-[#c8d8f0]/30 md:border-0 md:text-center">
                                <span className="md:hidden text-[10px] font-bold uppercase text-[#6b8cba] mb-2 block">Código</span>
                                <span className="text-[#1e3a6e] text-sm font-mono block md:inline">{libro.codigo}</span>
                            </td>
                            <td className="block md:table-cell px-4 md:px-6 py-3 md:py-4 border-b border-[#c8d8f0]/30 md:border-0 md:text-center">
                                <span className="md:hidden text-[10px] font-bold uppercase text-[#6b8cba] mb-2 block">Grado</span>
                                <span className="text-[#1e3a6e] block md:inline">{libro.grado}°</span>
                            </td>
                            <td className="block md:table-cell px-4 md:px-6 py-3 md:py-4 border-b border-[#c8d8f0]/30 md:border-0 md:text-center">
                                <span className="md:hidden text-[10px] font-bold uppercase text-[#6b8cba] mb-2 block">Materia</span>
                                <span className="text-[#1e3a6e] text-sm block md:inline">{libro.materia?.nombre || '—'}</span>
                            </td>
                            <td className="block md:table-cell px-4 md:px-6 py-3 md:py-4 border-b border-[#c8d8f0]/30 md:border-0 md:text-center">
                                <span className="md:hidden text-[10px] font-bold uppercase text-[#6b8cba] mb-2 block">Páginas</span>
                                <span className="text-[#1e3a6e] block md:inline">{libro.numPaginas}</span>
                            </td>
                            <td className="block md:table-cell px-4 md:px-6 py-3 md:py-4 border-b border-[#c8d8f0]/30 md:border-0 md:text-center">
                                <span className="md:hidden text-[10px] font-bold uppercase text-[#6b8cba] mb-2 block">Estado</span>
                                {libro.estado === 'listo' && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 whitespace-nowrap">
                                        <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                                        Listo
                                    </span>
                                )}
                                {libro.estado === 'procesando' && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 whitespace-nowrap">
                                        <span className="w-2 h-2 bg-yellow-600 rounded-full mr-2 animate-pulse"></span>
                                        Procesando
                                    </span>
                                )}
                                {libro.estado === 'error' && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 whitespace-nowrap">
                                        <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                                        Error
                                    </span>
                                )}
                            </td>
                            <td className="block md:table-cell px-4 md:px-6 py-3 md:py-4 border-b border-[#c8d8f0]/30 md:border-0 md:text-center">
                                <span className="md:hidden text-[10px] font-bold uppercase text-[#6b8cba] mb-2 block">Activo</span>
                                {libro.activo !== false ? (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 whitespace-nowrap">
                                        <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                                        Activo
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 whitespace-nowrap">
                                        <span className="w-2 h-2 bg-gray-600 rounded-full mr-2"></span>
                                        Inactivo
                                    </span>
                                )}
                            </td>
                            <td className="block md:table-cell px-4 md:px-6 py-3 md:py-4 flex md:table-cell justify-between items-center bg-[#f9f7f4]/50 md:bg-transparent rounded-b-xl md:rounded-none">
                                <span className="md:hidden text-[10px] font-bold uppercase text-[#6b8cba]">Acciones</span>
                                <div className="flex justify-end md:justify-center gap-2">
                                    <button
                                        onClick={() => onView(libro)}
                                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600 disabled:opacity-50"
                                        title="Ver detalle"
                                        disabled={isLoading}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => onDownload(libro)}
                                        className="p-2 hover:bg-cyan-100 rounded-lg transition-colors text-cyan-600 disabled:opacity-50"
                                        title="Descargar PDF"
                                        disabled={isLoading || libro.estado !== 'listo'}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => onAssign(libro)}
                                        className="p-2 hover:bg-emerald-100 rounded-lg transition-colors text-emerald-600 disabled:opacity-50"
                                        title="Asignar a escuela"
                                        disabled={isLoading || libro.estado !== 'listo'}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                                        </svg>
                                    </button>
                                    {onToggleActivo && (
                                        <button
                                            onClick={() => onToggleActivo(libro, libro.activo !== false ? false : true)}
                                            className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${libro.activo !== false
                                                ? 'hover:bg-purple-100 text-purple-600'
                                                : 'hover:bg-purple-100 text-purple-400'
                                                }`}
                                            title={libro.activo !== false ? 'Desactivar libro' : 'Activar libro'}
                                            disabled={isLoading}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0-4C6.48 4 2 7.58 2 12s4.48 8 10 8 10-3.58 10-8-4.48-8-10-8z"></path>
                                            </svg>
                                        </button>
                                    )}
                                    <button
                                        onClick={() => onDelete(libro)}
                                        className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600 disabled:opacity-50"
                                        title="Eliminar"
                                        disabled={isLoading}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div >
    );
};
