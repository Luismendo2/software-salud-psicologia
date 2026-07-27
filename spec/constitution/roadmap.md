# Roadmap

_Orden y estado de las features. Cada entrada apunta a su carpeta en `spec/features/`. El equipo trabaja de arriba hacia abajo; no se empieza una feature hasta que la anterior esté en estado **implementado**._

---

## Fase 0 — Fundación (pre-MVP)

> Infraestructura base sin la cual nada funciona. No tiene valor de negocio por sí sola pero desbloquea todo lo demás.

| # | Feature | Carpeta | Estado |
|---|---|---|---|
| — | Scaffolding del proyecto (Vite + Express + Prisma + Docker Compose local) | — | ⬜ pendiente |
| — | Autenticación y roles de usuario | `000-auth-y-roles/` | ⬜ pendiente |

---

## Fase 1 — MVP Core 🚀

> Las features mínimas para que un psicólogo independiente pueda usar la plataforma en producción y cobrar por ello.

| # | Feature | Carpeta | Estado |
|---|---|---|---|
| 001 | **Gestión de Agenda y Citas** | `001-agenda-y-citas/` | ⬜ pendiente |
| 002 | **Portal del Paciente** | `002-portal-paciente/` | ⬜ pendiente |
| 003 | **Historia Clínica Psicológica** | `003-historia-clinica/` | ⬜ pendiente |
| 004 | **Seguridad y Privacidad** | `004-seguridad-privacidad/` | ⬜ pendiente |
| 005 | **Facturación y Pagos** | `005-facturacion-pagos/` | ⬜ pendiente |

**Criterio de salida de Fase 1:** Un psicólogo puede registrarse, configurar su horario, recibir reservas de pacientes en línea, llevar historia clínica y emitir una factura electrónica. El paciente puede agendar, pagar y ver su historial desde su portal.

---

## Fase 2 — Diferenciación Clínica 🔬

> Features que convierten la plataforma en una herramienta clínica real, no solo administrativa.

| # | Feature | Carpeta | Estado |
|---|---|---|---|
| 006 | **Telepsicología** | `006-telepsicologia/` | ⬜ pendiente |
| 007 | **Evaluaciones y Medición del Progreso (MBC)** | `007-evaluaciones-mbc/` | ⬜ pendiente |
| 008 | **Comunicación y Seguimiento** | `008-comunicacion-seguimiento/` | ⬜ pendiente |

**Criterio de salida de Fase 2:** Los terapeutas pueden realizar sesiones virtuales integradas, aplicar pruebas psicológicas estandarizadas y hacer seguimiento entre sesiones sin salir del sistema.

---

## Fase 3 — Escala y Equipos 🏥

> Features para clínicas, grupos de terapeutas y supervisión.

| # | Feature | Carpeta | Estado |
|---|---|---|---|
| 009 | **Trabajo en Equipo y Supervisión** | `009-equipo-supervision/` | ⬜ pendiente |
| 010 | **Reportes y Estadísticas** | `010-reportes-estadisticas/` | ⬜ pendiente |

**Criterio de salida de Fase 3:** Una clínica con múltiples terapeutas puede operar de forma coordinada, con supervisión clínica, control de calidad y visibilidad financiera consolidada.

---

## Fase 4 — Inteligencia y Valor Agregado 🤖

> Features avanzadas de IA y diferenciadores competitivos. Requieren datos suficientes de fases anteriores.

| # | Feature | Carpeta | Estado |
|---|---|---|---|
| 011 | **Inteligencia Artificial Clínica** | `011-ia-clinica/` | ⬜ pendiente |
| 012 | **Valor Agregado e Innovación** | `012-valor-agregado/` | ⬜ pendiente |

**Criterio de salida de Fase 4:** El sistema puede transcribir notas por voz, sugerir categorías diagnósticas DSM-5, predecir ausencias y activar un modo crisis con protocolos de emergencia.

---

## Backlog / Ideas futuras 💡

- **App móvil nativa (React Native)** — Versión nativa para iOS y Android del portal del paciente.
- **Integración con Google Calendar / Outlook** — Sincronización bidireccional de la agenda del terapeuta con calendarios externos.
- **Marketplace de terapeutas** — Directorio público donde pacientes nuevos pueden buscar y conectar con psicólogos.
- **Telepsicología grupal** — Salas de videollamada con múltiples pacientes para terapia de grupo.
- **Módulo de formación** — Espacio para terapeutas en formación con supervisión estructurada y rúbricas de competencias.

---

> **Regla:** Antes de iniciar cualquier feature, sus archivos `spec.md`, `plan.md` y `tasks.md` deben estar escritos y revisados. La constitución manda: si una feature contradice `mission.md` o `tech-stack.md`, se replantea la feature.
