'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { LicenciaService } from '../../../service/licencia.service';
import { Licencia, LicenciaTotales } from '../../../types/licencias';

export default function EscuelaLicenciasPage() {
    const [licencias, setLicencias] = useState<Licencia[]>([]);
    const [totales, setTotales] = useState<LicenciaTotales | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const ESCUELA_ID = 1; 

    const loadData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [licRes, totRes] = await Promise.all([
                LicenciaService.listLicenciasEscuela(ESCUELA_ID),
                LicenciaService.getTotalesEscuela(ESCUELA_ID)
            ]);
            setLicencias(licRes.data || []);
            setTotales(totRes.data);
        } catch (err) {
            console.error('Error loading school licencias:', err);
            setError('Error al cargar la información');
        } finally {
            setIsLoading(false);
        }
    }, [ESCUELA_ID]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return (
        <div className="min-h-screen bg-[#fdfcf9] font-lora pb-20">
            <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12 animate-fade-in">
                
                {/* School Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center pt-10 border-b border-[#c8d8f0]/30 pb-10">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#d4af37]/10 text-[#d4af37] rounded-full text-xs font-black uppercase tracking-widest border border-[#d4af37]/20">
                            Institucional
                        </div>
                        <h1 className="text-5xl font-playfair font-black text-[#0a1628] tracking-tighter">
                            Inventario de Licencias
                        </h1>
                        <p className="text-[#1e3a6e] text-lg font-medium max-w-xl">Supervisión detallada de accesos digitales y consumo por obra literaria.</p>
                    </div>
                    
                    <button 
                        onClick={loadData}
                        className="mt-6 md:mt-0 p-4 bg-white rounded-xl shadow-xl border border-[#c8d8f0]/40 hover:scale-105 active:scale-95 transition-all text-[#d4af37]"
                        title="Refrescar datos"
                    >
                        <svg className={`w-6 h-6 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                    </button>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Fondo Editorial', value: totales?.total || 0, color: '#0a1628', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
                        { label: 'Sin Asignar', value: totales?.disponibles || 0, color: '#10b981', icon: 'M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2' },
                        { label: 'En Lectura', value: totales?.enUso || 0, color: '#d4af37', icon: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z' },
                        { label: 'Caducadas', value: totales?.vencidas || 0, color: '#ef4444', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white rounded-xl p-8 shadow-xl border border-[#c8d8f0]/40 hover:shadow-2xl transition-all group overflow-hidden relative text-center">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d={stat.icon}/></svg>
                            </div>
                            <div className="flex justify-center mb-6">
                                <div className="p-4 rounded-full bg-[#f5f8ff] shadow-inner border border-[#c8d8f0]/30 group-hover:scale-110 transition-transform">
                                    <svg className="w-8 h-8" style={{color: stat.color}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon}/></svg>
                                </div>
                            </div>
                            <h3 className="text-5xl font-playfair font-black text-[#0a1628] mb-2 leading-none">{isLoading ? '...' : stat.value}</h3>
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1e3a6e]">{stat.label}</p>
                            <div className="mt-6 w-full bg-[#f5f8ff] h-1.5 rounded-full overflow-hidden">
                                <div className="h-full transition-all duration-1000" style={{
                                    width: totales ? `${(stat.value / totales.total) * 100}%` : '0%',
                                    backgroundColor: stat.color
                                }}></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-xl shadow-xl border border-[#c8d8f0] overflow-hidden">
                            <div className="p-10 border-b border-[#c8d8f0]">
                                <h3 className="text-3xl font-playfair font-black text-[#0a1628] flex items-center gap-3">
                                    Desglose por Título
                                </h3>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-left whitespace-nowrap">
                                    <thead className="bg-gradient-to-r from-[#f5f8ff] to-[#f5f8ff] border-b border-[#c8d8f0]">
                                        <tr>
                                            <th className="px-8 py-5 font-bold text-[#0a1628] uppercase tracking-wider text-xs">Libro</th>
                                            <th className="px-8 py-5 font-bold text-[#0a1628] uppercase tracking-wider text-xs text-center">Total</th>
                                            <th className="px-8 py-5 font-bold text-[#0a1628] uppercase tracking-wider text-xs text-center">Libres</th>
                                            <th className="px-8 py-5 font-bold text-[#0a1628] uppercase tracking-wider text-xs text-center">Activadas</th>
                                            <th className="px-8 py-5 font-bold text-[#0a1628] uppercase tracking-wider text-xs text-center">Caducas</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#c8d8f0]">
                                        {isLoading ? (
                                            <tr><td colSpan={5} className="p-20 text-center italic text-[#1e3a6e] animate-pulse">Analizando fondo editorial...</td></tr>
                                        ) : !totales?.porLibro?.length ? (
                                            <tr><td colSpan={5} className="p-20 text-center text-[#6b8cba]">No hay datos registrados aún.</td></tr>
                                        ) : (
                                            totales.porLibro.map(pl => {
                                                const percUso = (pl.enUso / pl.total) * 100;
                                                return (
                                                    <tr key={pl.libroId} className="group hover:bg-[#f5f8ff] transition-colors">
                                                        <td className="px-8 py-6">
                                                            <div className="flex flex-col">
                                                                <span className="font-playfair font-bold text-[#0a1628] group-hover:text-[#d4af37] transition-colors">{pl.titulo}</span>
                                                                <span className="text-[10px] font-mono text-[#6b8cba] uppercase font-bold tracking-widest mt-1">Capacidad: {pl.total}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6 text-center font-bold text-[#1e3a6e]">{pl.total}</td>
                                                        <td className="px-8 py-6 text-center">
                                                            <span className="text-emerald-600 font-bold">{pl.disponibles}</span>
                                                        </td>
                                                        <td className="px-8 py-6 text-center">
                                                            <span className="text-amber-600 font-bold">{pl.enUso}</span>
                                                        </td>
                                                        <td className="px-8 py-6 text-center">
                                                            <span className="text-red-600 font-bold">{pl.vencidas}</span>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-[#0a1628] rounded-xl p-8 shadow-2xl text-[#f5f8ff]">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-2xl font-playfair font-black tracking-tight">Registro de Claves</h3>
                                <div className="p-2 bg-white/10 rounded-xl">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></svg>
                                </div>
                            </div>

                            <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-white">
                                {isLoading ? (
                                    <div className="text-center py-10 opacity-50 italic">Cargando bitácora...</div>
                                ) : licencias.length === 0 ? (
                                    <div className="text-center py-10 opacity-30">Vacío</div>
                                ) : (
                                    licencias.map(l => (
                                        <div key={l.id} className="bg-white/5 p-5 rounded-xl border border-white/10 hover:bg-white/10 transition-all group">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="font-mono font-black text-[#d4af37] text-sm tracking-widest">{l.clave}</span>
                                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                                                    l.estado === 'disponible' ? 'bg-emerald-500/20 text-emerald-400' :
                                                    l.estado === 'usada' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                    {l.estado}
                                                </span>
                                            </div>
                                            <h5 className="font-bold text-sm mb-1 truncate">{l.titulo}</h5>
                                            <div className="flex justify-between items-center pt-3 border-t border-white/5">
                                                <span className="text-[10px] text-white/50">{l.alumno || 'Stock'}</span>
                                                <span className="text-[10px] font-mono text-white/30">{l.fechaAsignacion || '00/00/00'}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Support Card */}
                        <div className="bg-[#d4af37] rounded-xl p-8 shadow-2xl relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>
                            </div>
                            <h4 className="text-[#0a1628] font-playfair font-black text-xl mb-2">Ayuda con Licencias</h4>
                            <p className="text-[#0a1628]/70 text-sm mb-6">Si necesitas ampliar tu cupo o reportar claves dañadas, contacta a tu asesor.</p>
                            <button className="w-full py-4 bg-[#0a1628] text-[#f5f8ff] rounded-xl font-bold text-sm shadow-xl hover:bg-black transition-colors">Solicitar Soporte</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
