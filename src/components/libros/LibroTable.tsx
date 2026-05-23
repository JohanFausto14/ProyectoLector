'use client';

import React from 'react';
import { Libro } from '../../data/libros';

interface LibroTableProps {
    libros: Libro[];
    onView: (libro: Libro) => void;
    onEdit: (libro: Libro) => void;
    onDelete: (libro: Libro) => void;
    onAssign: (libro: Libro) => void;
}

export const LibroTable: React.FC<LibroTableProps> = ({
    libros,
    onView,
    onEdit,
    onDelete,
    onAssign,
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
                <p className="text-[#1e3a6e]">Intenta con otros términos de búsqueda o carga un nuevo libro</p>
            </div>
        );
    }

    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full block md:table">
                <thead className="hidden md:table-header-group bg-gradient-to-r from-[#f5f8ff] to-[#f5f8ff]">
                    <tr className="block md:table-row">
                        <th className="px-6 py-4 text-center text-xs font-bold text-[#0a1628] uppercase tracking-wider">Título</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-[#0a1628] uppercase tracking-wider">Autor</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-[#0a1628] uppercase tracking-wider">Año</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-[#0a1628] uppercase tracking-wider">Páginas</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-[#0a1628] uppercase tracking-wider">Editorial</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-[#0a1628] uppercase tracking-wider">Precio</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-[#0a1628] uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody className="block md:table-row-group divide-y md:divide-y md:divide-[#c8d8f0] space-y-4 md:space-y-0 p-4 md:p-0">
                    {libros.map((libro) => (
                        <tr key={libro.id} className="block md:table-row bg-white md:bg-transparent mb-4 md:mb-0 rounded-xl md:rounded-none shadow-sm md:shadow-none border border-[#c8d8f0] md:border-b md:border-transparent hover:bg-[#f9f7f4] transition-colors relative">
                            <td className="block md:table-cell px-4 md:px-6 py-3 md:py-4 border-b border-[#c8d8f0]/30 md:border-0 md:text-center relative">
                                <span className="md:hidden text-[10px] font-bold uppercase text-[#6b8cba] mb-2 block">Título</span>
                                <div className="flex items-center gap-3 md:justify-center">
                                    <div
                                        className="w-10 h-12 rounded flex-shrink-0"
                                        style={{ backgroundColor: libro.coverColor }}
                                    />
                                    <span className="font-semibold text-[#0a1628] hover:text-[#d4af37] cursor-pointer transition-colors" onClick={() => onView(libro)}>
                                        {libro.title}
                                    </span>
                                </div>
                            </td>
                            <td className="block md:table-cell px-4 md:px-6 py-3 md:py-4 border-b border-[#c8d8f0]/30 md:border-0 md:text-center">
                                <span className="md:hidden text-[10px] font-bold uppercase text-[#6b8cba] mb-2 block">Autor</span>
                                <span className="text-[#1e3a6e] block md:inline">{libro.author}</span>
                            </td>
                            <td className="block md:table-cell px-4 md:px-6 py-3 md:py-4 border-b border-[#c8d8f0]/30 md:border-0 md:text-center">
                                <span className="md:hidden text-[10px] font-bold uppercase text-[#6b8cba] mb-2 block">Año</span>
                                <span className="text-[#1e3a6e] block md:inline">{libro.year}</span>
                            </td>
                            <td className="block md:table-cell px-4 md:px-6 py-3 md:py-4 border-b border-[#c8d8f0]/30 md:border-0 md:text-center">
                                <span className="md:hidden text-[10px] font-bold uppercase text-[#6b8cba] mb-2 block">Páginas</span>
                                <span className="text-[#1e3a6e] block md:inline">{libro.pages}</span>
                            </td>
                            <td className="block md:table-cell px-4 md:px-6 py-3 md:py-4 border-b border-[#c8d8f0]/30 md:border-0 md:text-center">
                                <span className="md:hidden text-[10px] font-bold uppercase text-[#6b8cba] mb-2 block">Editorial</span>
                                <span className="text-[#1e3a6e] text-sm block md:inline">{libro.publisher}</span>
                            </td>
                            <td className="block md:table-cell px-4 md:px-6 py-3 md:py-4 border-b border-[#c8d8f0]/30 md:border-0 md:text-center">
                                <span className="md:hidden text-[10px] font-bold uppercase text-[#6b8cba] mb-2 block">Precio</span>
                                <span className="bg-[#d4af37]/10 text-[#d4af37] px-3 py-1 rounded-full text-sm font-semibold inline-block whitespace-nowrap">
                                    {libro.price === 0 ? 'Gratis' : `$${libro.price}`}
                                </span>
                            </td>
                            <td className="block md:table-cell px-4 md:px-6 py-3 md:py-4 flex justify-between md:table-cell items-center bg-[#f9f7f4]/50 md:bg-transparent rounded-b-xl md:rounded-none">
                                <span className="md:hidden text-[10px] font-bold uppercase text-[#6b8cba]">Acciones</span>
                                <div className="flex justify-end md:justify-center gap-2">
                                    <button
                                        onClick={() => onView(libro)}
                                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                                        title="Ver"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => onEdit(libro)}
                                        className="p-2 hover:bg-yellow-100 rounded-lg transition-colors text-yellow-600"
                                        title="Editar"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => onAssign(libro)}
                                        className="p-2 hover:bg-green-100 rounded-lg transition-colors text-green-600"
                                        title="Asignar a escuela"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => onDelete(libro)}
                                        className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                                        title="Eliminar"
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
        </div>
    );
};
