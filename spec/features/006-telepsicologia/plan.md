# 006 · Telepsicología — Plan

| Campo          | Valor                                       |
|----------------|---------------------------------------------|
| **Fase**       | 2                                           |
| **Depende de** | 001 (Autenticación), 002 (Citas), 003 (Pacientes) |
| **Servicios externos** | Daily.co API                       |
| **Stack nuevo** | `@daily-co/daily-js`, `@daily-co/react-daily` |

---

## Enfoque

La integración se basa en el SDK oficial de Daily.co para React (`@daily-co/react-daily`), que envuelve la lógica WebRTC en hooks reutilizables. El backend actúa como intermediario seguro: nunca se expone la API key de Daily.co al frontend. Todos los tokens y URLs de sala se solicitan a través de los endpoints de PsiAgenda.

El modelo de seguridad sigue el principio de **sala por cita**: cada `Appointment` de tipo `VIRTUAL` tiene exactamente una `VideoSession` asociada con tokens distintos para psicólogo y paciente. Los tokens expiran al terminar la cita; la sala es destruida por Daily.co automáticamente (`eject_at_room_exp: true`).

---

## Implementación

### 1. Modelo de base de datos

#### Tabla `VideoSession`

```sql
CREATE TABLE "VideoSession" (
  "id"                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "appointmentId"     UUID NOT NULL UNIQUE REFERENCES "Appointment"("id") ON DELETE CASCADE,
  "dailyRoomName"     TEXT NOT NULL,
  "dailyRoomUrl"      TEXT NOT NULL,
  "psychologistToken" TEXT NOT NULL,   -- cifrado con AES-256-GCM en reposo
  "patientToken"      TEXT NOT NULL,   -- cifrado con AES-256-GCM en reposo
  "status"            TEXT NOT NULL DEFAULT 'WAITING',
                        -- WAITING | ACTIVE | ENDED | ERROR
  "startedAt"         TIMESTAMPTZ,
  "endedAt"           TIMESTAMPTZ,
  "createdAt"         TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX "VideoSession_appointmentId_idx" ON "VideoSession"("appointmentId");
CREATE INDEX "VideoSession_status_idx" ON "VideoSession"("status");
```

> **Decisión**: `appointmentId` es `UNIQUE` (1-a-1 con Appointment). Si la sala debe recrearse (ej. el psicólogo cancela y reagenda), se actualiza el registro existente, no se crea uno nuevo.

#### Tabla `TeleConsent`

```sql
CREATE TABLE "TeleConsent" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "patientId"   UUID NOT NULL REFERENCES "Patient"("id") ON DELETE CASCADE,
  "signedAt"    TIMESTAMPTZ NOT NULL DEFAULT now(),
  "version"     TEXT NOT NULL,   -- ej. "1.0", "1.1"
  "ipAddress"   INET NOT NULL,
  "userAgent"   TEXT,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX "TeleConsent_patientId_idx" ON "TeleConsent"("patientId");
```

> **Decisión**: Se guarda `userAgent` para mayor trazabilidad legal. La versión activa del documento de consentimiento se configura en una variable de entorno `TELECONSENT_VERSION`.

#### Cambio en `Appointment`

No se requieren columnas adicionales. La relación con `VideoSession` es por `appointmentId`.

#### Prisma Schema (fragmento)

```prisma
model VideoSession {
  id                String      @id @default(uuid())
  appointmentId     String      @unique
  dailyRoomName     String
  dailyRoomUrl      String
  psychologistToken String
  patientToken      String
  status            VideoSessionStatus @default(WAITING)
  startedAt         DateTime?
  endedAt           DateTime?
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  appointment       Appointment @relation(fields: [appointmentId], references: [id], onDelete: Cascade)
}

enum VideoSessionStatus {
  WAITING
  ACTIVE
  ENDED
  ERROR
}

model TeleConsent {
  id        String   @id @default(uuid())
  patientId String
  signedAt  DateTime @default(now())
  version   String
  ipAddress String
  userAgent String?
  createdAt DateTime @default(now())
  patient   Patient  @relation(fields: [patientId], references: [id], onDelete: Cascade)

  @@index([patientId])
}
```

---

### 2. Flujo de Daily.co

