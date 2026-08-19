import React from 'react';

export default function AssessmentResultCard({ assessment, template, onClick }) {
  if (!assessment || !template) return null;

  const isPending = assessment.status === 'SENT';
  const hasRisk = assessment.riskFlag;
  
  // Asignar colores según severidad
  const getSeverityClass = (severity) => {
    if (!severity) return '';
    const s = severity.toLowerCase();
    if (s.includes('min')) return 'severity-min';
    if (s.includes('mild') || s.includes('leve')) return 'severity-mild';
    if (s.includes('mod')) return 'severity-mod';
    if (s.includes('sever')) return 'severity-severe';
    return '';
  };

  const severityClass = getSeverityClass(assessment.severity);
  const formattedDate = new Date(assessment.completedAt || assessment.sentAt).toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  return (
    <div 
      className={`assessment-result-card ${hasRisk ? 'risk-alert' : ''}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="assessment-result-header">
        <div>
          <div className="assessment-result-title">{template.name}</div>
          <div className="assessment-result-date">
            {isPending ? `Enviado: ${formattedDate}` : `Completado: ${formattedDate}`}
          </div>
        </div>
        {isPending && (
          <span className="badge badge-warning" style={{ fontSize: '0.75rem' }}>Pendiente</span>
        )}
      </div>

      {!isPending && (
        <div className="assessment-score-row">
          <div className={`assessment-score-circle ${severityClass}`}>
            {assessment.score}
          </div>
          <div>
            <div className="assessment-severity" style={{ color: 'var(--color-gray-800)' }}>
              {assessment.severity || 'Completado'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>
              Puntaje Total
            </div>
          </div>
        </div>
      )}

      {hasRisk && (
        <div className="assessment-alert">
          <span style={{ fontSize: '1.2rem' }}>⚠️</span>
          <div>
            <strong>Alerta Clínica:</strong> Indicador de riesgo alto detectado en las respuestas del paciente.
          </div>
        </div>
      )}
    </div>
  );
}
