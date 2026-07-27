# 010 · Reportes y Estadísticas — Tareas

## Base de datos e Índices
- [ ] Crear el modelo `PatientSource` en Prisma.
- [ ] Añadir índices a `Appointment(status, startTime)` y `Invoice(status, createdAt)` para asegurar consultas de agregación rápidas.
- [ ] Modificar el endpoint de registro/ingreso de paciente para recolectar y guardar la fuente en `PatientSource`.

## Backend - Queries de Agregación
- [ ] Implementar endpoint `GET /api/v1/reports/dashboard` que reciba rango de fechas y ejecute consultas SUM/COUNT sobre citas y facturas.
- [ ] Implementar `GET /api/v1/reports/clinical-progress` que calcule promedios mensuales de scores en `Assessment`.
- [ ] Implementar `GET /api/v1/reports/performance` (retención de pacientes = % de pacientes con >2 citas vs 1 cita).
- [ ] Implementar `GET /api/v1/reports/patient-sources` que agrupe por el campo `source` de `PatientSource`.

## Backend - Caché y Exportación
- [ ] Instalar Redis y configurar un middleware/wrapper de caché de 30 minutos para los endpoints de métricas (para evitar sobrecarga de BD al recargar la página).
- [ ] Instalar `pdfkit` y `json2csv`.
- [ ] Implementar endpoint `GET /api/v1/reports/export` que reciba tipo (pdf/csv) e informe, y retorne un stream de archivo.

## Frontend - Dashboard
- [ ] Crear el componente contenedor `ReportsDashboardPage` con selector de fechas global.
- [ ] Crear el componente de filtros (mes actual, último trimestre, etc.).
- [ ] Crear el `KpiCardsRow` para visualizar número de citas, ingresos totales, pacientes activos.

## Frontend - Gráficos y Visualización
- [ ] Instalar `Recharts`.
- [ ] Construir `AppointmentsTrendChart` (gráfico de área) en base a los datos retornados.
- [ ] Construir `ClinicalProgressChart` (gráfico de líneas superpuestas para promedios de tests).
- [ ] Construir `PatientSourcesPieChart` (gráfico circular/anillo).
- [ ] Añadir botón y menú desplegable para exportar a PDF o CSV conectándolo al endpoint de exportación.

## Testing
- [ ] Escribir tests para los queries de agregación (crear datos de prueba en la BD y validar que la suma matemática del endpoint sea exacta).
- [ ] Testear la caducidad y comportamiento de la caché en Redis.
- [ ] Validar UI (ej. el selector de fechas envía los timestamps correctos a la API).
- [ ] Validar contra los criterios de aceptación de `spec.md`.
- [ ] Mover la feature a "Hecho" en `../../constitution/roadmap.md`.
