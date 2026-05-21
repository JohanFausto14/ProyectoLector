'use client';

import React, { useState, useEffect } from 'react';
import { AlumnoEditFormData, AlumnoEditFormErrors } from '../../../types/escuela/alumnos/alumno.types';
import { sanitizeText, sanitizeEmail, isValidEmail, focusFirstError } from '../../../utils/formValidation';
import { GrupoService } from '../../../service/escuela/grupos/grupo.service';
import { GrupoListItem } from '../../../types/escuela/grupos/grupo';
import { toast } from '../../../utils/toast';

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

interface AlumnoFormEditProps {
    initialData?: AlumnoEditFormData;
    onSubmit: (data: AlumnoEditFormData) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export const AlumnoFormEdit: React.FC<AlumnoFormEditProps> = ({
    initialData,
    onSubmit,
    onCancel,
    isLoading = false
}) => {
    // ✅ Sin useEffect — los useState se inicializan una sola vez con initialData
    const [formData, setFormData] = useState<AlumnoEditFormData>(
        initialData || {
            nombre: '',
            apellidoPaterno: '',
            apellidoMaterno: '',
            correo: '',
            telefono: '',
            fechaNacimiento: '',
            genero: '',
            password: '',
            grado: undefined,
            grupo: '',
            grupoId: null,
            cicloEscolar: ''
        }
    );

    // ── Grupos ─────────────────────────────────────────────────────────────
    const [grupos, setGrupos] = useState<GrupoListItem[]>([]);
    const [loadingGrupos, setLoadingGrupos] = useState(false);
    const [filtroGrado, setFiltroGrado] = useState<number | null>(null);

    useEffect(() => {
        const fetchGrupos = async () => {
            setLoadingGrupos(true);
            try {
                const data = await GrupoService.getAll();
                setGrupos(data.filter(g => g.activo));
            } catch (error) {
                toast.error('No se pudieron cargar los grupos');
            } finally {
                setLoadingGrupos(false);
            }
        };
        fetchGrupos();
    }, []);

    const gradosExistentes = Array.from(new Set(grupos.map(g => g.grado))).sort((a, b) => a - b);
    const gruposFiltrados = filtroGrado ? grupos.filter(g => g.grado === filtroGrado) : grupos;

    const handleSelectGrupo = (grupo: GrupoListItem) => {
        const isSelected = formData.grupoId === grupo.id;
        if (isSelected) {
            // Deseleccionar (opcional, según requerimiento)
            setFormData(prev => ({ ...prev, grupoId: null, grado: undefined, grupo: '' }));
        } else {
            setFormData(prev => ({ 
                ...prev, 
                grupoId: grupo.id, 
                grado: grupo.grado, 
                grupo: grupo.nombre 
            }));
        }
    };

    const [errors, setErrors] = useState<AlumnoEditFormErrors>({});
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const finalValue = name === 'grado' ? (value ? parseInt(value) : undefined) : value;

        setFormData((prev: AlumnoEditFormData) => ({ ...prev, [name]: finalValue }));

        if (errors[name as keyof AlumnoEditFormErrors]) {
            setErrors((prev: AlumnoEditFormErrors) => ({ ...prev, [name]: undefined }));
        }
    };

