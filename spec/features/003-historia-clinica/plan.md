# 003 · Historia Clínica Psicológica — Plan

## Enfoque

Se utilizará una base de datos relacional para la estructura principal y JSONB para campos dinámicos (plantillas y genograma). El editor de notas usará una librería ligera de texto enriquecido (ej. TipTap o Quill). El genograma se construirá usando un SVG interactivo en React o una librería de diagramación ligera. 

## Implementación

### Esquema de Base de Datos

- **`ClinicalTemplate`**: `id`, `organizationId`, `name`, `fields` (JSONB definiendo los campos del form), `isDefault`
- **`ClinicalRecord`**: `id`, `patientId`, `psychologistId`, `templateType`, `genogramData` (JSONB con nodos y aristas), `createdAt`
- **`SessionNote`**: `id`, `clinicalRecordId`, `appointmentId`, `content` (texto enriquecido HTML/Markdown), `aiSummary`, `psychologistSignedAt`, `patientSignedAt`, `attachments` (JSONB)
- **`Attachment`**: `id`, `clinicalRecordId`, `sessionNoteId` (nullable), `url`, `fileName`, `fileType`, `uploadedAt`

### Endpoints de API

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/api/v1/clinical-records/:patientId` | Obtener HC del paciente | PSYCHOLOGIST, SUPERVISOR |
| POST | `/api/v1/clinical-records/:patientId/notes` | Crear nota de sesión | PSYCHOLOGIST |
| PUT | `/api/v1/clinical-records/:patientId/notes/:noteId` | Actualizar borrador de nota | PSYCHOLOGIST |
| POST | `/api/v1/clinical-records/:patientId/notes/:noteId/sign` | Firmar y cerrar nota | PSYCHOLOGIST |
| POST | `/api/v1/clinical-records/:patientId/attachments` | Subir archivo adjunto | PSYCHOLOGIST |
| DELETE| `/api/v1/clinical-records/:patientId/attachments/:attachmentId`| Eliminar adjunto | PSYCHOLOGIST |
| GET | `/api/v1/clinical-templates` | Listar plantillas | PSYCHOLOGIST |
| PUT | `/api/v1/clinical-records/:patientId/genogram` | Actualizar estado del genograma | PSYCHOLOGIST |

### Componentes React

- **`ClinicalRecordPage`**: Contenedor principal con pestañas (Notas, Adjuntos, Genograma, Evaluaciones).
- **`SessionNoteEditor`**: Componente de texto enriquecido (ej. Tiptap) con autoguardado.
- **`SessionNoteCard`**: Vista de solo lectura para notas firmadas.
- **`AttachmentUploader`**: Drag and drop de archivos, muestra progreso, sube vía FormData.
- **`SignaturePad`**: Canvas para capturar firma manuscrita.
- **`GenogramEditor`**: Componente visual (basado en SVG o React Flow) para crear el familiograma.
- **`TemplateSelector`**: Dropdown para cambiar el formato de la HC o la nota.

## Decisiones

- **Genograma en JSONB**: El grafo del genograma (nodos como personas, aristas como vínculos) se almacenará como un único objeto JSONB en la BD. Es más eficiente que crear tablas separadas para "Nodos" y "Vínculos" dado que siempre se lee y escribe como un todo.
- **Notas Inmutables tras firma**: Una vez que `psychologistSignedAt` tiene fecha, los endpoints de actualización rechazarán cambios. Para agregar información, el psicólogo debe crear un "Anexo" (otra nota vinculada a la misma cita o nota original).
- **Carga de archivos (Multipart vs Presigned URLs)**: Por simplicidad en MVP, el frontend enviará el archivo al backend (Express `multer`), y el backend lo subirá a Cloudinary/S3. Retornará la URL generada.

## Riesgos

- **Complejidad del Genograma**: Hacer un editor de grafos desde cero es complejo. Mitigación: Usar una librería como `React Flow` y customizar los nodos con la simbología estándar (cuadrados, círculos, líneas de zigzag).
- **Rendimiento con notas grandes**: Paginación necesaria en la vista principal de la HC para no cargar cientos de notas de golpe.
