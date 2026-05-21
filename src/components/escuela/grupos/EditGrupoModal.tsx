'use client';

// ============================================================
// COMPONENT — EditGrupoModal
// src/components/director/grupos/EditGrupoModal.tsx
// ============================================================

import React, { useState, useEffect } from 'react';
import { GrupoService } from '../../../service/escuela/grupos/grupo.service';
import { alumnoService } from '../../../service/escuela/alumnos/alumno.service';
import type { GrupoListItem, UpdateGrupoDTO, MaestroListItem } from '../../../types/escuela/grupos/grupo';
import type { AlumnoEscuela } from '../../../types/escuela/alumnos/alumno.types';

interface EditGrupoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    grupo: GrupoListItem;
}

export const EditGrupoModal: React.FC<EditGrupoModalProps> = ({ isOpen, onClose, onSuccess, grupo }) => {
    const [formData, setFormData] = useState<UpdateGrupoDTO>({
        grado: grupo.grado,
        nombre: grupo.nombre,
        activo: grupo.activo,
    });
    const [maestros, setMaestros] = useState<MaestroListItem[]>([]);
    const [loadingMaestros, setLoadingMaestros] = useState(false);
    // ID del maestro actualmente seleccionado en el modal
    const [maestroSeleccionado, setMaestroSeleccionado] = useState<number | null>(
        grupo.maestros?.[0]?.id ?? null
    );
    // ID del maestro que tenía el grupo ANTES de abrir el modal (para saber si cambió)
    const [maestroOriginal, setMaestroOriginal] = useState<number | null>(
        grupo.maestros?.[0]?.id ?? null
    );
    const [errors, setErrors] = useState<Partial<Record<keyof UpdateGrupoDTO, string>>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        const maestroActual = grupo.maestros?.[0]?.id ?? null;
        setFormData({ grado: grupo.grado, nombre: grupo.nombre, activo: grupo.activo });
        setMaestroSeleccionado(maestroActual);
        setMaestroOriginal(maestroActual);
        setErrors({});
        setApiError('');

        const fetchMaestros = async () => {
            setLoadingMaestros(true);
            try {
                const data = await GrupoService.getMaestros();
                setMaestros(data);
            } catch {
                // No bloquear el modal
            } finally {
                setLoadingMaestros(false);
            }
        };
        fetchMaestros();
    }, [isOpen, grupo]);

    // Bloqueo de scroll global cuando el modal está abierto
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'grado' ? (value === '' ? '' : parseInt(value, 10)) : value,
        }));
        if (errors[name as keyof UpdateGrupoDTO]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof UpdateGrupoDTO, string>> = {};
        if (formData.grado !== undefined && (isNaN(formData.grado) || formData.grado < 1))
            newErrors.grado = 'El grado debe ser un número entero ≥ 1';
        if (formData.nombre !== undefined && !formData.nombre.trim())
            newErrors.nombre = 'El nombre no puede estar vacío';
        else if (formData.nombre && formData.nombre.length > 20)
            newErrors.nombre = 'Máximo 20 caracteres';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        try {
            setIsLoading(true);
            setApiError('');
            
            // 1. Verificar si el grado o nombre cambiaron (requiere resincronizar alumnos)
            const requiereSincronizacion = 
                formData.grado !== grupo.grado || 
                formData.nombre?.trim().toUpperCase() !== grupo.nombre?.trim().toUpperCase();

            // 2. Actualizar datos del grupo y maestro
            await GrupoService.update(grupo.id, {
                grado: parseInt(String(formData.grado), 10),
                nombre: formData.nombre?.trim().toUpperCase(),
                activo: formData.activo,
                maestroIds: maestroSeleccionado !== null ? [Number(maestroSeleccionado)] : [],
            });
            console.log('✅ Grupo actualizado:', grupo.id);

            // 3. Resincronizar alumnos si es necesario
            if (requiereSincronizacion) {
                console.log('🔄 Sincronizando alumnos (reactualizando su grupo)...');
                try {
                    const alumnosList = await alumnoService.obtenerAlumnos();
                    // Alumnos del grupo original (match por los nombres de grado/grupo pre-edición)
                    const alumnosDelGrupo = alumnosList.data.filter(
                        a => a.grado === grupo.grado && 
                             a.grupo?.trim().toLowerCase() === grupo.nombre?.trim().toLowerCase()
                    );
                    
                    if (alumnosDelGrupo.length > 0) {
                        await Promise.all(
                            alumnosDelGrupo.map(a => alumnoService.asignarGrupo(a.id, grupo.id))
                        );
                        console.log(`✅ Sincronizados ${alumnosDelGrupo.length} alumnos`);
                    }
                } catch (syncErr) {
                    console.error('⚠️ Advertencia: No todos los alumnos pudieron ser resincronizados.', syncErr);
                }
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            const status = err.response?.status;
            const raw = err.response?.data?.message;
            const msg = Array.isArray(raw) ? raw[0] : raw;
            if (status === 409) setApiError('Ya existe un grupo con ese grado y nombre.');
            else if (status === 404) setApiError('El grupo no fue encontrado.');
            else if (status === 400) setApiError(msg || 'Datos inválidos. Revisa los campos.');
            else setApiError(msg || 'Error al actualizar el grupo. Intenta de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#c8d8f0] sticky top-0 bg-white z-10 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="font-playfair text-xl font-bold text-[#0a1628]">Editar Grupo</h2>
                            <p className="text-xs text-[#1e3a6e]">{grupo.grado}° {grupo.nombre}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[#f5f8ff] rounded-lg text-[#6b8cba] hover:text-[#0a1628] transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {apiError && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg flex items-center gap-2">
                            <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm text-red-800">{apiError}</p>
                        </div>
                    )}

                    {/* Grado */}
                    <div>
                        <label className="block text-sm font-bold text-[#0a1628] mb-2">Grado</label>
                        <input
                            type="number"
                            name="grado"
                            min={1}
                            value={isNaN(Number(formData.grado)) ? '' : formData.grado}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-xl border-2 bg-white font-lora text-sm transition-all duration-300 focus:outline-none ${
                                errors.grado
                                    ? 'border-red-500 focus:ring-4 focus:ring-red-500/10'
                                    : 'border-[#c8d8f0] focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/10'
                            }`}
                        />
                        {errors.grado && <p className="mt-1.5 text-xs text-red-600">{errors.grado}</p>}
                    </div>

                    {/* Nombre */}
                    <div>
                        <label className="block text-sm font-bold text-[#0a1628] mb-2">Nombre del Grupo</label>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            maxLength={20}
                            className={`w-full px-4 py-3 rounded-xl border-2 bg-white font-lora text-sm transition-all duration-300 focus:outline-none ${
                                errors.nombre
                                    ? 'border-red-500 focus:ring-4 focus:ring-red-500/10'
                                    : 'border-[#c8d8f0] focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/10'
                            }`}
                        />
                        {errors.nombre && <p className="mt-1.5 text-xs text-red-600">{errors.nombre}</p>}
                    </div>

                    {/* Estado activo/inactivo */}
                    <div>
                        <label className="block text-sm font-bold text-[#0a1628] mb-3">Estado del Grupo</label>
                        <div className="flex gap-3">
                            {[
                                { value: true, label: 'Activo', color: 'border-emerald-500 bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
                                { value: false, label: 'Inactivo', color: 'border-gray-400 bg-gray-50 text-gray-600', dot: 'bg-gray-400' },
                            ].map(({ value, label, color, dot }) => (
                                <button
                                    key={label}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, activo: value }))}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all duration-200 ${
                                        formData.activo === value
                                            ? color
                                            : 'border-[#c8d8f0] bg-white text-[#1e3a6e] hover:bg-[#f5f8ff]'
                                    }`}
                                >
                                    <span className={`w-2.5 h-2.5 rounded-full ${formData.activo === value ? dot : 'bg-[#6b8cba]'}`} />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Selector de Maestro */}
                    <div>
                        <label className="block text-sm font-bold text-[#0a1628] mb-2">
                            Profesor Asignado
                        </label>
                        {loadingMaestros ? (
                            <div className="w-full px-4 py-3 rounded-xl border-2 border-[#c8d8f0] bg-[#f5f8ff] flex items-center gap-2 text-sm text-[#1e3a6e]">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#d4af37]" />
                                Cargando profesores...
                            </div>
                        ) : maestros.length === 0 ? (
                            <div className="w-full px-4 py-3 rounded-xl border-2 border-[#c8d8f0] bg-[#f5f8ff] text-sm text-[#6b8cba] italic">
                                No hay profesores registrados
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                {/* Sin profesor */}
                                <button
                                    type="button"
                                    onClick={() => setMaestroSeleccionado(null)}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 text-sm transition-all duration-200 ${
                                        maestroSeleccionado === null
                                            ? 'border-[#d4af37] bg-[#d4af37]/10 text-[#0a1628]'
                                            : 'border-[#c8d8f0] bg-white text-[#1e3a6e] hover:bg-[#f5f8ff]'
                                    }`}
                                >
                                    <div className="w-8 h-8 rounded-full bg-[#c8d8f0] flex items-center justify-center flex-shrink-0">
                                        <svg className="w-4 h-4 text-[#6b8cba]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                        </svg>
                                    </div>
                                    <span className="font-medium italic">Sin profesor asignado</span>
                                    {maestroSeleccionado === null && (
                                        <svg className="w-4 h-4 text-[#d4af37] ml-auto flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </button>

                                {maestros.map(maestro => (
                                    <button
                                        key={maestro.id}
                                        type="button"
                                        onClick={() => setMaestroSeleccionado(maestro.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 text-sm transition-all duration-200 ${
                                            maestroSeleccionado === maestro.id
                                                ? 'border-[#d4af37] bg-[#d4af37]/10 text-[#0a1628]'
                                                : 'border-[#c8d8f0] bg-white text-[#1e3a6e] hover:bg-[#f5f8ff]'
                                        }`}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                            {(maestro.nombre ?? maestro.correo ?? "?").charAt(0).toUpperCase()}
                                        </div>
                                        <div className="text-left min-w-0">
                                            <p className="font-bold truncate">{maestro.nombre ?? "Sin nombre"}</p>
                                            <p className="text-xs text-[#1e3a6e] truncate">{maestro.correo}</p>
                                        </div>
                                        {maestroSeleccionado === maestro.id && (
                                            <svg className="w-4 h-4 text-[#d4af37] ml-auto flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 rounded-xl border-2 border-[#c8d8f0] text-[#1e3a6e] font-bold hover:bg-[#f5f8ff] transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#0a1628] to-[#1e3a6e] text-[#f5f8ff] font-bold hover:from-[#1e3a6e] hover:to-[#1a2d5a] shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#f5f8ff]" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Guardar Cambios
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};