```
Cita confirmada (VIRTUAL)
        │
        ▼
[Backend] POST https://api.daily.co/v1/rooms
  body: {
    name: "psiagenda-{appointmentId}",
    properties: {
      exp: <endTime + 30min en Unix>,
      eject_at_room_exp: true,
      max_participants: 2,
      enable_chat: true,
      enable_screenshare: false,
      start_video_off: false,
      start_audio_off: false
    }
  }
  → { name, url }
        │
        ▼
[Backend] POST https://api.daily.co/v1/meeting-tokens  (×2)
  Psicólogo: { room_name, is_owner: true,  exp, user_name: "Dr. {nombre}" }
  Paciente:  { room_name, is_owner: false, exp, user_name: "{nombre paciente}" }
  → { token }
        │
        ▼
[Backend] Almacena VideoSession (status: WAITING, tokens cifrados)
        │
        ▼
[Notificación] Email/WhatsApp al paciente con enlace:
  /session/{appointmentId}/waiting-room
```

#### Inicio de sesión (psicólogo hace clic en "Iniciar sesión")

```
PUT /api/v1/sessions/:appointmentId/start
        │
        ▼
[Backend] VideoSession.status = ACTIVE, startedAt = now()
        │
        ▼
[Backend] Emite evento WebSocket / polling al frontend del paciente
        │
        ▼
[Frontend paciente] WaitingRoomPage detecta status = ACTIVE
  → llama callObject.join({ url, token: patientToken })
```

#### Fin de sesión (psicólogo hace clic en "Finalizar sesión")

```
PUT /api/v1/sessions/:appointmentId/end
        │
        ▼
[Backend] VideoSession.status = ENDED, endedAt = now()
[Backend] Appointment.status = COMPLETED
[Backend] DELETE https://api.daily.co/v1/rooms/{roomName}  (limpieza inmediata)
        │
        ▼
[Frontend] callObject.destroy()  →  ambos participantes son desconectados
```

---

### 3. Contratos de API

Todas las rutas requieren `authenticate`. Las autorizaciones por rol se especifican por ruta.

#### `POST /api/v1/sessions/:appointmentId/room`

Crea la sala Daily.co y la `VideoSession`. Invocado automáticamente por el backend cuando la cita cambia a `CONFIRMED`; también puede invocarse manualmente por un `ADMIN`.

| Campo       | Detalle                                                        |
|-------------|----------------------------------------------------------------|
| **Auth**    | `PSYCHOLOGIST`, `ADMIN`                                        |
| **Params**  | `appointmentId` (UUID)                                         |
| **Body**    | _(vacío)_                                                      |
| **Success** | `201` `{ success: true, data: { videoSessionId, dailyRoomUrl } }` |
| **Errores** | `404` cita no encontrada · `409` sala ya existe · `400` cita no es VIRTUAL · `502` error Daily.co API |

**Validación Zod** (params):
```ts
z.object({ appointmentId: z.string().uuid() })
```

---

#### `GET /api/v1/sessions/:appointmentId/token?role=psychologist|patient`

Retorna el token Daily.co correspondiente al rol. El backend valida que el usuario autenticado sea efectivamente el psicólogo o el paciente de esa cita.

| Campo       | Detalle                                                                  |
|-------------|--------------------------------------------------------------------------|
| **Auth**    | `PSYCHOLOGIST` (role=psychologist) · `PATIENT` (role=patient)            |
| **Query**   | `role: 'psychologist' \| 'patient'`                                      |
| **Success** | `200` `{ success: true, data: { token, dailyRoomUrl, sessionStatus } }`  |
| **Errores** | `403` rol no coincide con usuario · `404` VideoSession no encontrada · `410` token expirado |

---

#### `PUT /api/v1/sessions/:appointmentId/start`

| Campo       | Detalle                                                           |
|-------------|-------------------------------------------------------------------|
| **Auth**    | `PSYCHOLOGIST`                                                    |
| **Validación** | `VideoSession.status === 'WAITING'`                            |
| **Success** | `200` `{ success: true, data: { startedAt } }`                    |
| **Errores** | `409` sesión ya activa o finalizada · `403` psicólogo no es el dueño de la cita |

---

#### `PUT /api/v1/sessions/:appointmentId/end`

