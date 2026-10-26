import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import CampusSetupModal from './CampusSetupModal';
import CedulaCorreccionModal from './CedulaCorreccionModal';
import TipoUsuarioModal from './TipoUsuarioModal';
import ForcePasswordChangeModal from './ForcePasswordChangeModal';

const ProtectedRoute = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const mustChangePassword = useAuthStore((state) => state.mustChangePassword);
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return (
        <>
            {mustChangePassword ? <ForcePasswordChangeModal /> : (
                <>
                    <CampusSetupModal />
                    {/* Pacientes: confirmar si son estudiante, docente, administrativo o código de trabajo */}
                    <TipoUsuarioModal />
                    {/* Va encima de los demás: primero se corrige la cédula */}
                    <CedulaCorreccionModal />
                </>
            )}
            <Outlet />
        </>
    );
};

export default ProtectedRoute;
