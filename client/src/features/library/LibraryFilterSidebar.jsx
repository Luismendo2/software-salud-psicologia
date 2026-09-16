/* ==========================================================================
   LibraryFilterSidebar — Barra lateral de filtros para la Biblioteca
   Permite filtrar por Enfoque terapéutico, Tipo de documento y Ámbito.
   ========================================================================== */

import { RESOURCE_TYPES, THERAPY_APPROACHES } from '../../services/libraryService';

export default function LibraryFilterSidebar({
  selectedType,
  onSelectType,
  selectedTherapy,
  onSelectTherapy,
  selectedScope,
  onSelectScope,
  totalResults,
}) {
  return (
    <aside className="library-sidebar" aria-label="Filtros de la biblioteca">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="fw-bold text-dark small text-uppercase">Filtros</span>
        <span className="badge bg-light text-secondary border">
          {totalResults} {totalResults === 1 ? 'material' : 'materiales'}
        </span>
      </div>

      {/* Ámbito de visibilidad */}
      <div className="library-filter-group">
        <div className="library-filter-title">Visibilidad</div>
        <div className="d-flex flex-column gap-1">
          <button
            type="button"
            className={`library-filter-option ${selectedScope === 'ALL' ? 'active' : ''}`}
            onClick={() => onSelectScope('ALL')}
          >
            <span>Todos los materiales</span>
          </button>
          <button
            type="button"
            className={`library-filter-option ${selectedScope === 'PUBLIC' ? 'active' : ''}`}
            onClick={() => onSelectScope('PUBLIC')}
          >
            <span>🌐 Públicos (Comunidad)</span>
          </button>
          <button
            type="button"
            className={`library-filter-option ${selectedScope === 'PRIVATE' ? 'active' : ''}`}
            onClick={() => onSelectScope('PRIVATE')}
          >
            <span>🔒 Privados (Mi clínica)</span>
          </button>
        </div>
      </div>

      {/* Tipo de Documento */}
      <div className="library-filter-group">
        <div className="library-filter-title">Tipo de Recurso</div>
        <div className="d-flex flex-column gap-1">
          {RESOURCE_TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`library-filter-option ${selectedType === t.id ? 'active' : ''}`}
              onClick={() => onSelectType(t.id)}
            >
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Enfoque Terapéutico */}
      <div className="library-filter-group mb-0">
        <div className="library-filter-title">Enfoque Terapéutico</div>
        <div className="d-flex flex-column gap-1">
          {THERAPY_APPROACHES.map((app) => (
            <button
              key={app.id}
              type="button"
              className={`library-filter-option ${selectedTherapy === app.id ? 'active' : ''}`}
              onClick={() => onSelectTherapy(app.id)}
            >
              <span>{app.label}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
