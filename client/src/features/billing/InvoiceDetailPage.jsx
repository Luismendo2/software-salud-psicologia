/**
 * InvoiceDetailPage.jsx
 * Detailed view of a single invoice with actions based on its status.
 */
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  getInvoice, 
  getPayments, 
  sendInvoice, 
  voidInvoice, 
  markInvoicePaid, 
  initiateWompiPayment 
} from '../../services/billingService';
import { 
  INVOICE_STATUS_CONFIG, 
  PAYMENT_GATEWAY_LABELS, 
  PAYMENT_METHOD_LABELS 
} from '../../mocks/billingMock';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CO', { 
    style: 'currency', 
    currency: 'COP', 
    minimumFractionDigits: 0 
  }).format(amount);
};

const formatDate = (iso) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('es-CO', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });
};

const formatDateTime = (iso) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('es-CO', { 
    day: '2-digit', month: 'short', year: 'numeric', 
    hour: '2-digit', minute: '2-digit'
  });
};

const InvoiceDetailPage = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [showMarkPaidForm, setShowMarkPaidForm] = useState(false);
  const [paidForm, setPaidForm] = useState({ gateway: 'CASH', method: 'CASH' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [invRes, payRes] = await Promise.all([
          getInvoice(id),
          getPayments(id)
        ]);
        setInvoice(invRes);
        setPayments(payRes);
      } catch (err) {
        console.error('Error cargando detalles:', err);
        setError('No se pudo cargar la factura.');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchData();
  }, [id]);

  const handleSend = async () => {
    try {
      setActionLoading(true);
      const updated = await sendInvoice(id);
      setInvoice(updated);
    } catch (err) {
      console.error(err);
      setError('Error al emitir factura.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVoid = async () => {
    if (!window.confirm('¿Estás seguro de que deseas anular esta factura? Esta acción no se puede deshacer.')) return;
    
    try {
      setActionLoading(true);
      const updated = await voidInvoice(id);
      setInvoice(updated);
    } catch (err) {
      console.error(err);
      setError('Error al anular factura.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleWompiPayment = async () => {
    try {
      setActionLoading(true);
      const paymentLink = await initiateWompiPayment(id);
      // Simulate redirection to gateway
      window.location.href = paymentLink || '#';
    } catch (err) {
      console.error(err);
      setError('Error al iniciar cobro en línea.');
      setActionLoading(false);
    }
  };

  const handleMarkPaid = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const result = await markInvoicePaid(id, paidForm);
      setInvoice(result.invoice);
      setPayments(result.payments || []);
      setShowMarkPaidForm(false);
    } catch (err) {
      console.error(err);
      setError('Error al registrar el pago.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="billing-loading">Cargando detalles...</div>;
  if (error || !invoice) return <div className="billing-alert billing-alert--error">{error || 'Factura no encontrada'}</div>;

  return (
    <div className="invoice-detail-page">
      <div className="invoice-breadcrumb">
        <Link to="/facturacion" className="invoice-back-link">← Facturación</Link>
        <span> / {invoice.number}</span>
      </div>

      <div className="invoice-header-card">
        <div className="invoice-header-main" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <h1 style={{ margin: 0 }}>Factura {invoice.number}</h1>
          <span className={`billing-status billing-status--${invoice.status.toLowerCase()}`}>
            {INVOICE_STATUS_CONFIG[invoice.status]?.icon} {INVOICE_STATUS_CONFIG[invoice.status]?.label || invoice.status}
          </span>
        </div>
        
        <div className="invoice-detail-dates" style={{ marginBottom: '1rem' }}>
          <div><strong>Creada:</strong> {formatDate(invoice.createdAt)}</div>
          {invoice.sentAt && <div><strong>Emitida:</strong> {formatDate(invoice.sentAt)}</div>}
          {invoice.paidAt && <div><strong>Pagada:</strong> {formatDate(invoice.paidAt)}</div>}
        </div>
        
        {invoice.dianReference && (
          <div className="invoice-dian">
            <strong>CUFE:</strong> {invoice.dianReference}
          </div>
        )}

        <div className="invoice-detail-actions" style={{ marginTop: '1rem' }}>
          {invoice.status === 'DRAFT' && (
            <>
              <button className="btn btn-primary" onClick={handleSend} disabled={actionLoading}>
                Emitir factura
              </button>
              <button className="btn btn-outline-danger" onClick={handleVoid} disabled={actionLoading}>
                Anular
              </button>
            </>
          )}

          {invoice.status === 'SENT' && (
            <>
              <button className="btn btn-primary" onClick={handleWompiPayment} disabled={actionLoading}>
                Cobrar en línea
              </button>
              <button className="btn btn-outline-secondary" onClick={() => setShowMarkPaidForm(!showMarkPaidForm)} disabled={actionLoading}>
                Marcar como pagado
              </button>
              <button className="btn btn-outline-danger" onClick={handleVoid} disabled={actionLoading}>
                Anular
              </button>
            </>
          )}

          {invoice.status === 'PAID' && invoice.pdfUrl && (
            <a href={invoice.pdfUrl} target="_blank" rel="noreferrer" className="btn btn-outline-primary">
              Ver comprobante
            </a>
          )}
        </div>

        {showMarkPaidForm && invoice.status === 'SENT' && (
          <form className="invoice-inline-form" onSubmit={handleMarkPaid}>
            <h4>Registrar Pago Manual</h4>
            <div className="billing-form-group">
              <label>Método de pago</label>
              <select 
                value={paidForm.method} 
                onChange={(e) => setPaidForm({ ...paidForm, method: e.target.value })}
                className="billing-input"
              >
                <option value="CASH">Efectivo</option>
                <option value="BANK_TRANSFER">Transferencia Bancaria</option>
                <option value="CARD">Tarjeta</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={actionLoading}>
              Confirmar Pago
            </button>
          </form>
        )}
      </div>

      <div className="invoice-parties">
        <div className="invoice-party">
          <h3>Emisor</h3>
          <p>Dra. María López</p>
          <p>NIT: 900.123.456-7</p>
        </div>
        <div className="invoice-party">
          <h3>Receptor</h3>
          <p>{invoice.patientName}</p>
        </div>
      </div>

      <div className="invoice-items-card">
        <h3>Conceptos</h3>
        <table className="billing-table">
          <thead>
            <tr>
              <th>Concepto</th>
              <th>Subtotal</th>
              <th>IVA ({invoice.taxRate || 0}%)</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{invoice.concept}</td>
              <td>{formatCurrency(invoice.subtotal)}</td>
              <td>{formatCurrency(invoice.tax)}</td>
              <td><strong>{formatCurrency(invoice.total)}</strong></td>
            </tr>
          </tbody>
        </table>
        {invoice.notes && (
          <div className="invoice-notes">
            <strong>Notas:</strong> {invoice.notes}
          </div>
        )}
      </div>

      {payments.length > 0 && (
        <div className="payment-history-card">
          <h3>Historial de Pagos</h3>
          <ul className="payment-list">
            {payments.map(payment => (
              <li key={payment.id} className="payment-item">
                <div className="payment-info">
                  <span className={`payment-gateway-badge payment-gateway-badge--${payment.gateway.toLowerCase()}`}>
                    {PAYMENT_GATEWAY_LABELS[payment.gateway] || payment.gateway}
                  </span>
                  <span className="payment-method">
                    {PAYMENT_METHOD_LABELS[payment.method] || payment.method}
                  </span>
                  <span className="payment-date">{formatDateTime(payment.createdAt)}</span>
                </div>
                <div className="payment-amount" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {formatCurrency(payment.amount)}
                  <span className={`payment-status-badge payment-status--${payment.status.toLowerCase()}`}>
                    {payment.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default InvoiceDetailPage;
