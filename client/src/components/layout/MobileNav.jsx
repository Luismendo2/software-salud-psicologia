/* ==========================================================================
   MobileNav — Navegación móvil y header superior (Feature 004)
   
   Solo visible en pantallas < 992px.
   Incluye menú hamburguesa simplificado con integración de AuthContext.
   ========================================================================== */

import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { ROLE_LABELS } from '../../mocks/authMock';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, hasRole } = useAuth();

  const toggleMenu = () => setIsOpen(!isOpen);

  // Bloquear el scroll de la página de fondo cuando el menú está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

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

      {/* ── Menú desplegable móvil (con scroll interno dedicado) ── */}
      {isOpen && (
        <div className="mobile-nav-drawer">
          <div className="mobile-nav-user-header">
            <div className="mobile-nav-user-name">{user.firstName} {user.lastName}</div>
            <div className="mobile-nav-user-role">{ROLE_LABELS[user.role] || user.role}</div>
          </div>

          <NavLink to="/agenda" end className="btn btn-outline-secondary" onClick={toggleMenu} style={{ textAlign: 'left' }}>
            📅 Agenda
          </NavLink>

          {hasRole(['ADMIN', 'PSYCHOLOGIST']) && (
            <>
              <NavLink to="/historia-clinica" className="btn btn-outline-secondary" onClick={toggleMenu} style={{ textAlign: 'left' }}>
                📋 Historia clínica
              </NavLink>
              <NavLink to="/telepsicologia" className="btn btn-outline-secondary" onClick={toggleMenu} style={{ textAlign: 'left' }}>
                📹 Telepsicología
              </NavLink>
              <NavLink to="/biblioteca" className="btn btn-outline-secondary" onClick={toggleMenu} style={{ textAlign: 'left' }}>
                📚 Biblioteca
              </NavLink>
              <NavLink to="/facturacion" className="btn btn-outline-secondary" onClick={toggleMenu} style={{ textAlign: 'left' }}>
                💳 Facturación y Pagos
              </NavLink>
              <NavLink to="/reportes" className="btn btn-outline-secondary" onClick={toggleMenu} style={{ textAlign: 'left' }}>
                📊 Estadísticas y Reportes
              </NavLink>
              <NavLink to="/reportes-financieros" className="btn btn-outline-secondary" onClick={toggleMenu} style={{ textAlign: 'left' }}>
                📈 Reportes Financieros
              </NavLink>
              <NavLink to="/mensajeria" className="btn btn-outline-secondary" onClick={toggleMenu} style={{ textAlign: 'left', marginTop: 'var(--space-md)' }}>
                💬 Mensajes
              </NavLink>
              <NavLink to="/tareas" className="btn btn-outline-secondary" onClick={toggleMenu} style={{ textAlign: 'left' }}>
                📝 Tareas Terapéuticas
              </NavLink>
              <NavLink to="/satisfaccion" className="btn btn-outline-secondary" onClick={toggleMenu} style={{ textAlign: 'left' }}>
                ⭐ Satisfacción (NPS)
              </NavLink>
            </>
          )}

          {hasRole(['ADMIN', 'PSYCHOLOGIST']) && (
            <>
              <NavLink to="/equipo/configuracion" className="btn btn-outline-secondary" onClick={toggleMenu} style={{ textAlign: 'left', marginTop: 'var(--space-md)' }}>
                🏢 Mi Clínica
              </NavLink>
              <NavLink to="/equipo" className="btn btn-outline-secondary" onClick={toggleMenu} style={{ textAlign: 'left' }} end>
                👥 Miembros
              </NavLink>
              <NavLink to="/equipo/supervision" className="btn btn-outline-secondary" onClick={toggleMenu} style={{ textAlign: 'left' }}>
                🎓 Supervisión
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
