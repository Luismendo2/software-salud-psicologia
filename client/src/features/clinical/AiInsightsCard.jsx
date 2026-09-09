import { useEffect, useState } from 'react';
import { getAiInsights } from '../../services/aiClinicalService';

export default function AiInsightsCard({ patientId }) {
  const [insight, setInsight] = useState(undefined);
  useEffect(() => { let active = true; getAiInsights(patientId).then((data) => active && setInsight(data)).catch(() => active && setInsight(null)); return () => { active = false; }; }, [patientId]);
  if (insight === undefined) return <aside className="ai-insights-card is-loading">Analizando progreso clínico…</aside>;
  return <aside className="ai-insights-card"><div className="ai-insights-header"><span aria-hidden="true">✦</span><div><span className="ai-eyebrow">Lectura de progreso</span><h3>Insight clínico IA</h3></div></div>{insight ? <><p>{insight.summary}</p><div className="ai-insight-meta"><span>{insight.assessmentsAnalyzed} evaluaciones</span><span>{new Date(insight.generatedAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</span></div></> : <p className="ai-empty-insight">Aún no hay evaluaciones suficientes para identificar una tendencia. Cuando existan al menos dos mediciones comparables, el análisis aparecerá aquí.</p>}<div className="ai-insight-footer">Apoyo clínico · Revisión profesional requerida</div></aside>;
}
