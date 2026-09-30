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

import { useRef, useState, useEffect } from 'react';
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
  const calendarRef = useRef(null);
  const containerRef = useRef(null);

  const [currentView, setCurrentView] = useState(
    window.innerWidth < 768 ? 'timeGridDay' : 'timeGridWeek'
  );

  const isMultiDay = currentView === 'timeGridWeek' || currentView === 'dayGridMonth';

  // Auto-scroll a la columna de hoy cuando se activa la vista semanal en móviles
  const handleDatesSet = (arg) => {
    setCurrentView(arg.view.type);

    if (arg.view.type === 'timeGridWeek' && window.innerWidth < 992) {
      setTimeout(() => {
        const harness = containerRef.current?.querySelector('.fc-view-harness');
        const todayCol = containerRef.current?.querySelector('.fc-day-today');
        if (harness && todayCol) {
          const colLeft = todayCol.offsetLeft;
          const harnessWidth = harness.clientWidth;
          harness.scrollTo({
            left: Math.max(0, colLeft - harnessWidth / 2 + 50),
            behavior: 'smooth',
          });
        }
      }, 150);
    }
  };

  // ── Desplazamiento táctil y arrastre con ratón (Drag-to-Scroll) ──
  useEffect(() => {
    const harness = containerRef.current?.querySelector('.fc-view-harness');
    if (!harness || !isMultiDay) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let hasMoved = false;

    const handleMouseDown = (e) => {
      // Ignorar clics con botón derecho o elementos interactivos como botones o links
      if (e.button !== 0) return;
      if (e.target.closest('button, .fc-button, a, input, select, textarea')) return;

      isDown = true;
      hasMoved = false;
      startX = e.pageX - harness.offsetLeft;
      scrollLeft = harness.scrollLeft;
      harness.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e) => {
      if (!isDown) return;
      const x = e.pageX - harness.offsetLeft;
      const walk = (x - startX);

      // Umbral mínimo para diferenciar un clic simple de un arrastre deliberado
      if (Math.abs(walk) > 4) {
        hasMoved = true;
        harness.scrollLeft = scrollLeft - walk;
      }
    };

    const handleMouseUp = () => {
      if (!isDown) return;
      isDown = false;
      harness.style.cursor = 'grab';

      // Si fue un arrastre, cancelar el clic para no abrir modales por error
      if (hasMoved) {
        const preventClick = (ev) => {
          ev.stopPropagation();
          ev.preventDefault();
          window.removeEventListener('click', preventClick, true);
        };
        window.addEventListener('click', preventClick, true);
        setTimeout(() => {
          window.removeEventListener('click', preventClick, true);
        }, 80);
      }
    };

    harness.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      harness.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isMultiDay, currentView]);

  return (
    <div
      ref={containerRef}
      className={`calendar-responsive-wrapper ${isMultiDay ? 'is-multiday' : 'is-single-day'} view-${currentView}`}
    >
      {/* ── Indicador de desplazamiento horizontal en móviles ── */}
      {isMultiDay && (
        <div className="calendar-swipe-hint">
          <span className="calendar-swipe-hint-icon">↔</span>
          <span>
            Desliza horizontalmente para ver {currentView === 'dayGridMonth' ? 'el mes' : 'la semana'}
          </span>
        </div>
      )}

      <FullCalendar
        ref={calendarRef}
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
        dayMaxEvents={3}
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
        datesSet={handleDatesSet}
        dateClick={(info) => {
          onDateClick?.(info.dateStr);
        }}
        eventClick={(info) => {
          info.jsEvent.preventDefault();
          onEventClick?.(info.event.extendedProps);
        }}
      />
    </div>
  );
}
