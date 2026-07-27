# 004 · Seguridad y Privacidad — Tareas

## Configuración base
- [ ] Instalar dependencias necesarias (`bcrypt`, `jsonwebtoken`, `express-rate-limit`, `helmet`, `cors`).
- [ ] Configurar `helmet` en Express para headers de seguridad HTTP.
- [ ] Configurar opciones seguras de CORS.
- [ ] Implementar middleware global de manejo de errores (sin exponer stack traces).

## Autenticación
- [ ] Crear el modelo `User` en Prisma.
- [ ] Implementar función de hash y verificación de contraseñas (`bcrypt`).
- [ ] Implementar endpoints `/auth/login` y `/auth/logout` (manejo de cookies).
- [ ] Implementar endpoint `/auth/refresh` y middleware asociado.
- [ ] Implementar flujo de recuperación de contraseña (generación de token, envío de email).
- [ ] Crear y testear middleware `authenticate`.

## Control de Accesos
- [ ] Crear middleware `authorize(roles)`.
- [ ] Integrar `authorize` en las rutas del router principal.
- [ ] Aplicar `express-rate-limit` a las rutas de `/auth` y rutas públicas de agendamiento.

## Cifrado y Datos
- [ ] Implementar módulo utilitario `cryptoUtils.js` (cifrado simétrico AES-256-GCM).
- [ ] Modificar servicios de BD para cifrar campos PII (`encrypt` antes de Prisma `create`/`update`).
- [ ] Modificar servicios de BD para descifrar campos PII tras Prisma `findMany`/`findUnique`.

## Auditoría (Audit Log)
- [ ] Crear modelo `AuditLog` en Prisma.
- [ ] Implementar middleware `auditLog.js` que registre el `req.user.id`, acción, recurso e IP de forma asíncrona.
- [ ] Aplicar middleware de auditoría a todas las rutas que toquen historia clínica o pagos.
- [ ] Implementar endpoint `/admin/audit-logs` (GET paginado).

## Respaldos (Backups)
- [ ] Escribir script de shell para backup (ejecuta `pg_dump`, comprime, cifra).
- [ ] Configurar el script de carga automatizada al proveedor S3.
- [ ] Documentar el proceso de restauración en el README o wiki del proyecto.

## Frontend
- [ ] Crear el `AuthContext` y su Provider para manejar el estado de autenticación.
- [ ] Construir `LoginPage` con validaciones de formulario.
- [ ] Construir vistas para "Olvidé mi contraseña" y "Restablecer contraseña".
- [ ] Crear el wrapper `ProtectedRoute` y proteger todas las rutas de la app.
- [ ] Implementar interceptor de Axios para atrapar errores `401 Unauthorized` e intentar refrescar el token o redirigir al login.
- [ ] Construir vista `AuditLogPage` (tabla paginada) visible solo para `ADMIN`.

## Testing
- [ ] Tests de integración para login (correcto, erróneo, cuenta bloqueada).
- [ ] Tests para verificar que `authorize` bloquea el acceso si el rol es incorrecto.
- [ ] Tests unitarios del módulo de cifrado AES (cifrar y descifrar deben devolver el string original).
- [ ] Validar contra los criterios de aceptación de `spec.md`.
- [ ] Mover la feature a "Hecho" en `../../constitution/roadmap.md`.
