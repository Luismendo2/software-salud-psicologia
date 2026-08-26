import React, { useState } from 'react';
import * as commService from '../../services/communicationService';

export default function PostSessionSurveyModal({ survey, onClose, onSubmitted }) {
  const [score, setScore] = useState(10);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!survey) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await commService.submitSurvey(survey.id, parseInt(score), comment);
      onSubmitted();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const getScoreColor = () => {
    if (score >= 9) return 'var(--color-success)';
    if (score >= 7) return '#f59e0b';
    return 'var(--color-danger)';
  };

  const getScoreEmoji = () => {
    if (score >= 9) return '🤩';
    if (score >= 7) return '🙂';
    if (score >= 5) return '😐';
    return '😞';
  };

  return (
    <div className="survey-modal-overlay">
      <div className="survey-modal">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-sm)' }}>¿Cómo te fue en tu última sesión?</h2>
          <p style={{ color: 'var(--color-gray-500)', fontSize: '0.875rem' }}>
            Tu opinión nos ayuda a mejorar la calidad de nuestra atención.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="nps-slider-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <span style={{ fontSize: '2rem' }}>{getScoreEmoji()}</span>
              <span className="nps-slider-value" style={{ color: getScoreColor() }}>{score}</span>
            </div>
            
            <input 
              type="range" 
              className="nps-slider" 
              min="0" 
              max="10" 
              step="1" 
              value={score} 
              onChange={(e) => setScore(e.target.value)} 
            />
            
            <div className="nps-slider-labels">
              <span>0 - Muy insatisfecho</span>
              <span>10 - Muy satisfecho</span>
            </div>
          </div>

          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <label className="form-label" style={{ textAlign: 'center', display: 'block' }}>¿Hay algo más que nos quieras compartir? (Opcional)</label>
            <textarea 
              className="form-control" 
              rows={3} 
              placeholder="Tus comentarios..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }} disabled={submitting}>
              {submitting ? 'Enviando...' : 'Enviar comentarios'}
            </button>
            <button type="button" className="btn btn-outline-secondary" style={{ width: '100%', border: 'none' }} onClick={onClose} disabled={submitting}>
              Omitir por ahora
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
