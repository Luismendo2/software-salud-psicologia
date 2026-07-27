/* ==========================================================================
   AppRouter — Configuración de rutas
   
   Dos árboles principales de rutas:
   1. /portal/*  → Portal del paciente (PatientPortalLayout)
   2. /*         → App del psicólogo (AppLayout)
   3. /book/:slug → Reserva pública (sin layout)
   ========================================================================== */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AppLayout from '../components/layout/AppLayout';
import PatientPortalLayout from '../features/portal/PatientPortalLayout';

// Feature 001 — Agenda y Citas
import AgendaPage from '../features/agenda/AgendaPage';
import AvailabilitySettingsPage from '../features/agenda/AvailabilitySettingsPage';
import BookingPublicPage from '../features/agenda/BookingPublicPage';

// Feature 003 — Historia Clínica
import PatientsListPage from '../features/clinical/PatientsListPage';
import ClinicalRecordPage from '../features/clinical/ClinicalRecordPage';


// Feature 002 — Portal del Paciente
import PatientDashboard from '../features/portal/PatientDashboard';
import AppointmentHistoryPage from '../features/portal/AppointmentHistoryPage';
import DocumentsPage from '../features/portal/DocumentsPage';
import IntakeFormPage from '../features/portal/IntakeFormPage';
import ConsentSignPage from '../features/portal/ConsentSignPage';
import InvoiceListPage from '../features/portal/InvoiceListPage';
import PaymentPage from '../features/portal/PaymentPage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Rutas Públicas (Sin Layout) ── */}
        <Route path="/book/:psychologistSlug" element={<BookingPublicPage />} />

        {/* ── Portal del Paciente ── */}
        <Route path="/portal" element={<PatientPortalLayout />}>
          <Route index element={<PatientDashboard />} />
          <Route path="citas" element={<AppointmentHistoryPage />} />
          <Route path="documentos" element={<DocumentsPage />} />
          <Route path="documentos/ingreso" element={<IntakeFormPage />} />
          <Route path="documentos/consentimiento/:type" element={<ConsentSignPage />} />
          <Route path="pagos" element={<InvoiceListPage />} />
          <Route path="pagos/:invoiceId" element={<PaymentPage />} />
        </Route>

        {/* ── App del Psicólogo (Privada) ── */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/agenda" replace />} />
          
          {/* Agenda */}
          <Route path="agenda" element={<AgendaPage />} />
          <Route path="agenda/settings" element={<AvailabilitySettingsPage />} />
          
          {/* Historia Clínica */}
          <Route path="historia-clinica" element={<PatientsListPage />} />
          <Route path="historia-clinica/:patientId" element={<ClinicalRecordPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
