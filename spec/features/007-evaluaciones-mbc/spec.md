# 007 · Evaluaciones y Medición del Progreso (MBC)

| Campo       | Valor                                      |
|-------------|--------------------------------------------|
| **ID**      | 007                                        |
| **Nombre**  | Evaluaciones y Medición del Progreso (MBC) |
| **Fase**    | 2                                          |
| **Estado**  | propuesta                                  |
| **Fecha**   | 2026-06-30                                 |
| **Autor**   | Arquitecto SDD — PsiAgenda                 |

---

## 1. Qué hace

Esta funcionalidad incorpora un módulo de **evaluaciones psicológicas estandarizadas** y **medición basada en resultados (MBC — Measurement-Based Care)** dentro de la plataforma PsiAgenda.

El sistema permite:

1. **Enviar cuestionarios estandarizados** al paciente desde el portal del psicólogo: PHQ-9 (depresión), GAD-7 (ansiedad generalizada), PCL-5 (estrés postraumático) y escalas personalizadas futuras.
2. **Recibir y puntuar automáticamente** las respuestas del paciente, sin necesidad de cálculo manual por parte del terapeuta.
3. **Almacenar los resultados en la historia clínica** del paciente de forma automática y auditable.
4. **Visualizar la evolución longitudinal** del paciente mediante gráficas de series de tiempo (una línea por instrumento), para evaluar la efectividad del tratamiento a lo largo de las sesiones.
5. **Emitir alertas clínicas inmediatas** cuando una respuesta indica riesgo alto (por ejemplo, ideación suicida detectada en el ítem 9 del PHQ-9), notificando al psicólogo tratante por correo electrónico y notificación en la plataforma.
6. **Permitir al paciente** completar los cuestionarios pendientes desde su propio portal, con una interfaz de preguntas generadas dinámicamente.

### Ejemplo de uso MBC

Un paciente inicia terapia con un puntaje PHQ-9 de **16** (depresión moderadamente severa). Tras cuatro sesiones, el psicólogo envía una nueva evaluación y el puntaje baja a **8** (depresión leve). La gráfica de progreso muestra claramente esta mejoría, con la fecha de cada aplicación en el eje X y el puntaje en el eje Y.

---

## 2. Por qué

La medición basada en resultados (MBC) es una práctica clínica respaldada por evidencia que mejora significativamente los resultados del tratamiento al hacer visible el progreso del paciente tanto para el terapeuta como para el propio sistema. Implementar este módulo en PsiAgenda:

- **Eleva el estándar clínico** de la plataforma, diferenciándola de agendas que solo gestionan citas.
- **Reduce el riesgo clínico** mediante alertas automáticas ante indicadores de crisis, cumpliendo con protocolos de seguridad del paciente.
- **Agiliza la toma de decisiones** del psicólogo al tener datos objetivos en pantalla durante y entre sesiones.
- **Facilita la acreditación y auditoría** de la práctica al conservar un registro estructurado y trazable de todas las evaluaciones.
- **Aumenta el compromiso del paciente** al darle visibilidad de su propio progreso desde el portal.

---

## 3. Criterios de aceptación

> Los criterios se expresan como condiciones verificables de sí/no. Todos deben cumplirse para dar por aceptada la funcionalidad.

### 3.1 Gestión de plantillas

- [ ] **CA-01** — El sistema incluye, desde la instalación inicial (seed), las plantillas completas de PHQ-9, GAD-7 y PCL-5 con sus preguntas, opciones de respuesta y reglas de puntuación correctas.
- [ ] **CA-02** — Un administrador puede agregar plantillas de evaluación personalizadas (`CUSTOM`) mediante la API sin modificar el código fuente.
- [ ] **CA-03** — El endpoint `GET /api/v1/assessment-templates` devuelve la lista de plantillas activas con sus preguntas y reglas de puntuación; el acceso está restringido a roles `PSYCHOLOGIST`, `ADMIN` y `ASSISTANT`.

### 3.2 Envío de evaluaciones

- [ ] **CA-04** — Un psicólogo puede enviar un cuestionario a un paciente asignado desde el panel de historia clínica, seleccionando la plantilla deseada. La evaluación queda en estado `SENT` y el paciente recibe una notificación.
- [ ] **CA-05** — El paciente ve la evaluación pendiente en su portal (`MyAssessmentsPage`) dentro de los 60 segundos siguientes al envío.
- [ ] **CA-06** — No es posible enviar la misma plantilla a un paciente si ya tiene una evaluación de ese tipo en estado `SENT` (pendiente de completar).

### 3.3 Compleción por parte del paciente

- [ ] **CA-07** — El paciente puede completar una evaluación pendiente desde su portal sin necesidad de contactar al psicólogo. El formulario renderiza dinámicamente las preguntas desde la plantilla JSON almacenada en base de datos.
- [ ] **CA-08** — El formulario no permite envío parcial: todas las preguntas son obligatorias. El botón de envío está deshabilitado hasta que todas estén respondidas.
- [ ] **CA-09** — Al enviar, el backend calcula el puntaje total **en servidor** (no en cliente) y determina el nivel de severidad según las reglas de la plantilla.

### 3.4 Puntuación y severidad

