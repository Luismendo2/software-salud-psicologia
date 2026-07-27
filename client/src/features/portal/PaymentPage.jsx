/* ==========================================================================
   PaymentPage — Página de pago con Wompi
   
   Simula el flujo de pago:
   1. Muestra resumen de la factura
   2. El botón "Pagar" redirige al checkout de Wompi (simulado)
   3. Muestra estados de éxito o error al retornar
   
   En producción, el backend genera la URL con la referencia real.
   ========================================================================== */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getInvoices, initiatePayment } from '../../services/patientService';

const formatCOP = (amount) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);

export default function PaymentPage() {
  const { invoiceId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Verificar si venimos de un retorno de la pasarela
  const paymentStatus = searchParams.get('status');

  useEffect(() => {
    loadInvoice();
  }, [invoiceId]);

  const loadInvoice = async () => {
    try {
      const invoices = await getInvoices();
      const found = invoices.find(i => i.id === invoiceId);
      setInvoice(found || null);
    } catch (err) {
      console.error('Error cargando factura:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    setProcessing(true);
    try {
      // En producción esto abre la URL de Wompi
      await initiatePayment(invoiceId);
      // Simulamos un pago exitoso
      navigate(`/portal/pagos/${invoiceId}?status=success`);
    } catch (err) {
      console.error('Error iniciando pago:', err);
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="portal-loading">Cargando factura...</div>;
  }

  // ── Estado de retorno: éxito ──
  if (paymentStatus === 'success') {
    return (
      <div className="portal-page">
        <div className="portal-success-card">
          <div className="portal-success-icon">✓</div>
          <h2>Pago exitoso</h2>
          <p>Tu pago de <strong>{invoice ? formatCOP(invoice.amount) : ''}</strong> ha sido procesado correctamente.</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)', marginTop: 'var(--space-sm)' }}>
            Recibirás una confirmación por correo electrónico.
          </p>
          <button className="btn btn-primary mt-3" onClick={() => navigate('/portal/pagos')}>
            Volver a pagos
          </button>
        </div>
      </div>
    );
  }

  // ── Estado de retorno: error ──
  if (paymentStatus === 'error') {
    return (
      <div className="portal-page">
        <div className="portal-success-card" style={{ borderColor: 'var(--color-danger)' }}>
          <div className="portal-success-icon" style={{ backgroundColor: '#fef2f2', color: 'var(--color-danger)' }}>✕</div>
          <h2>Pago no completado</h2>
          <p>Hubo un problema procesando tu pago. No se realizó ningún cobro.</p>
          <div className="d-flex gap-2 mt-3 justify-content-center">
            <button className="btn btn-primary" onClick={() => navigate(`/portal/pagos/${invoiceId}`)}>
              Reintentar
            </button>
            <button className="btn btn-outline-secondary" onClick={() => navigate('/portal/pagos')}>
              Volver a pagos
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="portal-page">
        <div className="portal-empty-state">
          <span className="portal-empty-icon">🧾</span>
          <h3>Factura no encontrada</h3>
          <button className="btn btn-primary mt-3" onClick={() => navigate('/portal/pagos')}>
            Volver a pagos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="portal-page">
      <div className="portal-page-header">
        <h1>Realizar pago</h1>
      </div>

      <div className="portal-payment-card">
        <div className="portal-payment-summary">
          <div className="portal-payment-row">
            <span>Concepto</span>
            <strong>{invoice.concept}</strong>
          </div>
          <div className="portal-payment-row">
            <span>Fecha de sesión</span>
            <strong>{new Date(invoice.date).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
          </div>
          <div className="portal-payment-row">
            <span>Profesional</span>
            <strong>{invoice.psychologistName}</strong>
          </div>
          <div className="portal-payment-divider" />
          <div className="portal-payment-row portal-payment-total">
            <span>Total a pagar</span>
            <strong>{formatCOP(invoice.amount)}</strong>
          </div>
        </div>

        <div className="portal-payment-methods">
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-gray-500)', marginBottom: 'var(--space-md)' }}>
            Serás redirigido al checkout seguro de Wompi para completar el pago con tarjeta de crédito, débito o transferencia bancaria.
          </p>
          <button
            className="btn btn-primary w-100 py-2"
            onClick={handlePay}
            disabled={processing}
          >
            {processing ? 'Redirigiendo a Wompi...' : `Pagar ${formatCOP(invoice.amount)}`}
          </button>
        </div>

        <div className="portal-payment-secure">
          🔒 Pago seguro procesado por Wompi. No almacenamos datos de tu tarjeta.
        </div>
      </div>
    </div>
  );
}
