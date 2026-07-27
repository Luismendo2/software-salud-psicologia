# 009 · Trabajo en Equipo y Supervisión

| Campo       | Valor                              |
|-------------|------------------------------------|
| **ID**      | 009                                |
| **Nombre**  | Trabajo en Equipo y Supervisión    |
| **Fase**    | 3                                  |
| **Estado**  | propuesta                          |
| **Autor**   | Equipo PsiAgenda                   |
| **Fecha**   | 2026-06-30                         |

---

## 1. Qué hace

La funcionalidad de Trabajo en Equipo y Supervisión permite que múltiples psicólogos y profesionales de salud mental operen bajo una misma **Organización** dentro de PsiAgenda, cada uno con su propia agenda y cartera de pacientes, sin acceso cruzado a datos clínicos de los demás.

Adicionalmente, introduce un flujo de **supervisión clínica**: un terapeuta (supervisado) puede enviar notas de sesión a un supervisor para recibir retroalimentación profesional, controlando si la identidad del paciente se revela o se anonimiza. Los coordinadores y supervisores disponen de herramientas para revisar el cumplimiento de estándares clínicos y la calidad de los registros.

### Capacidades principales

| Capacidad | Descripción |
|---|---|
| Multiusuario por organización | Varios terapeutas comparten una misma organización; cada uno gestiona sus propios pacientes y agenda de forma independiente. |
| Roles organizacionales | Cuatro roles: **OWNER** (dueño-psicólogo), **MEMBER** (terapeuta), **SUPERVISOR** y **ASSISTANT**. |
| Invitación por correo | El OWNER invita a colaboradores vía email; el invitado acepta mediante un enlace seguro y crea su cuenta. |
| Aislamiento de datos | Los datos de los pacientes de un terapeuta **no** son visibles para otros terapeutas salvo que exista una supervisión explícita autorizada. |
| Supervisión clínica | El supervisado somete una nota de sesión a revisión; el supervisor la lee, anota retroalimentación y la cierra. |
| Anonimización controlada | El supervisado elige si revelar el nombre del paciente al supervisor (solo si el paciente dio consentimiento). |
| Control de calidad | Los supervisores y coordinadores pueden revisar el historial de casos de supervisión y verificar el cumplimiento de estándares clínicos. |
| Configuración de la organización | El OWNER personaliza nombre de la clínica, logo, color de marca, duración predeterminada de citas, dirección y teléfono. |

---

## 2. Por qué

### Problema actual
Las prácticas de psicología frecuentemente funcionan en grupo: varias psicólogas trabajan en la misma clínica, coordinadas por un director o supervisor clínico. Sin soporte multiusuario, cada profesional necesita una cuenta individual desvinculada, lo que impide la coordinación, la supervisión y la garantía de calidad del servicio.

### Valor para el negocio
- Permite licenciar PsiAgenda a nivel de **clínica u organización**, multiplicando el ingreso por asiento.
- Reduce la fricción para prácticas grupales que hoy usan hojas de cálculo o sistemas separados para coordinar.
- Habilita la supervisión clínica digital, un requisito regulatorio en muchos contextos de formación y habilitación de psicólogos.

### Valor para el usuario
- **OWNER**: visibilidad de su equipo, control total de accesos y configuración de la marca.
- **MEMBER**: contexto de equipo sin exposición de datos de sus pacientes a colegas.
- **SUPERVISOR**: cola de casos de supervisión centralizada, flujo estructurado de retroalimentación.
- **PATIENT**: certeza de que su información clínica solo es compartida con su consentimiento explícito.

---

## 3. Criterios de aceptación

> Todos los criterios son verificables con una respuesta **sí / no**.

| # | Criterio |
|---|---|
| CA-01 | Un usuario con rol OWNER puede crear una nueva organización ingresando nombre y slug. |
| CA-02 | El OWNER puede actualizar el nombre, logo, color de marca, teléfono, dirección y duración predeterminada de citas de la organización. |
| CA-03 | El OWNER puede invitar a un colaborador por correo electrónico, asignándole un rol (MEMBER, SUPERVISOR, ASSISTANT). |
| CA-04 | El correo de invitación contiene un enlace único con token de un solo uso, válido durante 72 horas. |
| CA-05 | Al hacer clic en el enlace de invitación, el invitado ve una página pública donde completa su registro (nombre, contraseña) y queda vinculado a la organización automáticamente. |
| CA-06 | Si el token de invitación ha expirado o ya fue usado, la página muestra un mensaje de error claro y no crea la cuenta. |
| CA-07 | Un terapeuta MEMBER solo puede ver la lista de sus propios pacientes; no aparecen pacientes de otros terapeutas de la misma organización. |
| CA-08 | Un SUPERVISOR puede ver la cola de casos de supervisión asignados a él dentro de la organización, pero no puede acceder al historial clínico completo de pacientes que no le corresponden. |
| CA-09 | Un MEMBER puede enviar una nota de sesión a supervisión seleccionando al supervisor y eligiendo si anonimizar al paciente. |
| CA-10 | Cuando el supervisado elige anonimizar, el supervisor ve el caso con identificador genérico (p. ej. "Paciente #4821") y sin datos de contacto; cuando no anonimiza (y el paciente consintió), el supervisor ve el nombre completo. |
| CA-11 | El supervisor puede escribir retroalimentación textual sobre un caso de supervisión y marcarlo como RESOLVED. |
| CA-12 | El supervisado recibe una notificación (in-app y/o email) cuando el supervisor deja retroalimentación en un caso. |
| CA-13 | El OWNER puede cambiar el rol de un miembro (ej. MEMBER → SUPERVISOR) o desactivar su acceso a la organización. |
| CA-14 | Un miembro desactivado pierde inmediatamente el acceso a todos los recursos de la organización; sus datos históricos se conservan. |
| CA-15 | El JWT de un usuario incluye el `organizationId` de su organización activa; todas las consultas de datos están filtradas por ese `organizationId`. |
| CA-16 | El OWNER ve un panel de miembros con nombre, rol, fecha de ingreso y estado (activo/inactivo). |
| CA-17 | Los casos de supervisión en estado PENDING_REVIEW aparecen primero en la cola del supervisor, ordenados por fecha de creación ascendente. |

---

## 4. Fuera de alcance

Los siguientes elementos **no** forman parte de esta funcionalidad en Fase 3:

- **Videollamadas de supervisión en tiempo real**: la supervisión es asíncrona (nota escrita → retroalimentación escrita). La integración con Daily.co para sesiones de supervisión en vivo se considerará en una fase posterior.
- **Múltiples organizaciones simultáneas**: un usuario pertenece a una sola organización a la vez. El soporte para usuarios con membresía en varias organizaciones (multi-tenancy cruzado) queda fuera.
- **Chat en tiempo real dentro de la organización**: la mensajería interna entre miembros del equipo (Feature 011) es independiente.
- **Panel de analíticas de equipo**: métricas agregadas de productividad del equipo (citas, ingresos, tiempo de respuesta) se cubren en Feature 010 (Reportes).
- **Jerarquías de supervisión anidadas**: solo existe un nivel de supervisión (supervisor ↔ supervisado); no se contemplan cadenas de supervisión multi-nivel.
- **Rotación automática de pacientes entre terapeutas**: la reasignación de pacientes es manual y estará en el módulo de gestión de pacientes.
- **Single Sign-On (SSO) corporativo**: autenticación federada (SAML/OAuth empresarial) no está contemplada en esta fase.
- **Exportación de informes de supervisión en formato regulatorio específico**: se deja para análisis posterior según requerimientos de organismos de salud locales.
