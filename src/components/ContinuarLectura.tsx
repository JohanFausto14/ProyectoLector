import React from 'react';

export const ContinuarLectura: React.FC = () => {
    return (
        <div className="relative w-full min-h-[26rem] md:min-h-0 md:h-80 py-10 md:py-0 bg-gradient-to-br from-[#0a1628] via-[#1e3a6e] to-[#0a1628] rounded-2xl overflow-hidden shadow-2xl flex items-center p-6 md:p-12 group">
            {/* Background Texture */}
            <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/leather.png')" }}
            />

            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4af37] rounded-full opacity-10 blur-3xl"></div>
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#d4af37] rounded-full opacity-5 blur-3xl"></div>

            {/* Content */}
            <div className="relative z-10 max-w-2xl">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-gradient-to-r from-[#d4af37] to-[#c19a2e] rounded-full shadow-lg">
                    <svg className="w-4 h-4 text-[#0a1628]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"></path>
                    </svg>
                    <span className="text-sm md:text-xs font-bold tracking-widest uppercase text-[#0a1628]">
                        Lectura Actual
                    </span>
                </div>

                {/* Title & Info */}
                <h2 className="text-4xl md:text-5xl font-playfair font-bold mb-3 leading-tight text-[#f5f8ff] drop-shadow-lg">
                    El Quijote
                </h2>
                <p className="text-[#d4af37]/90 font-lora italic mb-10 text-base md:text-base flex items-center gap-2 leading-relaxed">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                    </svg>
                    Capítulo 4: De lo que le sucedió a nuestro caballero...
                </p>

                {/* Actions & Progress */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-6 mt-2">
                    <button className="px-6 py-4 md:px-8 md:py-4 bg-gradient-to-r from-[#d4af37] to-[#c19a2e] text-[#0a1628] font-bold font-playfair uppercase tracking-widest rounded-xl shadow-xl hover:shadow-2xl hover:from-[#c19a2e] hover:to-[#b08a28] hover:-translate-y-1 active:translate-y-0 transition-all duration-300 flex items-center gap-3 md:gap-3 text-sm md:text-base w-full sm:w-auto justify-center">
                        <svg className="w-5 h-5 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"></path>
                        </svg>
                        Continuar Lectura
                    </button>

                    <div className="flex flex-col w-full sm:w-auto">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm md:text-xs text-[#d4af37] uppercase tracking-widest font-bold">Progreso</span>
                            <span className="text-sm md:text-xs text-[#f5f8ff] font-bold">45%</span>
                        </div>
                        <div className="w-40 md:w-48 h-2 bg-[#1a2d5a] rounded-full overflow-hidden shadow-inner">
                            <div className="h-full bg-gradient-to-r from-[#d4af37] to-[#c19a2e] w-[45%] rounded-full shadow-lg transition-all duration-500"></div>
                        </div>
                        <p className="text-xs md:text-[10px] text-[#6b8cba] mt-1.5">Aproximadamente 2h 30min restantes</p>
                    </div>
                </div>
            </div>

            {/* Decorative Book Cover (Right side) - Enhanced */}
            <div className="absolute -right-8 md:-right-12 -bottom-8 md:-bottom-12 w-52 md:w-72 h-72 md:h-96 rounded-xl shadow-2xl transform rotate-[-12deg] hidden lg:block overflow-hidden group-hover:rotate-[-8deg] transition-transform duration-500">
                <div
                    className="absolute inset-0 bg-gradient-to-br from-[#8b4513] to-[#654321]"
                    style={{
                        backgroundImage: "url('https://www.transparenttextures.com/patterns/old-map.png')"
                    }}
                >
                    {/* Book details */}
                    <div className="absolute inset-6 border-4 border-[#d4af37]/40 rounded-lg flex items-center justify-center p-6">
                        <div className="text-center">
                            <h3 className="text-white font-playfair font-bold text-2xl md:text-3xl drop-shadow-lg mb-2 leading-tight">
                                El Quijote
                            </h3>
                            <p className="text-[#d4af37] text-sm font-lora italic">Miguel de Cervantes</p>
                        </div>
                    </div>

                    {/* Spine effect */}
                    <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/40 to-transparent"></div>

                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent"></div>
                </div>
            </div>

            {/* Bottom decorative line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent"></div>
        </div>
    );
};