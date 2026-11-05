import { useEffect, useState } from 'react';
import { FileSpreadsheet, Loader2, Save, Search, UserPlus, X } from 'lucide-react';
import api from '../../api/axios';
import { MATRICES, ensureCatalogId } from './matricesOcupacionales';
import { esCedulaValida, MENSAJE_CEDULA_INVALIDA } from '../../utils/cedula';
import DominioCorreoSelect from '../../components/DominioCorreoSelect';
import { DOMINIO_POR_DEFECTO, armarCorreo, separarCorreo } from '../../utils/correoInstitucional';

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

const NUEVO_PACIENTE_VACIO = { tipo_documento: 'cedula', cedula: '', nombre_completo: '', correo: '' };

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
    // Registro del paciente desde la matriz (p. ej. Personal Nuevo) cuando la búsqueda no lo encuentra
    const [nuevoPaciente, setNuevoPaciente] = useState(null);
    const [dominioPaciente, setDominioPaciente] = useState(DOMINIO_POR_DEFECTO);
    const [registrando, setRegistrando] = useState(false);
    const [errorRegistro, setErrorRegistro] = useState('');
    const pideCargo = config.fields.some(f => f.name === 'cargo');
    const cargoDefinido = patient?.tipo_usuario_confirmado !== false;
    // Campo que sale del tipo de usuario del perfil (p. ej. Tipo de servidor en Riesgo Psicosocial)
    const campoTipo = config.fields.find(f => f.deTipoUsuario);
    const tipoDelPerfil = (p) => (campoTipo && p && p.tipo_usuario_confirmado !== false ? campoTipo.deTipoUsuario[p.id_tipo_usuario] : undefined);
    const tipoDefinido = tipoDelPerfil(patient);

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
        if (campoTipo) setForm(prev => ({ ...prev, [campoTipo.name]: tipoDelPerfil(p) || '' }));
        if (!pideCargo) return;
        // El cargo se toma del sistema; si el paciente no lo definió, el médico lo elige de la lista
        const definido = p.tipo_usuario_confirmado !== false;
        setForm(prev => ({ ...prev, cargo: definido ? (p.puestoTrabajo || '') : '' }));
        setCargoTipo(!definido && TIPOS_TRABAJADOR.some(t => t.id === p.id_tipo_usuario) ? String(p.id_tipo_usuario) : '');
    };

    const abrirRegistro = () => {
        const termino = searchTerm.trim();
        setNuevoPaciente({ ...NUEVO_PACIENTE_VACIO, ...(/^\d+$/.test(termino) ? { cedula: termino } : { nombre_completo: termino }) });
        setErrorRegistro('');
    };

    const registrarPaciente = async () => {
        const datos = nuevoPaciente;
        setErrorRegistro('');
        if (!datos.cedula.trim() || !datos.nombre_completo.trim() || !datos.correo.trim()) {
            setErrorRegistro('Complete el documento, los nombres y apellidos y el correo.');
            return;
        }
        if (datos.tipo_documento !== 'pasaporte' && !esCedulaValida(datos.cedula.trim())) {
            setErrorRegistro(MENSAJE_CEDULA_INVALIDA);
            return;
        }
        const correo = armarCorreo(datos.correo, dominioPaciente);
        setRegistrando(true);
        try {
            const res = await api.post('/users/register-patient', {
                email: correo,
                cedula: datos.cedula.trim(),
                nombre_completo: datos.nombre_completo.trim(),
                tipo_documento: datos.tipo_documento
            });
            const d = res.data?.data || {};
            setNuevoPaciente(null);
            // Recién registrado: aún no tiene cargo, así que el médico lo elige como con cualquier paciente sin cargo
            selectPatient({
                id: d.id || d.id_usuario,
                nombres: [d.primer_nombre, d.segundo_nombre].filter(Boolean).join(' ') || d.nombre_completo,
                apellidos: [d.apellido_paterno, d.apellido_materno].filter(Boolean).join(' '),
                cedula: d.numero_cedula || datos.cedula.trim(),
                id_tipo_usuario: null,
                tipo_usuario_confirmado: false,
                puestoTrabajo: ''
            });
        } catch (err) {
            const data = err.response?.data;
            const firstError = data?.errors ? Object.values(data.errors)[0]?.[0] : null;
            setErrorRegistro(firstError || data?.message || 'No se pudo registrar al paciente.');
        } finally {
            setRegistrando(false);
        }
    };

    const changePatient = () => {
        setPatient(null);
        setSearchTerm('');
        setCargoTipo('');
        if (pideCargo) setForm(prev => ({ ...prev, cargo: '' }));
        if (campoTipo) setForm(prev => ({ ...prev, [campoTipo.name]: '' }));
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
        if (campoTipo && patient && !form[campoTipo.name]) {
            setError(`Seleccione el ${campoTipo.label.toLowerCase()} del paciente.`);
            return;
        }
        setSaving(true);
        try {
            let datos = form;
            if (campoTipo && patient && !tipoDefinido && patient.tipo_usuario_confirmado === false) {
                // Igual que el cargo: se guarda en el perfil para que las próximas matrices ya lo tengan
                const idTipo = Object.keys(campoTipo.deTipoUsuario).find(id => campoTipo.deTipoUsuario[id] === form[campoTipo.name]);
                const res = await api.put(`/medicina-ocupacional/patient/${patient.id}/tipo-trabajador`, { id_tipo_usuario: Number(idTipo) });
                setPatient(prev => ({ ...prev, tipo_usuario_confirmado: true, id_tipo_usuario: Number(idTipo), puestoTrabajo: res.data?.data?.puestoTrabajo || prev.puestoTrabajo }));
            }
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
                                    {searchTerm.trim().length >= 2 && !searching && results.length === 0 && !nuevoPaciente && (
                                        config.permiteRegistrarPaciente ? (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
                                                <small style={{ color: '#64748b' }}>No se encontraron pacientes con ese dato.</small>
                                                <button type="button" className="action-button" onClick={abrirRegistro} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}>
                                                    <UserPlus size={14} /> Registrar paciente nuevo
                                                </button>
                                            </div>
                                        ) : (
                                            <small style={{ display: 'block', color: '#64748b', marginTop: '6px' }}>
                                                No se encontraron pacientes. El paciente debe estar registrado en el sistema.
                                            </small>
                                        )
                                    )}
                                    {nuevoPaciente && (
                                        // Sin <form> anidado: Enter registra al paciente en lugar de enviar la matriz
                                        <div
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); registrarPaciente(); } }}
                                            style={{ marginTop: '10px', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc' }}
                                        >
                                            <strong style={{ display: 'block', fontSize: '12.5px', color: 'var(--primary)', marginBottom: '10px' }}>Registrar paciente nuevo</strong>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                                                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>
                                                    Tipo de documento
                                                    <select value={nuevoPaciente.tipo_documento} onChange={(e) => setNuevoPaciente(prev => ({ ...prev, tipo_documento: e.target.value }))} style={{ width: '100%', minHeight: '40px', padding: '0 12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '12.5px', boxSizing: 'border-box' }}>
                                                        <option value="cedula">Cédula</option>
                                                        <option value="pasaporte">Pasaporte</option>
                                                    </select>
                                                </label>
                                                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>
                                                    {nuevoPaciente.tipo_documento === 'pasaporte' ? 'Pasaporte' : 'Cédula'} <span className="field-req-star">*</span>
                                                    <input type="text" value={nuevoPaciente.cedula} maxLength={20} onChange={(e) => setNuevoPaciente(prev => ({ ...prev, cedula: e.target.value }))} style={{ width: '100%', minHeight: '40px', padding: '0 12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '12.5px', boxSizing: 'border-box' }} />
                                                </label>
                                                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', gridColumn: '1 / -1' }}>
                                                    Nombres y apellidos <span className="field-req-star">*</span>
                                                    <input type="text" value={nuevoPaciente.nombre_completo} placeholder="Ej: Juan Carlos Pérez López" onChange={(e) => setNuevoPaciente(prev => ({ ...prev, nombre_completo: e.target.value }))} style={{ width: '100%', minHeight: '40px', padding: '0 12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '12.5px', boxSizing: 'border-box' }} />
                                                </label>
                                                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', gridColumn: '1 / -1' }}>
                                                    Correo <span className="field-req-star">*</span>
                                                    <div style={{ display: 'flex', gap: '6px' }}>
                                                        <input type="text" value={nuevoPaciente.correo} placeholder="usuario" onChange={(e) => { const { usuario, dominio } = separarCorreo(e.target.value); setNuevoPaciente(prev => ({ ...prev, correo: usuario })); if (dominio) setDominioPaciente(dominio); }} style={{ flex: 1, minWidth: 0, minHeight: '40px', padding: '0 12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '12.5px', boxSizing: 'border-box' }} />
                                                        <DominioCorreoSelect value={dominioPaciente} onChange={setDominioPaciente} style={{ minHeight: '40px', padding: '0 8px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '12.5px' }} />
                                                    </div>
                                                </label>
                                            </div>
                                            <small style={{ display: 'block', color: '#64748b', fontSize: '11px', marginTop: '8px' }}>
                                                Se le enviará una contraseña temporal a ese correo.
                                            </small>
                                            {errorRegistro && (
                                                <p role="alert" style={{ margin: '10px 0 0', padding: '8px 10px', borderRadius: '8px', background: '#fef2f2', color: '#b91c1c', fontSize: '12px', fontWeight: 600 }}>{errorRegistro}</p>
                                            )}
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                                                <button type="button" className="action-button" onClick={() => setNuevoPaciente(null)} disabled={registrando}>Cancelar</button>
                                                <button type="button" className="action-button action-button--primary" onClick={registrarPaciente} disabled={registrando} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                    {registrando ? <Loader2 size={14} className="spin-icon" /> : <UserPlus size={14} />} Registrar paciente
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    <div className="clinical-fields-grid responsive-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {config.fields.filter(f => f.type !== 'checkbox').map(f => {
                            const style = f.full ? { gridColumn: '1 / -1' } : undefined;
                            const required = f.required || (f.name === 'cargo' && patient && !cargoDefinido);
                            const label = <>{f.label}{required && <> <span className="field-req-star">*</span></>}</>;
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
                                    ) : f.deTipoUsuario && !config.noPatient ? (
                                        !patient ? (
                                            <input type="text" value="" disabled placeholder="Seleccione primero el paciente" />
                                        ) : tipoDefinido ? (
                                            <>
                                                <input type="text" value={tipoDefinido} readOnly aria-readonly="true" style={{ background: '#f1f5f9', cursor: 'default' }} />
                                                <small style={{ color: '#64748b', fontSize: '11px' }}>Registrado en el sistema</small>
                                            </>
                                        ) : (
                                            <>
                                                <select value={form[f.name]} required onChange={(e) => setField(f.name, e.target.value)}>
                                                    <option value="">Seleccione...</option>
                                                    {f.options.map(opt => (
                                                        <option key={optionValue(opt)} value={optionValue(opt)}>{optionLabel(opt)}</option>
                                                    ))}
                                                </select>
                                                {patient.tipo_usuario_confirmado === false && (
                                                    <small style={{ color: '#64748b', fontSize: '11px' }}>El paciente no ha definido su tipo; se guardará en su perfil.</small>
                                                )}
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
                        {/* Las casillas van juntas en una fila propia, no repartidas entre las celdas */}
                        {config.fields.some(f => f.type === 'checkbox') && (
                            <div className="field" style={{ gridColumn: '1 / -1' }}>
                                <span>Pruebas y seguimiento</span>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                    {config.fields.filter(f => f.type === 'checkbox').map(f => (
                                        <label key={f.name} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 14px', border: `1px solid ${form[f.name] ? 'var(--primary)' : '#e2e8f0'}`, borderRadius: '10px', background: form[f.name] ? 'var(--primary-soft)' : '#fff', fontSize: '12.5px', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}>
                                            <input type="checkbox" checked={!!form[f.name]} onChange={(e) => setField(f.name, e.target.checked)} style={{ width: '16px', height: '16px', minHeight: 0, padding: 0, margin: 0, flexShrink: 0, accentColor: 'var(--primary)' }} />
                                            {f.label}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
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
