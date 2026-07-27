/* ==========================================================================
   ClinicalRecordPage — Página principal de Historia Clínica de un paciente
   
   Contenedor con pestañas:
   - Notas de sesión (lista + editor)
   - Archivos adjuntos
   - Genograma / Familiograma
   
   Muestra además un encabezado con info del paciente, diagnóstico
   y objetivos terapéuticos editables.
   ========================================================================== */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getClinicalRecord, getSessionNotes } from '../../services/clinicalService';
import SessionNotesTab from './SessionNotesTab';
import AttachmentsTab from './AttachmentsTab';
import GenogramTab from './GenogramTab';

const TABS = [
  { key: 'notes',       label: 'Notas de sesión', icon: '📝' },
  { key: 'attachments', label: 'Archivos',        icon: '📎' },
  { key: 'genogram',    label: 'Genograma',        icon: '🌳' },
];

export default function ClinicalRecordPage() {
  const { patientId } = useParams();
  const [record, setRecord] = useState(null);
  const [notes, setNotes] = useState([]);
  const [activeTab, setActiveTab] = useState('notes');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [patientId]);

  const loadData = async () => {
    try {
      const [recordData, notesData] = await Promise.all([
        getClinicalRecord(patientId),
        getSessionNotes(patientId),
      ]);
      setRecord(recordData);
      setNotes(notesData);
    } catch (err) {
      console.error('Error cargando HC:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="clinical-loading">Cargando historia clínica...</div>;
  }

  if (!record) {
    return (
      <div className="clinical-empty">
        <span className="clinical-empty-icon">📋</span>
        <h3>Paciente no encontrado</h3>
        <Link to="/historia-clinica" className="btn btn-primary mt-3">
          Volver a pacientes
        </Link>
      </div>
    );
  }

  const draftCount = notes.filter(n => n.status === 'DRAFT').length;

  return (
    <div className="clinical-page">
      {/* ── Breadcrumb ── */}
      <div className="clinical-breadcrumb">
        <Link to="/historia-clinica">Pacientes</Link>
        <span className="clinical-breadcrumb-sep">/</span>
        <span>{record.patientName}</span>
      </div>

      {/* ── Header del paciente ── */}
      <div className="clinical-record-header">
        <div className="clinical-record-avatar">
          {record.patientName.split(' ').map(w => w[0]).join('').slice(0, 2)}
        </div>
        <div className="clinical-record-info">
          <h1>{record.patientName}</h1>
          {record.diagnosis && (
            <div className="clinical-diagnosis">{record.diagnosis}</div>
          )}
          {record.createdAt && (
            <div className="clinical-record-date">
              HC abierta el {new Date(record.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          )}
        </div>
        <div className="clinical-record-stats">
          <div className="clinical-stat">
            <div className="clinical-stat-value">{notes.length}</div>
            <div className="clinical-stat-label">Notas</div>
          </div>
          {draftCount > 0 && (
            <div className="clinical-stat clinical-stat--warning">
              <div className="clinical-stat-value">{draftCount}</div>
              <div className="clinical-stat-label">Borradores</div>
            </div>
          )}
        </div>
      </div>

      {/* ── Objetivos terapéuticos ── */}
      {record.objectives && record.objectives.length > 0 && (
        <div className="clinical-objectives">
          <h3>Objetivos terapéuticos</h3>
          <ol>
            {record.objectives.map((obj, i) => (
              <li key={i}>{obj}</li>
            ))}
          </ol>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="clinical-tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`clinical-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <span className="clinical-tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Contenido de la pestaña ── */}
      <div className="clinical-tab-content">
        {activeTab === 'notes' && (
          <SessionNotesTab
            patientId={patientId}
            notes={notes}
            onNotesChange={setNotes}
          />
        )}
        {activeTab === 'attachments' && (
          <AttachmentsTab patientId={patientId} />
        )}
        {activeTab === 'genogram' && (
          <GenogramTab patientId={patientId} />
        )}
      </div>
    </div>
  );
}
