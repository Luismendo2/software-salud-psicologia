/* ==========================================================================
   organizationMock.js — Datos mock para Equipo y Supervisión (Feature 009)
   ========================================================================== */

function relativeDate(dayOffset, hour = 10, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

/* ── Organización ── */
export const MOCK_ORGANIZATION = {
  id: 'org-1',
  name: 'Centro de Bienestar Psicológico',
  slug: 'centro-bienestar',
  ownerId: 'usr-1',
  settings: {
    clinicName: 'Centro de Bienestar Psicológico',
    logo: null,
    primaryColor: '#3b82f6',
    defaultAppointmentDuration: 60,
    address: 'Cra. 15 #93-47, Oficina 401, Bogotá D.C.',
    phone: '+57 601 555 1234',
  },
  createdAt: relativeDate(-180),
};

/* ── Miembros de la organización ── */
export const MOCK_ORG_MEMBERS = [
  {
    id: 'mem-1',
    organizationId: 'org-1',
    userId: 'usr-1',
    firstName: 'María',
    lastName: 'López',
    email: 'maria.lopez@psiagenda.co',
    role: 'OWNER',
    orgRole: 'OWNER',
    invitedAt: null,
    joinedAt: relativeDate(-180),
    isActive: true,
  },
  {
    id: 'mem-2',
    organizationId: 'org-1',
    userId: 'usr-5',
    firstName: 'Julián',
    lastName: 'Torres',
    email: 'julian.torres@psiagenda.co',
    role: 'PSYCHOLOGIST',
    orgRole: 'MEMBER',
    invitedAt: relativeDate(-90),
    joinedAt: relativeDate(-89),
    isActive: true,
  },
  {
    id: 'mem-3',
    organizationId: 'org-1',
    userId: 'usr-6',
    firstName: 'Patricia',
    lastName: 'Vargas',
    email: 'patricia.vargas@psiagenda.co',
    role: 'PSYCHOLOGIST',
    orgRole: 'SUPERVISOR',
    invitedAt: relativeDate(-120),
    joinedAt: relativeDate(-119),
    isActive: true,
  },
  {
    id: 'mem-4',
    organizationId: 'org-1',
    userId: 'usr-4',
    firstName: 'Ana',
    lastName: 'Gómez',
    email: 'ana.secretaria@psiagenda.co',
    role: 'ASSISTANT',
    orgRole: 'ASSISTANT',
    invitedAt: relativeDate(-60),
    joinedAt: relativeDate(-59),
    isActive: true,
  },
  {
    id: 'mem-5',
    organizationId: 'org-1',
    userId: 'usr-7',
    firstName: 'Ricardo',
    lastName: 'Mejía',
    email: 'ricardo.mejia@correo.co',
    role: 'PSYCHOLOGIST',
    orgRole: 'MEMBER',
    invitedAt: relativeDate(-30),
    joinedAt: relativeDate(-28),
    isActive: false, // Desactivado
  },
];

/* ── Invitaciones pendientes ── */
export const MOCK_ORG_INVITES = [
  {
    id: 'inv-1',
    organizationId: 'org-1',
    email: 'camila.herrera@correo.co',
    role: 'MEMBER',
    token: 'abc123def456ghi789',
    expiresAt: relativeDate(2),
    acceptedAt: null,
    createdAt: relativeDate(-1),
  },
  {
    id: 'inv-2',
    organizationId: 'org-1',
    email: 'diego.ramirez@correo.co',
    role: 'SUPERVISOR',
    token: 'xyz987wvu654tsr321',
    expiresAt: relativeDate(-1), // Expirada
    acceptedAt: null,
    createdAt: relativeDate(-4),
  },
];

/* ── Casos de supervisión ── */
export const MOCK_SUPERVISION_CASES = [
  {
    id: 'sc-1',
    sessionNoteId: 'note-1',
    supervisorId: 'usr-6',
    supervisorName: 'Patricia Vargas',
    superviseeId: 'usr-1',
    superviseeName: 'María López',
    organizationId: 'org-1',
    isAnonymized: true,
    status: 'PENDING_REVIEW',
    patientName: 'Carlos Mendoza',
    patientAlias: 'Paciente #6789',
    sessionDate: relativeDate(-1),
    sessionNumber: 12,
    noteExcerpt: 'Paciente reporta episodio de ansiedad intensa durante una reunión de trabajo...',
    supervisorFeedback: null,
    createdAt: relativeDate(-1, 17, 30),
    resolvedAt: null,
  },
  {
    id: 'sc-2',
    sessionNoteId: 'note-2',
    supervisorId: 'usr-6',
    supervisorName: 'Patricia Vargas',
    superviseeId: 'usr-1',
    superviseeName: 'María López',
    organizationId: 'org-1',
    isAnonymized: false,
    status: 'RESOLVED',
    patientName: 'Carlos Mendoza',
    patientAlias: null,
    sessionDate: relativeDate(-8),
    sessionNumber: 11,
    noteExcerpt: 'Se continúa con protocolo de exposición gradual. Paciente realizó 2 de 3 ejercicios...',
    supervisorFeedback: 'Buen manejo del caso. Sugiero incorporar técnicas de mindfulness para complementar la exposición gradual. El paciente muestra buena adherencia al tratamiento. Considerar reducir frecuencia de sesiones a quincenal si mantiene progreso.',
    createdAt: relativeDate(-7, 9, 0),
    resolvedAt: relativeDate(-5, 14, 0),
  },
  {
    id: 'sc-3',
    sessionNoteId: 'note-3',
    supervisorId: 'usr-6',
    supervisorName: 'Patricia Vargas',
    superviseeId: 'usr-5',
    superviseeName: 'Julián Torres',
    organizationId: 'org-1',
    isAnonymized: true,
    status: 'IN_REVIEW',
    patientName: 'Laura Gutiérrez',
    patientAlias: 'Paciente #5432',
    sessionDate: relativeDate(-3),
    sessionNumber: 4,
    noteExcerpt: 'Paciente manifiesta dificultades en la relación con su madre. Se exploran patrones de comunicación...',
    supervisorFeedback: null,
    createdAt: relativeDate(-2, 11, 0),
    resolvedAt: null,
  },
  {
    id: 'sc-4',
    sessionNoteId: 'note-4',
    supervisorId: 'usr-6',
    supervisorName: 'Patricia Vargas',
    superviseeId: 'usr-5',
    superviseeName: 'Julián Torres',
    organizationId: 'org-1',
    isAnonymized: false,
    status: 'RESOLVED',
    patientName: 'Andrés Ruiz',
    patientAlias: null,
    sessionDate: relativeDate(-14),
    sessionNumber: 7,
    noteExcerpt: 'Tercera sesión de intervención en crisis. Paciente reporta mejoría significativa en estado de ánimo...',
    supervisorFeedback: 'Excelente intervención en crisis. El abordaje fue apropiado y el plan de seguridad está bien estructurado. Recomiendo mantener el seguimiento semanal por al menos 4 semanas más antes de espaciar.',
    createdAt: relativeDate(-13, 8, 30),
    resolvedAt: relativeDate(-11, 16, 0),
  },
];

/* ── Configuraciones de roles organizacionales ── */
export const ORG_ROLE_CONFIG = {
  OWNER: { label: 'Propietario', color: '#92400e', bgColor: '#fef3c7', icon: '👑' },
  MEMBER: { label: 'Terapeuta', color: '#1e40af', bgColor: '#dbeafe', icon: '🩺' },
  SUPERVISOR: { label: 'Supervisor', color: '#7c3aed', bgColor: '#ede9fe', icon: '🎓' },
  ASSISTANT: { label: 'Asistente', color: '#0d9488', bgColor: '#f0fdfa', icon: '📋' },
};

export const SUPERVISION_STATUS_CONFIG = {
  PENDING_REVIEW: { label: 'Pendiente', color: '#d97706', bgColor: '#fef3c7', icon: '🔔' },
  IN_REVIEW: { label: 'En revisión', color: '#2563eb', bgColor: '#dbeafe', icon: '👁️' },
  RESOLVED: { label: 'Resuelto', color: '#16a34a', bgColor: '#dcfce7', icon: '✅' },
};
