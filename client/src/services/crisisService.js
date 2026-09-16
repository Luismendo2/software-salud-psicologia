/* ==========================================================================
   crisisService.js — Capa de servicio para Modo Crisis (Feature 012)
   Maneja la obtención/actualización del protocolo y el envío de alertas de emergencia.
   ========================================================================== */

import { MOCK_CRISIS_CONFIGS, NATIONAL_HOTLINES, MOCK_CRISIS_ALERTS_LOG } from '../mocks/crisisMock';

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms));

/**
 * Obtiene la configuración de crisis de un paciente
 */
export async function getCrisisConfig(patientId = 'p1') {
  await delay(150);
  const config = MOCK_CRISIS_CONFIGS[patientId] || {
    patientId,
    protocolSteps: [
      'Respira profundamente y busca un espacio seguro.',
      'Comunícate con tu contacto de emergencia.',
      'Si estás en peligro, llama a la Línea 106.'
    ],
    emergencyContacts: [],
    therapistName: 'Tu terapeuta tratante',
    lastUpdated: new Date().toISOString()
  };
  return {
    ...config,
    nationalHotlines: NATIONAL_HOTLINES
  };
}

/**
 * Guarda o actualiza el protocolo de crisis configurado por el terapeuta
 */
export async function saveCrisisConfig(patientId, updatedConfig) {
  await delay(400);
  MOCK_CRISIS_CONFIGS[patientId] = {
    ...MOCK_CRISIS_CONFIGS[patientId],
    ...updatedConfig,
    patientId,
    lastUpdated: new Date().toISOString()
  };
  return MOCK_CRISIS_CONFIGS[patientId];
}

/**
 * Dispara una alerta de crisis en tiempo real (SMS + Email al terapeuta)
 */
export async function triggerCrisisAlert(patientId, userDetails) {
  await delay(500);
  const alertRecord = {
    id: `alert-${Date.now()}`,
    patientId,
    patientName: userDetails?.name || 'Paciente',
    triggeredAt: new Date().toISOString(),
    ip: '190.14.24.120',
    status: 'NOTIFIED_SMS_EMAIL',
    recipient: 'maria.lopez@psiagenda.co'
  };
  MOCK_CRISIS_ALERTS_LOG.push(alertRecord);
  return {
    success: true,
    message: 'Alerta prioritaria enviada a tu terapeuta (SMS y Correo electrónico).',
    alert: alertRecord
  };
}
