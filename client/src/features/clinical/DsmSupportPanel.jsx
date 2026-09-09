import { useState } from 'react';
import { DSM_SYMPTOMS } from '../../mocks/aiClinicalMock';
import { getDsmSuggestions } from '../../services/aiClinicalService';

export default function DsmSupportPanel({ disabled, onInsert }) {
  const [selected, setSelected] = useState([]);
  const [description, setDescription] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleSymptom = (symptom) => setSelected((items) => items.includes(symptom) ? items.filter((item) => item !== symptom) : [...items, symptom]);
  const requestSuggestions = async () => {
    setLoading(true); setError('');
    try { setSuggestions(await getDsmSuggestions([...selected, description].filter(Boolean).join('. '))); }
    catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  };

  return <section className="dsm-support-panel" aria-label="Apoyo diagnóstico DSM-5">
    <header><div><span className="ai-eyebrow">Apoyo DSM-5</span><h3>Explora hipótesis, no diagnósticos</h3></div></header>
    <p className="ai-disclaimer">Las sugerencias generadas por IA son orientativas. El profesional es el único responsable del diagnóstico clínico.</p>
    <fieldset disabled={disabled}><legend>Síntomas relevantes</legend><div className="dsm-symptom-list">{DSM_SYMPTOMS.map((symptom) => <label key={symptom} className={selected.includes(symptom) ? 'selected' : ''}><input type="checkbox" checked={selected.includes(symptom)} onChange={() => toggleSymptom(symptom)} />{symptom}</label>)}</div>
    <label className="dsm-text-label">Observaciones clínicas<textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Añade contexto clínico sin datos identificables…" rows="3" /></label></fieldset>
    <button type="button" className="btn btn-ai" onClick={requestSuggestions} disabled={disabled || loading}>{loading ? 'Analizando…' : 'Generar sugerencias'}</button>
    {error && <p className="ai-inline-error" role="alert">{error}</p>}
    {suggestions.length > 0 && <div className="dsm-suggestion-list">{suggestions.map((suggestion) => <article key={suggestion.code} className="dsm-suggestion"><span className="dsm-code">DSM-5 {suggestion.code}</span><h4>{suggestion.name}</h4><p>{suggestion.rationale}</p><button type="button" className="btn btn-outline-primary btn-sm" onClick={() => onInsert(suggestion)}>Agregar a nota clínica</button></article>)}</div>}
  </section>;
}
