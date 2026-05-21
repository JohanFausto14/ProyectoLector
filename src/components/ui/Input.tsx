'use client';

import React from 'react';

interface InputProps {
    label?: string;
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'date';
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
    helperText?: string;
    name?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    type = 'text',
    placeholder,
    value,
    onChange,
    error,
    required = false,
    disabled = false,
    icon,
    helperText,
    name
}) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-bold text-[#0a1628] mb-2">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            
            <div className="relative">
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b8cba]">
                        {icon}
                    </div>
                )}
                
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    className={`w-full ${icon ? 'pl-12' : 'pl-4'} pr-4 py-3 rounded-xl border-2 bg-white font-lora text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                        error 
                            ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
                            : 'border-[#c8d8f0]/60 focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/10'
                    } focus:outline-none`}
                />
            </div>

            {error && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    {error}
                </p>
            )}

            {helperText && !error && (
                <p className="mt-2 text-sm text-[#1e3a6e] flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    {helperText}
                </p>
            )}
        </div>
    );
};