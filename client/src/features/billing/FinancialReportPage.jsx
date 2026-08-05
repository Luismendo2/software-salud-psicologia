/**
 * FinancialReportPage Component
 * 
 * This page displays financial key performance indicators (KPIs), a revenue chart,
 * a breakdown of revenue by therapist, and a list of pending invoices.
 * It uses a custom CSS-based bar chart to display monthly revenue.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFinancialReport, getInvoices } from '../../services/billingService';
import { INVOICE_STATUS_CONFIG } from '../../mocks/billingMock';


const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CO', { 
    style: 'currency', 
    currency: 'COP', 
    minimumFractionDigits: 0 
  }).format(amount);
};

const formatDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-CO', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });
};

const formatMonth = (monthStr) => {
  if (!monthStr) return '';
  const str = monthStr.length === 7 ? `${monthStr}-01T00:00:00` : monthStr;
  return new Date(str).toLocaleDateString('es-CO', { 
    month: 'long', 
    year: 'numeric' 
  }).replace(/^\w/, c => c.toUpperCase());
};

const FinancialReportPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [pendingInvoices, setPendingInvoices] = useState([]);
  
  // Set default dates: last 6 months
  const today = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(today.getMonth() - 6);
  
  const [filters, setFilters] = useState({
    startDate: sixMonthsAgo.toISOString().split('T')[0],
    endDate: today.toISOString().split('T')[0]
  });

  const [chartLoaded, setChartLoaded] = useState(false);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const reportData = await getFinancialReport(filters.startDate, filters.endDate);
      setReport(reportData);
      
      const response = await getInvoices();
      const pending = response.data.filter(inv => inv.status === 'SENT');
      setPendingInvoices(pending);
    } catch (error) {
      console.error("Error fetching financial report:", error);
    } finally {
      setLoading(false);
      // Trigger chart animation
      setTimeout(() => setChartLoaded(true), 100);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    setChartLoaded(false);
    fetchReportData();
  };

  if (loading && !report) {
    return <div className="loading-state">Cargando reporte financiero...</div>;
  }

  if (!report) {
    return <div className="error-state">No se pudo cargar el reporte financiero.</div>;
  }

  // Calculate max revenue for chart scaling
  const maxRevenue = Math.max(...report.byMonth.map(m => m.revenue), 1);

  return (
    <div className="financial-report-page">
      <div className="billing-header">
        <div>
          <h1>Reportes Financieros</h1>
          <p>Visualiza los indicadores financieros de PsiAgenda</p>
        </div>
      </div>

      <div className="billing-filters">
        <div className="billing-filter-group">
          <label>Desde</label>
          <input 
            type="date" 
            name="startDate" 
            value={filters.startDate} 
            onChange={handleFilterChange} 
            className="form-control"
          />
        </div>
        <div className="billing-filter-group">
          <label>Hasta</label>
          <input 
            type="date" 
            name="endDate" 
            value={filters.endDate} 
            onChange={handleFilterChange} 
            className="form-control"
          />
        </div>
        <div className="billing-filter-actions">
          <button onClick={applyFilters} className="btn btn-primary" disabled={loading}>
            {loading ? 'Filtrando...' : 'Aplicar Filtros'}
          </button>
        </div>
      </div>

      <div className="financial-summary">
        <div className="financial-card">
          <div className="financial-card-icon">💰</div>
          <div className="financial-card-value positive">{formatCurrency(report.summary.totalRevenue)}</div>
          <div className="financial-card-label">Total Ingresos</div>
        </div>
        <div className="financial-card">
          <div className="financial-card-icon">📄</div>
          <div className="financial-card-value">{report.summary.totalInvoices}</div>
          <div className="financial-card-label">Facturas Emitidas</div>
        </div>
        <div className="financial-card">
          <div className="financial-card-icon">✅</div>
          <div className="financial-card-value positive">{report.summary.paidInvoices}</div>
          <div className="financial-card-label">Facturas Pagadas</div>
        </div>
        <div className="financial-card">
          <div className="financial-card-icon">⏳</div>
          <div className="financial-card-value warning">{report.summary.pendingInvoices}</div>
          <div className="financial-card-label">Facturas Pendientes</div>
        </div>
        <div className="financial-card">
          <div className="financial-card-icon">💵</div>
          <div className="financial-card-value warning">{formatCurrency(report.summary.pendingAmount)}</div>
          <div className="financial-card-label">Monto Pendiente</div>
        </div>
      </div>

      <div className="financial-sections-grid">
        <div className="financial-chart-section">
          <h2 className="financial-chart-title" style={{ marginBottom: '1.5rem' }}>Ingresos Mensuales</h2>
          <div className="financial-chart-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', justifyContent: 'center' }}>
            {report.byMonth.map((item, index) => {
              const widthPercentage = (item.revenue / maxRevenue) * 100;
              return (
                <div key={index} className="chart-row" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="chart-label" style={{ minWidth: '120px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {formatMonth(item.month)}
                  </div>
                  <div className="chart-bar-container" style={{ flex: 1, backgroundColor: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div 
                      className="chart-bar" 
                      style={{ 
                        width: chartLoaded ? `${widthPercentage}%` : '0%',
                        transition: `width 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${index * 0.1}s`,
                        background: 'linear-gradient(90deg, var(--color-primary-500), var(--color-accent-500))',
                        height: '24px',
                        borderRadius: '4px'
                      }}
                    ></div>
                  </div>
                  <div className="chart-value" style={{ minWidth: '100px', textAlign: 'right', fontWeight: '500' }}>
                    {formatCurrency(item.revenue)}
                  </div>
                </div>
              );
            })}
            {report.byMonth.length === 0 && (
              <div className="empty-state">No hay datos en este período.</div>
            )}
          </div>
        </div>

        <div className="financial-chart-section">
          <h2 className="financial-chart-title" style={{ marginBottom: '1.5rem' }}>Desglose por Terapeuta</h2>
          <div className="financial-therapists">
            {report.byPsychologist.map((therapist, index) => {
              const initials = therapist.name.split(' ').map(n => n[0]).join('').substring(0, 2);
              return (
                <div key={index} className="financial-therapist-card">
                  <div className="financial-therapist-avatar">
                    {initials}
                  </div>
                  <div className="financial-therapist-info">
                    <div className="financial-therapist-name">{therapist.name}</div>
                    <div className="financial-therapist-sessions">{therapist.sessions} sesiones</div>
                  </div>
                  <div className="financial-therapist-revenue">
                    {formatCurrency(therapist.revenue)}
                  </div>
                </div>
              );
            })}
            {report.byPsychologist.length === 0 && (
              <div className="empty-state">No hay datos en este período.</div>
            )}
          </div>
        </div>
      </div>

      <div className="financial-pending-section">
        <h2 className="financial-pending-title">
          Facturas Pendientes
          {pendingInvoices.length > 0 && <span className="financial-pending-count">{pendingInvoices.length}</span>}
        </h2>
        
        {pendingInvoices.length > 0 ? (
          <div className="billing-table-wrapper">
            <table className="billing-table">
              <thead>
                <tr>
                  <th>Factura</th>
                  <th>Paciente</th>
                  <th>Fecha</th>
                  <th>Monto</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {pendingInvoices.map(invoice => {
                  const statusConfig = INVOICE_STATUS_CONFIG[invoice.status] || { label: invoice.status, color: 'gray' };
                  return (
                    <tr 
                      key={invoice.id} 
                      onClick={() => navigate(`/facturacion/${invoice.id}`)}
                      className="clickable-row"
                    >
                      <td><strong>{invoice.number}</strong></td>
                      <td>{invoice.patientName}</td>
                      <td>{formatDate(invoice.date)}</td>
                      <td><strong>{formatCurrency(invoice.total)}</strong></td>
                      <td>
                        <span className={`billing-status billing-status--${invoice.status.toLowerCase()}`}>
                          {statusConfig.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>No hay facturas pendientes de pago en este momento.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialReportPage;
