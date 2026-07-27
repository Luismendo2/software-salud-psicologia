/* ==========================================================================
   AvailabilitySettingsPage — Configuración de horarios
   
   Permite al psicólogo definir sus horas de trabajo, días libres,
   duración de la sesión y pausa entre citas.
   
   Usa React Hook Form con un FieldArray para manejar los 7 días
   de manera eficiente.
   ========================================================================== */

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { getAvailabilityRules, updateAvailabilityRules } from '../../services/availabilityService';
import TimeBlockManager from './TimeBlockManager';

export default function AvailabilitySettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { register, control, handleSubmit, reset, watch } = useForm({
    defaultValues: { rules: [] },
  });

  const { fields } = useFieldArray({
    control,
    name: 'rules',
  });

  // Watch activo para deshabilitar inputs visualmente
  const watchedRules = watch('rules');

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      const rules = await getAvailabilityRules();
      reset({ rules });
    } catch (err) {
      console.error('Error cargando reglas:', err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await updateAvailabilityRules(data.rules);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error guardando reglas:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Configuración de horarios</h1>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-gray-500)' }}>
            Define tu disponibilidad regular semanal.
          </p>
        </div>
      </div>

      <div className="row g-4">
        {/* ── Columna principal: Horarios semanales ── */}
        <div className="col-12 col-xl-8">
          <div className="card">
            <div className="card-body p-0">
              <form onSubmit={handleSubmit(onSubmit)}>
                
                {/* Loader inicial */}
                {loading && (
                  <div className="text-center py-5" style={{ color: 'var(--color-gray-400)' }}>
                    Cargando configuración...
                  </div>
                )}

                {/* Lista de días */}
                <div className="p-3 p-md-4">
                  {fields.map((item, index) => {
                    const isActive = watchedRules[index]?.active;
                    return (
                      <div key={item.id} className={`day-row ${!isActive ? 'disabled' : ''}`}>
                        {/* Toggle y nombre del día */}
                        <div className="d-flex align-items-center gap-2" style={{ width: '8rem' }}>
                          <div className="form-check form-switch m-0">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              {...register(`rules.${index}.active`)}
                            />
                          </div>
                          <span className="day-label">{item.dayName}</span>
                        </div>

                        {/* Campos de hora (solo se muestran u operan si está activo) */}
                        <div className="d-flex flex-grow-1 align-items-center gap-2 w-100">
                          <input
                            type="time"
                            className="form-control form-control-sm"
                            disabled={!isActive}
                            style={{ flex: 1, minWidth: '110px' }}
                            {...register(`rules.${index}.startTime`)}
                          />
                          <span style={{ color: 'var(--color-gray-400)' }}>a</span>
                          <input
                            type="time"
                            className="form-control form-control-sm"
                            disabled={!isActive}
                            style={{ flex: 1, minWidth: '110px' }}
                            {...register(`rules.${index}.endTime`)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer del formulario */}
                <div className="card-footer bg-transparent border-top p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                  <div style={{ fontSize: '0.875rem', width: '100%' }}>
                    {/* Configuraciones globales (duración y pausas) se aplican a todos los días para simplificar */}
                    <div className="d-flex flex-column flex-sm-row gap-3">
                      <div className="flex-grow-1">
                        <label className="form-label d-block mb-1">Duración sesión (min)</label>
                        <select className="form-select form-select-sm w-100" {...register('globalSlotDuration')}>
                          <option value="30">30 min</option>
                          <option value="45">45 min</option>
                          <option value="60">60 min</option>
                          <option value="90">90 min</option>
                        </select>
                      </div>
                      <div className="flex-grow-1">
                        <label className="form-label d-block mb-1">Pausa entre sesiones</label>
                        <select className="form-select form-select-sm w-100" {...register('globalPauseDuration')}>
                          <option value="0">Sin pausa</option>
                          <option value="10">10 min</option>
                          <option value="15">15 min</option>
                          <option value="30">30 min</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center justify-content-between justify-content-md-end gap-3 mt-3 mt-md-0 w-100">
                    {saveSuccess && (
                      <span style={{ color: 'var(--color-success)', fontSize: '0.875rem', fontWeight: 'var(--font-weight-medium)' }}>
                        ✓ Guardado
                      </span>
                    )}
                    <button type="submit" className="btn btn-primary ms-auto" disabled={saving || loading}>
                      {saving ? 'Guardando...' : 'Guardar horarios'}
                    </button>
                  </div>
                </div>

              </form>
            </div>
          </div>
        </div>

        {/* ── Columna secundaria: Bloqueos manuales ── */}
        <div className="col-12 col-xl-4">
          <TimeBlockManager />
        </div>
      </div>
    </>
  );
}
