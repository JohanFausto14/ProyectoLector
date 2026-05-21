'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LibroAlumno, LibroDetalle } from '../../../types/alumno/libros';
import { AlumnoLibrosService } from '../../../service/alumno/libros.service';
import { LibroCard } from '../../../components/alumno/libros/LibroCard';
import { LecturaDestacada } from '../../../components/alumno/libros/LecturaDestacada';
import { LibroDetalleModal } from '../../../components/alumno/libros/LibroDetalleModal';
import { toast } from '../../../utils/toast';

export default function BibliotecaPage() {
    const router = useRouter();
    const [libros, setLibros] = useState<LibroAlumno[]>([]);
    const [selectedLibro, setSelectedLibro] = useState<LibroDetalle | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loadingDetalle, setLoadingDetalle] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Cargar lista de libros del alumno
    const fetchLibros = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await AlumnoLibrosService.getMisLibros();
            setLibros(data);
        } catch (error) {
            toast.error('No pudimos cargar tus libros. Intenta de nuevo más tarde.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLibros();
    }, [fetchLibros]);

    // Al hacer click en un libro: obtener detalle y mergear progreso local
    const handleBookClick = async (libroId: number) => {
        if (loadingDetalle) return;
        setLoadingDetalle(true);
        try {
            const detail = await AlumnoLibrosService.getLibroDetalle(libroId);

            // Mergear progreso desde la lista (el endpoint /libros/:id no devuelve progreso del alumno)
            const libroEnLista = libros.find(l => l.libroId === libroId);
            const libroMergeado: LibroDetalle = {
                ...detail,
                progresoPorcentaje: libroEnLista?.progresoPorcentaje ?? 0,
                ultimoSegmentoId: libroEnLista?.ultimoSegmentoId,
                ultimaLectura: libroEnLista?.ultimaLectura,
                portadaUrl: libroEnLista?.portadaUrl,
            };

            setSelectedLibro(libroMergeado);
            setIsModalOpen(true);
        } catch (error) {
            toast.error('Error al cargar el detalle del libro.');
        } finally {
            setLoadingDetalle(false);
        }
    };

    // Cuando el alumno presiona "Empezar/Continuar lectura" o selecciona una unidad
    const handleLeer = (libro: LibroDetalle, segmentoId?: number) => {
        const targetId = segmentoId || libro.ultimoSegmentoId;
        const query = targetId ? `?segmento=${targetId}` : '';
        router.push(`/alumno/library/reader/${libro.id}${query}`);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        // Pequeño delay para que la animación de cierre termine antes de limpiar
        setTimeout(() => setSelectedLibro(null), 300);
    };

    // ─── Loading ────────────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4af37] mb-4" />
                <p className="text-[#1e3a6e] font-lora">Preparando tu biblioteca...</p>
            </div>
        );
    }

    // ─── Derivados ──────────────────────────────────────────────────────────────
    const librosActivos = libros;
    const librosCompletados = libros.filter(l => l.progresoPorcentaje === 100);
    const librosEnCurso = libros.filter(l => l.progresoPorcentaje < 100);

    // Libro destacado: el que tenga la lectura más reciente en curso
    const libroDestacado = librosEnCurso.length > 0
        ? [...librosEnCurso].sort((a, b) => {
            if (!a.ultimaLectura) return 1;
            if (!b.ultimaLectura) return -1;
            return new Date(b.ultimaLectura).getTime() - new Date(a.ultimaLectura).getTime();
        })[0]
        : null;

    const restoEnCurso = librosEnCurso.filter(l => l.libroId !== libroDestacado?.libroId);

    // ─── Empty State ─────────────────────────────────────────────────────────────
    if (librosActivos.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-[#c8d8f0] animate-in fade-in duration-700">
                <div className="w-20 h-20 bg-[#f5f8ff] rounded-full mx-auto mb-6 flex items-center justify-center text-[#d4af37]">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                </div>
                <h3 className="text-2xl font-playfair font-bold text-[#0a1628] mb-2">Tu biblioteca está vacía</h3>
                <p className="text-[#1e3a6e] font-lora italic max-w-sm mx-auto">
                    Tus maestros te asignarán libros muy pronto para que comiences tu viaje de lectura.
                </p>
            </div>
        );
    }

    // ─── Vista principal ─────────────────────────────────────────────────────────
    return (
        <div className="space-y-12 pb-12">

            {/* Stats cuando ya terminó todos */}
            {!libroDestacado && librosActivos.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-700">
                    <div className="bg-gradient-to-br from-[#0a1628] to-[#1e3a6e] p-6 rounded-3xl shadow-xl border border-white/10 relative overflow-hidden">
                        <p className="text-[#d4af37] text-xs font-bold uppercase tracking-widest mb-1">Total de Libros</p>
                        <h3 className="text-4xl font-playfair font-bold text-white">{librosActivos.length}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-lg border border-[#c8d8f0]/30">
                        <p className="text-[#1e3a6e] text-xs font-bold uppercase tracking-widest mb-1">En curso</p>
                        <h3 className="text-4xl font-playfair font-bold text-[#0a1628]">{librosEnCurso.length}</h3>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-3xl shadow-lg border border-emerald-100">
                        <p className="text-emerald-700 text-xs font-bold uppercase tracking-widest mb-1">Completados</p>
                        <h3 className="text-4xl font-playfair font-bold text-emerald-600">{librosCompletados.length}</h3>
                    </div>
                </div>
            )}

            {/* Lectura destacada */}
            {libroDestacado && (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <LecturaDestacada libro={libroDestacado} onClick={handleBookClick} />
                </section>
            )}

            {/* Resto en curso */}
            {restoEnCurso.length > 0 && (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-1 h-8 bg-[#d4af37] rounded-full shadow-[0_0_8px_rgba(212,175,55,0.4)]" />
                        <h2 className="font-playfair text-2xl font-bold text-[#0a1628]">Otros en curso</h2>
                        <span className="text-[10px] font-black text-[#6b8cba] bg-[#f5f8ff] px-2 py-1 rounded border border-[#c8d8f0]/50">
                            {restoEnCurso.length}
                        </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6 md:gap-8">
                        {restoEnCurso.map(libro => (
                            <LibroCard key={libro.libroId} libro={libro} onClick={handleBookClick} />
                        ))}
                    </div>
                </section>
            )}

            {/* Completados */}
            {librosCompletados.length > 0 && (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-1 h-8 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                        <h2 className="font-playfair text-2xl font-bold text-[#0a1628]">Colección de Honor</h2>
                        <span className="hidden md:inline-flex ml-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                            ¡Logro Desbloqueado! 🏆
                        </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6 md:gap-8 opacity-90 grayscale-[0.3] hover:grayscale-0 transition-all duration-500">
                        {librosCompletados.map(libro => (
                            <LibroCard key={libro.libroId} libro={libro} onClick={handleBookClick} />
                        ))}
                    </div>
                </section>
            )}

            {/* Modal de detalle */}
            <LibroDetalleModal
                libro={selectedLibro}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onLeer={handleLeer}
            />

            {/* Overlay de carga al abrir detalle */}
            {loadingDetalle && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/20 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 shadow-2xl flex items-center gap-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d4af37]" />
                        <p className="text-[#0a1628] font-playfair font-bold">Cargando libro...</p>
                    </div>
                </div>
            )}
        </div>
    );
}