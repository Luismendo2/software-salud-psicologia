/* ==========================================================================
   CrisisConfigTab — Configuración del protocolo de crisis (Historia Clínica)
   Permite al psicólogo personalizar los pasos de emergencia y contactos
   de red de apoyo para un paciente específico. (Feature 012 - CA-14)
   ========================================================================== */

import { useState, useEffect } from 'react';
import { getCrisisConfig, saveCrisisConfig } from '../../services/crisisService';

export default function CrisisConfigTab({ patientId }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const [protocolSteps, setProtocolSteps] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [newStepText, setNewStepText] = useState('');
  
  const [newContact, setNewContact] = useState({
    name: '',
    relationship: '',
    phone: '',
  });

  useEffect(() => {
    loadConfig();
  }, [patientId]);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await getCrisisConfig(patientId);
      setProtocolSteps(data.protocolSteps || []);
      setEmergencyContacts(data.emergencyContacts || []);
    } catch (err) {
      console.error('Error cargando configuración de crisis:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStep = (e) => {
    e.preventDefault();
    if (!newStepText.trim()) return;
    setProtocolSteps([...protocolSteps, newStepText.trim()]);
    setNewStepText('');
  };

  const handleRemoveStep = (index) => {
    setProtocolSteps(protocolSteps.filter((_, i) => i !== index));
  };

  const handleAddContact = (e) => {
    e.preventDefault();
    if (!newContact.name.trim() || !newContact.phone.trim()) return;
    setEmergencyContacts([
      ...emergencyContacts,
      {
        id: `ec-${Date.now()}`,
        name: newContact.name.trim(),
        relationship: newContact.relationship.trim() || 'Familiar',
        phone: newContact.phone.trim(),
      },
    ]);
    setNewContact({ name: '', relationship: '', phone: '' });
  };

  const handleRemoveContact = (id) => {
    setEmergencyContacts(emergencyContacts.filter((c) => c.id !== id));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await saveCrisisConfig(patientId, {
        protocolSteps,
        emergencyContacts,
      });
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3500);
    } catch (err) {
      console.error('Error guardando configuración de crisis:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-center text-muted">Cargando protocolo de crisis...</div>;
  }

  return (
    <div className="crisis-config-panel">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h3 className="h5 mb-1 text-danger d-flex align-items-center gap-2">
            <span>🚨</span> Protocolo de Actuación en Crisis
          </h3>
          <p className="text-muted small mb-0">
            Define las pautas de acción inmediata y los contactos de emergencia que el paciente verá
            en su portal al presionar &quot;Necesito ayuda ahora&quot;.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Guardando...' : '💾 Guardar Protocolo'}
        </button>
      </div>

      {successMsg && (
        <div className="alert alert-success d-flex align-items-center mb-4 py-2" role="alert">
          <span>✓ Protocolo de crisis actualizado correctamente para este paciente.</span>
        </div>
      )}

      {/* ── SECCIÓN 1: Pasos del Protocolo ── */}
      <div className="mb-5">
        <h4 className="h6 fw-bold text-uppercase text-secondary mb-3">
          1. Pasos secuenciales del protocolo
        </h4>
        <p className="small text-muted mb-3">
          Instrucciones claras y concisas para que el paciente las siga paso a paso durante un pico de desregulación o crisis.
        </p>

        <div className="list-group mb-3">
          {protocolSteps.map((step, idx) => (
            <div
              key={idx}
              className="list-group-item d-flex justify-content-between align-items-center bg-light"
            >
              <div className="d-flex align-items-start gap-2">
                <span className="badge bg-primary text-white rounded-pill px-2 py-1">
                  {idx + 1}
                </span>
                <span className="small text-dark">{step}</span>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={() => handleRemoveStep(idx)}
                title="Eliminar paso"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddStep} className="d-flex gap-2">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Escribe una instrucción para el protocolo (ej. Técnica de respiración diafragmática)..."
            value={newStepText}
            onChange={(e) => setNewStepText(e.target.value)}
          />
          <button type="submit" className="btn btn-sm btn-secondary text-nowrap">
            + Añadir paso
          </button>
        </form>
      </div>

      {/* ── SECCIÓN 2: Contactos de Emergencia Personales ── */}
      <div>
        <h4 className="h6 fw-bold text-uppercase text-secondary mb-3">
          2. Contactos de la Red de Apoyo del Paciente
        </h4>
        <p className="small text-muted mb-3">
          Familiares o personas de confianza que el paciente podrá llamar directamente con un toque desde su teléfono.
        </p>

        <div className="row g-2 mb-3">
          {emergencyContacts.map((contact) => (
            <div key={contact.id} className="col-md-6">
              <div className="p-3 border rounded bg-light d-flex justify-content-between align-items-center">
                <div>
                  <div className="fw-semibold text-dark">{contact.name}</div>
                  <div className="small text-muted">
                    {contact.relationship} • {contact.phone}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleRemoveContact(contact.id)}
                  title="Eliminar contacto"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddContact} className="p-3 border rounded bg-white">
          <div className="row g-2 align-items-end">
            <div className="col-md-4">
              <label className="form-label small text-muted mb-1">Nombre completo</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Ej. Martha Mendoza"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label small text-muted mb-1">Parentesco</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Ej. Madre / Amigo"
                value={newContact.relationship}
                onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label small text-muted mb-1">Teléfono</label>
              <input
                type="tel"
                className="form-control form-control-sm"
                placeholder="Ej. +57 300 123 4567"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
              />
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-sm btn-outline-primary w-100">
                + Añadir
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
