import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import CampusSetupModal from './CampusSetupModal';
import ForcePasswordChangeModal from './ForcePasswordChangeModal';

const ProtectedRoute = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const mustChangePassword = useAuthStore((state) => state.mustChangePassword);
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return (
        <>
            {mustChangePassword ? <ForcePasswordChangeModal /> : <CampusSetupModal />}
            <Outlet />
        </>
    );
};

export default ProtectedRoute;
