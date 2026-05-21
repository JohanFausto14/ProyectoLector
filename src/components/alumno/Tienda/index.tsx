'use client';

import React, { useState } from 'react';
import { libros } from '../../../data/libros';
import type { Libro } from '../../../data/libros';

interface TiendaProps {
    onSelectBook?: (book: Libro) => void;
}

const Tienda: React.FC<TiendaProps> = ({ onSelectBook }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const storeBooks = libros;

    return (
        <div className="animate-fade-in space-y-8 md:space-y-12">

            {/* Hero Banner - Mejorado */}
            <div className="relative w-full min-h-[18rem] md:min-h-0 md:h-64 py-8 md:py-0 bg-gradient-to-br from-[#0a1628] via-[#1e3a6e] to-[#0a1628] rounded-2xl overflow-hidden shadow-2xl">
                {/* Patrón decorativo */}
                <div
                    className="absolute inset-0 opacity-5"
                    style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }}
                ></div>

                {/* Círculos decorativos */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4af37] rounded-full opacity-10 blur-3xl"></div>
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#d4af37] rounded-full opacity-5 blur-3xl"></div>

                <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-12 lg:px-16 pt-2 pb-2">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#d4af37]/20 backdrop-blur-sm rounded-full mb-4 border border-[#d4af37]/30">
                            <div className="w-2 h-2 bg-[#d4af37] rounded-full animate-pulse"></div>
                            <span className="text-[#d4af37] text-xs font-bold uppercase tracking-wider">Nuevo</span>
                        </div>

                        <h2 className="text-[#d4af37] font-playfair text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight drop-shadow-lg">
                            Descubre Tu Próxima Lectura
                        </h2>
                        <p className="text-[#f5f8ff] font-lora text-sm md:text-base lg:text-lg leading-relaxed max-w-xl">
                            Accede a material exclusivo, ediciones especiales y contenido académico diseñado para impulsar tu carrera profesional.
                        </p>

                        <div className="flex flex-wrap gap-2 md:gap-3 mt-6">
                            <button className="px-4 py-2 md:px-6 md:py-2.5 bg-[#d4af37] text-[#0a1628] rounded-lg font-bold text-xs md:text-sm hover:bg-[#c19a2e] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2">
                                <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                </svg>
                                Ver Destacados
                            </button>
                            <button className="px-4 py-2 md:px-6 md:py-2.5 bg-white/10 backdrop-blur-sm text-white rounded-lg font-bold text-xs md:text-sm hover:bg-white/20 transition-all duration-300 border border-white/20">
                                Explorar Todo
                            </button>
                        </div>
                    </div>
                </div>

                {/* Decorative book stack illustration */}
                <div className="absolute right-8 bottom-0 hidden lg:block opacity-20">
                    <div className="flex gap-2">
                        <div className="w-16 h-56 bg-[#d4af37] rounded-t-lg transform rotate-3"></div>
                        <div className="w-16 h-52 bg-[#c19a2e] rounded-t-lg transform -rotate-2"></div>
                        <div className="w-16 h-48 bg-[#d4af37] rounded-t-lg transform rotate-1"></div>
                    </div>
                </div>
            </div>

            {/* Search and Filter Bar - Mejorado */}
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-[#c8d8f0]/50">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h3 className="font-playfair text-2xl font-bold text-[#0a1628] flex items-center gap-2">
                            Catálogo Completo
                            <span className="px-2.5 py-0.5 bg-[#d4af37]/10 text-[#d4af37] text-sm font-sans rounded-full">
                                {storeBooks.length}
                            </span>
                        </h3>
                        <p className="text-sm text-[#1e3a6e] mt-1">Encuentra el libro perfecto para ti</p>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <input
                                type="text"
                                placeholder="Buscar por título, autor o tema..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-[#c8d8f0] bg-white focus:outline-none focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/10 font-lora text-sm transition-all duration-300"
                            />
                            <svg className="w-5 h-5 text-[#6b8cba] absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b8cba] hover:text-[#0a1628] transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            )}
                        </div>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-4 py-3 rounded-xl border-2 transition-all duration-300 flex items-center gap-2 ${showFilters
                                ? 'bg-[#0a1628] text-white border-[#0a1628]'
                                : 'bg-white border-[#c8d8f0] text-[#1e3a6e] hover:border-[#d4af37] hover:bg-[#f5f8ff]'
                                }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                            </svg>
                            <span className="hidden sm:inline font-bold text-sm">Filtros</span>
                        </button>
                    </div>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="mt-6 pt-6 border-t border-[#c8d8f0] animate-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                            <button className="px-2 py-1.5 md:px-4 md:py-2 bg-[#f5f8ff] hover:bg-[#d4af37] hover:text-white border border-[#c8d8f0] hover:border-[#d4af37] rounded-lg text-xs md:text-sm font-bold text-[#1e3a6e] transition-all duration-300">
                                Todos
                            </button>
                            <button className="px-2 py-1.5 md:px-4 md:py-2 bg-white hover:bg-[#d4af37] hover:text-white border border-[#c8d8f0] hover:border-[#d4af37] rounded-lg text-xs md:text-sm font-bold text-[#1e3a6e] transition-all duration-300">
                                Gratuitos
                            </button>
                            <button className="px-2 py-1.5 md:px-4 md:py-2 bg-white hover:bg-[#d4af37] hover:text-white border border-[#c8d8f0] hover:border-[#d4af37] rounded-lg text-xs md:text-sm font-bold text-[#1e3a6e] transition-all duration-300 leading-tight">
                                En Mi Biblioteca
                            </button>
                            <button className="px-2 py-1.5 md:px-4 md:py-2 bg-white hover:bg-[#d4af37] hover:text-white border border-[#c8d8f0] hover:border-[#d4af37] rounded-lg text-xs md:text-sm font-bold text-[#1e3a6e] transition-all duration-300">
                                Nuevos
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Store Grid - Mejorado */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
                {storeBooks.map(book => (
                    <div
                        key={book.id}
                        className="group bg-white rounded-xl p-3 sm:p-4 shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer border border-transparent hover:border-[#d4af37]/30 flex flex-col h-full relative overflow-hidden"
                        onClick={() => onSelectBook?.(book)}
                    >
                        {/* Hover glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/0 via-[#d4af37]/0 to-[#d4af37]/0 group-hover:from-[#d4af37]/5 group-hover:via-transparent group-hover:to-[#d4af37]/5 transition-all duration-500 rounded-xl"></div>

                        <div className="relative z-10">
                            {/* Cover */}
                            <div className="relative aspect-[2/3] mb-4 rounded-lg shadow-lg overflow-hidden bg-gray-100 group-hover:shadow-xl transition-shadow duration-500">
                                <div
                                    className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                                    style={{ backgroundColor: book.coverColor }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-black/0 via-black/5 to-black/20"></div>

                                    {/* Title on Cover */}
                                    <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
                                        <div>
                                            <h4 className="text-white font-playfair font-bold text-sm md:text-base drop-shadow-lg leading-tight mb-2">
                                                {book.title}
                                            </h4>
                                            <p className="text-white/70 text-[10px] md:text-xs font-lora drop-shadow">
                                                {book.author}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Shine effect */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                </div>

                                {/* Badges */}
                                {book.owned && (
                                    <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] md:text-[10px] uppercase font-bold px-2 py-1 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-1">
                                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                        </svg>
                                        Tuyo
                                    </div>
                                )}
                                {book.price === 0 && !book.owned && (
                                    <div className="absolute top-2 right-2 bg-[#d4af37] text-[#0a1628] text-[9px] md:text-[10px] uppercase font-bold px-2 py-1 rounded-full shadow-lg">
                                        Gratis
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="space-y-2">
                                <h4 className="font-playfair font-bold text-[#0a1628] leading-tight text-sm md:text-base line-clamp-2 group-hover:text-[#d4af37] transition-colors">
                                    {book.title}
                                </h4>
                                <p className="font-lora text-xs text-[#1e3a6e] line-clamp-1">{book.author}</p>

                                {/* Metadata */}
                                <div className="flex items-center gap-2 text-[10px] text-[#6b8cba]">
                                    <span className="flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                        </svg>
                                        {book.pages}p
                                    </span>
                                    <span>•</span>
                                    <span>{book.year}</span>
                                </div>

                                {/* Price and Action */}
                                <div className="flex justify-between items-center pt-3 border-t border-[#c8d8f0] mt-3">
                                    <span className="font-bold text-[#0a1628] text-sm sm:text-base md:text-lg">
                                        {book.price === 0 ? (
                                            <span className="text-emerald-600">Gratis</span>
                                        ) : (
                                            `$${book.price}`
                                        )}
                                    </span>
                                    <button className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-[#f5f8ff] to-[#f5f8ff] hover:from-[#0a1628] hover:to-[#1e3a6e] text-[#0a1628] hover:text-[#d4af37] flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg group-hover:scale-110">
                                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty state if no results */}
            {storeBooks.length === 0 && (
                <div className="text-center py-16">
                    <div className="w-20 h-20 bg-[#f5f8ff] rounded-full mx-auto mb-4 flex items-center justify-center">
                        <svg className="w-10 h-10 text-[#6b8cba]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                        </svg>
                    </div>
                    <h3 className="font-playfair text-xl font-bold text-[#0a1628] mb-2">No se encontraron libros</h3>
                    <p className="text-[#1e3a6e]">Intenta con otros términos de búsqueda</p>
                </div>
            )}
        </div>
    );
};

export default Tienda;