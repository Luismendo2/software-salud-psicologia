/* ==========================================================================
   clinicalService.js — Capa de servicio para Historia Clínica (Feature 003)
   
   Encapsula las llamadas a /api/v1/clinical-records/*.
   Mientras no exista backend, retorna datos mock con delay simulado.
   
   Regla: Los componentes NUNCA llaman a Axios directamente.
   ========================================================================== */

import {
  MOCK_CLINICAL_TEMPLATES,
  MOCK_PATIENTS_LIST,
  MOCK_CLINICAL_RECORD,
  MOCK_SESSION_NOTES,
  MOCK_ATTACHMENTS,
  MOCK_GENOGRAM,
} from '../mocks/clinicalMock';

/** Simula latencia de red */
const delay = (ms = 400) => new Promise(r => setTimeout(r, ms));

/* ── Pacientes ── */

export async function getPatientsList() {
  await delay();
  return [...MOCK_PATIENTS_LIST];
}

/* ── Registro clínico ── */

export async function getClinicalRecord(patientId) {
  await delay();
  if (MOCK_CLINICAL_RECORD.patientId === patientId) {
    return { ...MOCK_CLINICAL_RECORD };
  }
  // Simula que el paciente existe pero no tiene HC aún
  const patient = MOCK_PATIENTS_LIST.find(p => p.id === patientId);
  if (patient) {
    return {
      id: null,
      patientId,
      patientName: `${patient.firstName} ${patient.lastName}`,
      psychologistId: 'psy1',
      psychologistName: 'Dra. María López',
      templateType: null,
      createdAt: null,
      diagnosis: '',
      objectives: [],
    };
  }
  return null;
}

export async function updateClinicalRecord(patientId, data) {
  await delay(500);
  return { ...MOCK_CLINICAL_RECORD, ...data };
}

/* ── Notas de sesión ── */

export async function getSessionNotes(patientId) {
  await delay();
  // Retorna notas ordenadas por fecha (más reciente primero)
  return [...MOCK_SESSION_NOTES].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
}

export async function getSessionNote(noteId) {
  await delay();
  return MOCK_SESSION_NOTES.find(n => n.id === noteId) || null;
}

export async function createSessionNote(patientId, data) {
  await delay(500);
  const newNote = {
    id: `note-${Date.now()}`,
    clinicalRecordId: 'cr-1',
    appointmentId: null,
    sessionNumber: MOCK_SESSION_NOTES.length + 1,
    templateId: data.templateId || 'tpl-3',
    date: new Date().toISOString(),
    status: 'DRAFT',
    signedAt: null,
    content: data.content || {},
  };
  return newNote;
}

export async function updateSessionNote(noteId, data) {
  await delay(300);
  const existing = MOCK_SESSION_NOTES.find(n => n.id === noteId);
  if (existing && existing.status === 'SIGNED') {
    throw new Error('No se puede modificar una nota firmada.');
  }
  return { ...existing, ...data };
}

export async function signSessionNote(noteId, signatureDataUrl) {
  await delay(600);
  const existing = MOCK_SESSION_NOTES.find(n => n.id === noteId);
  if (!existing) throw new Error('Nota no encontrada');
  return {
    ...existing,
    status: 'SIGNED',
    signedAt: new Date().toISOString(),
    signatureUrl: signatureDataUrl,
  };
}

/* ── Plantillas ── */

export async function getClinicalTemplates() {
  await delay(200);
  return [...MOCK_CLINICAL_TEMPLATES];
}

export async function getClinicalTemplate(templateId) {
  await delay(200);
  return MOCK_CLINICAL_TEMPLATES.find(t => t.id === templateId) || null;
}

/* ── Archivos adjuntos ── */

export async function getAttachments(patientId) {
  await delay();
  return [...MOCK_ATTACHMENTS];
}

export async function uploadAttachment(patientId, file) {
  // Simula subida con progreso
  await delay(1200);
  return {
    id: `att-${Date.now()}`,
    clinicalRecordId: 'cr-1',
    sessionNoteId: null,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    url: URL.createObjectURL(file),
    uploadedAt: new Date().toISOString(),
    uploadedBy: 'Dra. María López',
  };
}

export async function deleteAttachment(attachmentId) {
  await delay(400);
  return { success: true, deletedId: attachmentId };
}

/* ── Genograma ── */

export async function getGenogram(patientId) {
  await delay();
  return { ...MOCK_GENOGRAM, nodes: [...MOCK_GENOGRAM.nodes], edges: [...MOCK_GENOGRAM.edges] };
}

export async function updateGenogram(patientId, data) {
  await delay(500);
  return { ...data, savedAt: new Date().toISOString() };
}
