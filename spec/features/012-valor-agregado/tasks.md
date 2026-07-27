# 012 · Valor Agregado e Innovación — Tareas

## Base de Datos
- [ ] Crear el modelo `LibraryItem`.
- [ ] Crear el modelo `CrisisConfig`.
- [ ] Añadir campos auxiliares a `User/Psychologist` (ej. `tags` o especialidades) para alimentar el algoritmo de matching.
- [ ] Generar migración Prisma y aplicarla.

## 1. Aplicación Móvil del Paciente (PWA)
- [ ] Instalar `vite-plugin-pwa`.
- [ ] Generar e incluir iconos para web y móviles (favicons, apple-touch-icons, maskables).
- [ ] Configurar el archivo de manifiesto (nombre, short_name, colores base).
- [ ] Configurar el Service Worker para pre-cachear los assets principales de UI y cachear la ruta `/api/v1/patients/me/appointments`.
- [ ] Crear y desplegar el componente `PwaInstallBanner` en el dashboard del paciente para sugerir instalación en iOS/Android.

## 2. Biblioteca Terapéutica
- [ ] Implementar el CRUD backend para `LibraryItem`.
- [ ] Configurar carga de documentos para subir materiales (guías, PDFs) al storage/Cloudinary.
- [ ] Construir la vista `LibraryPage` en el panel del psicólogo.
- [ ] Implementar la barra lateral de filtros (categorías de terapia, tipo de documento) y la barra de búsqueda en React.

## 3. Modo Crisis
- [ ] Implementar endpoint `GET /api/v1/patients/me/crisis-config` y un POST en el dashboard del psicólogo para configurarlo por paciente.
- [ ] Construir el modal en el portal del paciente y el botón de alerta persistente en el header.
- [ ] Implementar endpoint `POST /api/v1/crisis/alert` que envíe mensaje inmediato (SMS por Twilio de preferencia) al terapeuta.
- [ ] Validar explícitamente en UI el descargo de responsabilidad sobre servicios de emergencia médica/nacional.

## 4. Predicción de Ausencias
- [ ] Escribir script de cálculo de tasa histórica de inasistencia (SQL o agregación de Prisma).
- [ ] Integrar el script en un Job repetible (Bull) nocturno.
- [ ] Programar los Jobs secundarios (recordatorios de 8h y 2h) que disparan correos/SMS, condicionados por los resultados del script.
- [ ] Añadir un badge visual (ej. ícono de exclamación o color ámbar) a la vista de calendario del psicólogo para citas de "alto riesgo".

## 5. Matching Inteligente
- [ ] Implementar el motor de recomendación lógico en un servicio del backend (`MatchingService`) filtrando modalidad -> horario -> puntaje de keywords.
- [ ] Implementar endpoint público `/api/v1/public/match`.
- [ ] Crear la página frontend pública tipo asistente (wizard): "¿Qué te gustaría tratar?", "¿Cuándo tienes tiempo?", etc.
- [ ] Renderizar resultados sugeridos y conectar el flujo directamente a `BookingPublicPage` de la Feature 001.

## Testing Global
- [ ] Hacer auditoría Lighthouse de la PWA (asegurar checks verdes en Installability y Service Worker).
- [ ] Testear el algoritmo de matching con casos controlados (pasar tags exactos y asegurar que retorna el psicólogo correcto primero).
- [ ] Testear el envío crítico de alerta de crisis usando interceptores de red.
- [ ] Validar contra los criterios de aceptación de `spec.md`.
- [ ] Mover la feature a "Hecho" en `../../constitution/roadmap.md`.
