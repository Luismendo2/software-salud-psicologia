# Tech Stack y Convenciones

_Referencia técnica del proyecto. Todo plan de feature debe respetar estas decisiones. Si una feature requiere una excepción, debe documentarse explícitamente en su `plan.md` y justificarse._

## Tecnologías

### Frontend
- **Framework:** React 18 con React Router v6 (SPA)
- **Lenguaje:** JavaScript ES2022+ (sin TypeScript en MVP; se puede migrar en v2)
- **UI / Estilo:** Bootstrap 5.3 + CSS custom properties para tokens de color y tipografía
- **Gestión de estado:** React Context API para estado global ligero; Zustand si el estado crece en fases posteriores
- **HTTP client:** Axios con interceptores para adjuntar JWT y manejar refresh de token
- **Formularios:** React Hook Form + Yup para validación en cliente
- **Calendario:** FullCalendar (librería de calendario open source compatible con React)
- **Gráficos:** Recharts para visualizaciones de progreso clínico
- **Video:** Daily.co SDK embebido (o Whereby Embedded) para videollamadas in-app
- **Build tool:** Vite 5

### Backend
- **Runtime:** Node.js 20 LTS
- **Framework:** Express 5
- **Lenguaje:** JavaScript ES2022+ con JSDoc para tipado ligero
- **ORM:** Prisma 5 con MySQL 8
- **Autenticación:** JWT (access token 15 min + refresh token 7 días en cookie httpOnly)
- **Validación:** Zod en todas las rutas de entrada
- **Colas de tareas:** Bull + Redis para recordatorios, correos y notificaciones asíncronas
- **Notificaciones:** Nodemailer (correo SMTP), integración WhatsApp vía API de Twilio/Meta
- **Almacenamiento de archivos:** Cloudinary o AWS S3 para PDFs, imágenes y documentos clínicos
- **Facturación DIAN:** Integración con API de facturación electrónica (Siigo, Alegra o equivalente)
- **Pasarela de pagos:** Wompi (Colombia) como integración primaria; PayU como alternativa

### Base de datos
- **Motor:** MySQL 8
- **ORM:** Prisma (migraciones declarativas)
- **Caché / colas:** Redis 7 (Bull queues)

### Infraestructura y despliegue
- **Backend:** Railway o Render (contenedor Docker)
- **Frontend:** Vercel o Netlify (CDN estático)
- **Base de datos:** Railway MySQL managed o AWS RDS
- **Redis:** Railway Redis o Upstash
- **Variables de entorno:** `.env` local; secrets en panel de la plataforma de despliegue
- **CI/CD:** GitHub Actions (lint + tests en PR; deploy automático en merge a `main`)

### Testing
- **Backend:** Jest + Supertest para pruebas de integración de endpoints
- **Frontend:** Vitest + React Testing Library para componentes clave
- **Cobertura mínima MVP:** 70% en rutas de negocio críticas (autenticación, agenda, pagos)

---

## Estructura de directorios

```
psiagenda/
├── client/                   # Aplicación React
│   ├── public/
│   ├── src/
│   │   ├── assets/           # Imágenes, íconos, fuentes
│   │   ├── components/       # Componentes reutilizables (UI puro)
│   │   │   ├── common/       # Botones, modales, inputs, badges
│   │   │   └── layout/       # Navbar, Sidebar, Footer
│   │   ├── features/         # Módulos de negocio (carpeta por feature)
│   │   │   ├── agenda/
│   │   │   ├── telepsicologia/
│   │   │   ├── pacientes/
│   │   │   ├── historia-clinica/
│   │   │   ├── facturacion/
│   │   │   └── ...
│   │   ├── hooks/            # Custom hooks compartidos
│   │   ├── context/          # Providers de React Context
│   │   ├── services/         # Módulos Axios (API calls)
│   │   ├── utils/            # Helpers puros (fechas, formateo, validación)
│   │   ├── router/           # Definición de rutas con React Router
│   │   ├── styles/           # Variables CSS globales y overrides Bootstrap
│   │   │   ├── variables.css
│   │   │   └── global.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
│
└── server/                   # API Node.js / Express
    ├── src/
    │   ├── routes/           # Definición de rutas Express (un archivo por recurso)
    │   ├── controllers/      # Lógica de request/response (delega a services)
    │   ├── services/         # Lógica de negocio (independiente de HTTP)
    │   ├── middleware/        # Auth, validación, manejo de errores, audit log
    │   ├── prisma/
    │   │   ├── schema.prisma # Esquema de base de datos
    │   │   └── migrations/
    │   ├── jobs/             # Definición de Bull jobs (recordatorios, etc.)
    │   ├── utils/            # Helpers (tokens, fechas, encriptación)
    │   └── app.js            # Configuración de Express
    ├── server.js             # Entry point
    └── .env.example
```

