/* ==========================================================================
   appointmentService.js — Capa de acceso a datos de citas
   
   Abstrae las llamadas HTTP al backend para las operaciones de citas.
   Mientras no haya backend, retorna datos mock con un delay simulado
   para emular latencia de red real.
   
   Convención del proyecto: los componentes NUNCA llaman a axios
   directamente; siempre pasan por estos módulos de servicio.
   ========================================================================== */

import { mockAppointments } from '../mocks/appointmentsMock';
// import api from './api';  // Se descomenta cuando el backend exista

/**
 * Simula latencia de red para que la UI muestre loaders reales
 * durante el desarrollo.
 */
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Obtiene las citas del psicólogo en un rango de fechas.
 * 
 * Futuro:  return api.get('/appointments', { params: { from, to } });
 * @param {string} from - Fecha ISO inicio del rango
 * @param {string} to - Fecha ISO fin del rango
 * @returns {Promise<Array>} Lista de citas
 */
export async function getAppointments(from, to) {
  await delay();
  // Filtra las citas mock que caigan dentro del rango
  return mockAppointments.filter((apt) => {
    const start = new Date(apt.startTime);
    return start >= new Date(from) && start <= new Date(to);
  });
}

/**
 * Obtiene todas las citas (sin filtro de rango).
 * Usado por el calendario para la carga inicial.
 * @returns {Promise<Array>} Lista completa de citas
 */
export async function getAllAppointments() {
  await delay();
  return [...mockAppointments];
}

/**
 * Crea una nueva cita.
 * Futuro: return api.post('/appointments', data);
 * @param {Object} data - Datos de la cita
 * @returns {Promise<Object>} Cita creada con ID asignado
 */
export async function createAppointment(data) {
  await delay(500);
  const newAppointment = {
    ...data,
    id: Date.now().toString(),
    status: 'PENDING',
  };
  mockAppointments.push(newAppointment);
  return newAppointment;
}

/**
 * Actualiza una cita existente.
 * Futuro: return api.put(`/appointments/${id}`, data);
 * @param {string} id - ID de la cita
 * @param {Object} data - Campos a actualizar
 * @returns {Promise<Object>} Cita actualizada
 */
export async function updateAppointment(id, data) {
  await delay(400);
  const index = mockAppointments.findIndex((apt) => apt.id === id);
  if (index === -1) throw new Error('Cita no encontrada');
  mockAppointments[index] = { ...mockAppointments[index], ...data };
  return mockAppointments[index];
}

/**
 * Confirma una cita (cambia estado a CONFIRMED).
 * @param {string} id - ID de la cita
 */
export async function confirmAppointment(id) {
  return updateAppointment(id, { status: 'CONFIRMED' });
}

/**
 * Cancela una cita (cambia estado a CANCELLED).
 * @param {string} id - ID de la cita
 */
export async function cancelAppointment(id) {
  return updateAppointment(id, { status: 'CANCELLED' });
}
