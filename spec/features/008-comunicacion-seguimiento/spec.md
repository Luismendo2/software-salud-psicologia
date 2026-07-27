# 008 · Comunicación y Seguimiento

| Campo       | Valor                               |
|-------------|-------------------------------------|
| **ID**      | 008                                 |
| **Nombre**  | Comunicación y Seguimiento          |
| **Fase**    | 2                                   |
| **Estado**  | propuesta                           |
| **Módulos** | Mensajería, Tareas, Recordatorios, Encuestas |
| **Roles**   | PSYCHOLOGIST, ASSISTANT, PATIENT, ADMIN |

---

## 1. Qué hace

La funcionalidad de Comunicación y Seguimiento agrupa cuatro capacidades complementarias que extienden la relación terapéutica más allá de la sesión presencial o virtual:

1. **Mensajería segura interna**: canal de texto cifrado dentro de la plataforma entre terapeuta y paciente, sin depender de aplicaciones de mensajería personal (WhatsApp, Telegram). Garantiza confidencialidad clínica y trazabilidad.

2. **Tareas terapéuticas**: el psicólogo puede asignar ejercicios, reflexiones o registros de comportamiento entre sesiones. El paciente accede a su portal, completa la tarea y envía su respuesta; el psicólogo revisa el progreso desde su panel.

3. **Recordatorios inteligentes**: un proceso automatizado analiza el historial de inasistencias del paciente (no-shows) y, cuando detecta un patrón de riesgo, envía un recordatorio adicional antes de la próxima cita. En MVP, la regla es simple: ≥ 2 no-shows en los últimos 90 días activa un recordatorio extra.

4. **Encuestas de satisfacción post-sesión**: tras marcar una cita como `COMPLETED`, el sistema programa automáticamente el envío de un breve formulario al paciente con puntuación NPS (0-10) y campo de comentario libre. El psicólogo accede a un panel de resultados agregados.

---

## 2. Por qué

- **Continuidad terapéutica**: el trabajo clínico no termina con la sesión; las tareas y la mensajería permiten sostener el proceso entre citas.
- **Confidencialidad y cumplimiento**: usar canales personales (WhatsApp del psicólogo) para comunicación clínica viola principios de privacidad del paciente. Un canal interno y auditado resuelve esto.
- **Reducción de ausentismo**: los recordatorios basados en historial son más efectivos que los genéricos, especialmente para pacientes con patrón de no-shows, reduciendo citas perdidas y mejorando ingresos.
- **Mejora continua del servicio**: las encuestas de satisfacción proveen retroalimentación cuantitativa (NPS) y cualitativa que el psicólogo o administrador puede usar para detectar problemas de atención tempranamente.
- **Diferenciador de producto**: la combinación de mensajería segura + tareas + recordatorios inteligentes posiciona a PsiAgenda como herramienta clínica integral frente a soluciones de solo-agenda.

---

## 3. Historias de usuario

| ID    | Rol          | Historia                                                                                                          |
|-------|--------------|-------------------------------------------------------------------------------------------------------------------|
| US-01 | Psicólogo    | Quiero enviar mensajes internos a mi paciente para hacer seguimiento entre sesiones sin usar mi WhatsApp personal. |
| US-02 | Paciente     | Quiero recibir mensajes de mi terapeuta dentro de la plataforma para mantener comunicación segura y privada.       |
| US-03 | Psicólogo    | Quiero asignar tareas terapéuticas con fecha límite para que el paciente las complete entre sesiones.              |
| US-04 | Paciente     | Quiero ver mis tareas pendientes y enviar mi respuesta desde mi portal para que el terapeuta la revise.            |
| US-05 | Psicólogo    | Quiero ver el estado de las tareas asignadas (pendiente, en progreso, completada, vencida) para evaluar el avance. |
| US-06 | Paciente     | Quiero recibir un recordatorio de mi cita con mayor anticipación si en el pasado he faltado con frecuencia.        |
| US-07 | Paciente     | Quiero responder una breve encuesta de satisfacción después de cada sesión para dar mi opinión sobre la atención.  |
| US-08 | Psicólogo    | Quiero ver un resumen del NPS de mis pacientes y los comentarios para identificar áreas de mejora.                 |
| US-09 | Administrador| Quiero ver el NPS agregado de toda la organización para evaluar la calidad del servicio.                           |
| US-10 | Psicólogo    | Quiero recibir una notificación por correo cuando un paciente me responde un mensaje.                              |

---

## 4. Criterios de aceptación

### 4.1 Mensajería segura

