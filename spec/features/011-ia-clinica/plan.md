# 011 · Inteligencia Artificial Clínica — Plan

## Enfoque
Para el MVP se usará la API de OpenAI tanto para audio (Whisper) como para texto (GPT-4o). La clave es integrar la IA de forma *asistida*, no automática; el psicólogo siempre debe revisar, editar y confirmar lo que la IA genere. Se debe garantizar la privacidad pseudoanonimizando los datos antes de enviarlos a la API de terceros.

## Implementación

### Esquema de Base de Datos
- Modificar **`SessionNote`**: añadir `aiSummary` (texto corto estructurado) y `transcriptionDraft` (texto del volcado de voz crudo).
- Modificar **`Patient`**: añadir `aiInsights` (JSONB con resúmenes analíticos periódicos del progreso).
- **`AiUsageLog`**: `id`, `psychologistId`, `featureType` (TRANSCRIPTION|SUMMARY|DSM|INSIGHTS), `tokensUsed`, `createdAt` (útil para control de costos o facturación).

### Flujos y Endpoints de API

#### 1. Transcripción por Voz
El terapeuta habla desde el navegador. 
- API: `POST /api/v1/ai/transcribe`
- Proceso: Recibe blob de audio (multipart) en memoria. Se envía directamente a `https://api.openai.com/v1/audio/transcriptions` (modelo `whisper-1`). El audio **NO** se guarda en PsiAgenda (S3/Cloudinary), se descarta de la RAM inmediatamente tras obtener el texto.
- Retorna: Texto transcrito.

#### 2. Resumen Automático de Sesión
El terapeuta escribe o dicta una nota desestructurada y pide resumen.
- API: `POST /api/v1/ai/session-summary`
- Payload: `{ noteContent: "..." }`
- Proceso: Backend inyecta el contenido en un prompt de sistema rígido para GPT-4o (ej. "Eres un asistente clínico. Lee estas notas y devuélvelas en este JSON estricto: objetivo, intervencion, resultado, plan").
- Retorna: JSON estructurado.

#### 3. Apoyo Diagnóstico (DSM-5)
El terapeuta lista síntomas o pega texto de la anamnesis.
- API: `POST /api/v1/ai/dsm-suggestions`
- Payload: `{ symptoms: string }`
- Proceso: Backend usa GPT-4o con un system prompt que incluye reglas del DSM-5.
- Retorna: Arreglo de 1 a 3 sugerencias con su respectivo código DSM, nombre y justificación/razonamiento.

#### 4. Análisis de Progreso
- Un worker de Bull se ejecuta una vez por semana. Para cada paciente activo, toma sus puntajes de `Assessment` históricos, los envía a GPT y genera un breve resumen narrativo sobre tendencias de mejora/retroceso que guarda en `Patient.aiInsights`.
- API: `GET /api/v1/patients/:id/ai-insights`

### Componentes React
- **`VoiceRecorderWidget`**: Botón flotante o integrado en el editor de notas que use la MediaRecorder API. Muestra un indicador visual de grabación.
- **`SessionSummaryPanel`**: Botón "Generar resumen con IA" y un esqueleto (loading). Una vez cargado, los campos (Objetivo, etc.) son inputs editables.
- **`DsmSupportPanel`**: Caja de texto para síntomas, botón de sugerir y lista de tarjetas de sugerencias diagnósticas con un botón "Añadir a mis notas".
- **`AiInsightsCard`**: Tarjeta lateral en la HC del paciente que muestra el resumen narrativo.

## Decisiones
- **Uso de OpenAI API**: Elegido por encima de modelos locales (Llama 3) para ahorrar infraestructura, obtener máxima calidad en el DSM-5 out-of-the-box, y rapidez de implementación.
- **Privacidad y Retención de Datos**: A través del acuerdo Business (Zero Data Retention API) de OpenAI, los datos no se usan para entrenar. Aún así, en PsiAgenda implementaremos un sanitizador básico antes de enviar a GPT para remover nombres propios del paciente y reemplazarlos por "[Paciente]".
- **El audio nunca toca el disco del servidor**: Se procesa como buffer en RAM en Express para minimizar riesgos de fuga de voz.

## Riesgos
- **Riesgo Clínico y Responsabilidad**: La IA puede alucinar un diagnóstico incorrecto. Mitigación: Texto fijo en toda la UI de IA que diga: "Sugerencia generada por IA. El juicio y diagnóstico final es responsabilidad exclusiva del profesional tratante."
- **Costos de API**: GPT-4o y Whisper pueden ser costosos si los terapeutas abusan. Mitigación: `AiUsageLog` lleva un conteo estricto, permitiendo poner cuotas o límites a futuro.
