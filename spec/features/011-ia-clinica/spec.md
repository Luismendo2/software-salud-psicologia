# 011 · Inteligencia Artificial Clínica

| Campo       | Valor                          |
|-------------|--------------------------------|
| **ID**      | 011                            |
| **Nombre**  | Inteligencia Artificial Clínica |
| **Fase**    | 4                              |
| **Estado**  | propuesta                      |
| **Última actualización** | 2026-06-30        |

---

## Qué hace

La funcionalidad de Inteligencia Artificial Clínica integra capacidades de IA generativa directamente en el flujo de trabajo terapéutico de PsiAgenda, con cuatro sub-funcionalidades principales:

1. **Transcripción por voz:** El profesional activa el micrófono durante o después de una sesión, habla en lenguaje natural y el sistema convierte la grabación de audio en texto editable que puede guardarse como nota clínica o borrador de notas de sesión.

2. **Apoyo diagnóstico DSM-5:** El terapeuta puede seleccionar síntomas de una lista estructurada o escribir una descripción de libre texto. El sistema sugiere hasta tres categorías diagnósticas del DSM-5 con su código, nombre y justificación breve basada en los criterios clínicos. El profesional siempre toma la decisión final; las sugerencias nunca se registran como diagnósticos confirmados sin validación explícita.

3. **Resúmenes automáticos de sesión:** Una vez que el terapeuta ha escrito o dictado las notas de una sesión, puede solicitar al sistema que genere un resumen estructurado con cuatro secciones: objetivo de la sesión, intervención realizada, resultado observado y plan para la próxima sesión. El terapeuta revisa, edita y confirma el resumen antes de que se persista.

4. **Análisis de progreso:** Un proceso automatizado semanal analiza las puntuaciones de las evaluaciones aplicadas al paciente (PHQ-9, GAD-7, PCL-5, etc.) e identifica tendencias de mejora, estancamiento o retroceso. El análisis se almacena en el perfil del paciente y es visible para el psicólogo en el panel lateral del expediente clínico.

> [!IMPORTANT]
> **Aviso obligatorio de uso responsable:** Todas las salidas generadas por la IA son sugerencias de apoyo al profesional. Bajo ninguna circunstancia constituyen diagnósticos médicos o psicológicos definitivos. El profesional de salud mental es el único responsable de las decisiones clínicas. PsiAgenda muestra este aviso de forma permanente en cada interfaz de IA.

---

## Por qué

- Los psicólogos dedican entre 30 % y 40 % de su tiempo de consulta a tareas documentales (escribir notas, llenar formatos). La transcripción por voz recupera ese tiempo para el vínculo terapéutico.
- La complejidad del DSM-5 (más de 300 categorías) hace que incluso profesionales experimentados valoren una segunda opinión estructurada y objetiva basada en criterios.
- Los resúmenes estructurados de sesión mejoran la consistencia del expediente clínico y facilitan la supervisión clínica o la transición de pacientes entre profesionales.
- El análisis de progreso automatizado permite al terapeuta detectar señales de alerta tempranas en la evolución del paciente entre sesiones, sin tener que revisar manualmente todos los cuestionarios aplicados.
- La plataforma se vuelve diferenciadora frente a competidores que ofrecen solo agendamiento, posicionándose como un copiloto clínico.

---

## Criterios de aceptación

Los siguientes criterios son verificables de forma binaria (sí / no):

### Transcripción por voz

- [ ] **CA-011-01:** El componente `VoiceRecorderWidget` muestra un botón "Iniciar grabación"; al pulsarlo, el navegador solicita permiso de micrófono y, si se concede, inicia la captura de audio mediante la API `MediaRecorder`.
- [ ] **CA-011-02:** Durante la grabación se visualiza un indicador de nivel de audio (waveform o barra animada) que confirma que el sistema está capturando voz.
- [ ] **CA-011-03:** Al pulsar "Detener grabación", el audio capturado se envía automáticamente a `POST /api/v1/ai/transcribe` como `multipart/form-data`. El archivo de audio **no** se persiste en base de datos ni en almacenamiento externo de PsiAgenda; solo se transmite al proveedor de transcripción.
- [ ] **CA-011-04:** El texto transcrito aparece en un campo editable en menos de 15 segundos para grabaciones de hasta 2 minutos de duración bajo condiciones de red normales (latencia < 200 ms al proveedor IA).
- [ ] **CA-011-05:** El terapeuta puede editar el texto transcrito antes de guardarlo. Al guardar, el contenido se almacena en `SessionNote.transcriptionDraft` (estado borrador) o se promueve a `SessionNote.content` si el terapeuta lo confirma como nota final.
- [ ] **CA-011-06:** Si el servicio de transcripción no está disponible o devuelve error, el sistema muestra un mensaje de error claro y permite al terapeuta escribir la nota manualmente sin perder su flujo de trabajo.

### Apoyo diagnóstico DSM-5

