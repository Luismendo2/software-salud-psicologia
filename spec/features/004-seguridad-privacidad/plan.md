# 004 · Seguridad y Privacidad — Plan

## Enfoque
La seguridad se implementará como una capa transversal usando middlewares en Express. El principio es de "confianza cero": todas las rutas asumen que deben validar la identidad, el rol y la propiedad del recurso. Los datos sensibles (PII clínica) se cifran a nivel de aplicación antes de guardarse en la BD.

## Implementación

### Esquema de Base de Datos
- **`AuditLog`**: `id`, `userId`, `userRole`, `action` (READ|CREATE|UPDATE|DELETE), `resourceType` (ej. 'ClinicalRecord', 'Appointment'), `resourceId`, `ipAddress`, `userAgent`, `timestamp`, `metadata` (JSONB)
- Nota: `userId` en AuditLog no tendrá llave foránea estricta a `User` con borrado en cascada, para retener el rastro si el usuario es eliminado.

### Middlewares
1. **`authenticate.js`**: Verifica el JWT en la cookie (o header), decodifica y adjunta `req.user`.
2. **`authorize.js`**: Recibe un array de roles `authorize(['ADMIN', 'PSYCHOLOGIST'])`. Valida contra `req.user.role`.
3. **`auditLog.js`**: Middleware que se adjunta a rutas sensibles para registrar la acción de forma asíncrona tras completar el request.
4. **`rateLimit.js`**: Middleware `express-rate-limit` para endpoints públicos (ej. login, reservas públicas).

### Endpoints de API

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| POST | `/api/v1/auth/login` | Validar credenciales, retornar JWT | Público |
| POST | `/api/v1/auth/logout` | Limpiar cookie JWT | Público |
| POST | `/api/v1/auth/refresh` | Generar nuevo token | Público (con Refresh Token) |
| POST | `/api/v1/auth/forgot-password`| Enviar correo con token temporal | Público |
| POST | `/api/v1/auth/reset-password/:token`| Establecer nueva contraseña | Público |
| GET | `/api/v1/auth/me` | Obtener datos básicos del usuario logueado | Todos los Auth |
| GET | `/api/v1/admin/audit-logs` | Consultar registro inmutable de auditoría | ADMIN |

### Estrategia de Cifrado
- **Contraseñas**: bcrypt (cost factor 12).
- **PII y Notas**: Los campos definidos como sensibles (ej. `SessionNote.content`) serán cifrados a nivel de Node.js antes de insertarlos en Prisma, usando el módulo nativo `crypto` (AES-256-GCM) y una clave maestra cargada desde variables de entorno. Al recuperar (SELECT), se descifran.

### Respaldos (Backups)
- Se programará un cron job en la infraestructura (ej. GitHub Actions o servicio manejado en Railway/Render) que ejecute `pg_dump`.
- El archivo `.sql` se cifra y se sube automáticamente a un bucket S3 configurado con retención de 30 días.

### Componentes React
- **`AuthContext` / `AuthProvider`**: Gestiona el estado global de autenticación (`user`, `login`, `logout`) y almacena en memoria.
- **`ProtectedRoute`**: Componente wrapper `<ProtectedRoute allowedRoles={['ADMIN']}> ... </ProtectedRoute>`.
- Vistas estándar: `LoginPage`, `ForgotPasswordPage`, `ResetPasswordPage`.
- **`AuditLogPage`**: Interfaz de solo lectura para el ADMIN.

## Decisiones
- **JWT en Cookies HttpOnly**: Mejor protección contra ataques XSS que almacenar el token en localStorage.
- **AES-256 a nivel de app (App-Level Encryption)**: Aunque MySQL puede tener cifrado en reposo (Disk-Level Encryption), la Ley 1581 recomienda cifrar datos en tránsito y en reposo a nivel de columna para asegurar que un volcado de BD filtrado sea inútil sin la llave de la aplicación.
- **Sin WebSockets para Auth**: Refresh de tokens tradicional.

## Riesgos
- **Pérdida de la clave maestra AES**: Si se pierde `ENCRYPTION_KEY`, todos los datos clínicos cifrados se vuelven inaccesibles de forma irreversible. Mitigación: Gestión estricta de secretos en AWS Secrets Manager o equivalente y proceso de rotación documentado.
