/* ==========================================================================
   SessionNoteCard — Tarjeta de nota de sesión (modo lectura)
   
   Muestra un resumen compacto de la nota: número de sesión, fecha,
   estado (borrador/firmada), y un extracto del contenido.
   Al hacer clic abre la nota en el editor o en vista lectura.
   ========================================================================== */

export default function SessionNoteCard({ note, onClick }) {
  const dateText = new Date(note.date).toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Extraer un fragmento de texto del primer campo que tenga contenido
  const contentValues = typeof note.content === 'object'
    ? Object.values(note.content)
    : [];
  const firstContent = contentValues.find(v => v && v.length > 0) || '';
  // Limpiar HTML para el extracto
  const excerpt = firstContent
    .replace(/<[^>]*>/g, '')
    .slice(0, 120);

  const isDraft = note.status === 'DRAFT';

  return (
    <button
      className={`clinical-note-card ${isDraft ? 'draft' : 'signed'}`}
      onClick={onClick}
      type="button"
    >
      <div className="clinical-note-card-left">
        <div className="clinical-note-session">
          Sesión {note.sessionNumber}
        </div>
        <div className="clinical-note-date">{dateText}</div>
        {excerpt && (
          <div className="clinical-note-excerpt">
            {excerpt}{excerpt.length >= 120 ? '...' : ''}
          </div>
        )}
      </div>
      <div className="clinical-note-card-right">
        <span className={`clinical-note-badge ${isDraft ? 'draft' : 'signed'}`}>
          {isDraft ? '● Borrador' : '✓ Firmada'}
        </span>
        <span className="clinical-note-arrow">→</span>
      </div>
    </button>
  );
}
