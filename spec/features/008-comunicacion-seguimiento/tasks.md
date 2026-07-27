# 008 · Comunicación y Seguimiento — Tareas

## Base de datos
- [ ] Crear los modelos `Conversation`, `Message`, `TherapeuticTask`, `SatisfactionSurvey`.
- [ ] Añadir restricciones (foreign keys) y generar migración Prisma.

## Backend - Mensajería
- [ ] Implementar endpoint de listar conversaciones.
- [ ] Implementar paginación (offset o cursor) en la lectura de mensajes (`GET .../messages`).
- [ ] Implementar envío de mensajes (`POST .../messages`) asegurando sanitización básica del texto.
- [ ] Lógica para actualizar `lastMessageAt` en `Conversation` tras cada envío.
- [ ] Añadir hook/servicio que envíe email al destinatario si recibe un mensaje y lleva > 30min desconectado.

## Backend - Tareas y Encuestas
- [ ] Implementar CRUD de `TherapeuticTask`.
- [ ] Implementar endpoint de entrega de tarea por el paciente (`PUT .../respond`).
- [ ] Implementar lógica (cron o Bull trigger) que crea registros de `SatisfactionSurvey` tras una sesión completada.
- [ ] Implementar el endpoint para que el paciente envíe la encuesta con validación NPS 0-10.
- [ ] Implementar dashboard de encuestas para el psicólogo.

## Recordatorios Inteligentes (Jobs)
- [ ] Programar un Bull Job repetible (ej. cada medianoche).
- [ ] Escribir query que detecte pacientes "riesgosos" (con historial de `status = NO_SHOW`).
- [ ] Programar notificaciones (Nodemailer/Twilio) específicas de refuerzo para esos casos.

## Frontend - Psicólogo
- [ ] Crear `MessagingPage` con listado de conversaciones y ventana de chat.
- [ ] Instalar SWR o react-query y configurar el *polling* cada 10-15s para el hilo de mensajes.
- [ ] Construir `TaskManagerPage` con vista de tarjetas (pendientes, entregadas, atrasadas).
- [ ] Crear `SatisfactionDashboard` con cálculo del score NPS (Promotores % - Detractores %).

## Frontend - Portal Paciente
- [ ] Crear la vista `MessageInboxPage` para el portal.
- [ ] Añadir banner de "No usar en caso de emergencia" encima del chat.
- [ ] Crear la vista `TaskListPage` (lista de tareas pendientes y su detalle).
- [ ] Construir y testear el `PostSessionSurveyModal` (estrellas/escala y caja de texto).

## Testing
- [ ] Testear la creación de mensajes y asegurarse que un usuario no pueda escribir en conversaciones ajenas.
- [ ] Testear la función que calcula los recordatorios extra en base a datos históricos.
- [ ] Test de UI para la captura correcta del NPS y envío del form.
- [ ] Validar contra los criterios de aceptación de `spec.md`.
- [ ] Mover la feature a "Hecho" en `../../constitution/roadmap.md`.
