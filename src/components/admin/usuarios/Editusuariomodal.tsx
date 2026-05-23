'use client';

import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { UsuarioFormEdit, UsuarioFormEditData } from './UsuarioFormEdit';
import { UsuarioService } from '../../../service/admin/usuarios/vistausuario.service';

interface EditUsuarioModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    usuario: {
        id: number;
        nombre: string;
        apellidoPaterno: string;
        apellidoMaterno: string | null;
        correo: string;
        telefono: string | null;
        tipoPersona: string;
        activo: boolean;
        rolId: number;
        fechaNacimiento?: string | null;
        genero?: string | null;
        escuela?: {
            id: number;
            nombre: string;
            nivel: string;
        };
        grado?: number;
        grupo?: string;
    };
}

const ROLE_LABELS: Record<string, string> = {
    alumno:        '📚 Alumno',
    maestro:       '👨‍🏫 Profesor',
    padre:         '👥 Tutor',
    director:      '⭐ Director',
    administrador: '👑 Administrador',
};

export const EditUsuarioModal: React.FC<EditUsuarioModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    usuario,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error,     setError]     = useState<string>('');

    // ✅ FIX DEFINITIVO: Se pasa `key={usuario.id}` a UsuarioFormEdit.
    // Cuando React ve una key diferente, destruye y recrea el componente desde cero,
    // inicializando los useState con los datos correctos del usuario seleccionado.
    // Como UsuarioFormEdit ya NO tiene useEffect, nada puede resetear los campos
    // mientras el usuario está escribiendo.

    const initialData: UsuarioFormEditData = {
        nombre:          usuario.nombre             ?? '',
        apellidoPaterno: usuario.apellidoPaterno    ?? '',
        apellidoMaterno: usuario.apellidoMaterno    ?? '',
        email:           usuario.correo             ?? '',
        telefono:        usuario.telefono           ?? '',
        fechaNacimiento: usuario.fechaNacimiento    ?? '',
        genero:          usuario.genero             ?? '',
        password:        '',
        grado:           usuario.grado,
        grupo:           usuario.grupo              ?? '',
    };

    const handleSubmit = async (data: UsuarioFormEditData) => {
        try {
            setIsLoading(true);
            setError('');

            const payload: Record<string, any> = {
                nombre:          data.nombre.trim(),
                apellidoPaterno: data.apellidoPaterno.trim(),
                apellidoMaterno: data.apellidoMaterno?.trim() || null,
                correo:          data.email.trim(),
            };

            if (data.telefono?.trim())        payload.telefono        = data.telefono.trim();
            if (data.fechaNacimiento?.trim()) payload.fechaNacimiento = data.fechaNacimiento.trim();
            if (data.genero?.trim())          payload.genero          = data.genero.trim();
            if (data.grado !== undefined)     payload.grado           = data.grado;
            if (data.grupo?.trim())           payload.grupo           = data.grupo.trim();

            if (data.password && data.password.trim().length > 0) {
                payload.password = data.password.trim();
            }

            await UsuarioService.update(usuario.id, payload);
            console.log('✅ Usuario actualizado correctamente');

            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('❌ Error al actualizar usuario:', err);
            const apiMessage = err.response?.data?.message;
            setError(apiMessage || err.message || 'Error al actualizar el usuario. Por favor intenta de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setError('');
        onClose();
    };

    const nombreCompleto = `${usuario.nombre} ${usuario.apellidoPaterno} ${usuario.apellidoMaterno ?? ''}`.trim();

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={`Editar Usuario: ${nombreCompleto}`}
            size="xl"
        >
            <div className="p-6">
                {/* Badge de rol (no editable) */}
                <div className="mb-5 flex items-center gap-3">
                    <span className="text-sm text-[#6b8cba]">Tipo de usuario:</span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold">
                        {ROLE_LABELS[usuario.tipoPersona] ?? usuario.tipoPersona}
                    </span>
                    <span className="text-xs text-gray-400">(no editable)</span>
                </div>

                {/* Error de API */}
                {error && (
                    <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-red-800 text-sm">{error}</p>
                        </div>
                    </div>
                )}

                {/* ✅ key={usuario.id} — React destruye y recrea el form cuando cambia el usuario */}
                <UsuarioFormEdit
                    key={usuario.id}
                    onSubmit={handleSubmit}
                    onCancel={handleClose}
                    isLoading={isLoading}
                    initialData={initialData}
                />
            </div>
        </Modal>
    );
};