'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AddEscuelaModal } from '../../../components/admin/escuelas/AddEscuelaModal';
import { EditEscuelaModal } from '../../../components/admin/escuelas/EditescuelaModal';
import { EscuelaTable } from '../../../components/admin/escuelas/EscuelaTable';
import { Pagination } from '../../../components/ui/Pagination';
import { EscuelaService } from '../../../service/escuela.service';
import type { EscuelaListItem, EscuelaStats } from '../../../types/admin/escuelas/escuela';

type FiltroEstado = 'todos' | 'activa' | 'suspendida' | 'inactiva';

export default function EscuelasAdminPage() {
    // ── Datos ────────────────────────────────────────────────
    const [stats, setStats] = useState<EscuelaStats | null>(null);

    // ── UI state ─────────────────────────────────────────────
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState<FiltroEstado>('todos');
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [error, setError] = useState('');

    const ITEMS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterEstado]);

    // ── Modales ──────────────────────────────────────────────
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedEscuela, setSelectedEscuela] = useState<EscuelaListItem | null>(null);

    // ── Modal de confirmación de eliminación ─────────────────
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [escuelaToDelete, setEscuelaToDelete] = useState<EscuelaListItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    // ── Cargar estadísticas ──────────────────────────────────
    const loadStats = useCallback(async () => {
        try {
            setIsLoadingStats(true);
            const response = await EscuelaService.getStats();
            setStats(response.data);
        } catch (err) {
            console.error('Error al cargar estadísticas:', err);
            // No bloquear la UI por esto, las tarjetas muestran 0
        } finally {
            setIsLoadingStats(false);
        }
    }, []);

    // ── Todas las escuelas (sin filtrar, para filtrado cliente) ─
    const [todasEscuelas, setTodasEscuelas] = useState<EscuelaListItem[]>([]);

    // ── Cargar escuelas ──────────────────────────────────────
    const loadEscuelas = useCallback(async () => {
        try {
            setIsLoading(true);
            setError('');

            // Backend solo acepta page y limit — filtros se aplican en cliente
            const response = await EscuelaService.getAll(1, 100);
            setTodasEscuelas(response.data);
        } catch (err: any) {
            console.error('Error al cargar escuelas:', err);
            setError('Error al cargar las escuelas. Por favor intenta de nuevo.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Filtrado en cliente (search + estado)
    const escuelas = todasEscuelas.filter(e => {
        const term = searchTerm.toLowerCase();
        const matchSearch = !term ||
            e.nombre.toLowerCase().includes(term) ||
            (e.ciudad ?? '').toLowerCase().includes(term) ||
            (e.director
                ? `${e.director.nombre} ${e.director.apellido}`.toLowerCase().includes(term)
                : false);
    const matchEstado = filterEstado === 'todos' || e.estado === filterEstado;
        return matchSearch && matchEstado;
    });

    const totalPages = Math.max(1, Math.ceil(escuelas.length / ITEMS_PER_PAGE));
    const pagedEscuelas = escuelas.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Carga inicial
    useEffect(() => {
        loadStats();
        loadEscuelas();
    }, [loadStats, loadEscuelas]);

    // Bloqueo de scroll global cuando cualquier modal está abierto
    const isAnyModalOpen = showAddModal || showEditModal || showDeleteModal;
    useEffect(() => {
        if (isAnyModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isAnyModalOpen]);

    // ── Handlers modales ─────────────────────────────────────
    const handleAddSuccess = () => {
        setShowAddModal(false);
        loadEscuelas();
        loadStats();
    };

    const handleEdit = (escuela: EscuelaListItem) => {
        setSelectedEscuela(escuela);
        setShowEditModal(true);
    };

    const handleEditSuccess = () => {
        setShowEditModal(false);
        setSelectedEscuela(null);
        loadEscuelas();
        loadStats();
    };

    // ── Handlers delete ──────────────────────────────────────
    const handleDeleteRequest = (escuela: EscuelaListItem) => {
        setEscuelaToDelete(escuela);
        setDeleteError('');
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!escuelaToDelete) return;
        try {
            setIsDeleting(true);
            setDeleteError('');
            await EscuelaService.delete(Number(escuelaToDelete.id));
            console.log('✅ Escuela eliminada:', escuelaToDelete.id);
            setShowDeleteModal(false);
            setEscuelaToDelete(null);
            loadEscuelas();
            loadStats();
        } catch (err: any) {
            console.error('❌ Error al eliminar escuela:', err);
            const status = err.response?.status;
            const raw = err.response?.data?.message;
            // El backend puede mandar message como string o como array
            const apiMessage = Array.isArray(raw) ? raw[0] : raw;

            if (status === 400) {
                setDeleteError(
                    apiMessage ||
                    'No se puede eliminar esta escuela porque tiene alumnos o maestros asociados.'
                );
            } else if (status === 404) {
                setDeleteError('La escuela no fue encontrada.');
            } else {
                setDeleteError(apiMessage || 'Error al eliminar la escuela. Por favor intenta de nuevo.');
            }
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setEscuelaToDelete(null);
        setDeleteError('');
    };

    // ── Valores para las tarjetas ────────────────────────────
    const totalEscuelas = stats?.totalEscuelas ?? 0;
    const escuelasActivas = stats?.escuelasActivas ?? 0;
    const totalAlumnos = stats?.totalAlumnos ?? 0;
    const totalProfesores = stats?.totalProfesores ?? 0;
    const licencias = stats?.licencias ?? 0;
    const loadingVal = isLoadingStats ? '...' : undefined;

    return (
        <div className="min-h-screen bg-[#f5f5f5] p-4 md:p-8">
            <div className="space-y-6 animate-fade-in">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-playfair font-bold text-[#0a1628] mb-2">
                        Panel de Administración
                    </h1>
                    <p className="text-[#1e3a6e] text-lg font-lora">
                        Gestión de Instituciones Educativas
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6">
                    {[
                        {
                            label: 'Total Escuelas',
                            value: loadingVal ?? totalEscuelas,
                            icon: (
                                <svg className="w-7 h-7 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            ),
                            bg: 'from-[#d4af37]/10 to-[#d4af37]/5',
                        },
                        {
                            label: 'Activas',
                            value: loadingVal ?? escuelasActivas,
                            icon: (
                                <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            ),
                            bg: 'from-emerald-500/10 to-emerald-500/5',
                        },
                        {
                            label: 'Total Alumnos',
                            value: loadingVal ?? totalAlumnos.toLocaleString(),
                            icon: (
                                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            ),
                            bg: 'from-blue-500/10 to-blue-500/5',
                        },
                        {
                            label: 'Profesores',
                            value: loadingVal ?? totalProfesores,
                            icon: (
                                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            ),
                            bg: 'from-purple-500/10 to-purple-500/5',
                        },
                        {
                            label: 'Licencias',
                            value: loadingVal ?? licencias.toLocaleString(),
                            icon: (
                                <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                </svg>
                            ),
                            bg: 'from-indigo-500/10 to-indigo-500/5',
                        },
                    ].map(({ label, value, icon, bg }) => (
                        <div key={label} className="bg-gradient-to-br from-white to-[#f5f8ff] rounded-xl p-6 shadow-md border border-[#c8d8f0]/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            <div className="flex items-center gap-4">
                                <div className={`p-3.5 rounded-xl bg-gradient-to-br ${bg} shadow-sm flex-shrink-0`}>
                                    {icon}
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-[#6b8cba] mb-1">{label}</p>
                                    <h3 className="text-3xl font-playfair font-bold text-[#0a1628]">{value}</h3>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Error global */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-center gap-3">
                        <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-red-800 flex-1">{error}</p>
                        <button
                            onClick={loadEscuelas}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-bold"
                        >
                            Reintentar
                        </button>
                    </div>
                )}

                {/* Buscador y filtros */}
                <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-[#c8d8f0]/50">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h3 className="font-playfair text-2xl font-bold text-[#0a1628] flex items-center gap-2">
                                Gestión de Escuelas
                                <span className="px-2.5 py-0.5 bg-[#d4af37]/10 text-[#d4af37] text-sm font-sans rounded-full">
                                    {isLoading ? '...' : escuelas.length}
                                </span>
                            </h3>
                            <p className="text-sm text-[#6b8cba] mt-1">Administra las instituciones educativas</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-4 md:mt-0">
                            {/* Buscador */}
                            <div className="relative flex-1 md:w-80">
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre, ciudad o director..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-[#c8d8f0] bg-white focus:outline-none focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/10 font-lora text-sm transition-all duration-300"
                                />
                                <svg className="w-5 h-5 text-[#6b8cba] absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b8cba] hover:text-[#0a1628] transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            {/* Nueva escuela */}
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="w-full sm:w-auto justify-center px-6 py-3 bg-gradient-to-r from-[#0a1628] to-[#1A2F45] text-[#f5f8ff] rounded-xl font-bold hover:from-[#1A2F45] hover:to-[#1a2d5a] shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 whitespace-nowrap hover:-translate-y-0.5 active:translate-y-0"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                Nueva Escuela
                            </button>
                        </div>
                    </div>

                    {/* Filtros de estado */}
                    <div className="flex flex-wrap gap-3 mt-6">
                        {([
                            { key: 'todos', label: 'Todas', active: 'bg-[#d4af37] text-[#0a1628]' },
                            { key: 'activa', label: 'Activas', active: 'bg-emerald-500 text-white' },
                            { key: 'suspendida', label: 'Suspendidas', active: 'bg-red-500 text-white' },
                            { key: 'inactiva', label: 'Inactivas', active: 'bg-gray-500 text-white' },
                        ] as { key: FiltroEstado; label: string; active: string }[]).map(({ key, label, active }) => (
                            <button
                                key={key}
                                onClick={() => setFilterEstado(key)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 shadow-sm ${filterEstado === key
                                        ? `${active} shadow-md`
                                        : 'bg-[#f5f8ff] text-[#1e3a6e] hover:bg-[#c8d8f0]'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tabla */}
                <div className="bg-white rounded-xl shadow-lg border border-[#c8d8f0]/50 overflow-hidden">
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4af37] mx-auto mb-4" />
                            <p className="text-[#6b8cba]">Cargando escuelas...</p>
                        </div>
                    ) : (
                        <>
                            <EscuelaTable
                                escuelas={pagedEscuelas}
                                onEdit={handleEdit}
                                onDelete={handleDeleteRequest}
                            />
                            {escuelas.length > 0 && (
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                    totalItems={escuelas.length}
                                    itemsPerPage={ITEMS_PER_PAGE}
                                />
                            )}
                        </>
                    )}
                </div>

                {/* ── Modal confirmación de eliminación ───────────────── */}
                {showDeleteModal && escuelaToDelete && (
                    <div className="fixed inset-0 md:left-64 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">

                            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-100">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>

                            <h3 className="font-playfair text-xl font-bold text-[#0a1628] text-center mb-2">
                                Eliminar Escuela
                            </h3>
                            <p className="text-[#1e3a6e] text-center text-sm mb-1">
                                ¿Estás seguro de que deseas eliminar:
                            </p>
                            <p className="text-[#0a1628] font-bold text-center mb-1">
                                {escuelaToDelete.nombre}
                            </p>
                            <p className="text-[#6b8cba] text-center text-xs mb-2">
                                {escuelaToDelete.nivel} {escuelaToDelete.ciudad ? `· ${escuelaToDelete.ciudad}` : ''}
                            </p>
                            <p className="text-red-600 text-center text-xs mb-6">
                                Esta acción no se puede deshacer.
                            </p>

                            {deleteError && (
                                <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded text-sm text-red-800">
                                    {deleteError}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={handleDeleteCancel}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-3 rounded-xl border-2 border-[#c8d8f0] text-[#1e3a6e] font-bold hover:bg-[#f5f8ff] transition-colors disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleDeleteConfirm}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isDeleting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                            Eliminando...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Eliminar
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modales */}
                <AddEscuelaModal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={handleAddSuccess}
                />

                {selectedEscuela && (
                    <EditEscuelaModal
                        isOpen={showEditModal}
                        onClose={() => { setShowEditModal(false); setSelectedEscuela(null); }}
                        onSuccess={handleEditSuccess}
                        escuela={selectedEscuela}
                    />
                )}
            </div>
        </div>
    );
}