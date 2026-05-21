'use client';

import React, { useState, useEffect } from 'react';
import { AddLibroModal } from '../../../components/admin/libros/AddLibroModal';
import { AsignLibroModal } from '../../../components/admin/libros/AsignLibroModal';
import { CanjeLibroModal } from '../../../components/admin/libros/CanjeLibroModal';
import { DeleteLibroModal } from '../../../components/admin/libros/DeleteLibroModal';
import { ViewLibroModal } from '../../../components/admin/libros/ViewLibroModal';
import { AdminLibroTable } from '../../../components/admin/libros/AdminLibroTable';
import { Pagination } from '../../../components/ui/Pagination';
import { LibrosService } from '../../../service/libros.service';
import { Libro, LibroEscuela } from '../../../types/libros/libro';

export default function AdminLibrosPage() {
    const ITEMS_PER_PAGE = 10;
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [filterGrado, setFilterGrado] = useState<number | 'todos'>('todos');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showAsignModal, setShowAsignModal] = useState(false);
    const [showCanjeModal, setShowCanjeModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewLibroId, setViewLibroId] = useState<number | null>(null);

    const [libros, setLibros] = useState<Libro[]>([]);
    const [selectedLibro, setSelectedLibro] = useState<Libro | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string>('');

    // Filtros para grados disponibles
    const gradesAvailable = [1, 2, 3, 4, 5, 6];

    useEffect(() => {
        loadLibros();
    }, []);

    const loadLibros = async () => {
        try {
            setIsLoading(true);
            setError('');
            const response = await LibrosService.getAll();
            setLibros(response.data);
        } catch (err: any) {
            console.error('Error al cargar libros:', err);
            setError('Error al cargar libros. Por favor intenta de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredLibros = libros.filter(libro => {
        const matchSearch =
            libro.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            libro.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (libro.materia?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchGrado = filterGrado === 'todos' || Number(libro.grado) === Number(filterGrado);

        return matchSearch && matchGrado;
    });

    const totalPages = Math.max(1, Math.ceil(filteredLibros.length / ITEMS_PER_PAGE));
    const pagedLibros = filteredLibros.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handleGradoChange = (value: string) => {
        setFilterGrado(value === 'todos' ? 'todos' : Number(value));
        setCurrentPage(1);
    };

    const handleView = (libro: Libro) => {
        setViewLibroId(libro.id);
        setShowViewModal(true);
    };

    const handleAssign = (libro: Libro) => {
        setSelectedLibro(libro as LibroEscuela);
        setShowAsignModal(true);
    };

    const handleCanje = (libro: Libro) => {
        setSelectedLibro(libro as LibroEscuela);
        setShowCanjeModal(true);
    };

    const handleDelete = (libro: Libro) => {
        setSelectedLibro(libro);
        setShowDeleteModal(true);
    };

    const handleDownload = async (libro: Libro) => {
        try {
            const blob = await LibrosService.downloadPdf(libro.id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${libro.codigo}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Error al descargar PDF:', err);
            alert('Error al descargar el PDF');
        }
    };

    const handleToggleActivo = async (libro: Libro, activo: boolean) => {
        try {
            setIsLoading(true);
            await LibrosService.toggleLibroGlobal(libro.id, activo);
            // Actualizar el state local
            setLibros(prev => 
                prev.map(l => 
                    l.id === libro.id ? { ...l, activo } : l
                )
            );
            alert(`Libro ${activo ? 'activado' : 'desactivado'} correctamente`);
        } catch (err) {
            console.error('Error al toggle libro:', err);
            alert('Error al cambiar el estado del libro');
        } finally {
            setIsLoading(false);
        }
    };

    const librosPendientes = libros.filter(l => l.estado === 'procesando');
    const librosListo = libros.filter(l => l.estado === 'listo');
    const librosError = libros.filter(l => l.estado === 'error');

    return (
        <div className="min-h-screen bg-[#f5f5f5] p-4 md:p-8">
            <div className="space-y-6 animate-fade-in">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-playfair font-bold text-[#0a1628] mb-2">
                            Gestión de Libros
                        </h1>
                        <p className="text-[#1e3a6e] text-lg font-lora">
                            Carga, gestiona y asigna libros a las escuelas
                        </p>
                    </div>
                    <button 
                        onClick={() => setShowAddModal(true)}
                        disabled={isLoading}
                        className="px-6 py-3 bg-gradient-to-r from-[#0a1628] to-[#1A2F45] text-[#f5f8ff] rounded-xl font-bold hover:from-[#1A2F45] hover:to-[#1a2d5a] shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 whitespace-nowrap hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                        Cargar Libro
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {[
                        { label: 'Total Libros', value: libros.length, bg: 'from-[#0a1628]/10 to-[#0a1628]/5', color: 'text-[#0a1628]', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
                        { label: 'Listos', value: librosListo.length, bg: 'from-emerald-500/10 to-emerald-500/5', color: 'text-emerald-600', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                        { label: 'Procesando', value: librosPendientes.length, bg: 'from-yellow-500/10 to-yellow-500/5', color: 'text-yellow-600', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                        { label: 'Con Error', value: librosError.length, bg: 'from-red-500/10 to-red-500/5', color: 'text-red-600', icon: 'M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-gradient-to-br from-white to-[#f5f8ff] rounded-xl p-6 shadow-md border border-[#c8d8f0]/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            <div className="flex items-center gap-4">
                                <div className={`p-3.5 rounded-xl bg-gradient-to-br ${stat.bg} shadow-sm flex-shrink-0`}>
                                    <svg className={`w-7 h-7 ${stat.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon}/></svg>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold uppercase tracking-wider text-[#6b8cba] mb-1 truncate">{stat.label}</p>
                                    <h3 className="text-3xl font-playfair font-bold text-[#0a1628]">{isLoading ? '...' : stat.value}</h3>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm">
                        <div className="flex items-center gap-3">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            <p className="text-red-800 font-medium">{error}</p>
                        </div>
                    </div>
                )}

                {/* Toolbar */}
                <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-[#c8d8f0]/50">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Buscar por título, código o materia..."
                                value={searchTerm}
                                onChange={e => handleSearchChange(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-[#c8d8f0] bg-white focus:outline-none focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/10 font-lora text-sm transition-all duration-300"
                                disabled={isLoading}
                            />
                            <svg className="w-5 h-5 text-[#6b8cba] absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-[#6b8cba] uppercase tracking-wider whitespace-nowrap">Grado:</span>
                            <select
                                value={filterGrado}
                        onChange={e => handleGradoChange(e.target.value)}
                                className="px-4 py-3 rounded-xl border-2 border-[#c8d8f0] bg-white focus:outline-none focus:border-[#d4af37] font-medium text-sm transition-all"
                                disabled={isLoading}
                            >
                                <option value="todos">Todos</option>
                                {gradesAvailable.map(grade => (
                                    <option key={grade} value={grade}>Grado {grade}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Tabla de libros */}
                <div className="bg-white rounded-xl shadow-lg border border-[#c8d8f0]/50 overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="flex flex-col items-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4af37] mb-4"></div>
                                <p className="text-[#6b8cba] font-bold">Cargando catálogo...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <AdminLibroTable
                                libros={pagedLibros}
                                onView={handleView}
                                onDelete={handleDelete}
                                onAssign={handleAssign}
                                onDownload={handleDownload}
                                onToggleActivo={handleToggleActivo}
                            />

                            {/* Paginación */}
                            {filteredLibros.length > 0 && (
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                    totalItems={filteredLibros.length}
                                    itemsPerPage={ITEMS_PER_PAGE}
                                />
                            )}
                        </>
                    )}
                </div>
            {/* Modals */}
            <AddLibroModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={loadLibros}
            />

            <AsignLibroModal
                isOpen={showAsignModal}
                onClose={() => setShowAsignModal(false)}
                onSuccess={loadLibros}
                libro={selectedLibro as LibroEscuela | null}
            />

            <CanjeLibroModal
                isOpen={showCanjeModal}
                onClose={() => setShowCanjeModal(false)}
                onSuccess={loadLibros}
                libro={selectedLibro as LibroEscuela | null}
            />

            <DeleteLibroModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onSuccess={loadLibros}
                libro={selectedLibro}
            />

            <ViewLibroModal
                isOpen={showViewModal}
                onClose={() => setShowViewModal(false)}
                libroId={viewLibroId}
            />
        </div>
    </div>
);
}
