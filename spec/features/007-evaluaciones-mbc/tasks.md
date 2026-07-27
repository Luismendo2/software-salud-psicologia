# 007 · Evaluaciones y Medición del Progreso (MBC) — Tareas

## Datos semilla y BD
- [ ] Crear el modelo `AssessmentTemplate` y `Assessment` en Prisma.
- [ ] Escribir un script de carga (seed) para insertar los templates base: PHQ-9 y GAD-7, respetando su validación clínica y estructura de JSONB.
- [ ] Generar migración y aplicarla.

## Backend - Gestión de Evaluaciones
- [ ] Implementar módulo/servicio encargado de computar los puntajes base del `AssessmentTemplate.scoringRules`.
- [ ] Implementar endpoints `GET /api/v1/assessment-templates` y `POST /api/v1/assessments`.
- [ ] Implementar endpoint `PUT /api/v1/assessments/:id/respond` para que el paciente guarde respuestas (autocalcula score y severity).
- [ ] Implementar lógica en el endpoint que evalúa el `riskFlag` (ej. ítem 9 del PHQ9).
- [ ] Implementar endpoint `GET /api/v1/patients/:id/progress-chart` (devuelve datos agrupados por tiempo y template).

## Alertas Clínicas
- [ ] Crear job handler en Bull para notificaciones urgentes (ej. `high-risk-alert`).
- [ ] Configurar plantilla de email Nodemailer para riesgo clínico, con link directo a la evaluación.
- [ ] Llamar a la cola desde el servicio backend cuando el flag se active.

## Frontend - Psicólogo
- [ ] Crear componente `ProgressChartPage` instalando `Recharts` y configurando un gráfico de líneas limpio, responsive.
- [ ] Crear `SendAssessmentModal` para seleccionar paciente y tipo de evaluación a pedir.
- [ ] Crear `AssessmentsPanel` en la vista de la historia clínica.
- [ ] Crear `AssessmentResultCard` destacando visualmente si hay una alerta roja.

## Frontend - Portal Paciente
- [ ] Añadir una sección de "Mis Evaluaciones" en el portal (`MyAssessmentsPage`).
- [ ] Construir `AssessmentFormPage` que itere sobre el JSON de preguntas y construya radio buttons dinámicos.
- [ ] Controlar estado del form y bloquear el envío si faltan respuestas.
- [ ] Mostrar pantalla de confirmación "Tus respuestas han sido enviadas al terapeuta" post-envío.

## Testing
- [ ] Tests unitarios estrictos para el motor de cálculo de scores (pasar un mock de respuestas JSON y asegurar que el puntaje final y severidad son exactos).
- [ ] Testear que el sistema dispare el Job de alerta cuando las respuestas cumplen la condición de riesgo.
- [ ] Validar UI del gráfico con datos de muestra estáticos para chequear formateo de fechas.
- [ ] Validar contra los criterios de aceptación de `spec.md`.
- [ ] Mover la feature a "Hecho" en `../../constitution/roadmap.md`.
