# 005 · Facturación y Pagos

| Campo        | Valor                          |
|--------------|--------------------------------|
| **ID**       | 005                            |
| **Estado**   | propuesta                      |
| **Fase**     | MVP (Fase 1)                   |
| **Módulo**   | Facturación y Pagos            |
| **Última actualización** | 2026-06-30        |

---

## 1. Qué hace

El módulo de Facturación y Pagos permite a los psicólogos y administradores de PsiAgenda gestionar el ciclo económico completo de cada sesión clínica: desde la generación de la factura electrónica válida ante la DIAN (Dirección de Impuestos y Aduanas Nacionales de Colombia) hasta la recepción del pago en línea por parte del paciente, pasando por el envío automático del comprobante y la consulta de reportes financieros.

El psicólogo puede crear una factura de dos formas:

1. **Manual**: abre el formulario de facturación, selecciona el paciente, el concepto y el valor, y emite la factura.
2. **Automática**: al marcar una cita como `COMPLETED`, el sistema ofrece la opción de generar la factura correspondiente de forma inmediata.

Una vez generada, la factura queda registrada como borrador en la base de datos y se sincroniza con el proveedor de facturación electrónica (Siigo o Alegra) para obtener el CUFE (Código Único de Factura Electrónica) exigido por la DIAN. El sistema genera entonces un PDF firmado digitalmente que incluye código QR con el CUFE y lo envía al paciente por correo electrónico.

Los pagos en línea se procesan a través de **Wompi** (pasarela primaria) o **PayU** (alternativa). Cuando el paciente completa el pago, el sistema actualiza el estado de la factura a `PAID` y re-envía el comprobante definitivo.

El módulo también expone reportes financieros con resumen de ingresos, sesiones facturadas, pagos pendientes y estadísticas desagregadas por terapeuta.

---

## 2. Por qué

- **Cumplimiento legal**: La facturación electrónica es obligatoria en Colombia para prestadores de servicios de salud. No contar con ella impone sanciones económicas y puede inhabilitar al psicólogo para cobrar a través de EPS o seguros.
- **Eficiencia operativa**: La generación automática de facturas al completar la cita elimina pasos manuales y reduce errores de digitación.
- **Reducción de cuentas por cobrar**: Habilitar el pago en línea inmediato reduce la tasa de citas pagadas tardíamente o no pagadas.
- **Transparencia financiera**: Los reportes financieros permiten al psicólogo y al administrador tomar decisiones basadas en datos reales de ingresos y carga de trabajo.
- **Experiencia del paciente**: Recibir el comprobante PDF por correo en segundos genera confianza y profesionalismo.

---

## 3. Historias de usuario

### HU-005-01 — Psicólogo genera factura al completar una cita
> **Como** psicólogo,  
> **quiero** que al marcar una cita como COMPLETED el sistema me ofrezca generar la factura electrónica automáticamente,  
> **para** no tener que abrir un formulario aparte y así reducir el tiempo administrativo por sesión.

### HU-005-02 — Psicólogo crea una factura manualmente
> **Como** psicólogo,  
> **quiero** poder crear una factura sin que esté ligada a una cita específica,  
> **para** cobrar sesiones fuera de agenda, evaluaciones psicológicas o reportes periciales.

### HU-005-03 — Paciente paga en línea con tarjeta
> **Como** paciente,  
> **quiero** recibir un enlace de pago y poder pagar con tarjeta débito/crédito a través de una pasarela segura,  
> **para** no tener que hacer una transferencia manual ni desplazarme a entregar efectivo.

### HU-005-04 — Paciente recibe comprobante automático
> **Como** paciente,  
> **quiero** recibir el comprobante de pago y la factura electrónica en mi correo electrónico,  
> **para** tener el soporte de la transacción y poder presentarlo ante mi aseguradora si lo necesito.

### HU-005-05 — Psicólogo consulta reportes financieros
> **Como** psicólogo,  
> **quiero** ver un resumen de mis ingresos mensuales, número de sesiones facturadas y pagos pendientes con filtros por rango de fechas,  
> **para** evaluar la salud financiera de mi práctica y planificar mejor.

### HU-005-06 — Administrador consulta reportes por terapeuta
> **Como** administrador de la organización,  
> **quiero** ver las estadísticas financieras desagregadas por terapeuta,  
> **para** supervisar el rendimiento de la organización y generar reportes de distribución de ingresos.

### HU-005-07 — Psicólogo anula una factura
> **Como** psicólogo,  
> **quiero** poder anular una factura que fue generada por error,  
> **para** corregir el registro contable sin eliminar el historial.

---

## 4. Criterios de aceptación

Los siguientes criterios son verificables con un sí/no:

