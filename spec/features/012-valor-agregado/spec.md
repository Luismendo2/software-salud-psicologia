# 012 · Valor Agregado e Innovación

| Campo         | Valor                              |
|---------------|------------------------------------|
| **ID**        | 012                                |
| **Nombre**    | Valor Agregado e Innovación        |
| **Fase**      | 4                                  |
| **Estado**    | propuesta                          |
| **Fecha**     | 2026-06-30                         |
| **Depende de**| 001, 002, 003, 004, 005, 006, 009  |

---

## 1. Qué hace

Esta funcionalidad agrupa cinco mejoras independientes de alto impacto que elevan la experiencia del paciente y del profesional más allá de las operaciones básicas de la plataforma. Cada sub-funcionalidad puede ser desplegada de forma incremental.

### 1.1 Matching inteligente de terapeuta

Cuando un paciente (o visitante anónimo) busca un turno en la plataforma, el sistema sugiere automáticamente los tres terapeutas más adecuados para su caso. Para hacerlo, solicita el **motivo de consulta** en texto libre, la **disponibilidad horaria preferida** y la **modalidad** deseada (presencial o virtual). Con esa información filtra por disponibilidad real y calcula una puntuación de afinidad comparando las palabras clave del motivo con las especialidades y etiquetas declaradas por cada psicólogo, ordenando los resultados de mayor a menor relevancia.

El paciente ve tarjetas de resultado con foto, nombre, especialidades, próximo horario disponible y puntuación de afinidad expresada como porcentaje. Desde la tarjeta puede iniciar directamente el flujo de agendamiento de la Funcionalidad 002.

### 1.2 Predicción de ausencias (no-show)

El sistema analiza el historial de inasistencias de cada paciente y calcula un **índice de riesgo de no-show** almacenado en el perfil del paciente. Un trabajo programado nocturno revisa todas las citas del día siguiente; cuando el índice de un paciente supera el 30 % (calculado sobre sus últimas 10 citas), el sistema programa recordatorios adicionales a las **8 horas** y **2 horas** antes de la cita, además de los recordatorios estándar. El profesional también recibe una señal visual en la vista de agenda que indica el nivel de riesgo del paciente.

### 1.3 Modo crisis

El portal del paciente incluye un botón prominente **"Necesito ayuda ahora"** siempre visible en la cabecera. Al pulsarlo, se abre un modal de crisis que muestra:

- Los **pasos del protocolo de actuación** configurados por el psicólogo.
- Los **contactos de emergencia** definidos por el profesional para ese paciente.
- La **Línea 106** (línea nacional de atención a crisis emocional, Colombia).

Al mismo tiempo, el sistema envía automáticamente una notificación (correo electrónico + SMS) al psicólogo responsable del paciente registrando la fecha, hora e identidad del paciente que activó la alerta. El profesional puede configurar el protocolo y los contactos desde el módulo de historia clínica.

### 1.4 Biblioteca terapéutica

Espacio centralizado donde los profesionales de la organización acceden, suben y buscan materiales de apoyo clínico: plantillas de sesión, guías psicoeducativas, ejercicios y escalas validadas. Los ítems se clasifican por **tipo** (plantilla, guía, ejercicio, escala) y por **enfoque terapéutico** (TCC, sistémica, gestalt, infanto-juvenil, general). La búsqueda permite filtrar por texto libre, tipo y enfoque. Los materiales marcados como públicos son visibles para todos los psicólogos de la plataforma; los privados quedan restringidos a la organización que los subió.

### 1.5 Aplicación móvil del paciente (PWA)

El portal del paciente es configurado como una **Progressive Web App** para que los pacientes puedan instalarlo en su dispositivo móvil desde el navegador, sin pasar por tiendas de aplicaciones. Una vez instalada, la aplicación muestra un ícono en la pantalla de inicio, abre en modo pantalla completa sin barra del navegador y mantiene disponible offline el listado de las próximas citas ya descargadas. Un banner de instalación contextual aparece en la interfaz del portal cuando el navegador detecta que la app es instalable.

---

## 2. Por qué

| Motivación                              | Descripción                                                                                                                               |
|-----------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| **Reducir fricción en el primer contacto** | El matching inteligente elimina la duda de "¿a qué psicólogo me dirijo?" que frena a muchos pacientes potenciales.                      |
| **Disminuir inasistencias**              | Las ausencias son la principal fuente de pérdida de ingresos para consultorios. Un sistema de refuerzo predictivo reduce ese impacto.    |
| **Seguridad del paciente**               | El modo crisis provee una respuesta estructurada ante emergencias emocionales, cumpliendo el deber de cuidado del profesional.            |
| **Productividad clínica**                | La biblioteca terapéutica elimina la búsqueda manual de materiales y estandariza la práctica dentro de la organización.                   |
| **Acceso móvil sin barreras**            | Una PWA permite a pacientes con menos competencia digital instalar la app como si fuera nativa, mejorando la retención y el engagement.   |

---

## 3. Criterios de aceptación

> Los criterios están redactados como aserciones verificables (sí/no).

### Matching inteligente

