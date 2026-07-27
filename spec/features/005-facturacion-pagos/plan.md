# 005 · Facturación y Pagos — Plan

| Campo        | Valor                          |
|--------------|--------------------------------|
| **Feature**  | 005 — Facturación y Pagos      |
| **Fase**     | MVP (Fase 1)                   |
| **Última actualización** | 2026-06-30        |

---

## 1. Enfoque general

El módulo se estructura en tres ejes técnicos que trabajan de forma coordinada:

1. **Ciclo de factura**: Creación (manual o automática) → registro DIAN → generación PDF → envío por correo.
2. **Ciclo de pago**: Initiation de sesión Wompi → redirect al checkout → webhook de confirmación → actualización de estado → despacho de comprobante.
3. **Reportes financieros**: Consultas agregadas sobre `Invoice` y `Payment` expuestas a través de un endpoint dedicado y visualizadas con Recharts.

La estrategia de integración con la DIAN se realiza **a través de la API de Siigo** (opcionalmente Alegra como fallback), nunca directamente contra los servicios de la DIAN. Esto simplifica el manejo de certificados digitales y la firma XML del Facturador Electrónico.

Los pagos en línea se implementan mediante el modelo de **checkout hospedado**: PsiAgenda nunca recibe datos de tarjeta; solo inicia la sesión de pago y escucha el webhook de confirmación.

Las operaciones asíncronas (envío de correo con PDF adjunto, sincronización con Siigo) se procesan mediante **Bull queues** para no bloquear el hilo principal de Express y garantizar reintentos en caso de fallo.

---

## 2. Modelo de datos

### 2.1 Tabla `Invoice`

```sql
CREATE TABLE "Invoice" (
  "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "number"          TEXT NOT NULL,          -- secuencia: PSI-{YEAR}-{seq 5 dígitos}
  "patientId"       UUID NOT NULL REFERENCES "Patient"("id"),
  "psychologistId"  UUID NOT NULL REFERENCES "User"("id"),
  "organizationId"  UUID NOT NULL REFERENCES "Organization"("id"),
  "appointmentId"   UUID REFERENCES "Appointment"("id"),  -- nullable
  "concept"         TEXT NOT NULL,          -- descripción del servicio
  "subtotal"        NUMERIC(12,2) NOT NULL,
  "taxRate"         NUMERIC(5,4) NOT NULL DEFAULT 0,  -- 0.0 o 0.19
  "tax"             NUMERIC(12,2) NOT NULL DEFAULT 0,
  "total"           NUMERIC(12,2) NOT NULL,
  "status"          TEXT NOT NULL DEFAULT 'DRAFT',
                    -- CHECK status IN ('DRAFT','SENT','PAID','VOID')
  "dianRef"         TEXT,                   -- CUFE retornado por Siigo/Alegra
  "pdfUrl"          TEXT,                   -- URL en Cloudinary/S3
  "notes"           TEXT,
  "createdAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "sentAt"          TIMESTAMPTZ,
  "paidAt"          TIMESTAMPTZ,
  UNIQUE ("number", "organizationId")
);
```

**Decisiones clave**:
- `number` se genera mediante una función de secuencia por organización almacenada en la tabla `InvoiceSequence` (ver §2.4). Garantiza unicidad sin usar `SERIAL` global.
- `taxRate` como campo explícito permite auditar cambios futuros en las reglas tributarias sin recalcular históricos.
- `appointmentId` es nullable para soportar facturas manuales no ligadas a una cita.

### 2.2 Tabla `Payment`

```sql
CREATE TABLE "Payment" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "invoiceId"   UUID NOT NULL REFERENCES "Invoice"("id"),
  "gatewayRef"  TEXT,                   -- ID de la transacción en Wompi/PayU
  "gateway"     TEXT NOT NULL,          -- 'WOMPI' | 'PAYU' | 'CASH' | 'TRANSFER'
  "amount"      NUMERIC(12,2) NOT NULL,
  "status"      TEXT NOT NULL DEFAULT 'PENDING',
                -- CHECK status IN ('PENDING','COMPLETED','FAILED','REFUNDED')
  "method"      TEXT,                   -- 'CARD' | 'PSE' | 'NEQUI' | 'CASH' | etc.
  "metadata"    JSONB DEFAULT '{}',     -- payload crudo del webhook
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "paidAt"      TIMESTAMPTZ
);
```

