import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { User, Lock, X, Key, CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import api from '../api/axios';

const UserProfileMenu = () => {
    const { user, logout } = useAuthStore();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Visibility toggles
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Form states
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Get role friendly name
    const getRoleLabel = () => {
        if (!user?.roles) return 'Personal de Salud';
        if (user.roles.includes('administrador')) return 'Administrador';
        if (user.roles.includes('medico_coordinador')) return 'Coordinador Médico';
        if (user.roles.includes('medico_general')) return 'Médico General';
        if (user.roles.includes('enfermero')) return 'Enfermero/a';
        if (user.roles.includes('odontologo')) return 'Odontólogo/a';
        if (user.roles.includes('psicologo')) return 'Psicólogo/a';
        if (user.roles.includes('medico_ocupacional')) return 'Médico Ocupacional';
        if (user.roles.includes('paciente')) return 'Estudiante / Paciente';
        return 'Personal de Salud';
    };

    // Get initials for avatar
    const getInitials = () => {
        if (user?.name) {
            const parts = user.name.split(' ');
            if (parts.length > 1) {
                return (parts[0][0] + parts[1][0]).toUpperCase();
            }
            return user.name.substring(0, 2).toUpperCase();
        }
        return 'US';
    };

    // Handle password change
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword.length < 8) {
            setError('La nueva contraseña debe tener al menos 8 caracteres.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('La nueva contraseña y la confirmación no coinciden.');
            return;
        }

        setLoading(true);
        try {
            await api.put('/auth/password', {
                current_password: currentPassword,
                password: newPassword,
                password_confirmation: confirmPassword
            });
            setSuccess('Contraseña cambiada correctamente.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Error al cambiar la contraseña. Verifica tu contraseña actual.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
        setIsDropdownOpen(false);
        setError('');
        setSuccess('');
    };

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            {/* Avatar Trigger Button */}
            <button
                className="topbar-button"
                style={{ 
                    borderRadius: '50%', 
                    width: '42px', 
                    height: '42px', 
                    fontSize: '11.5px', 
                    fontWeight: '750', 
                    background: 'linear-gradient(135deg, var(--primary, #002040), #0d3b66)',
                    color: '#fff',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)'
                }}
                onMouseEnter={() => setIsDropdownOpen(true)}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
                {getInitials()}
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
                <div
                    style={{
                        position: 'absolute',
                        top: '48px',
                        right: '0',
                        width: '240px',
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        border: '1px solid var(--border, #e4e9ef)',
                        boxShadow: 'var(--shadow-md, 0 10px 25px rgba(0,0,0,0.08))',
                        zIndex: 1000,
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        animation: 'fadeIn 0.2s ease-out'
                    }}
                    onMouseLeave={() => setIsDropdownOpen(false)}
                >
                    <div style={{ borderBottom: '1px solid var(--border, #e4e9ef)', paddingBottom: '10px' }}>
                        <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--primary, #002040)' }}>
                            {user?.name || 'Usuario'}
                        </div>
                        <div style={{ fontSize: '10.5px', color: 'var(--text-muted, #98a2b3)', marginTop: '2px' }}>
                            {user?.email}
                        </div>
                        <div style={{ 
                            display: 'inline-block',
                            marginTop: '6px',
                            padding: '3px 8px',
                            backgroundColor: 'var(--primary-soft, #eaf0f5)',
                            color: 'var(--primary, #002040)',
                            borderRadius: '20px',
                            fontSize: '9.5px',
                            fontWeight: '700'
                        }}>
                            {getRoleLabel()}
                        </div>
                    </div>

                    <button
                        onClick={handleOpenModal}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            width: '100%',
                            padding: '10px 12px',
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '11.5px',
                            fontWeight: '650',
                            color: 'var(--text-primary, #17212b)',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                    >
                        <User size={14} style={{ color: 'var(--primary, #002040)' }} />
                        <span>Ver Perfil</span>
                    </button>
                </div>
            )}

            {/* Profile Modal */}
            {isModalOpen && createPortal(
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 2000,
                    display: 'grid',
                    placeItems: 'center',
                    padding: '20px'
                }}>
                    {/* Backdrop */}
                    <div 
                        onClick={() => setIsModalOpen(false)} 
                        style={{ 
                            position: 'absolute', 
                            inset: 0, 
                            backgroundColor: 'rgba(0, 20, 40, 0.45)', 
                            backdropFilter: 'blur(4.5px)' 
                        }} 
                    />

                    {/* Modal Content */}
                    <div style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: '460px',
                        backgroundColor: '#fff',
                        borderRadius: '16px',
                        boxShadow: 'var(--shadow-lg)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        animation: 'slideUp 0.3s cubic-bezier(0.22, 1, 0.36, 1)'
                    }}>
                        {/* Header */}
                        <header style={{
                            padding: '20px 24px',
                            borderBottom: '1px solid var(--border, #e4e9ef)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'linear-gradient(135deg, var(--primary, #002040), #083057)',
                            color: '#fff'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ 
                                    width: '32px', 
                                    height: '32px', 
                                    borderRadius: '8px', 
                                    background: 'rgba(255,255,255,0.1)', 
                                    display: 'grid', 
                                    placeItems: 'center' 
                                }}>
                                    <User size={16} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '14.5px', fontWeight: '700' }}>Perfil de Usuario</h3>
                                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>Gestión de cuenta de salud</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                style={{ 
                                    background: 'transparent', 
                                    border: 'none', 
                                    color: '#fff', 
                                    cursor: 'pointer',
                                    display: 'grid',
                                    placeItems: 'center',
                                    padding: '4px',
                                    borderRadius: '50%'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <X size={16} />
                            </button>
                        </header>

                        {/* Body */}
                        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', maxHeight: '75vh' }}>
                            {/* User details card */}
                            <div style={{
                                padding: '16px',
                                background: '#fafbfd',
                                border: '1px solid var(--border, #e4e9ef)',
                                borderRadius: '12px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted, #98a2b3)', fontWeight: '600' }}>ESTADO DE CUENTA</span>
                                    <span style={{ 
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '4px 10px',
                                        background: '#dcfce7',
                                        color: '#166534',
                                        borderRadius: '20px',
                                        fontSize: '10.5px',
                                        fontWeight: '700'
                                    }}>
                                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#15803d' }}></span>
                                        Activo
                                    </span>
                                </div>
                                <div style={{ marginTop: '8px' }}>
                                    <span style={{ fontSize: '10px', color: 'var(--text-muted, #98a2b3)', textTransform: 'uppercase', fontWeight: '750' }}>Nombre completo</span>
                                    <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary, #17212b)', marginTop: '2px' }}>
                                        {user?.name || '—'}
                                    </div>
                                </div>
                                <div style={{ marginTop: '4px' }}>
                                    <span style={{ fontSize: '10px', color: 'var(--text-muted, #98a2b3)', textTransform: 'uppercase', fontWeight: '750' }}>Correo electrónico</span>
                                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary, #17212b)', marginTop: '2px' }}>
                                        {user?.email || '—'}
                                    </div>
                                </div>
                            </div>

                            {/* Change password form */}
                            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <h4 style={{ 
                                    margin: '0 0 4px 0', 
                                    fontSize: '12.5px', 
                                    fontWeight: '700', 
                                    color: 'var(--primary, #002040)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    <Key size={14} style={{ color: 'var(--accent, #b71a34)' }} />
                                    Cambiar Contraseña
                                </h4>

                                <div className="field">
                                    <span>Contraseña Actual *</span>
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <input 
                                            type={showCurrentPassword ? "text" : "password"} 
                                            value={currentPassword} 
                                            onChange={(e) => setCurrentPassword(e.target.value)} 
                                            placeholder="Ingrese contraseña actual..." 
                                            required 
                                            style={{ width: '100%', paddingRight: '40px' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            style={{
                                                position: 'absolute',
                                                right: '12px',
                                                background: 'transparent',
                                                border: 'none',
                                                color: 'var(--text-muted, #98a2b3)',
                                                cursor: 'pointer',
                                                display: 'grid',
                                                placeItems: 'center',
                                                padding: '4px'
                                            }}
                                        >
                                            {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="field">
                                    <span>Nueva Contraseña *</span>
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <input 
                                            type={showNewPassword ? "text" : "password"} 
                                            value={newPassword} 
                                            onChange={(e) => setNewPassword(e.target.value)} 
                                            placeholder="Mínimo 8 caracteres..." 
                                            required 
                                            style={{ width: '100%', paddingRight: '40px' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            style={{
                                                position: 'absolute',
                                                right: '12px',
                                                background: 'transparent',
                                                border: 'none',
                                                color: 'var(--text-muted, #98a2b3)',
                                                cursor: 'pointer',
                                                display: 'grid',
                                                placeItems: 'center',
                                                padding: '4px'
                                            }}
                                        >
                                            {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="field">
                                    <span>Confirmar Nueva Contraseña *</span>
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <input 
                                            type={showConfirmPassword ? "text" : "password"} 
                                            value={confirmPassword} 
                                            onChange={(e) => setConfirmPassword(e.target.value)} 
                                            placeholder="Repita nueva contraseña..." 
                                            required 
                                            style={{ width: '100%', paddingRight: '40px' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            style={{
                                                position: 'absolute',
                                                right: '12px',
                                                background: 'transparent',
                                                border: 'none',
                                                color: 'var(--text-muted, #98a2b3)',
                                                cursor: 'pointer',
                                                display: 'grid',
                                                placeItems: 'center',
                                                padding: '4px'
                                            }}
                                        >
                                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {error && (
                                    <div style={{ 
                                        padding: '10px 12px', 
                                        backgroundColor: '#fef2f2', 
                                        color: '#991b1b', 
                                        border: '1px solid #fca5a5', 
                                        borderRadius: '8px',
                                        fontSize: '11px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}>
                                        <AlertTriangle size={14} /> <span>{error}</span>
                                    </div>
                                )}

                                {success && (
                                    <div style={{ 
                                        padding: '10px 12px', 
                                        backgroundColor: '#f0fdf4', 
                                        color: '#166534', 
                                        border: '1px solid #86efac', 
                                        borderRadius: '8px',
                                        fontSize: '11px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}>
                                        <CheckCircle size={14} /> <span>{success}</span>
                                    </div>
                                )}

                                <button 
                                    type="submit" 
                                    className="action-button action-button--primary" 
                                    disabled={loading}
                                    style={{ marginTop: '6px', minHeight: '44px', borderRadius: '10px', fontSize: '11px' }}
                                >
                                    {loading ? 'Procesando...' : 'Actualizar Contraseña'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default UserProfileMenu;