- [ ] **CA-011-07:** El panel `DsmSupportPanel` permite al terapeuta ingresar síntomas de dos formas: (a) seleccionando ítems de un listado estructurado predefinido, o (b) escribiendo texto libre. Ambas modalidades pueden combinarse.
- [ ] **CA-011-08:** Al enviar los síntomas, el sistema llama a `POST /api/v1/ai/dsm-suggestions` y muestra un indicador de carga. En menos de 20 segundos se muestran hasta tres categorías diagnósticas DSM-5 sugeridas, cada una con: código DSM-5, nombre del trastorno, y justificación de máximo 120 palabras.
- [ ] **CA-011-09:** Cada sugerencia incluye un botón "Agregar a nota clínica". Al pulsarlo, el texto se inserta en la nota clínica **con la etiqueta explícita "Sugerencia de apoyo diagnóstico IA (no confirmado)"** y no como diagnóstico definitivo.
- [ ] **CA-011-10:** El panel muestra en todo momento el siguiente aviso legal: *"Las sugerencias generadas por IA son orientativas. El profesional es el único responsable del diagnóstico clínico."* El aviso no puede ocultarse ni minimizarse.
- [ ] **CA-011-11:** Los datos clínicos enviados a la API de IA están pseudonimizados: se omiten nombre completo, número de documento y cualquier identificador personal directo del paciente antes de realizar la llamada al proveedor externo.

### Resúmenes automáticos de sesión

- [ ] **CA-011-12:** En la vista de `SessionNote`, el botón "Generar resumen IA" aparece únicamente cuando el campo de contenido tiene al menos 50 caracteres. Mientras el resumen se está generando, el botón muestra estado de carga y se deshabilita para evitar solicitudes duplicadas.
- [ ] **CA-011-13:** El resumen generado contiene exactamente cuatro secciones: `objetivo`, `intervencion`, `resultado` y `planSiguienteSesion`. Cada sección es editable por el terapeuta antes de confirmar.
- [ ] **CA-011-14:** Al confirmar el resumen, el contenido se persiste en `SessionNote.aiSummary`. El resumen confirmado queda visible en la línea de tiempo del expediente clínico del paciente.
- [ ] **CA-011-15:** Si el terapeuta cierra el panel sin confirmar, el resumen generado se descarta y no se persiste. El sistema solicita confirmación antes de descartar.

### Análisis de progreso

- [ ] **CA-011-16:** Un Bull job semanal (configurado por cron) analiza las evaluaciones de cada paciente activo que tenga al menos dos evaluaciones del mismo tipo en los últimos 90 días y genera un texto narrativo de progreso.
- [ ] **CA-011-17:** El insight generado se almacena en `Patient.aiInsights` (jsonb) con metadatos: fecha de generación, tipos de evaluaciones analizadas y número de evaluaciones consideradas.
- [ ] **CA-011-18:** El componente `AiInsightsCard` en el panel lateral del expediente clínico muestra el insight más reciente con su fecha. Si no existe análisis disponible (paciente nuevo o sin evaluaciones suficientes), muestra un mensaje explicativo en lugar de un espacio vacío.

### Registro de uso y gobernanza

- [ ] **CA-011-19:** Cada llamada a la API de IA (transcripción, sugerencias DSM-5, resumen, análisis) queda registrada en la tabla `AiUsageLog` con: `psychologistId`, `featureType`, `tokensUsed` y `createdAt`. Esta información es visible para el ADMIN en un panel de métricas de uso.
- [ ] **CA-011-20:** Todas las funcionalidades de IA son opcionales y están desactivadas por defecto. Pueden habilitarse por organización desde `Organization.settings`. Si una funcionalidad de IA está desactivada, la plataforma continúa operando normalmente en todos sus flujos.

---

## Fuera de alcance

Las siguientes funcionalidades **no** forman parte de esta feature y no deben implementarse en Fase 4:

- **Diagnóstico autónomo:** El sistema nunca generará un diagnóstico confirmado de forma autónoma. Toda salida de IA es siempre una sugerencia que requiere validación profesional.
- **IA conversacional con el paciente:** El chatbot o asistente IA no interactuará directamente con pacientes. Las funcionalidades son exclusivamente para uso del profesional de salud mental.
- **Almacenamiento de audio:** Los archivos de voz grabados por el terapeuta no se almacenan en los servidores de PsiAgenda ni en servicios de almacenamiento propios. Solo el texto transcrito se persiste.
- **Modelos IA propios (on-premise):** No se entrenará ni desplegará un modelo de lenguaje propio. Se usa exclusivamente la API de OpenAI.
- **Generación de informes psicológicos completos:** La IA no produce informes forenses, peritajes ni documentos con valor legal.
- **Integración con sistemas de salud externos (HIS/EHR):** El análisis de IA no consume datos de fuentes externas al sistema PsiAgenda.
- **Alertas automáticas de riesgo suicida:** El análisis de progreso no está diseñado como sistema de detección de crisis; esa funcionalidad, si se requiere, corresponde a una feature dedicada con protocolos específicos.
- **Soporte multiidioma de los modelos IA en Fase 4:** Los prompts del sistema y la interfaz están optimizados para español. La compatibilidad con otros idiomas queda para fases futuras.
