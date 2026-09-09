/* ==========================================================================
   ReportsDashboardPage.jsx — Panel maestro de Reportes y Estadísticas (010)
   ========================================================================== */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';
import * as reportsService from '../../services/reportsService';

// Subcomponentes
import DateRangeFilter from './DateRangeFilter';
import PsychologistSelector from './PsychologistSelector';
import ExportButton from './ExportButton';
import KpiCardsRow from './KpiCardsRow';
import AppointmentsTrendChart from './AppointmentsTrendChart';
import ClinicalProgressChart from './ClinicalProgressChart';
import PerformanceMetricsCard from './PerformanceMetricsCard';
import PatientSourcesPieChart from './PatientSourcesPieChart';

export default function ReportsDashboardPage() {
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole(['ADMIN']);

  // Pestaña activa: 'overview', 'clinical', 'performance'
  const [activeTab, setActiveTab] = useState('overview');

  // Filtros de fecha y profesional
  const [rangePreset, setRangePreset] = useState('month');
  const [customDates, setCustomDates] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
    to: new Date().toISOString().slice(0, 10),
  });
  const [psychologists, setPsychologists] = useState([]);
  const [selectedPsychologist, setSelectedPsychologist] = useState('all');

  // Estados de carga y datos
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [clinicalData, setClinicalData] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [sourcesData, setSourcesData] = useState(null);

  // Cargar lista de psicólogos si es admin
  useEffect(() => {
    if (isAdmin) {
      reportsService.getPsychologistsFilter().then(list => setPsychologists(list));
    }
  }, [isAdmin]);

  // Carga de datos unificada
  const loadReportsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = {
        rangePreset,
        psychologistId: isAdmin ? selectedPsychologist : (user?.id || 'usr-1'),
      };

      const [dashRes, clinRes, perfRes, srcRes] = await Promise.all([
        reportsService.getDashboardReport(queryParams),
        reportsService.getClinicalProgressReport(queryParams),
        reportsService.getPerformanceReport(queryParams),
        reportsService.getPatientSourcesReport(queryParams),
      ]);

      setDashboardData(dashRes.data);
      setClinicalData(clinRes.data);
      setPerformanceData(perfRes.data);
      setSourcesData(srcRes.data);
    } catch (err) {
      console.error('Error cargando reportes:', err);
      setError('Ocurrió un inconveniente al consultar las métricas. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [rangePreset, selectedPsychologist, isAdmin, user?.id]);

  useEffect(() => {
    loadReportsData();
  }, [loadReportsData]);

  const handleCustomDateChange = (field, value) => {
    setCustomDates(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="page-container reports-page">
      {/* ── Encabezado de la página ── */}
      <div className="page-header" style={{ marginBottom: 'var(--space-md)' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>📊</span> Reportes y Estadísticas
        </h1>
        <p className="page-subtitle">
          Panel analítico de actividad clínica, desempeño profesional y métricas de atención
        </p>
      </div>

      {/* ── Barra superior de controles globales ── */}
      <div className="reports-header-controls">
        <div className="reports-filters-wrapper">
          <DateRangeFilter
            preset={rangePreset}
            onPresetChange={setRangePreset}
            customDates={customDates}
            onCustomDateChange={handleCustomDateChange}
          />

          {isAdmin && (
            <PsychologistSelector
              psychologists={psychologists}
              selectedId={selectedPsychologist}
              onChange={setSelectedPsychologist}
            />
          )}
        </div>

        <div className="reports-header-actions">
          <ExportButton
            reportType={activeTab}
            rangePreset={rangePreset}
            psychologistId={isAdmin ? selectedPsychologist : (user?.id || 'usr-1')}
          />
        </div>
      </div>

      {/* ── Navegación por pestañas temáticas ── */}
      <div className="reports-tabs-nav">
        <button
          type="button"
          className={`reports-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span>📈</span>
          <span>Resumen y Actividad</span>
        </button>
        <button
          type="button"
          className={`reports-tab-btn ${activeTab === 'clinical' ? 'active' : ''}`}
          onClick={() => setActiveTab('clinical')}
        >
          <span>🧠</span>
          <span>Progreso Clínico (MBC)</span>
        </button>
        <button
          type="button"
          className={`reports-tab-btn ${activeTab === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveTab('performance')}
        >
          <span>⏱️</span>
          <span>Desempeño y Metas</span>
        </button>
      </div>

      {/* ── Mensaje de Error si ocurre ── */}
      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#991b1b',
          padding: 'var(--space-md) var(--space-lg)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--space-lg)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span>{error}</span>
          <button className="btn btn-outline-secondary btn-sm" onClick={loadReportsData}>
            Reintentar
          </button>
        </div>
      )}

      {/* ── Estado de Carga (Skeleton Loaders) ── */}
      {loading ? (
        <div>
          <div className="reports-kpis-grid">
            <div className="reports-skeleton-card" />
            <div className="reports-skeleton-card" />
            <div className="reports-skeleton-card" />
            <div className="reports-skeleton-card" />
          </div>
          <div className="reports-skeleton-chart" style={{ marginBottom: 'var(--space-xl)' }} />
        </div>
      ) : (
        <>
          {/* ── Pestaña 1: Resumen General y Citas ── */}
          {activeTab === 'overview' && (
            <div>
              <KpiCardsRow data={dashboardData} />
              <AppointmentsTrendChart trendData={dashboardData?.trend} />
              <PatientSourcesPieChart sourcesData={sourcesData} />
            </div>
          )}

          {/* ── Pestaña 2: Progreso Clínico ── */}
          {activeTab === 'clinical' && (
            <div>
              <ClinicalProgressChart clinicalData={clinicalData} />
              <div style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-gray-200)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-lg)',
                fontSize: '0.875rem',
                color: 'var(--color-gray-600)',
                lineHeight: '1.6'
              }}>
                <h4 style={{ margin: '0 0 8px 0', color: 'var(--color-gray-900)', fontSize: '0.9375rem' }}>
                  ℹ️ Criterios de Privacidad en Medición Basada en Evidencia (MBC)
                </h4>
                <p style={{ margin: 0 }}>
                  Las gráficas de progreso clínico agregan las evaluaciones completadas de todos los consultantes en el período seleccionado. Por normativa de privacidad y el estándar HIPAA/Resolución 2654, los datos se encuentran completamente anonimizados, agrupando puntos con muestra estadística suficiente (\(n \ge 5\)) sin revelar identificadores directos ni historias clínicas individuales.
                </p>
              </div>
            </div>
          )}

          {/* ── Pestaña 3: Desempeño y Metas ── */}
          {activeTab === 'performance' && (
            <div>
              <PerformanceMetricsCard performanceData={performanceData} />
              <AppointmentsTrendChart trendData={dashboardData?.trend} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
