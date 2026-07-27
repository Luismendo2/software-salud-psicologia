# 001 · Gestión de Agenda y Citas

**Estado:** propuesta

## Qué hace

Este módulo permite a los psicólogos gestionar sus horarios y a los pacientes agendar sus citas de manera autónoma. Proporciona una agenda digital completa y automatiza la confirmación de asistencia.

## Por qué

Es el corazón operativo del consultorio. Elimina la necesidad de coordinar horarios manualmente por WhatsApp o teléfono, reduce el ausentismo mediante recordatorios automáticos y permite al terapeuta organizar su tiempo de forma eficiente.

## Criterios de aceptación

- [ ] El psicólogo puede ver su agenda en vista diaria, semanal y mensual (calendario interactivo).
- [ ] Las citas en el calendario muestran diferentes colores/badges según su estado (Confirmada, Pendiente, Cancelada, Reprogramada).
- [ ] El psicólogo puede definir sus horarios de trabajo (días, horas, duración de sesión y pausas entre citas).
- [ ] El psicólogo puede bloquear horarios específicos (ej. vacaciones, emergencias).
- [ ] El paciente puede acceder a un enlace público para reservar cita.
- [ ] El enlace público muestra únicamente los horarios disponibles (no bloqueados ni ocupados).
- [ ] El paciente puede seleccionar si la cita será PRESENCIAL o VIRTUAL (si el terapeuta lo permite).
- [ ] Al agendar una cita, su estado inicial es PENDING.
- [ ] El sistema envía una confirmación automática al paciente (por email o WhatsApp) al agendar.
- [ ] 24 horas antes de la cita, el sistema envía un recordatorio automático al paciente.
- [ ] 1 hora antes de la cita, el sistema envía un segundo recordatorio automático.
- [ ] El paciente puede confirmar o cancelar la cita desde el mensaje de recordatorio (cambia estado a CONFIRMED o CANCELLED).
- [ ] El psicólogo puede marcar manualmente una cita como COMPLETED o NO_SHOW.
- [ ] El sistema mantiene una lista de espera para pacientes que buscan un horario ya ocupado.
- [ ] Si una cita se cancela, el sistema notifica automáticamente a los pacientes en lista de espera para ese bloque.

## Fuera de alcance

- Sincronización bidireccional con Google Calendar o Outlook (se hará en una fase posterior).
- Cobro automático al agendar (el pago se maneja en el módulo de Facturación y Pagos).
- Videollamadas integradas (se manejan en el módulo de Telepsicología, aquí solo se define el tipo VIRTUAL).
