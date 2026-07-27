# 010 · Reportes y Estadísticas — Plan

| Campo        | Valor                          |
|--------------|-------------------------------|
| **Feature**  | 010 · Reportes y Estadísticas  |
| **Fase**     | 3                              |
| **Depende de** | 002 (Agenda), 004 (Pacientes), 005 (Historia Clínica), 007 (Pagos), 008 (Evaluaciones) |
| **Última revisión** | 2026-06-30               |

---

## 1. Enfoque general

La estrategia central para el MVP es **no introducir una base de datos analítica separada**. Todas las métricas se calculan mediante consultas de agregación directamente sobre MySQL, aprovechando índices compuestos bien diseñados. Los resultados se almacenan en **Redis con TTL de 30 minutos** para evitar que cada carga de página impacte la base de datos.

Este enfoque es válido para un volumen de hasta ~50 psicólogos y ~5 000 citas/mes. Si el crecimiento lo justifica, se puede introducir una capa de materialización de vistas o un data warehouse en una fase posterior sin cambiar la API pública.

### Principios de privacidad en datos agregados

- Ninguna respuesta de API devuelve `patientId`, nombre, teléfono u otro campo que identifique a un paciente individual en vistas agregadas.
- Los endpoints de progreso clínico devuelven únicamente promedios y desviaciones estándar de puntuaciones de cuestionarios.
- La fuente de pacientes devuelve conteos y porcentajes por categoría, nunca la lista de pacientes.

---

## 2. Cambios en la base de datos

### 2.1 Nueva tabla: `patient_sources`

Registra cómo llegó cada paciente a la consulta. Se captura en el formulario de registro de paciente (Feature 004).

```sql
CREATE TABLE patient_sources (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id    UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  source        TEXT NOT NULL CHECK (source IN (
                  'SOCIAL_MEDIA', 'REFERRAL', 'DIRECT', 'WEBSITE', 'OTHER'
                )),
  referrer_note TEXT,           -- opcional: nombre del referidor, red social, etc.
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (patient_id)           -- un paciente tiene una sola fuente primaria
);
```

### 2.2 Índices requeridos

Los siguientes índices son necesarios para que las consultas de agregación sean eficientes:

```sql
-- Citas por psicólogo, organización y rango de tiempo
CREATE INDEX idx_appointments_psych_time
  ON appointments(psychologist_id, organization_id, start_time, status);

-- Pagos por fecha de pago (para ingresos)
CREATE INDEX idx_payments_paid_at
  ON payments(paid_at, status);

-- Enlace invoice -> psychologist (a través de invoices)
CREATE INDEX idx_invoices_psych
  ON invoices(psychologist_id, status);

-- Evaluaciones por psicólogo y fecha
CREATE INDEX idx_assessments_psych_time
  ON assessments(psychologist_id, completed_at, type);

-- Fuentes de pacientes
CREATE INDEX idx_patient_sources_source
  ON patient_sources(source);
```

> [!NOTE]
> El modelo `Appointment` ya debe tener `psychologist_id` indexado individualmente por la Feature 002. Aquí se añade el índice compuesto para las consultas de reportes.

---

## 3. Contratos de API

Todas las rutas están bajo `/api/v1/reports/` y requieren los middlewares `authenticate` + `authorize(['PSYCHOLOGIST', 'ADMIN'])`.

### Parámetros comunes de query

| Parámetro        | Tipo   | Obligatorio | Descripción |
|------------------|--------|-------------|-------------|
| `from`           | string (ISO 8601 date) | Sí | Inicio del rango (inclusive) |
| `to`             | string (ISO 8601 date) | Sí | Fin del rango (inclusive) |
| `psychologistId` | UUID   | No*         | Solo ADMIN puede especificarlo. Si se omite: ADMIN ve toda la organización; PSYCHOLOGIST ve solo sus datos. |

*Un PSYCHOLOGIST que intente enviar `psychologistId` diferente al propio recibirá `403 Forbidden`.

---

### `GET /api/v1/reports/dashboard`

**Descripción:** Devuelve los KPIs de alto nivel del período.

**Respuesta exitosa `200`:**
```json
{
  "success": true,
  "data": {
    "period": { "from": "2026-01-01", "to": "2026-03-31" },
    "totalAppointments": 142,
    "completedAppointments": 118,
    "cancelledAppointments": 14,
    "noShows": 10,
    "cancellationRate": 9.86,
    "activePatients": 47,
    "totalRevenue": 14200000,
    "trend": [
      { "week": "2026-W01", "completed": 8, "cancelled": 1, "noShow": 0 },
      { "week": "2026-W02", "completed": 10, "cancelled": 2, "noShow": 1 }
    ]
  }
}
```

