# 003 · Historia Clínica Psicológica

**Estado:** propuesta

## Qué hace

Centraliza toda la información clínica del paciente. Permite al psicólogo registrar notas de sesión usando plantillas personalizadas según su enfoque terapéutico, subir archivos adjuntos, firmar documentos y visualizar la estructura familiar mediante un genograma interactivo.

## Por qué

Es el registro legal y clínico fundamental. Reemplaza el papel y los documentos de Word dispersos. Garantiza que la información esté estructurada, segura y sea fácil de consultar para evaluar la evolución del paciente.

## Criterios de aceptación

- [ ] El psicólogo puede crear y ver la historia clínica de los pacientes asignados a él.
- [ ] El psicólogo puede redactar una nota clínica vinculada a una sesión/cita específica.
- [ ] Las notas clínicas permiten texto enriquecido (negritas, listas, etc.).
- [ ] El psicólogo puede elegir una plantilla predefinida (ej. cognitivo-conductual, sistémico) al crear una nota o la HC.
- [ ] El psicólogo puede adjuntar archivos (PDF, imágenes) a la historia clínica.
- [ ] Los archivos adjuntos se almacenan de forma segura (ej. S3/Cloudinary) y la BD guarda el enlace.
- [ ] El psicólogo puede firmar electrónicamente una nota clínica (mediante un trazo en canvas o credencial digital).
- [ ] Una nota clínica firmada no puede ser modificada; cualquier adición debe hacerse como un anexo (append-only) o nota nueva.
- [ ] El sistema incluye un Genograma / Familiograma visual.
- [ ] El psicólogo puede arrastrar nodos (personas) y trazar líneas (relaciones) en el genograma, y guardarlo.
- [ ] Un usuario con rol de `SUPERVISOR` puede acceder a la historia clínica de un paciente si el psicólogo tratante lo ha autorizado/compartido.
- [ ] Todo acceso de lectura o escritura a la historia clínica genera un registro en el log de auditoría (AuditLog).
- [ ] Un psicólogo no puede ver la historia clínica de un paciente de otro terapeuta en la misma clínica (aislamiento de datos).
- [ ] El paciente puede ver desde su portal un resumen (muy limitado) de su HC si se configura así, pero NO ve las notas de psicoterapia por defecto.
- [ ] Las modificaciones no firmadas se autoguardan como borrador.

## Fuera de alcance

- Compartir historia clínica completa externamente con otras clínicas mediante protocolos HL7 (se asume uso interno).
- Control de versiones complejo de notas (se usa el modelo simple: borrador -> firmada/cerrada).
