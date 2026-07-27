/* ==========================================================================
   clinicalMock.js — Datos de ejemplo para Historia Clínica (Feature 003)
   
   Simula registros clínicos, notas de sesión con texto enriquecido,
   plantillas terapéuticas, adjuntos y un genograma.
   
   Los datos alimentan el frontend mientras no exista backend.
   ========================================================================== */

function relativeDate(dayOffset, hour = 10, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

/* ── Plantillas clínicas ── */
export const MOCK_CLINICAL_TEMPLATES = [
  {
    id: 'tpl-1',
    name: 'Cognitivo-Conductual (TCC)',
    description: 'Estructura estándar para terapia cognitivo-conductual.',
    isDefault: true,
    fields: [
      { key: 'situacion', label: 'Situación / Evento activador', type: 'richtext' },
      { key: 'pensamientos', label: 'Pensamientos automáticos', type: 'richtext' },
      { key: 'emociones', label: 'Emociones y nivel de intensidad (0-10)', type: 'richtext' },
      { key: 'conductas', label: 'Conductas y respuestas', type: 'richtext' },
      { key: 'reestructuracion', label: 'Reestructuración cognitiva', type: 'richtext' },
      { key: 'tareas', label: 'Tareas para la próxima sesión', type: 'richtext' },
    ],
  },
  {
    id: 'tpl-2',
    name: 'Sistémico-Familiar',
    description: 'Para procesos de terapia sistémica y familiar.',
    isDefault: false,
    fields: [
      { key: 'motivo', label: 'Motivo de consulta del sistema', type: 'richtext' },
      { key: 'subsistemas', label: 'Subsistemas identificados', type: 'richtext' },
      { key: 'patrones', label: 'Patrones relacionales observados', type: 'richtext' },
      { key: 'intervenciones', label: 'Intervenciones realizadas', type: 'richtext' },
      { key: 'hipotesis', label: 'Hipótesis sistémica', type: 'richtext' },
      { key: 'plan', label: 'Plan terapéutico', type: 'richtext' },
    ],
  },
  {
    id: 'tpl-3',
    name: 'Nota libre',
    description: 'Formato abierto sin campos predefinidos.',
    isDefault: false,
    fields: [
      { key: 'contenido', label: 'Nota de sesión', type: 'richtext' },
    ],
  },
  {
    id: 'tpl-4',
    name: 'Humanista-Existencial',
    description: 'Para procesos de enfoque humanista y existencial.',
    isDefault: false,
    fields: [
      { key: 'vivencia', label: 'Vivencia y experiencia del paciente', type: 'richtext' },
      { key: 'aqui_ahora', label: 'Exploración del aquí y ahora', type: 'richtext' },
      { key: 'relacion', label: 'Relación terapéutica (transferencia)', type: 'richtext' },
      { key: 'sentido', label: 'Búsqueda de sentido y valores', type: 'richtext' },
      { key: 'observaciones', label: 'Observaciones del terapeuta', type: 'richtext' },
    ],
  },
];

/* ── Lista de pacientes del psicólogo (para navegar a su HC) ── */
export const MOCK_PATIENTS_LIST = [
  {
    id: 'p1',
    firstName: 'Carlos',
    lastName: 'Mendoza',
    document: 'CC 1.023.456.789',
    age: 34,
    lastSession: relativeDate(-1),
    totalSessions: 12,
    status: 'ACTIVE',
  },
  {
    id: 'p2',
    firstName: 'Laura',
    lastName: 'Gutiérrez',
    document: 'CC 1.098.765.432',
    age: 28,
    lastSession: relativeDate(-3),
    totalSessions: 4,
    status: 'ACTIVE',
  },
  {
    id: 'p3',
    firstName: 'Andrés',
    lastName: 'Ruiz',
    document: 'CC 1.045.678.901',
    age: 41,
    lastSession: relativeDate(-7),
    totalSessions: 8,
    status: 'ACTIVE',
  },
  {
    id: 'p6',
    firstName: 'Sofía',
    lastName: 'Ramírez',
    document: 'CC 1.067.890.123',
    age: 22,
    lastSession: relativeDate(-14),
    totalSessions: 20,
    status: 'DISCHARGED',
  },
];

/* ── Registro clínico principal de un paciente (Carlos Mendoza) ── */
export const MOCK_CLINICAL_RECORD = {
  id: 'cr-1',
  patientId: 'p1',
  patientName: 'Carlos Mendoza',
  psychologistId: 'psy1',
  psychologistName: 'Dra. María López',
  templateType: 'tpl-1',
  createdAt: relativeDate(-90),
  diagnosis: 'Trastorno de Ansiedad Generalizada (F41.1 CIE-10)',
  objectives: [
    'Reducir frecuencia de episodios de ansiedad a menos de 2 por semana.',
    'Desarrollar estrategias de afrontamiento adaptativas.',
    'Mejorar calidad de sueño a puntaje ≥ 7 en escala subjetiva.',
  ],
};

/* ── Notas de sesión ── */
export const MOCK_SESSION_NOTES = [
  {
    id: 'note-1',
    clinicalRecordId: 'cr-1',
    appointmentId: '1',
    sessionNumber: 12,
    templateId: 'tpl-1',
    date: relativeDate(-1),
    status: 'SIGNED',
    signedAt: relativeDate(-1, 17),
    content: {
      situacion: '<p>Paciente reporta <strong>episodio de ansiedad intensa</strong> el viernes pasado durante una reunión de trabajo donde debía presentar un informe ante su jefe y compañeros.</p>',
      pensamientos: '<p>\"Van a notar que estoy nervioso\", \"Voy a olvidar lo que tengo que decir\", \"Todos van a pensar que soy incompetente\".</p><p>Nivel de credibilidad inicial: <strong>85/100</strong></p>',
      emociones: '<p>Ansiedad: <strong>8/10</strong><br/>Miedo: <strong>7/10</strong><br/>Vergüenza: <strong>6/10</strong></p>',
      conductas: '<p>Evitó contacto visual, habló muy rápido, sudoración excesiva en las manos. Salió rápidamente al terminar sin esperar preguntas.</p>',
      reestructuracion: '<p>Se trabajó con el registro de pensamiento. Se identificó la <em>lectura de mente</em> como distorsión cognitiva principal.</p><ul><li>Pensamiento alternativo: \"Es normal sentir nervios, pero ya he presentado antes con buenos resultados\"</li><li>Nivel de credibilidad post-reestructuración: <strong>45/100</strong></li></ul>',
      tareas: '<p>1. Practicar la técnica de respiración 4-7-8 antes de situaciones estresantes.<br/>2. Llevar registro de pensamientos automáticos durante la semana.<br/>3. Preparar la próxima presentación con ensayos previos (exposición gradual).</p>',
    },
  },
  {
    id: 'note-2',
    clinicalRecordId: 'cr-1',
    appointmentId: null,
    sessionNumber: 11,
    templateId: 'tpl-1',
    date: relativeDate(-8),
    status: 'SIGNED',
    signedAt: relativeDate(-8, 16, 30),
    content: {
      situacion: '<p>Paciente llegó relativamente tranquilo. Reporta haber tenido una <strong>buena semana</strong> con solo un episodio leve de ansiedad el miércoles por la noche.</p>',
      pensamientos: '<p>\"Estoy progresando\", \"Puedo manejar estas situaciones\". Se observa un cambio positivo en el diálogo interno.</p>',
      emociones: '<p>Ansiedad: <strong>3/10</strong><br/>Satisfacción: <strong>7/10</strong></p>',
      conductas: '<p>Utilizó la técnica de respiración 4-7-8 de forma autónoma cuando sintió la ansiedad subir. Logró completar su jornada sin incidentes.</p>',
      reestructuracion: '<p>Se reforzaron las ganancias terapéuticas. Se discutió el concepto de <em>prevención de recaídas</em> y la importancia de mantener las prácticas incluso cuando se siente bien.</p>',
      tareas: '<p>1. Continuar con el registro de pensamientos.<br/>2. Incorporar 15 minutos de mindfulness diario.<br/>3. Preparar la presentación de la próxima semana como ejercicio de exposición.</p>',
    },
  },
  {
    id: 'note-3',
    clinicalRecordId: 'cr-1',
    appointmentId: null,
    sessionNumber: 13,
    templateId: 'tpl-1',
    date: relativeDate(0, 14),
    status: 'DRAFT',
    signedAt: null,
    content: {
      situacion: '<p>Paciente reporta haber logrado la presentación del informe. Describe ansiedad moderada pero manejable.</p>',
      pensamientos: '',
      emociones: '',
      conductas: '',
      reestructuracion: '',
      tareas: '',
    },
  },
];

/* ── Archivos adjuntos ── */
export const MOCK_ATTACHMENTS = [
  {
    id: 'att-1',
    clinicalRecordId: 'cr-1',
    sessionNoteId: null,
    fileName: 'Remisión médico general.pdf',
    fileType: 'application/pdf',
    fileSize: 245760,
    url: '#',
    uploadedAt: relativeDate(-90),
    uploadedBy: 'Dra. María López',
  },
  {
    id: 'att-2',
    clinicalRecordId: 'cr-1',
    sessionNoteId: null,
    fileName: 'Test de Beck - Ansiedad (BAI).pdf',
    fileType: 'application/pdf',
    fileSize: 128000,
    url: '#',
    uploadedAt: relativeDate(-85),
    uploadedBy: 'Dra. María López',
  },
  {
    id: 'att-3',
    clinicalRecordId: 'cr-1',
    sessionNoteId: 'note-1',
    fileName: 'Registro de pensamientos - semana 12.jpg',
    fileType: 'image/jpeg',
    fileSize: 512000,
    url: '#',
    uploadedAt: relativeDate(-1),
    uploadedBy: 'Dra. María López',
  },
];

/* ── Genograma ──
   Estructura de datos JSONB que representa nodos (personas)
   y aristas (relaciones familiares) para el editor visual.
   La simbología sigue el estándar McGoldrick & Gerson:
   - Hombre = cuadrado, Mujer = círculo, Otro = rombo
   - Relaciones: matrimonio, divorcio, conflicto, cercanía, distancia
*/
export const MOCK_GENOGRAM = {
  nodes: [
    { id: 'gn-1', type: 'male',   label: 'Roberto\n(padre)',  x: 200, y: 50,  age: 62, deceased: false, notes: 'Hipertensión' },
    { id: 'gn-2', type: 'female', label: 'Martha\n(madre)',   x: 400, y: 50,  age: 58, deceased: false, notes: 'Antecedentes de depresión' },
    { id: 'gn-3', type: 'male',   label: 'Carlos\n(paciente)', x: 200, y: 200, age: 34, deceased: false, notes: 'TAG diagnosticado', isPatient: true },
    { id: 'gn-4', type: 'female', label: 'Andrea\n(hermana)', x: 400, y: 200, age: 30, deceased: false, notes: '' },
    { id: 'gn-5', type: 'female', label: 'Lucía\n(pareja)',   x: 50,  y: 200, age: 32, deceased: false, notes: '' },
    { id: 'gn-6', type: 'male',   label: 'Abuelo\npaterno',   x: 200, y: -100, age: 0,  deceased: true,  notes: 'Alcoholismo' },
  ],
  edges: [
    { id: 'ge-1', source: 'gn-1', target: 'gn-2', type: 'married',  label: '35 años' },
    { id: 'ge-2', source: 'gn-1', target: 'gn-3', type: 'parent',   label: '' },
    { id: 'ge-3', source: 'gn-2', target: 'gn-3', type: 'parent',   label: '' },
    { id: 'ge-4', source: 'gn-1', target: 'gn-4', type: 'parent',   label: '' },
    { id: 'ge-5', source: 'gn-2', target: 'gn-4', type: 'parent',   label: '' },
    { id: 'ge-6', source: 'gn-3', target: 'gn-5', type: 'partner',  label: '4 años' },
    { id: 'ge-7', source: 'gn-6', target: 'gn-1', type: 'parent',   label: '' },
    { id: 'ge-8', source: 'gn-1', target: 'gn-3', type: 'conflict', label: 'Conflicto' },
  ],
};
