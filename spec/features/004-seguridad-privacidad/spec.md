# 004 · Seguridad y Privacidad

| Campo       | Valor                                      |
|-------------|--------------------------------------------|
| **ID**      | 004                                        |
| **Nombre**  | Seguridad y Privacidad                     |
| **Estado**  | propuesta                                  |
| **Fase**    | MVP — Fase 1 (preocupación transversal)    |
| **Autor**   | Arquitectura PsiAgenda                     |
| **Fecha**   | 2026-06-30                                 |
| **Depende de** | 001 (Gestión de Usuarios y Roles)       |

---

## 1. Qué hace

La funcionalidad de Seguridad y Privacidad es una **capa transversal** que protege cada recurso de la plataforma PsiAgenda. No es una pantalla aislada, sino un conjunto de mecanismos que operan en todas las solicitudes, en todos los datos almacenados y en todas las acciones de los usuarios. Sus responsabilidades son:

1. **Autenticación** — Verifica la identidad de cada usuario mediante JSON Web Tokens (JWT). Se emite un *access token* de corta duración (15 minutos) y un *refresh token* de larga duración (7 días) almacenado en una cookie `httpOnly + Secure` para prevenir robo mediante XSS.

2. **Control de acceso basado en roles (RBAC)** — Cada endpoint y cada vista de React restringe el acceso según el rol del usuario: `ADMIN`, `PSYCHOLOGIST`, `ASSISTANT` o `PATIENT`. Ningún usuario puede ver ni modificar información que no le corresponde.

3. **Cifrado de datos en tránsito** — Toda comunicación entre el navegador y el servidor ocurre sobre HTTPS/TLS (TLS 1.2 mínimo, TLS 1.3 preferido). Las credenciales y tokens nunca viajan en texto plano.

4. **Cifrado de datos en reposo** — Los campos de información personalmente identificable (PII) almacenados en la base de datos (nombre completo, teléfono, diagnósticos, notas de emergencia) son cifrados con AES-256 antes de persistirse. Las contraseñas son hasheadas con bcrypt (factor de costo 12) y nunca se almacenan en texto plano.

5. **Registro de auditoría inmutable** — Cada acción relevante sobre registros clínicos o datos de pacientes genera una entrada en `AuditLog`. El registro es *append-only*: ningún usuario, incluyendo administradores, puede modificar o eliminar entradas del historial de auditoría.

6. **Rate limiting** — Los endpoints de autenticación y otras rutas críticas tienen límites de tasa configurados para mitigar ataques de fuerza bruta y abusos automatizados.

7. **Política de contraseñas** — El sistema exige contraseñas con un mínimo de 8 caracteres, al menos una letra mayúscula, un dígito y un carácter especial. El cumplimiento se valida en el frontend (React Hook Form + Zod) y se re-valida en el backend.

8. **Respaldo automático** — Se ejecuta un `pg_dump` diario cifrado que se almacena en S3 (o compatible), con retención de 30 días, para prevenir pérdida de información.

9. **Cumplimiento Ley 1581 de 2012** — La plataforma adopta las medidas técnicas y organizativas requeridas para el tratamiento de datos personales en Colombia: consentimiento explícito en el registro, derecho al olvido gestionado por ADMIN, y aviso de privacidad visible.

---

## 2. Por qué

PsiAgenda maneja información clínica de alta sensibilidad: diagnósticos psiquiátricos, notas de sesión, historias clínicas y datos de contacto de pacientes. Un incidente de seguridad podría:

- Violar la privacidad de los pacientes y generar daños psicológicos graves.
- Exponer al psicólogo/organización a sanciones legales bajo la Ley 1581 y la Ley 1266 de Colombia (multas de hasta 2.000 SMLMV).
- Destruir la confianza en la plataforma, haciendo imposible su adopción.

Al ser una preocupación transversal de Fase 1, esta funcionalidad debe estar completamente implementada antes de que cualquier otro módulo pase a producción. No es opcional ni postergable.

---

## 3. Criterios de aceptación

> Los criterios están numerados para trazabilidad. Cada uno es verificable con una prueba automatizada o un paso de inspección manual definido.

### 3.1 Autenticación — JWT

| # | Criterio |
|---|----------|
| AC-001 | Al iniciar sesión con credenciales correctas, el servidor responde con un `access_token` JWT firmado (HS256 o RS256) con `exp = ahora + 15 min` y establece una cookie `httpOnly; Secure; SameSite=Strict` con el `refresh_token` (exp = 7 días). |
| AC-002 | El `access_token` no contiene la contraseña ni el `passwordHash` del usuario en su payload. |
| AC-003 | Una solicitud a cualquier endpoint protegido sin `Authorization: Bearer <token>` devuelve `401 Unauthorized` con código de error `AUTH_TOKEN_MISSING`. |
| AC-004 | Una solicitud con un `access_token` expirado devuelve `401 Unauthorized` con código `AUTH_TOKEN_EXPIRED`. |
| AC-005 | `POST /api/v1/auth/refresh` con una cookie de refresh válida emite un nuevo `access_token` sin requerir contraseña. Si el refresh token ha expirado, devuelve `401 AUTH_REFRESH_EXPIRED`. |
| AC-006 | `POST /api/v1/auth/logout` invalida el refresh token en la BD (marcado como revocado) y elimina la cookie del navegador con `Set-Cookie: refresh_token=; Max-Age=0`. |
| AC-007 | El flujo de recuperación de contraseña envía un correo con un token de un solo uso (válido 1 hora). Usar el token dos veces devuelve `400 RESET_TOKEN_USED`. |
| AC-008 | Tras 5 intentos de login fallidos consecutivos desde la misma IP en 10 minutos, el endpoint devuelve `429 Too Many Requests`. |

