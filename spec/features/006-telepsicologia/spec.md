# 006 · Telepsicología

| Campo       | Valor                               |
|-------------|-------------------------------------|
| **ID**      | 006                                 |
| **Nombre**  | Telepsicología                      |
| **Fase**    | 2                                   |
| **Estado**  | propuesta                           |
| **Módulos** | Citas, Videollamada, Consentimiento |
| **Roles**   | PSYCHOLOGIST, PATIENT, ADMIN        |

---

## Qué hace

La funcionalidad de Telepsicología integra videollamadas directamente dentro de PsiAgenda mediante el SDK de Daily.co, eliminando la necesidad de aplicaciones externas (Zoom, Google Meet, Teams). Permite que pacientes y psicólogos realicen sesiones de psicología virtual desde el propio navegador, sin instalaciones adicionales.

El flujo completo abarca:

1. Cuando una cita es de tipo `VIRTUAL` y su estado cambia a `CONFIRMED`, el sistema crea automáticamente una sala de videollamada en Daily.co y genera tokens de acceso únicos para el psicólogo y el paciente.
2. El paciente accede a una **sala de espera virtual** donde primero completa una verificación técnica de cámara, micrófono y conexión, y —si es su primera teleconsulta— firma el **consentimiento informado digital**.
3. La sesión de video no inicia hasta que el **psicólogo la habilite** explícitamente desde su vista de anfitrión.
4. Al finalizar, el psicólogo cierra la sesión; la sala expira y los tokens quedan invalidados.

---

## Por qué

- **Continuidad asistencial**: Pacientes en zonas remotas, con movilidad reducida o en situaciones de emergencia pueden acceder a atención sin desplazarse.
- **Diferenciador competitivo**: La integración nativa evita fricciones de plataformas externas y mantiene al paciente dentro del ecosistema seguro de PsiAgenda.
- **Cumplimiento normativo**: El consentimiento informado digital con registro de firma y versión del documento garantiza trazabilidad legal del acuerdo de atención virtual.
- **Seguridad clínica**: La sala de espera virtual impide que el paciente entre a la sesión sin que el terapeuta esté presente y listo.
- **Eficiencia operativa**: La verificación técnica previa a la sesión reduce el tiempo perdido en problemas de dispositivos durante la consulta.

---

## Criterios de aceptación

> Cada criterio es verificable de forma binaria (sí / no).

### Creación y configuración de sala

- **CA-01** · Cuando una cita cambia a estado `CONFIRMED` y su tipo es `VIRTUAL`, el sistema crea automáticamente una sala en Daily.co y almacena `dailyRoomName`, `dailyRoomUrl`, `psychologistToken` y `patientToken` en la tabla `VideoSession`. Si la cita es `PRESENCIAL`, no se crea ninguna sala.

- **CA-02** · El token del psicólogo se genera con `is_owner: true` y el del paciente con `is_owner: false`. Ambos tokens tienen fecha de expiración igual a `endTime` de la cita más 30 minutos de margen.

- **CA-03** · La sala de Daily.co se configura con `max_participants: 2` y `eject_at_room_exp: true`, de modo que los participantes son expulsados automáticamente cuando la sala expira.

- **CA-04** · Si la creación de la sala en Daily.co falla (error de red o API), el sistema registra el error en el log de auditoría (`AuditLog`) y reintenta hasta 3 veces con backoff exponencial antes de marcar la `VideoSession` con estado de error.

### Acceso del paciente y sala de espera

- **CA-05** · El paciente accede a la ruta `/session/{appointmentId}/waiting-room` usando su token. Si el token no corresponde a esa cita o ya expiró, el sistema muestra un mensaje de error claro y no permite el acceso.

- **CA-06** · En la sala de espera, el paciente ve un mensaje en pantalla: *"Tu terapeuta te atenderá en breve"* junto con el nombre del psicólogo y la hora programada de la cita. La pantalla se actualiza automáticamente cuando el psicólogo habilita la sesión (sin necesidad de recargar la página).

- **CA-07** · La sesión de video **no inicia** para el paciente hasta que el psicólogo ejecute la acción de inicio. El paciente no puede forzar la entrada a la sala activa por su cuenta.

### Verificación técnica de dispositivos

