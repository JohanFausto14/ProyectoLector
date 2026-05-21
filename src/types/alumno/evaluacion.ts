export type NivelPregunta = 'basico' | 'intermedio' | 'avanzado';

export type EstadoEvaluacion =
  | 'sin_evaluacion'     // inicial, aún no se intentó cargar
  | 'sin_preguntas'      // backend no tiene preguntas → puede avanzar libremente
  | 'cargando'           // cargando preguntas del backend
  | 'pendiente'          // preguntas listas, esperando respuesta del alumno
  | 'enviando'           // enviando respuestas
  | 'aprobado'           // score >= 70, puede avanzar
  | 'refuerzo'           // score < 70, puede reintentar
  | 'intentos_agotados'; // 3 intentos usados, puede avanzar de todas formas

// ── Diagnóstico ──────────────────────────────────────────────────────────────

export interface PreguntaDiagnostico {
  preguntaId: number;
  texto: string;
  opcionA: string;
  opcionB: string;
  opcionC: string;
  opcionD: string;
}

export interface DiagnosticoCheckResponse {
  necesitaDiagnostico: false;
}

export interface DiagnosticoNecesarioResponse {
  necesitaDiagnostico: true;
  preguntas: PreguntaDiagnostico[];
}

export type DiagnosticoResponse = DiagnosticoCheckResponse | DiagnosticoNecesarioResponse;

export interface DiagnosticoResultado {
  score: number;
  nivelAsignado: NivelPregunta;
  tiempoMinimo: number;
}

// ── Evaluación de segmento ───────────────────────────────────────────────────

export interface PreguntaEvaluacion {
  preguntaId: number;     // ahora es number, no string
  texto: string;
  opcionA: string;
  opcionB: string;
  opcionC: string;
  opcionD: string;
}

export interface EvaluacionData {
  segmentoId: number;
  nivel: NivelPregunta;
  preguntas: PreguntaEvaluacion[];
  umbralAprobacion: number;
  intentosRestantes: number;
  tiempoMinimoSegundos: number;
}

// ── Respuestas ───────────────────────────────────────────────────────────────

export type LetraRespuesta = 'A' | 'B' | 'C' | 'D';

export interface RespuestaItem {
  preguntaId: number;
  respuesta: LetraRespuesta;
  tiempoMs?: number;      // opcional, para telemetría
}

export interface EnviarRespuestasPayload {
  respuestas: RespuestaItem[];
}

// ── Apoyos pedagógicos ───────────────────────────────────────────────────────

export interface PalabraGlosario {
  palabra: string;
  definicion: string;
}

export interface ApoioEvaluacion {
  tipo: 'pista' | 'glosario' | 'resumen';
  contenido?: string;
  palabras?: PalabraGlosario[];   // solo cuando tipo === 'glosario'
}

// ── Resultado de evaluación ──────────────────────────────────────────────────

export interface EvaluacionResultado {
  score: number;
  aprobado: boolean;
  puedeAvanzar: boolean;
  siguienteAccion: 'continuar' | 'refuerzo';
  apoyos: ApoioEvaluacion[];
  tiposError: Record<string, number>;
}

// ── Reintento ────────────────────────────────────────────────────────────────

export interface ReintentoData {
  segmentoId: number;
  nivel: NivelPregunta;
  preguntas: PreguntaEvaluacion[];
  umbralAprobacion: number;
  intentosRestantes: number;
  tiempoMinimoSegundos: number;
}

// ── Estado de aprendizaje ────────────────────────────────────────────────────

export interface PerfilAdaptativo {
  nivelActual: NivelPregunta;
  tiempoMinimoActual: number;
  rachaPosiva: number;
  rachaNegativa: number;
  diagnosticoCompletado: boolean;
}

export interface EstadoAprendizaje {
  perfil: PerfilAdaptativo;
  progreso: {
    porcentaje: number;
    ultimaLectura: string;
  };
}