| # | Criterio | Verificable |
|---|----------|-------------|
| AC-01 | Un psicólogo puede redactar y enviar un mensaje a un paciente asignado; el mensaje aparece en el hilo de conversación del psicólogo en menos de 1 segundo de la confirmación del envío. | ✅ |
| AC-02 | Un paciente puede redactar y enviar un mensaje a su psicólogo; el mensaje aparece en el hilo del paciente en menos de 1 segundo de la confirmación del envío. | ✅ |
| AC-03 | El frontend refresca el hilo de mensajes consultando `GET /api/v1/conversations/:id/messages?after=<timestamp>` cada 10 segundos (polling). No se usa WebSocket en MVP. | ✅ |
| AC-04 | Cuando el destinatario recibe un nuevo mensaje, el sistema envía una notificación por correo electrónico con el aviso (sin incluir el contenido del mensaje en el cuerpo del correo). | ✅ |
| AC-05 | Un psicólogo no puede leer ni enviar mensajes a pacientes de otro psicólogo de la misma organización, salvo que sea ADMIN o ASSISTANT con permiso explícito. | ✅ |
| AC-06 | Un mensaje marcado como leído (`PUT /api/v1/conversations/:id/messages/:msgId/read`) actualiza el campo `readAt` en base de datos y el indicador visual en la interfaz. | ✅ |

### 4.2 Tareas terapéuticas

| # | Criterio | Verificable |
|---|----------|-------------|
| AC-07 | El psicólogo puede crear una tarea con título, descripción y fecha límite; la tarea aparece en el portal del paciente en el siguiente refresco (≤ 30 s en MVP). | ✅ |
| AC-08 | El estado de la tarea sigue el ciclo: `ASSIGNED → IN_PROGRESS → COMPLETED`; si la fecha límite pasa sin respuesta, un job diario la cambia automáticamente a `OVERDUE`. | ✅ |
| AC-09 | El paciente puede enviar una respuesta de texto a una tarea (`PUT /api/v1/tasks/:id/respond`); el estado cambia a `COMPLETED` y el psicólogo puede leer la respuesta en su panel. | ✅ |
| AC-10 | El psicólogo ve en `TaskManagerPage` la lista de tareas agrupadas por estado para todos sus pacientes, con filtro por paciente. | ✅ |

### 4.3 Recordatorios inteligentes

| # | Criterio | Verificable |
|---|----------|-------------|
| AC-11 | El job diario de recordatorios identifica correctamente a los pacientes con ≥ 2 `NO_SHOW` en los últimos 90 días que tienen una cita en las próximas 24 horas y les envía un recordatorio adicional por correo. | ✅ |
| AC-12 | Los recordatorios estándar (para todos los pacientes con cita al día siguiente) siguen enviándose independientemente de la lógica de riesgo. El recordatorio de riesgo es *adicional*, no sustituto. | ✅ |
| AC-13 | El sistema registra en `AuditLog` cada recordatorio inteligente enviado, incluyendo `patientId`, `appointmentId` y timestamp, de modo que se pueda auditar sin duplicados. | ✅ |

### 4.4 Encuestas de satisfacción

| # | Criterio | Verificable |
|---|----------|-------------|
| AC-14 | Al cambiar el estado de una cita a `COMPLETED`, un job de Bull encola automáticamente el envío de la encuesta de satisfacción al paciente; la encuesta se crea en base de datos con `submittedAt = null`. | ✅ |
| AC-15 | El modal de encuesta (`PostSessionSurveyModal`) se abre automáticamente en el portal del paciente la próxima vez que inicia sesión tras tener una encuesta pendiente. Incluye slider NPS (0-10) y campo de comentario libre. | ✅ |
| AC-16 | Una vez enviada la respuesta del paciente, la encuesta no puede modificarse. Si el paciente cierra el modal sin responder, puede hacerlo después desde su perfil (hasta 7 días tras la sesión). | ✅ |
| AC-17 | El psicólogo accede a `SatisfactionDashboard` y visualiza: NPS promedio del período, distribución de puntajes (gráfico de barras Recharts), y listado de comentarios filtrados por rango de fechas. | ✅ |

---

## 5. Fuera de alcance (MVP Fase 2)

- **WebSockets / tiempo real**: la mensajería en MVP usa polling HTTP cada 10 segundos. La migración a WebSocket (Socket.io o similar) queda para Fase 3.
- **Mensajes multimedia**: no se soportan adjuntos, imágenes ni archivos en el chat. Solo texto plano.
- **Grupos o conversaciones multiparte**: solo conversaciones 1 a 1 (psicólogo ↔ paciente). No hay grupos terapéuticos en el chat.
- **Chatbot / respuestas automáticas con IA**: no hay respuestas generadas por IA en el canal de mensajería.
- **Machine learning para predicción de no-shows**: la lógica de recordatorio inteligente es una regla fija (≥ 2 no-shows en 90 días). El modelo predictivo estadístico queda fuera de MVP.
- **Encuestas personalizables**: el formulario post-sesión es fijo (NPS + texto libre). No se puede personalizar por psicólogo.
- **Tareas con archivos adjuntos**: las respuestas a tareas son solo texto. Los adjuntos de evidencia (fotos, diarios) quedan fuera.
- **Exportación de resultados de encuestas**: no hay exportación a CSV/PDF en esta fase.
- **Integración de mensajería con WhatsApp Business API**: los mensajes son exclusivamente internos a la plataforma.
- **Notificaciones push (PWA/móvil)**: las notificaciones de nuevos mensajes son por correo electrónico solamente.