**Decisiones clave**:
- `metadata JSONB` almacena el payload completo del webhook para trazabilidad y posibles reinvestigaciones sin depender de logs externos.
- Un `Invoice` puede tener múltiples `Payment` (reintentos, reembolsos parciales en fases futuras). La relación es 1:N.

### 2.3 Tabla `RipsReport`

```sql
CREATE TABLE "RipsReport" (
  "id"             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "organizationId" UUID NOT NULL REFERENCES "Organization"("id"),
  "period"         TEXT NOT NULL,    -- 'YYYY-MM'
  "fileUrl"        TEXT,             -- URL del archivo ZIP RIPS en S3/Cloudinary
  "submittedAt"    TIMESTAMPTZ,
  "createdAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

> [!NOTE]
> La entidad `RipsReport` se crea en MVP para reservar el espacio en el esquema, pero la lógica de generación queda fuera del alcance de esta fase.

### 2.4 Tabla `InvoiceSequence`

```sql
CREATE TABLE "InvoiceSequence" (
  "organizationId" UUID PRIMARY KEY REFERENCES "Organization"("id"),
  "year"           INT  NOT NULL,
  "lastSeq"        INT  NOT NULL DEFAULT 0
);
```

La función `nextInvoiceNumber(orgId)` incrementa `lastSeq` de forma atómica (dentro de una transacción) y retorna la cadena formateada (`PSI-{year}-{seq:05d}`).

---

## 3. API — Contratos de endpoints

### 3.1 Facturas

| Método | Ruta | Roles | Descripción |
|--------|------|-------|-------------|
| `POST` | `/api/v1/invoices` | PSYCHOLOGIST, ADMIN | Crea factura en estado DRAFT |
| `GET` | `/api/v1/invoices` | PSYCHOLOGIST, ADMIN | Lista facturas (paginadas, filtros) |
| `GET` | `/api/v1/invoices/:id` | PSYCHOLOGIST, ADMIN | Detalle de factura |
| `POST` | `/api/v1/invoices/:id/send` | PSYCHOLOGIST, ADMIN | Emite la factura (DRAFT → SENT) + llama Siigo + genera PDF + envía correo |
| `PUT` | `/api/v1/invoices/:id/void` | PSYCHOLOGIST, ADMIN | Anula factura (solo DRAFT o SENT) |
| `POST` | `/api/v1/invoices/:id/mark-paid` | PSYCHOLOGIST, ADMIN | Marca como PAID manualmente (CASH/TRANSFER) |

#### `POST /api/v1/invoices` — Request body (Zod)
```typescript
z.object({
  patientId:     z.string().uuid(),
  appointmentId: z.string().uuid().optional(),
  concept:       z.string().min(5).max(300),
  subtotal:      z.number().positive(),
  taxRate:       z.enum(['0', '0.19']).transform(Number),
  notes:         z.string().max(500).optional(),
})
```

#### `POST /api/v1/invoices` — Response `201`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "number": "PSI-2026-00001",
    "status": "DRAFT",
    "total": 150000,
    "createdAt": "2026-06-30T17:00:00Z"
  }
}
```

#### `GET /api/v1/invoices` — Query params
| Param | Tipo | Descripción |
|-------|------|-------------|
| `status` | `DRAFT\|SENT\|PAID\|VOID` | Filtro por estado |
| `patientId` | UUID | Facturas de un paciente |
| `psychologistId` | UUID | Solo para ADMIN |
| `startDate` | ISO date | Rango fecha creación |
| `endDate` | ISO date | Rango fecha creación |
| `page` | int (default 1) | Paginación |
| `limit` | int (default 20, max 100) | Tamaño de página |

### 3.2 Pagos

| Método | Ruta | Roles | Descripción |
|--------|------|-------|-------------|
| `POST` | `/api/v1/payments/wompi/initiate` | PSYCHOLOGIST, ADMIN, PATIENT | Inicia sesión de pago Wompi |
| `POST` | `/api/v1/payments/wompi/webhook` | Público (verificar firma) | Recibe notificaciones de Wompi |
| `GET` | `/api/v1/payments/:id` | PSYCHOLOGIST, ADMIN | Detalle de un pago |

#### `POST /api/v1/payments/wompi/initiate` — Request body
```typescript
z.object({
  invoiceId:   z.string().uuid(),
  redirectUrl: z.string().url(),  // URL de retorno post-pago
})
```

