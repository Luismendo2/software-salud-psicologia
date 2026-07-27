/* ==========================================================================
   PatientDashboard — Panel principal del paciente
   
   Muestra un saludo, la próxima cita destacada, y alertas
   sobre formularios o consentimientos pendientes.
   Este es el centro de control del paciente.
   ========================================================================== */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPatientProfile, getUpcomingAppointments, getConsents } from '../../services/patientService';
import StatusBadge from '../agenda/StatusBadge';

export default function PatientDashboard() {
  const [profile, setProfile] = useState(null);
  const [nextAppointment, setNextAppointment] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [profileData, appointments, consents] = await Promise.all([
        getPatientProfile(),
        getUpcomingAppointments(),
        getConsents(),
      ]);

      setProfile(profileData);

      // La próxima cita es la primera del array (ya ordenadas por fecha)
      if (appointments.length > 0) {
        setNextAppointment(appointments[0]);
      }

      // Construir alertas dinámicas
      const newAlerts = [];
      if (!profileData.intakeFormCompleted) {
        newAlerts.push({
          id: 'intake',
          icon: '📝',
          title: 'Formulario de ingreso pendiente',
          description: 'Completa tu formulario de anamnesis antes de la primera sesión.',
          link: '/portal/documentos/ingreso',
          linkText: 'Completar ahora',
          severity: 'warning',
        });
      }

      const pendingConsents = consents.filter(c => !c.signed);
      if (pendingConsents.length > 0) {
        newAlerts.push({
          id: 'consents',
          icon: '✍️',
          title: `${pendingConsents.length} consentimiento${pendingConsents.length > 1 ? 's' : ''} pendiente${pendingConsents.length > 1 ? 's' : ''}`,
          description: 'Firma tus consentimientos para habilitar tu proceso terapéutico.',
          link: '/portal/documentos',
          linkText: 'Revisar y firmar',
          severity: 'info',
        });
      }

      setAlerts(newAlerts);
    } catch (err) {
      console.error('Error cargando dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5" style={{ color: 'var(--color-gray-400)' }}>
        Cargando tu portal...
      </div>
    );
  }

  const greeting = getGreeting();

  return (
    <div className="portal-dashboard">
      {/* ── Saludo ── */}
      <div className="portal-greeting">
        <h1>
          {greeting}, {profile?.firstName} 👋
        </h1>
        <p>Este es tu espacio personal de bienestar.</p>
      </div>

      {/* ── Alertas pendientes ── */}
      {alerts.length > 0 && (
        <div className="portal-alerts">
          {alerts.map(alert => (
            <div key={alert.id} className={`portal-alert portal-alert--${alert.severity}`}>
              <span className="portal-alert-icon">{alert.icon}</span>
              <div className="portal-alert-content">
                <strong>{alert.title}</strong>
                <p>{alert.description}</p>
              </div>
              <Link to={alert.link} className="portal-alert-action">
                {alert.linkText} →
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* ── Próxima cita ── */}
      {nextAppointment ? (
        <div className="portal-next-appointment">
          <div className="portal-section-header">
            <h2>Tu próxima cita</h2>
            <Link to="/portal/citas" className="portal-section-link">Ver todas →</Link>
          </div>
          <div className="portal-appointment-card portal-appointment-card--highlight">
            <div className="portal-appointment-date">
              <span className="portal-appointment-weekday">
                {new Date(nextAppointment.date).toLocaleDateString('es-CO', { weekday: 'long' })}
              </span>
              <span className="portal-appointment-day">
                {new Date(nextAppointment.date).getDate()}
              </span>
              <span className="portal-appointment-month">
                {new Date(nextAppointment.date).toLocaleDateString('es-CO', { month: 'short' })}
              </span>
            </div>
            <div className="portal-appointment-info">
              <div className="portal-appointment-time">
                {new Date(nextAppointment.startTime).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                {' – '}
                {new Date(nextAppointment.endTime).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="portal-appointment-psych">{nextAppointment.psychologistName}</div>
              <div className="portal-appointment-meta">
                <StatusBadge status={nextAppointment.status} />
                <span className="portal-appointment-type">
                  {nextAppointment.type === 'VIRTUAL' ? '💻 Virtual' : '🏥 Presencial'}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="portal-empty-state">
          <span className="portal-empty-icon">📅</span>
          <h3>Sin citas programadas</h3>
          <p>Cuando tu terapeuta agende una sesión, la verás aquí.</p>
        </div>
      )}


    </div>
  );
}

/** Devuelve un saludo según la hora del día */
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 18) return 'Buenas tardes';
  return 'Buenas noches';
}
