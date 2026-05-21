'use client';

import React, { useState } from 'react';
import { AlumnoEscuela, getNombreCompletoAlumno, formatGrupo } from '../../../types/escuela/alumnos/alumno.types';
import { GrupoListItem } from '../../../types/escuela/grupos/grupo';

interface AlumnoDetalleRowProps {
    alumno: AlumnoEscuela;
    grupos: GrupoListItem[];
    onEdit: (alumno: AlumnoEscuela) => void;
    onDelete: (alumno: AlumnoEscuela) => void;
}

export const AlumnoDetalleRow: React.FC<AlumnoDetalleRowProps> = ({
    alumno,
    grupos,
    onEdit,
    onDelete
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Resolución dinámica del grupo
    const resolvedGrupo = alumno.grupoId ? grupos.find(g => g.id === alumno.grupoId) : null;
    const currentGrado = resolvedGrupo ? resolvedGrupo.grado : alumno.grado;
    const currentGrupoName = resolvedGrupo ? resolvedGrupo.nombre : alumno.grupo;

    const nombreCompleto = getNombreCompletoAlumno(alumno);
    const grupoDisplay = formatGrupo(currentGrado, currentGrupoName);

    return (
        <>
            {/* Fila principal */}
            <tr className={`block md:table-row bg-white md:bg-transparent mb-4 md:mb-0 rounded-xl md:rounded-none shadow-sm md:shadow-none border border-[#c8d8f0] md:border-0 hover:bg-[#f5f8ff] transition-colors duration-200 ${isExpanded ? 'bg-[#f5f8ff] md:bg-[#f5f8ff]' : ''}`}>

                {/* Alumno */}
                <td className="block md:table-cell px-4 md:px-6 py-3 md:py-4 border-b border-[#c8d8f0]/30 md:border-0 relative">
                    <span className="md:hidden text-[10px] font-bold uppercase text-[#6b8cba] mb-2 block">Alumno</span>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                            {alumno.persona.nombre.charAt(0)}
                        </div>
                        <div>
                            <div className="font-playfair font-bold text-[#0a1628]">{nombreCompleto}</div>
                            <div className="text-sm text-[#1e3a6e]">{alumno.persona.correo}</div>
                        </div>
                    </div>
                </td>

                {/* Grupo */}
                <td className="block md:table-cell px-4 md:px-6 py-3 md:py-4 border-b border-[#c8d8f0]/30 md:border-0 md:text-center">
                    <span className="md:hidden text-[10px] font-bold uppercase text-[#6b8cba] mb-2 block">Grupo</span>
                    <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 inline-block whitespace-nowrap">
                        📚 {grupoDisplay}
                    </span>
                </td>

                {/* Contacto */}
                <td className="block md:table-cell px-4 md:px-6 py-3 md:py-4 border-b border-[#c8d8f0]/30 md:border-0 md:text-center">
                    <span className="md:hidden text-[10px] font-bold uppercase text-[#6b8cba] mb-2 block">Contacto</span>
                    <div className="text-sm text-[#1e3a6e] flex items-center md:justify-center gap-1">
                        {alumno.persona.telefono ? (
                            <><span className="text-[#d4af37]">📞</span> {alumno.persona.telefono}</>
                        ) : (
                            <span className="text-[#6b8cba] italic">Sin teléfono</span>
                        )}
                    </div>
                </td>

                {/* Tutor */}
                <td className="block md:table-cell px-4 md:px-6 py-3 md:py-4 border-b border-[#c8d8f0]/30 md:border-0 md:text-center">
                    <span className="md:hidden text-[10px] font-bold uppercase text-[#6b8cba] mb-2 block">Tutor</span>
                    {alumno.padre ? (
                        <div className="text-sm">
                            <div className="font-bold text-[#0a1628]">
                                {alumno.padre.persona.nombre} {alumno.padre.persona.apellidoPaterno}
                                {alumno.padre.persona.apellidoMaterno ? ` ${alumno.padre.persona.apellidoMaterno}` : ''}
                            </div>
                            <div className="text-xs text-[#1e3a6e] capitalize">{alumno.padre.parentesco}</div>
                        </div>
                    ) : (
                        <span className="text-sm text-[#6b8cba]">Sin tutor asignado</span>
                    )}
                </td>

                {/* Ciclo Escolar */}
                <td className="block md:table-cell px-4 md:px-6 py-3 md:py-4 border-b border-[#c8d8f0]/30 md:border-0 md:text-center">
                    <span className="md:hidden text-[10px] font-bold uppercase text-[#6b8cba] mb-2 block">Ciclo Escolar</span>
                    <span className="text-sm text-[#1e3a6e]">
                        {alumno.cicloEscolar || <span className="text-[#6b8cba] italic">N/A</span>}
                    </span>
                </td>

                {/* Acciones */}
                <td className="block md:table-cell px-4 md:px-6 py-3 md:py-4 flex md:table-cell justify-between items-center bg-[#f5f8ff]/50 md:bg-transparent rounded-b-xl md:rounded-none">
                    <span className="md:hidden text-[10px] font-bold uppercase text-[#6b8cba]">Acciones</span>
                    <div className="flex items-center gap-2 md:justify-center">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className={`p-2 rounded-lg transition-all duration-200 ${isExpanded ? 'bg-[#d4af37] text-white' : 'hover:bg-[#d4af37]/10 text-[#1e3a6e]'}`}
                            title={isExpanded ? 'Contraer' : 'Expandir detalles'}
                        >
                            <svg className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        <button
                            onClick={() => onEdit(alumno)}
                            className="p-2 hover:bg-blue-50 rounded-lg text-[#1e3a6e] hover:text-blue-600 transition-colors"
                            title="Editar alumno"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>

                        <button
                            onClick={() => onDelete(alumno)}
                            className="p-2 hover:bg-red-50 rounded-lg text-[#1e3a6e] hover:text-red-600 transition-colors"
                            title="Eliminar alumno"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>

            {/* Fila expandible */}
            {isExpanded && (
                <tr className="block md:table-row bg-[#f5f8ff]/30 rounded-b-xl md:rounded-none">
                    <td colSpan={6} className="block md:table-cell px-4 md:px-8 py-4 md:py-6">
                        <div className="bg-white rounded-xl border border-[#c8d8f0] shadow-sm overflow-hidden">
                            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#c8d8f0]">

                                {/* Datos Personales */}
                                <div className="p-5">
                                    <h4 className="text-[#d4af37] font-bold text-xs uppercase tracking-wider mb-4">👤 Datos Personales</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-[10px] text-[#1e3a6e] font-bold uppercase">Nombre(s)</p>
                                            <p className="text-sm text-[#0a1628]">{alumno.persona.nombre}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <p className="text-[10px] text-[#1e3a6e] font-bold uppercase">A. Paterno</p>
                                                <p className="text-sm text-[#0a1628]">{alumno.persona.apellidoPaterno || '—'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-[#1e3a6e] font-bold uppercase">A. Materno</p>
                                                <p className="text-sm text-[#0a1628]">{alumno.persona.apellidoMaterno || '—'}</p>
                                            </div>
                                        </div>
                                        {alumno.persona.fechaNacimiento && (
                                            <div>
                                                <p className="text-[10px] text-[#1e3a6e] font-bold uppercase">Fecha de Nacimiento</p>
                                                <p className="text-sm text-[#0a1628]">
                                                    {new Date(alumno.persona.fechaNacimiento).toLocaleDateString('es-MX')}
                                                </p>
                                            </div>
                                        )}
                                        {alumno.persona.genero && (
                                            <div>
                                                <p className="text-[10px] text-[#1e3a6e] font-bold uppercase">Género</p>
                                                <p className="text-sm text-[#0a1628] capitalize">{alumno.persona.genero}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Información Académica */}
                                <div className="p-5 bg-[#f5f8ff]/20">
                                    <h4 className="text-[#d4af37] font-bold text-xs uppercase tracking-wider mb-4">📚 Información Académica</h4>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <p className="text-[10px] text-[#1e3a6e] font-bold uppercase">Grado</p>
                                                <p className="text-sm text-[#0a1628]">{currentGrado ? `${currentGrado}°` : '—'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-[#1e3a6e] font-bold uppercase">Grupo</p>
                                                <p className="text-sm text-[#0a1628]">{currentGrupoName || '—'}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-[#1e3a6e] font-bold uppercase">Ciclo Escolar</p>
                                            <p className="text-sm text-[#0a1628]">{alumno.cicloEscolar || '—'}</p>
                                        </div>
                                        <div className="flex justify-between">
                                            <div>
                                                <p className="text-[10px] text-[#1e3a6e] font-bold uppercase">ID Alumno</p>
                                                <p className="text-sm text-[#0a1628]">#{alumno.id}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-[#1e3a6e] font-bold uppercase">ID Persona</p>
                                                <p className="text-sm text-[#0a1628]">#{alumno.personaId}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tutor */}
                                <div className="p-5">
                                    <h4 className="text-[#d4af37] font-bold text-xs uppercase tracking-wider mb-4">👨‍👩‍👧 Tutor / Padre de Familia</h4>
                                    {alumno.padre ? (
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-[10px] text-[#1e3a6e] font-bold uppercase">Nombre Completo</p>
                                                <p className="text-sm text-[#0a1628]">
                                                    {alumno.padre.persona.nombre} {alumno.padre.persona.apellidoPaterno}
                                                    {alumno.padre.persona.apellidoMaterno ? ` ${alumno.padre.persona.apellidoMaterno}` : ''}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-[#1e3a6e] font-bold uppercase">Parentesco</p>
                                                <p className="text-sm text-[#0a1628] capitalize">{alumno.padre.parentesco}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-[#1e3a6e] font-bold uppercase">Correo</p>
                                                <p className="text-sm text-[#0a1628] break-all">{alumno.padre.persona.correo}</p>
                                            </div>
                                            {alumno.padre.persona.telefono && (
                                                <div>
                                                    <p className="text-[10px] text-[#1e3a6e] font-bold uppercase">Teléfono</p>
                                                    <p className="text-sm text-[#0a1628]">{alumno.padre.persona.telefono}</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-[#6b8cba] italic">No hay un tutor asignado a este alumno.</p>
                                    )}
                                </div>

                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};