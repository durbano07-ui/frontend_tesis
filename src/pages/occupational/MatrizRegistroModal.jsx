import { useEffect, useState } from 'react';
import { FileSpreadsheet, Loader2, Save, Search, X } from 'lucide-react';
import api from '../../api/axios';
import { MATRICES, ensureCatalogId } from './matricesOcupacionales';

// Cargo que el médico puede asignar si el paciente no lo ha definido (ids de tipo_usuario)
const TIPOS_TRABAJADOR = [
    { id: 3, label: 'Personal Docente' },
    { id: 4, label: 'Personal Administrativo' },
    { id: 5, label: 'Código de Trabajo' },
];

const optionValue = (opt) => (typeof opt === 'string' ? opt : opt.value);
const optionLabel = (opt) => (typeof opt === 'string' ? opt : opt.label);

const buildInitialForm = (fields, today) => Object.fromEntries(fields.map(f => {
    if (f.type === 'checkbox') return [f.name, false];
    if (f.default !== undefined) return [f.name, f.default];
    if (f.type === 'date') return [f.name, today];
    return [f.name, ''];
}));

const MatrizRegistroModal = ({ matrizKey, today, onClose, onSaved }) => {
    const config = MATRICES[matrizKey];
    const [form, setForm] = useState(() => buildInitialForm(config.fields, today));
    const [patient, setPatient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    // Tipo de trabajador elegido por el médico cuando el paciente no tiene cargo definido
    const [cargoTipo, setCargoTipo] = useState('');
    const pideCargo = config.fields.some(f => f.name === 'cargo');
    const cargoDefinido = patient?.tipo_usuario_confirmado !== false;

    useEffect(() => {
        if (config.noPatient || patient) return undefined;
        const term = searchTerm.trim();
        if (term.length < 2) {
            setResults([]);
            return undefined;
        }
        const timer = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await api.get('/users/search-by-cedula', { params: { query: term, ambito: 'ocupacional' } });
                setResults(Array.isArray(res.data?.data) ? res.data.data : []);
            } catch {
                setResults([]);
            } finally {
                setSearching(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, patient, config.noPatient]);

    const selectPatient = (p) => {
        setPatient(p);
        setResults([]);
        if (!pideCargo) return;
        // El cargo se toma del sistema; si el paciente no lo definió, el médico lo elige de la lista
        const definido = p.tipo_usuario_confirmado !== false;
        setForm(prev => ({ ...prev, cargo: definido ? (p.puestoTrabajo || '') : '' }));
        setCargoTipo(!definido && TIPOS_TRABAJADOR.some(t => t.id === p.id_tipo_usuario) ? String(p.id_tipo_usuario) : '');
    };

    const changePatient = () => {
        setPatient(null);
        setSearchTerm('');
        setCargoTipo('');
        if (pideCargo) setForm(prev => ({ ...prev, cargo: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!config.noPatient && !patient?.id) {
            setError('Seleccione un paciente registrado en el sistema.');
            return;
        }
        if (pideCargo && patient && !cargoDefinido && !cargoTipo) {
            setError('Seleccione el cargo del paciente.');
            return;
        }
        setSaving(true);
        try {
            let datos = form;
            if (pideCargo && patient && !cargoDefinido) {
                // Se guarda en el perfil del paciente para que las próximas matrices ya lo tengan
                const res = await api.put(`/medicina-ocupacional/patient/${patient.id}/tipo-trabajador`, { id_tipo_usuario: Number(cargoTipo) });
                const puestoTrabajo = res.data?.data?.puestoTrabajo || '';
                setPatient(prev => ({ ...prev, tipo_usuario_confirmado: true, puestoTrabajo }));
                datos = { ...form, cargo: puestoTrabajo };
                setForm(datos);
            }
            const catalogId = config.catalog
                ? await ensureCatalogId(api, config.catalog, config.catalogValue(datos))
                : undefined;
            const payload = config.toPayload(datos, catalogId);
            if (!config.noPatient) payload.id_usuario_paciente = patient.id;
            await api.post(config.path, payload);
            onSaved();
        } catch (err) {
            const data = err.response?.data;
            const firstError = data?.errors ? Object.values(data.errors)[0]?.[0] : null;
            setError(firstError || data?.message || 'No se pudo conectar con el servidor.');
        } finally {
            setSaving(false);
        }
    };

    const setField = (name, value) => setForm(prev => ({ ...prev, [name]: value }));

    return (
        <div className="clinical-modal show">
            <div className="clinical-modal__backdrop" onClick={onClose}></div>
            <div className="clinical-modal__dialog clinical-modal__dialog--compact" style={{ maxWidth: '680px' }}>
                <header className="clinical-modal__header">
                    <div className="clinical-modal__patient">
                        <div className="clinical-modal__avatar"><FileSpreadsheet size={18} /></div>
                        <div>
                            <span style={{ textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>NUEVO REGISTRO DE MATRIZ</span>
                            <h2>{config.label}</h2>
                        </div>
                    </div>
                    <button aria-label="Cerrar" className="clinical-modal__close" onClick={onClose} type="button"><X size={16} /></button>
                </header>

                <form className="clinical-modal__body" onSubmit={handleSubmit}>
                    {!config.noPatient && (
                        <div style={{ marginBottom: '16px' }}>
                            <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary, #5a6e7f)', marginBottom: '6px' }}>
                                Paciente *
                            </span>
                            {patient ? (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '10px', background: '#f0f9ff', border: '1px solid #bae6fd' }}>
                                    <div>
                                        <strong style={{ fontSize: '13px', color: '#0f172a' }}>{patient.nombres} {patient.apellidos}</strong>
                                        <small style={{ display: 'block', color: '#64748b', fontSize: '11.5px' }}>Cédula: {patient.cedula}</small>
                                    </div>
                                    <button type="button" className="action-button" onClick={changePatient} style={{ fontSize: '11.5px', padding: '6px 12px' }}>
                                        Cambiar
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="patient-search-input" style={{ margin: 0 }}>
                                        <Search size={16} />
                                        <input
                                            aria-label="Buscar por cédula o nombre"
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Buscar por cédula o nombre..."
                                            autoFocus
                                        />
                                        {searching && <Loader2 size={16} className="spin-icon" />}
                                    </div>
                                    {results.length > 0 && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto', marginTop: '8px' }}>
                                            {results.map(p => (
                                                <button
                                                    type="button"
                                                    key={p.id || p.cedula}
                                                    onClick={() => selectPatient(p)}
                                                    style={{ textAlign: 'left', padding: '8px 12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                                                >
                                                    <strong style={{ fontSize: '12.5px', color: '#0f172a' }}>{p.nombres} {p.apellidos}</strong>
                                                    <small style={{ display: 'block', color: '#64748b', fontSize: '11px' }}>Cédula: {p.cedula}</small>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {searchTerm.trim().length >= 2 && !searching && results.length === 0 && (
                                        <small style={{ display: 'block', color: '#64748b', marginTop: '6px' }}>
                                            No se encontraron pacientes. El paciente debe estar registrado en el sistema.
                                        </small>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    <div className="clinical-fields-grid responsive-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {config.fields.map(f => {
                            const style = f.full ? { gridColumn: '1 / -1' } : undefined;
                            const required = f.required || (f.name === 'cargo' && patient && !cargoDefinido);
                            const label = <>{f.label}{required && <> <span className="field-req-star">*</span></>}</>;
                            if (f.type === 'checkbox') {
                                return (
                                    <label key={f.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}>
                                        <input type="checkbox" checked={!!form[f.name]} onChange={(e) => setField(f.name, e.target.checked)} />
                                        {f.label}
                                    </label>
                                );
                            }
                            return (
                                <label key={f.name} className="field" style={style}>
                                    <span>{label}</span>
                                    {f.name === 'cargo' && !config.noPatient ? (
                                        !patient ? (
                                            <input type="text" value="" disabled placeholder="Seleccione primero el paciente" />
                                        ) : cargoDefinido ? (
                                            <>
                                                <input type="text" value={form.cargo} readOnly aria-readonly="true" style={{ background: '#f1f5f9', cursor: 'default' }} />
                                                <small style={{ color: '#64748b', fontSize: '11px' }}>Registrado en el sistema</small>
                                            </>
                                        ) : (
                                            <>
                                                <select value={cargoTipo} required onChange={(e) => setCargoTipo(e.target.value)}>
                                                    <option value="">Seleccione el cargo...</option>
                                                    {TIPOS_TRABAJADOR.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                                                </select>
                                                <small style={{ color: '#64748b', fontSize: '11px' }}>El paciente no ha definido su cargo; se guardará en su perfil.</small>
                                            </>
                                        )
                                    ) : f.type === 'select' ? (
                                        <select value={form[f.name]} required={f.required} onChange={(e) => setField(f.name, e.target.value)}>
                                            {f.options.map(opt => (
                                                <option key={optionValue(opt)} value={optionValue(opt)}>{optionLabel(opt)}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type={f.type}
                                            value={form[f.name]}
                                            required={f.required}
                                            min={f.min}
                                            max={f.max}
                                            placeholder={f.placeholder}
                                            onChange={(e) => setField(f.name, e.target.value)}
                                        />
                                    )}
                                </label>
                            );
                        })}
                    </div>

                    {error && (
                        <p role="alert" style={{ margin: '14px 0 0', padding: '10px 12px', borderRadius: '8px', background: '#fef2f2', color: '#b91c1c', fontSize: '12px', fontWeight: 600 }}>
                            {error}
                        </p>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '18px', paddingTop: '14px', borderTop: '1px solid #e2e8f0' }}>
                        <button type="button" className="action-button" onClick={onClose} disabled={saving}>Cancelar</button>
                        <button type="submit" className="action-button action-button--accent" disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            {saving ? <Loader2 size={15} className="spin-icon" /> : <Save size={15} />} Guardar registro
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MatrizRegistroModal;
