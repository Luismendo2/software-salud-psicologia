# 003 · Historia Clínica Psicológica — Tareas

## Base de datos
- [ ] Crear modelos `ClinicalRecord`, `SessionNote`, `ClinicalTemplate`, `Attachment`.
- [ ] Establecer relaciones y restricciones (un `Patient` tiene un `ClinicalRecord`).
- [ ] Generar migración Prisma y aplicarla.

## Backend - Notas Clínicas
- [ ] Implementar endpoint para obtener la HC (`GET /api/v1/clinical-records/:patientId`).
- [ ] Implementar CRUD para `SessionNote` (crear, actualizar borrador).
- [ ] Implementar endpoint de firma (`POST .../sign`) que bloquee ediciones futuras.
- [ ] Implementar validación de acceso: verificar que `psychologistId` coincida o el rol sea autorizado.

## Backend - Archivos y Plantillas
- [ ] Configurar `multer` y el SDK de Cloudinary/S3 en el backend.
- [ ] Implementar endpoint de subida de adjuntos (`POST .../attachments`).
- [ ] Implementar endpoint de eliminación de adjuntos.
- [ ] Implementar endpoints para gestionar `ClinicalTemplate` (solo CRUD básico JSONB).
- [ ] Implementar endpoint de actualización del Genograma (`PUT .../genogram`).

## Frontend - UI y Editor
- [x] Crear `ClinicalRecordPage` con pestañas de navegación (Notas, Archivos, Genograma).
- [x] Instalar y configurar librería de Rich Text (ej. Tiptap o ReactQuill) para `SessionNoteEditor`. *(Usado HTML contentEditable por ahora)*
- [x] Implementar autoguardado (debounce) en el editor de notas.
- [x] Crear `SessionNoteCard` para visualizar notas en modo solo lectura.
- [x] Crear modal de firma (usando `react-signature-canvas`) para cerrar la nota.

## Frontend - Archivos y Genograma
- [x] Implementar `AttachmentUploader` con interfaz drag & drop y barra de progreso.
- [x] Mostrar galería/lista de archivos adjuntos con botón de descarga.
- [x] Instalar y configurar `React Flow` (u otra librería) para el `GenogramaEditor`. *(Implementado con SVG nativo interactivo)*
- [x] Implementar nodos custom para el genograma (hombre=cuadrado, mujer=círculo, etc.).
- [x] Implementar lógica para conectar nodos (relaciones).
- [x] Conectar el autoguardado del genograma con la API.

## Seguridad y Testing
- [ ] Verificar que no se puedan modificar notas firmadas desde la API (test de integración).
- [ ] Verificar que un psicólogo A no pueda leer la HC de un paciente del psicólogo B.
- [ ] Validar sanitización del HTML del editor de texto (evitar XSS) antes de guardarlo.
- [ ] Probar subida de archivos (límite de tamaño, tipos de archivo permitidos).
- [ ] Validar contra los criterios de aceptación de `spec.md`.
- [ ] Mover la feature a "Hecho" en `../../constitution/roadmap.md`.
