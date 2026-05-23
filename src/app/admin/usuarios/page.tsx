'use client';

import React, { useState, useEffect } from 'react';
import { AddUsuarioModal } from '../../../components/admin/usuarios/AddUsuarioModal';
import { EditUsuarioModal } from '../../../components/admin/usuarios/Editusuariomodal';
import { CargaMasivaAdminModal } from '../../../components/admin/usuarios/CargaMasivaAdminModal';
import { UsuarioDetalleRow } from '../../../components/admin/usuarios/UsuarioDetalleRow';
import { Pagination } from '../../../components/ui/Pagination';
import { UsuarioService } from '../../../service/admin/usuarios/vistausuario.service';
import { Usuario, TotalesPorRol, mapTipoPersonaToRole, getNombreCompleto } from '../../../types/admin/usuarios/vistausuario';

type UserRole = 'todos' | 'alumno' | 'profesor' | 'tutor' | 'director';

export default function UsuariosAdminPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<UserRole>('todos');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCargaMasivaModal, setShowCargaMasivaModal] = useState(false);
    const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [totales, setTotales] = useState<TotalesPorRol>({
        administrador: 0,
        director: 0,
        maestro: 0,
        alumno: 0,
        padre: 0,
        total: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string>('');

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [usuarioToDelete, setUsuarioToDelete] = useState<Usuario | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string>('');

    useEffect(() => {
        loadUsuarios();
    }, []);

    // Bloqueo de scroll global cuando cualquier modal está abierto
    const isAnyModalOpen = showAddModal || showEditModal || showCargaMasivaModal || showDeleteModal;
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

    const loadUsuarios = async () => {
        try {
            setIsLoading(true);
            setError('');
            const response = await UsuarioService.getAll();
            
            // La API devuelve { message, totalesPorRol, total, data: [...] }
            // Extraer el array de usuarios
            const usersList = Array.isArray(response?.data) ? response.data : [];
            setUsuarios(usersList);
            
            // Extraer y formatear totales
            const ts = response?.totalesPorRol || {};
            setTotales({
                administrador: ts.administrador || 0,
                director: ts.director || 0,
                maestro: ts.maestro || 0,
                alumno: ts.alumno || 0,
                padre: ts.padre || 0,
                total: ts.total || 0
            });
        } catch (error: any) {
            console.error('Error al cargar usuarios:', error);
            setError('Error al cargar usuarios. Por favor intenta de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredUsuarios = (usuarios || []).filter(usuario => {
        const nombreCompleto = getNombreCompleto(usuario);
        const matchSearch =
            nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
            usuario.correo.toLowerCase().includes(searchTerm.toLowerCase());
        const uiRole = mapTipoPersonaToRole(usuario.tipoPersona);
        const matchRole = filterRole === 'todos' || uiRole === filterRole;
        return matchSearch && matchRole;
    });

    // Reset page on search or filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterRole]);

    const totalPages = Math.ceil(filteredUsuarios.length / ITEMS_PER_PAGE);
    const paginatedUsuarios = filteredUsuarios.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const totalUsuarios = totales.total;
    const totalAlumnos = totales.alumno;
    const totalProfesores = totales.maestro;
    const totalTutores = totales.padre;
    const totalDirectores = totales.director + totales.administrador;

    const getRoleBadge = (tipoPersona: string) => {
        const badges = {
            alumno: { color: 'bg-blue-100 text-blue-700', icon: '📚', label: 'Alumno' },
            maestro: { color: 'bg-purple-100 text-purple-700', icon: '👨‍🏫', label: 'Profesor' },
            padre: { color: 'bg-emerald-100 text-emerald-700', icon: '👥', label: 'Tutor' },
            director: { color: 'bg-[#d4af37]/10 text-[#0a1628]', icon: '⭐', label: 'Director' },
            administrador: { color: 'bg-red-100 text-red-700', icon: '👑', label: 'Admin' }
        };
        return badges[tipoPersona as keyof typeof badges] || badges.alumno;
    };

    const handleAddSuccess = () => {
        loadUsuarios();
        setShowAddModal(false);
    };

    const handleEdit = (usuario: Usuario) => {
        setSelectedUsuario(usuario);
        setShowEditModal(true);
    };

    const handleEditSuccess = () => {
        loadUsuarios();
        setShowEditModal(false);
        setSelectedUsuario(null);
    };

    const handleDeleteRequest = (usuario: Usuario) => {
        setUsuarioToDelete(usuario);
        setDeleteError('');
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!usuarioToDelete) return;
        try {
            setIsDeleting(true);
            setDeleteError('');
            await UsuarioService.delete(usuarioToDelete.id);
            console.log('✅ Usuario eliminado:', usuarioToDelete.id);
            setShowDeleteModal(false);
            setUsuarioToDelete(null);
            loadUsuarios();
        } catch (error: any) {
            console.error('❌ Error al eliminar usuario:', error);
            const apiMessage = error.response?.data?.message;
            setDeleteError(apiMessage || 'Error al eliminar el usuario. Por favor intenta de nuevo.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setUsuarioToDelete(null);
        setDeleteError('');
    };

    return (
        <div className="min-h-screen bg-[#f5f5f5] p-4 md:p-8">
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-playfair font-bold text-[#0a1628] mb-2">
                        Gestión de Usuarios
                    </h1>
                    <p className="text-[#1e3a6e] text-lg font-lora">
                        Registro y administración centralizada de todos los usuarios del sistema
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <p className="text-red-800">{error}</p>
                            <button onClick={loadUsuarios} className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                Reintentar
                            </button>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
                    <div className="bg-gradient-to-br from-white to-[#f5f8ff] rounded-xl p-6 shadow-md border border-[#c8d8f0]/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="flex flex-col items-center text-center">
                            <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#d4af37]/10 to-[#d4af37]/5 shadow-sm mb-3">
                                <svg className="w-7 h-7 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                </svg>
                            </div>
                            <p className="text-xs font-bold uppercase tracking-wider text-[#6b8cba] mb-1">Total</p>
                            <h3 className="text-3xl font-playfair font-bold text-[#0a1628]">{isLoading ? '...' : totalUsuarios}</h3>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-white to-[#f5f8ff] rounded-xl p-6 shadow-md border border-[#c8d8f0]/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="flex flex-col items-center text-center">
                            <div className="p-3.5 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 shadow-sm mb-3">
                                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                </svg>
                            </div>
                            <p className="text-xs font-bold uppercase tracking-wider text-[#6b8cba] mb-1">Alumnos</p>
                            <h3 className="text-3xl font-playfair font-bold text-[#0a1628]">{isLoading ? '...' : totalAlumnos}</h3>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-white to-[#f5f8ff] rounded-xl p-6 shadow-md border border-[#c8d8f0]/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="flex flex-col items-center text-center">
                            <div className="p-3.5 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 shadow-sm mb-3">
                                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                </svg>
                            </div>
                            <p className="text-xs font-bold uppercase tracking-wider text-[#6b8cba] mb-1">Profesores</p>
                            <h3 className="text-3xl font-playfair font-bold text-[#0a1628]">{isLoading ? '...' : totalProfesores}</h3>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-white to-[#f5f8ff] rounded-xl p-6 shadow-md border border-[#c8d8f0]/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="flex flex-col items-center text-center">
                            <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 shadow-sm mb-3">
                                <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                </svg>
                            </div>
                            <p className="text-xs font-bold uppercase tracking-wider text-[#6b8cba] mb-1">Tutores</p>
                            <h3 className="text-3xl font-playfair font-bold text-[#0a1628]">{isLoading ? '...' : totalTutores}</h3>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-white to-[#f5f8ff] rounded-xl p-6 shadow-md border border-[#c8d8f0]/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="flex flex-col items-center text-center">
                            <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#c19a2e] shadow-sm mb-3">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                                </svg>
                            </div>
                            <p className="text-xs font-bold uppercase tracking-wider text-[#6b8cba] mb-1">Directores</p>
                            <h3 className="text-3xl font-playfair font-bold text-[#0a1628]">{isLoading ? '...' : totalDirectores}</h3>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-[#c8d8f0]/50">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h3 className="font-playfair text-2xl font-bold text-[#0a1628] flex items-center gap-2">
                                Directorio de Usuarios
                                <span className="px-2.5 py-0.5 bg-[#d4af37]/10 text-[#d4af37] text-sm font-sans rounded-full">
                                    {filteredUsuarios.length}
                                </span>
                            </h3>
                            <p className="text-sm text-[#6b8cba] mt-1">Administra todos los usuarios del sistema</p>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-3 w-full md:w-auto">
                            {/* Buscador */}
                            <div className="relative w-full lg:w-80">
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre o email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-[#c8d8f0] bg-white focus:outline-none focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/10 font-lora text-sm transition-all duration-300"
                                />
                                <svg className="w-5 h-5 text-[#6b8cba] absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                                {searchTerm && (
                                    <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b8cba] hover:text-[#0a1628] transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                        </svg>
                                    </button>
                                )}
                            </div>

                            {/* Botón Carga Masiva */}
                            <button
                                onClick={() => setShowCargaMasivaModal(true)}
                                className="px-4 py-3 bg-gradient-to-r from-emerald-700 to-emerald-600 text-white rounded-xl font-bold hover:from-emerald-800 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 whitespace-nowrap hover:-translate-y-0.5 active:translate-y-0"
                                title="Carga masiva desde Excel"
                            >
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>Carga Masiva</span>
                            </button>

                            {/* Botón Nuevo Usuario */}
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="px-6 py-3 bg-gradient-to-r from-[#0a1628] to-[#1A2F45] text-[#f5f8ff] rounded-xl font-bold hover:from-[#1A2F45] hover:to-[#1a2d5a] shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 whitespace-nowrap hover:-translate-y-0.5 active:translate-y-0"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                                </svg>
                                Nuevo Usuario
                            </button>
                        </div>
                    </div>

                    {/* Filter Buttons */}
                    <div className="flex flex-wrap gap-3 mt-6">
                        {(['todos', 'alumno', 'profesor', 'tutor', 'director'] as UserRole[]).map((role) => {
                            const labels: Record<UserRole, string> = {
                                todos: 'Todos',
                                alumno: '📚 Alumnos',
                                profesor: '👨‍🏫 Profesores',
                                tutor: '👥 Tutores',
                                director: '⭐ Directores',
                            };
                            const activeClass: Record<UserRole, string> = {
                                todos: 'bg-[#d4af37] text-[#0a1628] shadow-md',
                                alumno: 'bg-blue-500 text-white shadow-md',
                                profesor: 'bg-purple-500 text-white shadow-md',
                                tutor: 'bg-emerald-500 text-white shadow-md',
                                director: 'bg-gradient-to-r from-[#d4af37] to-[#c19a2e] text-[#0a1628] shadow-md',
                            };
                            return (
                                <button
                                    key={role}
                                    onClick={() => setFilterRole(role)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${filterRole === role ? activeClass[role] : 'bg-[#f5f8ff] text-[#1e3a6e] hover:bg-[#c8d8f0]'
                                        }`}
                                >
                                    {labels[role]}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Usuarios Table */}
                <div className="bg-white rounded-xl shadow-lg border border-[#c8d8f0]/50 overflow-hidden min-h-[650px] flex flex-col justify-between">
                    {isLoading ? (
                        <div className="text-center py-12 m-auto">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4af37] mx-auto mb-4"></div>
                            <p className="text-[#6b8cba]">Cargando usuarios...</p>
                        </div>
                    ) : (
                        <div className="w-full flex-grow overflow-x-auto">
                            <table className="w-full block md:table">
                                <thead className="hidden md:table-header-group bg-[#dce8f8]">
                                    <tr className="block md:table-row">
                                        <th className="px-6 py-4 text-center text-xs font-bold text-[#1a2d5a] uppercase tracking-wider">Usuario</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-[#1a2d5a] uppercase tracking-wider">Rol</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-[#1a2d5a] uppercase tracking-wider">Contacto</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-[#1a2d5a] uppercase tracking-wider">Escuela</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-[#1a2d5a] uppercase tracking-wider">Estado</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-[#1a2d5a] uppercase tracking-wider">Últ. Conexión</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-[#1a2d5a] uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="block md:table-row-group divide-y md:divide-y md:divide-[#c8d8f0] space-y-4 md:space-y-0 p-4 md:p-0">
                                    {paginatedUsuarios.map((usuario) => {
                                        const badge = getRoleBadge(usuario.tipoPersona);
                                        return (
                                            <UsuarioDetalleRow
                                                key={usuario.id}
                                                usuario={usuario}
                                                badgeColor={badge.color}
                                                badgeIcon={badge.icon}
                                                badgeLabel={badge.label}
                                                onEdit={handleEdit}
                                                onDelete={handleDeleteRequest}
                                            />
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {!isLoading && filteredUsuarios.length === 0 && (
                        <div className="text-center py-12 m-auto">
                            <div className="w-20 h-20 bg-[#f5f8ff] rounded-full mx-auto mb-4 flex items-center justify-center">
                                <svg className="w-10 h-10 text-[#6b8cba]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                </svg>
                            </div>
                            <h3 className="font-playfair text-xl font-bold text-[#0a1628] mb-2">No se encontraron usuarios</h3>
                            <p className="text-[#6b8cba]">Intenta con otros términos de búsqueda o filtros</p>
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {!isLoading && filteredUsuarios.length > 0 && totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            totalItems={filteredUsuarios.length}
                            itemsPerPage={ITEMS_PER_PAGE}
                        />
                    )}
                </div>

                {/* Modal eliminación */}
                {showDeleteModal && usuarioToDelete && (
                    <div className="fixed inset-0 md:left-64 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
                            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-100">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                                </svg>
                            </div>
                            <h3 className="font-playfair text-xl font-bold text-[#0a1628] text-center mb-2">Eliminar Usuario</h3>
                            <p className="text-[#1e3a6e] text-center text-sm mb-1">¿Estás seguro de que deseas eliminar a:</p>
                            <p className="text-[#0a1628] font-bold text-center mb-1">
                                {getNombreCompleto(usuarioToDelete)}
                            </p>
                            <p className="text-[#6b8cba] text-center text-xs mb-6">{usuarioToDelete.correo}</p>
                            <p className="text-red-600 text-center text-xs mb-6">Esta acción no se puede deshacer.</p>

                            {deleteError && (
                                <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded text-sm text-red-800">
                                    {deleteError}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button onClick={handleDeleteCancel} disabled={isDeleting} className="flex-1 px-4 py-3 rounded-xl border-2 border-[#c8d8f0] text-[#1e3a6e] font-bold hover:bg-[#f5f8ff] transition-colors disabled:opacity-50">
                                    Cancelar
                                </button>
                                <button onClick={handleDeleteConfirm} disabled={isDeleting} className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                    {isDeleting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Eliminando...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                            </svg>
                                            Eliminar
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Usuario Modal */}
                <AddUsuarioModal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={handleAddSuccess}
                />

                {/* Edit Usuario Modal */}
                {selectedUsuario && (
                    <EditUsuarioModal
                        isOpen={showEditModal}
                        onClose={() => { setShowEditModal(false); setSelectedUsuario(null); }}
                        onSuccess={handleEditSuccess}
                        usuario={selectedUsuario}
                    />
                )}

                {/* Carga Masiva Modal */}
                <CargaMasivaAdminModal
                    isOpen={showCargaMasivaModal}
                    onClose={() => setShowCargaMasivaModal(false)}
                    onSuccess={loadUsuarios}
                />
            </div>
        </div>
    );
}