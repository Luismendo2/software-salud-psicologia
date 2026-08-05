/* ==========================================================================
   billingService.js — Capa de servicio para Facturación y Pagos (Feature 005)
   
   Encapsula las llamadas a la API de facturación y pagos.
   Mientras no exista backend real, manipula y retorna datos mock con delay simulado.
   
   Regla: Los componentes NUNCA llaman a Axios u otras APIs directamente.
   ========================================================================== */

import {
  MOCK_INVOICES,
  MOCK_PAYMENTS,
  MOCK_FINANCIAL_REPORT,
} from '../mocks/billingMock';

/**
 * Helper para simular latencia de red en llamadas asíncronas
 */
const delay = (ms = 400) => new Promise(r => setTimeout(r, ms));

// Copia mutable en memoria para mantener persistencia durante la sesión del cliente
let invoicesStore = Array.isArray(MOCK_INVOICES) ? [...MOCK_INVOICES] : [];
let paymentsStore = Array.isArray(MOCK_PAYMENTS) ? [...MOCK_PAYMENTS] : [];

/**
 * 1. Obtiene listado paginado de facturas con filtros aplicados.
 * Ordena las facturas por fecha de creación descendentemente (más recientes primero).
 * 
 * @param {Object} params
 * @param {number} [params.page=1] - Número de página actual
 * @param {number} [params.limit=10] - Límite de elementos por página
 * @param {string} [params.status] - Filtro por estado (DRAFT, SENT, PAID, VOID)
 * @param {string} [params.patientId] - Filtro por ID de paciente
 * @param {string} [params.startDate] - Fecha inicio de rango
 * @param {string} [params.endDate] - Fecha fin de rango
 * @returns {Promise<{ data: Array, page: number, limit: number, total: number, totalPages: number }>}
 */
export async function getInvoices({
  page = 1,
  limit = 10,
  status,
  patientId,
  startDate,
  endDate,
} = {}) {
  await delay(300);

  let filtered = [...invoicesStore];

  if (status && status !== 'ALL') {
    filtered = filtered.filter(inv => inv.status === status);
  }

  if (patientId) {
    filtered = filtered.filter(inv => inv.patientId === patientId);
  }

  if (startDate) {
    const start = new Date(startDate);
    filtered = filtered.filter(inv => new Date(inv.createdAt) >= start);
  }

  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    filtered = filtered.filter(inv => new Date(inv.createdAt) <= end);
  }

  // Ordenar por createdAt descendente
  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const total = filtered.length;
  const numLimit = Number(limit) || 10;
  const totalPages = Math.max(1, Math.ceil(total / numLimit));
  const currentPage = Math.max(1, Number(page) || 1);
  const startIndex = (currentPage - 1) * numLimit;
  const data = filtered.slice(startIndex, startIndex + numLimit);

  return {
    data,
    page: currentPage,
    limit: numLimit,
    total,
    totalPages,
  };
}

/**
 * 2. Obtiene una factura individual por su ID.
 * 
 * @param {string} id - ID de la factura
 * @returns {Promise<Object>} Objeto de la factura encontrada
 * @throws {Error} Si la factura no existe
 */
export async function getInvoice(id) {
  await delay(300);

  const invoice = invoicesStore.find(inv => inv.id === id);
  if (!invoice) {
    throw new Error(`Factura con ID ${id} no encontrada.`);
  }

  return { ...invoice };
}

/**
 * 3. Crea una nueva factura en estado DRAFT.
 * Genera número correlativo PSI-2026-XXXXX y calcula tax y total.
 * 
 * @param {Object} data
 * @param {string} data.patientId
 * @param {string} data.patientName
 * @param {string} data.concept
 * @param {number} data.subtotal
 * @param {number} [data.taxRate=0]
 * @param {string} [data.appointmentId]
 * @param {string} [data.notes]
 * @returns {Promise<Object>} La nueva factura creada
 */
export async function createInvoice({
  patientId,
  patientName,
  concept,
  subtotal,
  taxRate = 0,
  appointmentId = null,
  notes = '',
}) {
  await delay(600);

  const numericSubtotal = Number(subtotal) || 0;
  const numericTaxRate = Number(taxRate) || 0;
  const rateFactor = numericTaxRate > 1 ? numericTaxRate / 100 : numericTaxRate;
  const tax = Math.round(numericSubtotal * rateFactor);
  const total = numericSubtotal + tax;

  const randomNum = Math.floor(10000 + Math.random() * 90000);
  const number = `PSI-2026-${randomNum}`;

  const newInvoice = {
    id: `inv-${Date.now()}`,
    number,
    patientId,
    patientName,
    concept,
    subtotal: numericSubtotal,
    taxRate: numericTaxRate,
    tax,
    total,
    appointmentId: appointmentId || null,
    notes: notes || '',
    status: 'DRAFT',
    createdAt: new Date().toISOString(),
    dianRef: null,
    sentAt: null,
    paidAt: null,
  };

  invoicesStore.unshift(newInvoice);
  return { ...newInvoice };
}

