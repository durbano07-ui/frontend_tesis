import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import api from '../../api/axios';
import AuthFlipCard from '../../components/AuthFlipCard';
import logoUeb from '../../assets/ueb.png';
import UEBLogo from '../../assets/leftUEB.png';
import UEBpet from '../../assets/UEBpet.png';

import {
    LockKeyhole,
    Mail,
    Eye,
    EyeOff,
    ArrowRight,
    CircleHelp,
    MessageCircle,
    X,
    AlertTriangle
} from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [isSessionExpired, setIsSessionExpired] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const navigate = useNavigate();
    const loginStore = useAuthStore((state) => state.login);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('expired') === 'true') {
            setIsSessionExpired(true);
            setError('Tu sesión ha expirado por inactividad para proteger tus datos de salud. Por favor, inicia sesión nuevamente.');
            setShowErrorModal(true);
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const finalEmail = email.includes('@') ? email.trim() : `${email.trim()}@ueb.edu.ec`;

        try {
            const response = await api.post('/auth/login', { email: finalEmail, password });
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
            // Extraer mensaje real del backend
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
            setError(msg);
            setShowErrorModal(true);
        } finally {
            setLoading(false);
        }
    };
    return (
        <main className="auth-page">
            <div className="auth-shell">

                {/* Lado izquierdo: Visual */}
                <section className="auth-visual">

                    <img src={UEBLogo} alt="Logo Universidad Estatal de Bolivar" className='image-left' />
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
                {/* Lado derecho: Formulario */}
                <section className="auth-panel">
                    <AuthFlipCard>
                        {(flipNav) => (
                            <div className="auth-panel__inner">

                                <div className="auth-heading">
                                    <img src={logoUeb} alt="Logo Universidad Estatal de Bolivar" className='image-right' />
                                    <h2>Bienvenido</h2>
                                    <p>Ingresa tus credenciales institucionales para continuar.</p>
                                </div>
                                <form onSubmit={handleSubmit} className="auth-form" noValidate>

                                     <div className="form-group">
                                         <label htmlFor="loginEmail">Correo institucional</label>
                                         <div className="input-shell">
                                             <Mail size={17} />
                                             <input
                                                 id="loginEmail"
                                                 type="text"
                                                 name="email"
                                                 placeholder="nombre.usuario"
                                                 value={email}
                                                 onChange={(e) => {
                                                     const val = e.target.value.replace(/@.*/, '').trim();
                                                     setEmail(val);
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
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                placeholder="Ingresa tu contraseña"
                                                autoComplete="current-password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
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
                                    <div className="form-options">
                                        <label className="checkbox">
                                            <input type="checkbox" name="remember" />
                                            Mantener mi sesión iniciada
                                        </label>
                                        <Link className="text-link" to="/forgot-password" onClick={(e) => flipNav('/forgot-password', e)}>
                                            ¿Olvidaste tu contraseña?
                                        </Link>
                                    </div>
                                    <button
                                        className={`auth-submit ${loading ? 'loading' : ''}`}
                                        type="submit"
                                        disabled={loading}
                                    >
                                        {loading ? (
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
                                    <Link to="/registro" onClick={(e) => flipNav('/registro', e)}> Registrarse</Link>
                                </p>
                                <footer className="auth-footer-mobile">
                                    <span className="auth-footer__line">Desarrollado por Diego Urbano y Alex Vega</span>
                                    <span className="auth-footer__line"><strong className="auth-footer__label">Tutor:</strong> Dr Henry Vallejo</span>
                                    <span className="auth-footer__line"><strong className="auth-footer__label">Pares:</strong> Edgar Rivadeneira y Darwin Carrión</span>
                                </footer>
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
                    <p className="help-panel__message">¡Hola! Para ingresar, usa tu correo institucional y contraseña. Si eres personal de salud, tu cuenta es creada por el Administrador.</p>
                    <div className="help-panel__actions">
                        <button className="help-panel__action" type="button" onClick={() => navigate('/registro')}>
                            <CircleHelp size={15} />
                            Crear una cuenta nueva
                        </button>
                        <button className="help-panel__action" type="button" onClick={() => navigate('/forgot-password')}>
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

            {/* Modal de Error / Expiración de Sesión */}
            <div className={`auth-modal ${showErrorModal ? 'show' : ''}`}>
                <div className="auth-modal__content" style={isSessionExpired ? { borderTop: '4px solid var(--accent)' } : {}}>
                    <div className="auth-modal__icon" style={isSessionExpired ? { background: 'rgba(183, 26, 52, 0.1)', color: 'var(--accent)' } : {}}>
                        {isSessionExpired ? <LockKeyhole size={24} /> : <AlertTriangle size={24} />}
                    </div>
                    <h3>{isSessionExpired ? 'Sesión Expirada' : 'Error de Acceso'}</h3>
                    <p>{error}</p>
                    <button
                        type="button"
                        className="auth-modal__close-btn"
                        style={isSessionExpired ? { background: 'var(--accent)' } : {}}
                        onClick={() => {
                            setShowErrorModal(false);
                            setIsSessionExpired(false);
                        }}
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </main>
    );
};
export default Login;