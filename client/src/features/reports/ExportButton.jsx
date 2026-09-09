/* ==========================================================================
   ExportButton.jsx — Botón con menú desplegable para exportar reportes
   ========================================================================== */

import React, { useState, useRef, useEffect } from 'react';
import { exportReport } from '../../services/reportsService';

export default function ExportButton({ reportType, rangePreset, psychologistId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async (format) => {
    setIsOpen(false);
    setIsExporting(true);
    setFeedback(`Generando ${format.toUpperCase()}...`);
    try {
      const res = await exportReport({
        type: format,
        report: reportType,
        rangePreset,
        psychologistId,
      });
      setFeedback(`¡${res.fileName} descargado!`);
      setTimeout(() => setFeedback(''), 3000);
    } catch (err) {
      console.error(err);
      setFeedback('Error al exportar');
      setTimeout(() => setFeedback(''), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="reports-export-dropdown" ref={menuRef}>
      <button
        type="button"
        className="btn btn-outline-secondary"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem' }}
      >
        <span>📥 Exportar</span>
        <span style={{ fontSize: '0.6875rem' }}>▼</span>
      </button>

      {isOpen && (
        <div className="reports-export-menu">
          <button
            type="button"
            className="reports-export-item"
            onClick={() => handleExport('csv')}
          >
            <span>📄</span>
            <span>Descargar CSV (Excel)</span>
          </button>
          <button
            type="button"
            className="reports-export-item"
            onClick={() => handleExport('pdf')}
          >
            <span>📑</span>
            <span>Descargar PDF</span>
          </button>
        </div>
      )}

      {feedback && (
        <span style={{
          position: 'absolute',
          right: 0,
          top: '110%',
          whiteSpace: 'nowrap',
          fontSize: '0.75rem',
          color: 'var(--color-primary-600)',
          fontWeight: 'var(--font-weight-medium)',
          background: 'var(--color-surface)',
          padding: '2px 8px',
          borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {feedback}
        </span>
      )}
    </div>
  );
}
