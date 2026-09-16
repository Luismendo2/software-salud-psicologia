/* ==========================================================================
   CrisisModal — Modal de asistencia de emergencia para el paciente (Feature 012)
   Abre inmediatamente con protocolo personalizado, Línea 106 y botón de alerta.
   ========================================================================== */

import { useState, useEffect } from 'react';
import { getCrisisConfig, triggerCrisisAlert } from '../../services/crisisService';

export default function CrisisModal({ isOpen, onClose, user }) {
  const [config, setConfig] = useState(null);
  const [alertSending, setAlertSending] = useState(false);
  const [alertSent, setAlertSent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Carga rápida para cumplir CA-11 (< 500ms)
      getCrisisConfig(user?.id || 'p1').then((data) => {
        setConfig(data);
      });
    } else {
      setAlertSent(false);
      setAlertSending(false);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSendAlert = async () => {
    setAlertSending(true);
    try {
      await triggerCrisisAlert(user?.id || 'p1', {
        name: user ? `${user.firstName} ${user.lastName}` : 'Carlos Mendoza',
      });
      setAlertSent(true);
    } catch (err) {
      console.error('Error enviando alerta de crisis:', err);
    } finally {
      setAlertSending(false);
    }
  };

  return (
    <div className="crisis-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="crisis-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Cabecera del Modal */}
        <div className="crisis-modal-header">
          <div>
            <h2 className="crisis-modal-title">
              <span aria-hidden="true">🚨</span> Centro de Asistencia Inmediata
            </h2>
            <p className="crisis-modal-subtitle">
              Estamos aquí para apoyarte. Sigue estos pasos para tu bienestar.
            </p>
          </div>
          <button
            type="button"
            className="pwa-banner-close-btn"
            onClick={onClose}
            aria-label="Cerrar modal"
            style={{ fontSize: '1.5rem' }}
          >
            ×
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="crisis-modal-body">
          {/* Descargo de responsabilidad */}
          <div className="crisis-disclaimer">
            <strong>⚠️ Importante:</strong> Esta plataforma no reemplaza el servicio de urgencias médicas.
            Si te encuentras ante un riesgo vital inminente o crisis aguda grave, llama inmediatamente
            a la línea de emergencias o acude al centro de salud más cercano.
          </div>

          {/* Línea Nacional de Crisis (Colombia - Línea 106) */}
          <div className="crisis-hotline-box">
            <div className="crisis-hotline-info">
              <h4>Línea Nacional 106</h4>
              <p>Atención psicológica profesional gratuita, confidencial 24/7 en Colombia.</p>
            </div>
            <a
              href="tel:106"
              className="crisis-hotline-call-btn"
              title="Llamar a la Línea 106"
            >
              📞 Marcar 106
            </a>
          </div>

          {/* Protocolo Personalizado de Crisis */}
          {config?.protocolSteps && config.protocolSteps.length > 0 && (
            <div>
              <div className="crisis-section-title">
                Protocolo indicado por {config.therapistName || 'tu psicólogo'}
              </div>
              <div className="crisis-protocol-steps">
                {config.protocolSteps.map((step, idx) => (
                  <div key={idx} className="crisis-protocol-step">
                    <span className="crisis-step-num">{idx + 1}.</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contactos de Emergencia Personales */}
          {config?.emergencyContacts && config.emergencyContacts.length > 0 && (
            <div>
              <div className="crisis-section-title">Tus contactos de apoyo personal</div>
              <div className="crisis-contacts-list">
                {config.emergencyContacts.map((contact) => (
                  <div key={contact.id} className="crisis-contact-card">
                    <div>
                      <div className="crisis-contact-name">{contact.name}</div>
                      <div className="crisis-contact-rel">{contact.relationship}</div>
                    </div>
                    <a
                      href={`tel:${contact.phone}`}
                      className="crisis-contact-btn"
                      title={`Llamar a ${contact.name}`}
                    >
                      📞 {contact.phone}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botón de Alerta Automática al Terapeuta */}
          <div>
            {!alertSent ? (
              <button
                type="button"
                className="crisis-alert-therapist-btn"
                onClick={handleSendAlert}
                disabled={alertSending}
              >
                {alertSending ? (
                  'Notificando a tu terapeuta...'
                ) : (
                  <>
                    <span>📲</span> Notificar a {config?.therapistName || 'mi psicólogo'} ahora
                  </>
                )}
              </button>
            ) : (
              <div className="crisis-alert-sent">
                <strong>✓ Alerta enviada con éxito.</strong> Tu terapeuta ha sido notificado
                vía SMS prioritario y correo electrónico de que has activado el modo de apoyo.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
