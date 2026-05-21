'use client';

import React, { useState, useEffect } from 'react';
import { VinculacionService } from '../../../service/vinculacion.service';

export default function SettingsPage() {
    const [code, setCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        async function loadCode() {
            try {
                const res = await VinculacionService.getMiCodigo();
                setCode(res.data.codigo);
            } catch (err) {
                console.error('Error cargando código:', err);
                // Si el endpoint no existe aún o falla, dejamos el estado en null
            } finally {
                setLoading(false);
            }
        }
        loadCode();
    }, []);

    const copyToClipboard = () => {
        if (code) {
            navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-[#c8d8f0]/50 animate-fade-in">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/5 rounded-xl text-[#d4af37]">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    </div>
                    <div>
                        <h2 className="text-2xl font-playfair font-bold text-[#0a1628]">Vinculación Familiar</h2>
                        <p className="text-[#1e3a6e] font-medium font-lora">Configura el acceso para tus padres o tutores</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <p className="text-[#1e3a6e] leading-relaxed">
                        Comparte este código con tu padre o tutor. Al ingresarlo en su portal, podrá visualizar tu progreso, libros leídos y calificaciones para apoyarte en tu camino de aprendizaje.
                    </p>

                    <div className="bg-[#f5f8ff] rounded-2xl p-6 border-2 border-dashed border-[#c8d8f0]">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6b8cba] mb-4 block">
                            Tu Código de Seguridad
                        </label>
                        
                        <div className="flex flex-col gap-4">
                            <div className="relative group">
                                <div className="w-full bg-white p-5 rounded-xl font-mono text-xs break-all border-2 border-[#c8d8f0] text-[#0a1628] shadow-inner min-h-[80px] flex items-center justify-center">
                                    {loading ? (
                                        <div className="flex gap-2">
                                            <div className="w-2 h-2 bg-[#d4af37] rounded-full animate-bounce" />
                                            <div className="w-2 h-2 bg-[#d4af37] rounded-full animate-bounce [animation-delay:-0.15s]" />
                                            <div className="w-2 h-2 bg-[#d4af37] rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        </div>
                                    ) : (
                                        <span className="text-center">{code || 'Generando código...'}</span>
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors pointer-events-none rounded-xl" />
                            </div>

                            <button
                                onClick={copyToClipboard}
                                disabled={!code || loading}
                                className={`w-full py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl active:scale-[0.98] ${
                                    copied 
                                    ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                                    : 'bg-[#0a1628] text-[#f5f8ff] hover:bg-[#1e3a6e]'
                                } disabled:opacity-50`}
                            >
                                {copied ? (
                                    <>
                                        <svg className="w-5 h-5 animate-scale-in" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                                        ¡Código Copiado!
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                                        Copiar al Portapapeles
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-4 p-4 bg-[#f5f5f5] rounded-xl border border-[#c8d8f0]/30">
                        <div className="mt-0.5 text-[#d4af37]">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        </div>
                        <p className="text-xs text-[#1e3a6e] font-medium leading-relaxed">
                            <span className="font-bold text-[#1e3a6e]">Importante:</span> Este código es de un solo uso. Una vez que tu tutor complete la vinculación, el código dejará de ser válido por seguridad.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