- [ ] **CA-10** — El sistema aplica correctamente las siguientes reglas de puntuación:

  **PHQ-9** (Cuestionario de Salud del Paciente — 9 ítems, rango 0-27, cada ítem de 0 a 3):

  | Puntaje | Severidad              |
  |---------|------------------------|
  | 0–4     | Mínima (Minimal)       |
  | 5–9     | Leve (Mild)            |
  | 10–14   | Moderada (Moderate)    |
  | 15–19   | Moderadamente severa   |
  | 20–27   | Severa (Severe)        |

  **GAD-7** (Trastorno de Ansiedad Generalizada — 7 ítems, rango 0-21, cada ítem de 0 a 3):

  | Puntaje | Severidad           |
  |---------|---------------------|
  | 0–4     | Mínima (Minimal)    |
  | 5–9     | Leve (Mild)         |
  | 10–14   | Moderada (Moderate) |
  | 15–21   | Severa (Severe)     |

  **PCL-5** (Lista de Chequeo PTSD — 20 ítems, rango 0-80, cada ítem de 0 a 4):

  | Puntaje | Interpretación                            |
  |---------|-------------------------------------------|
  | < 33    | Por debajo del umbral clínico             |
  | 33–49   | Probable PTSD leve-moderado               |
  | ≥ 50    | Probable PTSD moderado-severo             |

- [ ] **CA-11** — Los resultados del cuestionario completado se guardan automáticamente en la historia clínica del paciente, vinculados al campo `clinicalRecordId`, sin ninguna acción adicional por parte del psicólogo.

### 3.5 Alertas clínicas

- [ ] **CA-12** — Si el ítem 9 del PHQ-9 tiene un valor ≥ 1 (cualquier nivel de ideación suicida), el sistema establece `riskFlag = true` y **dentro de los 2 minutos** envía:
  - Un correo electrónico al psicólogo tratante con el nombre del paciente, el puntaje y el ítem de riesgo.
  - Una notificación en la plataforma visible en el panel de alertas del psicólogo.
- [ ] **CA-13** — La alerta clínica genera una entrada en `AuditLog` con `action = 'CLINICAL_ALERT_TRIGGERED'`, el `resourceId` de la evaluación y el `userId` del psicólogo notificado.
- [ ] **CA-14** — El psicólogo puede marcar una alerta como "revisada" (`acknowledged`), lo que la mueve fuera del panel de alertas activas, pero el registro permanece en `AuditLog`.

### 3.6 Visualización y MBC

- [ ] **CA-15** — El endpoint `GET /api/v1/patients/:id/progress-chart` devuelve, para cada instrumento aplicado al paciente, una serie de tiempo ordenada cronológicamente con `{ date, score, severity }`, apta para renderizar con Recharts.
- [ ] **CA-16** — El componente `ProgressChartPage` muestra un gráfico de líneas (`LineChart`) con una línea de color distinto por instrumento (PHQ-9, GAD-7, PCL-5), con la fecha en el eje X y el puntaje en el eje Y. El gráfico es interactivo (tooltip al pasar el cursor).
- [ ] **CA-17** — Al hacer clic en un punto del gráfico, se muestra el `AssessmentResultCard` con el detalle de esa evaluación (respuestas individuales, puntaje, severidad, y alerta de riesgo si aplica).
- [ ] **CA-18** — El paciente **no puede** ver los resultados de sus evaluaciones desde el portal; solo puede ver si tiene cuestionarios pendientes. Los resultados son exclusivos de la vista del terapeuta y del sistema.

### 3.7 Seguridad y privacidad

- [ ] **CA-19** — Un psicólogo solo puede ver evaluaciones de pacientes asignados a su organización. Un paciente solo puede ver y responder sus propias evaluaciones. El backend valida la pertenencia antes de cada operación.
- [ ] **CA-20** — Todas las respuestas del paciente se almacenan en base de datos con cifrado en reposo (herencia del cifrado de columna `responses jsonb` o cifrado a nivel de disco de PostgreSQL). Las respuestas no se exponen en logs del servidor.

---

## 4. Fuera de alcance

Las siguientes funcionalidades **no forman parte** de este feature y se consideran trabajo futuro:

- **Evaluaciones en tiempo real durante la sesión**: en esta fase el paciente completa el cuestionario antes o después de la sesión, no en tiempo real sincronizado con el psicólogo.
- **Interpretación automática con IA**: el sistema calcula puntajes y severidad por reglas fijas; no utiliza modelos de lenguaje para interpretar resultados clínicos.
- **Compartir resultados con el paciente**: en esta fase el paciente no tiene acceso a ver sus propios resultados ni gráficas.
- **Exportación de gráficas a PDF**: la visualización es solo en pantalla. La exportación de informes es parte del feature 010.
- **Evaluaciones grupales o familiares**: el módulo solo soporta evaluaciones individuales (un paciente por evaluación).
- **Integración con escalas externas de terceros** (p. ej., PsychCentral, DAST-10, AUDIT): solo se incluyen PHQ-9, GAD-7 y PCL-5 en esta fase.
- **Recordatorios automáticos al paciente** por no completar una evaluación enviada: las notificaciones de recordatorio son parte del feature 012 (notificaciones y recordatorios).
- **Validación normativa o baremación por población colombiana**: los rangos de severidad se aplican según las guías originales de los instrumentos.
