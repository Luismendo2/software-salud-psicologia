/* ==========================================================================
   reportsService.js — Capa de servicio para Reportes y Estadísticas (Feature 010)
   ========================================================================== */

import {
  generateDashboardData,
  generateClinicalProgressData,
  generatePerformanceData,
  generatePatientSourcesData,
  MOCK_PSYCHOLOGISTS_FILTER,
} from '../mocks/reportsMock';

const delay = (ms = 350) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Obtiene lista de psicólogos para filtro de administrador
 */
export async function getPsychologistsFilter() {
  await delay(150);
  return MOCK_PSYCHOLOGISTS_FILTER;
}

/**
 * GET /api/v1/reports/dashboard
 */
export async function getDashboardReport({ rangePreset = 'month', psychologistId = 'all' } = {}) {
  await delay();
  const data = generateDashboardData(rangePreset, psychologistId);
  return { success: true, data };
}

/**
 * GET /api/v1/reports/clinical-progress
 */
export async function getClinicalProgressReport({ rangePreset = 'month', psychologistId = 'all' } = {}) {
  await delay();
  const data = generateClinicalProgressData(rangePreset);
  return { success: true, data };
}

/**
 * GET /api/v1/reports/performance
 */
export async function getPerformanceReport({ rangePreset = 'month', psychologistId = 'all' } = {}) {
  await delay();
  const data = generatePerformanceData(rangePreset, psychologistId);
  return { success: true, data };
}

/**
 * GET /api/v1/reports/patient-sources
 */
export async function getPatientSourcesReport({ rangePreset = 'month', psychologistId = 'all' } = {}) {
  await delay();
  const data = generatePatientSourcesData(rangePreset);
  return { success: true, data };
}

/**
 * GET /api/v1/reports/export
 * Simula la generación y descarga en CSV o PDF
 */
export async function exportReport({ type = 'csv', report = 'dashboard', rangePreset = 'month', psychologistId = 'all' }) {
  await delay(600);

  const timestamp = new Date().toISOString().slice(0, 10);
  const fileName = `reporte_${report}_${timestamp}.${type}`;

  if (type === 'csv') {
    let csvContent = '';
    
    if (report === 'dashboard') {
      const { data } = await getDashboardReport({ rangePreset, psychologistId });
      csvContent = 'Periodo,Completadas,Canceladas,Inasistencias\n';
      data.trend.forEach(t => {
        csvContent += `"${t.label}",${t.completed},${t.cancelled},${t.noShow}\n`;
      });
    } else if (report === 'clinical') {
      const { data } = await getClinicalProgressReport({ rangePreset, psychologistId });
      csvContent = 'Instrumento,Periodo,Puntaje_Promedio,Desv_Estandar,Muestra_N\n';
      data.series.forEach(s => {
        s.points.forEach(p => {
          csvContent += `"${s.name}","${p.period}",${p.avgScore},${p.stdDev},${p.sampleSize}\n`;
        });
      });
    } else if (report === 'sources') {
      const { data } = await getPatientSourcesReport({ rangePreset, psychologistId });
      csvContent = 'Fuente_Captacion,Cantidad,Porcentaje\n';
      data.breakdown.forEach(b => {
        csvContent += `"${b.label}",${b.count},${b.percentage}%\n`;
      });
    } else {
      const { data } = await getPerformanceReport({ rangePreset, psychologistId });
      csvContent = 'Metrica,Valor\n';
      csvContent += `"Horas Trabajadas",${data.hoursWorked}\n`;
      csvContent += `"Tasa de Retencion",${data.retentionRate}%\n`;
      csvContent += `"Cumplimiento de Meta",${data.goalCompletion}%\n`;
      csvContent += `"Promedio Sesiones por Paciente",${data.avgSessionsPerPatient}\n`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return { success: true, fileName };
  }

  // Simulación de descarga PDF en frontend mediante ventana de impresión o archivo de texto tipificado
  const pdfNotice = `%PDF-1.4 PsiAgenda Reporte Clínico (${report.toUpperCase()})\nGenerado: ${new Date().toLocaleString('es-CO')}\n`;
  const blob = new Blob([pdfNotice], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { success: true, fileName };
}
