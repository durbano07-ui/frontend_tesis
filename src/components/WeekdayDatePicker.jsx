import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DIAS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

const toStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/**
 * Calendario para agendar citas: solo permite días de lunes a viernes desde `min` (YYYY-MM-DD).
 * Los fines de semana y los días pasados se muestran deshabilitados.
 */
const WeekdayDatePicker = ({ value, onChange, min }) => {
    const initial = value ? new Date(`${value}T00:00:00`) : (min ? new Date(`${min}T00:00:00`) : new Date());
    const [view, setView] = useState({ y: initial.getFullYear(), m: initial.getMonth() });

    const first = new Date(view.y, view.m, 1);
    const offset = (first.getDay() + 6) % 7; // semana empieza en lunes
    const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
    const cells = [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => new Date(view.y, view.m, i + 1))];

    const minDate = min ? new Date(`${min}T00:00:00`) : null;
    const canGoBack = !minDate || new Date(view.y, view.m, 1) > new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    const move = (delta) => setView(({ y, m }) => {
        const d = new Date(y, m + delta, 1);
        return { y: d.getFullYear(), m: d.getMonth() };
    });

    return (
        <div style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '10px', background: 'var(--surface, #fff)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <button type="button" onClick={() => move(-1)} disabled={!canGoBack} aria-label="Mes anterior"
                    style={{ border: 'none', background: 'none', cursor: canGoBack ? 'pointer' : 'not-allowed', opacity: canGoBack ? 1 : 0.3, padding: '4px', color: 'var(--primary)' }}>
                    <ChevronLeft size={16} />
                </button>
                <strong style={{ fontSize: '12.5px', color: 'var(--primary)' }}>{MESES[view.m]} {view.y}</strong>
                <button type="button" onClick={() => move(1)} aria-label="Mes siguiente"
                    style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', color: 'var(--primary)' }}>
                    <ChevronRight size={16} />
                </button>
            </div>
            <div role="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', textAlign: 'center' }}>
                {DIAS.map(d => (
                    <span key={d} style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', padding: '2px 0' }}>{d}</span>
                ))}
                {cells.map((d, i) => {
                    if (!d) return <span key={`e${i}`} />;
                    const str = toStr(d);
                    const weekend = d.getDay() === 0 || d.getDay() === 6;
                    const past = min && str < min;
                    const disabled = weekend || past;
                    const selected = str === value;
                    return (
                        <button
                            key={str}
                            type="button"
                            disabled={disabled}
                            onClick={() => onChange(str)}
                            aria-label={`${d.getDate()} de ${MESES[view.m]}${weekend ? ' (fin de semana, sin atención)' : ''}`}
                            aria-pressed={selected}
                            title={weekend ? 'Sin atención los fines de semana' : undefined}
                            style={{
                                border: 'none',
                                borderRadius: '6px',
                                padding: '7px 0',
                                fontSize: '12px',
                                fontWeight: selected ? 700 : 500,
                                cursor: disabled ? 'not-allowed' : 'pointer',
                                background: selected ? 'var(--accent, #b71a34)' : disabled ? 'transparent' : 'rgba(15, 23, 42, 0.04)',
                                color: selected ? '#fff' : disabled ? '#cbd5e1' : 'var(--text)',
                                textDecoration: weekend ? 'line-through' : 'none',
                            }}
                        >
                            {d.getDate()}
                        </button>
                    );
                })}
            </div>
            <small style={{ display: 'block', marginTop: '6px', fontSize: '10.5px', color: 'var(--text-muted)' }}>
                Atención de lunes a viernes.
            </small>
        </div>
    );
};

export default WeekdayDatePicker;
