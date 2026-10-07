/* ==========================================================================
   ForbiddenPage — Página 403 de acceso denegado
   
   Se muestra cuando un usuario autenticado intenta acceder a una
   ruta para la cual no tiene el rol necesario.
   ========================================================================== */

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function ForbiddenPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSwitchAccount = async () => {
    await logout();
    navigate('/login');
  };

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
              <p>Si deseas ingresar al Portal del Paciente, inicia sesión con una cuenta de paciente.</p>
            </div>
          )}
          <div className="auth-forbidden-actions">
            <Link to={user?.role === 'PATIENT' ? '/portal' : '/agenda'} className="btn btn-primary">
              Ir al inicio
            </Link>
            <button
              type="button"
              onClick={handleSwitchAccount}
              className="btn btn-outline-secondary"
            >
              Cambiar de cuenta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
