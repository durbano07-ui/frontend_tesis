import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import AuthFlipCard from '../../components/AuthFlipCard';
import '../../auth.css';

// Importación de recursos/imágenes
import logoUeb from '../../assets/ueb.png';
import UEBLogo from '../../assets/leftUEB.png';
import UEBpet from '../../assets/UEBpet.png';

// Iconos de Lucide
import {
    BadgeCheck,
    LockKeyhole,
    ArrowLeft,
    Mail,
    Eye,
    EyeOff,
    ArrowRight,
    Send,
    CircleHelp,
    MessageCircle,
    X,
    AlertTriangle
} from 'lucide-react';

const Registro = () => {
    // Estados para los campos de texto
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        terms: false
    });

    // Mostrar/Ocultar contraseñas y ayuda
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    const [error, setError] = useState(null);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Manejador para inputs
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setError(null);
    };

    // Fuerza de la contraseña
    const getPasswordStrength = () => {
        const pass = formData.password;
        if (!pass) return { level: 0, text: 'Sin evaluar' };
        let score = 0;
        if (pass.length >= 8) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;

        switch (score) {
            case 1: return { level: 1, text: 'Baja' };
            case 2: return { level: 2, text: 'Media' };
            case 3: return { level: 3, text: 'Alta' };
            case 4: return { level: 4, text: 'Muy Fuerte' };
            default: return { level: 0, text: 'Sin evaluar' };
        }
    };

    const strength = getPasswordStrength();

    // Traduce errores del backend en inglés a español descriptivo
    const translateError = (msg) => {
        if (!msg) return 'Error al solicitar el registro. Por favor intente nuevamente.';
        
        const lowerMsg = msg.toLowerCase();
        
        if (lowerMsg.includes('only institutional emails')) {
            return 'Solo se permiten correos institucionales (@ueb.edu.ec).';
        }
        if (lowerMsg.includes('already been taken') || lowerMsg.includes('has already been taken')) {
            return 'Este correo electrónico ya se encuentra registrado.';
        }
        if (lowerMsg.includes('password confirmation does not match') || lowerMsg.includes('confirmation does not match')) {
            return 'Las contraseñas ingresadas no coinciden.';
        }
        if (lowerMsg.includes('password must be at least')) {
            return 'La contraseña debe tener al menos 8 caracteres.';
        }
        if (lowerMsg.includes('email field is required')) {
            return 'El correo electrónico es obligatorio.';
        }
        if (lowerMsg.includes('password field is required')) {
            return 'La contraseña es obligatoria.';
        }
        
        return msg;
    };

    // Envío final del registro
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const finalEmail = formData.email.includes('@') ? formData.email.trim() : `${formData.email.trim()}@ueb.edu.ec`;

        if (!formData.email.trim()) {
            setError('Por favor, ingresa tu correo institucional.');
            setShowErrorModal(true);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(finalEmail)) {
            setError('Ingresa un formato de correo válido (ej: nombre@ueb.edu.ec).');
            setShowErrorModal(true);
            return;
        }

        if (formData.password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres.');
            setShowErrorModal(true);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden.');
            setShowErrorModal(true);
            return;
        }

        if (!formData.terms) {
            setError('Debes aceptar las políticas de privacidad institucionales.');
            setShowErrorModal(true);
            return;
        }

        setLoading(true);

        try {
            await api.post('/auth/register', {
                email: finalEmail,
                password: formData.password,
                password_confirmation: formData.confirmPassword
            });

            setIsSuccess(true);
        } catch (err) {
            console.error(err);
            const responseData = err.response?.data;
            let rawMsg = 'Error al solicitar el registro. Por favor intente nuevamente.';
            
            if (responseData?.message) {
                rawMsg = responseData.message;
            } else if (responseData?.errors) {
                const firstError = Object.values(responseData.errors)[0];
                rawMsg = Array.isArray(firstError) ? firstError[0] : firstError;
            } else if (err.message === 'Network Error') {
                rawMsg = 'No se pudo conectar con el servidor. Verifica que el backend esté activo.';
            }

            setError(translateError(rawMsg));
            setShowErrorModal(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <div className="auth-shell">

                {/* PANEL IZQUIERDO: VISUAL */}
                <section className="auth-visual">
                    <img src={UEBLogo} alt="Logo UEB" className="image-left" />
                    <div className="auth-visual__content">
                        <h1>Accede a nuestros servicios, <span>hoy mismo.</span></h1>
                        <p>Crea tu cuenta institucional para ingresar al sistema de Bienestar Universitario.</p>

                        <div className="auth-benefits">
                            <div className="auth-benefit">
                                <BadgeCheck size={18} style={{ color: '#b71a34' }} />
                                <strong>Registro simplificado</strong>
                                <span>Solo necesitas tu correo y contraseña institucional. Tu perfil se configurará después de ingresar.</span>
                            </div>
                            <div className="auth-benefit">
                                <LockKeyhole size={18} style={{ color: '#b71a34' }} />
                                <strong>Acceso seguro</strong>
                                <span>Protegemos tu cuenta con los estándares más estrictos de seguridad.</span>
                            </div>
                        </div>
                    </div>

                    <footer className="auth-visual__footer">
                        <span className="auth-footer__line">Desarrollado por Diego Urbano y Alex Vega</span>
                        <span className="auth-footer__line"><strong className="auth-footer__label">Tutor:</strong> Dr Henry Vallejo</span>
                        <span className="auth-footer__line"><strong className="auth-footer__label">Pares:</strong> Edgar Rivadeneira y Darwin Carrión</span>
                    </footer>
                </section>

                {/* PANEL DERECHO: FORMULARIO */}
                <section className="auth-panel">
                    <AuthFlipCard>
                        {(flipNav) => (
                            <div className="auth-panel__inner">

                                <Link className="auth-back" to="/login" onClick={(e) => flipNav('/login', e)}>
                                    <ArrowLeft size={15} /> Volver al inicio de sesión
                                </Link>

                        {!isSuccess ? (
                            <div data-form-container>
                                <div className="auth-heading">
                                    <img src={logoUeb} alt="Logo UEB" className="image-right" />
                                    <h2>Crear cuenta</h2>
                                    <p>Ingresa tus datos institucionales para solicitar acceso al sistema.</p>
                                </div>
                                <form onSubmit={handleSubmit} className="auth-form" noValidate style={{ marginTop: '24px' }}>

                                    <div className="form-group">
                                        <label htmlFor="registerEmail">Correo institucional</label>
                                        <div className="input-shell input-shell--large">
                                            <Mail size={17} />
                                            <input
                                                id="registerEmail"
                                                type="text"
                                                name="email"
                                                placeholder="correo.institucional"
                                                value={formData.email}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/@.*/, '').trim();
                                                    setFormData(prev => ({ ...prev, email: val }));
                                                    setError(null);
                                                }}
                                                required
                                                style={{ flex: 1 }}
                                            />
                                            <span className="email-suffix">
                                                @ueb.edu.ec
                                            </span>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="registerPassword">Contraseña</label>
                                        <div className="input-shell input-shell--large">
                                            <LockKeyhole size={17} />
                                            <input
                                                id="registerPassword"
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                placeholder="Mínimo 8 caracteres"
                                                value={formData.password}
                                                onChange={handleChange}
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

                                    {/* Fuerza de la Contraseña */}
                                    {formData.password && (
                                        <div className="password-strength" data-level={strength.level} style={{ marginTop: '5px', marginBottom: '15px' }}>
                                            <div className="password-strength__bars">
                                                <span style={{ backgroundColor: strength.level >= 1 ? (strength.level === 1 ? '#d92d20' : strength.level === 2 ? '#f79009' : strength.level === 3 ? '#2e90fa' : '#16835d') : '#e7ebf0' }}></span>
                                                <span style={{ backgroundColor: strength.level >= 2 ? (strength.level === 2 ? '#f79009' : strength.level === 3 ? '#2e90fa' : '#16835d') : '#e7ebf0' }}></span>
                                                <span style={{ backgroundColor: strength.level >= 3 ? (strength.level === 3 ? '#2e90fa' : '#16835d') : '#e7ebf0' }}></span>
                                                <span style={{ backgroundColor: strength.level >= 4 ? '#16835d' : '#e7ebf0' }}></span>
                                            </div>
                                            <div className="password-strength__label">
                                                <span>Seguridad de contraseña</span>
                                                <strong>{strength.text}</strong>
                                            </div>
                                        </div>
                                    )}

                                    <div className="form-group">
                                        <label htmlFor="confirmPassword">Confirmar contraseña</label>
                                        <div className="input-shell input-shell--large">
                                            <LockKeyhole size={17} />
                                            <input
                                                id="confirmPassword"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                name="confirmPassword"
                                                placeholder="Repite tu contraseña"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
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

                                    {/* Checkbox de Términos y Condiciones */}
                                    <label className="checkbox checkbox--terms">
                                        <input
                                            type="checkbox"
                                            name="terms"
                                            checked={formData.terms}
                                            onChange={handleChange}
                                        />
                                        <span>Acepto las políticas de privacidad y las condiciones de uso institucional.</span>
                                    </label>

                                    <button
                                        className={`auth-submit ${loading ? 'loading' : ''}`}
                                        type="submit"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <span className="spinner" style={{ display: 'block' }}></span>
                                        ) : (
                                            <>
                                                <span className="button-text">Registrarse</span>
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
                                <h2>¡Registro exitoso!</h2>
                                <p>Tu cuenta ha sido creada exitosamente. Ya puedes iniciar sesión con tus credenciales y completar tu ficha de salud.</p>
                                <Link className="auth-submit" to="/login" onClick={(e) => flipNav('/login', e)} style={{ marginTop: '25px', width: '100%' }}>
                                    <span>Iniciar sesión</span>
                                    <ArrowRight size={16} style={{ marginLeft: '8px' }} />
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </AuthFlipCard>
        </section>

            </div>

            {/* MASCOTA FLOTANTE INTERACTIVA DE AYUDA */}
            <div className="help-assistant">
                <span className="help-tooltip">¿Necesitas ayuda?</span>
                <button
                    className="help-mascot"
                    type="button"
                    aria-label="Abrir ayuda"
                    aria-expanded={showHelp}
                    onClick={() => setShowHelp(!showHelp)}
                >
                    <img src={UEBpet} alt="Mascota de Bienestar Universitario" />
                </button>
                <aside className={`help-panel ${showHelp ? 'show' : ''}`} aria-hidden={!showHelp}>
                    <div className="help-panel__header">
                        <div className="help-panel__avatar">
                            <img src={UEBpet} alt="" />
                        </div>
                        <div>
                            <strong>Asistente BU</strong>
                            <span>Ayuda del sistema</span>
                        </div>
                        <button
                            className="help-panel__close"
                            type="button"
                            aria-label="Cerrar ayuda"
                            onClick={() => setShowHelp(false)}
                        >
                            <X size={15} />
                        </button>
                    </div>
                    <p className="help-panel__message">¡Hola! Estoy aquí para orientarte. Solo necesitas ingresar tu correo institucional y una contraseña segura para crear tu cuenta.</p>
                    <div className="help-panel__actions">
                        <button className="help-panel__action" type="button">
                            <CircleHelp size={15} />
                            Ayuda con el registro
                        </button>
                        <button
                            className="help-panel__action"
                            type="button"
                            onClick={() => window.open('https://mail.google.com/mail/?view=cm&fs=1&to=ciclismoguaranda@gmail.com&su=Soporte%20Bienestar%20Universitario', '_blank')}
                        >
                            <MessageCircle size={15} />
                            Contactar soporte
                        </button>
                    </div>
                </aside>
            </div>

            {/* Modal de Error de Registro */}
            <div className={`auth-modal ${showErrorModal ? 'show' : ''}`}>
                <div className="auth-modal__content">
                    <div className="auth-modal__icon">
                        <AlertTriangle size={24} />
                    </div>
                    <h3>Error al Registrar</h3>
                    <p>{error}</p>
                    <button
                        type="button"
                        className="auth-modal__close-btn"
                        onClick={() => setShowErrorModal(false)}
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </main>
    );
};

export default Registro;
