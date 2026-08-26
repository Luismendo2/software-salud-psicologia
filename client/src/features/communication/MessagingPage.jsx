import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';
import * as commService from '../../services/communicationService';

export default function MessagingPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);

  // Cargar conversaciones
  useEffect(() => {
    const load = async () => {
      try {
        const data = await commService.getConversations(user.id);
        setConversations(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user.id]);

  // Cargar mensajes cuando cambia la conversación activa
  const loadMessages = useCallback(async (convId) => {
    if (!convId) return;
    const msgs = await commService.getMessages(convId);
    setMessages(msgs);
    // Marcar como leídos
    await commService.markMessagesRead(convId, user.id);
    // Actualizar unread en la lista
    setConversations(prev => prev.map(c =>
      c.id === convId ? { ...c, unreadCount: 0 } : c
    ));
  }, [user.id]);

  useEffect(() => {
    if (activeConvId) {
      loadMessages(activeConvId);
    }
  }, [activeConvId, loadMessages]);

  // Polling cada 10s
  useEffect(() => {
    if (!activeConvId) return;
    pollingRef.current = setInterval(() => {
      loadMessages(activeConvId);
    }, 10000);
    return () => clearInterval(pollingRef.current);
  }, [activeConvId, loadMessages]);

  const chatMessagesRef = useRef(null);

  // Auto scroll solo cuando cambia la conversación
  useEffect(() => {
    setTimeout(() => {
      if (chatMessagesRef.current) {
        chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
      }
    }, 100);
  }, [activeConvId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      const msg = await commService.sendMessage(
        activeConvId,
        user.id,
        `${user.firstName} ${user.lastName}`,
        newMessage.trim()
      );
      setMessages(prev => [...prev, msg]);
      setNewMessage('');
      // Actualizar lastMessageAt
      setConversations(prev => prev.map(c =>
        c.id === activeConvId ? { ...c, lastMessageAt: msg.createdAt } : c
      ).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)));
      
      // Scroll abajo al enviar
      setTimeout(() => {
        if (chatMessagesRef.current) {
          chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
      }, 50);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const activeConv = conversations.find(c => c.id === activeConvId);

  const formatTime = (iso) => {
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-gray-500)' }}>Cargando mensajería...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>💬 Mensajería</h1>
      </div>

      <div className={`messaging-layout ${activeConvId ? 'chat-open' : ''}`}>
        {/* Lista de conversaciones */}
        <div className="conversations-list">
          <div className="conversations-list-header">Conversaciones</div>
          {conversations.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-gray-500)', fontSize: '0.875rem' }}>
              No hay conversaciones aún.
            </div>
          ) : (
            conversations.map(conv => {
              const convMessages = commService.getMessages ? null : [];
              const initials = conv.patientName.split(' ').map(w => w[0]).join('').slice(0, 2);
              return (
                <div
                  key={conv.id}
                  className={`conversation-item ${activeConvId === conv.id ? 'active' : ''}`}
                  onClick={() => setActiveConvId(conv.id)}
                >
                  <div className="conversation-avatar">{initials}</div>
                  <div className="conversation-info">
                    <div className="conversation-name">{conv.patientName}</div>
                    <div className="conversation-preview">Último mensaje...</div>
                  </div>
                  <div className="conversation-meta">
                    <div className="conversation-time">{formatTime(conv.lastMessageAt)}</div>
                    {conv.unreadCount > 0 && (
                      <div className="conversation-badge">{conv.unreadCount}</div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Panel de chat */}
        <div className="chat-panel">
          {!activeConv ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--color-gray-400)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
              <p>Selecciona una conversación para empezar</p>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <button className="chat-header-back" onClick={() => setActiveConvId(null)}>←</button>
                <div className="conversation-avatar">
                  {activeConv.patientName.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: '0.9375rem' }}>
                    {activeConv.patientName}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-gray-500)' }}>
                    Paciente
                  </div>
                </div>
              </div>

              <div className="chat-messages" ref={chatMessagesRef}>
                {messages.map(msg => (
                  <div key={msg.id} className={`chat-bubble ${msg.senderId === user.id ? 'sent' : 'received'}`}>
                    <div>{msg.content}</div>
                    <div className="chat-bubble-time">
                      {new Date(msg.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                      {msg.senderId === user.id && msg.readAt && ' ✓✓'}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form className="chat-input-bar" onSubmit={handleSend}>
                <input
                  className="form-control"
                  type="text"
                  placeholder="Escribe un mensaje..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={sending}
                />
                <button type="submit" className="btn btn-primary" disabled={sending || !newMessage.trim()}>
                  Enviar
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
