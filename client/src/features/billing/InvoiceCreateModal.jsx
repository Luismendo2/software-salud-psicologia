/**
 * InvoiceCreateModal.jsx
 * Modal component to create a new draft invoice.
 */
import React, { useState, useMemo } from 'react';
import { createInvoice } from '../../services/billingService';

const MOCK_PATIENTS = [
  { id: 'p1', name: 'Carlos Mendoza' },
  { id: 'p2', name: 'Ana Torres' },
  { id: 'p3', name: 'Laura Gutiérrez' },
  { id: 'p4', name: 'Miguel Rodríguez' }
];

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CO', { 
    style: 'currency', 
    currency: 'COP', 
    minimumFractionDigits: 0 
  }).format(amount);
};

const InvoiceCreateModal = ({ isOpen, onClose, onCreated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    patientId: '',
    concept: '',
    subtotal: '',
    taxRate: '0',
    notes: ''
  });

  const { subtotal, iva, total } = useMemo(() => {
    const sub = parseFloat(formData.subtotal) || 0;
    const rate = parseFloat(formData.taxRate) || 0;
    const tax = sub * (rate / 100);
    return {
      subtotal: sub,
      iva: tax,
      total: sub + tax
    };
  }, [formData.subtotal, formData.taxRate]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patientId || !formData.concept || !formData.subtotal) {
      setError('Por favor completa los campos obligatorios.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const newInvoiceData = {
        patientId: formData.patientId,
        patientName: MOCK_PATIENTS.find(p => p.id === formData.patientId)?.name,
        concept: formData.concept,
        subtotal: subtotal,
        taxRate: parseFloat(formData.taxRate),
        notes: formData.notes
      };

      await createInvoice(newInvoiceData);
      onCreated();
      onClose();
    } catch (err) {
      console.error('Error al crear factura:', err);
      setError('Ocurrió un error al crear la factura. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="billing-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div className="billing-modal-card" style={{ backgroundColor: 'var(--bg-primary, white)', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 style={{ marginBottom: '1.5rem', marginTop: 0 }}>Nueva Factura</h2>
        
        {error && <div className="billing-alert billing-alert--error" style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '4px', marginBottom: '1rem' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} className="billing-form">
          <div className="billing-form-group" style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Paciente *</label>
            <select 
              name="patientId" 
              value={formData.patientId} 
              onChange={handleChange}
              className="form-select"
            >
              <option value="">Selecciona un paciente</option>
              {MOCK_PATIENTS.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="billing-form-group" style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Concepto *</label>
            <input 
              type="text" 
              name="concept" 
              value={formData.concept} 
              onChange={handleChange}
              placeholder="Ej: Consulta psicológica"
              className="form-control"
            />
          </div>

          <div className="billing-form-row" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div className="billing-form-group" style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Subtotal (COP) *</label>
              <input 
                type="number" 
                name="subtotal" 
                value={formData.subtotal} 
                onChange={handleChange}
                min="0"
                className="form-control"
              />
            </div>
            <div className="billing-form-group" style={{ width: '120px' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>IVA %</label>
              <select 
                name="taxRate" 
                value={formData.taxRate} 
                onChange={handleChange}
                className="form-select"
              >
                <option value="0">0%</option>
                <option value="19">19%</option>
              </select>
            </div>
          </div>

          <div className="billing-form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Notas (opcional)</label>
            <textarea 
              name="notes" 
              value={formData.notes} 
              onChange={handleChange}
              rows="3"
              className="form-control"
            />
          </div>

          <div className="billing-summary-card" style={{ backgroundColor: 'var(--bg-secondary, #f8f9fa)', padding: '1.25rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--border-color, #e5e7eb)' }}>
            <div className="billing-summary-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary, #6b7280)' }}>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="billing-summary-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary, #6b7280)' }}>IVA:</span>
              <span>{formatCurrency(iva)}</span>
            </div>
            <div className="billing-summary-row billing-summary-total" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color, #e5e7eb)', fontWeight: 'bold', fontSize: '1.1rem' }}>
              <span>Total:</span>
              <span style={{ color: 'var(--color-primary-600, #2563eb)' }}>{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="billing-modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button 
              type="button" 
              onClick={onClose}
              className="btn btn-outline-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Factura'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceCreateModal;
