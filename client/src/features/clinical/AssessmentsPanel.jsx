import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as evaluationsService from '../../services/evaluationsService';
import AssessmentResultCard from './AssessmentResultCard';
import SendAssessmentModal from './SendAssessmentModal';

export default function AssessmentsPanel({ patientId }) {
  const [assessments, setAssessments] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSendModal, setShowSendModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [patientId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [assmData, tplData] = await Promise.all([
        evaluationsService.getPatientAssessments(patientId),
        evaluationsService.getTemplates()
      ]);
      // Ordenar más recientes primero
      const sortedAssm = assmData.sort((a, b) => {
        const dateA = new Date(a.completedAt || a.sentAt);
        const dateB = new Date(b.completedAt || b.sentAt);
        return dateB - dateA;
      });
      setAssessments(sortedAssm);
      setTemplates(tplData);
    } catch (error) {
      console.error("Error loading assessments", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssessmentSent = () => {
    setShowSendModal(false);
    loadData(); // recargar para ver la nueva enviada
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Cargando evaluaciones...</div>;
  }

  // Filtrar completadas para ver si hay al menos una y poder mostrar botón de gráficos
  const hasCompleted = assessments.some(a => a.status === 'COMPLETED');

  return (
    <div className="assessments-panel">
      <div className="assessments-panel-header">
        <h3 style={{ fontSize: '1.125rem', margin: 0 }}>Evaluaciones y MBC</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {hasCompleted && (
            <button 
              className="btn btn-outline-secondary"
              onClick={() => navigate(`/historia-clinica/${patientId}/progreso`)}
            >
              📊 Ver Gráficas
            </button>
          )}
          <button 
            className="btn btn-primary"
            onClick={() => setShowSendModal(true)}
          >
            + Enviar Evaluación
          </button>
        </div>
      </div>

      {assessments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-gray-800)' }}>Sin evaluaciones</h4>
          <p style={{ margin: 0, color: 'var(--color-gray-500)', fontSize: '0.875rem' }}>
            Aún no has enviado cuestionarios a este paciente.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {assessments.map(assessment => {
            const tpl = templates.find(t => t.id === assessment.templateId);
            return (
              <AssessmentResultCard 
                key={assessment.id} 
                assessment={assessment} 
                template={tpl}
                onClick={assessment.status === 'COMPLETED' ? () => navigate(`/historia-clinica/${patientId}/progreso`) : undefined}
              />
            );
          })}
        </div>
      )}

      {showSendModal && (
        <SendAssessmentModal 
          patientId={patientId}
          templates={templates}
          onClose={() => setShowSendModal(false)}
          onSent={handleAssessmentSent}
        />
      )}
    </div>
  );
}
