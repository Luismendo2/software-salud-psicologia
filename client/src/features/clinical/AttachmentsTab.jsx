/* ==========================================================================
   AttachmentsTab — Pestaña de archivos adjuntos
   
   Permite subir archivos arrastrando (drag & drop) o seleccionando,
   muestra una lista/galería con el nombre, tipo, tamaño y fecha,
   y botones para descargar y eliminar.
   ========================================================================== */

import { useState, useEffect, useRef } from 'react';
import { getAttachments, uploadAttachment, deleteAttachment } from '../../services/clinicalService';

/** Formatea bytes en KB o MB legible */
function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

/** Icono según tipo de archivo */
function fileIcon(type) {
  if (type?.startsWith('image/')) return '🖼️';
  if (type === 'application/pdf') return '📄';
  if (type?.includes('word') || type?.includes('document')) return '📝';
  return '📎';
}

export default function AttachmentsTab({ patientId }) {
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadAttachments();
  }, [patientId]);

  const loadAttachments = async () => {
    try {
      const data = await getAttachments(patientId);
      setAttachments(data);
    } catch (err) {
      console.error('Error cargando adjuntos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (files) => {
    setUploading(true);
    try {
      for (const file of files) {
        const newAtt = await uploadAttachment(patientId, file);
        setAttachments(prev => [newAtt, ...prev]);
      }
    } catch (err) {
      console.error('Error subiendo archivo:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (attId) => {
    if (!window.confirm('¿Eliminar este archivo? Esta acción no se puede deshacer.')) return;
    try {
      await deleteAttachment(attId);
      setAttachments(prev => prev.filter(a => a.id !== attId));
    } catch (err) {
      console.error('Error eliminando adjunto:', err);
    }
  };

  /* ── Drag & Drop handlers ── */
  const onDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const onDragLeave = () => setDragOver(false);
  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleUpload(Array.from(e.dataTransfer.files));
    }
  };
  const onFileSelect = (e) => {
    if (e.target.files.length > 0) {
      handleUpload(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  return (
    <div>
      {/* ── Zona de subida ── */}
      <div
        className={`clinical-dropzone ${dragOver ? 'dragover' : ''} ${uploading ? 'uploading' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          style={{ display: 'none' }}
          onChange={onFileSelect}
        />
        <div className="clinical-dropzone-content">
          <span className="clinical-dropzone-icon">{uploading ? '⏳' : '📤'}</span>
          <p className="clinical-dropzone-text">
            {uploading
              ? 'Subiendo archivo...'
              : 'Arrastra archivos aquí o haz clic para seleccionar'}
          </p>
          <p className="clinical-dropzone-hint">PDF, imágenes, documentos — máx. 10 MB</p>
        </div>
      </div>

      {/* ── Lista de archivos ── */}
      {loading ? (
        <div className="clinical-loading">Cargando archivos...</div>
      ) : attachments.length === 0 ? (
        <div className="clinical-empty" style={{ padding: 'var(--space-xl)' }}>
          <span className="clinical-empty-icon">📎</span>
          <h3>Sin archivos adjuntos</h3>
          <p>Los archivos que subas aparecerán aquí.</p>
        </div>
      ) : (
        <div className="clinical-attachments-list">
          {attachments.map(att => (
            <div key={att.id} className="clinical-attachment-card">
              <span className="clinical-attachment-icon">{fileIcon(att.fileType)}</span>
              <div className="clinical-attachment-info">
                <div className="clinical-attachment-name">{att.fileName}</div>
                <div className="clinical-attachment-meta">
                  {formatFileSize(att.fileSize)}
                  <span className="clinical-meta-dot">·</span>
                  {new Date(att.uploadedAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                  <span className="clinical-meta-dot">·</span>
                  {att.uploadedBy}
                </div>
              </div>
              <div className="clinical-attachment-actions">
                <button
                  className="clinical-attachment-btn"
                  title="Descargar"
                  onClick={() => window.open(att.url, '_blank')}
                >
                  ⬇️
                </button>
                <button
                  className="clinical-attachment-btn clinical-attachment-btn--danger"
                  title="Eliminar"
                  onClick={() => handleDelete(att.id)}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
