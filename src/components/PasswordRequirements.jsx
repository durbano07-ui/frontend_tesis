import { Check, X, ShieldCheck } from 'lucide-react';
import './PasswordRequirements.css';

export default function PasswordRequirements({ password = '' }) {
    const val = password || '';

    if (!val) {
        return null;
    }

    // Política OWASP ASVS V2.1: mínimo 12 caracteres y sin reglas de composición obligatorias.
    // Solo la longitud es obligatoria; el resto son recomendaciones para el medidor (V2.1.8).
    const requirements = [
        {
            id: 'length',
            label: 'Mínimo 12 caracteres (obligatorio)',
            met: val.length >= 12
        },
        {
            id: 'long',
            label: 'Ideal: 16 o más (una frase sirve)',
            met: val.length >= 16
        },
        {
            id: 'mix',
            label: 'Combina letras con números o símbolos',
            met: /[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(val) && /[^A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(val)
        },
        {
            id: 'pattern',
            label: 'Sin secuencias obvias (aaaa, 1234)',
            met: val.length > 0 && !/(.)\1{3,}/.test(val) && !/(0123|1234|2345|3456|4567|5678|6789|abcd|qwer|asdf)/i.test(val)
        }
    ];

    // Por debajo del mínimo obligatorio la contraseña siempre es débil
    const metCount = val.length < 12 ? Math.min(1, requirements.filter(r => r.met).length) : requirements.filter(r => r.met).length;

    // Strength levels
    let strengthText = 'Débil';
    let badgeBg = '#fef2f2';
    let badgeBorder = '#fecaca';
    let badgeColor = '#dc2626';
    let barColor = '#ef4444';

    if (metCount === 2) {
        strengthText = 'Regular';
        badgeBg = '#fffbe6';
        badgeBorder = '#ffe58f';
        badgeColor = '#d48806';
        barColor = '#f59e0b';
    } else if (metCount === 3) {
        strengthText = 'Buena';
        badgeBg = '#e6f7ff';
        badgeBorder = '#91caff';
        badgeColor = '#0958d9';
        barColor = '#2563eb';
    } else if (metCount === 4) {
        strengthText = 'Muy Fuerte';
        badgeBg = '#f6ffed';
        badgeBorder = '#b7eb8f';
        badgeColor = '#389e0d';
        barColor = '#10b981';
    }

    return (
        <div className="premium-password-reqs">
            {/* Header with Title and Dynamic Badge */}
            <div className="reqs-header">
                <div className="reqs-title">
                    <ShieldCheck size={16} className="reqs-icon" style={{ color: barColor }} />
                    <span>Seguridad de contraseña</span>
                </div>
                <div className="reqs-badge" style={{ backgroundColor: badgeBg, borderColor: badgeBorder, color: badgeColor }}>
                    <span className="reqs-badge-dot" style={{ backgroundColor: barColor }} />
                    {strengthText}
                </div>
            </div>

            {/* 4-Segment Progress Bar */}
            <div className="reqs-bars-grid">
                {[1, 2, 3, 4].map((step) => (
                    <div
                        key={step}
                        className={`reqs-bar-segment ${metCount >= step ? 'active' : ''}`}
                        style={{
                            backgroundColor: metCount >= step ? barColor : '#e2e8f0',
                            boxShadow: metCount >= step ? `0 0 8px ${barColor}55` : 'none'
                        }}
                    />
                ))}
            </div>

            {/* Grid Checklist */}
            <div className="reqs-checklist">
                {requirements.map((req) => (
                    <div
                        key={req.id}
                        className={`req-item ${req.met ? 'is-met' : 'is-unmet'}`}
                    >
                        <span className="req-icon-box">
                            {req.met ? (
                                <Check size={11} strokeWidth={3} />
                            ) : (
                                <X size={11} strokeWidth={3} />
                            )}
                        </span>
                        <span className="req-label">{req.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

