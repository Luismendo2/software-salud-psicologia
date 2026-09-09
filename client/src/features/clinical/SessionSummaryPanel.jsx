import { useEffect, useState } from 'react';
import { generateSessionSummary } from '../../services/aiClinicalService';

const FIELDS = [
  ['objetivo', 'Objetivo de la sesión'],
  ['intervencion', 'Intervención realizada'],
  ['resultado', 'Resultado observado'],
  ['planSiguienteSesion', 'Plan para la próxima sesión'],
];

export default function SessionSummaryPanel({ noteContent, disabled, onConfirm }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { setSummary(null); setError(''); }, [noteContent]);

  const generate = async () => {
    setLoading(true);
    setError('');
    try { setSummary(await generateSessionSummary(noteContent)); }
    catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  };

  if (!summary) return (
    <div className="ai-summary-trigger">
      <div><strong>Resumen estructurado</strong><span>Convierte la nota en objetivos, intervención, resultado y plan.</span></div>
      <button type="button" className="btn btn-ai" onClick={generate} disabled={disabled || loading}>{loading ? 'Generando…' : '✦ Generar resumen IA'}</button>
      {error && <p className="ai-inline-error" role="alert">{error}</p>}
    </div>
  );

  const updateField = (key, value) => setSummary((current) => ({ ...current, [key]: value }));
  return (
    <section className="ai-summary-panel" aria-label="Resumen generado por IA">
      <header><div><span className="ai-eyebrow">Borrador generado</span><h3>Revisa antes de incorporar</h3></div><button type="button" className="ai-close-button" onClick={() => setSummary(null)} aria-label="Descartar resumen">×</button></header>
      <p className="ai-disclaimer">Las sugerencias generadas por IA son orientativas. El profesional es el único responsable del diagnóstico clínico.</p>
      {FIELDS.map(([key, label]) => <label key={key} className="ai-summary-field"><span>{label}</span><textarea value={summary[key]} onChange={(event) => updateField(key, event.target.value)} rows="3" /></label>)}
      <footer><button type="button" className="btn btn-outline-secondary" onClick={() => setSummary(null)}>Descartar</button><button type="button" className="btn btn-primary" onClick={() => onConfirm(summary)}>Incorporar a la nota</button></footer>
    </section>
  );
}
