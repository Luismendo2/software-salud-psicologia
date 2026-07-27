/* ==========================================================================
   GenogramTab — Editor visual de genograma / familiograma
   
   Implementa un editor SVG interactivo donde el psicólogo puede:
   - Ver nodos (personas) con simbología estándar McGoldrick & Gerson
   - Arrastrar nodos para reorganizar
   - Ver las relaciones (líneas) entre nodos
   - Agregar nuevos nodos
   - Autoguardar cambios
   
   Usa SVG nativo en lugar de React Flow para evitar una dependencia
   pesada en la fase de mocks. Cuando se integre el backend se puede
   migrar si la complejidad lo justifica.
   ========================================================================== */

import { useState, useEffect, useRef, useCallback } from 'react';
import { getGenogram, updateGenogram } from '../../services/clinicalService';

/* Constantes visuales */
const NODE_SIZE = 40;
const COLORS = {
  male: '#3b82f6',
  female: '#ec4899',
  other: '#8b5cf6',
  patient: '#f59e0b',
  deceased: '#9ca3af',
  edge: '#6b7280',
  conflict: '#ef4444',
  married: '#22c55e',
  partner: '#3b82f6',
  parent: '#6b7280',
};

export default function GenogramTab({ patientId }) {
  const [genogram, setGenogram] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const svgRef = useRef(null);
  const draggingRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const saveTimerRef = useRef(null);

  useEffect(() => {
    loadGenogram();
  }, [patientId]);

  const loadGenogram = async () => {
    try {
      const data = await getGenogram(patientId);
      setGenogram(data);
    } catch (err) {
      console.error('Error cargando genograma:', err);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSave = useCallback((data) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        await updateGenogram(patientId, data);
      } catch (err) {
        console.error('Error guardando genograma:', err);
      }
    }, 2000);
  }, [patientId]);

  /* ── Drag handlers ── */
  const getSVGPoint = (e) => {
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    const clientEvent = e.touches ? e.touches[0] : e;
    pt.x = clientEvent.clientX;
    pt.y = clientEvent.clientY;
    const svgPt = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: svgPt.x, y: svgPt.y };
  };

  const onMouseDown = (e, nodeId) => {
    e.stopPropagation();
    const node = genogram.nodes.find(n => n.id === nodeId);
    const pt = getSVGPoint(e);
    offsetRef.current = { x: pt.x - node.x, y: pt.y - node.y };
    draggingRef.current = nodeId;
    setSelectedNode(nodeId);
  };

  const onMouseMove = (e) => {
    if (!draggingRef.current) return;
    e.preventDefault();
    const pt = getSVGPoint(e);
    const newNodes = genogram.nodes.map(n =>
      n.id === draggingRef.current
        ? { ...n, x: pt.x - offsetRef.current.x, y: pt.y - offsetRef.current.y }
        : n
    );
    const updated = { ...genogram, nodes: newNodes };
    setGenogram(updated);
  };

  const onMouseUp = () => {
    if (draggingRef.current) {
      debouncedSave(genogram);
      draggingRef.current = null;
    }
  };

  /* ── Agregar nodo ── */
  const handleAddNode = (type) => {
    const newNode = {
      id: `gn-${Date.now()}`,
      type,
      label: `Nuevo\n(${type === 'male' ? 'hombre' : type === 'female' ? 'mujer' : 'otro'})`,
      x: 300,
      y: 150,
      age: 0,
      deceased: false,
      notes: '',
    };
    const updated = { ...genogram, nodes: [...genogram.nodes, newNode] };
    setGenogram(updated);
    debouncedSave(updated);
    setShowAddModal(false);
  };

  /* ── Render de nodos ── */
  const renderNode = (node) => {
    const isSelected = selectedNode === node.id;
    const color = node.isPatient ? COLORS.patient
      : node.deceased ? COLORS.deceased
      : COLORS[node.type] || COLORS.other;

    const half = NODE_SIZE / 2;
    const lines = node.label.split('\n');

    return (
      <g
        key={node.id}
        transform={`translate(${node.x}, ${node.y})`}
        onMouseDown={(e) => onMouseDown(e, node.id)}
        onTouchStart={(e) => onMouseDown(e, node.id)}
        style={{ cursor: 'grab' }}
      >
        {/* Forma según género */}
        {node.type === 'male' ? (
          <rect
            x={-half} y={-half}
            width={NODE_SIZE} height={NODE_SIZE}
            fill="white"
            stroke={color}
            strokeWidth={isSelected ? 3 : 2}
            rx={4}
          />
        ) : node.type === 'female' ? (
          <circle
            cx={0} cy={0} r={half}
            fill="white"
            stroke={color}
            strokeWidth={isSelected ? 3 : 2}
          />
        ) : (
          <polygon
            points={`0,${-half} ${half},0 0,${half} ${-half},0`}
            fill="white"
            stroke={color}
            strokeWidth={isSelected ? 3 : 2}
          />
        )}

        {/* Marca de fallecido (X) */}
        {node.deceased && (
          <>
            <line x1={-half+5} y1={-half+5} x2={half-5} y2={half-5} stroke={COLORS.deceased} strokeWidth={2} />
            <line x1={half-5} y1={-half+5} x2={-half+5} y2={half-5} stroke={COLORS.deceased} strokeWidth={2} />
          </>
        )}

        {/* Marca del paciente identificado */}
        {node.isPatient && (
          <circle cx={0} cy={0} r={half + 6} fill="none" stroke={COLORS.patient} strokeWidth={2} strokeDasharray="4 2" />
        )}

        {/* Etiquetas */}
        {lines.map((line, i) => (
          <text
            key={i}
            x={0}
            y={half + 14 + (i * 14)}
            textAnchor="middle"
            fontSize="11"
            fill="var(--color-gray-700)"
            fontFamily="var(--font-family)"
          >
            {line}
          </text>
        ))}
      </g>
    );
  };

  /* ── Render de aristas ── */
  const renderEdge = (edge) => {
    const source = genogram.nodes.find(n => n.id === edge.source);
    const target = genogram.nodes.find(n => n.id === edge.target);
    if (!source || !target) return null;

    const color = COLORS[edge.type] || COLORS.edge;
    const isDashed = edge.type === 'conflict' || edge.type === 'partner';

    return (
      <g key={edge.id}>
        <line
          x1={source.x} y1={source.y}
          x2={target.x} y2={target.y}
          stroke={color}
          strokeWidth={edge.type === 'conflict' ? 2.5 : 1.5}
          strokeDasharray={isDashed ? '6 3' : 'none'}
        />
        {edge.label && (
          <text
            x={(source.x + target.x) / 2}
            y={(source.y + target.y) / 2 - 6}
            textAnchor="middle"
            fontSize="10"
            fill="var(--color-gray-500)"
            fontFamily="var(--font-family)"
          >
            {edge.label}
          </text>
        )}
      </g>
    );
  };

  if (loading) {
    return <div className="clinical-loading">Cargando genograma...</div>;
  }

  return (
    <div className="clinical-genogram">
      {/* Toolbar */}
      <div className="clinical-genogram-toolbar">
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowAddModal(true)}
        >
          + Agregar persona
        </button>
        <div className="clinical-genogram-legend">
          <span className="clinical-legend-item">
            <span className="clinical-legend-square" style={{ borderColor: COLORS.male }} />
            Hombre
          </span>
          <span className="clinical-legend-item">
            <span className="clinical-legend-circle" style={{ borderColor: COLORS.female }} />
            Mujer
          </span>
          <span className="clinical-legend-item">
            <span className="clinical-legend-diamond" style={{ borderColor: COLORS.other }} />
            Otro
          </span>
          <span className="clinical-legend-item">
            <span className="clinical-legend-circle" style={{ borderColor: COLORS.patient, borderStyle: 'dashed' }} />
            Paciente
          </span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="clinical-genogram-canvas">
        <svg
          ref={svgRef}
          viewBox="-50 -150 700 500"
          className="clinical-genogram-svg"
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchMove={onMouseMove}
          onTouchEnd={onMouseUp}
          onClick={() => setSelectedNode(null)}
        >
          {/* Fondo con grid */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--color-gray-200)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect x="-50" y="-150" width="700" height="500" fill="url(#grid)" />

          {/* Primero las aristas, luego los nodos encima */}
          {genogram.edges.map(renderEdge)}
          {genogram.nodes.map(renderNode)}
        </svg>
      </div>

      {/* Info del nodo seleccionado */}
      {selectedNode && (() => {
        const node = genogram.nodes.find(n => n.id === selectedNode);
        if (!node) return null;
        return (
          <div className="clinical-genogram-info">
            <h4>{node.label.replace('\n', ' ')}</h4>
            {node.age > 0 && <p>Edad: {node.age} años</p>}
            {node.notes && <p>Notas: {node.notes}</p>}
            {node.deceased && <p className="clinical-info-deceased">Fallecido/a</p>}
          </div>
        );
      })()}

      {/* Modal para agregar nodo */}
      {showAddModal && (
        <div className="clinical-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="clinical-modal clinical-modal--sm" onClick={e => e.stopPropagation()}>
            <div className="clinical-modal-header">
              <h3>Agregar persona</h3>
              <button className="clinical-modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <div className="clinical-modal-body">
              <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-600)', marginBottom: 'var(--space-md)' }}>
                Selecciona el género para determinar la forma del nodo:
              </p>
              <div className="clinical-add-node-options">
                <button className="clinical-add-node-btn" onClick={() => handleAddNode('male')}>
                  <span className="clinical-legend-square" style={{ borderColor: COLORS.male, width: '2rem', height: '2rem' }} />
                  Hombre
                </button>
                <button className="clinical-add-node-btn" onClick={() => handleAddNode('female')}>
                  <span className="clinical-legend-circle" style={{ borderColor: COLORS.female, width: '2rem', height: '2rem' }} />
                  Mujer
                </button>
                <button className="clinical-add-node-btn" onClick={() => handleAddNode('other')}>
                  <span className="clinical-legend-diamond" style={{ borderColor: COLORS.other, width: '2rem', height: '2rem' }} />
                  Otro
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
