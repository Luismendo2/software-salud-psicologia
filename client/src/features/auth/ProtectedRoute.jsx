/* ==========================================================================
   ProtectedRoute — Wrapper de rutas protegidas
   
   Verifica que el usuario esté autenticado y que tenga uno de los roles
   permitidos. Si no, redirige al login o a la página 403.
   
   Uso:
   <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'PSYCHOLOGIST']} />}>
     <Route path="agenda" element={<AgendaPage />} />
   </Route>
   ========================================================================== */

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const location = useLocation();

  // Mientras verifica la sesión, muestra un loader mínimo
  if (isLoading) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-loading-spinner" />
        <p>Verificando sesión...</p>
      </div>
    );
  }

  // No autenticado → login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Autenticado pero sin el rol necesario → 403
  if (allowedRoles && !hasRole(allowedRoles)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}
