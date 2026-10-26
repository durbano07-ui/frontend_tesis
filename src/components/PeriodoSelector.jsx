import { CalendarDays } from 'lucide-react';
import { MESES } from '../utils/periodo';

const controlStyle = { border: '1px solid var(--border)', borderRadius: '8px', padding: '7px 10px', fontSize: '12px', background: '#ffffff' };

/**
 * Selector del período de un reporte: "Por día" (una fecha) o "Por mes" (mes y año).
 * `que` describe lo que se filtra, para las etiquetas accesibles (p. ej. "de las fichas").
 */
const PeriodoSelector = ({ value, onChange, que = '' }) => {
    const anioActual = new Date().getFullYear();
    const anios = Array.from({ length: 5 }, (_, i) => anioActual - i);
    const set = (cambios) => onChange({ ...value, ...cambios });

    return (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div role="group" aria-label={`Consultar ${que} por`} style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px', gap: '4px' }}>
                {[['dia', 'Por día'], ['mes', 'Por mes']].map(([tipo, texto]) => (
                    <button
                        key={tipo}
                        type="button"
                        aria-pressed={value.tipo === tipo}
                        onClick={() => set({ tipo })}
                        style={{
                            padding: '6px 12px', fontSize: '11.5px', fontWeight: 600, border: 'none', borderRadius: '6px', cursor: 'pointer',
                            background: value.tipo === tipo ? '#ffffff' : 'transparent',
                            color: value.tipo === tipo ? 'var(--primary)' : 'var(--text-muted)',
                            boxShadow: value.tipo === tipo ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                        }}
                    >
                        {texto}
                    </button>
                ))}
            </div>
            {value.tipo === 'dia' ? (
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CalendarDays size={16} color="var(--accent)" />
                    <input aria-label={`Día ${que}`.trim()} type="date" value={value.dia} onChange={e => e.target.value && set({ dia: e.target.value })} style={controlStyle} />
                </label>
            ) : (
                <>
                    <select aria-label={`Mes ${que}`.trim()} value={value.mes} onChange={e => set({ mes: Number(e.target.value) })} style={controlStyle}>
                        {MESES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                    </select>
                    <select aria-label={`Año ${que}`.trim()} value={value.anio} onChange={e => set({ anio: Number(e.target.value) })} style={controlStyle}>
                        {anios.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                </>
            )}
        </div>
    );
};

export default PeriodoSelector;
