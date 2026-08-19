import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as evaluationsService from '../../services/evaluationsService';
import { useAuth } from '../auth/AuthContext';

export default function AssessmentFormPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [assessment, setAssessment] = useState(null);
  const [template, setTemplate] = useState(null);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [assmData, tplData] = await Promise.all([
          evaluationsService.getPatientAssessments(user.id),
          evaluationsService.getTemplates()
        ]);
        
        const currentAssm = assmData.find(a => a.id === id);
        if (!currentAssm) throw new Error("Not found");
        
        const currentTpl = tplData.find(t => t.id === currentAssm.templateId);
        
        setAssessment(currentAssm);
        setTemplate(currentTpl);
      } catch (err) {
        console.error(err);
        navigate('/portal/evaluaciones');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, user.id, navigate]);

  const handleOptionChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    // Verificar que todas estén respondidas
    const allAnswered = template.questions.every(q => responses[q.id] !== undefined);
    if (!allAnswered) {
      alert("Por favor responde todas las preguntas antes de enviar.");
      return;
    }

    setSubmitting(true);
    try {
      const formattedResponses = Object.entries(responses).map(([qId, val]) => ({
        questionId: qId,
        value: val
      }));
      
      await evaluationsService.submitAssessment(id, formattedResponses);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Hubo un error al guardar. Intenta de nuevo.");
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Cargando cuestionario...</div>;
  if (!assessment || !template) return null;

  if (submitted || assessment.status === 'COMPLETED') {
    return (
      <div className="assessment-form-page" style={{ paddingTop: '3rem' }}>
        <div style={{ backgroundColor: 'var(--color-surface)', padding: '3rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
          <h2 style={{ marginBottom: '1rem' }}>Evaluación completada</h2>
          <p style={{ color: 'var(--color-gray-600)', marginBottom: '2rem' }}>
            Gracias por completar el {template.name}. Tus respuestas han sido enviadas de forma segura a tu terapeuta.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/portal/evaluaciones')}>
            Volver a Mis Evaluaciones
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="assessment-form-page">
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h1 style={{ marginBottom: 'var(--space-xs)' }}>{template.name}</h1>
        <p style={{ color: 'var(--color-gray-500)', fontSize: '1.125rem' }}>{template.description}</p>
        <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-sm)', backgroundColor: '#eff6ff', color: '#1e3a8a', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
          <strong>Instrucciones:</strong> Durante las últimas 2 semanas, ¿qué tan seguido te han molestado los siguientes problemas?
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {template.questions.map((q, index) => (
          <div key={q.id} className="assessment-question-card">
            <div className="assessment-question-text">
              {index + 1}. {q.text}
            </div>
            <div className="assessment-options">
              {template.options.map(opt => (
                <label key={opt.value} className="assessment-option-label">
                  <input 
                    type="radio" 
                    name={`q-${q.id}`}
                    value={opt.value}
                    checked={responses[q.id] === opt.value}
                    onChange={() => handleOptionChange(q.id, opt.value)}
                  />
                  <span className="option-text">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="assessment-form-footer">
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ padding: '0.75rem 2rem', fontSize: '1.125rem' }}
            disabled={submitting}
          >
            {submitting ? 'Enviando...' : 'Enviar respuestas'}
          </button>
        </div>
      </form>
    </div>
  );
}
