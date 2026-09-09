import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as evaluationsService from '../../services/evaluationsService';
import { useAuth } from '../auth/AuthContext';

export default function MyAssessmentsPage() {
  const [assessments, setAssessments] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [assmData, tplData] = await Promise.all([
          evaluationsService.getPatientAssessments(user.id),
          evaluationsService.getTemplates()
        ]);
        
        // Sort: SENT first, then descending by date
        const sorted = assmData.sort((a, b) => {
          if (a.status === 'SENT' && b.status === 'COMPLETED') return -1;
          if (a.status === 'COMPLETED' && b.status === 'SENT') return 1;
          return new Date(b.completedAt || b.sentAt) - new Date(a.completedAt || a.sentAt);
        });
        
        setAssessments(sorted);
        setTemplates(tplData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user.id]);

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>Cargando evaluaciones...</div>;
  }

  const pending = assessments.filter(a => a.status === 'SENT');
  const completed = assessments.filter(a => a.status === 'COMPLETED');

  return (
    <div className="portal-page">
      <div className="portal-page-header">
        <h1>Mis Evaluaciones</h1>
        <p>Cuestionarios clínicos asignados por tu terapeuta.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2xl)' }}>
        {/* Sección Pendientes */}
        <section>
          <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-md)', color: 'var(--color-primary-600)' }}>
            Pendientes ({pending.length})
          </h3>
          
          {pending.length === 0 ? (
            <div style={{ padding: '2rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', color: 'var(--color-gray-500)', textAlign: 'center' }}>
              No tienes cuestionarios pendientes.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
              {pending.map(assm => {
                const tpl = templates.find(t => t.id === assm.templateId);
                return (
                  <div key={assm.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)', backgroundColor: 'var(--color-surface)', padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
                    <div>
                      <h4 style={{ margin: '0 0 var(--space-xs) 0', fontSize: '1.125rem' }}>{tpl?.name}</h4>
                      <p style={{ margin: 0, color: 'var(--color-gray-500)', fontSize: '0.875rem' }}>{tpl?.description}</p>
                    </div>
                    <button 
                      className="btn btn-primary"
                      onClick={() => navigate(`/portal/evaluaciones/${assm.id}/responder`)}
                    >
                      Responder
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Sección Completadas */}
        <section>
          <h3 style={{ fontSize: '1.125rem', marginBottom: 'var(--space-md)', color: 'var(--color-gray-700)' }}>
            Historial completado
          </h3>
          
          {completed.length === 0 ? (
            <p style={{ color: 'var(--color-gray-500)', fontSize: '0.875rem' }}>No hay cuestionarios completados.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-md)' }}>
              {completed.map(assm => {
                const tpl = templates.find(t => t.id === assm.templateId);
                return (
                  <div key={assm.id} style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid var(--color-success)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
                      <strong style={{ color: 'var(--color-gray-800)' }}>{tpl?.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>
                        {new Date(assm.completedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-gray-600)' }}>
                      Enviado al terapeuta
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
