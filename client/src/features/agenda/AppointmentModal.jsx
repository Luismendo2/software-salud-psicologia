/* ==========================================================================
   AppointmentModal — Crear o editar una cita
   
   Modal Bootstrap que se abre al:
   - Hacer clic en un slot vacío del calendario (modo crear)
   - Hacer clic en una cita existente (modo editar)
   
   Usa React Hook Form para manejar el estado del formulario,
   validaciones y el submit. Los campos corresponden al modelo
   Appointment definido en el plan.md:
   - paciente, fecha, hora inicio, hora fin, tipo, notas
   ========================================================================== */

import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import StatusBadge from './StatusBadge';

/**
 * @param {Object} props
 * @param {boolean} props.isOpen - Si el modal está visible
 * @param {Function} props.onClose - Cierra el modal
 * @param {Function} props.onSave - Callback con los datos del form
 * @param {Function} props.onConfirm - Confirmar la cita (solo en modo editar)
 * @param {Function} props.onCancel - Cancelar la cita (solo en modo editar)
 * @param {Object|null} props.appointment - Cita existente (null = crear nueva)
 * @param {Object|null} props.defaultDate - Fecha preseleccionada al crear
 */
export default function AppointmentModal({
  isOpen,
  onClose,
  onSave,
  onConfirm,
  onCancel,
  appointment = null,
  defaultDate = null,
}) {
  const isEditing = !!appointment;

  /**
   * React Hook Form maneja:
   * - El estado de cada campo (register)
   * - Las validaciones (required, etc.)
   * - El reset cuando cambia la cita seleccionada
   */
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Cada vez que cambia la cita seleccionada, reseteamos el formulario
  useEffect(() => {
    if (appointment) {
      reset({
        patientName: appointment.patientName || '',
        date: appointment.startTime?.slice(0, 10) || '',
        startTime: appointment.startTime ? new Date(appointment.startTime).toTimeString().slice(0, 5) : '',
        endTime: appointment.endTime ? new Date(appointment.endTime).toTimeString().slice(0, 5) : '',
        type: appointment.type || 'PRESENCIAL',
        notes: appointment.notes || '',
      });
    } else {
      // Modo crear: prellenar fecha si viene del click en el calendario
      reset({
        patientName: '',
        date: defaultDate || new Date().toISOString().slice(0, 10),
        startTime: '',
        endTime: '',
        type: 'PRESENCIAL',
        notes: '',
      });
    }
  }, [appointment, defaultDate, reset]);

  const onSubmit = (data) => {
    onSave({
      ...data,
      startTime: new Date(`${data.date}T${data.startTime}`).toISOString(),
      endTime: new Date(`${data.date}T${data.endTime}`).toISOString(),
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* ── Backdrop ── */}
      <div className="modal-backdrop fade show" onClick={onClose} />

      {/* ── Modal ── */}
      <div className="modal fade show d-block" tabIndex="-1" role="dialog"
        aria-labelledby="appointmentModalTitle">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">

            {/* ── Header ── */}
            <div className="modal-header">
              <h5 className="modal-title" id="appointmentModalTitle">
                {isEditing ? 'Detalles de la cita' : 'Agendar nueva cita'}
              </h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar" />
            </div>

            {/* ── Body ── */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-body">

                {/* Estado actual (solo en modo edición) */}
                {isEditing && (
                  <div className="mb-3 d-flex align-items-center gap-2">
                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-gray-600)' }}>Estado:</span>
                    <StatusBadge status={appointment.status} />
                  </div>
                )}

                {/* Paciente */}
                <div className="mb-3">
                  <label htmlFor="patientName" className="form-label">Paciente</label>
                  <input
                    id="patientName"
                    type="text"
                    className={`form-control ${errors.patientName ? 'is-invalid' : ''}`}
                    placeholder="Nombre del paciente"
                    {...register('patientName', { required: 'El nombre es obligatorio' })}
                  />
                  {errors.patientName && (
                    <div className="invalid-feedback">{errors.patientName.message}</div>
                  )}
                </div>

                {/* Fecha */}
                <div className="mb-3">
                  <label htmlFor="date" className="form-label">Fecha</label>
                  <input
                    id="date"
                    type="date"
                    className={`form-control ${errors.date ? 'is-invalid' : ''}`}
                    {...register('date', { required: 'La fecha es obligatoria' })}
                  />
                  {errors.date && (
                    <div className="invalid-feedback">{errors.date.message}</div>
                  )}
                </div>

                {/* Hora inicio y fin (en la misma fila) */}
                <div className="row mb-3">
                  <div className="col-6">
                    <label htmlFor="startTime" className="form-label">Hora inicio</label>
                    <input
                      id="startTime"
                      type="time"
                      className={`form-control ${errors.startTime ? 'is-invalid' : ''}`}
                      {...register('startTime', { required: 'Requerido' })}
                    />
                  </div>
                  <div className="col-6">
                    <label htmlFor="endTime" className="form-label">Hora fin</label>
                    <input
                      id="endTime"
                      type="time"
                      className={`form-control ${errors.endTime ? 'is-invalid' : ''}`}
                      {...register('endTime', { required: 'Requerido' })}
                    />
                  </div>
                </div>

                {/* Tipo de cita */}
                <div className="mb-3">
                  <label htmlFor="type" className="form-label">Modalidad</label>
                  <select id="type" className="form-select" {...register('type')}>
                    <option value="PRESENCIAL">🏥 Presencial</option>
                    <option value="VIRTUAL">💻 Virtual</option>
                  </select>
                </div>

                {/* Notas */}
                <div className="mb-3">
                  <label htmlFor="notes" className="form-label">Notas (opcional)</label>
                  <textarea
                    id="notes"
                    rows="2"
                    className="form-control"
                    placeholder="Motivo de consulta, observaciones..."
                    {...register('notes')}
                  />
                </div>
              </div>

              {/* ── Footer con acciones ── */}
              <div className="modal-footer">
                {/* Acciones de estado (solo en modo edición) */}
                {isEditing && appointment.status === 'PENDING' && (
                  <button type="button" className="btn btn-sm me-auto"
                    style={{ backgroundColor: 'var(--color-accent-50)', color: 'var(--color-accent-600)', border: 'none' }}
                    onClick={() => onConfirm?.(appointment.id)}>
                    Confirmar cita
                  </button>
                )}
                {isEditing && ['PENDING', 'CONFIRMED'].includes(appointment.status) && (
                  <button type="button" className="btn btn-sm"
                    style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: 'none' }}
                    onClick={() => onCancel?.(appointment.id)}>
                    Cancelar cita
                  </button>
                )}

                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}>
                  Cerrar
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {isEditing ? 'Guardar cambios' : 'Agendar cita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
