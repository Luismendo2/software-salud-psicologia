/* ==========================================================================
   ResourcePreviewModal — Modal de vista previa y descarga de material (CA-18)
   Permite previsualización de PDFs y descarga directa de archivos.
   ========================================================================== */

export default function ResourcePreviewModal({ item, onClose, onDownload }) {
  if (!item) return null;

  return (
    <div className="crisis-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="crisis-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '780px', width: '95%' }}
      >
        <div className="crisis-modal-header">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className={`library-format-badge library-format-badge--${item.format}`}>
                {item.format}
              </span>
              <h2 className="h5 fw-bold text-dark mb-0">{item.title}</h2>
            </div>
            <p className="small text-muted mb-0">Subido por {item.authorName} • {item.fileSize}</p>
          </div>
          <button type="button" className="pwa-banner-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="p-4">
          <div className="mb-3">
            <h6 className="fw-semibold text-secondary small text-uppercase">Descripción terapéutica</h6>
            <p className="text-dark small" style={{ lineHeight: 1.6 }}>{item.description}</p>
          </div>

          <div className="d-flex flex-wrap gap-2 mb-4">
            {item.tags?.map((tag, i) => (
              <span key={i} className="library-tag">#{tag}</span>
            ))}
          </div>

          {/* Área de previsualización inline (CA-18) */}
          <div
            className="border rounded p-4 text-center bg-light mb-4"
            style={{ minHeight: '260px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          >
            {item.format === 'pdf' ? (
              <div>
                <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>📄</div>
                <h5 className="h6 fw-bold text-dark mb-1">Documento PDF interactivo</h5>
                <p className="small text-muted max-w-sm mb-3">
                  Vista previa de {item.title}. Compatible con visores PDF y lectores de consulta rápida.
                </p>
                <div className="badge bg-primary-subtle text-primary px-3 py-2">
                  Vista preliminar clínica habilitada
                </div>
              </div>
            ) : item.format === 'mp4' ? (
              <div>
                <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>🎬</div>
                <h5 className="h6 fw-bold text-dark mb-1">Video psicoeducativo</h5>
                <p className="small text-muted mb-0">Contenido audiovisual para prescripción terapéutica.</p>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>📑</div>
                <h5 className="h6 fw-bold text-dark mb-1">Plantilla de documento Word (DOCX)</h5>
                <p className="small text-muted mb-0">Descarga directa para edición local en procesador de texto.</p>
              </div>
            )}
          </div>

          <div className="d-flex justify-content-between align-items-center pt-3 border-top">
            <span className="small text-muted">
              {item.isPublic ? '🌐 Visible para toda la red de PsiAgenda' : '🔒 Exclusivo para tu clínica'}
            </span>
            <div className="d-flex gap-2">
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onClose}>
                Cerrar
              </button>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={() => onDownload(item)}
              >
                ⬇️ Descargar archivo ({item.fileSize})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