#### `POST /api/v1/payments/wompi/initiate` — Response `200`
```json
{
  "success": true,
  "data": {
    "paymentId": "uuid-del-payment-en-psiagenda",
    "checkoutUrl": "https://checkout.wompi.co/p/?public-key=...&currency=COP&amount-in-cents=..."
  }
}
```

#### Flujo Wompi webhook
```
Wompi POST /api/v1/payments/wompi/webhook
  → Verificar header X-Event-Checksum (HMAC-SHA256)
  → Parsear evento { event: 'transaction.updated', data: { transaction } }
  → Buscar Payment por gatewayRef (transaction.id)
  → Si status == 'APPROVED':
      Payment.status = COMPLETED, Payment.paidAt = NOW()
      Invoice.status = PAID, Invoice.paidAt = NOW()
      Encolar job Bull: sendInvoiceEmail(invoiceId)
      Registrar AuditLog
  → Si status == 'DECLINED' | 'ERROR':
      Payment.status = FAILED
  → Responder HTTP 200 (siempre, para evitar reintentos innecesarios)
```

### 3.3 Reportes

| Método | Ruta | Roles | Descripción |
|--------|------|-------|-------------|
| `GET` | `/api/v1/reports/financial` | PSYCHOLOGIST, ADMIN | Resumen financiero con filtros |
| `POST` | `/api/v1/reports/rips` | ADMIN | Genera reporte RIPS (fase futura, endpoint reservado) |

#### `GET /api/v1/reports/financial` — Query params
| Param | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `startDate` | ISO date | Sí | Inicio del período |
| `endDate` | ISO date | Sí | Fin del período |
| `psychologistId` | UUID | No (solo ADMIN) | Filtrar por terapeuta |

#### `GET /api/v1/reports/financial` — Response `200`
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalRevenue": 4500000,
      "invoicesIssued": 30,
      "invoicesPaid": 25,
      "invoicesPending": 5,
      "pendingAmount": 750000
    },
    "byMonth": [
      { "month": "2026-05", "revenue": 2200000, "sessions": 15 },
      { "month": "2026-06", "revenue": 2300000, "sessions": 15 }
    ],
    "byPsychologist": [
      { "psychologistId": "uuid", "name": "Dra. García", "revenue": 4500000, "sessions": 30 }
    ]
  }
}
```

---

## 4. Integración DIAN (Siigo/Alegra)

### 4.1 Flujo de emisión

```
POST /api/v1/invoices/:id/send
  │
  ├─ 1. Validar estado Invoice == DRAFT
  ├─ 2. Atomic: Invoice.status = SENDING (estado transitorio en memoria, no en BD)
  │
  ├─ 3. POST https://api.siigo.com/v1/invoices
  │       Body: { customer, items, taxes, currency, ... }
  │       Auth: Bearer {siigoToken}
  │
  ├─ 4. Siigo responde: { id, cufe, pdfUrl, ... }
  │
  ├─ 5. Invoice.dianRef = cufe
  │      Invoice.pdfUrl = pdfUrl (o generar con pdfkit si Siigo no lo devuelve)
  │      Invoice.status = SENT
  │      Invoice.sentAt = NOW()
  │
  ├─ 6. Encolar Bull job: sendInvoiceEmail(invoiceId)
  │
  └─ 7. Responder 200 con Invoice actualizada
```

Si el paso 3 falla (timeout, error 4xx/5xx de Siigo):
- `Invoice.status` permanece en `DRAFT`.
- Se registra el error en `AuditLog` con `metadata: { siigoError }`.
- La respuesta al cliente es `HTTP 502` con `{ success: false, error: { code: 'DIAN_SYNC_FAILED', message } }`.

### 4.2 Generación de PDF

**Opción A (preferida)**: Usar el PDF que devuelve Siigo/Alegra. Descargarlo y subirlo a Cloudinary/S3. Almacenar la URL en `Invoice.pdfUrl`.

**Opción B (fallback)**: Generar el PDF con `pdfkit` en el backend con:
- Membrete del psicólogo (nombre, NIT, dirección, teléfono).
- Datos del paciente (nombre, cédula).
- Tabla de ítems (concepto, cantidad, precio unitario, subtotal, IVA, total).
- QR code (librería `qrcode`) que encode la URL de validación DIAN: `https://catalogo-vpfe.dian.gov.co/document/searchqr?documentkey={CUFE}`.
- Número de factura, fecha de emisión, resolución de facturación.

