import React, { useState, useEffect } from 'react';
import * as orgService from '../../services/organizationService';

export default function SubmitForSupervisionModal({ isOpen, onClose, noteId, patientName, sessionDate, sessionNumber }) {
  const [supervisors, setSupervisors] = useState([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState('');
  const [isAnonymized, setIsAnonymized] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchSupervisors = async () => {
        try {
          const data = await orgService.getSupervisors();
          setSupervisors(data);
          if (data.length > 0) {
            setSelectedSupervisor(data[0].userId);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchSupervisors();
    } else {
      // Reset state on close
      setSuccess(false);
      setIsAnonymized(true);
      setSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSupervisor) return;
    setSubmitting(true);
    try {
      await orgService.createSupervisionCase({
        sessionNoteId: noteId,
        supervisorId: selectedSupervisor,
        isAnonymized,
        patientName,
        sessionDate,
        sessionNumber,
        noteExcerpt: "Extracto simulado de la nota para la previsualización del supervisor...", // En integración real, extraer parte del texto
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h2>Solicitar Supervisión</h2>
          <button className="modal-close" onClick={onClose} disabled={submitting}>✕</button>
        </div>
        
        <div className="modal-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-gray-500)' }}>Cargando supervisores...</div>
          ) : success ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
              <h3>¡Enviado con éxito!</h3>
              <p style={{ color: 'var(--color-gray-600)', marginTop: '0.5rem' }}>El supervisor ha sido notificado.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p style={{ fontSize: '0.875rem', marginBottom: 'var(--space-lg)', color: 'var(--color-gray-600)' }}>
                Estás enviando a revisión la <strong>Sesión #{sessionNumber}</strong> del {new Date(sessionDate).toLocaleDateString('es-CO')}.
              </p>
              
              <div className="form-group">
                <label className="form-label">Selecciona un supervisor</label>
                <select 
                  className="form-control"
                  value={selectedSupervisor}
                  onChange={(e) => setSelectedSupervisor(e.target.value)}
                  required
                >
                  {supervisors.length === 0 && <option value="">No hay supervisores disponibles</option>}
                  {supervisors.map(s => (
                    <option key={s.id} value={s.userId}>{s.firstName} {s.lastName}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group" style={{ backgroundColor: 'var(--color-gray-50)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-sm)', cursor: 'pointer', margin: 0 }}>
                  <input 
                    type="checkbox" 
                    checked={isAnonymized}
                    onChange={(e) => setIsAnonymized(e.target.checked)}
                    style={{ marginTop: '4px' }}
                  />
                  <div>
                    <div style={{ fontWeight: 'var(--font-weight-medium)', fontSize: '0.875rem' }}>Anonimizar datos del paciente</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', marginTop: '4px' }}>
                      Si activas esta opción, el supervisor no verá el nombre, datos de contacto ni historia clínica completa del paciente. Solo verá esta nota específica bajo un seudónimo (ej. "Paciente #1234").
                    </div>
                  </div>
                </label>
              </div>

              {!isAnonymized && (
                <div style={{ padding: 'var(--space-sm)', backgroundColor: '#fef2f2', color: '#991b1b', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', marginBottom: 'var(--space-md)', border: '1px solid #fecaca' }}>
                  <strong>⚠️ Advertencia:</strong> Solo debes desactivar la anonimización si el paciente ha firmado explícitamente el consentimiento para compartir sus datos identificables con supervisores o el equipo clínico.
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)', marginTop: 'var(--space-xl)' }}>
                <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={submitting}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting || !selectedSupervisor}>
                  {submitting ? 'Enviando...' : 'Enviar a Supervisión'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
