import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import * as commService from '../../services/communicationService';
import { TASK_STATUS_CONFIG } from '../../mocks/communicationMock';
import { MOCK_PATIENTS_LIST } from '../../mocks/clinicalMock';

export default function TaskManagerPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterPatient, setFilterPatient] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    loadTasks();
  }, [filterPatient]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await commService.getTasks({
        psychologistId: user.id,
        patientId: filterPatient || undefined,
      });
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (taskData) => {
    try {
      await commService.createTask({ ...taskData, psychologistId: user.id });
      setShowCreateModal(false);
      loadTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const statuses = ['ASSIGNED', 'IN_PROGRESS', 'OVERDUE', 'COMPLETED'];

  const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
  };

  const isDueSoon = (dueDate) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffDays = (due - now) / (1000 * 60 * 60 * 24);
    return diffDays <= 2 && diffDays >= 0;
  };

  return (
    <div>
      <div className="task-manager-header">
        <h1>📝 Tareas Terapéuticas</h1>
        <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            className="form-control"
            value={filterPatient}
            onChange={(e) => setFilterPatient(e.target.value)}
            style={{ width: 'auto', minWidth: '180px' }}
          >
            <option value="">Todos los pacientes</option>
            {MOCK_PATIENTS_LIST.map(p => (
              <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            + Asignar tarea
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-gray-500)' }}>Cargando tareas...</div>
      ) : (
        <div className="task-columns">
          {statuses.map(status => {
            const config = TASK_STATUS_CONFIG[status];
            const columnTasks = tasks.filter(t => t.status === status);
            return (
              <div key={status} className="task-column">
                <div className="task-column-header">
                  <span>{config.icon}</span>
                  <span style={{ color: config.color }}>{config.label}</span>
                  <span className="task-column-count">{columnTasks.length}</span>
                </div>
                {columnTasks.length === 0 ? (
                  <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-gray-400)', fontSize: '0.8125rem' }}>
                    Sin tareas
                  </div>
                ) : (
                  columnTasks.map(task => (
                    <div key={task.id} className="task-card" onClick={() => setSelectedTask(task)}>
                      <div className="task-card-title">{task.title}</div>
                      <div className="task-card-patient">{task.patientName}</div>
                      <div className={`task-card-due ${task.status === 'OVERDUE' ? 'overdue' : ''}`}>
                        <span>{task.status === 'OVERDUE' ? '⏰' : '📅'}</span>
                        {task.status === 'COMPLETED'
                          ? `Entregada: ${formatDate(task.completedAt)}`
                          : `Vence: ${formatDate(task.dueDate)}`
                        }
                        {isDueSoon(task.dueDate) && task.status !== 'COMPLETED' && task.status !== 'OVERDUE' && (
                          <span style={{ marginLeft: '4px', color: '#d97706', fontWeight: '600' }}>• Pronto</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de detalle de tarea */}
      {selectedTask && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 'var(--space-md)' }}>
          <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-xl)', maxWidth: '550px', width: '100%', boxShadow: 'var(--shadow-lg)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-lg)' }}>
              <h3 style={{ margin: 0 }}>{selectedTask.title}</h3>
              <button className="btn btn-outline-secondary" style={{ padding: '0.2rem 0.5rem' }} onClick={() => setSelectedTask(null)}>✕</button>
            </div>
            
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <span className="patient-task-status" style={{ backgroundColor: TASK_STATUS_CONFIG[selectedTask.status].bgColor, color: TASK_STATUS_CONFIG[selectedTask.status].color }}>
                {TASK_STATUS_CONFIG[selectedTask.status].icon} {TASK_STATUS_CONFIG[selectedTask.status].label}
              </span>
            </div>

            <div style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)', marginBottom: 'var(--space-xs)' }}>Paciente</div>
            <div style={{ marginBottom: 'var(--space-md)', fontWeight: '500' }}>{selectedTask.patientName}</div>

            <div style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)', marginBottom: 'var(--space-xs)' }}>Descripción</div>
            <div style={{ marginBottom: 'var(--space-md)', fontSize: '0.9375rem', lineHeight: '1.6' }}>{selectedTask.description}</div>

            <div style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)', marginBottom: 'var(--space-xs)' }}>Fecha límite</div>
            <div style={{ marginBottom: 'var(--space-md)' }}>{formatDate(selectedTask.dueDate)}</div>

            {selectedTask.response && (
              <>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)', marginBottom: 'var(--space-xs)' }}>Respuesta del paciente</div>
                <div style={{ padding: 'var(--space-md)', backgroundColor: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)', fontSize: '0.9375rem', lineHeight: '1.6', borderLeft: '3px solid var(--color-success)' }}>
                  {selectedTask.response}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal de crear tarea */}
      {showCreateModal && (
        <CreateTaskModal
          patients={MOCK_PATIENTS_LIST}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}

function CreateTaskModal({ patients, onClose, onCreate }) {
  const [form, setForm] = useState({
    patientId: '',
    patientName: '',
    title: '',
    description: '',
    dueDate: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field, value) => {
    if (field === 'patientId') {
      const p = patients.find(pt => pt.id === value);
      setForm(prev => ({ ...prev, patientId: value, patientName: p ? `${p.firstName} ${p.lastName}` : '' }));
    } else {
      setForm(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patientId || !form.title || !form.dueDate) return;
    setSubmitting(true);
    await onCreate(form);
    setSubmitting(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 'var(--space-md)' }}>
      <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-xl)', maxWidth: '500px', width: '100%', boxShadow: 'var(--shadow-lg)' }}>
        <h3 style={{ margin: '0 0 var(--space-lg) 0' }}>Asignar Tarea Terapéutica</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 'var(--space-md)' }}>
            <label className="form-label">Paciente</label>
            <select className="form-control" value={form.patientId} onChange={(e) => handleChange('patientId', e.target.value)} required>
              <option value="">-- Seleccionar --</option>
              {patients.filter(p => p.status === 'ACTIVE').map(p => (
                <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 'var(--space-md)' }}>
            <label className="form-label">Título</label>
            <input className="form-control" value={form.title} onChange={(e) => handleChange('title', e.target.value)} placeholder="Ej: Registro de pensamientos" required />
          </div>
          <div style={{ marginBottom: 'var(--space-md)' }}>
            <label className="form-label">Descripción</label>
            <textarea className="form-control" rows={3} value={form.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="Instrucciones detalladas..." />
          </div>
          <div style={{ marginBottom: 'var(--space-xl)' }}>
            <label className="form-label">Fecha límite</label>
            <input className="form-control" type="date" value={form.dueDate} onChange={(e) => handleChange('dueDate', e.target.value)} required />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-md)' }}>
            <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={submitting}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Asignando...' : 'Asignar tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
