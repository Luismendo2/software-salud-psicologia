/* ==========================================================================
   PatientsListPage — Lista de pacientes del psicólogo
   
   Punto de entrada a la Historia Clínica. Muestra todos los pacientes
   asignados con su nombre, documento, última sesión y total de sesiones.
   Al hacer clic se navega a la HC del paciente seleccionado.
   ========================================================================== */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPatientsList } from '../../services/clinicalService';

export default function PatientsListPage() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const data = await getPatientsList();
      setPatients(data);
    } catch (err) {
      console.error('Error cargando pacientes:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = patients.filter(p =>
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    p.document.toLowerCase().includes(search.toLowerCase())
  );

  const active = filtered.filter(p => p.status === 'ACTIVE');
  const discharged = filtered.filter(p => p.status === 'DISCHARGED');

  return (
    <div className="clinical-page">
      <div className="clinical-page-header">
        <div>
          <h1>Historia Clínica</h1>
          <p>Selecciona un paciente para ver o editar su registro clínico.</p>
        </div>
      </div>

      {/* Buscador */}
      <div className="clinical-search-bar">
        <span className="clinical-search-icon">🔍</span>
        <input
          type="text"
          className="form-control"
          placeholder="Buscar por nombre o documento..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="clinical-loading">Cargando pacientes...</div>
      ) : filtered.length === 0 ? (
        <div className="clinical-empty">
          <span className="clinical-empty-icon">👥</span>
          <h3>Sin resultados</h3>
          <p>No se encontraron pacientes con ese criterio.</p>
        </div>
      ) : (
        <>
          {/* Pacientes activos */}
          {active.length > 0 && (
            <div className="clinical-section">
              <h2 className="clinical-section-title">
                Activos <span className="clinical-count">{active.length}</span>
              </h2>
              <div className="clinical-patients-grid">
                {active.map(patient => (
                  <PatientCard key={patient.id} patient={patient} />
                ))}
              </div>
            </div>
          )}

          {/* Pacientes dados de alta */}
          {discharged.length > 0 && (
            <div className="clinical-section">
              <h2 className="clinical-section-title">
                Alta terapéutica <span className="clinical-count">{discharged.length}</span>
              </h2>
              <div className="clinical-patients-grid">
                {discharged.map(patient => (
                  <PatientCard key={patient.id} patient={patient} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/** Tarjeta individual de paciente */
function PatientCard({ patient }) {
  const initials = `${patient.firstName[0]}${patient.lastName[0]}`;
  const lastSessionText = patient.lastSession
    ? new Date(patient.lastSession).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
    : 'Sin sesiones';

  return (
    <Link to={`/historia-clinica/${patient.id}`} className="clinical-patient-card">
      <div className={`clinical-patient-avatar ${patient.status === 'DISCHARGED' ? 'discharged' : ''}`}>
        {initials}
      </div>
      <div className="clinical-patient-info">
        <div className="clinical-patient-name">{patient.firstName} {patient.lastName}</div>
        <div className="clinical-patient-doc">{patient.document}</div>
        <div className="clinical-patient-meta">
          <span>{patient.totalSessions} sesiones</span>
          <span className="clinical-meta-dot">·</span>
          <span>Última: {lastSessionText}</span>
        </div>
      </div>
      <div className="clinical-patient-arrow">→</div>
    </Link>
  );
}
