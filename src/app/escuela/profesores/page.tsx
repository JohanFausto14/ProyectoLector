'use client';

import { useState, useEffect } from 'react';
import ProfesorStats from '@/components/escuela/profesores/ProfesorStats';
import ProfesorSearch from '@/components/escuela/profesores/ProfesorSearch';
import ProfesorCard from '@/components/escuela/profesores/ProfesorCard';
import EmptyState from '@/components/escuela/profesores/EmptyState';
import NuevoProfesorModal from '@/components/escuela/profesores/NuevoProfesorModal';
import EditarProfesorModal from '@/components/escuela/profesores/EditProfesorModal';
import { profesorService } from '../../../service/escuela/profesor/profesor.service';
import {
    ProfesorEscuela,
    getNombreCompletoProfesor,
    getEstadoProfesor,
} from '../../../types/escuela/profesor/profesor.types';
import { toast } from '@/utils/toast';

interface ProfesorCardShape {
    id: number;
    nombre: string;
    email: string;
    especialidad: string;
    cantidadGrupos: number;
    cantidadAlumnos: number;
    grupos: { id: number; grado: number; nombre: string; cantidadAlumnos: number }[];
    estado: 'activo' | 'inactivo';
    telefono: string;
    fechaIngreso?: string | null;
}

const adaptarProfesor = (p: ProfesorEscuela): ProfesorCardShape => ({
    id: p.id,
    nombre: getNombreCompletoProfesor(p),
    email: p.persona.correo,
    especialidad: p.especialidad ?? 'Sin especificar',
    cantidadGrupos: p.cantidadGrupos ?? 0,
    cantidadAlumnos: p.cantidadAlumnos ?? 0,
    grupos: p.grupos ?? [],
    estado: getEstadoProfesor(p),
    telefono: p.persona.telefono ?? '',
    fechaIngreso: p.fechaIngreso ?? null,
});


export default function ProfesoresPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [profesores, setProfesores] = useState<ProfesorEscuela[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedProfesor, setSelectedProfesor] = useState<ProfesorEscuela | null>(null);
    const [profesorToDelete, setProfesorToDelete] = useState<ProfesorEscuela | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    const cargarProfesores = async () => {
        try {
            setIsLoading(true);
            setError('');
            const response = await profesorService.obtenerProfesores();
            console.log(`✅ Profesores cargados:`, response);
            setProfesores(response.data);
        } catch (error: any) {
            console.error('Error al cargar profesores:', error);
            setError(error.message || 'Error al cargar profesores.');
            toast.error('Error al cargar la lista de profesores');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        cargarProfesores();
    }, []);

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

    const handleAddSuccess = () => {
        cargarProfesores();
    };

    const handleEditRequest = (id: number) => {
        const profesor = profesores.find(p => p.id === id);
        if (profesor) {
            setSelectedProfesor(profesor);
            setShowEditModal(true);
        }
    };

    const handleEditSuccess = () => {
        cargarProfesores();
        setShowEditModal(false);
        setSelectedProfesor(null);
    };

    const handleDeleteRequest = (id: number) => {
        const profesor = profesores.find(p => p.id === id);
        if (profesor) {
            setProfesorToDelete(profesor);
            setDeleteError('');
            setShowDeleteModal(true);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!profesorToDelete) return;
        try {
            setIsDeleting(true);
            setDeleteError('');
            await profesorService.eliminarProfesor(profesorToDelete.id);
            toast.success(`Profesor ${getNombreCompletoProfesor(profesorToDelete)} eliminado exitosamente`);
            setShowDeleteModal(false);
            setProfesorToDelete(null);
            cargarProfesores();
        } catch (error: any) {
            console.error('❌ Error al eliminar profesor:', error);
            setDeleteError(error.message || 'Error al eliminar el profesor.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setProfesorToDelete(null);
        setDeleteError('');
    };

    const profesoresAdaptados = profesores.map(adaptarProfesor);

    const filteredProfesores = profesoresAdaptados.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.especialidad.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalActivos          = profesoresAdaptados.filter(p => p.estado === 'activo').length;
    const totalAlumnosAtendidos = profesoresAdaptados.reduce((acc, p) => acc + p.cantidadAlumnos, 0);
    const totalGrupos           = profesoresAdaptados.reduce((acc, p) => acc + p.cantidadGrupos, 0);

    return (
        <div className="space-y-6 animate-fade-in">

            <ProfesorStats
                totalProfesores={isLoading ? 0 : profesores.length}
                totalActivos={isLoading ? 0 : totalActivos}
                totalAlumnosAtendidos={isLoading ? 0 : totalAlumnosAtendidos}
                totalGrupos={isLoading ? 0 : totalGrupos}
            />

            <ProfesorSearch
                value={searchTerm}
                onChange={setSearchTerm}
                onNew={() => setShowAddModal(true)}
                totalFiltered={filteredProfesores.length}
            />

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-center gap-3">
                    <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-800 text-sm flex-1">{error}</p>
                    <button
                        onClick={cargarProfesores}
                        className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors font-bold"
                    >
                        Reintentar
                    </button>
                </div>
            )}

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#d4af37]" />
                </div>
            ) : filteredProfesores.length === 0 ? (
                <EmptyState message={
                    searchTerm
                        ? 'No se encontraron profesores con ese criterio'
                        : 'Aún no hay profesores registrados'
                } />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProfesores.map(profesor => (
                        <ProfesorCard
                            key={profesor.id}
                            profesor={profesor}
                            onEdit={handleEditRequest}
                            onDelete={handleDeleteRequest}
                        />
                    ))}
                </div>
            )}

            {/* Modal eliminación */}
            {showDeleteModal && profesorToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
                        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-100">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="font-playfair text-xl font-bold text-[#0a1628] text-center mb-2">Eliminar Profesor</h3>
                        <p className="text-[#1e3a6e] text-center text-sm mb-1">¿Estás seguro de que deseas eliminar a:</p>
                        <p className="text-[#0a1628] font-bold text-center mb-1">{getNombreCompletoProfesor(profesorToDelete)}</p>
                        <p className="text-[#1e3a6e] text-center text-xs mb-2">{profesorToDelete.persona.correo}</p>
                        <p className="text-red-600 text-center text-xs mb-6">
                            Esta acción eliminará también sus asignaciones con alumnos. No se puede deshacer.
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
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Eliminar
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <NuevoProfesorModal
                open={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={handleAddSuccess}
            />

            {/* ✅ key={selectedProfesor.id} — recrea el modal limpio al cambiar de profesor */}
            {selectedProfesor && (
                <EditarProfesorModal
                    key={selectedProfesor.id}
                    open={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedProfesor(null);
                    }}
                    onSuccess={handleEditSuccess}
                    profesor={selectedProfesor}
                />
            )}
        </div>
    );
}