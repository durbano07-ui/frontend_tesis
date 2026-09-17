import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import CampusSetupModal from './CampusSetupModal';

const ProtectedRoute = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return (
        <>
            <CampusSetupModal />
            <Outlet />
        </>
    );
};

export default ProtectedRoute;
