'use client';

import React, { useState, useEffect } from 'react';
import { AddAlumnoModal } from '../../../components/escuela/alumnos/AddAlumnoModal';
import { EditAlumnoModal } from '../../../components/escuela/alumnos/EditAlumnoModal';
import { CargaMasivaModal } from '../../../components/escuela/alumnos/CargaMasivaModal';
import { AlumnoTable } from '../../../components/escuela/alumnos/AlumnoTable';
import { alumnoService } from '../../../service/escuela/alumnos/alumno.service';
import { GrupoService } from '../../../service/escuela/grupos/grupo.service';
import { toast } from '@/utils/toast';
import { AlumnoEscuela, getNombreCompletoAlumno, formatGrupo } from '../../../types/escuela/alumnos/alumno.types';
import { GrupoListItem } from '../../../types/escuela/grupos/grupo';

export default function AlumnosPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGrado, setFilterGrado] = useState<string>('todos');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showCargaMasivaModal, setShowCargaMasivaModal] = useState(false);
    const [selectedAlumno, setSelectedAlumno] = useState<AlumnoEscuela | null>(null);
    const [alumnoToDelete, setAlumnoToDelete] = useState<AlumnoEscuela | null>(null);
    const [alumnos, setAlumnos] = useState<AlumnoEscuela[]>([]);
    const [grupos, setGrupos] = useState<GrupoListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string>('');

    // Cargar alumnos desde la API
    const cargarAlumnos = async () => {
        try {
            setIsLoading(true);
            const [alumnosRes, gruposRes] = await Promise.all([
                alumnoService.obtenerAlumnos(),
                GrupoService.getAll()
            ]);
            console.log('✅ Alumnos cargados:', alumnosRes);
            console.log('✅ Grupos cargados:', gruposRes);
            setAlumnos(alumnosRes.data);
            setGrupos(gruposRes);
        } catch (error: any) {
            console.error('Error al cargar alumnos:', error);
            toast.error('Error al cargar la lista de alumnos');
            setAlumnos([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        cargarAlumnos();
    }, []);

    // Bloqueo de scroll global cuando cualquier modal está abierto
    const isAnyModalOpen = showAddModal || showEditModal || showDeleteModal || showCargaMasivaModal;
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

    const filteredAlumnos = alumnos.filter(alumno => {
        const nombreCompleto = getNombreCompletoAlumno(alumno);
        
        // Resolver grado y grupo para el filtrado
        const resolvedGrupo = alumno.grupoId ? grupos.find(g => g.id === alumno.grupoId) : null;
        const currentGrado = resolvedGrupo ? resolvedGrupo.grado : alumno.grado;

        const matchSearch = nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          alumno.persona.correo.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchGrado = filterGrado === 'todos' ||
                          (currentGrado && currentGrado.toString() === filterGrado);
        
        return matchSearch && matchGrado;
    });

    const gradosUnicos = Array.from(new Set(alumnos.map(a => {
        const resolvedGrupo = a.grupoId ? grupos.find(g => g.id === a.grupoId) : null;
        return resolvedGrupo ? resolvedGrupo.grado : a.grado;
    }).filter(Boolean)));
    const conTutor = alumnos.filter(a => a.padre !== null).length;

    const handleAddSuccess = () => {
        console.log('✅ Alumno agregado exitosamente, recargando lista...');
        cargarAlumnos();
    };

    const handleEdit = (alumno: AlumnoEscuela) => {
        setSelectedAlumno(alumno);
        setShowEditModal(true);
    };

    const handleEditSuccess = () => {
        console.log('✅ Alumno editado exitosamente, recargando lista...');
        cargarAlumnos();
        setShowEditModal(false);
        setSelectedAlumno(null);
    };

    const handleDeleteRequest = (alumno: AlumnoEscuela) => {
        setAlumnoToDelete(alumno);
        setDeleteError('');
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!alumnoToDelete) return;

        try {
            setIsDeleting(true);
            setDeleteError('');
            await alumnoService.eliminarAlumno(alumnoToDelete.personaId);

            console.log('✅ Alumno eliminado:', alumnoToDelete.personaId);
            toast.success(`Alumno ${getNombreCompletoAlumno(alumnoToDelete)} eliminado exitosamente`);

            setShowDeleteModal(false);
            setAlumnoToDelete(null);
            cargarAlumnos();
        } catch (error: any) {
            console.error('❌ Error al eliminar alumno:', error);
            setDeleteError(error.message || 'Error al eliminar el alumno. Por favor intenta de nuevo.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setAlumnoToDelete(null);
        setDeleteError('');
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
                <div className="bg-gradient-to-br from-white to-[#faf8f5] rounded-xl p-6 shadow-md border border-[#c8d8f0]/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center gap-4">
                        <div className="p-3.5 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 shadow-sm">
                            <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-[#6b8cba] mb-1">Total Alumnos</p>
                            <h3 className="text-3xl font-playfair font-bold text-[#0a1628]">
                                {isLoading ? '...' : alumnos.length}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-white to-[#faf8f5] rounded-xl p-6 shadow-md border border-[#c8d8f0]/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center gap-4">
                        <div className="p-3.5 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 shadow-sm">
                            <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-[#6b8cba] mb-1">Grados</p>
                            <h3 className="text-3xl font-playfair font-bold text-[#0a1628]">
                                {isLoading ? '...' : gradosUnicos.length}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-white to-[#faf8f5] rounded-xl p-6 shadow-md border border-[#c8d8f0]/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center gap-4">
                        <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 shadow-sm">
                            <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-[#6b8cba] mb-1">Con Tutor</p>
                            <h3 className="text-3xl font-playfair font-bold text-[#0a1628]">
                                {isLoading ? '...' : conTutor}
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Card carga masiva */}
                <div
                    onClick={() => setShowCargaMasivaModal(true)}
                    className="bg-gradient-to-br from-white to-[#faf8f5] rounded-xl p-6 shadow-md border border-[#c8d8f0]/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 shadow-sm group-hover:from-emerald-500/20 group-hover:to-emerald-500/10 transition-all">
                            <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-[#6b8cba] mb-1">Carga Masiva</p>
                            <p className="text-sm font-bold text-[#0a1628] group-hover:text-emerald-700 transition-colors">
                                Importar Excel
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-[#c8d8f0]/50">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h3 className="font-playfair text-2xl font-bold text-[#0a1628] flex items-center gap-2">
                            Gestión de Alumnos
                            <span className="px-2.5 py-0.5 bg-[#d4af37]/10 text-[#d4af37] text-sm font-sans rounded-full">
                                {filteredAlumnos.length}
                            </span>
                        </h3>
                        <p className="text-sm text-[#1e3a6e] mt-1">Administra y monitorea a tus estudiantes</p>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        {/* Buscador */}
                        <div className="relative flex-1 md:w-80">
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
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b8cba] hover:text-[#0a1628] transition-colors"
                                >
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
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="hidden sm:inline">Carga Masiva</span>
                        </button>

                        {/* Botón Nuevo Alumno */}
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-6 py-3 bg-gradient-to-r from-[#0a1628] to-[#1e3a6e] text-[#f5f8ff] rounded-xl font-bold hover:from-[#1e3a6e] hover:to-[#1a2d5a] shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 whitespace-nowrap hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                            Nuevo Alumno
                        </button>
                    </div>
                </div>

                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-3 mt-6">
                    <button
                        onClick={() => setFilterGrado('todos')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                            filterGrado === 'todos'
                                ? 'bg-[#d4af37] text-[#0a1628] shadow-md'
                                : 'bg-[#f5f8ff] text-[#1e3a6e] hover:bg-[#c8d8f0]'
                        }`}
                    >
                        Todos los Grados
                    </button>
                    {(gradosUnicos as number[]).sort((a, b) => a - b).map((grado) => (
                        <button
                            key={grado}
                            onClick={() => setFilterGrado(grado.toString())}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                                filterGrado === grado.toString()
                                    ? 'bg-purple-500 text-white shadow-md'
                                    : 'bg-[#f5f8ff] text-[#1e3a6e] hover:bg-[#c8d8f0]'
                            }`}
                        >
                            {grado}° Grado
                        </button>
                    ))}
                </div>
            </div>

            {/* Alumnos Table */}
            <div className="bg-white rounded-xl shadow-lg border border-[#c8d8f0]/50 overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#d4af37]"></div>
                    </div>
                ) : (
                    <AlumnoTable
                        alumnos={filteredAlumnos}
                        grupos={grupos}
                        onEdit={handleEdit}
                        onDelete={handleDeleteRequest}
                    />
                )}
            </div>

            {/* Modal de confirmación de eliminación */}
            {showDeleteModal && alumnoToDelete && (
                <div className="fixed inset-0 md:left-64 z-50 flex items-center justify-center p-4">
                    {/* Overlay */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    />
                    {/* Dialog */}
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
                        {/* Icono de advertencia */}
                        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-100">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                            </svg>
                        </div>

                        <h3 className="font-playfair text-xl font-bold text-[#0a1628] text-center mb-2">
                            Eliminar Alumno
                        </h3>
                        <p className="text-[#1e3a6e] text-center text-sm mb-1">
                            ¿Estás seguro de que deseas eliminar a:
                        </p>
                        <p className="text-[#0a1628] font-bold text-center mb-1">
                            {getNombreCompletoAlumno(alumnoToDelete)}
                        </p>
                        <p className="text-[#1e3a6e] text-center text-xs mb-6">
                            {alumnoToDelete.persona.correo}
                        </p>
                        <p className="text-red-600 text-center text-xs mb-6">
                            Esta acción no se puede deshacer.
                        </p>

                        {/* Error de eliminación */}
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

            {/* Add Alumno Modal */}
            <AddAlumnoModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={handleAddSuccess}
            />

            {/* Edit Alumno Modal */}
            {selectedAlumno && (
                <EditAlumnoModal
                    isOpen={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedAlumno(null);
                    }}
                    onSuccess={handleEditSuccess}
                    alumno={selectedAlumno}
                />
            )}

            {/* Carga Masiva Modal */}
            <CargaMasivaModal
                isOpen={showCargaMasivaModal}
                onClose={() => setShowCargaMasivaModal(false)}
                onSuccess={cargarAlumnos}
            />
        </div>
    );
}