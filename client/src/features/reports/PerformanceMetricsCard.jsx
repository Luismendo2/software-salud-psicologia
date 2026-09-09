/* ==========================================================================
   PerformanceMetricsCard.jsx — Indicadores de desempeño profesional y metas
   ========================================================================== */

import React from 'react';

export default function PerformanceMetricsCard({ performanceData }) {
  if (!performanceData) return null;

  const {
    hoursWorked = 0,
    retentionRate = 0,
    goalCompletion = 0,
    appointmentGoal = 50,
    currentAppointments = 0,
    avgSessionsPerPatient = 0,
    newPatients = 0,
    returningPatients = 0,
    punctualityRate = 95,
  } = performanceData;

  const clampedGoalPct = Math.min(Math.round(goalCompletion), 100);

  return (
    <div className="reports-performance-grid">
      {/* Tarjeta de Cumplimiento de Meta */}
      <div className="reports-perf-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: 'var(--color-gray-900)' }}>
            🎯 Meta de Consultas
          </h4>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-primary-600)', fontWeight: '600' }}>
            {goalCompletion}% completado
          </span>
        </div>
        
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-gray-500)', margin: '6px 0 0 0' }}>
          Progreso hacia la meta de atención configurada
        </p>

        <div className="reports-goal-progress-wrap">
          <div className="reports-progress-bar-track">
            <div
              className="reports-progress-bar-fill"
              style={{ width: `${clampedGoalPct}%` }}
            />
          </div>
          <div className="reports-goal-labels">
            <span>{currentAppointments} citas realizadas</span>
            <span>Meta: {appointmentGoal} citas</span>
          </div>
        </div>

        <div style={{ fontSize: '0.8125rem', color: 'var(--color-gray-600)', background: 'var(--color-gray-50)', padding: '8px 12px', borderRadius: 'var(--radius-md)' }}>
          💡 Al ritmo actual, alcanzarás el <strong>{Math.round(goalCompletion * 1.1)}%</strong> al cierre del ciclo.
        </div>
      </div>

      {/* Tarjeta de Horas y Puntualidad */}
      <div className="reports-perf-card">
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: 'var(--color-gray-900)' }}>
          ⏱️ Horas de Práctica Clínica
        </h4>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-gray-500)', margin: '6px 0 16px 0' }}>
          Tiempo efectivo dedicado a terapia asistida
        </p>

        <div style={{ display: 'flex', gap: 'var(--space-xl)', alignItems: 'baseline', marginBottom: '14px' }}>
          <div>
            <div style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--color-primary-600)' }}>
              {hoursWorked}h
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>Horas completadas</div>
          </div>
          <div>
            <div style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--color-accent-600)' }}>
              {punctualityRate}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>Índice de puntualidad</div>
          </div>
        </div>

        <div style={{ fontSize: '0.8125rem', color: 'var(--color-gray-600)', borderTop: '1px solid var(--color-gray-100)', paddingTop: '10px' }}>
          Promedio de <strong>50 minutos</strong> por sesión individual.
        </div>
      </div>

      {/* Tarjeta de Retención y Flujo de Pacientes */}
      <div className="reports-perf-card">
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: 'var(--color-gray-900)' }}>
          🔄 Retención y Adherencia
        </h4>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-gray-500)', margin: '6px 0 16px 0' }}>
          Continuidad de los procesos terapéuticos
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-gray-700)' }}>Tasa de Retención</span>
          <span style={{ fontSize: '1.125rem', fontWeight: '700', color: '#10b981' }}>{retentionRate}%</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-gray-700)' }}>Promedio sesiones / paciente</span>
          <span style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--color-primary-600)' }}>{avgSessionsPerPatient}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem', color: 'var(--color-gray-500)', background: 'var(--color-gray-50)', padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}>
          <span>Nuevos: <strong>{newPatients}</strong></span>
          <span>Recurrentes: <strong>{returningPatients}</strong></span>
        </div>
      </div>
    </div>
  );
}
