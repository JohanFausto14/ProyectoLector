'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '4xl';
    maxWidth?: string;
    isLocked?: boolean;
}

export const Modal: React.FC<ModalProps> = ({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    size = 'md',
    maxWidth,
    isLocked = true
}) => {
    const pathname = usePathname();

    const hasSidebar = () => {
        if (!pathname) return false;
        if (pathname.includes('/reader')) return false;
        return (
            pathname.startsWith('/admin') ||
            pathname.startsWith('/alumno') ||
            pathname.startsWith('/escuela') ||
            pathname.startsWith('/profesor') ||
            pathname.startsWith('/tutor')
        );
    };
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl',
        '4xl': 'max-w-7xl'
    };

    const widthClass = maxWidth || sizeClasses[size];

    return (
        <div className={`fixed inset-0 ${hasSidebar() ? 'md:left-64' : ''} z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200`}>
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={isLocked ? undefined : onClose}
            ></div>

            {/* Modal */}
            <div className={`relative w-full ${widthClass} bg-gradient-to-br from-white to-[#f5f8ff] rounded-2xl shadow-2xl border border-[#c8d8f0]/60 max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300`}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#c8d8f0]/60">
                    <h2 className="text-2xl font-playfair font-bold text-[#0a1628]">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[#c8d8f0]/50 rounded-lg transition-colors duration-200 group"
                    >
                        <svg className="w-6 h-6 text-[#6b8cba] group-hover:text-[#0a1628]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};