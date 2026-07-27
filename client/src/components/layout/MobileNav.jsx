/* ==========================================================================
   MobileNav — Navbar superior para pantallas < 992px
   
   Muestra el logotipo y un botón hamburguesa que abre un Offcanvas
   de Bootstrap con los mismos links del Sidebar. Solo es visible en móvil.
   ========================================================================== */

import { NavLink } from 'react-router-dom';
import { useRef } from 'react';

export default function MobileNav() {
  const offcanvasRef = useRef(null);

  /**
   * Cierra el offcanvas al hacer clic en un link.
   * Usamos la API nativa de Bootstrap en lugar de useState
   * porque Bootstrap ya maneja su propio estado internamente.
   */
  const handleLinkClick = () => {
    const bsOffcanvas = window.bootstrap?.Offcanvas?.getInstance(offcanvasRef.current);
    if (bsOffcanvas) bsOffcanvas.hide();
  };

  return (
    <>
      {/* ── Barra superior fija ── */}
      <nav className="mobile-navbar">
        <button
          className="btn btn-link p-0"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#mobileMenu"
          aria-label="Abrir menú de navegación"
          style={{ fontSize: '1.25rem', textDecoration: 'none' }}
        >
          ☰
        </button>

        <span className="mobile-navbar-brand">
          <span>🧠</span> PsiAgenda
        </span>

        {/* Espacio reservado para notificaciones o avatar */}
        <div style={{ width: '2rem' }} />
      </nav>

      {/* ── Offcanvas con la navegación ── */}
      <div
        ref={offcanvasRef}
        className="offcanvas offcanvas-start"
        tabIndex="-1"
        id="mobileMenu"
        aria-labelledby="mobileMenuLabel"
        style={{ width: 'var(--sidebar-width)' }}
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="mobileMenuLabel"
            style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary-600)' }}>
            🧠 PsiAgenda
          </h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Cerrar" />
        </div>

        <div className="offcanvas-body p-0">
          <nav className="sidebar-nav">
            <div className="sidebar-section-title">Principal</div>

            <NavLink to="/agenda" onClick={handleLinkClick}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <span className="sidebar-icon">📅</span>
              Agenda
            </NavLink>

            <NavLink to="/agenda/settings" onClick={handleLinkClick}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <span className="sidebar-icon">⚙️</span>
              Configuración de horarios
            </NavLink>

            <div className="sidebar-section-title">Clínica</div>

            <span className="sidebar-link" style={{ opacity: 0.4, cursor: 'default' }}>
              <span className="sidebar-icon">👥</span>
              Pacientes
            </span>

            <span className="sidebar-link" style={{ opacity: 0.4, cursor: 'default' }}>
              <span className="sidebar-icon">👥</span>
              Pacientes
            </span>

            <NavLink to="/historia-clinica" onClick={handleLinkClick}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <span className="sidebar-icon">📋</span>
              Historia clínica
            </NavLink>

            <span className="sidebar-link" style={{ opacity: 0.4, cursor: 'default' }}>
              <span className="sidebar-icon">💳</span>
              Facturación
            </span>
          </nav>
        </div>
      </div>
    </>
  );
}