- `activePatients`: pacientes con ≥1 cita CONFIRMED o COMPLETED en el período.
- `totalRevenue`: suma de `payments.amount` donde `status = 'PAID'` y `paid_at` está en el período.
- `trend`: agrupación semanal si el rango ≤ 3 meses; mensual si el rango > 3 meses.

---

### `GET /api/v1/reports/clinical-progress`

**Descripción:** Promedio de puntuaciones de cuestionarios PHQ-9 y GAD-7 a lo largo del tiempo.

**Respuesta exitosa `200`:**
```json
{
  "success": true,
  "data": {
    "period": { "from": "2026-01-01", "to": "2026-03-31" },
    "series": [
      {
        "type": "PHQ9",
        "points": [
          { "period": "2026-01", "avgScore": 12.4, "stdDev": 3.1, "sampleSize": 22 },
          { "period": "2026-02", "avgScore": 10.8, "stdDev": 2.9, "sampleSize": 25 }
        ]
      },
      {
        "type": "GAD7",
        "points": [
          { "period": "2026-01", "avgScore": 9.2, "stdDev": 2.5, "sampleSize": 18 },
          { "period": "2026-02", "avgScore": 8.1, "stdDev": 2.2, "sampleSize": 21 }
        ]
      }
    ]
  }
}
```

- `sampleSize < 5` → el punto no se devuelve (protección de privacidad estadística).

---

### `GET /api/v1/reports/performance`

**Descripción:** Métricas de desempeño del psicólogo.

**Respuesta exitosa `200`:**
```json
{
  "success": true,
  "data": {
    "period": { "from": "2026-01-01", "to": "2026-03-31" },
    "hoursWorked": 118.5,
    "retentionRate": 82.6,
    "goalCompletion": 78.3,
    "avgSessionsPerPatient": 4.2,
    "newPatients": 12,
    "returningPatients": 35
  }
}
```

- `hoursWorked`: suma de `(endTime - startTime)` de citas COMPLETED, en horas.
- `retentionRate`: `(pacientes activos en período actual / pacientes activos en período anterior equivalente) × 100`.
- `goalCompletion`: requiere que el psicólogo tenga configurada una `appointmentGoal` en su perfil (`users.settings`). Si no existe, el campo retorna `null`.

---

### `GET /api/v1/reports/patient-sources`

**Descripción:** Distribución de pacientes por fuente de captación.

**Respuesta exitosa `200`:**
```json
{
  "success": true,
  "data": {
    "period": { "from": "2026-01-01", "to": "2026-03-31" },
    "total": 59,
    "breakdown": [
      { "source": "REFERRAL",    "count": 22, "percentage": 37.3 },
      { "source": "SOCIAL_MEDIA","count": 18, "percentage": 30.5 },
      { "source": "DIRECT",      "count": 12, "percentage": 20.3 },
      { "source": "WEBSITE",     "count":  5, "percentage":  8.5 },
      { "source": "OTHER",       "count":  2, "percentage":  3.4 }
    ]
  }
}
```

- El filtro por fecha aplica sobre `patients.created_at` (o `patient_sources.created_at`), no sobre fechas de citas.

---

### `GET /api/v1/reports/export`

**Descripción:** Genera y descarga un reporte en PDF o CSV.

**Query params adicionales:**
| Parámetro | Valores | Descripción |
|-----------|---------|-------------|
| `type`    | `pdf`, `csv` | Formato de exportación |
| `report`  | `dashboard`, `clinical-progress`, `patient-sources`, `performance` | Reporte a exportar |

**Respuesta:** Descarga directa del archivo con el `Content-Type` adecuado (`application/pdf` o `text/csv`).

---

## 4. Arquitectura de caché Redis

```
Clave: reports:{organizationId}:{psychologistId|"all"}:{reportType}:{from}:{to}
TTL:   1800 segundos (30 minutos)
```

**Flujo:**
1. El controlador construye la clave de caché a partir de los parámetros validados.
2. Si existe en Redis → devuelve el valor cacheado directamente.
3. Si no existe → ejecuta la query de agregación en MySQL → guarda el resultado en Redis → devuelve la respuesta.
4. El endpoint `export` **no usa caché** (genera el archivo en el momento).

> [!TIP]
> Agregar un endpoint interno `DELETE /api/v1/reports/cache` (solo ADMIN) permite invalidar manualmente la caché si se detecta inconsistencia, sin necesidad de reiniciar el servidor.

---

## 5. Estructura de componentes React

