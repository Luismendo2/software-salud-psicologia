import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import * as orgService from '../../services/organizationService';

export default function OrganizationSettingsPage() {
  const { user, hasRole } = useAuth();
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    clinicName: '',
    primaryColor: '#3b82f6',
    defaultAppointmentDuration: 60,
    address: '',
    phone: ''
  });
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const data = await orgService.getOrganization();
        setOrg(data);
        setFormData({
          name: data.name || '',
          slug: data.slug || '',
          clinicName: data.settings?.clinicName || '',
          primaryColor: data.settings?.primaryColor || '#3b82f6',
          defaultAppointmentDuration: data.settings?.defaultAppointmentDuration || 60,
          address: data.settings?.address || '',
          phone: data.settings?.phone || ''
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrg();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      const updates = {
        name: formData.name,
        slug: formData.slug,
        settings: {
          clinicName: formData.clinicName,
          primaryColor: formData.primaryColor,
          defaultAppointmentDuration: Number(formData.defaultAppointmentDuration),
          address: formData.address,
          phone: formData.phone
        }
      };
      const updatedOrg = await orgService.updateOrganization(updates);
      setOrg(updatedOrg);
      setSuccessMsg('Configuración guardada exitosamente.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!hasRole(['ADMIN', 'PSYCHOLOGIST'])) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>No tienes permiso para ver esta página.</div>;
  }

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-gray-500)' }}>Cargando configuración...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>⚙️ Configuración de la Clínica</h1>
        <p className="page-subtitle">Administra los detalles y la marca de tu organización.</p>
      </div>

      <div className="org-settings-grid">
        <form className="org-settings-card" onSubmit={handleSubmit}>
          <h3>Datos Generales</h3>
          
          {successMsg && (
            <div style={{ padding: 'var(--space-md)', backgroundColor: 'var(--color-success)', color: 'white', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-lg)', fontSize: '0.875rem' }}>
              {successMsg}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Nombre de la organización</label>
            <input 
              type="text" 
              className="form-control" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Slug (URL amigable)</label>
            <input 
              type="text" 
              className="form-control" 
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              required
            />
            <small style={{ color: 'var(--color-gray-500)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
              psiagenda.co/org/{formData.slug || 'ejemplo'}
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">Nombre público de la clínica</label>
            <input 
              type="text" 
              className="form-control" 
              name="clinicName"
              value={formData.clinicName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Color principal de marca</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <input 
                type="color" 
                name="primaryColor"
                value={formData.primaryColor}
                onChange={handleChange}
                style={{ width: '40px', height: '40px', padding: '0', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
              />
              <span style={{ fontFamily: 'monospace', fontSize: '0.875rem', color: 'var(--color-gray-600)' }}>{formData.primaryColor}</span>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-gray-200)', margin: 'var(--space-lg) 0' }} />

          <h3>Información de Contacto</h3>

          <div className="form-group">
            <label className="form-label">Dirección física</label>
            <input 
              type="text" 
              className="form-control" 
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Teléfono</label>
            <input 
              type="text" 
              className="form-control" 
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-gray-200)', margin: 'var(--space-lg) 0' }} />

          <h3>Preferencias Clínicas</h3>

          <div className="form-group">
            <label className="form-label">Duración por defecto de las citas (minutos)</label>
            <select 
              className="form-control" 
              name="defaultAppointmentDuration"
              value={formData.defaultAppointmentDuration}
              onChange={handleChange}
            >
              <option value="30">30 minutos</option>
              <option value="45">45 minutos</option>
              <option value="60">60 minutos</option>
              <option value="90">90 minutos</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-xl)' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>

        <div className="org-settings-card">
          <h3>Identidad Visual</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-600)', marginBottom: 'var(--space-lg)' }}>
            Sube el logotipo de tu clínica. Este logo aparecerá en el portal de pacientes, en las facturas y en los correos electrónicos enviados a tus consultantes.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 'var(--space-xl)', border: '1px dashed var(--color-gray-300)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-gray-50)' }}>
            <div className="org-logo-placeholder" style={{ marginBottom: 'var(--space-md)' }}>
              🏢
            </div>
            <button className="btn btn-outline-secondary" type="button">
              Subir Logo
            </button>
            <small style={{ marginTop: 'var(--space-sm)', color: 'var(--color-gray-500)' }}>Formatos soportados: JPG, PNG, SVG (Max 2MB)</small>
          </div>
        </div>
      </div>
    </div>
  );
}
