'use client';

import React from 'react';

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    fullWidth?: boolean;
    icon?: React.ReactNode;
    className?: string;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    onClick,
    type = 'button',
    variant = 'primary',
    size = 'md',
    disabled = false,
    fullWidth = false,
    icon,
    className = ''
}) => {
    const baseClasses = 'font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md';

    const variantClasses = {
        primary: 'bg-gradient-to-r from-[#0a1628] to-[#1e3a6e] text-white hover:from-[#0d1b2a] hover:to-[#1a2d5a] hover:-translate-y-0.5 active:translate-y-0',
        secondary: 'bg-gradient-to-r from-[#d4af37] to-[#c19a2e] text-[#0a1628] hover:from-[#c19a2e] hover:to-[#b08a28] hover:-translate-y-0.5 active:translate-y-0',
        outline: 'bg-white border-2 border-[#c8d8f0]/60 text-[#0a1628] hover:border-[#d4af37] hover:bg-[#d4af37]/5',
        danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 hover:-translate-y-0.5 active:translate-y-0',
        success: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 hover:-translate-y-0.5 active:translate-y-0'
    };

    const sizeClasses = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg'
    };

    const widthClass = fullWidth ? 'w-full' : '';

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
        >
            {icon && <span>{icon}</span>}
            {children}
        </button>
    );
};