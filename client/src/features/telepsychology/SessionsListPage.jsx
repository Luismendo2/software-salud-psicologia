import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVideoSessions } from '../../services/telepsychologyService';
import { SESSION_STATUS_CONFIG } from '../../mocks/telepsychologyMock';

const formatDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-CO', { 
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

export default function SessionsListPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    let isMounted = true;
    const fetchSessions = async () => {
      setLoading(true);
      try {
        const response = await getVideoSessions({ status: filter });
        if (isMounted) {
          setSessions(response.data);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching sessions:", err);
        if (isMounted) setLoading(false);
      }
    };
    fetchSessions();
    return () => { isMounted = false; };
  }, [filter]);

  return (
    <div className="tele-sessions-page">
      <div className="tele-header">
        <div>
          <h1>Telepsicología</h1>
          <p>Gestiona tus sesiones virtuales y videollamadas</p>
        </div>
      </div>

      <div className="tele-filters">
        <div className="tele-filter-group">
          <label>Estado</label>
          <select 
            className="form-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="ALL">Todas las sesiones</option>
            <option value="WAITING">En espera</option>
            <option value="ACTIVE">En curso</option>
            <option value="ENDED">Finalizadas</option>
          </select>
        </div>
      </div>

      <div className="tele-table-wrapper">
        <table className="tele-table">
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Concepto</th>
              <th>Fecha Programada</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>Cargando sesiones...</td>
              </tr>
            ) : sessions.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-gray-500)' }}>
                  No se encontraron sesiones virtuales para este filtro.
                </td>
              </tr>
            ) : (
              sessions.map(session => {
                const statusConfig = SESSION_STATUS_CONFIG[session.status] || SESSION_STATUS_CONFIG.ERROR;
                
                return (
                  <tr key={session.id}>
                    <td>
                      <strong>{session.patientName}</strong>
                    </td>
                    <td>{session.concept}</td>
                    <td>{formatDate(session.scheduledAt)}</td>
                    <td>
                      <span className={`tele-status tele-status--${session.status.toLowerCase()}`}>
                        {statusConfig.icon} {statusConfig.label}
                      </span>
                    </td>
                    <td>
                      {session.status === 'WAITING' || session.status === 'ACTIVE' ? (
                        <button 
                          className="btn btn-primary"
                          style={{ padding: '0.25rem 0.75rem', fontSize: '0.8125rem' }}
                          onClick={() => navigate(`/session/${session.appointmentId}/host`)}
                        >
                          Ir a la sala
                        </button>
                      ) : (
                        <button 
                          className="btn btn-outline-secondary"
                          style={{ padding: '0.25rem 0.75rem', fontSize: '0.8125rem' }}
                          onClick={() => navigate(`/session/${session.appointmentId}/host`)}
                        >
                          Ver detalle
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