| # | Criterio |
|---|----------|
| CA-01 | Al marcar una cita como `COMPLETED`, el sistema muestra un modal que pregunta si se desea generar la factura. Si el usuario acepta, la factura se crea en estado `DRAFT` con los datos del psicólogo, del paciente y del concepto de la cita. |
| CA-02 | El formulario de creación manual de facturas permite ingresar: paciente, concepto libre, valor antes de IVA, indicador de IVA (0 % o 19 %), y cita asociada opcional. |
| CA-03 | Al emitir la factura (transición `DRAFT → SENT`), el sistema realiza una llamada a la API de Siigo/Alegra y obtiene el CUFE. El campo `dianRef` en la BD queda poblado. Si la llamada falla, la factura permanece en `DRAFT` y se registra el error en `AuditLog`. |
| CA-04 | La factura en PDF generada incluye obligatoriamente: número de factura, fecha de emisión, NIT/cédula del psicólogo, nombre y cédula del paciente, descripción del servicio, subtotal, IVA (si aplica) y total. |
| CA-05 | El PDF de la factura contiene un código QR que apunta a la URL de validación de la DIAN con el CUFE embebido. |
| CA-06 | Al enviar la factura, el sistema despacha un correo electrónico al paciente con el PDF adjunto en un plazo máximo de 60 segundos (procesado mediante Bull queue). |
| CA-07 | El endpoint `POST /api/v1/payments/wompi/initiate` devuelve una `redirectUrl` válida de Wompi a la que el frontend redirige al paciente. |
| CA-08 | El webhook `POST /api/v1/payments/wompi/webhook` verifica la firma HMAC del evento antes de procesar cualquier cambio de estado. Un webhook con firma inválida retorna HTTP 400 y no modifica la BD. |
| CA-09 | Cuando el webhook de Wompi notifica un pago exitoso, el registro `Payment` pasa a `COMPLETED`, la factura asociada pasa a `PAID`, y se encola el envío del comprobante al paciente. |
| CA-10 | El número de factura se genera de forma secuencial y única por organización (ej. `PSI-2026-00001`). No debe ser posible tener dos facturas con el mismo número en la misma organización. |
| CA-11 | Solo los roles `PSYCHOLOGIST` y `ADMIN` pueden crear, emitir y anular facturas. Los `PATIENT` y `ASSISTANT` no tienen acceso de escritura a facturas. |
| CA-12 | La anulación de una factura (`VOID`) solo es posible si su estado actual es `DRAFT` o `SENT`. Una factura en estado `PAID` no puede anularse desde la interfaz; requiere un proceso manual con justificación. |
| CA-13 | El reporte financiero `GET /api/v1/reports/financial` acepta parámetros `startDate`, `endDate` y `psychologistId` (este último solo para `ADMIN`). Devuelve: total de ingresos, número de facturas emitidas, número de facturas pagadas, monto de facturas pendientes, y desglose mensual. |
| CA-14 | La página de reportes financieros (`FinancialReportPage`) muestra al menos un gráfico de barras con ingresos mensuales y una tabla de facturas pendientes de pago. |
| CA-15 | Todos los endpoints del módulo están protegidos por el middleware `authenticate`. Los endpoints de escritura verifican adicionalmente la autorización por rol mediante `authorize`. |
| CA-16 | El sistema soporta el registro de pagos en efectivo o transferencia bancaria (`CASH`, `TRANSFER`) para que el psicólogo pueda marcar manualmente una factura como pagada sin pasar por Wompi. |
| CA-17 | Los datos de tarjeta del paciente nunca pasan por los servidores de PsiAgenda. La integración con Wompi/PayU es únicamente a través de redirect/checkout hospedado por la pasarela. |
| CA-18 | El sistema registra en `AuditLog` cada evento significativo del ciclo de factura: creación, emisión, pago recibido, reenvío de correo y anulación. |

---

## 5. Fuera de alcance (MVP)

Los siguientes elementos quedan explícitamente **fuera del alcance** de esta fase:

- **RIPS automático**: El módulo contempla la entidad `RipsReport` en la base de datos, pero la generación y presentación de reportes RIPS ante el Ministerio de Salud queda para una fase posterior.
- **Integración con PayU**: La pasarela PayU se documenta en el plan técnico como alternativa futura; en MVP solo se implementa Wompi.
- **Facturación a EPS o aseguradoras**: Las facturas de esta fase son exclusivamente paciente–psicólogo (B2C). La facturación a terceros pagadores se abordará en fases posteriores.
- **Módulo de cuotas o pagos parciales**: Las facturas se pagan en su totalidad. No se admiten abonos ni planes de pago.
- **Conciliación bancaria automatizada**: La conciliación de extractos bancarios con los registros de pagos es manual en esta fase.
- **Notas débito y notas crédito electrónicas**: La corrección de facturas se realiza mediante anulación. Las notas de ajuste ante la DIAN quedan para una fase posterior.
- **Portal de autogestion del paciente para historial de facturas**: Los pacientes reciben sus comprobantes por correo, pero no tienen un panel de consulta de facturas dentro de la app en esta fase.
- **Integración con software contable externo** (Siigo Contable, QuickBooks, etc.) más allá de la API de facturación electrónica.
