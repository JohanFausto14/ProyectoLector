'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { CustomSelect } from '../../../components/ui/CustomSelect';
import { Pagination } from '../../../components/ui/Pagination';
import { LicenciaService } from '../../../service/licencia.service';
import { EscuelaService } from '../../../service/escuela.service';
import { LibrosService } from '../../../service/libros.service';
import { Licencia, FiltrosLicencia } from '../../../types/licencias';
import { Libro } from '../../../types/libros/libro';
import type { EscuelaListItem } from '../../../types/admin/escuelas/escuela';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function AdminLicenciasPage() {
    const [licencias, setLicencias] = useState<Licencia[]>([]);
    const [escuelas, setEscuelas] = useState<EscuelaListItem[]>([]);
    const [books, setBooks] = useState<Libro[]>([]);
    const [showGenerar, setShowGenerar] = useState(false);
    
    // Pagination States
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 20;

    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<'4m' | '6m' | 'custom'>('custom');

    const [filtros, setFiltros] = useState<FiltrosLicencia>({
        estado: undefined,
        escuelaId: undefined,
        libroId: undefined
    });

    const [newLicencia, setNewLicencia] = useState({
        escuelaId: '',
        libroId: '',
        cantidad: '',
        fechaVencimiento: '2026-12-31'
    });

    const [statsGlobales, setStatsGlobales] = useState<any>(null);

    // Reset page to 1 when filters change
    useEffect(() => {
        setPage(1);
    }, [filtros]);

    // Bloqueo de scroll global cuando el modal está abierto
    useEffect(() => {
        if (showGenerar) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showGenerar]);

    const handleExportPDF = async (customParams?: any) => {
        try {
            const params = customParams || {
                escuelaId: filtros.escuelaId,
                libroId: filtros.libroId,
                estado: filtros.estado
            };

            if (!params.escuelaId) {
                alert('Selecciona una escuela para exportar el PDF');
                return;
            }

            const blob = await LicenciaService.exportarPDF(params);
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Licencias_${params.escuelaId}_${new Date().getTime()}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Error exporting PDF:', err);
            alert('Error al generar el PDF');
        }
    };

    const handleGenerateBatchPDF = (batchData: any) => {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.setTextColor(43, 27, 23);
        doc.text('PROYECTO LECTOR', 14, 22);
        doc.setFontSize(14);
        doc.setTextColor(141, 110, 63);
        doc.text('Emisión de Licencias Institucionales', 14, 32);
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        const schoolName = escuelas.find(e => Number(e.id) === Number(batchData.escuelaId))?.nombre || 'Institución';
        doc.text(`Institución: ${schoolName}`, 14, 45);
        doc.text(`Libro: ${batchData.titulo}`, 14, 52);
        doc.text(`Cantidad: ${batchData.cantidad}`, 14, 59);
        doc.text(`Vencimiento: ${batchData.fechaVencimiento}`, 14, 66);
        
        autoTable(doc, {
            startY: 75,
            head: [['#', 'Código de Licencia (16 caracteres)']],
            body: batchData.claves.map((clave: string, i: number) => [
                String(i + 1).padStart(2, '0'),
                clave
            ]),
            headStyles: { fillColor: [43, 27, 23], textColor: [240, 230, 210] },
            alternateRowStyles: { fillColor: [251, 248, 241] },
            margin: { top: 75 },
        });

        doc.save(`Nuevas_Licencias_${batchData.titulo}_${new Date().getTime()}.pdf`);
    };

    const loadData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [licRes, escRes, booksRes] = await Promise.all([
                LicenciaService.listLicencias({ ...filtros, page, limit }),
                EscuelaService.getAll(1, 100),
                LibrosService.getAll()
            ]);

            setLicencias(licRes.data || []);
            setTotalItems(licRes.total || (licRes.data?.length || 0));
            setEscuelas(escRes.data || []);
            setBooks(booksRes.data || []);

            // Estadísticas:
            if (filtros.escuelaId) {
                try {
                    const totRes = await LicenciaService.getTotalesEscuela(filtros.escuelaId);
                    setStatsGlobales(totRes.data);
                } catch (e) {
                    setStatsGlobales(null);
                }
            } else {
                // Caso Global: Si el backend no provee totales agregados en licRes,
                // realizamos 3 peticiones ultraligeras (limit: 1) para extraer los totales de los metadatos.
                if (!licRes.stats && !licRes.totales) {
                    try {
                        const [usedRes, availRes, vencRes] = await Promise.all([
                            LicenciaService.listLicencias({ ...filtros, estado: 'usada', page: 1, limit: 1 }),
                            LicenciaService.listLicencias({ ...filtros, estado: 'disponible', page: 1, limit: 1 }),
                            LicenciaService.listLicencias({ ...filtros, estado: 'vencida', page: 1, limit: 1 }),
                        ]);
                        setStatsGlobales({
                            total: licRes.total || 0,
                            enUso: usedRes.total || 0,
                            disponibles: availRes.total || 0,
                            vencidas: vencRes.total || 0
                        });
                    } catch (e) {
                        console.error('Error fetching global stats:', e);
                        setStatsGlobales(null);
                    }
                } else {
                    setStatsGlobales(licRes.stats || licRes.totales);
                }
            }
        } catch (err) {
            console.error('Error loading licencias:', err);
            setError('Error al cargar las licencias');
        } finally {
            setIsLoading(false);
        }
    }, [filtros, page, limit]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleToggleActiva = async (id: number, current: boolean) => {
        try {
            await LicenciaService.toggleActiva(id, !current);
            setLicencias(prev => prev.map(l => l.id === id ? { ...l, activa: !current } : l));
        } catch (err) {
            alert('Error al cambiar estado de la licencia');
        }
    };

    const handleGenerar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newLicencia.escuelaId || !newLicencia.libroId || !newLicencia.cantidad) {
            alert('Por favor completa todos los campos');
            return;
        }
        try {
            setIsGenerating(true);
            const res = await LicenciaService.generarLicencias({
                ...newLicencia,
                escuelaId: Number(newLicencia.escuelaId),
                libroId: Number(newLicencia.libroId),
                cantidad: Number(newLicencia.cantidad)
            });
            setShowGenerar(false);
            if (res.data) handleGenerateBatchPDF(res.data);
            loadData();
            setSelectedPlan('custom');
            setNewLicencia({ escuelaId: '', libroId: '', cantidad: '', fechaVencimiento: '2026-12-31' });
        } catch (err) {
            alert('Error al generar licencias');
        } finally {
            setIsGenerating(false);
        }
    };

    const statsDisplay = {
        total: statsGlobales?.total ?? totalItems,
        disponibles: statsGlobales?.disponibles ?? (filtros.estado === 'disponible' ? totalItems : 0),
        usadas: statsGlobales?.enUso ?? (filtros.estado === 'usada' ? totalItems : 0),
        vencidas: statsGlobales?.vencidas ?? (filtros.estado === 'vencida' ? totalItems : 0),
    };

    return (
        <div className="min-h-screen bg-[#f5f5f5] p-4 md:p-8">
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-playfair font-bold text-[#0a1628] mb-2">Gestión de Licencias</h1>
                        <p className="text-[#1e3a6e] text-lg font-lora">Control maestro de accesos y bibliotecas</p>
                    </div>
                    <button onClick={() => setShowGenerar(true)} className="px-6 py-3 bg-gradient-to-r from-[#0a1628] to-[#1A2F45] text-[#f5f8ff] rounded-xl font-bold shadow-lg flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                        Generar Licencias
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {[
                        { label: 'Total Emitidas', value: statsDisplay.total, bg: 'from-[#0a1628]/10 to-[#0a1628]/5', color: 'text-[#0a1628]', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
                        { label: 'Disponibles', value: statsDisplay.disponibles, bg: 'from-emerald-500/10 to-emerald-500/5', color: 'text-emerald-600', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                        { label: 'En Uso', value: statsDisplay.usadas, bg: 'from-blue-500/10 to-blue-500/5', color: 'text-blue-600', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
                        { label: 'Vencidas', value: statsDisplay.vencidas, bg: 'from-red-500/10 to-red-500/5', color: 'text-red-600', icon: 'M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-gradient-to-br from-white to-[#f5f8ff] rounded-xl p-6 shadow-md border border-[#c8d8f0]/50 hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center gap-4">
                                <div className={`p-3.5 rounded-xl bg-gradient-to-br ${stat.bg}`}>
                                    <svg className={`w-7 h-7 ${stat.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon}/></svg>
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-[#6b8cba] mb-1">{stat.label}</p>
                                    <h3 className="text-3xl font-playfair font-bold text-[#0a1628]">{isLoading ? '...' : stat.value}</h3>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-[#c8d8f0]/50">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="flex-1 w-full">
                            <select 
                                className="w-full px-4 py-3 rounded-xl border-2 border-[#c8d8f0] bg-white text-sm"
                                value={filtros.escuelaId || ''}
                                onChange={e => setFiltros({...filtros, escuelaId: e.target.value ? Number(e.target.value) : undefined})}
                            >
                                <option value="">Todas las Escuelas</option>
                                {escuelas.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                            </select>
                        </div>
                        <button onClick={() => handleExportPDF()} className="w-full md:w-auto px-6 py-3 bg-[#f5f8ff] rounded-xl font-bold border-2 border-[#c8d8f0] flex items-center gap-2">
                            Exportar PDF
                        </button>
                        <div className="hidden lg:flex gap-2">
                            {([
                                { id: undefined, label: 'Todo' },
                                { id: 'disponible', label: 'Libres' },
                                { id: 'usada', label: 'En Uso' },
                                { id: 'vencida', label: 'Bajas' }
                            ] as const).map(opt => (
                                <button key={opt.label} onClick={() => setFiltros({...filtros, estado: opt.id})} className={`px-4 py-2 rounded-lg text-xs font-bold ${filtros.estado === opt.id ? 'bg-[#0a1628] text-[#f5f8ff]' : 'text-[#6b8cba] hover:bg-[#c8d8f0]'}`}>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-lg border border-[#c8d8f0]/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#dce8f8] border-b border-[#b8cfe8]">
                                <tr>
                                    <th className="px-6 py-4 font-bold text-[#1a2d5a] text-xs uppercase tracking-wider">#</th>
                                    <th className="px-6 py-4 font-bold text-[#1a2d5a] text-xs uppercase tracking-wider">Clave</th>
                                    <th className="px-6 py-4 font-bold text-[#1a2d5a] text-xs uppercase tracking-wider">Libro</th>
                                    <th className="px-6 py-4 font-bold text-[#1a2d5a] text-xs uppercase tracking-wider">Institución</th>
                                    <th className="px-6 py-4 font-bold text-xs uppercase text-center">Estado</th>
                                    <th className="px-6 py-4 font-bold text-xs uppercase text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#c8d8f0]">
                                {isLoading ? (
                                    <tr><td colSpan={6} className="p-12 text-center text-[#d4af37]">Cargando registros...</td></tr>
                                ) : licencias.length === 0 ? (
                                    <tr><td colSpan={6} className="p-12 text-center opacity-40">No se encontraron licencias</td></tr>
                                ) : (
                                    licencias.map((l, i) => (
                                        <tr key={l.id} className="hover:bg-[#f5f8ff] transition-colors">
                                            <td className="px-6 py-4 text-xs font-bold text-[#6b8cba]">
                                                {String(((page - 1) * limit) + i + 1).padStart(2, '0')}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-sm">{l.clave}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col text-sm">
                                                    <span className="font-bold">{l.titulo}</span>
                                                    <span className="text-xs text-[#6b8cba]">ID: {l.libroId}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm">{l.nombreEscuela}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                    l.estado === 'disponible' ? 'bg-emerald-100 text-emerald-700' :
                                                    l.estado === 'usada' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {l.estado === 'disponible' ? 'Disponible' : l.estado === 'usada' ? 'Usada' : 'Vencida'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => handleToggleActiva(l.id, l.activa)} className={`px-4 py-2 rounded-xl text-xs font-bold border-2 ${l.activa ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                                    {l.activa ? 'Bloquear' : 'Activar'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {!isLoading && totalItems > limit && (
                        <Pagination
                            currentPage={page}
                            totalPages={Math.ceil(totalItems / limit)}
                            onPageChange={setPage}
                            totalItems={totalItems}
                            itemsPerPage={limit}
                        />
                    )}
                </div>

                {/* Modal Generar */}
                {showGenerar && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm">
                        <div className="bg-[#f5f5f5] rounded-xl p-6 sm:p-12 w-full max-w-xl shadow-2xl border border-[#c8d8f0] relative">
                            <button onClick={() => setShowGenerar(false)} className="absolute top-4 right-4 sm:top-8 sm:right-8 text-[#6b8cba] hover:text-[#0a1628] transition-colors">Cerrar</button>
                            <h2 className="text-2xl sm:text-4xl font-playfair font-bold text-[#0a1628] mb-5 sm:mb-8 text-center">Nueva Emisión</h2>
                            <form onSubmit={handleGenerar} className="space-y-5 sm:space-y-8">
                                <CustomSelect label="Institución" options={escuelas.map(e => ({ id: e.id, label: e.nombre }))} value={newLicencia.escuelaId} onChange={val => setNewLicencia({...newLicencia, escuelaId: String(val)})} required />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    <CustomSelect label="Libro" options={books.map(b => ({ id: b.id, label: b.titulo }))} value={newLicencia.libroId} onChange={val => setNewLicencia({...newLicencia, libroId: String(val)})} required />
                                    <input type="number" className="p-4 rounded-xl border-2" value={newLicencia.cantidad} onChange={e => setNewLicencia({...newLicencia, cantidad: e.target.value})} placeholder="Cantidad" required />
                                </div>
                                <input type="date" className="w-full p-4 rounded-xl border-2" value={newLicencia.fechaVencimiento} onChange={e => setNewLicencia({...newLicencia, fechaVencimiento: e.target.value})} required />
                                <button type="submit" className="w-full py-4 sm:py-5 bg-[#0a1628] text-[#f5f8ff] rounded-xl font-bold shadow-xl hover:bg-[#1A2F45] transition-colors">Generar Licencias</button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
