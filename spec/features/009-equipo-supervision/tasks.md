# 009 · Trabajo en Equipo y Supervisión — Tareas

## Base de datos
- [ ] Crear modelos `Organization`, `OrganizationMember`, `OrganizationInvite`.
- [ ] Crear modelo `SupervisionCase` con relaciones al note, supervisor y supervisado.
- [ ] Generar migración Prisma y aplicarla.

## Backend - Organizaciones y Roles
- [ ] Implementar endpoint `POST /api/v1/organizations` (permite al psicólogo registrar una clínica y convertirse en OWNER).
- [ ] Modificar JWT auth para incluir un arreglo de `organizationIds` y el rol a nivel de organización.
- [ ] Modificar todos los queries globales (citas, pacientes) para verificar `patient.organizationId = req.user.organizationId` y los roles.

## Backend - Invitaciones
- [ ] Implementar endpoint `POST /api/v1/organizations/me/invites` que genere el token encriptado, lo guarde y dispare email.
- [ ] Implementar ruta pública POST (o GET+POST combinada en UI) `/api/v1/organizations/:id/invites/:token/accept`.
- [ ] Lógica para que al aceptar, si el correo ya existe, vincule al usuario; si no, le pida clave y cree cuenta + registro en la organización.
- [ ] Implementar endpoints para modificar rol y expulsar miembros.

## Backend - Supervisión Clínica
- [ ] Implementar `POST /api/v1/supervision-cases` (psicólogo envía nota).
- [ ] Implementar `GET /api/v1/supervision-cases` (lista de revisión para el supervisor, incluye desanonimización selectiva según la BD).
- [ ] Implementar `PUT /api/v1/supervision-cases/:id/feedback` para que el supervisor guarde comentarios y cierre el caso.

## Frontend - Administración (OWNER)
- [ ] Crear `OrganizationSettingsPage` (configuración general: nombre, logo, etc.).
- [ ] Crear `MemberManagementPage` (tabla de equipo, modal para invitar).
- [ ] Construir página pública de aceptación de invitación `InviteAcceptPage`.

## Frontend - Supervisión
- [ ] Añadir botón "Solicitar Supervisión" en la vista `SessionNoteCard` del psicólogo.
- [ ] Crear `SubmitForSupervisionModal` (seleccionar supervisor, activar/desactivar modo anonimizado).
- [ ] Crear `SupervisionQueuePage` (dashboard del supervisor).
- [ ] Crear `SupervisionCaseFeedbackPage` (vista dividida: nota original a la izquierda, caja de feedback a la derecha).

## Testing
- [ ] (Crucial) Escribir tests de integración de seguridad: un miembro (MEMBER) no puede modificar settings, no puede invitar, ni ver pacientes de otro.
- [ ] Probar el ciclo completo de invitación (generación de token, consumo, creación de usuario, login posterior).
- [ ] Validar que un supervisor pueda ver las notas asociadas al caso sin requerir permisos estándar sobre ese paciente.
- [ ] Validar contra los criterios de aceptación de `spec.md`.
- [ ] Mover la feature a "Hecho" en `../../constitution/roadmap.md`.
