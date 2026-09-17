import { useState, useEffect } from 'react';
import { Stethoscope } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import api from '../api/axios';

// Roles que requieren configuracion de campus
const MEDICAL_ROLES = [
    'enfermero',
    'medico_general',
    'psicologo',
    'odontologo',
    'medico_ocupacional',
    'medico_coordinador',
];

const CampusSetupModal = () => {
    const { user } = useAuthStore();
    const [show, setShow] = useState(false);
    const [campusList, setCampusList] = useState([]);
    const [selectedCampus, setSelectedCampus] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const isMedicalUser = user?.roles?.some(r => MEDICAL_ROLES.includes(r));

    useEffect(() => {
        if (!isMedicalUser) return;
        checkCampus();
    }, [user]);

    const checkCampus = async () => {
        try {
            const res = await api.get('/medicina-ocupacional/usuario-lugar-de-trabajo');
            const data = res.data.data || [];
            if (data.length === 0) {
                await loadCampuses();
                setShow(true);
            }
        } catch (err) {
            console.error('Error verificando campus:', err);
        }
    };

    const loadCampuses = async () => {
        try {
            const res = await api.get('/medicina-ocupacional/campus');
            setCampusList(res.data.data || []);
        } catch (err) {
            console.error('Error cargando campus:', err);
        }
    };

    const handleSave = async () => {
        if (!selectedCampus) return;
        setSaving(true);
        setError('');
        try {
            await api.post('/medicina-ocupacional/usuario-lugar-de-trabajo', {
                id_lugar_trabajo: parseInt(selectedCampus),
            });
            setShow(false);
        } catch (err) {
            const msg = err.response?.data?.message;
            if (msg === 'Campus ya asignado') {
                setShow(false);
            } else {
                setError('No se pudo guardar el campus. Intenta de nuevo.');
            }
        } finally {
            setSaving(false);
        }
    };

    if (!show) return null;

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(10, 15, 30, 0.80)',
                backdropFilter: 'blur(8px)'
            }} />
            <div style={{
                position: 'relative', zIndex: 1,
                background: 'var(--surface, #fff)',
                borderRadius: '20px', padding: '40px',
                maxWidth: '460px', width: '90%',
                boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
                border: '1px solid var(--border, #e5e7eb)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        background: 'var(--primary-soft, #eff6ff)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px'
                    }}>
                        <Stethoscope size={28} style={{ color: 'var(--primary, #1d4ed8)' }} />
                    </div>
                    <h2 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary, #111)' }}>
                        Configuracion inicial
                    </h2>
                    <p style={{ margin: 0, color: 'var(--text-secondary, #555)', fontSize: '14px', lineHeight: 1.6 }}>
                        Selecciona el campus donde prestas tus servicios.
                        Esta informacion permite coordinar atenciones entre el personal de salud del mismo campus.
                    </p>
                </div>

                <label style={{ display: 'block', marginBottom: '20px' }}>
                    <span style={{
                        display: 'block', marginBottom: '8px',
                        fontWeight: 600, fontSize: '13px',
                        color: 'var(--text-secondary, #555)'
                    }}>
                        Campus de trabajo
                    </span>
                    <select
                        value={selectedCampus}
                        onChange={(e) => setSelectedCampus(e.target.value)}
                        style={{
                            width: '100%', padding: '12px 16px', borderRadius: '12px',
                            border: '1.5px solid var(--border, #e5e7eb)',
                            background: 'var(--input-bg, #f9fafb)',
                            fontSize: '14px', color: 'var(--text-primary, #111)',
                            outline: 'none', cursor: 'pointer',
                            boxSizing: 'border-box'
                        }}
                    >
                        <option value="">Selecciona un campus...</option>
                        {campusList.map(c => (
                            <option key={c.id} value={c.id}>{c.nombre}</option>
                        ))}
                    </select>
                    {campusList.length === 0 && (
                        <small style={{ display: 'block', marginTop: '6px', color: '#999', fontSize: '12px' }}>
                            No hay campus registrados. Contacta al administrador.
                        </small>
                    )}
                </label>

                {error && (
                    <p style={{ color: '#dc2626', fontSize: '13px', marginBottom: '12px', textAlign: 'center' }}>
                        {error}
                    </p>
                )}

                <button
                    onClick={handleSave}
                    disabled={!selectedCampus || saving}
                    style={{
                        width: '100%', padding: '13px', borderRadius: '12px',
                        background: selectedCampus ? 'var(--primary, #1d4ed8)' : 'var(--border, #e5e7eb)',
                        color: 'white', border: 'none', fontWeight: 600,
                        fontSize: '15px',
                        cursor: selectedCampus ? 'pointer' : 'not-allowed',
                        transition: 'background 0.2s ease'
                    }}
                >
                    {saving ? 'Guardando...' : 'Confirmar campus'}
                </button>
            </div>
        </div>
    );
};

export default CampusSetupModal;
