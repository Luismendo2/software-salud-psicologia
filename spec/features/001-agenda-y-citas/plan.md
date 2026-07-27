# 001 · Gestión de Agenda y Citas — Plan

## Enfoque

Se utilizará `FullCalendar` en el frontend para una experiencia de calendario rica e interactiva. En el backend, manejaremos reglas de disponibilidad flexibles combinadas con citas existentes para calcular los horarios libres. Las notificaciones asíncronas (recordatorios) se manejarán con colas de Bull y Redis.

## Implementación

### Esquema de Base de Datos (Prisma)

- **`Appointment`**: `id`, `patientId`, `psychologistId`, `organizationId`, `startTime`, `endTime`, `type` (PRESENCIAL|VIRTUAL), `status` (PENDING|CONFIRMED|COMPLETED|CANCELLED|NO_SHOW), `notes`
- **`AvailabilityRule`**: `id`, `psychologistId`, `dayOfWeek` (0-6), `startTime`, `endTime`, `slotDuration` (minutos), `pauseDuration` (minutos)
- **`TimeBlock`**: `id`, `psychologistId`, `startTime`, `endTime`, `reason` (bloqueos manuales)
- **`WaitingList`**: `id`, `patientId`, `psychologistId`, `requestedSlot` (rango de tiempo), `notifiedAt`

### Endpoints de API

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/api/v1/appointments` | Obtener citas en un rango de fechas | PSYCHOLOGIST, ASSISTANT |
| POST | `/api/v1/appointments` | Crear una cita manualmente | PSYCHOLOGIST, ASSISTANT |
| GET | `/api/v1/appointments/:id` | Detalles de una cita | Ambos (si es el dueño) |
| PUT | `/api/v1/appointments/:id` | Modificar cita (fecha/hora) | PSYCHOLOGIST, ASSISTANT |
| POST | `/api/v1/appointments/:id/confirm` | Cambiar estado a CONFIRMED | PATIENT (token), PSYCHOLOGIST |
| POST | `/api/v1/appointments/:id/cancel` | Cambiar estado a CANCELLED | PATIENT (token), PSYCHOLOGIST |
| GET | `/api/v1/psychologists/:id/availability` | Obtener slots libres calculados | Público / Auth |
| GET | `/api/v1/public/book/:psychologistSlug` | Endpoint público para agendar | Público |
| GET/PUT | `/api/v1/availability-rules` | Gestionar reglas de disponibilidad | PSYCHOLOGIST |
| POST | `/api/v1/waiting-list` | Apuntarse a lista de espera | PATIENT |

### Componentes React (Frontend)

- **`AgendaPage`**: Vista principal del calendario para el psicólogo.
- **`CalendarView`**: Wrapper de `FullCalendar` configurado para manejar eventos locales y remotos.
- **`AppointmentCard`**: Tarjeta resumen en la vista de lista o detalles del día.
- **`AppointmentModal`**: Modal para crear o editar una cita rápidamente desde el calendario.
- **`BookingPublicPage`**: Página pública con el flujo de reserva (selección de fecha -> hora -> datos).
- **`AvailabilitySettingsPage`**: Formulario para configurar días, horas y pausas.
- **`WaitingListPage`**: Tabla para gestionar los pacientes en lista de espera.

## Decisiones

- **Cálculo de disponibilidad al vuelo:** En lugar de pre-generar "slots" en la base de datos, el backend calculará la disponibilidad en el momento de la consulta basándose en `AvailabilityRule`, restando los `Appointment` existentes y los `TimeBlock`. Esto evita inconsistencias.
- **Colas para recordatorios:** Usaremos Bull y Redis. Al crear/confirmar una cita, se programan dos "delayed jobs" (24h y 1h antes). Si la cita se mueve, se eliminan los jobs antiguos y se crean nuevos.
- **FullCalendar:** Es estándar de la industria para React, maneja drag-and-drop y zonas horarias muy bien.

## Riesgos

- **Zonas horarias:** Confusión si el terapeuta y el paciente están en distinta zona. Mitigación: Guardar todo en UTC y forzar el renderizado en la zona horaria local del navegador usando librerías como `date-fns-tz`.
- **Doble reserva (Race conditions):** Dos pacientes reservando el mismo slot a la vez. Mitigación: Transacciones en la BD y validación estricta de disponibilidad justo antes del `INSERT`.
