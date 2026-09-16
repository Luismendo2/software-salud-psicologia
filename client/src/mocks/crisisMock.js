/* ==========================================================================
   crisisMock.js — Datos de ejemplo para Modo Crisis (Feature 012)
   Configuración de protocolos, contactos de emergencia y líneas nacionales.
   ========================================================================== */

export const NATIONAL_HOTLINES = [
  {
    id: 'col-106',
    name: 'Línea 106 (Colombia)',
    description: 'Atención psicológica gratuita y confidencial 24/7.',
    phone: '106',
    callAction: 'tel:106',
    hours: '24 horas / 7 días'
  },
  {
    id: 'col-123',
    name: 'Línea 123 (Emergencias Nacionales)',
    description: 'Atención médica y rescate inmediato en crisis agudas.',
    phone: '123',
    callAction: 'tel:123',
    hours: '24 horas / 7 días'
  }
];

export const MOCK_CRISIS_CONFIGS = {
  p1: {
    patientId: 'p1',
    patientName: 'Carlos Mendoza',
    therapistName: 'Dra. María López',
    therapistPhone: '+57 310 987 6543',
    therapistEmail: 'maria.lopez@psiagenda.co',
    protocolSteps: [
      'Siéntate en un lugar cómodo y apoya los pies firmemente en el suelo.',
      'Realiza 4 ciclos de respiración 4-7-8 (Inhala en 4s, sostén en 7s, exhala lento en 8s).',
      'Toma un vaso de agua fresca y ubica 3 objetos de color azul a tu alrededor (técnica de anclaje 5-4-3-2-1).',
      'Llama a tu contacto de apoyo primario o pulsa el botón de alerta para notificar a la Dra. María López.',
      'Si sientes que estás en riesgo inminente, llama inmediatamente a la Línea 106 o 123.'
    ],
    emergencyContacts: [
      {
        id: 'ec-1',
        name: 'Martha Mendoza',
        relationship: 'Madre',
        phone: '+57 300 123 4567'
      },
      {
        id: 'ec-2',
        name: 'Alejandro Gómez',
        relationship: 'Amigo cercano / Pareja',
        phone: '+57 312 456 7890'
      }
    ],
    lastUpdated: new Date().toISOString()
  }
};

export const MOCK_CRISIS_ALERTS_LOG = [];
