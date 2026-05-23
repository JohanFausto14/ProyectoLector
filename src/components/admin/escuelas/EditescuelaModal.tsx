'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '../../ui/Modal';
import { EscuelaForm } from './EscuelaForm';
import { EscuelaService } from '../../../service/escuela.service';
import type { EscuelaListItem, CreateEscuelaDTO } from '../../../types/admin/escuelas/escuela';

interface EditEscuelaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    escuela: EscuelaListItem;
}

export const EditEscuelaModal: React.FC<EditEscuelaModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    escuela,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');

    // Limpiar error al abrir/cerrar
    useEffect(() => {
        if (!isOpen) setError('');
    }, [isOpen]);

    const handleSubmit = async (data: CreateEscuelaDTO) => {
        try {
            setIsLoading(true);
            setError('');

            await EscuelaService.update(Number(escuela.id), data);
            console.log('✅ Escuela actualizada:', escuela.id);

            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('❌ Error al actualizar escuela:', err);
            const status = err.response?.status;
            const apiMessage = err.response?.data?.message;

            if (status === 409) {
                setError('Ya existe una escuela con ese nombre o clave. Por favor usa valores únicos.');
            } else if (status === 404) {
                setError('La escuela no fue encontrada. Es posible que haya sido eliminada.');
            } else {
                setError(apiMessage || 'Error al actualizar la escuela. Por favor intenta de nuevo.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Mapear datos de la escuela al formato del form
    const initialData = {
        nombre:       escuela.nombre            ?? '',
        nivel:        escuela.nivel             ?? '',
        clave:        escuela.clave             ?? '',
        direccion:    escuela.direccion         ?? '',
        telefono:     escuela.telefono          ?? '',
        ciudad:       escuela.ciudad            ?? '',
        estadoRegion: escuela.estadoRegion      ?? '',
        estado:       escuela.estado,
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Editar: ${escuela.nombre}`}
            size="xl"
        >
            <div className="p-6">
                {/* Error de API */}
                {error && (
                    <div className="mb-5 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-red-800 text-sm">{error}</p>
                        </div>
                    </div>
                )}

                <EscuelaForm
                    initialData={initialData}
                    onSubmit={handleSubmit}
                    onCancel={onClose}
                    isLoading={isLoading}
                    isEdit={true}
                />
            </div>
        </Modal>
    );
};