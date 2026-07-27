# 012 · Valor Agregado e Innovación — Plan

## Enfoque
Esta feature es una colección de 5 mejoras independientes (Epic) que agregan diferenciación al producto. La PWA es pura configuración de Vite. El matching y el predictor usan algoritmos clásicos y heurísticas, sin requerir machine learning complejo en la fase MVP.

## Implementación de Sub-features

### 1. Aplicación Móvil del Paciente (PWA)
- **Frontend**: Instalar y configurar `vite-plugin-pwa` en la app de React del portal del paciente. Generar un `manifest.json` válido (iconos, theme_color, display: standalone).
- Configurar el Service Worker para hacer caché (Estrategia *Network First* o *Stale-While-Revalidate*) de la ruta principal `/api/v1/patients/me/appointments` para que puedan ver su próxima cita incluso si se quedan sin red yendo al consultorio.
- Agregar componente `PwaInstallBanner` en el dashboard para invitar a la instalación.

### 2. Biblioteca Terapéutica
- **BD**: `LibraryItem` (id, organizationId, title, description, type, therapyType, fileUrl, tags, isPublic, createdBy, createdAt).
- **Backend API**: CRUD `/api/v1/library`.
- **Frontend**: `LibraryPage` con una grilla de tarjetas. Buscador por texto y barra lateral de filtros (Tipo de documento y Tipo de terapia). El psicólogo puede descargar o adjuntar a un paciente.

### 3. Modo Crisis
- **BD**: `CrisisConfig` (id, patientId, psychologistId, emergencyContacts jsonb, crisisProtocol text).
- **Backend**: GET de la config. POST `/api/v1/crisis/alert` (dispara email y/o SMS urgente al terapeuta con alta prioridad vía Twilio/Nodemailer).
- **Frontend**: Botón rojo permanente "🚨 Necesito ayuda ahora" en el navbar del portal del paciente. Abre un modal con el protocolo escrito por su psicólogo, botón para llamar contactos, y botón secundario "Avisar a mi terapeuta".

### 4. Predicción de Ausencias (No-Show)
- **Backend (Job)**: Job nocturno (Bull). Regla:
  1. Busca `Appointments` mañana.
  2. Para el paciente de esa cita, cuenta el total de citas pasadas y cuántas son estado `NO_SHOW` o cancelaciones tardías.
  3. Si la tasa es > 30% (y mínimo 3 citas registradas), etiqueta esta cita como *high-risk*.
  4. Crea jobs adicionales de recordatorio en Bull programados a las 8 horas y 2 horas antes de la sesión.
- **BD**: Se puede añadir un flag booleano `highRiskNoShow` a la tabla `Appointment` para visibilidad en el panel.

### 5. Matching Inteligente
- **Backend**: Endpoint público `POST /api/v1/public/match`. Recibe `{ motivo, disponibilidad, modalidad }`.
- **Algoritmo**:
  1. Filtrar terapeutas de la clínica base a `modalidad`.
  2. Filtrar por los que tienen slots libres en la `disponibilidad`.
  3. De la lista filtrada, hacer "match" de keywords del `motivo` contra las especialidades o etiquetas (`tags`) del terapeuta. Sumar puntos.
  4. Retornar top 3 terapeutas ordenados por puntaje.
- **Frontend**: Página pública de matching, tipo wizard/quiz paso a paso. Termina en una lista de terapeutas sugeridos con botón "Agendar ahora".

## Decisiones
- **Reglas basadas en heurísticas sobre ML (Predictor y Matching)**: Entrenar un modelo para el predictor requiere datos que la clínica no tendrá el día 1. Una regla matemática simple (tasa > 30%) proporciona el 80% del valor.
- **PWA sobre App Nativa**: Crear aplicaciones Swift/Kotlin incrementa masivamente el costo de mantenimiento. Una PWA bien hecha ofrece la experiencia "App-like" en home screen, offline mode y es 100% el mismo código base.

## Riesgos
- **Modo Crisis**: Responsabilidad civil. Si la plataforma falla al notificar al terapeuta durante una emergencia. Mitigación: El modal enfatizará que la plataforma NO reemplaza a los servicios de emergencia nacionales e instará (botón principal) a llamar al 123 / 106 / equivalente nacional.
