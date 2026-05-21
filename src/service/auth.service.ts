import api from '../utils/api';

/**
 * Solicita el envío de un correo de recuperación de contraseña.
 * La respuesta del back es siempre la misma exista o no el email (por seguridad).
 */
export async function forgotPassword(email: string): Promise<{ message: string }> {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
}

/**
 * Restablece la contraseña usando el token del enlace del correo.
 * @param token  - Viene del query param ?token= en la URL
 * @param nuevaPassword - Nueva contraseña elegida por el usuario
 */
export async function resetPassword(
  token: string,
  nuevaPassword: string
): Promise<{ message: string }> {
  const response = await api.post('/auth/reset-password', { token, nuevaPassword });
  return response.data;
}   