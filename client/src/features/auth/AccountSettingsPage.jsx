/* ==========================================================================
   AccountSettingsPage — Configuración de cuenta y seguridad
   
   Permite al usuario autenticado:
   - Ver su información de perfil
   - Cambiar su contraseña (con validación de fortaleza)
   - Ver sus sesiones activas (mock)
   - Cerrar sesión en todos los dispositivos
   ========================================================================== */

import { useState, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { changePassword } from '../../services/authService';
import { ROLE_LABELS, ROLE_COLORS } from '../../mocks/authMock';

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

export default function AccountSettingsPage() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const strength = useMemo(() => evaluateStrength(newPassword), [newPassword]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword) {
      setError('Ingresa tu contraseña actual.');
      return;
    }
    if (strength.metCount < 4) {
      setError('La nueva contraseña no cumple con todos los requisitos.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (currentPassword === newPassword) {
      setError('La nueva contraseña debe ser diferente a la actual.');
      return;
    }

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setSuccess('Contraseña actualizada exitosamente.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Error al cambiar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const roleColor = ROLE_COLORS[user.role] || {};
  const initials = `${user.firstName[0]}${user.lastName[0]}`;

  return (
    <div className="account-page">
      <div className="account-header">
        <h1>Configuración de cuenta</h1>
        <p>Gestiona tu perfil y seguridad.</p>
      </div>

      {/* ── Información del perfil ── */}
      <div className="account-section">
        <h2>Perfil</h2>
        <div className="account-profile-card">
          <div className="account-avatar">{initials}</div>
          <div className="account-profile-info">
            <div className="account-profile-name">{user.firstName} {user.lastName}</div>
            <div className="account-profile-email">{user.email}</div>
            <span
              className="account-role-badge"
              style={{ backgroundColor: roleColor.bg, color: roleColor.color }}
            >
              {ROLE_LABELS[user.role] || user.role}
            </span>
          </div>
        </div>
        <div className="account-profile-details">
          <div className="account-detail-row">
            <span className="account-detail-label">Último acceso</span>
            <span className="account-detail-value">
              {user.lastLogin
                ? new Date(user.lastLogin).toLocaleString('es-CO', {
                    day: '2-digit', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })
                : 'No disponible'}
            </span>
          </div>
          <div className="account-detail-row">
            <span className="account-detail-label">Cuenta creada</span>
            <span className="account-detail-value">
              {new Date(user.createdAt).toLocaleDateString('es-CO', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </span>
          </div>
          <div className="account-detail-row">
            <span className="account-detail-label">Estado de la cuenta</span>
            <span className={`account-detail-value ${user.isActive ? 'text-success' : 'text-danger'}`}>
              {user.isActive ? '● Activa' : '● Inactiva'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Cambio de contraseña ── */}
      <div className="account-section">
        <h2>Cambiar contraseña</h2>
        <form onSubmit={handleChangePassword} className="account-password-form">
          {error && (
            <div className="auth-error">
              <span className="auth-error-icon">⚠️</span>
              {error}
            </div>
          )}
          {success && (
            <div className="account-success">
              <span>✅</span> {success}
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="current-password">Contraseña actual</label>
            <input
              id="current-password"
              type={showPasswords ? 'text' : 'password'}
              className="form-control"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="new-password">Nueva contraseña</label>
            <div className="auth-password-wrapper">
              <input
                id="new-password"
                type={showPasswords ? 'text' : 'password'}
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                disabled={loading}
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPasswords(!showPasswords)}
                tabIndex={-1}
              >
                {showPasswords ? '🙈' : '👁️'}
              </button>
            </div>

            {newPassword.length > 0 && (
              <>
                <div className="auth-strength">
                  <div className="auth-strength-bar">
                    <div
                      className={`auth-strength-fill auth-strength-fill--${strength.level}`}
                      style={{ width: `${(strength.metCount / 4) * 100}%` }}
                    />
                  </div>
                  <span className={`auth-strength-label auth-strength-label--${strength.level}`}>
                    {strength.level === 'strong' ? 'Fuerte' : strength.level === 'medium' ? 'Media' : 'Débil'}
                  </span>
                </div>
                <ul className="auth-strength-checks">
                  {strength.checks.map((check, i) => (
                    <li key={i} className={check.met ? 'met' : ''}>
                      <span className="auth-check-icon">{check.met ? '✓' : '○'}</span>
                      {check.label}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div className="auth-field">
            <label htmlFor="confirm-new-password">Confirmar nueva contraseña</label>
            <input
              id="confirm-new-password"
              type={showPasswords ? 'text' : 'password'}
              className="form-control"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              disabled={loading}
            />
            {confirmPassword && newPassword !== confirmPassword && (
              <div className="auth-field-error">Las contraseñas no coinciden</div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || strength.metCount < 4}
          >
            {loading ? 'Actualizando...' : 'Actualizar contraseña'}
          </button>
        </form>
      </div>

      {/* ── Seguridad adicional ── */}
      <div className="account-section">
        <h2>Seguridad</h2>
        <div className="account-security-info">
          <div className="account-security-item">
            <div className="account-security-icon">🔐</div>
            <div>
              <strong>Autenticación de dos factores (MFA)</strong>
              <p>La autenticación multifactor estará disponible en una próxima actualización. Esto añadirá una capa extra de protección a tu cuenta.</p>
            </div>
            <span className="account-coming-soon">Próximamente</span>
          </div>
          <div className="account-security-item">
            <div className="account-security-icon">📋</div>
            <div>
              <strong>Ley 1581 de 2012</strong>
              <p>Tus datos personales son tratados conforme a la legislación colombiana de protección de datos. Puedes solicitar la eliminación de tu cuenta contactando al administrador.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
