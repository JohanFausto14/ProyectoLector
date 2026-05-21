'use client';

import React from 'react';
import styles from './styles.module.css';

interface TarjetaLibroProps {
    title: string;
    author: string;
    coverColor: string;
    progress: number;
    onClick?: () => void;
}

export const TarjetaLibro: React.FC<TarjetaLibroProps> = ({ title, author, coverColor, progress, onClick }) => {
    return (
        <div
            className="group relative flex flex-col bg-white rounded-xl p-4 shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer border border-transparent hover:border-[#d4af37]/30 overflow-hidden"
            onClick={onClick}
        >
            {/* Hover glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/0 via-[#d4af37]/0 to-[#d4af37]/0 group-hover:from-[#d4af37]/5 group-hover:via-transparent group-hover:to-[#d4af37]/5 transition-all duration-500 rounded-xl pointer-events-none"></div>

            {/* Book Cover */}
            <div className="relative aspect-[2/3] mb-4 rounded-lg shadow-lg overflow-hidden group-hover:shadow-xl transition-shadow duration-500">
                <div
                    className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                    style={{
                        backgroundColor: coverColor,
                        boxShadow: 'inset -2px 0 8px rgba(0,0,0,0.2)'
                    }}
                >
                    {/* Spine effect */}
                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-black/30 to-transparent"></div>

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-black/0 via-black/5 to-black/20"></div>

                    {/* Book Title on Cover */}
                    <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
                        <h3 className="text-white font-playfair font-bold text-base md:text-lg drop-shadow-lg leading-tight line-clamp-4">
                            {title}
                        </h3>
                    </div>

                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                    {/* Overlay with button */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center p-2">
                        <button className="px-3 py-2 md:px-6 md:py-3 text-[10px] md:text-sm bg-gradient-to-r from-[#d4af37] to-[#c19a2e] text-[#0a1628] font-bold font-playfair uppercase tracking-wider rounded-lg shadow-xl hover:shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-1 md:gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"></path>
                            </svg>
                            {progress > 0 ? 'Continuar' : 'Leer'}
                        </button>
                    </div>
                </div>

                {/* Progress badge */}
                {progress > 0 && (
                    <div className="absolute top-2 right-2 px-2.5 py-1 bg-[#d4af37] text-[#0a1628] text-xs font-bold rounded-full shadow-lg">
                        {progress}%
                    </div>
                )}
            </div>

            {/* Book Info */}
            <div className="flex-1 flex flex-col relative z-10">
                <h3 className="font-playfair font-bold text-[#0a1628] text-base md:text-lg leading-tight mb-1 line-clamp-2 group-hover:text-[#d4af37] transition-colors">
                    {title}
                </h3>
                <p className="font-lora text-xs text-[#1e3a6e] mb-3 line-clamp-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    {author}
                </p>

                {/* Progress Section */}
                <div className="mt-auto pt-3 border-t border-[#c8d8f0]">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-[#6b8cba] uppercase tracking-wider font-bold">Progreso</span>
                        <span className="text-xs text-[#0a1628] font-bold">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gradient-to-r from-[#c8d8f0] to-[#d4c4b0] rounded-full overflow-hidden shadow-inner">
                        <div
                            className="h-full bg-gradient-to-r from-[#d4af37] to-[#c19a2e] rounded-full shadow-md transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    {progress > 0 && progress < 100 && (
                        <p className="text-[10px] text-[#6b8cba] mt-1.5">
                            {progress < 25 ? 'Recién comenzado' : progress < 75 ? 'A mitad de camino' : 'Casi terminado'}
                        </p>
                    )}
                    {progress === 100 && (
                        <p className="text-[10px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                            </svg>
                            Completado
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};