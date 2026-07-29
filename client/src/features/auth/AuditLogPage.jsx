/* ==========================================================================
   AuditLogPage — Registro de auditoría (solo ADMIN)
   
   Tabla paginada con filtros por usuario, tipo de recurso y rango de
   fechas. Muestra quién hizo qué, sobre qué recurso, desde qué IP,
   y cuándo. El registro es immutable (append-only).
   ========================================================================== */

import { useState, useEffect, useCallback } from 'react';
import { getAuditLogs } from '../../services/authService';
import { ROLE_LABELS, ROLE_COLORS } from '../../mocks/authMock';

const RESOURCE_TYPES = [
  { value: '', label: 'Todos los recursos' },
  { value: 'ClinicalRecord', label: 'Historia Clínica' },
  { value: 'SessionNote', label: 'Nota de Sesión' },
  { value: 'Appointment', label: 'Cita' },
  { value: 'Patient', label: 'Paciente' },
  { value: 'User', label: 'Usuario' },
  { value: 'Attachment', label: 'Archivo Adjunto' },
  { value: 'AuditLog', label: 'Auditoría' },
];

const ACTION_LABELS = {
  READ: { label: 'Lectura', icon: '👁️', color: '#dbeafe' },
  CREATE: { label: 'Creación', icon: '➕', color: '#dcfce7' },
  UPDATE: { label: 'Modificación', icon: '✏️', color: '#fef3c7' },
  DELETE: { label: 'Eliminación', icon: '🗑️', color: '#fee2e2' },
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    resourceType: '',
    dateFrom: '',
    dateTo: '',
  });
  const [expandedRow, setExpandedRow] = useState(null);

  const loadLogs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const result = await getAuditLogs({
        page,
        limit: 10,
        resourceType: filters.resourceType || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
      });
      setLogs(result.data);
      setPagination({ page: result.page, totalPages: result.totalPages, total: result.total });
    } catch (err) {
      console.error('Error cargando auditoría:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadLogs(1);
  }, [loadLogs]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const formatDate = (iso) => {
    return new Date(iso).toLocaleString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="audit-page">
      <div className="audit-header">
        <div>
          <h1>Registro de Auditoría</h1>
          <p>Historial inmutable de todas las acciones sobre datos sensibles.</p>
        </div>
        <div className="audit-total">
          <span className="audit-total-number">{pagination.total}</span>
          <span className="audit-total-label">registros</span>
        </div>
      </div>

      {/* ── Filtros ── */}
      <div className="audit-filters">
        <div className="audit-filter-group">
          <label>Tipo de recurso</label>
          <select
            className="form-select"
            value={filters.resourceType}
            onChange={(e) => handleFilterChange('resourceType', e.target.value)}
          >
            {RESOURCE_TYPES.map(rt => (
              <option key={rt.value} value={rt.value}>{rt.label}</option>
            ))}
          </select>
        </div>
        <div className="audit-filter-group">
          <label>Desde</label>
          <input
            type="date"
            className="form-control"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
          />
        </div>
        <div className="audit-filter-group">
          <label>Hasta</label>
          <input
            type="date"
            className="form-control"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
          />
        </div>
        {(filters.resourceType || filters.dateFrom || filters.dateTo) && (
          <button
            className="btn btn-outline-secondary btn-sm audit-clear-btn"
            onClick={() => setFilters({ resourceType: '', dateFrom: '', dateTo: '' })}
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* ── Tabla ── */}
      {loading ? (
        <div className="audit-loading">Cargando registros...</div>
      ) : logs.length === 0 ? (
        <div className="audit-empty">
          <span className="audit-empty-icon">📋</span>
          <h3>Sin registros</h3>
          <p>No se encontraron acciones con los filtros seleccionados.</p>
        </div>
      ) : (
        <>
          <div className="audit-table-wrapper">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Fecha y hora</th>
                  <th>Usuario</th>
                  <th>Acción</th>
                  <th>Recurso</th>
                  <th>IP</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => {
                  const actionInfo = ACTION_LABELS[log.action] || {};
                  const roleColor = ROLE_COLORS[log.userRole] || {};
                  const isExpanded = expandedRow === log.id;

                  return (
                    <tr key={log.id} className={isExpanded ? 'expanded' : ''}>
                      <td className="audit-td-date">
                        <div className="audit-date-main">{formatDate(log.timestamp)}</div>
                      </td>
                      <td>
                        <div className="audit-user-info">
                          <span className="audit-user-name">{log.userName}</span>
                          <span
                            className="audit-role-badge"
                            style={{ backgroundColor: roleColor.bg, color: roleColor.color }}
                          >
                            {ROLE_LABELS[log.userRole] || log.userRole}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          className="audit-action-badge"
                          style={{ backgroundColor: actionInfo.color }}
                        >
                          {actionInfo.icon} {actionInfo.label}
                        </span>
                      </td>
                      <td>
                        <div className="audit-resource-info">
                          <span className="audit-resource-type">{log.resourceType}</span>
                          {log.resourceLabel && (
                            <span className="audit-resource-label">{log.resourceLabel}</span>
                          )}
                        </div>
                      </td>
                      <td className="audit-td-ip">
                        <code>{log.ipAddress}</code>
                      </td>
                      <td>
                        {log.metadata && (
                          <button
                            className="audit-expand-btn"
                            onClick={() => setExpandedRow(isExpanded ? null : log.id)}
                            title="Ver detalles"
                          >
                            {isExpanded ? '▲' : '▼'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Filas expandidas con metadatos */}
          {logs.map(log => {
            if (expandedRow !== log.id || !log.metadata) return null;
            return (
              <div key={`meta-${log.id}`} className="audit-metadata-panel">
                <div className="audit-metadata-title">Metadatos adicionales</div>
                <pre className="audit-metadata-json">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              </div>
            );
          })}

          {/* ── Paginación ── */}
          {pagination.totalPages > 1 && (
            <div className="audit-pagination">
              <button
                className="btn btn-outline-secondary btn-sm"
                disabled={pagination.page <= 1}
                onClick={() => loadLogs(pagination.page - 1)}
              >
                ← Anterior
              </button>
              <span className="audit-page-info">
                Página {pagination.page} de {pagination.totalPages}
              </span>
              <button
                className="btn btn-outline-secondary btn-sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => loadLogs(pagination.page + 1)}
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
