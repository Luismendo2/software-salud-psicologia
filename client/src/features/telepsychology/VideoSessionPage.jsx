import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { getVideoSession, startSession, endSession } from '../../services/telepsychologyService';

export default function VideoSessionPage() {
  const { appointmentId } = useParams();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'host'; // 'host' (psychologist) or 'patient'
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);
  
  // Call state
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Media streams
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const chatEndRef = useRef(null);

  // Load session
  useEffect(() => {
    let isMounted = true;
    const fetchSession = async () => {
      try {
        const data = await getVideoSession(appointmentId);
        if (!isMounted) return;
        setSession(data);
        setLoading(false);
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Error al cargar la sesión.');
          setLoading(false);
        }
      }
    };
    fetchSession();
    return () => { isMounted = false; };
  }, [appointmentId]);

  // Setup local camera
  useEffect(() => {
    let isMounted = true;
    
    // Only request media if the session is ACTIVE or we are the host preparing to start
    if (session && (session.status === 'ACTIVE' || (session.status === 'WAITING' && role === 'host'))) {
      const startCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          if (!isMounted) {
            stream.getTracks().forEach(track => track.stop());
            return;
          }
          localStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Error accessing camera in session:", err);
          // Non-fatal for mock, we just show placeholder
        }
      };
      
      startCamera();
    }
    
    return () => {
      isMounted = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [session, role]);

  // Toggle media tracks
  useEffect(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
      });
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !isCamOff;
      });
    }
  }, [isMuted, isCamOff]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (showChat && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, showChat]);

  const handleStartSession = async () => {
    try {
      const updated = await startSession(appointmentId);
      setSession(updated);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEndSession = async () => {
    if (!window.confirm('¿Estás seguro de que deseas finalizar la sesión para todos los participantes?')) return;
    
    try {
      const updated = await endSession(appointmentId);
      setSession(updated);
      
      // Stop local camera
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    } catch (err) {
      alert(err.message);
    }
  };
  
  const handleLeavePatient = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    navigate('/portal');
  };

  const toggleChat = () => {
    setShowChat(!showChat);
    if (!showChat) setUnreadCount(0);
  };

  const sendChatMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    const msg = {
      id: Date.now(),
      sender: role === 'host' ? 'Tú (Psicólogo)' : 'Tú',
      text: newMessage,
      isMe: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setChatMessages([...chatMessages, msg]);
    setNewMessage('');
    
    // Simulate remote reply for demo purposes
    setTimeout(() => {
      const reply = {
        id: Date.now() + 1,
        sender: role === 'host' ? session?.patientName : session?.psychologistName,
        text: 'Mensaje recibido de prueba.',
        isMe: false,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, reply]);
      if (!showChat) setUnreadCount(prev => prev + 1);
    }, 2000);
  };

  if (loading) {
    return <div className="video-session-page" style={{ alignItems: 'center', justifyContent: 'center', color: 'white' }}>Cargando sesión...</div>;
  }

  if (error) {
    return (
      <div className="session-ended">
        <div className="session-ended-card">
          <div className="icon">⚠️</div>
          <h2>Error</h2>
          <p>{error}</p>
          <Link to="/" className="btn btn-primary">Volver al inicio</Link>
        </div>
      </div>
    );
  }

  if (session.status === 'ENDED') {
    return (
      <div className="session-ended">
        <div className="session-ended-card">
          <div className="icon">🏁</div>
          <h2>Sesión Finalizada</h2>
          <p>La videollamada ha concluido correctamente.</p>
          
          <div className="session-summary">
            <div className="session-summary-row">
              <span className="label">Paciente:</span>
              <span className="value">{session.patientName}</span>
            </div>
            <div className="session-summary-row">
              <span className="label">Profesional:</span>
              <span className="value">{session.psychologistName}</span>
            </div>
            <div className="session-summary-row">
              <span className="label">Duración:</span>
              <span className="value">{session.duration} min</span>
            </div>
          </div>
          
          <Link to={role === 'host' ? '/telepsicologia' : '/portal'} className="btn btn-primary" style={{ width: '100%', display: 'block', textAlign: 'center', padding: '0.75rem' }}>
            Volver al panel
          </Link>
        </div>
      </div>
    );
  }

  const remoteName = role === 'host' ? session.patientName : session.psychologistName;
  const isSessionActive = session.status === 'ACTIVE';

  return (
    <div className="video-session-page">
      {/* Top bar */}
      <div className="video-session-topbar">
        <div className="session-info">
          <h3>PsiAgenda · {session.concept}</h3>
          {isSessionActive && (
            <div className="recording-badge">
              <div className="recording-dot"></div>
              <span>EN CURSO</span>
            </div>
          )}
        </div>
        {isSessionActive && (
          <div className="session-timer">00:00:00</div>
        )}
      </div>

      <div className="video-grid-container">
        {/* Video Area */}
        <div className={`video-grid ${!isSessionActive ? 'single-view' : ''}`}>
          
          {/* Remote Video (Mocked) */}
          {isSessionActive && (
            <div className="video-tile remote">
              {/* Fake remote video background for mockup effect */}
              <div style={{ width: '100%', height: '100%', background: 'linear-gradient(45deg, #1f2937, #374151)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: '#e5e7eb' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👤</div>
                  <div>Simulando cámara de {remoteName}</div>
                </div>
              </div>
              <div className="participant-label">{remoteName}</div>
            </div>
          )}

          {/* Local Video */}
          <div className="video-tile local">
            {isCamOff ? (
              <div className="camera-off-placeholder">
                <div className="avatar">
                  {role === 'host' ? 'DR' : 'PA'}
                </div>
                <span>Cámara desactivada</span>
              </div>
            ) : (
              <video ref={localVideoRef} autoPlay playsInline muted />
            )}
            <div className="participant-label">
              Tú {isMuted && ' (Silenciado)'} 
              {role === 'host' && ' · Anfitrión'}
            </div>
            
            {/* If host and waiting, show start overlay */}
            {!isSessionActive && role === 'host' && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <h2 style={{ marginBottom: '0.5rem' }}>Sala de espera activa</h2>
                <p style={{ marginBottom: '1.5rem' }}>El paciente {session.patientName} está listo.</p>
                <button className="btn btn-primary" onClick={handleStartSession} style={{ padding: '0.75rem 1.5rem', fontSize: '1.1rem' }}>
                  Admitir e Iniciar Sesión
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Chat Panel */}
        {showChat && (
          <div className="chat-panel">
            <div className="chat-header">
              <h4>Chat de la sesión</h4>
              <button className="btn btn-outline-secondary" onClick={toggleChat} style={{ border: 'none', padding: '0.25rem 0.5rem' }}>✕</button>
            </div>
            
            <div className="chat-messages">
              {chatMessages.length === 0 ? (
                <div className="chat-empty">Los mensajes de este chat son privados y desaparecerán al finalizar la sesión.</div>
              ) : (
                chatMessages.map(msg => (
                  <div key={msg.id} className={`chat-message ${msg.isMe ? 'sent' : 'received'}`}>
                    <div className="sender">{msg.sender}</div>
                    <div>{msg.text}</div>
                    <div className="time">{msg.time}</div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>
            
            <form className="chat-input-area" onSubmit={sendChatMessage}>
              <input 
                type="text" 
                placeholder="Escribe un mensaje..." 
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                disabled={!isSessionActive}
              />
              <button type="submit" disabled={!newMessage.trim() || !isSessionActive}>➤</button>
            </form>
          </div>
        )}
      </div>

      {/* Controls Area */}
      <div className="video-controls">
        <button 
          className={`video-control-btn ${isMuted ? 'muted' : ''}`}
          onClick={() => setIsMuted(!isMuted)}
          title={isMuted ? "Activar micrófono" : "Silenciar micrófono"}
        >
          {isMuted ? '🔇' : '🎤'}
        </button>
        
        <button 
          className={`video-control-btn ${isCamOff ? 'muted' : ''}`}
          onClick={() => setIsCamOff(!isCamOff)}
          title={isCamOff ? "Activar cámara" : "Apagar cámara"}
        >
          {isCamOff ? '🚫' : '📹'}
        </button>
        
        <button 
          className={`video-control-btn chat-toggle ${unreadCount > 0 ? 'has-unread' : ''} ${showChat ? 'active' : ''}`}
          onClick={toggleChat}
          title="Chat"
        >
          💬
        </button>
        
        {role === 'host' ? (
          <button 
            className="video-control-btn end-call"
            onClick={handleEndSession}
            title="Finalizar sesión para todos"
            disabled={!isSessionActive}
          >
            ⏹️
          </button>
        ) : (
          <button 
            className="video-control-btn end-call"
            onClick={handleLeavePatient}
            title="Salir de la sesión"
          >
            🚪
          </button>
        )}
      </div>
    </div>
  );
}
