import React, { useState } from 'react';
import { HelpCircle, X, ChevronDown, ChevronRight, BookOpen, Phone, Mail, Shield } from 'lucide-react';
import '../help-panel.css';

/**
 * HelpPanel — Panel de ayuda contextual flotante.
 * Props:
 *   - helpItems: Array de { title: string, content: string } — secciones de ayuda.
 *   - contactInfo: { phone?: string, email?: string } — datos de contacto opcionales.
 */
const HelpPanel = ({
    helpItems = [],
    contactInfo = {},
    position = 'bottom-right'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [openSection, setOpenSection] = useState(null);

    const toggleSection = (idx) => {
        setOpenSection(openSection === idx ? null : idx);
    };

    return (
        <>
            {/* Floating trigger button */}
            <button
                className={`help-trigger ${isOpen ? 'help-trigger--active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Abrir panel de ayuda"
                title="Ayuda del sistema"
            >
                {isOpen ? <X size={20} /> : <HelpCircle size={20} />}
            </button>

            {/* Overlay */}
            {isOpen && (
                <div className="help-overlay" onClick={() => setIsOpen(false)} />
            )}

            {/* Panel */}
            <aside className={`sys-help-panel ${isOpen ? 'sys-help-panel--open' : ''} sys-help-panel--${position}`}>
                {/* Header */}
                <div className="sys-help-panel__header">
                    <div className="sys-help-panel__header-icon">
                        <BookOpen size={18} />
                    </div>
                    <div>
                        <h3>Centro de Ayuda</h3>
                        <p>Guía rápida del sistema</p>
                    </div>
                    <button className="sys-help-panel__close" onClick={() => setIsOpen(false)}>
                        <X size={16} />
                    </button>
                </div>

                {/* Content */}
                <div className="sys-help-panel__body">
                    {helpItems.length > 0 ? (
                        <div className="help-accordion">
                            {helpItems.map((item, idx) => (
                                <div
                                    key={idx}
                                    className={`help-accordion__item ${openSection === idx ? 'help-accordion__item--open' : ''}`}
                                >
                                    <button
                                        className="help-accordion__trigger"
                                        onClick={() => toggleSection(idx)}
                                    >
                                        <span>{item.title}</span>
                                        {openSection === idx
                                            ? <ChevronDown size={14} />
                                            : <ChevronRight size={14} />
                                        }
                                    </button>
                                    <div className="help-accordion__content">
                                        <p>{item.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="help-empty">
                            <Shield size={28} />
                            <p>No hay artículos de ayuda disponibles para esta sección.</p>
                        </div>
                    )}

                    {/* Contact info */}
                    <div className="help-contact" style={{ marginTop: '15px' }}>
                        <p className="help-contact__label">¿Necesitas más ayuda?</p>
                        <a 
                            href="https://mail.google.com/mail/?view=cm&fs=1&to=ciclismoguaranda@gmail.com&su=Soporte%20Bienestar%20Universitario" 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="help-contact__item"
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px', 
                                padding: '10px 12px', 
                                background: 'var(--primary-soft, #eaf0f5)', 
                                border: '1px solid var(--border, #e4e9ef)', 
                                borderRadius: '10px', 
                                color: 'var(--primary, #002040)', 
                                fontWeight: '600', 
                                fontSize: '11px', 
                                textDecoration: 'none',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'var(--border, #e4e9ef)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'var(--primary-soft, #eaf0f5)'}
                        >
                            <Mail size={14} style={{ color: 'var(--accent, #b71a34)' }} />
                            <span>Contactar a Soporte (ciclismoguaranda@gmail.com)</span>
                        </a>
                    </div>
                </div>

                {/* Footer badge */}
                <div className="sys-help-panel__footer">
                    <Shield size={12} />
                    <span>Bienestar Universitario · Sistema Médico</span>
                </div>
            </aside>
        </>
    );
};

export default HelpPanel;
