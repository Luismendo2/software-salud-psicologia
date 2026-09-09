/* ==========================================================================
   AppointmentsTrendChart.jsx — Gráfica de área para tendencia de citas
   ========================================================================== */

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function AppointmentsTrendChart({ trendData }) {
  if (!trendData || trendData.length === 0) {
    return (
      <div className="reports-chart-card">
        <div className="reports-chart-header">
          <div>
            <h3 className="reports-chart-title">Tendencia de Citas</h3>
            <p className="reports-chart-subtitle">Evolución de sesiones en el período</p>
          </div>
        </div>
        <div className="reports-empty-state">
          <div className="reports-empty-icon">📊</div>
          <p>No hay registros de citas en el rango seleccionado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-chart-card">
      <div className="reports-chart-header">
        <div>
          <h3 className="reports-chart-title">Tendencia y Cumplimiento de Citas</h3>
          <p className="reports-chart-subtitle">Distribución temporal entre completadas, canceladas e inasistencias</p>
        </div>
      </div>

      <div className="reports-chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorCancelled" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorNoShow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="label" stroke="#6b7280" fontSize={12} tickLine={false} />
            <YAxis stroke="#6b7280" fontSize={12} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
            <Area
              type="monotone"
              dataKey="completed"
              name="Completadas"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCompleted)"
            />
            <Area
              type="monotone"
              dataKey="cancelled"
              name="Canceladas"
              stroke="#f59e0b"
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#colorCancelled)"
            />
            <Area
              type="monotone"
              dataKey="noShow"
              name="Inasistencias"
              stroke="#ef4444"
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#colorNoShow)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
