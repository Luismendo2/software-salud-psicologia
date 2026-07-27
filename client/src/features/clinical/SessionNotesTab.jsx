/* ==========================================================================
   SessionNotesTab — Pestaña de notas de sesión
   
   Muestra la lista de notas existentes (firmadas y borradores) y
   permite crear una nueva nota seleccionando una plantilla.
   Al hacer clic en una nota, la abre en el editor o en modo lectura.
   ========================================================================== */

import { useState } from 'react';
import { getClinicalTemplates, createSessionNote } from '../../services/clinicalService';
import SessionNoteCard from './SessionNoteCard';
import SessionNoteEditor from './SessionNoteEditor';
import TemplateSelector from './TemplateSelector';

export default function SessionNotesTab({ patientId, notes, onNotesChange }) {
  const [selectedNote, setSelectedNote] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  const handleCreateNote = async (templateId) => {
    setShowTemplateSelector(false);
    setIsCreating(true);
    try {
      const newNote = await createSessionNote(patientId, { templateId });
      onNotesChange(prev => [newNote, ...prev]);
      setSelectedNote(newNote);
    } catch (err) {
      console.error('Error creando nota:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleNoteUpdated = (updatedNote) => {
    onNotesChange(prev =>
      prev.map(n => n.id === updatedNote.id ? updatedNote : n)
    );
    if (updatedNote.status === 'SIGNED') {
      setSelectedNote(null);
    }
  };

  // Si hay una nota seleccionada, mostrar editor o vista de lectura
  if (selectedNote) {
    return (
      <div>
        <button
          className="clinical-back-btn"
          onClick={() => setSelectedNote(null)}
        >
          ← Volver a la lista
        </button>
        <SessionNoteEditor
          note={selectedNote}
          readOnly={selectedNote.status === 'SIGNED'}
          onSave={handleNoteUpdated}
          onSign={handleNoteUpdated}
        />
      </div>
    );
  }

  const drafts = notes.filter(n => n.status === 'DRAFT');
  const signed = notes.filter(n => n.status === 'SIGNED');

  return (
    <div>
      {/* Botón de nueva nota */}
      <div className="clinical-notes-toolbar">
        <button
          className="btn btn-primary"
          onClick={() => setShowTemplateSelector(true)}
          disabled={isCreating}
        >
          {isCreating ? 'Creando...' : '+ Nueva nota de sesión'}
        </button>
      </div>

      {/* Selector de plantilla */}
      {showTemplateSelector && (
        <TemplateSelector
          onSelect={handleCreateNote}
          onCancel={() => setShowTemplateSelector(false)}
        />
      )}

      {/* Borradores */}
      {drafts.length > 0 && (
        <div className="clinical-notes-section">
          <h3 className="clinical-notes-section-title">
            <span className="clinical-draft-dot" />
            Borradores
          </h3>
          {drafts.map(note => (
            <SessionNoteCard
              key={note.id}
              note={note}
              onClick={() => setSelectedNote(note)}
            />
          ))}
        </div>
      )}

      {/* Notas firmadas */}
      <div className="clinical-notes-section">
        <h3 className="clinical-notes-section-title">
          Notas firmadas ({signed.length})
        </h3>
        {signed.length === 0 ? (
          <div className="clinical-empty" style={{ padding: 'var(--space-xl)' }}>
            <p>Aún no hay notas firmadas para este paciente.</p>
          </div>
        ) : (
          signed.map(note => (
            <SessionNoteCard
              key={note.id}
              note={note}
              onClick={() => setSelectedNote(note)}
            />
          ))
        )}
      </div>
    </div>
  );
}
