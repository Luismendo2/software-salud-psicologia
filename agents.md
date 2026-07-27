# PsiAgenda

Plataforma integral de gestión clínica, telepsicología y agendamiento, diseñada para psicólogos independientes y clínicas de salud mental. Permite organizar agendas, cobrar consultas, llevar la historia clínica de los pacientes de forma segura y realizar mediciones de progreso clínico.

## Stack
- **Lenguaje:** JavaScript ES2022+ (JSDoc para tipado ligero)
- **Frontend / UI:** React 18 (Vite) + React Router v6 + Bootstrap 5.3
- **Backend / runtime:** Node.js 20 LTS + Express 5
- **Base de datos:** MySQL 8 con Prisma ORM 5 (Redis para colas)
- **Tests:** Jest + Supertest (Backend) y Vitest + React Testing Library (Frontend)

## Comandos
*(Nota: El proyecto está dividido en carpetas `client/` y `server/`)*

- `npm run dev` — Arranca los servidores de desarrollo local con recarga en caliente (Vite para frontend, Nodemon para backend).
- `npm run test` — Ejecuta las suites de pruebas (deben pasar antes de cada commit).
- `npm run lint` — Revisa el estilo de código con ESLint y Prettier (antes de cada PR).
- `npm run build` — Compila la aplicación de React en `dist/` para producción.
- `npx prisma migrate dev` — (En la carpeta server) Aplica los cambios de la base de datos en desarrollo.

## Estructura del proyecto
- `client/src/components/` — Componentes React de UI puros y reutilizables (Botones, Modales, Layouts).
- `client/src/features/` — Módulos de negocio agrupados por funcionalidad (ej. `agenda/`, `telepsicologia/`, `pacientes/`).
- `client/src/services/` — Módulos Axios para comunicación con la API.
- `server/src/routes/` — Definición de rutas Express (un archivo por recurso).
- `server/src/controllers/` — Lógica de request/response que delega inmediatamente en los servicios.
- `server/src/services/` — Lógica de negocio core (independiente de HTTP).
- `server/src/middleware/` — Middlewares de seguridad (Auth JWT, validación Zod, auditoría, manejo de errores).
- `server/prisma/` — Esquema de base de datos (`schema.prisma`) y migraciones.
- `spec/` — Documentación del proyecto (Spec-Driven Development) con la constitución y especificaciones de las features.

## Convenciones
- **Estilo de nombres:** `camelCase` para variables, funciones y nombres de archivos backend. `PascalCase` para nombres de componentes React y modelos Prisma. `kebab-case` plural para rutas API (ej. `/api/appointments`).
- **Dónde van los tests:** Junto al archivo de producción (ej. `appointmentService.js` + `appointmentService.test.js`).
- **Manejo de errores:** Centralizado. El backend delega los errores al middleware global que retorna un formato estándar: `{ "success": false, "error": { "code": "ERR_CODE", "message": "..." } }`. El frontend atrapa esto en interceptores de Axios.
- **Validación de entradas:** Toda ruta del backend valida el `req.body`, `req.query` y `req.params` usando `Zod` antes de tocar la base de datos.
- **Respuestas API REST:** Todas las respuestas exitosas deben seguir el formato `{ "success": true, "data": { ... } }`.

## No hagas
- **Regla de seguridad:** No subir archivos `.env*` al repositorio (excluidos en `.gitignore`). Configurar solo en los entornos desplegados.
- **Límite duro:** No hacer llamadas `fetch` directamente desde los componentes de React; pasar siempre por los módulos dentro de `client/src/services/`.
- **Límite duro (Archivos):** No guardar o procesar imágenes ni PDFs directamente en el disco del servidor. Usar siempre el bucket de almacenamiento (Cloudinary o AWS S3) definido en las variables de entorno.
- **Zona prohibida:** No modificar directamente el esquema de la base de datos de producción sin generar y aplicar previamente una migración de Prisma.
- **Seguridad clínica:** Nunca enviar contraseñas o campos de PII médica en texto plano a los logs (`console.log` u otros).

## Flujo de trabajo
- Antes de una tarea no trivial, propón un plan y espera mi OK.
- Una tarea a la vez; al terminar, dime qué cambiaste para que lo revise.
- Si no estás seguro al 80%, pregunta. No inventes.

## Documentación
- Reglas profundas de arquitectura, colores UI y principios: Ver `spec/constitution/`.
- Detalles de implementación y tareas por cada módulo: Ver la carpeta de la respectiva funcionalidad en `spec/features/` (ej. `001-agenda-y-citas`, `003-historia-clinica`).
