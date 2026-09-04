import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import * as orgService from '../../services/organizationService';
import { SUPERVISION_STATUS_CONFIG } from '../../mocks/organizationMock';

export default function SupervisionQueuePage() {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    const fetchCases = async () => {
      try {
        // En un caso real, pasaríamos el ID del supervisor.
        // Simulamos obtener la cola del supervisor actual.
        const data = await orgService.getSupervisionCases({ supervisorId: user.id });
        setCases(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, [user.id]);

  const filteredCases = filterStatus === 'ALL' 
    ? cases 
    : cases.filter(c => c.status === filterStatus);

  const pendingCount = cases.filter(c => c.status === 'PENDING_REVIEW').length;
  const inReviewCount = cases.filter(c => c.status === 'IN_REVIEW').length;
  const resolvedCount = cases.filter(c => c.status === 'RESOLVED').length;

  if (!hasRole(['ADMIN', 'PSYCHOLOGIST'])) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>No tienes permiso para ver esta página.</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🎓 Supervisión Clínica</h1>
        <p className="page-subtitle">Revisa y proporciona retroalimentación sobre los casos de tu equipo.</p>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-gray-500)' }}>Cargando casos...</div>
      ) : (
        <>
          <div className="supervision-stats">
            <div className="supervision-stat-card">
              <div className="supervision-stat-value" style={{ color: '#d97706' }}>{pendingCount}</div>
              <div className="supervision-stat-label">Casos Pendientes</div>
            </div>
            <div className="supervision-stat-card">
              <div className="supervision-stat-value" style={{ color: '#2563eb' }}>{inReviewCount}</div>
              <div className="supervision-stat-label">En Revisión</div>
            </div>
            <div className="supervision-stat-card">
              <div className="supervision-stat-value" style={{ color: '#16a34a' }}>{resolvedCount}</div>
              <div className="supervision-stat-label">Resueltos</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Cola de Casos</h2>
            <select 
              className="form-control" 
              style={{ width: 'auto' }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">Todos los estados</option>
              <option value="PENDING_REVIEW">Pendientes</option>
              <option value="IN_REVIEW">En revisión</option>
              <option value="RESOLVED">Resueltos</option>
            </select>
          </div>

          {filteredCases.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', color: 'var(--color-gray-500)' }}>
              No hay casos que coincidan con el filtro seleccionado.
            </div>
          ) : (
            <div>
              {filteredCases.map(c => (
                <div 
                  key={c.id} 
                  className={`supervision-case-card ${c.status === 'PENDING_REVIEW' ? 'pending' : c.status === 'IN_REVIEW' ? 'in-review' : 'resolved'}`}
                  onClick={() => navigate(`/equipo/supervision/${c.id}`)}
                >
                  <div className="supervision-case-header">
                    <div>
                      <div className="supervision-case-patient">
                        {c.isAnonymized ? c.patientAlias : c.patientName}
                      </div>
                      <div className="supervision-case-therapist">
                        Terapeuta: {c.superviseeName}
                      </div>
                    </div>
                    <span className="org-role-badge" style={{ backgroundColor: SUPERVISION_STATUS_CONFIG[c.status]?.bgColor, color: SUPERVISION_STATUS_CONFIG[c.status]?.color }}>
                      {SUPERVISION_STATUS_CONFIG[c.status]?.icon} {SUPERVISION_STATUS_CONFIG[c.status]?.label}
                    </span>
                  </div>
                  
                  <div className="supervision-case-excerpt">
                    "{c.noteExcerpt}"
                  </div>
                  
                  <div className="supervision-case-footer">
                    <div>Enviado el {new Date(c.createdAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                    {c.isAnonymized && (
                      <span className="anonymized-badge">🔒 Anonimizado</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
