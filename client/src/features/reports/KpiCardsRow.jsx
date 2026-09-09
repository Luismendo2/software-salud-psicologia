/* ==========================================================================
   KpiCardsRow.jsx — Fila de tarjetas KPI de alto nivel para el Dashboard
   ========================================================================== */

import React from 'react';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

export default function KpiCardsRow({ data }) {
  if (!data) return null;

  const {
    totalAppointments = 0,
    completedAppointments = 0,
    cancelledAppointments = 0,
    noShows = 0,
    cancellationRate = 0,
    activePatients = 0,
    totalRevenue = 0,
  } = data;

  return (
    <div className="reports-kpis-grid">
      {/* Citas Completadas */}
      <div className="reports-kpi-card">
        <div className="reports-kpi-icon" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
          📅
        </div>
        <div className="reports-kpi-body">
          <div className="reports-kpi-title">Citas Atendidas</div>
          <div className="reports-kpi-value">{completedAppointments}</div>
          <div className="reports-kpi-subtitle">De {totalAppointments} agendadas en total</div>
        </div>
      </div>

      {/* Ingresos Totales */}
      <div className="reports-kpi-card">
        <div className="reports-kpi-icon" style={{ background: '#dcfce7', color: '#15803d' }}>
          💰
        </div>
        <div className="reports-kpi-body">
          <div className="reports-kpi-title">Ingresos Recaudados</div>
          <div className="reports-kpi-value">{formatCurrency(totalRevenue)}</div>
          <div className="reports-kpi-subtitle">Pagos con estado PAGADO</div>
        </div>
      </div>

      {/* Pacientes Activos */}
      <div className="reports-kpi-card">
        <div className="reports-kpi-icon" style={{ background: '#ede9fe', color: '#6d28d9' }}>
          👥
        </div>
        <div className="reports-kpi-body">
          <div className="reports-kpi-title">Pacientes Activos</div>
          <div className="reports-kpi-value">{activePatients}</div>
          <div className="reports-kpi-subtitle">Con citas en el período</div>
        </div>
      </div>

      {/* Tasa de Cancelación / Inasistencias */}
      <div className="reports-kpi-card">
        <div className="reports-kpi-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
          ⚠️
        </div>
        <div className="reports-kpi-body">
          <div className="reports-kpi-title">Cancelaciones e Inasistencias</div>
          <div className="reports-kpi-value">{cancellationRate}%</div>
          <div className="reports-kpi-subtitle">{cancelledAppointments} canceladas • {noShows} no asistieron</div>
        </div>
      </div>
    </div>
  );
}