/**
 * 4. Transiciona una factura de DRAFT a SENT (Emitida).
 * Asigna referencia DIAN (CUFE mock) y la fecha de envío sentAt.
 * 
 * @param {string} id - ID de la factura
 * @returns {Promise<Object>} Factura actualizada
 * @throws {Error} Si el estado no es DRAFT
 */
export async function sendInvoice(id) {
  await delay(600);

  const index = invoicesStore.findIndex(inv => inv.id === id);
  if (index === -1) {
    throw new Error(`Factura con ID ${id} no encontrada.`);
  }

  const invoice = invoicesStore[index];
  if (invoice.status !== 'DRAFT') {
    throw new Error(`Solo se pueden emitir facturas en estado borrador (DRAFT). Estado actual: ${invoice.status}`);
  }

  const updatedInvoice = {
    ...invoice,
    status: 'SENT',
    sentAt: new Date().toISOString(),
    dianRef: `CUFE-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now()}`,
  };

  invoicesStore[index] = updatedInvoice;
  return { ...updatedInvoice };
}

/**
 * 5. Transiciona una factura en estado DRAFT o SENT a VOID (Anulada).
 * 
 * @param {string} id - ID de la factura
 * @returns {Promise<Object>} Factura anulada
 * @throws {Error} Si la factura está pagada (PAID) o ya anulada
 */
export async function voidInvoice(id) {
  await delay(600);

  const index = invoicesStore.findIndex(inv => inv.id === id);
  if (index === -1) {
    throw new Error(`Factura con ID ${id} no encontrada.`);
  }

  const invoice = invoicesStore[index];
  if (invoice.status === 'PAID') {
    throw new Error('No se puede anular una factura que ya ha sido pagada (PAID).');
  }

  if (invoice.status === 'VOID') {
    throw new Error('La factura ya se encuentra anulada (VOID).');
  }

  const updatedInvoice = {
    ...invoice,
    status: 'VOID',
    voidedAt: new Date().toISOString(),
  };

  invoicesStore[index] = updatedInvoice;
  return { ...updatedInvoice };
}

/**
 * 6. Marca manualmente una factura como pagada (PAID) para CASH o TRANSFER.
 * Registra una entrada en el historial de pagos.
 * 
 * @param {string} id - ID de la factura
 * @param {Object} paymentInfo
 * @param {string} [paymentInfo.gateway='MANUAL']
 * @param {string} [paymentInfo.method='CASH']
 * @returns {Promise<Object>} Factura actualizada en estado PAID
 * @throws {Error} Si la factura no está en estado SENT
 */
export async function markInvoicePaid(id, { gateway = 'MANUAL', method = 'CASH' } = {}) {
  await delay(600);

  const index = invoicesStore.findIndex(inv => inv.id === id);
  if (index === -1) {
    throw new Error(`Factura con ID ${id} no encontrada.`);
  }

  const invoice = invoicesStore[index];
  if (invoice.status !== 'SENT') {
    throw new Error(`Solo se pueden marcar como pagadas las facturas emitidas (SENT). Estado actual: ${invoice.status}`);
  }

  const paidAt = new Date().toISOString();
  const paymentEntry = {
    id: `pay-${Date.now()}`,
    invoiceId: id,
    amount: invoice.total,
    gateway,
    method,
    status: 'SUCCESS',
    createdAt: paidAt,
  };

  paymentsStore.push(paymentEntry);

  const updatedInvoice = {
    ...invoice,
    status: 'PAID',
    paidAt,
  };

  invoicesStore[index] = updatedInvoice;
  return { ...updatedInvoice };
}

/**
 * 7. Obtiene los pagos registrados para una factura específica.
 * 
 * @param {string} invoiceId - ID de la factura
 * @returns {Promise<Array>} Lista de pagos asociados
 */
export async function getPayments(invoiceId) {
  await delay(300);

  return paymentsStore.filter(p => p.invoiceId === invoiceId);
}

/**
 * 8. Inicia pasarela de pago con Wompi para una factura.
 * 
 * @param {string} invoiceId - ID de la factura a pagar
 * @param {string} redirectUrl - URL de retorno post-pago
 * @returns {Promise<{ paymentId: string, checkoutUrl: string }>}
 */
export async function initiateWompiPayment(invoiceId, redirectUrl) {
  await delay(600);

  const invoice = invoicesStore.find(inv => inv.id === invoiceId);
  const amountInCents = invoice ? Math.round(invoice.total * 100) : 15000000;
  const paymentId = `pay-wompi-${Date.now()}`;
  const checkoutUrl = `https://checkout.wompi.co/p/?public-key=pub_test_MOCK&currency=COP&amount-in-cents=${amountInCents}&reference=${invoiceId}&redirect-url=${encodeURIComponent(redirectUrl || '')}`;

  return {
    paymentId,
    checkoutUrl,
  };
}

/**
 * 9. Obtiene el reporte financiero mock con filtros opcionales.
 * 
 * @param {Object} [params]
 * @param {string} [params.startDate]
 * @param {string} [params.endDate]
 * @param {string} [params.psychologistId]
 * @returns {Promise<Object>} Datos del reporte financiero
 */
export async function getFinancialReport({ startDate, endDate, psychologistId } = {}) {
  await delay(400);

  return { ...MOCK_FINANCIAL_REPORT };
}
