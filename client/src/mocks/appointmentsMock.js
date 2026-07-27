/* ==========================================================================
   appointmentsMock.js — Datos de ejemplo para desarrollo
   
   Mientras el backend no existe, estos datos alimentan el calendario
   y permiten validar visualmente todos los estados de las citas.
   
   Los estados siguen la máquina definida en la spec:
   PENDING → CONFIRMED → COMPLETED | CANCELLED | NO_SHOW
   ========================================================================== */

/**
 * Genera una fecha relativa a hoy.
 * @param {number} dayOffset - Días desde hoy (negativo = pasado)
 * @param {number} hour - Hora del día (0-23)
 * @param {number} minute - Minuto (0-59)
 * @returns {string} Fecha ISO 8601
 */
function relativeDate(dayOffset, hour, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

/**
 * Citas de ejemplo con todos los estados posibles.
 * Cada cita tiene los campos que el backend retornará según el plan.md.
 */
export const mockAppointments = [
  // ── Hoy ──
  {
    id: '1',
    patientName: 'Carlos Mendoza',
    patientId: 'p1',
    psychologistId: 'psy1',
    startTime: relativeDate(0, 9, 0),
    endTime: relativeDate(0, 10, 0),
    type: 'PRESENCIAL',
    status: 'CONFIRMED',
    notes: 'Sesión de seguimiento — ansiedad generalizada',
  },
  {
    id: '2',
    patientName: 'Laura Gutiérrez',
    patientId: 'p2',
    psychologistId: 'psy1',
    startTime: relativeDate(0, 10, 30),
    endTime: relativeDate(0, 11, 30),
    type: 'VIRTUAL',
    status: 'PENDING',
    notes: 'Primera consulta — derivación desde médico general',
  },
  {
    id: '3',
    patientName: 'Andrés Ruiz',
    patientId: 'p3',
    psychologistId: 'psy1',
    startTime: relativeDate(0, 14, 0),
    endTime: relativeDate(0, 15, 0),
    type: 'PRESENCIAL',
    status: 'CONFIRMED',
    notes: 'Terapia cognitivo-conductual — sesión 8',
  },

  // ── Mañana ──
  {
    id: '4',
    patientName: 'Valentina Ortega',
    patientId: 'p4',
    psychologistId: 'psy1',
    startTime: relativeDate(1, 8, 0),
    endTime: relativeDate(1, 9, 0),
    type: 'VIRTUAL',
    status: 'CONFIRMED',
    notes: 'Sesión de pareja (con Juan Camilo)',
  },
  {
    id: '5',
    patientName: 'Felipe Torres',
    patientId: 'p5',
    psychologistId: 'psy1',
    startTime: relativeDate(1, 11, 0),
    endTime: relativeDate(1, 12, 0),
    type: 'PRESENCIAL',
    status: 'PENDING',
    notes: '',
  },

  // ── Pasado (ayer) ──
  {
    id: '6',
    patientName: 'Sofía Ramírez',
    patientId: 'p6',
    psychologistId: 'psy1',
    startTime: relativeDate(-1, 9, 0),
    endTime: relativeDate(-1, 10, 0),
    type: 'PRESENCIAL',
    status: 'COMPLETED',
    notes: 'Sesión final del ciclo terapéutico',
  },
  {
    id: '7',
    patientName: 'Diego Castillo',
    patientId: 'p7',
    psychologistId: 'psy1',
    startTime: relativeDate(-1, 11, 0),
    endTime: relativeDate(-1, 12, 0),
    type: 'VIRTUAL',
    status: 'CANCELLED',
    notes: 'Paciente canceló por motivos laborales',
  },
  {
    id: '8',
    patientName: 'Ana María Vargas',
    patientId: 'p8',
    psychologistId: 'psy1',
    startTime: relativeDate(-1, 15, 0),
    endTime: relativeDate(-1, 16, 0),
    type: 'PRESENCIAL',
    status: 'NO_SHOW',
    notes: 'No se presentó. Tercer no-show consecutivo.',
  },

  // ── Próxima semana ──
  {
    id: '9',
    patientName: 'Juliana Peña',
    patientId: 'p9',
    psychologistId: 'psy1',
    startTime: relativeDate(3, 10, 0),
    endTime: relativeDate(3, 11, 0),
    type: 'PRESENCIAL',
    status: 'PENDING',
    notes: 'Evaluación psicológica inicial',
  },
  {
    id: '10',
    patientName: 'Miguel Ángel Díaz',
    patientId: 'p10',
    psychologistId: 'psy1',
    startTime: relativeDate(5, 16, 0),
    endTime: relativeDate(5, 17, 0),
    type: 'VIRTUAL',
    status: 'CONFIRMED',
    notes: 'Supervisión clínica del caso #42',
  },
];

/**
 * Reglas de disponibilidad mock.
 * Define los días y horas en que el psicólogo atiende.
 */
export const mockAvailabilityRules = [
  { id: '1', dayOfWeek: 1, dayName: 'Lunes',     active: true,  startTime: '08:00', endTime: '17:00', slotDuration: 60, pauseDuration: 15 },
  { id: '2', dayOfWeek: 2, dayName: 'Martes',     active: true,  startTime: '08:00', endTime: '17:00', slotDuration: 60, pauseDuration: 15 },
  { id: '3', dayOfWeek: 3, dayName: 'Miércoles',  active: true,  startTime: '09:00', endTime: '18:00', slotDuration: 60, pauseDuration: 15 },
  { id: '4', dayOfWeek: 4, dayName: 'Jueves',     active: true,  startTime: '08:00', endTime: '17:00', slotDuration: 60, pauseDuration: 15 },
  { id: '5', dayOfWeek: 5, dayName: 'Viernes',    active: true,  startTime: '08:00', endTime: '13:00', slotDuration: 60, pauseDuration: 15 },
  { id: '6', dayOfWeek: 6, dayName: 'Sábado',     active: false, startTime: '09:00', endTime: '12:00', slotDuration: 60, pauseDuration: 0  },
  { id: '7', dayOfWeek: 0, dayName: 'Domingo',    active: false, startTime: '00:00', endTime: '00:00', slotDuration: 60, pauseDuration: 0  },
];

/**
 * Slots disponibles mock para la página de reserva pública.
 * Simula lo que retornaría GET /api/v1/psychologists/:id/availability
 */
export const mockAvailableSlots = [
  '08:00', '09:15', '10:30', '11:45', '14:00', '15:15', '16:30',
];

/**
 * Lista de espera mock.
 */
export const mockWaitingList = [
  { id: 'w1', patientName: 'Ricardo Salazar', requestedDate: relativeDate(1, 0), createdAt: relativeDate(-2, 14), notifiedAt: null },
  { id: 'w2', patientName: 'Camila Herrera',  requestedDate: relativeDate(2, 0), createdAt: relativeDate(-1, 10), notifiedAt: null },
];
