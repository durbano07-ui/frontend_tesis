import { HeartHandshake, TrendingUp, FileCheck, CheckCircle, ClipboardList } from 'lucide-react';

const ATENCION = {
    primaria: { texto: 'Primaria', Icono: HeartHandshake, bg: 'var(--primary-soft)', color: 'var(--primary)' },
    secundaria: { texto: 'Secundaria', Icono: TrendingUp, bg: 'var(--accent-soft)', color: 'var(--accent)' },
    certificadomedico: { texto: 'Certificado médico', Icono: FileCheck, bg: '#fef3c7', color: '#d97706' },
    validacion: { texto: 'Validación', Icono: CheckCircle, bg: '#e9f8f2', color: 'var(--success)' }
};

const TIPO = { curativo: 'Curativo', preventivo: 'Preventivo' };

const celda = { padding: '12px 14px', fontSize: '12px', color: 'var(--text)', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' };

/**
 * Atenciones del parte diario en tabla (una fila por atención), igual en todos los roles.
 * filas: [{ id, paciente, cedula, tipoAtencion, tipo, diagnostico }]
 */
const TablaAtencionesDia = ({ filas }) => (
    <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '12px' }}>
        <table className="medical-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
                <tr style={{ background: 'var(--surface-hover)', borderBottom: '1px solid var(--border)' }}>
                    {['N°', 'Paciente', 'Cédula', 'Atención', 'Tipo', 'Diagnóstico'].map(col => (
                        <th key={col} style={{ padding: '12px 14px', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>{col}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {filas.map((fila, idx) => {
                    const atencion = ATENCION[fila.tipoAtencion] || { texto: fila.tipoAtencion || '—', Icono: ClipboardList, bg: 'var(--primary-soft)', color: 'var(--primary)' };
                    const { Icono } = atencion;
                    return (
                        <tr key={fila.id || idx}>
                            <td style={{ ...celda, color: 'var(--text-muted)', fontWeight: 600 }}>{idx + 1}</td>
                            <td style={{ ...celda, fontWeight: 700 }}>{fila.paciente || 'Paciente'}</td>
                            <td style={{ ...celda, whiteSpace: 'nowrap' }}>{fila.cedula || '—'}</td>
                            <td style={celda}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '6px', background: atencion.bg, color: atencion.color }}>
                                        <Icono size={14} />
                                    </span>
                                    {atencion.texto}
                                </span>
                            </td>
                            <td style={celda}>{TIPO[fila.tipo] || fila.tipo || '—'}</td>
                            <td style={celda}>{fila.diagnostico || '—'}</td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    </div>
);

export default TablaAtencionesDia;
