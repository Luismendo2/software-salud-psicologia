import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as orgService from '../../services/organizationService';
import { SUPERVISION_STATUS_CONFIG } from '../../mocks/organizationMock';

export default function SupervisionCaseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const data = await orgService.getSupervisionCase(id);
        setCaseData(data);
        if (data.status === 'PENDING_REVIEW') {
          // Cambiar a en revisión automáticamente
          await orgService.updateCaseStatus(id, 'IN_REVIEW');
          setCaseData(prev => ({ ...prev, status: 'IN_REVIEW' }));
        }
      } catch (err) {
        console.error(err);
        navigate('/equipo/supervision');
      } finally {
        setLoading(false);
      }
    };
    fetchCase();
  }, [id, navigate]);

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    setSubmitting(true);
    try {
      const updated = await orgService.submitFeedback(id, feedback);
      setCaseData(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-gray-500)' }}>Cargando caso...</div>;
  if (!caseData) return null;

  return (
    <div className="page-container">
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/equipo/supervision')}>
          ← Volver a la cola
        </button>
      </div>

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Caso: {caseData.isAnonymized ? caseData.patientAlias : caseData.patientName}</h1>
          <p className="page-subtitle">Terapeuta: {caseData.superviseeName} • Sesión #{caseData.sessionNumber}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          {caseData.isAnonymized && <span className="anonymized-badge" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>🔒 Anonimizado</span>}
          <span className="org-role-badge" style={{ backgroundColor: SUPERVISION_STATUS_CONFIG[caseData.status]?.bgColor, color: SUPERVISION_STATUS_CONFIG[caseData.status]?.color, fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>
            {SUPERVISION_STATUS_CONFIG[caseData.status]?.icon} {SUPERVISION_STATUS_CONFIG[caseData.status]?.label}
          </span>
        </div>
      </div>

      <div className="supervision-detail-layout">
        <div className="supervision-note-panel">
          <h3>📋 Nota de Sesión</h3>
          
          <div style={{ padding: 'var(--space-md)', backgroundColor: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-lg)', fontSize: '0.875rem' }}>
            <div style={{ marginBottom: '4px' }}><strong>Fecha de sesión:</strong> {new Date(caseData.sessionDate).toLocaleDateString('es-CO')}</div>
            <div><strong>Enviado a revisión:</strong> {new Date(caseData.createdAt).toLocaleString('es-CO')}</div>
          </div>

          <div className="clinical-note-content" style={{ fontSize: '0.9375rem', lineHeight: '1.6' }}>
            {/* Aquí simulamos el renderizado de la nota enriquecida. 
                En la integración real, se renderizaría el contenido del 'sessionNoteId'. */}
            <div style={{ marginBottom: 'var(--space-lg)' }}>
              <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-primary-700)', marginBottom: 'var(--space-xs)' }}>Situación / Evento activador</div>
              <div>{caseData.noteExcerpt}</div>
              <p>Adicionalmente el paciente mencionó sentirse abrumado por las nuevas responsabilidades en su trabajo. Presenta dificultad para delegar tareas por temor a que no se realicen con la calidad esperada.</p>
            </div>
            
            <div style={{ marginBottom: 'var(--space-lg)' }}>
              <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-primary-700)', marginBottom: 'var(--space-xs)' }}>Intervenciones realizadas</div>
              <p>Se trabajó reestructuración cognitiva enfocada en el perfeccionismo. Se modeló la técnica de delegación asertiva y se realizó role-play para practicar conversaciones con su equipo.</p>
            </div>
            
            <div style={{ marginBottom: 'var(--space-lg)' }}>
              <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-primary-700)', marginBottom: 'var(--space-xs)' }}>Plan / Tareas</div>
              <p>1. Practicar delegar una tarea de bajo impacto esta semana.<br/>2. Registrar nivel de ansiedad antes, durante y después de delegar la tarea.</p>
            </div>
          </div>
        </div>

        <div className="supervision-feedback-panel">
          <h3>💡 Retroalimentación del Supervisor</h3>
          
          {caseData.status === 'RESOLVED' ? (
            <div>
              <div className="supervision-feedback-existing">
                {caseData.supervisorFeedback}
              </div>
              <div style={{ marginTop: 'var(--space-md)', fontSize: '0.75rem', color: 'var(--color-gray-500)', textAlign: 'right' }}>
                Resuelto el {new Date(caseData.resolvedAt).toLocaleString('es-CO')}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitFeedback} style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 40px)' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-600)', marginBottom: 'var(--space-md)' }}>
                Escribe tus comentarios y sugerencias para el terapeuta. Al enviar, el caso se marcará como resuelto.
              </p>
              
              <textarea 
                className="form-control" 
                style={{ flex: 1, minHeight: '300px', resize: 'none', marginBottom: 'var(--space-lg)' }}
                placeholder="Escribe tu retroalimentación aquí..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                required
                minLength={10}
              />
              
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" disabled={submitting || !feedback.trim()}>
                  {submitting ? 'Enviando...' : 'Enviar Retroalimentación y Cerrar Caso'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
