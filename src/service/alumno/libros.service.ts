import api from '../../utils/api';
import {
    LibroAlumno,
    LibroAlumnoRaw,
    LibroDetalle,
    ProgresoPayload,
    ProgresoResponse,
    AnotacionPayload,
    AnotacionResponse,
    SesionPayload,
} from '../../types/alumno/libros';

// Normaliza la respuesta real del backend al modelo que usa el frontend
function mapLibroRaw(raw: LibroAlumnoRaw): LibroAlumno {
    return {
        libroId: Number(raw.id),
        titulo: raw.titulo,
        grado: raw.grado,
        materia: raw.materia?.nombre ?? '',
        escuelaId: 0, // No viene en la respuesta, se deja en 0
        asignadoDesde: raw.fechaAsignacion,
        progresoPorcentaje: raw.progreso ?? 0,
        ultimoSegmentoId: raw.ultimoSegmentoId ? Number(raw.ultimoSegmentoId) : undefined,
        ultimaLectura: raw.ultimaLectura ?? undefined,
        activo: true, // El libro está asignado al alumno, por eso aparece en la lista
        descripcion: raw.descripcion ?? undefined,
        autor: raw.autor,
        editorial: raw.editorial,
        numPaginas: raw.numPaginas ? Number(raw.numPaginas) : undefined,
        rutaPdf: raw.rutaPdf,
        estado: raw.estado,
    };
}

export class AlumnoLibrosService {
    /**
     * Listar libros asignados al alumno autenticado
     * GET /escuelas/mis-libros
     */
    static async getMisLibros(): Promise<LibroAlumno[]> {
        const response = await api.get('/escuelas/mis-libros');
        const raw: LibroAlumnoRaw[] = Array.isArray(response.data)
            ? response.data
            : response.data?.data ?? [];
        return raw.map(mapLibroRaw);
    }

    /**
     * Obtener metadatos de un libro (segmentos, descripción, etc.)
     * GET /libros/:id
     */
    static async getLibroDetalle(id: number): Promise<LibroDetalle> {
        const response = await api.get(`/libros/${id}`);
        const data = response.data?.data ?? response.data;

        // Normalización: El backend puede devolver materia como objeto o string
        if (data && typeof data.materia === 'object' && data.materia !== null) {
            data.materia = data.materia.nombre || '';
        }

        // Mapear unidades -> segmentos si existe la estructura anidada
        if (data && data.unidades && Array.isArray(data.unidades)) {
            const allSegments: any[] = [];
            data.unidades.forEach((unidad: any) => {
                if (unidad.segmentos && Array.isArray(unidad.segmentos)) {
                    unidad.segmentos.forEach((seg: any) => {
                        allSegments.push({
                            id: Number(seg.id),
                            titulo: seg.nombre || `Sección ${seg.orden}`, // Si no tiene nombre, usar orden
                            orden: Number(seg.orden),
                            contenido: seg.contenido || '',
                            contenidoHtml: seg.contenidoHtml || '',
                            numeroPagina: seg.numeroPagina ? Number(seg.numeroPagina) : null,
                            idExterno: seg.idExterno,
                            unidadId: Number(unidad.id),
                            unidadNombre: unidad.nombre,
                            glosario: Array.isArray(seg.glosario) ? seg.glosario : [],
                        });
                    });
                }
            });
            data.segmentos = allSegments;
        }

        return data;
    }

    /**
     * Actualizar progreso de lectura del alumno en un libro
     * PATCH /escuelas/mis-libros/:libroId/progreso
     */
    static async updateProgreso(
        libroId: number,
        payload: ProgresoPayload
    ): Promise<ProgresoResponse> {
        const response = await api.patch(
            `/escuelas/mis-libros/${libroId}/progreso`,
            payload
        );
        return response.data?.data ?? response.data;
    }

    /**
     * Define o busca una palabra en el glosario remoto.
     * POST /libros/glosario/palabra
     */
    static async registrarGlosario(palabra: string): Promise<{ palabra: string, definicion: string | null, origen: string }> {
        const response = await api.post(`/libros/glosario/palabra`, { palabra });
        return response.data?.data ?? response.data;
    }

    /**
     * Obtener todas las anotaciones del alumno para un libro
     * GET /escuelas/mis-libros/:libroId/anotaciones
     */
    static async getAnotaciones(libroId: number): Promise<AnotacionResponse[]> {
        const response = await api.get(`/escuelas/mis-libros/${libroId}/anotaciones`);
        return response.data?.data ?? response.data;
    }

    /**
     * Crear una nueva anotación
     * POST /escuelas/mis-libros/:libroId/anotaciones
     */
    static async crearAnotacion(libroId: number, payload: AnotacionPayload): Promise<AnotacionResponse> {
        const response = await api.post(`/escuelas/mis-libros/${libroId}/anotaciones`, payload);
        return response.data?.data ?? response.data;
    }

    /**
     * Eliminar una anotación
     * DELETE /escuelas/mis-libros/:libroId/anotaciones/:anotacionId
     */
    static async eliminarAnotacion(libroId: number, anotacionId: string | number): Promise<{ message: string }> {
        const response = await api.delete(`/escuelas/mis-libros/${libroId}/anotaciones/${anotacionId}`);
        return response.data;
    }

    /**
     * Registrar sesión de lectura
     * POST /escuelas/mis-libros/:libroId/sesiones
     */
    static async registrarSesion(libroId: number, payload: SesionPayload): Promise<any> {
        const response = await api.post(`/escuelas/mis-libros/${libroId}/sesiones`, payload);
        return response.data?.data ?? response.data;
    }
}