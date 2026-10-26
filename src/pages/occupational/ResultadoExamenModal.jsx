import { useEffect, useRef, useState } from 'react';
import { CheckCircle, FileText, FileUp, Loader2, Search, Upload, X } from 'lucide-react';
import api from '../../api/axios';
import { formatFecha } from '../../utils/fecha';

// Igual que en el servidor (MedicinaOcupacionalController::MAX_RESULTADO_KB)
const MAX_PDF_BYTES = 10 * 1024 * 1024;

const nombreExamenes = (orden) => {
    const tipos = (orden.tipos_examen || orden.tiposExamen || []).map(t => t.tipo_examen?.detalle_tipo || t.tipoExamen?.detalle_tipo).filter(Boolean);
    const otros = (orden.otros || []).map(o => o.detalle_otro_examen).filter(Boolean);
    return [...tipos, ...otros].join(', ') || 'Exámenes ocupacionales';
};

/** Abre en otra pestaña un PDF del API que requiere el token (no hay URL pública del archivo). */
export const abrirPdfProtegido = async (ruta, mensajeError = 'No se pudo abrir el documento.') => {
    const pestana = window.open('', '_blank');
    try {
        const res = await api.get(ruta, { responseType: 'blob' });
        const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
        if (pestana) pestana.location.href = url;
        else window.location.assign(url);
        setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch {
        pestana?.close();
        alert(mensajeError);
    }
};

export const abrirResultadoPdf = (ordenId) =>
    abrirPdfProtegido(`/medicina-ocupacional/orden-examen/${ordenId}/resultado`, 'No se pudo abrir el resultado del examen.');

/**
 * Subir resultado de exámenes: el médico busca al paciente, ve sus órdenes que aún no tienen
 * el PDF de resultados y adjunta el archivo a la que corresponda.
 */
const ResultadoExamenModal = ({ onClose, onUploaded }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [patient, setPatient] = useState(null);
    const [ordenes, setOrdenes] = useState([]);
    const [loadingOrdenes, setLoadingOrdenes] = useState(false);
    const [subiendoId, setSubiendoId] = useState(null);
    const [errores, setErrores] = useState({});
    const [subidas, setSubidas] = useState([]);
    const inputs = useRef({});

    useEffect(() => {
        if (patient) return undefined;
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
    }, [searchTerm, patient]);

    const cargarOrdenes = async (p) => {
        setLoadingOrdenes(true);
        try {
            const res = await api.get('/medicina-ocupacional/orden-examen', { params: { id_usuario_paciente: p.id, sin_resultado: 1 } });
            setOrdenes(Array.isArray(res.data?.data) ? res.data.data : []);
        } catch {
            setOrdenes([]);
        } finally {
            setLoadingOrdenes(false);
        }
    };

    const selectPatient = (p) => {
        setPatient(p);
        setResults([]);
        setErrores({});
        setSubidas([]);
        cargarOrdenes(p);
    };

    const changePatient = () => {
        setPatient(null);
        setSearchTerm('');
        setOrdenes([]);
        setErrores({});
        setSubidas([]);
    };

    const adjuntar = async (orden, archivo) => {
        if (!archivo) return;
        const esPdf = archivo.type === 'application/pdf' || archivo.name.toLowerCase().endsWith('.pdf');
        const error = !esPdf ? 'Seleccione un archivo PDF.' : archivo.size > MAX_PDF_BYTES ? 'El PDF no puede superar los 10 MB.' : null;
        setErrores(prev => ({ ...prev, [orden.id]: error }));
        if (error) return;

        setSubiendoId(orden.id);
        try {
            const data = new FormData();
            data.append('archivo', archivo);
            await api.post(`/medicina-ocupacional/orden-examen/${orden.id}/resultado`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setOrdenes(prev => prev.filter(o => o.id !== orden.id));
            setSubidas(prev => [...prev, { id: orden.id, fecha: orden.fecha, examenes: nombreExamenes(orden), archivo: archivo.name }]);
            onUploaded?.();
        } catch (err) {
            const resp = err.response?.data;
            const mensaje = resp?.errors?.archivo?.[0] || resp?.message || 'No se pudo subir el archivo.';
            setErrores(prev => ({ ...prev, [orden.id]: mensaje }));
        } finally {
            setSubiendoId(null);
            if (inputs.current[orden.id]) inputs.current[orden.id].value = '';
        }
    };

    const nombrePaciente = patient ? (patient.nombre_completo || `${patient.nombres || ''} ${patient.apellidos || ''}`.trim()) : '';

    return (
        <div className="clinical-modal show">
            <div className="clinical-modal__backdrop" onClick={onClose}></div>
            <div className="clinical-modal__dialog clinical-modal__dialog--compact" role="dialog" aria-modal="true" aria-labelledby="resultado-examen-titulo" style={{ maxWidth: '720px' }}>
                <header className="clinical-modal__header">
                    <div className="clinical-modal__patient">
                        <div className="clinical-modal__avatar"><FileUp size={18} /></div>
                        <div>
                            <span style={{ textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>EXÁMENES OCUPACIONALES</span>
                            <h2 id="resultado-examen-titulo">Subir resultado de exámenes</h2>
                        </div>
                    </div>
                    <button aria-label="Cerrar" className="clinical-modal__close" onClick={onClose} type="button"><X size={16} /></button>
                </header>

                <div className="clinical-modal__body">
                    {/* 1. Paciente */}
                    <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary, #5a6e7f)', marginBottom: '6px' }}>
                        Paciente <span className="field-req-star">*</span>
                    </span>
                    {patient ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '10px', background: '#f0f9ff', border: '1px solid #bae6fd' }}>
                            <div>
                                <strong style={{ fontSize: '13px', color: '#0f172a' }}>{nombrePaciente}</strong>
                                <small style={{ display: 'block', color: '#64748b', fontSize: '11.5px' }}>Cédula: {patient.cedula}</small>
                            </div>
                            <button type="button" className="action-button" onClick={changePatient} style={{ fontSize: '11.5px', padding: '6px 12px' }}>Cambiar</button>
                        </div>
                    ) : (
                        <>
                            <div className="patient-search-input" style={{ margin: 0 }}>
                                <Search size={16} />
                                <input
                                    aria-label="Buscar paciente por cédula o nombre"
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Buscar por cédula o nombre..."
                                    autoFocus
                                />
                                {searching && <Loader2 size={16} className="spin-icon" />}
                            </div>
                            {results.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto', marginTop: '8px' }}>
                                    {results.map(p => (
                                        <button
                                            type="button"
                                            key={p.id}
                                            onClick={() => selectPatient(p)}
                                            style={{ textAlign: 'left', padding: '8px 12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                                        >
                                            <strong style={{ fontSize: '12.5px', color: '#0f172a' }}>{p.nombre_completo || `${p.nombres} ${p.apellidos}`}</strong>
                                            <small style={{ display: 'block', color: '#64748b', fontSize: '11px' }}>Cédula: {p.cedula}</small>
                                        </button>
                                    ))}
                                </div>
                            )}
                            {searchTerm.trim().length >= 2 && !searching && results.length === 0 && (
                                <small style={{ display: 'block', color: '#64748b', marginTop: '6px' }}>No se encontraron pacientes.</small>
                            )}
                        </>
                    )}

                    {/* 2. Órdenes pendientes de resultado */}
                    {patient && (
                        <div style={{ marginTop: '18px' }}>
                            <h3 style={{ margin: '0 0 4px', fontSize: '13.5px', color: 'var(--primary)', fontWeight: 800 }}>Órdenes pendientes de resultado</h3>
                            <p style={{ margin: '0 0 10px', fontSize: '11.5px', color: 'var(--text-muted)' }}>Adjunte el PDF del laboratorio a la orden que corresponda (máximo 10 MB).</p>

                            {loadingOrdenes ? (
                                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>Cargando órdenes...</div>
                            ) : ordenes.length === 0 ? (
                                <div role="status" style={{ padding: '18px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
                                    Este paciente no tiene órdenes de examen pendientes de resultado.
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {ordenes.map(orden => (
                                        <div key={orden.id} style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#ffffff' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                                <div style={{ minWidth: 0, flex: '1 1 260px' }}>
                                                    <strong style={{ display: 'block', fontSize: '12.5px', color: '#0f172a' }}>Orden N° {orden.id} · {formatFecha(orden.fecha)}</strong>
                                                    <small style={{ display: 'block', color: '#475569', fontSize: '11.5px', marginTop: '2px' }}>{nombreExamenes(orden)}</small>
                                                    {orden.observaciones && <small style={{ display: 'block', color: '#64748b', fontSize: '11px', marginTop: '2px' }}>{orden.observaciones}</small>}
                                                </div>
                                                <label
                                                    className="action-button action-button--accent"
                                                    style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: subiendoId ? 'wait' : 'pointer', fontSize: '11.5px', minHeight: '34px', padding: '0 12px', borderRadius: '8px', opacity: subiendoId && subiendoId !== orden.id ? 0.6 : 1 }}
                                                >
                                                    {subiendoId === orden.id ? <Loader2 size={14} className="spin-icon" /> : <Upload size={14} />}
                                                    {subiendoId === orden.id ? 'Subiendo...' : 'Adjuntar PDF'}
                                                    <input
                                                        ref={el => { inputs.current[orden.id] = el; }}
                                                        type="file"
                                                        accept="application/pdf,.pdf"
                                                        aria-label={`Adjuntar PDF de resultados a la orden ${orden.id}`}
                                                        disabled={Boolean(subiendoId)}
                                                        onChange={(e) => adjuntar(orden, e.target.files?.[0])}
                                                        style={{ position: 'absolute', width: '1px', height: '1px', opacity: 0, overflow: 'hidden' }}
                                                    />
                                                </label>
                                            </div>
                                            {errores[orden.id] && (
                                                <p role="alert" style={{ margin: '8px 0 0', color: '#b91c1c', fontSize: '11.5px', fontWeight: 600 }}>{errores[orden.id]}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {subidas.length > 0 && (
                                <div style={{ marginTop: '14px' }}>
                                    <h4 style={{ margin: '0 0 6px', fontSize: '12px', color: 'var(--success)', fontWeight: 800 }}>Resultados adjuntados</h4>
                                    {subidas.map(s => (
                                        <div key={s.id} role="status" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0', marginBottom: '6px' }}>
                                            <span style={{ fontSize: '11.5px', color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <CheckCircle size={14} /> Orden N° {s.id} · {s.archivo}
                                            </span>
                                            <button type="button" className="action-button action-button--light" onClick={() => abrirResultadoPdf(s.id)} style={{ fontSize: '11px', minHeight: '28px', padding: '0 10px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                                <FileText size={13} /> Ver PDF
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '18px', paddingTop: '14px', borderTop: '1px solid #e2e8f0' }}>
                        <button type="button" className="action-button action-button--light" onClick={onClose}>Cerrar</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResultadoExamenModal;
