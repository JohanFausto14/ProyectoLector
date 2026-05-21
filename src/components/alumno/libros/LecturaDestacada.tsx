'use client';

import React from 'react';
import { LibroAlumno } from '../../../types/alumno/libros';

interface LecturaDestacadaProps {
    libro: LibroAlumno;
    onClick: (id: number) => void;
}

export const LecturaDestacada: React.FC<LecturaDestacadaProps> = ({ libro, onClick }) => {
    const hasStarted = libro.progresoPorcentaje > 0;

    const formatFecha = (fecha?: string) => {
        if (!fecha) return null;
        return new Date(fecha).toLocaleDateString('es-MX', {
            day: 'numeric',
            month: 'long',
        });
    };

    return (
        <div
            onClick={() => onClick(libro.libroId)}
            className="relative w-full h-auto min-h-[22rem] bg-gradient-to-br from-[#0a1628] via-[#1e3a6e] to-[#0a1628] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row items-center p-5 sm:p-8 md:p-12 group cursor-pointer border border-white/5"
        >
            {/* Fondo textura */}
            <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/leather.png')" }}
            />

            {/* Oramentos decorativos */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#d4af37] rounded-full opacity-[0.08] blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#d4af37] rounded-full opacity-[0.05] blur-3xl translate-y-1/2 -translate-x-1/2" />

            {/* Contenido izquierdo */}
            <div className="relative z-10 flex-1 w-full order-2 md:order-1 mt-6 md:mt-0">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 bg-gradient-to-r from-[#d4af37] to-[#c19a2e] rounded-full shadow-lg border border-white/20">
                    <span className="text-[10px] font-black tracking-widest uppercase text-[#0a1628]">
                        ⚡ {hasStarted ? 'Continúa donde lo dejaste' : 'Tu próxima lectura'}
                    </span>
                </div>

                <h2 className="text-3xl md:text-5xl font-playfair font-bold mb-4 leading-tight text-[#f5f8ff] group-hover:text-white transition-colors duration-300">
                    {libro.titulo}
                </h2>

                <p className="text-[#d4af37]/90 font-lora italic mb-2 text-sm md:text-base flex items-center gap-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    {libro.materia} • {libro.grado}° Grado
                </p>

                {/* Última lectura */}
                {libro.ultimaLectura && (
                    <p className="text-white/40 text-xs mb-8 ml-6">
                        Última lectura: {formatFecha(libro.ultimaLectura)}
                    </p>
                )}

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 mt-6">
                    <button className="px-8 py-4 bg-white text-[#0a1628] font-bold font-playfair uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 transition-all duration-300 text-sm w-full sm:w-auto">
                        {hasStarted ? 'Continuar lectura' : 'Empezar a leer'}
                    </button>

                    <div className="flex flex-col w-full sm:w-48">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] text-[#d4af37] uppercase tracking-[0.2em] font-black">Progreso</span>
                            <span className="text-xs text-white font-black">{libro.progresoPorcentaje}%</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                            <div
                                className="h-full bg-gradient-to-r from-[#d4af37] to-[#c19a2e] rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)] transition-all duration-1000 ease-out"
                                style={{ width: `${libro.progresoPorcentaje}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Portada derecha */}
            <div className="relative z-10 w-full md:w-auto order-1 md:order-2 flex justify-center">
                <div className="relative w-40 md:w-56 h-56 md:h-72 transform rotate-2 md:rotate-6 group-hover:rotate-0 transition-transform duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37] to-[#1e3a6e] rounded-xl shadow-2xl flex items-center justify-center p-4">
                        {libro.portadaUrl ? (
                            <img src={libro.portadaUrl} alt={libro.titulo} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                            <div className="border border-white/20 w-full h-full rounded-lg flex items-center justify-center relative overflow-hidden">
                                <h3 className="font-playfair font-black text-white text-lg text-center leading-tight drop-shadow-md px-2">
                                    {libro.titulo}
                                </h3>
                                <div className="absolute left-0 top-0 bottom-0 w-2 bg-black/20" />
                            </div>
                        )}
                    </div>
                    <div className="absolute inset-0 bg-[#d4af37]/20 blur-2xl rounded-xl -z-10 group-hover:opacity-40 transition-opacity" />
                </div>
            </div>
        </div>
    );
};