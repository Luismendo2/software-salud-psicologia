/* ==========================================================================
   matchingService.js — Servicio de Matching Inteligente (Feature 012)
   Algoritmo de recomendación heurística para sugerir el mejor terapeuta.
   ========================================================================== */

import { MOCK_PSYCHOLOGISTS_PROFILES, CONSULTATION_REASONS } from '../mocks/matchingMock';

const delay = (ms = 350) => new Promise(r => setTimeout(r, ms));

/**
 * Normaliza y divide texto en tokens simples
 */
function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar tildes
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

/**
 * Encuentra los mejores terapeutas según motivo, modalidad y disponibilidad (CA-01 a CA-05)
 */
export async function matchTherapists({
  reasonId = '',
  customText = '',
  modality = 'ANY', // 'VIRTUAL', 'PRESENCIAL', 'ANY'
  timeSlot = 'ANY', // 'MORNING', 'AFTERNOON', 'WEEKEND', 'ANY'
}) {
  await delay(400);

  // 1. Filtrar por modalidad y disponibilidad (CA-03)
  let candidates = MOCK_PSYCHOLOGISTS_PROFILES.filter((psy) => {
    if (modality !== 'ANY' && !psy.modalities.includes(modality)) {
      return false;
    }
    if (timeSlot !== 'ANY' && !psy.availabilitySlots.includes(timeSlot)) {
      return false;
    }
    return true;
  });

  // Si el filtro estricto deja sin candidatos, relajamos slot para garantizar sugerencias
  if (candidates.length === 0) {
    candidates = MOCK_PSYCHOLOGISTS_PROFILES.filter((psy) => {
      return modality === 'ANY' || psy.modalities.includes(modality);
    });
  }

  // 2. Extraer palabras clave de búsqueda
  const selectedReasonObj = CONSULTATION_REASONS.find((r) => r.id === reasonId);
  const predefinedTags = selectedReasonObj ? selectedReasonObj.tags : [];
  const textTokens = tokenize(customText);
  const queryTokens = Array.from(new Set([...predefinedTags, ...textTokens]));

  // 3. Calcular afinidad por palabras clave (Match Score)
  const scored = candidates.map((psy) => {
    let scorePoints = 0;
    const matchingTags = [];

    queryTokens.forEach((token) => {
      // Coincidencia en tags
      if (psy.tags.some((t) => t.includes(token) || token.includes(t))) {
        scorePoints += 25;
        matchingTags.push(token);
      }
      // Coincidencia en especialidades directas
      if (psy.specialties.some((s) => s.toLowerCase().includes(token))) {
        scorePoints += 35;
        matchingTags.push(token);
      }
    });

    // Bonificación si el enfoque es idóneo para el motivo (ej. TCC para ansiedad, Sistémica para pareja)
    if (reasonId === 'anxiety' && psy.approaches.includes('TCC')) scorePoints += 20;
    if (reasonId === 'couple' && psy.approaches.includes('Sistémica')) scorePoints += 25;
    if (reasonId === 'self_esteem' && psy.approaches.includes('Gestalt')) scorePoints += 20;
    if (reasonId === 'children' && psy.approaches.includes('Neuropsicología')) scorePoints += 30;

    // Calcular porcentaje de afinidad (mínimo base 60% si califica por disponibilidad, máx 98%)
    let matchPercentage = 0;
    if (queryTokens.length > 0 && scorePoints > 0) {
      matchPercentage = Math.min(98, Math.max(72, 70 + Math.round(scorePoints * 0.45)));
    } else {
      // CA-02: Si la puntuación de afinidad es 0, score base ordenado por disponibilidad
      matchPercentage = 65;
    }

    return {
      ...psy,
      scorePoints,
      matchPercentage,
      matchingTags: Array.from(new Set(matchingTags)),
    };
  });

  // 4. Ordenar: de mayor a menor puntuación (CA-01, CA-02)
  scored.sort((a, b) => b.scorePoints - a.scorePoints || b.matchPercentage - a.matchPercentage);

  // 5. Retornar entre 1 y 3 terapeutas (CA-01)
  return scored.slice(0, 3);
}

export { CONSULTATION_REASONS };
