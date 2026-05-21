'use client';

import { useState, useEffect } from 'react';
import { VinculacionService } from '../../service/vinculacion.service';

export default function TutorPage() {
    const [children, setChildren] = useState<any[]>([]);
    const [selectedChildIndex, setSelectedChildIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [showLinkingModal, setShowLinkingModal] = useState(false);
    const [linkingCode, setLinkingCode] = useState('');
    const [isLinking, setIsLinking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);
    const [alumnoToUnlink, setAlumnoToUnlink] = useState<any>(null);
    const [isUnlinking, setIsUnlinking] = useState(false);

    const loadChildren = async () => {
        try {
            setIsLoading(true);
            const data = await VinculacionService.getMisAlumnos();
            const list = Array.isArray(data) ? data : (data.data || []);
            setChildren(list);
            if (list.length > 0 && selectedChildIndex >= list.length) {
                setSelectedChildIndex(0);
            }
        } catch (err) {
            console.error('Error cargando alumnos vinculados:', err);
            setChildren([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadChildren();
    }, []);

    // Bloqueo de scroll global cuando el modal está abierto
    useEffect(() => {
        if (showLinkingModal || showUnlinkConfirm) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showLinkingModal, showUnlinkConfirm]);

    const handleLink = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!linkingCode.trim()) return;

        try {
            setIsLinking(true);
            setError(null);
            await VinculacionService.vincularConCodigo({ codigo: linkingCode.trim() });
            setSuccess('¡Alumno vinculado con éxito!');
            setLinkingCode('');
            setTimeout(() => {
                setSuccess(null);
                setShowLinkingModal(false);
                loadChildren();
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al vincular. Verifica el código.');
        } finally {
            setIsLinking(false);
        }
    };

    const handleUnlink = async () => {
        if (!alumnoToUnlink) return;

        try {
            setIsUnlinking(true);
            setError(null);
            await VinculacionService.desvincular(alumnoToUnlink.id);
            setSuccess(`¡Vínculo con ${alumnoToUnlink.persona?.nombre} eliminado!`);
            
            setTimeout(() => {
                setSuccess(null);
                setShowUnlinkConfirm(false);
                setAlumnoToUnlink(null);
                loadChildren();
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'No se pudo desvincular al alumno.');
        } finally {
            setIsUnlinking(false);
        }
    };

    const currentChild = children[selectedChildIndex];

    const stats = [
        { 
            label: 'Libros Leídos', 
            value: '12', 
            icon: 'book',
            color: 'bg-blue-500 shadow-blue-200' 
        },
        { 
            label: 'Promedio Gral.', 
            value: '8.9', 
            icon: 'star',
            color: 'bg-yellow-500 shadow-yellow-200' 
        },
        { 
            label: 'Lectura (Hrs)', 
            value: '24', 
            icon: 'clock',
            color: 'bg-emerald-500 shadow-emerald-200' 
        },
        { 
            label: 'Racha Activa', 
            value: '15 días', 
            icon: 'fire',
            color: 'bg-orange-500 shadow-orange-200' 
        },
    ];

    return (
        <div className="min-h-screen bg-[#f5f5f5] px-4 pb-4 md:px-8 md:pb-8 pt-0 animate-fade-in font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pt-8">
                <div>
                    <h1 className="text-4xl font-playfair font-bold text-[#0a1628] mb-2">
                        Dashboard Familiar
                    </h1>
                    <p className="text-[#1e3a6e] text-lg font-lora">
                        Seguimiento y acompañamiento académico de tus hijos
                    </p>
                </div>
                <button 
                    onClick={() => setShowLinkingModal(true)}
                    className="flex items-center gap-2 bg-[#0a1628] text-[#f5f8ff] px-6 py-4 rounded-xl font-bold shadow-lg hover:bg-[#1e3a6e] hover:scale-105 transition-all outline-none"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                    Vincular Hijo
                </button>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24">
                    <div className="w-16 h-16 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-[#1e3a6e] font-bold text-xl">Accediendo a la información familiar...</p>
                </div>
            ) : children.length === 0 ? (
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-[#c8d8f0]/50 p-12 text-center animate-fade-in">
                    <div className="w-20 h-20 bg-[#f5f8ff] rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                    </div>
                    <h2 className="text-2xl font-playfair font-bold text-[#0a1628] mb-4">No hay alumnos vinculados</h2>
                    <p className="text-[#1e3a6e] mb-8 font-medium">Vincula una cuenta para comenzar el seguimiento.</p>
                    <button 
                        onClick={() => setShowLinkingModal(true)}
                        className="bg-[#d4af37] text-[#0a1628] px-8 py-4 rounded-xl font-bold shadow-md hover:shadow-xl transition-all"
                    >
                        Comenzar Ahora
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Selector de hijos */}
                    {children.length > 1 && (
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {children.map((child, idx) => (
                                <button
                                    key={child.id}
                                    onClick={() => setSelectedChildIndex(idx)}
                                    className={`px-6 py-2.5 rounded-xl font-bold transition-all text-sm border-2 ${
                                        selectedChildIndex === idx 
                                        ? 'bg-[#0a1628] text-[#f5f8ff] border-[#0a1628] shadow-md' 
                                        : 'bg-white text-[#1e3a6e] border-[#c8d8f0]/30 hover:border-[#d4af37]'
                                    }`}
                                >
                                    {child.persona?.nombre}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Ficha del Alumno */}
                    <div className="bg-white rounded-2xl shadow-sm border border-[#c8d8f0]/30 p-8 relative overflow-hidden group">
                        {/* Botón Desvincular - Esquina Superior Derecha */}
                        <div className="absolute top-6 right-8 z-[30]">
                            <button
                                onClick={() => {
                                    setAlumnoToUnlink(currentChild);
                                    setShowUnlinkConfirm(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold text-xs border border-red-100 hover:bg-red-600 hover:text-white transition-all shadow-sm group/btn"
                                title="Desvincular alumno"
                            >
                                <svg className="w-4 h-4 transition-transform group-hover/btn:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Desvincular Hijo
                            </button>
                        </div>

                        <div className="relative flex flex-col md:flex-row items-center gap-10 pt-4 md:pt-0">
                            <div className="w-28 h-28 bg-[#0a1628] rounded-3xl flex items-center justify-center shadow-2xl relative transition-transform hover:scale-105">
                                <span className="text-5xl font-playfair font-black text-[#d4af37]">
                                    {currentChild?.persona?.nombre?.charAt(0)}
                                </span>
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#d4af37] rounded-lg flex items-center justify-center border-2 border-white shadow-lg">
                                    <svg className="w-4 h-4 text-[#0a1628]" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/></svg>
                                </div>
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h2 className="text-4xl font-playfair font-black leading-tight mb-4">
                                    <span className="text-[#d4af37]">{currentChild?.persona?.nombre}</span> <br className="hidden md:block"/>
                                    <span className="text-[#0a1628]">
                                        {currentChild?.persona?.apellidoPaterno} {currentChild?.persona?.apellidoMaterno || ''}
                                    </span>
                                </h2>
                                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                    <div className="flex items-center gap-2 text-[#1e3a6e] font-bold bg-[#f5f8ff] px-4 py-2 rounded-xl border border-[#c8d8f0]/40">
                                        <svg className="w-4 h-4 text-[#d4af37]" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.827a1 1 0 00-.788 0L2.606 6l7 3.5 7-3.5-7.212-3.173zM17.5 7.925l-7.5 3.75-7.5-3.75v5.422l7.5 3.75 7.5-3.75V7.925z"/></svg>
                                        Grado: {currentChild?.grado}°
                                    </div>
                                    <div className="flex items-center gap-2 text-[#1e3a6e] font-bold bg-[#f5f8ff] px-4 py-2 rounded-xl border border-[#c8d8f0]/40">
                                        <svg className="w-4 h-4 text-[#d4af37]" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/></svg>
                                        Grupo: {currentChild?.grupo || 'N/A'}
                                    </div>
                                    <div className="flex items-center gap-2 text-[#1e3a6e] font-bold bg-[#f5f8ff] px-4 py-2 rounded-xl border border-[#c8d8f0]/40 leading-tight">
                                        <svg className="w-4 h-4 text-[#d4af37]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd"/></svg>
                                        {currentChild?.escuela?.nombre}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {stats.map((stat, i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-[#c8d8f0]/30 transition-all hover:bg-[#f5f8ff]">
                                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-4 shadow-lg transform group-hover:rotate-6 transition-transform`}>
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        {stat.icon === 'book' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />}
                                        {stat.icon === 'star' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />}
                                        {stat.icon === 'clock' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0" />}
                                        {stat.icon === 'fire' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />}
                                    </svg>
                                </div>
                                <div className="text-2xl font-bold text-[#0a1628] mb-1">{stat.value}</div>
                                <div className="text-sm font-medium text-[#1e3a6e]">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modal de Vinculación */}
            {showLinkingModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl p-10 w-full max-w-lg shadow-2xl border border-[#c8d8f0] relative">
                        <button 
                            onClick={() => setShowLinkingModal(false)}
                            className="absolute top-6 right-6 text-[#6b8cba] hover:text-[#0a1628] transition-all"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>

                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-playfair font-bold text-[#0a1628] mb-2">Vincular Nueva Cuenta</h2>
                            <p className="text-[#1e3a6e]">Solicita el código de 32 caracteres a tu hijo</p>
                        </div>

                        <form onSubmit={handleLink} className="space-y-6">
                            <div className="space-y-2 text-left">
                                <label className="text-[11px] font-bold text-[#6b8cba] uppercase tracking-widest ml-1">Código de Seguridad</label>
                                <input 
                                    type="text" 
                                    placeholder="Ej: 9421834d917ce02db3ba74072bc629f5..."
                                    className="w-full p-4 bg-[#f5f8ff] rounded-xl border-2 border-[#c8d8f0]/50 focus:border-[#d4af37] outline-none font-mono text-xs text-center"
                                    value={linkingCode}
                                    onChange={(e) => setLinkingCode(e.target.value)}
                                    required
                                />
                            </div>
                            {error && <p className="text-red-500 text-sm font-bold text-center bg-red-50 p-4 rounded-xl border border-red-100">{error}</p>}
                            {success && <p className="text-emerald-500 text-sm font-bold text-center bg-emerald-50 p-4 rounded-xl border border-emerald-100">{success}</p>}
                            
                            <button 
                                disabled={isLinking || !linkingCode}
                                className="w-full bg-[#0a1628] text-[#f5f8ff] p-4 rounded-xl font-bold text-lg hover:bg-[#1e3a6e] hover:scale-[1.02] transition-all disabled:opacity-50"
                            >
                                {isLinking ? 'Procesando...' : 'Confirmar Vínculo'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Confirmación de Desvinculación */}
            {showUnlinkConfirm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-[#0a1628]/80 backdrop-blur-md animate-fade-in">
                    <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl border border-[#c8d8f0] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-[#d4af37] to-red-500" />
                        
                        <div className="text-center mt-4">
                            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-600 shadow-inner">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            
                            <h2 className="text-3xl font-playfair font-black text-[#0a1628] mb-4">¿Estás seguro?</h2>
                            <p className="text-[#1e3a6e] mb-8 font-lora text-lg leading-relaxed">
                                Estás a punto de desvincular a <span className="font-black text-[#0a1628]">{alumnoToUnlink?.persona?.nombre}</span> de tu Dashboard Familiar. 
                            </p>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleUnlink}
                                    disabled={isUnlinking}
                                    className="w-full bg-red-600 text-white p-4 rounded-xl font-bold text-lg shadow-lg hover:bg-red-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    {isUnlinking ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Confirmar Desvinculación
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowUnlinkConfirm(false);
                                        setAlumnoToUnlink(null);
                                    }}
                                    disabled={isUnlinking}
                                    className="w-full bg-[#f5f8ff] text-[#1e3a6e] p-4 rounded-xl font-bold border-2 border-[#c8d8f0]/50 hover:bg-[#c8d8f0]/20 transition-all font-lora"
                                >
                                    No, mantener vínculo
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="mt-4 p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="mt-4 p-4 bg-emerald-50 text-emerald-600 text-sm font-bold rounded-xl border border-emerald-100">
                                {success}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}