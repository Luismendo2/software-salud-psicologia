/* ==========================================================================
   ForbiddenPage — Página 403 de acceso denegado
   
   Se muestra cuando un usuario autenticado intenta acceder a una
   ruta para la cual no tiene el rol necesario.
   ========================================================================== */

import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function ForbiddenPage() {
  const { user } = useAuth();

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-forbidden-content">
          <div className="auth-forbidden-icon">🚫</div>
          <h1>Acceso denegado</h1>
          <p>No tienes permisos para acceder a esta página.</p>
          {user && (
            <div className="auth-forbidden-info">
              <p>
                Has iniciado sesión como <strong>{user.firstName} {user.lastName}</strong>
                {' '}con el rol de <strong>{user.role}</strong>.
              </p>
              <p>Si crees que esto es un error, contacta al administrador del sistema.</p>
            </div>
          )}
          <div className="auth-forbidden-actions">
            <Link to="/agenda" className="btn btn-primary">
              Ir al inicio
            </Link>
            <Link to="/login" className="btn btn-outline-secondary">
              Cambiar de cuenta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
