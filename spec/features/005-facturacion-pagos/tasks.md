# 005 · Facturación y Pagos — Tareas

## Base de datos
- [ ] Crear modelo `Invoice` en `schema.prisma`.
- [ ] Crear modelo `Payment`.
- [ ] Crear modelo `RipsReport`.
- [ ] Generar migración Prisma y aplicarla.

## Backend - Lógica de negocio (Facturas)
- [ ] Implementar endpoint `POST /api/v1/invoices` (creación manual por el psicólogo).
- [ ] Implementar endpoint `GET /api/v1/invoices` y `/invoices/:id` con filtros y paginación.
- [ ] Implementar `PUT /api/v1/invoices/:id/void` (anulación).
- [ ] Implementar hook/servicio que cree factura automáticamente cuando una cita pase a estado `COMPLETED` (si la config lo indica).

## Integración DIAN (Siigo / Alegra)
- [ ] Implementar adaptador `DianBillingService` para conectarse a la API del proveedor elegido.
- [ ] Mapear los datos de `Invoice` de PsiAgenda al payload esperado por el proveedor de FE.
- [ ] Implementar endpoint `POST /api/v1/invoices/:id/send` (emite electrónicamente, guarda el CUFE retornado).
- [ ] Manejar la generación del PDF con el código QR (descargándolo del proveedor o generándolo localmente).

## Integración Pagos (Wompi)
- [ ] Implementar `POST /api/v1/payments/wompi/initiate` que genere la sesión de checkout y guarde registro PENDING.
- [ ] Implementar Webhook `POST /api/v1/payments/wompi/webhook`.
- [ ] Escribir lógica de validación criptográfica de la firma del webhook de Wompi.
- [ ] Tras validar el pago, actualizar el estado en BD, marcar la `Invoice` como pagada.
- [ ] Configurar job Bull para enviar el correo del recibo/factura al paciente asíncronamente.

## Frontend - UI de Facturación
- [ ] Crear componente `InvoiceListPage` con tabla de datos, filtros de estado y fechas.
- [ ] Crear `InvoiceCreateModal` (seleccionar paciente, concepto, cita, monto).
- [ ] Crear vista de detalle `InvoiceDetailPage` que permita ver los datos y previsualizar el PDF.
- [ ] Añadir botón "Enviar a la DIAN" para emitir facturas en borrador.

## Reportes y Exportación
- [ ] Implementar endpoint `GET /api/v1/reports/financial` (agrupa ingresos por mes, calcula pendientes).
- [ ] Implementar endpoint `POST /api/v1/reports/rips` (genera archivo plano en formato RIPS exigido por el ministerio).
- [ ] Crear componente frontend `FinancialReportPage` usando Recharts (gráficos de barras/líneas para ingresos).
- [ ] Añadir tabla de cuentas por cobrar (facturas no pagadas).

## Testing
- [ ] Testear la generación de firma para Wompi.
- [ ] Escribir mock para la API del proveedor de facturación electrónica.
- [ ] Testear el flujo completo desde cita completada -> factura generada -> envío asíncrono de correo.
- [ ] Validar que los reportes devuelven totales consistentes con la BD.
- [ ] Validar contra los criterios de aceptación de `spec.md`.
- [ ] Mover la feature a "Hecho" en `../../constitution/roadmap.md`.