> [!IMPORTANT]
> El psicólogo debe tener configurada una **Resolución de Facturación** válida otorgada por la DIAN antes de emitir facturas. PsiAgenda almacena este dato en `Organization.settings.invoicingConfig` (número de resolución, prefijo, rango autorizado, fecha de vigencia).

### 4.3 Configuración de Siigo

Variables de entorno requeridas:
```
SIIGO_API_URL=https://api.siigo.com
SIIGO_USERNAME=...
SIIGO_ACCESS_KEY=...
SIIGO_DOCUMENT_TYPE_ID=...   # ID del tipo "Factura de venta" en Siigo
SIIGO_SELLER_ID=...
```

El token de Siigo expira cada 24 horas. Se gestiona con un módulo `siigoAuth.service.ts` que refresca el token en caché (Redis) antes de cada llamada.

---

## 5. Integración Wompi

### 5.1 Creación del checkout

PsiAgenda usa el modelo de **Checkout por URL** (sin iFrame) de Wompi:

```
GET https://checkout.wompi.co/p/
  ?public-key={WOMPI_PUBLIC_KEY}
  &currency=COP
  &amount-in-cents={total * 100}
  &reference={payment.id}        ← UUID del Payment en PsiAgenda
  &redirect-url={redirectUrl}
  &signature:integrity={sha256(reference + amountInCents + currency + WOMPI_INTEGRITY_SECRET)}
```

El campo `reference` es el `Payment.id` de PsiAgenda. Esto permite correlacionar el webhook con el registro interno sin ambigüedad.

### 5.2 Verificación de webhook

La firma del webhook de Wompi se verifica antes de procesar cualquier evento:

```javascript
// Pseudocódigo de verificación
const { event, data, sent_at, signature } = req.body;
const checksum = sha256(`${data.transaction.id}${sent_at}${WOMPI_EVENTS_SECRET}`);
if (checksum !== signature.checksum) {
  return res.status(400).json({ error: 'Invalid signature' });
}
```

> [!CAUTION]
> La clave `WOMPI_EVENTS_SECRET` es diferente a `WOMPI_INTEGRITY_SECRET`. Ambas se almacenan en variables de entorno y **nunca** se exponen al frontend.

### 5.3 Variables de entorno Wompi

```
WOMPI_PUBLIC_KEY=pub_...
WOMPI_PRIVATE_KEY=prv_...
WOMPI_INTEGRITY_SECRET=...
WOMPI_EVENTS_SECRET=...
WOMPI_SANDBOX=true   # false en producción
```

---

## 6. Bull Jobs (colas asíncronas)

| Cola | Job | Disparador | Descripción |
|------|-----|-----------|-------------|
| `invoice-email` | `sendInvoiceEmail` | Invoice enviada o pago confirmado | Genera o descarga PDF, adjunta al correo, envía con Nodemailer |
| `siigo-sync` | `syncInvoiceWithSiigo` | Invoice marcada como SENT (reintento) | Reintenta sincronización con Siigo en caso de fallo previo |

**Configuración de reintentos** para `sendInvoiceEmail`:
- `attempts: 3`, `backoff: { type: 'exponential', delay: 5000 }`
- En caso de fallo definitivo: registrar en `AuditLog` y notificar al psicólogo vía correo interno.

---

## 7. Componentes React

### 7.1 Jerarquía de componentes

```
/billing
├── InvoiceListPage
│   ├── InvoiceFiltersBar         ← filtros por estado, fecha, paciente
│   ├── InvoiceTable              ← tabla paginada con acciones
│   └── InvoiceStatusBadge
│
├── InvoiceDetailPage
│   ├── InvoiceHeader             ← número, estado, fechas
│   ├── InvoiceLineItems          ← tabla de conceptos, subtotal, IVA, total
│   ├── PaymentHistoryList        ← historial de intentos de pago
│   ├── InvoiceActionBar          ← botones: Emitir / Anular / Cobrar en línea / Marcar pagado
│   └── InvoicePdfPreview         ← embed o enlace al PDF
│
├── InvoiceCreateModal            ← form: paciente, concepto, valor, IVA, cita opcional
│
└── PaymentPage                   ← pantalla intermedia antes de redirect a Wompi
    ├── InvoiceSummaryCard
    └── PaymentRedirectButton

/reports
└── FinancialReportPage
    ├── FinancialFiltersBar        ← startDate, endDate, psychologistId (solo ADMIN)
    ├── FinancialSummaryCards      ← tarjetas: ingresos, sesiones, pendiente
    ├── RevenueBarChart            ← Recharts BarChart por mes
    ├── RevenueLineChart           ← Recharts LineChart tendencia
    └── PendingInvoicesTable       ← tabla de facturas sin pagar con acciones rápidas
```

