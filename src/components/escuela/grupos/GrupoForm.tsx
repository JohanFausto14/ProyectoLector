"use client";

import { useState } from "react";
import { Input } from "../../ui/Input";
import { Button } from "../../ui/Button";
import { sanitizeText, focusFirstError } from "../../../utils/formValidation";

export default function GrupoForm({
  onCancel,
  onSave,
  initialData,
}: {
  onCancel: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}) {
  const [form, setForm] = useState(
    initialData || {
      nombre: "",
      grado: "",
      profesor: "",
      totalAlumnos: "",
      promedioGeneral: "",
      librosAsignados: "",
      horario: "",
      aula: "",
    }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const sNombre = sanitizeText(form.nombre);
    const sProfesor = sanitizeText(form.profesor);
    const sAula = sanitizeText(form.aula);
    const sHorario = sanitizeText(form.horario);

    if (!sNombre) newErrors.nombre = "El nombre del grupo es requerido";
    if (!form.grado) newErrors.grado = "Selecciona un grado";
    if (!sProfesor) newErrors.profesor = "El profesor es requerido";
    if (!sAula) newErrors.aula = "El aula es requerida";
    if (!sHorario) newErrors.horario = "El horario es requerido";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      focusFirstError(newErrors);
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setTimeout(() => {
      onSave({
        ...form,
        nombre: sanitizeText(form.nombre),
        profesor: sanitizeText(form.profesor),
        aula: sanitizeText(form.aula),
        horario: sanitizeText(form.horario)
      });
      setIsLoading(false);
      onCancel();
    }, 1200);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información del Grupo */}
      <div>
        <h3 className="text-lg font-playfair font-bold text-[#0a1628] mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-gradient-to-b from-[#d4af37] to-[#c19a2e] rounded-full"></div>
          Información del Grupo
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nombre */}
          <Input
            label="Nombre del Grupo"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Ej: 3-A"
            error={errors.nombre}
            required
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
          />

          <Input
            label="Grado"
            name="grado"
            type="number"
            value={form.grado}
            onChange={handleChange}
            placeholder="Ej: 1"
            error={errors.grado}
            required
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            }
          />

          {/* Profesor */}
          <Input
            label="Profesor Titular"
            name="profesor"
            value={form.profesor}
            onChange={handleChange}
            placeholder="Ej: Dr. Carlos Méndez"
            error={errors.profesor}
            required
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />

          {/* Aula */}
          <Input
            label="Aula"
            name="aula"
            value={form.aula}
            onChange={handleChange}
            placeholder="Ej: Aula 301"
            error={errors.aula}
            required
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
          />
        </div>
      </div>

      {/* Información Académica */}
      <div>
        <h3 className="text-lg font-playfair font-bold text-[#0a1628] mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-gradient-to-b from-[#d4af37] to-[#c19a2e] rounded-full"></div>
          Información Académica
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Horario */}
          <Input
            label="Horario"
            name="horario"
            value={form.horario}
            onChange={handleChange}
            placeholder="Ej: 7:00 AM - 1:00 PM"
            error={errors.horario}
            required
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />

          {/* Total Alumnos */}
          <Input
            label="Total de Alumnos"
            name="totalAlumnos"
            type="number"
            value={form.totalAlumnos}
            onChange={handleChange}
            placeholder="Ej: 35"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
          />

          {/* Promedio General */}
          <Input
            label="Promedio General"
            name="promedioGeneral"
            type="number"
            value={form.promedioGeneral}
            onChange={handleChange}
            placeholder="Ej: 78.5"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />

          {/* Libros Asignados */}
          <Input
            label="Libros Asignados"
            name="librosAsignados"
            type="number"
            value={form.librosAsignados}
            onChange={handleChange}
            placeholder="Ej: 12"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t border-[#c8d8f0]">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
          icon={
            isLoading ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            )
          }
        >
          {isLoading ? "Guardando..." : initialData ? "Actualizar Grupo" : "Guardar Grupo"}
        </Button>
      </div>
    </form>
  );
}