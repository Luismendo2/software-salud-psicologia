/* ==========================================================================
   AuthContext — Estado global de autenticación
   
   Provee a toda la app:
   - user: objeto del usuario logueado (o null)
   - isAuthenticated: booleano
   - isLoading: true mientras se verifica la sesión inicial
   - login(email, password): inicia sesión
   - logout(): cierra sesión
   - hasRole(role): verifica si el usuario tiene un rol específico
   
   En la fase de mocks el "token" se guarda en memoria.
   En producción el access_token vivirá en memoria y el refresh_token
   en una cookie httpOnly gestionada por el backend.
   ========================================================================== */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);

  // Al montar, intenta recuperar la sesión (simula refresh)
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      // En producción esto haría un /auth/refresh con la cookie
      // En mocks simplemente cargamos el usuario por defecto
      const savedUserId = sessionStorage.getItem('psiagenda_user_id');
      if (savedUserId) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        setAccessToken(`mock-restored-${Date.now()}`);
      }
    } catch {
      // Sesión no válida, el usuario debe iniciar sesión
      setUser(null);
      setAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async (email, password) => {
    const result = await authService.login(email, password);
    setUser(result.user);
    setAccessToken(result.accessToken);
    sessionStorage.setItem('psiagenda_user_id', result.user.id);
    return result;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setAccessToken(null);
      sessionStorage.removeItem('psiagenda_user_id');
    }
  }, []);

  const hasRole = useCallback((roles) => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  }, [user]);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    accessToken,
    login,
    logout,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}

export default AuthContext;
