import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import AuthFlipCard from '../../components/AuthFlipCard';
import '../../auth.css';

// Importación de recursos
import UEBLogo from '../../assets/leftUEB.png';

// Iconos de Lucide
import {
    ShieldCheck,
    BadgeCheck,
    LockKeyhole,
    ChartNoAxesCombined,
    ArrowLeft,
    Mail,
    Send,
    ArrowRight,
    KeyRound,
    Info,
    X,
    MailCheck
} from 'lucide-react';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    // Estado del modal
    const [modal, setModal] = useState({
        show: false,
        type: 'success', // 'success' | 'error'
        title: '',
        message: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            setModal({
                show: true,
                type: 'error',
                title: 'Campo requerido',
                message: 'Por favor, ingresa tu correo institucional.'
            });
            return;
        }

        setLoading(true);

        try {
            // endpoint Laravel para solicitar restablecimiento
            await api.post('/auth/forgot-password', { email });

            // Mostrar modal de éxito
            setModal({
                show: true,
                type: 'success',
                title: '¡Instrucciones enviadas!',
                message: `Hemos enviado un enlace seguro al correo ${email}. Por favor, revisa tu bandeja de entrada y la carpeta de correo no deseado.`
            });
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.message ||
                'Error al enviar la solicitud. Verifica el correo institucional e intenta nuevamente.';

            // Mostrar modal de error
            setModal({
                show: true,
                type: 'error',
                title: 'Error de envío',
                message: errorMsg
            });
        } finally {
            setLoading(false);
        }
    };

    // Cerrar modal o redirigir
    const handleCloseModal = () => {
        if (modal.type === 'success') {
            setModal({ ...modal, show: false });
            navigate('/login'); // Redirigir al login si fue exitoso
        } else {
            setModal({ ...modal, show: false }); // Cerrar y permitir reintentar si fue error
        }
    };

    return (
        <main className="auth-page">
            {/* ESTILOS PREMIUM PARA EL MODAL */}
            <style>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 32, 64, 0.55);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    animation: fadeIn 0.25s ease-out;
                }
                .modal-card {
                    background: #ffffff;
                    border: 1px solid rgba(0, 32, 64, 0.08);
                    border-radius: 24px;
                    padding: 36px 32px;
                    width: 90%;
                    max-width: 420px;
                    box-shadow: 0 24px 64px rgba(0, 32, 64, 0.22);
                    text-align: center;
                    animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                    position: relative;
                }
                .modal-icon {
                    width: 64px;
                    height: 64px;
                    border-radius: 20px;
                    display: grid;
                    place-items: center;
                    margin: 0 auto 20px;
                }
                .modal-icon.success {
                    background: #ecfdf3;
                    color: #039855;
                    border: 1px solid #d1fadf;
                }
                .modal-icon.error {
                    background: #fef3f2;
                    color: #d92d20;
                    border: 1px solid #fee4e2;
                }
                .modal-card h3 {
                    font-size: 21px;
                    color: #002040;
                    margin-bottom: 12px;
                    font-weight: 700;
                    letter-spacing: -0.5px;
                }
                .modal-card p {
                    font-size: 13.5px;
                    color: #475467;
                    line-height: 1.6;
                    margin-bottom: 28px;
                }
                .modal-btn {
                    width: 100%;
                    height: 50px;
                    border: none;
                    border-radius: 14px;
                    font-size: 14px;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: all 0.2s ease;
                }
                .modal-btn.success {
                    background: var(--accent);
                    color: white;
                }
                .modal-btn.success:hover {
                    background: #d3314d;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 14px rgba(183, 26, 52, 0.25);
                }
                .modal-btn.error {
                    background: #002040;
                    color: white;
                }
                .modal-btn.error:hover {
                    background: #001224;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 14px rgba(0, 32, 64, 0.2);
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.92); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>

            {/* MODAL COHESIVO */}
            {modal.show && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <div className={`modal-icon ${modal.type}`}>
                            {modal.type === 'success' ? <MailCheck size={30} /> : <X size={30} />}
                        </div>
                        <h3>{modal.title}</h3>
                        <p>{modal.message}</p>
                        <button
                            className={`modal-btn ${modal.type}`}
                            onClick={handleCloseModal}
                        >
                            <span>{modal.type === 'success' ? 'Entendido, ir al login' : 'Intentar de nuevo'}</span>
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            <div className="auth-shell">
                {/* Lado izquierdo: Visual */}
                <section className="auth-visual">
                    <img src={UEBLogo} alt="Logo Universidad Estatal de Bolívar" className="image-left" />
                    <div className="auth-visual__content">
                        <h1>Recupera tu cuenta <span>de forma segura.</span></h1>
                        <div className="auth-benefits">
                        </div>
                    </div>
                    <span className="auth-visual__footer">
                        © 2026 Bienestar Universitario · Sistema Médico Universitario
                    </span>
                </section>

                {/* Lado derecho: Formulario */}
                <section className="auth-panel">
                    <AuthFlipCard>
                        {(flipNav) => (
                            <div className="auth-panel__inner">
                                <Link className="auth-back" to="/login" onClick={(e) => flipNav('/login', e)}>
                                    <ArrowLeft size={15} /> Volver al inicio de sesión
                                </Link>

                                <div data-form-container>
                                    <div className="auth-heading">
                                        <div className="auth-heading__icon">
                                            <KeyRound size={24} />
                                        </div>
                                        <h2>Recuperar contraseña</h2>
                                        <p>Ingresa tu correo institucional y enviaremos las instrucciones para restablecer tu acceso.</p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="auth-form" noValidate>
                                        <div className="form-group">
                                            <label htmlFor="resetEmail">Correo institucional</label>
                                            <div className="input-shell">
                                                <Mail size={17} />
                                                <input
                                                    id="resetEmail"
                                                    type="email"
                                                    name="email"
                                                    placeholder="nombre@ueb.edu.ec"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    autoComplete="email"
                                                    required
                                                />
                                            </div>
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
                            </div>
                        )}
                    </AuthFlipCard>
                </section>
            </div>
        </main>
    );
};

export default ForgotPassword;
