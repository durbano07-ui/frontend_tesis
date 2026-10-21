import { Navigate, useNavigate } from 'react-router-dom';
import { Syringe, Brain, Smile, HardHat, Stethoscope, ShieldCheck, User, ChevronRight, LogOut } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { getUserModules } from '../utils/roleModules';
import logoUeb from '../assets/ueb.webp';

const MODULE_ICONS = {
    enfermeria: Syringe,
    psicologia: Brain,
    odontologia: Smile,
    'medicina-ocupacional': HardHat,
    'medicina-general': Stethoscope,
    administracion: ShieldCheck,
    paciente: User,
};

const Dashboard = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const modules = getUserModules(user);

    // Un solo módulo: entra directo
    if (modules.length === 1) {
        return <Navigate to={modules[0].path} replace />;
    }

    // Varios módulos (usuario multirol): elegir a cuál entrar
    if (modules.length > 1) {
        return (
            <div style={{ minHeight: '100vh', background: '#f4f7fa', display: 'grid', placeItems: 'center', padding: '24px 16px' }}>
                <div style={{ width: '100%', maxWidth: '520px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <img src={logoUeb} alt="UEB" style={{ height: '56px', marginBottom: '12px' }} />
                        <h1 style={{ fontSize: '20px', fontWeight: 750, color: '#002040', margin: 0 }}>
                            Hola, {user?.name?.split(' ')[0] || 'bienvenido'}
                        </h1>
                        <p style={{ fontSize: '13px', color: '#667085', margin: '6px 0 0' }}>
                            Tienes acceso a varios módulos. ¿A cuál quieres entrar?
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {modules.map(m => {
                            const Icon = MODULE_ICONS[m.key] || User;
                            return (
                                <button
                                    key={m.key}
                                    onClick={() => navigate(m.path)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '14px', width: '100%',
                                        padding: '14px 16px', background: '#fff', border: '1px solid #e4e9ef',
                                        borderRadius: '12px', cursor: 'pointer', textAlign: 'left',
                                        boxShadow: '0 1px 3px rgba(0, 32, 64, 0.06)', transition: 'all 0.15s ease'
                                    }}
                                    onMouseOver={(e) => { e.currentTarget.style.borderColor = '#002040'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e4e9ef'; }}
                                >
                                    <span style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eaf0f5', color: '#002040', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                                        <Icon size={20} />
                                    </span>
                                    <span style={{ flex: 1, minWidth: 0 }}>
                                        <span style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#17212b' }}>{m.label}</span>
                                        <span style={{ display: 'block', fontSize: '12px', color: '#667085', marginTop: '2px' }}>{m.description}</span>
                                    </span>
                                    <ChevronRight size={18} color="#98a2b3" />
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={logout}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                            margin: '20px auto 0', padding: '8px 14px', background: 'transparent',
                            border: 'none', color: '#b71a34', fontSize: '12px', fontWeight: 650, cursor: 'pointer'
                        }}
                    >
                        <LogOut size={14} /> Cerrar sesión
                    </button>
                </div>
            </div>
        );
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
