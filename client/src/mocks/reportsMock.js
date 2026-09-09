/* ==========================================================================
   reportsMock.js — Datos simulados para Reportes y Estadísticas (Feature 010)
   ========================================================================== */

export const MOCK_PSYCHOLOGISTS_FILTER = [
  { id: 'all', name: 'Todos los profesionales (Consolidado)' },
  { id: 'usr-1', name: 'Dra. María López' },
  { id: 'usr-5', name: 'Dr. Julián Torres' },
  { id: 'usr-6', name: 'Dra. Patricia Vargas' },
];

export const PATIENT_SOURCE_LABELS = {
  REFERRAL: { label: 'Referidos / Recomendación', color: '#3b82f6', bg: '#dbeafe' },
  SOCIAL_MEDIA: { label: 'Redes Sociales (Instagram/TikTok)', color: '#ec4899', bg: '#fce7f3' },
  DIRECT: { label: 'Búsqueda Directa (Google Maps)', color: '#10b981', bg: '#d1fae5' },
  WEBSITE: { label: 'Sitio Web / Portal PsiAgenda', color: '#8b5cf6', bg: '#ede9fe' },
  OTHER: { label: 'Otros canales', color: '#f59e0b', bg: '#fef3c7' },
};

/**
 * Genera datos dinámicos simulados según el preset o rango y psicólogo seleccionado
 */
export function generateDashboardData(rangePreset = 'month', psychologistId = 'all') {
  const isIndividual = psychologistId !== 'all';
  const multiplier = isIndividual ? 0.45 : 1.0;

  if (rangePreset === 'month') {
    return {
      period: { from: '2026-06-01', to: '2026-06-30', label: 'Este mes (Junio 2026)' },
      totalAppointments: Math.round(58 * multiplier),
      completedAppointments: Math.round(48 * multiplier),
      cancelledAppointments: Math.round(6 * multiplier),
      noShows: Math.round(4 * multiplier),
      cancellationRate: 10.3,
      activePatients: Math.round(26 * multiplier),
      totalRevenue: Math.round(7200000 * multiplier),
      trend: [
        { label: 'Sem 1', completed: Math.round(12 * multiplier), cancelled: Math.round(1 * multiplier), noShow: 0 },
        { label: 'Sem 2', completed: Math.round(11 * multiplier), cancelled: Math.round(2 * multiplier), noShow: Math.round(1 * multiplier) },
        { label: 'Sem 3', completed: Math.round(13 * multiplier), cancelled: Math.round(1 * multiplier), noShow: Math.round(2 * multiplier) },
        { label: 'Sem 4', completed: Math.round(12 * multiplier), cancelled: Math.round(2 * multiplier), noShow: Math.round(1 * multiplier) },
      ],
    };
  }

  if (rangePreset === '3months') {
    return {
      period: { from: '2026-04-01', to: '2026-06-30', label: 'Últimos 3 meses (Abr - Jun 2026)' },
      totalAppointments: Math.round(168 * multiplier),
      completedAppointments: Math.round(142 * multiplier),
      cancelledAppointments: Math.round(15 * multiplier),
      noShows: Math.round(11 * multiplier),
      cancellationRate: 8.9,
      activePatients: Math.round(54 * multiplier),
      totalRevenue: Math.round(21300000 * multiplier),
      trend: [
        { label: 'Abril', completed: Math.round(44 * multiplier), cancelled: Math.round(5 * multiplier), noShow: Math.round(4 * multiplier) },
        { label: 'Mayo', completed: Math.round(50 * multiplier), cancelled: Math.round(4 * multiplier), noShow: Math.round(3 * multiplier) },
        { label: 'Junio', completed: Math.round(48 * multiplier), cancelled: Math.round(6 * multiplier), noShow: Math.round(4 * multiplier) },
      ],
    };
  }

  // 12 months o personalizado
  return {
    period: { from: '2025-07-01', to: '2026-06-30', label: 'Últimos 12 meses' },
    totalAppointments: Math.round(620 * multiplier),
    completedAppointments: Math.round(530 * multiplier),
    cancelledAppointments: Math.round(52 * multiplier),
    noShows: Math.round(38 * multiplier),
    cancellationRate: 8.4,
    activePatients: Math.round(128 * multiplier),
    totalRevenue: Math.round(79500000 * multiplier),
    trend: [
      { label: 'Jul', completed: Math.round(38 * multiplier), cancelled: 4, noShow: 3 },
      { label: 'Ago', completed: Math.round(42 * multiplier), cancelled: 3, noShow: 2 },
      { label: 'Sep', completed: Math.round(40 * multiplier), cancelled: 5, noShow: 4 },
      { label: 'Oct', completed: Math.round(45 * multiplier), cancelled: 4, noShow: 3 },
      { label: 'Nov', completed: Math.round(44 * multiplier), cancelled: 5, noShow: 3 },
      { label: 'Dic', completed: Math.round(36 * multiplier), cancelled: 6, noShow: 5 },
      { label: 'Ene', completed: Math.round(43 * multiplier), cancelled: 4, noShow: 3 },
      { label: 'Feb', completed: Math.round(47 * multiplier), cancelled: 3, noShow: 2 },
      { label: 'Mar', completed: Math.round(51 * multiplier), cancelled: 4, noShow: 2 },
      { label: 'Abr', completed: Math.round(44 * multiplier), cancelled: 5, noShow: 4 },
      { label: 'May', completed: Math.round(50 * multiplier), cancelled: 4, noShow: 3 },
      { label: 'Jun', completed: Math.round(48 * multiplier), cancelled: 6, noShow: 4 },
    ],
  };
}

