'use client';

import { useState } from 'react';

export default function EscuelaPage() {
    const [activeTab, setActiveTab] = useState('overview');

    const stats = [
        { label: 'Total Estudiantes', value: '450', change: '+12', color: 'bg-blue-500' },
        { label: 'Profesores Activos', value: '32', change: '+2', color: 'bg-green-500' },
        { label: 'Grupos', value: '18', change: '0', color: 'bg-purple-500' },
        { label: 'Promedio General', value: '8.7', change: '+0.3', color: 'bg-yellow-500' },
    ];

    const groups = [
        { name: '3°A', students: 28, teacher: 'Prof. García', avg: 8.9 },
        { name: '3°B', students: 25, teacher: 'Prof. Martínez', avg: 8.5 },
        { name: '2°A', students: 30, teacher: 'Prof. López', avg: 8.7 },
        { name: '2°B', students: 27, teacher: 'Prof. Hernández', avg: 8.3 },
        { name: '1°A', students: 32, teacher: 'Prof. Ramírez', avg: 8.6 },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f5f5f5] to-[#f5f8ff] p-4 md:p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-playfair font-bold text-[#0a1628] mb-2">
                    Portal de la Escuela
                </h1>
                <p className="text-[#1e3a6e] text-lg">
                    Preparatoria Central - Administración Institucional
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                                <span className="text-white text-2xl font-bold">
                                    {stat.value.charAt(0)}
                                </span>
                            </div>
                            {stat.change !== '0' && (
                                <span className="text-green-600 text-sm font-semibold bg-green-50 px-2 py-1 rounded">
                                    {stat.change}
                                </span>
                            )}
                        </div>
                        <h3 className="text-3xl font-bold text-[#0a1628] mb-1">{stat.value}</h3>
                        <p className="text-[#6b8cba] text-sm">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-t-xl shadow-lg">
                <div className="border-b border-gray-200 overflow-x-auto scrollbar-hide">
                    <nav className="flex space-x-6 md:space-x-8 px-4 md:px-6 min-w-max" aria-label="Tabs">
                        {['overview', 'groups', 'teachers', 'reports'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab
                                    ? 'border-[#d4af37] text-[#d4af37]'
                                    : 'border-transparent text-[#6b8cba] hover:text-[#1e3a6e] hover:border-gray-300'
                                    }`}
                            >
                                {tab === 'overview' && 'Resumen'}
                                {tab === 'groups' && 'Grupos'}
                                {tab === 'teachers' && 'Profesores'}
                                {tab === 'reports' && 'Reportes'}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Recent Activity */}
                            <div>
                                <h3 className="text-xl font-playfair font-bold text-[#0a1628] mb-4">
                                    Actividad Reciente
                                </h3>
                                <div className="space-y-4">
                                    {[
                                        { action: 'Nuevo estudiante registrado', time: 'Hace 10 min', type: 'success' },
                                        { action: 'Evaluación completada - Grupo 3°A', time: 'Hace 1 hora', type: 'info' },
                                        { action: 'Reporte mensual generado', time: 'Hace 3 horas', type: 'info' },
                                        { action: 'Prof. García actualizó calificaciones', time: 'Ayer', type: 'success' },
                                    ].map((activity, index) => (
                                        <div key={index} className="flex items-start gap-4 p-4 bg-[#f5f5f5] rounded-lg">
                                            <div className={`w-2 h-2 mt-2 rounded-full ${activity.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                                                }`}></div>
                                            <div className="flex-1">
                                                <p className="text-[#0a1628] font-medium">{activity.action}</p>
                                                <p className="text-[#6b8cba] text-sm">{activity.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Performance Chart */}
                            <div>
                                <h3 className="text-xl font-playfair font-bold text-[#0a1628] mb-4">
                                    Rendimiento por Área
                                </h3>
                                <div className="space-y-4">
                                    {[
                                        { subject: 'Comprensión Lectora', score: 89 },
                                        { subject: 'Análisis Crítico', score: 85 },
                                        { subject: 'Vocabulario', score: 92 },
                                        { subject: 'Síntesis', score: 78 },
                                    ].map((item, index) => (
                                        <div key={index}>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-[#0a1628] font-medium">{item.subject}</span>
                                                <span className="text-[#d4af37] font-bold">{item.score}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div
                                                    className="bg-gradient-to-r from-[#d4af37] to-[#f5f8ff] h-3 rounded-full transition-all duration-500"
                                                    style={{ width: `${item.score}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'groups' && (
                        <div>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                <h3 className="text-xl font-playfair font-bold text-[#0a1628]">
                                    Grupos Activos
                                </h3>
                                <button className="bg-[#d4af37] text-[#0a1628] w-full sm:w-auto px-4 py-2 rounded-lg font-semibold hover:bg-[#c19b2f] transition-colors">
                                    + Nuevo Grupo
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {groups.map((group, index) => (
                                    <div key={index} className="bg-[#f5f5f5] rounded-lg p-6 hover:shadow-lg transition-shadow">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-2xl font-bold text-[#0a1628]">{group.name}</h4>
                                            <div className="bg-[#d4af37] text-[#0a1628] rounded-full w-12 h-12 flex items-center justify-center font-bold">
                                                {group.avg}
                                            </div>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <p className="text-[#1e3a6e]">
                                                <span className="font-semibold">Estudiantes:</span> {group.students}
                                            </p>
                                            <p className="text-[#1e3a6e]">
                                                <span className="font-semibold">Profesor:</span> {group.teacher}
                                            </p>
                                        </div>
                                        <button className="mt-4 w-full bg-white text-[#0a1628] py-2 rounded-lg font-medium hover:bg-[#d4af37] transition-colors">
                                            Ver Detalles
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'teachers' && (
                        <div className="text-center py-12">
                            <p className="text-[#6b8cba]">Módulo de gestión de profesores en desarrollo</p>
                        </div>
                    )}

                    {activeTab === 'reports' && (
                        <div className="text-center py-12">
                            <p className="text-[#6b8cba]">Módulo de reportes en desarrollo</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}