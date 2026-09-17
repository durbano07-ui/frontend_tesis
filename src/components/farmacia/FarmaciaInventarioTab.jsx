import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api/axios';
import {
    Pill,
    Search,
    Plus,
    Minus,
    History,
    Pencil,
    Power,
    AlertTriangle,
    CheckCircle2,
    Package,
    Boxes,
    Filter,
    X,
    FileSpreadsheet,
    Eye,
    TrendingUp,
    TrendingDown,
    ChevronDown
} from 'lucide-react';

const FarmaciaInventarioTab = ({ showSystemToast }) => {
    const [productos, setProductos] = useState([]);
    const [presentaciones, setPresentaciones] = useState([]);
    const [loading, setLoading] = useState(true);

    // Summary KPIs
    const [stats, setStats] = useState({
        totalProductos: 0,
        totalCajas: 0,
        totalUnidades: 0,
        totalBajoStock: 0
    });

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPresentacion, setSelectedPresentacion] = useState('');
    const [onlyLowStock, setOnlyLowStock] = useState(false);
    const [showInactive, setShowInactive] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false); // 'add' or 'subtract'
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    // Active Items for Modals
    const [selectedProducto, setSelectedProducto] = useState(null);
    const [historyLogs, setHistoryLogs] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [reportData, setReportData] = useState(null);

    // Form state for Create / Edit
    const [productForm, setProductForm] = useState({
        codigo: '',
        nombre: '',
        id_presentacion: '',
        stock_inicial_cajas: 0,
        stock_inicial_unidades: 0,
        descripcion: ''
    });
    const [formSaving, setFormSaving] = useState(false);

    // Form state for Add/Subtract Stock
    const [stockForm, setStockForm] = useState({
        type: 'add', // 'add' | 'subtract'
        cantidad_cajas: 0,
        cantidad_unidades: 0,
        descripcion: ''
    });
    const [stockSaving, setStockSaving] = useState(false);

    // Fetch catalog & presentations
    const fetchPresentaciones = async () => {
        try {
            const res = await api.get('/presentaciones');
            setPresentaciones(res.data.data || []);
        } catch (err) {
            console.error('Error cargando presentaciones:', err);
        }
    };

    const fetchProductos = async () => {
        setLoading(true);
        try {
            const res = await api.get('/farmacia', {
                params: {
                    search: searchQuery || undefined,
                    id_presentacion: selectedPresentacion || undefined,
                    low_stock: onlyLowStock ? true : undefined,
                    activo: showInactive ? undefined : true
                }
            });
            const data = res.data.data || [];
            setProductos(data);

            setStats({
                totalProductos: res.data.total_productos || data.length,
                totalCajas: res.data.total_cajas || data.reduce((acc, p) => acc + (p.stock_cajas || 0), 0),
                totalUnidades: res.data.total_unidades || data.reduce((acc, p) => acc + (p.stock_unidades || 0), 0),
                totalBajoStock: data.filter(p => (p.stock_cajas <= 10 || p.stock_unidades <= 10)).length
            });
        } catch (err) {
            console.error('Error cargando inventario de farmacia:', err);
            const status = err.response?.status;
            const detail = err.response?.data?.message;
            if (status === 403) {
                showSystemToast('Acceso restringido: El rol del usuario actual no tiene permiso de Farmacia.');
            } else {
                showSystemToast(`Error al cargar inventario: ${detail || 'Error de conexión con el servidor.'}`);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPresentaciones();
    }, []);

    useEffect(() => {
        fetchProductos();
    }, [searchQuery, selectedPresentacion, onlyLowStock, showInactive]);

    // Handle Create Product
    const handleOpenCreateModal = () => {
        setProductForm({
            codigo: `MED-${Math.floor(1000 + Math.random() * 9000)}`,
            nombre: '',
            id_presentacion: presentaciones[0]?.id || '',
            stock_inicial_cajas: 0,
            stock_inicial_unidades: 0,
            descripcion: ''
        });
        setIsCreateModalOpen(true);
    };

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        if (!productForm.nombre || !productForm.codigo || !productForm.id_presentacion) {
            showSystemToast('Por favor complete todos los campos obligatorios del producto.');
            return;
        }
        setFormSaving(true);
        try {
            await api.post('/farmacia', {
                codigo: productForm.codigo.trim(),
                nombre: productForm.nombre.trim(),
                id_presentacion: parseInt(productForm.id_presentacion),
                stock_inicial_cajas: parseInt(productForm.stock_inicial_cajas) || 0,
                stock_inicial_unidades: parseInt(productForm.stock_inicial_unidades) || 0,
                descripcion: productForm.descripcion
            });
            showSystemToast('Producto creado exitosamente en el inventario.');
            setIsCreateModalOpen(false);
            fetchProductos();
        } catch (err) {
            console.error('Error al crear producto:', err);
            const msg = err.response?.data?.message || 'Error al guardar producto.';
            showSystemToast(`Error: ${msg}`);
        } finally {
            setFormSaving(false);
        }
    };

    // Handle Edit Product
    const handleOpenEditModal = (producto) => {
        setSelectedProducto(producto);
        setProductForm({
            codigo: producto.codigo,
            nombre: producto.nombre,
            id_presentacion: producto.id_presentacion,
            stock_inicial_cajas: producto.stock_cajas,
            stock_inicial_unidades: producto.stock_unidades,
            descripcion: ''
        });
        setIsEditModalOpen(true);
    };

    const handleEditProduct = async (e) => {
        e.preventDefault();
        if (!productForm.nombre || !productForm.codigo || !productForm.id_presentacion) {
            showSystemToast('Complete los campos obligatorios.');
            return;
        }
        setFormSaving(true);
        try {
            await api.put(`/farmacia/${selectedProducto.id}`, {
                codigo: productForm.codigo.trim(),
                nombre: productForm.nombre.trim(),
                id_presentacion: parseInt(productForm.id_presentacion)
            });
            showSystemToast('Producto actualizado correctamente.');
            setIsEditModalOpen(false);
            fetchProductos();
        } catch (err) {
            console.error('Error al actualizar producto:', err);
            showSystemToast('No se pudo actualizar el producto.');
        } finally {
            setFormSaving(false);
        }
    };

    // Handle Toggle Disable/Enable
    const handleToggleActive = async (producto) => {
        try {
            if (producto.activo) {
                await api.patch(`/farmacia/${producto.id}/disable`);
                showSystemToast(`Producto "${producto.nombre}" deshabilitado.`);
            } else {
                await api.patch(`/farmacia/${producto.id}/enable`);
                showSystemToast(`Producto "${producto.nombre}" habilitado.`);
            }
            fetchProductos();
        } catch (err) {
            console.error('Error al cambiar estado de producto:', err);
            showSystemToast('No se pudo cambiar el estado del producto.');
        }
    };

    // Handle Stock Add/Subtract Modal
    const handleOpenStockModal = (producto, type) => {
        setSelectedProducto(producto);
        setStockForm({
            type, // 'add' or 'subtract'
            cantidad_cajas: 0,
            cantidad_unidades: 0,
            descripcion: ''
        });
        setIsStockModalOpen(true);
    };

    const handleSaveStockChange = async (e) => {
        e.preventDefault();
        const cajas = parseInt(stockForm.cantidad_cajas) || 0;
        const unidades = parseInt(stockForm.cantidad_unidades) || 0;

        if (cajas === 0 && unidades === 0) {
            showSystemToast('Debe ingresar al menos 1 caja o 1 unidad para realizar el movimiento.');
            return;
        }

        setStockSaving(true);
        try {
            const endpoint = stockForm.type === 'add'
                ? `/farmacia/${selectedProducto.id}/stock/add`
                : `/farmacia/${selectedProducto.id}/stock/subtract`;

            await api.post(endpoint, {
                cantidad_cajas: cajas,
                cantidad_unidades: unidades,
                descripcion: stockForm.descripcion || (stockForm.type === 'add' ? 'Ingreso de stock manual' : 'Egreso de stock manual')
            });

            showSystemToast(stockForm.type === 'add' ? 'Stock ingresado correctamente.' : 'Stock descontado correctamente.');
            setIsStockModalOpen(false);
            fetchProductos();
        } catch (err) {
            console.error('Error al actualizar stock:', err);
            const msg = err.response?.data?.message || 'Error al actualizar el stock.';
            showSystemToast(`Error: ${msg}`);
        } finally {
            setStockSaving(false);
        }
    };

    // Handle View Movement History
    const handleOpenHistoryModal = async (producto) => {
        setSelectedProducto(producto);
        setIsHistoryModalOpen(true);
        setHistoryLoading(true);
        try {
            const res = await api.get(`/farmacia/${producto.id}/history`);
            setHistoryLogs(res.data.data?.data || res.data.data || []);
        } catch (err) {
            console.error('Error cargando historial de movimientos:', err);
            showSystemToast('No se pudo cargar el historial de movimientos.');
        } finally {
            setHistoryLoading(false);
        }
    };

    // Handle Inventory Report
    const handleOpenReportModal = async () => {
        setIsReportModalOpen(true);
        try {
            const res = await api.get('/farmacia/inventory/report');
            setReportData(res.data.data);
        } catch (err) {
            console.error('Error cargando reporte de inventario:', err);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* HERO BANNER - ODONTOLOGIA STYLE */}
            <section className="page-hero">
                <div>
                    <span className="page-hero__label">
                        <Package size={14} style={{ marginRight: '6px', display: 'inline' }} /> Inventario y suministros
                    </span>
                    <h2>Gestión de Inventario y Medicamentos</h2>
                    <p>Control de existencias, administración del catálogo de productos y seguimiento de insumos en enfermería.</p>
                </div>
                <div className="page-hero__icon">
                    <Package size={34} />
                </div>
            </section>

            {/* KPIS ROW - ODONTOLOGIA STYLE */}
            <section className="psycho-kpis">
                <div className="psycho-kpi-card">
                    <div className="psycho-kpi-card__icon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                        <Pill size={20} />
                    </div>
                    <div className="psycho-kpi-card__info">
                        <span>Total Productos</span>
                        <strong>{stats.totalProductos}</strong>
                    </div>
                </div>

                <div className="psycho-kpi-card">
                    <div className="psycho-kpi-card__icon" style={{ background: stats.totalBajoStock > 0 ? '#fee2e2' : '#fef3c7', color: stats.totalBajoStock > 0 ? '#dc2626' : '#d97706' }}>
                        <AlertTriangle size={20} />
                    </div>
                    <div className="psycho-kpi-card__info">
                        <span>Stock Crítico / Bajo</span>
                        <strong style={{ color: stats.totalBajoStock > 0 ? '#dc2626' : 'inherit' }}>
                            {stats.totalBajoStock}
                        </strong>
                    </div>
                </div>

                <div className="psycho-kpi-card">
                    <div className="psycho-kpi-card__icon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                        <Package size={20} />
                    </div>
                    <div className="psycho-kpi-card__info">
                        <span>Stock Cajas</span>
                        <strong>{stats.totalCajas}</strong>
                    </div>
                </div>

                <div className="psycho-kpi-card">
                    <div className="psycho-kpi-card__icon" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                        <Boxes size={20} />
                    </div>
                    <div className="psycho-kpi-card__info">
                        <span>Stock Unidades</span>
                        <strong>{stats.totalUnidades}</strong>
                    </div>
                </div>
            </section>

            {/* MAIN CATALOG & TABLE - ODONTOLOGIA MODULE-GRID STYLE */}
            <section className="module-grid">
                <article className="nurse-card span-12">
                    <div className="nurse-card__header" style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border)', textAlign: 'left', alignItems: 'stretch' }}>
                        {/* TÍTULO Y CABECERA ALINEADOS A LA IZQUIERDA */}
                        <div style={{ textAlign: 'left', width: '100%' }}>
                            <span className="eyebrow" style={{ display: 'block', textAlign: 'left' }}>CATÁLOGO GENERAL</span>
                            <h3 style={{ textAlign: 'left', margin: '4px 0 0 0' }}>Inventario de Medicamentos e Insumos</h3>
                            <p style={{ textAlign: 'left', margin: '4px 0 0 0' }}>Supervisa las existencias actuales de cada producto en farmacia.</p>
                        </div>

                        {/* FILA 1: BUSCADOR EN SU PROPIA FILA */}
                        <div style={{ width: '100%', textAlign: 'left' }}>
                            <div className="patient-search-input" style={{ width: '100%', maxWidth: '100%' }}>
                                <Search size={16} />
                                <input
                                    type="text"
                                    placeholder="Buscar por código, nombre o presentación de medicamento..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* FILA 2: BOTONES ALINEADOS A LA IZQUIERDA (NUEVO PRODUCTO / VER REPORTE) Y FILTROS A LA DERECHA */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
                            {/* BOTONES ALINEADOS A LA IZQUIERDA */}
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'flex-start' }}>
                                <button
                                    type="button"
                                    className="action-button action-button--accent"
                                    onClick={handleOpenCreateModal}
                                >
                                    <Plus size={14} />
                                    <span>Nuevo Producto</span>
                                </button>
                                <button
                                    type="button"
                                    className="action-button action-button--outline"
                                    onClick={handleOpenReportModal}
                                    title="Ver Reporte General"
                                >
                                    <FileSpreadsheet size={14} />
                                    <span>Ver Reporte</span>
                                </button>
                            </div>

                            {/* BOTÓN Y MENÚ FLOTANTE DE FILTROS ALINEADO A LA DERECHA */}
                            <div style={{ position: 'relative', marginLeft: 'auto' }}>
                                <button
                                    type="button"
                                    className={`action-button ${showFilters ? 'action-button--primary' : 'action-button--outline'}`}
                                    onClick={() => setShowFilters(!showFilters)}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '8px 16px',
                                        borderRadius: '10px',
                                        fontWeight: '600',
                                        fontSize: '13px'
                                    }}
                                >
                                    <Filter size={15} />
                                    <span>Filtros</span>
                                    {((onlyLowStock ? 1 : 0) + (showInactive ? 1 : 0) + (selectedPresentacion ? 1 : 0)) > 0 && (
                                        <span style={{
                                            background: showFilters ? '#ffffff' : 'var(--primary)',
                                            color: showFilters ? 'var(--primary)' : '#ffffff',
                                            borderRadius: '50%',
                                            width: '18px',
                                            height: '18px',
                                            display: 'grid',
                                            placeItems: 'center',
                                            fontSize: '10.5px',
                                            fontWeight: 'bold',
                                            marginLeft: '2px'
                                        }}>
                                            {(onlyLowStock ? 1 : 0) + (showInactive ? 1 : 0) + (selectedPresentacion ? 1 : 0)}
                                        </span>
                                    )}
                                    <ChevronDown size={14} style={{ transform: showFilters ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease', marginLeft: '2px' }} />
                                </button>

                                {/* DROPDOWN FLOTANTE SUPERPUESTO (NO AGRANDA LA PÁGINA) */}
                                {showFilters && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 'calc(100% + 8px)',
                                        right: 0,
                                        zIndex: 100,
                                        width: '320px',
                                        background: '#ffffff',
                                        borderRadius: '14px',
                                        border: '1px solid #cbd5e1',
                                        boxShadow: '0 12px 28px -4px rgba(15,23,42,0.18), 0 4px 10px -2px rgba(15,23,42,0.08)',
                                        padding: '16px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '14px',
                                        animation: 'fadeIn 0.15s ease-in-out'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                                            <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                <Filter size={13} color="var(--primary)" /> Filtros Disponibles
                                            </span>
                                            {(onlyLowStock || showInactive || selectedPresentacion) && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setOnlyLowStock(false);
                                                        setShowInactive(false);
                                                        setSelectedPresentacion('');
                                                    }}
                                                    style={{ background: 'transparent', border: 'none', color: '#dc2626', fontSize: '11.5px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                >
                                                    <X size={13} /> Limpiar
                                                </button>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {/* Botón Filtro: Solo Stock Bajo */}
                                            <button
                                                type="button"
                                                onClick={() => setOnlyLowStock(!onlyLowStock)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justify: 'space-between',
                                                    width: '100%',
                                                    padding: '9px 12px',
                                                    borderRadius: '10px',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    border: onlyLowStock ? '1.5px solid #dc2626' : '1px solid #e2e8f0',
                                                    background: onlyLowStock ? '#fee2e2' : '#f8fafc',
                                                    color: onlyLowStock ? '#991b1b' : '#334155'
                                                }}
                                            >
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <AlertTriangle size={14} style={{ color: onlyLowStock ? '#dc2626' : '#94a3b8' }} />
                                                    Solo Stock Bajo / Crítico
                                                </span>
                                                {onlyLowStock && <span style={{ fontSize: '12px', fontWeight: 'bold' }}>✓</span>}
                                            </button>

                                            {/* Botón Filtro: Mostrar Deshabilitados */}
                                            <button
                                                type="button"
                                                onClick={() => setShowInactive(!showInactive)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justify: 'space-between',
                                                    width: '100%',
                                                    padding: '9px 12px',
                                                    borderRadius: '10px',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    border: showInactive ? '1.5px solid #475569' : '1px solid #e2e8f0',
                                                    background: showInactive ? '#f1f5f9' : '#f8fafc',
                                                    color: showInactive ? '#0f172a' : '#334155'
                                                }}
                                            >
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Power size={14} style={{ color: showInactive ? '#334155' : '#94a3b8' }} />
                                                    Incluir Deshabilitados
                                                </span>
                                                {showInactive && <span style={{ fontSize: '12px', fontWeight: 'bold' }}>✓</span>}
                                            </button>

                                            {/* Selector Filtro Presentación */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                                                <label style={{ fontSize: '11.5px', fontWeight: '600', color: '#64748b' }}>Filtrar por Presentación:</label>
                                                <select
                                                    value={selectedPresentacion}
                                                    onChange={(e) => setSelectedPresentacion(e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '8px 12px',
                                                        borderRadius: '8px',
                                                        border: '1px solid #cbd5e1',
                                                        fontSize: '12.5px',
                                                        background: '#ffffff',
                                                        fontWeight: '500',
                                                        color: '#1e293b',
                                                        outline: 'none'
                                                    }}
                                                >
                                                    <option value="">Todas las Presentaciones</option>
                                                    {presentaciones.map(p => (
                                                        <option key={p.id} value={p.id}>{p.nombre}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                            <div className="loading-spinner" style={{ margin: '0 auto 16px', width: '36px', height: '36px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                            <p style={{ fontSize: '14px' }}>Cargando inventario de medicamentos e insumos...</p>
                        </div>
                    ) : productos.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '14px' }}>
                            <Pill size={32} style={{ marginBottom: '10px', opacity: 0.4 }} />
                            <p>No se encontraron medicamentos en el inventario.</p>
                            <button className="action-button action-button--primary" style={{ marginTop: '10px', fontSize: '13px' }} onClick={handleOpenCreateModal}>
                                <Plus size={13} style={{ marginRight: '5px' }} /> Añadir primer producto
                            </button>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto', marginTop: '16px' }}>
                            <table className="daily-table" style={{ width: '100%' }}>
                                <thead>
                                    <tr>
                                        <th>Código / ID</th>
                                        <th>Nombre del Medicamento / Producto</th>
                                        <th>Presentación</th>
                                        <th>Estado de Inventario</th>
                                        <th style={{ textAlign: 'center' }}>Stock Cajas</th>
                                        <th style={{ textAlign: 'center' }}>Stock Unidades</th>
                                        <th style={{ textAlign: 'center' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productos.map((prod) => {
                                        const isLowCajas = prod.stock_cajas <= 10;
                                        const isLowUnidades = prod.stock_unidades <= 10;
                                        const isOut = prod.stock_cajas === 0 && prod.stock_unidades === 0;

                                        return (
                                            <tr key={prod.id} style={{ background: !prod.activo ? '#f8fafc' : isOut ? '#fff5f5' : (isLowCajas || isLowUnidades) ? '#fffbeb' : 'transparent' }}>
                                                <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                                                    #{prod.codigo}
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <strong style={{ fontSize: '13px', color: '#1e293b' }}>{prod.nombre}</strong>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '6px', background: '#f1f5f9', color: '#334155' }}>
                                                        {prod.presentacion?.nombre || 'General'}
                                                    </span>
                                                </td>
                                                <td>
                                                    {isOut ? (
                                                        <span style={{ fontSize: '10.5px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                            ● SIN STOCK (Agotado)
                                                        </span>
                                                    ) : (isLowCajas || isLowUnidades) ? (
                                                        <span style={{ fontSize: '10.5px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                            ▲ STOCK CRÍTICO
                                                        </span>
                                                    ) : (
                                                        <span style={{ fontSize: '10.5px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', background: '#dcfce7', color: '#166534', border: '1px solid #86efac', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                            ✓ DISPONIBLE
                                                        </span>
                                                    )}
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <strong style={{ color: isLowCajas ? '#dc2626' : 'var(--text-primary)' }}>
                                                        {prod.stock_cajas} cajas
                                                    </strong>
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <strong style={{ color: isLowUnidades ? '#dc2626' : 'var(--text-primary)' }}>
                                                        {prod.stock_unidades} uds.
                                                    </strong>
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                                                        {/* Ingreso Stock */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenStockModal(prod, 'add')}
                                                            style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', borderRadius: '6px', width: '28px', height: '28px', display: 'grid', placeItems: 'center', cursor: 'pointer' }}
                                                            title="Ingresar Stock (Suma)"
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                        {/* Egreso Stock */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenStockModal(prod, 'subtract')}
                                                            style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', borderRadius: '6px', width: '28px', height: '28px', display: 'grid', placeItems: 'center', cursor: 'pointer' }}
                                                            title="Egreso / Salida de Stock (Resta)"
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        {/* Edit */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenEditModal(prod)}
                                                            style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '6px', width: '28px', height: '28px', display: 'grid', placeItems: 'center', cursor: 'pointer' }}
                                                            title="Editar Información del Producto"
                                                        >
                                                            <Pencil size={14} />
                                                        </button>
                                                        {/* Toggle Active */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleToggleActive(prod)}
                                                            style={{ background: prod.activo ? '#fff7ed' : '#f1f5f9', border: prod.activo ? '1px solid #fed7aa' : '1px solid #cbd5e1', color: prod.activo ? '#ea580c' : '#64748b', borderRadius: '6px', width: '28px', height: '28px', display: 'grid', placeItems: 'center', cursor: 'pointer' }}
                                                            title={prod.activo ? 'Deshabilitar Producto' : 'Habilitar Producto'}
                                                        >
                                                            <Power size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </article>
            </section>

            {/* MODAL 1: NUEVO PRODUCTO */}
            {isCreateModalOpen && createPortal(
                <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(5px)', display: 'grid', placeItems: 'center', padding: '16px' }}>
                    <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '520px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                        <div style={{ background: 'var(--primary)', padding: '16px 20px', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Pill size={18} /> Registrar Nuevo Producto en Farmacia
                            </h3>
                            <button onClick={() => setIsCreateModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleCreateProduct} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>Código *</label>
                                    <input
                                        type="text"
                                        required
                                        value={productForm.codigo}
                                        onChange={(e) => setProductForm({ ...productForm, codigo: e.target.value })}
                                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>Presentación *</label>
                                    <select
                                        required
                                        value={productForm.id_presentacion}
                                        onChange={(e) => setProductForm({ ...productForm, id_presentacion: e.target.value })}
                                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                                    >
                                        <option value="">Seleccione...</option>
                                        {presentaciones.map(p => (
                                            <option key={p.id} value={p.id}>{p.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>Nombre del Medicamento / Producto *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej: Paracetamol 500mg"
                                    value={productForm.nombre}
                                    onChange={(e) => setProductForm({ ...productForm, nombre: e.target.value })}
                                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                <div>
                                    <label style={{ fontSize: '11.5px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>Stock Inicial (Cajas)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={productForm.stock_inicial_cajas}
                                        onChange={(e) => setProductForm({ ...productForm, stock_inicial_cajas: e.target.value })}
                                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '11.5px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>Stock Inicial (Unidades)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={productForm.stock_inicial_unidades}
                                        onChange={(e) => setProductForm({ ...productForm, stock_inicial_unidades: e.target.value })}
                                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>Descripción u Observaciones</label>
                                <textarea
                                    rows="2"
                                    placeholder="Notas opcionales..."
                                    value={productForm.descripcion}
                                    onChange={(e) => setProductForm({ ...productForm, descripcion: e.target.value })}
                                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', resize: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px', cursor: 'pointer' }}>Cancelar</button>
                                <button type="submit" disabled={formSaving} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                                    {formSaving ? 'Guardando...' : 'Guardar Producto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* MODAL 2: EDITAR PRODUCTO */}
            {isEditModalOpen && selectedProducto && createPortal(
                <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(5px)', display: 'grid', placeItems: 'center', padding: '16px' }}>
                    <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '480px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                        <div style={{ background: 'var(--primary)', padding: '16px 20px', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Pencil size={18} /> Editar Producto de Farmacia
                            </h3>
                            <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleEditProduct} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>Código *</label>
                                <input
                                    type="text"
                                    required
                                    value={productForm.codigo}
                                    onChange={(e) => setProductForm({ ...productForm, codigo: e.target.value })}
                                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>Nombre del Medicamento *</label>
                                <input
                                    type="text"
                                    required
                                    value={productForm.nombre}
                                    onChange={(e) => setProductForm({ ...productForm, nombre: e.target.value })}
                                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>Presentación *</label>
                                <select
                                    required
                                    value={productForm.id_presentacion}
                                    onChange={(e) => setProductForm({ ...productForm, id_presentacion: e.target.value })}
                                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                                >
                                    {presentaciones.map(p => (
                                        <option key={p.id} value={p.id}>{p.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                                <button type="button" onClick={() => setIsEditModalOpen(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px', cursor: 'pointer' }}>Cancelar</button>
                                <button type="submit" disabled={formSaving} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                                    {formSaving ? 'Guardando...' : 'Actualizar Datos'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* MODAL 3: INGRESO / EGRESO DE STOCK MANUAL */}
            {isStockModalOpen && selectedProducto && createPortal(
                <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(5px)', display: 'grid', placeItems: 'center', padding: '16px' }}>
                    <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '460px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                        <div style={{ background: stockForm.type === 'add' ? '#15803d' : '#b91c1c', padding: '16px 20px', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {stockForm.type === 'add' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                                {stockForm.type === 'add' ? 'Ingreso de Stock Manual' : 'Egreso / Salida de Stock'}
                            </h3>
                            <button onClick={() => setIsStockModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSaveStockChange} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12.5px' }}>
                                <strong style={{ color: '#0f172a' }}>{selectedProducto.nombre}</strong>
                                <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                                    Stock Actual: <b>{selectedProducto.stock_cajas} cajas</b> | <b>{selectedProducto.stock_unidades} unidades</b>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>Cantidad Cajas</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={stockForm.cantidad_cajas}
                                        onChange={(e) => setStockForm({ ...stockForm, cantidad_cajas: e.target.value })}
                                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>Cantidad Unidades</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={stockForm.cantidad_unidades}
                                        onChange={(e) => setStockForm({ ...stockForm, cantidad_unidades: e.target.value })}
                                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>Motivo / Justificación *</label>
                                <textarea
                                    required
                                    rows="2"
                                    placeholder={stockForm.type === 'add' ? 'Ej: Compra de lote nuevo / Donación' : 'Ej: Descarte por caducidad / Ajuste'}
                                    value={stockForm.descripcion}
                                    onChange={(e) => setStockForm({ ...stockForm, descripcion: e.target.value })}
                                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', resize: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                                <button type="button" onClick={() => setIsStockModalOpen(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px', cursor: 'pointer' }}>Cancelar</button>
                                <button type="submit" disabled={stockSaving} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: stockForm.type === 'add' ? '#15803d' : '#b91c1c', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                                    {stockSaving ? 'Procesando...' : (stockForm.type === 'add' ? 'Confirmar Ingreso' : 'Confirmar Egreso')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* MODAL 4: HISTORIAL DE MOVIMIENTOS */}
            {isHistoryModalOpen && selectedProducto && createPortal(
                <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(5px)', display: 'grid', placeItems: 'center', padding: '16px' }}>
                    <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '640px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                        <div style={{ background: 'var(--primary)', padding: '16px 20px', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <History size={18} /> Historial Auditable: {selectedProducto.nombre}
                            </h3>
                            <button onClick={() => setIsHistoryModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={18} /></button>
                        </div>
                        <div style={{ padding: '20px', maxHeight: '420px', overflowY: 'auto' }}>
                            {historyLoading ? (
                                <div style={{ textAlign: 'center', color: '#64748b', padding: '30px' }}>Cargando movimientos...</div>
                            ) : historyLogs.length === 0 ? (
                                <div style={{ textAlign: 'center', color: '#64748b', padding: '30px' }}>No hay movimientos registrados para este producto todavía.</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {historyLogs.map(log => {
                                        const isEntrada = log.tipo_movimiento === 'entrada';
                                        const isDespacho = log.tipo_movimiento === 'despacho';

                                        return (
                                            <div key={log.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px', fontSize: '12px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                                    <span style={{
                                                        padding: '3px 8px',
                                                        borderRadius: '6px',
                                                        fontWeight: '700',
                                                        fontSize: '11px',
                                                        textTransform: 'uppercase',
                                                        background: isEntrada ? '#dcfce7' : isDespacho ? '#eff6ff' : '#fee2e2',
                                                        color: isEntrada ? '#15803d' : isDespacho ? '#1d4ed8' : '#b91c1c'
                                                    }}>
                                                        {log.tipo_movimiento}
                                                    </span>
                                                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                                                        {new Date(log.created_at).toLocaleString('es-EC')}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '12px', fontWeight: '600', color: '#1e293b' }}>
                                                    <span>Cajas: {log.cantidad_cajas}</span>
                                                    <span>Unidades: {log.cantidad_unidades}</span>
                                                    <span style={{ color: '#64748b', fontWeight: 'normal', marginLeft: 'auto' }}>
                                                        Nuevos saldos: {log.stock_nuevo_cajas} cj. / {log.stock_nuevo_unidades} ud.
                                                    </span>
                                                </div>
                                                {log.descripcion && (
                                                    <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '4px', fontStyle: 'italic' }}>
                                                        "{log.descripcion}"
                                                    </div>
                                                )}
                                                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                                                    Responsable: {log.usuario?.name || 'Sistema / Enfermera'}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* MODAL 5: REPORTE DE INVENTARIO */}
            {isReportModalOpen && createPortal(
                <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(5px)', display: 'grid', placeItems: 'center', padding: '16px' }}>
                    <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '680px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                        <div style={{ background: 'var(--primary)', padding: '16px 20px', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FileSpreadsheet size={18} /> Reporte Consolidado de Inventario de Farmacia
                            </h3>
                            <button onClick={() => setIsReportModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={18} /></button>
                        </div>
                        <div style={{ padding: '20px', maxHeight: '500px', overflowY: 'auto' }}>
                            {reportData ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                                        <div>
                                            <small style={{ color: '#64748b', fontSize: '11px' }}>Total Ítems</small>
                                            <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{reportData.resumen?.total_productos}</div>
                                        </div>
                                        <div>
                                            <small style={{ color: '#64748b', fontSize: '11px' }}>Stock Cajas</small>
                                            <div style={{ fontSize: '18px', fontWeight: '800', color: '#2563eb' }}>{reportData.resumen?.total_cajas}</div>
                                        </div>
                                        <div>
                                            <small style={{ color: '#64748b', fontSize: '11px' }}>Stock Unidades</small>
                                            <div style={{ fontSize: '18px', fontWeight: '800', color: '#16a34a' }}>{reportData.resumen?.total_unidades}</div>
                                        </div>
                                    </div>

                                    <h4 style={{ margin: 0, fontSize: '13px', color: 'var(--primary)', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>Desglose por Presentación</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                                        {reportData.por_presentacion?.map((item, idx) => (
                                            <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 12px', background: '#ffffff' }}>
                                                <strong style={{ fontSize: '12px', color: '#1e293b', display: 'block' }}>{item.presentacion}</strong>
                                                <span style={{ fontSize: '11px', color: '#64748b' }}>{item.cantidad_productos} productos</span>
                                                <div style={{ fontSize: '11.5px', fontWeight: '600', color: '#334155', marginTop: '4px' }}>
                                                    {item.total_cajas} cajas / {item.total_unidades} uds.
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', color: '#64748b', padding: '30px' }}>Cargando reporte...</div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}

        </div>
    );
};

export default FarmaciaInventarioTab;
