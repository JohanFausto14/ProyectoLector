'use client';

import { useState, useEffect } from 'react';
import { ProfesorService } from '../../service/profesor/profesor.service';
import { GrupoProfesor, AlumnoGrupo } from '../../types/profesor/profesor';

export default function ProfesorPage() {
    const [groups, setGroups] = useState<GrupoProfesor[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
    const [students, setStudents] = useState<AlumnoGrupo[]>([]);
    const [isLoadingGroups, setIsLoadingGroups] = useState(true);
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);

    useEffect(() => {
        ProfesorService.getGrupos()
            .then(data => {
                setGroups(data);
                if (data.length > 0) {
                    setSelectedGroup(data[0].id);
                }
            })
            .catch(console.error)
            .finally(() => setIsLoadingGroups(false));
    }, []);

    useEffect(() => {
        if (selectedGroup) {
            setIsLoadingStudents(true);
            ProfesorService.getAlumnos(selectedGroup)
                .then(setStudents)
                .catch(console.error)
                .finally(() => setIsLoadingStudents(false));
        }
    }, [selectedGroup]);

    // Libros dummy para la UI ya que esta versión del API no los provee aún
    const recentBooks = [
        { title: 'Cien Años de Soledad', completed: 18, inProgress: 8, notStarted: 2 },
        { title: 'El Principito', completed: 25, inProgress: 3, notStarted: 0 },
        { title: 'Don Quijote', completed: 12, inProgress: 10, notStarted: 6 },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f5f5f5] to-[#f5f8ff] p-4 md:p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-playfair font-bold text-[#0a1628] mb-2">
                    Portal del Profesor
                </h1>
                <p className="text-[#1e3a6e] text-lg">
                    Bienvenido - Monitoreo y Gestión de Alumnos
                </p>
            </div>

            {/* Group Selector */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h2 className="text-xl font-playfair font-bold text-[#0a1628] mb-4">Mis Grupos</h2>
                {isLoadingGroups ? (
                    <div className="flex justify-center p-4">
                        <div className="w-8 h-8 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {groups.map((group) => (
                            <button
                                key={group.id}
                                onClick={() => setSelectedGroup(group.id)}
                                className={`p-4 rounded-lg border-2 transition-all text-left ${selectedGroup === group.id
                                        ? 'border-[#d4af37] bg-[#d4af37]/10'
                                        : 'border-gray-200 hover:border-[#d4af37]/50'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-2xl font-bold text-[#0a1628]">{group.nombre}</h3>
                                    {group.alumnosPendientesEvaluacion > 0 && (
                                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                            {group.alumnosPendientesEvaluacion}
                                        </span>
                                    )}
                                </div>
                                <p className="text-[#1e3a6e] text-sm">{group.totalAlumnos} estudiantes</p>
                            </button>
                        ))}
                        <button className="p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-[#d4af37] transition-all flex items-center justify-center">
                            <span className="text-[#6b8cba]">+ Agregar Grupo</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Main Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Students List */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-playfair font-bold text-[#0a1628]">
                            Estudiantes - {groups.find(g => g.id === selectedGroup)?.nombre ?? 'Cargando...'}
                        </h2>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 bg-[#f5f5f5] text-[#0a1628] rounded-lg hover:bg-[#d4af37]/20 transition-colors">
                                Exportar
                            </button>
                        </div>
                    </div>

                    {isLoadingStudents ? (
                        <div className="flex justify-center p-8">
                            <div className="w-8 h-8 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {students.map((student) => (
                                <div
                                    key={student.alumnoId}
                                    className="flex items-center justify-between p-4 bg-[#f5f5f5] rounded-lg hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-12 h-12 bg-[#d4af37] rounded-full flex items-center justify-center">
                                            <span className="text-[#0a1628] font-bold">
                                                {student.nombre.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-[#0a1628] font-semibold">{student.nombre}</h3>
                                            <p className="text-[#6b8cba] text-sm">
                                                Última act: {new Date(student.ultimaActividad).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-[#0a1628]">{student.progresoPromedio}%</p>
                                            <p className="text-[#6b8cba] text-xs">Progreso</p>
                                        </div>
                                        <div className={`w-3 h-3 rounded-full ${student.estadoActividad === 'active' ? 'bg-green-500' :
                                                student.estadoActividad === 'warning' ? 'bg-yellow-500' :
                                                    'bg-red-500'
                                            }`} title={`Estado: ${student.estadoActividad}`}></div>
                                        <button className="text-[#d4af37] hover:text-[#c19b2f]">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {students.length === 0 && (
                                <p className="text-center text-[#6b8cba] py-4">No hay estudiantes en este grupo.</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Books Progress - Temporarily kept as dummy since it wasn't in API yet */}
                    <div className="bg-white rounded-xl shadow-lg p-6 opacity-70">
                        <h3 className="text-xl font-playfair font-bold text-[#0a1628] mb-4">
                            Libros Asignados (Demo)
                        </h3>
                        <div className="space-y-4">
                            {recentBooks.map((book, index) => (
                                <div key={index} className="border-b border-gray-100 pb-4 last:border-0">
                                    <h4 className="text-[#0a1628] font-medium mb-3">{book.title}</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-[#6b8cba]">Completado</span>
                                            <span className="text-green-600 font-semibold">{book.completed}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-[#6b8cba]">En progreso</span>
                                            <span className="text-blue-600 font-semibold">{book.inProgress}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-[#6b8cba]">No iniciado</span>
                                            <span className="text-gray-600 font-semibold">{book.notStarted}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-playfair font-bold text-[#0a1628] mb-4">
                            Acciones Rápidas
                        </h3>
                        <div className="space-y-3">
                            <button className="w-full text-left px-4 py-3 bg-[#d4af37] text-[#0a1628] rounded-lg hover:bg-[#c19b2f] transition-colors font-semibold">
                                Asignar Nueva Lectura
                            </button>
                            <button className="w-full text-left px-4 py-3 bg-[#f5f5f5] text-[#0a1628] rounded-lg hover:bg-[#d4af37]/20 transition-colors">
                                Crear Evaluación
                            </button>
                            <button className="w-full text-left px-4 py-3 bg-[#f5f5f5] text-[#0a1628] rounded-lg hover:bg-[#d4af37]/20 transition-colors">
                                Generar Reporte
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}