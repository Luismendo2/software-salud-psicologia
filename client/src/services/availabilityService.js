/* ==========================================================================
   availabilityService.js — Capa de acceso a datos de disponibilidad
   
   Maneja las reglas de disponibilidad (horarios del psicólogo)
   y los slots libres para la página de reserva pública.
   ========================================================================== */

import { mockAvailabilityRules, mockAvailableSlots } from '../mocks/appointmentsMock';
// import api from './api';

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Obtiene las reglas de disponibilidad del psicólogo.
 * @returns {Promise<Array>} Reglas por día de la semana
 */
export async function getAvailabilityRules() {
  await delay();
  return [...mockAvailabilityRules];
}

/**
 * Actualiza las reglas de disponibilidad.
 * Futuro: return api.put('/availability-rules', rules);
 * @param {Array} rules - Nuevas reglas
 * @returns {Promise<Array>} Reglas actualizadas
 */
export async function updateAvailabilityRules(rules) {
  await delay(500);
  return rules;
}

/**
 * Obtiene los horarios disponibles para una fecha específica.
 * En el backend real, esto calcula los slots al vuelo restando
 * las citas existentes y los bloqueos de las reglas de disponibilidad.
 * 
 * @param {string} psychologistId - ID del psicólogo
 * @param {string} date - Fecha ISO del día a consultar
 * @returns {Promise<string[]>} Arreglo de horas disponibles (ej. ['09:00', '10:15'])
 */
export async function getAvailableSlots(psychologistId, date) {
  await delay();
  return [...mockAvailableSlots];
}