---

## Comandos

```bash
# Frontend (dentro de client/)
npm run dev          # Arranca Vite en localhost:5173
npm run build        # Build de producción en dist/
npm run test         # Vitest
npm run lint         # ESLint

# Backend (dentro de server/)
npm run dev          # Nodemon con recarga en caliente
npm run start        # Producción
npm run test         # Jest
npm run lint         # ESLint
npx prisma migrate dev   # Aplica migraciones en desarrollo
npx prisma studio        # GUI de base de datos
```

---

## Modelo de datos — Entidades centrales

| Entidad | Descripción |
|---|---|
| `User` | Cuenta de acceso. Roles: `ADMIN`, `PSYCHOLOGIST`, `ASSISTANT`, `PATIENT` |
| `Organization` | Clínica o consultorio. Un `User` PSYCHOLOGIST puede pertenecer a una o más |
| `Patient` | Perfil clínico del paciente, ligado a un `User` con rol PATIENT |
| `Appointment` | Cita: fecha, hora, duración, tipo (`PRESENCIAL`/`VIRTUAL`), estado |
| `ClinicalRecord` | Historia clínica: conjunto de sesiones y documentos de un paciente |
| `SessionNote` | Nota de sesión individual, ligada a un `Appointment` |
| `Assessment` | Evaluación psicológica (PHQ-9, GAD-7…) respondida por un paciente |
| `Invoice` | Factura electrónica, ligada a un `Appointment` o a un paquete de sesiones |
| `Payment` | Pago realizado, estado de la transacción con referencia de pasarela |
| `Message` | Mensaje en la mensajería interna entre paciente y terapeuta |
| `Task` | Tarea terapéutica asignada por el terapeuta al paciente |
| `AuditLog` | Registro inmutable de accesos y modificaciones (quién, qué, cuándo) |

**Reglas de integridad destacadas:**
- Un `Patient` siempre tiene un `User` propietario; el acceso a su `ClinicalRecord` requiere que el `User` autenticado sea su terapeuta asignado, supervisor con permiso, o el propio paciente (sólo lectura parcial).
- `Appointment.status` sigue la máquina de estados: `PENDING → CONFIRMED → COMPLETED | CANCELLED | NO_SHOW`.
- `AuditLog` es append-only; ningún endpoint puede modificar ni eliminar sus entradas.

---

## Convenciones

### Nombrado
- **Archivos React:** PascalCase para componentes (`AppointmentCard.jsx`), camelCase para hooks (`useAppointments.js`), camelCase para servicios (`appointmentService.js`).
- **Archivos backend:** camelCase (`appointmentController.js`, `appointmentService.js`, `appointment.routes.js`).
- **Variables y funciones:** camelCase en JS. Constantes globales: SCREAMING_SNAKE_CASE.
- **Rutas API:** kebab-case plural (`/api/appointments`, `/api/clinical-records`).
- **Tablas Prisma:** PascalCase singular (`Appointment`, `ClinicalRecord`).

### API REST
- Versión en URL: `/api/v1/...`
- Respuesta estándar:
  ```json
  { "success": true, "data": { ... } }
  { "success": false, "error": { "code": "APPOINTMENT_NOT_FOUND", "message": "..." } }
  ```
- Paginación: query params `?page=1&limit=20`; respuesta incluye `meta.total`, `meta.page`, `meta.pages`.
- Fechas: siempre ISO 8601 UTC en el API; conversión a timezone local en el frontend.

