/* ==========================================================================
   ResetPasswordPage — Establecer nueva contraseña
   
   El usuario llega aquí desde el enlace del correo.
   Incluye validación de fortaleza de la contraseña según la spec:
   - Mínimo 8 caracteres
   - Al menos 1 mayúscula
   - Al menos 1 dígito
   - Al menos 1 carácter especial
   ========================================================================== */

import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { resetPassword } from '../../services/authService';

/** Evalúa la fortaleza de la contraseña */
function evaluateStrength(password) {
  const checks = [
    { label: '8 caracteres mínimo', met: password.length >= 8 },
    { label: 'Una letra mayúscula', met: /[A-Z]/.test(password) },
    { label: 'Un número', met: /\d/.test(password) },
    { label: 'Un carácter especial', met: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) },
  ];
  const metCount = checks.filter(c => c.met).length;
  let level = 'weak';
  if (metCount >= 4) level = 'strong';
  else if (metCount >= 3) level = 'medium';
  return { checks, metCount, level };
}

export default function ResetPasswordPage() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const strength = useMemo(() => evaluateStrength(password), [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (strength.metCount < 4) {
      setError('La contraseña no cumple con todos los requisitos.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Error al restablecer la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🔒</div>
          <h1>Nueva contraseña</h1>
          <p>Establece una contraseña segura para tu cuenta.</p>
        </div>

        {success ? (
          <div className="auth-success-panel">
            <div className="auth-success-icon">✅</div>
            <h2>¡Contraseña restablecida!</h2>
            <p>Tu contraseña ha sido actualizada exitosamente. Ya puedes iniciar sesión.</p>
            <Link to="/login" className="btn btn-primary auth-submit-btn">
              Ir al inicio de sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="auth-error">
                <span className="auth-error-icon">⚠️</span>
                {error}
              </div>
            )}

            <div className="auth-field">
              <label htmlFor="reset-password">Nueva contraseña</label>
              <div className="auth-password-wrapper">
                <input
                  id="reset-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  autoFocus
                  disabled={loading}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>

              {/* ── Indicador de fortaleza ── */}
              {password.length > 0 && (
                <div className="auth-strength">
                  <div className="auth-strength-bar">
                    <div className={`auth-strength-fill auth-strength-fill--${strength.level}`}
                      style={{ width: `${(strength.metCount / 4) * 100}%` }}
                    />
                  </div>
                  <span className={`auth-strength-label auth-strength-label--${strength.level}`}>
                    {strength.level === 'strong' ? 'Fuerte' : strength.level === 'medium' ? 'Media' : 'Débil'}
                  </span>
                </div>
              )}

              {/* ── Checklist de requisitos ── */}
              {password.length > 0 && (
                <ul className="auth-strength-checks">
                  {strength.checks.map((check, i) => (
                    <li key={i} className={check.met ? 'met' : ''}>
                      <span className="auth-check-icon">{check.met ? '✓' : '○'}</span>
                      {check.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="auth-field">
              <label htmlFor="reset-confirm">Confirmar contraseña</label>
              <input
                id="reset-confirm"
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                disabled={loading}
              />
              {confirmPassword && password !== confirmPassword && (
                <div className="auth-field-error">Las contraseñas no coinciden</div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-submit-btn"
              disabled={loading || strength.metCount < 4}
            >
              {loading ? (
                <>
                  <span className="auth-btn-spinner" />
                  Restableciendo...
                </>
              ) : (
                'Restablecer contraseña'
              )}
            </button>

            <div className="auth-back-link">
              <Link to="/login">← Volver al inicio de sesión</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
