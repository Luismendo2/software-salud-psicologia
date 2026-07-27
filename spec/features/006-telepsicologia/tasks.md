# 006 · Telepsicología — Tareas

## Configuración Daily.co y Base de Datos
- [ ] Crear cuenta en Daily.co y obtener llaves de API.
- [ ] Crear el modelo `VideoSession` en Prisma (`dailyRoomName`, `dailyRoomUrl`, `tokens`, etc.).
- [ ] Crear el modelo `TeleConsent` para el consentimiento informado digital.
- [ ] Generar migración Prisma y aplicarla.

## Backend - Gestión de Sesiones
- [ ] Implementar un módulo de servicio `DailyService` que encapsule las llamadas HTTP a la API de Daily.co (crear room, crear meeting tokens).
- [ ] Implementar endpoint `POST /api/v1/sessions/:appointmentId/room` que llame a `DailyService` y guarde en `VideoSession`.
- [ ] Implementar endpoint `GET /api/v1/sessions/:appointmentId/token` (valida permisos y retorna el token adecuado para psicólogo o paciente).
- [ ] Implementar endpoints `PUT .../start` y `PUT .../end` para controlar el estado lógico de la sala en PsiAgenda.

## Backend - Consentimiento
- [ ] Implementar endpoint `POST /api/v1/sessions/:appointmentId/consent` para registrar la firma digital del paciente al consentimiento de telepsicología.

## Frontend - Sala de Espera y Consentimiento (Paciente)
- [ ] Crear `TeleConsentModal` que se muestre antes de la primera cita virtual; incluye el texto legal y botón aceptar/firmar.
- [ ] Crear página `WaitingRoomPage` a la que entra el paciente al hacer clic en el link de la cita.
- [ ] Implementar verificación técnica `DeviceCheckModal` usando `navigator.mediaDevices.getUserMedia` para probar cámara y micrófono antes de intentar entrar a la sala.
- [ ] Implementar polling o estado derivado en la `WaitingRoomPage` para detectar cuándo el terapeuta hace `/start`.

## Frontend - Videollamada (Psicólogo y Paciente)
- [ ] Instalar la librería de React de Daily.co (`@daily-co/daily-js`).
- [ ] Crear `VideoSessionPage` (host view para el psicólogo, participant view para el paciente) integrando el `DailyProvider`.
- [ ] Implementar el grid de video usando `useParticipant` o componentes base.
- [ ] Construir la barra de controles (`VideoControls`): silenciar micrófono, apagar cámara, finalizar sesión (para el terapeuta) o salir (para el paciente).
- [ ] (Opcional) Integrar funcionalidad de chat de texto dentro del room de Daily si el SDK lo soporta o como un panel lateral nuestro.

## Testing
- [ ] Mockear la API de Daily.co en los tests del backend.
- [ ] Probar el flujo de validación: asegurar que un paciente no pueda obtener el token de "owner/host".
- [ ] Validar flujos de error (cámara denegada, error de red) en el componente de verificación de dispositivos.
- [ ] Validar contra los criterios de aceptación de `spec.md`.
- [ ] Mover la feature a "Hecho" en `../../constitution/roadmap.md`.
