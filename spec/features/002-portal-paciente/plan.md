# 002 · Portal del Paciente — Plan

## Enfoque

El portal será una sección separada del enrutamiento de React (`/portal/*`) con su propio layout. Se priorizará el diseño móvil usando los componentes offcanvas y cards de Bootstrap. La firma de documentos se hará mediante un componente `<canvas>` html5. Los pagos se delegarán al checkout de Wompi.

## Implementación

### Esquema de Base de Datos

- Agregar a **`Patient`**: campos ampliados para el perfil (`address`, `emergencyContactName`, `emergencyContactPhone`).
- **`ConsentDocument`**: `id`, `patientId`, `type` (GENERAL, TELEPSICOLOGIA, DATOS), `signedAt`, `signatureUrl`, `ipAddress`, `version`
- **`IntakeForm`**: `id`, `patientId`, `data` (JSONB con respuestas), `completedAt`

### Endpoints de API

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| POST | `/api/v1/auth/patient/register` | Registro de paciente | Público |
| POST | `/api/v1/auth/login` | Login (retorna JWT) | Público |
| GET | `/api/v1/patients/me` | Obtener perfil del paciente logueado | PATIENT |
| PUT | `/api/v1/patients/me` | Actualizar datos de contacto | PATIENT |
| GET | `/api/v1/patients/me/appointments` | Obtener historial y próximas citas | PATIENT |
| GET | `/api/v1/patients/me/invoices` | Facturas y estado de pago | PATIENT |
| GET | `/api/v1/patients/me/intake-form` | Obtener estado del formulario de ingreso | PATIENT |
| POST | `/api/v1/patients/me/intake-form` | Guardar formulario de ingreso (JSON) | PATIENT |
| POST | `/api/v1/patients/me/consents/:type/sign` | Firmar documento | PATIENT |
| POST | `/api/v1/payments/initiate` | Crear sesión de pago Wompi | PATIENT |
| POST | `/api/v1/payments/webhook` | Webhook público de Wompi | Público |

### Componentes React

- **`PatientPortalLayout`**: Contenedor principal, navbar móvil con Offcanvas.
- **`PatientDashboard`**: Resumen. Muestra alertas de "Formulario incompleto" o "Pago pendiente".
- **`UpcomingAppointments`**: Lista de citas futuras.
- **`AppointmentHistoryPage`**: Tabla o lista de sesiones pasadas.
- **`IntakeFormPage`**: Formulario multi-paso usando `React Hook Form`.
- **`ConsentSignPage`**: Renderiza el texto legal y un componente `react-signature-canvas` para la firma.
- **`InvoiceListPage`**: Historial financiero del paciente.
- **`PaymentPage`**: Redirecciona a la pasarela Wompi con el id de referencia.

## Decisiones

- **JSONB para IntakeForm**: El formulario inicial puede variar entre terapeutas o con el tiempo. Guardarlo como JSONB permite flexibilidad sin tener 50 columnas en la tabla `Patient`.
- **Firma digital básica**: Se usará un canvas para capturar el trazo y se guardará como imagen PNG, junto a la IP y fecha. Esto cumple con la validez legal básica requerida para consentimientos clínicos estándar.
- **Pagos delegados**: No almacenaremos tarjetas de crédito. Se redireccionará al Widget/Checkout de Wompi y recibiremos confirmación asíncrona mediante Webhook.

## Riesgos

- **Webhooks fallidos:** Si Wompi envía la confirmación del pago y nuestro servidor falla, la factura queda pendiente. Mitigación: Wompi reintenta webhooks, pero además implementaremos un botón "Verificar pago" que consulte la API de Wompi explícitamente desde el frontend.
