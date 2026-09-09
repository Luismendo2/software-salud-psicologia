/* ==========================================================================
   DateRangeFilter.jsx — Selector de rango temporal con presets rápidos
   ========================================================================== */

import React from 'react';

export default function DateRangeFilter({ preset, onPresetChange, customDates, onCustomDateChange }) {
  const PRESETS = [
    { id: 'month', label: 'Este mes' },
    { id: '3months', label: '3 meses' },
    { id: '12months', label: '12 meses' },
    { id: 'custom', label: 'Personalizado' },
  ];

  return (
    <div className="reports-filters-group">
      <div className="reports-presets-pills">
        {PRESETS.map(p => (
          <button
            key={p.id}
            type="button"
            className={`reports-pill-btn ${preset === p.id ? 'active' : ''}`}
            onClick={() => onPresetChange(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {preset === 'custom' && (
        <div className="reports-custom-dates">
          <input
            type="date"
            value={customDates.from}
            onChange={e => onCustomDateChange('from', e.target.value)}
            aria-label="Fecha inicio"
          />
          <span style={{ color: 'var(--color-gray-400)', fontSize: '0.8125rem' }}>a</span>
          <input
            type="date"
            value={customDates.to}
            onChange={e => onCustomDateChange('to', e.target.value)}
            aria-label="Fecha fin"
          />
        </div>
      )}
    </div>
  );
}
