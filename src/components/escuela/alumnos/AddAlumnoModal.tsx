'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '../../ui/Modal';
import { AlumnoForm } from './AlumnoForm';
import { alumnoService } from '../../../service/escuela/alumnos/alumno.service';
import { GrupoService } from '../../../service/escuela/grupos/grupo.service';
import { toast } from '../../../utils/toast';
import { AlumnoFormData, RegistroAlumnoPayload } from '../../../types/escuela/alumnos/alumno.types';
import type { GrupoListItem } from '../../../types/escuela/grupos/grupo';
interface AddAlumnoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

// Colores por grado
const gradoColors: Record<number, { bg: string; text: string; border: string; dot: string }> = {
    1: { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-300',   dot: 'bg-blue-500' },
    2: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300', dot: 'bg-emerald-500' },
    3: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-300', dot: 'bg-violet-500' },
    4: { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-300',  dot: 'bg-amber-500' },
    5: { bg: 'bg-rose-50',   text: 'text-rose-700',   border: 'border-rose-300',   dot: 'bg-rose-500' },
    6: { bg: 'bg-cyan-50',   text: 'text-cyan-700',   border: 'border-cyan-300',   dot: 'bg-cyan-500' },
};
const defaultColor = { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-300', dot: 'bg-gray-400' };

export const AddAlumnoModal: React.FC<AddAlumnoModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);

    // ── Grupos ─────────────────────────────────────────────────────────────
    const [grupos, setGrupos] = useState<GrupoListItem[]>([]);
    const [loadingGrupos, setLoadingGrupos] = useState(false);
    const [grupoSeleccionado, setGrupoSeleccionado] = useState<GrupoListItem | null>(null);
    const [filtroGrado, setFiltroGrado] = useState<number | null>(null);

    useEffect(() => {
        if (!isOpen) return;
        setGrupoSeleccionado(null);
        setFiltroGrado(null);

        const fetchGrupos = async () => {
            setLoadingGrupos(true);
            try {
                const data = await GrupoService.getAll();
                setGrupos(data.filter(g => g.activo));
            } catch {
                toast.error('No se pudieron cargar los grupos');
            } finally {
                setLoadingGrupos(false);
            }
        };
        fetchGrupos();
    }, [isOpen]);

    const grados = Array.from(new Set(grupos.map(g => g.grado))).sort((a, b) => a - b);
    const gruposFiltrados = filtroGrado ? grupos.filter(g => g.grado === filtroGrado) : grupos;

    // ── Submit ─────────────────────────────────────────────────────────────
    const handleSubmit = async (data: AlumnoFormData) => {
        setIsLoading(true);
        try {
            const payload: RegistroAlumnoPayload = {
                nombre:          data.nombre.trim(),
                apellidoPaterno: data.apellidoPaterno.trim(),
                apellidoMaterno: data.apellidoMaterno.trim(),
                email:           data.email.trim().toLowerCase(),
                password:        data.password,
            };

            if (data.telefono?.trim())        payload.telefono        = data.telefono.trim();
            if (data.fechaNacimiento)         payload.fechaNacimiento = data.fechaNacimiento;
            if (data.cicloEscolar?.trim())    payload.cicloEscolar    = data.cicloEscolar.trim();

            // Asignar grupo por grupoId (opción B del README) — forzar entero
            if (grupoSeleccionado) {
                payload.grupoId = parseInt(String(grupoSeleccionado.id), 10);
            }

            console.log('📤 Enviando datos al backend:', payload);
            const response = await alumnoService.registrarAlumno(payload);
            console.log('✅ Respuesta del backend:', response);

            const nombre = `${response.data.nombre} ${response.data.apellidoPaterno}`;
            const grupoInfo = grupoSeleccionado ? ` al grupo ${grupoSeleccionado.grado}°${grupoSeleccionado.nombre}` : '';
            toast.success(`¡${nombre} registrado${grupoInfo} exitosamente!`, 5000);

            onClose();
            onSuccess();
        } catch (error: unknown) {
            console.error('❌ Error al crear alumno:', error);
            const err = error as { response?: { data?: { message?: string | string[], description?: string } }, message?: string };
            const errorMsg = err.response?.data?.message || err.response?.data?.description;
            let displayMessage = err.message || 'Error al registrar el alumno.';
            if (Array.isArray(errorMsg)) displayMessage = errorMsg.join(' | ');
            else if (typeof errorMsg === 'string') displayMessage = errorMsg;
            toast.error(displayMessage, 6000);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => { if (!isLoading) onClose(); };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Agregar Nuevo Alumno" size="lg">
            <div className="space-y-6">

                {/* ── Selector de Grupo ───────────────────────────────────── */}
                <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#1e3a6e] flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Grupo asignado
                            <span className="font-normal text-[#b0a090] normal-case tracking-normal">· opcional</span>
                        </span>
                        {grupoSeleccionado && (
                            <button
                                type="button"
                                onClick={() => setGrupoSeleccionado(null)}
                                className="text-xs text-[#b0a090] hover:text-red-400 transition-colors flex items-center gap-1"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Quitar
                            </button>
                        )}
                    </div>

                    {loadingGrupos ? (
                        <div className="flex items-center gap-2 py-3 text-sm text-[#1e3a6e]">
                            <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-[#d4af37]" />
                            Cargando grupos...
                        </div>
                    ) : grupos.length === 0 ? (
                        <p className="text-xs text-[#6b8cba] italic py-2">
                            No hay grupos activos. Crea uno desde la sección de Grupos.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {/* Filtro por grado — solo si hay más de uno */}
                            {grados.length > 1 && (
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                    <button
                                        type="button"
                                        onClick={() => setFiltroGrado(null)}
                                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                                            filtroGrado === null
                                                ? 'bg-[#0a1628] text-[#f5f8ff]'
                                                : 'bg-[#f5f0e8] text-[#1e3a6e] hover:bg-[#e8dfd0]'
                                        }`}
                                    >
                                        Todos
                                    </button>
                                    {grados.map(g => {
                                        const c = gradoColors[g] ?? defaultColor;
                                        const active = filtroGrado === g;
                                        return (
                                            <button
                                                key={g}
                                                type="button"
                                                onClick={() => setFiltroGrado(g)}
                                                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                                                    active
                                                        ? `${c.bg} ${c.text}`
                                                        : 'bg-[#f5f0e8] text-[#1e3a6e] hover:bg-[#e8dfd0]'
                                                }`}
                                            >
                                                {g}°
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Lista de grupos */}
                            <div className="rounded-xl border border-[#c8d8f0] overflow-hidden divide-y divide-[#ede8df] max-h-48 overflow-y-auto">
                                {gruposFiltrados.map(grupo => {
                                    const c = gradoColors[grupo.grado] ?? defaultColor;
                                    const isSelected = grupoSeleccionado?.id === grupo.id;
                                    const maestro = grupo.maestros?.[0];
                                    const maestroNombre = maestro
                                        ? (maestro.nombre?.split(' ').slice(0, 2).join(' ') ?? maestro.correo)
                                        : null;

                                    return (
                                        <button
                                            key={grupo.id}
                                            type="button"
                                            onClick={() => setGrupoSeleccionado(isSelected ? null : grupo)}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                                                isSelected
                                                    ? `${c.bg}`
                                                    : 'bg-white hover:bg-[#f5f8ff]'
                                            }`}
                                        >
                                            {/* Badge grado + nombre unidos */}
                                            <span className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-black border ${c.bg} ${c.text} ${c.border} whitespace-nowrap`}>
                                                {grupo.grado}° {grupo.nombre}
                                            </span>

                                            {/* Maestro */}
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-xs truncate ${isSelected ? c.text + ' opacity-80' : 'text-[#6b8cba]'}`}>
                                                    {maestroNombre
                                                        ? <>👤 {maestroNombre}</>
                                                        : <span className="italic">Sin maestro</span>
                                                    }
                                                </p>
                                            </div>

                                            {/* Indicador selección */}
                                            <div className={`shrink-0 w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                                                isSelected
                                                    ? 'bg-[#d4af37] border-[#d4af37]'
                                                    : 'border-[#d8cfc2] bg-white'
                                            }`}>
                                                {isSelected && (
                                                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Resumen selección */}
                            {grupoSeleccionado && (() => {
                                const sc = gradoColors[grupoSeleccionado.grado] ?? defaultColor;
                                const sm = grupoSeleccionado.maestros?.[0];
                                return (
                                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${sc.bg} border ${sc.border} text-xs`}>
                                        <svg className={`w-3.5 h-3.5 shrink-0 ${sc.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className={`font-semibold ${sc.text}`}>
                                            {grupoSeleccionado.grado}°{grupoSeleccionado.nombre}
                                        </span>
                                        {sm && (
                                            <span className={`${sc.text} opacity-70`}>
                                                · {sm.nombre?.split(' ').slice(0, 2).join(' ')}
                                            </span>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    )}
                </div>

                {/* Divisor */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[#c8d8f0]" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                        <span className="px-3 bg-white text-[#6b8cba] font-bold uppercase tracking-wider">
                            Datos del Alumno
                        </span>
                    </div>
                </div>

                {/* ── Formulario de datos ─────────────────────────────────── */}
                <AlumnoForm
                    onSubmit={handleSubmit}
                    onCancel={handleClose}
                    isLoading={isLoading}
                    hideGrupoFields  // oculta los selects de grado/grupo del form
                />
            </div>
        </Modal>
    );
};