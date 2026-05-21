'use client';

import React from 'react';

interface TarjetaEstadisticaProps {
    label: string;
    value: string;
    subtext?: string;
    children?: React.ReactNode;
}

export const TarjetaEstadistica: React.FC<TarjetaEstadisticaProps> = ({ label, value, subtext, children }) => {
    return (
        <div className="group bg-gradient-to-br from-white to-[#faf8f5] rounded-xl shadow-md hover:shadow-xl border border-[#c8d8f0]/50 hover:border-[#d4af37]/30 p-5 md:p-6 flex items-start gap-4 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
            {/* Hover glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/0 via-[#d4af37]/0 to-[#d4af37]/0 group-hover:from-[#d4af37]/5 group-hover:via-transparent group-hover:to-[#d4af37]/5 transition-all duration-500 rounded-xl pointer-events-none"></div>

            {/* Decorative corner accent */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#d4af37]/5 to-transparent rounded-bl-full transition-opacity duration-300 opacity-0 group-hover:opacity-100"></div>

            {/* Icon Container */}
            <div className="relative z-10 p-3.5 rounded-xl bg-gradient-to-br from-[#d4af37]/10 to-[#d4af37]/5 text-[#d4af37] group-hover:from-[#d4af37]/20 group-hover:to-[#d4af37]/10 transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:scale-110">
                {children || (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                    </svg>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 relative z-10">
                <p className="text-xs font-bold uppercase tracking-widest text-[#6b8cba] mb-2 flex items-center gap-1.5">
                    {label}
                    <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                </p>
                <h3 className="text-3xl md:text-4xl font-playfair font-bold text-[#0a1628] mb-1.5 group-hover:text-[#d4af37] transition-colors duration-300">
                    {value}
                </h3>
                {subtext && (
                    <p className="text-xs text-[#1e3a6e] font-lora flex items-center gap-1.5">
                        <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        {subtext}
                    </p>
                )}
            </div>

            {/* Bottom accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#d4af37]/0 to-transparent group-hover:via-[#d4af37]/50 transition-all duration-500"></div>
        </div>
    );
};