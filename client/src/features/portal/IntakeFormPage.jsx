/* ==========================================================================
   IntakeFormPage — Formulario de ingreso / Anamnesis
   
   Formulario multi-sección con React Hook Form.
   Captura: motivo de consulta, antecedentes médicos,
   antecedentes familiares, medicación actual, y contacto de emergencia.
   
   Los datos se guardan como JSONB en el backend (decisión del plan.md).
   ========================================================================== */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { submitIntakeForm } from '../../services/patientService';

export default function IntakeFormPage() {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, trigger } = useForm({
    defaultValues: {
      consultReason: '',
      currentSymptoms: '',
      symptomDuration: '',
      previousTherapy: 'no',
      previousTherapyDetails: '',
      medicalConditions: '',
      currentMedication: '',
      allergies: '',
      sleepQuality: '',
      exerciseFrequency: '',
      substanceUse: 'none',
      familyHistory: '',
      livingSituation: '',
      occupation: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelation: '',
    },
  });

  const SECTIONS = [
    {
      title: 'Motivo de consulta',
      description: 'Cuéntanos brevemente por qué buscas ayuda profesional.',
      fields: ['consultReason', 'currentSymptoms', 'symptomDuration'],
    },
    {
      title: 'Historial clínico',
      description: 'Tu historial nos ayuda a entender mejor tu situación.',
      fields: ['previousTherapy', 'previousTherapyDetails', 'medicalConditions', 'currentMedication', 'allergies'],
    },
    {
      title: 'Estilo de vida',
      description: 'Hábitos cotidianos que pueden influir en tu bienestar.',
      fields: ['sleepQuality', 'exerciseFrequency', 'substanceUse'],
    },
    {
      title: 'Entorno y contacto',
      description: 'Información de contexto y contacto de emergencia.',
      fields: ['familyHistory', 'livingSituation', 'occupation', 'emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelation'],
    },
  ];

  const currentSection = SECTIONS[step];
  const isLastStep = step === SECTIONS.length - 1;

  const handleNext = async () => {
    const valid = await trigger(currentSection.fields);
    if (valid) setStep(s => s + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await submitIntakeForm(data);
      setSubmitted(true);
    } catch (err) {
      console.error('Error enviando formulario:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="portal-page">
        <div className="portal-success-card">
          <div className="portal-success-icon">✓</div>
          <h2>Formulario enviado</h2>
          <p>Tu terapeuta revisará esta información antes de tu primera sesión. Gracias por completarla.</p>
          <button className="btn btn-primary mt-3" onClick={() => navigate('/portal/documentos')}>
            Volver a documentos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="portal-page">
      <div className="portal-page-header">
        <h1>Formulario de ingreso</h1>
        <p>Toda la información es confidencial y está protegida.</p>
      </div>

      {/* Progress */}
      <div className="portal-form-progress">
        {SECTIONS.map((s, i) => (
          <div
            key={i}
            className={`portal-progress-step ${i < step ? 'completed' : ''} ${i === step ? 'active' : ''}`}
          >
            <div className="portal-progress-dot">
              {i < step ? '✓' : i + 1}
            </div>
            <span className="portal-progress-label">{s.title}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="portal-form-section">
          <h2>{currentSection.title}</h2>
          <p className="portal-form-description">{currentSection.description}</p>

          {/* ── Sección 1: Motivo de consulta ── */}
          {step === 0 && (
            <>
              <div className="portal-form-group">
                <label className="form-label">¿Cuál es el motivo principal de tu consulta? *</label>
                <textarea
                  className={`form-control ${errors.consultReason ? 'is-invalid' : ''}`}
                  rows="3"
                  placeholder="Describe brevemente qué te trae aquí..."
                  {...register('consultReason', { required: 'Este campo es requerido' })}
                />
                {errors.consultReason && <div className="invalid-feedback">{errors.consultReason.message}</div>}
              </div>
              <div className="portal-form-group">
                <label className="form-label">¿Qué síntomas o dificultades estás experimentando?</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Ej: ansiedad, problemas de sueño, estrés laboral..."
                  {...register('currentSymptoms')}
                />
              </div>
              <div className="portal-form-group">
                <label className="form-label">¿Hace cuánto tiempo comenzaron estos síntomas?</label>
                <select className="form-select" {...register('symptomDuration')}>
                  <option value="">Selecciona una opción</option>
                  <option value="less-1-month">Menos de 1 mes</option>
                  <option value="1-3-months">1 a 3 meses</option>
                  <option value="3-6-months">3 a 6 meses</option>
                  <option value="6-12-months">6 a 12 meses</option>
                  <option value="more-1-year">Más de 1 año</option>
                </select>
              </div>
            </>
          )}

          {/* ── Sección 2: Historial clínico ── */}
          {step === 1 && (
            <>
              <div className="portal-form-group">
                <label className="form-label">¿Has asistido a terapia psicológica anteriormente?</label>
                <select className="form-select" {...register('previousTherapy')}>
                  <option value="no">No</option>
                  <option value="yes">Sí</option>
                </select>
              </div>
              <div className="portal-form-group">
                <label className="form-label">Si la respuesta es sí, ¿podrías darnos más detalles?</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Duración del proceso, motivo, resultados..."
                  {...register('previousTherapyDetails')}
                />
              </div>
              <div className="portal-form-group">
                <label className="form-label">¿Tienes alguna condición médica diagnosticada?</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Ej: hipertensión, diabetes, tiroides..."
                  {...register('medicalConditions')}
                />
              </div>
              <div className="portal-form-group">
                <label className="form-label">¿Tomas algún medicamento actualmente?</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nombre y dosis (si aplica)"
                  {...register('currentMedication')}
                />
              </div>
              <div className="portal-form-group">
                <label className="form-label">¿Tienes alguna alergia conocida?</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: penicilina, aspirina..."
                  {...register('allergies')}
                />
              </div>
            </>
          )}

          {/* ── Sección 3: Estilo de vida ── */}
          {step === 2 && (
            <>
              <div className="portal-form-group">
                <label className="form-label">¿Cómo describirías tu calidad de sueño?</label>
                <select className="form-select" {...register('sleepQuality')}>
                  <option value="">Selecciona una opción</option>
                  <option value="good">Buena — Duermo bien la mayoría de las noches</option>
                  <option value="regular">Regular — Algunos problemas para dormir</option>
                  <option value="poor">Mala — Frecuentes problemas de insomnio</option>
                </select>
              </div>
              <div className="portal-form-group">
                <label className="form-label">¿Con qué frecuencia realizas actividad física?</label>
                <select className="form-select" {...register('exerciseFrequency')}>
                  <option value="">Selecciona una opción</option>
                  <option value="daily">Diariamente</option>
                  <option value="3-4-week">3 a 4 veces por semana</option>
                  <option value="1-2-week">1 a 2 veces por semana</option>
                  <option value="rarely">Raramente</option>
                  <option value="never">Nunca</option>
                </select>
              </div>
              <div className="portal-form-group">
                <label className="form-label">Consumo de sustancias</label>
                <select className="form-select" {...register('substanceUse')}>
                  <option value="none">Ninguno</option>
                  <option value="alcohol-social">Alcohol social</option>
                  <option value="tobacco">Tabaco</option>
                  <option value="other">Otro</option>
                </select>
              </div>
            </>
          )}

          {/* ── Sección 4: Entorno y contacto ── */}
          {step === 3 && (
            <>
              <div className="portal-form-group">
                <label className="form-label">¿Hay antecedentes de salud mental en tu familia?</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Ej: depresión, ansiedad, adicciones..."
                  {...register('familyHistory')}
                />
              </div>
              <div className="portal-form-group">
                <label className="form-label">¿Con quién vives actualmente?</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: solo/a, con pareja, con familia..."
                  {...register('livingSituation')}
                />
              </div>
              <div className="portal-form-group">
                <label className="form-label">Ocupación actual</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: Ingeniera de software, Estudiante..."
                  {...register('occupation')}
                />
              </div>

              <h3 className="mt-4 mb-3" style={{ fontSize: '1rem', color: 'var(--color-gray-700)' }}>Contacto de emergencia</h3>
              <div className="portal-form-group">
                <label className="form-label">Nombre completo *</label>
                <input
                  type="text"
                  className={`form-control ${errors.emergencyContactName ? 'is-invalid' : ''}`}
                  {...register('emergencyContactName', { required: 'Requerido' })}
                />
              </div>
              <div className="row g-3">
                <div className="col-7">
                  <div className="portal-form-group">
                    <label className="form-label">Teléfono *</label>
                    <input
                      type="tel"
                      className={`form-control ${errors.emergencyContactPhone ? 'is-invalid' : ''}`}
                      placeholder="+57 3XX XXX XXXX"
                      {...register('emergencyContactPhone', { required: 'Requerido' })}
                    />
                  </div>
                </div>
                <div className="col-5">
                  <div className="portal-form-group">
                    <label className="form-label">Parentesco</label>
                    <select className="form-select" {...register('emergencyContactRelation')}>
                      <option value="">—</option>
                      <option value="padre-madre">Padre/Madre</option>
                      <option value="hermano">Hermano/a</option>
                      <option value="pareja">Pareja</option>
                      <option value="amigo">Amigo/a</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Navegación del formulario ── */}
        <div className="portal-form-nav">
          {step > 0 && (
            <button type="button" className="btn btn-outline-secondary" onClick={handleBack}>
              ← Anterior
            </button>
          )}
          <div className="ms-auto">
            {isLastStep ? (
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Enviando...' : 'Enviar formulario'}
              </button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={handleNext}>
                Siguiente →
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
