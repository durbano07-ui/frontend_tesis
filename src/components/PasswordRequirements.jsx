import React from 'react';
import { Check, X, ShieldCheck } from 'lucide-react';

export default function PasswordRequirements({ password = '' }) {
    const val = password || '';

    if (!val) {
        return null;
    }

    const requirements = [
        {
            id: 'length',
            label: 'Mínimo 8 caracteres',
            met: val.length >= 8
        },
        {
            id: 'uppercase',
            label: 'Una mayúscula (A-Z)',
            met: /[A-Z]/.test(val)
        },
        {
            id: 'number',
            label: 'Un número (0-9)',
            met: /[0-9]/.test(val)
        },
        {
            id: 'special',
            label: 'Un símbolo (@, $, !, %, #, *)',
            met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val)
        }
    ];

    const metCount = requirements.filter(r => r.met).length;

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