export function generateClinicalProgressData(rangePreset = 'month') {
  if (rangePreset === 'month') {
    return {
      period: { from: '2026-06-01', to: '2026-06-30' },
      series: [
        {
          type: 'PHQ-9',
          name: 'Depresión (PHQ-9)',
          color: '#3b82f6',
          points: [
            { period: 'Sem 1', avgScore: 13.8, stdDev: 3.2, sampleSize: 18 },
            { period: 'Sem 2', avgScore: 12.4, stdDev: 2.9, sampleSize: 22 },
            { period: 'Sem 3', avgScore: 11.2, stdDev: 2.8, sampleSize: 20 },
            { period: 'Sem 4', avgScore: 9.8, stdDev: 2.5, sampleSize: 24 },
          ],
        },
        {
          type: 'GAD-7',
          name: 'Ansiedad (GAD-7)',
          color: '#10b981',
          points: [
            { period: 'Sem 1', avgScore: 11.5, stdDev: 2.7, sampleSize: 19 },
            { period: 'Sem 2', avgScore: 10.1, stdDev: 2.4, sampleSize: 21 },
            { period: 'Sem 3', avgScore: 8.9, stdDev: 2.2, sampleSize: 23 },
            { period: 'Sem 4', avgScore: 7.6, stdDev: 2.0, sampleSize: 25 },
          ],
        },
      ],
    };
  }

  return {
    period: { from: '2026-01-01', to: '2026-06-30' },
    series: [
      {
        type: 'PHQ-9',
        name: 'Depresión (PHQ-9)',
        color: '#3b82f6',
        points: [
          { period: 'Ene', avgScore: 15.2, stdDev: 3.5, sampleSize: 28 },
          { period: 'Feb', avgScore: 14.1, stdDev: 3.1, sampleSize: 32 },
          { period: 'Mar', avgScore: 12.9, stdDev: 2.8, sampleSize: 35 },
          { period: 'Abr', avgScore: 11.8, stdDev: 2.9, sampleSize: 30 },
          { period: 'May', avgScore: 10.4, stdDev: 2.6, sampleSize: 34 },
          { period: 'Jun', avgScore: 9.2, stdDev: 2.3, sampleSize: 36 },
        ],
      },
      {
        type: 'GAD-7',
        name: 'Ansiedad (GAD-7)',
        color: '#10b981',
        points: [
          { period: 'Ene', avgScore: 12.8, stdDev: 3.0, sampleSize: 27 },
          { period: 'Feb', avgScore: 11.6, stdDev: 2.7, sampleSize: 30 },
          { period: 'Mar', avgScore: 10.2, stdDev: 2.5, sampleSize: 33 },
          { period: 'Abr', avgScore: 9.4, stdDev: 2.3, sampleSize: 31 },
          { period: 'May', avgScore: 8.3, stdDev: 2.1, sampleSize: 32 },
          { period: 'Jun', avgScore: 7.1, stdDev: 1.9, sampleSize: 35 },
        ],
      },
    ],
  };
}

export function generatePerformanceData(rangePreset = 'month', psychologistId = 'all') {
  const isIndividual = psychologistId !== 'all';
  const multiplier = isIndividual ? 0.45 : 1.0;

  return {
    hoursWorked: Math.round(isIndividual ? 48.0 : 118.5),
    retentionRate: 84.6,
    goalCompletion: 87.5,
    appointmentGoal: isIndividual ? 50 : 130,
    currentAppointments: Math.round(isIndividual ? 44 : 114),
    avgSessionsPerPatient: 4.8,
    newPatients: Math.round(14 * multiplier),
    returningPatients: Math.round(40 * multiplier),
    avgSessionDurationMinutes: 50,
    punctualityRate: 96.2,
  };
}

export function generatePatientSourcesData(rangePreset = 'month') {
  return {
    total: 58,
    breakdown: [
      { source: 'REFERRAL', label: 'Referidos / Recomendación', count: 23, percentage: 39.6, color: '#3b82f6' },
      { source: 'SOCIAL_MEDIA', label: 'Redes Sociales', count: 17, percentage: 29.3, color: '#ec4899' },
      { source: 'DIRECT', label: 'Búsqueda Directa', count: 11, percentage: 19.0, color: '#10b981' },
      { source: 'WEBSITE', label: 'Sitio Web PsiAgenda', count: 5, percentage: 8.6, color: '#8b5cf6' },
      { source: 'OTHER', label: 'Otros canales', count: 2, percentage: 3.5, color: '#f59e0b' },
    ],
  };
}
