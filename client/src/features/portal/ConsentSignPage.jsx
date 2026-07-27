/* ==========================================================================
   ConsentSignPage — Firma de consentimiento informado
   
   Muestra el texto legal completo del consentimiento y un canvas
   donde el paciente dibuja su firma con el dedo (móvil) o mouse.
   
   Usa un canvas HTML5 nativo en vez de react-signature-canvas
   para evitar una dependencia adicional en esta fase de mocks.
   Cuando se integre el backend se puede migrar si es necesario.
   ========================================================================== */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getConsents, signConsent } from '../../services/patientService';

export default function ConsentSignPage() {
  const { type } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [consent, setConsent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Estado del dibujo
  const isDrawing = useRef(false);

  useEffect(() => {
    loadConsent();
  }, [type]);

  const loadConsent = async () => {
    try {
      const consents = await getConsents();
      const found = consents.find(c => c.type === type);
      setConsent(found || null);
    } catch (err) {
      console.error('Error cargando consentimiento:', err);
    } finally {
      setLoading(false);
    }
  };

  /* ── Canvas drawing ── */
  const setupCanvas = useCallback((canvas) => {
    if (!canvas) return;
    canvasRef.current = canvas;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    // Escalar para pantallas de alta resolución
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = 'var(--color-gray-800)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Fondo blanco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
  }, []);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    isDrawing.current = true;
    const ctx = canvasRef.current.getContext('2d');
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const pos = getPos(e);
    ctx.strokeStyle = '#1f2937';
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const endDraw = () => {
    isDrawing.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
    setHasDrawn(false);
  };

  const handleSign = async () => {
    if (!hasDrawn) return;
    setSigning(true);
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      await signConsent(type, dataUrl);
      setSigned(true);
    } catch (err) {
      console.error('Error firmando:', err);
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return <div className="portal-loading">Cargando documento...</div>;
  }

  if (!consent) {
    return (
      <div className="portal-page">
        <div className="portal-empty-state">
          <span className="portal-empty-icon">📄</span>
          <h3>Documento no encontrado</h3>
          <button className="btn btn-primary mt-3" onClick={() => navigate('/portal/documentos')}>
            Volver a documentos
          </button>
        </div>
      </div>
    );
  }

  if (consent.signed || signed) {
    return (
      <div className="portal-page">
        <div className="portal-success-card">
          <div className="portal-success-icon">✓</div>
          <h2>Consentimiento firmado</h2>
          <p>
            <strong>{consent.title}</strong> ha sido firmado exitosamente.
            Se registró la fecha, hora e IP de la firma.
          </p>
          <button className="btn btn-primary mt-3" onClick={() => navigate('/portal/documentos')}>
            Volver a documentos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="portal-page">
      <div className="portal-page-header">
        <h1>{consent.title}</h1>
        <p>Versión {consent.version} — Lee el documento completo antes de firmar.</p>
      </div>

      {/* Texto legal */}
      <div className="portal-consent-body">
        {consent.body.split('\n').map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>

      {/* Firma */}
      <div className="portal-signature-section">
        <h3>Tu firma</h3>
        <p className="portal-signature-hint">Dibuja tu firma con el dedo o mouse en el recuadro.</p>

        <div className="portal-signature-canvas-wrapper">
          <canvas
            ref={setupCanvas}
            className="portal-signature-canvas"
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={endDraw}
          />
        </div>

        <div className="portal-signature-actions">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={clearCanvas}
          >
            Limpiar
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!hasDrawn || signing}
            onClick={handleSign}
          >
            {signing ? 'Firmando...' : 'Firmar consentimiento'}
          </button>
        </div>
      </div>
    </div>
  );
}
