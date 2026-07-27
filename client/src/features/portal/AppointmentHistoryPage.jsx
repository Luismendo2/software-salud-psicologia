/* ==========================================================================
   AppointmentHistoryPage — Historial y próximas citas del paciente
   
   Dos pestañas: "Próximas" y "Pasadas".
   El paciente ve fecha, hora, estado y modalidad de cada sesión.
   No tiene acceso a notas clínicas (restricción de la spec).
   ========================================================================== */

import { useState, useEffect } from 'react';
import { getUpcomingAppointments, getPastAppointments } from '../../services/patientService';
import StatusBadge from '../agenda/StatusBadge';

export default function AppointmentHistoryPage() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [upData, pastData] = await Promise.all([
        getUpcomingAppointments(),
        getPastAppointments(),
      ]);
      setUpcoming(upData);
      setPast(pastData);
    } catch (err) {
      console.error('Error cargando citas:', err);
    } finally {
      setLoading(false);
    }
  };

  const appointments = activeTab === 'upcoming' ? upcoming : past;

  return (
    <div className="portal-page">
      <div className="portal-page-header">
        <h1>Mis citas</h1>
        <p>Consulta tus sesiones programadas y tu historial.</p>
      </div>

      {/* Tabs */}
      <div className="portal-tabs">
        <button
          className={`portal-tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Próximas ({upcoming.length})
        </button>
        <button
          className={`portal-tab-btn ${activeTab === 'past' ? 'active' : ''}`}
          onClick={() => setActiveTab('past')}
        >
          Historial ({past.length})
        </button>
      </div>

      {/* Lista */}
      <div className="portal-appointments-list">
        {loading ? (
          <div className="portal-loading">Cargando citas...</div>
        ) : appointments.length === 0 ? (
          <div className="portal-empty-state">
            <span className="portal-empty-icon">{activeTab === 'upcoming' ? '📅' : '📂'}</span>
            <h3>{activeTab === 'upcoming' ? 'Sin citas próximas' : 'Sin historial aún'}</h3>
            <p>
              {activeTab === 'upcoming'
                ? 'Cuando tu terapeuta agende una sesión, aparecerá aquí.'
                : 'Aquí verás un registro de tus sesiones anteriores.'}
            </p>
          </div>
        ) : (
          appointments.map(apt => (
            <div key={apt.id} className="portal-appointment-card">
              <div className="portal-appointment-date">
                <span className="portal-appointment-weekday">
                  {new Date(apt.date).toLocaleDateString('es-CO', { weekday: 'short' })}
                </span>
                <span className="portal-appointment-day">
                  {new Date(apt.date).getDate()}
                </span>
                <span className="portal-appointment-month">
                  {new Date(apt.date).toLocaleDateString('es-CO', { month: 'short' })}
                </span>
              </div>
              <div className="portal-appointment-info">
                <div className="portal-appointment-time">
                  {new Date(apt.startTime).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                  {' – '}
                  {new Date(apt.endTime).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="portal-appointment-psych">{apt.psychologistName}</div>
                <div className="portal-appointment-meta">
                  <StatusBadge status={apt.status} />
                  <span className="portal-appointment-type">
                    {apt.type === 'VIRTUAL' ? '💻 Virtual' : '🏥 Presencial'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
