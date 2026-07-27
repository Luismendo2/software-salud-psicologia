/* ==========================================================================
   BookingPublicPage — Interfaz pública para pacientes
   
   Flujo paso a paso para agendar:
   1. Seleccionar fecha
   2. Seleccionar hora disponible (calculada)
   3. Ingresar datos y confirmar
   ========================================================================== */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getAvailableSlots } from '../../services/availabilityService';
import BookingConfirmation from './BookingConfirmation';

export default function BookingPublicPage() {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm();

  // Cargar slots cuando cambia la fecha
  useEffect(() => {
    if (selectedDate) {
      setLoadingSlots(true);
      getAvailableSlots('psy1', selectedDate).then(data => {
        setSlots(data);
        setLoadingSlots(false);
      });
    }
  }, [selectedDate]);

  const handleDateSubmit = (e) => {
    e.preventDefault();
    if (selectedDate) setStep(2);
  };

  const handleSlotSubmit = (e) => {
    e.preventDefault();
    if (selectedSlot) setStep(3);
  };

  const onFinalSubmit = async (data) => {
    setIsSubmitting(true);
    // Simular API request
    await new Promise(r => setTimeout(r, 1000));
    
    setConfirmationData({
      ...data,
      date: selectedDate,
      time: selectedSlot
    });
    
    setIsSubmitting(false);
    setIsConfirmed(true);
  };

  // ── Renderización de éxito ──
  if (isConfirmed) {
    return <BookingConfirmation data={confirmationData} />;
  }

  return (
    <div className="booking-page">
      <div className="booking-header">
        <h1>Agendar cita</h1>
        <p>Selecciona el momento ideal para tu sesión psicológica.</p>
      </div>

      <div className="booking-card">
        {/* Wizard indicator */}
        <div className="steps-indicator">
          <div className={`step-dot ${step >= 1 ? (step > 1 ? 'completed' : 'active') : ''}`} />
          <div className={`step-dot ${step >= 2 ? (step > 2 ? 'completed' : 'active') : ''}`} />
          <div className={`step-dot ${step >= 3 ? 'active' : ''}`} />
        </div>

        {/* ── Paso 1: Fecha ── */}
        {step === 1 && (
          <form onSubmit={handleDateSubmit}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-md)' }}>1. Selecciona el día</h3>
            <div className="mb-4">
              <input 
                type="date" 
                className="form-control form-control-lg" 
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100 py-2" disabled={!selectedDate}>
              Continuar
            </button>
          </form>
        )}

        {/* ── Paso 2: Hora ── */}
        {step === 2 && (
          <form onSubmit={handleSlotSubmit}>
            <div className="d-flex align-items-center mb-4">
              <button type="button" className="btn btn-link p-0 text-decoration-none me-3" onClick={() => setStep(1)}>
                ← Atrás
              </button>
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>2. Selecciona la hora</h3>
            </div>
            
            <p style={{ color: 'var(--color-gray-500)', fontSize: '0.875rem' }}>
              Horarios disponibles para el {new Date(selectedDate).toLocaleDateString('es-CO')}
            </p>

            <div className="mb-4">
              {loadingSlots ? (
                <div className="text-center py-4" style={{ color: 'var(--color-gray-400)' }}>Cargando horarios...</div>
              ) : slots.length > 0 ? (
                <div className="slot-grid">
                  {slots.map(slot => (
                    <button
                      key={slot}
                      type="button"
                      className={`slot-btn ${selectedSlot === slot ? 'selected' : ''}`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="alert alert-warning text-center">
                  No hay horarios disponibles en esta fecha.
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary w-100 py-2" disabled={!selectedSlot}>
              Continuar
            </button>
          </form>
        )}

        {/* ── Paso 3: Datos ── */}
        {step === 3 && (
          <form onSubmit={handleSubmit(onFinalSubmit)}>
            <div className="d-flex align-items-center mb-4">
              <button type="button" className="btn btn-link p-0 text-decoration-none me-3" onClick={() => setStep(2)}>
                ← Atrás
              </button>
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>3. Tus datos</h3>
            </div>

            <div className="card bg-light border-0 mb-4">
              <div className="card-body p-3" style={{ fontSize: '0.875rem' }}>
                <strong>Resumen:</strong> {new Date(selectedDate).toLocaleDateString('es-CO')} a las {selectedSlot}
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Nombre completo</label>
              <input 
                type="text" 
                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                {...register('name', { required: 'Requerido' })}
              />
            </div>
            
            <div className="mb-3">
              <label className="form-label">Correo electrónico</label>
              <input 
                type="email" 
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                {...register('email', { required: 'Requerido' })}
              />
              <div className="form-text">Allí enviaremos la confirmación.</div>
            </div>

            <div className="mb-4">
              <label className="form-label">Modalidad preferida</label>
              <select className="form-select" {...register('type')}>
                <option value="PRESENCIAL">Presencial en consultorio</option>
                <option value="VIRTUAL">Virtual por videollamada</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary w-100 py-2" disabled={isSubmitting}>
              {isSubmitting ? 'Confirmando...' : 'Confirmar cita'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
