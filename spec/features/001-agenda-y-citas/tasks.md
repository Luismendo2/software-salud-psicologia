# 001 · Gestión de Agenda y Citas — Tareas

## Base de datos
- [ ] Crear modelo `Appointment` en `schema.prisma`.
- [ ] Crear modelo `AvailabilityRule`.
- [ ] Crear modelo `TimeBlock`.
- [ ] Crear modelo `WaitingList`.
- [ ] Generar migración Prisma y aplicarla (`prisma migrate dev`).

## Backend - Reglas y Disponibilidad
- [ ] Crear servicio `AvailabilityService` con la lógica de cálculo de slots libres.
- [ ] Implementar endpoint `GET /api/v1/availability-rules` y `PUT`.
- [ ] Implementar endpoint `GET /api/v1/psychologists/:id/availability` (integra cálculo al vuelo).
- [ ] Implementar endpoint CRUD para `TimeBlock`.

## Backend - Citas
- [ ] Implementar endpoint `POST /api/v1/appointments` con validación de disponibilidad y concurrencia.
- [ ] Implementar endpoint `GET /api/v1/appointments` con filtros por fecha.
- [ ] Implementar endpoints `PUT` y `DELETE` para citas.
- [ ] Implementar endpoints de cambio de estado (`/confirm`, `/cancel`).

## Backend - Lista de espera
- [ ] Implementar endpoint `POST /api/v1/waiting-list`.
- [ ] Implementar trigger/lógica que al cancelar cita, busque en la lista de espera y encole evento de notificación.

## Frontend - Configuración de agenda
- [x] Crear componente `AvailabilitySettingsPage` con formulario dinámico para los 7 días de la semana.
- [x] Integrar guardado de reglas con el backend.
- [x] Crear componente para gestionar bloqueos manuales (`TimeBlock`).

## Frontend - Calendario del profesional
- [x] Instalar y configurar `FullCalendar` en `CalendarView`.
- [x] Crear componente `AgendaPage` integrando el calendario.
- [x] Conectar el calendario con el endpoint de `GET /api/v1/appointments`.
- [x] Aplicar colores según estado (`badge` types definidos en tech-stack).
- [x] Implementar `AppointmentModal` para crear/editar citas al hacer clic en el calendario.
- [ ] Implementar drag-and-drop en el calendario para mover citas (llama a PUT).

## Frontend - Reserva pública del paciente
- [x] Crear `BookingPublicPage` (vista sin autenticación).
- [x] Implementar selección de día y carga de horas disponibles usando `/availability`.
- [x] Implementar formulario final de datos del paciente para reservar.
- [x] Mostrar pantalla de confirmación exitosa.

## Notificaciones y Colas (Jobs)
- [ ] Configurar conexión Redis y cola Bull para `appointment-reminders`.
- [ ] Implementar job handler que envía email (Nodemailer) o WhatsApp (Twilio) 24h antes.
- [ ] Implementar job handler para 1h antes.
- [ ] Añadir lógica para encolar/cancelar jobs cuando se crea, edita o cancela una cita en el backend.
- [ ] Crear worker para notificar a la lista de espera de un slot liberado.

## Testing
- [ ] Escribir tests unitarios para `AvailabilityService` (probar cruce de horarios, pausas y solapamientos).
- [ ] Escribir tests de integración para creación de citas (evitar doble reserva).
- [ ] Escribir tests para el flujo de reserva pública.
- [ ] Validar flujos de UI clave con React Testing Library.
- [ ] Validar contra los criterios de aceptación de `spec.md`.
- [ ] Mover la feature a "Hecho" en `../../constitution/roadmap.md`.
