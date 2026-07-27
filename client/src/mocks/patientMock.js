/* ==========================================================================
   patientMock.js — Datos simulados del portal del paciente
   
   Mock data para el desarrollo del frontend Feature 002.
   Simula la respuesta de los endpoints /api/v1/patients/me/*
   ========================================================================== */

export const MOCK_PATIENT_PROFILE = {
  id: 'pat-001',
  userId: 'usr-pat-001',
  firstName: 'Camila',
  lastName: 'Rodríguez Herrera',
  email: 'camila.rodriguez@email.com',
  phone: '+57 310 456 7890',
  documentType: 'CC',
  documentNumber: '1098765432',
  dateOfBirth: '1994-03-15',
  address: 'Calle 45 #23-10, Bucaramanga',
  emergencyContactName: 'María Herrera',
  emergencyContactPhone: '+57 315 234 5678',
  profileCompleted: true,
  intakeFormCompleted: false,
  pendingConsents: ['GENERAL', 'DATOS'],
};

export const MOCK_UPCOMING_APPOINTMENTS = [
  {
    id: 'apt-u1',
    date: '2026-07-17',
    startTime: '2026-07-17T10:00:00',
    endTime: '2026-07-17T11:00:00',
    status: 'CONFIRMED',
    type: 'PRESENCIAL',
    psychologistName: 'Dr. Andrés Mendoza',
    notes: '',
  },
  {
    id: 'apt-u2',
    date: '2026-07-24',
    startTime: '2026-07-24T10:00:00',
    endTime: '2026-07-24T11:00:00',
    status: 'PENDING',
    type: 'VIRTUAL',
    psychologistName: 'Dr. Andrés Mendoza',
    notes: '',
  },
];

export const MOCK_PAST_APPOINTMENTS = [
  {
    id: 'apt-p1',
    date: '2026-07-03',
    startTime: '2026-07-03T10:00:00',
    endTime: '2026-07-03T11:00:00',
    status: 'COMPLETED',
    type: 'PRESENCIAL',
    psychologistName: 'Dr. Andrés Mendoza',
  },
  {
    id: 'apt-p2',
    date: '2026-06-26',
    startTime: '2026-06-26T10:00:00',
    endTime: '2026-06-26T11:00:00',
    status: 'COMPLETED',
    type: 'VIRTUAL',
    psychologistName: 'Dr. Andrés Mendoza',
  },
  {
    id: 'apt-p3',
    date: '2026-06-19',
    startTime: '2026-06-19T10:00:00',
    endTime: '2026-06-19T11:00:00',
    status: 'NO_SHOW',
    type: 'PRESENCIAL',
    psychologistName: 'Dr. Andrés Mendoza',
  },
  {
    id: 'apt-p4',
    date: '2026-06-12',
    startTime: '2026-06-12T09:00:00',
    endTime: '2026-06-12T10:00:00',
    status: 'CANCELLED',
    type: 'PRESENCIAL',
    psychologistName: 'Dr. Andrés Mendoza',
  },
  {
    id: 'apt-p5',
    date: '2026-06-05',
    startTime: '2026-06-05T10:00:00',
    endTime: '2026-06-05T11:00:00',
    status: 'COMPLETED',
    type: 'PRESENCIAL',
    psychologistName: 'Dr. Andrés Mendoza',
  },
];

export const MOCK_INVOICES = [
  {
    id: 'inv-001',
    appointmentId: 'apt-u1',
    date: '2026-07-17',
    concept: 'Sesión de psicología — Presencial',
    amount: 150000,
    status: 'PENDING',
    psychologistName: 'Dr. Andrés Mendoza',
  },
  {
    id: 'inv-002',
    appointmentId: 'apt-p1',
    date: '2026-07-03',
    concept: 'Sesión de psicología — Presencial',
    amount: 150000,
    status: 'PAID',
    paidAt: '2026-07-03T12:30:00',
    psychologistName: 'Dr. Andrés Mendoza',
  },
  {
    id: 'inv-003',
    appointmentId: 'apt-p2',
    date: '2026-06-26',
    concept: 'Sesión de psicología — Virtual',
    amount: 120000,
    status: 'PAID',
    paidAt: '2026-06-26T11:45:00',
    psychologistName: 'Dr. Andrés Mendoza',
  },
  {
    id: 'inv-004',
    appointmentId: 'apt-p5',
    date: '2026-06-05',
    concept: 'Sesión de psicología — Presencial',
    amount: 150000,
    status: 'PAID',
    paidAt: '2026-06-05T11:00:00',
    psychologistName: 'Dr. Andrés Mendoza',
  },
];

export const MOCK_CONSENTS = [
  {
    type: 'GENERAL',
    title: 'Consentimiento informado general',
    description: 'Autoriza el inicio del proceso terapéutico, establece los alcances y límites de la relación profesional.',
    signed: false,
    version: '1.0',
    body: `CONSENTIMIENTO INFORMADO PARA ATENCIÓN PSICOLÓGICA

Yo, el/la abajo firmante, declaro que:

1. He sido informado/a sobre el proceso de atención psicológica que se me ofrece, incluyendo sus objetivos, métodos y duración estimada.

2. Entiendo que la información compartida durante las sesiones es confidencial, con las excepciones previstas por la ley colombiana (riesgo para la vida del consultante o de terceros, orden judicial).

3. Comprendo que tengo derecho a interrumpir el proceso en cualquier momento, comunicándolo previamente al profesional tratante.

4. Acepto que los honorarios profesionales son de $150.000 COP por sesión presencial y $120.000 COP por sesión virtual, pagaderos antes o al finalizar cada sesión.

5. Entiendo que la cancelación de citas debe realizarse con al menos 24 horas de anticipación. De lo contrario, se podrá cobrar el valor de la sesión.

6. Autorizo al profesional a registrar información clínica relevante en la historia clínica digital, conforme a la Resolución 1995 de 1999 del Ministerio de Salud de Colombia.`,
  },
  {
    type: 'DATOS',
    title: 'Autorización de tratamiento de datos personales',
    description: 'Cumplimiento de la Ley 1581 de 2012 sobre protección de datos personales en Colombia.',
    signed: false,
    version: '1.0',
    body: `AUTORIZACIÓN DE TRATAMIENTO DE DATOS PERSONALES

En cumplimiento de la Ley Estatutaria 1581 de 2012 y su decreto reglamentario 1377 de 2013, autorizo de manera voluntaria, previa, explícita e informada al profesional de psicología a:

1. Recolectar, almacenar, usar y procesar mis datos personales y datos sensibles de salud con el fin exclusivo de brindar atención psicológica profesional.

2. Los datos serán almacenados en un sistema digital con medidas de seguridad adecuadas (cifrado en reposo y en tránsito).

3. Mis derechos como titular incluyen: conocer, actualizar, rectificar y solicitar la supresión de mis datos.

4. Los datos no serán compartidos con terceros salvo requerimiento legal o autorización expresa del titular.

5. El responsable del tratamiento es el profesional de psicología y puede ser contactado a través de la plataforma PsiAgenda.`,
  },
  {
    type: 'TELEPSICOLOGIA',
    title: 'Consentimiento para telepsicología',
    description: 'Requerido para sesiones virtuales por videollamada.',
    signed: true,
    signedAt: '2026-05-20T14:30:00',
    version: '1.0',
    body: '',
  },
];
