'use client';

import React, { useEffect } from 'react';
import type { Libro } from '../../../data/libros';
import styles from './styles.module.css';

interface DetalleProductoProps {
    libro: Libro | null;
    isOpen: boolean;
    onClose: () => void;
}

export const DetalleProducto: React.FC<DetalleProductoProps> = ({ libro, isOpen, onClose }) => {
    // Bloquear scroll de la página cuando el modal está abierto
    useEffect(() => {
        if (isOpen && libro) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen, libro]);

    if (!isOpen || !libro) return null;

    return (
        <div className={`${styles.modalOverlay} z-[100] backdrop-blur-sm`}>
            <div className={`${styles.modalContent} flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh] max-w-5xl w-full bg-gradient-to-br from-white to-[#faf8f5] rounded-3xl shadow-2xl relative overflow-hidden border border-[#c8d8f0]/30`}>
                
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-2.5 bg-white/80 backdrop-blur-sm rounded-full hover:bg-[#0a1628] hover:text-white text-[#1e3a6e] transition-all duration-300 shadow-lg hover:shadow-xl hover:rotate-90"
                    aria-label="Cerrar"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>

                {/* Left: 3D Book Presentation */}
                <div className="hidden md:flex w-full md:w-2/5 bg-gradient-to-br from-[#c8d8f0]/20 to-[#d4af37]/5 flex-col items-center justify-center p-8 md:p-12 relative shrink-0">
                    {/* Decorative elements */}
                    <div className="absolute top-0 left-0 w-32 h-32 bg-[#d4af37]/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-40 h-40 bg-[#0a1628]/5 rounded-full blur-3xl"></div>
                    
                    <div className="relative z-10">
                        <div
                            className={`${styles.modalBook3d} w-44 h-64 md:w-52 md:h-72 shadow-2xl rounded-r-xl border-l-8 border-white/30 transform hover:scale-105 hover:rotate-y-12 transition-all duration-500 relative overflow-hidden`}
                            style={{ 
                                backgroundColor: libro.coverColor,
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), inset -2px 0 8px rgba(0,0,0,0.1)'
                            }}
                        >
                            {/* Book spine effect */}
                            <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-black/20 to-transparent"></div>
                            
                            {/* Content */}
                            <div className="h-full flex items-center justify-center p-6 text-center relative z-10">
                                <div>
                                    <h3 className="text-white font-playfair font-bold text-xl md:text-2xl drop-shadow-lg mb-3 leading-tight">
                                        {libro.title}
                                    </h3>
                                    <p className="text-white/80 text-xs md:text-sm font-lora italic drop-shadow">
                                        {libro.author}
                                    </p>
                                </div>
                            </div>

                            {/* Shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        </div>

                        {/* Shadow under book */}
                        <div className="w-52 h-4 bg-black/10 blur-xl rounded-full mt-4 mx-auto"></div>
                    </div>

                    {/* Publisher badge */}
                    <div className="mt-8 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full shadow-lg">
                        <p className="text-[#d4af37] text-xs font-bold uppercase tracking-wider">
                            {libro.publisher}
                        </p>
                    </div>
                </div>

                {/* Right: Details */}
                <div className="flex-1 p-4 sm:p-6 md:p-10 overflow-y-auto">
                    <div className="max-w-2xl">
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            <span className={`${styles.publisherTag} inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#d4af37]/10 to-[#d4af37]/5 text-[#d4af37] text-xs font-bold uppercase tracking-wider rounded-full border border-[#d4af37]/20`}>
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"></path>
                                </svg>
                                {libro.year}
                            </span>
                            <span className="md:hidden inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#0a1628]/10 to-[#0a1628]/5 text-[#0a1628] text-xs font-bold uppercase tracking-wider rounded-full border border-[#0a1628]/10">
                                {libro.publisher}
                            </span>
                            {libro.owned && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-emerald-100/50 text-emerald-700 text-xs font-bold uppercase tracking-wider rounded-full border border-emerald-200">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                                    </svg>
                                    En tu biblioteca
                                </span>
                            )}
                        </div>

                        {/* Title & Author */}
                        <h2 className={`${styles.detailTitle} text-3xl md:text-4xl font-playfair font-bold text-[#0a1628] mb-2 leading-tight`}>
                            {libro.title}
                        </h2>
                        <p className={`${styles.detailAuthor} text-[#1e3a6e] italic text-lg md:text-xl mb-8 flex items-center gap-2`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                            {libro.author}
                        </p>

                        {/* Stats Grid */}
                        <div className={`${styles.detailStats} grid grid-cols-3 gap-4 py-6 px-4 bg-gradient-to-r from-[#f5f8ff] to-white rounded-xl border border-[#c8d8f0]/50 mb-8 shadow-sm`}>
                            <div className="text-center">
                                <div className="w-10 h-10 bg-gradient-to-br from-[#d4af37] to-[#c19a2e] rounded-lg mx-auto mb-2 flex items-center justify-center shadow-md">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                    </svg>
                                </div>
                                <p className={`${styles.detailStatLabel} text-xs font-bold text-[#6b8cba] uppercase tracking-wider mb-1`}>Páginas</p>
                                <p className={`${styles.detailStatValue} font-playfair font-bold text-xl text-[#0a1628]`}>{libro.pages}</p>
                            </div>
                            <div className="text-center border-l border-r border-[#c8d8f0]">
                                <div className="w-10 h-10 bg-gradient-to-br from-[#1e3a6e] to-[#7a5c36] rounded-lg mx-auto mb-2 flex items-center justify-center shadow-md">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path>
                                    </svg>
                                </div>
                                <p className={`${styles.detailStatLabel} text-xs font-bold text-[#6b8cba] uppercase tracking-wider mb-1`}>Idioma</p>
                                <p className={`${styles.detailStatValue} font-playfair font-bold text-xl text-[#0a1628]`}>Español</p>
                            </div>
                            <div className="text-center">
                                <div className="w-10 h-10 bg-gradient-to-br from-[#1e3a6e] to-[#1a2d5a] rounded-lg mx-auto mb-2 flex items-center justify-center shadow-md">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                    </svg>
                                </div>
                                <p className={`${styles.detailStatLabel} text-xs font-bold text-[#6b8cba] uppercase tracking-wider mb-1`}>Formato</p>
                                <p className={`${styles.detailStatValue} font-playfair font-bold text-xl text-[#0a1628]`}>Digital</p>
                            </div>
                        </div>

                        {/* Synopsis */}
                        <div className="mb-8">
                            <h4 className={`${styles.detailSynopsisTitle} font-playfair font-bold text-xl text-[#0a1628] mb-4 flex items-center gap-2`}>
                                <div className="w-1 h-6 bg-gradient-to-b from-[#d4af37] to-[#c19a2e] rounded-full"></div>
                                Sinopsis
                            </h4>
                            <p className={`${styles.detailSynopsisText} text-[#1e3a6e] text-sm md:text-base leading-relaxed font-lora`}>
                                {libro.synopsis}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-6 border-t border-[#c8d8f0]">
                            {libro.owned ? (
                                <>
                                    <button className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-xl font-playfair font-bold uppercase tracking-widest hover:from-emerald-600 hover:to-emerald-700 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 shadow-lg transition-all duration-300 flex items-center justify-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                        </svg>
                                        {libro.progress > 0 ? 'Continuar Lectura' : 'Leer Ahora'}
                                    </button>
                                    <button className="sm:w-14 h-14 bg-white border-2 border-[#c8d8f0] rounded-xl hover:border-[#d4af37] hover:bg-[#f5f8ff] transition-all duration-300 flex items-center justify-center text-[#1e3a6e] hover:text-[#d4af37] shadow-sm hover:shadow-md">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                                        </svg>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button className="flex-1 bg-gradient-to-r from-[#0a1628] to-[#1e3a6e] text-[#f5f8ff] py-4 rounded-xl font-playfair font-bold uppercase tracking-widest hover:from-[#1e3a6e] hover:to-[#1a2d5a] hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 shadow-lg flex items-center justify-center gap-3">
                                        <span>Comprar Ahora</span>
                                        <span className="bg-[#d4af37] text-[#0a1628] text-sm px-3 py-1.5 rounded-lg font-sans font-bold shadow-md">
                                            {libro.price === 0 ? 'GRATIS' : `$${libro.price}`}
                                        </span>
                                    </button>
                                    <button className="sm:w-14 h-14 bg-white border-2 border-[#c8d8f0] rounded-xl hover:border-[#d4af37] hover:bg-[#f5f8ff] transition-all duration-300 flex items-center justify-center text-[#1e3a6e] hover:text-[#d4af37] shadow-sm hover:shadow-md">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"></path>
                                        </svg>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};