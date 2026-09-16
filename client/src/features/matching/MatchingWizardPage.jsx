/* ==========================================================================
   MatchingWizardPage — Asistente de Matching Inteligente de Terapeutas
   Guía al paciente o visitante a encontrar su psicólogo ideal en 3 pasos. (Feature 012)
   ========================================================================== */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { matchTherapists, CONSULTATION_REASONS } from '../../services/matchingService';

export default function MatchingWizardPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [selectedReason, setSelectedReason] = useState('anxiety');
  const [customReasonText, setCustomReasonText] = useState('');
  const [modality, setModality] = useState('ANY');
  const [timeSlot, setTimeSlot] = useState('ANY');

  const [loadingResults, setLoadingResults] = useState(false);
  const [results, setResults] = useState([]);

  const handleNextStep1 = () => {
    setStep(2);
  };

  const handleNextStep2 = () => {
    setStep(3);
  };

  const handleFindTherapist = async () => {
    setLoadingResults(true);
    setStep(4);
    try {
      const matches = await matchTherapists({
        reasonId: selectedReason,
        customText: customReasonText,
        modality,
        timeSlot,
      });
      setResults(matches);
    } catch (err) {
      console.error('Error calculando matching:', err);
    } finally {
      setLoadingResults(false);
    }
  };

  const handleRestart = () => {
    setStep(1);
    setResults([]);
  };

  return (
    <div className="matching-page">
      <div className="matching-container">
        {/* ── Encabezado Hero ── */}
        <div className="matching-hero">
          <div className="matching-hero-badge">
            <span>✨</span> Orientación Personalizada
          </div>
          <h1>Encuentra al Terapeuta Adecuado para Ti</h1>
          <p>
            Te ayudamos a elegir el profesional idóneo según tu motivo de consulta,
            disponibilidad horaria y modalidad preferida.
          </p>
        </div>

        {/* ── Indicador de Pasos del Asistente ── */}
        <div className="matching-progress" role="progressbar" aria-valuenow={step} aria-valuemin="1" aria-valuemax="4">
          <div className={`matching-step-dot ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}>
            {step > 1 ? '✓' : '1'}
          </div>
          <div className="matching-step-line" />
          <div className={`matching-step-dot ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}>
            {step > 2 ? '✓' : '2'}
          </div>
          <div className="matching-step-line" />
          <div className={`matching-step-dot ${step === 3 ? 'active' : step > 3 ? 'completed' : ''}`}>
            {step > 3 ? '✓' : '3'}
          </div>
          <div className="matching-step-line" />
          <div className={`matching-step-dot ${step === 4 ? 'active' : ''}`}>
            4
          </div>
        </div>

        {/* ── PASO 1: Motivo de consulta ── */}
        {step === 1 && (
          <div className="matching-card">
            <h2 className="matching-question-title">¿Qué te gustaría abordar en terapia?</h2>
            <p className="matching-question-sub">
              Selecciona el tema que mejor describa tu situación o el motivo de tu búsqueda.
            </p>

            <div className="matching-chip-grid">
              {CONSULTATION_REASONS.map((reason) => (
                <button
                  key={reason.id}
                  type="button"
                  className={`matching-chip ${selectedReason === reason.id ? 'selected' : ''}`}
                  onClick={() => setSelectedReason(reason.id)}
                >
                  {reason.label}
                </button>
              ))}
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold text-dark mb-1">
                ¿Deseas contarnos algo más en tus propias palabras? (Opcional)
              </label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Ej. Siento mucha presión en el trabajo, no logro conciliar el sueño y me da taquicardia..."
                value={customReasonText}
                onChange={(e) => setCustomReasonText(e.target.value)}
              />
            </div>

            <div className="d-flex justify-content-between align-items-center">
              <Link to="/login" className="text-decoration-none small text-muted">
                ← Volver al ingreso
              </Link>
              <button
                type="button"
                className="btn btn-primary px-4"
                onClick={handleNextStep1}
              >
                Siguiente paso →
              </button>
            </div>
          </div>
        )}

        {/* ── PASO 2: Modalidad ── */}
        {step === 2 && (
          <div className="matching-card">
            <h2 className="matching-question-title">¿Qué modalidad de atención prefieres?</h2>
            <p className="matching-question-sub">
              Elige cómo te sientes más cómodo para tus sesiones terapéuticas.
            </p>

            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <div
                  className={`p-4 border rounded text-center cursor-pointer h-100 ${
                    modality === 'VIRTUAL' ? 'border-primary bg-primary-subtle' : 'bg-white'
                  }`}
                  onClick={() => setModality('VIRTUAL')}
                  style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💻</div>
                  <h3 className="h6 fw-bold mb-1">Virtual (Online)</h3>
                  <p className="small text-muted mb-0">Desde tu casa o cualquier lugar por videollamada cifrada.</p>
                </div>
              </div>

              <div className="col-md-4">
                <div
                  className={`p-4 border rounded text-center cursor-pointer h-100 ${
                    modality === 'PRESENCIAL' ? 'border-primary bg-primary-subtle' : 'bg-white'
                  }`}
                  onClick={() => setModality('PRESENCIAL')}
                  style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏥</div>
                  <h3 className="h6 fw-bold mb-1">Presencial</h3>
                  <p className="small text-muted mb-0">En nuestro consultorio clínico privado y cómodo.</p>
                </div>
              </div>

              <div className="col-md-4">
                <div
                  className={`p-4 border rounded text-center cursor-pointer h-100 ${
                    modality === 'ANY' ? 'border-primary bg-primary-subtle' : 'bg-white'
                  }`}
                  onClick={() => setModality('ANY')}
                  style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔄</div>
                  <h3 className="h6 fw-bold mb-1">Cualquiera de las dos</h3>
                  <p className="small text-muted mb-0">Mayor flexibilidad para encontrar turno antes.</p>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setStep(1)}
              >
                ← Anterior
              </button>
              <button
                type="button"
                className="btn btn-primary px-4"
                onClick={handleNextStep2}
              >
                Siguiente paso →
              </button>
            </div>
          </div>
        )}

        {/* ── PASO 3: Disponibilidad horaria ── */}
        {step === 3 && (
          <div className="matching-card">
            <h2 className="matching-question-title">¿Cuál es tu disponibilidad horaria?</h2>
            <p className="matching-question-sub">
              Filtraremos profesionales que tengan horarios libres en la franja que mejor se adapte a ti.
            </p>

            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <div
                  className={`p-3 border rounded d-flex align-items-center gap-3 cursor-pointer ${
                    timeSlot === 'MORNING' ? 'border-primary bg-primary-subtle' : 'bg-white'
                  }`}
                  onClick={() => setTimeSlot('MORNING')}
                  style={{ cursor: 'pointer' }}
                >
                  <span style={{ fontSize: '1.75rem' }}>🌅</span>
                  <div>
                    <div className="fw-semibold text-dark">Mañanas</div>
                    <div className="small text-muted">Entre 8:00 a. m. y 12:00 m.</div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div
                  className={`p-3 border rounded d-flex align-items-center gap-3 cursor-pointer ${
                    timeSlot === 'AFTERNOON' ? 'border-primary bg-primary-subtle' : 'bg-white'
                  }`}
                  onClick={() => setTimeSlot('AFTERNOON')}
                  style={{ cursor: 'pointer' }}
                >
                  <span style={{ fontSize: '1.75rem' }}>🌇</span>
                  <div>
                    <div className="fw-semibold text-dark">Tardes</div>
                    <div className="small text-muted">Entre 1:00 p. m. y 6:00 p. m.</div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div
                  className={`p-3 border rounded d-flex align-items-center gap-3 cursor-pointer ${
                    timeSlot === 'WEEKEND' ? 'border-primary bg-primary-subtle' : 'bg-white'
                  }`}
                  onClick={() => setTimeSlot('WEEKEND')}
                  style={{ cursor: 'pointer' }}
                >
                  <span style={{ fontSize: '1.75rem' }}>📅</span>
                  <div>
                    <div className="fw-semibold text-dark">Sábados</div>
                    <div className="small text-muted">Turnos de fin de semana</div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div
                  className={`p-3 border rounded d-flex align-items-center gap-3 cursor-pointer ${
                    timeSlot === 'ANY' ? 'border-primary bg-primary-subtle' : 'bg-white'
                  }`}
                  onClick={() => setTimeSlot('ANY')}
                  style={{ cursor: 'pointer' }}
                >
                  <span style={{ fontSize: '1.75rem' }}>⭐</span>
                  <div>
                    <div className="fw-semibold text-dark">Sin preferencia horaria</div>
                    <div className="small text-muted">Ver todos los horarios disponibles</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setStep(2)}
              >
                ← Anterior
              </button>
              <button
                type="button"
                className="btn btn-primary px-4 d-flex align-items-center gap-2"
                onClick={handleFindTherapist}
              >
                <span>🔍</span>
                <span>Buscar a mi terapeuta</span>
              </button>
            </div>
          </div>
        )}

        {/* ── PASO 4: Resultados del Matching (CA-01 a CA-05) ── */}
        {step === 4 && (
          <div>
            <div className="d-flex justify-content-between align-items-start align-items-sm-center flex-wrap gap-2 mb-3">
              <div>
                <h2 className="h4 fw-bold text-dark mb-0">Terapeutas recomendados para tu caso</h2>
                <p className="small text-muted mb-0">
                  Basado en tu motivo, modalidad y disponibilidad horaria.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={handleRestart}
              >
                🔄 Modificar búsqueda
              </button>
            </div>

            {loadingResults ? (
              <div className="text-center py-5 bg-white border rounded p-4">
                <div className="spinner-border text-primary mb-3" role="status" />
                <p className="text-muted">Calculando afinidad con el equipo clínico...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-5 bg-white border rounded p-4">
                <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🔍</div>
                <h3 className="h6 fw-bold">No encontramos coincidencias exactas</h3>
                <p className="small text-muted mb-3">
                  Intenta ampliando tu rango de horarios o modalidad.
                </p>
                <button type="button" className="btn btn-primary btn-sm" onClick={handleRestart}>
                  Volver a intentar
                </button>
              </div>
            ) : (
              <div>
                {results.map((psy, idx) => (
                  <div key={psy.id} className="match-result-card">
                    {/* 1. Cabecera: Avatar + Identidad del Profesional */}
                    <div className="match-result-header">
                      <div className="match-result-avatar">
                        {psy.avatarText}
                      </div>

                      <div className="match-result-identity">
                        <div className="match-result-title-row">
                          <h3 className="match-result-name">{psy.name}</h3>
                          <span className="match-score-badge">
                            ⭐ {psy.matchPercentage}% Compatibilidad
                          </span>
                          {idx === 0 && (
                            <span className="badge bg-primary text-white">Recomendación principal</span>
                          )}
                        </div>

                        <div className="match-result-meta">
                          {psy.title} • {psy.city} • ⭐ {psy.rating} ({psy.reviewsCount} opiniones)
                        </div>
                      </div>
                    </div>

                    {/* 2. Cuerpo: Biografía clínica + Especialidades */}
                    <div className="match-result-body">
                      <p className="match-result-bio">
                        {psy.bio}
                      </p>

                      <div className="match-result-tags">
                        <span className="badge bg-light text-secondary border">
                          🕒 Próximo turno: <strong>{psy.nextSlot}</strong>
                        </span>
                        {psy.specialties.map((spec, i) => (
                          <span key={i} className="library-tag">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 3. Pie: Botón de agendamiento directo */}
                    <div className="match-result-footer">
                      <span className="small text-muted">
                        Modalidad: <strong>{psy.modalities.join(' / ')}</strong>
                      </span>
                      <button
                        type="button"
                        className="btn btn-primary match-result-book-btn"
                        onClick={() => navigate(`/book/${psy.slug}`)}
                      >
                        📅 Agendar consulta
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
