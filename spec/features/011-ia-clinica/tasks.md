# 011 · Inteligencia Artificial Clínica — Tareas

## Configuración y Seguridad
- [ ] Obtener API Key de OpenAI y configurarla en variables de entorno.
- [ ] Modificar BD: añadir campos en `SessionNote`, `Patient` y tabla `AiUsageLog`. Generar migración.
- [ ] Crear módulo utilitario `AiService` en el backend para encapsular el SDK oficial de OpenAI y manejar reintentos.
- [ ] Crear función sanitizadora simple que reemplace el nombre del paciente por "[Paciente]" antes de armar prompts.

## Backend - Funciones Core
- [ ] Implementar endpoint `POST /api/v1/ai/transcribe`. Configurar `multer` para subir a RAM y pasar el buffer a Whisper API.
- [ ] Implementar endpoint `POST /api/v1/ai/session-summary`. Escribir e iterar el system prompt para que devuelva JSON rígido consistente.
- [ ] Implementar endpoint `POST /api/v1/ai/dsm-suggestions`. Escribir el system prompt basado en las reglas del manual diagnóstico.
- [ ] En todos los endpoints, añadir middleware que inserte un registro en `AiUsageLog` evaluando el uso estimado de tokens de la petición.

## Backend - Análisis en Segundo Plano
- [ ] Escribir cron job (Bull) que se ejecute semanalmente para generar el `aiInsights` en la tabla Patient, enviando a GPT los datos de sus últimas 5 evaluaciones.
- [ ] Crear endpoint GET para que el frontend consuma `aiInsights`.

## Frontend - UI del Editor de Notas
- [ ] Implementar el componente `VoiceRecorderWidget` usando `navigator.mediaDevices.getUserMedia` (audio only) y `MediaRecorder`.
- [ ] Integrar un visualizador básico (ondas o puntos saltando) para feedback de que está escuchando.
- [ ] Conectar la parada de grabación al envío del blob al backend y colocar el texto resultante en el editor.
- [ ] Añadir botón mágico ✨ "Generar Resumen" al lado del editor; implementar el componente `SessionSummaryPanel` con sus campos editables antes de aceptar el volcado final en la nota.

## Frontend - UI de Diagnóstico y Sidebar
- [ ] Construir `DsmSupportPanel`. Al obtener sugerencias, cada una debe tener un botón que pegue el texto en el editor de la HC.
- [ ] Mostrar siempre el disclaimer legal/clínico en los paneles de IA en rojo o advertencia clara.
- [ ] Crear `AiInsightsCard` y colocarlo en el layout lateral de la página de historia clínica del paciente.

## Testing y Calidad
- [ ] Escribir mocks para el módulo de OpenAI en los tests unitarios.
- [ ] Testear que el endpoint de transcripción rechaza archivos muy pesados (Límite ej. 25MB).
- [ ] Evaluar cualitativamente los prompts (Human-in-the-loop review) introduciendo una nota compleja real anonimizada y asegurando que el JSON retornado no alucine campos o divague.
- [ ] Validar contra los criterios de aceptación de `spec.md`.
- [ ] Mover la feature a "Hecho" en `../../constitution/roadmap.md`.
