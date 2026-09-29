import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import '../../auth.css';

import PasswordRequirements from '../../components/PasswordRequirements';

// Importación de recursos
import UEBLogo from '../../assets/leftUEB.png';

// Iconos de Lucide
import {
    ShieldCheck,
    BadgeCheck,
    LockKeyhole,
    ChartNoAxesCombined,
    ArrowLeft,
    Eye,
    EyeOff,
    Send,
    ArrowRight,
    KeyRound,
    Info
} from 'lucide-react';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Extraer token y email de la URL
    const token = searchParams.get('token') || '';
    const email = searchParams.get('email') || '';

    // Estados de contraseñas
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);

    // Fuerza de la contraseña
    const getPasswordStrength = () => {
        if (!password) return { level: 0, text: 'Sin evaluar' };
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        switch (score) {
            case 1: return { level: 1, text: 'Baja' };
            case 2: return { level: 2, text: 'Media' };
            case 3: return { level: 3, text: 'Alta' };
            case 4: return { level: 4, text: 'Muy Fuerte' };
            default: return { level: 0, text: 'Sin evaluar' };
        }
    };

    const strength = getPasswordStrength();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!password) {
            setError('Por favor, ingresa tu nueva contraseña.');
            return;
        }

        if (password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        if (!token || !email) {
            setError('Faltan parámetros de seguridad en la URL (email o token). Por favor, solicita un nuevo enlace de recuperación.');
            return;
        }

        setLoading(true);

        try {
            // endpoint Laravel para guardar la nueva contraseña
            await api.post('/auth/reset-password', {
                token,
                email,
                password,
                password_confirmation: confirmPassword
            });
            setIsSuccess(true);
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.message ||
                'Error al restablecer la contraseña. El enlace podría haber caducado.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <div className="auth-shell">

                {/* Lado izquierdo: Visual */}
                <section className="auth-visual">
                    <img src={UEBLogo} alt="Logo Universidad Estatal de Bolívar" className="image-left" />
                    <div className="auth-visual__content">
                        <span className="auth-kicker">
                            <ShieldCheck size={14} style={{ marginRight: '7px', color: '#ffc1cb' }} />
                            Restablecimiento de credenciales
                        </span>
                        <h1>Define una nueva <span>contraseña segura.</span></h1>
                        <p>Asegúrate de ingresar una combinación fuerte que combine letras, números y símbolos para resguardar la confidencialidad de tu cuenta institucional.</p>
                        <div className="auth-benefits">
                            <div className="auth-benefit">
                                <BadgeCheck size={18} style={{ color: '#b71a34' }} />
                                <strong>Seguridad activa</strong>
                                <span>Monitoreamos intentos inusuales para proteger tu cuenta.</span>
                            </div>
                            <div className="auth-benefit">
                                <LockKeyhole size={18} style={{ color: '#b71a34' }} />
                                <strong>Encriptación de nivel bancario</strong>
                                <span>Tus credenciales se cifran con los algoritmos más robustos.</span>
                            </div>
                            <div className="auth-benefit">
                                <ChartNoAxesCombined size={18} style={{ color: '#b71a34' }} />
                                <strong>Acceso inmediato</strong>
                                <span>Una vez restablecida, podrás acceder a tus servicios al instante.</span>
                            </div>
                        </div>
                    </div>
                    <footer className="auth-visual__footer">
                        <span className="auth-footer__line">Desarrollado por Diego Urbano y Alex Vega</span>
                        <span className="auth-footer__line"><strong className="auth-footer__label">Tutor:</strong> Dr Henry Vallejo</span>
                        <span className="auth-footer__line"><strong className="auth-footer__label">Pares:</strong> Edgar Rivadeneira y Darwin Carrión</span>
                    </footer>
                </section>

                {/* Lado derecho: Formulario */}
                <section className="auth-panel">
                    <div className="auth-panel__inner">
                        <Link className="auth-back" to="/login">
                            <ArrowLeft size={15} /> Volver al inicio de sesión
                        </Link>

                        {!isSuccess ? (
                            <div data-form-container>
                                <div className="auth-heading">
                                    <div className="auth-heading__icon">
                                        <LockKeyhole size={24} />
                                    </div>
                                    <h2>Restablecer contraseña</h2>
                                    <p>Ingresa la nueva contraseña que utilizarás para acceder al sistema institucional.</p>
                                </div>

                                {error && (
                                    <div className="alert alert-danger" style={{ marginTop: '20px' }}>
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="auth-form" noValidate>

                                    <div className="form-group">
                                        <label htmlFor="password">Nueva contraseña</label>
                                        <div className="input-shell">
                                            <LockKeyhole size={17} />
                                            <input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="Mínimo 8 caracteres"
                                                value={password}
                                                onChange={(e) => {
                                                    setPassword(e.target.value);
                                                    setError(null);
                                                }}
                                                required
                                            />
                                            <button
                                                className="password-toggle"
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                aria-label="Mostrar contraseña"
                                            >
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    <PasswordRequirements password={password} />

                                    <div className="form-group">
                                        <label htmlFor="confirmPassword">Confirmar contraseña</label>
                                        <div className="input-shell">
                                            <ShieldCheck size={17} />
                                            <input
                                                id="confirmPassword"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                placeholder="Repite tu contraseña"
                                                value={confirmPassword}
                                                onChange={(e) => {
                                                    setConfirmPassword(e.target.value);
                                                    setError(null);
                                                }}
                                                required
                                            />
                                            <button
                                                className="password-toggle"
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                aria-label="Mostrar contraseña"
                                            >
                                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        className={`auth-submit ${loading ? 'loading' : ''}`}
                                        type="submit"
                                        disabled={loading}
                                        style={{ marginTop: '20px' }}
                                    >
                                        {loading ? (
                                            <span className="spinner" style={{ display: 'block' }}></span>
                                        ) : (
                                            <>
                                                <span className="button-text">Guardar nueva contraseña</span>
                                                <Send size={16} />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        ) : (
                            /* ÉXITO */
                            <div className="success-state" style={{ display: 'block' }}>
                                <div className="success-state__icon">
                                    <BadgeCheck size={31} />
                                </div>
                                <h2>Contraseña restablecida</h2>
                                <p>Tu contraseña ha sido actualizada con éxito. Ya puedes iniciar sesión con tus nuevas credenciales.</p>
                                <Link className="auth-submit" to="/login" style={{ marginTop: '25px', width: '100%' }}>
                                    <span>Iniciar sesión</span>
                                    <ArrowRight size={16} style={{ marginLeft: '8px' }} />
                                </Link>
                            </div>
                        )}
                        <footer className="auth-footer-mobile">
                            <span className="auth-footer__line">Desarrollado por Diego Urbano y Alex Vega</span>
                            <span className="auth-footer__line"><strong className="auth-footer__label">Tutor:</strong> Dr Henry Vallejo</span>
                            <span className="auth-footer__line"><strong className="auth-footer__label">Pares:</strong> Edgar Rivadeneira y Darwin Carrión</span>
                        </footer>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default ResetPassword;
