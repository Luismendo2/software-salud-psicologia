import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSessionStatus, hasConsent, getVideoSession } from '../../services/telepsychologyService';
import TeleConsentModal from './TeleConsentModal';
import DeviceCheckModal from './DeviceCheckModal';

export default function WaitingRoomPage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  
  // En una app real, el patientId y nombre vienen del contexto de autenticación
  // Aquí los mockeamos temporalmente
  const patientId = 'pat-005'; 
  const patientName = 'Valentina Ortega';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);
  
  const [needsConsent, setNeedsConsent] = useState(false);
  const [needsDeviceCheck, setNeedsDeviceCheck] = useState(false);
  
  // Inicialización
  useEffect(() => {
    let isMounted = true;
    
    const init = async () => {
      try {
        const sessionData = await getVideoSession(appointmentId);
        if (!isMounted) return;
        setSession(sessionData);

        if (sessionData.status === 'ENDED') {
          setError('Esta sesión ya ha finalizado.');
          setLoading(false);
          return;
        }

        const consentStatus = await hasConsent(patientId);
        if (!consentStatus.hasConsent) {
          setNeedsConsent(true);
        } else {
          setNeedsDeviceCheck(true);
        }
        setLoading(false);

      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Error al cargar la sala de espera.');
          setLoading(false);
        }
      }
    };
    
    init();
    
    return () => { isMounted = false; };
  }, [appointmentId]);

  // Polling del estado de la sesión
  useEffect(() => {
    if (loading || error || needsConsent || needsDeviceCheck || !session) return;
    
    let intervalId;
    let isMounted = true;
    
    const pollStatus = async () => {
      try {
        const statusData = await getSessionStatus(appointmentId);
        if (!isMounted) return;
        
        if (statusData.status === 'ACTIVE') {
          // La sesión inició, ir a la videollamada
          navigate(`/session/${appointmentId}/call?role=patient`);
        } else if (statusData.status === 'ENDED') {
          setError('La sesión ha finalizado.');
        }
      } catch (err) {
        console.error("Error polling session status:", err);
      }
    };
    
    // Si ya está activa al entrar, navegar de inmediato
    if (session.status === 'ACTIVE') {
      navigate(`/session/${appointmentId}/call?role=patient`);
    } else if (session.status === 'WAITING') {
      // Si está en espera, hacer polling cada 3 segundos
      intervalId = setInterval(pollStatus, 3000);
    }
    
    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [appointmentId, loading, error, needsConsent, needsDeviceCheck, session, navigate]);

  const handleConsentSigned = () => {
    setNeedsConsent(false);
    setNeedsDeviceCheck(true);
  };

  const handleDeviceCheckComplete = () => {
    setNeedsDeviceCheck(false);
  };

  if (loading) {
    return (
      <div className="waiting-room">
        <div className="waiting-pulse"></div>
        <p style={{ color: 'var(--color-gray-600)' }}>Cargando sala de espera...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="waiting-room">
        <div className="waiting-room-card">
          <div className="waiting-room-logo">⚠️</div>
          <h1>No es posible acceder</h1>
          <p className="subtitle">{error}</p>
          <button className="btn btn-primary" onClick={() => navigate('/portal')}>
            Volver al portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="waiting-room">
      {needsConsent && (
        <TeleConsentModal 
          patientId={patientId} 
          patientName={patientName} 
          onConsentSigned={handleConsentSigned} 
        />
      )}
      
      {!needsConsent && needsDeviceCheck && (
        <DeviceCheckModal onComplete={handleDeviceCheckComplete} />
      )}
      
      {!needsConsent && !needsDeviceCheck && (
        <div className="waiting-room-card">
          <div className="waiting-room-logo">🧠</div>
          <h1>Sala de Espera</h1>
          <p className="subtitle">Tu terapeuta te atenderá en breve</p>
          
          <div className="waiting-message">
            <div className="waiting-pulse"></div>
            <span>Esperando a {session?.psychologistName || 'tu psicólogo'}...</span>
          </div>
          
          <div className="waiting-room-info">
            <div className="waiting-room-info-row">
              <span className="label">Cita:</span>
              <span className="value">{session?.concept}</span>
            </div>
            <div className="waiting-room-info-row">
              <span className="label">Profesional:</span>
              <span className="value">{session?.psychologistName}</span>
            </div>
            <div className="waiting-room-info-row">
              <span className="label">Estado de conexión:</span>
              <span className="value" style={{ color: 'var(--color-success)' }}>Dispositivos OK</span>
            </div>
          </div>
          
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-gray-500)' }}>
            Por favor, no cierres esta ventana. La sesión iniciará automáticamente cuando el profesional esté listo.
          </p>
        </div>
      )}
    </div>
  );
}
