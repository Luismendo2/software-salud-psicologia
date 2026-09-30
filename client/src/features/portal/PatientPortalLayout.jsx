/* ==========================================================================
   PatientPortalLayout — Layout del portal del paciente
   
   Layout separado del panel del psicólogo.
   Barra inferior (bottom nav) con 5 opciones principales:
   Inicio, Citas, Evaluaciones, Mensajes y Tareas.
   Menú hamburguesa en el header para opciones secundarias (Documentos,
   Pagos, Configuración, Perfil y Cerrar sesión).
   Botón de ayuda en crisis rediseñado y optimizado.
   ========================================================================== */

import { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import CrisisModal from './CrisisModal';

export default function PatientPortalLayout() {
  const { user, logout } = useAuth();
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Bloquear el scroll de fondo mientras el menú drawer esté abierto
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

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
          {user && (
            <span className="portal-brand-badge" title={`${user.firstName} ${user.lastName}`}>
              {user.firstName}
            </span>
          )}
        </div>

        <div className="portal-header-actions">
          {/* Botón de Emergencia / Ayuda en Crisis estilizado */}
          <button
            type="button"
            className="portal-crisis-btn"
            onClick={() => setShowCrisisModal(true)}
            title="Centro de asistencia inmediata y líneas de ayuda"
            aria-label="Necesito ayuda ahora"
          >
            <span className="portal-crisis-btn-icon">🚨</span>
            <span className="portal-crisis-btn-text">
              <span className="text-full">Necesito ayuda ahora</span>
              <span className="text-short">Ayuda SOS</span>
            </span>
          </button>

          {/* Botón Menú Hamburguesa para opciones secundarias */}
          <button
            type="button"
            className={`portal-menu-toggle ${menuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú de opciones'}
            title="Menú"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      {/* ── Modal de Crisis ── */}
      <CrisisModal
        isOpen={showCrisisModal}
        onClose={() => setShowCrisisModal(false)}
        user={user}
      />

      {/* ── Drawer lateral de opciones secundarias (Menú Hamburguesa) ── */}
      {menuOpen && (
        <div className="portal-drawer-overlay" onClick={toggleMenu}>
          <div className="portal-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="portal-drawer-header">
              <div className="portal-drawer-user">
                <div className="portal-drawer-avatar">
                  {user?.firstName?.[0] || 'P'}
                </div>
                <div className="portal-drawer-info">
                  <div className="portal-drawer-name">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="portal-drawer-role">Paciente • Espacio de bienestar</div>
                </div>
              </div>
              <button
                type="button"
                className="portal-drawer-close"
                onClick={toggleMenu}
                aria-label="Cerrar menú"
              >
                ✕
              </button>
            </div>

            <div className="portal-drawer-body">
              <div className="portal-drawer-section-title">Servicios y Documentos</div>

              <NavLink
                to="/portal/documentos"
                className={({ isActive }) => `portal-drawer-link ${isActive ? 'active' : ''}`}
                onClick={toggleMenu}
              >
                <span className="portal-drawer-icon">📋</span>
                <div className="portal-drawer-link-content">
                  <span className="portal-drawer-link-title">Documentos y Consentimientos</span>
                  <span className="portal-drawer-link-desc">Firmas digitales y formatos</span>
                </div>
              </NavLink>

              <NavLink
                to="/portal/pagos"
                className={({ isActive }) => `portal-drawer-link ${isActive ? 'active' : ''}`}
                onClick={toggleMenu}
              >
                <span className="portal-drawer-icon">💳</span>
                <div className="portal-drawer-link-content">
                  <span className="portal-drawer-link-title">Facturación y Pagos</span>
                  <span className="portal-drawer-link-desc">Comprobantes y pagos en línea</span>
                </div>
              </NavLink>

              <div className="portal-drawer-section-title">Preferencias</div>

              <NavLink
                to="/portal/configuracion"
                className={({ isActive }) => `portal-drawer-link ${isActive ? 'active' : ''}`}
                onClick={toggleMenu}
              >
                <span className="portal-drawer-icon">⚙️</span>
                <div className="portal-drawer-link-content">
                  <span className="portal-drawer-link-title">Mi Cuenta y Seguridad</span>
                  <span className="portal-drawer-link-desc">Datos de contacto y acceso</span>
                </div>
              </NavLink>

              <div className="portal-drawer-divider" />

              {/* Acceso a Asistencia de Crisis dentro del Menú */}
              <button
                type="button"
                className="portal-drawer-crisis-card"
                onClick={() => {
                  toggleMenu();
                  setShowCrisisModal(true);
                }}
              >
                <span className="crisis-card-icon">🚨</span>
                <div className="crisis-card-info">
                  <span className="crisis-card-title">¿Necesitas ayuda urgente?</span>
                  <span className="crisis-card-desc">Líneas de crisis 106, 192 y soporte</span>
                </div>
                <span className="crisis-card-arrow">→</span>
              </button>
            </div>

            <div className="portal-drawer-footer">
              <button
                type="button"
                className="portal-drawer-logout-btn"
                onClick={() => {
                  toggleMenu();
                  handleLogout();
                }}
              >
                <span>🚪</span> Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Contenido principal ── */}
      <main className="portal-main">
        <Outlet />
      </main>

      {/* ── Barra de navegación inferior: Exactamente 5 opciones principales ── */}
      <nav className="portal-bottom-nav" aria-label="Navegación principal del paciente">
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
      </nav>
    </div>
  );
}