### 3.2 Control de acceso por roles (RBAC)

| # | Criterio |
|---|----------|
| AC-009 | Un usuario con rol `PATIENT` que intenta acceder a `GET /api/v1/patients` (lista de todos los pacientes) recibe `403 Forbidden` con código `AUTH_INSUFFICIENT_ROLE`. |
| AC-010 | Un `PSYCHOLOGIST` solo puede leer/modificar los registros de sus propios pacientes (verificado por `psychologistId === req.user.id`). Intentar acceder a paciente de otro psicólogo devuelve `403 Forbidden`. |
| AC-011 | Un `ASSISTANT` puede crear citas y ver listados básicos, pero no puede acceder a notas clínicas ni historias. Una solicitud `GET /api/v1/session-notes/:id` de un `ASSISTANT` devuelve `403 Forbidden`. |
| AC-012 | Solo un `ADMIN` puede acceder a `GET /api/v1/admin/audit-logs`. Cualquier otro rol recibe `403 Forbidden`. |
| AC-013 | En el frontend, las rutas protegidas (`<ProtectedRoute roles={['ADMIN']} />`) redirigen a `/403` si el usuario autenticado no tiene el rol requerido, en lugar de mostrar contenido parcial o error de red. |

### 3.3 Cifrado

| # | Criterio |
|---|----------|
| AC-014 | La base de datos no contiene contraseñas en texto plano. Inspeccionando la columna `passwordHash` se observa un hash bcrypt válido (prefijo `$2b$`). |
| AC-015 | Los campos PII cifrados (`fullName`, `phone`, `emergencyContact`, diagnósticos en `ClinicalRecord`) se almacenan como texto base64 en la BD. Al desencriptarlos con la clave AES-256 del entorno se obtiene el valor original. |
| AC-016 | Si la variable de entorno `ENCRYPTION_KEY` no está presente al iniciar el servidor, el proceso termina con un error fatal antes de aceptar conexiones. |
| AC-017 | Todas las solicitudes HTTP no-HTTPS son redirigidas automáticamente a HTTPS (redirección 301). |

### 3.4 Auditoría

| # | Criterio |
|---|----------|
| AC-018 | Cada lectura (`READ`), creación (`CREATE`), modificación (`UPDATE`) y eliminación lógica (`DELETE`) sobre `ClinicalRecord`, `SessionNote`, `Assessment` y `Patient` genera una fila en `AuditLog` con `userId`, `userRole`, `action`, `resourceType`, `resourceId`, `ipAddress`, `timestamp`. |
| AC-019 | No existe ninguna ruta ni función en el código que permita hacer `DELETE` o `UPDATE` sobre la tabla `AuditLog`. La base de datos tiene un trigger `BEFORE UPDATE OR DELETE ON audit_logs` que lanza una excepción si se intenta. |
| AC-020 | `GET /api/v1/admin/audit-logs` devuelve resultados paginados (máx. 100 por página) y permite filtrar por `userId`, `resourceType` y rango de fechas. |

### 3.5 Respaldos

| # | Criterio |
|---|----------|
| AC-021 | El cron job de backup se ejecuta diariamente a las 02:00 UTC y genera un archivo `.sql.gz` cifrado almacenado en S3 con prefijo `backups/YYYY-MM-DD/`. |
| AC-022 | Los archivos de backup con más de 30 días son eliminados automáticamente por la política de ciclo de vida de S3. |

### 3.6 Política de contraseñas

| # | Criterio |
|---|----------|
| AC-023 | Una solicitud de registro con contraseña `"abc123"` devuelve `400 Bad Request` con error de validación `PASSWORD_TOO_WEAK` indicando qué requisito incumple. |
| AC-024 | Una contraseña `"Secure@123"` supera la validación de Zod en el backend sin errores. |

---

## 4. Fuera de alcance (MVP Fase 1)

Los siguientes elementos **no** serán implementados en esta fase:

- **SSO / OAuth2** (Google, Microsoft, etc.): autenticación federada para uso futuro.
- **MFA / 2FA** (TOTP, SMS): autenticación multifactor queda para Fase 2.
- **Biometría o passkeys**: tecnología WebAuthn no incluida en MVP.
- **SIEM / integración con herramientas de monitoreo externo** (Splunk, Datadog): el AuditLog interno cubre las necesidades del MVP.
- **Consentimiento granular de cookies** (banner GDPR): la Ley 1581 no exige este nivel de granularidad para plataformas B2B de salud en Colombia.
- **Firma electrónica calificada de tokens** (certificado digital emitido por entidad certificadora colombiana): aplica solo a notas clínicas (Feature 006), no a los tokens de autenticación.
- **Cifrado de backups con KMS administrado externamente**: en el MVP se usa una clave simétrica configurada en el entorno del servidor de backup.
- **Panel de privacidad para que pacientes descarguen sus datos** (derecho de portabilidad, Art. 8 Ley 1581): queda en hoja de ruta post-MVP.
