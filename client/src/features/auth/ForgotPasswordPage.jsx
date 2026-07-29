/* ==========================================================================
   ForgotPasswordPage — Solicitar recuperación de contraseña
   
   El usuario ingresa su email y recibe instrucciones (simuladas).
   Por seguridad, siempre muestra éxito sin importar si el email existe.
   ========================================================================== */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../services/authService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Ingresa tu correo electrónico.');
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Error al procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🔑</div>
          <h1>Recuperar contraseña</h1>
          <p>Te enviaremos instrucciones para restablecer tu contraseña.</p>
        </div>

        {success ? (
          <div className="auth-success-panel">
            <div className="auth-success-icon">✉️</div>
            <h2>¡Revisa tu correo!</h2>
            <p>Si <strong>{email}</strong> está registrado en PsiAgenda, recibirás un enlace para restablecer tu contraseña en los próximos minutos.</p>
            <p className="auth-success-hint">Revisa también tu carpeta de spam.</p>
            <Link to="/login" className="btn btn-primary auth-submit-btn">
              Volver a iniciar sesión
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
              <label htmlFor="forgot-email">Correo electrónico</label>
              <input
                id="forgot-email"
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

            <button
              type="submit"
              className="btn btn-primary auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="auth-btn-spinner" />
                  Enviando...
                </>
              ) : (
                'Enviar instrucciones'
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
