/* ==========================================================================
   LibraryFilterSidebar — Barra y menú desplegable de filtros para Biblioteca
   
   En móvil (< 992px) funciona como un menú desplegable compacto para que
   las tarjetas de recursos aparezcan inmediatamente arriba sin tener que
   desplazarse hasta el fondo.
   Incluye menús desplegables (selects) para Visibilidad, Tipo de Recurso
   y Enfoque Terapéutico, además de chips rápidos de filtros activos.
   ========================================================================== */

import { useState } from 'react';
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
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilters =
    selectedScope !== 'ALL' || selectedType !== 'ALL' || selectedTherapy !== 'ALL';

  const activeFilterCount =
    (selectedScope !== 'ALL' ? 1 : 0) +
    (selectedType !== 'ALL' ? 1 : 0) +
    (selectedTherapy !== 'ALL' ? 1 : 0);

  const handleClearAll = () => {
    onSelectScope('ALL');
    onSelectType('ALL');
    onSelectTherapy('ALL');
  };

  return (
    <aside className="library-sidebar" aria-label="Filtros de la biblioteca">
      {/* ── Botón Desplegable para Móviles / Tablets (< 992px) ── */}
      <button
        type="button"
        className={`library-mobile-filter-toggle ${hasActiveFilters ? 'has-active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="d-flex align-items-center gap-2">
          <span className="toggle-icon">🎛️</span>
          <span className="toggle-label fw-semibold">Filtros de biblioteca</span>
          {hasActiveFilters && (
            <span className="badge bg-primary text-white rounded-pill px-2 py-1">
              {activeFilterCount} activo{activeFilterCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="text-muted small">
            {totalResults} {totalResults === 1 ? 'recurso' : 'recursos'}
          </span>
          <span className="toggle-arrow">{isOpen ? '▲' : '▼'}</span>
        </div>
      </button>

      {/* ── Chips rápidos de filtros activos (visibles sin abrir el menú) ── */}
      {hasActiveFilters && (
        <div className="library-active-chips">
          {selectedScope !== 'ALL' && (
            <button
              type="button"
              className="library-chip"
              onClick={() => onSelectScope('ALL')}
              title="Quitar filtro de visibilidad"
            >
              <span>{selectedScope === 'PUBLIC' ? '🌐 Públicos' : '🔒 Privados'}</span>
              <span className="chip-remove">✕</span>
            </button>
          )}

          {selectedType !== 'ALL' && (
            <button
              type="button"
              className="library-chip"
              onClick={() => onSelectType('ALL')}
              title="Quitar filtro de tipo"
            >
              <span>{RESOURCE_TYPES.find((t) => t.id === selectedType)?.label}</span>
              <span className="chip-remove">✕</span>
            </button>
          )}

          {selectedTherapy !== 'ALL' && (
            <button
              type="button"
              className="library-chip"
              onClick={() => onSelectTherapy('ALL')}
              title="Quitar filtro de enfoque"
            >
              <span>{THERAPY_APPROACHES.find((a) => a.id === selectedTherapy)?.label}</span>
              <span className="chip-remove">✕</span>
            </button>
          )}

          <button
            type="button"
            className="library-chip library-chip--clear"
            onClick={handleClearAll}
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {/* ── Panel de Filtros Desplegables ── */}
      <div className={`library-sidebar-panel ${isOpen ? 'is-open' : 'is-collapsed'}`}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="fw-bold text-dark small text-uppercase">Opciones de Filtro</span>
          {hasActiveFilters ? (
            <button
              type="button"
              className="btn btn-link btn-sm p-0 text-decoration-none text-danger small"
              onClick={handleClearAll}
            >
              Restablecer
            </button>
          ) : (
            <span className="badge bg-light text-secondary border">
              {totalResults} {totalResults === 1 ? 'material' : 'materiales'}
            </span>
          )}
        </div>

        {/* ── Menú desplegable: Visibilidad ── */}
        <div className="library-filter-group">
          <label className="library-filter-title" htmlFor="filter-scope">
            Visibilidad
          </label>
          <select
            id="filter-scope"
            className="form-select form-select-sm library-select"
            value={selectedScope}
            onChange={(e) => onSelectScope(e.target.value)}
          >
            <option value="ALL">Todos los materiales</option>
            <option value="PUBLIC">🌐 Públicos (Comunidad)</option>
            <option value="PRIVATE">🔒 Privados (Mi clínica)</option>
          </select>
        </div>

        {/* ── Menú desplegable: Tipo de Recurso ── */}
        <div className="library-filter-group">
          <label className="library-filter-title" htmlFor="filter-type">
            Tipo de Recurso
          </label>
          <select
            id="filter-type"
            className="form-select form-select-sm library-select"
            value={selectedType}
            onChange={(e) => onSelectType(e.target.value)}
          >
            {RESOURCE_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* ── Menú desplegable: Enfoque Terapéutico ── */}
        <div className="library-filter-group mb-3">
          <label className="library-filter-title" htmlFor="filter-therapy">
            Enfoque Terapéutico
          </label>
          <select
            id="filter-therapy"
            className="form-select form-select-sm library-select"
            value={selectedTherapy}
            onChange={(e) => onSelectTherapy(e.target.value)}
          >
            {THERAPY_APPROACHES.map((app) => (
              <option key={app.id} value={app.id}>
                {app.label}
              </option>
            ))}
          </select>
        </div>

        {/* Botón para cerrar y aplicar en móvil */}
        <div className="library-mobile-apply-wrap">
          <button
            type="button"
            className="btn btn-primary btn-sm w-100"
            onClick={() => setIsOpen(false)}
          >
            Ver {totalResults} {totalResults === 1 ? 'material' : 'materiales'}
          </button>
        </div>
      </div>
    </aside>
  );
}