### Manejo de errores
- Backend: middleware de error centralizado captura todas las excepciones; nunca se exponen stack traces en producción.
- Frontend: Axios interceptor captura errores HTTP y dispara toast de notificación; los componentes no manejan errores de red directamente.

### Seguridad
- Validar y sanitizar **todas** las entradas con Zod en el backend.
- Nunca almacenar datos sensibles en `localStorage`; tokens de refresh van en cookie `httpOnly` + `Secure`.
- Todas las rutas protegidas requieren middleware `authenticate` + middleware `authorize(roles)`.
- Datos PII del paciente (nombre, teléfono, diagnóstico) nunca aparecen en logs.

### Tests
- Un archivo de test por archivo de producción: `appointmentService.test.js` junto a `appointmentService.js`.
- Nomenclatura de describe/it: `describe('AppointmentService')` → `it('should return 404 when appointment not found')`.

---

## Estilo visual

### Sistema de color (CSS custom properties)

```css
:root {
  /* Primario — azul psicología */
  --color-primary-50:  #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;

  /* Acento — teal bienestar */
  --color-accent-400:  #2dd4bf;
  --color-accent-500:  #14b8a6;

  /* Semánticos */
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-danger:  #ef4444;
  --color-info:    #06b6d4;

  /* Neutrales */
  --color-gray-50:  #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-500: #6b7280;
  --color-gray-900: #111827;

  /* Surface / Background */
  --color-surface:     #ffffff;
  --color-background:  #f0f4f8;
}
```

### Tipografía
- **Familia:** `Inter` (Google Fonts) — cuerpo y UI. `Fallback:` system-ui, sans-serif.
- **Escala:** Bootstrap 5 base (16px = 1rem). Títulos de sección: `1.5rem / 2rem`. Etiquetas de formulario: `0.875rem`.
- **Peso:** Regular (400) para cuerpo; Medium (500) para etiquetas; SemiBold (600) para títulos y botones principales.

### Layout y breakpoints
- **Mobile-first:** los componentes se diseñan para `< 576px` y se expanden con media queries.
- Breakpoints Bootstrap estándar: `sm ≥ 576`, `md ≥ 768`, `lg ≥ 992`, `xl ≥ 1200`.
- **Grid:** 12 columnas Bootstrap. Sidebar de navegación aparece a partir de `lg`.
- **Sidebar en desktop:** ancho fijo `240px`; contenido principal ocupa el resto con `flex-grow: 1`.
- **Navbar móvil:** offcanvas Bootstrap (deslizable desde la izquierda).
- Ningún componente debe usar `position: fixed` para contenido que no sea overlay/modal; el scroll principal es el del `<body>`.

### Componentes Bootstrap usados (y reglas de uso)
- `btn btn-primary` → acciones principales. `btn-outline-secondary` → acciones secundarias.
- `card` → contenedores de información. Siempre con `shadow-sm` y `border-0`.
- `badge` → estados de cita (`CONFIRMED → badge bg-success`, etc.).
- `modal` → confirmaciones destructivas y formularios rápidos.
- `offcanvas` → navegación móvil.
- `toast` → notificaciones no bloqueantes.

---

## Límites duros

- **No subir `.env*` al repositorio.** Variables de entorno sólo en `.env.example` con valores ficticios.
- **No almacenar archivos clínicos en el servidor de aplicación.** Siempre usar Cloudinary/S3; la BD sólo guarda la URL.
- **No usar `console.log` en producción.** Usar librería de logging estructurado (pino o winston).
- **No saltar las migraciones Prisma.** Nunca modificar la BD en producción directamente; todo cambio de esquema pasa por `prisma migrate deploy`.
- **No hacer fetch directo en componentes React.** Todo acceso a API pasa por el módulo `services/`.
- **No exponer el rol `ADMIN` al frontend** a través de rutas de API que no lo requieran estrictamente.
- **No reutilizar tokens de videollamada** entre sesiones distintas; cada sesión genera su propio token efímero.
