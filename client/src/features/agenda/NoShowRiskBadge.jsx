/* ==========================================================================
   NoShowRiskBadge — Indicador de riesgo predictivo de inasistencia (Feature 012)
   Calculado nocturnamente para citas. Cuando el riesgo supera el 30%,
   se programan recordatorios automáticos de refuerzo a las 8h y 2h antes.
   ========================================================================== */

import { useState } from 'react';

export default function NoShowRiskBadge({ score, riskLevel, extraReminders }) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (score === undefined || score === null) return null;

  const level = riskLevel || (score > 30 ? 'HIGH' : score >= 15 ? 'MEDIUM' : 'LOW');

  const config = {
    HIGH: {
      label: `⚠️ Ausencia: ${score}%`,
      className: 'noshow-risk-badge--high',
      title: 'Alto riesgo de inasistencia (> 30%)',
    },
    MEDIUM: {
      label: `Riesgo: ${score}%`,
      className: 'noshow-risk-badge--medium',
      title: 'Riesgo moderado de inasistencia (15-30%)',
    },
    LOW: {
      label: `Riesgo: ${score}%`,
      className: 'noshow-risk-badge--low',
      title: 'Bajo riesgo de inasistencia (< 15%)',
    },
  }[level];

  return (
    <div
      className={`noshow-risk-badge ${config.className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      title={config.title}
      style={{ position: 'relative' }}
    >
      <span>{config.label}</span>

      {showTooltip && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: '6px',
            width: '210px',
            padding: '8px 10px',
            background: '#1f2937',
            color: '#f9fafb',
            borderRadius: '6px',
            fontSize: '0.72rem',
            lineHeight: 1.35,
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
            pointerEvents: 'none',
            whiteSpace: 'normal',
            fontWeight: 'normal',
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '2px', color: '#fef08a' }}>
            Predicción No-Show: {score}%
          </div>
          <div>Calculado sobre el historial del paciente.</div>
          {level === 'HIGH' && (
            <div style={{ marginTop: '4px', color: '#93c5fd' }}>
              ✓ Recordatorios automáticos encolados: <strong>8h</strong> y <strong>2h</strong> antes.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
