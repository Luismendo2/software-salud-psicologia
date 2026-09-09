/* ==========================================================================
   ClinicalProgressChart.jsx — Gráfica de evolución promedio de evaluaciones
   ========================================================================== */

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function ClinicalProgressChart({ clinicalData }) {
  if (!clinicalData || !clinicalData.series || clinicalData.series.length === 0) {
    return (
      <div className="reports-chart-card">
        <div className="reports-chart-header">
          <div>
            <h3 className="reports-chart-title">Evolución Clínica Agregada</h3>
            <p className="reports-chart-subtitle">Puntuaciones promedio en cuestionarios estandarizados</p>
          </div>
        </div>
        <div className="reports-empty-state">
          <div className="reports-empty-icon">📈</div>
          <p>No hay evaluaciones clínicas suficientes registradas para este período.</p>
        </div>
      </div>
    );
  }

  // Aplanar datos para el gráfico de líneas (asumiendo que las series comparten períodos)
  const phqSeries = clinicalData.series.find(s => s.type === 'PHQ-9');
  const gadSeries = clinicalData.series.find(s => s.type === 'GAD-7');

  const chartData = (phqSeries?.points || []).map((point, index) => {
    const gadPoint = gadSeries?.points?.[index] || {};
    return {
      period: point.period,
      phqScore: point.avgScore,
      phqStd: point.stdDev,
      phqN: point.sampleSize,
      gadScore: gadPoint.avgScore,
      gadStd: gadPoint.stdDev,
      gadN: gadPoint.sampleSize,
    };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
          padding: '10px 14px',
          fontSize: '12px',
        }}>
          <p style={{ fontWeight: '600', marginBottom: '6px', color: '#111827' }}>{label}</p>
          {payload.map((entry, idx) => (
            <div key={idx} style={{ color: entry.color, marginBottom: '4px' }}>
              <strong>{entry.name}:</strong> {entry.value} pts{' '}
              <span style={{ color: '#6b7280', fontSize: '11px' }}>
                (±{entry.payload[entry.dataKey === 'phqScore' ? 'phqStd' : 'gadStd']} | n={entry.payload[entry.dataKey === 'phqScore' ? 'phqN' : 'gadN']})
              </span>
            </div>
          ))}
          <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '6px', borderTop: '1px solid #f3f4f6', paddingTop: '4px' }}>
            🔒 Datos anonimizados agregados (sin PII)
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="reports-chart-card">
      <div className="reports-chart-header">
        <div>
          <h3 className="reports-chart-title">Evolución Clínica de Pacientes (MBC)</h3>
          <p className="reports-chart-subtitle">
            Tendencia en escalas estandarizadas PHQ-9 (Depresión) y GAD-7 (Ansiedad). Menor puntaje indica mejoría sintomática.
          </p>
        </div>
      </div>

      <div className="reports-chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 15, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="period" stroke="#6b7280" fontSize={12} tickLine={false} />
            <YAxis stroke="#6b7280" fontSize={12} tickLine={false} domain={[0, 24]} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
            <Line
              type="monotone"
              dataKey="phqScore"
              name="PHQ-9 (Depresión)"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ r: 5, strokeWidth: 2 }}
              activeDot={{ r: 7 }}
            />
            <Line
              type="monotone"
              dataKey="gadScore"
              name="GAD-7 (Ansiedad)"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 5, strokeWidth: 2 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