- **CA-08** · Antes de entrar a la sala de espera, el sistema ejecuta automáticamente una prueba de cámara y micrófono usando `navigator.mediaDevices.getUserMedia`. Si alguno de los dispositivos no está disponible o el usuario deniega los permisos, el sistema muestra instrucciones para resolverlo y no permite avanzar hasta que los dispositivos funcionen correctamente.

- **CA-09** · La verificación técnica muestra una vista previa de la cámara del paciente en tiempo real (espejo), confirma visualmente que el audio está activo mediante un indicador de nivel de volumen, y presenta el resultado como ✅ Cámara OK / ✅ Micrófono OK antes de continuar.

### Consentimiento informado digital

- **CA-10** · Si es la primera teleconsulta del paciente (no existe registro en `TeleConsent`), el sistema presenta el **modal de consentimiento informado** antes de permitir el acceso a la sala de espera. El paciente debe hacer clic en *"Acepto"* explícitamente; no puede omitir este paso.

- **CA-11** · Al aceptar, el sistema guarda en `TeleConsent`: `patientId`, `signedAt` (timestamp UTC), `version` del documento y `ipAddress` del cliente. En teleconsultas posteriores no se vuelve a mostrar el consentimiento, a menos que la versión del documento haya cambiado.

- **CA-12** · El psicólogo y el ADMIN pueden consultar el registro de consentimiento de cada paciente (fecha, versión, IP) desde el perfil del paciente.

### Vista del psicólogo (anfitrión)

- **CA-13** · El psicólogo accede a `/session/{appointmentId}/host` con su token. Ve la cuadrícula de participantes, y dispone de controles para: silenciar su micrófono, activar/desactivar su cámara, **iniciar sesión** y **finalizar sesión**.

- **CA-14** · Al hacer clic en *"Iniciar sesión"*, el sistema llama a `PUT /api/v1/sessions/:appointmentId/start`, cambia el estado de `VideoSession` a `ACTIVE` y registra `startedAt`. El paciente en sala de espera es admitido automáticamente a la llamada.

- **CA-15** · Al hacer clic en *"Finalizar sesión"*, el sistema llama a `PUT /api/v1/sessions/:appointmentId/end`, cambia el estado a `ENDED`, registra `endedAt` y expulsa a todos los participantes de la sala Daily.co. La cita asociada cambia a estado `COMPLETED`.

### Chat de texto (opcional)

- **CA-16** · Durante la videollamada activa, psicólogo y paciente pueden intercambiar mensajes de texto cortos usando el chat nativo de Daily.co (`sendAppMessage`). Los mensajes son visibles solo durante la sesión; no se persisten en base de datos.

### Seguridad y trazabilidad

- **CA-17** · Todos los tokens de Daily.co se almacenan cifrados en la base de datos. Los tokens no se exponen en los logs del servidor.

- **CA-18** · Cada acción relevante (creación de sala, inicio de sesión, fin de sesión, firma de consentimiento, error de dispositivo) queda registrada en `AuditLog` con `userId`, `action`, `resourceType: 'VideoSession'`, `resourceId` y `timestamp`.

---

## Fuera de alcance

- **Grabación de sesiones**: No se grabará el video ni el audio de las sesiones en esta fase. El almacenamiento y manejo de grabaciones clínicas requiere un análisis legal y de privacidad independiente.
- **Sesiones grupales**: La sala está configurada para máximo 2 participantes. Sesiones familiares o grupales no están contempladas en Fase 2.
- **Compartir pantalla**: No se implementa en esta fase.
- **Transcripción automática con IA**: La generación automática de notas de sesión a partir del audio pertenece a la Feature 008 (IA Clínica).
- **Llamadas de voz sin video**: Solo se soporta videollamada completa.
- **Aplicación móvil nativa**: El acceso es exclusivamente desde navegador web (Chrome, Firefox, Edge, Safari en versiones actuales).
- **Integración con Zoom, Google Meet u otras plataformas externas**: Deliberadamente excluido; PsiAgenda provee la infraestructura de video.
- **Soporte para Internet Explorer o navegadores sin soporte de WebRTC**: No se soportarán navegadores legados.
- **Cobro por minuto de videollamada**: La facturación se gestiona a nivel de cita, no de duración de video.
- **Mensajería asíncrona fuera de sesión**: El chat de texto dentro de la llamada es efímero. La mensajería entre sesiones pertenece a la Feature 007.
