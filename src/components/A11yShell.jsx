import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import api, { LAST_ACTIVITY_KEY } from '../api/axios';

/**
 * Funciones de accesibilidad comunes a todas las páginas (NTE INEN-ISO/IEC 40500 / WCAG 2.0):
 *  - 2.4.1 Evitar bloques: enlace "Saltar al contenido principal".
 *  - 2.4.2 Titulado de páginas: título del documento según la ruta.
 *  - 2.2.1 Tiempo ajustable: aviso antes de que la sesión expire por inactividad,
 *          con opción de extenderla.
 */

const APP_NAME = 'Bienestar Universitario UEB';

const PAGE_TITLES = {
    '/login': 'Iniciar sesión',
    '/registro': 'Crear cuenta',
    '/forgot-password': 'Recuperar contraseña',
    '/reset-password': 'Restablecer contraseña',
    '/dashboard': 'Elegir módulo',
    '/enfermeria': 'Enfermería',
    '/psicologia': 'Psicología',
    '/odontologia': 'Odontología',
    '/medicina-ocupacional': 'Medicina Ocupacional',
    '/medicina-general': 'Medicina General',
    '/administrador': 'Coordinación y Administración',
    '/estudiante': 'Mi Portal de Paciente',
};

// Debe coincidir con TOKEN_INACTIVITY_MINUTES del backend (30 min, OWASP ASVS V3.3.2 nivel 2)
const SESSION_MINUTES = Number(import.meta.env.VITE_SESSION_MINUTES) || 30;
const WARNING_SECONDS = 5 * 60;

const getLastActivity = () => {
    try { return Number(sessionStorage.getItem(LAST_ACTIVITY_KEY)) || Date.now(); } catch { return Date.now(); }
};

const skipToMain = (e) => {
    e.preventDefault();
    const main = document.querySelector('main');
    if (!main) return;
    if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
    main.focus();
    main.scrollIntoView({ block: 'start' });
};

const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

const SessionTimeoutWarning = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const [secondsLeft, setSecondsLeft] = useState(null);
    const [extending, setExtending] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) { setSecondsLeft(null); return; }
        const tick = () => {
            const elapsed = (Date.now() - getLastActivity()) / 1000;
            setSecondsLeft(Math.max(0, Math.round(SESSION_MINUTES * 60 - elapsed)));
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [isAuthenticated]);

    const extend = useCallback(async () => {
        setExtending(true);
        try {
            // Cualquier petición autenticada renueva la actividad del token
            await api.get('/user-profile/profile');
        } finally {
            setExtending(false);
        }
    }, []);

    if (!isAuthenticated || secondsLeft === null || secondsLeft > WARNING_SECONDS) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100000, display: 'grid', placeItems: 'center', padding: '16px' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0, 20, 40, 0.55)' }}></div>
            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="session-warning-title"
                aria-describedby="session-warning-desc"
                style={{ position: 'relative', background: '#fff', borderRadius: '14px', padding: '24px', maxWidth: '400px', width: '100%', boxShadow: '0 20px 50px rgba(0,0,0,0.25)', textAlign: 'center' }}
            >
                <Clock size={32} color="#b71a34" aria-hidden="true" />
                <h2 id="session-warning-title" style={{ fontSize: '18px', color: '#002040', margin: '10px 0 6px' }}>
                    {secondsLeft > 0 ? 'Tu sesión está por expirar' : 'Tu sesión expiró'}
                </h2>
                <p id="session-warning-desc" style={{ fontSize: '14px', color: '#475467', margin: '0 0 18px' }}>
                    {secondsLeft > 0
                        ? <>Por seguridad, la sesión se cerrará por inactividad en <strong>{formatTime(secondsLeft)}</strong>. Los datos que no hayas guardado se perderán.</>
                        : 'Por seguridad, la sesión se cerró por inactividad. Vuelve a iniciar sesión para continuar.'}
                </p>
                {secondsLeft > 0 ? (
                    <button
                        type="button"
                        onClick={extend}
                        disabled={extending}
                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: '#002040', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
                    >
                        {extending ? 'Extendiendo…' : 'Seguir conectado'}
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={() => { useAuthStore.getState().logout(); window.location.href = '/login?expired=true'; }}
                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: '#002040', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
                    >
                        Iniciar sesión
                    </button>
                )}
            </div>
        </div>
    );
};

/**
 * ISO/IEC 25010 — Fiabilidad (tolerancia a fallos): aviso cuando el servidor no responde.
 * Se muestra como máximo una vez cada 15 s y se oculta solo.
 */
const ConnectionNotice = () => {
    const [notice, setNotice] = useState(null);

    useEffect(() => {
        let lastShown = 0;
        let hideTimer;
        const onUnavailable = (e) => {
            // Mientras sigan llegando fallos, el aviso permanece visible
            clearTimeout(hideTimer);
            hideTimer = setTimeout(() => setNotice(null), 8000);
            // El texto solo se (re)anuncia como máximo cada 15 s para no saturar al lector de pantalla
            const now = Date.now();
            if (now - lastShown < 15000) return;
            lastShown = now;
            setNotice(e.detail?.offline
                ? 'No se pudo conectar con el servidor. Revisa tu conexión a internet; los datos mostrados pueden estar incompletos.'
                : 'El servidor tuvo un problema al procesar la solicitud. Intenta nuevamente en unos momentos.');
        };
        window.addEventListener('api:unavailable', onUnavailable);
        return () => { window.removeEventListener('api:unavailable', onUnavailable); clearTimeout(hideTimer); };
    }, []);

    if (!notice) return null;
    return (
        <div role="alert" style={{ position: 'fixed', top: '12px', left: '50%', transform: 'translateX(-50%)', zIndex: 99999, maxWidth: 'calc(100% - 32px)', width: '520px', background: '#fff7ed', border: '1px solid #fdba74', color: '#7c2d12', borderRadius: '12px', padding: '12px 40px 12px 16px', fontSize: '13px', fontWeight: 600, boxShadow: '0 10px 25px rgba(0,0,0,0.12)' }}>
            {notice}
            <button type="button" aria-label="Cerrar aviso" onClick={() => setNotice(null)} style={{ position: 'absolute', top: '8px', right: '10px', background: 'none', border: 'none', fontSize: '18px', lineHeight: 1, color: '#7c2d12', cursor: 'pointer' }}>×</button>
        </div>
    );
};

const A11yShell = ({ children }) => {
    const { pathname } = useLocation();

    useEffect(() => {
        const page = PAGE_TITLES[pathname];
        document.title = page ? `${page} | ${APP_NAME}` : APP_NAME;
    }, [pathname]);

    return (
        <>
            <a href="#main" className="skip-link" onClick={skipToMain}>Saltar al contenido principal</a>
            {children}
            <ConnectionNotice />
            <SessionTimeoutWarning />
        </>
    );
};

export default A11yShell;
