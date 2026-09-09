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
import SubmitForSupervisionModal from '../supervision/SubmitForSupervisionModal';
import VoiceRecorderWidget from './VoiceRecorderWidget';
import SessionSummaryPanel from './SessionSummaryPanel';
import DsmSupportPanel from './DsmSupportPanel';

export default function SessionNoteEditor({ note, readOnly, onSave, onSign }) {
  const [template, setTemplate] = useState(null);
  const [content, setContent] = useState(note.content || {});
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showSignModal, setShowSignModal] = useState(false);
  const [showSupervisionModal, setShowSupervisionModal] = useState(false);
  const [showDsmSupport, setShowDsmSupport] = useState(false);
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

  const getPrimaryFieldKey = () => template?.fields?.[0]?.key || 'contenido';

  const appendToNote = (html) => {
    const fieldKey = getPrimaryFieldKey();
    const newContent = {
      ...content,
      [fieldKey]: `${content[fieldKey] || ''}${content[fieldKey] ? '<br/>' : ''}${html}`,
    };
    setContent(newContent);
    debouncedSave(newContent);
  };

  const handleTranscript = (transcript) => {
    const safeText = transcript.replace(/[&<>]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[character]);
    appendToNote(`<p>${safeText}</p>`);
  };

  const handleSummaryConfirm = async (summary) => {
    const summaryHtml = `<section><p><strong>Resumen de sesión (revisado por profesional)</strong></p><p><strong>Objetivo:</strong> ${summary.objetivo}</p><p><strong>Intervención:</strong> ${summary.intervencion}</p><p><strong>Resultado:</strong> ${summary.resultado}</p><p><strong>Plan:</strong> ${summary.planSiguienteSesion}</p></section>`;
    const fieldKey = getPrimaryFieldKey();
    const newContent = { ...content, [fieldKey]: `${content[fieldKey] || ''}${content[fieldKey] ? '<br/>' : ''}${summaryHtml}` };
    setContent(newContent);
    setSaving(true);
    try {
      const updated = await updateSessionNote(note.id, { content: newContent, aiSummary: summary });
      setLastSaved(new Date());
      if (onSave) onSave(updated);
    } finally {
      setSaving(false);
    }
  };

  const handleDsmInsert = (suggestion) => {
    appendToNote(`<aside><p><strong>Sugerencia de apoyo diagnóstico IA (no confirmado)</strong></p><p><strong>${suggestion.code} — ${suggestion.name}</strong></p><p>${suggestion.rationale}</p></aside>`);
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
              <button 
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setShowSupervisionModal(true)}
              >
                🎓 Solicitar Supervisión
              </button>
              <span className="clinical-note-badge signed">✓ Firmada el {new Date(note.signedAt).toLocaleDateString('es-CO')}</span>
            </div>
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
                className="btn btn-outline-primary btn-sm"
                onClick={() => setShowDsmSupport((visible) => !visible)}
              >
                {showDsmSupport ? 'Ocultar apoyo DSM' : 'Apoyo DSM-5'}
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
        {!readOnly && (
          <>
            <VoiceRecorderWidget disabled={saving} onTranscript={handleTranscript} />
            <SessionSummaryPanel
              noteContent={Object.values(content).join(' ')}
              disabled={saving}
              onConfirm={handleSummaryConfirm}
            />
          </>
        )}
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
        {!readOnly && showDsmSupport && (
          <DsmSupportPanel disabled={saving} onInsert={handleDsmInsert} />
        )}
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

      {/* Modal de Supervisión */}
      <SubmitForSupervisionModal 
        isOpen={showSupervisionModal}
        onClose={() => setShowSupervisionModal(false)}
        noteId={note.id}
        patientName={note.patientName || 'Paciente Actual'}
        sessionDate={note.date}
        sessionNumber={note.sessionNumber}
      />
    </div>
  );
}
