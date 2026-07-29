/* ==========================================================================
   AppRouter — Configuración de rutas con protección (Feature 004)
   
   Estructura:
   1. Públicas completas: Login, Forgot, Reset, Booking, 403
   2. Protegidas (Portal del Paciente) -> Requiere rol PATIENT
   3. Protegidas (App del Psicólogo) -> Requiere ADMIN, PSYCHOLOGIST o ASSISTANT
   ========================================================================== */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Providers
import { AuthProvider } from '../features/auth/AuthContext';
import ProtectedRoute from '../features/auth/ProtectedRoute';

// Layouts
import AppLayout from '../components/layout/AppLayout';
import PatientPortalLayout from '../features/portal/PatientPortalLayout';

// Feature 004 — Seguridad y Privacidad
import LoginPage from '../features/auth/LoginPage';
import ForgotPasswordPage from '../features/auth/ForgotPasswordPage';
import ResetPasswordPage from '../features/auth/ResetPasswordPage';
import ForbiddenPage from '../features/auth/ForbiddenPage';
import AuditLogPage from '../features/auth/AuditLogPage';
import AccountSettingsPage from '../features/auth/AccountSettingsPage';

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
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Rutas Públicas ── */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/403" element={<ForbiddenPage />} />
          
          <Route path="/book/:psychologistSlug" element={<BookingPublicPage />} />

          {/* ── Portal del Paciente (Protegido) ── */}
          <Route element={<ProtectedRoute allowedRoles={['PATIENT']} />}>
            <Route path="/portal" element={<PatientPortalLayout />}>
              <Route index element={<PatientDashboard />} />
              <Route path="citas" element={<AppointmentHistoryPage />} />
              <Route path="documentos" element={<DocumentsPage />} />
              <Route path="documentos/ingreso" element={<IntakeFormPage />} />
              <Route path="documentos/consentimiento/:type" element={<ConsentSignPage />} />
              <Route path="pagos" element={<InvoiceListPage />} />
              <Route path="pagos/:invoiceId" element={<PaymentPage />} />
              <Route path="configuracion" element={<AccountSettingsPage />} />
            </Route>
          </Route>

          {/* ── App del Staff (Protegida) ── */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'PSYCHOLOGIST', 'ASSISTANT']} />}>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Navigate to="/agenda" replace />} />
              
              {/* Agenda */}
              <Route path="agenda" element={<AgendaPage />} />
              <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'PSYCHOLOGIST']} />}>
                <Route path="agenda/settings" element={<AvailabilitySettingsPage />} />
              </Route>
              
              {/* Historia Clínica */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'PSYCHOLOGIST']} />}>
                <Route path="historia-clinica" element={<PatientsListPage />} />
                <Route path="historia-clinica/:patientId" element={<ClinicalRecordPage />} />
              </Route>

              {/* Auditoría (Solo Admin) */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="auditoria" element={<AuditLogPage />} />
              </Route>

              {/* Configuración */}
              <Route path="configuracion" element={<AccountSettingsPage />} />
            </Route>
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
