/* ==========================================================================
   LoginPage — Página de inicio de sesión
   
   Formulario con validación de email y contraseña, indicador de fortaleza
   de contraseña (visual), manejo de errores y redirección post-login.
   
   Credenciales de demo disponibles en un panel informativo.
   ========================================================================== */

import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/agenda';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Ingresa tu correo electrónico.');
      return;
    }
    if (!password) {
      setError('Ingresa tu contraseña.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* ── Logo y título ── */}
        <div className="auth-header">
          <div className="auth-logo">🧠</div>
          <h1>PsiAgenda</h1>
          <p>Inicia sesión para acceder a tu cuenta</p>
        </div>

        {/* ── Formulario ── */}
        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="auth-error">
              <span className="auth-error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="login-email">Correo electrónico</label>
            <input
              id="login-email"
              type="email"
              className="form-control"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
              disabled={loading}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="login-password">Contraseña</label>
            <div className="auth-password-wrapper">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="auth-forgot-link">
            <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="auth-btn-spinner" />
                Iniciando sesión...
              </>
            ) : (
              'Iniciar sesión'
            )}
          </button>
        </form>

        {/* ── Panel de cuentas demo ── */}
        <div className="auth-demo-panel">
          <div className="auth-demo-title">Cuentas de demostración</div>
          <div className="auth-demo-accounts">
            <button
              type="button"
              className="auth-demo-btn"
              onClick={() => fillDemo('maria.lopez@psiagenda.co', 'Demo@1234')}
            >
              <span className="auth-demo-role auth-demo-role--psychologist">Psicóloga</span>
              <span className="auth-demo-email">maria.lopez@psiagenda.co</span>
            </button>
            <button
              type="button"
              className="auth-demo-btn"
              onClick={() => fillDemo('admin@psiagenda.co', 'Admin@2026')}
            >
              <span className="auth-demo-role auth-demo-role--admin">Admin</span>
              <span className="auth-demo-email">admin@psiagenda.co</span>
            </button>
            <button
              type="button"
              className="auth-demo-btn"
              onClick={() => fillDemo('ana.secretaria@psiagenda.co', 'Asistente@1')}
            >
              <span className="auth-demo-role auth-demo-role--assistant">Asistente</span>
              <span className="auth-demo-email">ana.secretaria@psiagenda.co</span>
            </button>
          </div>
        </div>

        {/* ── Footer legal ── */}
        <div className="auth-footer">
          <p>Al iniciar sesión aceptas los <a href="#">Términos de servicio</a> y la <a href="#">Política de privacidad</a> conforme a la Ley 1581 de 2012.</p>
        </div>
      </div>
    </div>
  );
}
