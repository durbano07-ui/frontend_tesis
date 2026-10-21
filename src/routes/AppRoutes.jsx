import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import GuestRoute from '../components/GuestRoute';
import ProtectedRoute from '../components/ProtectedRoute';

// ISO/IEC 25010 — Eficiencia de desempeño: cada módulo se descarga solo cuando se visita.
// Antes todo el sistema (≈3 MB) se descargaba para mostrar incluso la pantalla de login.
const AuthPage = lazy(() => import('../pages/auth/AuthPage'));
const ResetPassword = lazy(() => import('../pages/auth/ResetPassword'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const EnfermeroPage = lazy(() => import('../pages/nurse/Enfermero_page'));
const PsicologoPage = lazy(() => import('../pages/psychology/Psicologo_page'));
const OdontologoPage = lazy(() => import('../pages/dentist/Odontologo_page'));
const MedicoOcupacionalPage = lazy(() => import('../pages/occupational/MedicoOcupacional_page'));
const MedicoGeneralPage = lazy(() => import('../pages/general_medicine/MedicoGeneral_page'));
const AdministradorPage = lazy(() => import('../pages/admin/Administrador_page'));
const PacienteDashboard = lazy(() => import('../pages/patient/PacienteDashboard'));

const PageLoader = () => (
    <div role="status" aria-live="polite" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f4f7fa', color: '#002040', fontSize: '14px', fontWeight: 600 }}>
        Cargando…
    </div>
);

const AppRoutes = () => {
    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                {/* Rutas Públicas de Invitados (No autenticados) */}
                <Route element={<GuestRoute />}>
                    <Route path="/login" element={<AuthPage />} />
                    <Route path="/registro" element={<AuthPage />} />
                    <Route path="/forgot-password" element={<AuthPage />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                </Route>

                {/* Rutas Privadas Protegidas (Solo autenticados) */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/enfermeria" element={<EnfermeroPage />} />
                    <Route path="/psicologia" element={<PsicologoPage />} />
                    <Route path="/odontologia" element={<OdontologoPage />} />
                    <Route path="/medicina-ocupacional" element={<MedicoOcupacionalPage />} />
                    <Route path="/medicina-general" element={<MedicoGeneralPage />} />
                    <Route path="/administrador" element={<AdministradorPage />} />
                    <Route path="/estudiante" element={<PacienteDashboard />} />
                </Route>

                {/* Redirección por defecto */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Suspense>
    );
};

export default AppRoutes;
