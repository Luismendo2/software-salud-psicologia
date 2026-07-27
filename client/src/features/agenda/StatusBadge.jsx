/* ==========================================================================
   StatusBadge — Firma visual del módulo de agenda
   
   Mapea el estado de una cita a una píldora de color y texto en español.
   Es la primera cosa que el ojo capta en el calendario:
   
     PENDING   → ámbar   (requiere atención)
     CONFIRMED → teal    (tranquilo, todo bien)
     COMPLETED → verde   (sesión terminada)
     CANCELLED → rojo    (problema)
     NO_SHOW   → gris    (ausencia)
   
   Se usa dentro del calendario, las tarjetas y el modal.
   ========================================================================== */

/**
 * Configuración de cada estado: clase CSS y etiqueta legible.
 * Centralizado aquí para que si el equipo cambia un color o un
 * nombre, se refleje en toda la UI automáticamente.
 */
const STATUS_CONFIG = {
  PENDING:   { className: 'badge-status--pending',   label: 'Pendiente' },
  CONFIRMED: { className: 'badge-status--confirmed', label: 'Confirmada' },
  COMPLETED: { className: 'badge-status--completed', label: 'Completada' },
  CANCELLED: { className: 'badge-status--cancelled', label: 'Cancelada' },
  NO_SHOW:   { className: 'badge-status--no-show',   label: 'No asistió' },
};

/**
 * @param {{ status: string }} props
 * @param {string} props.status - Uno de: PENDING, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW
 */
export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;

  return (
    <span className={`badge-status ${config.className}`}>
      {config.label}
    </span>
  );
}

/**
 * Exportamos la config para que CalendarView pueda asignar
 * clases CSS a los eventos de FullCalendar sin duplicar lógica.
 */
export { STATUS_CONFIG };
