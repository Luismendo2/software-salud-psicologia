/* ==========================================================================
   BookingConfirmation — Pantalla de éxito post-reserva
   ========================================================================== */

export default function BookingConfirmation({ data }) {
  if (!data) return null;
  
  const formattedDate = new Date(data.date).toLocaleDateString('es-CO', {
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  });

  return (
    <div className="booking-page">
      <div className="booking-card confirmation-card">
        <div className="confirmation-icon">✓</div>
        <h2 style={{ marginBottom: 'var(--space-md)' }}>¡Cita confirmada!</h2>
        
        <p style={{ color: 'var(--color-gray-600)', marginBottom: 'var(--space-xl)' }}>
          Hola <strong>{data.name}</strong>, hemos reservado tu espacio. 
          Te enviamos los detalles a {data.email}.
        </p>

        <div style={{ backgroundColor: 'var(--color-gray-50)', padding: 'var(--space-lg)', borderRadius: 'var(--radius-md)' }}>
          <div className="confirmation-detail">
            <span>📅</span> {formattedDate}
          </div>
          <div className="confirmation-detail">
            <span>⏰</span> {data.time}
          </div>
          <div className="confirmation-detail">
            <span>📍</span> {data.type === 'VIRTUAL' ? 'Videollamada' : 'Consultorio principal'}
          </div>
        </div>
      </div>
    </div>
  );
}