    const validate = (): boolean => {
        const newErrors: AlumnoEditFormErrors = {};

        const sNombre = sanitizeText(formData.nombre);
        const sPaterno = sanitizeText(formData.apellidoPaterno);
        const sCorreo = sanitizeEmail(formData.correo);

        if (!sNombre)
            newErrors.nombre = 'El nombre es requerido';

        if (!sPaterno)
            newErrors.apellidoPaterno = 'El apellido paterno es requerido';

        if (!sCorreo) {
            newErrors.correo = 'El correo es requerido';
        } else if (!isValidEmail(sCorreo)) {
            newErrors.correo = 'Correo inválido';
        }

        if (formData.password && formData.password.length > 0 && formData.password.length < 6)
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';

        if (formData.telefono?.trim()) {
            const phoneRegex = /^[0-9+\s()-]{10,}$/;
            if (!phoneRegex.test(formData.telefono))
                newErrors.telefono = 'Formato de teléfono inválido';
        }

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            focusFirstError(newErrors as Record<string, string | undefined>);
        }
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSubmit({
                ...formData,
                nombre: sanitizeText(formData.nombre),
                apellidoPaterno: sanitizeText(formData.apellidoPaterno),
                apellidoMaterno: formData.apellidoMaterno ? sanitizeText(formData.apellidoMaterno) : '',
                correo: sanitizeEmail(formData.correo),
                telefono: formData.telefono ? sanitizeText(formData.telefono) : '',
            });
        }
    };

    const inputClass = (field: keyof AlumnoEditFormErrors) =>
        `w-full px-4 py-3 rounded-xl border-2 bg-white font-lora text-sm transition-all duration-300 focus:outline-none ${errors[field]
            ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
            : 'border-[#c8d8f0] focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/10'
        }`;

    const labelClass = 'block text-sm font-bold text-[#0a1628] mb-2';

    return (
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>

            {/* Información Personal */}
            <div>
                <h3 className="text-lg font-playfair font-bold text-[#0a1628] mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-[#d4af37] to-[#c19a2e] rounded-full"></div>
                    Información Personal
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Nombre */}
                    <div>
                        <label className={labelClass}>
                            Nombre(s) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            placeholder="Ej: Carlos"
                            disabled={isLoading}
                            className={inputClass('nombre')}
                        />
                        {errors.nombre && <p className="mt-1 text-xs text-red-600">{errors.nombre}</p>}
                    </div>

                    {/* Apellido Paterno */}
                    <div>
                        <label className={labelClass}>
                            Apellido Paterno <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="apellidoPaterno"
                            value={formData.apellidoPaterno}
                            onChange={handleChange}
                            placeholder="Ej: González"
                            disabled={isLoading}
                            className={inputClass('apellidoPaterno')}
                        />
                        {errors.apellidoPaterno && <p className="mt-1 text-xs text-red-600">{errors.apellidoPaterno}</p>}
                    </div>

                    {/* Apellido Materno */}
                    <div>
                        <label className={labelClass}>
                            Apellido Materno
                            <span className="ml-2 font-normal text-[#6b8cba] text-xs">(opcional)</span>
                        </label>
                        <input
                            type="text"
                            name="apellidoMaterno"
                            value={formData.apellidoMaterno || ''}
                            onChange={handleChange}
                            placeholder="Ej: López"
                            disabled={isLoading}
                            className={inputClass('apellidoMaterno')}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {/* Correo */}
                    <div>
                        <label className={labelClass}>
                            Correo Electrónico <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            name="correo"
                            value={formData.correo}
                            onChange={handleChange}
                            placeholder="Ej: carlos@escuela.edu"
                            disabled={isLoading}
                            className={inputClass('correo')}
                        />
                        {errors.correo && <p className="mt-1 text-xs text-red-600">{errors.correo}</p>}
                    </div>

                    {/* Teléfono */}
                    <div>
                        <label className={labelClass}>
                            Teléfono
                            <span className="ml-2 font-normal text-[#6b8cba] text-xs">(opcional)</span>
                        </label>
                        <input
                            type="tel"
                            name="telefono"
                            value={formData.telefono || ''}
                            onChange={handleChange}
                            placeholder="Ej: +52 55 1234 5678"
                            disabled={isLoading}
                            className={inputClass('telefono')}
                        />
                        {errors.telefono && <p className="mt-1 text-xs text-red-600">{errors.telefono}</p>}
                    </div>

                    {/* Fecha de Nacimiento */}
                    <div>
                        <label className={labelClass}>
                            Fecha de Nacimiento
                            <span className="ml-2 font-normal text-[#6b8cba] text-xs">(opcional)</span>
                        </label>
                        <input
                            type="date"
                            name="fechaNacimiento"
                            value={formData.fechaNacimiento || ''}
                            onChange={handleChange}
                            disabled={isLoading}
                            className={inputClass('fechaNacimiento')}
                        />
                    </div>

                    {/* Género */}
                    <div>
                        <label className={labelClass}>
                            Género
                            <span className="ml-2 font-normal text-[#6b8cba] text-xs">(opcional)</span>
                        </label>
                        <select
                            name="genero"
                            value={formData.genero || ''}
                            onChange={handleChange}
                            disabled={isLoading}
                            className={inputClass('genero')}
                        >
                            <option value="">Sin especificar</option>
                            <option value="masculino">Masculino</option>
                            <option value="femenino">Femenino</option>
                            <option value="otro">Otro</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Información Académica */}
            <div>
                <h3 className="text-lg font-playfair font-bold text-[#0a1628] mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-[#d4af37] to-[#c19a2e] rounded-full"></div>
                    Información Académica
                </h3>

                <div className="bg-[#f5f8ff] rounded-2xl p-6 border-2 border-[#c8d8f0]/50 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <label className="text-sm font-bold text-[#0a1628] flex items-center gap-2">
                            <svg className="w-5 h-5 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Asignación de Grupo
                            <span className="font-normal text-[#6b8cba] text-xs">(Selecciona para cambiar)</span>
                        </label>
                        {formData.grupoId && (
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, grupoId: null, grado: undefined, grupo: '' }))}
                                className="text-xs text-red-500 hover:text-red-700 transition-colors flex items-center gap-1 font-bold"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Quitar de grupo
                            </button>
                        )}
                    </div>

                    {loadingGrupos ? (
                        <div className="flex items-center gap-3 py-8 justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#d4af37]" />
                            <span className="text-sm text-[#1e3a6e] font-medium">Cargando grupos...</span>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Filtros de Grado */}
                            {gradosExistentes.length > 1 && (
                                <div className="flex flex-wrap gap-2 pb-2">
                                    <button
                                        type="button"
                                        onClick={() => setFiltroGrado(null)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            filtroGrado === null
                                                ? 'bg-[#0a1628] text-[#f5f8ff]'
                                                : 'bg-white text-[#1e3a6e] border-2 border-[#c8d8f0] hover:border-[#d4af37]'
                                        }`}
                                    >
                                        Todos
                                    </button>
                                    {gradosExistentes.map(g => {
                                        const c = gradoColors[g] ?? defaultColor;
                                        return (
                                            <button
                                                key={g}
                                                type="button"
                                                onClick={() => setFiltroGrado(g)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-2 ${
                                                    filtroGrado === g
                                                        ? `${c.bg} ${c.text} ${c.border}`
                                                        : 'bg-white text-[#1e3a6e] border-[#c8d8f0] hover:border-[#d4af37]'
                                                }`}
                                            >
                                                {g}° Grado
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Grid de Grupos */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                                {gruposFiltrados.map(grupo => {
                                    const c = gradoColors[grupo.grado] ?? defaultColor;
                                    const isSelected = formData.grupoId === grupo.id;
                                    const maestro = grupo.maestros?.[0];

                                    return (
                                        <button
                                            key={grupo.id}
                                            type="button"
                                            onClick={() => handleSelectGrupo(grupo)}
                                            className={`relative flex flex-col items-start gap-1 p-3 rounded-2xl border-2 text-left transition-all duration-300 ${
                                                isSelected
                                                    ? `${c.bg} ${c.border} shadow-md scale-[1.02]`
                                                    : 'border-[#c8d8f0] bg-white hover:border-[#d4af37]/50 hover:bg-[#f5f8ff]/50'
                                            }`}
                                        >
                                            {isSelected && (
                                                <div className={`absolute top-2 right-2 w-5 h-5 rounded-full ${c.dot} flex items-center justify-center shadow-sm`}>
                                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${c.bg} ${c.text} border ${c.border.replace('border-', 'border-')}`}>
                                                    {grupo.grado}
                                                </span>
                                                <span className={`font-black text-lg ${isSelected ? c.text : 'text-[#0a1628]'}`}>
                                                    {grupo.nombre}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-[#6b8cba] truncate w-full font-medium italic">
                                                {maestro ? `👤 ${maestro.nombre?.split(' ')[0]}` : 'Sin maestro'}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Info de Selección Actual */}
                            <div className="pt-2">
                                {formData.grupoId ? (
                                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 ${(gradoColors[formData.grado as number] ?? defaultColor).bg} ${(gradoColors[formData.grado as number] ?? defaultColor).border}`}>
                                        <div className={`w-2 h-2 rounded-full animate-pulse ${(gradoColors[formData.grado as number] ?? defaultColor).dot}`} />
                                        <span className={`text-sm font-bold ${(gradoColors[formData.grado as number] ?? defaultColor).text}`}>
                                            El alumno se moverá al grupo: <span className="underline decoration-wavy underline-offset-4">{formData.grado}°{formData.grupo}</span>
                                        </span>
                                    </div>
                                ) : (
                                    <div className="px-4 py-3 rounded-xl border-2 border-dashed border-[#c8d8f0] bg-[#f5f8ff]/50 text-center">
                                        <span className="text-sm text-[#6b8cba] italic font-medium">
                                            Sin grupo asignado (el alumno se quitará del grupo actual si lo tiene)
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <div>
                        <label className={labelClass}>Ciclo Escolar</label>
                        <input
                            type="text"
                            name="cicloEscolar"
                            value={formData.cicloEscolar || ''}
                            onChange={handleChange}
                            placeholder="Ej: 2024-2025"
                            disabled={isLoading}
                            className="w-full px-4 py-3 rounded-xl border-2 border-[#c8d8f0] bg-white font-lora text-sm transition-all duration-300 focus:outline-none focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/10"
                        />
                    </div>
                </div>
            </div>

            {/* Seguridad */}
            <div>
                <h3 className="text-lg font-playfair font-bold text-[#0a1628] mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-[#d4af37] to-[#c19a2e] rounded-full"></div>
                    Seguridad
                </h3>

                <div className="bg-[#f5f8ff] rounded-xl p-4 mb-4">
                    <p className="text-sm text-[#1e3a6e] flex items-center gap-2">
                        <svg className="w-4 h-4 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Deja este campo en blanco si no deseas cambiar la contraseña
                    </p>
                </div>

                <div className="relative">
                    <label className={labelClass}>
                        Nueva Contraseña
                        <span className="ml-2 font-normal text-[#6b8cba] text-xs">(opcional)</span>
                    </label>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password || ''}
                        onChange={handleChange}
                        placeholder="Mínimo 6 caracteres"
                        disabled={isLoading}
                        className={inputClass('password')}
                        autoComplete="new-password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-[42px] text-[#6b8cba] hover:text-[#0a1628] transition-colors"
                    >
                        {showPassword ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        )}
                    </button>
                    {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-6 border-t border-[#c8d8f0]">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="px-6 py-3 rounded-xl border-2 border-[#c8d8f0] text-[#1e3a6e] font-bold hover:bg-[#f5f8ff] transition-colors disabled:opacity-50"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#0a1628] to-[#1e3a6e] text-[#f5f8ff] font-bold hover:from-[#1e3a6e] hover:to-[#1a2d5a] shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Guardando...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Guardar Cambios
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};