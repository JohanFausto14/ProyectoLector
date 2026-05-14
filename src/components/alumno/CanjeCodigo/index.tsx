'use client';

import React, { useState } from 'react';
import styles from './styles.module.css';
import { LicenciaService } from '../../../service/licencia.service';

export const CanjeCodigo: React.FC = () => {
    const [code, setCode] = useState('');
    const [message, setMessage] = useState<{ text: string; color: string; opacity: number }>({
        text: 'Validando...',
        color: '#8d6e3f',
        opacity: 0
    });

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
        let formatted = '';
        for (let i = 0; i < val.length; i++) {
            if (i > 0 && i % 4 === 0) formatted += '-';
            formatted += val[i];
        }
        setCode(formatted);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (code.length < 19) { // 16 chars + 3 dashes = 19
            setMessage({ text: '⚠ Código incompleto', color: '#ef5350', opacity: 1 });
            return;
        }

        // Show validating state
        setMessage({ text: 'Verificando...', color: '#8d6e3f', opacity: 1 });

        try {
            const response = await LicenciaService.canjearLicencia({ clave: code });

            setMessage({
                text: `✓ ${response.message}`,
                color: '#66bb6a',
                opacity: 1
            });

            // Opcional: Podríamos mostrar el título del libro canjeado
            // if (response.data?.titulo) {
            //     alert(`¡Felicidades! Has canjeado "${response.data.titulo}"`);
            // }

            // Limpiar el código después de un breve delay
            setTimeout(() => {
                setCode('');
                setMessage(prev => ({ ...prev, opacity: 0 }));
                // Redirigir a la biblioteca para ver el nuevo libro
                window.location.href = '/alumno/library';
            }, 2000);

        } catch (error: any) {
            console.error('Error al canjear:', error);
            const errorMsg = error.response?.data?.message || 'Error al procesar el código';
            setMessage({
                text: `⚠ ${errorMsg}`,
                color: '#ef5350',
                opacity: 1
            });
        }
    };

    return (
        <div className={`${styles.animateFadeIn} flex items-center justify-center min-h-[60vh]`}>
            <div className="bg-white p-8 md:p-12 rounded-xl shadow-xl w-full max-w-2xl border border-[#e3dac9] text-center">
                <div className="w-20 h-20 bg-[#fbf8f1] rounded-full mx-auto mb-6 flex items-center justify-center">
                    <svg className="w-10 h-10 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path></svg>
                </div>

                <h2 className="font-playfair text-3xl font-bold text-[#2b1b17] mb-2">Canjear Libro</h2>
                <p className="font-lora text-[#5d4037] mb-8">Ingresa el código de 16 dígitos proporcionado por tu institución.</p>

                <form onSubmit={handleSubmit} className="max-w-md mx-auto relative group">
                    <input type="text"
                        value={code}
                        onChange={handleInput}
                        placeholder="XXXX-XXXX-XXXX-XXXX"
                        className="w-full text-center text-2xl font-mono uppercase tracking-widest py-4 border-b-2 border-[#e3dac9] focus:outline-none focus:border-[#d4af37] bg-transparent transition-colors placeholder-[#a1887f]/30"
                        maxLength={19}
                    />

                    <p
                        className="h-6 text-sm mt-2 font-bold transition-opacity duration-300"
                        style={{ color: message.color, opacity: message.opacity }}
                    >
                        {message.text}
                    </p>

                    <button type="submit" className="mt-8 bg-[#2b1b17] text-[#f0e6d2] px-8 py-3 rounded-lg font-playfair font-bold uppercase tracking-widest hover:bg-[#3e2723] hover:shadow-lg transition-all w-full">
                        Canjear Ahora
                    </button>
                </form>
            </div>
        </div>
    );
};