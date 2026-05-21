'use client';

import React from 'react';
import { LibroAlumno } from '../../../types/alumno/libros';

interface LibroCardProps {
    libro: LibroAlumno;
    onClick: (id: number) => void;
}

export const LibroCard: React.FC<LibroCardProps> = ({ libro, onClick }) => {
    const isCompleted = libro.progresoPorcentaje === 100;
    const hasStarted = libro.progresoPorcentaje > 0;

    return (
        <div
            onClick={() => onClick(libro.libroId)}
            className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-[#c8d8f0]/30 hover:-translate-y-1"
        >
            {/* Portada */}
            <div className="aspect-[3/4] bg-gradient-to-br from-[#f5f8ff] to-[#f5f8ff] relative flex items-center justify-center p-6 overflow-hidden">
                {libro.portadaUrl ? (
                    <img
                        src={libro.portadaUrl}
                        alt={libro.titulo}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="text-center">
                        <svg className="w-16 h-16 text-[#d4af37]/30 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span className="font-playfair font-bold text-[#1e3a6e] text-sm block px-4">{libro.titulo}</span>
                    </div>
                )}

                {/* Badge completado */}
                {isCompleted && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-2 rounded-full shadow-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                )}

                {/* Overlay hover */}
                <div className="absolute inset-0 bg-[#0a1628]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-white text-[#0a1628] px-6 py-2 rounded-full font-bold shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform text-sm">
                        {hasStarted ? 'Continuar' : 'Ver libro'}
                    </span>
                </div>
            </div>

            {/* Info */}
            <div className="p-4">
                <h3 className="font-playfair font-bold text-[#0a1628] text-base leading-tight line-clamp-2 mb-2">
                    {libro.titulo}
                </h3>

                <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#f5f8ff] text-[#1e3a6e] rounded border border-[#c8d8f0]">
                        {libro.materia}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-50 text-blue-600 rounded border border-blue-100">
                        {libro.grado}° Grado
                    </span>
                </div>

                {/* Barra de progreso */}
                <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold">
                        <span className={isCompleted ? 'text-emerald-600' : 'text-[#6b8cba]'}>
                            {isCompleted ? '¡Completado!' : hasStarted ? 'En curso' : 'Sin iniciar'}
                        </span>
                        <span className="text-[#0a1628]">{libro.progresoPorcentaje}%</span>
                    </div>
                    <div className="h-2 w-full bg-[#f5f8ff] rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-1000 ease-out rounded-full ${
                                isCompleted
                                    ? 'bg-gradient-to-r from-emerald-400 to-teal-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                                    : 'bg-gradient-to-r from-[#d4af37] to-[#c19a2e]'
                            }`}
                            style={{ width: `${libro.progresoPorcentaje}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};