/* ==========================================================================
   telepsychologyMock.js — Datos simulados de Telepsicología (Feature 006)
   
   Proporciona sesiones de video, consentimientos y configuraciones
   de estado para el módulo de teleconsulta de PsiAgenda.
   ========================================================================== */

/**
 * Genera una fecha relativa a la fecha actual.
 */
function relativeDate(dayOffset, hour = 10, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

/**
 * Sesiones de video simuladas vinculadas a citas virtuales.
 */
export const MOCK_VIDEO_SESSIONS = [
  {
    id: 'vs-1',
    appointmentId: 'apt-v001',
    patientId: 'pat-001',
    patientName: 'Camila Rodríguez Herrera',
    psychologistId: 'psy-001',
    psychologistName: 'Dra. María López',
    dailyRoomName: 'psiagenda-apt-v001',
    dailyRoomUrl: 'https://psiagenda.daily.co/psiagenda-apt-v001',
    status: 'ENDED',
    scheduledAt: relativeDate(-14, 10, 0),
    startedAt: relativeDate(-14, 10, 2),
    endedAt: relativeDate(-14, 10, 52),
    duration: 50,
    concept: 'Sesión individual de psicoterapia',
    notes: 'Sesión completada satisfactoriamente. Buena conexión.',
    createdAt: relativeDate(-15, 9, 0),
  },
  {
    id: 'vs-2',
    appointmentId: 'apt-v002',
    patientId: 'pat-002',
    patientName: 'Carlos Mendoza',
    psychologistId: 'psy-001',
    psychologistName: 'Dra. María López',
    dailyRoomName: 'psiagenda-apt-v002',
    dailyRoomUrl: 'https://psiagenda.daily.co/psiagenda-apt-v002',
    status: 'ENDED',
    scheduledAt: relativeDate(-10, 15, 0),
    startedAt: relativeDate(-10, 15, 1),
    endedAt: relativeDate(-10, 15, 48),
    duration: 47,
    concept: 'Evaluación psicológica - seguimiento',
    notes: 'Paciente mostró mejoría. Se recomienda continuar.',
    createdAt: relativeDate(-11, 9, 0),
  },
  {
    id: 'vs-3',
    appointmentId: 'apt-v003',
    patientId: 'pat-003',
    patientName: 'Laura Gutiérrez',
    psychologistId: 'psy-002',
    psychologistName: 'Dr. Andrés Mendoza',
    dailyRoomName: 'psiagenda-apt-v003',
    dailyRoomUrl: 'https://psiagenda.daily.co/psiagenda-apt-v003',
    status: 'ENDED',
    scheduledAt: relativeDate(-7, 11, 0),
    startedAt: relativeDate(-7, 11, 3),
    endedAt: relativeDate(-7, 11, 55),
    duration: 52,
    concept: 'Sesión de pareja - seguimiento',
    notes: null,
    createdAt: relativeDate(-8, 9, 0),
  },
  {
    id: 'vs-4',
    appointmentId: 'apt-v004',
    patientId: 'pat-004',
    patientName: 'Andrés Ruiz',
    psychologistId: 'psy-001',
    psychologistName: 'Dra. María López',
    dailyRoomName: 'psiagenda-apt-v004',
    dailyRoomUrl: 'https://psiagenda.daily.co/psiagenda-apt-v004',
    status: 'WAITING',
    scheduledAt: relativeDate(0, 15, 0),
    startedAt: null,
    endedAt: null,
    duration: null,
    concept: 'Sesión individual de psicoterapia',
    notes: null,
    createdAt: relativeDate(-1, 9, 0),
  },
  {
    id: 'vs-5',
    appointmentId: 'apt-v005',
    patientId: 'pat-005',
    patientName: 'Valentina Ortega',
    psychologistId: 'psy-002',
    psychologistName: 'Dr. Andrés Mendoza',
    dailyRoomName: 'psiagenda-apt-v005',
    dailyRoomUrl: 'https://psiagenda.daily.co/psiagenda-apt-v005',
    status: 'WAITING',
    scheduledAt: relativeDate(1, 10, 0),
    startedAt: null,
    endedAt: null,
    duration: null,
    concept: 'Primera consulta virtual',
    notes: null,
    createdAt: relativeDate(-1, 14, 0),
  },
  {
    id: 'vs-6',
    appointmentId: 'apt-v006',
    patientId: 'pat-006',
    patientName: 'Sofía Ramírez',
    psychologistId: 'psy-001',
    psychologistName: 'Dra. María López',
    dailyRoomName: 'psiagenda-apt-v006',
    dailyRoomUrl: 'https://psiagenda.daily.co/psiagenda-apt-v006',
    status: 'WAITING',
    scheduledAt: relativeDate(2, 9, 30),
    startedAt: null,
    endedAt: null,
    duration: null,
    concept: 'Seguimiento terapia cognitivo-conductual',
    notes: null,
    createdAt: relativeDate(0, 8, 0),
  },
  {
    id: 'vs-7',
    appointmentId: 'apt-v007',
    patientId: 'pat-007',
    patientName: 'Felipe Torres',
    psychologistId: 'psy-002',
    psychologistName: 'Dr. Andrés Mendoza',
    dailyRoomName: 'psiagenda-apt-v007',
    dailyRoomUrl: 'https://psiagenda.daily.co/psiagenda-apt-v007',
    status: 'WAITING',
    scheduledAt: relativeDate(3, 14, 0),
    startedAt: null,
    endedAt: null,
    duration: null,
    concept: 'Terapia familiar virtual',
    notes: null,
    createdAt: relativeDate(0, 10, 0),
  },
  {
    id: 'vs-8',
    appointmentId: 'apt-v008',
    patientId: 'pat-008',
    patientName: 'Mariana Gómez',
    psychologistId: 'psy-001',
    psychologistName: 'Dra. María López',
    dailyRoomName: 'psiagenda-apt-v008',
    dailyRoomUrl: 'https://psiagenda.daily.co/psiagenda-apt-v008',
    status: 'ERROR',
    scheduledAt: relativeDate(-3, 16, 0),
    startedAt: null,
    endedAt: null,
    duration: null,
    concept: 'Sesión individual de psicoterapia',
    notes: 'Error al crear sala: servicio Daily.co no disponible',
    createdAt: relativeDate(-4, 9, 0),
  },
];

/**
 * Registros de consentimiento informado de telepsicología.
 */
export const MOCK_TELECONSENTS = [
  {
    id: 'tc-1',
    patientId: 'pat-001',
    patientName: 'Camila Rodríguez Herrera',
    signedAt: relativeDate(-30, 9, 15),
    version: '1.0',
    ipAddress: '190.25.xxx.xxx',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126',
  },
  {
    id: 'tc-2',
    patientId: 'pat-002',
    patientName: 'Carlos Mendoza',
    signedAt: relativeDate(-15, 14, 30),
    version: '1.0',
    ipAddress: '181.49.xxx.xxx',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605',
  },
  {
    id: 'tc-3',
    patientId: 'pat-003',
    patientName: 'Laura Gutiérrez',
    signedAt: relativeDate(-10, 10, 45),
    version: '1.0',
    ipAddress: '186.83.xxx.xxx',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/128',
  },
];

/**
 * Texto del consentimiento informado para telepsicología.
 */
export const CONSENT_DOCUMENT = {
  version: '1.0',
  title: 'Consentimiento Informado para Atención Psicológica Virtual',
  sections: [
    {
      title: '1. Naturaleza del Servicio',
      content: 'La telepsicología consiste en la prestación de servicios de atención psicológica a través de tecnologías de la información y comunicación (videollamada). Este servicio se presta dentro de la plataforma PsiAgenda, utilizando tecnología de videoconferencia cifrada de extremo a extremo.'
    },
    {
      title: '2. Condiciones Técnicas',
      content: 'Para una experiencia adecuada, el paciente debe contar con: conexión a internet estable (mínimo 5 Mbps), dispositivo con cámara y micrófono funcional, y un navegador web actualizado (Chrome, Firefox, Edge o Safari). Se recomienda un espacio privado y silencioso para la sesión.'
    },
    {
      title: '3. Confidencialidad y Privacidad',
      content: 'Las sesiones virtuales están protegidas por las mismas normas de confidencialidad que aplican a las sesiones presenciales. Las videollamadas NO son grabadas ni almacenadas. Los datos de la sesión (fecha, duración, participantes) se registran únicamente con fines administrativos y clínicos, de conformidad con la Ley 1581 de 2012 de Protección de Datos Personales.'
    },
    {
      title: '4. Limitaciones',
      content: 'La atención virtual puede no ser adecuada para todas las situaciones clínicas. El profesional podrá determinar si es necesario derivar a atención presencial. En caso de emergencia psicológica o riesgo vital, el paciente debe acudir al servicio de urgencias más cercano o llamar a la línea 106.'
    },
    {
      title: '5. Protocolo de Emergencias',
      content: 'En caso de identificar una situación de riesgo durante la sesión virtual, el profesional activará el protocolo de emergencias que incluye: verificación de la ubicación del paciente, contacto con la red de apoyo previamente identificada, y derivación a servicios de emergencia si fuese necesario.'
    },
    {
      title: '6. Derechos del Paciente',
      content: 'El paciente tiene derecho a: interrumpir la sesión en cualquier momento, solicitar atención presencial como alternativa, conocer las medidas de seguridad implementadas, y revocar este consentimiento en cualquier momento sin que ello afecte su derecho a recibir atención psicológica.'
    },
  ]
};

/**
 * Configuración visual de estados de sesión de video.
 */
export const SESSION_STATUS_CONFIG = {
  WAITING: {
    label: 'En espera',
    color: '#f59e0b',
    bgColor: '#fffbeb',
    icon: '⏳',
  },
  ACTIVE: {
    label: 'En curso',
    color: '#22c55e',
    bgColor: '#f0fdf4',
    icon: '🟢',
  },
  ENDED: {
    label: 'Finalizada',
    color: '#6b7280',
    bgColor: '#f3f4f6',
    icon: '✅',
  },
  ERROR: {
    label: 'Error',
    color: '#ef4444',
    bgColor: '#fef2f2',
    icon: '❌',
  },
};