| Campo       | Detalle                                                           |
|-------------|-------------------------------------------------------------------|
| **Auth**    | `PSYCHOLOGIST`, `ADMIN`                                           |
| **Efecto**  | `VideoSession.status = ENDED`, `Appointment.status = COMPLETED`, elimina sala en Daily.co |
| **Success** | `200` `{ success: true, data: { endedAt } }`                      |
| **Errores** | `409` sesión ya finalizada                                        |

---

#### `POST /api/v1/sessions/:appointmentId/consent`

Registra la aceptación del consentimiento informado.

| Campo       | Detalle                                                               |
|-------------|-----------------------------------------------------------------------|
| **Auth**    | `PATIENT`                                                             |
| **Body**    | `{ version: string }`                                                 |
| **Efecto**  | Crea registro en `TeleConsent` con IP y userAgent del request         |
| **Success** | `201` `{ success: true, data: { consentId, signedAt } }`              |
| **Errores** | `409` consentimiento ya firmado para esta versión                     |

**Validación Zod**:
```ts
z.object({ version: z.string().min(1).max(10) })
```

---

#### `GET /api/v1/sessions/:appointmentId/status`

Polling ligero para que el frontend del paciente detecte cambios de estado.

| Campo       | Detalle                                                              |
|-------------|----------------------------------------------------------------------|
| **Auth**    | `PATIENT`, `PSYCHOLOGIST`                                            |
| **Success** | `200` `{ success: true, data: { status, startedAt, endedAt } }`      |

> **Nota técnica**: Se implementa con polling cada 3 segundos desde el frontend. WebSockets (Socket.io) puede considerarse en una iteración posterior si el polling resulta insuficiente en carga.

---

### 4. Jerarquía de componentes React

```
/session/:appointmentId/waiting-room
└── WaitingRoomPage
    ├── TeleConsentModal          (si !hasConsent)
    │   └── ConsentDocument       (texto del documento)
    ├── DeviceCheckModal          (si !deviceCheckPassed)
    │   ├── CameraPreview         (video mirror)
    │   └── MicLevelIndicator     (analizador Web Audio API)
    └── WaitingScreen             (cuando dispositivos OK y consentimiento firmado)
        └── SessionStatusPoller   (polling GET /status cada 3s)

/session/:appointmentId/host
└── VideoSessionPage              (anfitrión - psicólogo)
    ├── DailyProvider             (@daily-co/react-daily)
    │   ├── ParticipantGrid
    │   │   ├── LocalVideoTile    (useLocalParticipant)
    │   │   └── RemoteVideoTile   (useParticipants)
    │   ├── VideoControls
    │   │   ├── MuteButton
    │   │   ├── CameraToggleButton
    │   │   ├── StartSessionButton  (PUT /start)
    │   │   ├── EndSessionButton    (PUT /end)
    │   │   └── ChatToggleButton
    │   └── ChatPanel             (sendAppMessage / useDailyEvent 'app-message')
    └── SessionInfoBar            (nombre paciente, hora inicio, duración)
```

> **Nota**: El paciente también usa `DailyProvider` después de ser admitido, pero con una disposición simplificada (una sola vista del psicólogo + sus propios controles básicos sin botón de finalizar).

#### Hooks de Daily.co utilizados

| Hook                  | Uso                                                          |
|-----------------------|--------------------------------------------------------------|
| `useDaily()`          | Acceso al objeto `callObject` para join/leave/destroy        |
| `useDailyEvent()`     | Escuchar eventos: `joined-meeting`, `participant-updated`, `app-message`, `error` |
| `useParticipants()`   | Lista de participantes remotos para renderizar video tiles   |
| `useLocalParticipant()` | Estado del participante local (muted, cam off, etc.)       |

---

### 5. Verificación técnica de dispositivos

El componente `DeviceCheckModal` usa la API estándar del navegador:

```
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  → stream obtenido  →  CameraPreview renderiza <video srcObject={stream}>
                    →  MicLevelIndicator usa AudioContext + AnalyserNode
  → error 'NotAllowedError'  →  Muestra instrucciones para otorgar permisos
  → error 'NotFoundError'    →  Muestra instrucciones de hardware
```

El resultado se almacena en estado local (`deviceCheckPassed: boolean`). No hay llamada al backend para este paso; es 100% cliente.

---

### 6. Consentimiento informado — Flujo de versiones

