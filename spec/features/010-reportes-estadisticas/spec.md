# 010 · Reportes y Estadísticas

| Campo       | Valor                                  |
|-------------|----------------------------------------|
| **ID**      | 010                                    |
| **Nombre**  | Reportes y Estadísticas                |
| **Fase**    | 3                                      |
| **Estado**  | propuesta                              |
| **Roles**   | PSYCHOLOGIST, ADMIN, ASSISTANT         |
| **Última revisión** | 2026-06-30                     |

---

## 1. Qué hace

La funcionalidad de Reportes y Estadísticas ofrece a los psicólogos y administradores un panel de control (dashboard) con métricas clave sobre la operación clínica y el desempeño profesional, todo dentro del mismo período de tiempo seleccionable por el usuario.

La vista se divide en cuatro grandes bloques:

1. **Panel de control (KPIs):** Indicadores de alto nivel como número de citas atendidas, cancelaciones, inasistencias, ingresos y pacientes activos en el período.
2. **Progreso clínico:** Gráficos de evolución promedio de puntuaciones en cuestionarios estandarizados (PHQ-9, GAD-7, PCL-5, etc.) para los pacientes del psicólogo, sin exponer datos individuales en vistas agregadas.
3. **Desempeño profesional:** Horas trabajadas, tasa de retención de pacientes y cumplimiento de metas de atención.
4. **Fuentes de pacientes:** Distribución porcentual de cómo los pacientes llegaron a la consulta (redes sociales, referidos, búsqueda directa, sitio web, otro).

Existen dos vistas diferenciadas:
- **Vista individual (PSYCHOLOGIST):** Datos filtrados exclusivamente por el psicólogo autenticado.
- **Vista consolidada (ADMIN):** Datos de todos los psicólogos de la organización con posibilidad de filtrar por psicólogo específico.

Todos los reportes son exportables en formato PDF y CSV.

---

## 2. Por qué

Los psicólogos y clínicas privadas carecen frecuentemente de visibilidad sobre métricas clave de su práctica. Sin datos consolidados, es difícil tomar decisiones informadas sobre capacidad de agenda, retención de pacientes, efectividad de estrategias de captación y cumplimiento de objetivos terapéuticos.

PsiAgenda concentra ya toda la información operativa (citas, pagos, evaluaciones, tareas). Aprovechar esos datos para generar reportes automáticos agrega valor diferencial sin requerir que el profesional ingrese datos adicionales.

Esta funcionalidad responde a:
- La necesidad de los psicólogos de justificar su práctica ante supervisores, aseguradoras o acreditadoras.
- La necesidad del administrador de clínica de evaluar el rendimiento del equipo.
- La regulación colombiana (Resolución 2654/2019) que recomienda el seguimiento de indicadores de calidad en la atención en salud mental.

---

## 3. Criterios de aceptación

> [!IMPORTANT]
> Todos los criterios son verificables con sí/no. La privacidad de datos es un requisito no negociable: ninguna vista agregada expone PII individual del paciente.

| # | Criterio | Rol verificador |
|---|----------|-----------------|
| AC-01 | El panel de control muestra el total de citas agendadas, completadas, canceladas e inasistencias para el rango de fechas seleccionado. | PSYCHOLOGIST, ADMIN |
| AC-02 | El panel de control muestra los ingresos totales (suma de pagos con status PAID) para el período seleccionado. | PSYCHOLOGIST, ADMIN |
| AC-03 | El panel de control muestra el número de pacientes activos (con al menos una cita CONFIRMED o COMPLETED en el período). | PSYCHOLOGIST, ADMIN |
| AC-04 | La gráfica de tendencia de citas (AreaChart) muestra datos agrupados por semana o por mes, según la duración del rango seleccionado. | PSYCHOLOGIST, ADMIN |
| AC-05 | La gráfica de progreso clínico muestra el promedio de puntuaciones de PHQ-9 y GAD-7 a lo largo del tiempo; no expone el nombre, ID ni ningún dato identificable de ningún paciente individual. | PSYCHOLOGIST, ADMIN |
| AC-06 | La sección de desempeño profesional muestra las horas trabajadas (suma de duración de citas COMPLETED), la tasa de retención de pacientes y el porcentaje de cumplimiento de meta de atención configurada. | PSYCHOLOGIST, ADMIN |
| AC-07 | La tasa de retención se calcula como el porcentaje de pacientes que tuvieron al menos una cita en el período actual respecto al período anterior equivalente. | PSYCHOLOGIST, ADMIN |
| AC-08 | El gráfico de fuentes de pacientes (PieChart) muestra la distribución porcentual de las fuentes de captación registradas; no muestra nombres de pacientes. | PSYCHOLOGIST, ADMIN |
| AC-09 | El selector de rango de fechas ofrece presets: «Este mes», «Últimos 3 meses», «Últimos 12 meses» y «Personalizado» (con date-picker de inicio y fin). | PSYCHOLOGIST, ADMIN |
| AC-10 | El botón «Exportar PDF» genera un archivo descargable con todos los KPIs y gráficas del reporte actual en formato PDF, renderizado en el servidor. | PSYCHOLOGIST, ADMIN |
| AC-11 | El botón «Exportar CSV» genera un archivo descargable con los datos tabulares del reporte seleccionado (dashboard, progreso clínico o fuentes). | PSYCHOLOGIST, ADMIN |
| AC-12 | Un ADMIN puede seleccionar cualquier psicólogo de la organización en un desplegable y ver sus datos individuales; o puede seleccionar «Todos» para la vista consolidada. | ADMIN |
| AC-13 | Un PSYCHOLOGIST solo puede ver sus propios datos; el endpoint rechaza con 403 cualquier intento de consultar datos de otro psicólogo. | PSYCHOLOGIST |
| AC-14 | Los resultados de cada endpoint de reporte son cacheados en Redis por 30 minutos; una segunda petición idéntica dentro de ese ventana devuelve el resultado en caché sin consultar la base de datos. | PSYCHOLOGIST, ADMIN |
| AC-15 | La página de reportes muestra un skeleton loader mientras los datos se están cargando y un mensaje de error descriptivo si la petición falla. | PSYCHOLOGIST, ADMIN |
| AC-16 | Si no existen datos para el rango de fechas seleccionado, la UI muestra un estado vacío explícito («No hay datos para el período seleccionado») en lugar de gráficas en cero. | PSYCHOLOGIST, ADMIN |
| AC-17 | Todos los endpoints de reportes están protegidos por autenticación JWT y autorización de rol (PSYCHOLOGIST o ADMIN); una petición sin token válido retorna 401. | PSYCHOLOGIST, ADMIN |

---

## 4. Fuera de alcance

- **Exportación a Excel (.xlsx):** Solo se soportan PDF y CSV en esta fase.
- **Alertas automáticas por umbral:** No se enviarán notificaciones si una métrica cae por debajo de un valor configurado (queda para Fase 4).
- **Base de datos analítica separada (OLAP/data warehouse):** Las métricas se calculan directamente sobre MySQL con consultas optimizadas.
- **Reportes por paciente individual exportables desde esta sección:** Los informes clínicos individuales se exportan desde la historia clínica (Feature 006).
- **Comparaciones entre clínicas u organizaciones:** No se soporta multi-tenant cross-organization en reportes.
- **Segmentación demográfica:** No se ofrecen filtros por edad, género u otros datos demográficos del paciente en esta fase.
- **Panel embebido en aplicación móvil:** Los reportes son exclusivos de la interfaz web en esta fase.
- **Machine learning / predicciones:** No se incluye ningún modelo predictivo; solo estadísticas descriptivas.
