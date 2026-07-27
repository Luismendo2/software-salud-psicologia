/* ==========================================================================
   patientService.js — Capa de servicio del portal del paciente
   
   Encapsula las llamadas a los endpoints /api/v1/patients/me/*.
   Mientras no exista backend, retorna datos mock con delay simulado.
   
   Regla: Los componentes NUNCA llaman a Axios directamente.
   ========================================================================== */

import {
  MOCK_PATIENT_PROFILE,
  MOCK_UPCOMING_APPOINTMENTS,
  MOCK_PAST_APPOINTMENTS,
  MOCK_INVOICES,
  MOCK_CONSENTS,
} from '../mocks/patientMock';

/** Simula latencia de red */
const delay = (ms = 400) => new Promise(r => setTimeout(r, ms));

/* ── Perfil ── */

export async function getPatientProfile() {
  await delay();
  return { ...MOCK_PATIENT_PROFILE };
}

export async function updatePatientProfile(data) {
  await delay(600);
  return { ...MOCK_PATIENT_PROFILE, ...data };
}

/* ── Citas ── */

export async function getUpcomingAppointments() {
  await delay();
  return [...MOCK_UPCOMING_APPOINTMENTS];
}

export async function getPastAppointments() {
  await delay();
  return [...MOCK_PAST_APPOINTMENTS];
}

/* ── Facturas ── */

export async function getInvoices() {
  await delay();
  return [...MOCK_INVOICES];
}

/* ── Formulario de ingreso (Intake) ── */

export async function getIntakeForm() {
  await delay();
  // Simula que no ha llenado el formulario aún
  return null;
}

export async function submitIntakeForm(data) {
  await delay(800);
  return { success: true, completedAt: new Date().toISOString(), data };
}

/* ── Consentimientos ── */

export async function getConsents() {
  await delay();
  return [...MOCK_CONSENTS];
}

export async function signConsent(type, signatureDataUrl) {
  await delay(800);
  return {
    success: true,
    type,
    signedAt: new Date().toISOString(),
    signatureUrl: signatureDataUrl,
  };
}

/* ── Pagos ── */

export async function initiatePayment(invoiceId) {
  await delay(600);
  // Simula la URL de redirección que generaría Wompi
  return {
    redirectUrl: `https://checkout.wompi.co/p/?public-key=pub_test_MOCK&currency=COP&amount-in-cents=15000000&reference=${invoiceId}`,
  };
}
