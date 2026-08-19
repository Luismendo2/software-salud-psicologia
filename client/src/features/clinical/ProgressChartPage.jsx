import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as evaluationsService from '../../services/evaluationsService';
import { MOCK_PATIENTS_LIST } from '../../mocks/clinicalMock';
import AssessmentResultCard from './AssessmentResultCard';

export default function ProgressChartPage() {
  const { patientId } = useParams();
  const [assessments, setAssessments] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState(null);

  const patient = useMemo(() => MOCK_PATIENTS_LIST.find(p => p.id === patientId), [patientId]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [assmData, tplData] = await Promise.all([
          evaluationsService.getPatientAssessments(patientId),
          evaluationsService.getTemplates()
        ]);
        
        // Filtrar solo las completadas y ordenar por fecha ascendente para la gráfica
        const completed = assmData
          .filter(a => a.status === 'COMPLETED')
          .sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));
          
        setAssessments(completed);
        setTemplates(tplData);
      } catch (error) {
        console.error("Error loading chart data", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [patientId]);

  // Preparar datos para Recharts
  // Queremos agrupar por fecha y tener cada template como una llave separada, ej: { date: '10 ago', phq-9: 14, gad-7: undefined }
  const chartData = useMemo(() => {
    if (assessments.length === 0) return [];
    
    // Mapeamos los datos, asumiendo que para una misma fecha puede haber varias evaluaciones
    const dataMap = {};
    
    assessments.forEach(assm => {
      // Usamos una fecha corta para el eje X
      const dateKey = new Date(assm.completedAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
      
      if (!dataMap[dateKey]) {
        dataMap[dateKey] = { date: dateKey, fullDate: assm.completedAt };
      }
      
      dataMap[dateKey][assm.templateId] = assm.score;
      // Guardar referencia a la evaluación completa para el onClick
      dataMap[dateKey][`${assm.templateId}_ref`] = assm; 
    });
    
    return Object.values(dataMap);
  }, [assessments]);

  // Obtener los templates que realmente tienen datos para generar las líneas
  const activeTemplateIds = useMemo(() => {
    const ids = new Set();
    assessments.forEach(a => ids.add(a.templateId));
    return Array.from(ids);
  }, [assessments]);

  const colors = {
    'phq-9': '#1e40af', // blue-800
    'gad-7': '#0d9488', // teal-600
    'pcl-5': '#7e22ce'  // purple-700
  };

  const handleDotClick = (data, templateId) => {
    if (data && data.payload) {
      const refKey = `${templateId}_ref`;
      const assessmentRef = data.payload[refKey];
      if (assessmentRef) {
        setSelectedPoint(assessmentRef);
      }
    }
  };

  if (loading) {
    return (
      <div className="cr-page">
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-gray-500)' }}>
          Cargando gráfica de progreso...
        </div>
      </div>
    );
  }

  return (
    <div className="cr-page">
      <div className="cr-header">
        <div className="cr-header-left">
          <Link to={`/historia-clinica/${patientId}`} className="btn btn-outline-secondary" style={{ padding: '0.25rem 0.5rem', marginRight: '1rem' }}>
            ← Volver
          </Link>
          <div className="avatar">{patient?.firstName[0]}{patient?.lastName[0]}</div>
          <div>
            <h1>MBC: Gráficas de Progreso</h1>
            <p>{patient?.firstName} {patient?.lastName}</p>
          </div>
        </div>
      </div>

      {assessments.length === 0 ? (
        <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '8px', textAlign: 'center' }}>
          <h3>No hay datos suficientes</h3>
          <p>El paciente aún no ha completado ninguna evaluación estandarizada.</p>
        </div>
      ) : (
        <>
          <div className="progress-chart-container">
            <div className="progress-chart-header">
              <h3 style={{ margin: 0 }}>Evolución Longitudinal</h3>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)' }}>
                Haz clic en un punto para ver detalles
              </span>
            </div>
            
            <div className="progress-chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={{ stroke: '#d1d5db' }} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={{ stroke: '#d1d5db' }} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    labelStyle={{ fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  
                  {activeTemplateIds.map(tplId => {
                    const tpl = templates.find(t => t.id === tplId);
                    return (
                      <Line 
                        key={tplId}
                        type="monotone" 
                        dataKey={tplId} 
                        name={tpl?.name || tplId} 
                        stroke={colors[tplId] || '#3b82f6'} 
                        strokeWidth={3}
                        dot={{ r: 5, strokeWidth: 2, fill: 'white' }}
                        activeDot={{ r: 7, cursor: 'pointer', onClick: (e, payload) => handleDotClick(payload, tplId) }}
                        connectNulls={true}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {selectedPoint && (
            <div>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Detalle de la Evaluación</h3>
              <AssessmentResultCard 
                assessment={selectedPoint} 
                template={templates.find(t => t.id === selectedPoint.templateId)} 
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
