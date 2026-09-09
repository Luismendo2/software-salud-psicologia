/* Capa de datos temporal para Feature 011. Se sustituirá por la API protegida. */

import {
  MOCK_AI_INSIGHTS,
  MOCK_DSM_SUGGESTIONS,
  MOCK_SESSION_SUMMARY,
  MOCK_TRANSCRIPTION,
} from '../mocks/aiClinicalMock';

const delay = (ms = 700) => new Promise((resolve) => setTimeout(resolve, ms));

export async function transcribeAudio(audioBlob) {
  await delay(1100);
  if (!audioBlob?.size) throw new Error('No se recibió una grabación de audio.');
  if (audioBlob.size > 25 * 1024 * 1024) throw new Error('La grabación supera el límite de 25 MB.');
  return MOCK_TRANSCRIPTION;
}

export async function generateSessionSummary(noteContent) {
  await delay(900);
  if (!noteContent || noteContent.replace(/<[^>]*>/g, '').trim().length < 50) {
    throw new Error('La nota debe tener al menos 50 caracteres para generar un resumen.');
  }
  return { ...MOCK_SESSION_SUMMARY };
}

export async function getDsmSuggestions(symptoms) {
  await delay(950);
  if (!symptoms?.trim()) throw new Error('Describe o selecciona al menos un síntoma.');
  return MOCK_DSM_SUGGESTIONS.map((suggestion) => ({ ...suggestion }));
}

export async function getAiInsights(patientId) {
  await delay(500);
  return patientId === 'p1' ? { ...MOCK_AI_INSIGHTS } : null;
}
