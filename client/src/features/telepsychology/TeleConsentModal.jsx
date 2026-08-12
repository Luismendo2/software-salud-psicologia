import React, { useState } from 'react';
import { CONSENT_DOCUMENT } from '../../mocks/telepsychologyMock';
import { signConsent } from '../../services/telepsychologyService';

export default function TeleConsentModal({ patientId, patientName, onConsentSigned }) {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSign = async () => {
    if (!accepted) return;
    
    setLoading(true);
    setError('');
    
    try {
      await signConsent(patientId, patientName);
      onConsentSigned();
    } catch (err) {
      console.error("Error signing consent:", err);
      setError(err.message || 'Ocurrió un error al firmar el consentimiento.');
      setLoading(false);
    }
  };

  return (
    <div className="consent-overlay">
      <div className="consent-card">
        <div className="consent-header">
          <h2>{CONSENT_DOCUMENT.title}</h2>
          <span className="version">Versión {CONSENT_DOCUMENT.version}</span>
        </div>
        
        <div className="consent-body">
          {CONSENT_DOCUMENT.sections.map((section, idx) => (
            <div key={idx} className="consent-section">
              <h3>{section.title}</h3>
              <p>{section.content}</p>
            </div>
          ))}
        </div>
        
        <div className="consent-footer">
          {error && (
            <div style={{ color: 'var(--color-danger)', fontSize: '0.875rem', marginBottom: '1rem', padding: '0.5rem', background: '#fef2f2', borderRadius: '4px' }}>
              {error}
            </div>
          )}
          
          <label className="consent-checkbox">
            <input 
              type="checkbox" 
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              disabled={loading}
            />
            <span>He leído, comprendo y acepto las condiciones descritas en este consentimiento informado para recibir atención psicológica por medios virtuales.</span>
          </label>
          
          <div className="consent-actions">
            <button 
              className="btn btn-primary" 
              onClick={handleSign}
              disabled={!accepted || loading}
            >
              {loading ? 'Firmando...' : 'Firmar y Continuar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
