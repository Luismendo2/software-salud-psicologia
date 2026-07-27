# 002 · Portal del Paciente — Tareas

## Base de datos
- [ ] Ampliar tabla `Patient` en el esquema.
- [ ] Crear modelo `ConsentDocument`.
- [ ] Crear modelo `IntakeForm`.
- [ ] Generar migración Prisma y aplicarla.

## Backend - Autenticación y Perfil
- [ ] Implementar endpoint `POST /api/v1/auth/patient/register` (crea `User` rol PATIENT y registro `Patient`).
- [ ] Implementar endpoint `GET /api/v1/patients/me`.
- [ ] Implementar endpoint `PUT /api/v1/patients/me`.

## Backend - Formularios y Consentimientos
- [ ] Implementar endpoints para consultar y enviar `IntakeForm` (JSONB).
- [ ] Implementar endpoint de firma de consentimientos.
- [ ] Integrar almacenamiento en Cloudinary/S3 para guardar la imagen base64 de la firma.

## Backend - Citas e Historial
- [ ] Implementar `GET /api/v1/patients/me/appointments`.
- [ ] Implementar `GET /api/v1/patients/me/invoices`.

## Backend - Pagos
- [ ] Crear cuenta de sandbox en Wompi y obtener llaves.
- [ ] Implementar endpoint `/initiate` que construya la URL de redirección a Wompi.
- [ ] Implementar `/webhook` de Wompi con verificación de firma criptográfica (hash de integridad).
- [ ] Lógica para actualizar el estado de la factura al recibir el webhook exitoso.

## Frontend - UI y Layout
- [x] Crear `PatientPortalLayout` con navegación responsive (navbar inferio o sidebar ocultable).
- [x] Crear vista `PatientDashboard` con métricas y alertas.

## Frontend - Componentes de paciente
- [x] Crear `IntakeFormPage` estructurado en secciones con `react-hook-form`.
- [x] Crear `ConsentSignPage` integrando librería de canvas para firmas (`react-signature-canvas`).
- [x] Crear lista de próximas citas e historial de citas.
- [x] Crear lista de facturas pendientes y pagadas.

## Frontend - Integración Pagos
- [x] Crear componente de pago que inicie la transacción y redirija a la pasarela.
- [x] Crear página de retorno (éxito/fracaso) después de que Wompi redirija de vuelta al portal.

## Testing
- [ ] Testear registro y login de paciente.
- [ ] Testear validaciones del formulario de ingreso.
- [ ] Mockear API de Wompi y testear que el webhook actualiza correctamente la factura en BD.
- [ ] Verificar usabilidad del canvas de firma en vista de móvil.
- [ ] Validar contra los criterios de aceptación de `spec.md`.
- [ ] Mover la feature a "Hecho" en `../../constitution/roadmap.md`.
