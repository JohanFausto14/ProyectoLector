'use client';

import React, { useState, useRef } from 'react';
import { Modal } from '../../ui/Modal';
import { toast } from '@/utils/toast';
import { cargaMasivaService, CargaMasivaResponse } from '../../../service/escuela/alumnos/cargaMasiva.service';

interface CargaMasivaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type Step = 'inicio' | 'subir' | 'procesando' | 'resultado';

export const CargaMasivaModal: React.FC<CargaMasivaModalProps> = ({
    isOpen,
    onClose,
    onSuccess
}) => {
    const [step, setStep] = useState<Step>('inicio');
    const [archivo, setArchivo] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isDescargando, setIsDescargando] = useState(false);
    const [resultado, setResultado] = useState<CargaMasivaResponse | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleClose = () => {
        if (step === 'procesando') return;
        setStep('inicio');
        setArchivo(null);
        setResultado(null);
        onClose();
    };

    // ─── Descargar plantilla ───────────────────────────────────────────────
    const handleDescargarPlantilla = async () => {
        try {
            setIsDescargando(true);
            await cargaMasivaService.descargarPlantilla();
            toast.success('Plantilla descargada exitosamente');
        } catch (error: any) {
            toast.error(error.message || 'Error al descargar la plantilla');
        } finally {
            setIsDescargando(false);
        }
    };

    // ─── Manejo de archivo ─────────────────────────────────────────────────
    const validarYSetArchivo = (file: File) => {
        const esExcel =
            file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.type === 'application/vnd.ms-excel' ||
            file.name.endsWith('.xlsx') ||
            file.name.endsWith('.xls');

        if (!esExcel) {
            toast.error('Solo se permiten archivos Excel (.xlsx, .xls)');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            toast.error('El archivo no debe superar 10MB');
            return;
        }

        setArchivo(file);
        setStep('subir');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) validarYSetArchivo(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) validarYSetArchivo(file);
    };

    // ─── Subir Excel ───────────────────────────────────────────────────────
    const handleSubir = async () => {
        if (!archivo) return;

        try {
            setStep('procesando');
            const data = await cargaMasivaService.cargarAlumnos(archivo);
            setResultado(data);
            setStep('resultado');

            if (data?.exitosos && data.exitosos > 0) {
                onSuccess();
            }
        } catch (error: any) {
            setResultado({ message: error.message, errores: 1 });
            setStep('resultado');
        }
    };

    const handleReintentar = () => {
        setArchivo(null);
        setResultado(null);
        setStep('inicio');
    };

    // ─── Render por step ───────────────────────────────────────────────────
    const renderContenido = () => {
        switch (step) {
            case 'inicio':
                return (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-[#f5f8ff] to-[#f5f8ff] rounded-xl p-5 border border-[#c8d8f0]">
                            <h4 className="font-playfair font-bold text-[#0a1628] mb-3 flex items-center gap-2">
                                <span className="text-[#d4af37]">📋</span>
                                ¿Cómo funciona?
                            </h4>
                            <ol className="space-y-3 text-sm text-[#1e3a6e]">
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#d4af37] text-white text-xs flex items-center justify-center font-bold mt-0.5">1</span>
                                    <span>Descarga la plantilla Excel con el formato requerido.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#d4af37] text-white text-xs flex items-center justify-center font-bold mt-0.5">2</span>
                                    <span>Llena la plantilla con los datos de los alumnos a registrar.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#d4af37] text-white text-xs flex items-center justify-center font-bold mt-0.5">3</span>
                                    <span>Sube el archivo y espera la confirmación del sistema.</span>
                                </li>
                            </ol>
                        </div>

                        <button
                            onClick={handleDescargarPlantilla}
                            disabled={isDescargando}
                            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl border-2 border-dashed border-[#d4af37] bg-[#d4af37]/5 text-[#1e3a6e] font-bold hover:bg-[#d4af37]/10 hover:border-[#c19a2e] transition-all duration-300 disabled:opacity-60 group"
                        >
                            {isDescargando ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#d4af37]" />
                            ) : (
                                <svg className="w-6 h-6 text-[#d4af37] group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                            )}
                            {isDescargando ? 'Descargando...' : 'Descargar Plantilla Excel'}
                        </button>

                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all duration-300 ${
                                isDragging
                                    ? 'border-[#d4af37] bg-[#d4af37]/10 scale-[1.02]'
                                    : 'border-[#c8d8f0] bg-[#f5f8ff]/50 hover:border-[#d4af37]/50 hover:bg-[#f5f8ff]'
                            }`}
                        >
                            <div className="flex flex-col items-center gap-3">
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isDragging ? 'bg-[#d4af37]/20' : 'bg-[#c8d8f0]/50'}`}>
                                    <svg className="w-7 h-7 text-[#6b8cba]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-bold text-[#0a1628] text-sm">
                                        {isDragging ? '¡Suelta el archivo aquí!' : 'Arrastra tu archivo Excel aquí'}
                                    </p>
                                    <p className="text-[#6b8cba] text-xs mt-1">o haz clic para seleccionar</p>
                                    <p className="text-[#6b8cba] text-xs mt-1">.xlsx, .xls · Máx. 10MB</p>
                                </div>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>
                );

            case 'subir':
                return (
                    <div className="space-y-6">
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-green-800 text-sm truncate">{archivo?.name}</p>
                                <p className="text-green-600 text-xs">
                                    {archivo ? (archivo.size / 1024).toFixed(1) : 0} KB · Listo para subir
                                </p>
                            </div>
                            <button
                                onClick={handleReintentar}
                                className="text-green-600 hover:text-green-800 transition-colors flex-shrink-0"
                                title="Cambiar archivo"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="bg-[#f5f8ff] rounded-xl p-4 border border-[#c8d8f0]">
                            <p className="text-sm text-[#1e3a6e] flex items-start gap-2">
                                <svg className="w-4 h-4 text-[#d4af37] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                El sistema registrará todos los alumnos del archivo. Los correos duplicados serán ignorados automáticamente.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleReintentar}
                                className="flex-1 px-4 py-3 rounded-xl border-2 border-[#c8d8f0] text-[#1e3a6e] font-bold hover:bg-[#f5f8ff] transition-colors"
                            >
                                Cambiar archivo
                            </button>
                            <button
                                onClick={handleSubir}
                                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#0a1628] to-[#1e3a6e] text-[#f5f8ff] font-bold hover:from-[#1e3a6e] hover:to-[#1a2d5a] shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                Subir y Registrar
                            </button>
                        </div>
                    </div>
                );

            case 'procesando':
                return (
                    <div className="flex flex-col items-center justify-center py-12 gap-6">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full border-4 border-[#c8d8f0]" />
                            <div className="w-20 h-20 rounded-full border-4 border-[#d4af37] border-t-transparent animate-spin absolute inset-0" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <svg className="w-8 h-8 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="font-playfair font-bold text-[#0a1628] text-lg">Procesando archivo...</p>
                            <p className="text-[#1e3a6e] text-sm mt-1">Esto puede tardar unos segundos</p>
                        </div>
                    </div>
                );

            case 'resultado':
                const soloErrores = (!resultado?.exitosos || resultado.exitosos === 0) && (resultado?.errores ?? 0) > 0;

                return (
                    <div className="space-y-5">
                        <div className="text-center">
                            <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-3 ${soloErrores ? 'bg-red-100' : 'bg-green-100'}`}>
                                {soloErrores ? (
                                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                ) : (
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                            <h3 className="font-playfair font-bold text-[#0a1628] text-lg">
                                {soloErrores ? 'Error al procesar' : 'Carga completada'}
                            </h3>
                            <p className="text-[#1e3a6e] text-sm mt-1">{resultado?.message}</p>
                        </div>

                        {(resultado?.total !== undefined || resultado?.exitosos !== undefined) && (
                            <div className="grid grid-cols-3 gap-3">
                                {resultado.total !== undefined && (
                                    <div className="bg-[#f5f8ff] rounded-xl p-3 text-center border border-[#c8d8f0]">
                                        <p className="text-2xl font-playfair font-bold text-[#0a1628]">{resultado.total}</p>
                                        <p className="text-xs text-[#1e3a6e] font-bold uppercase mt-1">Total</p>
                                    </div>
                                )}
                                {resultado.exitosos !== undefined && (
                                    <div className="bg-green-50 rounded-xl p-3 text-center border border-green-200">
                                        <p className="text-2xl font-playfair font-bold text-green-700">{resultado.exitosos}</p>
                                        <p className="text-xs text-green-600 font-bold uppercase mt-1">Exitosos</p>
                                    </div>
                                )}
                                {resultado.errores !== undefined && (
                                    <div className={`rounded-xl p-3 text-center border ${resultado.errores > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                                        <p className={`text-2xl font-playfair font-bold ${resultado.errores > 0 ? 'text-red-700' : 'text-green-700'}`}>{resultado.errores}</p>
                                        <p className={`text-xs font-bold uppercase mt-1 ${resultado.errores > 0 ? 'text-red-600' : 'text-green-600'}`}>Errores</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {resultado?.detalles && resultado.detalles.length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 max-h-36 overflow-y-auto">
                                <p className="text-xs font-bold text-red-700 uppercase mb-2">Detalles:</p>
                                <ul className="space-y-1">
                                    {resultado.detalles.map((detalle, i) => (
                                        <li key={i} className="text-xs text-red-600 flex items-start gap-1">
                                            <span className="mt-0.5">•</span> {detalle}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={handleReintentar}
                                className="flex-1 px-4 py-3 rounded-xl border-2 border-[#c8d8f0] text-[#1e3a6e] font-bold hover:bg-[#f5f8ff] transition-colors"
                            >
                                Subir otro archivo
                            </button>
                            <button
                                onClick={handleClose}
                                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#0a1628] to-[#1e3a6e] text-[#f5f8ff] font-bold hover:from-[#1e3a6e] hover:to-[#1a2d5a] shadow-lg transition-all"
                            >
                                Finalizar
                            </button>
                        </div>
                    </div>
                );
        }
    };

    const titles: Record<Step, string> = {
        inicio: 'Carga Masiva de Alumnos',
        subir: 'Confirmar Carga',
        procesando: 'Procesando...',
        resultado: 'Resultado de la Carga'
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={titles[step]}
            size="md"
        >
            {renderContenido()}
        </Modal>
    );
};