/* ==========================================================================
   telepsychologyService.js — Capa de servicio para Telepsicología (Feature 006)
   
   Encapsula la lógica de sesiones de video, consentimientos y verificaciones.
   Mientras no exista backend, manipula datos mock con delay simulado.
   ========================================================================== */

import {
  MOCK_VIDEO_SESSIONS,
  MOCK_TELECONSENTS,
  CONSENT_DOCUMENT,
} from '../mocks/telepsychologyMock';

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms));

// Copias mutables en memoria
let sessionsStore = [...MOCK_VIDEO_SESSIONS];
let consentsStore = [...MOCK_TELECONSENTS];

/**
 * Obtiene todas las sesiones de video, opcionalmente filtradas.
 */
export async function getVideoSessions({ status, psychologistId } = {}) {
  await delay(300);

  let filtered = [...sessionsStore];

  if (status && status !== 'ALL') {
    filtered = filtered.filter(s => s.status === status);
  }

  if (psychologistId) {
    filtered = filtered.filter(s => s.psychologistId === psychologistId);
  }

  // Ordenar por fecha programada descendente
  filtered.sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt));

  return { data: filtered, total: filtered.length };
}

/**
 * Obtiene una sesión de video individual por appointmentId.
 */
export async function getVideoSession(appointmentId) {
  await delay(300);

  const session = sessionsStore.find(s => s.appointmentId === appointmentId);
  if (!session) {
    throw new Error(`Sesión de video para cita ${appointmentId} no encontrada.`);
  }

  return { ...session };
}

/**
 * Obtiene el estado actual de una sesión (para polling del paciente).
 */
export async function getSessionStatus(appointmentId) {
  await delay(200);

  const session = sessionsStore.find(s => s.appointmentId === appointmentId);
  if (!session) {
    throw new Error(`Sesión no encontrada.`);
  }

  return {
    status: session.status,
    startedAt: session.startedAt,
    endedAt: session.endedAt,
  };
}

/**
 * Inicia una sesión de video (psicólogo).
 * Cambia el estado de WAITING a ACTIVE.
 */
export async function startSession(appointmentId) {
  await delay(600);

  const index = sessionsStore.findIndex(s => s.appointmentId === appointmentId);
  if (index === -1) throw new Error('Sesión no encontrada.');

  const session = sessionsStore[index];
  if (session.status !== 'WAITING') {
    throw new Error(`Solo se pueden iniciar sesiones en estado WAITING. Estado actual: ${session.status}`);
  }

  const updated = {
    ...session,
    status: 'ACTIVE',
    startedAt: new Date().toISOString(),
  };

  sessionsStore[index] = updated;
  return { ...updated };
}

/**
 * Finaliza una sesión de video (psicólogo).
 * Cambia el estado de ACTIVE a ENDED.
 */
export async function endSession(appointmentId) {
  await delay(600);

  const index = sessionsStore.findIndex(s => s.appointmentId === appointmentId);
  if (index === -1) throw new Error('Sesión no encontrada.');

  const session = sessionsStore[index];
  if (session.status !== 'ACTIVE') {
    throw new Error(`Solo se pueden finalizar sesiones activas. Estado actual: ${session.status}`);
  }

  const endedAt = new Date().toISOString();
  const startTime = new Date(session.startedAt);
  const endTime = new Date(endedAt);
  const durationMinutes = Math.round((endTime - startTime) / 60000);

  const updated = {
    ...session,
    status: 'ENDED',
    endedAt,
    duration: durationMinutes,
  };

  sessionsStore[index] = updated;
  return { ...updated };
}

/**
 * Verifica si un paciente ya firmó el consentimiento de telepsicología.
 */
export async function hasConsent(patientId) {
  await delay(200);

  const consent = consentsStore.find(
    c => c.patientId === patientId && c.version === CONSENT_DOCUMENT.version
  );

  return {
    hasConsent: !!consent,
    consentVersion: CONSENT_DOCUMENT.version,
    signedAt: consent?.signedAt || null,
  };
}

/**
 * Registra la firma del consentimiento informado de telepsicología.
 */
export async function signConsent(patientId, patientName) {
  await delay(600);

  // Verificar si ya existe
  const existing = consentsStore.find(
    c => c.patientId === patientId && c.version === CONSENT_DOCUMENT.version
  );

  if (existing) {
    throw new Error('El consentimiento ya fue firmado para esta versión.');
  }

  const newConsent = {
    id: `tc-${Date.now()}`,
    patientId,
    patientName: patientName || 'Paciente',
    signedAt: new Date().toISOString(),
    version: CONSENT_DOCUMENT.version,
    ipAddress: '192.168.xxx.xxx',
    userAgent: navigator.userAgent,
  };

  consentsStore.push(newConsent);
  return { ...newConsent };
}

/**
 * Obtiene el documento de consentimiento actual.
 */
export async function getConsentDocument() {
  await delay(200);
  return { ...CONSENT_DOCUMENT };
}

/**
 * Obtiene el historial de consentimientos de un paciente.
 */
export async function getPatientConsents(patientId) {
  await delay(300);
  return consentsStore.filter(c => c.patientId === patientId);
}
