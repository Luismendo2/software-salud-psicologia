/* ==========================================================================
   DocumentsPage — Hub de documentos del paciente
   
   Muestra los consentimientos (firmados o pendientes) y el acceso
   al formulario de ingreso (anamnesis). Actúa como índice
   de la sección /portal/documentos.
   ========================================================================== */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getConsents, getPatientProfile } from '../../services/patientService';

export default function DocumentsPage() {
  const [consents, setConsents] = useState([]);
  const [intakeCompleted, setIntakeCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [consentsData, profile] = await Promise.all([
        getConsents(),
        getPatientProfile(),
      ]);
      setConsents(consentsData);
      setIntakeCompleted(profile.intakeFormCompleted);
    } catch (err) {
      console.error('Error cargando documentos:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="portal-loading">Cargando documentos...</div>;
  }

  return (
    <div className="portal-page">
      <div className="portal-page-header">
        <h1>Mis documentos</h1>
        <p>Formularios y consentimientos de tu proceso terapéutico.</p>
      </div>

      {/* ── Formulario de ingreso ── */}
      <div className="portal-section">
        <div className="portal-section-header">
          <h2>Formulario de ingreso</h2>
        </div>
        <div className={`portal-document-card ${intakeCompleted ? 'completed' : 'pending'}`}>
          <div className="portal-document-icon">📝</div>
          <div className="portal-document-info">
            <h3>Anamnesis inicial</h3>
            <p>
              {intakeCompleted
                ? 'Formulario completado correctamente.'
                : 'Completa tus datos clínicos, motivo de consulta y antecedentes antes de tu primera sesión.'}
            </p>
          </div>
          <div className="portal-document-action">
            {intakeCompleted ? (
              <span className="portal-document-status completed">✓ Completado</span>
            ) : (
              <Link to="/portal/documentos/ingreso" className="btn btn-primary btn-sm">
                Completar
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Consentimientos ── */}
      <div className="portal-section">
        <div className="portal-section-header">
          <h2>Consentimientos informados</h2>
        </div>
        <div className="portal-documents-list">
          {consents.map(consent => (
            <div key={consent.type} className={`portal-document-card ${consent.signed ? 'completed' : 'pending'}`}>
              <div className="portal-document-icon">
                {consent.signed ? '✅' : '✍️'}
              </div>
              <div className="portal-document-info">
                <h3>{consent.title}</h3>
                <p>{consent.description}</p>
                {consent.signed && consent.signedAt && (
                  <span className="portal-document-date">
                    Firmado el {new Date(consent.signedAt).toLocaleDateString('es-CO')}
                  </span>
                )}
              </div>
              <div className="portal-document-action">
                {consent.signed ? (
                  <span className="portal-document-status completed">✓ Firmado</span>
                ) : (
                  <Link
                    to={`/portal/documentos/consentimiento/${consent.type}`}
                    className="btn btn-outline-primary btn-sm"
                  >
                    Revisar y firmar
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
