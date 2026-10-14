import { useState } from 'react';
import { KeyRound, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import api from '../api/axios';
import PasswordRequirements from './PasswordRequirements';

// Modal obligatorio: se muestra cuando el backend exige cambiar la contraseña temporal
const ForcePasswordChangeModal = () => {
    const { mustChangePassword, setMustChangePassword, logout } = useAuthStore();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPasswords, setShowPasswords] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState([]);

    if (!mustChangePassword) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);

        if (newPassword !== confirmPassword) {
            setErrors(['La nueva contraseña y la confirmación no coinciden.']);
            return;
        }

        setSaving(true);
        try {
            await api.put('/auth/password', {
                current_password: currentPassword,
                password: newPassword,
                password_confirmation: confirmPassword
            });
            setMustChangePassword(false);
            // Recargar para que las pantallas vuelvan a pedir los datos que el backend bloqueó
            window.location.reload();
        } catch (err) {
            const data = err.response?.data;
            if (data?.errors) {
                setErrors(Object.values(data.errors).flat());
            } else {
                setErrors([data?.message || 'No se pudo cambiar la contraseña. Intenta de nuevo.']);
            }
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    const inputStyle = {
        width: '100%', padding: '12px 16px', borderRadius: '12px',
        border: '1.5px solid var(--border, #e5e7eb)',
        background: 'var(--input-bg, #f9fafb)',
        fontSize: '14px', color: 'var(--text-primary, #111)',
        outline: 'none', boxSizing: 'border-box'
    };

    const labelTextStyle = {
        display: 'block', marginBottom: '8px',
        fontWeight: 600, fontSize: '13px',
        color: 'var(--text-secondary, #555)'
    };

    const canSubmit = currentPassword && newPassword && confirmPassword && !saving;

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflowY: 'auto', padding: '16px'
        }}>
            <div style={{
                position: 'fixed', inset: 0,
                background: 'rgba(10, 15, 30, 0.80)',
                backdropFilter: 'blur(8px)'
            }} />
            <form onSubmit={handleSubmit} style={{
                position: 'relative', zIndex: 1,
                background: 'var(--surface, #fff)',
                borderRadius: '20px', padding: '32px',
                maxWidth: '460px', width: '100%',
                boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
                border: '1px solid var(--border, #e5e7eb)',
                boxSizing: 'border-box', margin: 'auto'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        background: 'var(--primary-soft, #eff6ff)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px'
                    }}>
                        <KeyRound size={28} style={{ color: 'var(--primary, #1d4ed8)' }} />
                    </div>
                    <h2 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary, #111)' }}>
                        Cambio de contraseña obligatorio
                    </h2>
                    <p style={{ margin: 0, color: 'var(--text-secondary, #555)', fontSize: '14px', lineHeight: 1.6 }}>
                        Por seguridad, debes reemplazar tu contraseña temporal antes de continuar usando el sistema.
                    </p>
                </div>

                <label style={{ display: 'block', marginBottom: '16px' }}>
                    <span style={labelTextStyle}>Contraseña actual</span>
                    <input
                        type={showPasswords ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        autoComplete="current-password"
                        style={inputStyle}
                    />
                </label>

                <label style={{ display: 'block', marginBottom: '16px' }}>
                    <span style={labelTextStyle}>Nueva contraseña</span>
                    <input
                        type={showPasswords ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        autoComplete="new-password"
                        style={inputStyle}
                    />
                </label>

                <PasswordRequirements password={newPassword} />

                <label style={{ display: 'block', margin: '16px 0' }}>
                    <span style={labelTextStyle}>Confirmar nueva contraseña</span>
                    <input
                        type={showPasswords ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                        style={inputStyle}
                    />
                </label>

                <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        background: 'none', border: 'none', padding: 0,
                        marginBottom: '16px', cursor: 'pointer',
                        color: 'var(--text-secondary, #555)', fontSize: '13px'
                    }}
                >
                    {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                    {showPasswords ? 'Ocultar contraseñas' : 'Mostrar contraseñas'}
                </button>

                {errors.length > 0 && (
                    <div style={{ marginBottom: '12px' }}>
                        {errors.map((msg, i) => (
                            <p key={i} style={{ color: '#dc2626', fontSize: '13px', margin: '0 0 4px', textAlign: 'center' }}>
                                {msg}
                            </p>
                        ))}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={!canSubmit}
                    style={{
                        width: '100%', padding: '13px', borderRadius: '12px',
                        background: canSubmit ? 'var(--primary, #1d4ed8)' : 'var(--border, #e5e7eb)',
                        color: 'white', border: 'none', fontWeight: 600,
                        fontSize: '15px',
                        cursor: canSubmit ? 'pointer' : 'not-allowed',
                        transition: 'background 0.2s ease'
                    }}
                >
                    {saving ? 'Guardando...' : 'Cambiar contraseña'}
                </button>

                <button
                    type="button"
                    onClick={handleLogout}
                    style={{
                        width: '100%', marginTop: '10px', padding: '11px', borderRadius: '12px',
                        background: 'transparent', color: 'var(--text-secondary, #555)',
                        border: '1.5px solid var(--border, #e5e7eb)',
                        fontWeight: 600, fontSize: '14px', cursor: 'pointer'
                    }}
                >
                    Cerrar sesión
                </button>
            </form>
        </div>
    );
};

export default ForcePasswordChangeModal;