| ID    | Criterio                                                                                                                                           |
|-------|----------------------------------------------------------------------------------------------------------------------------------------------------|
| CA-01 | Al enviar el formulario de matching con motivo, disponibilidad y modalidad, el sistema retorna entre 1 y 3 terapeutas ordenados por puntuación.    |
| CA-02 | Si ningún terapeuta supera una puntuación de afinidad mayor a 0, el sistema retorna la lista ordenada únicamente por disponibilidad.               |
| CA-03 | Solo se incluyen en los resultados terapeutas con al menos un horario libre dentro del rango de disponibilidad indicado por el usuario.            |
| CA-04 | La tarjeta de resultado muestra nombre, foto (o avatar por defecto), especialidades, próximo slot disponible y porcentaje de afinidad.             |
| CA-05 | Desde la tarjeta de resultado el usuario puede iniciar el flujo de agendamiento estándar (Feature 002) con el terapeuta preseleccionado.           |

### Predicción de ausencias

| ID    | Criterio                                                                                                                                           |
|-------|----------------------------------------------------------------------------------------------------------------------------------------------------|
| CA-06 | El trabajo nocturno actualiza el campo `noShowScore` de todos los pacientes con al menos 1 cita en los últimos 60 días.                            |
| CA-07 | Para pacientes con `noShowScore > 30 %`, el sistema encola recordatorios adicionales a 8 h y 2 h antes de cada cita programada el día siguiente.  |
| CA-08 | Los recordatorios adicionales no se duplican si el trabajo se ejecuta más de una vez en el mismo ciclo nocturno.                                   |
| CA-09 | La vista de agenda del psicólogo muestra un indicador de riesgo (bajo/medio/alto) junto al nombre del paciente en cada cita del día.              |

### Modo crisis

| ID    | Criterio                                                                                                                                           |
|-------|----------------------------------------------------------------------------------------------------------------------------------------------------|
| CA-10 | El botón "Necesito ayuda ahora" es visible en todas las páginas del portal del paciente sin necesidad de hacer scroll.                             |
| CA-11 | Al pulsar el botón, el modal de crisis se abre en menos de 500 ms y muestra protocolo, contactos de emergencia y la Línea 106.                    |
| CA-12 | Al activar una alerta de crisis, se crea un registro `CrisisAlert` en base de datos con `patientId`, `triggeredAt` e `ip`.                        |
| CA-13 | El sistema envía correo y SMS al psicólogo responsable en menos de 60 s tras la activación de la alerta.                                          |
| CA-14 | El psicólogo puede crear, editar y eliminar la `CrisisConfig` de un paciente (protocolo + contactos) desde el módulo de historia clínica.          |

### Biblioteca terapéutica

| ID    | Criterio                                                                                                                                           |
|-------|----------------------------------------------------------------------------------------------------------------------------------------------------|
| CA-15 | Un psicólogo o administrador puede subir un material indicando título, descripción, tipo, enfoque terapéutico y archivo (PDF/DOCX/MP4 ≤ 50 MB).   |
| CA-16 | El listado de materiales puede filtrarse por tipo, enfoque terapéutico y búsqueda por texto libre de forma simultánea.                             |
| CA-17 | Los materiales marcados como `isPublic = false` solo son visibles para usuarios de la misma organización que los creó.                             |
| CA-18 | Al hacer clic en un ítem, el usuario puede descargar el archivo o previsualizarlo (PDF inline, resto como descarga directa).                       |

### PWA del paciente

| ID    | Criterio                                                                                                                                           |
|-------|----------------------------------------------------------------------------------------------------------------------------------------------------|
| CA-19 | El portal del paciente obtiene puntuación ≥ 90 en la auditoría PWA de Lighthouse (installable + offline ready).                                   |
| CA-20 | Un banner de instalación aparece automáticamente en el portal cuando el navegador dispara el evento `beforeinstallprompt`.                         |
| CA-21 | Con la app instalada y sin conexión a internet, el paciente puede ver el listado de sus próximas citas (datos de la última sincronización).        |
| CA-22 | La app instalada abre en modo `standalone` (sin barra de navegador) con el ícono y colores de marca definidos en el manifest.                     |

---

## 4. Fuera de alcance

- **Motor de ML real**: el matching inteligente y la predicción de no-show usan heurísticas basadas en palabras clave y umbrales fijos, no modelos de aprendizaje automático entrenados.
- **Notificaciones push nativas en PWA**: la PWA no implementa Web Push Notifications en esta fase; los recordatorios continúan por correo y SMS.
- **Teleconsulta desde la PWA**: las sesiones de video se abren en el navegador del sistema; no hay integración del SDK de Daily.co dentro del service worker.
- **Videollamadas offline**: el modo offline de la PWA cubre únicamente la consulta de citas, no la realización de sesiones.
- **Módulo de análisis de crisis**: no se generan reportes ni estadísticas de alertas de crisis en esta fase.
- **Algoritmo de scoring con datos externos**: la puntuación de matching no consume APIs externas de perfiles psicológicos ni bases de datos de diagnósticos.
- **Publicación en Google Play / App Store**: la distribución se realiza exclusivamente como PWA instalable desde el navegador.
- **Editor de materiales en línea**: la biblioteca permite subir y descargar archivos, pero no editar documentos directamente en la plataforma.
- **Compartir materiales entre organizaciones**: los ítems públicos son visibles para toda la plataforma en lectura, pero la gestión de permisos inter-organización queda fuera de esta fase.
