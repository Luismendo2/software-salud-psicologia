/* ==========================================================================
   MobileNav — Navegación móvil y header superior (Feature 004)
   
   Solo visible en pantallas < 992px.
   Incluye menú hamburguesa simplificado con integración de AuthContext.
   ========================================================================== */

import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { ROLE_LABELS } from '../../mocks/authMock';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, hasRole } = useAuth();

  const toggleMenu = () => setIsOpen(!isOpen);

  if (!user) return null;

  return (
    <>
      <header className="mobile-navbar">
        <Link to="/agenda" className="mobile-navbar-brand">
          <span>🧠</span> PsiAgenda
        </Link>
        <button 
          className="btn btn-outline-secondary"
          onClick={toggleMenu}
          style={{ padding: '0.25rem 0.5rem' }}
          aria-label="Menú"
        >
          {isOpen ? '✕' : '☰'}
        </button>
      </header>

      {/* ── Menú desplegable ── */}
      {isOpen && (
        <div style={{
          backgroundColor: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-gray-200)',
          position: 'sticky',
          top: '53px',
          zIndex: 1010,
          padding: 'var(--space-md)',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-sm)'
        }}>
          <div style={{ paddingBottom: 'var(--space-sm)', borderBottom: '1px solid var(--color-gray-100)', marginBottom: 'var(--space-sm)' }}>
            <div style={{ fontWeight: 'var(--font-weight-bold)' }}>{user.firstName} {user.lastName}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>{ROLE_LABELS[user.role] || user.role}</div>
          </div>

          <NavLink to="/agenda" end className="btn btn-outline-secondary" onClick={toggleMenu} style={{ textAlign: 'left' }}>
            📅 Agenda
          </NavLink>

          {hasRole(['ADMIN', 'PSYCHOLOGIST']) && (
            <>
              <NavLink to="/historia-clinica" className="btn btn-outline-secondary" onClick={toggleMenu} style={{ textAlign: 'left' }}>
                📋 Historia clínica
              </NavLink>
              <NavLink to="/facturacion" className="btn btn-outline-secondary" onClick={toggleMenu} style={{ textAlign: 'left' }}>
                💳 Facturación y Pagos
              </NavLink>
              <NavLink to="/reportes-financieros" className="btn btn-outline-secondary" onClick={toggleMenu} style={{ textAlign: 'left' }}>
                📊 Reportes
              </NavLink>
            </>
          )}

          {hasRole(['ADMIN']) && (
            <NavLink to="/auditoria" className="btn btn-outline-secondary" onClick={toggleMenu} style={{ textAlign: 'left' }}>
              🛡️ Auditoría
            </NavLink>
          )}

          <NavLink to="/configuracion" className="btn btn-outline-secondary" onClick={toggleMenu} style={{ textAlign: 'left' }}>
            🔒 Mi Cuenta
          </NavLink>

          <button 
            className="btn btn-outline-secondary" 
            onClick={() => { logout(); toggleMenu(); }}
            style={{ textAlign: 'left', marginTop: 'var(--space-sm)', color: 'var(--color-danger)' }}
          >
            🚪 Cerrar sesión
          </button>
        </div>
      )}
    </>
  );
}
