/* ==========================================================================
   LibraryCard — Tarjeta de material terapéutico
   Muestra metadatos, formato, enfoque, autor y acciones de preview/descarga.
   ========================================================================== */

export default function LibraryCard({ item, onPreview, onDownload }) {
  const therapyLabels = {
    TCC: 'Cognitivo-Conductual',
    SYSTEMIC: 'Sistémica',
    GESTALT: 'Gestalt',
    CHILD_YOUTH: 'Infanto-Juvenil',
    HUMANISTIC: 'Humanista',
    GENERAL: 'General',
  };

  const typeLabels = {
    TEMPLATE: 'Plantilla',
    GUIDE: 'Guía',
    EXERCISE: 'Ejercicio',
    SCALE: 'Escala',
  };

  return (
    <div className="library-card">
      <div>
        <div className="library-card-top">
          <span className={`library-format-badge library-format-badge--${item.format}`}>
            {item.format}
          </span>
          <span className="small text-muted d-flex align-items-center gap-1">
            {item.isPublic ? '🌐 Público' : '🔒 Mi clínica'}
          </span>
        </div>

        <h3 className="library-card-title">{item.title}</h3>
        <p className="library-card-desc">{item.description}</p>

        <div className="library-card-meta">
          <span className="library-tag" style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary-700)' }}>
            {typeLabels[item.type] || item.type}
          </span>
          <span className="library-tag" style={{ background: 'var(--color-accent-50)', color: 'var(--color-accent-600)' }}>
            {therapyLabels[item.therapyType] || item.therapyType}
          </span>
          <span className="small text-muted ms-auto">{item.fileSize}</span>
        </div>
      </div>

      <div className="library-card-actions">
        <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
          Por <strong>{item.authorName}</strong>
        </div>
        <div className="d-flex gap-1">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary py-1 px-2"
            onClick={() => onPreview(item)}
            title="Vista previa"
          >
            👁️ Ver
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary py-1 px-2"
            onClick={() => onDownload(item)}
            title="Descargar archivo"
          >
            ⬇️
          </button>
        </div>
      </div>
    </div>
  );
}
