import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';
import * as commService from '../../services/communicationService';

export default function MessageInboxPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);

  // En el portal del paciente, usualmente solo hay 1 conversación (con su psicólogo principal).
  // Por simplicidad del MVP, seleccionamos la primera conversación automáticamente.

  useEffect(() => {
    const load = async () => {
      try {
        const data = await commService.getConversations(user.id);
        const myConvs = data.filter(c => c.patientId === user.id);
        setConversations(myConvs);
        if (myConvs.length > 0) {
          setActiveConvId(myConvs[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user.id]);

  const loadMessages = useCallback(async (convId) => {
    if (!convId) return;
    const msgs = await commService.getMessages(convId);
    setMessages(msgs);
    await commService.markMessagesRead(convId, user.id);
  }, [user.id]);

  useEffect(() => {
    if (activeConvId) {
      loadMessages(activeConvId);
    }
  }, [activeConvId, loadMessages]);

  useEffect(() => {
    if (!activeConvId) return;
    pollingRef.current = setInterval(() => {
      loadMessages(activeConvId);
    }, 10000);
    return () => clearInterval(pollingRef.current);
  }, [activeConvId, loadMessages]);

  const chatMessagesRef = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      if (chatMessagesRef.current) {
        chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
      }
    }, 100);
  }, [activeConvId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !activeConvId) return;
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

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-gray-500)' }}>Cargando tus mensajes...</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', height: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-md)' }}>Mensajes</h1>
      
      <div className="chat-emergency-banner">
        <strong>Atención:</strong> Este chat no es para emergencias. El tiempo de respuesta de tu terapeuta puede variar. Si estás en una crisis, comunícate con la línea de ayuda local.
      </div>

      <div style={{ flex: 1, backgroundColor: 'var(--color-surface)', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!activeConv ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gray-500)' }}>
            No tienes conversaciones activas.
          </div>
        ) : (
          <>
            <div className="chat-header">
              <div className="conversation-avatar">
                {activeConv.psychologistName.split(' ').map(w => w[0]).join('').slice(0, 2)}
              </div>
              <div>
                <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>{activeConv.psychologistName}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>Psicólogo tratante</div>
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
  );
}
