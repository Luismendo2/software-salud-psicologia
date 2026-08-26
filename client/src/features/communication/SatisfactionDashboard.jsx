import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAuth } from '../auth/AuthContext';
import * as commService from '../../services/communicationService';

export default function SatisfactionDashboard() {
  const { user } = useAuth();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await commService.getSurveys({ psychologistId: user.id });
        setSurveys(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user.id]);

  const npsData = useMemo(() => commService.calculateNPS(surveys), [surveys]);

  // Distribución por puntaje para gráfico de barras
  const distributionData = useMemo(() => {
    const counts = Array(11).fill(0);
    surveys.forEach(s => {
      if (s.npsScore !== null) counts[s.npsScore]++;
    });
    return counts.map((count, score) => ({
      score: score.toString(),
      count,
      type: score <= 6 ? 'detractor' : score <= 8 ? 'passive' : 'promoter',
    }));
  }, [surveys]);

  const getBarColor = (type) => {
    if (type === 'promoter') return '#22c55e';
    if (type === 'passive') return '#f59e0b';
    return '#ef4444';
  };

  const getNPSColor = (nps) => {
    if (nps >= 50) return '#22c55e';
    if (nps >= 0) return '#f59e0b';
    return '#ef4444';
  };

  const commentsWithText = surveys.filter(s => s.comment && s.comment.trim());

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-gray-500)' }}>Cargando encuestas...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>⭐ Satisfacción del Paciente</h1>
      </div>

      {surveys.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
          <h3>Sin encuestas aún</h3>
          <p style={{ color: 'var(--color-gray-500)' }}>Las encuestas se generan automáticamente al finalizar cada sesión.</p>
        </div>
      ) : (
        <>
          {/* NPS Score + Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
            <div className="nps-gauge">
              <div className="nps-score" style={{ color: getNPSColor(npsData.nps) }}>
                {npsData.nps}
              </div>
              <div className="nps-label">Net Promoter Score</div>
              <div className="nps-breakdown">
                <div className="nps-breakdown-item" style={{ backgroundColor: '#dcfce7' }}>
                  <div className="nps-breakdown-value" style={{ color: '#16a34a' }}>{npsData.promoters}</div>
                  <div className="nps-breakdown-label">Promotores (9-10)</div>
                </div>
                <div className="nps-breakdown-item" style={{ backgroundColor: '#fef3c7' }}>
                  <div className="nps-breakdown-value" style={{ color: '#d97706' }}>{npsData.passives}</div>
                  <div className="nps-breakdown-label">Pasivos (7-8)</div>
                </div>
                <div className="nps-breakdown-item" style={{ backgroundColor: '#fee2e2' }}>
                  <div className="nps-breakdown-value" style={{ color: '#dc2626' }}>{npsData.detractors}</div>
                  <div className="nps-breakdown-label">Detractores (0-6)</div>
                </div>
              </div>
            </div>

            {/* Gráfico de distribución */}
            <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ margin: '0 0 var(--space-md) 0', fontSize: '1rem' }}>Distribución de puntajes</h3>
              <div style={{ height: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distributionData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="score" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={{ stroke: '#d1d5db' }} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={{ stroke: '#d1d5db' }} tickLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                      formatter={(value) => [value, 'Respuestas']}
                      labelFormatter={(label) => `Puntaje: ${label}`}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {distributionData.map((entry, idx) => (
                        <Cell key={idx} fill={getBarColor(entry.type)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Comentarios */}
          <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ margin: '0 0 var(--space-md) 0', fontSize: '1rem' }}>
              Comentarios ({commentsWithText.length})
            </h3>
            {commentsWithText.length === 0 ? (
              <p style={{ color: 'var(--color-gray-500)', fontSize: '0.875rem' }}>No hay comentarios aún.</p>
            ) : (
              commentsWithText.map(s => (
                <div key={s.id} className="survey-comment-card" style={{
                  borderLeftColor: s.npsScore >= 9 ? '#22c55e' : s.npsScore >= 7 ? '#f59e0b' : '#ef4444'
                }}>
                  <div className="survey-comment-header">
                    <span className="survey-comment-patient">{s.patientName}</span>
                    <span className="survey-comment-score" style={{
                      color: s.npsScore >= 9 ? '#16a34a' : s.npsScore >= 7 ? '#d97706' : '#dc2626'
                    }}>
                      ⭐ {s.npsScore}/10
                    </span>
                  </div>
                  <div className="survey-comment-text">"{s.comment}"</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-gray-400)', marginTop: '4px' }}>
                    {new Date(s.submittedAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
