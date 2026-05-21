import api from '../../utils/api';
import {
  DiagnosticoResponse,
  DiagnosticoResultado,
  EvaluacionData,
  EnviarRespuestasPayload,
  EvaluacionResultado,
  ReintentoData,
  EstadoAprendizaje,
  ApoioEvaluacion,
} from '../../types/alumno/evaluacion';

export class EvaluacionService {

  // ── Diagnóstico inicial ────────────────────────────────────────────────────

  /**
   * Verifica si el alumno necesita diagnóstico para este libro.
   * GET /evaluacion/diagnostico/:libroId
   */
  static async checkDiagnostico(libroId: number): Promise<DiagnosticoResponse> {
    const response = await api.get(`/evaluacion/diagnostico/${libroId}`);
    return response.data?.data ?? response.data;
  }

  /**
   * Envía las respuestas del diagnóstico inicial.
   * POST /evaluacion/diagnostico/:libroId
   */
  static async enviarDiagnostico(
    libroId: number,
    respuestas: Array<{ preguntaId: number; respuesta: string }>
  ): Promise<DiagnosticoResultado> {
    const response = await api.post(`/evaluacion/diagnostico/${libroId}`, { respuestas });
    return response.data?.data ?? response.data;
  }

  // ── Evaluación de segmento ─────────────────────────────────────────────────

  /**
   * Obtiene las preguntas de evaluación para un segmento.
   * GET /evaluacion/:libroId/segmento/:segmentoId
   */
  static async getEvaluacion(
    libroId: number,
    segmentoId: number
  ): Promise<EvaluacionData> {
    const response = await api.get(`/evaluacion/${libroId}/segmento/${segmentoId}`);
    return response.data?.data ?? response.data;
  }

  /**
   * Envía las respuestas del alumno para un segmento.
   * POST /evaluacion/:libroId/segmento/:segmentoId
   */
  static async enviarRespuestas(
    libroId: number,
    segmentoId: number,
    payload: EnviarRespuestasPayload
  ): Promise<EvaluacionResultado> {
    const response = await api.post(
      `/evaluacion/${libroId}/segmento/${segmentoId}`,
      payload
    );
    return response.data?.data ?? response.data;
  }

  /**
   * Obtiene preguntas para reintento (las mismas rutas GET sirven para reintento,
   * el back rota las preguntas automáticamente).
   * GET /evaluacion/:libroId/segmento/:segmentoId
   */
  static async solicitarReintento(
    libroId: number,
    segmentoId: number
  ): Promise<ReintentoData> {
    const response = await api.get(`/evaluacion/${libroId}/segmento/${segmentoId}`);
    return response.data?.data ?? response.data;
  }

  // ── Estado de aprendizaje ──────────────────────────────────────────────────

  /**
   * Consulta el perfil adaptativo y progreso del alumno en un libro.
   * GET /evaluacion/:libroId/estado
   */
  static async getEstado(libroId: number): Promise<EstadoAprendizaje> {
    const response = await api.get(`/evaluacion/${libroId}/estado`);
    return response.data?.data ?? response.data;
  }

  // ── Apoyos pedagógicos independiente ──────────────────────────────────────

  /**
   * Consulta los apoyos pedagógicos sin pasar por evaluación.
   * GET /evaluacion/:libroId/segmento/:segmentoId/apoyos
   */
  static async getApoyos(
    libroId: number,
    segmentoId: number
  ): Promise<ApoioEvaluacion[]> {
    const response = await api.get(
      `/evaluacion/${libroId}/segmento/${segmentoId}/apoyos`
    );
    const data = response.data?.data ?? response.data;
    return data?.apoyos ?? [];
  }
}