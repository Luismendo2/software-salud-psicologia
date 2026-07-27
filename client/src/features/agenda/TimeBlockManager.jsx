/* ==========================================================================
   TimeBlockManager — Bloqueos manuales
   
   Permite agregar bloqueos excepcionales al calendario
   (vacaciones, citas médicas, etc.) que sobreescriben la disponibilidad.
   ========================================================================== */

import { useState } from 'react';

export default function TimeBlockManager() {
  const [blocks, setBlocks] = useState([
    { id: '1', reason: 'Vacaciones de mitad de año', start: '2026-07-15T00:00', end: '2026-07-22T23:59' }
  ]);
  const [newReason, setNewReason] = useState('');
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newReason || !newStart || !newEnd) return;
    
    setBlocks([
      ...blocks,
      { id: Date.now().toString(), reason: newReason, start: newStart, end: newEnd }
    ]);
    
    setNewReason('');
    setNewStart('');
    setNewEnd('');
  };

  const handleRemove = (id) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  return (
    <div className="card h-100">
      <div className="card-body">
        <h3 style={{ fontSize: '1rem', marginBottom: 'var(--space-md)' }}>Excepciones y vacaciones</h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-gray-500)', marginBottom: 'var(--space-lg)' }}>
          Bloquea fechas específicas donde no estarás disponible, ignorando tu horario regular.
        </p>

        {/* Lista de bloqueos actuales */}
        <div className="mb-4 d-flex flex-column gap-2">
          {blocks.map(block => (
            <div key={block.id} style={{
              padding: 'var(--space-sm) var(--space-md)',
              backgroundColor: 'var(--color-gray-50)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-gray-200)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-gray-800)' }}>
                  {block.reason}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>
                  {new Date(block.start).toLocaleDateString('es-CO')} – {new Date(block.end).toLocaleDateString('es-CO')}
                </div>
              </div>
              <button 
                className="btn btn-link text-danger p-0 text-decoration-none" 
                style={{ fontSize: '1.25rem', lineHeight: 1 }}
                onClick={() => handleRemove(block.id)}
                aria-label="Eliminar"
              >
                &times;
              </button>
            </div>
          ))}
          {blocks.length === 0 && (
            <div className="text-center py-3" style={{ fontSize: '0.8125rem', color: 'var(--color-gray-400)' }}>
              No hay bloqueos activos
            </div>
          )}
        </div>

        {/* Formulario nuevo bloqueo */}
        <form onSubmit={handleAdd} style={{ borderTop: '1px solid var(--color-gray-100)', paddingTop: 'var(--space-md)' }}>
          <div className="mb-2">
            <input 
              type="text" 
              className="form-control form-control-sm" 
              placeholder="Motivo (ej. Cita médica)" 
              value={newReason}
              onChange={e => setNewReason(e.target.value)}
            />
          </div>
          <div className="row g-2 mb-3">
            <div className="col-6">
              <input 
                type="date" 
                className="form-control form-control-sm" 
                value={newStart}
                onChange={e => setNewStart(e.target.value)}
              />
            </div>
            <div className="col-6">
              <input 
                type="date" 
                className="form-control form-control-sm" 
                value={newEnd}
                onChange={e => setNewEnd(e.target.value)}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-outline-secondary btn-sm w-100" disabled={!newReason || !newStart || !newEnd}>
            + Añadir bloqueo
          </button>
        </form>
      </div>
    </div>
  );
}
