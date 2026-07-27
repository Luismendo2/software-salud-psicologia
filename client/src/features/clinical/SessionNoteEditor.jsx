/* ==========================================================================
   SessionNoteEditor — Editor de notas de sesión con texto enriquecido
   
   Usa un textarea con formato básico (el editor enriquecido real como
   Tiptap se instalará cuando se integre el backend, por ahora usamos
   contentEditable con soporte HTML para no agregar dependencias pesadas
   en la fase de mocks).
   
   Funcionalidades:
   - Campos dinámicos según la plantilla de la nota
   - Autoguardado con debounce (cada 3s de inactividad)
   - Modo solo lectura para notas firmadas
   - Botón de firma con modal de confirmación + canvas
   ========================================================================== */

import { useState, useEffect, useRef, useCallback } from 'react';
import { getClinicalTemplate, updateSessionNote, signSessionNote } from '../../services/clinicalService';

export default function SessionNoteEditor({ note, readOnly, onSave, onSign }) {
  const [template, setTemplate] = useState(null);
  const [content, setContent] = useState(note.content || {});
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showSignModal, setShowSignModal] = useState(false);
  const [signing, setSigning] = useState(false);
  const saveTimerRef = useRef(null);

  useEffect(() => {
    loadTemplate();
  }, [note.templateId]);

  const loadTemplate = async () => {
    if (note.templateId) {
      const tpl = await getClinicalTemplate(note.templateId);
      setTemplate(tpl);
    }
  };

  // Autoguardado con debounce
  const debouncedSave = useCallback((newContent) => {
    if (readOnly) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        const updated = await updateSessionNote(note.id, { content: newContent });
        setLastSaved(new Date());
        if (onSave) onSave(updated);
      } catch (err) {
        console.error('Error autoguardando:', err);
      } finally {
        setSaving(false);
      }
    }, 3000);
  }, [note.id, readOnly, onSave]);

  const handleFieldChange = (fieldKey, value) => {
    const newContent = { ...content, [fieldKey]: value };
    setContent(newContent);
    debouncedSave(newContent);
  };

  const handleManualSave = async () => {
    if (readOnly) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSaving(true);
    try {
      const updated = await updateSessionNote(note.id, { content });
      setLastSaved(new Date());
      if (onSave) onSave(updated);
    } catch (err) {
      console.error('Error guardando:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSign = async () => {
    setSigning(true);
    try {
      const signed = await signSessionNote(note.id, null);
      setShowSignModal(false);
      if (onSign) onSign(signed);
    } catch (err) {
      console.error('Error firmando:', err);
    } finally {
      setSigning(false);
    }
  };

  const fields = template?.fields || [{ key: 'contenido', label: 'Nota de sesión', type: 'richtext' }];

  const dateText = new Date(note.date).toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="clinical-editor">
      {/* ── Header del editor ── */}
      <div className="clinical-editor-header">
        <div>
          <h2>Sesión {note.sessionNumber}</h2>
          <div className="clinical-editor-date">{dateText}</div>
          {template && (
            <div className="clinical-editor-template">
              Plantilla: {template.name}
            </div>
          )}
        </div>
        <div className="clinical-editor-actions">
          {readOnly ? (
            <span className="clinical-note-badge signed">✓ Firmada el {new Date(note.signedAt).toLocaleDateString('es-CO')}</span>
          ) : (
            <>
              {lastSaved && (
                <span className="clinical-autosave-indicator">
                  {saving ? 'Guardando...' : `Guardado ${lastSaved.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`}
                </span>
              )}
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={handleManualSave}
                disabled={saving}
              >
                Guardar
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowSignModal(true)}
              >
                Firmar y cerrar
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Campos de la nota ── */}
      <div className="clinical-editor-fields">
        {fields.map(field => (
          <div key={field.key} className="clinical-editor-field">
            <label className="clinical-field-label">{field.label}</label>
            {readOnly ? (
              <div
                className="clinical-field-readonly"
                dangerouslySetInnerHTML={{ __html: content[field.key] || '<em>Sin contenido</em>' }}
              />
            ) : (
              <div
                className="clinical-field-editable"
                contentEditable
                suppressContentEditableWarning
                dangerouslySetInnerHTML={{ __html: content[field.key] || '' }}
                onBlur={(e) => handleFieldChange(field.key, e.currentTarget.innerHTML)}
                data-placeholder={`Escribe aquí...`}
              />
            )}
          </div>
        ))}
      </div>

      {/* ── Modal de firma ── */}
      {showSignModal && (
        <div className="clinical-modal-overlay" onClick={() => setShowSignModal(false)}>
          <div className="clinical-modal" onClick={e => e.stopPropagation()}>
            <div className="clinical-modal-header">
              <h3>Firmar nota de sesión</h3>
              <button className="clinical-modal-close" onClick={() => setShowSignModal(false)}>✕</button>
            </div>
            <div className="clinical-modal-body">
              <div className="clinical-sign-warning">
                <span className="clinical-sign-warning-icon">⚠️</span>
                <div>
                  <strong>Esta acción es irreversible</strong>
                  <p>Una vez firmada, la nota no podrá ser modificada. Para agregar información adicional deberás crear una nota nueva como anexo.</p>
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-600)' }}>
                Al firmar confirmas que el contenido de la Sesión {note.sessionNumber} es correcto y completo.
              </p>
            </div>
            <div className="clinical-modal-footer">
              <button
                className="btn btn-outline-secondary"
                onClick={() => setShowSignModal(false)}
              >
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSign}
                disabled={signing}
              >
                {signing ? 'Firmando...' : 'Firmar y cerrar nota'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
