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

### Fase 2: Frontend (Organización y Roles)
- [x] Crear componente `OrganizationSettingsPage` (Admin) para configurar datos de la clínica.
- [x] Crear componente `MemberManagementPage` (Admin) con tabla de miembros y modales de invitación.
- [x] Crear componente `InviteAcceptPage` (Público) para que nuevos usuarios acepten invitación por token.
- [x] Crear componentes UI para cambio de rol (`ChangeMemberRoleModal`) y gestión de estado (Activar/Desactivar).

### Fase 3: Frontend (Supervisión Clínica)
- [x] Añadir botón "Solicitar Supervisión" en el visor de notas de sesión (`SessionNoteCard`).
- [x] Crear `SubmitForSupervisionModal` (selección de supervisor, toggle de anonimización).
- [x] Crear `SupervisionQueuePage` para el rol SUPERVISOR (cola de casos pendientes/resueltos).
- [x] Crear `SupervisionCaseFeedbackPage` (vista dividida: nota a la izquierda, caja de feedback a la derecha).
- [x] Crear insignia `AnonymizedPatientBadge` y lógica condicional en la UI para ocultar el nombre real si `isAnonymized` es true.

## Testing
- [ ] (Crucial) Escribir tests de integración de seguridad: un miembro (MEMBER) no puede modificar settings, no puede invitar, ni ver pacientes de otro.
- [ ] Probar el ciclo completo de invitación (generación de token, consumo, creación de usuario, login posterior).
- [ ] Validar que un supervisor pueda ver las notas asociadas al caso sin requerir permisos estándar sobre ese paciente.
- [ ] Validar contra los criterios de aceptación de `spec.md`.
- [ ] Mover la feature a "Hecho" en `../../constitution/roadmap.md`.
