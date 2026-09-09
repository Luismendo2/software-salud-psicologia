/* Datos simulados para la interfaz de Inteligencia Artificial Clínica. */

export const DSM_SYMPTOMS = [
  'Preocupación persistente',
  'Dificultad para controlar pensamientos',
  'Alteración del sueño',
  'Evitación de situaciones',
  'Ánimo bajo',
  'Irritabilidad',
  'Síntomas físicos de ansiedad',
  'Dificultad de concentración',
];

export const MOCK_TRANSCRIPTION = 'El paciente reporta que pudo realizar la presentación laboral. Describe ansiedad moderada antes de iniciar, que disminuyó al aplicar respiración diafragmática y enfocarse en el contenido preparado.';

export const MOCK_SESSION_SUMMARY = {
  objetivo: 'Revisar la experiencia de exposición laboral y consolidar recursos de afrontamiento ante la ansiedad anticipatoria.',
  intervencion: 'Se exploraron pensamientos automáticos, se reforzó la respiración diafragmática y se realizó reestructuración cognitiva.',
  resultado: 'El paciente identificó una disminución de la ansiedad durante la presentación y mayor confianza en su capacidad de afrontamiento.',
  planSiguienteSesion: 'Mantener el registro de pensamientos y practicar una nueva exposición gradual durante la semana.',
};

export const MOCK_DSM_SUGGESTIONS = [
  {
    code: '300.02',
    name: 'Trastorno de ansiedad generalizada',
    rationale: 'Los síntomas descritos son compatibles con preocupación excesiva, dificultad para controlarla y manifestaciones de tensión y sueño. Se requiere valoración clínica completa de duración, deterioro y criterios diferenciales.',
  },
  {
    code: '300.23',
    name: 'Trastorno de ansiedad social',
    rationale: 'La preocupación ante situaciones de exposición y temor a la evaluación negativa pueden ameritar explorar este diagnóstico. Deben confirmarse persistencia, evitación y afectación funcional.',
  },
];

export const MOCK_AI_INSIGHTS = {
  generatedAt: '2026-09-01T09:00:00Z',
  assessmentTypes: ['PHQ-9'],
  assessmentsAnalyzed: 4,
  summary: 'Las puntuaciones PHQ-9 muestran una tendencia sostenida de mejoría durante los últimos cuatro registros. Conviene mantener el seguimiento de síntomas residuales y reforzar las estrategias que el paciente ya está utilizando.',
};
