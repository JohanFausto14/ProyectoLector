'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { profesorService } from '../../../service/escuela/profesor/profesor.service';
import {
    ProfesorEscuela,
    ProfesorEditFormData,
    ProfesorEditFormErrors,
    EditProfesorPayload,
    getNombreCompletoProfesor,
} from '../../../types/escuela/profesor/profesor.types';
import { toast } from '@/utils/toast';
import { sanitizeText, sanitizeEmail, isValidEmail, focusFirstError, hasUppercase } from '../../../utils/formValidation';

interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    profesor: ProfesorEscuela;
}

export default function EditarProfesorModal({ open, onClose, onSuccess, profesor }: Props) {
    // ✅ FIX: Sin useEffect — los useState se inicializan una sola vez con los datos
    // del profesor. El reset se controla desde afuera con key={profesor.id}
    const [formData, setFormData] = useState<ProfesorEditFormData>({
        nombre: profesor.persona.nombre ?? '',
        apellidoPaterno: profesor.persona.apellidoPaterno ?? '',
        apellidoMaterno: profesor.persona.apellidoMaterno ?? '',
        correo: profesor.persona.correo ?? '',
        telefono: profesor.persona.telefono ?? '',
        fechaNacimiento: profesor.persona.fechaNacimiento ?? '',
        genero: profesor.persona.genero ?? '',
        password: '',
        activo: profesor.persona.activo !== false,
    });

    const [errors, setErrors] = useState<ProfesorEditFormErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (field: keyof ProfesorEditFormData) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const value = field === 'activo'
                ? (e.target as HTMLSelectElement).value === 'true'
                : e.target.value;
            setFormData(prev => ({ ...prev, [field]: value }));
            if (errors[field as keyof ProfesorEditFormErrors]) {
                setErrors(prev => ({ ...prev, [field]: undefined }));
            }
        };

    const validate = (): boolean => {
        const newErrors: ProfesorEditFormErrors = {};

        const sNombre = sanitizeText(formData.nombre);
        const sPaterno = sanitizeText(formData.apellidoPaterno);
        const sEmail = sanitizeEmail(formData.correo);

        if (!sNombre) newErrors.nombre = 'El nombre es requerido';
        if (!sPaterno) newErrors.apellidoPaterno = 'El apellido paterno es requerido';

        if (!sEmail) {
            newErrors.correo = 'El correo es requerido';
        } else if (hasUppercase(formData.correo)) {
            newErrors.correo = 'Escribe tu correo usando solo minúsculas';
        } else if (!isValidEmail(sEmail)) {
            newErrors.correo = 'Correo inválido';
        }

        if (formData.password && formData.password.length > 0 && formData.password.length < 6)
            newErrors.password = 'Mínimo 6 caracteres';

        if (formData.telefono?.trim() && !/^[0-9+\s()-]{10,}$/.test(formData.telefono))
            newErrors.telefono = 'Formato de teléfono inválido';

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            focusFirstError(newErrors as Record<string, string | undefined>);
        }
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setIsLoading(true);

            const payload: EditProfesorPayload = {
                nombre: sanitizeText(formData.nombre),
                apellidoPaterno: sanitizeText(formData.apellidoPaterno),
                apellidoMaterno: formData.apellidoMaterno ? sanitizeText(formData.apellidoMaterno) : null,
                correo: sanitizeEmail(formData.correo),
                activo: formData.activo,
            };

            if (formData.telefono?.trim()) payload.telefono = sanitizeText(formData.telefono);
            if (formData.fechaNacimiento?.trim()) payload.fechaNacimiento = formData.fechaNacimiento.trim();
            if (formData.genero?.trim()) payload.genero = formData.genero.trim();
            if (formData.password?.trim().length) payload.password = formData.password.trim();

            const response = await profesorService.editarProfesor(profesor.id, payload);

            toast.success(
                `¡Profesor ${response.data.nombre} ${response.data.apellidoPaterno} actualizado exitosamente!`,
                5000
            );

            onClose();
            onSuccess();
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.response?.data?.description;
            let displayMessage = error.message || 'Error al actualizar el profesor.';

            if (Array.isArray(errorMsg)) {
                displayMessage = `Faltan datos o son incorrectos: ${errorMsg.join(' | ')}`;
            } else if (typeof errorMsg === 'string') {
                displayMessage = errorMsg;
            }

            toast.error(displayMessage, 6000);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (isLoading) return;
        setErrors({});
        setShowPassword(false);
        onClose();
    };

    const inputClass = (field: keyof ProfesorEditFormErrors) =>
        `w-full px-4 py-3 rounded-xl border-2 bg-white font-lora text-sm transition-all duration-300 focus:outline-none ${errors[field]
            ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
            : 'border-[#c8d8f0] focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/10'
        }`;

    const labelClass = 'block text-sm font-bold text-[#0a1628] mb-2';

    const ErrorMsg = ({ field }: { field: keyof ProfesorEditFormErrors }) =>
        errors[field] ? (
            <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors[field]}
            </p>
        ) : null;

    return (
        <Modal
            isOpen={open}
            onClose={handleClose}
            title={`Editar: ${getNombreCompletoProfesor(profesor)}`}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>

                {/* ── Información Personal ───────────────────────────────── */}
                <div>
                    <h3 className="text-lg font-playfair font-bold text-[#0a1628] mb-4 flex items-center gap-2">
                        <div className="w-1 h-6 bg-gradient-to-b from-[#d4af37] to-[#c19a2e] rounded-full" />
                        Información Personal
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Nombre — fila completa */}
                        <div className="md:col-span-2">
                            <label className={labelClass}>
                                Nombre(s) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange('nombre')}
                                disabled={isLoading}
                                className={inputClass('nombre')}
                            />
                            <ErrorMsg field="nombre" />
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
                                onChange={handleChange('apellidoPaterno')}
                                disabled={isLoading}
                                className={inputClass('apellidoPaterno')}
                            />
                            <ErrorMsg field="apellidoPaterno" />
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
                                value={formData.apellidoMaterno ?? ''}
                                onChange={handleChange('apellidoMaterno')}
                                disabled={isLoading}
                                className={inputClass('apellidoMaterno')}
                            />
                        </div>

                        {/* Correo */}
                        <div>
                            <label className={labelClass}>
                                Correo Electrónico <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                name="correo"
                                value={formData.correo}
                                onChange={handleChange('correo')}
                                disabled={isLoading}
                                className={inputClass('correo')}
                            />
                            <ErrorMsg field="correo" />
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
                                onChange={handleChange('telefono')}
                                disabled={isLoading}
                                className={inputClass('telefono')}
                            />
                            <ErrorMsg field="telefono" />
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
                                onChange={handleChange('fechaNacimiento')}
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
                                onChange={handleChange('genero')}
                                disabled={isLoading}
                                className={inputClass('genero')}
                            >
                                <option value="">Sin especificar</option>
                                <option value="M">Masculino</option>
                                <option value="F">Femenino</option>
                                <option value="otro">Otro</option>
                            </select>
                        </div>

                        {/* Estado */}
                        <div>
                            <label className={labelClass}>Estado</label>
                            <select
                                name="activo"
                                value={formData.activo ? 'true' : 'false'}
                                onChange={handleChange('activo')}
                                disabled={isLoading}
                                className="w-full px-4 py-3 rounded-xl border-2 border-[#c8d8f0] bg-white font-lora text-sm focus:outline-none focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/10 transition-all"
                            >
                                <option value="true">Activo</option>
                                <option value="false">Inactivo</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* ── Contraseña ─────────────────────────────────────────── */}
                <div>
                    <h3 className="text-lg font-playfair font-bold text-[#0a1628] mb-4 flex items-center gap-2">
                        <div className="w-1 h-6 bg-gradient-to-b from-[#d4af37] to-[#c19a2e] rounded-full" />
                        Seguridad
                    </h3>

                    <div className="bg-[#f5f8ff] rounded-xl p-4 mb-4 border border-[#c8d8f0]">
                        <p className="text-sm text-[#1e3a6e] flex items-center gap-2">
                            <svg className="w-4 h-4 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Deja en blanco si no deseas cambiar la contraseña
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
                            placeholder="Mínimo 6 caracteres"
                            value={formData.password || ''}
                            onChange={handleChange('password')}
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
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                        <ErrorMsg field="password" />
                    </div>
                </div>

                {/* ── Botones ────────────────────────────────────────────── */}
                <div className="flex gap-3 pt-6 border-t border-[#c8d8f0]">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 rounded-xl border-2 border-[#c8d8f0] text-[#1e3a6e] font-bold hover:bg-[#f5f8ff] transition-colors disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#0a1628] to-[#1e3a6e] text-[#f5f8ff] font-bold hover:from-[#1e3a6e] hover:to-[#1a2d5a] shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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
        </Modal>
    );
}