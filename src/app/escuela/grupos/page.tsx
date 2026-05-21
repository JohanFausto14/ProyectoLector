'use client';

// ============================================================
// PAGE — Grupos del Director
// src/app/(director)/grupos/page.tsx
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import { GrupoCard } from '../../../components/escuela/grupos/GrupoCard';
import { AddGrupoModal } from '../../../components/escuela/grupos/AddGrupoModal';
import { EditGrupoModal } from '../../../components/escuela/grupos/EditGrupoModal';
import { GrupoService } from '../../../service/escuela/grupos/grupo.service';
import type { GrupoListItem } from '../../../types/escuela/grupos/grupo';

type FiltroActivo = 'todos' | 'activos' | 'inactivos';

export default function GruposDirectorPage() {
    // ── Datos ────────────────────────────────────────────────
    const [todosGrupos, setTodosGrupos] = useState<GrupoListItem[]>([]);

    // ── UI state ─────────────────────────────────────────────
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroGrado, setFiltroGrado] = useState<number | 'todos'>('todos');
    const [filtroActivo, setFiltroActivo] = useState<FiltroActivo>('todos');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // ── Modales ──────────────────────────────────────────────
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedGrupo, setSelectedGrupo] = useState<GrupoListItem | null>(null);

    // ── Modal de confirmación de eliminación ─────────────────
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [grupoToDelete, setGrupoToDelete] = useState<GrupoListItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    // ── Cargar grupos ────────────────────────────────────────
    const loadGrupos = useCallback(async () => {
        try {
            setIsLoading(true);
            setError('');
            const data = await GrupoService.getAll();
            console.log('🔍 [GruposPage] Data received from service:', data);
            setTodosGrupos(data);
        } catch (err: any) {
            console.error('Error al cargar grupos:', err);
            setError('Error al cargar los grupos. Por favor intenta de nuevo.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadGrupos();
    }, [loadGrupos]);

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

    // ── Filtrado en cliente ──────────────────────────────────
    const gradosDisponibles = [...new Set(todosGrupos.map(g => g.grado))].sort((a, b) => a - b);

    const grupos = todosGrupos.filter(g => {
        const term = searchTerm.toLowerCase();
        const matchSearch = !term ||
            g.nombre.toLowerCase().includes(term) ||
            String(g.grado).includes(term);
        const matchGrado = filtroGrado === 'todos' || g.grado === filtroGrado;
        const matchActivo =
            filtroActivo === 'todos' ||
            (filtroActivo === 'activos' && g.activo) ||
            (filtroActivo === 'inactivos' && !g.activo);
        return matchSearch && matchGrado && matchActivo;
    });

    // ── Stats ────────────────────────────────────────────────
    const totalGrupos = todosGrupos.length;
    const gruposActivos = todosGrupos.filter(g => g.activo).length;
    const totalGrados = gradosDisponibles.length;

    // ── Handlers modales ─────────────────────────────────────
    const handleAddSuccess = () => {
        setShowAddModal(false);
        loadGrupos();
    };

    const handleEdit = (grupo: GrupoListItem) => {
        setSelectedGrupo(grupo);
        setShowEditModal(true);
    };

    const handleEditSuccess = () => {
        setShowEditModal(false);
        setSelectedGrupo(null);
        loadGrupos();
    };

    // ── Handlers delete ──────────────────────────────────────
    const handleDeleteRequest = (grupo: GrupoListItem) => {
        setGrupoToDelete(grupo);
        setDeleteError('');
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!grupoToDelete) return;
        try {
            setIsDeleting(true);
            setDeleteError('');
            await GrupoService.delete(grupoToDelete.id);
            console.log('✅ Grupo eliminado:', grupoToDelete.id);
            setShowDeleteModal(false);
            setGrupoToDelete(null);
            loadGrupos();
        } catch (err: any) {
            const status = err.response?.status;
            const raw = err.response?.data?.message;
            const msg = Array.isArray(raw) ? raw[0] : raw;

            if (status === 404) {
                setDeleteError('El grupo no fue encontrado.');
            } else if (status === 400) {
                setDeleteError(msg || 'No se puede eliminar este grupo porque tiene alumnos u otros datos asociados.');
            } else {
                setDeleteError(msg || 'Error al eliminar el grupo. Por favor intenta de nuevo.');
            }
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setGrupoToDelete(null);
        setDeleteError('');
    };

    return (
        <div className="space-y-6 animate-fade-in">

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {[
                    {
                        label: 'Total Grupos',
                        value: isLoading ? '...' : totalGrupos,
                        iconColor: 'text-purple-600',
                        gradient: 'from-purple-500/10 to-purple-500/5',
                        icon: (
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        ),
                    },
                    {
                        label: 'Grupos Activos',
                        value: isLoading ? '...' : gruposActivos,
                        iconColor: 'text-emerald-600',
                        gradient: 'from-emerald-500/10 to-emerald-500/5',
                        icon: (
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        ),
                    },
                    {
                        label: 'Grados',
                        value: isLoading ? '...' : totalGrados,
                        iconColor: 'text-[#d4af37]',
                        gradient: 'from-[#d4af37]/10 to-[#d4af37]/5',
                        icon: (
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        ),
                    },
                ].map(({ label, value, iconColor, gradient, icon }) => (
                    <div
                        key={label}
                        className="bg-gradient-to-br from-white to-[#faf8f5] rounded-xl p-6 shadow-md border border-[#c8d8f0]/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3.5 rounded-xl bg-gradient-to-br ${gradient} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                                <div className={iconColor}>{icon}</div>
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-[#6b8cba] mb-1">{label}</p>
                                <h3 className="text-3xl font-playfair font-bold text-[#0a1628] group-hover:text-[#d4af37] transition-colors duration-300">
                                    {value}
                                </h3>
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
                        onClick={loadGrupos}
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
                            Gestión de Grupos
                            <span className="px-2.5 py-0.5 bg-[#d4af37]/10 text-[#d4af37] text-sm font-sans rounded-full">
                                {isLoading ? '...' : grupos.length}
                            </span>
                        </h3>
                        <p className="text-sm text-[#1e3a6e] mt-1">Administra los grupos de tu escuela</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-4 md:mt-0">
                        {/* Buscador */}
                        <div className="relative flex-1 md:w-72">
                            <input
                                type="text"
                                placeholder="Buscar grupo..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-10 py-3 rounded-xl border-2 border-[#c8d8f0] bg-white focus:outline-none focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/10 font-lora text-sm transition-all duration-300"
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

                        {/* Nuevo grupo */}
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="w-full sm:w-auto justify-center px-6 py-3 bg-gradient-to-r from-[#0a1628] to-[#1e3a6e] text-[#f5f8ff] rounded-xl font-bold hover:from-[#1e3a6e] hover:to-[#1a2d5a] shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 whitespace-nowrap hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Nuevo Grupo
                        </button>
                    </div>
                </div>

                {/* Filtros de grado (dinámicos desde API) */}
                <div className="flex flex-wrap gap-3 mt-6">
                    <button
                        onClick={() => setFiltroGrado('todos')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 shadow-sm ${
                            filtroGrado === 'todos'
                                ? 'bg-[#d4af37] text-[#0a1628] shadow-md'
                                : 'bg-[#f5f8ff] text-[#1e3a6e] hover:bg-[#c8d8f0]'
                        }`}
                    >
                        Todos los Grados
                    </button>
                    {gradosDisponibles.map(grado => (
                        <button
                            key={grado}
                            onClick={() => setFiltroGrado(grado)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 shadow-sm ${
                                filtroGrado === grado
                                    ? 'bg-purple-500 text-white shadow-md'
                                    : 'bg-[#f5f8ff] text-[#1e3a6e] hover:bg-[#c8d8f0]'
                            }`}
                        >
                            {grado}° Grado
                        </button>
                    ))}

                    {/* Separador */}
                    <div className="w-px bg-[#c8d8f0] self-stretch mx-1" />

                    {/* Filtro activo/inactivo */}
                    {([
                        { key: 'todos', label: 'Todos' },
                        { key: 'activos', label: 'Activos' },
                        { key: 'inactivos', label: 'Inactivos' },
                    ] as { key: FiltroActivo; label: string }[]).map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setFiltroActivo(key)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 shadow-sm ${
                                filtroActivo === key
                                    ? key === 'activos'
                                        ? 'bg-emerald-500 text-white shadow-md'
                                        : key === 'inactivos'
                                            ? 'bg-gray-500 text-white shadow-md'
                                            : 'bg-[#d4af37] text-[#0a1628] shadow-md'
                                    : 'bg-[#f5f8ff] text-[#1e3a6e] hover:bg-[#c8d8f0]'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid de grupos */}
            {isLoading ? (
                <div className="bg-white rounded-xl p-12 text-center shadow-lg border border-[#c8d8f0]/50">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4af37] mx-auto mb-4" />
                    <p className="text-[#1e3a6e]">Cargando grupos...</p>
                </div>
            ) : grupos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {grupos.map(grupo => (
                        <GrupoCard
                            key={grupo.id}
                            grupo={grupo}
                            onEdit={handleEdit}
                            onDelete={handleDeleteRequest}
                        />
                    ))}
                </div>
            ) : (
                /* Empty State */
                <div className="bg-white rounded-xl p-12 text-center shadow-lg border border-[#c8d8f0]/50">
                    <div className="w-20 h-20 bg-[#f5f8ff] rounded-full mx-auto mb-4 flex items-center justify-center">
                        <svg className="w-10 h-10 text-[#6b8cba]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <h3 className="font-playfair text-xl font-bold text-[#0a1628] mb-2">No se encontraron grupos</h3>
                    <p className="text-[#1e3a6e] mb-4">
                        {searchTerm || filtroGrado !== 'todos' || filtroActivo !== 'todos'
                            ? 'Intenta con otros términos de búsqueda o filtros'
                            : 'Comienza creando el primer grupo de tu escuela'}
                    </p>
                    {!searchTerm && filtroGrado === 'todos' && filtroActivo === 'todos' && (
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#0a1628] to-[#1e3a6e] text-[#f5f8ff] rounded-xl font-bold text-sm hover:from-[#1e3a6e] hover:to-[#1a2d5a] shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Crear Grupo
                        </button>
                    )}
                </div>
            )}

            {/* ── Modal confirmación de eliminación ───────────────── */}
            {showDeleteModal && grupoToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
                        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-100">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>

                        <h3 className="font-playfair text-xl font-bold text-[#0a1628] text-center mb-2">
                            Eliminar Grupo
                        </h3>
                        <p className="text-[#1e3a6e] text-center text-sm mb-1">
                            ¿Estás seguro de que deseas eliminar el grupo:
                        </p>
                        <p className="text-[#0a1628] font-bold text-center text-lg mb-1">
                            {grupoToDelete.grado}° {grupoToDelete.nombre}
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
            <AddGrupoModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={handleAddSuccess}
            />

            {selectedGrupo && (
                <EditGrupoModal
                    isOpen={showEditModal}
                    onClose={() => { setShowEditModal(false); setSelectedGrupo(null); }}
                    onSuccess={handleEditSuccess}
                    grupo={selectedGrupo}
                />
            )}
        </div>
    );
}