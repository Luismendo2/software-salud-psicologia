# 008 · Comunicación y Seguimiento — Plan

## Enfoque
Para el chat MVP, usaremos HTTP Long Polling simple en lugar de WebSockets para reducir la complejidad operativa y de infraestructura inicial, asumiendo volúmenes bajos de mensajes por sesión simultánea. Las tareas terapéuticas usarán el modelo estándar relacional CRUD. Los recordatorios "inteligentes" y las encuestas se automatizarán vía jobs programados (cron/Bull).

## Implementación

### Esquema de Base de Datos
- **`Conversation`**: `id`, `patientId`, `psychologistId`, `lastMessageAt`
- **`Message`**: `id`, `conversationId`, `senderId`, `receiverId`, `content`, `readAt`, `createdAt`
- **`TherapeuticTask`**: `id`, `patientId`, `psychologistId`, `title`, `description`, `dueDate`, `status` (ASSIGNED|IN_PROGRESS|COMPLETED|OVERDUE), `completedAt`, `response` (texto del paciente)
- **`SatisfactionSurvey`**: `id`, `appointmentId`, `patientId`, `psychologistId`, `npsScore` (0-10), `comment`, `submittedAt`

### Endpoints de API

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/api/v1/conversations` | Listar conversaciones activas | Ambos |
| GET | `/api/v1/conversations/:id/messages` | Listar mensajes. Admite query `?after=timestamp` | Ambos |
| POST | `/api/v1/conversations/:id/messages` | Enviar mensaje | Ambos |
| PUT | `/api/v1/conversations/:id/messages/read`| Marcar como leídos | Ambos |
| GET | `/api/v1/tasks` | Listar tareas | Ambos |
| POST | `/api/v1/tasks` | Asignar tarea a paciente | PSYCHOLOGIST |
| PUT | `/api/v1/tasks/:id/respond` | Entregar tarea (paciente) | PATIENT |
| POST | `/api/v1/surveys` | Crear encuesta (auto por backend)| Sistema |
| PUT | `/api/v1/surveys/:id` | Responder encuesta NPS | PATIENT |
| GET | `/api/v1/surveys` | Ver resultados agregados | PSYCHOLOGIST |

### Componentes React
- **Psicólogo**:
  - `MessagingPage`: Barra lateral con pacientes, panel derecho con hilo de mensajes. Llama periódicamente a `GET ...?after=...` usando SWR o React Query.
  - `TaskManagerPage`: Creación y seguimiento visual (kanban o lista) de tareas asignadas.
  - `SatisfactionDashboard`: Gráfico de medidor NPS (Recharts) basado en `SatisfactionSurvey`.
- **Paciente**:
  - `MessageInboxPage`: Buzón de chat.
  - `TaskListPage`: Tareas por completar y completadas (puede añadir su texto de respuesta).
  - `PostSessionSurveyModal`: Un modal que se abre automáticamente en su dashboard la primera vez que inicia sesión tras una cita finalizada que no tiene encuesta enviada.

### Tareas en Segundo Plano (Jobs)
- **Recordatorios Inteligentes (No-Show Prevention)**: Un cron job se ejecuta cada noche. Busca las citas de las próximas 24-48 horas. Para cada paciente, calcula cuántas inasistencias (NO_SHOW) tiene. Si el número es >= 2, programa notificaciones de SMS/WhatsApp extra reforzadas a las 8 horas y 2 horas antes de la sesión.
- **Generador de Encuestas**: Un job se ejecuta 15 min después de que una cita cambie a estado COMPLETED, y crea el registro `SatisfactionSurvey` enviando un correo al paciente.

## Decisiones
- **Sin WebSockets en MVP**: Añade necesidad de balanceadores pegajosos (sticky sessions) y manejo complejo de reconexiones. React Query con `refetchInterval` de 10s en la página del chat activo es suficiente para la v1.
- **NPS como métrica única estándar**: El Net Promoter Score (0-10) es estándar, se entiende fácilmente y da un KPI objetivo al psicólogo para medir calidad.

## Riesgos
- **Uso indebido del chat**: Pacientes pueden confundirlo con una línea de emergencias 24/7. Mitigación: Añadir banner fijo arriba del chat en el portal que indique: "El chat no es para emergencias y el tiempo de respuesta varía."
