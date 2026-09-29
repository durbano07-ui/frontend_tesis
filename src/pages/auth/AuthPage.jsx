import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import api from '../../api/axios';
import PasswordRequirements from '../../components/PasswordRequirements';
import '../../auth.css';

// Importación de recursos
import logoUeb from '../../assets/ueb.png';
import UEBLogo from '../../assets/leftUEB.png';
import UEBpet from '../../assets/UEBpet.png';

// Iconos de Lucide
import {
    BadgeCheck,
    LockKeyhole,
    Mail,
    Eye,
    EyeOff,
    ArrowRight,
    ArrowLeft,
    Send,
    KeyRound,
    Info,
    CircleHelp,
    MessageCircle,
    X,
    AlertTriangle,
    MailCheck
} from 'lucide-react';

const AuthPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const loginStore = useAuthStore((state) => state.login);

    // Determinar el modo activo según la ruta actual
    const getModeFromPath = (path) => {
        if (path === '/registro') return 'registro';
        if (path === '/forgot-password') return 'forgot';
        return 'login';
    };

    const currentMode = getModeFromPath(location.pathname);
    const [mode, setMode] = useState(currentMode);
    const [backFormType, setBackFormType] = useState(currentMode === 'login' ? 'registro' : currentMode);

    // Sincronizar ruta con animación 3D de 180°
    useEffect(() => {
        const newMode = getModeFromPath(location.pathname);
        if (newMode !== 'login') {
            setBackFormType(newMode);
        }
        setMode(newMode);
    }, [location.pathname]);

    const isFlipped = mode === 'registro' || mode === 'forgot';

    // Función para cambiar de modo cambiando URL sin recargar
    const handleSwitchMode = (targetPath, e) => {
        if (e) e.preventDefault();
        if (location.pathname === targetPath) return;

        const targetMode = getModeFromPath(targetPath);
        if (targetMode !== 'login') {
            setBackFormType(targetMode);
        }
        navigate(targetPath);
    };

    // ==========================================
    // ESTADOS: LOGIN
    // ==========================================
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [loginError, setLoginError] = useState(null);
    const [showLoginErrorModal, setShowLoginErrorModal] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoginError(null);
        setLoginLoading(true);

        const finalEmail = loginEmail.includes('@') ? loginEmail.trim() : `${loginEmail.trim()}@ueb.edu.ec`;

        try {
            const response = await api.post('/auth/login', { email: finalEmail, password: loginPassword });
            const { user, token } = response.data;

            loginStore(user, token);
            if (user?.roles?.includes('enfermero')) {
                navigate('/enfermeria');
            } else if (user?.roles?.includes('psicologo')) {
                navigate('/psicologia');
            } else if (user?.roles?.includes('odontologo')) {
                navigate('/odontologia');
            } else if (user?.roles?.includes('medico_ocupacional')) {
                navigate('/medicina-ocupacional');
            } else if (user?.roles?.includes('medico_general')) {
                navigate('/medicina-general');
            } else if (user?.roles?.includes('administrador') || user?.roles?.includes('medico_coordinador')) {
                navigate('/administrador');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            console.error('Login error:', err.response?.status, err.response?.data);
            const responseData = err.response?.data;
            let msg = 'Error de autenticación. Verifica tus credenciales e intenta nuevamente.';
            if (responseData?.message) {
                msg = responseData.message;
            } else if (responseData?.errors) {
                const firstError = Object.values(responseData.errors)[0];
                msg = Array.isArray(firstError) ? firstError[0] : firstError;
            } else if (err.message === 'Network Error') {
                msg = 'No se pudo conectar con el servidor. Verifica que el backend esté activo en http://127.0.0.1:8000.';
            }
            setLoginError(msg);
            setShowLoginErrorModal(true);
        } finally {
            setLoginLoading(false);
        }
    };

    // ==========================================
    // ESTADOS: REGISTRO
    // ==========================================
    const [regForm, setRegForm] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        terms: false
    });
    const [showRegPassword, setShowRegPassword] = useState(false);
    const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
    const [regError, setRegError] = useState(null);
    const [showRegErrorModal, setShowRegErrorModal] = useState(false);
    const [regLoading, setRegLoading] = useState(false);
    const [regSuccess, setRegSuccess] = useState(false);

    const handleRegChange = (e) => {
        const { name, value, type, checked } = e.target;
        setRegForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setRegError(null);
    };

    const getPasswordStrength = () => {
        const pass = regForm.password;
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

    const translateError = (msg) => {
        if (!msg) return 'Error al solicitar el registro. Por favor intente nuevamente.';
        const lowerMsg = msg.toLowerCase();
        if (lowerMsg.includes('only institutional emails')) return 'Solo se permiten correos institucionales (@ueb.edu.ec).';
        if (lowerMsg.includes('already been taken')) return 'Este correo electrónico ya se encuentra registrado.';
        if (lowerMsg.includes('password confirmation does not match')) return 'Las contraseñas ingresadas no coinciden.';
        if (lowerMsg.includes('password must be at least')) return 'La contraseña debe tener al menos 8 caracteres.';
        return msg;
    };

    const handleRegSubmit = async (e) => {
        e.preventDefault();
        setRegError(null);

        const finalEmail = regForm.email.includes('@') ? regForm.email.trim() : `${regForm.email.trim()}@ueb.edu.ec`;

        if (!regForm.email.trim()) {
            setRegError('Por favor, ingresa tu correo institucional.');
            setShowRegErrorModal(true);
            return;
        }

        if (regForm.password.length < 8) {
            setRegError('La contraseña debe tener al menos 8 caracteres.');
            setShowRegErrorModal(true);
            return;
        }

        if (regForm.password !== regForm.confirmPassword) {
            setRegError('Las contraseñas no coinciden.');
            setShowRegErrorModal(true);
            return;
        }

        if (!regForm.terms) {
            setRegError('Debes aceptar las políticas de privacidad institucionales.');
            setShowRegErrorModal(true);
            return;
        }

        setRegLoading(true);
        try {
            await api.post('/auth/register', {
                email: finalEmail,
                password: regForm.password,
                password_confirmation: regForm.confirmPassword
            });
            setRegSuccess(true);
        } catch (err) {
            console.error(err);
            const responseData = err.response?.data;
            let rawMsg = 'Error al solicitar el registro. Por favor intente nuevamente.';
            if (responseData?.message) rawMsg = responseData.message;
            else if (responseData?.errors) {
                const firstError = Object.values(responseData.errors)[0];
                rawMsg = Array.isArray(firstError) ? firstError[0] : firstError;
            }
            setRegError(translateError(rawMsg));
            setShowRegErrorModal(true);
        } finally {
            setRegLoading(false);
        }
    };

    // ==========================================
    // ESTADOS: FORGOT PASSWORD
    // ==========================================
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotModal, setForgotModal] = useState({
        show: false,
        type: 'success',
        title: '',
        message: ''
    });

    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        if (!forgotEmail.trim()) {
            setForgotModal({
                show: true,
                type: 'error',
                title: 'Campo requerido',
                message: 'Por favor, ingresa tu correo institucional.'
            });
            return;
        }

        setForgotLoading(true);
        try {
            await api.post('/auth/forgot-password', { email: forgotEmail });
            setForgotModal({
                show: true,
                type: 'success',
                title: '¡Instrucciones enviadas!',
                message: `Hemos enviado un enlace seguro al correo ${forgotEmail}. Por favor, revisa tu bandeja de entrada.`
            });
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.message || 'Error al enviar la solicitud. Verifica el correo e intenta nuevamente.';
            setForgotModal({
                show: true,
                type: 'error',
                title: 'Error de envío',
                message: errorMsg
            });
        } finally {
            setForgotLoading(false);
        }
    };

    const handleCloseForgotModal = () => {
        if (forgotModal.type === 'success') {
            setForgotModal({ ...forgotModal, show: false });
            handleSwitchMode('/login');
        } else {
            setForgotModal({ ...forgotModal, show: false });
        }
    };

    // ==========================================
    // ASISTENTE DE AYUDA (MASCOTA)
    // ==========================================
    const [showHelp, setShowHelp] = useState(false);

    return (
        <main className="auth-page">
            <div className="auth-shell">

                {/* LADO IZQUIERDO: VISUAL PERSISTENTE */}
                <section className="auth-visual">
                    <img src={UEBLogo} alt="Logo Universidad Estatal de Bolivar" className="image-left" />
                    <div className="auth-visual__content">
                        <h1>
                            Bienestar Universitario <span>cuidando juntos nuestra comunidad.</span>
                        </h1>
                        <p>
                            Construimos una comunidad más saludable mediante una atención cercana, organizada y respaldada por la tecnología.
                        </p>
                    </div>

                    <footer className="auth-visual__footer">
                        <span className="auth-footer__line">Desarrollado por Diego Urbano y Alex Vega</span>
                        <span className="auth-footer__line"><strong className="auth-footer__label">Tutor:</strong> Dr Henry Vallejo</span>
                        <span className="auth-footer__line"><strong className="auth-footer__label">Pares:</strong> Edgar Rivadeneira y Darwin Carrión</span>
                    </footer>
                </section>

                {/* LADO DERECHO: PANEL 3D FLIP CARD */}
                <section className="auth-panel">
                    <div className="auth-card-3d-perspective">
                        <div className={`auth-card-3d-flipper ${isFlipped ? 'is-flipped' : ''}`}>

                            {/* CARA FRONTAL (0 DEG): LOGIN */}
                            <div className="auth-card-face front">
                                <div className="auth-panel__inner">
                                    <div className="auth-heading">
                                        <img src={logoUeb} alt="Logo Universidad Estatal de Bolivar" className="image-right" />
                                        <h2>Bienvenido</h2>
                                        <p>Ingresa tus credenciales institucionales para continuar.</p>
                                    </div>
                                    <form onSubmit={handleLoginSubmit} className="auth-form" noValidate>
                                        <div className="form-group">
                                            <label htmlFor="loginEmail">Correo institucional</label>
                                            <div className="input-shell">
                                                <Mail size={17} />
                                                <input
                                                    id="loginEmail"
                                                    type="text"
                                                    name="email"
                                                    placeholder="nombre.usuario"
                                                    value={loginEmail}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/@.*/, '').trim();
                                                        setLoginEmail(val);
                                                    }}
                                                    required
                                                    style={{ flex: 1 }}
                                                />
                                                <span style={{ color: 'var(--text-muted)', fontSize: '11.5px', fontWeight: 600, paddingLeft: '10px', borderLeft: '1.5px solid var(--border)', userSelect: 'none', whiteSpace: 'nowrap' }}>
                                                    @ueb.edu.ec
                                                </span>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="loginPassword">Contraseña</label>
                                            <div className="input-shell">
                                                <LockKeyhole size={17} />
                                                <input
                                                    id="loginPassword"
                                                    type={showLoginPassword ? 'text' : 'password'}
                                                    name="password"
                                                    placeholder="Ingresa tu contraseña"
                                                    autoComplete="current-password"
                                                    value={loginPassword}
                                                    onChange={(e) => setLoginPassword(e.target.value)}
                                                    required
                                                />
                                                <button
                                                    className="password-toggle"
                                                    type="button"
                                                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                                                    aria-label="Mostrar contraseña"
                                                >
                                                    {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="form-options">
                                            <label className="checkbox">
                                                <input type="checkbox" name="remember" />
                                                Mantener mi sesión iniciada
                                            </label>
                                            <a
                                                className="text-link"
                                                href="/forgot-password"
                                                onClick={(e) => handleSwitchMode('/forgot-password', e)}
                                            >
                                                ¿Olvidaste tu contraseña?
                                            </a>
                                        </div>
                                        <button
                                            className={`auth-submit ${loginLoading ? 'loading' : ''}`}
                                            type="submit"
                                            disabled={loginLoading}
                                        >
                                            {loginLoading ? (
                                                <span className="spinner" style={{ display: 'block' }}></span>
                                            ) : (
                                                <>
                                                    <span className="button-text">Acceder</span>
                                                    <ArrowRight size={16} />
                                                </>
                                            )}
                                        </button>
                                    </form>
                                    <div className="auth-divider">Acceso de nuevos usuarios</div>

                                    <p className="auth-alternative">
                                        ¿Aún no tienes una cuenta?
                                        <a
                                            href="/registro"
                                            onClick={(e) => handleSwitchMode('/registro', e)}
                                            style={{ color: 'var(--accent)', fontWeight: 720, marginLeft: '4px' }}
                                        >
                                            Registrarse
                                        </a>
                                    </p>
                                    <footer className="auth-footer-mobile">
                                        <span className="auth-footer__line">Desarrollado por Diego Urbano y Alex Vega</span>
                                        <span className="auth-footer__line"><strong className="auth-footer__label">Tutor:</strong> Dr Henry Vallejo</span>
                                        <span className="auth-footer__line"><strong className="auth-footer__label">Pares:</strong> Edgar Rivadeneira y Darwin Carrión</span>
                                    </footer>
                                </div>
                            </div>

                            {/* CARA TRASERA (180 DEG): REGISTRO O FORGOT PASSWORD */}
                            <div className="auth-card-face back">
                                <div className="auth-panel__inner">

                                    <a
                                        className="auth-back"
                                        href="/login"
                                        onClick={(e) => handleSwitchMode('/login', e)}
                                    >
                                        <ArrowLeft size={15} /> Volver al inicio de sesión
                                    </a>

                                    {backFormType === 'registro' ? (
                                        !regSuccess ? (
                                            <div data-form-container>
                                                <div className="auth-heading">
                                                    <img src={logoUeb} alt="Logo UEB" className="image-right" />
                                                    <h2>Crear cuenta</h2>
                                                    <p>Ingresa tus datos institucionales para solicitar acceso al sistema.</p>
                                                </div>
                                                <form onSubmit={handleRegSubmit} className="auth-form" noValidate style={{ marginTop: '24px' }}>

                                                    <div className="form-group">
                                                        <label htmlFor="registerEmail">Correo institucional</label>
                                                        <div className="input-shell input-shell--large">
                                                            <Mail size={17} />
                                                            <input
                                                                id="registerEmail"
                                                                type="text"
                                                                name="email"
                                                                placeholder="nombre.usuario"
                                                                value={regForm.email}
                                                                onChange={(e) => {
                                                                    const val = e.target.value.replace(/@.*/, '').trim();
                                                                    setRegForm(prev => ({ ...prev, email: val }));
                                                                    setRegError(null);
                                                                }}
                                                                required
                                                                style={{ flex: 1 }}
                                                            />
                                                            <span style={{ color: 'var(--text-muted)', fontSize: '11.5px', fontWeight: 600, paddingLeft: '10px', borderLeft: '1.5px solid var(--border)', userSelect: 'none', whiteSpace: 'nowrap' }}>
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
                                                                type={showRegPassword ? 'text' : 'password'}
                                                                name="password"
                                                                placeholder="Mínimo 8 caracteres"
                                                                value={regForm.password}
                                                                onChange={handleRegChange}
                                                                required
                                                            />
                                                            <button
                                                                className="password-toggle"
                                                                type="button"
                                                                onClick={() => setShowRegPassword(!showRegPassword)}
                                                                aria-label="Mostrar contraseña"
                                                            >
                                                                {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <PasswordRequirements password={regForm.password} />

                                                    <div className="form-group">
                                                        <label htmlFor="confirmPassword">Confirmar contraseña</label>
                                                        <div className="input-shell input-shell--large">
                                                            <LockKeyhole size={17} />
                                                            <input
                                                                id="confirmPassword"
                                                                type={showRegConfirmPassword ? 'text' : 'password'}
                                                                name="confirmPassword"
                                                                placeholder="Repite tu contraseña"
                                                                value={regForm.confirmPassword}
                                                                onChange={handleRegChange}
                                                                required
                                                            />
                                                            <button
                                                                className="password-toggle"
                                                                type="button"
                                                                onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                                                                aria-label="Mostrar contraseña"
                                                            >
                                                                {showRegConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <label className="checkbox checkbox--terms" style={{ marginTop: '16px', marginBottom: '24px' }}>
                                                        <input
                                                            type="checkbox"
                                                            name="terms"
                                                            checked={regForm.terms}
                                                            onChange={handleRegChange}
                                                        />
                                                        Acepto las políticas de privacidad y condiciones institucionales.
                                                    </label>

                                                    <button
                                                        className={`auth-submit ${regLoading ? 'loading' : ''}`}
                                                        type="submit"
                                                        disabled={regLoading}
                                                    >
                                                        {regLoading ? (
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
                                            <div className="success-state" style={{ display: 'block' }}>
                                                <div className="success-state__icon">
                                                    <BadgeCheck size={31} />
                                                </div>
                                                <h2>¡Registro exitoso!</h2>
                                                <p>Tu cuenta ha sido creada exitosamente. Ya puedes iniciar sesión con tus credenciales.</p>
                                                <a
                                                    className="auth-submit"
                                                    href="/login"
                                                    onClick={(e) => handleSwitchMode('/login', e)}
                                                    style={{ marginTop: '25px', width: '100%' }}
                                                >
                                                    <span>Iniciar sesión</span>
                                                    <ArrowRight size={16} style={{ marginLeft: '8px' }} />
                                                </a>
                                            </div>
                                        )
                                    ) : (
                                        /* FORGOT PASSWORD FORM */
                                        <div data-form-container>
                                            <div className="auth-heading">
                                                <div className="auth-heading__icon">
                                                    <KeyRound size={24} />
                                                </div>
                                                <h2>Recuperar contraseña</h2>
                                                <p>Ingresa tu correo institucional y enviaremos las instrucciones para restablecer tu acceso.</p>
                                            </div>

                                            <form onSubmit={handleForgotSubmit} className="auth-form" noValidate>
                                                <div className="form-group">
                                                    <label htmlFor="resetEmail">Correo institucional</label>
                                                    <div className="input-shell">
                                                        <Mail size={17} />
                                                        <input
                                                            id="resetEmail"
                                                            type="email"
                                                            name="email"
                                                            placeholder="nombre@ueb.edu.ec"
                                                            value={forgotEmail}
                                                            onChange={(e) => setForgotEmail(e.target.value)}
                                                            autoComplete="email"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <button
                                                    className={`auth-submit ${forgotLoading ? 'loading' : ''}`}
                                                    type="submit"
                                                    disabled={forgotLoading}
                                                >
                                                    {forgotLoading ? (
                                                        <span className="spinner" style={{ display: 'block' }}></span>
                                                    ) : (
                                                        <>
                                                            <span className="button-text">Enviar instrucciones</span>
                                                            <Send size={16} />
                                                        </>
                                                    )}
                                                </button>
                                            </form>

                                            <div className="security-note" style={{ marginTop: '20px' }}>
                                                <Info size={15} style={{ marginRight: '9px', flexShrink: 0, color: 'var(--text-secondary)' }} />
                                                <span>Por seguridad, el enlace tendrá una duración limitada. Revisa también tu carpeta de correo no deseado.</span>
                                            </div>
                                        </div>
                                    )}

                                    <footer className="auth-footer-mobile">
                                        <span className="auth-footer__line">Desarrollado por Diego Urbano y Alex Vega</span>
                                        <span className="auth-footer__line"><strong className="auth-footer__label">Tutor:</strong> Dr Henry Vallejo</span>
                                        <span className="auth-footer__line"><strong className="auth-footer__label">Pares:</strong> Edgar Rivadeneira y Darwin Carrión</span>
                                    </footer>
                                </div>
                            </div>

                        </div>
                    </div>
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
                    <p className="help-panel__message">¡Hola! Para ingresar, usa tu correo institucional y contraseña.</p>
                    <div className="help-panel__actions">
                        <button className="help-panel__action" type="button" onClick={(e) => handleSwitchMode('/registro', e)}>
                            <CircleHelp size={15} />
                            Crear una cuenta nueva
                        </button>
                        <button className="help-panel__action" type="button" onClick={(e) => handleSwitchMode('/forgot-password', e)}>
                            <LockKeyhole size={15} />
                            Recuperar mi contraseña
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

            {/* MODALES DE ERROR */}
            {showLoginErrorModal && (
                <div className="auth-modal show">
                    <div className="auth-modal__content">
                        <div className="auth-modal__icon">
                            <AlertTriangle size={24} />
                        </div>
                        <h3>Error de Acceso</h3>
                        <p>{loginError}</p>
                        <button type="button" className="auth-modal__close-btn" onClick={() => setShowLoginErrorModal(false)}>
                            Entendido
                        </button>
                    </div>
                </div>
            )}

            {showRegErrorModal && (
                <div className="auth-modal show">
                    <div className="auth-modal__content">
                        <div className="auth-modal__icon">
                            <AlertTriangle size={24} />
                        </div>
                        <h3>Error al Registrar</h3>
                        <p>{regError}</p>
                        <button type="button" className="auth-modal__close-btn" onClick={() => setShowRegErrorModal(false)}>
                            Entendido
                        </button>
                    </div>
                </div>
            )}

            {forgotModal.show && (
                <div className="modal-overlay" style={{
                    position: 'fixed', inset: 0, background: 'rgba(0, 32, 64, 0.55)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
                }}>
                    <div className="modal-card" style={{
                        background: '#ffffff', borderRadius: '24px', padding: '36px 32px', width: '90%', maxWidth: '420px',
                        boxShadow: '0 24px 64px rgba(0, 32, 64, 0.22)', textAlign: 'center'
                    }}>
                        <div className={`modal-icon ${forgotModal.type}`} style={{
                            width: '64px', height: '64px', borderRadius: '20px', display: 'grid', placeItems: 'center', margin: '0 auto 20px',
                            background: forgotModal.type === 'success' ? '#ecfdf3' : '#fef3f2',
                            color: forgotModal.type === 'success' ? '#039855' : '#d92d20'
                        }}>
                            {forgotModal.type === 'success' ? <MailCheck size={30} /> : <X size={30} />}
                        </div>
                        <h3 style={{ fontSize: '21px', color: '#002040', marginBottom: '12px', fontWeight: 700 }}>{forgotModal.title}</h3>
                        <p style={{ fontSize: '13.5px', color: '#475467', lineHeight: 1.6, marginBottom: '28px' }}>{forgotModal.message}</p>
                        <button
                            className={`modal-btn ${forgotModal.type}`}
                            onClick={handleCloseForgotModal}
                            style={{
                                width: '100%', height: '50px', border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: 700,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                background: forgotModal.type === 'success' ? 'var(--accent)' : '#002040', color: 'white'
                            }}
                        >
                            <span>{forgotModal.type === 'success' ? 'Entendido, ir al login' : 'Intentar de nuevo'}</span>
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
};

export default AuthPage;
