/* ==========================================================================
   PsychologistSelector.jsx — Dropdown de selección de profesional (ADMIN)
   ========================================================================== */

import React from 'react';

export default function PsychologistSelector({ psychologists, selectedId, onChange }) {
  return (
    <div className="reports-psychologist-select">
      <span style={{ fontSize: '0.8125rem', color: 'var(--color-gray-500)', fontWeight: 'var(--font-weight-medium)' }}>
        Terapeuta:
      </span>
      <select
        value={selectedId}
        onChange={e => onChange(e.target.value)}
        aria-label="Seleccionar psicólogo"
      >
        {psychologists.map(psych => (
          <option key={psych.id} value={psych.id}>
            {psych.name}
          </option>
        ))}
      </select>
    </div>
  );
}
