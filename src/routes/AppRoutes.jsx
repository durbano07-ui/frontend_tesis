import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from '../pages/auth/AuthPage';
import ResetPassword from '../pages/auth/ResetPassword';
import Dashboard from '../pages/Dashboard';
import EnfermeroPage from '../pages/nurse/Enfermero_page';
import PsicologoPage from '../pages/psychology/Psicologo_page';
import OdontologoPage from '../pages/dentist/Odontologo_page';
import MedicoOcupacionalPage from '../pages/occupational/MedicoOcupacional_page';
import MedicoGeneralPage from '../pages/general_medicine/MedicoGeneral_page';
import AdministradorPage from '../pages/admin/Administrador_page';
import PacienteDashboard from '../pages/patient/PacienteDashboard';
import GuestRoute from '../components/GuestRoute';
import ProtectedRoute from '../components/ProtectedRoute';

const AppRoutes = () => {
    return (
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
    );
};

export default AppRoutes;
