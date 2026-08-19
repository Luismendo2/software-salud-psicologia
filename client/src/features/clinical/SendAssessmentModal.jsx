import React, { useState } from 'react';
import * as evaluationsService from '../../services/evaluationsService';

export default function SendAssessmentModal({ patientId, templates, onClose, onSent }) {
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!selectedTemplateId) {
      setError('Por favor selecciona una evaluación.');
      return;
    }
    
    setSending(true);
    setError('');
    
    try {
      await evaluationsService.sendAssessment(patientId, selectedTemplateId);
      onSent();
    } catch (err) {
      setError('Hubo un error al enviar la evaluación. Intenta de nuevo.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'var(--color-surface)',
        padding: 'var(--space-xl)',
        borderRadius: 'var(--radius-lg)',
        width: '100%', maxWidth: '500px',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <h3 style={{ margin: '0 0 var(--space-md) 0' }}>Enviar Evaluación</h3>
        <p style={{ color: 'var(--color-gray-600)', fontSize: '0.875rem', marginBottom: 'var(--space-lg)' }}>
          Selecciona el cuestionario estandarizado que deseas enviar al portal del paciente. Se le notificará por correo.
        </p>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-md)', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: 'var(--space-xs)' }}>
            Plantilla de Evaluación
          </label>
          <select 
            className="form-control"
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
            disabled={sending}
          >
            <option value="">-- Seleccionar --</option>
            {templates.map(t => (
              <option key={t.id} value={t.id}>{t.name} - {t.description}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-md)' }}>
          <button 
            className="btn btn-outline-secondary" 
            onClick={onClose}
            disabled={sending}
          >
            Cancelar
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleSend}
            disabled={sending}
          >
            {sending ? 'Enviando...' : 'Enviar al paciente'}
          </button>
        </div>
      </div>
    </div>
  );
}
