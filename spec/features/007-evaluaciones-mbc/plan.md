# 007 · Evaluaciones y Medición del Progreso (MBC) — Plan

## Enfoque
Para mantener el sistema flexible ante cientos de cuestionarios psicológicos distintos, los instrumentos (tests) se definirán mediante JSON en una tabla "Template". Las respuestas del paciente se guardan en formato JSON, y el backend calcula el puntaje según las reglas definidas en el template. Usaremos Recharts para visualizar la evolución histórica de un paciente en una escala específica.

## Implementación

### Esquema de Base de Datos
- **`AssessmentTemplate`**: `id`, `code` (ej. PHQ9), `name`, `questions` (arreglo JSONB definiendo título, opciones, valor de cada opción), `maxScore`, `scoringRules` (JSONB mapeando rangos de puntaje a niveles de severidad)
- **`Assessment`**: `id`, `patientId`, `psychologistId`, `templateCode`, `responses` (JSONB con las selecciones del paciente), `score` (int, autocalculado por BD), `severity` (string calculada), `riskFlag` (booleano, ej. riesgo de suicidio detectado), `sentAt`, `completedAt`, `clinicalRecordId`

### Endpoints de API

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/api/v1/assessment-templates` | Listar tests disponibles | PSYCHOLOGIST |
| POST | `/api/v1/assessments` | Enviar test a un paciente (estado pending) | PSYCHOLOGIST |
| GET | `/api/v1/assessments` | Consultar tests (con query params p/ paciente) | Ambos |
| GET | `/api/v1/assessments/:id` | Ver respuestas y puntaje | Ambos |
| PUT | `/api/v1/assessments/:id/respond`| Guardar las respuestas ingresadas | PATIENT |
| GET | `/api/v1/patients/:id/progress-chart` | Devuelve time-series de scores para gráficas | PSYCHOLOGIST |

### Componentes React (Psicólogo)
- **`AssessmentsPanel`**: Vista dentro de la HC que lista evaluaciones.
- **`SendAssessmentModal`**: Modal para elegir el template y "enviar" la notificación al paciente.
- **`ProgressChartPage`**: Contiene un componente `Recharts` `LineChart`. Eje X: Fecha. Eje Y: Puntaje. Dibuja líneas para PHQ-9, GAD-7 u otro filtro.
- **`AssessmentResultCard`**: Muestra el puntaje final, un badge con la severidad (ej. "Severo") y, si `riskFlag` es true, una alerta roja prominente.

### Componentes React (Paciente)
- **`MyAssessmentsPage`**: Listado de evaluaciones pendientes por responder.
- **`AssessmentFormPage`**: Renderiza de forma dinámica las preguntas leyendo el JSON del template. Valida que todas se respondan y emite un POST.

### Alertas (Notificaciones Críticas)
- Si un paciente responde afirmativamente al ítem 9 del PHQ-9 (ideación suicida) o cualquier regla definida como riesgosa:
  1. El endpoint `PUT .../respond` setea `riskFlag = true`.
  2. El backend lanza un Job asíncrono a la cola Bull.
  3. El worker envía un email urgente al `psychologistId` indicando el riesgo alto y un link directo a la HC.

## Decisiones
- **JSONB para Preguntas**: Hardcodear campos fijos para el PHQ-9 limita el sistema. Usar un esquema general permite crear el GAD-7, PCL-5 u otros fácilmente insertando datos semilla en la tabla `AssessmentTemplate`.
- **Cálculo de puntaje Server-Side**: La app del paciente nunca debe calcular el puntaje final y enviarlo (podría ser manipulado). El frontend manda el raw data (opciones seleccionadas) y el backend computa el `score`, la `severity` y el `riskFlag`.

## Riesgos
- **Riesgo Legal/Clínico**: Las pruebas pueden arrojar falsos positivos (o negativos). Es mandatorio añadir texto indicando que la prueba "es una herramienta de tamizaje y no un diagnóstico formal".
- **Fallos de Notificación**: Si el correo de alerta falla, el psicólogo podría no enterarse del riesgo suicida a tiempo. Mitigación: Mostrar también una alerta prominente dentro del dashboard de la aplicación.
