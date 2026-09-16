/* ==========================================================================
   PatientPortalLayout — Layout del portal del paciente
   
   Layout completamente separado del AppLayout del psicólogo.
   En móvil muestra una barra de navegación inferior (bottom tab bar)
   estilo app nativa, que es más intuitiva para pacientes.
   En desktop usa una barra lateral compacta.
   ========================================================================== */

import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import CrisisModal from './CrisisModal';

export default function PatientPortalLayout() {
  const { user, logout } = useAuth();
  const [showCrisisModal, setShowCrisisModal] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="portal-shell">
      {/* ── Header superior (desktop + móvil) ── */}
      <header className="portal-header">
        <div className="portal-header-brand">
          <span className="portal-brand-icon">🧠</span>
          <span className="portal-brand-text">PsiAgenda</span>
          {user && <span className="portal-brand-badge">{user.firstName} {user.lastName}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            className="crisis-header-btn"
            onClick={() => setShowCrisisModal(true)}
            title="Centro de ayuda y soporte en crisis"
            aria-label="Necesito ayuda ahora"
          >
            <span>🚨</span>
            <span>Necesito ayuda ahora</span>
          </button>
          <button
            className="portal-logout-btn"
            onClick={handleLogout}
            title="Cerrar sesión"
          >
            Salir
          </button>
        </div>
      </header>

      <CrisisModal
        isOpen={showCrisisModal}
        onClose={() => setShowCrisisModal(false)}
        user={user}
      />

      {/* ── Contenido principal ── */}
      <main className="portal-main">
        <Outlet />
      </main>

      {/* ── Barra de navegación inferior (visible en móvil y desktop) ── */}
      <nav className="portal-bottom-nav" aria-label="Navegación del portal">
        <NavLink
          to="/portal"
          end
          className={({ isActive }) => `portal-tab ${isActive ? 'active' : ''}`}
        >
          <span className="portal-tab-icon">🏠</span>
          <span className="portal-tab-label">Inicio</span>
        </NavLink>

        <NavLink
          to="/portal/citas"
          className={({ isActive }) => `portal-tab ${isActive ? 'active' : ''}`}
        >
          <span className="portal-tab-icon">📅</span>
          <span className="portal-tab-label">Citas</span>
        </NavLink>

        <NavLink
          to="/portal/documentos"
          className={({ isActive }) => `portal-tab ${isActive ? 'active' : ''}`}
        >
          <span className="portal-tab-icon">📋</span>
          <span className="portal-tab-label">Documentos</span>
        </NavLink>

        <NavLink
          to="/portal/evaluaciones"
          className={({ isActive }) => `portal-tab ${isActive ? 'active' : ''}`}
        >
          <span className="portal-tab-icon">📊</span>
          <span className="portal-tab-label">Evaluaciones</span>
        </NavLink>

        <NavLink
          to="/portal/mensajes"
          className={({ isActive }) => `portal-tab ${isActive ? 'active' : ''}`}
        >
          <span className="portal-tab-icon">💬</span>
          <span className="portal-tab-label">Mensajes</span>
        </NavLink>

        <NavLink
          to="/portal/tareas"
          className={({ isActive }) => `portal-tab ${isActive ? 'active' : ''}`}
        >
          <span className="portal-tab-icon">📝</span>
          <span className="portal-tab-label">Tareas</span>
        </NavLink>

        <NavLink
          to="/portal/pagos"
          className={({ isActive }) => `portal-tab ${isActive ? 'active' : ''}`}
        >
          <span className="portal-tab-icon">💳</span>
          <span className="portal-tab-label">Pagos</span>
        </NavLink>

        <NavLink
          to="/portal/configuracion"
          className={({ isActive }) => `portal-tab ${isActive ? 'active' : ''}`}
        >
          <span className="portal-tab-icon">⚙️</span>
          <span className="portal-tab-label">Configuración</span>
        </NavLink>
      </nav>
    </div>
  );
}
