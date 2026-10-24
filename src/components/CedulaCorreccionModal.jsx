import { useState, useEffect } from 'react';
import { IdCard } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import api from '../api/axios';
import { esCedulaValida, MENSAJE_CEDULA_INVALIDA } from '../utils/cedula';

/**
 * Aviso obligatorio para las cuentas que tienen registrada una cédula que no pasa el algoritmo
 * de la cédula ecuatoriana. No se puede cerrar hasta registrar una cédula válida.
 * Mismo diseño que CampusSetupModal.
 */
const CedulaCorreccionModal = () => {
    const { user } = useAuthStore();
    const [show, setShow] = useState(false);
    const [actual, setActual] = useState('');
    const [cedula, setCedula] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) return;
        api.get('/user-profile/cedula-estado')
            .then(res => {
                if (res.data?.data?.requiere_correccion) {
                    setActual(res.data.data.numero_cedula || '');
                    setShow(true);
                }
            })
            .catch(() => { /* si falla la consulta no se bloquea al usuario */ });
    }, [user?.id]);

    const handleSave = async () => {
        if (!esCedulaValida(cedula)) {
            setError(MENSAJE_CEDULA_INVALIDA);
            return;
        }
        setSaving(true);
        setError('');
        try {
            await api.patch('/user-profile/cedula', { numero_cedula: cedula });
            setShow(false);
            // Las pantallas que muestran la cédula (p. ej. el perfil del paciente) recargan sus datos
            window.dispatchEvent(new CustomEvent('cedula-corregida', { detail: { numero_cedula: cedula } }));
        } catch (err) {
            const data = err.response?.data;
            setError((data?.errors && Object.values(data.errors)[0]?.[0]) || data?.message || 'No se pudo guardar la cédula. Intenta de nuevo.');
        } finally {
            setSaving(false);
        }
    };

    if (!show) return null;

    return (
        <div role="dialog" aria-modal="true" aria-labelledby="cedula-correccion-titulo" style={{
            position: 'fixed', inset: 0, zIndex: 10000,
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
                        <IdCard size={28} style={{ color: 'var(--primary, #1d4ed8)' }} />
                    </div>
                    <h2 id="cedula-correccion-titulo" style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary, #111)' }}>
                        Actualiza tu cédula
                    </h2>
                    <p style={{ margin: 0, color: 'var(--text-secondary, #555)', fontSize: '14px', lineHeight: 1.6 }}>
                        La cédula registrada en tu cuenta{actual ? <> (<strong>{actual}</strong>)</> : ''} no es una cédula ecuatoriana válida.
                        Ingresa tu número de cédula correcto para continuar.
                    </p>
                </div>

                <label style={{ display: 'block', marginBottom: '20px' }}>
                    <span style={{
                        display: 'block', marginBottom: '8px',
                        fontWeight: 600, fontSize: '13px',
                        color: 'var(--text-secondary, #555)'
                    }}>
                        Número de cédula
                    </span>
                    <input
                        type="text"
                        inputMode="numeric"
                        maxLength={10}
                        autoFocus
                        value={cedula}
                        onChange={(e) => { setCedula(e.target.value.replace(/\D/g, '')); setError(''); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
                        placeholder="10 dígitos"
                        style={{
                            width: '100%', padding: '12px 16px', borderRadius: '12px',
                            border: `1.5px solid ${error ? '#ef4444' : 'var(--border, #e5e7eb)'}`,
                            background: 'var(--input-bg, #f9fafb)',
                            fontSize: '14px', color: 'var(--text-primary, #111)',
                            outline: 'none', boxSizing: 'border-box', letterSpacing: '1px'
                        }}
                    />
                    {error && (
                        <small role="alert" style={{ display: 'block', marginTop: '6px', color: '#ef4444', fontSize: '12px' }}>{error}</small>
                    )}
                </label>

                <button
                    type="button"
                    onClick={handleSave}
                    disabled={cedula.length !== 10 || saving}
                    style={{
                        width: '100%', padding: '14px', borderRadius: '12px',
                        background: cedula.length === 10 && !saving ? 'var(--primary, #1d4ed8)' : '#e5e7eb',
                        color: cedula.length === 10 && !saving ? '#fff' : '#9ca3af',
                        border: 'none', fontWeight: 700, fontSize: '15px',
                        cursor: cedula.length === 10 && !saving ? 'pointer' : 'not-allowed'
                    }}
                >
                    {saving ? 'Guardando...' : 'Guardar cédula'}
                </button>
            </div>
        </div>
    );
};

export default CedulaCorreccionModal;
