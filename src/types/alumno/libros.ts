// Estructura real que devuelve GET /escuelas/mis-libros
export interface LibroAlumnoRaw {
    id: string;
    titulo: string;
    materiaId: string;
    codigo: string;
    grado: string;
    editorial: string | null;
    autor: string | null;
    descripcion: string | null;
    estado: string;
    activo: boolean;
    numPaginas: string;
    rutaPdf: string | null;
    mensajeError: string | null;
    jobId: string | null;
    materia: {
        id: string;
        nombre: string;
        descripcion: string;
        nivel: string;
    };
    alumnoLibroId: string;
    progreso: number;
    ultimoSegmentoId: string | null;
    ultimaLectura: string | null;
    fechaAsignacion: string;
}

// Modelo normalizado para usar en el frontend
export interface LibroAlumno {
    libroId: number;
    titulo: string;
    grado: string;
    materia: string;
    escuelaId: number;
    asignadoDesde: string;
    progresoPorcentaje: number;
    ultimoSegmentoId?: number;
    ultimaLectura?: string;
    activo: boolean;
    portadaUrl?: string;
    descripcion?: string;
    autor?: string | null;
    editorial?: string | null;
    numPaginas?: number;
    rutaPdf?: string | null;
    estado?: string;
}

export interface EntradaGlosario {
    palabra: string;
    definicion: string | null;
}

export interface Segmento {
    id: number;
    titulo: string;
    orden: number;
    contenido?: string;
    contenidoHtml?: string;
    numeroPagina?: number | null;
    idExterno?: string;
    unidadId?: number;
    unidadNombre?: string;
    glosario?: EntradaGlosario[];
}

export interface UnidadRaw {
    id: string;
    libroId: string;
    nombre: string;
    orden: string;
    segmentos: SegmentoRaw[];
}

export interface SegmentoRaw {
    id: string;
    libroId: string;
    unidadId: string;
    contenido: string;
    contenidoHtml?: string;
    numeroPagina: string | null;
    orden: string;
    idExterno: string;
    nombre?: string; // Algunos endpoints podrían devolverlo como nombre o el frontend lo mapea así
    glosario?: EntradaGlosario[];
}

export interface LibroDetalle {
    id: number;
    titulo: string;
    descripcion?: string;
    grado: string;
    materia: string;
    segmentos: Segmento[];
    unidades?: UnidadRaw[];
    activo: boolean;
    progresoPorcentaje: number;
    ultimoSegmentoId?: number;
    ultimaLectura?: string;
    portadaUrl?: string;
    rutaPdf?: string | null;
    numPaginas?: number;
}

export interface ProgresoPayload {
    porcentaje: number;
    ultimoSegmentoId?: number;
}

export interface ProgresoResponse {
    libroId: number;
    porcentaje: number;
    ultimoSegmentoId?: number;
    ultimaLectura: string;
}

export interface AnotacionPayload {
    segmentoId: number;
    tipo: 'highlight' | 'comentario';
    textoSeleccionado: string;
    offsetInicio: number;
    offsetFin: number;
    color: 'amarillo' | 'verde' | 'rosa' | 'azul' | null;
    comentario: string | null;
}

export interface AnotacionResponse extends AnotacionPayload {
    id: number | string;
    alumnoId: number | string;
    libroId: number;
    creadoEn: string;
}

export interface SesionPayload {
    duracionSegundos: number;
    segmentosLeidos: number;
    segmentoInicioId: number;
    segmentoFinId: number;
    fechaInicio: string;
    fechaFin: string;
}