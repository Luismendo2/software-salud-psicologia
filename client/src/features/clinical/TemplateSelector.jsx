/* ==========================================================================
   TemplateSelector — Selector de plantilla clínica
   
   Muestra las plantillas disponibles en un panel desplegable.
   El psicólogo elige la plantilla antes de crear una nueva nota.
   ========================================================================== */

import { useState, useEffect } from 'react';
import { getClinicalTemplates } from '../../services/clinicalService';

export default function TemplateSelector({ onSelect, onCancel }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await getClinicalTemplates();
      setTemplates(data);
    } catch (err) {
      console.error('Error cargando plantillas:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="clinical-template-selector">
      <div className="clinical-template-selector-header">
        <h3>Selecciona una plantilla</h3>
        <button className="clinical-modal-close" onClick={onCancel}>✕</button>
      </div>
      {loading ? (
        <div className="clinical-loading" style={{ padding: 'var(--space-md)' }}>
          Cargando plantillas...
        </div>
      ) : (
        <div className="clinical-template-list">
          {templates.map(tpl => (
            <button
              key={tpl.id}
              className="clinical-template-option"
              onClick={() => onSelect(tpl.id)}
            >
              <div className="clinical-template-option-info">
                <div className="clinical-template-option-name">
                  {tpl.name}
                  {tpl.isDefault && <span className="clinical-default-badge">Por defecto</span>}
                </div>
                <div className="clinical-template-option-desc">{tpl.description}</div>
                <div className="clinical-template-option-fields">
                  {tpl.fields.length} campo{tpl.fields.length !== 1 ? 's' : ''}
                </div>
              </div>
              <span className="clinical-template-option-arrow">→</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
