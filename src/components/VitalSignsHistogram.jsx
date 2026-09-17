import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import './VitalSignsHistogram.css';
import {
    Activity,
    HeartPulse,
    Thermometer,
    Wind,
    Scale,
    BarChart3,
    TrendingUp,
    Filter,
    X,
    User,
    Calendar,
    Search,
    RefreshCw,
    UserCheck,
    AlertCircle,
    Info,
    LineChart as LineIcon
} from 'lucide-react';

const VITAL_CONFIGS = {
    pas: {
        id: 'pas',
        label: 'Presión Arterial (PAS / PAD)',
        shortLabel: 'Presión Art.',
        unit: 'mmHg',
        icon: HeartPulse,
        color: '#ef4444',
        colorSec: '#f97316',
        normalMin: 90,
        normalMax: 120,
        getValue: (r) => parseFloat(r.presion_arterial_sistolica),
        getValueSec: (r) => parseFloat(r.presion_arterial_diastolica),
        buckets: [
            { label: '< 90', min: 0, max: 89.9 },
            { label: '90 - 119', min: 90, max: 119.9 },
            { label: '120 - 129', min: 120, max: 129.9 },
            { label: '130 - 139', min: 130, max: 139.9 },
            { label: '≥ 140', min: 140, max: 999 }
        ]
    },
    fc: {
        id: 'fc',
        label: 'Frecuencia Cardíaca',
        shortLabel: 'FC',
        unit: 'bpm',
        icon: Activity,
        color: '#ec4899',
        normalMin: 60,
        normalMax: 100,
        getValue: (r) => parseInt(r.frecuencia_cardiaca),
        buckets: [
            { label: '< 60', min: 0, max: 59.9 },
            { label: '60 - 100', min: 60, max: 100 },
            { label: '101 - 120', min: 100.1, max: 120 },
            { label: '> 120', min: 120.1, max: 999 }
        ]
    },
    fr: {
        id: 'fr',
        label: 'Frecuencia Respiratoria',
        shortLabel: 'FR',
        unit: 'rpm',
        icon: Wind,
        color: '#06b6d4',
        normalMin: 12,
        normalMax: 20,
        getValue: (r) => parseInt(r.frecuencia_respiratoria),
        buckets: [
            { label: '< 12', min: 0, max: 11.9 },
            { label: '12 - 20', min: 12, max: 20 },
            { label: '21 - 25', min: 20.1, max: 25 },
            { label: '> 25', min: 25.1, max: 999 }
        ]
    },
    temp: {
        id: 'temp',
        label: 'Temperatura Corporal',
        shortLabel: 'Temp',
        unit: '°C',
        icon: Thermometer,
        color: '#eab308',
        normalMin: 36.1,
        normalMax: 37.2,
        getValue: (r) => parseFloat(r.temperatura),
        buckets: [
            { label: '< 36.0', min: 0, max: 35.99 },
            { label: '36.0 - 37.2', min: 36.0, max: 37.29 },
            { label: '37.3 - 37.9', min: 37.3, max: 37.99 },
            { label: '≥ 38.0', min: 38.0, max: 999 }
        ]
    },
    peso: {
        id: 'peso',
        label: 'Peso Corporal',
        shortLabel: 'Peso',
        unit: 'kg',
        icon: Scale,
        color: '#3b82f6',
        normalMin: 50,
        normalMax: 90,
        getValue: (r) => parseFloat(r.peso),
        buckets: [
            { label: '< 50', min: 0, max: 49.9 },
            { label: '50 - 69.9', min: 50, max: 69.9 },
            { label: '70 - 89.9', min: 70, max: 89.9 },
            { label: '≥ 90', min: 90, max: 999 }
        ]
    },
    imc: {
        id: 'imc',
        label: 'Índice de Masa Corporal',
        shortLabel: 'IMC',
        unit: 'kg/m²',
        icon: Scale,
        color: '#8b5cf6',
        normalMin: 18.5,
        normalMax: 24.9,
        getValue: (r) => {
            const peso = parseFloat(r.peso);
            const talla = parseFloat(r.talla);
            if (peso && talla && talla > 0) {
                const tallaMetro = talla > 3 ? talla / 100 : talla;
                return parseFloat((peso / (tallaMetro * tallaMetro)).toFixed(1));
            }
            return null;
        },
        buckets: [
            { label: '< 18.5', min: 0, max: 18.49 },
            { label: '18.5 - 24.9', min: 18.5, max: 24.99 },
            { label: '25.0 - 29.9', min: 25.0, max: 29.99 },
            { label: '≥ 30.0', min: 30.0, max: 999 }
        ]
    },
    spo2: {
        id: 'spo2',
        label: 'Saturación de Oxígeno',
        shortLabel: 'SpO2',
        unit: '%',
        icon: Wind,
        color: '#10b981',
        normalMin: 95,
        normalMax: 100,
        getValue: (r) => parseFloat(r.saturacion_oxigeno || r.spo2),
        buckets: [
            { label: '< 90', min: 0, max: 89.9 },
            { label: '90 - 94', min: 90, max: 94.9 },
            { label: '95 - 100', min: 95, max: 100 }
        ]
    }
};

