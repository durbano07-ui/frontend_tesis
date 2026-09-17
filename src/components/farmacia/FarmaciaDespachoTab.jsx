import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
    PackageCheck,
    Search,
    CheckCircle2,
    Clock,
    Stethoscope,
    Pill,
    FileText,
    Boxes,
    Check,
    AlertCircle
} from 'lucide-react';

const FarmaciaDespachoTab = ({ showSystemToast, onDespachoUpdated }) => {
    const [recetasPendientes, setRecetasPendientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [processingId, setProcessingId] = useState(null);
    const ITEMS_PER_PAGE = 10;

    const fetchPendientes = async () => {
        setLoading(true);
        try {
            const res = await api.get('/receta-farmacia/pendientes-despacho');
            const data = res.data.data || [];
            setRecetasPendientes(data);
            if (onDespachoUpdated) {
                onDespachoUpdated(data.length);
            }
        } catch (err) {
            console.error('Error cargando recetas pendientes:', err);
            showSystemToast('Error al cargar recetas de farmacia.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendientes();
    }, []);

    // Aplanar líneas de receta
    const allLines = [];
    recetasPendientes.forEach((receta) => {
        const paciente = receta.paciente || {};
        const pIdent = paciente.datos_identificacion || {};
        const patientName = `${pIdent.primer_nombre || ''} ${pIdent.apellido_paterno || ''}`.trim() || paciente.name || 'Paciente';
        const patientCedula = pIdent.numero_cedula || 'Sin cédula';
        const doctorName = receta.medico?.name || 'Médico General';

        (receta.lineas || []).forEach((linea) => {
            allLines.push({
                linea,
                receta,
                patientName,
                patientCedula,
                doctorName
            });
        });
    });

    const filteredItems = allLines.filter((item) => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;
        return (
            item.patientName.toLowerCase().includes(query) ||
            item.patientCedula.toLowerCase().includes(query) ||
            (item.linea.detalle_medicamento || '').toLowerCase().includes(query) ||
            item.doctorName.toLowerCase().includes(query)
        );
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE) || 1;
    const currentPageSafe = Math.min(currentPage, totalPages);
    const paginatedItems = filteredItems.slice((currentPageSafe - 1) * ITEMS_PER_PAGE, currentPageSafe * ITEMS_PER_PAGE);

    // Confirmar entrega física directa al paciente
    const handleConfirmEntregaFisica = async (lineaId) => {
        setProcessingId(lineaId);
        try {
            await api.post(`/receta-farmacia/linea-receta/${lineaId}/despachar`, {
                cantidad_cajas: 0,
                cantidad_unidades: 1,
                observaciones: 'Entrega física confirmada al paciente por enfermería.'
            });

            showSystemToast('✓ Medicamento entregado físicamente al paciente con éxito.');
            fetchPendientes();
        } catch (err) {
            console.error('Error al registrar entrega física:', err);
            const msg = err.response?.data?.message || 'No se pudo registrar la entrega física.';
            showSystemToast(`Error: ${msg}`);
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* HERO HEADER */}
            <section className="page-hero">
                <div>
                    <span className="page-hero__label">
                        <PackageCheck size={14} style={{ marginRight: '6px', display: 'inline' }} /> Farmacia & Enfermería
                    </span>
                    <h2>Despacho y Entrega de Recetas Médicas</h2>
                    <p>Las recetas prescritas por los médicos cuentan con despacho automático de inventario. Confirme la entrega física al paciente.</p>
                </div>
                <div className="page-hero__icon">
                    <PackageCheck size={34} />
                </div>
            </section>

            {/* KPIS ROW */}
            <section className="psycho-kpis">
                <div className="psycho-kpi-card">
                    <div className="psycho-kpi-card__icon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                        <FileText size={20} />
                    </div>
                    <div className="psycho-kpi-card__info">
                        <span>Recetas Prescritas</span>
                        <strong>{recetasPendientes.length}</strong>
                    </div>
                </div>

                <div className="psycho-kpi-card">
                    <div className="psycho-kpi-card__icon" style={{ background: '#dcfce7', color: '#15803d' }}>
                        <Boxes size={20} />
                    </div>
                    <div className="psycho-kpi-card__info">
                        <span>Despacho Automático</span>
                        <strong style={{ color: '#15803d' }}>Automático</strong>
                    </div>
                </div>

                <div className="psycho-kpi-card">
                    <div className="psycho-kpi-card__icon" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                        <Pill size={20} />
                    </div>
                    <div className="psycho-kpi-card__info">
                        <span>Pendientes de Entrega</span>
                        <strong>{allLines.filter(i => i.linea.estado_despacho !== 'despachado').length}</strong>
                    </div>
                </div>
            </section>

            {/* MAIN DATA TABLE SECTION */}
            <section className="module-grid">
                <article className="nurse-card span-12">
                    <div className="nurse-card__header" style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border)', textAlign: 'left', alignItems: 'stretch' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
                            <div>
                                <span className="eyebrow" style={{ display: 'block', textAlign: 'left' }}>CONTROL DE ENTREGAS FÍSICAS</span>
                                <h3 style={{ textAlign: 'left', margin: '4px 0 0 0' }}>Módulo de Entrega Física de Recetas Médicas</h3>
                                <p style={{ textAlign: 'left', margin: '4px 0 0 0' }}>Consulte la prescripción activa y entregue los medicamentos físicamente al paciente.</p>
                            </div>
                            <button
                                type="button"
                                className="action-button action-button--outline"
                                onClick={fetchPendientes}
                                style={{ gap: '6px' }}
                            >
                                <Clock size={15} />
                                <span>Actualizar Lista</span>
                            </button>
                        </div>

                        {/* Buscador a ancho completo */}
                        <div style={{ width: '100%', textAlign: 'left' }}>
                            <div className="patient-search-input" style={{ width: '100%', maxWidth: '100%' }}>
                                <Search size={16} />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre de paciente, cédula o medicamento prescrito..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* TABLA UNIFICADA DE ENTREGAS */}
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                            <div className="loading-spinner" style={{ margin: '0 auto 16px', width: '36px', height: '36px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                            <p style={{ fontSize: '14px' }}>Cargando recetas para entrega física...</p>
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
                            <CheckCircle2 size={40} style={{ marginBottom: '10px', color: 'var(--success)', opacity: 0.8 }} />
                            <p style={{ fontWeight: '700', margin: 0, fontSize: '15px', color: 'var(--text-primary)' }}>No hay entregas pendientes</p>
                            <span style={{ fontSize: '12.5px' }}>Todos los medicamentos prescritos han sido entregados físicamente a los pacientes.</span>
                        </div>
                    ) : (
                        <>
                            <div style={{ overflowX: 'auto', marginTop: '16px' }}>
                                <table className="daily-table" style={{ width: '100%' }}>
                                    <thead>
                                        <tr>
                                            <th>Fecha Emisión</th>
                                            <th>Paciente</th>
                                            <th>Médico Prescriptor</th>
                                            <th>Medicamento Prescrito</th>
                                            <th>Dosis & Frecuencia</th>
                                            <th>Despacho Inventario</th>
                                            <th>Entrega Física</th>
                                            <th style={{ textAlign: 'center' }}>Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedItems.map(({ linea, receta, patientName, patientCedula, doctorName }) => {
                                            const isEntregado = linea.estado_despacho === 'despachado';
                                            const isCurrentProcessing = processingId === linea.id;

                                            return (
                                                <tr key={linea.id}>
                                                    <td style={{ fontWeight: '600', color: 'var(--text-muted)', fontSize: '12px' }}>
                                                        {new Date(receta.created_at || Date.now()).toLocaleDateString('es-EC')}
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-soft)', color: 'var(--primary)', display: 'grid', placeItems: 'center', fontWeight: 'bold', fontSize: '12px', flexShrink: 0 }}>
                                                                {patientName.slice(0, 2).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <strong style={{ fontSize: '13px', color: '#1e293b', display: 'block' }}>{patientName}</strong>
                                                                <small style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Cédula: {patientCedula}</small>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#334155' }}>
                                                            <Stethoscope size={14} style={{ color: 'var(--primary)' }} />
                                                            <span>{doctorName}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '13px' }}>
                                                        {linea.detalle_medicamento}
                                                        {linea.producto && (
                                                            <span style={{ display: 'block', fontSize: '11px', color: '#0284c7', fontWeight: '600', marginTop: '2px' }}>
                                                                ✓ Insumo: {linea.producto.nombre}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td style={{ fontSize: '12px', color: '#475569' }}>
                                                        <div>{linea.detalle_dosis} ({linea.detalle_via_administracion || 'Oral'})</div>
                                                        <small style={{ color: 'var(--text-muted)' }}>Cada {linea.frecuencia_horas}h por {linea.duracion_tratamiento_dias} días</small>
                                                    </td>
                                                    <td>
                                                        <span style={{ fontSize: '10.5px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                            ✓ AUTOMÁTICO
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {isEntregado ? (
                                                            <span style={{ fontSize: '10.5px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', background: '#dcfce7', color: '#166534', border: '1px solid #86efac', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                                ✓ ENTREGADO
                                                            </span>
                                                        ) : (
                                                            <span style={{ fontSize: '10.5px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                                ● PENDIENTE
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        {!isEntregado ? (
                                                            <button
                                                                type="button"
                                                                className="action-button action-button--accent"
                                                                onClick={() => handleConfirmEntregaFisica(linea.id)}
                                                                disabled={isCurrentProcessing}
                                                                style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '8px', minHeight: '34px', gap: '6px' }}
                                                            >
                                                                <CheckCircle2 size={15} />
                                                                <span>{isCurrentProcessing ? 'Entregando...' : 'Confirmar Entrega'}</span>
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                className="action-button"
                                                                disabled
                                                                style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '8px', minHeight: '32px', opacity: 0.6, background: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1' }}
                                                            >
                                                                <Check size={14} />
                                                                <span>Entregado</span>
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {totalPages > 1 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '20px' }}>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPageSafe === 1}
                                        style={{
                                            fontSize: '11.5px',
                                            fontWeight: 'bold',
                                            padding: '6px 14px',
                                            borderRadius: '8px',
                                            border: '1px solid var(--border)',
                                            background: currentPageSafe === 1 ? '#f1f5f9' : 'white',
                                            color: currentPageSafe === 1 ? 'var(--text-muted)' : 'var(--primary)',
                                            cursor: currentPageSafe === 1 ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        ← Anterior
                                    </button>

                                    <span style={{ fontSize: '11.5px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                                        Página {currentPageSafe} de {totalPages}
                                    </span>

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPageSafe === totalPages}
                                        style={{
                                            fontSize: '11.5px',
                                            fontWeight: 'bold',
                                            padding: '6px 14px',
                                            borderRadius: '8px',
                                            border: '1px solid var(--border)',
                                            background: currentPageSafe === totalPages ? '#f1f5f9' : 'white',
                                            color: currentPageSafe === totalPages ? 'var(--text-muted)' : 'var(--primary)',
                                            cursor: currentPageSafe === totalPages ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        Siguiente →
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </article>
            </section>
        </div>
    );
};

export default FarmaciaDespachoTab;
