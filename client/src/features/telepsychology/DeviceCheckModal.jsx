import React, { useState, useEffect, useRef } from 'react';

export default function DeviceCheckModal({ onComplete }) {
  const [status, setStatus] = useState('checking'); // checking, ok, error
  const [errorMsg, setErrorMsg] = useState('');
  const [micLevel, setMicLevel] = useState(0);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const initDevices = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        
        if (!isMounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Setup audio analyzer
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = audioContext;
        const analyser = audioContext.createAnalyser();
        analyserRef.current = analyser;
        analyser.fftSize = 256;
        
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        const updateMicLevel = () => {
          if (!isMounted) return;
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const average = sum / dataArray.length;
          // Map 0-255 to 0-100 percentage
          const level = Math.min(100, Math.round((average / 255) * 100 * 2)); // * 2 to make it more sensitive
          setMicLevel(level);
          animationFrameRef.current = requestAnimationFrame(updateMicLevel);
        };
        
        updateMicLevel();
        setStatus('ok');

      } catch (err) {
        if (!isMounted) return;
        console.error("Error accessing media devices:", err);
        setStatus('error');
        if (err.name === 'NotAllowedError') {
          setErrorMsg('No has dado permiso para usar la cámara o el micrófono. Por favor, permítelos en tu navegador y recarga la página.');
        } else if (err.name === 'NotFoundError') {
          setErrorMsg('No se encontró una cámara o micrófono conectado a este dispositivo.');
        } else {
          setErrorMsg('Ocurrió un error al intentar acceder a tus dispositivos. (' + err.message + ')');
        }
      }
    };

    initDevices();

    return () => {
      isMounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  const handleContinue = () => {
    // Stop tracks before continuing so they aren't locked if we want to re-acquire them later
    if (streamRef.current) {
       streamRef.current.getTracks().forEach(track => track.stop());
    }
    onComplete();
  };

  return (
    <div className="device-check-overlay">
      <div className="device-check-card">
        <h2>Verificación de dispositivos</h2>
        <p className="description">
          Antes de entrar a la sala, necesitamos comprobar que tu cámara y micrófono funcionan correctamente.
        </p>

        {status === 'error' && (
          <div className="device-error-help">
            <h4>❌ Problema con los dispositivos</h4>
            <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>{errorMsg}</p>
            <ul>
              <li>Revisa que el navegador tenga permisos para acceder a la cámara y micrófono (ícono de candado en la barra de direcciones).</li>
              <li>Asegúrate de que ninguna otra aplicación (como Zoom o Skype) esté usando la cámara.</li>
              <li>Verifica que tus dispositivos estén bien conectados.</li>
            </ul>
          </div>
        )}

        <div className="device-preview">
          {status === 'checking' && <div className="no-camera">Conectando...</div>}
          {status === 'error' && <div className="no-camera">Cámara no disponible</div>}
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            style={{ display: status === 'ok' ? 'block' : 'none' }}
          />
        </div>

        <div className="device-status-list">
          <div className={`device-status-item ${status}`}>
            <span>{status === 'ok' ? '✅' : status === 'error' ? '❌' : '⏳'}</span>
            <span>Cámara {status === 'ok' ? 'detectada y funcionando' : status === 'error' ? 'no disponible' : 'comprobando...'}</span>
          </div>
          
          <div className={`device-status-item ${status}`}>
            <span style={{ minWidth: '24px' }}>{status === 'ok' ? '✅' : status === 'error' ? '❌' : '⏳'}</span>
            <div style={{ flex: 1 }}>
              <span>Micrófono {status === 'ok' ? 'detectado' : status === 'error' ? 'no disponible' : 'comprobando...'}</span>
              {status === 'ok' && (
                <div className="mic-level-container">
                  <div className="mic-level-label">🎤</div>
                  <div className="mic-level-bar">
                    <div className="mic-level-fill" style={{ width: `${micLevel}%` }}></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button 
            className="btn btn-primary" 
            onClick={handleContinue}
            disabled={status !== 'ok'}
            style={{ width: '100%', padding: '0.75rem' }}
          >
            {status === 'ok' ? 'Continuar a la sala de espera' : 'Esperando dispositivos...'}
          </button>
        </div>
      </div>
    </div>
  );
}