const VitalSignsHistogram = ({
    patient = null,
    onClose = null,
    isInline = false,
    isOpen = true
}) => {
    // Estado del paciente seleccionado
    const [activePatient, setActivePatient] = useState(patient);
    const [showPatientSearch, setShowPatientSearch] = useState(!patient);

    // Estados de búsqueda de paciente
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState('');

    // Estados del gráfico
    const [selectedMetric, setSelectedMetric] = useState('pas');
    const [viewMode, setViewMode] = useState('line'); // 'line' (Gráfico de Líneas) | 'histogram' (Frecuencias)
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [hoveredPoint, setHoveredPoint] = useState(null);
    const [hoveredBucket, setHoveredBucket] = useState(null);

    useEffect(() => {
        if (patient) {
            setActivePatient(patient);
            setShowPatientSearch(false);
            fetchPatientHistory(patient);
        }
    }, [patient]);

    // Cargar todo el historial del paciente desde su primera cita
    const fetchPatientHistory = async (targetPatient) => {
        const patientId = targetPatient?.id_usuario || targetPatient?.id_usuario_paciente || targetPatient?.user_id || targetPatient?.id;
        if (!patientId) {
            setHistory([]);
            return;
        }

        setLoading(true);
        setError('');
        try {
            const params = { id_usuario_paciente: patientId };
            const [nurseRes, medRes] = await Promise.all([
                api.get('/enfermeria/signos-vitales', { params }).catch(() => ({ data: { data: [] } })),
                api.get('/medicina-general/signos-vitales', { params }).catch(() => ({ data: { data: [] } }))
            ]);

            const listNurse = (nurseRes.data && Array.isArray(nurseRes.data.data)) ? nurseRes.data.data : [];
            const listMed = (medRes.data && Array.isArray(medRes.data.data)) ? medRes.data.data : [];

            const combined = [...listNurse, ...listMed];
            combined.sort((a, b) => new Date(a.created_at || a.fecha) - new Date(b.created_at || b.fecha));

            setHistory(combined);
        } catch (err) {
            console.error("Error al cargar signos vitales:", err);
            setError("No se pudieron obtener las mediciones del paciente.");
        } finally {
            setLoading(false);
        }
    };

    // Búsqueda de pacientes por Cédula o Nombre
    const handleSearchPatients = async (queryVal) => {
        const query = queryVal.trim();
        setSearchQuery(queryVal);

        if (!query) {
            setSearchResults([]);
            setSearchError('');
            return;
        }

        setSearchLoading(true);
        setSearchError('');

        try {
            const res = await api.get('/users/search-by-cedula', {
                params: { cedula: query }
            });
            const data = res.data?.data;
            if (Array.isArray(data)) {
                setSearchResults(data);
                if (data.length === 0) setSearchError('No se encontraron pacientes.');
            } else if (data) {
                setSearchResults([data]);
            } else {
                setSearchResults([]);
                setSearchError('No se encontraron pacientes.');
            }
        } catch (err) {
            console.error("Error en búsqueda de paciente:", err);
            setSearchResults([]);
            setSearchError('No se encontró información del paciente.');
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSelectPatient = (p) => {
        setActivePatient(p);
        setShowPatientSearch(false);
        setSearchResults([]);
        setSearchQuery('');
        fetchPatientHistory(p);
    };

    const activeConfig = VITAL_CONFIGS[selectedMetric] || VITAL_CONFIGS.pas;
    const IconComp = activeConfig.icon;

    // Procesar todos los registros históricos del paciente desde la primera cita
    const validValues = useMemo(() => {
        const list = [];
        history.forEach((rec, idx) => {
            const val = activeConfig.getValue(rec);
            const valSec = activeConfig.getValueSec ? activeConfig.getValueSec(rec) : null;

            if (val !== null && val !== undefined && !isNaN(val)) {
                const dateRaw = rec.created_at || rec.fecha || `Cita ${idx + 1}`;
                const dateStr = typeof dateRaw === 'string' ? dateRaw.slice(0, 10) : dateRaw;

                list.push({
                    val,
                    valSec,
                    fecha: dateStr,
                    raw: rec,
                    index: idx + 1
                });
            }
        });
        return list;
    }, [history, selectedMetric, activeConfig]);

    // Estadísticas descriptivas
    const stats = useMemo(() => {
        if (validValues.length === 0) return { count: 0, mean: 0, min: 0, max: 0, latest: 0, firstDate: '---', latestDate: '---' };
        const nums = validValues.map(v => v.val);
        const sum = nums.reduce((a, b) => a + b, 0);
        const mean = parseFloat((sum / nums.length).toFixed(1));
        const min = Math.min(...nums);
        const max = Math.max(...nums);
        const latestObj = validValues[validValues.length - 1];
        const latest = latestObj.val;
        const firstDate = validValues[0].fecha;
        const latestDate = latestObj.fecha;

        return {
            count: nums.length,
            mean,
            min,
            max,
            latest,
            firstDate,
            latestDate
        };
    }, [validValues, activeConfig]);

    // Frecuencias para vista secundario (histograma de rangos)
    const bucketCounts = useMemo(() => {
        const counts = activeConfig.buckets.map(b => ({
            ...b,
            count: 0,
            percentage: 0
        }));

        validValues.forEach(item => {
            const found = counts.find(b => item.val >= b.min && item.val <= b.max);
            if (found) {
                found.count += 1;
            }
        });

        const total = validValues.length;
        counts.forEach(b => {
            b.percentage = total > 0 ? parseFloat(((b.count / total) * 100).toFixed(1)) : 0;
        });

        return counts;
    }, [validValues, activeConfig]);

    const maxBucketCount = useMemo(() => Math.max(...bucketCounts.map(b => b.count), 1), [bucketCounts]);

    // CÁLCULO DE COORDENADAS Y ESCALAS PARA EL GRÁFICO DE LÍNEAS (SVG)
    const lineChartData = useMemo(() => {
        if (validValues.length === 0) return null;

        const width = 680;
        const height = 250;
        const padding = { top: 35, right: 35, bottom: 50, left: 55 };

        const graphW = width - padding.left - padding.right;
        const graphH = height - padding.top - padding.bottom;

        const allVals = validValues.flatMap(v => v.valSec ? [v.val, v.valSec] : [v.val]);
        let yMin = Math.min(...allVals, activeConfig.normalMin);
        let yMax = Math.max(...allVals, activeConfig.normalMax);

        const rangeMargin = (yMax - yMin) * 0.18 || 5;
        yMin = Math.max(0, Math.floor(yMin - rangeMargin));
        yMax = Math.ceil(yMax + rangeMargin);

        if (yMin === yMax) yMax = yMin + 10;

        const getY = (val) => {
            return padding.top + graphH - ((val - yMin) / (yMax - yMin)) * graphH;
        };

        const getX = (idx) => {
            if (validValues.length === 1) return padding.left + graphW / 2;
            return padding.left + (idx / (validValues.length - 1)) * graphW;
        };

        const points = validValues.map((v, i) => ({
            x: getX(i),
            y: getY(v.val),
            val: v.val,
            valSec: v.valSec,
            fecha: v.fecha,
            item: v
        }));

        const pointsSec = validValues.some(v => v.valSec !== null && !isNaN(v.valSec))
            ? validValues.map((v, i) => ({
                x: getX(i),
                y: getY(v.valSec),
                val: v.valSec,
                fecha: v.fecha
            }))
            : null;

        let pathD = '';
        points.forEach((pt, i) => {
            pathD += i === 0 ? `M ${pt.x} ${pt.y}` : ` L ${pt.x} ${pt.y}`;
        });

        let areaD = pathD;
        if (points.length > 0) {
            const firstPt = points[0];
            const lastPt = points[points.length - 1];
            areaD += ` L ${lastPt.x} ${padding.top + graphH} L ${firstPt.x} ${padding.top + graphH} Z`;
        }

        let pathSecD = '';
        if (pointsSec) {
            pointsSec.forEach((pt, i) => {
                pathSecD += i === 0 ? `M ${pt.x} ${pt.y}` : ` L ${pt.x} ${pt.y}`;
            });
        }

        const yNormMin = getY(activeConfig.normalMin);
        const yNormMax = getY(activeConfig.normalMax);
        const normBandY = Math.min(yNormMin, yNormMax);
        const normBandHeight = Math.abs(yNormMin - yNormMax);

        const yTicks = [];
        const tickCount = 4;
        for (let i = 0; i <= tickCount; i++) {
            const tickVal = Math.round(yMin + ((yMax - yMin) / tickCount) * i);
            const tickY = getY(tickVal);
            yTicks.push({ val: tickVal, y: tickY });
        }

        const sliceW = validValues.length > 1 ? graphW / (validValues.length - 1) : graphW;

        return {
            width,
            height,
            padding,
            points,
            pointsSec,
            pathD,
            areaD,
            pathSecD,
            normBandY,
            normBandHeight,
            yTicks,
            graphW,
            graphH,
            sliceW
        };
    }, [validValues, activeConfig]);

    const xTicks = useMemo(() => {
        if (!lineChartData || lineChartData.points.length === 0) return [];
        const pts = lineChartData.points;
        const count = pts.length;

        const formatShortDate = (dStr) => {
            if (typeof dStr === 'string' && dStr.length >= 10) {
                return `${dStr.slice(8, 10)}/${dStr.slice(5, 7)}/${dStr.slice(2, 4)}`;
            }
            return dStr;
        };

        if (count <= 6) {
            return pts.map(p => ({ x: p.x, label: formatShortDate(p.fecha) }));
        }

        const step = (count - 1) / 4;
        const indices = [0, Math.round(step), Math.round(step * 2), Math.round(step * 3), count - 1];
        const uniqueIndices = [...new Set(indices)];
        return uniqueIndices.map(idx => {
            const p = pts[idx];
            return { x: p.x, label: formatShortDate(p.fecha) };
        });
    }, [lineChartData]);

    const contentJSX = (
        <div className="vitals-histogram-wrapper" style={{ fontFamily: 'var(--font-sans, system-ui, sans-serif)' }}>
            {/* BANNER DEL PACIENTE O PANEL DE BÚSQUEDA */}
            {showPatientSearch || !activePatient ? (
                <div className="vitals-search-box">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Search size={16} style={{ color: '#2563eb' }} />
                            Buscar Paciente Específico
                        </h4>
                        {activePatient && (
                            <button
                                type="button"
                                onClick={() => setShowPatientSearch(false)}
                                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                            >
                                Cancelar
                            </button>
                        )}
                    </div>
                    <div className="vitals-search-input-group">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Ingrese nombre completo o número de cédula del paciente..."
                            value={searchQuery}
                            onChange={(e) => handleSearchPatients(e.target.value)}
                            autoFocus
                        />
                        {searchLoading && <RefreshCw size={16} className="spin" style={{ position: 'absolute', right: '14px', color: '#2563eb' }} />}
                    </div>

                    {searchError && (
                        <p style={{ fontSize: '12.5px', color: '#ef4444', marginTop: '8px', marginBottom: 0, fontWeight: 500 }}>
                            {searchError}
                        </p>
                    )}

                    {searchResults.length > 0 && (
                        <div className="vitals-search-results">
                            {searchResults.map((p) => (
                                <div
                                    key={p.id_usuario || p.id}
                                    className="vitals-search-item"
                                    onClick={() => handleSelectPatient(p)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#dbeafe', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px' }}>
                                            {(p.nombre_completo || p.name || 'P')[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>{p.nombre_completo || p.name}</strong>
                                            <div style={{ fontSize: '11.5px', color: '#64748b', display: 'flex', gap: '8px' }}>
                                                <span>Cédula: <strong>{p.cedula || '---'}</strong></span>
                                                {p.tipo && <span>• Rol: <strong>{p.tipo}</strong></span>}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="action-button action-button--primary"
                                        style={{ padding: '6px 12px', fontSize: '12px', height: 'auto', borderRadius: '8px' }}
                                    >
                                        Seleccionar
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="vitals-patient-banner">
                    <div className="vitals-patient-info">
                        <div className="vitals-patient-avatar">
                            {(activePatient.nombre_completo || activePatient.name || 'P')[0].toUpperCase()}
                        </div>
                        <div className="vitals-patient-details">
                            <h4>{activePatient.nombre_completo || activePatient.name || 'Paciente Seleccionado'}</h4>
                            <div className="vitals-patient-badges">
                                <span className="vitals-badge vitals-badge--blue" style={{ color: '#0f172a', fontWeight: 700 }}>
                                    <UserCheck size={13} style={{ color: '#2563eb' }} /> {activePatient.cedula ? `C.I. ${activePatient.cedula}` : 'Sin Cédula'}
                                </span>
                                {activePatient.tipo && (
                                    <span className="vitals-badge vitals-badge--gray" style={{ color: '#0f172a', fontWeight: 700 }}>
                                        {activePatient.tipo}
                                    </span>
                                )}
                                {stats.count > 0 && (
                                    <span className="vitals-badge vitals-badge--gray" style={{ background: '#e0f2fe', color: '#0f172a', fontWeight: 700 }}>
                                        <Calendar size={13} style={{ color: '#2563eb' }} /> {stats.firstDate} a {stats.latestDate} ({stats.count} citas)
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="action-button action-button--light"
                        onClick={() => setShowPatientSearch(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 600, padding: '7px 12px', borderRadius: '10px' }}
                    >
                        <Search size={14} /> Cambiar paciente
                    </button>
                </div>
            )}

            {/* BARRA DE SELECCIÓN DE MÉTRICA Y MODO DE GRÁFICO */}
            <div className="vitals-filter-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <Filter size={15} style={{ color: '#2563eb' }} />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Signo Vital:</span>
                    <select
                        value={selectedMetric}
                        onChange={(e) => setSelectedMetric(e.target.value)}
                        style={{
                            padding: '7px 14px',
                            borderRadius: '10px',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            fontWeight: 700,
                            color: '#0f172a',
                            fontSize: '13.5px',
                            cursor: 'pointer',
                            outline: 'none'
                        }}
                    >
                        {Object.values(VITAL_CONFIGS).map(cfg => (
                            <option key={cfg.id} value={cfg.id}>
                                {cfg.label} ({cfg.unit})
                            </option>
                        ))}
                    </select>
                </div>

                {/* TOGGLE MODO DE VISUALIZACIÓN */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#e2e8f0', padding: '4px', borderRadius: '10px' }}>
                    <button
                        type="button"
                        onClick={() => setViewMode('line')}
                        style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            border: 'none',
                            background: viewMode === 'line' ? '#ffffff' : 'transparent',
                            color: viewMode === 'line' ? '#0f172a' : '#64748b',
                            fontWeight: 700,
                            fontSize: '12.5px',
                            cursor: 'pointer',
                            boxShadow: viewMode === 'line' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <LineIcon size={15} /> Gráfico de Líneas
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('histogram')}
                        style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            border: 'none',
                            background: viewMode === 'histogram' ? '#ffffff' : 'transparent',
                            color: viewMode === 'histogram' ? '#0f172a' : '#64748b',
                            fontWeight: 700,
                            fontSize: '12.5px',
                            cursor: 'pointer',
                            boxShadow: viewMode === 'histogram' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <BarChart3 size={15} /> Frecuencia (Histograma)
                    </button>
                </div>
            </div>

            {/* TARJETAS RESUMEN DE ESTADÍSTICAS DEL PACIENTE */}
            <div className="vitals-stats-grid">
                <div className="vitals-stat-card" style={{ borderLeft: `4px solid ${activeConfig.color}` }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Promedio Histórico</span>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                        {validValues.length > 0 ? `${stats.mean} ${activeConfig.unit}` : '---'}
                    </div>
                </div>

                <div className="vitals-stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Mínimo Registrado</span>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                        {validValues.length > 0 ? `${stats.min} ${activeConfig.unit}` : '---'}
                    </div>
                </div>

                <div className="vitals-stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Máximo Registrado</span>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                        {validValues.length > 0 ? `${stats.max} ${activeConfig.unit}` : '---'}
                    </div>
                </div>

                <div className="vitals-stat-card" style={{ borderLeft: '4px solid #10b981' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Última Lectura</span>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                        {validValues.length > 0 ? `${stats.latest} ${activeConfig.unit}` : '---'}
                    </div>
                </div>
            </div>

            {/* ÁREA PRINCIPAL: GRÁFICO DE LÍNEAS O HISTOGRAMA */}
            {loading ? (
                <div style={{ padding: '45px 0', textAlign: 'center', color: '#64748b' }}>
                    <RefreshCw className="spin" size={26} style={{ margin: '0 auto 8px auto', display: 'block', color: '#2563eb' }} />
                    <p style={{ fontSize: '13.5px', fontWeight: 500 }}>Cargando registros históricos del paciente...</p>
                </div>
            ) : !activePatient ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', background: '#fafafa', borderRadius: '16px', border: '2px dashed #cbd5e1' }}>
                    <Search size={36} style={{ color: '#94a3b8', marginBottom: '10px' }} />
                    <h4 style={{ margin: 0, color: '#1e293b', fontSize: '15px', fontWeight: 700 }}>Busca a un paciente para generar su evolución</h4>
                    <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>
                        Ingresa la cédula o nombre en el buscador superior para analizar su historial completo de signos vitales.
                    </p>
                </div>
            ) : validValues.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', background: '#fafafa', borderRadius: '16px', border: '2px dashed #cbd5e1' }}>
                    <Info size={36} style={{ color: '#94a3b8', marginBottom: '10px' }} />
                    <h4 style={{ margin: 0, color: '#1e293b', fontSize: '15px', fontWeight: 700 }}>Sin mediciones en el historial</h4>
                    <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>
                        El paciente <strong>{activePatient.nombre_completo || activePatient.name}</strong> aún no posee registros de <strong>{activeConfig.label}</strong> en sus consultas clínicas.
                    </p>
                </div>
            ) : viewMode === 'line' && lineChartData ? (
                /* VISTA 1: GRÁFICO DE LÍNEAS COMPLETO (DESDE LA PRIMERA CITA) */
                <div className="vitals-chart-container" style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                        <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <IconComp size={18} style={{ color: activeConfig.color }} />
                            Evolución de {activeConfig.label} ({validValues.length} citas registradas)
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11.5px', fontWeight: 600 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#059669' }}>
                                <span style={{ width: '10px', height: '10px', background: '#dcfce7', border: '1px solid #86efac', borderRadius: '3px', display: 'inline-block' }}></span>
                                Normal ({activeConfig.normalMin}-{activeConfig.normalMax} {activeConfig.unit})
                            </span>
                            {lineChartData.pointsSec && (
                                <>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: activeConfig.color }}>
                                        <span style={{ width: '12px', height: '3px', background: activeConfig.color, display: 'inline-block' }}></span>
                                        PAS (Sistólica)
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: activeConfig.colorSec }}>
                                        <span style={{ width: '12px', height: '3px', background: activeConfig.colorSec, display: 'inline-block' }}></span>
                                        PAD (Diastólica)
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* SVG CONTENEDOR DEL GRÁFICO DE LÍNEAS */}
                    <div style={{ width: '100%', overflowX: 'auto' }}>
                        <svg
                            viewBox={`0 0 ${lineChartData.width} ${lineChartData.height}`}
                            style={{ width: '100%', height: 'auto', minWidth: '550px', overflow: 'visible' }}
                        >
                            <defs>
                                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={activeConfig.color} stopOpacity="0.25" />
                                    <stop offset="100%" stopColor={activeConfig.color} stopOpacity="0.0" />
                                </linearGradient>
                            </defs>

                            {/* BANDA DE RANGO NORMAL (VERDE TRANSLÚCIDO) */}
                            <rect
                                x={lineChartData.padding.left}
                                y={lineChartData.normBandY}
                                width={lineChartData.graphW}
                                height={lineChartData.normBandHeight}
                                fill="#f0fdf4"
                                stroke="#bbf7d0"
                                strokeDasharray="3 3"
                                rx="4"
                            />

                            {/* LÍNEAS DE GRILLA Y EJE Y */}
                            {lineChartData.yTicks.map((t, idx) => (
                                <g key={idx}>
                                    <line
                                        x1={lineChartData.padding.left}
                                        y1={t.y}
                                        x2={lineChartData.width - lineChartData.padding.right}
                                        y2={t.y}
                                        stroke="#f1f5f9"
                                        strokeWidth="1"
                                    />
                                    <text
                                        x={lineChartData.padding.left - 8}
                                        y={t.y + 4}
                                        textAnchor="end"
                                        fontSize="11"
                                        fontWeight="600"
                                        fill="#64748b"
                                    >
                                        {t.val}
                                    </text>
                                </g>
                            ))}

                            {/* ÁREA RELLENA BAJO LA LÍNEA */}
                            <path d={lineChartData.areaD} fill="url(#lineGrad)" />

                            {/* LÍNEA PRINCIPAL */}
                            <path
                                d={lineChartData.pathD}
                                fill="none"
                                stroke={activeConfig.color}
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            {/* LÍNEA SECUNDARIA (e.g. PAD para Presión Arterial) */}
                            {lineChartData.pathSecD && (
                                <path
                                    d={lineChartData.pathSecD}
                                    fill="none"
                                    stroke={activeConfig.colorSec || '#f97316'}
                                    strokeWidth="3"
                                    strokeDasharray="5 3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            )}

                            {/* PUNTOS SECUNDARIOS (PAD) */}
                            {lineChartData.pointsSec && lineChartData.pointsSec.map((pt, i) => (
                                <circle
                                    key={`sec-${i}`}
                                    cx={pt.x}
                                    cy={pt.y}
                                    r="4"
                                    fill="#ffffff"
                                    stroke={activeConfig.colorSec || '#f97316'}
                                    strokeWidth="2"
                                />
                            ))}

                            {/* EJE X: MARCAS DE FECHA ESPACIADAS */}
                            {xTicks.map((tick, i) => (
                                <g key={`xtick-${i}`}>
                                    <line
                                        x1={tick.x}
                                        y1={lineChartData.padding.top + lineChartData.graphH}
                                        x2={tick.x}
                                        y2={lineChartData.padding.top + lineChartData.graphH + 5}
                                        stroke="#cbd5e1"
                                        strokeWidth="1.5"
                                    />
                                    <text
                                        x={tick.x}
                                        y={lineChartData.padding.top + lineChartData.graphH + 20}
                                        textAnchor="middle"
                                        fontSize="11"
                                        fontWeight="600"
                                        fill="#64748b"
                                    >
                                        {tick.label}
                                    </text>
                                </g>
                            ))}

                            {/* LÍNEA GUÍA VERTICAL AL HACER HOVER */}
                            {hoveredPoint && (
                                <line
                                    x1={hoveredPoint.x}
                                    y1={lineChartData.padding.top}
                                    x2={hoveredPoint.x}
                                    y2={lineChartData.padding.top + lineChartData.graphH}
                                    stroke="#2563eb"
                                    strokeWidth="1.5"
                                    strokeDasharray="4 3"
                                />
                            )}

                            {/* DIBUJAR PUNTOS VISUALES */}
                            {lineChartData.points.map((pt, i) => {
                                const isHovered = hoveredPoint === pt;
                                return (
                                    <g key={i}>
                                        {isHovered && (
                                            <circle
                                                cx={pt.x}
                                                cy={pt.y}
                                                r="9"
                                                fill={activeConfig.color}
                                                opacity="0.3"
                                            />
                                        )}
                                        <circle
                                            cx={pt.x}
                                            cy={pt.y}
                                            r={isHovered ? "6" : "4.5"}
                                            fill={isHovered ? "#ffffff" : activeConfig.color}
                                            stroke={activeConfig.color}
                                            strokeWidth={isHovered ? "3.5" : "2"}
                                        />
                                    </g>
                                );
                            })}

                            {/* ZONAS INVISIBLES DE HOVER */}
                            {lineChartData.points.map((pt, i) => {
                                const halfW = lineChartData.sliceW / 2;
                                return (
                                    <rect
                                        key={`hover-zone-${i}`}
                                        x={pt.x - halfW}
                                        y={lineChartData.padding.top}
                                        width={lineChartData.sliceW}
                                        height={lineChartData.graphH}
                                        fill="transparent"
                                        style={{ cursor: 'pointer' }}
                                        onMouseEnter={() => setHoveredPoint(pt)}
                                        onMouseLeave={() => setHoveredPoint(null)}
                                    />
                                );
                            })}

                            {/* FLOATING TOOLTIP DIRECTAMENTE SOBRE EL PUNTO HOVERED (SOLO CITA Y VALOR/UNIDAD) */}
                            {hoveredPoint && (() => {
                                const boxW = 125;
                                const boxH = 44;
                                let boxX = hoveredPoint.x - boxW / 2;
                                if (boxX < lineChartData.padding.left) boxX = lineChartData.padding.left;
                                if (boxX + boxW > lineChartData.width - lineChartData.padding.right) {
                                    boxX = lineChartData.width - lineChartData.padding.right - boxW;
                                }

                                let boxY = hoveredPoint.y - boxH - 10;
                                if (boxY < lineChartData.padding.top) {
                                    boxY = hoveredPoint.y + 12;
                                }

                                return (
                                    <g transform={`translate(${boxX}, ${boxY})`} style={{ pointerEvents: 'none' }}>
                                        {/* Sombra y Fondo */}
                                        <rect
                                            x="0"
                                            y="0"
                                            width={boxW}
                                            height={boxH}
                                            rx="8"
                                            fill="#0f172a"
                                            opacity="0.94"
                                        />
                                        {/* Fecha de la Cita con Icono Vectorial */}
                                        <g transform="translate(10, 6)">
                                            <rect x="0" y="2" width="11" height="10" rx="2" fill="none" stroke="#94a3b8" strokeWidth="1.2" />
                                            <line x1="0" y1="5" x2="11" y2="5" stroke="#94a3b8" strokeWidth="1.2" />
                                            <line x1="3" y1="0" x2="3" y2="3" stroke="#94a3b8" strokeWidth="1.2" />
                                            <line x1="8" y1="0" x2="8" y2="3" stroke="#94a3b8" strokeWidth="1.2" />
                                        </g>
                                        <text x="25" y="16" fill="#94a3b8" fontSize="10.5" fontWeight="600">
                                            Cita: {hoveredPoint.fecha}
                                        </text>
                                        {/* Valor del Signo Vital */}
                                        <text x="10" y="34" fill="#ffffff" fontSize="13.5" fontWeight="800">
                                            {hoveredPoint.val} {activeConfig.unit}
                                            {hoveredPoint.valSec !== null && hoveredPoint.valSec !== undefined && (
                                                <tspan fill="#fb923c"> / {hoveredPoint.valSec}</tspan>
                                            )}
                                        </text>
                                    </g>
                                );
                            })()}
                        </svg>
                    </div>

                    {/* LEYENDA INFORMATIVA EN LA PARTE INFERIOR */}
                    <div style={{ marginTop: '12px', padding: '10px 14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {hoveredPoint ? (
                            <div>
                                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                                    Cita #{hoveredPoint.item.index} ({hoveredPoint.fecha}): <strong>{hoveredPoint.val} {activeConfig.unit}</strong>
                                    {hoveredPoint.valSec !== null && hoveredPoint.valSec !== undefined && (
                                        <span style={{ color: '#ea580c', marginLeft: '6px' }}>/ {hoveredPoint.valSec} mmHg</span>
                                    )}
                                </span>
                            </div>
                        ) : (
                            <span style={{ fontSize: '12.5px', color: '#64748b', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Info size={14} /> Desliza el cursor sobre el gráfico para desplegar la ventana emergente con la fecha y valor exacto.
                            </span>
                        )}
                    </div>
                </div>
            ) : (
                /* VISTA 2: HISTOGRAMA DE FRECUENCIAS */
                <div className="vitals-chart-container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <BarChart3 size={18} style={{ color: activeConfig.color }} />
                            Distribución de Frecuencia ({validValues.length} lecturas en el historial)
                        </h4>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', background: '#f1f5f9', padding: '4px 10px', borderRadius: '20px' }}>
                            Rango normal: {activeConfig.normalMin} - {activeConfig.normalMax} {activeConfig.unit}
                        </span>
                    </div>

                    <div style={{ width: '100%', overflowX: 'auto' }}>
                        <div style={{ minWidth: '420px', height: '220px', display: 'flex', alignItems: 'flex-end', gap: '16px', padding: '20px 10px 32px 10px', borderBottom: '2px solid #cbd5e1', position: 'relative' }}>
                            {bucketCounts.map((b, idx) => {
                                const heightPercent = (b.count / maxBucketCount) * 100;
                                return (
                                    <div
                                        key={idx}
                                        onMouseEnter={() => setHoveredBucket(b)}
                                        onMouseLeave={() => setHoveredBucket(null)}
                                        style={{
                                            flex: 1,
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justify: 'flex-end',
                                            alignItems: 'center',
                                            position: 'relative',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <span style={{
                                            fontSize: '12px',
                                            fontWeight: 700,
                                            color: b.count > 0 ? '#0f172a' : '#94a3b8',
                                            marginBottom: '6px',
                                            transition: 'transform 0.2s',
                                            transform: hoveredBucket === b ? 'scale(1.15)' : 'none'
                                        }}>
                                            {b.count} ({b.percentage}%)
                                        </span>

                                        <div style={{
                                            width: '75%',
                                            height: `${Math.max(heightPercent, 5)}%`,
                                            background: b.count > 0 ? activeConfig.color : '#e2e8f0',
                                            borderRadius: '8px 8px 2px 2px',
                                            transition: 'all 0.3s ease',
                                            boxShadow: hoveredBucket === b ? `0 4px 12px ${activeConfig.color}66` : 'none',
                                            opacity: hoveredBucket && hoveredBucket !== b ? 0.45 : 1
                                        }} />

                                        <div style={{
                                            position: 'absolute',
                                            bottom: '-28px',
                                            fontSize: '11.5px',
                                            fontWeight: 700,
                                            color: '#475569',
                                            textAlign: 'center',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {b.label}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div style={{ marginTop: '20px', padding: '12px 14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {hoveredBucket ? (
                            <div>
                                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                                    Rango [{hoveredBucket.label} {activeConfig.unit}]
                                </span>
                                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                                    {hoveredBucket.count} medición(es) en todo el historial ({hoveredBucket.percentage}% del total)
                                </p>
                            </div>
                        ) : (
                            <span style={{ fontSize: '12.5px', color: '#64748b', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Info size={14} /> Coloque el cursor sobre una barra para consultar detalles del rango.
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

    if (isInline) {
        return contentJSX;
    }

    if (!isOpen) {
        return null;
    }

    return (
        <div className="clinical-modal show" style={{ zIndex: 1100 }}>
            <div className="clinical-modal__backdrop" onClick={onClose}></div>
            <div className="clinical-modal__dialog" style={{ maxWidth: '840px', width: '92vw' }}>
                <header className="clinical-modal__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#092347', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.12)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <LineIcon size={20} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: 700, color: '#ffffff' }}>
                                Evolución e Historial de Signos Vitales por Paciente
                            </h3>
                            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                                Seguimiento longitudinal en gráfico de líneas desde la primera cita médica.
                            </p>
                        </div>
                    </div>
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                background: 'rgba(255,255,255,0.15)',
                                border: 'none',
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: '#ffffff',
                                transition: 'background 0.2s'
                            }}
                        >
                            <X size={18} />
                        </button>
                    )}
                </header>

                <div className="clinical-modal__body" style={{ padding: '20px' }}>
                    {contentJSX}
                </div>

                <footer className="clinical-modal__actions" style={{ display: 'flex', justifyContent: 'flex-end', padding: '14px 20px', background: '#f8fafc', borderRadius: '0 0 16px 16px', borderTop: '1px solid #e2e8f0' }}>
                    <button
                        type="button"
                        className="action-button action-button--light"
                        onClick={onClose}
                    >
                        Cerrar
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default VitalSignsHistogram;
