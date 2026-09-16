/* ==========================================================================
   LibraryPage — Biblioteca Terapéutica centralizada (Feature 012)
   Búsqueda simultánea, filtrado por enfoque/tipo/ámbito y descarga/subida.
   ========================================================================== */

import { useState, useEffect, useCallback } from 'react';
import { getLibraryResources } from '../../services/libraryService';
import LibraryFilterSidebar from './LibraryFilterSidebar';
import LibraryCard from './LibraryCard';
import UploadResourceModal from './UploadResourceModal';
import ResourcePreviewModal from './ResourcePreviewModal';
import { useAuth } from '../auth/AuthContext';

export default function LibraryPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros simultáneos (CA-16)
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedTherapy, setSelectedTherapy] = useState('ALL');
  const [selectedScope, setSelectedScope] = useState('ALL');

  // Modales
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [downloadNotice, setDownloadNotice] = useState('');

  const loadResources = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLibraryResources({
        search,
        type: selectedType,
        therapyType: selectedTherapy,
        scope: selectedScope,
        organizationId: user?.organizationId || 'org-1',
      });
      setResources(data);
    } catch (err) {
      console.error('Error cargando biblioteca:', err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedType, selectedTherapy, selectedScope, user]);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  const handleDownload = (item) => {
    setDownloadNotice(`Descargando "${item.title}" (${item.fileSize})...`);
    setTimeout(() => {
      setDownloadNotice('');
    }, 4000);
  };

  return (
    <div className="p-4" style={{ maxWidth: '1300px', margin: '0 auto' }}>
      {/* ── Encabezado de la página ── */}
      <div className="library-header">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span style={{ fontSize: '1.75rem' }}>📚</span>
            <h1 className="mb-0">Biblioteca Terapéutica</h1>
          </div>
          <p>
            Accede a plantillas de intervención, guías psicoeducativas, ejercicios prácticos y escalas validadas.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary d-flex align-items-center gap-2"
          onClick={() => setShowUploadModal(true)}
        >
          <span>📤</span>
          <span>Subir material</span>
        </button>
      </div>

      {downloadNotice && (
        <div className="alert alert-info py-2 small mb-3 d-flex align-items-center gap-2">
          <span>ℹ️</span> {downloadNotice}
        </div>
      )}

      {/* ── Buscador por texto libre (CA-16) ── */}
      <div className="library-search-bar">
        <div className="input-group">
          <span className="input-group-text bg-white border-end-0">🔍</span>
          <input
            type="search"
            className="form-control border-start-0"
            placeholder="Buscar por título, temática, palabras clave o diagnóstico (ej. ansiedad, insomnio, beck, gestalt)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={() => setSearch('')}
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* ── Layout: Barra Lateral + Grilla de Contenido ── */}
      <div className="library-layout">
        <LibraryFilterSidebar
          selectedType={selectedType}
          onSelectType={setSelectedType}
          selectedTherapy={selectedTherapy}
          onSelectTherapy={setSelectedTherapy}
          selectedScope={selectedScope}
          onSelectScope={setSelectedScope}
          totalResults={resources.length}
        />

        <main className="library-content">
          {loading ? (
            <div className="text-center py-5 text-muted">
              Cargando materiales terapéuticos...
            </div>
          ) : resources.length === 0 ? (
            <div className="text-center py-5 bg-white border rounded p-4">
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📂</div>
              <h3 className="h6 fw-bold text-dark mb-1">No se encontraron materiales</h3>
              <p className="small text-muted mb-3">
                Prueba cambiando los filtros o utiliza otros términos de búsqueda.
              </p>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={() => {
                  setSearch('');
                  setSelectedType('ALL');
                  setSelectedTherapy('ALL');
                  setSelectedScope('ALL');
                }}
              >
                Restablecer todos los filtros
              </button>
            </div>
          ) : (
            <div className="library-grid">
              {resources.map((item) => (
                <LibraryCard
                  key={item.id}
                  item={item}
                  onPreview={(res) => setPreviewItem(res)}
                  onDownload={handleDownload}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ── Modal de Subida de Material (CA-15) ── */}
      <UploadResourceModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploaded={loadResources}
        user={user}
      />

      {/* ── Modal de Vista Previa y Descarga (CA-18) ── */}
      <ResourcePreviewModal
        item={previewItem}
        onClose={() => setPreviewItem(null)}
        onDownload={handleDownload}
      />
    </div>
  );
}
