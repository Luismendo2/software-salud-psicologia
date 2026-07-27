/* ==========================================================================
   api.js — Instancia base de Axios
   
   Configura la URL base y los interceptores para toda la app.
   Por ahora apunta a localhost:3000 (backend aún no existe).
   
   Regla del proyecto (agents.md): "No hacer llamadas fetch directamente
   desde los componentes de React; pasar siempre por los módulos
   dentro de client/src/services/."
   
   Todos los demás servicios importan esta instancia.
   ========================================================================== */

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  /**
   * withCredentials: true permite que el navegador envíe cookies
   * httpOnly con el JWT (definido en Feature 004 - Seguridad).
   */
  withCredentials: true,
});

/*
 * Interceptor de respuesta (preparado para Feature 004):
 * - Si el servidor responde 401, intentar refrescar el token.
 * - Si el refresh falla, redirigir al login.
 * 
 * Por ahora solo logueamos errores para desarrollo.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // En producción esto se reemplazará con lógica de refresh token
    console.error('[API Error]', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default api;
