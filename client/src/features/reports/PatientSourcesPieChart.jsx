/* ==========================================================================
   PatientSourcesPieChart.jsx — Gráfica circular de fuentes de captación
   ========================================================================== */

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function PatientSourcesPieChart({ sourcesData }) {
  if (!sourcesData || !sourcesData.breakdown || sourcesData.breakdown.length === 0) {
    return (
      <div className="reports-chart-card">
        <div className="reports-chart-header">
          <div>
            <h3 className="reports-chart-title">Fuentes de Captación de Pacientes</h3>
            <p className="reports-chart-subtitle">Cómo llegan los consultantes a tu consulta</p>
          </div>
        </div>
        <div className="reports-empty-state">
          <div className="reports-empty-icon">🧭</div>
          <p>No hay fuentes registradas para los pacientes ingresados en este período.</p>
        </div>
      </div>
    );
  }

  const { breakdown, total } = sourcesData;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
          padding: '8px 12px',
          fontSize: '12px',
        }}>
          <div style={{ fontWeight: '600', color: data.color }}>{data.label}</div>
          <div style={{ color: '#374151', marginTop: '2px' }}>
            {data.count} pacientes (<strong>{data.percentage}%</strong>)
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
          <h3 className="reports-chart-title">Canales de Captación de Pacientes</h3>
          <p className="reports-chart-subtitle">
            Distribución porcentual de los {total} nuevos consultantes registrados en el período
          </p>
        </div>
      </div>

      <div className="reports-sources-layout">
        {/* Gráfico circular tipo dona */}
        <div style={{ width: '100%', height: '280px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={breakdown}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={4}
              >
                {breakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Lista detallada con porcentajes */}
        <div className="reports-sources-list">
          {breakdown.map(item => (
            <div key={item.source} className="reports-source-row">
              <div className="reports-source-badge">
                <span
                  className="reports-source-dot"
                  style={{ backgroundColor: item.color }}
                />
                <span>{item.label}</span>
              </div>
              <div className="reports-source-stats">
                <span>{item.count}</span>
                <span className="reports-source-pct">({item.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