```
src/pages/reports/
├── ReportsDashboardPage.jsx        ← contenedor principal
│   ├── DateRangeFilter.jsx         ← presets + datepicker personalizado
│   ├── PsychologistSelector.jsx    ← solo visible para ADMIN
│   ├── ExportButton.jsx            ← PDF / CSV download
│   └── tabs/
│       ├── KpiCardsRow.jsx         ← 4 tarjetas grandes (KPIs)
│       ├── AppointmentsTrendChart.jsx  ← Recharts AreaChart
│       ├── ClinicalProgressChart.jsx  ← Recharts LineChart (PHQ9/GAD7)
│       ├── PerformanceMetricsCard.jsx ← métricas texto + progreso
│       └── PatientSourcesPieChart.jsx ← Recharts PieChart
src/hooks/
├── useReportsDashboard.js    ← React Query / custom hook para /dashboard
├── useReportsPerformance.js
├── useReportsClinical.js
└── useReportsSources.js
src/services/
└── reportsService.js         ← funciones Axios para cada endpoint
```

### Responsabilidades de cada componente

| Componente | Responsabilidad |
|---|---|
| `ReportsDashboardPage` | Gestiona estado de filtros (rango, psicólogo), renderiza tabs, pasa props a hijos |
| `DateRangeFilter` | Selector de preset + DatePicker; emite `{ from, to }` al padre |
| `PsychologistSelector` | Dropdown con lista de psicólogos de la org; solo renderiza si `role === 'ADMIN'` |
| `KpiCardsRow` | 4 cards: Citas completadas, Ingresos, Pacientes activos, Tasa de cancelación |
| `AppointmentsTrendChart` | AreaChart de Recharts; recibe `trend[]` del endpoint dashboard |
| `ClinicalProgressChart` | LineChart multi-serie (una línea por tipo de cuestionario); tooltip con avg + n |
| `PerformanceMetricsCard` | Tarjetas de texto + `ProgressBar` Bootstrap para goalCompletion |
| `PatientSourcesPieChart` | PieChart de Recharts con leyenda y tooltips de porcentaje |
| `ExportButton` | Botón con dropdown PDF/CSV; dispara descarga vía `window.open` o Blob |

---

## 6. Exportación

### PDF (servidor)
- Librería: **pdfkit** (Node.js)
- El servidor genera el documento con:
  - Logo de la organización (opcional, desde Cloudinary)
  - Datos del psicólogo o clínica
  - Período del reporte
  - Tabla de KPIs
  - Gráficas embebidas como imágenes PNG (generadas en el servidor con **chartjs-node-canvas** o datos tabulares equivalentes)
- El archivo se devuelve como stream con `Content-Disposition: attachment; filename="reporte-{fecha}.pdf"`

### CSV (servidor)
- Librería: **json2csv**
- Para `dashboard`: exporta la tabla de tendencia semanal/mensual
- Para `clinical-progress`: exporta los puntos de la serie con período, tipo, avg, stdDev, sampleSize
- Para `patient-sources`: exporta source, count, percentage
- Headers en español

---

## 7. Decisiones técnicas

| Decisión | Alternativas consideradas | Justificación |
|----------|---------------------------|---------------|
| Agregación en MySQL sin DB analítica | Materialización en Redis, data warehouse | Volumen MVP no justifica complejidad adicional |
| Caché Redis 30 min | Sin caché, caché por 5 min | Balance entre frescura de datos y carga en DB |
| pdfkit para PDF | Puppeteer/headless Chrome | pdfkit no requiere browser headless; más liviano en servidor |
| `sampleSize < 5` oculta punto clínico | Sin umbral | Evita des-anonimización estadística en grupos pequeños |
| `patient_sources` tabla separada | Campo en `patients` | Separación de intereses; permite múltiples fuentes en el futuro |
| Granularidad dinámica (semanal/mensual) | Siempre mensual | Mejor UX para rangos cortos |

---

## 8. Riesgos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Queries lentas en MySQL con muchos datos | Media | Alto | Índices compuestos + EXPLAIN en staging antes de deploy |
| Caché desactualizada tras inserción masiva de citas | Baja | Medio | Invalidar caché selectivamente al completar lote de citas (Bull job) |
| Exportación PDF bloquea el event loop | Baja | Medio | Ejecutar generación de PDF en Worker Thread de Node o job en Bull |
| Exposición accidental de PII en agregados | Baja | Crítico | Code review obligatorio, tests de integración que validen ausencia de `patientId` en respuestas |
| PSYCHOLOGIST accede a datos de otro | Baja | Alto | Middleware de autorización compara `req.user.id` vs `psychologistId` del query antes de ejecutar |
