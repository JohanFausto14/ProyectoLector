import axios from 'axios';

// Create Axios Instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api-proyectolector.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor: adjunta el access_token en cada petición ──
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Estado del interceptor de respuesta ──────────────────────────
let isRefreshing = false;
// Cola de peticiones que fallaron con 401 mientras se estaba haciendo refresh
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

/** Procesa la cola: resuelve o rechaza todas las peticiones en espera */
const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/** Limpia la sesión y redirige al login */
const forceLogout = async () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  sessionStorage.clear();
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

  try {
    const { toast } = await import('../utils/toast');
    toast.error('Tu sesión ha expirado. Por favor inicia sesión nuevamente.', 4000);
    setTimeout(() => {
      window.location.href = '/login';
    }, 1500);
  } catch {
    window.location.href = '/login';
  }
};

// ── Response Interceptor: maneja 401 con refresh automático ──────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Solo actuar si es 401 y no es ya el endpoint de refresh/login
    // (_retry evita bucles infinitos)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      typeof window !== 'undefined' &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      // Si ya hay un refresh en curso, encolar esta petición
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        // No hay refresh token → logout directo
        isRefreshing = false;
        processQueue(error, null);
        await forceLogout();
        return Promise.reject(error);
      }

      try {
        // Intentar renovar la sesión
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'https://api-proyectolector.onrender.com'}/auth/refresh`,
          { refresh_token: refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const { access_token, refresh_token: newRefreshToken } = response.data;

        // Actualizar tokens en localStorage (sin depender del contexto de React)
        localStorage.setItem('token', access_token);
        localStorage.setItem('refresh_token', newRefreshToken);

        // Actualizar el header por defecto para futuras peticiones
        api.defaults.headers.common.Authorization = `Bearer ${access_token}`;

        // Procesar la cola con el nuevo token
        processQueue(null, access_token);

        // Reintentar la petición original
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // El refresh también falló → logout
        processQueue(refreshError, null);
        await forceLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;