```
TELECONSENT_VERSION = "1.0"  (variable de entorno)
        │
        ▼
GET /api/v1/sessions/:appointmentId/token?role=patient
  backend verifica: ¿existe TeleConsent con patientId Y version="1.0"?
  → No  →  responde { ..., requiresConsent: true, consentVersion: "1.0" }
  → Sí  →  responde { ..., requiresConsent: false }
        │
        ▼
Frontend: si requiresConsent=true, muestra TeleConsentModal
  Usuario acepta → POST /consent { version: "1.0" }
  → Registrado → continúa al DeviceCheckModal
```

---

### 7. Variables de entorno requeridas

| Variable                   | Descripción                                           |
|----------------------------|-------------------------------------------------------|
| `DAILY_API_KEY`            | API key privada de Daily.co (nunca al frontend)       |
| `DAILY_API_URL`            | `https://api.daily.co/v1` (configurable para tests)  |
| `TELECONSENT_VERSION`      | Versión activa del documento de consentimiento (`"1.0"`) |
| `TOKEN_ENCRYPTION_SECRET`  | Secreto AES-256 para cifrar tokens en BD              |

---

## Decisiones

| # | Decisión | Alternativas descartadas | Razón |
|---|----------|--------------------------|-------|
| D-01 | Usar Daily.co SDK (`@daily-co/react-daily`) | WebRTC nativo desde cero; Twilio Video; Zoom Video SDK | Daily.co ofrece infraestructura TURN/STUN gestionada, tokens con expiración, salas con configuración declarativa y hooks React listos. Implementar WebRTC nativo requeriría meses adicionales. Twilio Video tiene API más compleja. Zoom SDK es propietario y costoso por licencia. |
| D-02 | Sala creada automáticamente al confirmar cita | Crear sala al hacer clic en "entrar" | El psicólogo necesita el enlace con antelación; el sistema puede notificar al paciente inmediatamente tras la confirmación. Evita latencia al inicio de sesión. |
| D-03 | Polling cada 3s para detección de inicio | WebSockets (Socket.io) | Simplicidad de implementación en Fase 2. El polling de 3 segundos es aceptable para la UX de sala de espera. Se puede migrar a WS en Fase 3. |
| D-04 | Tokens almacenados cifrados en BD | Regenerar token en cada petición GET | Regenerar tokens requeriría llamadas adicionales a Daily.co API por cada acceso. Almacenar cifrado en BD es más eficiente y permite auditoría. |
| D-05 | Consentimiento por versión de documento | Consentimiento por sesión (cada vez) | Pedir consentimiento en cada sesión es redundante y deteriora la UX. Por versión garantiza que el paciente acepta cambios relevantes en las condiciones del servicio. |
| D-06 | Máximo 2 participantes por sala | Sin límite | El contexto clínico individual requiere privacidad absoluta. Sesiones grupales son un requisito diferente que se evaluará en una fase futura. |

---

## Riesgos

| # | Riesgo | Probabilidad | Impacto | Mitigación |
|---|--------|-------------|---------|------------|
| R-01 | Caída de Daily.co API durante creación de sala | Baja | Alto | Reintentos con backoff exponencial (3 intentos); fallback: notificar al psicólogo para crear sala manualmente y proporcionar enlace externo como contingencia. |
| R-02 | Navegador del paciente sin soporte WebRTC (Safari < 14, browsers corporativos bloqueados) | Media | Medio | `DeviceCheckModal` detecta fallo de `getUserMedia` y muestra mensaje de error con lista de navegadores soportados antes de intentar conectar. |
| R-03 | Paciente sin cámara ni micrófono (solo teléfono sin permisos) | Media | Medio | La verificación técnica guía al usuario paso a paso. Se puede ofrecer asistencia técnica vía WhatsApp desde la pantalla de error. |
| R-04 | Aumento de costos de Daily.co por alto volumen de sesiones | Baja | Medio | Monitorear usage mensual en el dashboard de Daily.co; negociar plan enterprise si se supera el volumen del plan actual. |
| R-05 | Fuga del token Daily.co desde el frontend | Muy baja | Alto | Los tokens son de corta duración (expiran con la cita). No se loguean. Se almacenan cifrados. El frontend solo los usa en memoria para `callObject.join()`. |
| R-06 | Problema legal con consentimiento informado electrónico | Baja | Alto | El documento de consentimiento debe ser revisado por asesor legal antes del lanzamiento. Se registra IP + timestamp + versión como evidencia. |
