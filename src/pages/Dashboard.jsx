import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const Dashboard = () => {
    const { user, logout } = useAuthStore();

    if (user?.roles?.includes('enfermero')) {
        return <Navigate to="/enfermeria" replace />;
    }
    if (user?.roles?.includes('psicologo')) {
        return <Navigate to="/psicologia" replace />;
    }
    if (user?.roles?.includes('odontologo')) {
        return <Navigate to="/odontologia" replace />;
    }
    if (user?.roles?.includes('medico_ocupacional')) {
        return <Navigate to="/medicina-ocupacional" replace />;
    }
    if (user?.roles?.includes('medico_general')) {
        return <Navigate to="/medicina-general" replace />;
    }
    if (user?.roles?.includes('administrador') || user?.roles?.includes('medico_coordinador')) {
        return <Navigate to="/administrador" replace />;
    }
    if (user?.roles?.includes('paciente')) {
        return <Navigate to="/estudiante" replace />;
    }

    return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h1>Panel de Administración (Temporal)</h1>
            <p>Bienvenido, <strong>{user?.email}</strong></p>
            <button
                onClick={logout}
                style={{
                    marginTop: '20px',
                    padding: '10px 20px',
                    backgroundColor: '#b71a34',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                }}
            >
                Cerrar Sesión
            </button>
        </div>
    );
};

export default Dashboard;
