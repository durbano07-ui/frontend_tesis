import PeriodoSelector from './PeriodoSelector';
import { formatFecha } from '../utils/fecha';

/**
 * Encabezado común de los reportes (Fichas, Exámenes, Recetario, Matrices): título, período,
 * subpestañas y resumen con el mismo diseño en todos.
 */
const ReporteEncabezado = ({
    eyebrow, titulo, descripcion, extra,
    periodo, onPeriodo, que,
    tabs = [], tabActiva, onTab,
    estado, children
}) => (
    <article className="nurse-card span-12" style={{ borderRadius: '14px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', width: '100%' }}>
            <div style={{ minWidth: 0 }}>
                {eyebrow && <span className="eyebrow">{eyebrow}</span>}
                <h3 style={{ margin: '4px 0 4px', fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>{titulo}</h3>
                {descripcion && <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>{descripcion}</p>}
            </div>
            {periodo && <PeriodoSelector value={periodo} onChange={onPeriodo} que={que} />}
        </div>

        {extra && <div style={{ marginTop: '14px' }}>{extra}</div>}

        {tabs.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
                {tabs.map(({ id, label, icon: Icono }) => (
                    <button
                        key={id}
                        type="button"
                        aria-pressed={tabActiva === id}
                        className={`history-tab ${tabActiva === id ? 'active' : ''}`}
                        onClick={() => onTab(id)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                    >
                        {Icono && <Icono size={14} />} {label}
                    </button>
                ))}
            </div>
        )}

        {estado && (
            <p role="status" aria-live="polite" style={{ margin: '14px 0 0', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                {estado}
            </p>
        )}

        {children}
    </article>
);

/**
 * Selector del registro del período que se ve en el visor: solo el nombre del paciente. Si un
 * nombre se repite (varias fichas o recetas de la misma persona), se le añade la fecha.
 */
export const ListaRegistros = ({ items, seleccionado, onSeleccionar }) => {
    if (items.length === 0) return null;
    const repetidos = new Set(items.map(i => i.titulo).filter((t, idx, arr) => arr.indexOf(t) !== idx));
    return (
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#475569' }}>Paciente</span>
            <select
                value={seleccionado ?? ''}
                onChange={(e) => {
                    const item = items.find(i => String(i.id) === e.target.value);
                    if (item) onSeleccionar(item.id);
                }}
                style={{ flex: '1 1 260px', maxWidth: '480px', minHeight: '38px', padding: '0 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '12.5px', fontWeight: 600, color: '#0f172a' }}
            >
                {items.map(item => (
                    <option key={item.id} value={item.id}>
                        {repetidos.has(item.titulo) ? `${item.titulo} — ${formatFecha(item.fecha)}` : item.titulo}
                    </option>
                ))}
            </select>
        </label>
    );
};

export default ReporteEncabezado;
