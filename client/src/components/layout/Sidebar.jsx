/* ==========================================================================
   Sidebar — Navegación principal (desktop)
   
   Barra lateral fija de 260px que se muestra solo en pantallas >= 992px.
   Contiene el logotipo, los links de navegación agrupados por sección,
   y un footer con info del usuario (placeholder para Feature 004 - Auth).
   ========================================================================== */

import { NavLink } from 'react-router-dom';

export default function Sidebar() {
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

        <NavLink to="/agenda" className={({ isActive }) =>
          `sidebar-link ${isActive ? 'active' : ''}`
        }>
          <span className="sidebar-icon">📅</span>
          Agenda
        </NavLink>

        <NavLink to="/agenda/settings" className={({ isActive }) =>
          `sidebar-link ${isActive ? 'active' : ''}`
        }>
          <span className="sidebar-icon">⚙️</span>
          Configuración de horarios
        </NavLink>

        {/* 
          Los links de abajo son placeholders para las features futuras.
          Están deshabilitados visualmente pero muestran la estructura
          completa del sidebar para dar contexto de navegación.
        */}
        <div className="sidebar-section-title">Clínica</div>

        <span className="sidebar-link" style={{ opacity: 0.4, cursor: 'default' }}>
          <span className="sidebar-icon">👥</span>
          Pacientes
        </span>

        <span className="sidebar-link" style={{ opacity: 0.4, cursor: 'default' }}>
          <span className="sidebar-icon">👥</span>
          Pacientes
        </span>

        <NavLink to="/historia-clinica" className={({ isActive }) =>
          `sidebar-link ${isActive ? 'active' : ''}`
        }>
          <span className="sidebar-icon">📋</span>
          Historia clínica
        </NavLink>

        <span className="sidebar-link" style={{ opacity: 0.4, cursor: 'default' }}>
          <span className="sidebar-icon">💳</span>
          Facturación
        </span>
      </nav>

      {/* ── Footer del sidebar — perfil del usuario ── */}
      <div style={{
        padding: 'var(--space-md) var(--space-lg)',
        borderTop: '1px solid var(--color-gray-100)',
        fontSize: '0.8125rem',
        color: 'var(--color-gray-500)'
      }}>
        <div style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-gray-700)' }}>
          Dra. María López
        </div>
        <div>Psicóloga clínica</div>
      </div>
    </aside>
  );
}
