import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as orgService from '../../services/organizationService';

export default function InviteAcceptPage() {
  const { orgId, token } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: ''
  });

  // En un caso real, aquí haríamos un GET para validar el token y obtener el nombre de la organización
  const orgName = "Centro de Bienestar Psicológico"; 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    
    setError(null);
    setLoading(true);
    try {
      await orgService.acceptInvite(token, { 
        name: formData.name, 
        password: formData.password 
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Error al aceptar la invitación.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="invite-accept-container">
        <div className="invite-accept-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
          <h1>¡Cuenta Creada!</h1>
          <p style={{ color: 'var(--color-gray-600)', marginTop: '1rem' }}>
            Te has unido exitosamente a {orgName}. Serás redirigido al inicio de sesión en unos segundos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="invite-accept-container">
      <div className="invite-accept-card">
        <h1>Únete al equipo</h1>
        <div className="invite-accept-org">{orgName} te ha invitado a usar PsiAgenda.</div>
        
        {error && (
          <div style={{ padding: 'var(--space-md)', backgroundColor: '#fef2f2', color: 'var(--color-danger)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-lg)', fontSize: '0.875rem', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre Completo</label>
            <input 
              type="text" 
              className="form-control" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej. Juan Pérez"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Crea una contraseña</label>
            <input 
              type="password" 
              className="form-control" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Mínimo 8 caracteres"
              minLength={8}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirma tu contraseña</label>
            <input 
              type="password" 
              className="form-control" 
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Escribe la contraseña nuevamente"
              minLength={8}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: 'var(--space-md)' }}
            disabled={loading}
          >
            {loading ? 'Creando cuenta...' : 'Aceptar Invitación y Crear Cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
}