### 7.2 Manejo de estados de UI

| Estado de factura | Color badge | Acciones disponibles |
|-------------------|-------------|---------------------|
| `DRAFT` | Gris | Emitir, Editar concepto, Anular |
| `SENT` | Azul | Cobrar en línea, Marcar pagado, Reenviar correo, Anular |
| `PAID` | Verde | Ver comprobante, (sin más acciones) |
| `VOID` | Rojo tachado | Solo lectura |

### 7.3 Flujo de pago desde el frontend

```
InvoiceDetailPage
  → clic "Cobrar en línea"
  → POST /api/v1/payments/wompi/initiate
  → recibir { checkoutUrl }
  → window.location.href = checkoutUrl     ← redirect a Wompi
  → [paciente paga en Wompi]
  → Wompi redirige a redirectUrl (PaymentResultPage)
  → PaymentResultPage hace polling o espera SSE para confirmar estado
  → Muestra "Pago exitoso" o "Pago fallido"
```

> [!TIP]
> Para evitar polling agresivo, considerar un endpoint SSE `GET /api/v1/payments/:id/status-stream` que emite un evento cuando el webhook de Wompi actualiza el estado. Esto mejora la UX significativamente. Quedará como mejora opcional en esta fase.

---

## 8. Decisiones de diseño

| # | Decisión | Alternativa descartada | Razón |
|---|----------|------------------------|-------|
| D1 | Usar Siigo como intermediario DIAN | Integración directa con DIAN | La integración directa requiere certificado de firma electrónica (UVT), manejo de XML OASIS, y cumplimiento de resoluciones técnicas. Siigo abstrae todo esto. |
| D2 | Checkout hospedado en Wompi (redirect) | Wompi.js iFrame embebido | El modelo redirect es más simple, no requiere CSP extra, y evita problemas de CORS y responsabilidad PCI. |
| D3 | Número de factura por organización | Número global | Cada organización tiene su propia resolución de facturación. El número debe ser secuencial dentro de esa resolución. |
| D4 | PDF generado en backend (pdfkit o Siigo) | PDF en frontend | El PDF debe firmarse digitalmente (CUFE, QR DIAN). Generarlo en el frontend sería inseguro e incompleto. |
| D5 | Bull queue para envío de correos | Envío síncrono en request | El envío de correo puede tomar 2-10 segundos. Hacerlo síncrono bloquea el request y empeora el UX. |
| D6 | Metadata JSONB en Payment | Tabla separada de eventos | Para MVP, JSONB es suficiente. Permite almacenar el payload crudo del webhook para debugging sin esquema fijo. |

---

## 9. Riesgos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Siigo cambia su API o tiene downtime | Media | Alto | Implementar circuit breaker. Mantener facturas en `DRAFT` si Siigo falla. Añadir Alegra como fallback. |
| El webhook de Wompi llega duplicado | Alta | Medio | Usar `gatewayRef` como clave de idempotencia. Si ya existe un `Payment.COMPLETED` con ese `gatewayRef`, ignorar el evento. |
| El CUFE de la DIAN es inválido en producción | Media | Alto | Realizar pruebas en el ambiente de habilitación de la DIAN antes del go-live. Documentar proceso de habilitación. |
| Resolución de facturación vencida del psicólogo | Media | Alto | Validar vigencia en `Organization.settings.invoicingConfig` antes de emitir. Alertar con 30 días de antelación. |
| El usuario cierra el navegador antes del redirect de Wompi | Media | Bajo | El webhook de Wompi llega independientemente. El pago se procesa igual. El usuario puede verificar el estado al regresar. |
| Fallo en generación de PDF | Baja | Medio | Reintentar con Bull. Si falla definitivamente, notificar al psicólogo para regeneración manual. |
