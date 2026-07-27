/* ==========================================================================
   CalendarView — Wrapper de FullCalendar
   
   Componente que configura FullCalendar con las vistas de mes, semana
   y día. Transforma las citas del formato de PsiAgenda al formato
   de eventos que FullCalendar espera.
   
   Responsabilidades:
   - Transformar appointments[] → FullCalendar events[]
   - Asignar clases CSS por estado (para los colores)
   - Emitir eventos al padre: click en slot vacío, click en evento
   - Localización en español
   ========================================================================== */

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

/**
 * Transforma una cita del modelo PsiAgenda al formato de evento
 * de FullCalendar. Asigna una className según el estado para que
 * los colores definidos en global.css se apliquen.
 * 
 * @param {Object} apt - Cita con campos de PsiAgenda
 * @returns {Object} Evento para FullCalendar
 */
function toCalendarEvent(apt) {
  return {
    id: apt.id,
    title: apt.patientName,
    start: apt.startTime,
    end: apt.endTime,
    className: `fc-event--${apt.status.toLowerCase().replace('_', '-')}`,
    extendedProps: {
      ...apt,
    },
  };
}

/**
 * Textos en español para la toolbar y los encabezados.
 * FullCalendar usa un sistema de "locales" pero para mantener
 * el control total, los definimos manualmente.
 */
const SPANISH_BUTTON_TEXT = {
  today: 'Hoy',
  month: 'Mes',
  week: 'Semana',
  day: 'Día',
};

/**
 * @param {Object} props
 * @param {Array} props.appointments - Lista de citas del servicio
 * @param {Function} props.onDateClick - Click en slot vacío (crear cita)
 * @param {Function} props.onEventClick - Click en cita existente (editar)
 */
export default function CalendarView({ appointments, onDateClick, onEventClick }) {
  const events = appointments.map(toCalendarEvent);

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}

      /* ── Vista inicial y opciones de toolbar ── */
      initialView={window.innerWidth < 768 ? 'timeGridDay' : 'timeGridWeek'}
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      }}
      buttonText={SPANISH_BUTTON_TEXT}

      /* ── Configuración visual ── */
      locale="es"
      firstDay={1}
      height="auto"
      allDaySlot={false}
      slotMinTime="07:00:00"
      slotMaxTime="20:00:00"
      slotLabelFormat={{
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }}
      dayHeaderFormat={{
        weekday: 'short',
        day: 'numeric',
      }}
      nowIndicator={true}
      weekends={true}

      /* ── Datos ── */
      events={events}

      /* ── Interacciones ── */
      selectable={true}
      editable={false}
      dateClick={(info) => {
        onDateClick?.(info.dateStr);
      }}
      eventClick={(info) => {
        info.jsEvent.preventDefault();
        onEventClick?.(info.event.extendedProps);
      }}
    />
  );
}
