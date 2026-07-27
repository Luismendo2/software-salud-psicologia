/* ==========================================================================
   AgendaPage — Vista principal del módulo de agenda
   
   Es la primera pantalla que ve el psicólogo al abrir PsiAgenda.
   Combina el CalendarView con un panel lateral de citas del día.
   
   Flujo:
   1. Al cargar, obtiene todas las citas del servicio
   2. Las pasa al CalendarView para renderizar
   3. Click en slot vacío → abre modal en modo "crear"
   4. Click en cita → abre modal en modo "editar"
   5. Al guardar → actualiza el estado local
   ========================================================================== */

import { useState, useEffect, useCallback } from 'react';
import CalendarView from './CalendarView';
import AppointmentCard from './AppointmentCard';
import AppointmentModal from './AppointmentModal';
import {
  getAllAppointments,
  createAppointment,
  updateAppointment,
  confirmAppointment,
  cancelAppointment,
} from '../../services/appointmentService';

export default function AgendaPage() {
  // ── Estado ──
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [defaultDate, setDefaultDate] = useState(null);

  // ── Carga inicial de citas ──
  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const data = await getAllAppointments();
      setAppointments(data);
    } catch (err) {
      console.error('Error cargando citas:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Citas de hoy para el panel lateral ──
  const todayStr = new Date().toDateString();
  const todayAppointments = appointments
    .filter((apt) => new Date(apt.startTime).toDateString() === todayStr)
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  // ── Handlers del modal ──
  const handleDateClick = useCallback((dateStr) => {
    setSelectedAppointment(null);
    setDefaultDate(dateStr.slice(0, 10));
    setModalOpen(true);
  }, []);

  const handleEventClick = useCallback((appointment) => {
    setSelectedAppointment(appointment);
    setDefaultDate(null);
    setModalOpen(true);
  }, []);

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedAppointment(null);
    setDefaultDate(null);
  };

  const handleSave = async (data) => {
    try {
      if (selectedAppointment) {
        const updated = await updateAppointment(selectedAppointment.id, data);
        setAppointments((prev) =>
          prev.map((apt) => (apt.id === updated.id ? updated : apt))
        );
      } else {
        const created = await createAppointment(data);
        setAppointments((prev) => [...prev, created]);
      }
      handleCloseModal();
    } catch (err) {
      console.error('Error guardando cita:', err);
    }
  };

  const handleConfirm = async (id) => {
    try {
      const updated = await confirmAppointment(id);
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === updated.id ? updated : apt))
      );
      handleCloseModal();
    } catch (err) {
      console.error('Error confirmando cita:', err);
    }
  };

  const handleCancel = async (id) => {
    try {
      const updated = await cancelAppointment(id);
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === updated.id ? updated : apt))
      );
      handleCloseModal();
    } catch (err) {
      console.error('Error cancelando cita:', err);
    }
  };

  return (
    <>
      {/* ── Header de página ── */}
      <div className="page-header">
        <div>
          <h1>Agenda</h1>
          <p style={{
            margin: 0,
            fontSize: '0.875rem',
            color: 'var(--color-gray-500)',
          }}>
            {new Date().toLocaleDateString('es-CO', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setSelectedAppointment(null);
            setDefaultDate(new Date().toISOString().slice(0, 10));
            setModalOpen(true);
          }}
        >
          + Nueva cita
        </button>
      </div>

      {/* ── Layout: Calendario + Panel lateral ── */}
      <div className="row g-4">
        {/* Calendario (ocupa la mayor parte del espacio) */}
        <div className="col-12 col-xl-9">
          <div className="card">
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5" style={{ color: 'var(--color-gray-400)' }}>
                  Cargando agenda...
                </div>
              ) : (
                <CalendarView
                  appointments={appointments}
                  onDateClick={handleDateClick}
                  onEventClick={handleEventClick}
                />
              )}
            </div>
          </div>
        </div>

        {/* Panel lateral: citas de hoy */}
        <div className="col-12 col-xl-3">
          <div className="card">
            <div className="card-body">
              <h3 style={{ fontSize: '0.9375rem', marginBottom: 'var(--space-md)' }}>
                Citas de hoy
              </h3>

              {todayAppointments.length === 0 ? (
                <p style={{
                  fontSize: '0.8125rem',
                  color: 'var(--color-gray-400)',
                  textAlign: 'center',
                  padding: 'var(--space-xl) 0',
                }}>
                  No hay citas programadas para hoy
                </p>
              ) : (
                todayAppointments.map((apt) => (
                  <AppointmentCard
                    key={apt.id}
                    appointment={apt}
                    onClick={handleEventClick}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal de cita ── */}
      <AppointmentModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        appointment={selectedAppointment}
        defaultDate={defaultDate}
      />
    </>
  );
}
