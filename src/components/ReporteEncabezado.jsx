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

/** Lista de registros del período para elegir cuál ver en el visor. */
export const ListaRegistros = ({ items, seleccionado, onSeleccionar }) => items.length > 0 && (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '220px', overflowY: 'auto', marginTop: '8px' }}>
        {items.map(item => {
            const activo = seleccionado === item.id;
            return (
                <button
                    key={item.id}
                    type="button"
                    aria-pressed={activo}
                    onClick={() => onSeleccionar(item.id)}
                    style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', textAlign: 'left',
                        padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
                        border: activo ? '1.5px solid var(--primary)' : '1px solid #e2e8f0',
                        background: activo ? 'var(--primary-soft)' : '#f8fafc'
                    }}
                >
                    <span style={{ minWidth: 0 }}>
                        <strong style={{ display: 'block', fontSize: '12.5px', color: '#0f172a' }}>{item.titulo}</strong>
                        <small style={{ color: '#64748b', fontSize: '11px' }}>{item.detalle}</small>
                    </span>
                    <small style={{ color: '#475569', fontSize: '11px', whiteSpace: 'nowrap' }}>{formatFecha(item.fecha)}</small>
                </button>
            );
        })}
    </div>
);

export default ReporteEncabezado;
