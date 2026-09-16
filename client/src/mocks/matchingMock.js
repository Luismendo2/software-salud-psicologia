/* ==========================================================================
   matchingMock.js — Datos y Algoritmo de Matching Inteligente (Feature 012)
   Calcula afinidad entre motivo de consulta, disponibilidad y perfil terapéutico.
   ========================================================================== */

export const MOCK_PSYCHOLOGISTS_PROFILES = [
  {
    id: 'psy1',
    slug: 'dra-maria-lopez',
    name: 'Dra. María López',
    title: 'Psicóloga Clínica y Psicoterapeuta',
    avatarText: 'ML',
    modalities: ['VIRTUAL', 'PRESENCIAL'],
    city: 'Bogotá',
    approaches: ['TCC', 'Mindfulness'],
    specialties: ['Ansiedad', 'Pánico', 'Depresión', 'Estrés Laboral', 'Insomnio'],
    tags: [
      'ansiedad', 'panico', 'ataques de panico', 'estres', 'depresion', 'tristeza',
      'insomnio', 'dormir', 'miedo', 'angustia', 'preocupacion', 'laboral', 'burnout',
      'tcc', 'mindfulness', 'adultos'
    ],
    nextSlot: 'Mañana a las 9:00 a. m.',
    availabilityDays: ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'],
    availabilitySlots: ['MORNING', 'AFTERNOON'],
    rating: 4.9,
    reviewsCount: 48,
    bio: 'Especialista en Terapia Cognitivo-Conductual con más de 8 años acompañando procesos de ansiedad, crisis de pánico y bienestar emocional.',
  },
  {
    id: 'psy2',
    slug: 'dr-julian-sotomayor',
    name: 'Dr. Julián Sotomayor',
    title: 'Psicólogo Sistémico y Terapeuta de Pareja',
    avatarText: 'JS',
    modalities: ['VIRTUAL', 'PRESENCIAL'],
    city: 'Bogotá',
    approaches: ['Sistémica', 'Terapia Familiar'],
    specialties: ['Terapia de Pareja', 'Conflictos Familiares', 'Duelo', 'Rupturas'],
    tags: [
      'pareja', 'relacion', 'infidelidad', 'comunicacion', 'divorcio', 'separacion',
      'familia', 'duelo', 'perdida', 'hijos', 'convivencia', 'sistemica', 'adultos'
    ],
    nextSlot: 'Jueves a las 4:00 p. m.',
    availabilityDays: ['MARTES', 'JUEVES', 'SABADO'],
    availabilitySlots: ['AFTERNOON', 'WEEKEND'],
    rating: 4.85,
    reviewsCount: 39,
    bio: 'Acompañamiento a parejas y familias para sanar vínculos, restablecer la comunicación empática y transitar duelos significativos.',
  },
  {
    id: 'psy3',
    slug: 'lic-camila-restrepo',
    name: 'Lic. Camila Restrepo',
    title: 'Psicóloga Humanista y Gestáltica',
    avatarText: 'CR',
    modalities: ['VIRTUAL'],
    city: 'Medellín',
    approaches: ['Gestalt', 'Humanista'],
    specialties: ['Autoestima', 'Desarrollo Personal', 'Identidad', 'Gestión Emocional'],
    tags: [
      'autoestima', 'inseguridad', 'identidad', 'sentido de vida', 'emociones',
      'autoconocimiento', 'dependencia emocional', 'duelo', 'humanista', 'gestalt', 'jovenes'
    ],
    nextSlot: 'Viernes a las 11:00 a. m.',
    availabilityDays: ['LUNES', 'MIERCOLES', 'VIERNES'],
    availabilitySlots: ['MORNING', 'AFTERNOON'],
    rating: 4.92,
    reviewsCount: 26,
    bio: 'Enfoque experiencial y centrado en la persona para explorar bloqueos, fortalecer la autoaceptación y conectar con tus valores profundos.',
  },
  {
    id: 'psy4',
    slug: 'dr-felipe-valencia',
    name: 'Dr. Felipe Valencia',
    title: 'Neuropsicólogo e Infanto-Juvenil',
    avatarText: 'FV',
    modalities: ['PRESENCIAL'],
    city: 'Bogotá',
    approaches: ['Neuropsicología', 'TCC Infantil'],
    specialties: ['TDAH', 'Problemas de Aprendizaje', 'Conducta Infantil', 'Crianza'],
    tags: [
      'ninos', 'hijos', 'adolescentes', 'crianza', 'escuela', 'colegio', 'tdah',
      'atencion', 'conducta', 'berrinches', 'neuropsicologia', 'infantil'
    ],
    nextSlot: 'Sábado a las 10:00 a. m.',
    availabilityDays: ['MIERCOLES', 'SABADO'],
    availabilitySlots: ['MORNING', 'WEEKEND'],
    rating: 4.8,
    reviewsCount: 31,
    bio: 'Evaluación y tratamiento integral para niños y adolescentes con dificultades atencionales, emocionales o en su rendimiento escolar.',
  },
];

export const CONSULTATION_REASONS = [
  { id: 'anxiety', label: 'Ansiedad o Ataques de Pánico', tags: ['ansiedad', 'panico', 'estres'] },
  { id: 'depression', label: 'Bajo Estado de Ánimo o Tristeza', tags: ['depresion', 'tristeza', 'vacio'] },
  { id: 'couple', label: 'Problemas de Pareja o Relaciones', tags: ['pareja', 'comunicacion', 'relacion'] },
  { id: 'self_esteem', label: 'Autoestima e Inseguridad', tags: ['autoestima', 'inseguridad', 'identidad'] },
  { id: 'grief', label: 'Duelo o Pérdida Significativa', tags: ['duelo', 'perdida', 'separacion'] },
  { id: 'work_stress', label: 'Estrés Laboral o Agotamiento (Burnout)', tags: ['estres', 'laboral', 'burnout'] },
  { id: 'children', label: 'Crianza o Dificultades con Hijos', tags: ['hijos', 'crianza', 'ninos', 'conducta'] },
  { id: 'other', label: 'Otro motivo personal', tags: [] },
];
