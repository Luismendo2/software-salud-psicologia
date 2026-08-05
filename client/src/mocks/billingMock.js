/* ==========================================================================
   billingMock.js — Datos simulados del módulo de Facturación y Pagos (Feature 005)
   
   Proporciona facturas, pagos, reporte financiero y configuraciones
   de estado/pasarelas para PsiAgenda.
   ========================================================================== */

/**
 * Genera una fecha relativa a la fecha actual.
 * @param {number} dayOffset - Días de diferencia (negativo para el pasado)
 * @param {number} hour - Hora del día (0-23)
 * @param {number} minute - Minuto del día (0-59)
 * @returns {string} Fecha en formato ISO 8601
 */
function relativeDate(dayOffset, hour = 10, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

/**
 * Obtiene la clave de mes en formato YYYY-MM relativo al mes actual.
 * @param {number} offsetMonths - Meses de diferencia
 * @returns {string} Mes en formato YYYY-MM
 */
function getRelativeMonth(offsetMonths) {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + offsetMonths);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Listado de 12 facturas simuladas para PsiAgenda.
 */
export const MOCK_INVOICES = [
  {
    id: 'inv-1',
    number: 'PSI-2026-00001',
    patientId: 'pat-001',
    patientName: 'Camila Rodríguez Herrera',
    psychologistId: 'psy-001',
    psychologistName: 'Dra. María López',
    appointmentId: 'apt-101',
    concept: 'Sesión individual de psicoterapia',
    subtotal: 150000,
    taxRate: 0,
    tax: 0,
    total: 150000,
    status: 'PAID',
    dianRef: 'cufe_9876543210a1b2c3d4e5f678901234567890abcd',
    pdfUrl: '/api/v1/invoices/inv-1/pdf',
    notes: 'Pago recibido oportunamente a través de Nequi',
    createdAt: relativeDate(-90, 9, 0),
    sentAt: relativeDate(-90, 9, 5),
    paidAt: relativeDate(-90, 9, 10),
  },
  {
    id: 'inv-2',
    number: 'PSI-2026-00002',
    patientId: 'pat-002',
    patientName: 'Carlos Mendoza',
    psychologistId: 'psy-001',
    psychologistName: 'Dra. María López',
    appointmentId: 'apt-102',
    concept: 'Evaluación psicológica completa',
    subtotal: 300000,
    taxRate: 0,
    tax: 0,
    total: 300000,
    status: 'PAID',
    dianRef: 'cufe_8765432109b2c3d4e5f678901234567890abcde',
    pdfUrl: '/api/v1/invoices/inv-2/pdf',
    notes: 'Incluye batería de pruebas psicométricas y reporte',
    createdAt: relativeDate(-75, 10, 0),
    sentAt: relativeDate(-75, 10, 15),
    paidAt: relativeDate(-74, 14, 30),
  },
  {
    id: 'inv-3',
    number: 'PSI-2026-00003',
    patientId: 'pat-003',
    patientName: 'Laura Gutiérrez',
    psychologistId: 'psy-002',
    psychologistName: 'Dr. Andrés Mendoza',
    appointmentId: 'apt-103',
    concept: 'Sesión de pareja',
    subtotal: 220000,
    taxRate: 0,
    tax: 0,
    total: 220000,
    status: 'PAID',
    dianRef: 'cufe_7654321098c3d4e5f678901234567890abcdef',
    pdfUrl: '/api/v1/invoices/inv-3/pdf',
    notes: null,
    createdAt: relativeDate(-60, 11, 0),
    sentAt: relativeDate(-60, 11, 5),
    paidAt: relativeDate(-59, 16, 0),
  },
  {
    id: 'inv-4',
    number: 'PSI-2026-00004',
    patientId: 'pat-004',
    patientName: 'Andrés Ruiz',
    psychologistId: 'psy-001',
    psychologistName: 'Dra. María López',
    appointmentId: 'apt-104',
    concept: 'Sesión individual de psicoterapia',
    subtotal: 140000,
    taxRate: 0,
    tax: 0,
    total: 140000,
    status: 'PAID',
    dianRef: 'cufe_6543210987d4e5f678901234567890abcdef1',
    pdfUrl: '/api/v1/invoices/inv-4/pdf',
    notes: 'Pago realizado mediante PSE Bancolombia',
    createdAt: relativeDate(-45, 15, 0),
    sentAt: relativeDate(-45, 15, 10),
    paidAt: relativeDate(-45, 15, 20),
  },
  {
    id: 'inv-5',
    number: 'PSI-2026-00005',
    patientId: 'pat-005',
    patientName: 'Valentina Ortega',
    psychologistId: 'psy-002',
    psychologistName: 'Dr. Andrés Mendoza',
    appointmentId: null,
    concept: 'Informe pericial',
    subtotal: 350000,
    taxRate: 0.19,
    tax: 66500,
    total: 416500,
    status: 'PAID',
    dianRef: 'cufe_5432109876e5f678901234567890abcdef12',
    pdfUrl: '/api/v1/invoices/inv-5/pdf',
    notes: 'Informe pericial para proceso de custodia judicial',
    createdAt: relativeDate(-35, 8, 30),
    sentAt: relativeDate(-35, 9, 0),
    paidAt: relativeDate(-33, 11, 15),
  },
  {
    id: 'inv-6',
    number: 'PSI-2026-00006',
    patientId: 'pat-006',
    patientName: 'Sofía Ramírez',
    psychologistId: 'psy-001',
    psychologistName: 'Dra. María López',
    appointmentId: 'apt-106',
    concept: 'Sesión individual de psicoterapia',
    subtotal: 150000,
    taxRate: 0,
    tax: 0,
    total: 150000,
    status: 'PAID',
    dianRef: 'cufe_4321098765f678901234567890abcdef123',
    pdfUrl: '/api/v1/invoices/inv-6/pdf',
    notes: null,
    createdAt: relativeDate(-25, 14, 0),
    sentAt: relativeDate(-25, 14, 10),
    paidAt: relativeDate(-24, 10, 0),
  },
  {
    id: 'inv-7',
    number: 'PSI-2026-00007',
    patientId: 'pat-007',
    patientName: 'Felipe Torres',
    psychologistId: 'psy-002',
    psychologistName: 'Dr. Andrés Mendoza',
    appointmentId: 'apt-107',
    concept: 'Terapia familiar',
    subtotal: 250000,
    taxRate: 0,
    tax: 0,
    total: 250000,
    status: 'SENT',
    dianRef: 'cufe_321098765478901234567890abcdef1234',
    pdfUrl: '/api/v1/invoices/inv-7/pdf',
    notes: 'Factura enviada al correo del acudiente',
    createdAt: relativeDate(-15, 16, 0),
    sentAt: relativeDate(-15, 16, 30),
    paidAt: null,
  },
  {
    id: 'inv-8',
    number: 'PSI-2026-00008',
    patientId: 'pat-001',
    patientName: 'Camila Rodríguez Herrera',
    psychologistId: 'psy-001',
    psychologistName: 'Dra. María López',
    appointmentId: 'apt-108',
    concept: 'Sesión individual de psicoterapia',
    subtotal: 150000,
    taxRate: 0,
    tax: 0,
    total: 150000,
    status: 'SENT',
    dianRef: 'cufe_21098765438901234567890abcdef12345',
    pdfUrl: '/api/v1/invoices/inv-8/pdf',
    notes: 'Pendiente de procesamiento en Wompi',
    createdAt: relativeDate(-7, 10, 0),
    sentAt: relativeDate(-7, 10, 15),
    paidAt: null,
  },
  {
    id: 'inv-9',
    number: 'PSI-2026-00009',
    patientId: 'pat-008',
    patientName: 'Mariana Gómez',
    psychologistId: 'psy-002',
    psychologistName: 'Dr. Andrés Mendoza',
    appointmentId: 'apt-109',
    concept: 'Sesión de orientación vocacional',
    subtotal: 180000,
    taxRate: 0,
    tax: 0,
    total: 180000,
    status: 'SENT',
    dianRef: 'cufe_1098765432901234567890abcdef123456',
    pdfUrl: '/api/v1/invoices/inv-9/pdf',
    notes: 'Notificación de pago rechazada por fondos insuficientes',
    createdAt: relativeDate(-5, 11, 0),
    sentAt: relativeDate(-5, 11, 20),
    paidAt: null,
  },
  {
    id: 'inv-10',
    number: 'PSI-2026-00010',
    patientId: 'pat-003',
    patientName: 'Laura Gutiérrez',
    psychologistId: 'psy-001',
    psychologistName: 'Dra. María López',
    appointmentId: 'apt-110',
    concept: 'Sesión individual de psicoterapia',
    subtotal: 140000,
    taxRate: 0,
    tax: 0,
    total: 140000,
    status: 'SENT',
    dianRef: 'cufe_098765432101234567890abcdef1234567',
    pdfUrl: '/api/v1/invoices/inv-10/pdf',
    notes: null,
    createdAt: relativeDate(-2, 16, 0),
    sentAt: relativeDate(-2, 16, 10),
    paidAt: null,
  },
  {
    id: 'inv-11',
    number: 'PSI-2026-00011',
    patientId: 'pat-004',
    patientName: 'Andrés Ruiz',
    psychologistId: 'psy-002',
    psychologistName: 'Dr. Andrés Mendoza',
    appointmentId: null,
    concept: 'Evaluación de perfil neuropsicológico',
    subtotal: 320000,
    taxRate: 0.19,
    tax: 60800,
    total: 380800,
    status: 'DRAFT',
    dianRef: null,
    pdfUrl: null,
    notes: 'Borrador preliminar para revisión antes del envío a DIAN',
    createdAt: relativeDate(-1, 9, 30),
    sentAt: null,
    paidAt: null,
  },
  {
    id: 'inv-12',
    number: 'PSI-2026-00012',
    patientId: 'pat-005',
    patientName: 'Valentina Ortega',
    psychologistId: 'psy-001',
    psychologistName: 'Dra. María López',
    appointmentId: 'apt-112',
    concept: 'Sesión individual de psicoterapia',
    subtotal: 150000,
    taxRate: 0,
    tax: 0,
    total: 150000,
    status: 'VOID',
    dianRef: null,
    pdfUrl: null,
    notes: 'Factura anulada por error en los datos de identificación del paciente',
    createdAt: relativeDate(-40, 11, 0),
    sentAt: null,
    paidAt: null,
  },
];

/**
 * Listado de 8 pagos simulados.
 */
export const MOCK_PAYMENTS = [
  {
    id: 'pay-1',
    invoiceId: 'inv-1',
    gatewayRef: 'WOMPI-TX-10001',
    gateway: 'WOMPI',
    amount: 150000,
    status: 'COMPLETED',
    method: 'NEQUI',
    metadata: {
      phone: '310****890',
      reference: 'NQ-882194',
    },
    createdAt: relativeDate(-90, 9, 5),
    paidAt: relativeDate(-90, 9, 10),
  },
  {
    id: 'pay-2',
    invoiceId: 'inv-2',
    gatewayRef: 'WOMPI-TX-10002',
    gateway: 'WOMPI',
    amount: 300000,
    status: 'COMPLETED',
    method: 'CARD',
    metadata: {
      cardBrand: 'VISA',
      cardLast4: '4242',
      installments: 1,
    },
    createdAt: relativeDate(-75, 10, 15),
    paidAt: relativeDate(-74, 14, 30),
  },
  {
    id: 'pay-3',
    invoiceId: 'inv-3',
    gatewayRef: 'WOMPI-TX-10003',
    gateway: 'WOMPI',
    amount: 220000,
    status: 'COMPLETED',
    method: 'PSE',
    metadata: {
      bankName: 'Bancolombia',
      userType: 'NATURAL',
    },
    createdAt: relativeDate(-60, 11, 5),
    paidAt: relativeDate(-59, 16, 0),
  },
  {
    id: 'pay-4',
    invoiceId: 'inv-4',
    gatewayRef: 'WOMPI-TX-10004',
    gateway: 'WOMPI',
    amount: 140000,
    status: 'COMPLETED',
    method: 'PSE',
    metadata: {
      bankName: 'Banco de Bogotá',
      userType: 'NATURAL',
    },
    createdAt: relativeDate(-45, 15, 10),
    paidAt: relativeDate(-45, 15, 20),
  },
  {
    id: 'pay-5',
    invoiceId: 'inv-5',
    gatewayRef: 'TRF-2026-9912',
    gateway: 'TRANSFER',
    amount: 416500,
    status: 'COMPLETED',
    method: 'TRANSFER',
    metadata: {
      bankName: 'Bancolombia',
      accountType: 'Ahorros',
      receiptNumber: 'COMP-88392',
    },
    createdAt: relativeDate(-35, 9, 0),
    paidAt: relativeDate(-33, 11, 15),
  },
  {
    id: 'pay-6',
    invoiceId: 'inv-6',
    gatewayRef: 'CSH-2026-0042',
    gateway: 'CASH',
    amount: 150000,
    status: 'COMPLETED',
    method: 'CASH',
    metadata: {
      receivedBy: 'Dra. María López',
      receiptLocation: 'Consultorio 302',
    },
    createdAt: relativeDate(-25, 14, 10),
    paidAt: relativeDate(-24, 10, 0),
  },
  {
    id: 'pay-7',
    invoiceId: 'inv-8',
    gatewayRef: 'WOMPI-TX-10007',
    gateway: 'WOMPI',
    amount: 150000,
    status: 'PENDING',
    method: 'PSE',
    metadata: {
      bankName: 'Davivienda',
      transactionState: 'PENDING_BANK',
    },
    createdAt: relativeDate(-1, 14, 0),
    paidAt: null,
  },
  {
    id: 'pay-8',
    invoiceId: 'inv-9',
    gatewayRef: 'WOMPI-TX-10008',
    gateway: 'WOMPI',
    amount: 180000,
    status: 'FAILED',
    method: 'CARD',
    metadata: {
      cardBrand: 'MASTERCARD',
      cardLast4: '8812',
      errorCode: 'INSUFFICIENT_FUNDS',
      errorMessage: 'Fondos insuficientes en la tarjeta',
    },
    createdAt: relativeDate(-3, 11, 30),
    paidAt: null,
  },
];

/**
 * Reporte financiero consolidado.
 * Los datos se mantienen coherentes con MOCK_INVOICES:
 * - totalRevenue: Suma de facturas PAGADAS (1,376,500 COP)
 * - invoicesIssued: Total facturas emitidas (11, excluyendo DRAFT)
 * - invoicesPaid: Total facturas pagadas (6)
 * - invoicesPending: Total facturas enviadas pendientes de pago (4)
 * - pendingAmount: Suma de facturas ENVIADAS (720,000 COP)
 */
export const MOCK_FINANCIAL_REPORT = {
  summary: {
    totalRevenue: 1376500,
    invoicesIssued: 11,
    invoicesPaid: 6,
    invoicesPending: 4,
    pendingAmount: 720000,
  },
  byMonth: [
    { month: getRelativeMonth(-5), revenue: 380000, sessions: 3 },
    { month: getRelativeMonth(-4), revenue: 420000, sessions: 3 },
    { month: getRelativeMonth(-3), revenue: 450000, sessions: 2 },
    { month: getRelativeMonth(-2), revenue: 360000, sessions: 2 },
    { month: getRelativeMonth(-1), revenue: 566500, sessions: 2 },
    { month: getRelativeMonth(0), revenue: 0, sessions: 0 },
  ],
  byPsychologist: [
    {
      psychologistId: 'psy-001',
      name: 'Dra. María López',
      revenue: 740000,
      sessions: 4,
    },
    {
      psychologistId: 'psy-002',
      name: 'Dr. Andrés Mendoza',
      revenue: 636500,
      sessions: 2,
    },
  ],
};

/**
 * Configuración visual de estados de factura.
 */
export const INVOICE_STATUS_CONFIG = {
  DRAFT: {
    label: 'Borrador',
    color: '#6b7280',
    bgColor: '#f3f4f6',
    icon: '📝',
  },
  SENT: {
    label: 'Enviada',
    color: '#2563eb',
    bgColor: '#eff6ff',
    icon: '📧',
  },
  PAID: {
    label: 'Pagada',
    color: '#16a34a',
    bgColor: '#f0fdf4',
    icon: '✅',
  },
  VOID: {
    label: 'Anulada',
    color: '#dc2626',
    bgColor: '#fef2f2',
    icon: '⛔',
  },
};

/**
 * Nombres amigables para pasarelas de pago.
 */
export const PAYMENT_GATEWAY_LABELS = {
  WOMPI: 'Wompi',
  CASH: 'Efectivo',
  TRANSFER: 'Transferencia',
  PAYU: 'PayU',
};

/**
 * Nombres amigables para métodos de pago.
 */
export const PAYMENT_METHOD_LABELS = {
  CARD: 'Tarjeta',
  PSE: 'PSE',
  NEQUI: 'Nequi',
  CASH: 'Efectivo',
  TRANSFER: 'Transferencia',
};
