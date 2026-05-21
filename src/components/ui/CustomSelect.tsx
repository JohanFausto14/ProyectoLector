'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Option {
    id: string | number;
    label: string;
    subLabel?: string;
    disabled?: boolean;
    variant?: 'success' | 'danger' | 'warning' | 'neutral';
}

interface CustomSelectProps {
    options: Option[];
    value: string | number;
    onChange: (value: string | number) => void;
    placeholder?: string;
    label?: string;
    required?: boolean;
    showSearch?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
    options,
    value,
    onChange,
    placeholder = 'Selecciona una opción',
    label,
    required = false,
    showSearch = true
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const selectedOption = options.find(opt => String(opt.id) === String(value));
    
    // Filtrar opciones
    const filteredOptions = options.filter(opt => 
        opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (opt.subLabel && opt.subLabel.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Cerrar al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Enfocar buscador al abrir
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
        if (!isOpen) {
            setSearchTerm('');
        }
    }, [isOpen]);

    const handleSelect = (option: Option) => {
        if (option.disabled) return;
        onChange(option.id);
        setIsOpen(false);
    };

    return (
        <div className="relative w-full space-y-2" ref={containerRef}>
            {label && (
                <label className="text-xs font-bold uppercase tracking-widest text-[#6b8cba] ml-2">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            
            <div 
                onClick={() => !isOpen && setIsOpen(true)}
                className={`w-full px-4 py-3 bg-white rounded-xl border-2 transition-all duration-300 cursor-pointer flex justify-between items-center ${
                    isOpen ? 'border-[#d4af37] ring-4 ring-[#d4af37]/10' : 'border-[#c8d8f0]/60 hover:border-[#d4af37]/50'
                }`}
            >
                <div className="flex flex-col truncate pr-4 text-sm font-lora">
                    <span className={`font-semibold truncate ${selectedOption ? 'text-[#0a1628]' : 'text-[#6b8cba]'}`}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    {selectedOption?.subLabel && (
                        <span className="text-[11px] leading-tight text-[#1e3a6e] truncate font-normal">{selectedOption.subLabel}</span>
                    )}
                </div>
                
                <svg 
                    onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                    className={`w-5 h-5 text-[#1e3a6e] transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {/* Menú Desplegable */}
            {isOpen && (
                <div 
                    className="absolute z-[100] w-full mt-2 bg-white rounded-2xl border-2 border-[#c8d8f0]/60 shadow-2xl overflow-hidden animate-fade-in origin-top"
                >
                    {/* Buscador */}
                    {showSearch && (
                        <div className="p-2 border-b border-[#c8d8f0]/60 bg-[#f5f8ff]/50">
                            <div className="relative">
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Buscar..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-8 pr-4 py-1.5 bg-white border border-[#c8d8f0]/60 rounded-lg text-xs focus:outline-none focus:border-[#d4af37] text-[#0a1628]"
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <svg className="w-3.5 h-3.5 text-[#6b8cba] absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    )}
 
                    <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                        <div className="py-1">
                            {filteredOptions.length === 0 ? (
                                <div className="px-4 py-6 text-center">
                                    <p className="text-sm text-[#6b8cba] italic">No se encontraron resultados</p>
                                </div>
                            ) : (
                                filteredOptions.map((opt) => (
                                    <div
                                        key={opt.id}
                                        onClick={() => handleSelect(opt)}
                                        className={`px-3 py-2 border-b border-[#c8d8f0]/30 last:border-0 transition-all flex flex-col gap-0.5 ${
                                            String(opt.id) === String(value)
                                                ? 'bg-[#d4af37]/10 text-[#0a1628] border-l-4 border-[#d4af37]'
                                                : opt.disabled || opt.variant === 'danger'
                                                    ? 'bg-red-50/60 border-l-4 border-red-500/80 cursor-not-allowed select-none'
                                                    : opt.variant === 'success'
                                                        ? 'bg-emerald-50/60 border-l-4 border-emerald-500/80 hover:bg-emerald-100 hover:text-emerald-900 cursor-pointer'
                                                        : 'text-[#1e3a6e] hover:bg-[#d4af37]/5 hover:text-[#0a1628] cursor-pointer'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center w-full">
                                            <span className={`text-sm font-bold ${
                                                opt.disabled ? 'text-red-900/40' : 
                                                opt.variant === 'success' ? 'text-emerald-900' : ''
                                            }`}>{opt.label}</span>
                                            {opt.disabled && (
                                                <span className="text-[8px] font-black uppercase tracking-widest bg-white text-red-600 px-1.5 py-0 rounded-full border border-red-200 shadow-sm ring-4 ring-red-500/5">
                                                    🛑 Ocupado
                                                </span>
                                            )}
                                            {!opt.disabled && opt.variant === 'success' && (
                                                <span className="text-[8px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 px-1.5 py-0 rounded-full border border-emerald-200 shadow-sm ring-4 ring-emerald-500/5">
                                                    ✅ Disponible
                                                </span>
                                            )}
                                        </div>
                                        {opt.subLabel && (
                                            <span className={`text-xs font-medium ${
                                                opt.disabled ? 'text-red-600/60' : 
                                                opt.variant === 'success' ? 'text-emerald-600' : 'text-[#6b8cba]'
                                            }`}>
                                                {opt.subLabel}
                                            </span>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes select-slide-down {
                    from { opacity: 0; transform: translateY(-10px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-fade-in {
                    animation: select-slide-down 0.2s ease-out;
                }
            `}</style>
        </div>
    );
};
