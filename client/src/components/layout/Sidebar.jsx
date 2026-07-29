/* ==========================================================================
   Sidebar — Navegación principal (desktop)
   
   Barra lateral fija de 260px que se muestra solo en pantallas >= 992px.
   Muestra los links de navegación filtrados por el rol del usuario,
   e incluye información del usuario y botón de cierre de sesión.
   ========================================================================== */

import { NavLink } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { ROLE_LABELS, ROLE_COLORS } from '../../mocks/authMock';

export default function Sidebar() {
  const { user, logout, hasRole } = useAuth();

  if (!user) return null; // No muestra el sidebar si no hay sesión

  const roleColor = ROLE_COLORS[user.role] || { color: 'var(--color-gray-600)' };

  return (
    <aside className="sidebar">
      {/* ── Marca ── */}
      <div className="sidebar-brand">
        <span>🧠</span>
        <h1>PsiAgenda</h1>
      </div>

      {/* ── Navegación principal ── */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-title">Principal</div>

        <NavLink to="/agenda" end className={({ isActive }) =>
          `sidebar-link ${isActive ? 'active' : ''}`
        }>
          <span className="sidebar-icon">📅</span>
          Agenda
        </NavLink>

        {hasRole(['ADMIN', 'PSYCHOLOGIST']) && (
          <NavLink to="/agenda/settings" className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''}`
          }>
            <span className="sidebar-icon">⚙️</span>
            Configuración de horarios
          </NavLink>
        )}

        {hasRole(['ADMIN', 'PSYCHOLOGIST']) && (
          <>
            <div className="sidebar-section-title">Clínica</div>
            <NavLink to="/historia-clinica" className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }>
              <span className="sidebar-icon">📋</span>
              Historia clínica
            </NavLink>
          </>
        )}

        <div className="sidebar-section-title">Administración</div>
        
        {hasRole(['ADMIN']) && (
          <NavLink to="/auditoria" className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''}`
          }>
            <span className="sidebar-icon">🛡️</span>
            Auditoría
          </NavLink>
        )}
        
        <NavLink to="/configuracion" className={({ isActive }) =>
          `sidebar-link ${isActive ? 'active' : ''}`
        }>
          <span className="sidebar-icon">🔒</span>
          Mi Cuenta
        </NavLink>
      </nav>

      {/* ── Footer del sidebar — perfil del usuario ── */}
      <div style={{
        padding: 'var(--space-md)',
        borderTop: '1px solid var(--color-gray-100)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-sm)'
      }}>
        <div style={{ fontSize: '0.8125rem' }}>
          <div style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--color-gray-800)' }}>
            {user.firstName} {user.lastName}
          </div>
          <div style={{ color: roleColor.color, fontWeight: 'var(--font-weight-medium)', fontSize: '0.6875rem', textTransform: 'uppercase' }}>
            {ROLE_LABELS[user.role] || user.role}
          </div>
        </div>
        
        <button 
          className="btn btn-outline-secondary" 
          style={{ width: '100%', fontSize: '0.75rem', padding: '0.375rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
          onClick={logout}
        >
          <span>🚪</span> Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
