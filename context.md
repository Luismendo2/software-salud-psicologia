# Contexto del Proyecto: PsiAgenda

Este documento sirve como registro de memoria y estado actual del proyecto para mantener el hilo del desarrollo.

## 🛠️ Stack Tecnológico Actual
- **Frontend**: React 18, Vite, React Router DOM, CSS nativo (CSS Variables, Design Tokens).
- **Librerías UI**: FullCalendar (con plugins de timeGrid, dayGrid, interaction), Bootstrap (para utilidades de layout flex y grid), React Hook Form.
- **Backend (Planeado)**: Node.js, Express, Prisma ORM, MySQL 8.
- **Guía de Diseño**: Se aplica la skill `frontend-design` de Anthropics, la cual prioriza alta legibilidad, estética premium, micro-interacciones y layouts pulidos sin depender de Tailwind.

## 🎯 Progreso: Feature 001 - Gestión de Agenda y Citas

### ✅ Lo que hemos completado (Frontend)
Hemos construido toda la arquitectura visual e interactiva del módulo de citas y del portal del paciente utilizando datos "Mock":

1. **Sistema de Diseño (Core)**:
   - Creación de `variables.css` con la paleta de colores.
   - Creación de `global.css` y `portal.css` para estilos base y específicos.
   - Layouts maestros: `AppLayout` (Psicólogo) y `PatientPortalLayout` (Paciente).

2. **Calendario y Agenda (Psicólogo)**:
   - Integración de `FullCalendar`.
   - Modales interactivos, vistas responsive, configuración de horarios (`AvailabilitySettingsPage`) y reglas de disponibilidad.

3. **Portal del Paciente**:
   - `PatientDashboard`: Panel con la próxima cita y alertas (formularios/consentimientos).
   - `IntakeFormPage`: Formulario de anamnesis multi-paso.
   - `ConsentSignPage`: Firma digital de consentimientos usando HTML5 Canvas.
   - `AppointmentHistoryPage`: Historial y próximas citas.
   - `InvoiceListPage` & `PaymentPage`: Gestión de pagos y simulación de integración con Wompi.

## Pasos actuales
- [x] Construcción del layout base (Sidebar, MobileNav).
- [x] Desarrollo de **001-agenda** (Página pública y privada).
- [x] Desarrollo de **002-portal-paciente** (Dashboard, formularios, firma digital, pagos).
- [x] Desarrollo del front-end de **003-historia-clinica** (Notas enriquecidas, Archivos, Genograma).
- [x] Desarrollo del front-end de **004-seguridad-privacidad** (Login, Roles, Configuración de Cuenta, Auditoría).
- [x] Desarrollo del front-end de **005-facturacion-pagos** (Listado, Modal de creación, Detalle de factura, Reportes Financieros, Mocks y Servicios).
- [x] Desarrollo del front-end de **006-telepsicologia** (Videollamadas, chat en vivo, sala de espera virtual).
- [x] Desarrollo del front-end de **007-evaluaciones-mbc** (Cuestionarios, gráficas de progreso, panel de paciente y psicólogo).
- [x] Desarrollo del front-end de **008-comunicacion-seguimiento** (Mensajería segura, tareas, encuestas NPS).
- [x] Desarrollo del front-end de **009-equipo-supervision** (Gestión de equipo clínico, supervisión de casos).
- [x] Desarrollo del front-end de **010-reportes-estadisticas** (Métricas operativas y clínicas).
- [ ] Desarrollo del front-end de **011-ia-clinica** (Asistente de IA para redacción y análisis).
- [ ] Desarrollo del front-end de **012-valor-agregado** (Ej. Recursos psicoeducativos).

## Siguiente paso recomendado
De acuerdo a tu directriz de **terminar primero todo el front-end antes de iniciar con bases de datos y backend**, el siguiente paso es continuar con la maquetación y desarrollo UI de los módulos faltantes:

1. Iniciar el desarrollo del front-end de **011-ia-clinica**.


## 📝 Notas importantes (Reglas)
- No subir archivos `.env*`.
- Toda entrada debe ser validada con Zod en el backend.
- Una sola tarea a la vez, asegurando calidad antes de pasar a la siguiente.
- Mantener la estética "distintiva" y responsiva en todo momento.
