import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api/axios';
import {
    Boxes,
    Plus,
    Pencil,
    Trash2,
    X,
    Search,
    CheckCircle2,
    FileText,
    Package
} from 'lucide-react';

const FarmaciaPresentacionesTab = ({ showSystemToast }) => {
    const [presentaciones, setPresentaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedPresentacion, setSelectedPresentacion] = useState(null);

    const [form, setForm] = useState({
        nombre: '',
        descripcion: ''
    });
    const [saving, setSaving] = useState(false);

    const fetchPresentaciones = async () => {
        setLoading(true);
        try {
            const res = await api.get('/presentaciones');
            setPresentaciones(res.data.data || []);
        } catch (err) {
            console.error('Error cargando presentaciones:', err);
            showSystemToast('Error al cargar catálogo de presentaciones.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPresentaciones();
    }, []);

    const filteredList = presentaciones.filter(p =>
        (p.nombre || '').toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        (p.descripcion || '').toLowerCase().includes(searchQuery.toLowerCase().trim())
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE) || 1;
    const currentPageSafe = Math.min(currentPage, totalPages);
    const paginatedItems = filteredList.slice((currentPageSafe - 1) * ITEMS_PER_PAGE, currentPageSafe * ITEMS_PER_PAGE);

    const handleOpenCreateModal = () => {
        setForm({ nombre: '', descripcion: '' });
        setIsCreateModalOpen(true);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.nombre.trim()) return;

        setSaving(true);
        try {
            await api.post('/presentaciones', {
                nombre: form.nombre.trim(),
                descripcion: form.descripcion
            });
            showSystemToast('Presentación guardada correctamente.');
            setIsCreateModalOpen(false);
            fetchPresentaciones();
        } catch (err) {
            console.error('Error creando presentación:', err);
            const msg = err.response?.data?.message || 'Error al guardar.';
            showSystemToast(`Error: ${msg}`);
        } finally {
            setSaving(false);
        }
    };

    const handleOpenEditModal = (p) => {
        setSelectedPresentacion(p);
        setForm({ nombre: p.nombre, descripcion: p.descripcion || '' });
        setIsEditModalOpen(true);
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        if (!form.nombre.trim() || !selectedPresentacion) return;

        setSaving(true);
        try {
            await api.put(`/presentaciones/${selectedPresentacion.id}`, {
                nombre: form.nombre.trim(),
                descripcion: form.descripcion
            });
            showSystemToast('Presentación actualizada.');
            setIsEditModalOpen(false);
            fetchPresentaciones();
        } catch (err) {
            console.error('Error editando presentación:', err);
            showSystemToast('No se pudo actualizar.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (p) => {
        if (!window.confirm(`¿Está seguro de eliminar la presentación "${p.nombre}"?`)) return;

        try {
            await api.delete(`/presentaciones/${p.id}`);
            showSystemToast(`Presentación "${p.nombre}" eliminada.`);
            fetchPresentaciones();
        } catch (err) {
            console.error('Error eliminando presentación:', err);
            showSystemToast('No se puede eliminar porque tiene productos asociados.');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* HERO HEADER */}
            <section className="page-hero">
                <div>
                    <span className="page-hero__label">
                        <Boxes size={14} style={{ marginRight: '6px', display: 'inline' }} /> Catálogo de Farmacia
                    </span>
                    <h2>Presentaciones de Medicamentos</h2>
                    <p>Gestione las formas farmacéuticas (blíster, ampolla, frasco, comprimidos) utilizadas para la dispensación de insumos.</p>
                </div>
                <div className="page-hero__icon">
                    <Boxes size={34} />
                </div>
            </section>

            {/* KPIS ROW */}
            <section className="psycho-kpis">
                <div className="psycho-kpi-card">
                    <div className="psycho-kpi-card__icon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                        <Boxes size={20} />
                    </div>
                    <div className="psycho-kpi-card__info">
                        <span>Tipos Registrados</span>
                        <strong>{presentaciones.length}</strong>
                    </div>
                </div>

                <div className="psycho-kpi-card">
                    <div className="psycho-kpi-card__icon" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                        <Package size={20} />
                    </div>
                    <div className="psycho-kpi-card__info">
                        <span>Formas Farmacéuticas</span>
                        <strong style={{ color: '#0369a1' }}>Estándar</strong>
                    </div>
                </div>

                <div className="psycho-kpi-card">
                    <div className="psycho-kpi-card__icon" style={{ background: '#dcfce7', color: '#166534' }}>
                        <CheckCircle2 size={20} />
                    </div>
                    <div className="psycho-kpi-card__info">
                        <span>Estado Catálogo</span>
                        <strong style={{ color: '#166534' }}>Operativo</strong>
                    </div>
                </div>
            </section>

            {/* MAIN DATA TABLE SECTION */}
            <section className="module-grid">
                <article className="nurse-card span-12">
                    <div className="nurse-card__header" style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border)', textAlign: 'left', alignItems: 'stretch' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
                            <div>
                                <span className="eyebrow" style={{ display: 'block', textAlign: 'left' }}>CATÁLOGO GENERAL</span>
                                <h3 style={{ textAlign: 'left', margin: '4px 0 0 0' }}>Formatos y Presentaciones Farmacéuticas</h3>
                                <p style={{ textAlign: 'left', margin: '4px 0 0 0' }}>Administre los nombres y descripciones de empaquetado del inventario médico.</p>
                            </div>
                            <button
                                type="button"
                                className="action-button action-button--primary"
                                onClick={handleOpenCreateModal}
                                style={{ gap: '6px' }}
                            >
                                <Plus size={16} />
                                <span>Nueva Presentación</span>
                            </button>
                        </div>

                        {/* Buscador a ancho completo */}
                        <div style={{ width: '100%', textAlign: 'left' }}>
                            <div className="patient-search-input" style={{ width: '100%', maxWidth: '100%' }}>
                                <Search size={16} />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre o descripción de la presentación..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* TABLA UNIFICADA */}
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                            <div className="loading-spinner" style={{ margin: '0 auto 16px', width: '36px', height: '36px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                            <p style={{ fontSize: '14px' }}>Cargando catálogo de presentaciones...</p>
                        </div>
                    ) : filteredList.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
                            <Boxes size={40} style={{ marginBottom: '10px', color: 'var(--text-muted)', opacity: 0.6 }} />
                            <p style={{ fontWeight: '700', margin: 0, fontSize: '15px', color: 'var(--text-primary)' }}>No hay presentaciones registradas</p>
                            <span style={{ fontSize: '12.5px' }}>Comience agregando una nueva presentación mediante el botón superior.</span>
                        </div>
                    ) : (
                        <>
                            <div style={{ overflowX: 'auto', marginTop: '16px' }}>
                                <table className="daily-table" style={{ width: '100%' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ width: '80px' }}>ID</th>
                                            <th>Nombre / Tipo de Presentación</th>
                                            <th>Descripción</th>
                                            <th style={{ textAlign: 'center', width: '120px' }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedItems.map((p) => (
                                            <tr key={p.id}>
                                                <td style={{ fontWeight: '700', color: 'var(--text-muted)', fontSize: '12px' }}>
                                                    #{p.id}
                                                </td>
                                                <td style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '13px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--primary-soft)', color: 'var(--primary)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                                                            <Boxes size={15} />
                                                        </div>
                                                        <span>{p.nombre}</span>
                                                    </div>
                                                </td>
                                                <td style={{ fontSize: '12.5px', color: '#475569' }}>
                                                    {p.descripcion || <em style={{ color: 'var(--text-muted)' }}>Sin descripción</em>}
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenEditModal(p)}
                                                            style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '8px', width: '28px', height: '28px', display: 'grid', placeItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                                                            title="Editar"
                                                        >
                                                            <Pencil size={14} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(p)}
                                                            style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', borderRadius: '8px', width: '28px', height: '28px', display: 'grid', placeItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
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

            {/* MODAL CREAR/EDITAR (PORTAL) */}
            {(isCreateModalOpen || isEditModalOpen) && createPortal(
                <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(5px)', display: 'grid', placeItems: 'center', padding: '16px' }}>
                    <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '440px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                        <div style={{ background: 'var(--primary)', padding: '16px 20px', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Boxes size={18} /> {isCreateModalOpen ? 'Nueva Presentación' : 'Editar Presentación'}
                            </h3>
                            <button onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={18} /></button>
                        </div>
                        <form onSubmit={isCreateModalOpen ? handleCreate : handleEdit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>Nombre *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej: Ampolla, Frasco, Blíster, Comprimido, etc."
                                    value={form.nombre}
                                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>Descripción</label>
                                <textarea
                                    rows="3"
                                    placeholder="Descripción breve..."
                                    value={form.descripcion}
                                    onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', resize: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                                <button type="button" onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px', cursor: 'pointer' }}>Cancelar</button>
                                <button type="submit" disabled={saving} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                                    {saving ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default FarmaciaPresentacionesTab;
