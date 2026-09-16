/* ==========================================================================
   UploadResourceModal — Modal para subir nuevo material terapéutico (CA-15)
   Valida tipo, enfoque, archivo (PDF/DOCX/MP4 ≤ 50MB) y visibilidad.
   ========================================================================== */

import { useState } from 'react';
import { uploadLibraryResource } from '../../services/libraryService';

export default function UploadResourceModal({ isOpen, onClose, onUploaded, user }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'EXERCISE',
    therapyType: 'TCC',
    isPublic: true,
    tagsInput: '',
  });

  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    // Validación tamaño <= 50 MB (CA-15)
    const MAX_SIZE = 50 * 1024 * 1024;
    if (selected.size > MAX_SIZE) {
      setError('El archivo supera el límite permitido de 50 MB.');
      setFile(null);
      return;
    }

    // Validación extensiones
    const validExtensions = ['.pdf', '.docx', '.mp4'];
    const fileName = selected.name.toLowerCase();
    const isValid = validExtensions.some((ext) => fileName.endsWith(ext));
    if (!isValid) {
      setError('Formato no válido. Solo se admiten archivos PDF, DOCX o MP4.');
      setFile(null);
      return;
    }

    setError('');
    setFile(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Por favor completa el título y la descripción.');
      return;
    }
    if (!file) {
      setError('Debes adjuntar un archivo (PDF, DOCX o MP4).');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const tags = formData.tagsInput
        ? formData.tagsInput.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
        : [];

      await uploadLibraryResource({
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        therapyType: formData.therapyType,
        isPublic: formData.isPublic,
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        tags,
        authorName: user ? `${user.firstName} ${user.lastName}` : 'Dra. María López',
      });

      onUploaded();
      onClose();
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error al subir el material.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="crisis-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="crisis-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        <div className="crisis-modal-header">
          <div>
            <h2 className="h5 fw-bold text-dark mb-1">Subir Material a la Biblioteca</h2>
            <p className="small text-muted mb-0">Comparte plantillas, guías o ejercicios clínicos con tu equipo.</p>
          </div>
          <button type="button" className="pwa-banner-close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}

          <div className="mb-3">
            <label className="form-label small fw-semibold">Título del recurso *</label>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Ej. Guía de Manejo del Ataque de Pánico"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">Descripción clínica *</label>
            <textarea
              className="form-control form-control-sm"
              rows="3"
              placeholder="Explica el objetivo terapéutico, cuándo usarlo y las indicaciones principales..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="row g-2 mb-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Tipo de recurso</label>
              <select
                className="form-select form-select-sm"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="TEMPLATE">Plantilla de sesión</option>
                <option value="GUIDE">Guía psicoeducativa</option>
                <option value="EXERCISE">Ejercicio práctico</option>
                <option value="SCALE">Escala validada</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Enfoque terapéutico</label>
              <select
                className="form-select form-select-sm"
                value={formData.therapyType}
                onChange={(e) => setFormData({ ...formData, therapyType: e.target.value })}
              >
                <option value="TCC">Cognitivo-Conductual (TCC)</option>
                <option value="SYSTEMIC">Sistémica / Familiar</option>
                <option value="GESTALT">Gestalt</option>
                <option value="CHILD_YOUTH">Infanto-Juvenil</option>
                <option value="HUMANISTIC">Humanista-Existencial</option>
                <option value="GENERAL">General / Transdiagnóstico</option>
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">Archivo (PDF, DOCX o MP4 ≤ 50 MB) *</label>
            <input
              type="file"
              className="form-control form-control-sm"
              accept=".pdf,.docx,.mp4"
              onChange={handleFileChange}
              required
            />
            {file && (
              <div className="small text-success mt-1">
                ✓ Archivo seleccionado: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
              </div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">Palabras clave / Etiquetas (separadas por coma)</label>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Ej. ansiedad, respiración, pánico, reestructuración"
              value={formData.tagsInput}
              onChange={(e) => setFormData({ ...formData, tagsInput: e.target.value })}
            />
          </div>

          <div className="form-check mb-4">
            <input
              type="checkbox"
              className="form-check-input"
              id="isPublicCheck"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
            />
            <label className="form-check-label small" htmlFor="isPublicCheck">
              <strong>Hacer público:</strong> Visible para todos los profesionales de PsiAgenda. (Si lo desmarcas, solo será visible para miembros de tu clínica).
            </label>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onClose} disabled={uploading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-sm btn-primary" disabled={uploading}>
              {uploading ? 'Subiendo material...' : 'Subir a la biblioteca'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
