/* ==========================================================================
   AppointmentCard — Tarjeta de resumen de cita
   
   Se usa en la vista de lista lateral de la AgendaPage.
   Muestra el nombre del paciente, la hora, el tipo de sesión
   (presencial/virtual) y el badge de estado.
   ========================================================================== */

import StatusBadge from './StatusBadge';
import NoShowRiskBadge from './NoShowRiskBadge';

/**
 * Formatea una fecha ISO a hora local legible (ej. "9:00 a. m.")
 * @param {string} isoString - Fecha en formato ISO 8601
 * @returns {string} Hora formateada
 */
function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * @param {Object} props
 * @param {Object} props.appointment - Datos de la cita
 * @param {Function} props.onClick - Callback al hacer clic en la tarjeta
 */
export default function AppointmentCard({ appointment, onClick }) {
  const { patientName, startTime, endTime, type, status, notes } = appointment;

  return (
    <div
      className="card mb-2"
      onClick={() => onClick?.(appointment)}
      style={{ cursor: 'pointer' }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.(appointment)}
    >
      <div className="card-body py-2 px-3">
        {/* ── Fila superior: Hora + Estado ── */}
        <div className="d-flex align-items-center justify-content-between mb-1 gap-2">
          <span style={{
            fontSize: '0.8125rem',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-primary-700, #1d4ed8)',
            whiteSpace: 'nowrap',
          }}>
            🕒 {formatTime(startTime)} – {formatTime(endTime)}
          </span>
          <StatusBadge status={status} />
        </div>

        {/* ── Fila media: Nombre del paciente + Tipo de sesión ── */}
        <div className="d-flex align-items-center justify-content-between gap-2 mb-1">
          <span style={{
            fontSize: '0.875rem',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-gray-900)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }} title={patientName}>
            {patientName}
          </span>
          <span className={`badge-type badge-type--${type.toLowerCase()}`} style={{ flexShrink: 0 }}>
            {type === 'VIRTUAL' ? '💻 Virtual' : '🏥 Presencial'}
          </span>
        </div>

        {/* ── Indicador de riesgo No-Show (si existe predicción) ── */}
        {(appointment.noShowScore !== undefined && appointment.noShowScore !== null) && (
          <div className="d-flex align-items-center gap-1 mt-1 mb-1">
            <NoShowRiskBadge
              score={appointment.noShowScore}
              riskLevel={appointment.noShowRisk}
              extraReminders={appointment.extraReminders}
            />
          </div>
        )}

        {/* ── Nota breve (si existe) ── */}
        {notes && (
          <div style={{
            fontSize: '0.75rem',
            color: 'var(--color-gray-500)',
            marginTop: '2px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }} title={notes}>
            📝 {notes}
          </div>
        )}
      </div>
    </div>
  );
}
