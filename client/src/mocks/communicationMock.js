/* ==========================================================================
   communicationMock.js — Datos mock para Comunicación y Seguimiento (008)
   ========================================================================== */

function relativeDate(dayOffset, hour = 10, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

/* ── Conversaciones ── */
export const MOCK_CONVERSATIONS = [
  {
    id: 'conv-1',
    patientId: 'p1',
    patientName: 'Carlos Mendoza',
    psychologistId: 'psy1',
    psychologistName: 'Dra. María López',
    lastMessageAt: relativeDate(0, 9, 15),
    unreadCount: 2,
  },
  {
    id: 'conv-2',
    patientId: 'p2',
    patientName: 'Laura Gutiérrez',
    psychologistId: 'psy1',
    psychologistName: 'Dra. María López',
    lastMessageAt: relativeDate(-1, 14, 30),
    unreadCount: 0,
  },
  {
    id: 'conv-3',
    patientId: 'p3',
    patientName: 'Andrés Ruiz',
    psychologistId: 'psy1',
    psychologistName: 'Dra. María López',
    lastMessageAt: relativeDate(-3, 11, 0),
    unreadCount: 1,
  },
];

/* ── Mensajes ── */
export const MOCK_MESSAGES = {
  'conv-1': [
    { id: 'msg-1', conversationId: 'conv-1', senderId: 'psy1', senderName: 'Dra. María López', content: 'Hola Carlos, ¿cómo te fue con el ejercicio de respiración esta semana?', readAt: relativeDate(-2, 10, 5), createdAt: relativeDate(-2, 10, 0) },
    { id: 'msg-2', conversationId: 'conv-1', senderId: 'p1', senderName: 'Carlos Mendoza', content: 'Hola Dra., me fue bastante bien. Logré hacerlo 4 de 7 días. Noté que me ayuda mucho antes de las reuniones de trabajo.', readAt: relativeDate(-2, 11, 0), createdAt: relativeDate(-2, 10, 30) },
    { id: 'msg-3', conversationId: 'conv-1', senderId: 'psy1', senderName: 'Dra. María López', content: '¡Excelente progreso! 4 de 7 es muy buen inicio. Para esta semana, intenta subir a 5 días. Recuerda que la constancia es clave.', readAt: relativeDate(-1, 8, 0), createdAt: relativeDate(-2, 11, 15) },
    { id: 'msg-4', conversationId: 'conv-1', senderId: 'p1', senderName: 'Carlos Mendoza', content: 'Doctora, quería contarle que ayer tuve una presentación y usé la técnica antes de empezar. Sentí la ansiedad pero logré manejarla mucho mejor que la vez anterior.', readAt: null, createdAt: relativeDate(0, 8, 45) },
    { id: 'msg-5', conversationId: 'conv-1', senderId: 'p1', senderName: 'Carlos Mendoza', content: '¿Cree que podríamos revisar algunas técnicas adicionales en la próxima sesión?', readAt: null, createdAt: relativeDate(0, 9, 15) },
  ],
  'conv-2': [
    { id: 'msg-6', conversationId: 'conv-2', senderId: 'psy1', senderName: 'Dra. María López', content: 'Laura, recuerda que para la próxima sesión necesito que traigas el registro de sueño de esta semana.', readAt: relativeDate(-1, 15, 0), createdAt: relativeDate(-1, 14, 0) },
    { id: 'msg-7', conversationId: 'conv-2', senderId: 'p2', senderName: 'Laura Gutiérrez', content: 'Listo Dra., lo tengo anotado en mi cuaderno. ¡Nos vemos el jueves!', readAt: relativeDate(-1, 15, 10), createdAt: relativeDate(-1, 14, 30) },
  ],
  'conv-3': [
    { id: 'msg-8', conversationId: 'conv-3', senderId: 'psy1', senderName: 'Dra. María López', content: 'Andrés, te comparto unas recomendaciones de lectura sobre manejo del estrés laboral que hablamos la sesión pasada.', readAt: relativeDate(-3, 12, 0), createdAt: relativeDate(-3, 11, 0) },
    { id: 'msg-9', conversationId: 'conv-3', senderId: 'p3', senderName: 'Andrés Ruiz', content: 'Gracias Dra. Las voy a buscar esta semana. También quería preguntarle si podemos adelantar la cita del viernes al jueves.', readAt: null, createdAt: relativeDate(-2, 16, 0) },
  ],
};

/* ── Tareas Terapéuticas ── */
export const MOCK_THERAPEUTIC_TASKS = [
  {
    id: 'task-1',
    patientId: 'p1',
    patientName: 'Carlos Mendoza',
    psychologistId: 'psy1',
    title: 'Registro de pensamientos automáticos',
    description: 'Durante esta semana, cada vez que sientas ansiedad, anota: 1) La situación, 2) El pensamiento automático, 3) La emoción y su intensidad (0-10), 4) Un pensamiento alternativo.',
    dueDate: relativeDate(3),
    status: 'ASSIGNED',
    response: null,
    createdAt: relativeDate(-1),
    completedAt: null,
  },
  {
    id: 'task-2',
    patientId: 'p1',
    patientName: 'Carlos Mendoza',
    psychologistId: 'psy1',
    title: 'Práctica de respiración 4-7-8',
    description: 'Realizar el ejercicio de respiración 4-7-8 al menos una vez al día durante 5 minutos. Anotar en qué momento del día lo hiciste y cómo te sentiste después.',
    dueDate: relativeDate(-2),
    status: 'COMPLETED',
    response: 'Logré hacerlo 5 de 7 días. Los días que lo hice antes de dormir noté que me dormí más rápido. El miércoles lo hice antes de una reunión y me ayudó a sentirme más tranquilo.',
    createdAt: relativeDate(-9),
    completedAt: relativeDate(-3),
  },
  {
    id: 'task-3',
    patientId: 'p2',
    patientName: 'Laura Gutiérrez',
    psychologistId: 'psy1',
    title: 'Diario de sueño',
    description: 'Registra cada noche: hora de acostarte, hora de despertar, calidad del sueño (1-10), y si tuviste despertares nocturnos.',
    dueDate: relativeDate(1),
    status: 'IN_PROGRESS',
    response: null,
    createdAt: relativeDate(-5),
    completedAt: null,
  },
  {
    id: 'task-4',
    patientId: 'p3',
    patientName: 'Andrés Ruiz',
    psychologistId: 'psy1',
    title: 'Lectura sobre manejo del estrés',
    description: 'Leer el capítulo 3 del libro "El arte de no amargarse la vida" y anotar 3 ideas principales que te resonaron.',
    dueDate: relativeDate(-5),
    status: 'OVERDUE',
    response: null,
    createdAt: relativeDate(-12),
    completedAt: null,
  },
  {
    id: 'task-5',
    patientId: 'p1',
    patientName: 'Carlos Mendoza',
    psychologistId: 'psy1',
    title: 'Exposición gradual: preparar presentación',
    description: 'Prepara una mini-presentación de 5 minutos sobre un tema que te guste. Practícala frente al espejo al menos 2 veces y anota tu nivel de ansiedad antes y después.',
    dueDate: relativeDate(-8),
    status: 'COMPLETED',
    response: 'Preparé una presentación sobre café colombiano. La practiqué 3 veces. Primera vez: ansiedad 7/10, segunda vez: 5/10, tercera vez: 3/10. ¡Me sorprendió la mejora!',
    createdAt: relativeDate(-15),
    completedAt: relativeDate(-9),
  },
];

/* ── Encuestas de Satisfacción ── */
export const MOCK_SATISFACTION_SURVEYS = [
  { id: 'surv-1', appointmentId: '1', patientId: 'p1', patientName: 'Carlos Mendoza', psychologistId: 'psy1', npsScore: 9, comment: 'Me sentí muy escuchado y las técnicas que me enseñó me han ayudado mucho.', submittedAt: relativeDate(-7) },
  { id: 'surv-2', appointmentId: '2', patientId: 'p1', patientName: 'Carlos Mendoza', psychologistId: 'psy1', npsScore: 10, comment: 'Excelente sesión, salí sintiéndome mucho mejor.', submittedAt: relativeDate(-14) },
  { id: 'surv-3', appointmentId: '3', patientId: 'p2', patientName: 'Laura Gutiérrez', psychologistId: 'psy1', npsScore: 8, comment: 'Buena sesión, aunque me gustaría tener más tiempo.', submittedAt: relativeDate(-3) },
  { id: 'surv-4', appointmentId: '4', patientId: 'p2', patientName: 'Laura Gutiérrez', psychologistId: 'psy1', npsScore: 7, comment: '', submittedAt: relativeDate(-10) },
  { id: 'surv-5', appointmentId: '5', patientId: 'p3', patientName: 'Andrés Ruiz', psychologistId: 'psy1', npsScore: 6, comment: 'La sesión estuvo bien pero sentí que no avanzamos mucho hoy.', submittedAt: relativeDate(-5) },
  { id: 'surv-6', appointmentId: '6', patientId: 'p3', patientName: 'Andrés Ruiz', psychologistId: 'psy1', npsScore: 9, comment: 'Hoy fue una sesión muy productiva, me llevo herramientas concretas.', submittedAt: relativeDate(-12) },
  { id: 'surv-7', appointmentId: '7', patientId: 'p1', patientName: 'Carlos Mendoza', psychologistId: 'psy1', npsScore: 10, comment: '¡La mejor sesión hasta ahora!', submittedAt: relativeDate(-21) },
  { id: 'surv-8', appointmentId: '8', patientId: 'p2', patientName: 'Laura Gutiérrez', psychologistId: 'psy1', npsScore: 5, comment: 'Llegué un poco tarde y sentí la sesión corta.', submittedAt: relativeDate(-17) },
  // Encuesta pendiente (sin submittedAt)
  { id: 'surv-pending-1', appointmentId: '9', patientId: 'p1', patientName: 'Carlos Mendoza', psychologistId: 'psy1', npsScore: null, comment: null, submittedAt: null },
];

/* ── Configuración de estado de tareas ── */
export const TASK_STATUS_CONFIG = {
  ASSIGNED:    { label: 'Asignada',    color: '#2563eb', bgColor: '#dbeafe', icon: '📋' },
  IN_PROGRESS: { label: 'En progreso', color: '#d97706', bgColor: '#fef3c7', icon: '🔄' },
  COMPLETED:   { label: 'Completada',  color: '#16a34a', bgColor: '#dcfce7', icon: '✅' },
  OVERDUE:     { label: 'Vencida',     color: '#dc2626', bgColor: '#fee2e2', icon: '⏰' },
};
