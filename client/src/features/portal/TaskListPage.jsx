import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import * as commService from '../../services/communicationService';
import { TASK_STATUS_CONFIG } from '../../mocks/communicationMock';

export default function TaskListPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [response, setResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTasks();
  }, [user.id]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await commService.getPatientTasks(user.id);
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    if (!response.trim() || submitting || !selectedTask) return;
    setSubmitting(true);
    try {
      await commService.respondToTask(selectedTask.id, response.trim());
      setSelectedTask(null);
      setResponse('');
      await loadTasks();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-gray-500)' }}>Cargando tus tareas...</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-md)' }}>Mis Tareas Terapéuticas</h1>
      <p style={{ color: 'var(--color-gray-600)', marginBottom: 'var(--space-xl)' }}>
        Aquí encontrarás las actividades y ejercicios asignados por tu terapeuta para trabajar entre sesiones.
      </p>

      {tasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
          <h3>No tienes tareas pendientes</h3>
          <p style={{ color: 'var(--color-gray-500)' }}>¡Todo al día!</p>
        </div>
      ) : (
        tasks.map(task => {
          const config = TASK_STATUS_CONFIG[task.status];
          return (
            <div key={task.id} className="patient-task-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-sm)' }}>
                <h3 style={{ margin: 0, fontSize: '1.125rem' }}>{task.title}</h3>
                <span className="patient-task-status" style={{ backgroundColor: config.bgColor, color: config.color }}>
                  {config.icon} {config.label}
                </span>
              </div>
              
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-gray-500)', display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                <span>📅 Fecha límite: {formatDate(task.dueDate)}</span>
                {task.status === 'COMPLETED' && <span>✅ Entregada: {formatDate(task.completedAt)}</span>}
              </div>

              <div style={{ fontSize: '0.9375rem', lineHeight: '1.6', color: 'var(--color-gray-800)', marginBottom: 'var(--space-lg)' }}>
                {task.description}
              </div>

              {task.status === 'COMPLETED' ? (
                <div style={{ backgroundColor: 'var(--color-gray-50)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--color-success)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-gray-600)', marginBottom: '4px' }}>Tu respuesta:</div>
                  <div style={{ fontSize: '0.9375rem', fontStyle: 'italic' }}>{task.response}</div>
                </div>
              ) : (
                <button 
                  className="btn btn-primary" 
                  onClick={() => setSelectedTask(task)}
                >
                  Responder tarea
                </button>
              )}
            </div>
          );
        })
      )}

      {/* Modal para responder tarea */}
      {selectedTask && (
        <div className="survey-modal-overlay">
          <div className="survey-modal">
            <h3 style={{ margin: '0 0 var(--space-xs) 0' }}>Responder Tarea</h3>
            <div style={{ fontWeight: '500', marginBottom: 'var(--space-md)' }}>{selectedTask.title}</div>
            
            <form onSubmit={handleSubmitResponse}>
              <div style={{ marginBottom: 'var(--space-lg)' }}>
                <label className="form-label">Tu respuesta / reflexiones</label>
                <textarea 
                  className="form-control" 
                  rows={6} 
                  placeholder="Escribe aquí tu respuesta..."
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  required
                />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-md)' }}>
                <button type="button" className="btn btn-outline-secondary" onClick={() => { setSelectedTask(null); setResponse(''); }} disabled={submitting}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting || !response.trim()}>
                  {submitting ? 'Enviando...' : 'Enviar respuesta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
