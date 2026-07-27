/* ==========================================================================
   InvoiceListPage — Historial de facturas y pagos
   
   Lista las facturas del paciente con dos estados: PENDING y PAID.
   Las pendientes muestran un botón para iniciar el pago vía Wompi.
   Los montos se formatean en COP colombiano.
   ========================================================================== */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getInvoices } from '../../services/patientService';

/** Formateador de moneda colombiana */
const formatCOP = (amount) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);

export default function InvoiceListPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const data = await getInvoices();
      setInvoices(data);
    } catch (err) {
      console.error('Error cargando facturas:', err);
    } finally {
      setLoading(false);
    }
  };

  const pending = invoices.filter(i => i.status === 'PENDING');
  const paid = invoices.filter(i => i.status === 'PAID');

  if (loading) {
    return <div className="portal-loading">Cargando facturas...</div>;
  }

  return (
    <div className="portal-page">
      <div className="portal-page-header">
        <h1>Pagos y facturas</h1>
        <p>Consulta tus pagos realizados y facturas pendientes.</p>
      </div>

      {/* ── Pendientes ── */}
      {pending.length > 0 && (
        <div className="portal-section">
          <div className="portal-section-header">
            <h2>Pendientes de pago</h2>
          </div>
          <div className="portal-invoices-list">
            {pending.map(inv => (
              <div key={inv.id} className="portal-invoice-card portal-invoice-card--pending">
                <div className="portal-invoice-info">
                  <div className="portal-invoice-concept">{inv.concept}</div>
                  <div className="portal-invoice-date">
                    {new Date(inv.date).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <div className="portal-invoice-psych">{inv.psychologistName}</div>
                </div>
                <div className="portal-invoice-right">
                  <div className="portal-invoice-amount">{formatCOP(inv.amount)}</div>
                  <Link to={`/portal/pagos/${inv.id}`} className="btn btn-primary btn-sm">
                    Pagar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Pagadas ── */}
      <div className="portal-section">
        <div className="portal-section-header">
          <h2>Historial de pagos</h2>
        </div>
        {paid.length === 0 ? (
          <div className="portal-empty-state">
            <span className="portal-empty-icon">💳</span>
            <h3>Sin pagos registrados</h3>
            <p>Aquí aparecerán tus pagos completados.</p>
          </div>
        ) : (
          <div className="portal-invoices-list">
            {paid.map(inv => (
              <div key={inv.id} className="portal-invoice-card portal-invoice-card--paid">
                <div className="portal-invoice-info">
                  <div className="portal-invoice-concept">{inv.concept}</div>
                  <div className="portal-invoice-date">
                    {new Date(inv.date).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <div className="portal-invoice-psych">{inv.psychologistName}</div>
                </div>
                <div className="portal-invoice-right">
                  <div className="portal-invoice-amount">{formatCOP(inv.amount)}</div>
                  <span className="portal-invoice-status paid">✓ Pagado</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
