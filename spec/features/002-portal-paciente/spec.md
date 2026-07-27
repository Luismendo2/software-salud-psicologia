# 002 · Portal del Paciente

**Estado:** propuesta

## Qué hace

Provee un espacio web seguro y adaptado a móviles donde el paciente puede gestionar toda la relación con su psicólogo. Desde allí, puede ver su historial, firmar consentimientos legales, llenar su anamnesis inicial y realizar pagos en línea.

## Por qué

Empodera al paciente dándole control y transparencia sobre su proceso. Elimina la fricción administrativa de enviar PDFs por correo para firmar, enviar links de pago sueltos por WhatsApp, y solicitar el historial de citas manualmente.

## Criterios de aceptación

- [ ] El paciente puede registrarse o iniciar sesión con correo y contraseña.
- [ ] La interfaz del portal se adapta perfectamente a dispositivos móviles (responsive Bootstrap 5).
- [ ] El paciente ve un dashboard o panel principal con su próxima cita destacada (si la hay).
- [ ] El paciente puede acceder a un "Formulario de ingreso" (anamnesis).
- [ ] El formulario de ingreso guarda antecedentes, motivo de consulta y datos de contacto de emergencia.
- [ ] El sistema notifica al paciente si tiene consentimientos informados pendientes de firma.
- [ ] El paciente puede leer el consentimiento y dibujar su firma digital (canvas) o escribir su nombre para aceptar.
- [ ] El consentimiento firmado se guarda inmutable con la fecha, hora y dirección IP.
- [ ] El paciente puede ver una lista de todas sus sesiones pasadas (fecha y estado).
- [ ] El paciente puede ver su historial de pagos y facturas emitidas.
- [ ] El paciente puede pagar sesiones pendientes directamente desde el portal usando Wompi (tarjeta o transferencia).
- [ ] Al realizar un pago exitoso, el estado de la factura/sesión se actualiza automáticamente a PAGADO.
- [ ] El paciente no tiene acceso a las notas clínicas escritas por el terapeuta, solo a la información administrativa.
- [ ] Existe un botón para cerrar sesión de manera segura.
- [ ] Las rutas del portal están protegidas y requieren autenticación válida (rol PATIENT).

## Fuera de alcance

- Aplicación móvil nativa (iOS/Android). El portal es web y responsive.
- Chat en tiempo real desde el portal (se incluirá en el módulo de Comunicación).
- Descarga completa de la historia clínica médica (requiere proceso legal manual, no self-service MVP).
