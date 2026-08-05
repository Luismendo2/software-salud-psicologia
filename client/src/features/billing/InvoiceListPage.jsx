/**
 * InvoiceListPage.jsx
 * Main page for the billing feature, listing all invoices with filtering,
 * pagination, and a summary view of the clinic's billing history.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInvoices } from '../../services/billingService';
import { INVOICE_STATUS_CONFIG } from '../../mocks/billingMock';
import InvoiceCreateModal from './InvoiceCreateModal';

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

const InvoiceListPage = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: ''
  });

  const loadInvoices = useCallback(async () => {
    try {
      setLoading(true);
      // Construct query params from filters and pagination
      const queryParams = { ...filters, page: pagination.page };
      // Clean empty filters
      Object.keys(queryParams).forEach(key => !queryParams[key] && delete queryParams[key]);
      
      const response = await getInvoices(queryParams);
      setInvoices(response.data);
      setPagination({
        page: response.page,
        totalPages: response.totalPages,
        total: response.total
      });
    } catch (error) {
      console.error('Error al cargar facturas:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({ status: '', startDate: '', endDate: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleInvoiceCreated = () => {
    loadInvoices();
  };

  return (
    <div className="billing-page">
      <div className="billing-header">
        <div>
          <h1>Facturación</h1>
          <p>Gestiona los cobros y facturas de tus pacientes</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          Nueva factura
        </button>
      </div>

      <div className="billing-filters">
        <div className="billing-filter-group">
          <label>Estado</label>
          <select 
            name="status" 
            value={filters.status} 
            onChange={handleFilterChange}
            className="form-select"
          >
            <option value="">Todos los estados</option>
            <option value="DRAFT">Borrador</option>
            <option value="SENT">Enviada</option>
            <option value="PAID">Pagada</option>
            <option value="VOID">Anulada</option>
          </select>
        </div>

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

        <div className="billing-filter-actions" style={{ paddingBottom: '2px' }}>
          <button className="btn btn-outline-secondary" onClick={handleClearFilters}>
            Limpiar filtros
          </button>
        </div>
      </div>

      <div className="billing-table-container">
        {loading ? (
          <div className="billing-loading">Cargando facturas...</div>
        ) : invoices.length === 0 ? (
          <div className="billing-empty">
            <div className="billing-empty-icon">📄</div>
            <h3>No hay facturas</h3>
            <p>No se encontraron facturas con los filtros seleccionados.</p>
          </div>
        ) : (
          <table className="billing-table">
            <thead>
              <tr>
                <th>Nro. Factura</th>
                <th>Paciente</th>
                <th>Concepto</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr 
                  key={invoice.id} 
                  onClick={() => navigate(`/facturacion/${invoice.id}`)}
                  className="billing-table-row"
                >
                  <td>{invoice.number}</td>
                  <td>{invoice.patientName}</td>
                  <td>{invoice.concept}</td>
                  <td>{formatCurrency(invoice.total)}</td>
                  <td>
                    <span className={`billing-status billing-status--${invoice.status.toLowerCase()}`}>
                      {INVOICE_STATUS_CONFIG[invoice.status]?.label || invoice.status}
                    </span>
                  </td>
                  <td>{formatDate(invoice.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && pagination.totalPages > 1 && (
        <div className="billing-pagination">
          <button 
            className="btn btn-outline-secondary btn-sm"
            disabled={pagination.page === 1}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
          >
            Anterior
          </button>
          <span>Página {pagination.page} de {pagination.totalPages}</span>
          <button 
            className="btn btn-outline-secondary btn-sm"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
          >
            Siguiente
          </button>
        </div>
      )}

      <InvoiceCreateModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleInvoiceCreated}
      />
    </div>
  );
};

export default InvoiceListPage;
