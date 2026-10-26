import React, { useState, useEffect, useRef } from 'react';
import { esCedulaValida, MENSAJE_CEDULA_INVALIDA } from '../../utils/cedula';
import useAutoRefresh from '../../hooks/useAutoRefresh';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import api from '../../api/axios';
import '../../medical.css';
import HelpPanel from '../../components/HelpPanel';
import UserProfileMenu from '../../components/UserProfileMenu';
import NotificationMenu from '../../components/NotificationMenu';
import { useClinicalDraft } from '../../hooks/useClinicalDraft';
import { LAB_EXAM_CATEGORIES } from '../../data/labExamsData';
import logoUeb from '../../assets/ueb.webp';
import { logoBienestar } from '../../assets/logoBienestarBase64.js';
import { logoUebTexto } from '../../assets/logoUebTextoBase64.js';
import OfficialFichaIngresoModal, { printOfficialIngresoForm, compileOfficialIngresoFormHtml } from './OfficialFichaIngresoModal';
import OfficialFichaRetiroModal, { printOfficialRetiroForm, compileOfficialRetiroFormHtml } from './OfficialFichaRetiroModal';
import OfficialFichaReintegroModal, { printOfficialReintegroForm, compileOfficialReintegroFormHtml } from './OfficialFichaReintegroModal';
import MatrizRegistroModal from './MatrizRegistroModal';
import { MATRICES, buildExamenesPeriodicosByYear, buildVulnerablesByGroup } from './matricesOcupacionales';

const uebBannerLogo = logoUeb;

// Fecha local YYYY-MM-DD (toISOString usa UTC y en Ecuador adelanta un día desde las 19:00)
const localDateStr = (d = new Date()) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

import { Menu, LogOut, Search, X, FileText, Plus, Calendar, ChevronRight, ChevronDown, ChevronUp, FlaskConical, Activity, ClipboardList, CheckCircle, AlertTriangle, Stethoscope, User, UserPlus, Shield, ShieldAlert, CalendarCheck, CalendarDays, Info, TrendingUp, HeartHandshake, HeartPulse, Brain, Printer, FileCheck, FileSpreadsheet, MapPin, Clock, UserCheck, UserX, Mail, BarChart3, Pill, Trash2, Briefcase, RefreshCw, Upload, AlertOctagon, Building2, Loader2 } from 'lucide-react';
import VitalSignsHistogram from '../../components/VitalSignsHistogram';
import { onKeyActivate } from '../../a11y/keyboard';
import { escapeHtml } from '../../utils/escapeHtml';
import { compileRecetaFormHtmlString } from './reports/recetaTemplate';
import { clasificarTipoPaciente, esPersonalAdministrativo, getEstudioCarrera } from '../../utils/tipoPaciente';
import { formatFecha } from '../../utils/fecha';
import { VIAS_ADMINISTRACION, viaDeProducto } from '../../utils/viasAdministracion';

const COUNTRIES = [
    'Ecuador', 'Colombia', 'Perú', 'Venezuela', 'Argentina', 'Chile', 'Bolivia', 'Brasil',
    'Uruguay', 'Paraguay', 'México', 'España', 'Estados Unidos', 'Canadá', 'Otro'
];

const JOB_POSITIONS = [
    'Analista de Sistemas',
    'Docente Tiempo Completo',
    'Docente Investigador',
    'Técnico de Laboratorio',
    'Asistente Administrativo/a',
    'Mantenimiento General',
    'Secretario/a General',
    'Operario de Bodega',
    'Director/a de Departamento',
    'Conserje / Servicios Generales',
    'Guardia de Seguridad',
    'Coordinador/a Académico/a',
    'Otro Puesto'
];

const DEPARTMENTS = [
    'Tecnologías de Información (TICs)',
    'Facultad de Ciencias de la Salud',
    'Talento Humano',
    'Mantenimiento y Planta Física',
    'Facultad de Ingeniería',
    'Vicerrectorado Académico',
    'Bodega e Inventario',
    'Secretaría General',
    'Biblioteca Central',
    'Financiero y Contabilidad',
    'Otra Área / Departamento'
];

// Tipo de ficha ocupacional: clave en el servidor <-> etiqueta del formulario
const TIPO_FICHA_LABEL = { ingreso: 'Ingreso', periodico: 'Periódico', retiro: 'Retiro', reintegro: 'Reintegro', gestante: 'Gestante', discapacidad: 'Discapacidad' };
const TIPO_FICHA_CLAVE = Object.fromEntries(Object.entries(TIPO_FICHA_LABEL).map(([k, v]) => [v, k]));

// Tipos de atención del parte diario: mismos íconos y colores que en Psicología
const TIPOS_ATENCION_DIARIO = {
    primaria: { texto: 'Atención Primaria', Icon: HeartHandshake, bg: 'var(--primary-soft)', color: 'var(--primary)' },
    secundaria: { texto: 'Atención Subsecuente', Icon: TrendingUp, bg: 'var(--accent-soft)', color: 'var(--accent)' },
    certificadomedico: { texto: 'Certificado Médico', Icon: FileCheck, bg: '#fef3c7', color: '#a55a05' },
    validacion: { texto: 'Validación', Icon: CheckCircle, bg: '#e9f8f2', color: 'var(--success)' },
};

// Signos vitales obligatorios en la atención ocupacional: [nombre, mínimo, máximo]
const RANGOS_SIGNOS_OCUPACIONAL = {
    paSystolic: ['la PA sistólica', 60, 250],
    paDiastolic: ['la PA diastólica', 30, 150],
    fc: ['la frecuencia cardiaca', 30, 220],
    fr: ['la frecuencia respiratoria', 8, 60],
    temp: ['la temperatura', 34, 43],
    talla: ['la talla', 50, 250],
    peso: ['el peso', 2, 300],
    spo2: ['la saturación SpO2', 50, 100],
};

export default function MedicoOcupacionalPage() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    const handleLogoutClick = () => {
        setConfirmModal({
            show: true,
            title: 'Cerrar Sesión',
            message: '¿Está seguro de que desea cerrar la sesión?',
            onConfirm: () => {
                logout();
                navigate('/login');
            }
        });
    };

    // Responsive Mobile Sidebar Toggle
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Active Navigation Tabs
    // 'atencion' | 'ficha' | 'reintegro' | 'examenes' | 'recetas' | 'vigilancia' | 'citas' | 'reportes'
    const [activeTab, setActiveTab] = useState('atencion');

    // Sub-tabs
    const [fichaSubTab, setFichaSubTab] = useState('ingreso'); // 'ingreso' | 'cese' | 'reintegro'
    const [vigilanciaSubTab, setVigilanciaSubTab] = useState('vacunas'); // 'vacunas' | 'ausentismo' | 'accidentes'
    const [reportSubTab, setReportSubTab] = useState('diario');

    // Stepper state for Consulta Médica
    const [consultaActiveStep, setConsultaActiveStep] = useState(0);

    // Modals state
    const [isPatientSearchOpen, setIsPatientSearchOpen] = useState(false);
    const [isPatientRegisterOpen, setIsPatientRegisterOpen] = useState(false);
    const [isHistogramModalOpen, setIsHistogramModalOpen] = useState(false);
    const [isConsultaModalOpen, setIsConsultaModalOpen] = useState(false);
    const [isReintegroModalOpen, setIsReintegroModalOpen] = useState(false);
    const [isReintegroDetailModalOpen, setIsReintegroDetailModalOpen] = useState(false);
    const [selectedReintegroDetail, setSelectedReintegroDetail] = useState(null);
    const [isReportMatrixModalOpen, setIsReportMatrixModalOpen] = useState(false);
    const [isIngresoDetailModalOpen, setIsIngresoDetailModalOpen] = useState(false);
    const [selectedIngresoDetail, setSelectedIngresoDetail] = useState(null);
    const [isRetiroDetailModalOpen, setIsRetiroDetailModalOpen] = useState(false);
    const [selectedRetiroDetail, setSelectedRetiroDetail] = useState(null);

    const printHtmlDocument = (htmlContent, title = 'Informe Oficial UEB') => {
        try {
            let iframe = document.getElementById('printable-hidden-frame');
            if (!iframe) {
                iframe = document.createElement('iframe');
                iframe.id = 'printable-hidden-frame';
                // Marco oculto solo para imprimir: con título (WCAG 4.1.2) y fuera del orden de tabulación
                iframe.title = 'Documento para impresión';
                iframe.setAttribute('aria-hidden', 'true');
                iframe.tabIndex = -1;
                iframe.style.position = 'fixed';
                iframe.style.right = '0';
                iframe.style.bottom = '0';
                iframe.style.width = '0';
                iframe.style.height = '0';
                iframe.style.border = '0';
                iframe.style.opacity = '0';
                iframe.style.pointerEvents = 'none';
                document.body.appendChild(iframe);
            }
            iframe.contentWindow.document.open();
            iframe.contentWindow.document.write(htmlContent);
            iframe.contentWindow.document.close();
            setTimeout(() => {
                try {
                    iframe.contentWindow.focus();
                    iframe.contentWindow.print();
                } catch (e) {
                    console.error('Error al imprimir mediante iframe:', e);
                }
            }, 350);
            return;
        } catch (err) {
            console.warn('Error al imprimir documento:', err);
        }
    };

    const printIframeDocument = (iframeRef, getFallbackHtml) => {
        const iframe = iframeRef?.current;
        if (iframe && iframe.contentWindow) {
            try {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
                return;
            } catch (err) {
                console.warn('Direct print from visible iframe failed:', err);
            }
        }
        if (getFallbackHtml) {
            printHtmlDocument(getFallbackHtml());
        }
    };
    const [isExamModalOpen, setIsExamModalOpen] = useState(false);
    const [isFichaModalOpen, setIsFichaModalOpen] = useState(false);
    const [activeActionModal, setActiveActionModal] = useState(null);
    const [viewingRecord, setViewingRecord] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null });
    const [patientSearchTarget, setPatientSearchTarget] = useState('consulta'); // 'consulta' | 'exam'

    // Patient & Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [patientSearchTerm, setPatientSearchTerm] = useState('');
    const [isSearchingPatients, setIsSearchingPatients] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [patientSelected, setPatientSelected] = useState(null);
    const [patientId, setPatientId] = useState('');

    // Clinical Draft Hook
    const { isOffline, saveDraft, loadDraft, clearDraft, draftLastSaved } = useClinicalDraft('ocupacional', user?.id, patientId);

    // Vital Signs State
    const [vitalSigns, setVitalSigns] = useState({
        paSystolic: '',
        paDiastolic: '',
        fc: '',
        fr: '',
        temp: '',
        spo2: '',
        peso: '',
        talla: '',
        imc: '',
        glucosa: ''
    });

    // Medical Form State
    const [tipoFicha, setTipoFicha] = useState('Ingreso');
    const [tipoAtencion, setTipoAtencion] = useState('primaria');
    const [motivoConsulta, setMotivoConsulta] = useState('');
    const [enfermedadActual, setEnfermedadActual] = useState('');
    const [antecedentesPersonales, setAntecedentesPersonales] = useState('');
    const [antecedentesOcupacionales, setAntecedentesOcupacionales] = useState('');
    const [puestoTrabajo, setPuestoTrabajo] = useState('');
    const [areaTrabajo, setAreaTrabajo] = useState('');
    const [factoresRiesgo, setFactoresRiesgo] = useState([]);
    const [examenFisico, setExamenFisico] = useState('');
    const [diagnosticoCie, setDiagnosticoCie] = useState('');
    const [aptitudLaboral, setAptitudLaboral] = useState('apto'); // 'apto' | 'apto_restriccion' | 'no_apto'
    const [restriccionesOcupacionales, setRestriccionesOcupacionales] = useState('');
    const [planTratamiento, setPlanTratamiento] = useState('');
    const [consultaErrores, setConsultaErrores] = useState({});

    // Form: New Patient
    const [newPatientForm, setNewPatientForm] = useState({
        nombre_completo: '',
        tipo_documento: 'cedula',
        cedula: '',
        pais_origen: '',
        id_tipo_usuario: 4,
        correo: ''
    });
    const [registerLoading, setRegisterLoading] = useState(false);
    const [registerError, setRegisterError] = useState('');

    // Form: New Reintegro
    const [reintegroForm, setReintegroForm] = useState({
        pacienteCedula: '',
        pacienteNombre: '',
        puesto: '',
        area: '',
        tipoReintegro: 'total',
        diasIncapacidad: '',
        diagnosticoOrigen: '',
        recomendaciones: '',
        fechaReintegro: localDateStr(),
        restricciones: ''
    });

    // Fichas emitidas: se cargan del servidor (GET /medicina-ocupacional/fichas)
    const [fichasData, setFichasData] = useState([]);

    const [reintegrosData, setReintegrosData] = useState([]);

    const [examenesData, setExamenesData] = useState([]);

    // State for Exámenes Ocupacionales
    const [examSearchTerm, setExamSearchTerm] = useState('');
    const [examFilterStatus, setExamFilterStatus] = useState('todos');
    const [examForm, setExamForm] = useState({
        pacienteCedula: '',
        pacienteNombre: '',
        examenTipo: 'Audiometría Tonal Ocupacional',
        motivo: 'Vigilancia Epidemiológica de Salud Ocupacional',
        laboratorio: 'Laboratorio Ocupacional Institucional',
        prioridad: 'Normal',
        observaciones: ''
    });
    const [examResultModal, setExamResultModal] = useState({ show: false, item: null, resultadoText: '', estado: 'Realizado' });

    // Evolución & Historical Tracking State
    // Cada departamento ve solo su historial; el médico coordinador ve todas las áreas
    const esCoordinador = (user?.roles || []).some(r => (typeof r === 'string' ? r : r?.name) === 'medico_coordinador');
    const [activeBookArea, setActiveBookArea] = useState(esCoordinador ? 'medicina' : 'ocupacional');
    const [activeBookRecord, setActiveBookRecord] = useState(null);
    const [evolutionViewMode, setEvolutionViewMode] = useState('tratamientos'); // 'tratamientos' | 'todas'
    const [expandedTreatments, setExpandedTreatments] = useState({});
    const [historyPage, setHistoryPage] = useState(1);
    const HISTORY_PER_PAGE = 5;

    const [evolucionForm, setEvolucionForm] = useState({
        fecha: localDateStr(),
        detalle_evolucion: '',
        prescripcion_medica: ''
    });

    const [areaHistories, setAreaHistories] = useState({ ocupacional: [], medicina: [], psicologia: [], odontologia: [], enfermeria: [] });
    const [areaHistoriesLoading, setAreaHistoriesLoading] = useState(false);

    // Tratamientos: cada atención primaria inicia uno; lo posterior (subsecuentes, notas de evolución,
    // signos vitales) pertenece al tratamiento en curso hasta la siguiente atención primaria.
    const agruparTratamientos = (records) => {
        const esPrimaria = (r) => r.type === 'diario' && r.tipo_atencion !== 'secundaria';
        const asc = [...records].sort((a, b) =>
            (a.fecha || '').localeCompare(b.fecha || '')
            || (esPrimaria(b) - esPrimaria(a))
            || (new Date(a.created_at) - new Date(b.created_at))
        );
        const grupos = [];
        let actual = null;
        asc.forEach(r => {
            if (esPrimaria(r)) {
                actual = { inicio: r.fecha, registros: [r] };
                grupos.push(actual);
            } else {
                if (!actual) {
                    actual = { inicio: r.fecha, sinPrimaria: true, registros: [] };
                    grupos.push(actual);
                }
                actual.registros.push(r);
            }
        });
        let n = 0;
        grupos.forEach(g => { if (!g.sinPrimaria) g.numero = ++n; g.registros.reverse(); });
        return grupos.reverse();
    };

    // Historial real del paciente en cada área (mismas consultas que la vista integrada de Medicina General)
    const fetchPatientHistoryByArea = async (patientId) => {
        if (!patientId) return;
        setAreaHistoriesLoading(true);
        const get = (url) => api.get(url, { params: { id_usuario_paciente: patientId } })
            .then(res => (Array.isArray(res.data?.data) ? res.data.data : []))
            .catch(() => []);
        try {
            // Las atenciones ocupacionales se registran en las tablas de Medicina General; el backend
            // devuelve solo las de profesionales del mismo departamento (o todas al coordinador).
            // /enfermeria/signos-vitales aplica ese filtro; /medicina-general/signos-vitales no.
            const none = Promise.resolve([]);
            const [medEvol, medDiario, medSignos, psiEvol, psiDiario, odoEvol, odoDiario, enfVitals, enfDiario] = await Promise.all([
                get('/medicina-general/historial-evolucion'),
                get('/medicina-general/parte-diario'),
                esCoordinador ? get('/medicina-general/signos-vitales') : none,
                esCoordinador ? get('/psicologia/historial-evolucion') : none,
                esCoordinador ? get('/psicologia/parte-diario') : none,
                esCoordinador ? get('/odontologia/historial-evolucion') : none,
                esCoordinador ? get('/odontologia/parte-diario-odontologia') : none,
                get('/enfermeria/signos-vitales'),
                esCoordinador ? get('/enfermeria/parte-diario') : none
            ]);
            const propio = (list) => list.filter(x => String(x.id_usuario_paciente) === String(patientId));
            const quien = (x) => {
                const d = x.doctor || x.medico_general || x.medicoGeneral;
                const di = d?.datos_identificacion || d?.datosIdentificacion;
                return di?.primer_nombre ? `${di.primer_nombre} ${di.apellido_paterno || ''}`.trim() : (d?.name || '');
            };
            const signos = (x) => [
                x.presion_arterial_sistolica && `PA ${Number(x.presion_arterial_sistolica)}/${Number(x.presion_arterial_diastolica)} mmHg`,
                x.frecuencia_cardiaca && `FC ${x.frecuencia_cardiaca} lpm`,
                x.temperatura && `T ${Number(x.temperatura)} °C`,
                x.peso && `Peso ${Number(x.peso)} kg`,
                x.talla && `Talla ${Number(x.talla)} cm`
            ].filter(Boolean).join(' · ');
            const item = (x, recordTitle, resumen, type) => ({
                ...x,
                type,
                fecha: x.fecha ? String(x.fecha).slice(0, 10) : String(x.created_at || '').slice(0, 10),
                recordTitle,
                detalle_evolucion: resumen || x.detalle_evolucion || x.detalle_diagnostico || '',
                medico: quien(x)
            });
            const ordenar = (list) => list.sort((a, b) => new Date(b.fecha || b.created_at) - new Date(a.fecha || a.created_at));
            // Signos vitales: ambas rutas leen la misma tabla, se quitan los repetidos
            const vitales = [...new Map([...propio(medSignos), ...propio(enfVitals)].map(v => [v.id, v])).values()];

            if (!esCoordinador) {
                setAreaHistories({
                    ocupacional: ordenar([
                        ...propio(medEvol).map(x => item(x, 'Evolución Ocupacional', x.detalle_evolucion, 'evolucion')),
                        ...propio(medDiario).map(x => item(x, x.tipo_atencion === 'secundaria' ? 'Atención Subsecuente' : 'Atención Primaria', x.detalle_diagnostico, 'diario')),
                        ...propio(enfVitals).map(x => item(x, 'Signos Vitales', signos(x), 'signos'))
                    ])
                });
                return;
            }

            setAreaHistories({
                medicina: ordenar([
                    ...propio(medEvol).map(x => item(x, 'Evolución Clínica', x.detalle_evolucion, 'evolucion')),
                    ...propio(medDiario).map(x => item(x, 'Consulta de Jornada', x.detalle_diagnostico, 'diario'))
                ]),
                psicologia: ordenar([
                    ...propio(psiEvol).map(x => item(x, 'Sesión Psicológica', x.detalle_evolucion, 'evolucion')),
                    ...propio(psiDiario).map(x => item(x, 'Consulta de Psicología', x.detalle_diagnostico, 'diario'))
                ]),
                odontologia: ordenar([
                    ...propio(odoEvol).map(x => item(x, 'Evolución Dental', [x.detalle_tratamiento, x.detalle_procedimiento].filter(Boolean).join(' · '), 'evolucion')),
                    ...propio(odoDiario).map(x => item(x, 'Consulta Odontológica', x.detalle_diagnostico, 'diario'))
                ]),
                enfermeria: ordenar([
                    ...vitales.map(x => item(x, 'Signos Vitales', signos(x), 'signos')),
                    ...propio(enfDiario).map(x => item(x, 'Procedimiento de Enfermería', [x.detalle_procedimiento, x.detalle_medicacion].filter(Boolean).join(' · '), 'diario'))
                ])
            });
        } finally {
            setAreaHistoriesLoading(false);
        }
    };

    const handleSaveEvolucion = (e) => {
        e.preventDefault();
        if (!patientSelected) {
            alert('Debe seleccionar un paciente primero');
            return;
        }
        if (!evolucionForm.detalle_evolucion.trim()) {
            alert('Por favor ingrese el detalle de la evolución');
            return;
        }

        const newNote = {
            id: `evo-ocu-${Date.now()}`,
            fecha: evolucionForm.fecha,
            recordTitle: 'Evolución / Control Ocupacional',
            type: 'ocupacional',
            detalle_evolucion: evolucionForm.detalle_evolucion,
            prescripcion_medica: evolucionForm.prescripcion_medica || 'Sin prescripción adicional',
            medico: user?.name || 'Dr. Medicina Ocupacional'
        };

        setAreaHistories(prev => ({
            ...prev,
            ocupacional: [newNote, ...(prev.ocupacional || [])]
        }));

        setEvolucionForm({
            fecha: localDateStr(),
            detalle_evolucion: '',
            prescripcion_medica: ''
        });

        alert('¡Nota de evolución registrada exitosamente!');
    };


    // Recetario & Prescripción State
    const [farmaciaSearchLoading, setFarmaciaSearchLoading] = useState(false);
    // Vía registrada por Farmacia para el producto elegido: si existe, no se puede cambiar
    const [viaFarmacia, setViaFarmacia] = useState(null);
    const [prescripcionesList, setPrescripcionesList] = useState([]);
    const [prescripcionForm, setPrescripcionForm] = useState({
        detalle_medicamento: '',
        dosis: '1 tableta',
        via: 'Oral',
        frecuencia: '8',
        duracion: '3',
        cantidad_cajas: '0',
        cantidad_unidades: '0',
        disponible_farmacia: 'farmacia',
        observaciones: '',
        observacion_nodisponible: '',
        id_producto_farmacia: null
    });
    const todayStr = localDateStr();
    const [activeReportSubTab, setActiveReportSubTab] = useState('diario');
    const isMatricesCat = ['catastroficas', 'accidentes', 'covid', 'ausentismo', 'embarazadas', 'psicosocial', 'enfermedades_nuevas', 'examenes_periodicos', 'discapacidad', 'vulnerables_patologias', 'personal_nuevo'].includes(activeReportSubTab);

    // State for Exámenes & Laboratorio Ocupacional
    const [activeLabCatTab, setActiveLabCatTab] = useState('todos');
    const [labItemSearchModal, setLabItemSearchModal] = useState('');
    const [examReportDate, setExamReportDate] = useState(localDateStr());
    const [useExamDateFilter, setUseExamDateFilter] = useState(true);
    const [selectedExams, setSelectedExams] = useState(['Hemograma Completo', 'Audiometría Tonal Ocupacional', 'Colesterol', 'Triglicéridos']);
    const [customExamNotes, setCustomExamNotes] = useState('');

    const [examOrdersData, setExamOrdersData] = useState([]);

    // State for Matriz de Enfermedades Catastróficas o Huérfanas (UEB 2026)
    const [catastrophicSearchTerm, setCatastrophicSearchTerm] = useState('');
    const [catastrophicTabFilter, setCatastrophicTabFilter] = useState('todos');
    const [isCatastrophicModalOpen, setIsCatastrophicModalOpen] = useState(false);
    const [catastrophicForm, setCatastrophicForm] = useState({
        paciente: '',
        cedula: '',
        tipoEnfermedad: 'CÁNCER DE TIROIDES',
        clasificacion: 'Catastrófica',
        fechaDiagnostico: localDateStr(),
        cargo: 'DOCENTE TITULAR',
        recibioTratamiento: 'SI',
        novedades: 'CONTROL Y SEGUIMIENTO'
    });

    const [catastroficasData, setCatastroficasData] = useState([]);

    // State for Matriz de Accidentes Laborales y Enfermedades Profesionales (UEB 2026)
    const [accidenteSearchTerm, setAccidenteSearchTerm] = useState('');
    const [accidenteTabFilter, setAccidenteTabFilter] = useState('todos');
    const [isAccidenteModalOpen, setIsAccidenteModalOpen] = useState(false);
    const [accidenteForm, setAccidenteForm] = useState({
        paciente: '',
        cedula: '',
        cargo: 'ANALISTA DE MANTENIMIENTO',
        fechaAccidente: localDateStr(),
        lugar: 'TALLER DE MANTENIMIENTO',
        tipoAccidente: 'CORTE CON HERRAMIENTA EN MANO DERECHA',
        diagnostico: 'HERIDA CORTANTE EN PALMA DERECHA - REQUIRIÓ SUTURA',
        diasIncapacidad: '3 DÍAS',
        gravedad: 'LEVE',
        novedades: 'REPOSO MÉDICO FINALIZADO Y REINCORPORACIÓN COMPLETA'
    });

    const [accidentesLaboralesData, setAccidentesLaboralesData] = useState([]);

    // State for Matriz de Funcionarios con Discapacidad - Grupo Vulnerable UEB 2026
    const [discapacidadSearchTerm, setDiscapacidadSearchTerm] = useState('');
    const [discapacidadTabFilter, setDiscapacidadTabFilter] = useState('todos');
    const [isDiscapacidadModalOpen, setIsDiscapacidadModalOpen] = useState(false);
    const [discapacidadForm, setDiscapacidadForm] = useState({
        paciente: '',
        cedula: '',
        tipoDiscapacidad: 'FÍSICA',
        porcentaje: '40%',
        cargo: 'DOCENTE TITULAR',
        dependencia: 'FACULTAD DE CIENCIAS ADMINISTRATIVAS',
        condicionLaboral: 'NOMBRAMIENTO'
    });

    const [discapacidadData, setDiscapacidadData] = useState([]);

    // State for Matriz de Exámenes Médicos y Fichas Periódicas por Mes (UEB)
    const [periodicosSearchTerm, setPeriodicosSearchTerm] = useState('');
    const [periodicosSelectedYear, setPeriodicosSelectedYear] = useState('2022');
    const [isPeriodicosModalOpen, setIsPeriodicosModalOpen] = useState(false);
    const [periodicosForm, setPeriodicosForm] = useState({
        mes: 'AGOSTO',
        anio: '2022',
        cantidad: '50'
    });

    const [periodicosData, setPeriodicosData] = useState([]);

    // State for Matriz de Enfermedades Nuevas - Incidencia (UEB)
    const [nuevasSearchTerm, setNuevasSearchTerm] = useState('');
    const [nuevasSelectedYear, setNuevasSelectedYear] = useState('2022');
    const [isNuevasModalOpen, setIsNuevasModalOpen] = useState(false);
    const [nuevasForm, setNuevasForm] = useState({
        paciente: '',
        cedula: '',
        patologiaNueva: '',
        fechaAparecimiento: localDateStr()
    });

    const [nuevasData, setNuevasData] = useState([]);

    // State for Matriz de Riesgo Psicosocial (Ansiedad y Depresión UEB 2026)
    const [psicosocialSearchTerm, setPsicosocialSearchTerm] = useState('');
    const [psicosocialFilterTipo, setPsicosocialFilterTipo] = useState('todos');
    const [psicosocialSheetTab, setPsicosocialSheetTab] = useState('hoja1');
    const [isPsicosocialModalOpen, setIsPsicosocialModalOpen] = useState(false);
    const [psicosocialForm, setPsicosocialForm] = useState({
        paciente: '',
        cedula: '',
        tiposervidor: 'DOCENTE TITULAR',
        diagnostico: 'DEPRESION Y ANSIEDAD',
        observaciones: 'SEGUIMIENTO POR SALUD OCUPACIONAL Y PSICOLOGÍA'
    });

    const [psicosocialData, setPsicosocialData] = useState([]);

    // State for Matriz de Enfermedades Nuevas (Incidencia UEB)
    const [enfermedadesNuevasSearchTerm, setEnfermedadesNuevasSearchTerm] = useState('');
    const [enfermedadesNuevasFilterYear, setEnfermedadesNuevasFilterYear] = useState('TODOS');
    const [enfermedadesNuevasSheetTab, setEnfermedadesNuevasSheetTab] = useState('hoja1');
    const [isEnfermedadesNuevasModalOpen, setIsEnfermedadesNuevasModalOpen] = useState(false);
    const [enfermedadesNuevasForm, setEnfermedadesNuevasForm] = useState({
        paciente: '',
        cedula: '',
        patologiaNueva: '',
        fechaAparecimiento: localDateStr(),
        observaciones: 'REGISTRO DE INCIDENCIA DE PATOLOGÍA NUEVA'
    });

    const [enfermedadesNuevasData, setEnfermedadesNuevasData] = useState([]);

    // State for Matriz de Exámenes Médicos y Fichas Periódicas por Mes (UEB)
    const [examenesPeriodicosSelectedYear, setExamenesPeriodicosSelectedYear] = useState(String(new Date().getFullYear()));
    const [examenesPeriodicosSheetTab, setExamenesPeriodicosSheetTab] = useState('hoja1');
    const [examenesPeriodicosShowAllMonths, setExamenesPeriodicosShowAllMonths] = useState(false);
    const [isExamenesPeriodicosModalOpen, setIsExamenesPeriodicosModalOpen] = useState(false);
    const [examenesPeriodicosForm, setExamenesPeriodicosForm] = useState({
        mes: 'ENERO',
        examenes: 0
    });

    const [examenesPeriodicosData, setExamenesPeriodicosData] = useState({});

    // State for Matriz Censo de Embarazadas UEB 2026
    const [embarazadasSearchTerm, setEmbarazadasSearchTerm] = useState('');
    const [embarazadasSheetTab, setEmbarazadasSheetTab] = useState('hoja1'); // 'hoja1' | 'hoja2'
    const [isEmbarazadasModalOpen, setIsEmbarazadasModalOpen] = useState(false);
    const [embarazadasForm, setEmbarazadasForm] = useState({
        paciente: '',
        cedula: '',
        edad: '28',
        fum: localDateStr(),
        semanasGestacion: '12 SEMANAS',
        fechaProbableParto: 'may-26',
        controles: '3',
        telefono: '0987654321'
    });

    const [embarazadasData, setEmbarazadasData] = useState([]);

    // State for Matriz de Ausentismo Laboral (UEB 2026)
    const [ausentismoSearchTerm, setAusentismoSearchTerm] = useState('');
    const [ausentismoSelectedYear, setAusentismoSelectedYear] = useState('TODOS');
    const [ausentismoSelectedMonth, setAusentismoSelectedMonth] = useState('TODOS');
    const [ausentismoTabFilter, setAusentismoTabFilter] = useState('todos');
    const [isAusentismoModalOpen, setIsAusentismoModalOpen] = useState(false);
    const [ausentismoForm, setAusentismoForm] = useState({
        paciente: '',
        cedula: '',
        cargo: 'SERVIDOR/DOCENTE',
        motivoTipo: 'enfermedad_comun', // 'enfermedad_comun', 'enfermedad_laboral', 'accidente_laboral', 'otros'
        diagnostico: '',
        diasPerdidos: '1',
        horasAusentismo: '8',
        horasTrabajadas: '32'
    });

    const [ausentismoData, setAusentismoData] = useState([]);

    // State for Matriz de Casos Sospechosos y Confirmados para COVID-19 (UEB)
    const [covidSearchTerm, setCovidSearchTerm] = useState('');
    const [covidTabFilter, setCovidTabFilter] = useState('todos');
    const [covidSelectedYear, setCovidSelectedYear] = useState('TODOS');
    const [covidSelectedMonth, setCovidSelectedMonth] = useState('TODOS');
    const [isCovidModalOpen, setIsCovidModalOpen] = useState(false);
    const [covidForm, setCovidForm] = useState({
        paciente: '',
        tipoTrabajador: 'DOCENTE CONTRATADA',
        lugarTrabajo: 'FACULTAD DE CIENCIAS DE LA SALUD',
        fechaEntregaResultados: localDateStr(),
        pacienteConfirmado: '',
        pcr: true,
        pruebaRapida: false,
        altaMedica: true,
        diasAislamiento: '8',
        esDescartado: false
    });

    const [covidCasesData, setCovidCasesData] = useState([]);
    const [parteDiarioDate, setParteDiarioDate] = useState(todayStr);
    const [parteDiarioList, setParteDiarioList] = useState([]);
    const [parteDiarioLoading, setParteDiarioLoading] = useState(false);
    const [reportCitasFecha, setReportCitasFecha] = useState(todayStr);
    const [reportCitasEstado, setReportCitasEstado] = useState('all');
    const [citasLoading, setCitasLoading] = useState(false);
    const diarioIframeRef = useRef(null);
    const citasIframeRef = useRef(null);
    const mensualIframeRef = useRef(null);
    const fichasIframeRef = useRef(null);
    const recetaIframeRef = useRef(null);
    const matrixIframeRef = useRef(null);
    const [matrixSearchTerm, setMatrixSearchTerm] = useState('');
    const [matrixDateFilter, setMatrixDateFilter] = useState('');
    const [selectedFichaWorkerId, setSelectedFichaWorkerId] = useState(null);
    const [selectedRecetaId, setSelectedRecetaId] = useState(null);
    const [genReportMonth, setGenReportMonth] = useState(new Date().getMonth() + 1);
    const [genReportYear, setGenReportYear] = useState(new Date().getFullYear());
    const [reportMensualFecha, setReportMensualFecha] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });
    const [genReportLoading, setGenReportLoading] = useState(false);
    const [genReportData, setGenReportData] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '' });
    const [examSaving, setExamSaving] = useState(false);
    const showSystemToast = (message) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 3400);
    };

    const [recetasData, setRecetasData] = useState([]);
    const [recetasSearchNombre, setRecetasSearchNombre] = useState('');
    const [recetasSearchFecha, setRecetasSearchFecha] = useState('');
    const [selectedRecetaPreview, setSelectedRecetaPreview] = useState(null);
    const [farmaciaSearchQuery, setFarmaciaSearchQuery] = useState('');
    const [farmaciaSearchResults, setFarmaciaSearchResults] = useState([]);

    const [citasDate, setCitasDate] = useState(todayStr);
    const [citasSearchTerm, setCitasSearchTerm] = useState('');
    const [citasFilterStatus, setCitasFilterStatus] = useState('todos');
    const [citasPage, setCitasPage] = useState(1);
    const CITAS_PER_PAGE = 8;
    const [isAgendarCitaModalOpen, setIsAgendarCitaModalOpen] = useState(false);
    const [newCitaForm, setNewCitaForm] = useState({
        pacienteNombre: '',
        cedula: '',
        puesto: '',
        fecha: todayStr,
        horaInicio: '08:30',
        horaFin: '09:00',
        tipoEvaluacion: 'Evaluación Periódica',
        motivo: '',
        prioridad: 'Normal'
    });

    const [citasList, setCitasList] = useState([]);

    const filteredCitas = citasList.filter(item => {
        const pName = item.paciente?.name || item.pacienteNombre || '';
        const pCedula = item.paciente?.cedula || item.cedula || '';
        const pPuesto = item.paciente?.puesto || item.puesto || '';
        const pMotivo = item.motivo || '';

        const matchesSearch = pName.toLowerCase().includes(citasSearchTerm.toLowerCase()) ||
            pCedula.includes(citasSearchTerm) ||
            pPuesto.toLowerCase().includes(citasSearchTerm.toLowerCase()) ||
            pMotivo.toLowerCase().includes(citasSearchTerm.toLowerCase());

        if (!matchesSearch) return false;
        if (citasFilterStatus !== 'todos' && item.estado !== citasFilterStatus) return false;
        if (citasDate && item.fecha && item.fecha !== citasDate) return false;

        return true;
    });

    const handleSaveNewCita = (e) => {
        e.preventDefault();
        const nuevaCita = {
            id: Date.now(),
            fecha: newCitaForm.fecha,
            hora_inicio: newCitaForm.horaInicio,
            hora_fin: newCitaForm.horaFin,
            paciente: {
                name: newCitaForm.pacienteNombre,
                cedula: newCitaForm.cedula,
                puesto: newCitaForm.puesto || 'Servidor / Docente',
                area: 'Bienestar Universitario'
            },
            tipo_evaluacion: newCitaForm.tipoEvaluacion,
            motivo: newCitaForm.motivo || 'Evaluación de salud ocupacional',
            estado: 'programada',
            prioridad: newCitaForm.prioridad
        };
        setCitasList([nuevaCita, ...citasList]);
        setIsAgendarCitaModalOpen(false);
        setNewCitaForm({
            pacienteNombre: '',
            cedula: '',
            puesto: '',
            fecha: todayStr,
            horaInicio: '08:30',
            horaFin: '09:00',
            tipoEvaluacion: 'Evaluación Periódica',
            motivo: '',
            prioridad: 'Normal'
        });
    };

    const fetchCitas = async () => {
        try {
            const res = await api.get('/citas-medicas/doctor/citas', { params: { fecha: citasDate } });
            if (Array.isArray(res.data?.data)) {
                const mapped = res.data.data.map(c => {
                    const p = c.paciente || {};
                    const d = p.datos_identificacion || p.datosIdentificacion || {};
                    const nombre = d.primer_nombre
                        ? `${d.primer_nombre} ${d.segundo_nombre || ''} ${d.apellido_paterno || ''} ${d.apellido_materno || ''}`.replace(/\s+/g, ' ').trim()
                        : (p.name || 'Paciente');
                    return {
                        id: c.id,
                        pacienteNombre: nombre,
                        cedula: d.numero_cedula || p.cedula || 'N/D',
                        fecha: c.fecha,
                        horaInicio: c.hora_inicio ? c.hora_inicio.slice(0, 5) : '08:00',
                        horaFin: c.hora_fin ? c.hora_fin.slice(0, 5) : '08:30',
                        motivo: c.motivo || 'Evaluación Médica Ocupacional',
                        tipoEvaluacion: c.tipo_atencion || 'Periódica',
                        prioridad: 'Normal',
                        estado: c.estado || 'programada',
                        paciente: { ...p, ...d, id: p.id || c.id_usuario_paciente, nombres: d.primer_nombre, apellidos: [d.apellido_paterno, d.apellido_materno].filter(Boolean).join(' '), cedula: d.numero_cedula }
                    };
                });
                setCitasList(mapped);
            }
        } catch (err) {
            console.error("Error al cargar las citas:", err);
            setCitasList([]);
        }
    };

    const fetchExamOrders = async () => {
        try {
            const res = await api.get('/medicina-ocupacional/orden-examen');
            if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
                const mapped = res.data.data.map(o => {
                    const p = o.paciente || {};
                    const d = p.datos_identificacion || p.datosIdentificacion || {};
                    const nombre = d.primer_nombre
                        ? `${d.primer_nombre} ${d.segundo_nombre || ''} ${d.primer_apellido || ''} ${d.segundo_apellido || ''}`.trim()
                        : (p.name || 'Servidor');
                    const examenesNombres = (o.tipos_examen || o.tiposExamen || []).map(t => t.tipo_examen?.detalle_tipo || t.tipoExamen?.detalle_tipo || 'Examen').concat((o.otros || []).map(ot => ot.detalle_otro_examen));
                    return {
                        id: o.id,
                        fecha: o.fecha,
                        paciente: nombre,
                        cedula: d.numero_identificacion || p.cedula || 'N/D',
                        examen: examenesNombres.length > 0 ? examenesNombres.join(', ') : 'Exámenes Ocupacionales',
                        motivo: o.observaciones || 'Vigilancia Epidemiológica de Salud Ocupacional',
                        laboratorio: 'Laboratorio Ocupacional Institucional',
                        prioridad: 'Normal',
                        estado: o.estado || 'Pendiente',
                        selectedExams: examenesNombres,
                        otrosExamenes: (o.otros || []).map(ot => ot.detalle_otro_examen).join(', ')
                    };
                });
                setExamenesData(prev => {
                    const ids = new Set(mapped.map(m => m.id));
                    return [...mapped, ...prev.filter(pr => !ids.has(pr.id))];
                });
            }
        } catch (err) {
            console.log("Exam orders backend offline or empty");
        }
    };

    // Fichas emitidas en las atenciones: contenido clínico guardado + identificación real del trabajador
    const fetchFichasBackend = async () => {
        try {
            const res = await api.get('/medicina-ocupacional/fichas');
            const fichas = (Array.isArray(res.data?.data) ? res.data.data : []).map(f => {
                const contenido = f.contenido || {};
                const paciente = f.paciente || {};
                return {
                    ...contenido,
                    id: `ficha-${f.id}`,
                    fecha: f.fecha,
                    tipo: TIPO_FICHA_LABEL[f.tipo] || f.tipo,
                    tipoFicha: f.tipo,
                    paciente: paciente.nombre_completo || '',
                    cedula: paciente.cedula || '',
                    puesto: paciente.puestoTrabajo || '',
                    profesional: {
                        ...(contenido.profesional || {}),
                        nombre: contenido.profesional?.nombre || f.doctor?.nombre || '',
                        codigo: contenido.profesional?.codigo || f.doctor?.cedula || ''
                    },
                    patientSelected: paciente,
                    estado: 'Completado'
                };
            });
            setFichasData(fichas.filter(f => f.tipoFicha !== 'reintegro'));
            setReintegrosData(fichas.filter(f => f.tipoFicha === 'reintegro'));
        } catch (err) {
            console.error('No se pudieron cargar las fichas ocupacionales:', err);
        }
    };
    const fetchReintegros = fetchFichasBackend;

    // Recetario: recetas emitidas en las atenciones ocupacionales
    const fetchRecetasOcupacionales = async () => {
        try {
            const res = await api.get('/medicina-ocupacional/recetas-ocupacionales');
            const recetas = (Array.isArray(res.data?.data) ? res.data.data : []).map(r => {
                const paciente = r.paciente || {};
                const lineas = (r.lineas || []).map(l => ({
                    detalle_medicamento: l.detalle_medicamento,
                    dosis: l.detalle_dosis,
                    frecuencia: l.frecuencia_horas,
                    duracion: l.duracion_tratamiento_dias,
                    via: l.detalle_via_administracion,
                    enFarmacia: Boolean(l.id_producto_farmacia),
                    despachado: l.estado_despacho === 'despachado',
                    cantidad_texto: l.id_producto_farmacia ? '' : 'Compra externa'
                }));
                const deFarmacia = lineas.filter(l => l.enFarmacia);
                let estado = 'Pendiente de despacho';
                if (deFarmacia.length === 0) estado = 'Recetado Externamente';
                else if (deFarmacia.every(l => l.despachado)) estado = deFarmacia.length === lineas.length ? 'Dispensado en Farmacia' : 'Dispensación Parcial';
                return {
                    id: r.id,
                    numero_receta: `REC-${r.id}`,
                    fecha: r.fecha,
                    cie: r.cie || '',
                    paciente: paciente.nombre_completo || '',
                    cedula: paciente.cedula || '',
                    puesto: paciente.puestoTrabajo || '',
                    sexo: paciente.sexo || '',
                    fecha_nacimiento: paciente.fecha_nacimiento || '',
                    prescriptor_nombre: r.doctor?.nombre || '',
                    lineas,
                    medicamentos: lineas.map(l => `${l.detalle_medicamento} (${l.dosis}, c/${l.frecuencia}h x ${l.duracion}d)${l.enFarmacia ? '' : ' [COMPRA EXTERNA]'}`).join(' | '),
                    estado
                };
            });
            setRecetasData(recetas);
        } catch (err) {
            console.error('No se pudo cargar el recetario:', err);
        }
    };

    // --- Matrices estadísticas guardadas en el backend ---
    const [matrixRows, setMatrixRows] = useState({});
    const [matrixLoading, setMatrixLoading] = useState(false);
    const [matrixModalKey, setMatrixModalKey] = useState(null);

    const applyMatrixRows = (key, rows) => {
        const setters = {
            catastroficas: setCatastroficasData,
            accidentes: setAccidentesLaboralesData,
            covid: setCovidCasesData,
            ausentismo: setAusentismoData,
            embarazadas: setEmbarazadasData,
            psicosocial: setPsicosocialData,
            enfermedades_nuevas: setEnfermedadesNuevasData,
            discapacidad: setDiscapacidadData,
            personal_nuevo: setPersonalNuevoData
        };
        if (key === 'vulnerables_patologias') setVulnerablePatologiasData(buildVulnerablesByGroup(rows));
        else if (key === 'examenes_periodicos') setExamenesPeriodicosData(buildExamenesPeriodicosByYear(rows));
        else setters[key]?.(rows);
        setMatrixRows(prev => ({ ...prev, [key]: rows }));
    };

    const fetchMatrix = async (key) => {
        const config = MATRICES[key];
        if (!config) return;
        setMatrixLoading(true);
        try {
            const res = await api.get(config.path);
            // El backend devuelve los más recientes primero; la matriz se numera en orden de registro
            const rows = [...(res.data?.data || [])].reverse().map((row, idx) => config.fromApi(row, idx));
            applyMatrixRows(key, rows);
        } catch (err) {
            console.error(`Error al cargar la matriz ${key}:`, err);
            showSystemToast('No se pudo cargar la matriz desde el servidor.');
        } finally {
            setMatrixLoading(false);
        }
    };

    const handleDeleteMatrixRow = async (key, row) => {
        const config = MATRICES[key];
        const nombre = config.rowName ? config.rowName(row) : row.paciente;
        if (!window.confirm(`¿Eliminar el registro de ${nombre} de la matriz?`)) return;
        try {
            await api.delete(`${config.path}/${row.id}`);
            showSystemToast('Registro eliminado de la matriz.');
            fetchMatrix(key);
        } catch (err) {
            console.error('Error al eliminar registro de matriz:', err);
            alert(err.response?.data?.message || 'No se pudo eliminar el registro.');
        }
    };

    const fetchParteDiario = async () => {
        setParteDiarioLoading(true);
        try {
            // Los partes de Medicina Ocupacional se registran en medicina-general/parte-diario
            const response = await api.get('/medicina-general/parte-diario')
                .catch(() => ({ data: { data: [] } }));
            const data = response.data?.data || [];
            const filtered = data.filter(item => {
                const itemDate = item.fecha ? item.fecha.slice(0, 10) : '';
                return itemDate === parteDiarioDate;
            });
            setParteDiarioList(filtered);
        } catch (err) {
            console.error(err);
        } finally {
            setParteDiarioLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'diario' || (activeTab === 'reportes' && activeReportSubTab === 'diario')) {
            fetchParteDiario();
        }
        if (activeTab === 'citas' || (activeTab === 'reportes' && activeReportSubTab === 'citas')) {
            fetchCitas();
        }
        if (activeTab === 'examenes' || (activeTab === 'reportes' && activeReportSubTab === 'examenes')) {
            fetchExamOrders();
        }
        if (activeTab === 'reportes' && activeReportSubTab === 'mensual') {
            fetchAndCompileGeneralReport(genReportMonth, genReportYear);
        }
        if ((activeTab === 'matrices' || activeTab === 'reportes') && MATRICES[activeReportSubTab]) {
            fetchMatrix(activeReportSubTab);
        }
        if (activeTab === 'reportes' && activeReportSubTab === 'recetas') {
            fetchRecetasOcupacionales();
        }
        if (activeTab === 'reportes' && activeReportSubTab === 'fichas') {
            if (fichaSubTab === 'reintegro') fetchReintegros();
            if (fichaSubTab === 'ingreso' || fichaSubTab === 'cese') fetchFichasBackend();
        }
    }, [activeTab, activeReportSubTab, parteDiarioDate, citasDate, fichaSubTab, genReportMonth, genReportYear, reportCitasFecha, reportCitasEstado]);

    // Citas nuevas, canceladas o confirmadas por los pacientes aparecen sin recargar la página
    useAutoRefresh(() => fetchCitas(), activeTab === 'citas');

    const getParteKPIs = () => {
        const total = parteDiarioList.length;
        const primarias = parteDiarioList.filter(item => item.tipo_atencion === 'primaria').length;
        const secundarias = parteDiarioList.filter(item => item.tipo_atencion === 'secundaria').length;
        const certificados = parteDiarioList.filter(item => item.tipo_atencion === 'certificadomedico').length;
        return { total, primarias, secundarias, certificados };
    };

    // Handlers for Exámenes & Laboratorio
    const filteredExamOrders = examOrdersData.filter(item => {
        const matchesDate = !useExamDateFilter || item.fecha === examReportDate;
        const matchesSearch = (item.paciente || '').toLowerCase().includes(examSearchTerm.toLowerCase()) ||
            (item.cedula || '').includes(examSearchTerm) ||
            (item.examen || '').toLowerCase().includes(examSearchTerm.toLowerCase());
        const matchesStatus = examFilterStatus === 'todos' || item.estado.toLowerCase() === examFilterStatus.toLowerCase();
        return matchesDate && matchesSearch && matchesStatus;
    });

    const handlePrintExamOrderDocument = (item) => {
        const printWindow = window.open('', '_blank', 'width=1000,height=900');
        if (!printWindow) {
            alert('Por favor permita las ventanas emergentes para imprimir la orden de examen.');
            return;
        }

        const patientName = (item.paciente || '').toUpperCase();
        const cedula = item.cedula || 'N/D';
        const edad = item.edad || 'N/D';
        const fechaStr = item.fecha || localDateStr();
        const activeExams = item.selectedExams || ['Hemograma Completo', 'Audiometría Tonal Ocupacional'];
        const notes = item.otrosExamenes || customExamNotes || 'Ninguna observación adicional.';

        let categoriesHtml = '';
        Object.entries(LAB_EXAM_CATEGORIES).forEach(([catKey, category]) => {
            let itemsGridHtml = '';
            category.items.forEach(examItem => {
                const isChecked = activeExams.includes(examItem);
                itemsGridHtml += `
                    <div style="display: flex; align-items: center; gap: 4px; font-size: 8.5px; padding: 1px 0;">
                        <span style="font-weight: bold; font-family: monospace; font-size: 10px;">${escapeHtml(isChecked ? '( X )' : '(   )')}</span>
                        <span style="${escapeHtml(isChecked ? 'font-weight: bold; color: #0b3c5d;' : 'color: #334155;')}">${escapeHtml(examItem)}</span>
                    </div>
                `;
            });

            categoriesHtml += `
                <div style="border: 1px solid #000; margin-bottom: 6px; page-break-inside: avoid;">
                    <div style="background-color: #000; color: #fff; font-weight: bold; font-size: 9px; padding: 2px 6px; text-transform: uppercase;">
                        ${escapeHtml(category.title)}
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px 8px; padding: 4px 6px; background: #fff;">
                        ${itemsGridHtml}
                    </div>
                </div>
            `;
        });

        printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8"/>
                <title>ORDEN DE EXAMEN DE LABORATORIO - UEB</title>
                <style>
                    @page { size: A4 portrait; margin: 8mm 10mm; }
                    * { box-sizing: border-box; }
                    body { font-family: Arial, Helvetica, sans-serif; font-size: 10px; color: #000; background: #fff; margin: 0; padding: 0; }
                    .header-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; border: 1px solid #000; }
                    .header-table td { padding: 4px 8px; vertical-align: middle; border: 1px solid #000; }
                    .logo-title { font-size: 14px; font-weight: 900; color: #0b3c5d; margin: 0; }
                    .logo-sub { font-size: 8px; font-weight: 800; color: #0284c7; }
                    .order-title { font-size: 12px; font-weight: 900; text-align: center; text-transform: uppercase; background: #f1f5f9; padding: 6px; }
                    .patient-card { width: 100%; border-collapse: collapse; margin-bottom: 8px; border: 1px solid #000; font-size: 9.5px; }
                    .patient-card td { padding: 4px 6px; border: 1px solid #000; }
                    .patient-label { font-weight: bold; background: #f8fafc; text-transform: uppercase; width: 15%; }
                    @media print { .no-print { display: none !important; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
                </style>
            </head>
            <body>
                <div style="padding: 2px;">
                    <table class="header-table">
                        <tr>
                            <td style="width: 140px; text-align: center; vertical-align: middle;">
                                <img src="${escapeHtml(logoBienestar)}" alt="Bienestar Universitario" style="max-height: 48px; object-fit: contain;" />
                            </td>
                            <td class="order-title">
                                UNIVERSIDAD ESTATAL DE BOLÍVAR<br/>
                                <span style="font-size: 10px; font-weight: bold;">DIRECCIÓN DE BIENESTAR UNIVERSITARIO · SALUD OCUPACIONAL</span><br/>
                                <span style="font-size: 11px; color: #0b3c5d;">ORDEN DE EXAMEN DE LABORATORIO CLÍNICO</span>
                            </td>
                            <td style="width: 140px; text-align: center; vertical-align: middle;">
                                <img src="${escapeHtml(logoUebTexto)}" alt="UEB" style="max-height: 40px; object-fit: contain;" />
                            </td>
                        </tr>
                    </table>

                    <table class="patient-card">
                        <tr>
                            <td class="patient-label">PACIENTE:</td>
                            <td style="font-weight: bold; width: 45%;">${escapeHtml(patientName)}</td>
                            <td class="patient-label">CÉDULA:</td>
                            <td style="font-weight: bold;">${escapeHtml(cedula)}</td>
                        </tr>
                        <tr>
                            <td class="patient-label">FECHA:</td>
                            <td>${escapeHtml(fechaStr)}</td>
                            <td class="patient-label">EDAD / SEXO:</td>
                            <td>${escapeHtml(edad)} / M-F</td>
                        </tr>
                        <tr>
                            <td class="patient-label">MÉDICO:</td>
                            <td>Dr. Jorge Morales Torres (Salud Ocupacional)</td>
                            <td class="patient-label">LABORATORIO:</td>
                            <td>${escapeHtml(item.laboratorio || 'Laboratorio Central Universitario UEB')}</td>
                        </tr>
                    </table>

                    <div style="margin-bottom: 6px; font-weight: bold; font-size: 9.5px; text-transform: uppercase; color: #0b3c5d; border-bottom: 1px solid #000; padding-bottom: 2px;">
                        Exámenes Clínicos Solicitados
                    </div>

                    ${categoriesHtml}

                    <div style="margin-top: 6px; border: 1px solid #000; padding: 4px 6px; font-size: 8.5px; background: #fafafa;">
                        <strong>OBSERVACIONES / OTROS EXÁMENES:</strong> ${escapeHtml(notes)}
                    </div>

                    <div style="margin-top: 25px; display: flex; justify-content: space-around; text-align: center;">
                        <div style="width: 220px; border-top: 1px solid #000; padding-top: 4px; font-size: 8.5px;">
                            <strong>Dr. Jorge Morales Torres</strong><br/>
                            MÉDICO SALUD OCUPACIONAL<br/>
                            <span style="color: #64748b;">MSP / MDT / UEB</span>
                        </div>
                        <div style="width: 220px; border-top: 1px solid #000; padding-top: 4px; font-size: 8.5px;">
                            <strong>Firma del Paciente / Funcionario</strong><br/>
                            C.I.: ${escapeHtml(cedula)}
                        </div>
                    </div>
                </div>

                <script>window.onload = function() { setTimeout(function() { window.print(); }, 300); };</script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handlePrintDailyExamsReport = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Por favor permita las ventanas emergentes para imprimir.');
            return;
        }

        const rows = filteredExamOrders.map((ord, idx) => `
            <tr>
                <td style="padding: 6px; border: 1px solid #000; text-align: center;">${escapeHtml(idx + 1)}</td>
                <td style="padding: 6px; border: 1px solid #000; font-weight: bold;">${escapeHtml(ord.paciente)}<br/><small>C.I: ${escapeHtml(ord.cedula)}</small></td>
                <td style="padding: 6px; border: 1px solid #000;">${escapeHtml(ord.examen)}</td>
                <td style="padding: 6px; border: 1px solid #000;">${escapeHtml(ord.motivo)}</td>
                <td style="padding: 6px; border: 1px solid #000; text-align: center;">${escapeHtml(ord.estado)}</td>
            </tr>
        `).join('');

        printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <title>Reporte Diario de Exámenes UEB</title>
                <style>
                    body { font-family: Arial; font-size: 11px; padding: 15px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    th { background: #0b3c5d; color: #fff; border: 1px solid #000; padding: 6px; }
                </style>
            </head>
            <body>
                <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #0b3c5d; padding-bottom: 8px; margin-bottom: 12px;">
                    <img src="${escapeHtml(logoBienestar)}" alt="Bienestar Universitario" style="max-height: 48px; object-fit: contain;" />
                    <div style="text-align: center;">
                        <h2 style="margin: 0; font-size: 13px; color: #002040;">UNIVERSIDAD ESTATAL DE BOLÍVAR</h2>
                        <h3 style="margin: 2px 0; font-size: 11px; color: #0b3c5d;">DIRECCIÓN DE BIENESTAR UNIVERSITARIO · SALUD OCUPACIONAL</h3>
                        <p style="margin: 2px 0 0 0; font-size: 10px; font-weight: bold; color: #0284c7;">REPORTE DE ÓRDENES DE EXÁMENES DE LABORATORIO</p>
                    </div>
                    <img src="${escapeHtml(logoUebTexto)}" alt="UEB" style="max-height: 40px; object-fit: contain;" />
                </div>
                <p><strong>Fecha de Reporte:</strong> ${escapeHtml(useExamDateFilter ? examReportDate : 'Todas las Fechas (Histórico)')} | <strong>Total Registros:</strong> ${escapeHtml(filteredExamOrders.length)}</p>
                <table>
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>Paciente</th>
                            <th>Exámenes Solicitados</th>
                            <th>Motivo Ocupacional</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>${rows ? rows : '<tr><td colspan="5" style="text-align:center;">No hay órdenes para la fecha seleccionada.</td></tr>'}</tbody>
                </table>
                <script>window.onload = function() { window.print(); };</script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleSaveExamOrderRecord = (e) => {
        e.preventDefault();
        const pacienteName = patientSelected
            ? `${patientSelected.nombres} ${patientSelected.apellidos}`.trim()
            : 'Paciente Seleccionado';

        const newOrder = {
            id: Date.now(),
            fecha: localDateStr(),
            paciente: pacienteName,
            cedula: patientSelected?.cedula || '0201234567',
            edad: patientSelected?.edad ? `${patientSelected.edad} años` : '35 años',
            medicoSolicitante: 'Dr. Jorge Morales Torres',
            selectedExams: [...selectedExams],
            otrosExamenes: customExamNotes,
            examen: selectedExams.length > 0 ? selectedExams.slice(0, 3).join(', ') + (selectedExams.length > 3 ? '...' : '') : 'Exámenes Generales',
            motivo: 'Evaluación Ocupacional Periódica',
            laboratorio: 'Laboratorio Central Universitario UEB',
            prioridad: 'Normal',
            estado: 'Pendiente'
        };

        setExamOrdersData([newOrder, ...examOrdersData]);
        setIsExamModalOpen(false);
        setCustomExamNotes('');
    };

    const matchesDateFilter = (recordDateStr, filterVal) => {
        if (!filterVal || !recordDateStr) return true;
        const cleanDate = String(recordDateStr).trim();
        if (cleanDate.includes(filterVal)) return true;
        const parts = filterVal.split('-');
        if (parts.length === 3) {
            const [y, m, d] = parts;
            const dmy = `${d}/${m}/${y}`;
            const my = `${m}/${y}`;
            const ym = `${y}-${m}`;
            if (cleanDate.includes(dmy) || cleanDate.includes(my) || cleanDate.includes(ym) || cleanDate.includes(y)) return true;
        }
        return false;
    };

    const handleMatrixSearch = (val) => {
        setMatrixSearchTerm(val);
        setCatastrophicSearchTerm(val);
        setAccidenteSearchTerm(val);
        setCovidSearchTerm(val);
        setAusentismoSearchTerm(val);
        setEmbarazadasSearchTerm(val);
        setPsicosocialSearchTerm(val);
        setEnfermedadesNuevasSearchTerm(val);
        setPeriodicosSearchTerm(val);
        setPersonalNuevoSearchTerm(val);
        setDiscapacidadSearchTerm(val);
    };

    // Handlers for Catastróficas
    const filteredCatastroficas = catastroficasData.filter(item => {
        const term = (matrixSearchTerm || catastrophicSearchTerm || '').toLowerCase();
        const matchesSearch = !term ||
            (item.paciente || '').toLowerCase().includes(term) ||
            (item.cedula || '').includes(term) ||
            (item.tipoEnfermedad || '').toLowerCase().includes(term) ||
            (item.cargo || '').toLowerCase().includes(term) ||
            (item.novedades || '').toLowerCase().includes(term);

        if (!matchesSearch) return false;
        if (matrixDateFilter && !matchesDateFilter(item.fechaDiagnostico, matrixDateFilter)) return false;

        if (catastrophicTabFilter === 'catastroficas') {
            return (item.clasificacion || 'Catastrófica') === 'Catastrófica';
        }
        if (catastrophicTabFilter === 'huerfanas') {
            return item.clasificacion === 'Huérfana o Rara';
        }
        return true;
    });

    const compileCatastroficasMatrixHtml = (itemsList = filteredCatastroficas, currentTabLabel = 'ENFERMEDADES CATASTRÓFICAS O HUÉRFANAS', forPrint = false) => {
        const list = itemsList || filteredCatastroficas;
        const rowsHtml = list.map((item, idx) => `
            <tr style="background: ${escapeHtml(idx % 2 === 0 ? '#ffffff' : '#f8fafc')};">
                <td style="padding: 7px 8px; border: 1px solid #94a3b8; text-align: center; font-weight: bold; font-size: 10px;">${escapeHtml(idx + 1)}</td>
                <td style="padding: 7px 8px; border: 1px solid #94a3b8; font-weight: 800; font-size: 10px; color: #0b3c5d;">${escapeHtml((item.paciente || '').toUpperCase())}<br/><small style="color: #64748b; font-weight: normal;">C.I: ${escapeHtml(item.cedula || 'N/D')}</small></td>
                <td style="padding: 7px 8px; border: 1px solid #94a3b8; font-weight: 700; font-size: 9.5px; color: #0f172a;">${escapeHtml((item.tipoEnfermedad || '').toUpperCase())}</td>
                <td style="padding: 7px 8px; border: 1px solid #94a3b8; text-align: center; font-size: 9.5px;">${escapeHtml(item.fechaDiagnostico || 'N/D')}</td>
                <td style="padding: 7px 8px; border: 1px solid #94a3b8; font-size: 9.5px; color: #334155;">${escapeHtml((item.cargo || '').toUpperCase())}</td>
                <td style="padding: 7px 8px; border: 1px solid #94a3b8; text-align: center; font-weight: bold; font-size: 10px; color: ${escapeHtml(item.recibioTratamiento === 'SI' ? '#0284c7' : '#475569')};">${escapeHtml(item.recibioTratamiento || 'SI')}</td>
                <td style="padding: 7px 8px; border: 1px solid #94a3b8; font-size: 9px; font-weight: 600; color: #1e293b;">${escapeHtml((item.novedades || '').toUpperCase())}</td>
            </tr>
        `).join('');

        return `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8"/>
                <title>MATRIZ SOBRE ENFERMEDADES CATALOGADAS COMO CATASTRÓFICAS - UEB 2026</title>
                <style>
                    @page { size: A4 landscape; margin: 8mm 10mm; }
                    * { box-sizing: border-box; }
                    body { font-family: Arial, Helvetica, sans-serif; font-size: 10px; color: #0f172a; background: #fff; margin: 0; padding: 12px; }
                    .header-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
                    .logo-text { font-size: 16px; font-weight: 900; color: #0b3c5d; }
                    .logo-subtext { font-size: 8.5px; font-weight: 800; color: #0284c7; }
                    .matrix-title { font-size: 11px; font-weight: 900; color: #0b3c5d; text-align: center; text-transform: uppercase; line-height: 1.25; padding: 0 10px; }
                    table.matrix-table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 9.5px; }
                    table.matrix-table th { background: #00a2e8; color: #ffffff; padding: 8px 6px; font-weight: 900; text-transform: uppercase; font-size: 9px; text-align: center; border: 1px solid #0088cc; letter-spacing: 0.3px; }
                    @media print { .no-print { display: none !important; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
                </style>
            </head>
            <body>
                <table class="header-table">
                    <tr>
                        <td style="width: 140px; vertical-align: middle; text-align: left;">
                            <img src="${escapeHtml(logoBienestar)}" alt="Bienestar Universitario" style="max-height: 48px; width: auto; object-fit: contain;" />
                        </td>
                        <td class="matrix-title">
                            <div style="font-size: 11px; font-weight: 900; color: #002040; text-transform: uppercase;">UNIVERSIDAD ESTATAL DE BOLÍVAR</div>
                            <div style="font-size: 9px; font-weight: 800; color: #0284c7; text-transform: uppercase;">DIRECCIÓN DE BIENESTAR UNIVERSITARIO · UNIDAD DE SEGURIDAD Y SALUD OCUPACIONAL</div>
                            <div style="font-size: 10px; font-weight: 900; color: #0b3c5d; margin-top: 2px;">
                                MATRIZ SOBRE ENFERMEDADES CATALOGADAS COMO CATASTRÓFICAS, CONFORME A LO ESTIPULADO POR EL MINISTERIO DE SALUD PÚBLICA DEL ECUADOR UEB 2026<br/>
                                <span style="font-size: 9px; font-weight: 700; color: #0284c7;">(${escapeHtml(currentTabLabel)})</span>
                            </div>
                        </td>
                        <td style="width: 140px; vertical-align: middle; text-align: right;">
                            <img src="${escapeHtml(logoUebTexto)}" alt="UEB" style="max-height: 40px; width: auto; object-fit: contain;" />
                        </td>
                    </tr>
                </table>

                <table class="matrix-table">
                    <thead>
                        <tr>
                            <th style="width: 50px;">NÚMERO</th>
                            <th>NOMBRE DEL PACIENTE</th>
                            <th>TIPO DE ENFERMEDAD</th>
                            <th style="width: 120px;">FECHA DE DIAGNÓSTICO</th>
                            <th>CARGO / OCUPACIÓN</th>
                            <th style="width: 130px;">RECIBIÓ QUIMIOTERAPIA / RADIOTERAPIA</th>
                            <th>NOVEDADES</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml.length > 0 ? rowsHtml : '<tr><td colspan="7" style="text-align: center; padding: 25px; color: #64748b;">No se encontraron registros con los filtros aplicados.</td></tr>'}
                    </tbody>
                </table>

                <div style="margin-top: 30px; display: flex; justify-content: space-around;">
                    <div style="text-align: center; width: 250px; border-top: 1px solid #0f172a; padding-top: 4px;">
                        <strong style="font-size: 9.5px; color: #0b3c5d;">Responsable de Seguridad y Salud Ocupacional</strong><br/>
                        <span style="font-size: 8.5px; color: #64748b;">Universidad Estatal de Bolívar</span>
                    </div>
                </div>
                ${forPrint ? '<script>window.onload = function() { setTimeout(function() { window.print(); }, 300); };</script>' : ''}
            </body>
            </html>
        `;
    };

    const handlePrintCatastroficasMatrix = (itemsList = filteredCatastroficas, currentTabLabel = 'ENFERMEDADES CATASTRÓFICAS O HUÉRFANAS') => {
        printIframeDocument(matrixIframeRef, () => compileCatastroficasMatrixHtml(itemsList, currentTabLabel, false));
        showSystemToast('Enviando matriz de enfermedades catastróficas a impresión...');
    };

    const handleSaveCatastrophicRecord = (e) => {
        e.preventDefault();
        const pacienteNombreFinal = patientSelected
            ? `${patientSelected.nombres} ${patientSelected.apellidos}`.trim().toUpperCase()
            : (catastrophicForm.paciente || '').toUpperCase();

        if (!pacienteNombreFinal) {
            alert('Por favor seleccione un paciente o ingrese el nombre.');
            return;
        }

        const newRecord = {
            id: Date.now(),
            numero: catastroficasData.length + 1,
            paciente: pacienteNombreFinal,
            cedula: patientSelected?.cedula || catastrophicForm.cedula || 'N/D',
            tipoEnfermedad: (catastrophicForm.tipoEnfermedad || '').toUpperCase(),
            clasificacion: catastrophicForm.clasificacion || 'Catastrófica',
            fechaDiagnostico: catastrophicForm.fechaDiagnostico || 'N/D',
            cargo: (patientSelected?.puestoTrabajo || catastrophicForm.cargo || 'DOCENTE TITULAR').toUpperCase(),
            recibioTratamiento: catastrophicForm.recibioTratamiento || 'SI',
            novedades: (catastrophicForm.novedades || 'CONTROL Y SEGUIMIENTO').toUpperCase()
        };

        setCatastroficasData([...catastroficasData, newRecord]);
        setIsCatastrophicModalOpen(false);
        setCatastrophicForm({
            paciente: '',
            cedula: '',
            tipoEnfermedad: 'CÁNCER DE TIROIDES',
            clasificacion: 'Catastrófica',
            fechaDiagnostico: localDateStr(),
            cargo: 'DOCENTE TITULAR',
            recibioTratamiento: 'SI',
            novedades: 'CONTROL Y SEGUIMIENTO'
        });
    };

    // Handlers for Accidentes
    const filteredAccidentes = accidentesLaboralesData.filter(item => {
        const term = (matrixSearchTerm || accidenteSearchTerm || '').toLowerCase();
        const matchSearch = !term ||
            (item.paciente || '').toLowerCase().includes(term) ||
            (item.cedula || '').toLowerCase().includes(term) ||
            (item.cargo || '').toLowerCase().includes(term) ||
            (item.lugar || '').toLowerCase().includes(term) ||
            (item.tipoAccidente || '').toLowerCase().includes(term) ||
            (item.diagnostico || '').toLowerCase().includes(term) ||
            (item.novedades || '').toLowerCase().includes(term);

        if (!matchSearch) return false;
        if (matrixDateFilter && !matchesDateFilter(item.fechaAccidente, matrixDateFilter)) return false;

        if (accidenteTabFilter === 'leves') {
            return (item.gravedad || '').toUpperCase().includes('LEVE');
        }
        if (accidenteTabFilter === 'graves') {
            return (item.gravedad || '').toUpperCase().includes('GRAVE') || (item.gravedad || '').toUpperCase().includes('INCAPACIDAD');
        }
        if (accidenteTabFilter === 'enfermedades_profesionales') {
            return (item.gravedad || '').toUpperCase().includes('ENFERMEDAD') || (item.gravedad || '').toUpperCase().includes('PROFESIONAL');
        }
        return true;
    });

    const compileAccidentesMatrixHtml = (dataToPrint = filteredAccidentes, filterLabel = 'TODOS LOS REGISTROS', forPrint = false) => {
        const list = dataToPrint || filteredAccidentes;
        const rowsHtml = list.map((item, idx) => `
            <tr style="background: ${escapeHtml(idx % 2 === 0 ? '#ffffff' : '#f8fafc')};">
                <td style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: center; font-weight: bold; font-size: 10px;">${escapeHtml(idx + 1)}</td>
                <td style="padding: 6px 8px; border: 1px solid #94a3b8; font-weight: 800; font-size: 10px; color: #0b3c5d;">
                    ${escapeHtml((item.paciente || '').toUpperCase())}<br/>
                    <small style="color: #64748b; font-weight: normal;">C.I: ${escapeHtml(item.cedula || 'N/D')}</small>
                </td>
                <td style="padding: 6px 8px; border: 1px solid #94a3b8; font-size: 9.5px; color: #334155;">${escapeHtml((item.cargo || '').toUpperCase())}</td>
                <td style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: center; font-size: 9.5px;">${escapeHtml(item.fechaAccidente || 'N/D')}</td>
                <td style="padding: 6px 8px; border: 1px solid #94a3b8; font-size: 9.5px; color: #334155;">${escapeHtml((item.lugar || '').toUpperCase())}</td>
                <td style="padding: 6px 8px; border: 1px solid #94a3b8; font-weight: 800; font-size: 9.5px; color: #b45309;">${escapeHtml((item.tipoAccidente || '').toUpperCase())}</td>
                <td style="padding: 6px 8px; border: 1px solid #94a3b8; font-size: 9.5px; color: #0f172a;">${escapeHtml((item.diagnostico || '').toUpperCase())}</td>
                <td style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: center; font-weight: bold; font-size: 10px; color: #d97706;">${escapeHtml(item.diasIncapacidad || 'N/D')}</td>
                <td style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: center; font-weight: bold; font-size: 9.5px; color: ${escapeHtml((item.gravedad || '').includes('LEVE') ? '#0284c7' : '#dc2626')};">${escapeHtml(item.gravedad || 'LEVE')}</td>
                <td style="padding: 6px 8px; border: 1px solid #94a3b8; font-size: 9px; font-weight: 600; color: #1e293b;">${escapeHtml((item.novedades || '').toUpperCase())}</td>
            </tr>
        `).join('');

        return `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8"/>
                <title>MATRIZ DE REGISTRO DE ACCIDENTES DE TRABAJO - UEB 2026</title>
                <style>
                    @page { size: A4 landscape; margin: 8mm 10mm; }
                    * { box-sizing: border-box; }
                    body { font-family: Arial, Helvetica, sans-serif; font-size: 10px; color: #0f172a; background: #fff; margin: 0; padding: 12px; }
                    .header-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
                    .logo-text { font-size: 16px; font-weight: 900; color: #0b3c5d; }
                    .logo-subtext { font-size: 8.5px; font-weight: 800; color: #d97706; }
                    .matrix-title { font-size: 11px; font-weight: 900; color: #0b3c5d; text-align: center; text-transform: uppercase; line-height: 1.25; padding: 0 10px; }
                    table.matrix-table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 9.5px; }
                    table.matrix-table th { background: #d97706; color: #ffffff; padding: 8px 5px; font-weight: 900; text-transform: uppercase; font-size: 8.5px; text-align: center; border: 1px solid #b45309; letter-spacing: 0.2px; }
                    @media print { .no-print { display: none !important; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
                </style>
            </head>
            <body>
                <table class="header-table">
                    <tr>
                        <td style="width: 140px; vertical-align: middle; text-align: left;">
                            <img src="${escapeHtml(logoBienestar)}" alt="Bienestar Universitario" style="max-height: 48px; width: auto; object-fit: contain;" />
                        </td>
                        <td class="matrix-title">
                            <div style="font-size: 11px; font-weight: 900; color: #002040; text-transform: uppercase;">UNIVERSIDAD ESTATAL DE BOLÍVAR</div>
                            <div style="font-size: 9px; font-weight: 800; color: #b45309; text-transform: uppercase;">DIRECCIÓN DE BIENESTAR UNIVERSITARIO · UNIDAD DE SEGURIDAD Y SALUD OCUPACIONAL</div>
                            <div style="font-size: 10px; font-weight: 900; color: #0b3c5d; margin-top: 2px;">
                                MATRIZ DE REGISTRO DE ACCIDENTES DE TRABAJO Y ENFERMEDADES PROFESIONALES - UEB 2026<br/>
                                <span style="font-size: 9px; font-weight: 700; color: #d97706;">(${escapeHtml(String(filterLabel).toUpperCase())})</span>
                            </div>
                        </td>
                        <td style="width: 140px; vertical-align: middle; text-align: right;">
                            <img src="${escapeHtml(logoUebTexto)}" alt="UEB" style="max-height: 40px; width: auto; object-fit: contain;" />
                        </td>
                    </tr>
                </table>

                <table class="matrix-table">
                    <thead>
                        <tr>
                            <th style="width: 40px;">N°</th>
                            <th>NOMBRE DEL PACIENTE / CÉDULA</th>
                            <th>CARGO / OCUPACIÓN</th>
                            <th style="width: 100px;">FECHA Y HORA</th>
                            <th>LUGAR / ÁREA</th>
                            <th>TIPO DE ACCIDENTE / CAUSA</th>
                            <th>DIAGNÓSTICO / LESIÓN</th>
                            <th style="width: 70px;">INCAPACIDAD</th>
                            <th style="width: 85px;">GRAVEDAD</th>
                            <th>NOVEDADES</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml.length > 0 ? rowsHtml : '<tr><td colspan="10" style="text-align: center; padding: 25px; color: #64748b;">No se registraron accidentes en esta matriz.</td></tr>'}
                    </tbody>
                </table>

                <div style="margin-top: 25px; display: flex; justify-content: space-around;">
                    <div style="text-align: center; width: 250px; border-top: 1px solid #0f172a; padding-top: 4px;">
                        <strong style="font-size: 9.5px; color: #0b3c5d;">Responsable de Salud Ocupacional</strong><br/>
                        <span style="font-size: 8.5px; color: #64748b;">Universidad Estatal de Bolívar</span>
                    </div>
                </div>
                ${forPrint ? '<script>window.onload = function() { setTimeout(function() { window.print(); }, 300); };</script>' : ''}
            </body>
            </html>
        `;
    };

    const handlePrintAccidentesMatrix = (dataToPrint = filteredAccidentes, filterLabel = 'TODOS LOS REGISTROS') => {
        printIframeDocument(matrixIframeRef, () => compileAccidentesMatrixHtml(dataToPrint, filterLabel, false));
        showSystemToast('Enviando matriz de accidentes a impresión...');
    };

    const handleSaveAccidenteRecord = (e) => {
        e.preventDefault();
        const pacienteNombreFinal = patientSelected
            ? `${patientSelected.nombres} ${patientSelected.apellidos}`.trim().toUpperCase()
            : (accidenteForm.paciente || '').toUpperCase();

        if (!pacienteNombreFinal) {
            alert('Por favor seleccione un paciente o ingrese el nombre.');
            return;
        }

        const newRecord = {
            id: Date.now(),
            numero: accidentesLaboralesData.length + 1,
            paciente: pacienteNombreFinal,
            cedula: patientSelected?.cedula || accidenteForm.cedula || 'N/D',
            cargo: (patientSelected?.puestoTrabajo || accidenteForm.cargo || 'ANALISTA DE MANTENIMIENTO').toUpperCase(),
            fechaAccidente: accidenteForm.fechaAccidente,
            lugar: (accidenteForm.lugar || 'INSTALACIONES UEB').toUpperCase(),
            tipoAccidente: (accidenteForm.tipoAccidente || 'ACCIDENTE LABORAL').toUpperCase(),
            diagnostico: (accidenteForm.diagnostico || 'EVALUACIÓN MÉDICA').toUpperCase(),
            diasIncapacidad: accidenteForm.diasIncapacidad || '0 DÍAS',
            gravedad: accidenteForm.gravedad || 'LEVE',
            novedades: (accidenteForm.novedades || 'REINCORPORADO').toUpperCase()
        };

        setAccidentesLaboralesData([...accidentesLaboralesData, newRecord]);
        setIsAccidenteModalOpen(false);
        setAccidenteForm({
            paciente: '',
            cedula: '',
            cargo: 'ANALISTA DE MANTENIMIENTO',
            fechaAccidente: localDateStr(),
            lugar: 'TALLER DE MANTENIMIENTO',
            tipoAccidente: 'CORTE CON HERRAMIENTA EN MANO DERECHA',
            diagnostico: 'HERIDA CORTANTE EN PALMA DERECHA - REQUIRIÓ SUTURA',
            diasIncapacidad: '3 DÍAS',
            gravedad: 'LEVE',
            novedades: 'REPOSO MÉDICO FINALIZADO Y REINCORPORACIÓN COMPLETA'
        });
    };

    // Handlers for Grupo Vulnerable & Discapacidad
    const filteredDiscapacidad = discapacidadData.filter(item => {
        const term = (matrixSearchTerm || discapacidadSearchTerm || '').toLowerCase();
        const matchesSearch = !term ||
            (item.paciente || '').toLowerCase().includes(term) ||
            (item.cedula || '').includes(term) ||
            (item.cargo || '').toLowerCase().includes(term) ||
            (item.dependencia || '').toLowerCase().includes(term) ||
            (item.condicionLaboral || '').toLowerCase().includes(term);

        if (!matchesSearch) return false;

        if (discapacidadTabFilter !== 'todos' && item.tipoDiscapacidad.toUpperCase() !== discapacidadTabFilter.toUpperCase()) {
            return false;
        }

        return true;
    });

    const compileDiscapacidadMatrixHtml = (dataToPrint = filteredDiscapacidad, forPrint = false) => {
        const list = dataToPrint || filteredDiscapacidad;
        const rowsHtml = list.map((item, idx) => `
            <tr style="background: ${escapeHtml(idx % 2 === 0 ? '#ffffff' : '#f8fafc')};">
                <td style="padding: 7px 10px; border: 1px solid #000000; font-weight: 800; font-size: 10px; color: #0b3c5d;">${escapeHtml((item.paciente || '').toUpperCase())}<br/><small style="color:#64748b; font-weight:normal;">C.I: ${escapeHtml(item.cedula || 'N/D')}</small></td>
                <td style="padding: 7px 10px; border: 1px solid #000000; font-weight: 800; font-size: 10px; color: #15803d; text-align: center;">${escapeHtml((item.tipoDiscapacidad || '').toUpperCase())}</td>
                <td style="padding: 7px 10px; border: 1px solid #000000; text-align: center; font-weight: bold; font-size: 10px; color: #0284c7;">${escapeHtml(item.porcentaje || 'N/D')}</td>
                <td style="padding: 7px 10px; border: 1px solid #000000; font-size: 9.5px; color: #334155;">${escapeHtml((item.cargo || '').toUpperCase())}</td>
                <td style="padding: 7px 10px; border: 1px solid #000000; font-size: 9.5px; color: #1e293b;">${escapeHtml((item.dependencia || '').toUpperCase())}</td>
                <td style="padding: 7px 10px; border: 1px solid #000000; text-align: center; font-weight: bold; font-size: 9.5px; color: #a16207;">${escapeHtml((item.condicionLaboral || '').toUpperCase())}</td>
            </tr>
        `).join('');

        return `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8"/>
                <title>GRUPO VULNERABLE UNIVERSIDAD ESTATAL DE BOLÍVAR - 2026</title>
                <style>
                    @page { size: A4 landscape; margin: 8mm 10mm; }
                    * { box-sizing: border-box; }
                    body { font-family: Arial, Helvetica, sans-serif; font-size: 9.5px; color: #000; background: #fff; margin: 0; padding: 12px; }
                    .blue-banner { background-color: #0070c0; color: #ffffff; border: 1px solid #000; padding: 6px 12px; font-size: 14px; font-weight: 900; text-transform: uppercase; text-align: center; }
                    .orange-banner { background-color: #f97316; color: #ffffff; border: 1px solid #000; padding: 8px 12px; margin-bottom: 8px; font-size: 14px; font-weight: 900; text-transform: uppercase; text-align: center; border-top: none; }
                    table.matrix-table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 9.5px; }
                    table.matrix-table th { padding: 8px 6px; font-weight: 900; text-transform: uppercase; font-size: 9.5px; text-align: center; border: 1px solid #000; letter-spacing: 0.3px; }
                    .th-verde { background: #00b050; color: #ffffff; }
                    .th-azul { background: #0284c7; color: #ffffff; }
                    .th-amarillo { background: #eab308; color: #000000; }
                    @media print { .no-print { display: none !important; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
                </style>
            </head>
            <body>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px;">
                    <tr>
                        <td style="width: 140px; vertical-align: middle; text-align: left;">
                            <img src="${escapeHtml(logoBienestar)}" alt="Bienestar Universitario" style="max-height: 48px; width: auto; object-fit: contain;" />
                        </td>
                        <td style="text-align: center; vertical-align: middle;">
                            <div class="blue-banner" style="margin: 0; padding: 5px 10px; font-size: 11.5px;">UNIVERSIDAD ESTATAL DE BOLÍVAR · BIENESTAR UNIVERSITARIO · SALUD OCUPACIONAL</div>
                            <div class="orange-banner" style="margin: 0; padding: 6px 10px; font-size: 13px;">GRUPO VULNERABLE UNIVERSIDAD ESTATAL DE BOLÍVAR - 2026</div>
                        </td>
                        <td style="width: 140px; vertical-align: middle; text-align: right;">
                            <img src="${escapeHtml(logoUebTexto)}" alt="UEB" style="max-height: 40px; width: auto; object-fit: contain;" />
                        </td>
                    </tr>
                </table>

                <table class="matrix-table">
                    <thead>
                        <tr>
                            <th class="th-verde">NOMBRES Y APELLIDOS</th>
                            <th class="th-verde" style="width: 140px;">TIPO DE DISCAPACIDAD</th>
                            <th class="th-azul" style="width: 90px;">PORCENTAJE</th>
                            <th class="th-azul" style="width: 160px;">CARGO</th>
                            <th class="th-azul">DEPENDENCIA</th>
                            <th class="th-amarillo" style="width: 150px;">CONDICION LABORAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml.length > 0 ? rowsHtml : '<tr><td colspan="6" style="text-align: center; padding: 25px; color: #64748b;">No se registraron funcionarios con discapacidad.</td></tr>'}
                    </tbody>
                </table>

                <div style="margin-top: 35px; display: flex; justify-content: space-around;">
                    <div style="text-align: center; width: 250px; border-top: 1px solid #0f172a; padding-top: 4px;">
                        <strong style="font-size: 9.5px; color: #0b3c5d;">Responsable de Salud Ocupacional</strong><br/>
                        <span style="font-size: 8.5px; color: #64748b;">Universidad Estatal de Bolívar</span>
                    </div>
                </div>
                ${forPrint ? '<script>window.onload = function() { setTimeout(function() { window.print(); }, 300); };</script>' : ''}
            </body>
            </html>
        `;
    };

    const handlePrintDiscapacidadMatrix = (dataToPrint = filteredDiscapacidad) => {
        printIframeDocument(matrixIframeRef, () => compileDiscapacidadMatrixHtml(dataToPrint, false));
        showSystemToast('Enviando matriz de discapacidad a impresión...');
    };

    
    // --- STATE FOR MATRIZ DE GRUPOS VULNERABLES (PATOLOGÍAS / CONDICIÓN) ---
    const [vulnerablePatologiasSearchTerm, setVulnerablePatologiasSearchTerm] = useState('');
    const [vulnerablePatologiasTabFilter, setVulnerablePatologiasTabFilter] = useState('todos'); // 'todos' | 'diabeticos' | 'hipertensos' | 'adultoMayor' | 'otras'
    const [vulnerablePatologiasSheetTab, setVulnerablePatologiasSheetTab] = useState('hoja1');
    const [isVulnerablePatologiasModalOpen, setIsVulnerablePatologiasModalOpen] = useState(false);
    const [vulnerablePatologiasForm, setVulnerablePatologiasForm] = useState({
        paciente: '',
        cedula: '',
        grupo: 'diabeticos',
        edad: '',
        patologia: ''
    });

    const [vulnerablePatologiasData, setVulnerablePatologiasData] = useState({ diabeticos: [], hipertensos: [], adultoMayor: [], otras: [] });

    const getFilteredVulnerablesPatologias = () => {
        const term = (matrixSearchTerm || vulnerablePatologiasSearchTerm || '').toLowerCase();
        if (!term) return vulnerablePatologiasData;
        return {
            diabeticos: (vulnerablePatologiasData.diabeticos || []).filter(i => (i.nombre || '').toLowerCase().includes(term)),
            hipertensos: (vulnerablePatologiasData.hipertensos || []).filter(i => (i.nombre || '').toLowerCase().includes(term)),
            adultoMayor: (vulnerablePatologiasData.adultoMayor || []).filter(i => (i.nombre || '').toLowerCase().includes(term)),
            otras: (vulnerablePatologiasData.otras || []).filter(i => (i.nombre || '').toLowerCase().includes(term) || (i.patologia || '').toLowerCase().includes(term))
        };
    };

    const compileVulnerablesPatologiasMatrixHtml = (forPrint = false) => {
        const filtered = getFilteredVulnerablesPatologias();
        const diabeticosHtml = (filtered.diabeticos || []).map((item, idx) => `
            <tr>
                <td style="text-align: center; font-weight: bold; width: 35px; padding: 5px; border: 1px solid #cbd5e1;">${escapeHtml(idx + 1)}</td>
                <td style="font-size: 11px; padding: 5px; border: 1px solid #cbd5e1;">${escapeHtml(item.nombre)}</td>
            </tr>
        `).join('');

        const hipertensosHtml = (filtered.hipertensos || []).map((item, idx) => `
            <tr>
                <td style="text-align: center; font-weight: bold; width: 35px; padding: 5px; border: 1px solid #cbd5e1;">${escapeHtml(idx + 1)}</td>
                <td style="font-size: 11px; padding: 5px; border: 1px solid #cbd5e1;">${escapeHtml(item.nombre)}</td>
            </tr>
        `).join('');

        const adultoMayorHtml = (filtered.adultoMayor || []).map((item, idx) => `
            <tr>
                <td style="text-align: center; font-weight: bold; width: 35px; padding: 5px; border: 1px solid #cbd5e1;">${escapeHtml(idx + 1)}</td>
                <td style="font-size: 11px; padding: 5px; border: 1px solid #cbd5e1;">${escapeHtml(item.nombre)} ${item.edad ? '<b>(' + escapeHtml(item.edad) + ')</b>' : ''}</td>
            </tr>
        `).join('');

        const otrasHtml = (filtered.otras || []).map((item, idx) => `
            <tr>
                <td style="text-align: center; font-weight: bold; width: 35px; padding: 5px; border: 1px solid #cbd5e1;">${escapeHtml(idx + 1)}</td>
                <td style="font-size: 10px; padding: 5px; border: 1px solid #cbd5e1;">
                    <div><b>${escapeHtml(item.nombre)}</b></div>
                    <div style="color: #c0392b; font-weight: 600;">${escapeHtml(item.patologia)}</div>
                </td>
            </tr>
        `).join('');

        return `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <title>Matriz Grupo Vulnerable UEB</title>
                <style>
                    @page { size: landscape; margin: 10mm; }
                    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 12px; color: #1e293b; background: #fff; }
                    .header-container { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
                    .header-top { background-color: #0070c0; color: white; text-align: center; font-weight: bold; font-size: 16px; padding: 8px; letter-spacing: 1px; }
                    .header-sub { background-color: #ea580c; color: white; text-align: center; font-weight: bold; font-size: 14px; padding: 6px; letter-spacing: 0.5px; }
                    .grid-table { width: 100%; border-collapse: collapse; vertical-align: top; }
                    .col-cell { vertical-align: top; padding: 0 4px; width: 25%; }
                    .group-table { width: 100%; border-collapse: collapse; border: 1.5px solid #cbd5e1; }
                    .group-table th { padding: 8px 4px; font-size: 11.5px; font-weight: bold; text-align: center; color: white; border: 1px solid #94a3b8; text-transform: uppercase; }
                    .th-diab { background-color: #70ad47; color: #ffffff !important; }
                    .th-hiper { background-color: #8ea9db; color: #1e293b !important; }
                    .th-adulto { background-color: #d9e1f2; color: #1e293b !important; }
                    .th-otras { background-color: #00b050; color: #ffffff !important; }
                    .footer-sig { margin-top: 30px; display: flex; justify-content: space-around; text-align: center; font-size: 11px; }
                    .sig-line { border-top: 1px solid #000; width: 200px; margin: 0 auto; padding-top: 4px; }
                    @media print { .no-print { display: none !important; } }
                </style>
            </head>
            <body>
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                    <img src="${escapeHtml(logoBienestar)}" style="height: 48px; object-fit: contain;" alt="Bienestar Universitario" />
                    <div style="text-align: center;">
                        <div style="font-size: 12px; font-weight: 900; color: #002040;">UNIVERSIDAD ESTATAL DE BOLÍVAR</div>
                        <div style="font-size: 10px; font-weight: 800; color: #0284c7;">DIRECCIÓN DE BIENESTAR UNIVERSITARIO · SALUD OCUPACIONAL</div>
                        <div style="font-size: 11px; font-weight: 900; color: #0f172a; margin-top: 2px;">GRUPO VULNERABLE UNIVERSIDAD ESTATAL DE BOLIVAR</div>
                    </div>
                    <img src="${escapeHtml(logoUebTexto)}" style="height: 38px; object-fit: contain;" alt="UEB Logo" />
                </div>

                <table class="grid-table">
                    <tr>
                        <td class="col-cell">
                            <table class="group-table">
                                <thead><tr><th class="th-diab" colspan="2">DIABÉTICOS</th></tr></thead>
                                <tbody>${diabeticosHtml || '<tr><td colspan="2" style="text-align:center;padding:12px;color:#94a3b8;">Sin registros</td></tr>'}</tbody>
                            </table>
                        </td>
                        <td class="col-cell">
                            <table class="group-table">
                                <thead><tr><th class="th-hiper" colspan="2">HIPERTENSOS</th></tr></thead>
                                <tbody>${hipertensosHtml || '<tr><td colspan="2" style="text-align:center;padding:12px;color:#94a3b8;">Sin registros</td></tr>'}</tbody>
                            </table>
                        </td>
                        <td class="col-cell">
                            <table class="group-table">
                                <thead><tr><th class="th-adulto" colspan="2">ADULTO MAYOR</th></tr></thead>
                                <tbody>${adultoMayorHtml || '<tr><td colspan="2" style="text-align:center;padding:12px;color:#94a3b8;">Sin registros</td></tr>'}</tbody>
                            </table>
                        </td>
                        <td class="col-cell">
                            <table class="group-table">
                                <thead><tr><th class="th-otras" colspan="2">OTRAS ENFERMEDADES</th></tr></thead>
                                <tbody>${otrasHtml || '<tr><td colspan="2" style="text-align:center;padding:12px;color:#94a3b8;">Sin registros</td></tr>'}</tbody>
                            </table>
                        </td>
                    </tr>
                </table>

                <div class="footer-sig">
                    <div><div class="sig-line">MÉDICO OCUPACIONAL</div>UEB Salud Ocupacional</div>
                    <div><div class="sig-line">RESPONSABLE TALENTO HUMANO</div>Universidad Estatal de Bolívar</div>
                </div>
                ${forPrint ? '<script>window.onload = function() { setTimeout(function() { window.print(); }, 300); };</script>' : ''}
            </body>
            </html>
        `;
    };

    const handlePrintVulnerablesPatologiasMatrix = () => {
        printIframeDocument(matrixIframeRef, () => compileVulnerablesPatologiasMatrixHtml(false));
        showSystemToast('Enviando matriz de patologías a impresión...');
    };

    const handleExportVulnerablesPatologiasCSV = () => {
        const headers = [
            "N° DIAB", "GRUPO DE DIABÉTICOS",
            "N° HIPER", "GRUPO DE HIPERTENSOS",
            "N° ADULTO", "GRUPO DE ADULTO MAYOR",
            "N° OTRAS", "OTRAS ENFERMEDADES", "DIAGNÓSTICO"
        ];
        const maxLen = Math.max(
            (vulnerablePatologiasData.diabeticos || []).length,
            (vulnerablePatologiasData.hipertensos || []).length,
            (vulnerablePatologiasData.adultoMayor || []).length,
            (vulnerablePatologiasData.otras || []).length
        );
        const rows = [];
        for (let i = 0; i < maxLen; i++) {
            const diab = (vulnerablePatologiasData.diabeticos || [])[i];
            const hip = (vulnerablePatologiasData.hipertensos || [])[i];
            const adm = (vulnerablePatologiasData.adultoMayor || [])[i];
            const otr = (vulnerablePatologiasData.otras || [])[i];
            rows.push([
                diab ? i + 1 : "",
                diab ? `"${diab.nombre.replace(/"/g, '""')}"` : "",
                hip ? i + 1 : "",
                hip ? `"${hip.nombre.replace(/"/g, '""')}"` : "",
                adm ? i + 1 : "",
                adm ? `"${(adm.nombre + (adm.edad ? ' ' + adm.edad : '')).replace(/"/g, '""')}"` : "",
                otr ? i + 1 : "",
                otr ? `"${otr.nombre.replace(/"/g, '""')}"` : "",
                otr ? `"${(otr.patologia || '').replace(/"/g, '""')}"` : ""
            ]);
        }
        const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map(e => e.join(";"))].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `MATRIZ_DE_GRUPO_VULNERABLE_UEB.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSaveVulnerablePatologiaRecord = (e) => {
        e.preventDefault();
        const nameUpper = patientSelected 
            ? `${patientSelected.nombres} ${patientSelected.apellidos}`.toUpperCase()
            : (vulnerablePatologiasForm.paciente || '').toUpperCase();

        if (!nameUpper) return;

        const grupoTarget = vulnerablePatologiasForm.grupo || 'diabeticos';
        const currentList = vulnerablePatologiasData[grupoTarget] || [];
        const newItem = {
            id: currentList.length + 1,
            nombre: nameUpper,
            edad: vulnerablePatologiasForm.edad ? `${vulnerablePatologiasForm.edad} AÑOS` : '',
            patologia: (vulnerablePatologiasForm.patologia || '').toUpperCase()
        };

        setVulnerablePatologiasData({
            ...vulnerablePatologiasData,
            [grupoTarget]: [...currentList, newItem]
        });

        setIsVulnerablePatologiasModalOpen(false);
        setVulnerablePatologiasForm({ paciente: '', cedula: '', grupo: 'diabeticos', edad: '', patologia: '' });
        setPatientSelected(null);
        setPatientSearchTerm('');
    };


    



    
    // --- STATE FOR MATRIZ DE PERSONAL NUEVO QUE INGRESÓ (UEB) ---
    const [personalNuevoSearchTerm, setPersonalNuevoSearchTerm] = useState('');
    const [personalNuevoSelectedYear, setPersonalNuevoSelectedYear] = useState('TODOS');
    const [personalNuevoSheetTab, setPersonalNuevoSheetTab] = useState('hoja1');
    const [isPersonalNuevoModalOpen, setIsPersonalNuevoModalOpen] = useState(false);
    const [personalNuevoForm, setPersonalNuevoForm] = useState({
        paciente: '',
        cedula: '',
        fechaIngreso: localDateStr(),
        cargo: ''
    });

    const [personalNuevoData, setPersonalNuevoData] = useState([]);

    const filteredPersonalNuevo = personalNuevoData.filter(item => {
        const term = (matrixSearchTerm || personalNuevoSearchTerm || '').toLowerCase();
        const matchesSearch = !term ||
            (item.paciente || '').toLowerCase().includes(term) ||
            (item.cedula || '').includes(term) ||
            (item.cargo || '').toLowerCase().includes(term);
        if (!matchesSearch) return false;
        if (matrixDateFilter && !matchesDateFilter(item.fechaIngreso, matrixDateFilter)) return false;
        if (personalNuevoSelectedYear !== 'TODOS' && String(item.anio) !== String(personalNuevoSelectedYear)) return false;
        return true;
    });

    const compilePersonalNuevoMatrixHtml = (dataToPrint = filteredPersonalNuevo, forPrint = false) => {
        const list = dataToPrint || filteredPersonalNuevo;
        const anioStr = personalNuevoSelectedYear !== 'TODOS' ? personalNuevoSelectedYear : 'HISTÓRICO';
        const rowsHtml = list.map((item, idx) => `
            <tr>
                <td style="text-align: center; font-weight: bold; width: 35px; padding: 7px; border: 1px solid #cbd5e1;">${idx + 1}</td>
                <td style="font-weight: bold; color: #1e293b; padding: 7px; border: 1px solid #cbd5e1;">${escapeHtml(item.paciente)}</td>
                <td style="text-align: center; font-family: monospace; font-size: 11px; padding: 7px; border: 1px solid #cbd5e1;">${escapeHtml(item.cedula)}</td>
                <td style="text-align: center; font-weight: bold; color: #15803d; padding: 7px; border: 1px solid #cbd5e1;">${escapeHtml(item.fechaIngreso)}</td>
                <td style="font-weight: bold; color: #334155; padding: 7px; border: 1px solid #cbd5e1;">${escapeHtml(item.cargo)}</td>
            </tr>
        `).join('');

        return `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <title>Matriz de Personal Nuevo UEB ${escapeHtml(anioStr)}</title>
                <style>
                    @page { size: landscape; margin: 10mm; }
                    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 12px; color: #1e293b; background: #fff; }
                    .header-banner { background-color: #ea580c; color: white; text-align: center; font-weight: bold; font-size: 16px; padding: 10px; border-radius: 4px; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px; }
                    table.data-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10.5px; }
                    table.data-table th { background-color: #70ad47; color: #ffffff; padding: 8px; text-align: center; font-weight: bold; font-size: 10.5px; border: 1px solid #94a3b8; text-transform: uppercase; }
                    table.data-table td { padding: 7px 8px; border: 1px solid #cbd5e1; }
                    .footer-sig { margin-top: 35px; display: flex; justify-content: space-around; text-align: center; font-size: 11px; }
                    .sig-line { border-top: 1px solid #000; width: 220px; margin: 0 auto; padding-top: 4px; }
                    @media print { .no-print { display: none !important; } }
                </style>
            </head>
            <body>
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                    <img src="${logoBienestar}" style="height: 48px; object-fit: contain;" alt="Bienestar Universitario" />
                    <div style="text-align: center;">
                        <div style="font-size: 12px; font-weight: 900; color: #002040;">UNIVERSIDAD ESTATAL DE BOLÍVAR</div>
                        <div style="font-size: 10px; font-weight: 800; color: #70ad47;">DIRECCIÓN DE BIENESTAR UNIVERSITARIO · SALUD OCUPACIONAL</div>
                    </div>
                    <img src="${logoUebTexto}" style="height: 38px; object-fit: contain;" alt="UEB Logo" />
                </div>
                <div class="header-banner">
                    Personal Nuevo que Ingresó en el Año ${escapeHtml(anioStr)}
                </div>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th style="background-color: #0f172a; width: 40px;">N°</th>
                            <th>NOMBRE Y APELLIDO</th>
                            <th style="width: 130px;">CÉDULA</th>
                            <th style="width: 130px;">FECHA DE INGRESO</th>
                            <th>CARGO</th>
                        </tr>
                    </thead>
                    <tbody>${rowsHtml.length > 0 ? rowsHtml : '<tr><td colspan="5" style="text-align:center;padding:25px;color:#94a3b8;">No se encontraron registros de personal nuevo.</td></tr>'}</tbody>
                </table>
                <div class="footer-sig">
                    <div><div class="sig-line">MÉDICO OCUPACIONAL</div>UEB Salud Ocupacional</div>
                    <div><div class="sig-line">DIRECTOR TALENTO HUMANO</div>Universidad Estatal de Bolívar</div>
                </div>
                ${forPrint ? '<script>window.onload = function() { setTimeout(function() { window.print(); }, 300); };</script>' : ''}
            </body>
            </html>
        `;
    };

    const handlePrintPersonalNuevoMatrix = (dataToPrint = filteredPersonalNuevo) => {
        printIframeDocument(matrixIframeRef, () => compilePersonalNuevoMatrixHtml(dataToPrint, false));
        showSystemToast('Enviando matriz de personal nuevo a impresión...');
    };

    const handleExportPersonalNuevoCSV = () => {
        const headers = ["NOMBRE Y APELLIDO", "CEDULA", "FECHA DE INGRESO", "CARGO"];
        const rows = filteredPersonalNuevo.map(item => [
            `"${(item.paciente || '').replace(/"/g, '""')}"`,
            `"${(item.cedula || '').replace(/"/g, '""')}"`,
            `"${(item.fechaIngreso || '').replace(/"/g, '""')}"`,
            `"${(item.cargo || '').replace(/"/g, '""')}"`
        ]);
        const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map(e => e.join(";"))].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `MATRIZ_DE_PERSONAL_NUEVO_UEB_${personalNuevoSelectedYear}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSavePersonalNuevoRecord = (e) => {
        e.preventDefault();
        const nameUpper = patientSelected 
            ? `${patientSelected.nombres} ${patientSelected.apellidos}`.toUpperCase()
            : (personalNuevoForm.paciente || '').toUpperCase();

        if (!nameUpper) return;

        const dateVal = personalNuevoForm.fechaIngreso || localDateStr();
        const yearVal = dateVal.split('-')[0] || '2026';

        const newRecord = {
            id: personalNuevoData.length + 1,
            paciente: nameUpper,
            cedula: patientSelected?.cedula || personalNuevoForm.cedula || '0201234567',
            fechaIngreso: dateVal,
            anio: yearVal,
            cargo: (personalNuevoForm.cargo || 'SERVIDIOR INSTITUCIONAL').toUpperCase()
        };

        setPersonalNuevoData([...personalNuevoData, newRecord]);
        setIsPersonalNuevoModalOpen(false);
        setPersonalNuevoForm({ paciente: '', cedula: '', fechaIngreso: localDateStr(), cargo: '' });
        setPatientSelected(null);
        setPatientSearchTerm('');
    };


    const handleSaveDiscapacidadRecord = (e) => {
        e.preventDefault();
        const pacienteNombreFinal = patientSelected
            ? `${patientSelected.nombres} ${patientSelected.apellidos}`.trim().toUpperCase()
            : (discapacidadForm.paciente || '').toUpperCase();

        if (!pacienteNombreFinal) {
            alert('Por favor seleccione un paciente o ingrese el nombre.');
            return;
        }

        const newRecord = {
            id: Date.now(),
            numero: discapacidadData.length + 1,
            paciente: pacienteNombreFinal,
            cedula: patientSelected?.cedula || discapacidadForm.cedula || '0201234567',
            tipoDiscapacidad: (discapacidadForm.tipoDiscapacidad || 'FÍSICA').toUpperCase(),
            porcentaje: discapacidadForm.porcentaje.includes('%') ? discapacidadForm.porcentaje : `${discapacidadForm.porcentaje}%`,
            cargo: (discapacidadForm.cargo || 'DOCENTE TITULAR').toUpperCase(),
            dependencia: (discapacidadForm.dependencia || 'UNIVERSIDAD ESTATAL DE BOLÍVAR').toUpperCase(),
            condicionLaboral: (discapacidadForm.condicionLaboral || 'NOMBRAMIENTO').toUpperCase()
        };

        setDiscapacidadData([...discapacidadData, newRecord]);
        setIsDiscapacidadModalOpen(false);
        setDiscapacidadForm({
            paciente: '',
            cedula: '',
            tipoDiscapacidad: 'FÍSICA',
            porcentaje: '40%',
            cargo: 'DOCENTE TITULAR',
            dependencia: 'FACULTAD DE CIENCIAS ADMINISTRATIVAS',
            condicionLaboral: 'NOMBRAMIENTO'
        });
    };

    // Handlers for Exámenes Periódicos por Mes
    const filteredPeriodicos = periodicosData.filter(item => {
        const matchesSearch = (item.mes || '').toLowerCase().includes(periodicosSearchTerm.toLowerCase());
        if (!matchesSearch) return false;

        if (periodicosSelectedYear !== 'TODOS' && String(item.anio) !== String(periodicosSelectedYear)) {
            return false;
        }

        return true;
    });

    const totalPeriodicosAcumulado = filteredPeriodicos.reduce((sum, item) => sum + (parseInt(item.cantidad) || 0), 0);

    const handlePrintPeriodicosMatrix = (dataToPrint = filteredPeriodicos) => {
        const printWindow = window.open('', '_blank', 'width=1150,height=850');
        if (!printWindow) {
            alert('Por favor permita ventanas emergentes para imprimir la matriz.');
            return;
        }

        const anioStr = periodicosSelectedYear !== 'TODOS' ? periodicosSelectedYear : 'HISTÓRICO';
        const totalSum = dataToPrint.reduce((sum, item) => sum + (parseInt(item.cantidad) || 0), 0);

        const rowsHtml = dataToPrint.map((item, idx) => `
            <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                <td style="padding: 7px 12px; border: 1px solid #000000; font-weight: 800; font-size: 10px; color: #0b3c5d;">${escapeHtml((item.mes || '').toUpperCase())}</td>
                <td style="padding: 7px 12px; border: 1px solid #000000; text-align: center; font-weight: bold; font-size: 10px; color: #334155;">${escapeHtml(item.cantidad || 0)}</td>
                <td style="padding: 7px 12px; border: 1px solid #000000; text-align: center; font-weight: 900; font-size: 10px; color: #0284c7;">${escapeHtml(item.cantidad || 0)}</td>
            </tr>
        `).join('');

        printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8"/>
                <title>MATRIZ DE EXÁMENES MÉDICOS Y FICHAS PERIÓDICAS - UEB ${escapeHtml(anioStr)}</title>
                <style>
                    @page { size: A4 landscape; margin: 8mm 10mm; }
                    * { box-sizing: border-box; }
                    body { font-family: Arial, Helvetica, sans-serif; font-size: 9.5px; color: #000; background: #fff; margin: 0; padding: 0; }
                    .orange-banner { background-color: #ea580c; color: #ffffff; border: 1px solid #000; padding: 10px 14px; margin-bottom: 8px; }
                    .banner-title { font-size: 15px; font-weight: 900; color: #ffffff; text-transform: uppercase; margin: 0; text-align: center; letter-spacing: 0.5px; }
                    table.matrix-table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 9.5px; }
                    table.matrix-table th { background: #0284c7; color: #ffffff; padding: 8px 6px; font-weight: 900; text-transform: uppercase; font-size: 9.5px; text-align: center; border: 1px solid #000; letter-spacing: 0.3px; }
                    @media print { .no-print { display: none !important; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
                </style>
            </head>
            <body>
                <div class="no-print" style="padding: 10px; background: #ffedd5; border-bottom: 1px solid #fed7aa; display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <span style="font-weight: bold; color: #c2410c; font-size: 12px;">Vista previa de impresión - UEB Matriz de Exámenes Periódicos por Mes (${escapeHtml(anioStr)})</span>
                    <button onclick="window.print()" style="background: #ea580c; color: #ffffff; border: none; padding: 6px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">
                        Imprimir Matriz Oficial (A4 Landscape)
                    </button>
                </div>

                <div style="padding: 4px;">
                    <div class="orange-banner">
                        <div style="display: flex; align-items: center; justify-content: space-between;">
                            <strong style="font-size: 18px; color: #ffffff;">UEB</strong>
                            <h1 class="banner-title">Matriz de EXAMENES Medicos y Fichas Periodicos ${escapeHtml(anioStr)}</h1>
                            <span style="font-size: 9px; font-weight: bold; background: #ffffff; color: #ea580c; padding: 2px 8px; borderRadius: 4px;">SALUD OCUPACIONAL</span>
                        </div>
                    </div>

                    <table class="matrix-table">
                        <thead>
                            <tr>
                                <th style="width: 250px;">MES</th>
                                <th>CANTIDAD DE EXÁMENES Y FICHAS PERIÓDICAS REALIZADAS</th>
                                <th style="width: 150px;">TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml.length > 0 ? rowsHtml : '<tr><td colspan="3" style="text-align: center; padding: 20px;">No se registraron exámenes para este período.</td></tr>'}
                        </tbody>
                        <tfoot>
                            <tr style="background: #e0f2fe; font-weight: 900; border-top: 2px solid #000000;">
                                <td style="padding: 8px 12px; border: 1px solid #000000; text-align: right; text-transform: uppercase;">TOTAL ACUMULADO:</td>
                                <td style="padding: 8px 12px; border: 1px solid #000000; text-align: center; font-size: 11px; color: #0b3c5d;">${escapeHtml(totalSum)} EVALUACIONES</td>
                                <td style="padding: 8px 12px; border: 1px solid #000000; text-align: center; font-size: 12px; color: #0b3c5d;">${escapeHtml(totalSum)}</td>
                            </tr>
                        </tfoot>
                    </table>

                    <div style="margin-top: 35px; display: flex; justify-content: space-around;">
                        <div style="text-align: center; width: 250px; border-top: 1px solid #0f172a; padding-top: 4px;">
                            <strong style="font-size: 9.5px; color: #0b3c5d;">Responsable de Salud Ocupacional</strong><br/>
                            <span style="font-size: 8.5px; color: #64748b;">Universidad Estatal de Bolívar</span>
                        </div>
                    </div>
                </div>

                <script>window.onload = function() { setTimeout(function() { window.print(); }, 400); };</script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleSavePeriodicosRecord = (e) => {
        e.preventDefault();
        const cnt = parseInt(periodicosForm.cantidad) || 0;
        const mStr = (periodicosForm.mes || 'ENERO').toUpperCase();
        const aNum = parseInt(periodicosForm.anio) || 2022;

        const existingIdx = periodicosData.findIndex(x => x.mes.toUpperCase() === mStr && String(x.anio) === String(aNum));

        if (existingIdx >= 0) {
            const updated = [...periodicosData];
            updated[existingIdx].cantidad = cnt;
            setPeriodicosData(updated);
        } else {
            const newRecord = {
                id: Date.now(),
                mes: mStr,
                anio: aNum,
                cantidad: cnt
            };
            setPeriodicosData([...periodicosData, newRecord]);
        }

        setIsPeriodicosModalOpen(false);
    };

    // Handlers for Enfermedades Nuevas (Incidencia)
    const filteredNuevas = nuevasData.filter(item => {
        const matchesSearch =
            (item.paciente || '').toLowerCase().includes(nuevasSearchTerm.toLowerCase()) ||
            (item.cedula || '').includes(nuevasSearchTerm) ||
            (item.patologiaNueva || '').toLowerCase().includes(nuevasSearchTerm.toLowerCase());

        if (!matchesSearch) return false;

        if (nuevasSelectedYear !== 'TODOS' && String(item.anio) !== String(nuevasSelectedYear)) {
            return false;
        }

        return true;
    });

    const handlePrintNuevasMatrix = (dataToPrint = filteredNuevas) => {
        const printWindow = window.open('', '_blank', 'width=1150,height=850');
        if (!printWindow) {
            alert('Por favor permita ventanas emergentes para imprimir la matriz.');
            return;
        }

        const anioStr = nuevasSelectedYear !== 'TODOS' ? nuevasSelectedYear : 'HISTÓRICO';

        const rowsHtml = dataToPrint.map((item, idx) => `
            <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                <td style="padding: 7px 10px; border: 1px solid #000000; font-weight: 800; font-size: 10px; color: #0b3c5d;">${escapeHtml((item.paciente || '').toUpperCase())}<br/><small style="color:#64748b; font-weight:normal;">C.I: ${escapeHtml(item.cedula || 'N/D')}</small></td>
                <td style="padding: 7px 10px; border: 1px solid #000000; font-weight: 800; font-size: 10px; color: #15803d;">${escapeHtml((item.patologiaNueva || '').toUpperCase())}</td>
                <td style="padding: 7px 10px; border: 1px solid #000000; text-align: center; font-weight: bold; font-size: 10px; color: #ca8a04;">${escapeHtml(item.fechaAparecimiento || 'N/D')}</td>
            </tr>
        `).join('');

        printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8"/>
                <title>MATRIZ DE ENFERMEDADES NUEVAS - UEB ${escapeHtml(anioStr)}</title>
                <style>
                    @page { size: A4 landscape; margin: 8mm 10mm; }
                    * { box-sizing: border-box; }
                    body { font-family: Arial, Helvetica, sans-serif; font-size: 9.5px; color: #000; background: #fff; margin: 0; padding: 0; }
                    .orange-banner { background-color: #ea580c; color: #ffffff; border: 1px solid #000; padding: 10px 14px; margin-bottom: 8px; }
                    .banner-title { font-size: 16px; font-weight: 900; color: #ffffff; text-transform: uppercase; margin: 0; text-align: center; letter-spacing: 0.5px; }
                    table.matrix-table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 9.5px; }
                    table.matrix-table th { padding: 8px 6px; font-weight: 900; text-transform: uppercase; font-size: 9.5px; text-align: center; border: 1px solid #000; letter-spacing: 0.3px; }
                    .th-azul { background: #0070c0; color: #ffffff; }
                    .th-verde { background: #00b050; color: #ffffff; }
                    .th-amarillo { background: #eab308; color: #000000; }
                    @media print { .no-print { display: none !important; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
                </style>
            </head>
            <body>
                <div class="no-print" style="padding: 10px; background: #ffedd5; border-bottom: 1px solid #fed7aa; display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <span style="font-weight: bold; color: #c2410c; font-size: 12px;">Vista previa de impresión - UEB Matriz de Enfermedades Nuevas (Incidencia ${escapeHtml(anioStr)})</span>
                    <button onclick="window.print()" style="background: #ea580c; color: #ffffff; border: none; padding: 6px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">
                        Imprimir Matriz Oficial (A4 Landscape)
                    </button>
                </div>

                <div style="padding: 4px;">
                    <div class="orange-banner">
                        <div style="display: flex; align-items: center; justify-content: space-between;">
                            <strong style="font-size: 18px; color: #ffffff;">UEB</strong>
                            <h1 class="banner-title">EMFERMEDAES NUEVAS ${escapeHtml(anioStr)} (INCINDECIA)</h1>
                            <span style="font-size: 9px; font-weight: bold; background: #ffffff; color: #ea580c; padding: 2px 8px; borderRadius: 4px;">SALUD OCUPACIONAL</span>
                        </div>
                    </div>

                    <table class="matrix-table">
                        <thead>
                            <tr>
                                <th class="th-azul">Nombres y Apellidos</th>
                                <th class="th-verde">Patología Nueva</th>
                                <th class="th-amarillo" style="width: 180px;">Fecha de Aparecimiento</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml.length > 0 ? rowsHtml : '<tr><td colspan="3" style="text-align: center; padding: 20px;">No se registraron enfermedades nuevas en este período.</td></tr>'}
                        </tbody>
                    </table>

                    <div style="margin-top: 35px; display: flex; justify-content: space-around;">
                        <div style="text-align: center; width: 250px; border-top: 1px solid #0f172a; padding-top: 4px;">
                            <strong style="font-size: 9.5px; color: #0b3c5d;">Responsable de Salud Ocupacional</strong><br/>
                            <span style="font-size: 8.5px; color: #64748b;">Universidad Estatal de Bolívar</span>
                        </div>
                    </div>
                </div>

                <script>window.onload = function() { setTimeout(function() { window.print(); }, 400); };</script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleSaveNuevasRecord = (e) => {
        e.preventDefault();
        const pacienteNombreFinal = patientSelected
            ? `${patientSelected.nombres} ${patientSelected.apellidos}`.trim().toUpperCase()
            : (nuevasForm.paciente || '').toUpperCase();

        if (!pacienteNombreFinal) {
            alert('Por favor seleccione un paciente o ingrese el nombre.');
            return;
        }

        let anioVal = 2022;
        if (nuevasForm.fechaAparecimiento) {
            const parts = nuevasForm.fechaAparecimiento.split(/[-/]/);
            if (parts.length === 3) {
                if (parts[0].length === 4) anioVal = parseInt(parts[0]);
                else if (parts[2].length === 4) anioVal = parseInt(parts[2]);
            }
        }

        const newRecord = {
            id: Date.now(),
            numero: nuevasData.length + 1,
            paciente: pacienteNombreFinal,
            cedula: patientSelected?.cedula || nuevasForm.cedula || '0201234567',
            patologiaNueva: (nuevasForm.patologiaNueva || 'DIAGNÓSTICO INCIDENTE').toUpperCase(),
            fechaAparecimiento: nuevasForm.fechaAparecimiento || new Date().toLocaleDateString('es-EC'),
            anio: anioVal
        };

        setNuevasData([...nuevasData, newRecord]);
        setIsNuevasModalOpen(false);
        setNuevasForm({
            paciente: '',
            cedula: '',
            patologiaNueva: '',
            fechaAparecimiento: localDateStr()
        });
    };

    // Handlers for Riesgo Psicosocial
    const filteredPsicosocial = psicosocialData.filter(item => {
        const term = (matrixSearchTerm || psicosocialSearchTerm || '').toLowerCase();
        const matchesSearch = !term ||
            (item.paciente || '').toLowerCase().includes(term) ||
            (item.cedula || '').includes(term) ||
            (item.tiposervidor || '').toLowerCase().includes(term) ||
            (item.diagnostico || '').toLowerCase().includes(term);

        if (!matchesSearch) return false;

        if (psicosocialFilterTipo !== 'todos' && item.tiposervidor.toUpperCase() !== psicosocialFilterTipo.toUpperCase()) {
            return false;
        }

        return true;
    });

    const compilePsicosocialMatrixHtml = (dataToPrint = filteredPsicosocial, forPrint = false) => {
        const list = dataToPrint || filteredPsicosocial;
        const rowsHtml = list.map((item, idx) => `
            <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                <td style="padding: 6px 8px; border: 1px solid #000000; text-align: center; font-weight: bold; font-size: 10px;">${idx + 1}</td>
                <td style="padding: 6px 8px; border: 1px solid #000000; font-weight: 800; font-size: 10px; color: #0b3c5d;">${escapeHtml((item.paciente || '').toUpperCase())}<br/><small style="color:#64748b; font-weight:normal;">C.I: ${escapeHtml(item.cedula || 'N/D')}</small></td>
                <td style="padding: 6px 8px; border: 1px solid #000000; font-weight: 700; font-size: 9.5px; color: #334155; text-align: center;">${escapeHtml((item.tiposervidor || '').toUpperCase())}</td>
                <td style="padding: 6px 8px; border: 1px solid #000000; font-weight: 800; font-size: 10px; color: #b91c1c;">${escapeHtml((item.diagnostico || '').toUpperCase())}</td>
            </tr>
        `).join('');

        return `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8"/>
                <title>MATRIZ DE FUNCIONARIOS CON RIESGO PSICOSOCIAL - UEB</title>
                <style>
                    @page { size: A4 landscape; margin: 8mm 10mm; }
                    * { box-sizing: border-box; }
                    body { font-family: Arial, Helvetica, sans-serif; font-size: 9.5px; color: #000; background: #fff; margin: 0; padding: 12px; }
                    .blue-banner { background-color: #0070c0; color: #ffffff; border: 1px solid #000; padding: 10px 14px; margin-bottom: 8px; }
                    .banner-title { font-size: 15px; font-weight: 900; color: #ffffff; text-transform: uppercase; margin: 0; text-align: center; }
                    table.matrix-table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 9.5px; }
                    table.matrix-table th { background: #ea580c; color: #ffffff; padding: 8px 6px; font-weight: 900; text-transform: uppercase; font-size: 9.5px; text-align: center; border: 1px solid #000; letter-spacing: 0.3px; }
                    @media print { .no-print { display: none !important; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
                </style>
            </head>
            <body>
                <div class="blue-banner" style="background: #ffffff; border: 1.5px solid #002040; color: #0f172a; padding: 6px 12px; margin-bottom: 8px;">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <img src="${logoBienestar}" style="height: 48px; object-fit: contain;" alt="Bienestar Universitario" />
                        <div style="text-align: center; flex: 1; padding: 0 10px;">
                            <div style="font-size: 11px; font-weight: 900; color: #002040;">UNIVERSIDAD ESTATAL DE BOLÍVAR</div>
                            <div style="font-size: 9px; font-weight: 800; color: #ea580c;">DIRECCIÓN DE BIENESTAR UNIVERSITARIO · SALUD OCUPACIONAL</div>
                            <h1 class="banner-title" style="margin: 2px 0 0 0; font-size: 12px; color: #0b3c5d;">FUNCIONARIOS CON ANSIEDAD Y DEPRESIÓN - UNIVERSIDAD ESTATAL DE BOLÍVAR</h1>
                        </div>
                        <img src="${logoUebTexto}" style="height: 38px; object-fit: contain;" alt="UEB" />
                    </div>
                </div>

                <table class="matrix-table">
                    <thead>
                        <tr>
                            <th style="width: 60px;">NÚMERO</th>
                            <th>NOMBRES Y APELLIDOS</th>
                            <th style="width: 220px;">TIPO DE SERVIDOR</th>
                            <th>DIAGNÓSTICO</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml.length > 0 ? rowsHtml : '<tr><td colspan="4" style="text-align: center; padding: 25px; color: #64748b;">No se registraron casos de riesgo psicosocial.</td></tr>'}
                    </tbody>
                </table>

                <div style="margin-top: 35px; display: flex; justify-content: space-around;">
                    <div style="text-align: center; width: 250px; border-top: 1px solid #0f172a; padding-top: 4px;">
                        <strong style="font-size: 9.5px; color: #0b3c5d;">Responsable de Salud Ocupacional y Psicología</strong><br/>
                        <span style="font-size: 8.5px; color: #64748b;">Universidad Estatal de Bolívar</span>
                    </div>
                </div>
                ${forPrint ? '<script>window.onload = function() { setTimeout(function() { window.print(); }, 300); };</script>' : ''}
            </body>
            </html>
        `;
    };

    const handlePrintPsicosocialMatrix = (dataToPrint = filteredPsicosocial) => {
        printIframeDocument(matrixIframeRef, () => compilePsicosocialMatrixHtml(dataToPrint, false));
        showSystemToast('Enviando matriz de riesgo psicosocial a impresión...');
    };

    const handleSavePsicosocialRecord = (e) => {
        e.preventDefault();
        const pacienteNombreFinal = patientSelected
            ? `${patientSelected.nombres} ${patientSelected.apellidos}`.trim().toUpperCase()
            : (psicosocialForm.paciente || '').toUpperCase();

        if (!pacienteNombreFinal) {
            alert('Por favor seleccione un paciente o ingrese el nombre.');
            return;
        }

        const newRecord = {
            id: Date.now(),
            numero: psicosocialData.length + 1,
            paciente: pacienteNombreFinal,
            cedula: patientSelected?.cedula || psicosocialForm.cedula || '0201234567',
            tiposervidor: (psicosocialForm.tiposervidor || 'DOCENTE TITULAR').toUpperCase(),
            diagnostico: (psicosocialForm.diagnostico || 'DEPRESION Y ANSIEDAD').toUpperCase()
        };

        setPsicosocialData([...psicosocialData, newRecord]);
        setIsPsicosocialModalOpen(false);
        setPsicosocialForm({
            paciente: '',
            cedula: '',
            tiposervidor: 'DOCENTE TITULAR',
            diagnostico: 'DEPRESION Y ANSIEDAD',
            observaciones: 'SEGUIMIENTO POR SALUD OCUPACIONAL Y PSICOLOGÍA'
        });
    };

    const handleDeletePsicosocialRecord = (id) => {
        if (window.confirm('¿Está seguro de eliminar este registro de la matriz de riesgo psicosocial?')) {
            setPsicosocialData(prev => prev.filter(item => item.id !== id));
        }
    };

    const handleExportPsicosocialCSV = () => {
        const headers = ["NUMERO", "NOMBRES Y APELLIDOS", "TIPO DE SERVIDOR", "DIGNOSTICO"];
        const rows = filteredPsicosocial.map((item, idx) => [
            idx + 1,
            `"${(item.paciente || '').replace(/"/g, '""')}"`,
            `"${(item.tiposervidor || '').replace(/"/g, '""')}"`,
            `"${(item.diagnostico || '').replace(/"/g, '""')}"`
        ]);
        const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map(e => e.join(";"))].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `MATRIZ_FUNCIONARIOS_CON_RIESGO_PSICOSOCIAL_UEB.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Handlers for Enfermedades Nuevas (Incidencia UEB)
    const filteredEnfermedadesNuevas = enfermedadesNuevasData.filter(item => {
        const term = (matrixSearchTerm || enfermedadesNuevasSearchTerm || '').toLowerCase();
        const matchesSearch = !term ||
            (item.paciente || '').toLowerCase().includes(term) ||
            (item.cedula || '').includes(term) ||
            (item.patologiaNueva || '').toLowerCase().includes(term) ||
            (item.fechaAparecimiento || '').toLowerCase().includes(term);

        const matchesYear = enfermedadesNuevasFilterYear === 'TODOS' ||
            (item.year && item.year === enfermedadesNuevasFilterYear) ||
            (item.fechaAparecimiento && item.fechaAparecimiento.includes(enfermedadesNuevasFilterYear));

        if (!matchesSearch || !matchesYear) return false;
        if (matrixDateFilter && !matchesDateFilter(item.fechaAparecimiento, matrixDateFilter)) return false;

        return true;
    });

    const compileEnfermedadesNuevasMatrixHtml = (dataToPrint = filteredEnfermedadesNuevas, forPrint = false) => {
        const list = dataToPrint || filteredEnfermedadesNuevas;
        const rowsHtml = list.map((item, idx) => `
            <tr style="background: ${escapeHtml(idx % 2 === 0 ? '#ffffff' : '#f8fafc')};">
                <td style="padding: 7px 10px; border: 1px solid #000000; font-weight: 800; font-size: 10px; color: #0b3c5d;">${escapeHtml((item.paciente || '').toUpperCase())}<br/><small style="color:#64748b; font-weight:normal;">C.I: ${escapeHtml(item.cedula || 'N/D')}</small></td>
                <td style="padding: 7px 10px; border: 1px solid #000000; font-weight: 800; font-size: 10px; color: #15803d;">${escapeHtml((item.patologiaNueva || '').toUpperCase())}</td>
                <td style="padding: 7px 10px; border: 1px solid #000000; font-weight: 700; font-size: 9.5px; color: #334155; text-align: center;">${escapeHtml(item.fechaAparecimiento || '')}</td>
            </tr>
        `).join('');

        return `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8"/>
                <title>MATRIZ DE ENFERMEDADES NUEVAS (INCIDENCIA) - UEB</title>
                <style>
                    @page { size: A4 landscape; margin: 8mm 10mm; }
                    * { box-sizing: border-box; }
                    body { font-family: Arial, Helvetica, sans-serif; font-size: 9.5px; color: #000; background: #fff; margin: 0; padding: 12px; }
                    .banner { background-color: #ed7d31; color: #000; border: 1px solid #000; padding: 10px 14px; margin-bottom: 8px; }
                    .banner-title { font-size: 15px; font-weight: 900; color: #000; text-transform: uppercase; margin: 0; text-align: center; }
                    table.matrix-table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 9.5px; }
                    table.matrix-table th { padding: 8px 6px; font-weight: 900; text-transform: uppercase; font-size: 9.5px; text-align: center; border: 1px solid #000; letter-spacing: 0.3px; }
                    @media print { .no-print { display: none !important; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
                </style>
            </head>
            <body>
                <div class="banner" style="background: #ffffff; border: 1.5px solid #c2410c; padding: 6px 12px; margin-bottom: 8px;">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <img src="${escapeHtml(logoBienestar)}" style="height: 48px; object-fit: contain;" alt="Bienestar Universitario" />
                        <div style="text-align: center; flex: 1; padding: 0 10px;">
                            <div style="font-size: 11px; font-weight: 900; color: #002040;">UNIVERSIDAD ESTATAL DE BOLÍVAR</div>
                            <div style="font-size: 9px; font-weight: 800; color: #c2410c;">DIRECCIÓN DE BIENESTAR UNIVERSITARIO · SALUD OCUPACIONAL</div>
                            <h1 class="banner-title" style="margin: 2px 0 0 0; font-size: 13px; color: #000;">ENFERMEDADES NUEVAS (INCIDENCIA)</h1>
                        </div>
                        <img src="${escapeHtml(logoUebTexto)}" style="height: 38px; object-fit: contain;" alt="UEB" />
                    </div>
                </div>

                <table class="matrix-table">
                    <thead>
                        <tr>
                            <th style="background: #4472c4; color: #ffffff; width: 45%;">NOMBRES Y APELLIDOS</th>
                            <th style="background: #00b050; color: #ffffff; width: 35%;">PATOLOGÍA NUEVA</th>
                            <th style="background: #ffc000; color: #000000; width: 20%;">FECHA DE APARECIMIENTO</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml.length > 0 ? rowsHtml : '<tr><td colspan="3" style="text-align: center; padding: 25px; color: #64748b;">No se registraron enfermedades nuevas en el período.</td></tr>'}
                    </tbody>
                </table>

                <div style="margin-top: 35px; display: flex; justify-content: space-around;">
                    <div style="text-align: center; width: 250px; border-top: 1px solid #0f172a; padding-top: 4px;">
                        <strong style="font-size: 9.5px; color: #0b3c5d;">Médico Ocupacional</strong><br/>
                        <span style="font-size: 8.5px; color: #64748b;">Universidad Estatal de Bolívar</span>
                    </div>
                </div>
                ${forPrint ? '<script>window.onload = function() { setTimeout(function() { window.print(); }, 300); };</script>' : ''}
            </body>
            </html>
        `;
    };

    const handlePrintEnfermedadesNuevasMatrix = (dataToPrint = filteredEnfermedadesNuevas) => {
        printIframeDocument(matrixIframeRef, () => compileEnfermedadesNuevasMatrixHtml(dataToPrint, false));
        showSystemToast('Enviando matriz de enfermedades nuevas a impresión...');
    };

    const handleSaveEnfermedadesNuevasRecord = (e) => {
        e.preventDefault();
        const pacienteNombreFinal = patientSelected
            ? `${patientSelected.nombres} ${patientSelected.apellidos}`.trim().toUpperCase()
            : (enfermedadesNuevasForm.paciente || '').toUpperCase();

        if (!pacienteNombreFinal) {
            alert('Por favor seleccione un paciente o ingrese el nombre.');
            return;
        }

        const dateVal = enfermedadesNuevasForm.fechaAparecimiento || localDateStr();
        // Format to M/D/YYYY or Keep user input
        const parts = dateVal.split('-');
        const formattedDate = parts.length === 3 ? `${parseInt(parts[1])}/${parseInt(parts[2])}/${parts[0]}` : dateVal;
        const yearVal = parts.length === 3 ? parts[0] : '2026';

        const newRecord = {
            id: Date.now(),
            paciente: pacienteNombreFinal,
            cedula: patientSelected?.cedula || enfermedadesNuevasForm.cedula || '0201234567',
            patologiaNueva: (enfermedadesNuevasForm.patologiaNueva || 'PATOLOGÍA NO ESPECIFICADA').toUpperCase(),
            fechaAparecimiento: formattedDate,
            year: yearVal
        };

        setEnfermedadesNuevasData([...enfermedadesNuevasData, newRecord]);
        setIsEnfermedadesNuevasModalOpen(false);
        setEnfermedadesNuevasForm({
            paciente: '',
            cedula: '',
            patologiaNueva: '',
            fechaAparecimiento: localDateStr(),
            observaciones: 'REGISTRO DE INCIDENCIA DE PATOLOGÍA NUEVA'
        });
        setPatientSelected(null);
        setPatientSearchTerm('');
    };

    const handleDeleteEnfermedadesNuevasRecord = (id) => {
        if (window.confirm('¿Está seguro de eliminar este registro de la matriz de enfermedades nuevas?')) {
            setEnfermedadesNuevasData(prev => prev.filter(item => item.id !== id));
        }
    };

    const handleExportEnfermedadesNuevasCSV = () => {
        const headers = ["NOMBRES Y APELLIDOS", "PATOLOGIA NUEVA", "FECHA DE APARECIMIENTO"];
        const rows = filteredEnfermedadesNuevas.map((item) => [
            `"${(item.paciente || '').replace(/"/g, '""')}"`,
            `"${(item.patologiaNueva || '').replace(/"/g, '""')}"`,
            `"${(item.fechaAparecimiento || '').replace(/"/g, '""')}"`
        ]);
        const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map(e => e.join(";"))].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `MATRIZ_DE_ENFERMEDADES_NUEVAS_UEB.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Handlers for Matriz de Exámenes Médicos y Fichas Periódicas por Mes
    const currentYearExamenesList = (examenesPeriodicosData[examenesPeriodicosSelectedYear] || [
        { id: 1, mes: 'ENERO', examenes: 0, total: 0 },
        { id: 2, mes: 'FEBRERO', examenes: 0, total: 0 },
        { id: 3, mes: 'MARZO', examenes: 0, total: 0 },
        { id: 4, mes: 'ABRIL', examenes: 0, total: 0 },
        { id: 5, mes: 'MAYO', examenes: 0, total: 0 },
        { id: 6, mes: 'JUNIO', examenes: 0, total: 0 },
        { id: 7, mes: 'JULIO', examenes: 0, total: 0 },
        { id: 8, mes: 'AGOSTO', examenes: 0, total: 0 },
        { id: 9, mes: 'SEPTIEMBRE', examenes: 0, total: 0 },
        { id: 10, mes: 'OCTUBRE', examenes: 0, total: 0 },
        { id: 11, mes: 'NOVIEMBRE', examenes: 0, total: 0 },
        { id: 12, mes: 'DICIEMBRE', examenes: 0, total: 0 }
    ]);

    const totalExamenesPeriodicosYear = currentYearExamenesList.reduce((sum, item) => sum + (parseInt(item.total, 10) || 0), 0);

    const handleSaveExamenesPeriodicosRecord = (e) => {
        e.preventDefault();
        const mesTarget = examenesPeriodicosForm.mes;
        const countVal = parseInt(examenesPeriodicosForm.examenes, 10) || 0;

        setExamenesPeriodicosData(prev => {
            const yearList = prev[examenesPeriodicosSelectedYear] ? [...prev[examenesPeriodicosSelectedYear]] : [];
            const idx = yearList.findIndex(item => item.mes.toUpperCase() === mesTarget.toUpperCase());
            if (idx >= 0) {
                yearList[idx] = {
                    ...yearList[idx],
                    examenes: countVal,
                    total: countVal
                };
            } else {
                yearList.push({
                    id: Date.now(),
                    mes: mesTarget.toUpperCase(),
                    examenes: countVal,
                    total: countVal
                });
            }
            return {
                ...prev,
                [examenesPeriodicosSelectedYear]: yearList
            };
        });

        setIsExamenesPeriodicosModalOpen(false);
        setExamenesPeriodicosForm({
            mes: 'ENERO',
            examenes: 0
        });
    };

    const handleExportExamenesPeriodicosCSV = () => {
        const headers = ["MES", "EXAMENES MEDICOS Y FICHAS", "TOTAL"];
        const rows = currentYearExamenesList.map(item => [
            `"${item.mes}"`,
            item.examenes || 0,
            item.total || 0
        ]);
        rows.push([`"TOTAL GENERAL"`, totalExamenesPeriodicosYear, totalExamenesPeriodicosYear]);
        const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map(e => e.join(";"))].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `MATRIZ_DE_EXAMENES_PERIODICOS_POR_MES_${examenesPeriodicosSelectedYear}_UEB.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const compileExamenesPeriodicosMatrixHtml = (forPrint = false) => {
        const displayedList = examenesPeriodicosShowAllMonths
            ? currentYearExamenesList
            : (currentYearExamenesList.some(i => i.total > 0)
                ? currentYearExamenesList.filter(i => i.total > 0)
                : currentYearExamenesList);

        const rowsHtml = displayedList.map((item, idx) => `
            <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                <td style="padding: 9px 16px; border: 1px solid #000000; font-weight: 800; font-size: 11px; color: #0b3c5d; text-align: left;">${escapeHtml(item.mes)}</td>
                <td style="padding: 9px 16px; border: 1px solid #000000; font-weight: 800; font-size: 11px; text-align: center;">${escapeHtml(item.examenes || 0)}</td>
                <td style="padding: 9px 16px; border: 1px solid #000000; font-weight: 900; font-size: 11px; color: #000000; text-align: right;">${escapeHtml(item.total || 0)}</td>
            </tr>
        `).join('');

        return `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8"/>
                <title>MATRIZ DE EXAMENES MEDICOS Y FICHAS PERIODICOS ${escapeHtml(examenesPeriodicosSelectedYear)} - UEB</title>
                <style>
                    @page { size: A4 landscape; margin: 10mm 12mm; }
                    * { box-sizing: border-box; }
                    body { font-family: Arial, Helvetica, sans-serif; font-size: 10px; color: #000; background: #fff; margin: 0; padding: 14px; }
                    .banner { background-color: #ed7d31; color: #000; border: 1px solid #000; padding: 14px 20px; margin-bottom: 12px; }
                    .banner-title { font-size: 17px; font-weight: 900; color: #000; text-transform: uppercase; margin: 4px 0 0 0; text-align: center; }
                    table.matrix-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
                    table.matrix-table th { background: #bdd7ee; color: #000000; padding: 10px 14px; font-weight: 900; text-transform: uppercase; font-size: 11px; text-align: center; border: 1px solid #000; }
                    @media print { .no-print { display: none !important; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
                </style>
            </head>
            <body>
                <div class="banner" style="background: #ffffff; border: 1.5px solid #002040; padding: 8px 14px; margin-bottom: 12px;">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <img src="${logoBienestar}" style="height: 48px; object-fit: contain;" alt="Bienestar Universitario" />
                        <div style="text-align: center; flex: 1; padding: 0 10px;">
                            <div style="font-size: 12px; font-weight: 900; color: #002040;">UNIVERSIDAD ESTATAL DE BOLÍVAR</div>
                            <div style="font-size: 10px; font-weight: 800; color: #0284c7;">DIRECCIÓN DE BIENESTAR UNIVERSITARIO · SALUD OCUPACIONAL</div>
                            <h1 class="banner-title" style="margin: 3px 0 0 0; font-size: 13.5px; color: #000;">Matriz de Examenes Medicos y Fichas Periodicos ${escapeHtml(examenesPeriodicosSelectedYear)}</h1>
                        </div>
                        <img src="${logoUebTexto}" style="height: 38px; object-fit: contain;" alt="UEB" />
                    </div>
                </div>

                <table class="matrix-table">
                    <thead>
                        <tr>
                            <th style="width: 25%; text-align: left; padding-left: 16px;">MES</th>
                            <th style="width: 50%; text-align: center;">EXAMENES MEDICOS Y FICHAS PERIODICAS</th>
                            <th style="width: 25%; text-align: right; padding-right: 16px;">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                        <tr style="background: #bdd7ee; font-weight: 900; font-size: 12px;">
                            <td style="padding: 10px 16px; border: 1px solid #000000; text-align: left; text-transform: uppercase;">TOTAL GENERAL</td>
                            <td style="padding: 10px 16px; border: 1px solid #000000; text-align: center;">${escapeHtml(totalExamenesPeriodicosYear)}</td>
                            <td style="padding: 10px 16px; border: 1px solid #000000; text-align: right; font-size: 13px; color: #000;">${escapeHtml(totalExamenesPeriodicosYear)}</td>
                        </tr>
                    </tbody>
                </table>

                <div style="margin-top: 45px; display: flex; justify-content: space-around;">
                    <div style="text-align: center; width: 260px; border-top: 1.5px solid #0f172a; padding-top: 6px;">
                        <strong style="font-size: 10px; color: #0b3c5d;">Responsable de Medicina Ocupacional</strong><br/>
                        <span style="font-size: 9px; color: #64748b;">Universidad Estatal de Bolívar</span>
                    </div>
                </div>
                ${forPrint ? '<script>window.onload = function() { setTimeout(function() { window.print(); }, 300); };</script>' : ''}
            </body>
            </html>
        `;
    };

    const handlePrintExamenesPeriodicosMatrix = () => {
        printIframeDocument(matrixIframeRef, () => compileExamenesPeriodicosMatrixHtml(false));
        showSystemToast('Enviando matriz de exámenes periódicos a impresión...');
    };

    // Handlers for Censo de Embarazadas
    const filteredEmbarazadas = embarazadasData.filter(item => {
        const term = (matrixSearchTerm || embarazadasSearchTerm || '').toLowerCase();
        const matchesSearch = !term ||
            (item.paciente || '').toLowerCase().includes(term) ||
            (item.cedula || '').includes(term) ||
            (item.telefono || '').includes(term) ||
            (item.semanasGestacion || '').toLowerCase().includes(term);

        if (!matchesSearch) return false;
        if (matrixDateFilter && !matchesDateFilter(item.fum, matrixDateFilter) && !matchesDateFilter(item.fechaProbableParto, matrixDateFilter)) {
            return false;
        }

        return true;
    });

    const compileEmbarazadasMatrixHtml = (dataToPrint = filteredEmbarazadas, forPrint = false) => {
        const list = dataToPrint || filteredEmbarazadas;
        const rowsHtml = list.map((item, idx) => `
            <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                <td style="padding: 7px 8px; border: 1px solid #000000; text-align: center; font-weight: bold; font-size: 10px;">${idx + 1}</td>
                <td style="padding: 7px 8px; border: 1px solid #000000; font-weight: 800; font-size: 10px; color: #0b3c5d;">${escapeHtml((item.paciente || '').toUpperCase())}<br/><small style="color:#64748b; font-weight:normal;">C.I: ${escapeHtml(item.cedula || 'N/D')}</small></td>
                <td style="padding: 7px 8px; border: 1px solid #000000; text-align: center; font-weight: bold; font-size: 10px; color: #854d0e;">${escapeHtml(item.edad || 'N/D')}</td>
                <td style="padding: 7px 8px; border: 1px solid #000000; font-weight: 700; font-size: 9.5px; color: #ea580c; text-align: center;">${escapeHtml(item.semanasGestacion || 'N/D')}</td>
                <td style="padding: 7px 8px; border: 1px solid #000000; text-align: center; font-weight: bold; font-size: 9.5px; color: #0284c7;">${escapeHtml(item.fum || 'N/D')}</td>
                <td style="padding: 7px 8px; border: 1px solid #000000; text-align: center; font-weight: 800; font-size: 10px; color: #15803d;">${escapeHtml(item.fechaProbableParto || 'N/D')}</td>
                <td style="padding: 7px 8px; border: 1px solid #000000; text-align: center; font-weight: bold; font-size: 10px; color: #a16207;">${escapeHtml(item.controles || 0)}</td>
                <td style="padding: 7px 8px; border: 1px solid #000000; text-align: center; font-weight: bold; font-size: 10px; color: #c2410c;">${escapeHtml(item.telefono || 'N/D')}</td>
            </tr>
        `).join('');

        return `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8"/>
                <title>CENSO DE EMBARAZADAS UEB - 2026</title>
                <style>
                    @page { size: A4 landscape; margin: 8mm 10mm; }
                    * { box-sizing: border-box; }
                    body { font-family: Arial, Helvetica, sans-serif; font-size: 9.5px; color: #000; background: #fff; margin: 0; padding: 12px; }
                    .cyan-banner { background-color: #00a2e8; color: #ffffff; border: 1px solid #000; padding: 10px 14px; margin-bottom: 10px; text-align: center; }
                    .banner-title { font-size: 16px; font-weight: 900; color: #ffffff; text-transform: uppercase; margin: 0; letter-spacing: 0.5px; }
                    table.matrix-table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 9px; }
                    table.matrix-table th { padding: 8px 5px; font-weight: 900; text-transform: uppercase; font-size: 9px; text-align: center; border: 1px solid #000; letter-spacing: 0.2px; }
                    .th-verde { background: #22c55e; color: #ffffff; }
                    .th-amarillo { background: #eab308; color: #000000; }
                    .th-naranja { background: #f97316; color: #ffffff; }
                    .th-azul { background: #38bdf8; color: #000000; }
                    @media print { .no-print { display: none !important; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
                </style>
            </head>
            <body>
                <div class="cyan-banner" style="background: #ffffff; border: 1.5px solid #00a2e8; padding: 6px 12px; margin-bottom: 8px;">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <img src="${logoBienestar}" style="height: 48px; object-fit: contain;" alt="Bienestar Universitario" />
                        <div style="text-align: center; flex: 1; padding: 0 10px;">
                            <div style="font-size: 11px; font-weight: 900; color: #002040;">UNIVERSIDAD ESTATAL DE BOLÍVAR</div>
                            <div style="font-size: 9px; font-weight: 800; color: #00a2e8;">DIRECCIÓN DE BIENESTAR UNIVERSITARIO · SALUD OCUPACIONAL</div>
                            <h1 class="banner-title" style="margin: 2px 0 0 0; font-size: 13px; color: #0b3c5d;">CENSO DE EMBARAZADAS UEB</h1>
                        </div>
                        <img src="${logoUebTexto}" style="height: 38px; object-fit: contain;" alt="UEB" />
                    </div>
                </div>

                <table class="matrix-table">
                    <thead>
                        <tr>
                            <th style="background: #f1f5f9; color: #000; width: 50px;">NÚMERO</th>
                            <th class="th-verde">NOMBRE DEL PACIENTE</th>
                            <th class="th-amarillo" style="width: 55px;">EDAD</th>
                            <th class="th-naranja" style="width: 170px;">SEMANAS DE GESTACIÓN</th>
                            <th class="th-azul" style="width: 95px;">FUM</th>
                            <th class="th-verde" style="width: 150px;">FECHA PROBABLE DE PARTO</th>
                            <th class="th-amarillo" style="width: 80px;">CONTROLES</th>
                            <th class="th-naranja" style="width: 100px;">TELÉFONO</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml.length > 0 ? rowsHtml : '<tr><td colspan="8" style="text-align: center; padding: 25px; color: #64748b;">No se registraron embarazadas en el censo.</td></tr>'}
                    </tbody>
                </table>

                <div style="margin-top: 35px; display: flex; justify-content: space-around;">
                    <div style="text-align: center; width: 250px; border-top: 1px solid #0f172a; padding-top: 4px;">
                        <strong style="font-size: 9.5px; color: #0b3c5d;">Responsable de Salud Ocupacional</strong><br/>
                        <span style="font-size: 8.5px; color: #64748b;">Universidad Estatal de Bolívar</span>
                    </div>
                </div>
                ${forPrint ? '<script>window.onload = function() { setTimeout(function() { window.print(); }, 300); };</script>' : ''}
            </body>
            </html>
        `;
    };

    const handlePrintEmbarazadasMatrix = (dataToPrint = filteredEmbarazadas) => {
        printIframeDocument(matrixIframeRef, () => compileEmbarazadasMatrixHtml(dataToPrint, false));
        showSystemToast('Enviando censo de embarazadas a impresión...');
    };

    const handleSaveEmbarazadasRecord = (e) => {
        e.preventDefault();
        const pacienteNombreFinal = patientSelected
            ? `${patientSelected.nombres} ${patientSelected.apellidos}`.trim().toUpperCase()
            : (embarazadasForm.paciente || '').toUpperCase();

        if (!pacienteNombreFinal) {
            alert('Por favor seleccione un paciente o ingrese el nombre.');
            return;
        }

        // Auto-calcular Fecha Probable de Parto (FPP) con Regla de Naegele si hay FUM
        let fppCalc = embarazadasForm.fechaProbableParto || 'may-26';
        let semCalc = embarazadasForm.semanasGestacion || '12 SEMANAS';

        if (embarazadasForm.fum) {
            try {
                const fumDate = new Date(embarazadasForm.fum);
                if (!isNaN(fumDate.getTime())) {
                    // Naegele: FUM + 280 days
                    const fppDate = new Date(fumDate.getTime() + 280 * 24 * 60 * 60 * 1000);
                    const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];
                    const yearShort = String(fppDate.getFullYear()).slice(-2);
                    fppCalc = `${monthNames[fppDate.getMonth()]}-${yearShort}`;

                    // Semanas de gestación transcurridas a la fecha actual
                    const diffMs = new Date().getTime() - fumDate.getTime();
                    const diffWeeks = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7)));
                    const todayFormatted = new Date().toLocaleDateString('es-EC');
                    semCalc = `${diffWeeks} SEMANAS (${todayFormatted})`;
                }
            } catch (err) {}
        }

        const newRecord = {
            id: Date.now(),
            numero: embarazadasData.length + 1,
            paciente: pacienteNombreFinal,
            cedula: patientSelected?.cedula || embarazadasForm.cedula || '0201234567',
            edad: parseInt(patientSelected?.edad || embarazadasForm.edad) || 30,
            semanasGestacion: semCalc,
            fum: embarazadasForm.fum,
            fechaProbableParto: fppCalc,
            controles: parseInt(embarazadasForm.controles) || 1,
            telefono: embarazadasForm.telefono || '0987654321'
        };

        setEmbarazadasData([...embarazadasData, newRecord]);
        setIsEmbarazadasModalOpen(false);
        setEmbarazadasForm({
            paciente: '',
            cedula: '',
            edad: '28',
            fum: localDateStr(),
            semanasGestacion: '12 SEMANAS',
            fechaProbableParto: 'may-26',
            controles: '3',
            telefono: '0987654321'
        });
    };

    const handleDeleteEmbarazadaRecord = (id) => {
        if (window.confirm('¿Está seguro de eliminar este registro del censo de embarazadas?')) {
            setEmbarazadasData(prev => prev.filter(item => item.id !== id));
        }
    };

    const handleExportEmbarazadasCSV = () => {
        const headers = ["NUMERO", "NOMBRE DEL PACIENTE", "EDAD", "SEMANAS DE GESTACION", "FUM", "FECHA PROBABLE DE PARTO", "CONTROLES", "TELEFONO"];
        const rows = filteredEmbarazadas.map((item, idx) => [
            idx + 1,
            `"${(item.paciente || '').replace(/"/g, '""')}"`,
            item.edad || '',
            `"${(item.semanasGestacion || '').replace(/"/g, '""')}"`,
            `"${(item.fum || '').replace(/"/g, '""')}"`,
            `"${(item.fechaProbableParto || '').replace(/"/g, '""')}"`,
            item.controles || 0,
            `"${(item.telefono || '').replace(/"/g, '""')}"`
        ]);
        const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map(e => e.join(";"))].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `MATRIZ_CENSO_DE_EMBARAZADAS_UEB.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Handlers for Ausentismo Laboral
    const filteredAusentismo = ausentismoData.filter(item => {
        const term = (matrixSearchTerm || ausentismoSearchTerm || '').toLowerCase();
        const matchSearch = !term ||
            (item.paciente || '').toLowerCase().includes(term) ||
            (item.cedula || '').toLowerCase().includes(term) ||
            (item.enfermedadComun || '').toLowerCase().includes(term) ||
            (item.enfermedadLaboral || '').toLowerCase().includes(term) ||
            (item.accidenteLaboral || '').toLowerCase().includes(term) ||
            (item.otrosMotivos || '').toLowerCase().includes(term);

        if (!matchSearch) return false;

        if (ausentismoSelectedYear !== 'TODOS' && String(item.anio) !== String(ausentismoSelectedYear)) {
            return false;
        }

        if (ausentismoSelectedMonth !== 'TODOS' && String(item.mes) !== String(ausentismoSelectedMonth)) {
            return false;
        }

        if (ausentismoTabFilter === 'enfermedad_comun') return Boolean(item.enfermedadComun);
        if (ausentismoTabFilter === 'enfermedad_laboral') return Boolean(item.enfermedadLaboral);
        if (ausentismoTabFilter === 'accidente_laboral') return Boolean(item.accidenteLaboral);
        if (ausentismoTabFilter === 'otros') return Boolean(item.otrosMotivos);

        return true;
    });

    const getMonthName = (monthNumber) => {
        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return months[parseInt(monthNumber) - 1] || 'Enero';
    };

    const compileAusentismoMatrixHtml = (dataToPrint = filteredAusentismo, forPrint = false) => {
        const list = dataToPrint || filteredAusentismo;
        const mesNombre = ausentismoSelectedMonth !== 'TODOS' ? getMonthName(ausentismoSelectedMonth) : 'Todos los Meses';
        const anioNombre = ausentismoSelectedYear !== 'TODOS' ? ausentismoSelectedYear : 'Todos los Años';

        const rowsHtml = list.map((item, idx) => `
            <tr style="background: ${escapeHtml(idx % 2 === 0 ? '#ffffff' : '#f8fafc')};">
                <td style="padding: 6px 8px; border: 1px solid #000000; text-align: center; font-weight: bold; font-size: 10px;">${escapeHtml(idx + 1)}</td>
                <td style="padding: 6px 8px; border: 1px solid #000000; font-weight: 800; font-size: 10px; color: #0b3c5d;">${escapeHtml((item.paciente || '').toUpperCase())}<br/><small style="color:#64748b; font-weight:normal;">C.I: ${escapeHtml(item.cedula || 'N/D')}</small></td>
                <td style="padding: 6px 8px; border: 1px solid #000000; font-size: 9.5px; color: #15803d; font-weight: 600;">${escapeHtml((item.enfermedadComun || '-').toUpperCase())}</td>
                <td style="padding: 6px 8px; border: 1px solid #000000; font-size: 9.5px; color: #b91c1c; font-weight: 600;">${escapeHtml((item.enfermedadLaboral || '-').toUpperCase())}</td>
                <td style="padding: 6px 8px; border: 1px solid #000000; font-size: 9.5px; color: #c2410c; font-weight: 600;">${escapeHtml((item.accidenteLaboral || '-').toUpperCase())}</td>
                <td style="padding: 6px 8px; border: 1px solid #000000; font-size: 9.5px; color: #a16207; font-weight: 600;">${escapeHtml((item.otrosMotivos || '-').toUpperCase())}</td>
                <td style="padding: 6px 8px; border: 1px solid #000000; text-align: center; font-weight: bold; font-size: 10px; color: #ea580c;">${escapeHtml(item.diasPerdidos || 0)}</td>
                <td style="padding: 6px 8px; border: 1px solid #000000; text-align: center; font-weight: bold; font-size: 10px; color: #0284c7;">${escapeHtml(item.totalHorasAusentismo || 0)}</td>
                <td style="padding: 6px 8px; border: 1px solid #000000; text-align: center; font-weight: bold; font-size: 10px; color: #0369a1;">${escapeHtml(item.totalHorasTrabajadas || 0)}</td>
                <td style="padding: 6px 8px; border: 1px solid #000000; text-align: center; font-weight: 900; font-size: 10px; color: #0b3c5d;">${escapeHtml(item.indiceAusentismo || 0)}</td>
            </tr>
        `).join('');

        return `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8"/>
                <title>MATRIZ DE AUSENTISMO LABORAL - UEB ${escapeHtml(anioNombre)}</title>
                <style>
                    @page { size: A4 landscape; margin: 8mm 10mm; }
                    * { box-sizing: border-box; }
                    body { font-family: Arial, Helvetica, sans-serif; font-size: 9.5px; color: #000; background: #fff; margin: 0; padding: 12px; }
                    .yellow-banner { background-color: #ffff00; border: 1px solid #000; padding: 8px 12px; margin-bottom: 10px; text-align: center; }
                    .banner-title { font-size: 14px; font-weight: 900; color: #000; text-transform: uppercase; margin: 0; }
                    table.matrix-table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 9px; }
                    table.matrix-table th { padding: 6px 4px; font-weight: 900; text-transform: uppercase; font-size: 8.5px; text-align: center; border: 1px solid #000; letter-spacing: 0.2px; }
                    .th-verde { background: #22c55e; color: #ffffff; }
                    .th-rosado { background: #f43f5e; color: #ffffff; }
                    .th-naranja { background: #f97316; color: #ffffff; }
                    .th-amarillo { background: #eab308; color: #000000; }
                    .th-naranjaclaro { background: #fdba74; color: #000000; }
                    .th-azul { background: #0284c7; color: #ffffff; }
                    .th-azuloscuro { background: #0b3c5d; color: #ffffff; }
                    @media print { .no-print { display: none !important; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
                </style>
            </head>
            <body>
                <div class="yellow-banner" style="background: #ffffff; border: 1.5px solid #b45309; padding: 6px 12px; margin-bottom: 8px;">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <img src="${escapeHtml(logoBienestar)}" style="height: 48px; object-fit: contain;" alt="Bienestar Universitario" />
                        <div style="text-align: center; flex: 1; padding: 0 10px;">
                            <div style="font-size: 11px; font-weight: 900; color: #002040;">UNIVERSIDAD ESTATAL DE BOLÍVAR</div>
                            <div style="font-size: 9px; font-weight: 800; color: #b45309;">DIRECCIÓN DE BIENESTAR UNIVERSITARIO · SALUD OCUPACIONAL</div>
                            <h1 class="banner-title" style="margin: 2px 0 0 0; font-size: 13px; color: #0b3c5d;">Registro de Ausentismo Laboral Mes de ${escapeHtml(mesNombre)} ${escapeHtml(anioNombre)}</h1>
                        </div>
                        <img src="${escapeHtml(logoUebTexto)}" style="height: 38px; object-fit: contain;" alt="UEB" />
                    </div>
                </div>

                <table class="matrix-table">
                    <thead>
                        <tr>
                            <th style="background: #f1f5f9; color: #000; width: 45px;">NÚMERO DE CASO</th>
                            <th style="background: #f1f5f9; color: #000;">NOMBRE Y APELLIDO</th>
                            <th class="th-verde">POR ENFERMEDAD COMÚN<br/><small>(PREVALENCIA DE CASOS)</small></th>
                            <th class="th-rosado">POR ENFERMEDAD LABORAL</th>
                            <th class="th-naranja">ACCIDENTE LABORAL</th>
                            <th class="th-amarillo">OTROS MOTIVOS</th>
                            <th class="th-naranjaclaro" style="width: 55px;">DÍAS PERDIDOS</th>
                            <th class="th-azul" style="width: 80px;"># TOTAL DE HORAS DE AUSENTISMO</th>
                            <th class="th-azul" style="width: 80px;"># TOTAL DE HORAS TRABAJADAS</th>
                            <th class="th-azuloscuro" style="width: 85px;">ÍNDICE DE AUSENTISMO</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml.length > 0 ? rowsHtml : '<tr><td colspan="10" style="text-align: center; padding: 25px; color: #64748b;">No se registraron casos de ausentismo para este período.</td></tr>'}
                    </tbody>
                </table>

                <div style="margin-top: 30px; display: flex; justify-content: space-around;">
                    <div style="text-align: center; width: 250px; border-top: 1px solid #0f172a; padding-top: 4px;">
                        <strong style="font-size: 9.5px; color: #0b3c5d;">Responsable de Salud Ocupacional</strong><br/>
                        <span style="font-size: 8.5px; color: #64748b;">Universidad Estatal de Bolívar</span>
                    </div>
                </div>
                ${forPrint ? '<script>window.onload = function() { setTimeout(function() { window.print(); }, 300); };</script>' : ''}
            </body>
            </html>
        `;
    };

    const handlePrintAusentismoMatrix = (dataToPrint = filteredAusentismo) => {
        printIframeDocument(matrixIframeRef, () => compileAusentismoMatrixHtml(dataToPrint, false));
        showSystemToast('Enviando matriz de ausentismo laboral a impresión...');
    };

    const handleSaveAusentismoRecord = (e) => {
        e.preventDefault();
        const pacienteNombreFinal = patientSelected
            ? `${patientSelected.nombres} ${patientSelected.apellidos}`.trim().toUpperCase()
            : (ausentismoForm.paciente || '').toUpperCase();

        if (!pacienteNombreFinal) {
            alert('Por favor seleccione un paciente o ingrese el nombre.');
            return;
        }

        const dias = parseInt(ausentismoForm.diasPerdidos) || 1;
        const hAusentismo = parseInt(ausentismoForm.horasAusentismo) || (dias * 8);
        const hTrabajadas = parseInt(ausentismoForm.horasTrabajadas) || 32;
        const ind = parseFloat((hAusentismo / (hTrabajadas || 1)).toFixed(2));

        const newRecord = {
            id: Date.now(),
            numeroCaso: ausentismoData.length + 1,
            paciente: pacienteNombreFinal,
            cedula: patientSelected?.cedula || ausentismoForm.cedula || '0201458963',
            cargo: (patientSelected?.puestoTrabajo || ausentismoForm.cargo || 'SERVIDOR/DOCENTE').toUpperCase(),
            enfermedadComun: ausentismoForm.motivoTipo === 'enfermedad_comun' ? (ausentismoForm.diagnostico || 'ENFERMEDAD COMÚN').toUpperCase() : '',
            enfermedadLaboral: ausentismoForm.motivoTipo === 'enfermedad_laboral' ? (ausentismoForm.diagnostico || 'ENFERMEDAD LABORAL').toUpperCase() : '',
            accidenteLaboral: ausentismoForm.motivoTipo === 'accidente_laboral' ? (ausentismoForm.diagnostico || 'ACCIDENTE LABORAL').toUpperCase() : '',
            otrosMotivos: ausentismoForm.motivoTipo === 'otros' ? (ausentismoForm.diagnostico || 'CONSULTA MÉDICA').toUpperCase() : '',
            diasPerdidos: dias,
            totalHorasAusentismo: hAusentismo,
            totalHorasTrabajadas: hTrabajadas,
            indiceAusentismo: ind,
            anio: parseInt(ausentismoSelectedYear) || 2026,
            mes: parseInt(ausentismoSelectedMonth) || 1
        };

        setAusentismoData([...ausentismoData, newRecord]);
        setIsAusentismoModalOpen(false);
        setAusentismoForm({
            paciente: '',
            cedula: '',
            cargo: 'SERVIDOR/DOCENTE',
            motivoTipo: 'enfermedad_comun',
            diagnostico: '',
            diasPerdidos: '1',
            horasAusentismo: '8',
            horasTrabajadas: '32'
        });
    };

    const handleDeleteAusentismoRecord = (id) => {
        if (window.confirm('¿Está seguro de eliminar este registro de ausentismo?')) {
            setAusentismoData(prev => prev.filter(item => item.id !== id));
        }
    };

    const handleExportAusentismoCSV = () => {
        const mesNombre = ausentismoSelectedMonth !== 'TODOS' ? getMonthName(ausentismoSelectedMonth) : 'Todos_los_Meses';
        const anioNombre = ausentismoSelectedYear !== 'TODOS' ? ausentismoSelectedYear : 'Todos_los_Anios';
        const headers = ["NUMERO DE CASO", "NOMBRE Y APELLIDO", "POR ENFERMEDAD COMUN (PREVALENCIA DE CASOS)", "POR ENFERMEDAD LABORAL", "ACCIDENTE LABORAL", "OTROS MOTIVOS", "DIAS PERDIDOS", "# TOTAL DE HORAS DE AUSENTISMO", "# TOTAL DE HORAS TRABAJADAS", "INDICE DE AUSENTISMO"];
        
        const rows = filteredAusentismo.map((item, idx) => [
            idx + 1,
            `"${(item.paciente || '').replace(/"/g, '""')}"`,
            `"${(item.enfermedadComun || '').replace(/"/g, '""')}"`,
            `"${(item.enfermedadLaboral || '').replace(/"/g, '""')}"`,
            `"${(item.accidenteLaboral || '').replace(/"/g, '""')}"`,
            `"${(item.otrosMotivos || '').replace(/"/g, '""')}"`,
            item.diasPerdidos || 0,
            item.totalHorasAusentismo || 0,
            item.totalHorasTrabajadas || 0,
            typeof item.indiceAusentismo === 'number' ? item.indiceAusentismo.toString().replace('.', ',') : (item.indiceAusentismo || '0,00')
        ]);

        const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map(e => e.join(";"))].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `MATRIZ_AUSENTISMO_LABORAL_${mesNombre}_${anioNombre}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Handlers for COVID-19
    const filteredCovidCases = covidCasesData.filter(item => {
        const term = (matrixSearchTerm || covidSearchTerm || '').toLowerCase();
        const matchSearch = !term ||
            (item.pacienteSospechoso || '').toLowerCase().includes(term) ||
            (item.pacienteConfirmado || '').toLowerCase().includes(term) ||
            (item.tipoTrabajador || '').toLowerCase().includes(term) ||
            (item.lugarTrabajo || '').toLowerCase().includes(term) ||
            (item.entregaResultados || '').toLowerCase().includes(term);

        if (!matchSearch) return false;

        if (covidSelectedYear !== 'TODOS' && String(item.anio) !== String(covidSelectedYear)) {
            return false;
        }

        if (covidSelectedMonth !== 'TODOS' && String(item.mes) !== String(covidSelectedMonth)) {
            return false;
        }

        if (covidTabFilter === 'sospechosos') {
            return !item.pacienteConfirmado && (item.entregaResultados || '').toUpperCase() !== 'DESCARTADO';
        }
        if (covidTabFilter === 'confirmados') {
            return Boolean(item.pacienteConfirmado);
        }
        if (covidTabFilter === 'descartados') {
            return (item.entregaResultados || '').toUpperCase() === 'DESCARTADO';
        }
        if (covidTabFilter === 'alta_medica') {
            return item.altaMedica;
        }
        return true;
    });

    const compileCovidMatrixHtml = (dataToPrint = filteredCovidCases, periodLabel = 'TODOS LOS PERÍODOS', forPrint = false) => {
        const list = dataToPrint || filteredCovidCases;
        const rowsHtml = list.map((item, idx) => `
            <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                <td style="padding: 6px 8px; border: 1px solid #94a3b8; font-weight: 800; font-size: 9.5px; color: #0b3c5d;">${escapeHtml((item.pacienteSospechoso || '').toUpperCase())}</td>
                <td style="padding: 6px 8px; border: 1px solid #94a3b8; font-size: 9px; color: #334155;">${escapeHtml((item.tipoTrabajador || '').toUpperCase())}</td>
                <td style="padding: 6px 8px; border: 1px solid #94a3b8; font-size: 9px; color: #334155;">${escapeHtml((item.lugarTrabajo || '').toUpperCase())}</td>
                <td style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: center; font-weight: bold; font-size: 9.5px; color: ${item.entregaResultados === 'DESCARTADO' ? '#dc2626' : '#d97706'};">${escapeHtml(item.entregaResultados || 'N/D')}</td>
                <td style="padding: 6px 8px; border: 1px solid #94a3b8; font-weight: 800; font-size: 9.5px; color: #dc2626;">${escapeHtml((item.pacienteConfirmado || '-').toUpperCase())}</td>
                <td style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: center; font-weight: bold; font-size: 11px;">${item.pcr ? 'X' : ''}</td>
                <td style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: center; font-weight: bold; font-size: 11px;">${item.pruebaRapida ? 'X' : ''}</td>
                <td style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: center; font-weight: bold; font-size: 11px;">${item.altaMedica ? 'X' : ''}</td>
                <td style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: center; font-weight: bold; font-size: 10px; color: #7030a0;">${escapeHtml(item.diasAislamiento || 0)}</td>
            </tr>
        `).join('');

        return `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8"/>
                <title>MATRIZ DE PACIENTES SOSPECHOSOS Y CONFIRMADOS PARA COVID-19 - UEB</title>
                <style>
                    @page { size: A4 landscape; margin: 8mm 10mm; }
                    * { box-sizing: border-box; }
                    body { font-family: Arial, Helvetica, sans-serif; font-size: 9.5px; color: #0f172a; background: #fff; margin: 0; padding: 12px; }
                    .header-yellow-banner { background-color: #ffff00; padding: 10px; border: 1px solid #d97706; margin-bottom: 12px; }
                    .header-table { width: 100%; border-collapse: collapse; }
                    .logo-text { font-size: 16px; font-weight: 900; color: #0b3c5d; }
                    .logo-subtext { font-size: 8.5px; font-weight: 800; color: #0284c7; }
                    .matrix-title { font-size: 11.5px; font-weight: 900; color: #000000; text-align: center; text-transform: uppercase; line-height: 1.25; padding: 0 10px; }
                    table.matrix-table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 9px; }
                    table.matrix-table th { padding: 8px 4px; font-weight: 900; text-transform: uppercase; font-size: 8.5px; text-align: center; border: 1px solid #000; letter-spacing: 0.2px; }
                    .th-azul { background: #0070c0; color: #ffffff; }
                    .th-verde { background: #00b050; color: #ffffff; }
                    .th-amarillo { background: #ffc000; color: #000000; }
                    .th-rojo { background: #ff0000; color: #ffffff; }
                    .th-morado { background: #7030a0; color: #ffffff; }
                    @media print { .no-print { display: none !important; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
                </style>
            </head>
            <body>
                <div class="header-yellow-banner" style="background: #ffffff; border: 1.5px solid #002040; padding: 8px 12px; margin-bottom: 10px;">
                    <table class="header-table">
                        <tr>
                            <td style="width: 140px; vertical-align: middle; text-align: left;">
                                <img src="${logoBienestar}" alt="Bienestar Universitario UEB" style="max-height: 48px; width: auto; object-fit: contain;" />
                            </td>
                            <td class="matrix-title">
                                <div style="font-size: 11px; font-weight: 900; color: #002040; text-transform: uppercase;">UNIVERSIDAD ESTATAL DE BOLÍVAR</div>
                                <div style="font-size: 9.5px; font-weight: 800; color: #c2410c; text-transform: uppercase;">DIRECCIÓN DE BIENESTAR UNIVERSITARIO · UNIDAD DE SEGURIDAD Y SALUD OCUPACIONAL</div>
                                <div style="font-size: 11px; font-weight: 900; color: #0b3c5d; margin-top: 3px;">
                                    REGISTRO DE PACIENTES SOSPECHOSOS Y CONFIRMADOS PARA COVID-19<br/>
                                    <span style="font-size: 9.5px; font-weight: normal; color: #64748b;">PERÍODO: ${escapeHtml(periodLabel)}</span>
                                </div>
                            </td>
                            <td style="width: 140px; vertical-align: middle; text-align: right;">
                                <img src="${logoUebTexto}" alt="UEB" style="max-height: 38px; width: auto; object-fit: contain;" />
                            </td>
                        </tr>
                    </table>
                </div>

                <table class="matrix-table">
                    <thead>
                        <tr>
                            <th class="th-azul">LISTADO DE PACIENTES SOSPECHOSOS</th>
                            <th class="th-azul">TIPO DE TRABAJADOR</th>
                            <th class="th-verde">LUGAR DE TRABAJO</th>
                            <th class="th-amarillo" style="width: 110px;">ENTREGA DE RESULTADOS</th>
                            <th class="th-rojo">LISTADO DE PACIENTES CONFIRMADOS</th>
                            <th class="th-verde" style="width: 50px;">PCR</th>
                            <th class="th-amarillo" style="width: 90px;">PRUEBA RÁPIDA CUANTITATIVA</th>
                            <th class="th-morado" style="width: 70px;">ALTA MÉDICA</th>
                            <th class="th-morado" style="width: 75px;">DÍAS DE AISLAMIENTO</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml.length > 0 ? rowsHtml : '<tr><td colspan="9" style="text-align: center; padding: 25px; color: #64748b;">No se registraron casos de COVID-19 en este período.</td></tr>'}
                    </tbody>
                </table>

                <div style="margin-top: 25px; display: flex; justify-content: space-around;">
                    <div style="text-align: center; width: 250px; border-top: 1px solid #0f172a; padding-top: 4px;">
                        <strong style="font-size: 9.5px; color: #0b3c5d;">Responsable de Salud Ocupacional</strong><br/>
                        <span style="font-size: 8.5px; color: #64748b;">Universidad Estatal de Bolívar</span>
                    </div>
                </div>
                ${forPrint ? '<script>window.onload = function() { setTimeout(function() { window.print(); }, 300); };</script>' : ''}
            </body>
            </html>
        `;
    };

    const handlePrintCovidMatrix = (dataToPrint = filteredCovidCases, periodLabel = 'TODOS LOS PERÍODOS') => {
        printIframeDocument(matrixIframeRef, () => compileCovidMatrixHtml(dataToPrint, periodLabel, false));
        showSystemToast('Enviando matriz de COVID-19 a impresión...');
    };

    const handleSaveCovidRecord = (e) => {
        e.preventDefault();
        const pacienteNombreFinal = patientSelected
            ? `${patientSelected.nombres} ${patientSelected.apellidos}`.trim().toUpperCase()
            : (covidForm.paciente || '').toUpperCase();

        if (!pacienteNombreFinal) {
            alert('Por favor seleccione un paciente o ingrese el nombre.');
            return;
        }

        const dateParts = (covidForm.fechaEntregaResultados || '').split(/[-/]/);
        let anio = new Date().getFullYear();
        let mes = new Date().getMonth() + 1;
        if (dateParts.length === 3) {
            if (dateParts[0].length === 4) {
                anio = parseInt(dateParts[0]);
                mes = parseInt(dateParts[1]);
            } else if (dateParts[2].length === 4) {
                anio = parseInt(dateParts[2]);
                mes = parseInt(dateParts[1]);
            }
        }

        const newRecord = {
            id: Date.now(),
            pacienteSospechoso: pacienteNombreFinal,
            tipoTrabajador: (patientSelected?.puestoTrabajo || covidForm.tipoTrabajador || 'DOCENTE CONTRATADA').toUpperCase(),
            lugarTrabajo: (covidForm.lugarTrabajo || 'UNIVERSIDAD ESTATAL DE BOLÍVAR').toUpperCase(),
            entregaResultados: covidForm.esDescartado ? 'DESCARTADO' : (covidForm.fechaEntregaResultados || new Date().toLocaleDateString()),
            pacienteConfirmado: (!covidForm.esDescartado && (covidForm.pcr || covidForm.pruebaRapida)) ? pacienteNombreFinal : '',
            pcr: !covidForm.esDescartado && Boolean(covidForm.pcr),
            pruebaRapida: !covidForm.esDescartado && Boolean(covidForm.pruebaRapida),
            altaMedica: !covidForm.esDescartado && Boolean(covidForm.altaMedica),
            diasAislamiento: parseInt(covidForm.diasAislamiento) || 0,
            anio,
            mes
        };

        setCovidCasesData([...covidCasesData, newRecord]);
        setIsCovidModalOpen(false);
        setCovidForm({
            paciente: '',
            tipoTrabajador: 'DOCENTE CONTRATADA',
            lugarTrabajo: 'FACULTAD DE CIENCIAS DE LA SALUD',
            fechaEntregaResultados: localDateStr(),
            pacienteConfirmado: '',
            pcr: true,
            pruebaRapida: false,
            altaMedica: true,
            diasAislamiento: '8',
            esDescartado: false
        });
    };

    const compileActiveMatrixHtml = (forPrint = false) => {
        switch (activeReportSubTab) {
            case 'catastroficas':
                return compileCatastroficasMatrixHtml(filteredCatastroficas, 'ENFERMEDADES CATASTRÓFICAS O HUÉRFANAS', forPrint);
            case 'accidentes':
                return compileAccidentesMatrixHtml(filteredAccidentes, 'TODOS LOS REGISTROS', forPrint);
            case 'covid':
                return compileCovidMatrixHtml(filteredCovidCases, 'TODOS LOS PERÍODOS', forPrint);
            case 'ausentismo':
                return compileAusentismoMatrixHtml(filteredAusentismo, forPrint);
            case 'embarazadas':
                return compileEmbarazadasMatrixHtml(filteredEmbarazadas, forPrint);
            case 'psicosocial':
                return compilePsicosocialMatrixHtml(filteredPsicosocial, forPrint);
            case 'enfermedades_nuevas':
                return compileEnfermedadesNuevasMatrixHtml(filteredEnfermedadesNuevas, forPrint);
            case 'examenes_periodicos':
                return compileExamenesPeriodicosMatrixHtml(forPrint);
            case 'personal_nuevo':
                return compilePersonalNuevoMatrixHtml(filteredPersonalNuevo, forPrint);
            case 'vulnerables_patologias':
                return compileVulnerablesPatologiasMatrixHtml(forPrint);
            case 'discapacidad':
                return compileDiscapacidadMatrixHtml(filteredDiscapacidad, forPrint);
            default:
                return compileCatastroficasMatrixHtml(filteredCatastroficas, 'ENFERMEDADES CATASTRÓFICAS O HUÉRFANAS', forPrint);
        }
    };

    const handlePrintActiveMatrix = () => {
        printIframeDocument(matrixIframeRef, () => compileActiveMatrixHtml(false));
        showSystemToast('Enviando matriz oficial a impresión...');
    };

    const getActiveMatrixMeta = () => {
        switch (activeReportSubTab) {
            case 'catastroficas':
                return {
                    title: 'Matriz de Enfermedades Catastróficas o Huérfanas',
                    subtitle: 'Registro oficial de servidores y docentes con enfermedades catastróficas, tratamiento oncológico/especializado y seguimiento institucional.',
                    filename: 'Matriz_Oficial_Catastroficas_UEB_2026.pdf',
                    count: filteredCatastroficas.length,
                    hasDateFilter: false,
                    subtabs: [
                        { id: 'todos', label: 'Todos los Registros' },
                        { id: 'catastroficas', label: 'Enfermedades Catastróficas' },
                        { id: 'huerfanas', label: 'Enfermedades Huérfanas / Raras' }
                    ],
                    activeSubtab: catastrophicTabFilter,
                    onSubtabChange: setCatastrophicTabFilter
                };
            case 'accidentes':
                return {
                    title: 'Matriz de Accidentes Laborales y Enfermedades Profesionales',
                    subtitle: 'Registro oficial de accidentes de trabajo, investigación de incidentes laborales y descansos médicos emitidos.',
                    filename: 'Matriz_Oficial_Accidentes_Laborales_UEB_2026.pdf',
                    count: filteredAccidentes.length,
                    hasDateFilter: true,
                    subtabs: [
                        { id: 'todos', label: 'Todos los Registros' },
                        { id: 'leves', label: 'Accidentes Leves' },
                        { id: 'graves', label: 'Accidentes Graves' },
                        { id: 'enfermedades_profesionales', label: 'Enfermedades Profesionales' }
                    ],
                    activeSubtab: accidenteTabFilter,
                    onSubtabChange: setAccidenteTabFilter
                };
            case 'covid':
                return {
                    title: 'Matriz de Casos Sospechosos y Confirmados COVID-19',
                    subtitle: 'Registro y seguimiento epidemiológico, toma de pruebas diagnósticas, períodos de aislamiento preventivo y altas médicas.',
                    filename: 'Matriz_Oficial_COVID19_UEB_2026.pdf',
                    count: filteredCovidCases.length,
                    hasDateFilter: false,
                    subtabs: [
                        { id: 'todos', label: 'Todos' },
                        { id: 'sospechosos', label: 'Sospechosos' },
                        { id: 'confirmados', label: 'Confirmados' },
                        { id: 'descartados', label: 'Descartados' },
                        { id: 'alta_medica', label: 'Alta Médica' }
                    ],
                    activeSubtab: covidTabFilter,
                    onSubtabChange: setCovidTabFilter
                };
            case 'ausentismo':
                return {
                    title: 'Matriz de Ausentismo Laboral',
                    subtitle: 'Control mensual y cálculo oficial de índices de ausentismo por enfermedad común, profesional y accidentes de trabajo.',
                    filename: 'Matriz_Oficial_Ausentismo_Laboral_UEB_2026.pdf',
                    count: filteredAusentismo.length,
                    hasDateFilter: false,
                    subtabs: [
                        { id: 'todos', label: 'Todos los Motivos' },
                        { id: 'enfermedad_comun', label: 'Enfermedad Común' },
                        { id: 'enfermedad_laboral', label: 'Enfermedad Laboral' },
                        { id: 'accidente_laboral', label: 'Accidente Laboral' },
                        { id: 'otros', label: 'Otros Motivos' }
                    ],
                    activeSubtab: ausentismoTabFilter,
                    onSubtabChange: setAusentismoTabFilter
                };
            case 'embarazadas':
                return {
                    title: 'Censo de Embarazadas UEB',
                    subtitle: 'Seguimiento prenatal y obstétrico, FUM, semanas de gestación, fecha probable de parto y número de controles médicos.',
                    filename: 'Censo_Oficial_Embarazadas_UEB_2026.pdf',
                    count: filteredEmbarazadas.length,
                    hasDateFilter: true
                };
            case 'psicosocial':
                return {
                    title: 'Matriz de Funcionarios con Riesgo Psicosocial',
                    subtitle: 'Seguimiento clínico a funcionarios y servidores con diagnóstico de ansiedad, depresión y patologías asociadas.',
                    filename: 'Matriz_Oficial_Riesgo_Psicosocial_UEB_2026.pdf',
                    count: filteredPsicosocial.length,
                    hasDateFilter: false,
                    subtabs: [
                        { id: 'todos', label: 'Todos los Servidores' },
                        { id: 'DOCENTE', label: 'Docentes' },
                        { id: 'ADMINISTRATIVO', label: 'Administrativos' },
                        { id: 'TRABAJADOR', label: 'Trabajadores' }
                    ],
                    activeSubtab: psicosocialFilterTipo,
                    onSubtabChange: setPsicosocialFilterTipo
                };
            case 'enfermedades_nuevas':
                return {
                    title: 'Matriz de Enfermedades Nuevas (Incidencia UEB)',
                    subtitle: 'Registro de incidencia de patologías diagnosticadas durante el año lectivo en el personal universitario.',
                    filename: 'Matriz_Oficial_Enfermedades_Nuevas_UEB_2026.pdf',
                    count: filteredEnfermedadesNuevas.length,
                    hasDateFilter: true
                };
            case 'examenes_periodicos':
                return {
                    title: `Matriz de Exámenes Médicos y Fichas Periódicas (${examenesPeriodicosSelectedYear})`,
                    subtitle: 'Consolidado mensual de exámenes médicos ocupacionales y fichas periódicas realizadas a servidores universitarios.',
                    filename: `Matriz_Oficial_Examenes_Periodicos_${examenesPeriodicosSelectedYear}_UEB.pdf`,
                    count: totalExamenesPeriodicosYear,
                    hasDateFilter: false
                };
            case 'personal_nuevo':
                return {
                    title: 'Matriz de Personal Nuevo que Ingresó en el Año',
                    subtitle: 'Registro y seguimiento de servidores ingresantes, inducción de salud ocupacional y exámenes preocupacionales.',
                    filename: 'Matriz_Oficial_Personal_Nuevo_UEB_2026.pdf',
                    count: filteredPersonalNuevo.length,
                    hasDateFilter: true
                };
            case 'vulnerables_patologias':
                return {
                    title: 'Matriz de Grupos Vulnerables (Patologías y Condiciones)',
                    subtitle: 'Servidores universitarios con condiciones prioritarias: diabéticos, hipertensos, adultos mayores y otras patologías.',
                    filename: 'Matriz_Oficial_Grupos_Vulnerables_UEB_2026.pdf',
                    count: (vulnerablePatologiasData.diabeticos?.length || 0) + (vulnerablePatologiasData.hipertensos?.length || 0) + (vulnerablePatologiasData.adultoMayor?.length || 0) + (vulnerablePatologiasData.otras?.length || 0),
                    hasDateFilter: false
                };
            case 'discapacidad':
                return {
                    title: 'Matriz de Funcionarios con Discapacidad',
                    subtitle: 'Registro oficial de servidores y trabajadores con carnet de discapacidad CONADIS/MSP y condiciones de adaptabilidad laboral.',
                    filename: 'Matriz_Oficial_Discapacidad_UEB_2026.pdf',
                    count: filteredDiscapacidad.length,
                    hasDateFilter: false
                };
            default:
                return {
                    title: 'Matriz Estadística Ocupacional',
                    subtitle: 'Matriz oficial de medicina y salud ocupacional de la Universidad Estatal de Bolívar.',
                    filename: 'Matriz_Oficial_UEB_2026.pdf',
                    count: 0,
                    hasDateFilter: false
                };
        }
    };

    const compileParteDiarioHtmlString = (forPrint = false) => {
        try {
            const calculateAge = (birthDateStr) => {
                if (!birthDateStr) return '';
                const birth = new Date(birthDateStr);
                const today = new Date();
                let age = today.getFullYear() - birth.getFullYear();
                const m = today.getMonth() - birth.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
                    age--;
                }
                return age;
            };

            let totalHombres = 0;
            let totalMujeres = 0;
            let totalLgbti = 0;
            let totalDocenteCarrera = 0;
            let totalAdministrativo = 0;
            let totalPrimera = 0;
            let totalSubsecuente = 0;
            let totalCertificado = 0;
            let totalValidacion = 0;

            const rowsHtml = parteDiarioList.map((item, index) => {
                const pIdent = item.paciente?.datos_identificacion || item.paciente?.datosIdentificacion;
                const nombres = pIdent ? `${pIdent.primer_nombre} ${pIdent.segundo_nombre || ''} ${pIdent.apellido_paterno} ${pIdent.apellido_materno || ''}`.replace(/\s+/g, ' ').trim() : item.paciente?.name || '';
                const cedula = pIdent?.numero_cedula || '';
                const edad = pIdent?.fecha_nacimiento ? calculateAge(pIdent.fecha_nacimiento) : '';

                const hasDisability = item.paciente?.discapacidades && item.paciente.discapacidades.length > 0;
                const tipoDiscapacidad = hasDisability ? item.paciente.discapacidades.map(d => d.detalle_discapacidad).join(', ') : '';

                const gender = item.paciente?.autopercepcion?.genero?.nombre?.toLowerCase() || '';
                let esHombre = false;
                let esMujer = false;
                let esLgbti = false;

                if (gender.includes('masc') || gender.includes('homb') || gender === 'masculino') {
                    esHombre = true;
                    totalHombres++;
                } else if (gender.includes('fem') || gender.includes('muj') || gender === 'femenino') {
                    esMujer = true;
                    totalMujeres++;
                } else if (gender) {
                    esLgbti = true;
                    totalLgbti++;
                }

                // Clasificación con los códigos correctos de tipo_usuario (ver utils/tipoPaciente.js)
                const tipoPaciente = clasificarTipoPaciente(item.paciente);
                const carrera = getEstudioCarrera(item.paciente)?.carrera?.nombre || '';
                const cargo = item.paciente?.cargo?.detalle_cargo || '';

                let areaDocenteCarrera = '';
                let areaAdministrativo = '';

                if (esPersonalAdministrativo(tipoPaciente) || cargo) {
                    // Código de trabajo también es personal de la institución (antes caía en "Carrera")
                    areaAdministrativo = cargo || (tipoPaciente === 'codigo_trabajo' ? 'Código de Trabajo' : 'Administrativo');
                    totalAdministrativo++;
                } else if (tipoPaciente === 'docente' || tipoPaciente === 'estudiante') {
                    const rolPrefix = tipoPaciente === 'docente' ? 'Docente - ' : '';
                    areaDocenteCarrera = rolPrefix + (carrera || 'Carrera General');
                    totalDocenteCarrera++;
                } else {
                    // Aún no confirmó su tipo: se indica y no se suma a ninguna columna
                    areaDocenteCarrera = 'Tipo sin confirmar';
                }

                let esPrimera = false;
                let esSubsecuente = false;
                let esCertificado = false;
                let esValidacion = false;

                if (item.tipo_atencion === 'primaria') {
                    esPrimera = true;
                    totalPrimera++;
                } else if (item.tipo_atencion === 'secundaria') {
                    esSubsecuente = true;
                    totalSubsecuente++;
                } else if (item.tipo_atencion === 'certificadomedico') {
                    esCertificado = true;
                    totalCertificado++;
                } else if (item.tipo_atencion === 'validacion') {
                    esValidacion = true;
                    totalValidacion++;
                }

                return `
                    <tr>
                        <td class="text-center">${index + 1}</td>
                        <td>${escapeHtml(nombres)}</td>
                        <td class="text-center">${escapeHtml(cedula)}</td>
                        <td>${escapeHtml(tipoDiscapacidad || '-')}</td>
                        <td class="text-center">${escapeHtml(edad)}</td>
                        <td class="text-center">${esHombre ? 'X' : ''}</td>
                        <td class="text-center">${esMujer ? 'X' : ''}</td>
                        <td class="text-center">${esLgbti ? 'X' : ''}</td>
                        <td>${escapeHtml(areaDocenteCarrera)}</td>
                        <td>${escapeHtml(areaAdministrativo)}</td>
                        <td class="text-center">${esPrimera ? 'X' : ''}</td>
                        <td class="text-center">${esSubsecuente ? 'X' : ''}</td>
                        <td class="text-center">${esCertificado ? 'X' : ''}</td>
                        <td class="text-center">${esValidacion ? 'X' : ''}</td>
                        <td>${escapeHtml(item.detalle_diagnostico || 'Evaluación general')}</td>
                    </tr>
                `;
            }).join('');

            const minRows = 12;
            let emptyRowsHtml = '';
            if (parteDiarioList.length < minRows) {
                for (let i = parteDiarioList.length; i < minRows; i++) {
                    emptyRowsHtml += `
                        <tr class="empty-row">
                            <td class="text-center">${i + 1}</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                    `;
                }
            }

            const htmlContent = `
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <title>Parte Diario de Medicina Ocupacional - UEB</title>
                    <meta charset="utf-8" />
                    <style>
                        @page { size: A4 landscape; margin: 10mm; }
                        body {
                            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                            font-size: 9px;
                            color: #333;
                            margin: 0;
                            padding: 20px;
                            background-color: #f3f4f6;
                            display: flex;
                            justify-content: center;
                            align-items: flex-start;
                            min-height: 100vh;
                            box-sizing: border-box;
                        }
                        .page-sheet {
                            background-color: #ffffff;
                            width: 297mm;
                            min-height: 210mm;
                            padding: 12mm;
                            box-sizing: border-box;
                            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
                            border-radius: 8px;
                            display: flex;
                            flex-direction: column;
                            justify-content: space-between;
                        }
                        .header-container {
                            display: grid;
                            grid-template-columns: 120px 1fr 120px;
                            align-items: center;
                            border-bottom: 2px solid #1e3a8a;
                            padding-bottom: 8px;
                            margin-bottom: 12px;
                        }
                        .header-logo-left {
                            font-weight: bold;
                            color: #1e3a8a;
                            font-size: 16px;
                            line-height: 1;
                        }
                        .header-logo-left span {
                            display: block;
                            font-size: 8px;
                            color: #666;
                            font-weight: normal;
                        }
                        .header-center {
                            text-align: center;
                        }
                        .header-center h1 {
                            margin: 0;
                            font-size: 14px;
                            color: #1e3a8a;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                        }
                        .header-center h2 {
                            margin: 2px 0 0 0;
                            font-size: 11px;
                            color: #475569;
                            font-weight: 600;
                        }
                        .header-center h3 {
                            margin: 2px 0 0 0;
                            font-size: 10px;
                            color: #0284c7;
                            font-weight: bold;
                        }
                        .header-logo-right {
                            text-align: right;
                            font-size: 9px;
                            font-weight: bold;
                            color: #1e3a8a;
                        }
                        .meta-info {
                            display: flex;
                            justify-content: space-between;
                            margin-bottom: 10px;
                            font-size: 10px;
                            font-weight: bold;
                        }
                        .meta-date {
                            background-color: #f1f5f9;
                            padding: 4px 8px;
                            border-radius: 4px;
                            border: 1px solid #cbd5e1;
                        }
                        .meta-tag {
                            background-color: #e0f2fe;
                            color: #0369a1;
                            padding: 4px 8px;
                            border-radius: 4px;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 10px;
                        }
                        th, td {
                            border: 1px solid #94a3b8;
                            padding: 4px 5px;
                            font-size: 8.5px;
                        }
                        th {
                            background-color: #f8fafc;
                            color: #1e293b;
                            font-weight: bold;
                            text-align: center;
                            vertical-align: middle;
                        }
                        .sub-header th {
                            font-size: 7.5px;
                            background-color: #f1f5f9;
                        }
                        .th-num { width: 25px; }
                        .th-nombres { width: 160px; text-align: left; }
                        .th-cedula { width: 75px; }
                        .th-discapacidad { width: 90px; }
                        .th-edad { width: 30px; }
                        .th-genero { width: 45px; }
                        .th-area { width: 95px; }
                        .th-atencion { width: 65px; }
                        .th-diag { text-align: left; }
                        .text-center { text-align: center; }
                        .empty-row td { height: 16px; }
                        .total-row td {
                            font-weight: bold;
                            background-color: #f1f5f9;
                            border-top: 2px solid #475569;
                        }
                        @media print {
                            body { background-color: transparent; padding: 0; }
                            .page-sheet { box-shadow: none; border-radius: 0; width: 100%; min-height: auto; padding: 0; }
                        }
                    </style>
                </head>
                <body>
                    <div class="page-sheet">
                    <div>
                    <div class="header-container" style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #002040; padding-bottom: 8px; margin-bottom: 12px;">
                        <div style="width: 140px; text-align: left;">
                            <img src="${logoBienestar}" alt="Bienestar Universitario" style="max-height: 48px; object-fit: contain;" />
                        </div>
                        <div class="header-center" style="text-align: center; flex: 1;">
                            <h1 style="margin: 0; font-size: 14px; font-weight: 900; color: #002040;">UNIVERSIDAD ESTATAL DE BOLÍVAR</h1>
                            <h2 style="margin: 2px 0; font-size: 11px; font-weight: 800; color: #475569;">DIRECCIÓN DE BIENESTAR UNIVERSITARIO</h2>
                            <h3 style="margin: 2px 0 0 0; font-size: 10.5px; font-weight: 900; color: #0284c7;">PARTE DIARIO - MEDICINA OCUPACIONAL</h3>
                        </div>
                        <div style="width: 140px; text-align: right;">
                            <img src="${logoUebTexto}" alt="UEB" style="max-height: 40px; object-fit: contain;" />
                        </div>
                    </div>

                    <div class="meta-info">
                        <div class="meta-date">FECHA: ${escapeHtml(parteDiarioDate)}</div>
                        <div class="meta-tag">MEDICINA OCUPACIONAL</div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th rowspan="2" class="th-num">N.-</th>
                                <th rowspan="2" class="th-nombres">NOMBRES Y APELLIDOS</th>
                                <th rowspan="2" class="th-cedula">CÉDULA</th>
                                <th class="th-discapacidad">DISCAPACIDAD</th>
                                <th rowspan="2" class="th-edad">EDAD</th>
                                <th colspan="3" class="th-genero">GÉNERO</th>
                                <th colspan="2" class="th-area">ÁREA</th>
                                <th colspan="4" class="th-atencion">TIPO ATENCION</th>
                                <th rowspan="2" class="th-diag">DIAGNOSTICO</th>
                            </tr>
                            <tr class="sub-header">
                                <th class="th-discapacidad">TIPO DE DISCAPACIDAD</th>
                                <th class="th-genero">HOMBRE</th>
                                <th class="th-genero">MUJER</th>
                                <th class="th-genero">LGBTI</th>
                                <th class="th-area">DOCENTE/CARRERA</th>
                                <th class="th-area">ADMINISTRATIVO</th>
                                <th class="th-atencion">PRIMERA</th>
                                <th class="th-atencion">SUBSECUENTE</th>
                                <th class="th-atencion">CERTIFICADO MEDICO</th>
                                <th class="th-atencion">VALIDACIÓN</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml}
                            ${emptyRowsHtml}
                            <tr class="total-row">
                                <td colspan="3" style="text-align: right; padding-right: 15px;">TOTAL</td>
                                <td></td>
                                <td></td>
                                <td class="text-center">${escapeHtml(totalHombres)}</td>
                                <td class="text-center">${escapeHtml(totalMujeres)}</td>
                                <td class="text-center">${escapeHtml(totalLgbti)}</td>
                                <td class="text-center">${escapeHtml(totalDocenteCarrera)}</td>
                                <td class="text-center">${escapeHtml(totalAdministrativo)}</td>
                                <td class="text-center">${escapeHtml(totalPrimera)}</td>
                                <td class="text-center">${escapeHtml(totalSubsecuente)}</td>
                                <td class="text-center">${escapeHtml(totalCertificado)}</td>
                                <td class="text-center">${escapeHtml(totalValidacion)}</td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>

                    <div style="margin-top: 40px; display: flex; justify-content: space-around; font-size: 9px;">
                        <div style="text-align: center; border-top: 1px solid #000; width: 220px; padding-top: 5px; margin-top: 20px;">
                            <strong>Responsable de Medicina Ocupacional</strong><br/>
                            <span>Firma y Sello</span>
                        </div>
                    </div>

                    ${forPrint ? `
                    <script>
                        window.onload = function() { window.print(); };
                    </script>
                    ` : ''}
                    </div>
                </body>
                </html>
            `;
            return htmlContent;
        } catch (error) {
            console.error('Error al generar reporte:', error);
            return '<p>Error al generar el reporte del parte diario.</p>';
        }
    };

    const handlePrintParteDiario = () => {
        printIframeDocument(diarioIframeRef, () => compileParteDiarioHtmlString(false));
    };

    // Igual que en Psicología: el reporte se abre primero en otra pestaña y desde allí se imprime
    const abrirReporteEnPestana = (html) => {
        const reportWindow = window.open('', '_blank');
        if (!reportWindow) {
            showSystemToast('Permita las ventanas emergentes del sitio para ver el reporte.');
            return;
        }
        reportWindow.document.write(html);
        reportWindow.document.close();
    };
    const handleVerReporteParteDiario = () => abrirReporteEnPestana(compileParteDiarioHtmlString(true));

    // Plantilla de la receta: ver ./reports/recetaTemplate.js (ISO/IEC 25010, modularidad)

    const handlePrintRecetaForm = (receta) => {
        try {
            printHtmlDocument(compileRecetaFormHtmlString(receta, false), `Receta Médica - ${receta?.numero_receta || '001'}`);
        } catch (e) {
            console.error(e);
            showSystemToast("Error al imprimir el recetario.");
        }
    };

    const compileCitasReportHtmlString = (forPrint = false) => {
        try {
            const doctorNameText = user?.name || 'Médico Ocupacional';
            const formattedDate = reportCitasFecha ? reportCitasFecha : 'Todas las fechas';

            const filteredReportCitas = citasList.filter(cita => {
                const matchesFecha = !reportCitasFecha || String(cita.fecha || '').slice(0, 10) === reportCitasFecha;
                const matchesEstado = reportCitasEstado === 'all' || (cita.estado || '').toLowerCase() === reportCitasEstado.toLowerCase();
                return matchesFecha && matchesEstado;
            });

            const total = filteredReportCitas.length;
            const completadas = filteredReportCitas.filter(c => c.estado === 'completada').length;
            const confirmadas = filteredReportCitas.filter(c => c.estado === 'confirmada').length;
            const programadas = filteredReportCitas.filter(c => c.estado === 'programada').length;
            const canceladas = filteredReportCitas.filter(c => c.estado === 'cancelada').length;

            const tableRowsHtml = filteredReportCitas.length === 0 ? `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 24px; color: #64748b; font-style: italic;">
                        No se registraron citas para los criterios seleccionados (${escapeHtml(formattedDate)}).
                    </td>
                </tr>
            ` : filteredReportCitas.map((cita, index) => {
                const patientName = cita.paciente?.name || cita.pacienteNombre || 'Paciente';
                const cedula = cita.paciente?.cedula || cita.cedula || 'N/D';
                const puesto = cita.paciente?.puesto || cita.puesto || 'Servidor';
                const estado = (cita.estado || 'programada').toUpperCase();
                const horario = `${cita.horaInicio || cita.hora_inicio || '08:00'} - ${cita.horaFin || cita.hora_fin || '08:30'}`;
                const motivo = cita.motivo || 'Consulta Ocupacional';
                const tipoEval = cita.tipoEvaluacion || cita.tipo_evaluacion || 'General';

                let estadoBadgeColor = '#1e40af';
                let estadoBadgeBg = '#dbeafe';
                if (cita.estado === 'confirmada') { estadoBadgeColor = '#065f46'; estadoBadgeBg = '#d1fae5'; }
                if (cita.estado === 'completada') { estadoBadgeColor = '#15803d'; estadoBadgeBg = '#dcfce7'; }
                if (cita.estado === 'cancelada') { estadoBadgeColor = '#991b1b'; estadoBadgeBg = '#fee2e2'; }

                return `
                    <tr>
                        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center; font-size: 8.5px;">${index + 1}</td>
                        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-size: 8.5px;">
                            <strong>${escapeHtml(patientName)}</strong><br/>
                            <span style="font-size: 7.5px; color: #64748b;">${escapeHtml(puesto)}</span>
                        </td>
                        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center; font-size: 8.5px;">${escapeHtml(cedula)}</td>
                        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center; font-size: 8.5px;">${escapeHtml(formatFecha(cita.fecha) || formattedDate)}</td>
                        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center; font-size: 8.5px; font-weight: 600;">${escapeHtml(horario)}</td>
                        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-size: 8.5px;"><strong>${escapeHtml(tipoEval)}:</strong> ${escapeHtml(motivo)}</td>
                        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center; font-size: 8px;">
                            <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-weight: bold; background: ${escapeHtml(estadoBadgeBg)}; color: ${escapeHtml(estadoBadgeColor)};">${escapeHtml(estado)}</span>
                        </td>
                    </tr>
                `;
            }).join('');

            return `
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <title>Reporte de Citas Ocupacionales - ${escapeHtml(formattedDate)}</title>
                    <style>
                        @page { size: A4 portrait; margin: 10mm; }
                        body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 9px; color: #1e293b; margin: 0; padding: 15px; background: #fff; }
                        .report-container { max-width: 800px; margin: 0 auto; }
                        .header-title { text-align: center; border-bottom: 2px solid #002040; padding-bottom: 8px; margin-bottom: 12px; }
                        .header-title h1 { margin: 0; font-size: 14px; font-weight: bold; color: #002040; text-transform: uppercase; }
                        .header-title h2 { margin: 2px 0; font-size: 11px; font-weight: bold; color: #475569; }
                        .header-title h3 { margin: 2px 0; font-size: 10px; font-weight: bold; color: #b71a34; text-transform: uppercase; }
                        .meta-bar { display: flex; justify-content: space-between; font-size: 8.5px; margin-bottom: 12px; background: #f8fafc; padding: 6px 10px; border-radius: 6px; border: 1px solid #e2e8f0; }
                        .summary-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 14px; }
                        .summary-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; text-align: center; }
                        .summary-box span { display: block; font-size: 8px; text-transform: uppercase; color: #64748b; font-weight: 600; margin-bottom: 2px; }
                        .summary-box strong { font-size: 14px; color: #002040; }
                        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
                        th { background: #002040; color: #ffffff; padding: 6px 8px; font-size: 8.5px; border: 1px solid #002040; text-align: center; }
                        .signature-section { margin-top: 40px; display: flex; justify-content: center; }
                        .signature-box { width: 220px; text-align: center; border-top: 1px solid #000; padding-top: 5px; font-size: 8.5px; }
                    </style>
                </head>
                <body>
                    <div class="report-container">
                        <div class="header-title" style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #002040; padding-bottom: 8px; margin-bottom: 12px;">
                            <div style="width: 140px; text-align: left;">
                                <img src="${logoBienestar}" alt="Bienestar Universitario" style="max-height: 48px; object-fit: contain;" />
                            </div>
                            <div style="text-align: center; flex: 1;">
                                <h1 style="margin: 0; font-size: 14px; font-weight: 900; color: #002040; text-transform: uppercase;">UNIVERSIDAD ESTATAL DE BOLÍVAR</h1>
                                <h2 style="margin: 2px 0; font-size: 11px; font-weight: 800; color: #475569;">DIRECCIÓN DE BIENESTAR UNIVERSITARIO</h2>
                                <h3 style="margin: 2px 0; font-size: 10px; font-weight: 900; color: #b71a34; text-transform: uppercase;">REPORTE DE AGENDAMIENTO Y CONTROL DE CITAS - SALUD OCUPACIONAL</h3>
                            </div>
                            <div style="width: 140px; text-align: right;">
                                <img src="${logoUebTexto}" alt="UEB" style="max-height: 40px; object-fit: contain;" />
                            </div>
                        </div>

                        <div class="meta-bar">
                            <div><strong>FECHA REPORTE:</strong> ${escapeHtml(formattedDate)}</div>
                            <div><strong>ESTADO FILTRADO:</strong> ${escapeHtml(reportCitasEstado.toUpperCase())}</div>
                            <div><strong>MÉDICO RESPONSABLE:</strong> ${escapeHtml(doctorNameText)}</div>
                        </div>

                        <div class="summary-grid">
                            <div class="summary-box">
                                <span>Total Citas</span>
                                <strong>${escapeHtml(total)}</strong>
                            </div>
                            <div class="summary-box">
                                <span>Completadas</span>
                                <strong style="color: #15803d;">${escapeHtml(completadas)}</strong>
                            </div>
                            <div class="summary-box">
                                <span>Confirmadas</span>
                                <strong style="color: #065f46;">${escapeHtml(confirmadas)}</strong>
                            </div>
                            <div class="summary-box">
                                <span>Programadas</span>
                                <strong style="color: #1e40af;">${escapeHtml(programadas)}</strong>
                            </div>
                            <div class="summary-box">
                                <span>Canceladas</span>
                                <strong style="color: #991b1b;">${escapeHtml(canceladas)}</strong>
                            </div>
                        </div>

                        <table>
                            <thead>
                                <tr>
                                    <th style="width: 25px;">#</th>
                                    <th>Paciente / Cargo</th>
                                    <th style="width: 75px;">Cédula</th>
                                    <th style="width: 70px;">Fecha</th>
                                    <th style="width: 85px;">Horario</th>
                                    <th>Evaluación / Motivo</th>
                                    <th style="width: 80px;">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tableRowsHtml}
                            </tbody>
                        </table>

                        <div class="signature-section">
                            <div class="signature-box">
                                <strong>${escapeHtml(doctorNameText)}</strong><br/>
                                <span>Médico/a Ocupacional Responsable</span>
                            </div>
                        </div>
                    </div>
                    ${forPrint ? `<script>window.onload = function() { window.print(); };</script>` : ''}
                </body>
                </html>
            `;
        } catch (e) {
            console.error('Error al compilar reporte de citas:', e);
            return '<p>Error al generar reporte de citas</p>';
        }
    };

    const handlePrintReporteCitas = () => {
        printIframeDocument(citasIframeRef, () => compileCitasReportHtmlString(false));
    };
    const handleVerReporteCitas = () => abrirReporteEnPestana(compileCitasReportHtmlString(true));

    const defaultUEBCareers = {
        'CIENCIAS DE LA SALUD': ['ENFERMERÍA', 'TERAPIA FÍSICA'],
        'JURISPRUDENCIA': ['DERECHO', 'CRIMINALÍSTICA'],
        'CIENCIAS ADMINISTRATIVAS': ['ADMINISTRACIÓN DE EMPRESAS', 'CONTABILIDAD Y AUDITORÍA', 'TURISMO', 'GESTIÓN DEL TALENTO HUMANO'],
        'CIENCIAS AGROPECUARIAS': ['AGRONOMÍA', 'VETERINARIA', 'AGROINDUSTRIA'],
        'CIENCIAS DE LA EDUCACIÓN': ['EDUCACIÓN BÁSICA', 'EDUCACIÓN INICIAL', 'PEDAGOGÍA DE LA ACTIVIDAD FÍSICA']
    };

    const fetchAndCompileGeneralReport = async (monthVal = genReportMonth, yearVal = genReportYear) => {
        setGenReportLoading(true);
        try {
            // Los partes de Medicina Ocupacional se registran en medicina-general/parte-diario
            const res = await api.get('/medicina-general/parte-diario')
                .catch(() => ({ data: { data: [] } }));
            const list = res.data?.data || [];

            const catRes = await api.get('/user-profile/catalogos').catch(() => ({ data: { facultades: [], carreras: [] } }));
            const dbFacultades = catRes.data?.facultades || [];
            const dbCarreras = catRes.data?.carreras || [];

            const targetMonthStr = `${yearVal}-${String(monthVal).padStart(2, '0')}`;
            const filteredPartes = list.filter(item => {
                const rawDate = item.fecha || item.created_at;
                if (!rawDate) return false;
                return String(rawDate).trim().slice(0, 7) === targetMonthStr;
            });

            const uniquePatientIds = [...new Set(filteredPartes.map(item => item.id_usuario_paciente || item.paciente?.id))].filter(Boolean);

            const patientProfiles = await Promise.all(
                uniquePatientIds.map(async (pid) => {
                    try {
                        const resProfile = await api.get(`/medicina-general/pacientes/${pid}/perfil`);
                        return { pid, profile: resProfile.data?.data };
                    } catch (e) {
                        return { pid, profile: null };
                    }
                })
            );

            const profileMap = {};
            patientProfiles.forEach(item => {
                if (item.pid) profileMap[item.pid] = item.profile;
            });

            const reportingFaculties = [
                'CIENCIAS DE LA SALUD',
                'JURISPRUDENCIA',
                'CIENCIAS ADMINISTRATIVAS',
                'CIENCIAS AGROPECUARIAS',
                'CIENCIAS DE LA EDUCACIÓN'
            ];

            const getReportingFacultyName = (facName, carName) => {
                const fn = (facName || '').toUpperCase();
                const cn = (carName || '').toUpperCase();
                if (cn.includes('CRIMIN')) return 'JURISPRUDENCIA';
                if (cn.includes('TALENTO')) return 'CIENCIAS ADMINISTRATIVAS';
                if (fn.includes('SALUD') || fn.includes('SER HUMANO')) return 'CIENCIAS DE LA SALUD';
                if (fn.includes('JURIS') || fn.includes('POLÍT') || fn.includes('SOCIALES')) return 'JURISPRUDENCIA';
                if (fn.includes('ADMINISTRATIVA') || fn.includes('EMPRESARIAL') || fn.includes('INFORMÁTICA')) return 'CIENCIAS ADMINISTRATIVAS';
                if (fn.includes('AGRO') || fn.includes('AMBIENTE')) return 'CIENCIAS AGROPECUARIAS';
                if (fn.includes('EDUCACIÓN') || fn.includes('FILOSÓFICA')) return 'CIENCIAS DE LA EDUCACIÓN';
                return fn || 'OTRAS';
            };

            const statsByFacultyAndCareer = {};
            reportingFaculties.forEach(f => {
                statsByFacultyAndCareer[f] = {};
            });

            if (dbCarreras.length > 0) {
                dbCarreras.forEach(c => {
                    const parentFac = dbFacultades.find(f => f.id === c.id_facultad);
                    const repFacName = getReportingFacultyName(parentFac?.nombre, c.nombre);
                    if (statsByFacultyAndCareer[repFacName]) {
                        statsByFacultyAndCareer[repFacName][c.nombre] = {
                            hombres: 0, mujeres: 0, lgbti: 0, total: 0
                        };
                    }
                });
            } else {
                Object.entries(defaultUEBCareers).forEach(([f, careers]) => {
                    careers.forEach(cName => {
                        statsByFacultyAndCareer[f][cName] = { hombres: 0, mujeres: 0, lgbti: 0, total: 0 };
                    });
                });
            }

            let totalEstudiantes = 0;
            let totalAdministrativos = 0;
            let totalDocentes = 0;

            let genderCounts = {
                estudiantes: { hombres: 0, mujeres: 0, lgbti: 0 },
                administrativos: { hombres: 0, mujeres: 0, lgbti: 0 },
                docentes: { hombres: 0, mujeres: 0, lgbti: 0 }
            };

            filteredPartes.forEach(item => {
                const profile = profileMap[item.id_usuario_paciente || item.paciente?.id] || item.paciente;

                const genderVal = (profile?.autopercepcion?.genero?.nombre || '').toLowerCase();
                let genderKey = 'mujeres';
                if (genderVal.includes('masc') || genderVal.includes('homb')) {
                    genderKey = 'hombres';
                } else if (genderVal.includes('fem') || genderVal.includes('muj')) {
                    genderKey = 'mujeres';
                } else if (genderVal.includes('lgbti') || genderVal.includes('diver') || genderVal !== '') {
                    genderKey = 'lgbti';
                }

                // Tipo de usuario con los códigos correctos (ver utils/tipoPaciente.js). Los pacientes
                // que aún no confirmaron su tipo no se cuentan en ningún grupo (antes se asumía uno).
                const tipoPaciente = clasificarTipoPaciente(profile);
                let userType = null;
                if (tipoPaciente === 'estudiante') {
                    userType = 'estudiantes';
                    totalEstudiantes++;
                } else if (tipoPaciente === 'docente') {
                    userType = 'docentes';
                    totalDocentes++;
                } else if (esPersonalAdministrativo(tipoPaciente)) {
                    userType = 'administrativos';
                    totalAdministrativos++;
                }

                if (userType) genderCounts[userType][genderKey]++;

                let canonCareerName = null;
                let repFacName = null;
                const patientCareerName = profile?.estudioCarrera?.carrera?.nombre || profile?.estudio_carrera?.carrera?.nombre;

                if (userType === 'estudiantes' && patientCareerName) {
                    const dbCar = dbCarreras.find(c => c.nombre.toLowerCase().trim() === patientCareerName.toLowerCase().trim());
                    if (dbCar) {
                        canonCareerName = dbCar.nombre;
                        const parentFac = dbFacultades.find(f => f.id === dbCar.id_facultad);
                        repFacName = getReportingFacultyName(parentFac?.nombre, dbCar.nombre);
                    }
                }

                if (userType === 'estudiantes' && canonCareerName && repFacName && statsByFacultyAndCareer[repFacName]?.[canonCareerName]) {
                    statsByFacultyAndCareer[repFacName][canonCareerName][genderKey]++;
                    statsByFacultyAndCareer[repFacName][canonCareerName].total++;
                }
            });

            setGenReportData({
                totalEstudiantes,
                totalAdministrativos,
                totalDocentes,
                totalPacientes: filteredPartes.length,
                genderCounts,
                statsByFacultyAndCareer,
                reportingFaculties
            });
        } catch (err) {
            console.error('Error al compilar reporte general:', err);
        } finally {
            setGenReportLoading(false);
        }
    };

    const compileGeneralReportHtmlString = (data, forPrint = false) => {
        const monthsText = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        const selectedMonthText = monthsText[genReportMonth - 1] || 'Enero';
        const doctorNameText = user?.name ? user.name.toUpperCase() : 'DR(A). MÉDICO OCUPACIONAL';

        if (!data) {
            return `
                <!DOCTYPE html><html lang="es"><body style="font-family: Arial, sans-serif; padding: 40px; text-align: center; color: #64748b;">
                    <p>Cargando información del informe estadístico mensual...</p>
                </body></html>
            `;
        }

        let totalEstCareersCount = 0;
        (data.reportingFaculties || []).forEach(f => {
            totalEstCareersCount += Object.keys(data.statsByFacultyAndCareer?.[f] || {}).length;
        });

        const renderTable1Rows = () => {
            let html = '';
            let isFirstRow = true;

            (data.reportingFaculties || []).forEach(f => {
                const careers = data.statsByFacultyAndCareer?.[f] || {};
                const careerNames = Object.keys(careers);
                const facCareersCount = careerNames.length;
                if (facCareersCount === 0) return;

                let isFirstCareerInFac = true;

                careerNames.forEach(cName => {
                    const stats = careers[cName] || { hombres: 0, mujeres: 0, lgbti: 0, total: 0 };
                    html += `<tr>`;

                    if (isFirstRow) {
                        html += `
                            <td rowspan="${escapeHtml(totalEstCareersCount || 1)}" style="writing-mode: vertical-lr; transform: rotate(180deg); font-weight: bold; text-align: center; vertical-align: middle; background-color: #f1f5f9; width: 25px; border: 1px solid #000; font-size: 9px;">
                                ESTUDIANTES
                            </td>
                        `;
                        isFirstRow = false;
                    }

                    if (isFirstCareerInFac) {
                        html += `
                            <td rowspan="${escapeHtml(facCareersCount)}" style="background-color: #f8fafc; border: 1px solid #000; vertical-align: middle; font-size: 8px; width: 140px; font-weight: bold; text-align: left;">
                                ${escapeHtml(f)}
                            </td>
                        `;
                        isFirstCareerInFac = false;
                    }

                    html += `
                        <td style="border: 1px solid #000; font-size: 8px; text-align: left;">${escapeHtml(cName)}</td>
                        <td style="border: 1px solid #000; font-size: 8px; text-align: center;">${escapeHtml(stats.hombres)}</td>
                        <td style="border: 1px solid #000; font-size: 8px; text-align: center;">${escapeHtml(stats.mujeres)}</td>
                        <td style="border: 1px solid #000; font-size: 8px; text-align: center;">${escapeHtml(stats.lgbti)}</td>
                        <td style="border: 1px solid #000; font-size: 8px; text-align: center; font-weight: bold; background-color: #f1f5f9;">${escapeHtml(stats.total)}</td>
                    </tr>
                    `;
                });
            });

            const gc = data.genderCounts || {
                estudiantes: { hombres: 0, mujeres: 0, lgbti: 0 },
                administrativos: { hombres: 0, mujeres: 0, lgbti: 0 },
                docentes: { hombres: 0, mujeres: 0, lgbti: 0 }
            };

            html += `
                <tr style="font-size: 8.5px; background: #e2e8f0; font-weight: bold;">
                    <td colspan="3" style="padding: 4px; border: 1px solid #000; text-align: left;">ESTUDIANTES</td>
                    <td style="border: 1px solid #000; text-align: center;">${escapeHtml(gc.estudiantes.hombres)}</td>
                    <td style="border: 1px solid #000; text-align: center;">${escapeHtml(gc.estudiantes.mujeres)}</td>
                    <td style="border: 1px solid #000; text-align: center;">${escapeHtml(gc.estudiantes.lgbti)}</td>
                    <td style="border: 1px solid #000; text-align: center; font-weight: bold; background: #cbd5e1;">${escapeHtml(data.totalEstudiantes || 0)}</td>
                </tr>
            `;

            html += `
                <tr style="font-size: 8.5px; background: #e2e8f0; font-weight: bold;">
                    <td colspan="3" style="padding: 4px; border: 1px solid #000; text-align: left;">ADMINISTRATIVOS</td>
                    <td style="border: 1px solid #000; text-align: center;">${escapeHtml(gc.administrativos.hombres)}</td>
                    <td style="border: 1px solid #000; text-align: center;">${escapeHtml(gc.administrativos.mujeres)}</td>
                    <td style="border: 1px solid #000; text-align: center;">${escapeHtml(gc.administrativos.lgbti)}</td>
                    <td style="border: 1px solid #000; text-align: center; font-weight: bold; background: #cbd5e1;">${escapeHtml(data.totalAdministrativos || 0)}</td>
                </tr>
            `;

            html += `
                <tr style="font-size: 8.5px; background: #e2e8f0; font-weight: bold;">
                    <td colspan="3" style="padding: 4px; border: 1px solid #000; text-align: left;">DOCENTES</td>
                    <td style="border: 1px solid #000; text-align: center;">${escapeHtml(gc.docentes.hombres)}</td>
                    <td style="border: 1px solid #000; text-align: center;">${escapeHtml(gc.docentes.mujeres)}</td>
                    <td style="border: 1px solid #000; text-align: center;">${escapeHtml(gc.docentes.lgbti)}</td>
                    <td style="border: 1px solid #000; text-align: center; font-weight: bold; background: #cbd5e1;">${escapeHtml(data.totalDocentes || 0)}</td>
                </tr>
            `;

            const totalH = gc.estudiantes.hombres + gc.administrativos.hombres + gc.docentes.hombres;
            const totalM = gc.estudiantes.mujeres + gc.administrativos.mujeres + gc.docentes.mujeres;
            const totalL = gc.estudiantes.lgbti + gc.administrativos.lgbti + gc.docentes.lgbti;
            const grandTotal = data.totalPacientes || 0;

            html += `
                <tr style="font-size: 9px; background-color: #0f172a !important; color: #fff; font-weight: bold;">
                    <td colspan="3" style="padding: 5px; border: 1px solid #000; text-align: left; color: #fff;">TOTAL ATENCIONES</td>
                    <td style="border: 1px solid #000; text-align: center; color: #fff;">${escapeHtml(totalH)}</td>
                    <td style="border: 1px solid #000; text-align: center; color: #fff;">${escapeHtml(totalM)}</td>
                    <td style="border: 1px solid #000; text-align: center; color: #fff;">${escapeHtml(totalL)}</td>
                    <td style="border: 1px solid #000; text-align: center; font-weight: bold; color: #fff;">${escapeHtml(grandTotal)}</td>
                </tr>
            `;

            return html;
        };

        return `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <title>Informe Estadístico Mensual - Salud Ocupacional</title>
                <style>
                    @page { size: A4 landscape; margin: 8mm; }
                    body { font-family: Arial, sans-serif; font-size: 9px; color: #000; margin: 0; padding: 15px; background: #fff; }
                    .header-title { text-align: center; margin-bottom: 12px; border-bottom: 2px solid #000; padding-bottom: 8px; }
                    .header-title h1 { margin: 0; font-size: 15px; font-weight: bold; text-transform: uppercase; }
                    .header-title h2 { margin: 2px 0; font-size: 12px; font-weight: bold; color: #334155; }
                    .header-title h3 { margin: 2px 0; font-size: 11px; font-weight: bold; text-transform: uppercase; color: #b71a34; }
                    .report-table { width: 100%; border-collapse: collapse; margin-top: 10px; border: 1.5px solid #000; }
                    .report-table th, .report-table td { border: 1px solid #000; padding: 4px 6px; font-size: 8.5px; }
                    .report-table th { background: #f1f5f9; text-align: center; font-weight: bold; }
                    .meta-grid { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 9.5px; }
                </style>
            </head>
            <body>
                <div class="header-title" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; border-bottom: 2px solid #000; padding-bottom: 8px;">
                    <div style="width: 140px; text-align: left;">
                        <img src="${logoBienestar}" alt="Bienestar Universitario" style="max-height: 48px; object-fit: contain;" />
                    </div>
                    <div style="text-align: center; flex: 1;">
                        <h1 style="margin: 0; font-size: 15px; font-weight: bold; text-transform: uppercase;">UNIVERSIDAD ESTATAL DE BOLÍVAR</h1>
                        <h2 style="margin: 2px 0; font-size: 12px; font-weight: bold; color: #334155;">DIRECCIÓN DE BIENESTAR UNIVERSITARIO</h2>
                        <h3 style="margin: 2px 0; font-size: 11px; font-weight: bold; text-transform: uppercase; color: #b71a34;">INFORME ESTADÍSTICO MENSUAL DE SALUD OCUPACIONAL</h3>
                    </div>
                    <div style="width: 140px; text-align: right;">
                        <img src="${logoUebTexto}" alt="UEB" style="max-height: 40px; object-fit: contain;" />
                    </div>
                </div>

                <div class="meta-grid">
                    <div><strong>UNIDAD OPERATIVA:</strong> SALUD OCUPACIONAL</div>
                    <div><strong>RESPONSABLE:</strong> ${escapeHtml(doctorNameText)}</div>
                    <div><strong>PERIODO:</strong> ${escapeHtml(selectedMonthText.toUpperCase())} ${escapeHtml(genReportYear)}</div>
                </div>

                <table class="report-table">
                    <thead>
                        <tr>
                            <th colspan="3">FACULTAD Y CARRERA / USUARIOS</th>
                            <th style="width: 60px;">HOMBRES</th>
                            <th style="width: 60px;">MUJERES</th>
                            <th style="width: 60px;">LGBTI</th>
                            <th style="width: 70px;">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${renderTable1Rows()}
                    </tbody>
                </table>

                <div style="margin-top: 40px; display: flex; justify-content: space-around; font-size: 9px;">
                    <div style="text-align: center; border-top: 1px solid #000; width: 220px; padding-top: 5px;">
                        <strong>Médico/a Ocupacional Responsable</strong><br/>
                        <span>${escapeHtml(doctorNameText)}</span>
                    </div>
                </div>

                ${forPrint ? `<script>window.onload = function() { window.print(); };</script>` : ''}
            </body>
            </html>
        `;
    };

    const handlePrintGeneralReport = () => {
        printIframeDocument(mensualIframeRef, () => compileGeneralReportHtmlString(genReportData, false));
    };

    const [fichaSearchTerm, setFichaSearchTerm] = useState('');

    // Búsqueda en vivo por nombre o cédula (sin distinguir mayúsculas ni tildes)
    const normalizarBusqueda = (texto) => String(texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    const coincideFicha = (item) => {
        const termino = normalizarBusqueda(fichaSearchTerm);
        if (!termino) return true;
        return normalizarBusqueda(item.paciente).includes(termino)
            || String(item.cedula || '').replace(/\D/g, '').includes(termino.replace(/\D/g, '') || '\u0000');
    };
    const filteredFichas = fichasData.filter(coincideFicha);
    const filteredReintegros = reintegrosData.filter(coincideFicha);

    const getActiveFichaList = () => {
        if (fichaSubTab === 'reintegro') return filteredReintegros;
        if (fichaSubTab === 'cese') return filteredFichas.filter(f => f.tipo === 'Retiro');
        return filteredFichas.filter(f => f.tipo !== 'Retiro');
    };

    const activeFichas = getActiveFichaList();
    const selectedFichaRecord = activeFichas.find(f => String(f.id) === String(selectedFichaWorkerId)) || activeFichas[0] || null;

    const compileCurrentFicha077Html = (record = selectedFichaRecord, forPrint = false) => {
        const target = record || selectedFichaRecord;
        if (!target) return '<!DOCTYPE html><html lang="es"><body><p>Seleccione un trabajador</p></body></html>';
        if (fichaSubTab === 'reintegro') {
            return compileOfficialReintegroFormHtml(target, uebBannerLogo, forPrint);
        }
        if (fichaSubTab === 'cese') {
            return compileOfficialRetiroFormHtml(target, uebBannerLogo, forPrint);
        }
        return compileOfficialIngresoFormHtml(target, uebBannerLogo, forPrint);
    };

    const handlePrintSelectedFicha = () => {
        printIframeDocument(fichasIframeRef, () => compileCurrentFicha077Html(selectedFichaRecord, false));
        showSystemToast('Enviando Formulario Oficial 077 a impresión...');
    };

    const handlePrintFichasMatrix = () => {
        const subTabNames = {
            ingreso: 'Fichas Médicas Ocupacionales de Ingreso / Periódicas',
            cese: 'Fichas Médicas de Retiro / Cese Laboral',
            reintegro: 'Registro de Reintegro Laboral y Adaptación Ocupacional',
            embarazadas: 'Vigilancia Médica de Gestantes y Lactantes',
            discapacidad: 'Fichas Ocupacionales de Funcionarios con Discapacidad',
            vulnerables_patologias: 'Fichas de Grupos Vulnerables (Patologías)',
            personal_nuevo: 'Fichas de Personal Nuevo que Ingresó'
        };

        const title = subTabNames[fichaSubTab] || 'Reporte de Fichas Médicas Ocupacionales';
        const isReintegro = fichaSubTab === 'reintegro';
        const dataToPrint = isReintegro ? filteredReintegros : filteredFichas;

        let tableHeadersHtml = '';
        let tableRowsHtml = '';

        if (isReintegro) {
            tableHeadersHtml = `
                <tr>
                    <th style="width: 35px;">N°</th>
                    <th>FECHA REINTEGRO</th>
                    <th>TRABAJADOR</th>
                    <th>CÉDULA</th>
                    <th>PUESTO</th>
                    <th>DÍAS INCAPACIDAD</th>
                    <th>DIAGNÓSTICO ORIGEN</th>
                    <th>MODALIDAD</th>
                    <th>ESTADO</th>
                </tr>
            `;
            tableRowsHtml = dataToPrint.map((item, idx) => `
                <tr>
                    <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
                    <td style="text-align: center; font-weight: bold; color: #0284c7;">${escapeHtml(item.fecha)}</td>
                    <td style="font-weight: bold; text-transform: uppercase;">${escapeHtml(item.paciente)}</td>
                    <td style="text-align: center; font-family: monospace;">${escapeHtml(item.cedula)}</td>
                    <td style="text-transform: uppercase;">${escapeHtml(item.puesto)}</td>
                    <td style="text-align: center; font-weight: bold; color: #0369a1;">${escapeHtml(item.dias)} días</td>
                    <td>${escapeHtml(item.diagnostico)}</td>
                    <td style="text-align: center;">${escapeHtml(item.tipo)}</td>
                    <td style="text-align: center; font-weight: bold; color: ${item.estado === 'Aprobado' ? '#166534' : '#b45309'};">${escapeHtml(item.estado)}</td>
                </tr>
            `).join('');
        } else {
            tableHeadersHtml = `
                <tr>
                    <th style="width: 35px;">N°</th>
                    <th>FECHA EVALUACIÓN</th>
                    <th>TRABAJADOR / PACIENTE</th>
                    <th>CÉDULA</th>
                    <th>TIPO DE EVALUACIÓN</th>
                    <th>PUESTO DE TRABAJO</th>
                    <th>DICTAMEN DE APTITUD</th>
                    <th>ESTADO</th>
                </tr>
            `;
            tableRowsHtml = dataToPrint.map((item, idx) => `
                <tr>
                    <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
                    <td style="text-align: center; font-weight: bold; color: #0284c7;">${escapeHtml(item.fecha)}</td>
                    <td style="font-weight: bold; text-transform: uppercase;">${escapeHtml(item.paciente)}</td>
                    <td style="text-align: center; font-family: monospace;">${escapeHtml(item.cedula)}</td>
                    <td style="text-align: center; font-weight: bold; color: #334155;">${escapeHtml(item.tipo)}</td>
                    <td style="text-transform: uppercase;">${escapeHtml(item.puesto)}</td>
                    <td style="text-align: center; font-weight: bold; color: ${escapeHtml(item.aptitud.includes('Restricción') || item.aptitud.includes('Adaptación') ? '#b45309' : item.aptitud.includes('No') ? '#dc2626' : '#15803d')};">${escapeHtml(item.aptitud)}</td>
                    <td style="text-align: center; font-weight: bold; color: #166534;">${escapeHtml(item.estado || 'Completado')}</td>
                </tr>
            `).join('');
        }

        const html = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8" />
                <title>${escapeHtml(title)} - UEB Salud Ocupacional</title>
                <style>
                    @page { size: landscape; margin: 8mm; }
                    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 12px; color: #0f172a; background: #fff; }
                    .header-top { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #002060; padding-bottom: 8px; margin-bottom: 12px; }
                    .banner { background-color: #002060; color: white; padding: 12px 16px; border-radius: 6px; text-align: center; font-size: 15px; font-weight: bold; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 14px; }
                    table { width: 100%; border-collapse: collapse; font-size: 10.5px; }
                    th { background-color: #0284c7; color: #ffffff; padding: 8px 6px; font-weight: bold; border: 1px solid #0369a1; text-align: center; text-transform: uppercase; }
                    td { padding: 6px 8px; border: 1px solid #cbd5e1; }
                    tr:nth-child(even) { background-color: #f8fafc; }
                    .footer-sig { margin-top: 35px; display: flex; justify-content: space-around; text-align: center; font-size: 11px; }
                    .sig-line { border-top: 1px solid #000; width: 240px; margin: 0 auto 4px auto; padding-top: 4px; font-weight: bold; }
                    @media print {
                        .no-print { display: none !important; }
                    }
                </style>
            </head>
            <body>
                <div class="no-print" style="position: sticky; top: 0; background: #002060; color: #ffffff; padding: 10px 18px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15); margin-bottom: 14px; border-radius: 6px; z-index: 9999;">
                    <div style="font-weight: 800; font-size: 13px; letter-spacing: 0.3px;">
                        UNIVERSIDAD ESTATAL DE BOLÍVAR · ${escapeHtml(title)}
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button onclick="window.print()" style="background: #0284c7; color: #ffffff; border: none; padding: 7px 16px; border-radius: 6px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 12px;">
                            Imprimir / Guardar PDF
                        </button>
                        <button onclick="window.close()" style="background: #475569; color: #ffffff; border: none; padding: 7px 14px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 12px;">
                            Cerrar
                        </button>
                    </div>
                </div>

                <div class="header-top" style="display: flex; align-items: center; justify-content: space-between;">
                    <img src="${logoBienestar}" style="height: 52px; object-fit: contain;" alt="Bienestar Universitario UEB" />
                    <div style="text-align: center; flex: 1;">
                        <div><strong style="font-size: 13px; color: #002040;">UNIVERSIDAD ESTATAL DE BOLÍVAR</strong></div>
                        <div style="font-size: 11px; font-weight: 800; color: #0284c7;">DIRECCIÓN DE BIENESTAR UNIVERSITARIO · SALUD OCUPACIONAL</div>
                        <div style="font-size: 10px; color: #64748b;">Fecha de Emisión: ${escapeHtml(new Date().toLocaleDateString('es-EC'))}</div>
                    </div>
                    <img src="${logoUebTexto}" style="height: 40px; object-fit: contain;" alt="Logo UEB" />
                </div>
                <div class="banner">
                    ${escapeHtml(title)}
                </div>
                <table>
                    <thead>
                        ${tableHeadersHtml}
                    </thead>
                    <tbody>
                        ${tableRowsHtml || '<tr><td colspan="9" style="text-align:center; padding: 20px;">No hay registros disponibles.</td></tr>'}
                    </tbody>
                </table>
                <div class="footer-sig">
                    <div>
                        <div class="sig-line">MÉDICO OCUPACIONAL</div>
                        Unidad de Salud Ocupacional - UEB
                    </div>
                    <div>
                        <div class="sig-line">RESPONSABLE SEGURIDAD Y SALUD</div>
                        Dirección de Talento Humano - UEB
                    </div>
                </div>
                <script>
                    if (document.readyState === 'complete') {
                        setTimeout(function() { window.print(); }, 350);
                    } else {
                        window.addEventListener('load', function() {
                            setTimeout(function() { window.print(); }, 350);
                        });
                    }
                </script>
            </body>
            </html>
        `;

        printHtmlDocument(html, title);
    };

    const handleExportFichasCSV = () => {
        const isReintegro = fichaSubTab === 'reintegro';
        let headers = [];
        let rows = [];

        if (isReintegro) {
            headers = ["FECHA REINTEGRO", "TRABAJADOR", "CEDULA", "PUESTO", "DIAS INCAPACIDAD", "DIAGNOSTICO ORIGEN", "MODALIDAD", "ESTADO"];
            rows = filteredReintegros.map(item => [
                `"${(item.fecha || '').replace(/"/g, '""')}"`,
                `"${(item.paciente || '').replace(/"/g, '""')}"`,
                `"${(item.cedula || '').replace(/"/g, '""')}"`,
                `"${(item.puesto || '').replace(/"/g, '""')}"`,
                `"${item.dias || 0}"`,
                `"${(item.diagnostico || '').replace(/"/g, '""')}"`,
                `"${(item.tipo || '').replace(/"/g, '""')}"`,
                `"${(item.estado || '').replace(/"/g, '""')}"`
            ]);
        } else {
            headers = ["FECHA EVALUACION", "PACIENTE", "CEDULA", "TIPO EVALUACION", "PUESTO DE TRABAJO", "DICTAMEN APTITUD", "ESTADO"];
            rows = filteredFichas.map(item => [
                `"${(item.fecha || '').replace(/"/g, '""')}"`,
                `"${(item.paciente || '').replace(/"/g, '""')}"`,
                `"${(item.cedula || '').replace(/"/g, '""')}"`,
                `"${(item.tipo || '').replace(/"/g, '""')}"`,
                `"${(item.puesto || '').replace(/"/g, '""')}"`,
                `"${(item.aptitud || '').replace(/"/g, '""')}"`,
                `"${(item.estado || 'Completado').replace(/"/g, '""')}"`
            ]);
        }

        const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map(e => e.join(";"))].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `FICHAS_OCUPACIONALES_${fichaSubTab.toUpperCase()}_UEB.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrintIndividualFicha = (item) => {
        if (item.tipo === 'Ingreso' || item.tipo === 'Periódico') {
            printOfficialIngresoForm(item, uebBannerLogo);
            return;
        }
        if (item.tipo === 'Retiro' || item.tipo === 'Cese') {
            printOfficialRetiroForm(item, uebBannerLogo);
            return;
        }
        if (item.tipo === 'Reintegro') {
            printOfficialReintegroForm(item, uebBannerLogo);
            return;
        }
        const html = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8" />
                <title>Ficha Médica Ocupacional - ${escapeHtml(item.paciente)}</title>
                <style>
                    @page { size: portrait; margin: 12mm; }
                    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 10px; color: #1e293b; background: #fff; font-size: 12px; }
                    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #002060; padding-bottom: 8px; margin-bottom: 14px; }
                    .banner { background: #002060; color: #fff; text-align: center; padding: 10px; font-weight: bold; font-size: 14px; text-transform: uppercase; border-radius: 4px; margin-bottom: 16px; }
                    .section-title { background: #f1f5f9; padding: 6px 10px; font-weight: bold; color: #0f172a; text-transform: uppercase; font-size: 11px; margin-top: 14px; margin-bottom: 8px; border-left: 4px solid #0284c7; }
                    table.grid { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
                    table.grid td, table.grid th { border: 1px solid #cbd5e1; padding: 7px 10px; }
                    table.grid th { background: #f8fafc; text-align: left; font-size: 11px; color: #475569; width: 30%; }
                    .aptitud-box { margin-top: 14px; padding: 12px; border: 2px solid #0284c7; border-radius: 6px; text-align: center; background: #f0f9ff; font-weight: bold; font-size: 14px; color: #0369a1; text-transform: uppercase; }
                    .footer-sig { margin-top: 50px; display: flex; justify-content: space-between; text-align: center; }
                    .sig-line { border-top: 1px solid #000; width: 220px; padding-top: 4px; font-weight: bold; font-size: 11px; }
                    @media print {
                        .no-print { display: none !important; }
                    }
                </style>
            </head>
            <body>
                <div class="no-print" style="position: sticky; top: 0; background: #002060; color: #ffffff; padding: 10px 18px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15); margin-bottom: 14px; border-radius: 6px; z-index: 9999;">
                    <div style="font-weight: 800; font-size: 13px; letter-spacing: 0.3px;">
                        UNIVERSIDAD ESTATAL DE BOLÍVAR · FICHA MÉDICA OCUPACIONAL
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button onclick="window.print()" style="background: #0284c7; color: #ffffff; border: none; padding: 7px 16px; border-radius: 6px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 12px;">
                            Imprimir / Guardar PDF
                        </button>
                        <button onclick="window.close()" style="background: #475569; color: #ffffff; border: none; padding: 7px 14px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 12px;">
                            Cerrar
                        </button>
                    </div>
                </div>

                <div class="header">
                    <img src="${uebBannerLogo}" style="height: 50px; object-fit: contain;" alt="UEB Logo" />
                    <div style="text-align: right; font-size: 11px; color: #475569;">
                        <strong>UNIVERSIDAD ESTATAL DE BOLÍVAR</strong><br/>
                        Unidad de Seguridad y Salud en el Trabajo<br/>
                        Fecha de Emisión: ${escapeHtml(new Date().toLocaleDateString('es-EC'))}
                    </div>
                </div>

                <div class="banner">CERTIFICADO DE APTITUD MÉDICA OCUPACIONAL</div>

                <div class="section-title">1. DATOS DE IDENTIFICACIÓN DEL TRABAJADOR</div>
                <table class="grid">
                    <tr><th>Nombres y Apellidos</th><td style="font-weight: bold; text-transform: uppercase;">${escapeHtml(item.paciente)}</td></tr>
                    <tr><th>Cédula de Identidad</th><td style="font-family: monospace; font-weight: bold;">${escapeHtml(item.cedula)}</td></tr>
                    <tr><th>Puesto / Cargo Asignado</th><td style="text-transform: uppercase;">${escapeHtml(item.puesto)}</td></tr>
                    <tr><th>Tipo de Evaluación</th><td style="font-weight: bold; color: #0284c7;">${escapeHtml(item.tipo)}</td></tr>
                    <tr><th>Fecha de Evaluación</th><td>${escapeHtml(item.fecha)}</td></tr>
                </table>

                <div class="section-title">2. DICTAMEN DE APTITUD LABORAL</div>
                <div class="aptitud-box">
                    RESULTADO: ${escapeHtml(item.aptitud)}
                </div>

                <div class="section-title">3. CONCLUSIONES Y RECOMENDACIONES OCUPACIONALES</div>
                <div style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 4px; line-height: 1.5; font-size: 11.5px; background: #fafafa;">
                    El servidor ha sido evaluado bajo los protocolos oficiales de medicina del trabajo de la Universidad Estatal de Bolívar. 
                    Cumple con los requisitos psicofisiológicos exigidos para el desempeño del puesto de trabajo según las normativas del Ministerio del Trabajo e IESS (Resolución CD 513).
                    Se recomienda dar cumplimiento a pausas activas, ergonomía del puesto y controles médicos periódicos anuales.
                </div>

                <div class="footer-sig">
                    <div>
                        <div class="sig-line">FIRMA DEL TRABAJADOR EVALUADO</div>
                        C.I.: ${escapeHtml(item.cedula)}
                    </div>
                    <div>
                        <div class="sig-line">MÉDICO OCUPACIONAL</div>
                        Registro Profesional MSP / Senescyt
                    </div>
                </div>
                <script>
                    if (document.readyState === 'complete') {
                        setTimeout(function() { window.print(); }, 350);
                    } else {
                        window.addEventListener('load', function() {
                            setTimeout(function() { window.print(); }, 350);
                        });
                    }
                </script>
            </body>
            </html>
        `;

        printHtmlDocument(html, `Ficha Ocupacional - ${item.paciente}`);
    };

    const filteredExamenes = examenesData.filter(item => {
        const matchesSearch = (item.paciente || '').toLowerCase().includes(examSearchTerm.toLowerCase()) ||
            (item.cedula || '').includes(examSearchTerm) ||
            (item.examen || '').toLowerCase().includes(examSearchTerm.toLowerCase()) ||
            (item.laboratorio || '').toLowerCase().includes(examSearchTerm.toLowerCase());

        if (!matchesSearch) return false;

        if (examFilterStatus === 'pendiente') {
            return item.estado === 'Pendiente';
        }
        if (examFilterStatus === 'realizado') {
            return item.estado === 'Realizado';
        }
        return true;
    });

    const handleOpenExamModal = () => {
        if (patientSelected) {
            setExamForm(prev => ({
                ...prev,
                pacienteCedula: patientSelected.cedula || '',
                pacienteNombre: patientSelected.nombre_completo || `${patientSelected.nombres || ''} ${patientSelected.apellidos || ''}`.trim()
            }));
        }
        setIsExamModalOpen(true);
    };

    const handleSaveExamOrder = async (e) => {
        e.preventDefault();
        if (examSaving) return;
        const pacienteNombreFinal = patientSelected
            ? `${patientSelected.nombres} ${patientSelected.apellidos}`.trim()
            : (examForm.pacienteNombre || '');

        // La orden se guarda en el expediente del paciente: debe estar registrado en el sistema
        if (!patientSelected?.id) {
            alert('Seleccione un paciente registrado con el buscador antes de emitir la orden de examen.');
            return;
        }

        setExamSaving(true);
        try {
            await api.post('/medicina-ocupacional/orden-examen', {
                id_usuario_paciente: patientSelected.id,
                fecha: localDateStr(),
                observaciones: examForm.motivo || 'Orden de examen ocupacional',
                otros_examenes: [examForm.examenTipo]
            });
        } catch (err) {
            const data = err.response?.data;
            const firstError = data?.errors ? Object.values(data.errors)[0]?.[0] : null;
            alert(`No se pudo emitir la orden de examen. ${firstError || data?.message || 'Verifique su conexión e inténtelo de nuevo.'}`);
            setExamSaving(false);
            return;
        }
        setExamSaving(false);

        setIsExamModalOpen(false);
        showSystemToast(`Orden de examen emitida con éxito para ${pacienteNombreFinal}.`);
        fetchExamOrders();

        setExamForm({
            pacienteCedula: '',
            pacienteNombre: '',
            examenTipo: 'Audiometría Tonal Ocupacional',
            motivo: 'Vigilancia Epidemiológica de Salud Ocupacional',
            laboratorio: 'Laboratorio Ocupacional Institucional',
            prioridad: 'Normal',
            observaciones: ''
        });
    };

    const handleSaveExamResult = (e) => {
        e.preventDefault();
        if (!examResultModal.item) return;

        setExamenesData(prev => prev.map(item => {
            if (item.id === examResultModal.item.id) {
                return {
                    ...item,
                    estado: examResultModal.estado,
                    resultado: examResultModal.resultadoText || 'Informe emitido por laboratorio'
                };
            }
            return item;
        }));

        setExamResultModal({ show: false, item: null, resultadoText: '', estado: 'Realizado' });
    };

    const handleSearchFarmacia = async (query = '') => {
        setFarmaciaSearchQuery(query);
        if (!query || query.trim().length < 2) {
            setFarmaciaSearchResults([]);
            return;
        }
        setFarmaciaSearchLoading(true);
        try {
            const res = await api.get('/farmacia-search', { params: { query: query.trim() } });
            setFarmaciaSearchResults(res.data.data || []);
        } catch (err) {
            console.error('Error buscando productos de farmacia:', err);
            setFarmaciaSearchResults([]);
        } finally {
            setFarmaciaSearchLoading(false);
        }
    };

    const handleSelectFarmaciaProduct = (product) => {
        const hasStock = (product.stock_cajas || 0) > 0 || (product.stock_unidades || 0) > 0;
        setPrescripcionForm(prev => ({
            ...prev,
            detalle_medicamento: `${product.nombre} (${product.presentacion?.nombre || 'General'})`,
            id_producto_farmacia: product.id,
            via: viaDeProducto(product) || prev.via,
            disponible_farmacia: hasStock ? 'farmacia' : 'no_disponible',
            observaciones: hasStock
                ? `Stock actual: ${product.stock_cajas} cajas / ${product.stock_unidades} unidades`
                : 'Sin stock en Farmacia de Enfermería: receta para compra externa.'
        }));
        setViaFarmacia(viaDeProducto(product));
        setFarmaciaSearchQuery('');
        setFarmaciaSearchResults([]);
    };

    const handleAddPrescripcionLine = () => {
        if (!prescripcionForm.detalle_medicamento.trim()) {
            alert('Por favor ingrese o seleccione el nombre del medicamento.');
            return;
        }
        setPrescripcionesList(prev => [...prev, { ...prescripcionForm, observacion_nodisponible: prescripcionForm.disponible_farmacia === 'no_disponible' ? prescripcionForm.observaciones : '' }]);
        setViaFarmacia(null);
        setPrescripcionForm({
            detalle_medicamento: '',
            dosis: '1 tableta',
            via: 'Oral',
            frecuencia: '8',
            duracion: '3',
            cantidad_cajas: '0',
            cantidad_unidades: '0',
            disponible_farmacia: 'farmacia',
            observaciones: '',
            observacion_nodisponible: '',
            id_producto_farmacia: null
        });
    };

    const handleRemovePrescripcionLine = (index) => {
        setPrescripcionesList(prev => prev.filter((_, idx) => idx !== index));
    };


    useEffect(() => {
        if (activeTab === 'evolucion' && patientSelected?.id) {
            setActiveBookRecord(null);
            setHistoryPage(1);
            fetchPatientHistoryByArea(patientSelected.id);
        }
    }, [activeTab, patientSelected?.id]);

    // Calculate IMC automatically when peso & talla change
    useEffect(() => {
        const p = parseFloat(vitalSigns.peso);
        const t = parseFloat(vitalSigns.talla) / 100;
        if (p > 0 && t > 0) {
            const imcVal = (p / (t * t)).toFixed(1);
            setVitalSigns(prev => ({ ...prev, imc: imcVal }));
        }
    }, [vitalSigns.peso, vitalSigns.talla]);

    // Search Patients real API (Institutional Staff: Docentes, Administrativos, Código de Trabajo)
    const handleSearchPatient = async (term = '') => {
        setSearchTerm(term);
        setPatientSearchTerm(term);
        setIsSearchingPatients(true);
        try {
            const trimmed = (term || '').trim();
            const res = await api.get('/users/search-by-cedula', {
                params: {
                    query: trimmed,
                    ambito: 'ocupacional'
                }
            });
            if (res.data && Array.isArray(res.data.data)) {
                setSearchResults(res.data.data);
            } else {
                setSearchResults([]);
            }
        } catch (err) {
            console.error("Error searching occupational patients:", err);
            setSearchResults([]);
        } finally {
            setIsSearchingPatients(false);
        }
    };
    const handleSearchPatients = handleSearchPatient;

    const openPatientSearch = (target = 'consulta') => {
        setPatientSearchTarget(target);
        handleSearchPatient('');
        setIsPatientSearchOpen(true);
    };

    const selectPatient = async (p, target = patientSearchTarget) => {
        // Cada atención empieza con el formulario limpio (antes quedaban los datos del paciente anterior)
        if (target === 'consulta') resetConsultaForm();
        setPatientSelected(p);
        setPatientId(p.id || p.cedula);
        setIsPatientSearchOpen(false);

        if (p.id) {
            try {
                const [signosRes, bloodRes] = await Promise.all([
                    api.get('/medicina-general/signos-vitales', { params: { id_usuario_paciente: p.id } }).catch(() => ({ data: { data: [] } })),
                    api.get(`/medicina-ocupacional/patient/${p.id}/blood-type`).catch(() => api.get(`/medicina-general/patient/${p.id}/blood-type`)).catch(() => ({ data: { data: null } }))
                ]);
                const latestSigns = Array.isArray(signosRes.data?.data) && signosRes.data.data.length > 0 ? signosRes.data.data[0] : null;
                if (latestSigns) {
                    setVitalSigns(prev => ({
                        ...prev,
                        paSystolic: latestSigns.presion_arterial_sistolica ? String(latestSigns.presion_arterial_sistolica) : prev.paSystolic,
                        paDiastolic: latestSigns.presion_arterial_diastolica ? String(latestSigns.presion_arterial_diastolica) : prev.paDiastolic,
                        fc: latestSigns.frecuencia_cardiaca ? String(latestSigns.frecuencia_cardiaca) : prev.fc,
                        fr: latestSigns.frecuencia_respiratoria ? String(latestSigns.frecuencia_respiratoria) : prev.fr,
                        temp: latestSigns.temperatura ? String(latestSigns.temperatura) : prev.temp,
                        peso: latestSigns.peso ? String(latestSigns.peso) : prev.peso,
                        talla: latestSigns.talla ? String(latestSigns.talla) : prev.talla
                    }));
                }
                const blood = bloodRes.data?.data?.tipo_sangre || bloodRes.data?.data?.blood_type;
                if (blood) {
                    setVitalSigns(prev => ({ ...prev, tipoSangre: blood }));
                }
            } catch (err) {
                console.log("Patient background clinical data offline");
            }
        }

        if (target === 'evolucion') {
            return;
        }

        if (target === 'exam') {
            setExamForm(prev => ({
                ...prev,
                pacienteCedula: p.cedula || '',
                pacienteNombre: p.nombre_completo || `${p.nombres || ''} ${p.apellidos || ''}`.trim()
            }));
            setIsExamModalOpen(true);
            return;
        }
        setConsultaActiveStep(0);
        setPrescripcionesList([]);
        setTipoAtencion('primaria');
        setIsConsultaModalOpen(true);
    };

    const resetConsultaForm = () => {
        setVitalSigns({ paSystolic: '', paDiastolic: '', fc: '', fr: '', temp: '', spo2: '', peso: '', talla: '', imc: '', glucosa: '' });
        setTipoFicha('Ingreso');
        setMotivoConsulta('');
        setEnfermedadActual('');
        setAntecedentesOcupacionales('');
        setExamenFisico('');
        setDiagnosticoCie('');
        setPlanTratamiento('');
        setAptitudLaboral('apto');
        setRestriccionesOcupacionales('');
        setConsultaErrores({});
    };

    // Campos obligatorios de cada paso del stepper (los pasos 6 y 7 son opcionales)
    const validarPasoConsulta = (paso) => {
        const e = {};
        const vacio = (v) => !String(v ?? '').trim();
        if (paso === 0) {
            Object.entries(RANGOS_SIGNOS_OCUPACIONAL).forEach(([k, [nombre, min, max]]) => {
                const v = vitalSigns[k];
                if (vacio(v)) e[k] = `Ingrese ${nombre}.`;
                else if (!(Number(v) >= min && Number(v) <= max)) e[k] = `Valor fuera de rango (${min} a ${max}).`;
            });
            if (!e.paSystolic && !e.paDiastolic && Number(vitalSigns.paDiastolic) >= Number(vitalSigns.paSystolic)) {
                e.paDiastolic = 'Debe ser menor que la PA sistólica.';
            }
        }
        if (paso === 1) {
            if (vacio(motivoConsulta)) e.motivoConsulta = 'Ingrese el motivo de la atención.';
            if (vacio(enfermedadActual)) e.enfermedadActual = 'Describa la enfermedad o sintomatología actual (o indique "Asintomático").';
        }
        if (paso === 2 && vacio(examenFisico)) e.examenFisico = 'Registre los hallazgos del examen físico.';
        if (paso === 3) {
            if (vacio(diagnosticoCie)) e.diagnosticoCie = 'Ingrese el diagnóstico CIE-10.';
            if (vacio(planTratamiento)) e.planTratamiento = 'Ingrese el plan de tratamiento o las indicaciones.';
        }
        if (paso === 4 && aptitudLaboral === 'apto_restriccion' && vacio(restriccionesOcupacionales)) {
            e.restriccionesOcupacionales = 'Detalle las restricciones del puesto.';
        }
        return e;
    };

    const handleSiguientePasoConsulta = () => {
        const e = validarPasoConsulta(consultaActiveStep);
        setConsultaErrores(e);
        if (Object.keys(e).length === 0) setConsultaActiveStep(prev => prev + 1);
    };

    // Antes de emitir la ficha se revisan todos los pasos y se lleva al primero incompleto
    const validarConsultaCompleta = () => {
        if (!patientSelected?.id) {
            alert('Seleccione un paciente registrado antes de emitir la ficha.');
            return false;
        }
        for (let paso = 0; paso < 5; paso++) {
            const e = validarPasoConsulta(paso);
            if (Object.keys(e).length > 0) {
                setConsultaErrores(e);
                setConsultaActiveStep(paso);
                return false;
            }
        }
        setConsultaErrores({});
        return true;
    };

    const errorConsulta = (campo) => consultaErrores[campo]
        ? <small role="alert" style={{ display: 'block', marginTop: '4px', color: '#dc2626', fontSize: '11px', fontWeight: 600 }}>{consultaErrores[campo]}</small>
        : null;

    const handleCancelConsulta = () => {
        setConfirmModal({
            show: true,
            title: '¿Cancelar atención médica?',
            message: '¿Está seguro de que desea cancelar la atención ocupacional actual? Se perderán todos los datos no guardados de esta consulta.',
            onConfirm: () => {
                setIsConsultaModalOpen(false);
            }
        });
    };

    const handleCancelExamModal = () => {
        setConfirmModal({
            show: true,
            title: '¿Cancelar orden de examen?',
            message: '¿Está seguro de que desea cancelar la emisión de la orden de examen? Se perderán todos los datos ingresados.',
            onConfirm: () => {
                setIsExamModalOpen(false);
            }
        });
    };

    const handleCancelPatientRegisterModal = () => {
        setConfirmModal({
            show: true,
            title: '¿Cancelar registro de paciente?',
            message: '¿Está seguro de que desea cancelar el registro del nuevo paciente? Se perderán todos los datos ingresados.',
            onConfirm: () => {
                setIsPatientRegisterOpen(false);
            }
        });
    };

    const handleSavePatientRegister = async (e) => {
        e.preventDefault();
        setRegisterLoading(true);
        setRegisterError('');
        // Cédula ecuatoriana validada con su algoritmo (los extranjeros usan pasaporte)
        if (newPatientForm.tipo_documento !== 'pasaporte' && !esCedulaValida(newPatientForm.cedula)) {
            setRegisterError(MENSAJE_CEDULA_INVALIDA);
            setRegisterLoading(false);
            return;
        }

        try {
            let finalEmail = (newPatientForm.correo || '').trim();
            if (finalEmail && !finalEmail.includes('@')) {
                finalEmail = `${finalEmail}@ueb.edu.ec`;
            }

            const response = await api.post('/users/register-patient', {
                email: finalEmail,
                cedula: newPatientForm.cedula,
                nombre_completo: newPatientForm.nombre_completo,
                tipo_documento: newPatientForm.tipo_documento,
                pais_origen: newPatientForm.pais_origen
                // Sin tipo de usuario: lo confirma el propio paciente al iniciar sesión
            });

            const patientData = response.data.data;
            const formattedPatient = {
                id: patientData.id || patientData.id_usuario,
                nombres: patientData.primer_nombre || patientData.nombre_completo || newPatientForm.nombre_completo,
                apellidos: patientData.apellido_paterno || '',
                nombre_completo: patientData.nombre_completo || newPatientForm.nombre_completo,
                cedula: patientData.numero_cedula || newPatientForm.cedula,
                tipo_documento: newPatientForm.tipo_documento,
                id_tipo_usuario: null,
                correo: finalEmail,
                puestoTrabajo: patientData.puestoTrabajo || 'Servidor / Empleado',
                areaTrabajo: patientData.areaTrabajo || 'General'
            };

            selectPatient(formattedPatient);
            setIsPatientRegisterOpen(false);
        } catch (err) {
            console.error(err);
            const fullName = (newPatientForm.nombre_completo || '').trim();
            const created = {
                id: Date.now().toString(),
                nombres: fullName,
                apellidos: '',
                nombre_completo: fullName,
                cedula: newPatientForm.cedula,
                tipo_documento: newPatientForm.tipo_documento || 'cedula',
                id_tipo_usuario: null,
                correo: newPatientForm.correo ? `${newPatientForm.correo}@ueb.edu.ec` : '',
                puestoTrabajo: 'Servidor / Empleado',
                areaTrabajo: 'General'
            };
            selectPatient(created);
            setIsPatientRegisterOpen(false);
        } finally {
            setRegisterLoading(false);
        }
    };

    
    const handlePrintOfficialReintegroForm = (record) => {
        printOfficialReintegroForm(record, uebBannerLogo);
    };


    const handleSaveReintegro = (e) => {
        e.preventDefault();
        const newRecord = {
            id: Date.now(),
            fecha: reintegroForm.fechaReintegro,
            fechaReintegro: reintegroForm.fechaReintegro,
            paciente: reintegroForm.pacienteNombre,
            cedula: reintegroForm.pacienteCedula,
            puesto: reintegroForm.puesto,
            cargo: reintegroForm.puesto,
            tipo: reintegroForm.tipoReintegro === 'total' ? 'Total' : 'Progresivo',
            dias: reintegroForm.diasIncapacidad || 0,
            causaSalida: reintegroForm.diagnosticoOrigen || 'REPOSO MÉDICO AUTORIZADO',
            diagnostico: reintegroForm.diagnosticoOrigen,
            motivo: `EVALUACIÓN MÉDICA OCUPACIONAL DE REINTEGRO EN EL PUESTO DE TRABAJO TRAS ${reintegroForm.diasIncapacidad || 0} DÍAS DE AUSENCIA.`,
            aptitud: reintegroForm.tipoReintegro === 'total' ? 'Apto' : 'Apto con Adaptación',
            aptitudDetalle: {
                apto: reintegroForm.tipoReintegro === 'total',
                observacion: reintegroForm.recomendaciones || 'Reincorporación a funciones habituales.',
                limitacion: reintegroForm.restricciones || 'Pausas activas y control ergonómico.',
                reubicacion: 'NINGUNA'
            },
            recomendaciones: reintegroForm.recomendaciones ? [
                reintegroForm.recomendaciones,
                'PAUSAS ACTIVAS CADA 2 HORAS EN LA JORNADA',
                'CONTROL MÉDICO PERIÓDICO'
            ] : [
                '1.- MEDIDAS GENERALES DE SALUD E HIGIENE OCUPACIONAL',
                '2.- ALIMENTACIÓN SALUDABLE Y PAUSAS ACTIVAS',
                '3.- CONTROL OCUPACIONAL REGULAR'
            ],
            profesional: {
                fecha: reintegroForm.fechaReintegro,
                hora: new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }),
                nombre: user?.nombre || 'DR. JORGE MORALES',
                codigo: user?.cedula || '1804486288'
            },
            estado: 'Aprobado'
        };
        setReintegrosData([newRecord, ...reintegrosData]);
        setIsReintegroModalOpen(false);

        if (patientSelected?.id) {
            api.post('/medicina-ocupacional/reintegro-ueb', {
                id_usuario_paciente: patientSelected.id,
                detalle_motivo_salida: reintegroForm.diagnosticoOrigen || 'Reposo médico ocupacional',
                fecha_salida: new Date(Date.now() - (reintegroForm.diasIncapacidad || 15) * 86400000).toISOString().split('T')[0],
                fecha_reintegro: reintegroForm.fechaReintegro
            }).catch(err => console.log('Reintegro saved locally'));
        }

        setReintegroForm({
            pacienteCedula: '',
            pacienteNombre: '',
            puesto: '',
            area: '',
            tipoReintegro: 'total',
            diasIncapacidad: '',
            diagnosticoOrigen: '',
            recomendaciones: '',
            fechaReintegro: localDateStr(),
            restricciones: ''
        });
    };

    // Pestaña Evolución: tratamientos del área (cada atención primaria inicia uno; el más reciente está en curso)
    const registrosEvolucion = areaHistories[activeBookArea] || [];
    const tratamientosEvolucion = activeBookArea === 'ocupacional'
        ? agruparTratamientos(registrosEvolucion).map((g, i) => ({ ...g, id: g.sinPrimaria ? 'sin-primaria' : `trat-${g.numero}`, enCurso: i === 0 && !g.sinPrimaria }))
        : [];
    const tratamientoDeRegistro = new Map();
    tratamientosEvolucion.forEach(t => t.registros.forEach(r => tratamientoDeRegistro.set(r, t)));
    const nivelRegistro = (r) => r.type === 'diario'
        ? { texto: r.tipo_atencion === 'secundaria' ? 'Subsecuente' : 'Primaria', primaria: r.tipo_atencion !== 'secundaria' }
        : { texto: r.type === 'signos' ? 'Signos' : 'Evolución', primaria: false };
    const detalleRegistro = (r) => r.detalle_evolucion || r.detalle_diagnostico
        || (r.type === 'signos' && r.presion_arterial_sistolica ? `PA ${Number(r.presion_arterial_sistolica)}/${Number(r.presion_arterial_diastolica)} mmHg` : 'Ver detalles');
    const tituloTratamiento = (t) => t.sinPrimaria ? 'Registros sin atención primaria' : `Tratamiento #${t.numero}`;

    const stepsList = [
        { label: 'Signos Vitales', icon: Activity },
        { label: 'Motivo y Enfermedad', icon: User },
        { label: 'Antecedentes & Riesgos', icon: Shield },
        { label: 'Examen & Diagnóstico', icon: Stethoscope },
        { label: 'Aptitud Laboral', icon: FileCheck },
        { label: 'Prescripción & Farmacia', icon: Pill },
        { label: 'Histograma de Signos', icon: BarChart3 }
    ];

    return (
        <div className="nurse-shell">
        <div className="app">
            <div className={`overlay ${isSidebarOpen ? 'show' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>

            {/* SIDEBAR NAVEGACIÓN */}
            <aside className={`sidebar ${isSidebarOpen ? 'show' : ''}`}>
                <div className="brand">
                    <div className="brand__logo" style={{ background: '#0284c7' }}>
                        <Stethoscope size={20} color="white" />
                    </div>
                    <div className="brand__text">
                        <strong>Bienestar</strong>
                        <span>Medicina Ocupacional</span>
                    </div>
                    <button aria-label="Cerrar menú" className="sidebar__close" onClick={() => setIsSidebarOpen(false)}>
                        <X size={18} />
                    </button>
                </div>

                <p className="sidebar__label">SALUD OCUPACIONAL</p>
                <nav className="navigation">
                    <button
                        className={`navigation__item ${activeTab === 'atencion' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('atencion'); setIsSidebarOpen(false); }}
                    >
                        <span className="navigation__indicator"></span>
                        <span className="navigation__icon"><Stethoscope size={18} /></span>
                        <span className="navigation__text">Atención Clínica</span>
                    </button>

                    <button
                        className={`navigation__item ${activeTab === 'examenes' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('examenes'); setIsSidebarOpen(false); }}
                    >
                        <span className="navigation__indicator"></span>
                        <span className="navigation__icon"><FlaskConical size={18} /></span>
                        <span className="navigation__text">Exámenes</span>
                    </button>

                    <button
                        className={`navigation__item ${activeTab === 'evolucion' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('evolucion'); setIsSidebarOpen(false); }}
                    >
                        <span className="navigation__indicator"></span>
                        <span className="navigation__icon"><TrendingUp size={18} /></span>
                        <span className="navigation__text">Evolución</span>
                    </button>

                    <button
                        className={`navigation__item ${activeTab === 'diario' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('diario'); setIsSidebarOpen(false); }}
                    >
                        <span className="navigation__indicator"></span>
                        <span className="navigation__icon"><ClipboardList size={18} /></span>
                        <span className="navigation__text">Parte Diario</span>
                    </button>

                    <button
                        className={`navigation__item ${activeTab === 'citas' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('citas'); setIsSidebarOpen(false); }}
                    >
                        <span className="navigation__indicator"></span>
                        <span className="navigation__icon"><Calendar size={18} /></span>
                        <span className="navigation__text">Gestión de Citas</span>
                    </button>

                    <button
                        className={`navigation__item ${activeTab === 'matrices' ? 'active' : ''}`}
                        onClick={() => {
                            if (!MATRICES[activeReportSubTab]) setActiveReportSubTab('catastroficas');
                            setActiveTab('matrices');
                            setIsSidebarOpen(false);
                        }}
                    >
                        <span className="navigation__indicator"></span>
                        <span className="navigation__icon"><FileSpreadsheet size={18} /></span>
                        <span className="navigation__text">Matrices y Fichas</span>
                    </button>

                    <button
                        className={`navigation__item ${activeTab === 'reportes' ? 'active' : ''}`}
                        onClick={() => {
                            if (activeReportSubTab.startsWith('ficha_')) setActiveReportSubTab('diario');
                            setActiveTab('reportes');
                            setIsSidebarOpen(false);
                        }}
                    >
                        <span className="navigation__indicator"></span>
                        <span className="navigation__icon"><BarChart3 size={18} /></span>
                        <span className="navigation__text">Reportes</span>
                    </button>
                </nav>

                <div className="sidebar__footer">
                    <button aria-label="Cerrar sesión" className="logout-button" onClick={handleLogoutClick}>
                        <span className="logout-button__icon"><LogOut size={16} /></span>
                        <span>Cerrar sesión</span>
                    </button>
                    <p className="system-version">Sistema BU · M. Ocupacional</p>
                </div>
            </aside>

            {/* CONTENIDO PRINCIPAL */}
            <main className="main-content">
                <header className="topbar">
                    <div className="topbar__left">
                        <button aria-label="Abrir menú" className="menu-button" onClick={() => setIsSidebarOpen(true)}>
                            <Menu size={20} />
                        </button>
                        <div>
                            <p className="breadcrumb">Medicina Ocupacional / <span>{activeTab === 'matrices' ? 'MATRICES Y FICHAS' : activeTab.toUpperCase()}</span></p>
                            <h1>
                                {activeTab === 'atencion' ? 'Atención Médica Ocupacional (Consulta en Vivo)' :
                                    activeTab === 'examenes' ? 'Órdenes de Exámenes Médicos & Diagnóstico' :
                                        activeTab === 'evolucion' ? 'Seguimiento a Pacientes' :
                                            activeTab === 'diario' ? 'Parte Diario de Medicina Ocupacional' :
                                                activeTab === 'citas' ? 'Gestión de Citas & Agenda Médica Ocupacional' :
                                                    activeTab === 'matrices' ? 'Matrices Estadísticas & Fichas Ocupacionales' : 'Centro de Reportes & Estadísticas Ocupacionales'}
                            </h1>
                        </div>
                    </div>
                    <div className="topbar__right">
                        <NotificationMenu onNavigateToCitas={(fecha) => { if (fecha) setCitasDate(fecha); setActiveTab('citas'); }} />
                        <UserProfileMenu />
                    </div>
                </header>

                <div className="content">

                    {/* PESTAÑA 1: ATENCIÓN CLÍNICA OCUPACIONAL */}
                    {activeTab === 'atencion' && (
                        <div>
                            {/* HERO BANNER DE BIENVENIDA */}
                            <section className="page-hero vitals-choice-hero">
                                <div>
                                    <span className="page-hero__label">
                                        <Stethoscope size={14} style={{ marginRight: '6px', display: 'inline' }} /> Salud Ocupacional
                                    </span>
                                    <h2>Bienvenido(a), Dr(a). {user?.name || 'Médica/o Ocupacional'}</h2>
                                    <p>Gestión Integral de Salud Ocupacional, Evaluaciones Aptitudinales y Reintegros Laborales.</p>
                                </div>
                                <div className="page-hero__icon"><Stethoscope size={34} /></div>
                            </section>

                            {/* 3 TARJETAS DE ACCIÓN DIRECTA (KPIs REMOVIDOS) */}
                            <section className="vitals-action-grid">
                                <button
                                    className="vitals-action-card vitals-action-card--primary"
                                    onClick={() => openPatientSearch('consulta')}
                                >
                                    <span className="vitals-action-card__glow"></span>
                                    <span className="vitals-action-card__icon"><Search size={24} /></span>
                                    <span className="vitals-action-card__content">
                                        <small>Atención General</small>
                                        <strong>Atender Paciente</strong>
                                    </span>
                                    <span className="vitals-action-card__arrow"><ChevronRight size={20} /></span>
                                </button>

                                <button
                                    className="vitals-action-card vitals-action-card--secondary"
                                    onClick={() => {
                                        setNewPatientForm({ nombre_completo: '', tipo_documento: 'cedula', cedula: '', pais_origen: '', id_tipo_usuario: 4, correo: '' });
                                        setRegisterError('');
                                        setIsPatientRegisterOpen(true);
                                    }}
                                >
                                    <span className="vitals-action-card__glow"></span>
                                    <span className="vitals-action-card__icon"><UserPlus size={24} /></span>
                                    <span className="vitals-action-card__content">
                                        <small>Crear Nuevo Paciente</small>
                                        <strong>Registrar Paciente</strong>
                                    </span>
                                    <span className="vitals-action-card__arrow"><ChevronRight size={20} /></span>
                                </button>

                                <button
                                    className="vitals-action-card vitals-action-card--secondary"
                                    onClick={() => setIsHistogramModalOpen(true)}
                                >
                                    <span className="vitals-action-card__glow" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)' }}></span>
                                    <span className="vitals-action-card__icon" style={{ backgroundColor: '#eff6ff', color: '#316ccc' }}><BarChart3 size={24} /></span>
                                    <span className="vitals-action-card__content">
                                        <small>Análisis Clínico</small>
                                        <strong>Histograma de Signos</strong>
                                    </span>
                                    <span className="vitals-action-card__arrow"><ChevronRight size={20} /></span>
                                </button>
                            </section>




                        </div>
                    )}





                    {/* PESTAÑA 4: EXÁMENES OCUPACIONALES & DIAGNÓSTICO */}
                    {activeTab === 'examenes' && (
                        <div>
                            {/* HERO BANNER DE EXÁMENES */}
                            <section className="page-hero vitals-choice-hero" style={{ marginBottom: '24px' }}>
                                <div>
                                    <span className="page-hero__label" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                        <ClipboardList size={16} /> Salud Ocupacional & Diagnóstico
                                    </span>
                                    <h2>Órdenes de Exámenes Médicos & Laboratorio</h2>
                                    <p>Emisión de solicitudes de examen ocupacional, trazabilidad con laboratorios y carga de informes diagnósticos.</p>
                                </div>
                                <div className="page-hero__icon"><ClipboardList size={34} /></div>
                            </section>

                            {/* TARJETA DE ACCIÓN DIRECTA CON TAMAÑO ACOTADO */}
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <button
                                    className="vitals-action-card vitals-action-card--primary"
                                    onClick={() => openPatientSearch('exam')}
                                    style={{ maxWidth: '380px', width: '100%' }}
                                >
                                    <span className="vitals-action-card__glow"></span>
                                    <span className="vitals-action-card__icon"><Plus size={24} /></span>
                                    <span className="vitals-action-card__content">
                                        <small>Emisión de Orden</small>
                                        <strong>Nueva Orden de Examen</strong>
                                    </span>
                                    <span className="vitals-action-card__arrow"><ChevronRight size={20} /></span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* PESTAÑA 5: SEGUIMIENTO & EVOLUCIÓN CLÍNICA */}
                    {activeTab === 'evolucion' && (
                        <div>
                            <section className="page-hero" style={{ marginBottom: '20px' }}>
                                <div>
                                    <span className="page-hero__label"><TrendingUp size={14} style={{ marginRight: '6px', display: 'inline' }} /> Seguimiento Clínico</span>
                                    <h2>Evolución y Seguimiento de Pacientes</h2>
                                    <p>Consulte el expediente clínico, historial de atenciones ocupacionales y el seguimiento continuo de cada trabajador atendido.</p>
                                </div>
                                <div className="page-hero__icon"><TrendingUp size={34} /></div>
                            </section>

                            <section className="nurse-card patient-selector-card" style={{ marginBottom: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <div className="nurse-card__icon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}><User size={20} /></div>
                                        <div>
                                            <h3 style={{ margin: 0 }}>Paciente de Seguimiento</h3>
                                            <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '12px' }}>
                                                {patientSelected ? (
                                                    <strong>{`${patientSelected.nombres || patientSelected.nombre_completo || ''} ${patientSelected.apellidos || ''}`.trim()} (Cédula: {patientSelected.cedula || patientSelected.numero_cedula})</strong>
                                                ) : (
                                                    "Ninguno - Debe buscar un paciente para consultar su evolución clínica."
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <button className="action-button action-button--accent" onClick={() => openPatientSearch('evolucion')}>
                                        <Search size={14} /> Buscar Paciente
                                    </button>
                                </div>
                            </section>

                            {!patientSelected ? (
                                <div className="patient-empty-state show">
                                    <User size={40} />
                                    <strong>No hay paciente seleccionado</strong>
                                    <p>Busca e introduce un paciente para consultar su evolución clínica.</p>
                                </div>
                            ) : (
                                <div style={{ padding: '10px 0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
                                        <div>
                                            <h3 style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '18px', margin: 0 }}>
                                                {esCoordinador ? 'Historial Clínico del Paciente' : 'Historial Clínico de Medicina Ocupacional'}
                                            </h3>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: '4px 0 0' }}>
                                                {esCoordinador
                                                    ? 'Consulte la evolución y atenciones del paciente agrupadas por área clínica.'
                                                    : 'Cada atención primaria inicia un tratamiento; las atenciones subsecuentes se registran en el tratamiento en curso.'}
                                            </p>
                                        </div>
                                        {esCoordinador && (
                                            <div className="liquid-nav" style={{ margin: 0 }}>
                                                {[
                                                    { key: 'medicina', label: 'Medicina General', icon: <Stethoscope size={15} /> },
                                                    { key: 'psicologia', label: 'Psicología Clínica', icon: <Brain size={15} /> },
                                                    { key: 'odontologia', label: 'Odontología', icon: <Shield size={15} /> },
                                                    { key: 'enfermeria', label: 'Enfermería', icon: <HeartPulse size={15} /> }
                                                ].map(area => (
                                                    <button
                                                        key={area.key}
                                                        className={`liquid-nav__item ${activeBookArea === area.key ? 'active' : ''}`}
                                                        onClick={() => { setActiveBookArea(area.key); setActiveBookRecord(null); }}
                                                    >
                                                        {area.icon}
                                                        <span>{area.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Lista y detalle */}
                                    <div
                                        className="historial-grid-container"
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: activeBookRecord ? 'minmax(0, 1.35fr) minmax(320px, 0.95fr)' : '1fr',
                                            gap: '20px',
                                            alignItems: 'start',
                                            width: '100%'
                                        }}
                                    >
                                        <div style={{ minWidth: 0, width: '100%' }}>
                                            {areaHistoriesLoading ? (
                                                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Cargando registros...</div>
                                            ) : registrosEvolucion.length === 0 ? (
                                                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontStyle: 'italic', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                                    No se registran antecedentes en el área seleccionada.
                                                </div>
                                            ) : (
                                                <div>
                                                    {/* Conteo y modo de vista */}
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                                                            {activeBookArea === 'ocupacional' && `${tratamientosEvolucion.filter(t => !t.sinPrimaria).length} ${tratamientosEvolucion.filter(t => !t.sinPrimaria).length === 1 ? 'tratamiento registrado' : 'tratamientos registrados'} · `}
                                                            {registrosEvolucion.length} {registrosEvolucion.length === 1 ? 'registro' : 'registros en total'}
                                                        </div>
                                                        {activeBookArea === 'ocupacional' && (
                                                            <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px', gap: '4px' }}>
                                                                {[['tratamientos', 'Agrupado por Tratamiento'], ['todas', 'Todos los Registros']].map(([modo, texto]) => (
                                                                    <button
                                                                        key={modo}
                                                                        type="button"
                                                                        aria-pressed={evolutionViewMode === modo}
                                                                        style={{
                                                                            padding: '4px 12px', fontSize: '11px', fontWeight: 600, border: 'none', borderRadius: '6px', cursor: 'pointer',
                                                                            background: evolutionViewMode === modo ? '#ffffff' : 'transparent',
                                                                            color: evolutionViewMode === modo ? 'var(--primary)' : 'var(--text-muted)',
                                                                            boxShadow: evolutionViewMode === modo ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                                                                        }}
                                                                        onClick={() => setEvolutionViewMode(modo)}
                                                                    >
                                                                        {texto}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {activeBookArea === 'ocupacional' && evolutionViewMode === 'tratamientos' ? (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                                            {tratamientosEvolucion.map(treatment => {
                                                                const isExpanded = expandedTreatments[treatment.id] ?? (treatment.enCurso || tratamientosEvolucion.length === 1);
                                                                const toggle = () => setExpandedTreatments(prev => ({ ...prev, [treatment.id]: !isExpanded }));
                                                                return (
                                                                    <div
                                                                        key={treatment.id}
                                                                        style={{
                                                                            background: '#ffffff',
                                                                            border: treatment.enCurso ? '1.5px solid rgba(0, 32, 64, 0.22)' : '1px solid #e2e8f0',
                                                                            borderRadius: '12px',
                                                                            overflow: 'hidden',
                                                                            boxShadow: treatment.enCurso ? '0 4px 12px rgba(0, 32, 64, 0.06)' : '0 1px 4px rgba(0,0,0,0.03)',
                                                                            transition: 'all 0.2s ease'
                                                                        }}
                                                                    >
                                                                        <div
                                                                            role="button" tabIndex={0} onKeyDown={onKeyActivate} aria-expanded={isExpanded}
                                                                            style={{
                                                                                padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer',
                                                                                background: isExpanded ? 'rgba(0, 32, 64, 0.02)' : '#ffffff',
                                                                                borderBottom: isExpanded ? '1px solid #edf2f7' : 'none',
                                                                                gap: '12px', flexWrap: 'wrap'
                                                                            }}
                                                                            onClick={toggle}
                                                                        >
                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 240px', minWidth: 0 }}>
                                                                                <div style={{
                                                                                    width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                                                                                    background: treatment.enCurso ? 'var(--primary-soft)' : '#f1f5f9',
                                                                                    color: treatment.enCurso ? 'var(--primary)' : '#475569',
                                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                                                }}>
                                                                                    <Briefcase size={19} />
                                                                                </div>
                                                                                <div style={{ minWidth: 0 }}>
                                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                                                        <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.4px' }}>
                                                                                            {tituloTratamiento(treatment)}
                                                                                        </span>
                                                                                        {!treatment.sinPrimaria && (treatment.enCurso ? (
                                                                                            <span style={{ fontSize: '11px', fontWeight: 700, background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                                                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }}></span> En Curso
                                                                                            </span>
                                                                                        ) : (
                                                                                            <span style={{ fontSize: '11px', fontWeight: 600, background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '10px' }}>
                                                                                                ✓ Cerrado
                                                                                            </span>
                                                                                        ))}
                                                                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                                                            · {treatment.registros.length} {treatment.registros.length === 1 ? 'registro' : 'registros'}
                                                                                        </span>
                                                                                    </div>
                                                                                    <h4 style={{ margin: '3px 0 0', fontSize: '13px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                                        {treatment.sinPrimaria ? 'Atenciones previas a la primera consulta primaria' : detalleRegistro(treatment.registros[treatment.registros.length - 1])}
                                                                                    </h4>
                                                                                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
                                                                                        Inicio: <strong>{formatFecha(treatment.inicio)}</strong>
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                            <button
                                                                                type="button"
                                                                                className="action-button action-button--light"
                                                                                style={{ fontSize: '11px', padding: '4px 10px', minHeight: '28px', borderRadius: '7px', display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}
                                                                                onClick={(e) => { e.stopPropagation(); toggle(); }}
                                                                            >
                                                                                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                                                <span>{isExpanded ? 'Ocultar Registros' : `Desplegar Registros (${treatment.registros.length})`}</span>
                                                                            </button>
                                                                        </div>

                                                                        {isExpanded && (
                                                                            <div style={{ padding: '8px', background: '#fafbfc' }}>
                                                                                <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
                                                                                    <table style={{ width: '100%', minWidth: '440px', tableLayout: 'fixed', borderCollapse: 'collapse', textAlign: 'left', margin: 0 }}>
                                                                                        <colgroup>
                                                                                            <col style={{ width: '58px' }} />
                                                                                            <col style={{ width: '92px' }} />
                                                                                            <col style={{ width: '96px' }} />
                                                                                            <col style={{ width: 'auto' }} />
                                                                                            <col style={{ width: '92px' }} />
                                                                                        </colgroup>
                                                                                        <thead>
                                                                                            <tr style={{ background: '#fafcff', borderBottom: '1px solid #e2e8f0' }}>
                                                                                                <th style={{ padding: '8px 10px', fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>N°</th>
                                                                                                <th style={{ padding: '8px 10px', fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>Fecha</th>
                                                                                                <th style={{ padding: '8px 10px', fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>Nivel</th>
                                                                                                <th style={{ padding: '8px 10px', fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>Detalle Clínico</th>
                                                                                                <th style={{ padding: '8px 10px', fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', textAlign: 'center' }}>Acción</th>
                                                                                            </tr>
                                                                                        </thead>
                                                                                        <tbody>
                                                                                            {treatment.registros.map((record, rIdx) => {
                                                                                                const nivel = nivelRegistro(record);
                                                                                                return (
                                                                                                    <tr
                                                                                                        tabIndex={0} onKeyDown={onKeyActivate}
                                                                                                        key={`${record.type}-${record.id || rIdx}`}
                                                                                                        style={{ borderBottom: rIdx === treatment.registros.length - 1 ? 'none' : '1px solid #f1f5f9', background: activeBookRecord === record ? 'rgba(0, 32, 64, 0.05)' : 'transparent', cursor: 'pointer', transition: 'background 0.15s ease' }}
                                                                                                        onClick={() => setActiveBookRecord(record)}
                                                                                                    >
                                                                                                        <td style={{ padding: '8px 10px', fontWeight: 700, color: 'var(--primary)', fontSize: '11px' }}>#{treatment.registros.length - rIdx}</td>
                                                                                                        <td style={{ padding: '8px 10px', fontSize: '11px', color: '#334155', whiteSpace: 'nowrap' }}>{formatFecha(record.fecha || record.created_at)}</td>
                                                                                                        <td style={{ padding: '8px 10px' }}>
                                                                                                            <span style={{
                                                                                                                background: nivel.primaria ? 'var(--primary-soft)' : 'var(--accent-soft)',
                                                                                                                color: nivel.primaria ? 'var(--primary)' : 'var(--accent)',
                                                                                                                padding: '2px 7px', borderRadius: '5px', fontSize: '11px', fontWeight: 700, display: 'inline-block', whiteSpace: 'nowrap'
                                                                                                            }}>
                                                                                                                {nivel.texto}
                                                                                                            </span>
                                                                                                        </td>
                                                                                                        <td style={{ padding: '8px 10px', fontSize: '11px', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={detalleRegistro(record)}>
                                                                                                            {detalleRegistro(record)}
                                                                                                        </td>
                                                                                                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                                                                                            <button
                                                                                                                type="button"
                                                                                                                className="action-button action-button--primary"
                                                                                                                style={{ fontSize: '11px', minHeight: '26px', padding: '0 8px', borderRadius: '6px', whiteSpace: 'nowrap', width: '100%', maxWidth: '82px' }}
                                                                                                                onClick={(e) => { e.stopPropagation(); setActiveBookRecord(record); }}
                                                                                                            >
                                                                                                                Ver Detalle
                                                                                                            </button>
                                                                                                        </td>
                                                                                                    </tr>
                                                                                                );
                                                                                            })}
                                                                                        </tbody>
                                                                                    </table>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        /* Vista de todos los registros */
                                                        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflowX: 'auto', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
                                                            <table style={{ width: '100%', minWidth: '480px', tableLayout: 'fixed', borderCollapse: 'collapse', textAlign: 'left', margin: 0 }}>
                                                                <colgroup>
                                                                    <col style={{ width: '92px' }} />
                                                                    <col style={{ width: '118px' }} />
                                                                    <col style={{ width: '96px' }} />
                                                                    <col style={{ width: 'auto' }} />
                                                                    <col style={{ width: '92px' }} />
                                                                </colgroup>
                                                                <thead>
                                                                    <tr style={{ background: '#fafcff', borderBottom: '1px solid #e2e8f0' }}>
                                                                        <th style={{ padding: '8px 10px', fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>Fecha</th>
                                                                        <th style={{ padding: '8px 10px', fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>{activeBookArea === 'ocupacional' ? 'Tratamiento' : 'Registro'}</th>
                                                                        <th style={{ padding: '8px 10px', fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>Nivel</th>
                                                                        <th style={{ padding: '8px 10px', fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>Detalle / Diagnóstico</th>
                                                                        <th style={{ padding: '8px 10px', fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', textAlign: 'center' }}>Acción</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {registrosEvolucion.map((record, index) => {
                                                                        const nivel = nivelRegistro(record);
                                                                        const trat = tratamientoDeRegistro.get(record);
                                                                        return (
                                                                            <tr
                                                                                tabIndex={0} onKeyDown={onKeyActivate}
                                                                                key={`${record.type}-${record.id || index}`}
                                                                                style={{ borderBottom: index === registrosEvolucion.length - 1 ? 'none' : '1px solid #f1f5f9', background: activeBookRecord === record ? 'rgba(0, 32, 64, 0.05)' : 'transparent', cursor: 'pointer' }}
                                                                                onClick={() => setActiveBookRecord(record)}
                                                                            >
                                                                                <td style={{ padding: '9px 10px', fontSize: '11px', color: '#334155', whiteSpace: 'nowrap' }}>{formatFecha(record.fecha || record.created_at)}</td>
                                                                                <td style={{ padding: '9px 10px' }}>
                                                                                    {activeBookArea !== 'ocupacional' ? (
                                                                                        <span className={`evolution-badge evolution-badge--${activeBookArea}`}>{record.recordTitle || record.type}</span>
                                                                                    ) : trat && !trat.sinPrimaria ? (
                                                                                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', background: '#f1f5f9', padding: '2px 6px', borderRadius: '5px' }}>Tratamiento #{trat.numero}</span>
                                                                                    ) : (
                                                                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>-</span>
                                                                                    )}
                                                                                </td>
                                                                                <td style={{ padding: '9px 10px' }}>
                                                                                    <span style={{
                                                                                        background: nivel.primaria ? 'var(--primary-soft)' : 'var(--accent-soft)',
                                                                                        color: nivel.primaria ? 'var(--primary)' : 'var(--accent)',
                                                                                        padding: '2px 7px', borderRadius: '5px', fontSize: '11px', fontWeight: 700, display: 'inline-block', whiteSpace: 'nowrap'
                                                                                    }}>
                                                                                        {nivel.texto}
                                                                                    </span>
                                                                                </td>
                                                                                <td style={{ padding: '9px 10px', fontSize: '11px', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={detalleRegistro(record)}>
                                                                                    {detalleRegistro(record)}
                                                                                </td>
                                                                                <td style={{ padding: '9px 10px', textAlign: 'center' }}>
                                                                                    <button
                                                                                        type="button"
                                                                                        className="action-button action-button--primary"
                                                                                        style={{ fontSize: '11px', minHeight: '26px', padding: '0 8px', borderRadius: '6px', whiteSpace: 'nowrap', width: '100%', maxWidth: '82px' }}
                                                                                        onClick={(e) => { e.stopPropagation(); setActiveBookRecord(record); }}
                                                                                    >
                                                                                        Ver Detalle
                                                                                    </button>
                                                                                </td>
                                                                            </tr>
                                                                        );
                                                                    })}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Detail Column */}
                                        {activeBookRecord && (
                                            <div style={{ background: '#ffffff', borderRadius: '14px', border: '1.5px solid rgba(0, 32, 64, 0.12)', boxShadow: '0 6px 20px rgba(0, 32, 64, 0.07)', padding: '20px', position: 'sticky', top: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #edf2f7', paddingBottom: '12px', gap: '10px' }}>
                                                    <div style={{ minWidth: 0 }}>
                                                        <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 800, letterSpacing: '0.5px', display: 'block' }}>
                                                            Detalle Clínico de Consulta
                                                        </span>
                                                        <h4 style={{ margin: '3px 0 0', fontSize: '14.5px', color: 'var(--primary)', fontWeight: 800 }}>
                                                            {activeBookRecord.recordTitle || 'Ficha de Atención'}
                                                        </h4>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                                Fecha: <strong>{formatFecha(activeBookRecord.fecha || activeBookRecord.created_at)}</strong>
                                                            </span>
                                                            {tratamientoDeRegistro.get(activeBookRecord) && !tratamientoDeRegistro.get(activeBookRecord).sinPrimaria && (
                                                                <span style={{
                                                                    fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px',
                                                                    background: tratamientoDeRegistro.get(activeBookRecord).enCurso ? '#dcfce7' : '#f1f5f9',
                                                                    color: tratamientoDeRegistro.get(activeBookRecord).enCurso ? '#15803d' : '#475569'
                                                                }}>
                                                                    Tratamiento #{tratamientoDeRegistro.get(activeBookRecord).numero} ({tratamientoDeRegistro.get(activeBookRecord).enCurso ? 'En Curso' : 'Cerrado'})
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <button aria-label="Cerrar detalle"
                                                        className="action-button action-button--light"
                                                        style={{ minHeight: '32px', width: '32px', padding: 0, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        onClick={() => setActiveBookRecord(null)}
                                                    >
                                                        <X size={15} />
                                                    </button>
                                                </div>

                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '500px', overflowY: 'auto', paddingRight: '4px' }}>
                                                    {(activeBookRecord.type === 'diario') && (
                                                        <>
                                                            <div className="preview-paper-field">
                                                                <span>Tipo de Atención</span>
                                                                <strong style={{ textTransform: 'capitalize' }}>
                                                                    {activeBookRecord.tipo_atencion === 'secundaria' ? 'Subsecuente' : (activeBookRecord.tipo_atencion || 'Primaria')} ({activeBookRecord.tipo || 'Preventivo'})
                                                                </strong>
                                                            </div>
                                                            <div className="preview-paper-field">
                                                                <span>Diagnóstico</span>
                                                                <p style={{ fontWeight: '600', margin: 0 }}>{activeBookRecord.detalle_diagnostico || 'Sin diagnóstico registrado.'}</p>
                                                            </div>
                                                        </>
                                                    )}
                                                    {activeBookRecord.type === 'evolucion' && (
                                                        <>
                                                            <div className="preview-paper-field">
                                                                <span>Nota de Evolución</span>
                                                                <p style={{ fontStyle: 'italic', background: '#fff9e6', padding: '12px', borderRadius: '8px', border: '1px solid #ffe89e', lineHeight: '1.5', margin: 0 }}>
                                                                    {activeBookRecord.detalle_evolucion}
                                                                </p>
                                                            </div>
                                                            <div className="preview-paper-field">
                                                                <span>Prescripción y Plan Farmacéutico</span>
                                                                <p style={{ background: '#f0fdf4', padding: '12px', borderRadius: '8px', border: '1px solid #bbf7d0', color: '#166534', margin: 0 }}>
                                                                    {activeBookRecord.prescripcion_medica || 'Sin prescripción indicada.'}
                                                                </p>
                                                            </div>
                                                        </>
                                                    )}
                                                    {activeBookRecord.type === 'signos' && (
                                                        <div className="preview-vitals-grid">
                                                            <div><span>Presión Arterial</span><strong>{activeBookRecord.presion_arterial_sistolica ? Number(activeBookRecord.presion_arterial_sistolica) : '—'}/{activeBookRecord.presion_arterial_diastolica ? Number(activeBookRecord.presion_arterial_diastolica) : '—'}</strong><small>mmHg</small></div>
                                                            <div><span>Frec. Cardíaca</span><strong>{activeBookRecord.frecuencia_cardiaca || '—'}</strong><small>lpm</small></div>
                                                            <div><span>Frec. Respiratoria</span><strong>{activeBookRecord.frecuencia_respiratoria || '—'}</strong><small>rpm</small></div>
                                                            <div><span>Temperatura</span><strong>{activeBookRecord.temperatura ? Number(activeBookRecord.temperatura) : '—'}</strong><small>°C</small></div>
                                                            <div><span>Talla</span><strong>{activeBookRecord.talla ? Number(activeBookRecord.talla) : '—'}</strong><small>cm</small></div>
                                                            <div><span>Peso</span><strong>{activeBookRecord.peso ? Number(activeBookRecord.peso) : '—'}</strong><small>kg</small></div>
                                                        </div>
                                                    )}
                                                    {!['diario', 'evolucion', 'signos'].includes(activeBookRecord.type) && (
                                                        <div className="preview-paper-field">
                                                            <span>Detalle</span>
                                                            <p style={{ margin: 0 }}>{activeBookRecord.detalle_evolucion || 'Sin observaciones registradas.'}</p>
                                                        </div>
                                                    )}
                                                    {activeBookRecord.medico && (
                                                        <div className="preview-paper-field">
                                                            <span>Registrado por</span>
                                                            <strong>{activeBookRecord.medico}</strong>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* PESTAÑA PARTE DIARIO */}
                    {activeTab === 'diario' && (
                        <div>
                            <section className="page-hero">
                                <div>
                                    <span className="page-hero__label"><ClipboardList size={14} style={{ marginRight: '6px', display: 'inline' }} /> Consulta de Jornada</span>
                                    <h2>Parte Diario de Medicina Ocupacional</h2>
                                    <p>Visualice las atenciones del consultorio clínico ocupacional en la fecha seleccionada.</p>
                                </div>
                                <div className="page-hero__icon"><CalendarCheck size={34} /></div>
                            </section>

                            <section className="module-grid" style={{ marginTop: '20px' }}>
                                <article className="nurse-card span-12 daily-header-card">
                                    <div className="daily-date-control" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                        <div>
                                            <span className="eyebrow">CONSULTAS DIARIAS</span>
                                            <h3>Atenciones del día</h3>
                                            <p>Selecciona una fecha para consultar los registros.</p>
                                        </div>
                                        <div className="date-navigation" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <CalendarDays size={16} color="var(--accent)" />
                                                <input
                                                    aria-label="Fecha del parte diario"
                                                    type="date"
                                                    value={parteDiarioDate}
                                                    onChange={(e) => setParteDiarioDate(e.target.value)}
                                                    style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px', fontSize: '11px', outline: 0 }}
                                                />
                                            </label>
                                            <button
                                                onClick={handleVerReporteParteDiario}
                                                className="action-button action-button--accent"
                                                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                            >
                                                <FileText size={14} /> Ver Reporte
                                            </button>
                                        </div>
                                    </div>

                                    <section className="psycho-kpis" style={{ marginTop: '20px' }}>
                                        <div className="psycho-kpi-card">
                                            <div className="psycho-kpi-card__icon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}><UserCheck size={20} /></div>
                                            <div className="psycho-kpi-card__info">
                                                <span>Atendidos Hoy</span>
                                                <strong>{getParteKPIs().total}</strong>
                                            </div>
                                        </div>
                                        <div className="psycho-kpi-card">
                                            <div className="psycho-kpi-card__icon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}><HeartHandshake size={20} /></div>
                                            <div className="psycho-kpi-card__info">
                                                <span>Primaria</span>
                                                <strong>{getParteKPIs().primarias}</strong>
                                            </div>
                                        </div>
                                        <div className="psycho-kpi-card">
                                            <div className="psycho-kpi-card__icon" style={{ background: '#e9f8f2', color: 'var(--success)' }}><TrendingUp size={20} /></div>
                                            <div className="psycho-kpi-card__info">
                                                <span>Secundaria</span>
                                                <strong>{getParteKPIs().secundarias}</strong>
                                            </div>
                                        </div>
                                        <div className="psycho-kpi-card">
                                            <div className="psycho-kpi-card__icon" style={{ background: '#fef3c7', color: '#a55a05' }}><FileCheck size={20} /></div>
                                            <div className="psycho-kpi-card__info">
                                                <span>Certificados</span>
                                                <strong>{getParteKPIs().certificados}</strong>
                                            </div>
                                        </div>
                                    </section>
                                </article>

                                <article className="nurse-card span-12" style={{ marginTop: '20px' }}>
                                    {parteDiarioLoading ? (
                                        <div style={{ textAlign: 'center', padding: '30px' }}>Cargando consultas diarias...</div>
                                    ) : parteDiarioList.length === 0 ? (
                                        <div className="table-empty">
                                            <CalendarCheck size={35} />
                                            <strong>Sin consultas registradas</strong>
                                            <span>No se registran atenciones para la fecha {parteDiarioDate}.</span>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', marginBottom: '10px', border: '1px dashed var(--border)', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
                                                <strong style={{ color: 'var(--text-secondary)', marginRight: '4px' }}>Leyenda:</strong>
                                                {Object.values(TIPOS_ATENCION_DIARIO).map(t => (
                                                    <div key={t.texto} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: t.bg, color: t.color }}>
                                                            <t.Icon size={12} />
                                                        </span>
                                                        <span>{t.texto}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {parteDiarioList.map((item, idx) => {
                                                const patientIdent = item.paciente?.datos_identificacion || item.paciente?.datosIdentificacion || item.paciente?.identification;
                                                const patientName = patientIdent
                                                    ? `${patientIdent.primer_nombre || ''} ${patientIdent.segundo_nombre || ''} ${patientIdent.apellido_paterno || patientIdent.primer_apellido || ''} ${patientIdent.apellido_materno || ''}`.replace(/\s+/g, ' ').trim()
                                                    : item.paciente?.nombre_completo || item.paciente?.name || 'Paciente registrado';
                                                const tipo = TIPOS_ATENCION_DIARIO[item.tipo_atencion];
                                                const Icono = tipo?.Icon || ClipboardList;
                                                const curativoPreventivo = item.tipo_atencion2 || item.tipo;
                                                return (
                                                    <div key={idx} className="list-card" style={{ background: '#fafbfd' }}>
                                                        <div className="list-card__icon" style={{ background: tipo?.bg || 'var(--primary-soft)', color: tipo?.color || 'var(--primary)' }}>
                                                            <Icono size={16} />
                                                        </div>
                                                        <div className="list-card__content">
                                                            <strong>{patientName}</strong>
                                                            <p>Atención: {(item.tipo_atencion || 'general').toUpperCase()} · Diagnóstico: {item.detalle_diagnostico || 'Evaluación general'}</p>
                                                        </div>
                                                        {curativoPreventivo && (
                                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                                                                {String(curativoPreventivo).toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </article>
                            </section>
                        </div>
                    )}

                    {/* PESTAÑA 7: GESTIÓN DE CITAS */}
                    {activeTab === 'citas' && (
                        <div className="citas-manager" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div className="card" style={{ borderRadius: '14px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', boxShadow: 'var(--shadow-sm)' }}>
                                <div>
                                    <span className="eyebrow">CONTROL DE CITAS</span>
                                    <h3 style={{ fontSize: '15px', fontWeight: '750', margin: '4px 0 0', color: 'var(--primary)' }}>Agenda de Consultas</h3>
                                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Gestione las citas programadas de los estudiantes y el personal.</p>
                                </div>
                                <div className="date-navigation" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <CalendarDays size={16} color="var(--accent)" />
                                        <input
                                            aria-label="Fecha de las citas"
                                            type="date"
                                            value={citasDate}
                                            onChange={(e) => setCitasDate(e.target.value)}
                                            style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px', fontSize: '11px', outline: 0 }}
                                        />
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleVerReporteCitas}
                                        className="action-button action-button--accent"
                                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                        title="Ver reporte de citas agendadas, completadas y canceladas"
                                    >
                                        <Printer size={14} /> Ver Reporte de Citas
                                    </button>
                                </div>
                            </div>

                            {citasList.length === 0 ? (
                                <div className="card table-empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <Calendar size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
                                    <strong style={{ fontSize: '14px', color: 'var(--text)' }}>No hay citas agendadas</strong>
                                    <span style={{ fontSize: '11px', maxWidth: '280px', marginTop: '4px' }}>No se encontraron citas médicas programadas para la fecha seleccionada.</span>
                                </div>
                            ) : (
                                <div className="card" style={{ padding: 0, borderRadius: '14px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', background: 'white' }}>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table className="medical-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                            <thead>
                                                <tr style={{ background: 'var(--surface-hover)', borderBottom: '1px solid var(--border)' }}>
                                                    <th style={{ padding: '14px 16px', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>N°</th>
                                                    <th style={{ padding: '14px 16px', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>Paciente / Cédula</th>
                                                    <th style={{ padding: '14px 16px', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>Horario</th>
                                                    <th style={{ padding: '14px 16px', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>Motivo</th>
                                                    <th style={{ padding: '14px 16px', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>Estado</th>
                                                    <th style={{ padding: '14px 16px', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textAlign: 'right' }}>Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {citasList.slice((citasPage - 1) * CITAS_PER_PAGE, citasPage * CITAS_PER_PAGE).map((cita, idx) => {
                                                    const rowNumber = (citasPage - 1) * CITAS_PER_PAGE + idx + 1;
                                                    const patientName = cita.paciente?.name || cita.pacienteNombre || 'Paciente';
                                                    const cedula = cita.paciente?.cedula || cita.cedula || 'N/D';

                                                    const statusColors = {
                                                        programada: { bg: '#eff6ff', text: '#1e40af', border: '#dbeafe' },
                                                        confirmada: { bg: '#ecfdf5', text: '#065f46', border: '#d1fae5' },
                                                        completada: { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' },
                                                        cancelada: { bg: '#fef2f2', text: '#991b1b', border: '#fee2e2' },
                                                        no_asistio: { bg: '#fff7ed', text: '#9a3412', border: '#fed7aa' }
                                                    }[cita.estado] || { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' };

                                                    return (
                                                        <tr key={cita.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                            <td style={{ padding: '14px 16px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>
                                                                {rowNumber}
                                                            </td>
                                                            <td style={{ padding: '14px 16px' }}>
                                                                <div style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--text)' }}>{patientName}</div>
                                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Cédula: {cedula}</div>
                                                            </td>
                                                            <td style={{ padding: '14px 16px' }}>
                                                                <div style={{ fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text)' }}>
                                                                    <Clock size={13} style={{ color: 'var(--accent)' }} />
                                                                    {cita.hora_inicio} - {cita.hora_fin}
                                                                </div>
                                                            </td>
                                                            <td style={{ padding: '14px 16px', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                                                                {cita.motivo || cita.tipo_evaluacion || 'Atención en Salud Ocupacional'}
                                                                <div style={{ fontSize: '11px', color: '#b45309', marginTop: '2px' }}>
                                                                    <strong>Mis Notas:</strong> {cita.notas_doctor || 'Atención registrada directamente por el profesional médico'}
                                                                </div>
                                                            </td>
                                                            <td style={{ padding: '14px 16px' }}>
                                                                <span style={{
                                                                    fontSize: '11px',
                                                                    fontWeight: '700',
                                                                    textTransform: 'uppercase',
                                                                    color: statusColors.text,
                                                                    background: statusColors.bg,
                                                                    padding: '4px 9px',
                                                                    borderRadius: '12px',
                                                                    border: `1px solid ${statusColors.border}`,
                                                                    display: 'inline-block'
                                                                }}>
                                                                    {cita.estado === 'no_asistio' ? 'No asistió' : cita.estado}
                                                                </span>
                                                                {(cita.confirmada_por_paciente || cita.estado === 'completada' || cita.estado === 'confirmada') && (
                                                                    <div style={{ marginTop: '4px', fontSize: '11px', color: '#15803d', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                                        <CheckCircle size={11} color="#15803d" /> Confirmada por paciente
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                                                    {['programada', 'confirmada'].includes(cita.estado) && (
                                                                        <button
                                                                            onClick={() => {
                                                                                // La cita se completa sola al registrar la atención (parte diario), no al abrir el formulario
                                                                                selectPatient({ ...cita.paciente, nombres: patientName, apellidos: '', cedula, puestoTrabajo: cita.paciente?.puesto || 'Servidor' }, 'consulta');
                                                                            }}
                                                                            className="action-button action-button--primary"
                                                                            style={{ padding: '5px 10px', fontSize: '11px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                                            title="Atender paciente ahora"
                                                                        >
                                                                            <Stethoscope size={13} /> Atender
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* PESTAÑA 8: CENTRO DE REPORTES DE SALUD OCUPACIONAL */}
                    {(activeTab === 'reportes' || activeTab === 'matrices') && (
                        <div>
                            {activeTab === 'reportes' ? (
                                <section className="page-hero" style={{ marginBottom: '20px' }}>
                                    <div>
                                        <span className="page-hero__label"><FileText size={14} style={{ marginRight: '6px', display: 'inline' }} /> Reportes y Gestión</span>
                                        <h2>Centro de Reportes de Salud Ocupacional</h2>
                                        <p>Genere, visualice e imprima los informes oficiales de atenciones, consumos y citas requeridos para las auditorías.</p>
                                    </div>
                                    <div className="page-hero__icon"><FileText size={34} /></div>
                                </section>
                            ) : (
                                <section className="page-hero" style={{ marginBottom: '20px' }}>
                                    <div>
                                        <span className="page-hero__label"><FileSpreadsheet size={14} style={{ marginRight: '6px', display: 'inline' }} /> Registro Manual</span>
                                        <h2>Matrices Estadísticas y Fichas Ocupacionales</h2>
                                        <p>Registre a mano los casos de cada matriz oficial. Los registros se guardan en el sistema y alimentan los formatos imprimibles.</p>
                                    </div>
                                    <div className="page-hero__icon"><FileSpreadsheet size={34} /></div>
                                </section>
                            )}

                            {activeTab === 'reportes' && (
                                <div className="liquid-nav">
                                    <button
                                        type="button"
                                        className={`liquid-nav__item ${activeReportSubTab === 'diario' ? 'active' : ''}`}
                                        onClick={() => setActiveReportSubTab('diario')}
                                    >
                                        <CalendarCheck size={16} />
                                        <span>Parte Diario</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`liquid-nav__item ${activeReportSubTab === 'fichas' ? 'active' : ''}`}
                                        onClick={() => setActiveReportSubTab('fichas')}
                                    >
                                        <FileCheck size={16} />
                                        <span>Fichas 077</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`liquid-nav__item ${activeReportSubTab === 'citas' ? 'active' : ''}`}
                                        onClick={() => setActiveReportSubTab('citas')}
                                    >
                                        <Calendar size={16} />
                                        <span>Citas</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`liquid-nav__item ${activeReportSubTab === 'examenes' ? 'active' : ''}`}
                                        onClick={() => setActiveReportSubTab('examenes')}
                                    >
                                        <ClipboardList size={16} />
                                        <span>Exámenes</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`liquid-nav__item ${activeReportSubTab === 'recetas' ? 'active' : ''}`}
                                        onClick={() => setActiveReportSubTab('recetas')}
                                    >
                                        <Pill size={16} />
                                        <span>Recetario</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`liquid-nav__item ${activeReportSubTab === 'mensual' ? 'active' : ''}`}
                                        onClick={() => setActiveReportSubTab('mensual')}
                                    >
                                        <BarChart3 size={16} />
                                        <span>Informe Mensual</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`liquid-nav__item ${isMatricesCat ? 'active' : ''}`}
                                        onClick={() => { if (!isMatricesCat) setActiveReportSubTab('catastroficas'); }}
                                    >
                                        <FileSpreadsheet size={16} />
                                        <span>Matrices Estadísticas</span>
                                    </button>
                                </div>
                            )}

                            {(activeTab === 'matrices' || isMatricesCat) && (
                                <div className="report-toolbar">
                                    <div className="field">
                                        <label>{activeTab === 'matrices' ? 'REGISTRAR EN' : 'MATRIZ'}</label>
                                        <select aria-label={activeTab === 'matrices' ? 'Registrar en' : 'Matriz'} value={activeReportSubTab} onChange={(e) => setActiveReportSubTab(e.target.value)}>
                                            <optgroup label="Matrices estadísticas">
                                                <option value="catastroficas">Enfermedades Catastróficas o Huérfanas</option>
                                                <option value="accidentes">Accidentes Laborales y Enfermedades Profesionales</option>
                                                <option value="covid">Casos Sospechosos y Confirmados COVID-19</option>
                                                <option value="ausentismo">Ausentismo Laboral</option>
                                                <option value="embarazadas">Censo de Embarazadas</option>
                                                <option value="psicosocial">Riesgo Psicosocial (Ansiedad y Depresión)</option>
                                                <option value="enfermedades_nuevas">Enfermedades Nuevas</option>
                                                <option value="examenes_periodicos">Exámenes Médicos y Fichas Periódicas por Mes</option>
                                                <option value="discapacidad">Funcionarios con Discapacidad</option>
                                                <option value="vulnerables_patologias">Grupos Vulnerables (Diabéticos, Hipertensos, Adulto Mayor, Otras)</option>
                                                <option value="personal_nuevo">Personal Nuevo que Ingresó en el Año</option>
                                            </optgroup>
                                            {activeTab === 'matrices' && (
                                                <optgroup label="Fichas">
                                                    <option value="ficha_cese">Ficha de Retiro / Cese de Funciones</option>
                                                    <option value="ficha_reintegro">Ficha de Reintegro Laboral</option>
                                                </optgroup>
                                            )}
                                        </select>
                                    </div>
                                    {activeTab === 'matrices' && MATRICES[activeReportSubTab] && (
                                        <button
                                            type="button"
                                            className="action-button action-button--accent"
                                            onClick={() => setMatrixModalKey(activeReportSubTab)}
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', minHeight: '43px' }}
                                        >
                                            <Plus size={16} /> Nuevo registro
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* SUBTAB: DIARIO */}
                            {activeReportSubTab === 'diario' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <article className="nurse-card span-12 daily-header-card" style={{ borderRadius: '14px', padding: '20px' }}>
                                        <div className="daily-date-control" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '16px' }}>
                                            <div>
                                                <span className="eyebrow">PARTE DE LA JORNADA</span>
                                                <h3>Atenciones del día</h3>
                                                <p>Selecciona una fecha para consultar y exportar el reporte correspondiente.</p>
                                            </div>
                                            <div className="date-navigation" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <CalendarDays size={16} color="var(--accent)" />
                                                    <input
                                                        aria-label="Fecha del parte diario"
                                                        type="date"
                                                        value={parteDiarioDate}
                                                        onChange={(e) => setParteDiarioDate(e.target.value)}
                                                        style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px', fontSize: '11px', outline: 0 }}
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    </article>

                                    {/* Visor PDF del Parte Diario */}
                                    <div className="document-viewer" style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        border: '1px solid var(--border)',
                                        borderRadius: '14px',
                                        overflow: 'hidden',
                                        background: '#0f172a',
                                        boxShadow: 'var(--shadow-lg)'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '12px 20px',
                                            borderBottom: '1px solid rgba(255,255,255,0.08)'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{
                                                    background: '#dc2626',
                                                    color: '#fff',
                                                    width: '28px',
                                                    height: '28px',
                                                    borderRadius: '6px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 'bold',
                                                    fontSize: '11px'
                                                }}>PDF</div>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ color: '#fff', fontSize: '12.5px', fontWeight: 600 }}>Parte_Diario_Ocupacional_{parteDiarioDate}.pdf</span>
                                                    <span style={{ color: '#94a3b8', fontSize: '11px' }}>Vista previa del documento oficial para impresión</span>
                                                </div>
                                            </div>
                                            <button
                                                className="action-button action-button--accent"
                                                onClick={handlePrintParteDiario}
                                                style={{ display: 'flex', alignItems: 'center', gap: '6px', minHeight: '32px', fontSize: '11.5px', borderRadius: '8px', padding: '0 14px' }}
                                            >
                                                <Printer size={14} /> Imprimir / Descargar
                                            </button>
                                        </div>
                                        <div style={{ background: '#334155', padding: '20px', display: 'flex', justifyContent: 'center', overflow: 'auto' }}>
                                            {parteDiarioLoading ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '500px', color: '#fff', gap: '12px' }}>
                                                    <div className="spin-icon" style={{ border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid #fff', borderRadius: '50%', width: '32px', height: '32px', animation: 'spin 1s linear infinite' }}></div>
                                                    <span>Compilando parte diario oficial...</span>
                                                </div>
                                            ) : (
                                                <iframe
                                                    ref={diarioIframeRef}
                                                    title="Parte Diario Ocupacional"
                                                    srcDoc={compileParteDiarioHtmlString(false)}
                                                    style={{
                                                        width: '100%',
                                                        maxWidth: '1050px',
                                                        height: '620px',
                                                        border: 'none',
                                                        background: '#fff',
                                                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                                                        borderRadius: '4px'
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* SUBTAB: FICHAS OCUPACIONALES - FORMATO OFICIAL MSP/MDT 077 */}
                            {activeReportSubTab === 'fichas' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {/* TARJETA DE CONTROL: SUBPESTAÑAS Y BUSCADOR DE PACIENTE */}
                                    <article className="nurse-card span-12" style={{ borderRadius: '14px', padding: '20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', width: '100%' }}>
                                            <div>
                                                <span className="eyebrow">MINISTERIO DE SALUD PÚBLICA / MDT</span>
                                                <h3 style={{ margin: '4px 0 6px 0', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                                                    Fichas Médicas Ocupacionales · Formulario Oficial 077
                                                </h3>
                                                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                                                    Formato oficial normado de evaluación médica ocupacional (MSP / MDT Formulario 077).
                                                </p>
                                                
                                                {/* SUBPESTAÑAS DE TIPO DE FICHA 077 */}
                                                <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
                                                    <button
                                                        type="button"
                                                        className={`history-tab ${fichaSubTab === 'ingreso' ? 'active' : ''}`}
                                                        onClick={() => {
                                                            setFichaSubTab('ingreso');
                                                            setFichaSearchTerm('');
                                                            const firstIngreso = fichasData.find(f => f.tipo === 'Ingreso' || f.tipo === 'Periódico');
                                                            if (firstIngreso) setSelectedFichaWorkerId(firstIngreso.id);
                                                        }}
                                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                                                    >
                                                        <FileCheck size={14} /> Ingreso / Periódico (077)
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={`history-tab ${fichaSubTab === 'cese' ? 'active' : ''}`}
                                                        onClick={() => {
                                                            setFichaSubTab('cese');
                                                            setFichaSearchTerm('');
                                                            const firstRetiro = fichasData.find(f => f.tipo === 'Retiro' || f.tipo === 'Cese');
                                                            if (firstRetiro) setSelectedFichaWorkerId(firstRetiro.id);
                                                        }}
                                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                                                    >
                                                        <UserX size={14} /> Retiro / Cese (077)
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={`history-tab ${fichaSubTab === 'reintegro' ? 'active' : ''}`}
                                                        onClick={() => {
                                                            setFichaSubTab('reintegro');
                                                            setFichaSearchTerm('');
                                                            if (reintegrosData.length > 0) setSelectedFichaWorkerId(reintegrosData[0].id);
                                                        }}
                                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                                                    >
                                                        <RefreshCw size={14} /> Reintegro Laboral (077)
                                                    </button>
                                                </div>
                                            </div>

                                            {/* BUSCADOR DE PACIENTE FUERA DEL VISOR */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ position: 'relative' }}>
                                                    <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                                    <input
                                                        aria-label="Buscar trabajador por nombre o cédula"
                                                        type="text"
                                                        placeholder="Buscar trabajador por nombre o cédula..."
                                                        value={fichaSearchTerm}
                                                        onChange={(e) => setFichaSearchTerm(e.target.value)}
                                                        style={{
                                                            border: '1px solid var(--border)',
                                                            borderRadius: '8px',
                                                            padding: '8px 12px 8px 32px',
                                                            fontSize: '12px',
                                                            minWidth: '280px',
                                                            outline: 'none',
                                                            background: '#ffffff'
                                                        }}
                                                    />
                                                    {fichaSearchTerm && (
                                                        <button aria-label="Limpiar búsqueda"
                                                            type="button"
                                                            onClick={() => setFichaSearchTerm('')}
                                                            style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Fichas de la pestaña, filtradas mientras se escribe */}
                                        <div style={{ marginTop: '14px' }}>
                                            <span role="status" aria-live="polite" style={{ display: 'block', fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px' }}>
                                                {activeFichas.length === 0
                                                    ? (fichaSearchTerm.trim() ? 'Ninguna ficha coincide con la búsqueda.' : 'Aún no hay fichas registradas de este tipo.')
                                                    : `${activeFichas.length} ${activeFichas.length === 1 ? 'ficha' : 'fichas'}${fichaSearchTerm.trim() ? ' encontradas' : ''}`}
                                            </span>
                                            {activeFichas.length > 0 && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '220px', overflowY: 'auto' }}>
                                                    {activeFichas.map(ficha => {
                                                        const seleccionada = selectedFichaRecord?.id === ficha.id;
                                                        return (
                                                            <button
                                                                key={ficha.id}
                                                                type="button"
                                                                aria-pressed={seleccionada}
                                                                onClick={() => setSelectedFichaWorkerId(ficha.id)}
                                                                style={{
                                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', textAlign: 'left',
                                                                    padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
                                                                    border: seleccionada ? '1.5px solid var(--primary)' : '1px solid #e2e8f0',
                                                                    background: seleccionada ? 'var(--primary-soft)' : '#f8fafc'
                                                                }}
                                                            >
                                                                <span style={{ minWidth: 0 }}>
                                                                    <strong style={{ display: 'block', fontSize: '12.5px', color: '#0f172a' }}>{ficha.paciente || 'Sin nombre'}</strong>
                                                                    <small style={{ color: '#64748b', fontSize: '11px' }}>C.I. {ficha.cedula || '—'} · {ficha.tipo}</small>
                                                                </span>
                                                                <small style={{ color: '#475569', fontSize: '11px', whiteSpace: 'nowrap' }}>{formatFecha(ficha.fecha)}</small>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </article>

                                    {/* VISOR DE DOCUMENTO OFICIAL FORMATO 077 */}
                                    <div className="document-viewer" style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        border: '1px solid var(--border)',
                                        borderRadius: '14px',
                                        overflow: 'hidden',
                                        background: '#0f172a',
                                        boxShadow: 'var(--shadow-lg)'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '12px 20px',
                                            borderBottom: '1px solid rgba(255,255,255,0.08)',
                                            flexWrap: 'wrap',
                                            gap: '12px'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{
                                                    background: '#dc2626',
                                                    color: '#fff',
                                                    width: '28px',
                                                    height: '28px',
                                                    borderRadius: '6px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 'bold',
                                                    fontSize: '11px'
                                                }}>PDF</div>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ color: '#fff', fontSize: '12.5px', fontWeight: 600 }}>
                                                        {`Formulario_077_${fichaSubTab.toUpperCase()}_${selectedFichaRecord?.paciente ? selectedFichaRecord.paciente.trim().replace(/\s+/g, '_') : 'EXPEDIENTE'}.pdf`}
                                                    </span>
                                                    <span style={{ color: '#94a3b8', fontSize: '11px' }}>
                                                        Formato Oficial MSP/MDT 077 · {selectedFichaRecord?.paciente || 'Trabajador'} (C.I.: {selectedFichaRecord?.cedula || ''}) · {selectedFichaRecord?.puesto || ''}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                className="action-button action-button--accent"
                                                onClick={handlePrintSelectedFicha}
                                                style={{ display: 'flex', alignItems: 'center', gap: '6px', minHeight: '32px', fontSize: '11.5px', borderRadius: '8px', padding: '0 14px' }}
                                            >
                                                <Printer size={14} /> Imprimir / Descargar Formulario 077
                                            </button>
                                        </div>
                                        <div style={{ background: '#334155', padding: '20px', display: 'flex', justifyContent: 'center', overflow: 'auto' }}>
                                            <iframe
                                                ref={fichasIframeRef}
                                                title="Formulario Oficial MSP 077"
                                                srcDoc={compileCurrentFicha077Html(selectedFichaRecord, false)}
                                                style={{
                                                    width: '100%',
                                                    maxWidth: '1050px',
                                                    height: '780px',
                                                    border: 'none',
                                                    background: '#fff',
                                                    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                                                    borderRadius: '4px'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}



                            {/* SUBTAB: CITAS */}
                            {activeReportSubTab === 'citas' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <article className="nurse-card span-12" style={{ borderRadius: '14px', padding: '20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', width: '100%' }}>
                                            <div>
                                                <span className="eyebrow">REGISTRO DE AGENDAS</span>
                                                <h3>Reporte de Citas Programadas</h3>
                                                <p>Consulte y exporte la bitácora de agendas de citas médicas para el día seleccionado.</p>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <CalendarDays size={16} color="var(--accent)" />
                                                    <input
                                                        aria-label="Fecha del reporte de citas"
                                                        type="date"
                                                        value={reportCitasFecha}
                                                        onChange={(e) => setReportCitasFecha(e.target.value)}
                                                        style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px', fontSize: '11px', outline: 0 }}
                                                    />
                                                </label>
                                                <select
                                                    aria-label="Filtrar por estado"
                                                    value={reportCitasEstado}
                                                    onChange={(e) => setReportCitasEstado(e.target.value)}
                                                    style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px', fontSize: '11.5px', outline: 0, background: 'white' }}
                                                >
                                                    <option value="all">Todos los estados</option>
                                                    <option value="programada">Programadas</option>
                                                    <option value="confirmada">Confirmadas</option>
                                                    <option value="completada">Completadas</option>
                                                    <option value="cancelada">Canceladas</option>
                                                    <option value="no_asistio">No asistió</option>
                                                </select>
                                            </div>
                                        </div>
                                    </article>

                                    {/* Visor PDF de Reporte de Citas */}
                                    <div className="document-viewer" style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        border: '1px solid var(--border)',
                                        borderRadius: '14px',
                                        overflow: 'hidden',
                                        background: '#0f172a',
                                        boxShadow: 'var(--shadow-lg)'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '12px 20px',
                                            borderBottom: '1px solid rgba(255,255,255,0.08)'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{
                                                    background: '#dc2626',
                                                    color: '#fff',
                                                    width: '28px',
                                                    height: '28px',
                                                    borderRadius: '6px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 'bold',
                                                    fontSize: '11px'
                                                }}>PDF</div>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ color: '#fff', fontSize: '12.5px', fontWeight: 600 }}>Reporte_Citas_Ocupacional_{reportCitasFecha}.pdf</span>
                                                    <span style={{ color: '#94a3b8', fontSize: '11px' }}>Vista previa del documento oficial para impresión</span>
                                                </div>
                                            </div>
                                            <button
                                                className="action-button action-button--accent"
                                                onClick={handlePrintReporteCitas}
                                                style={{ display: 'flex', alignItems: 'center', gap: '6px', minHeight: '32px', fontSize: '11.5px', borderRadius: '8px', padding: '0 14px' }}
                                            >
                                                <Printer size={14} /> Imprimir / Descargar
                                            </button>
                                        </div>
                                        <div style={{ background: '#334155', padding: '20px', display: 'flex', justifyContent: 'center', overflow: 'auto' }}>
                                            {citasLoading ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '500px', color: '#fff', gap: '12px' }}>
                                                    <div className="spin-icon" style={{ border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid #fff', borderRadius: '50%', width: '32px', height: '32px', animation: 'spin 1s linear infinite' }}></div>
                                                    <span>Generando vista previa...</span>
                                                </div>
                                            ) : (
                                                <iframe
                                                    ref={citasIframeRef}
                                                    title="Reporte Citas Ocupacional"
                                                    srcDoc={compileCitasReportHtmlString(false)}
                                                    style={{
                                                        width: '100%',
                                                        maxWidth: '1050px',
                                                        height: '620px',
                                                        border: 'none',
                                                        background: '#fff',
                                                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                                                        borderRadius: '4px'
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* SUBTAB: REPORTE DE EXÁMENES & LABORATORIO */}
                            {activeReportSubTab === 'examenes' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <article className="nurse-card span-12" style={{ borderRadius: '14px', padding: '20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', width: '100%' }}>
                                            <div>
                                                <span className="eyebrow">DIAGNÓSTICO OCUPACIONAL</span>
                                                <h3>Matriz & Reporte de Exámenes Médicos</h3>
                                                <p>Consulte el historial acumulado de órdenes diagnósticas, estados de resultados y exporte la matriz oficial.</p>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <button className="action-button action-button--primary" onClick={handleOpenExamModal} style={{ display: 'flex', alignItems: 'center', gap: '6px', minHeight: '34px', fontSize: '12px' }}>
                                                    <Plus size={14} /> Nueva Orden
                                                </button>
                                                <button className="action-button action-button--accent" onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '6px', minHeight: '34px', fontSize: '12px' }}>
                                                    <Printer size={14} /> Imprimir Matriz
                                                </button>
                                            </div>
                                        </div>
                                    </article>

                                    <div className="card" style={{ borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', background: '#ffffff' }}>
                                        {/* BARRA DE FILTROS & ACCIONES */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                                            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}>
                                                <button
                                                    type="button"
                                                    className={`history-tab ${examFilterStatus === 'todos' ? 'active' : ''}`}
                                                    onClick={() => setExamFilterStatus('todos')}
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '12px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer' }}
                                                >
                                                    <FileText size={15} /> Todos los Exámenes
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`history-tab ${examFilterStatus === 'pendiente' ? 'active' : ''}`}
                                                    onClick={() => setExamFilterStatus('pendiente')}
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '12px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer' }}
                                                >
                                                    <AlertTriangle size={15} /> Pendientes
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`history-tab ${examFilterStatus === 'realizado' ? 'active' : ''}`}
                                                    onClick={() => setExamFilterStatus('realizado')}
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '12px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer' }}
                                                >
                                                    <CheckCircle size={15} /> Realizados
                                                </button>
                                            </div>
                                        </div>

                                        {/* BUSCADOR Y CONTEO */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', gap: '12px', flexWrap: 'wrap' }}>
                                            <div className="patient-search-input" style={{ width: '100%', maxWidth: '400px' }}>
                                                <Search size={16} />
                                                <input
                                                    aria-label="Buscar por paciente, cédula, examen o laboratorio"
                                                    type="text"
                                                    placeholder="Buscar por paciente, cédula, examen o laboratorio..."
                                                    value={examSearchTerm}
                                                    onChange={e => setExamSearchTerm(e.target.value)}
                                                />
                                            </div>
                                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                                                Exámenes filtrados: <strong>{filteredExamenes.length}</strong>
                                            </div>
                                        </div>

                                        {/* TABLA DE EXÁMENES */}
                                        <div className="table-responsive">
                                            <table className="table" style={{ width: '100%' }}>
                                                <thead>
                                                    <tr>
                                                        <th>Fecha Orden</th>
                                                        <th>Paciente / Cédula</th>
                                                        <th>Examen Requerido</th>
                                                        <th>Motivo / Indicación</th>
                                                        <th>Laboratorio Destino</th>
                                                        <th>Estado</th>
                                                        <th>Resultado / Informe</th>
                                                        <th style={{ textAlign: 'right' }}>Acciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredExamenes.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="8" style={{ textAlign: 'center', padding: '36px 16px', color: '#64748b', fontSize: '13.5px' }}>
                                                                No hay órdenes de examen médico registradas en este apartado.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        filteredExamenes.map(item => (
                                                            <tr key={item.id}>
                                                                <td>{formatFecha(item.fecha)}</td>
                                                                <td>
                                                                    <strong>{item.paciente}</strong>
                                                                    <small style={{ display: 'block', color: '#64748b', fontSize: '11px' }}>C.I: {item.cedula}</small>
                                                                </td>
                                                                <td>
                                                                    <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '8px', fontSize: '11.5px', fontWeight: '600' }}>
                                                                        {item.examen}
                                                                    </span>
                                                                </td>
                                                                <td style={{ fontSize: '12.5px', color: '#334155' }}>{item.motivo}</td>
                                                                <td style={{ fontSize: '12px', color: '#64748b' }}>{item.laboratorio}</td>
                                                                <td>
                                                                    <span style={{
                                                                        padding: '5px 12px',
                                                                        borderRadius: '20px',
                                                                        fontSize: '11.5px',
                                                                        fontWeight: '700',
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        gap: '6px',
                                                                        background: item.estado === 'Realizado' ? '#f0fdf4' : '#fffbeb',
                                                                        color: item.estado === 'Realizado' ? '#15803d' : '#b45309',
                                                                        border: item.estado === 'Realizado' ? '1px solid #dcfce7' : '1px solid #fef3c7'
                                                                    }}>
                                                                        {item.estado === 'Realizado' ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                                                                        {item.estado}
                                                                    </span>
                                                                </td>
                                                                <td style={{ maxWidth: '220px', fontSize: '12px', color: '#0f172a', fontWeight: '500' }}>
                                                                    {item.resultado}
                                                                </td>
                                                                <td style={{ textAlign: 'right' }}>
                                                                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                                                                        <button
                                                                            type="button"
                                                                            className="action-button action-button--light"
                                                                            style={{ padding: '6px 10px', fontSize: '11.5px', borderRadius: '8px' }}
                                                                            onClick={() => alert(`Generando orden en PDF del examen (${item.examen}) para ${item.paciente}`)}
                                                                            title="Imprimir Orden PDF"
                                                                        >
                                                                            <Printer size={13} /> Orden
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            className="action-button action-button--primary"
                                                                            style={{ padding: '6px 10px', fontSize: '11.5px', borderRadius: '8px' }}
                                                                            onClick={() => setExamResultModal({ show: true, item, resultadoText: item.resultado !== 'Pendiente de emisión por laboratorio' ? item.resultado : '', estado: 'Realizado' })}
                                                                            title="Cargar / Editar Resultado"
                                                                        >
                                                                            <Upload size={13} /> Resultado
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* SUBTAB: RECETARIO Y PRESCRIPCIÓN MÉDICA OCUPACIONAL */}
                            {activeReportSubTab === 'recetas' && (() => {
                                const term = (recetasSearchNombre || '').trim().toLowerCase();
                                const filteredRecetas = recetasData.filter(r => {
                                    const matchNombre = !term ||
                                        (r.paciente || '').toLowerCase().includes(term) ||
                                        (r.cedula || '').includes(term) ||
                                        (r.numero_receta || '').toLowerCase().includes(term) ||
                                        (r.cie || '').toLowerCase().includes(term);
                                    const matchFecha = !recetasSearchFecha || r.fecha === recetasSearchFecha;
                                    return matchNombre && matchFecha;
                                });

                                const currentSelectedReceta = (term && filteredRecetas.length > 0)
                                    ? filteredRecetas[0]
                                    : (filteredRecetas.find(r => String(r.id) === String(selectedRecetaId)) ||
                                       filteredRecetas[0] ||
                                       recetasData.find(r => String(r.id) === String(selectedRecetaId)) ||
                                       recetasData[0]);

                                const handlePrintCurrentReceta = () => {
                                    if (!currentSelectedReceta) {
                                        showSystemToast('No hay una receta seleccionada para imprimir.');
                                        return;
                                    }
                                    printIframeDocument(recetaIframeRef, () => compileRecetaFormHtmlString(currentSelectedReceta, false));
                                    showSystemToast('Enviando receta médica oficial a impresión...');
                                };

                                return (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        {/* TARJETA DE CONTROL: BUSCADOR DE EXPEDIENTE / PACIENTE FUERA DEL VISOR */}
                                        <article className="nurse-card span-12" style={{ borderRadius: '14px', padding: '20px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', width: '100%' }}>
                                                <div>
                                                    <span className="eyebrow">DIRECCIÓN DE BIENESTAR UNIVERSITARIO · SALUD OCUPACIONAL</span>
                                                    <h3 style={{ margin: '4px 0 6px 0', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                                                        Prescripción Médica Ocupacional · Recetario Oficial
                                                    </h3>
                                                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                                                        Formato oficial normado de indicaciones farmacológicas, horarios y recomendaciones médicas para el paciente.
                                                    </p>
                                                </div>

                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                                    {/* Buscador de paciente por nombre o cédula */}
                                                    <div style={{ position: 'relative' }}>
                                                        <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                                        <input
                                                            aria-label="Buscar paciente por nombre o cédula"
                                                            type="text"
                                                            placeholder="Buscar paciente por nombre o cédula..."
                                                            value={recetasSearchNombre}
                                                            onChange={(e) => setRecetasSearchNombre(e.target.value)}
                                                            style={{
                                                                border: '1px solid var(--border)',
                                                                borderRadius: '8px',
                                                                padding: '8px 12px 8px 32px',
                                                                fontSize: '12px',
                                                                minWidth: '280px',
                                                                outline: 'none',
                                                                background: '#ffffff'
                                                            }}
                                                        />
                                                        {recetasSearchNombre && (
                                                            <button aria-label="Limpiar búsqueda"
                                                                type="button"
                                                                onClick={() => setRecetasSearchNombre('')}
                                                                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Filtro por fecha */}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <CalendarDays size={16} color="var(--accent)" />
                                                        <input
                                                            aria-label="Filtrar por fecha"
                                                            type="date"
                                                            value={recetasSearchFecha}
                                                            onChange={(e) => setRecetasSearchFecha(e.target.value)}
                                                            style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '7px 10px', fontSize: '11.5px', outline: 0, background: '#fff' }}
                                                        />
                                                        {recetasSearchFecha && (
                                                            <button
                                                                className="action-button action-button--light"
                                                                style={{ padding: '6px 10px', fontSize: '11px' }}
                                                                onClick={() => setRecetasSearchFecha('')}
                                                                title="Quitar filtro de fecha"
                                                            >
                                                                Limpiar
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </article>

                                        {/* VISOR DE PDF OFICIAL DE PREESCRIPCIÓN MÉDICA */}
                                        <div className="document-viewer" style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            border: '1px solid var(--border)',
                                            borderRadius: '14px',
                                            overflow: 'hidden',
                                            background: '#0f172a',
                                            boxShadow: 'var(--shadow-lg)'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '12px 20px',
                                                borderBottom: '1px solid rgba(255,255,255,0.08)',
                                                flexWrap: 'wrap',
                                                gap: '12px'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{
                                                        background: '#dc2626',
                                                        color: '#fff',
                                                        width: '28px',
                                                        height: '28px',
                                                        borderRadius: '6px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontWeight: 'bold',
                                                        fontSize: '11px'
                                                    }}>PDF</div>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span style={{ color: '#fff', fontSize: '12.5px', fontWeight: 600 }}>
                                                            {`Receta_Medica_${currentSelectedReceta?.numero_receta || '001'}_${currentSelectedReceta?.paciente ? currentSelectedReceta.paciente.trim().replace(/\s+/g, '_') : 'EXPEDIENTE'}.pdf`}
                                                        </span>
                                                        <span style={{ color: '#94a3b8', fontSize: '11px' }}>
                                                            Formato Oficial de Recetario (Puesto de Salud UEB) · {currentSelectedReceta?.paciente || 'Paciente'} (C.I.: {currentSelectedReceta?.cedula || ''}) · Emisión: {currentSelectedReceta?.fecha || ''}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    className="action-button action-button--accent"
                                                    onClick={handlePrintCurrentReceta}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', minHeight: '32px', fontSize: '11.5px', borderRadius: '8px', padding: '0 14px' }}
                                                >
                                                    <Printer size={14} /> Imprimir / Descargar Receta
                                                </button>
                                            </div>
                                            <div style={{ background: '#334155', padding: '20px', display: 'flex', justifyContent: 'center', overflow: 'auto' }}>
                                                <iframe
                                                    ref={recetaIframeRef}
                                                    title="Recetario Médico Ocupacional Oficial"
                                                    srcDoc={compileRecetaFormHtmlString(currentSelectedReceta, false)}
                                                    style={{
                                                        width: '100%',
                                                        maxWidth: '950px',
                                                        height: '780px',
                                                        border: 'none',
                                                        background: '#fff',
                                                        boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                                                        borderRadius: '4px'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* SUBTAB: INFORME ESTADÍSTICO MENSUAL */}
                            {activeReportSubTab === 'mensual' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <article className="nurse-card span-12" style={{ borderRadius: '14px', padding: '20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', width: '100%' }}>
                                            <div>
                                                <span className="eyebrow">AUDITORÍA MENSUAL</span>
                                                <h3>Informe Estadístico Mensual</h3>
                                                <p>Genere y visualice la tabulación de atenciones acumulativas distribuidas por carrera y género del mes seleccionado.</p>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    border: '1px solid var(--border)',
                                                    borderRadius: '8px',
                                                    padding: '4px 10px',
                                                    background: '#ffffff',
                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                                                }}>
                                                    <CalendarDays size={16} color="var(--accent)" />
                                                    <select
                                                        aria-label="Mes"
                                                        value={genReportMonth}
                                                        onChange={(e) => {
                                                            const m = parseInt(e.target.value);
                                                            setGenReportMonth(m);
                                                            setReportMensualFecha(`${genReportYear}-${String(m).padStart(2, '0')}`);
                                                        }}
                                                        style={{
                                                            border: 'none',
                                                            outline: 'none',
                                                            fontSize: '11.5px',
                                                            fontWeight: 600,
                                                            color: 'var(--text-main, #1e293b)',
                                                            background: 'transparent',
                                                            cursor: 'pointer',
                                                            padding: '2px 4px'
                                                        }}
                                                    >
                                                        {["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"].map((mes, idx) => (
                                                            <option key={idx + 1} value={idx + 1}>{mes}</option>
                                                        ))}
                                                    </select>
                                                    <span style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '11.5px', fontWeight: 500 }}>de</span>
                                                    <select
                                                        aria-label="Año"
                                                        value={genReportYear}
                                                        onChange={(e) => {
                                                            const y = parseInt(e.target.value);
                                                            setGenReportYear(y);
                                                            setReportMensualFecha(`${y}-${String(genReportMonth).padStart(2, '0')}`);
                                                        }}
                                                        style={{
                                                            border: 'none',
                                                            outline: 'none',
                                                            fontSize: '11.5px',
                                                            fontWeight: 600,
                                                            color: 'var(--text-main, #1e293b)',
                                                            background: 'transparent',
                                                            cursor: 'pointer',
                                                            padding: '2px 4px'
                                                        }}
                                                    >
                                                        {[2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                                                            <option key={y} value={y}>{y}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </article>

                                    {/* Visor PDF del Informe Estadístico Mensual */}
                                    <div className="document-viewer" style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        border: '1px solid var(--border)',
                                        borderRadius: '14px',
                                        overflow: 'hidden',
                                        background: '#0f172a',
                                        boxShadow: 'var(--shadow-lg)'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '12px 20px',
                                            borderBottom: '1px solid rgba(255,255,255,0.08)'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{
                                                    background: '#dc2626',
                                                    color: '#fff',
                                                    width: '28px',
                                                    height: '28px',
                                                    borderRadius: '6px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 'bold',
                                                    fontSize: '11px'
                                                }}>PDF</div>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ color: '#fff', fontSize: '12.5px', fontWeight: 600 }}>Informe_Estadistico_Mensual_Ocupacional_{["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"][genReportMonth - 1]}_{genReportYear}.pdf</span>
                                                    <span style={{ color: '#94a3b8', fontSize: '11px' }}>Vista previa del documento oficial para impresión</span>
                                                </div>
                                            </div>
                                            <button
                                                className="action-button action-button--accent"
                                                onClick={handlePrintGeneralReport}
                                                style={{ display: 'flex', alignItems: 'center', gap: '6px', minHeight: '32px', fontSize: '11.5px', borderRadius: '8px', padding: '0 14px' }}
                                            >
                                                <Printer size={14} /> Imprimir / Descargar
                                            </button>
                                        </div>
                                        <div style={{ background: '#334155', padding: '20px', display: 'flex', justifyContent: 'center', overflow: 'auto' }}>
                                            {genReportLoading ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '500px', color: '#fff', gap: '12px' }}>
                                                    <div className="spin-icon" style={{ border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid #fff', borderRadius: '50%', width: '32px', height: '32px', animation: 'spin 1s linear infinite' }}></div>
                                                    <span>Compilando informe mensual oficial...</span>
                                                </div>
                                            ) : (
                                                <iframe
                                                    ref={mensualIframeRef}
                                                    title="Informe Mensual Ocupacional"
                                                    srcDoc={compileGeneralReportHtmlString(genReportData, false)}
                                                    style={{
                                                        width: '100%',
                                                        maxWidth: '1050px',
                                                        height: '620px',
                                                        border: 'none',
                                                        background: '#fff',
                                                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                                                        borderRadius: '4px'
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* SUBTAB: EXÁMENES & LABORATORIO OCUPACIONAL */}
                            {activeReportSubTab === 'examenes' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <article className="nurse-card span-12" style={{ borderRadius: '14px', padding: '20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', width: '100%' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span className="eyebrow" style={{ color: '#0284c7' }}>LABORATORIO CLÍNICO & VIGILANCIA</span>
                                                    <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '11px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '12px' }}>FORMATO UEB</span>
                                                </div>
                                                <h3 style={{ margin: '4px 0', fontSize: '18px', color: '#0b3c5d' }}>Órdenes de Exámenes de Laboratorio Clínico</h3>
                                                <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>
                                                    Emita la orden médica con la cuadrícula oficial de 11 categorías o revise las órdenes generadas por fecha de emisión.
                                                </p>
                                            </div>
                                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                                                <button
                                                    className="action-button action-button--accent"
                                                    onClick={() => setIsExamModalOpen(true)}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#0b3c5d', color: '#ffffff', fontWeight: 'bold' }}
                                                >
                                                    <FileText size={15} /> Emitir Nueva Orden de Examen
                                                </button>
                                                <button
                                                    className="action-button action-button--light"
                                                    onClick={handlePrintDailyExamsReport}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                                >
                                                    <Printer size={15} /> Imprimir Reporte de Órdenes
                                                </button>
                                            </div>
                                        </div>
                                    </article>

                                    {/* FILTROS Y BÚSQUEDA DE ÓRDENES */}
                                    <div className="nurse-card span-12" style={{ borderRadius: '14px', padding: '16px 20px', background: '#ffffff' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
                                                <div className="patient-search-input" style={{ maxWidth: '320px', margin: 0 }}>
                                                    <Search size={16} />
                                                    <input
                                                        aria-label="Buscar por paciente, cédula o examen"
                                                        type="text"
                                                        placeholder="Buscar por paciente, cédula o examen..."
                                                        value={examSearchTerm}
                                                        onChange={(e) => setExamSearchTerm(e.target.value)}
                                                    />
                                                    {examSearchTerm && (
                                                        <button aria-label="Limpiar búsqueda" onClick={() => setExamSearchTerm('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                                                            <X size={14} />
                                                        </button>
                                                    )}
                                                </div>

                                                {/* SELECTOR DE FECHA CON OPCIÓN HISTÓRICO */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                    <CalendarDays size={16} color="#0284c7" />
                                                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#334155' }}>Fecha Emisión:</span>
                                                    <input
                                                        aria-label="Fecha Emisión"
                                                        type="date"
                                                        disabled={!useExamDateFilter}
                                                        value={examReportDate}
                                                        onChange={(e) => setExamReportDate(e.target.value)}
                                                        style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', opacity: useExamDateFilter ? 1 : 0.5 }}
                                                    />
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748b', cursor: 'pointer', marginLeft: '4px' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={!useExamDateFilter}
                                                            onChange={(e) => setUseExamDateFilter(!e.target.checked)}
                                                        />
                                                        Ver Histórico
                                                    </label>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontSize: '12px', color: '#64748b' }}>Estado:</span>
                                                <select
                                                    aria-label="Estado"
                                                    value={examFilterStatus}
                                                    onChange={(e) => setExamFilterStatus(e.target.value)}
                                                    style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 0 }}
                                                >
                                                    <option value="todos">Todos los Estados</option>
                                                    <option value="pendiente">Pendientes</option>
                                                    <option value="completado">Completados</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* TABLA DE ÓRDENES DE EXÁMENES GENERADAS */}
                                    <div className="nurse-card span-12" style={{ borderRadius: '14px', overflow: 'hidden', padding: 0 }}>
                                        <div style={{ padding: '16px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h4 style={{ margin: 0, fontSize: '14px', color: '#0b3c5d', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Stethoscope size={16} /> Órdenes Registradas ({filteredExamOrders.length})
                                            </h4>
                                            {useExamDateFilter && (
                                                <span style={{ fontSize: '11px', color: '#0369a1', background: '#e0f2fe', padding: '2px 8px', borderRadius: '6px', fontWeight: '600' }}>
                                                    Filtrado por Fecha: {examReportDate}
                                                </span>
                                            )}
                                        </div>

                                        <div style={{ overflowX: 'auto' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                                                <thead>
                                                    <tr style={{ background: '#0b3c5d', color: '#ffffff' }}>
                                                        <th style={{ padding: '10px 14px', fontWeight: 'bold' }}>N°</th>
                                                        <th style={{ padding: '10px 14px', fontWeight: 'bold' }}>Fecha</th>
                                                        <th style={{ padding: '10px 14px', fontWeight: 'bold' }}>Paciente / Cédula</th>
                                                        <th style={{ padding: '10px 14px', fontWeight: 'bold' }}>Exámenes Solicitados</th>
                                                        <th style={{ padding: '10px 14px', fontWeight: 'bold' }}>Motivo Ocupacional</th>
                                                        <th style={{ padding: '10px 14px', fontWeight: 'bold' }}>Estado</th>
                                                        <th style={{ padding: '10px 14px', fontWeight: 'bold', textAlign: 'right' }}>Acciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredExamOrders.length > 0 ? (
                                                        filteredExamOrders.map((ord, idx) => (
                                                            <tr key={ord.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                                                <td style={{ padding: '10px 14px', fontWeight: 'bold', color: '#64748b' }}>{idx + 1}</td>
                                                                <td style={{ padding: '10px 14px', color: '#334155' }}>{formatFecha(ord.fecha)}</td>
                                                                <td style={{ padding: '10px 14px' }}>
                                                                    <div style={{ fontWeight: 'bold', color: '#0b3c5d' }}>{ord.paciente}</div>
                                                                    <div style={{ fontSize: '11px', color: '#64748b' }}>C.I: {ord.cedula}</div>
                                                                </td>
                                                                <td style={{ padding: '10px 14px', color: '#1e293b', maxWidth: '280px' }}>
                                                                    <div style={{ fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                        {ord.examen}
                                                                    </div>
                                                                </td>
                                                                <td style={{ padding: '10px 14px', color: '#475569' }}>{ord.motivo}</td>
                                                                <td style={{ padding: '10px 14px' }}>
                                                                    <span style={{
                                                                        padding: '3px 8px',
                                                                        borderRadius: '12px',
                                                                        fontSize: '11px',
                                                                        fontWeight: 'bold',
                                                                        background: ord.estado === 'Completado' ? '#dcfce7' : '#fef3c7',
                                                                        color: ord.estado === 'Completado' ? '#15803d' : '#b45309'
                                                                    }}>
                                                                        {ord.estado}
                                                                    </span>
                                                                </td>
                                                                <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                                                                    <button
                                                                        className="action-button action-button--accent"
                                                                        onClick={() => handlePrintExamOrderDocument(ord)}
                                                                        style={{ padding: '4px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                                                    >
                                                                        <Printer size={12} /> Orden PDF
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                                                                No se encontraron órdenes de examen registradas para esta fecha o criterio de búsqueda.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* VISTA UNIFICADA DE MATRICES ESTADÍSTICAS OFICIALES CON VISOR PDF */}
                            {activeTab === 'reportes' && isMatricesCat && (() => {
                                const meta = getActiveMatrixMeta();
                                return (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        {/* PANEL DE CONTROL SUPERIOR */}
                                        <article className="nurse-card span-12" style={{ borderRadius: '14px', padding: '18px 20px', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                                                {/* BÚSQUEDA DE PACIENTE O CÉDULA */}
                                                <div style={{ position: 'relative', flex: '1', minWidth: '260px', maxWidth: '420px' }}>
                                                    <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                                    <input
                                                        aria-label="Buscar paciente por nombre o cédula"
                                                        type="text"
                                                        placeholder="Buscar paciente por nombre o cédula..."
                                                        value={matrixSearchTerm}
                                                        onChange={(e) => handleMatrixSearch(e.target.value)}
                                                        style={{
                                                            width: '100%',
                                                            padding: '9px 12px 9px 36px',
                                                            borderRadius: '8px',
                                                            border: '1px solid #cbd5e1',
                                                            fontSize: '12px',
                                                            outline: 'none',
                                                            transition: 'all 0.2s',
                                                            background: '#f8fafc'
                                                        }}
                                                    />
                                                </div>

                                                {/* FILTRO DE FECHA */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                                        <input
                                                            aria-label="Filtrar por fecha"
                                                            type="date"
                                                            value={matrixDateFilter}
                                                            onChange={(e) => setMatrixDateFilter(e.target.value)}
                                                            title="Filtrar por fecha"
                                                            style={{
                                                                padding: '8px 12px',
                                                                borderRadius: '8px',
                                                                border: '1px solid #cbd5e1',
                                                                fontSize: '12px',
                                                                background: '#f8fafc',
                                                                color: '#334155',
                                                                cursor: 'pointer'
                                                            }}
                                                        />
                                                    </div>
                                                    {matrixDateFilter && (
                                                        <button
                                                            onClick={() => setMatrixDateFilter('')}
                                                            title="Limpiar filtro de fecha"
                                                            style={{
                                                                border: '1px solid #e2e8f0',
                                                                background: '#ffffff',
                                                                color: '#64748b',
                                                                borderRadius: '8px',
                                                                padding: '8px 12px',
                                                                fontSize: '11px',
                                                                cursor: 'pointer',
                                                                fontWeight: '600'
                                                            }}
                                                        >
                                                            Limpiar fecha
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* SUBTABS DE CATEGORÍA SI TIENE */}
                                            {meta.subtabs && meta.subtabs.length > 0 && (
                                                <div style={{ display: 'flex', gap: '6px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #f1f5f9', overflowX: 'auto' }}>
                                                    {meta.subtabs.map(tab => (
                                                        <button
                                                            key={tab.id}
                                                            onClick={() => meta.onSubtabChange(tab.id)}
                                                            style={{
                                                                padding: '6px 14px',
                                                                borderRadius: '6px',
                                                                border: 'none',
                                                                fontSize: '11.5px',
                                                                fontWeight: meta.activeSubtab === tab.id ? '700' : '500',
                                                                background: meta.activeSubtab === tab.id ? '#0f172a' : '#f1f5f9',
                                                                color: meta.activeSubtab === tab.id ? '#ffffff' : '#475569',
                                                                cursor: 'pointer',
                                                                whiteSpace: 'nowrap',
                                                                transition: 'all 0.15s'
                                                            }}
                                                        >
                                                            {tab.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </article>

                                        {/* VISOR OFICIAL DE MATRIZ EN FORMATO PDF */}
                                        <div className="document-viewer" style={{ border: '1px solid #cbd5e1', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.06)' }}>
                                            <div style={{ background: '#0f172a', color: '#ffffff', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <span style={{ background: '#e11d48', color: '#ffffff', fontSize: '11px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.5px' }}>PDF</span>
                                                    <div>
                                                        <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: '700', color: '#f8fafc', letterSpacing: '0.2px' }}>{meta.filename}</h4>
                                                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                                                            {meta.title} · {meta.count} {meta.count === 1 ? 'registro' : 'registros'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={handlePrintActiveMatrix}
                                                    className="action-button action-button--accent"
                                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', minHeight: '32px', fontSize: '11.5px', borderRadius: '8px', padding: '0 14px' }}
                                                >
                                                    <Printer size={14} /> Imprimir / Descargar Matriz
                                                </button>
                                            </div>
                                            <div style={{ background: '#334155', padding: '20px', display: 'flex', justifyContent: 'center', overflow: 'auto' }}>
                                                <iframe
                                                    ref={matrixIframeRef}
                                                    title={meta.title}
                                                    srcDoc={compileActiveMatrixHtml(false)}
                                                    style={{
                                                        width: '100%',
                                                        maxWidth: '1100px',
                                                        height: '820px',
                                                        border: 'none',
                                                        background: '#fff',
                                                        boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                                                        borderRadius: '4px'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* REGISTRO MANUAL: SOLO FORMULARIOS Y LISTA DE REGISTROS */}
                            {activeTab === 'matrices' && MATRICES[activeReportSubTab] && (
                                <article className="nurse-card span-12" style={{ borderRadius: '14px', padding: '18px 20px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                                        Registros guardados · {(matrixRows[activeReportSubTab] || []).length}
                                    </h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {activeReportSubTab === 'examenes_periodicos' && (
                                            <select
                                                aria-label="Año"
                                                value={examenesPeriodicosSelectedYear}
                                                onChange={(e) => setExamenesPeriodicosSelectedYear(e.target.value)}
                                                title="Año de la matriz"
                                                style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 700 }}
                                            >
                                                {Array.from(new Set([String(new Date().getFullYear()), ...Object.keys(examenesPeriodicosData)])).sort().reverse().map(y => (
                                                    <option key={y} value={y}>{y}</option>
                                                ))}
                                            </select>
                                        )}
                                        {matrixLoading && <Loader2 size={16} className="spin-icon" />}
                                    </div>
                                </div>
                                {(matrixRows[activeReportSubTab] || []).length === 0 ? (
                                    <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
                                        Aún no hay registros en esta matriz. Use "Nuevo registro" para agregar el primero.
                                    </p>
                                ) : (
                                    <div style={{ maxHeight: '260px', overflowY: 'auto', overflowX: 'auto', border: '1px solid #f1f5f9', borderRadius: '10px' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                                            <thead>
                                                <tr style={{ background: '#f8fafc', textAlign: 'left', color: '#475569' }}>
                                                    <th style={{ padding: '8px 12px' }}>{MATRICES[activeReportSubTab]?.noPatient ? 'Período' : 'Paciente'}</th>
                                                    <th style={{ padding: '8px 12px' }}>Detalle</th>
                                                    <th style={{ padding: '8px 12px', width: '60px' }}></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {[...(matrixRows[activeReportSubTab] || [])].reverse().map(row => (
                                                    <tr key={row.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                                                        <td style={{ padding: '8px 12px' }}>
                                                            <strong style={{ color: '#0f172a' }}>{MATRICES[activeReportSubTab].rowName ? MATRICES[activeReportSubTab].rowName(row) : row.paciente}</strong>
                                                            {row.cedula && <small style={{ display: 'block', color: '#64748b' }}>{row.cedula}</small>}
                                                        </td>
                                                        <td style={{ padding: '8px 12px', color: '#334155' }}>{MATRICES[activeReportSubTab].summary(row)}</td>
                                                        <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteMatrixRow(activeReportSubTab, row)}
                                                                title="Eliminar registro"
                                                                style={{ border: '1px solid #fecaca', background: '#fef2f2', color: '#b91c1c', borderRadius: '8px', padding: '6px 8px', cursor: 'pointer', display: 'inline-flex' }}
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </article>
                            )}

                        </div>
                    )}
                </div>
            </main>


            {/* MODAL REGISTRO FUNCIONARIO DISCAPACIDAD */}
            
            {/* --- MODAL REGISTRO GRUPOS VULNERABLES (PATOLOGÍAS) --- */}
            










            {/* MODAL GLOBAL: CONSULTA MÉDICA OCUPACIONAL (STEPPER) */}
            {isConsultaModalOpen && (
                <div className="clinical-modal show" style={{ zIndex: 1080 }}>
                    <div className="clinical-modal__backdrop" onClick={handleCancelConsulta}></div>
                    <section className="clinical-modal__dialog">
                        <header className="clinical-modal__header">
                            <div className="clinical-modal__patient">
                                <span className="clinical-modal__avatar">MO</span>
                                <div>
                                    <span>EXPEDIENTE CLÍNICO OCUPACIONAL</span>
                                    <h2>{patientSelected ? `${patientSelected.nombres} ${patientSelected.apellidos}` : 'Paciente Seleccionado'}</h2>
                                    <p>Cédula: {patientSelected?.cedula || 'N/A'} · Puesto: {patientSelected?.puestoTrabajo || 'Servidor/Docente'}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {draftLastSaved && !isOffline && (
                                    <span className="header-autosave-badge" title={`Borrador respaldado automáticamente a las ${draftLastSaved}`}>
                                        <CheckCircle size={13} color="#f87171" /> Guardado {draftLastSaved}
                                    </span>
                                )}
                                <button aria-label="Cerrar" className="clinical-modal__close" onClick={handleCancelConsulta}><X size={15} /></button>
                            </div>
                        </header>

                        <div className="clinical-modal__body">
                            <div className="anamnesis-container">
                                {/* STEPPER CLINICO */}
                                <div className="clinical-stepper">
                                    {stepsList.map((step, idx) => (
                                        <React.Fragment key={idx}>
                                            <div
                                                role="button" tabIndex={0} onKeyDown={onKeyActivate}
                                                className={`stepper-step ${consultaActiveStep === idx ? 'active' : ''} ${consultaActiveStep > idx ? 'completed' : ''}`}
                                                onClick={() => { setConsultaErrores({}); setConsultaActiveStep(idx); }}
                                            >
                                                <div className="stepper-step__circle">{idx + 1}</div>
                                                <span className="stepper-step__label">{step.label}</span>
                                            </div>
                                            {idx < stepsList.length - 1 && <div className="stepper-separator" />}
                                        </React.Fragment>
                                    ))}
                                </div>

                                {Object.keys(consultaErrores).length > 0 && (
                                    <div role="alert" style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '10px 16px', borderRadius: '10px', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', fontWeight: '600' }}>
                                        <AlertTriangle size={16} color="#dc2626" />
                                        <span>Complete los campos obligatorios marcados en rojo para continuar.</span>
                                    </div>
                                )}

                                {/* CONTENIDO DEL PASO ACTIVO */}
                                <div className="anamnesis-section-card" style={{ border: 'none', boxShadow: 'none' }}>
                                    <div className="anamnesis-section-body" style={{ padding: '0' }}>
                                        {consultaActiveStep === 0 && (
                                            <div>
                                                <h3 style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <HeartPulse size={16} /> 1. Registro de Signos Vitales
                                                </h3>
                                                <div className="clinical-fields-grid">
                                                    <label className="field">
                                                        <span>PA SISTÓLICA (MMHG) <span className="field-req-star">*</span></span>
                                                        <input type="number" step="0.1" value={vitalSigns.paSystolic} onChange={e => setVitalSigns({ ...vitalSigns, paSystolic: e.target.value })} placeholder="Ej: 120" aria-invalid={!!consultaErrores.paSystolic} />
                                                        {errorConsulta('paSystolic')}
                                                    </label>
                                                    <label className="field">
                                                        <span>PA DIASTÓLICA (MMHG) <span className="field-req-star">*</span></span>
                                                        <input type="number" step="0.1" value={vitalSigns.paDiastolic} onChange={e => setVitalSigns({ ...vitalSigns, paDiastolic: e.target.value })} placeholder="Ej: 80" aria-invalid={!!consultaErrores.paDiastolic} />
                                                        {errorConsulta('paDiastolic')}
                                                    </label>
                                                    <label className="field">
                                                        <span>FRECUENCIA CARDIACA (LPM) <span className="field-req-star">*</span></span>
                                                        <input type="number" value={vitalSigns.fc} onChange={e => setVitalSigns({ ...vitalSigns, fc: e.target.value })} placeholder="Ej: 75" aria-invalid={!!consultaErrores.fc} />
                                                        {errorConsulta('fc')}
                                                    </label>
                                                    <label className="field">
                                                        <span>FRECUENCIA RESPIRATORIA (RPM) <span className="field-req-star">*</span></span>
                                                        <input type="number" value={vitalSigns.fr} onChange={e => setVitalSigns({ ...vitalSigns, fr: e.target.value })} placeholder="Ej: 18" aria-invalid={!!consultaErrores.fr} />
                                                        {errorConsulta('fr')}
                                                    </label>
                                                    <label className="field">
                                                        <span>TEMPERATURA (°C) <span className="field-req-star">*</span></span>
                                                        <input type="number" step="0.1" value={vitalSigns.temp} onChange={e => setVitalSigns({ ...vitalSigns, temp: e.target.value })} placeholder="Ej: 36.5" aria-invalid={!!consultaErrores.temp} />
                                                        {errorConsulta('temp')}
                                                    </label>
                                                    <label className="field">
                                                        <span>TALLA (CM) <span className="field-req-star">*</span></span>
                                                        <input type="number" step="0.1" value={vitalSigns.talla} onChange={e => setVitalSigns({ ...vitalSigns, talla: e.target.value })} placeholder="Ej: 170" aria-invalid={!!consultaErrores.talla} />
                                                        {errorConsulta('talla')}
                                                    </label>
                                                    <label className="field">
                                                        <span>PESO (KG) <span className="field-req-star">*</span></span>
                                                        <input type="number" step="0.1" value={vitalSigns.peso} onChange={e => setVitalSigns({ ...vitalSigns, peso: e.target.value })} placeholder="Ej: 70" aria-invalid={!!consultaErrores.peso} />
                                                        {errorConsulta('peso')}
                                                    </label>
                                                    <label className="field">
                                                        <span>SATURACIÓN SPO2 (%) <span className="field-req-star">*</span></span>
                                                        <input type="number" value={vitalSigns.spo2} onChange={e => setVitalSigns({ ...vitalSigns, spo2: e.target.value })} placeholder="Ej: 98" aria-invalid={!!consultaErrores.spo2} />
                                                        {errorConsulta('spo2')}
                                                    </label>

                                                    <div className="premium-field-card" style={{ gridColumn: 'span 2', marginTop: '8px', padding: '14px', border: '1px solid rgba(0,32,64,0.08)' }}>
                                                        <div className="field-header" style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <div className="field-header__left" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                <span className="field-header__icon"><ShieldAlert size={14} color="var(--accent)" /></span>
                                                                <h4 id="medicoocupac-tipo-de-sangre-titulo" className="field-header__title" style={{ margin: 0, fontSize: '12px', fontWeight: 'bold' }}>Tipo de Sangre</h4>
                                                            </div>
                                                            <span className="field-badge-opt" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>OPCIONAL</span>
                                                        </div>
                                                        <select aria-labelledby="medicoocupac-tipo-de-sangre-titulo"
                                                            value={vitalSigns.tipoSangre || ''}
                                                            onChange={e => setVitalSigns({ ...vitalSigns, tipoSangre: e.target.value })}
                                                            style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid var(--border)' }}
                                                        >
                                                            <option value="">Seleccionar tipo de sangre...</option>
                                                            <option value="A+">A+</option>
                                                            <option value="A-">A-</option>
                                                            <option value="B+">B+</option>
                                                            <option value="B-">B-</option>
                                                            <option value="AB+">AB+</option>
                                                            <option value="AB-">AB-</option>
                                                            <option value="O+">O+</option>
                                                            <option value="O-">O-</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {consultaActiveStep === 1 && (
                                            <div>
                                                <h3 style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <User size={16} /> 2. Tipo de Ficha & Motivo de Consulta
                                                </h3>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                    <label className="field">
                                                        <span>Tipo de Evaluación / Ficha Médica Ocupacional</span>
                                                        <select
                                                            value={tipoFicha}
                                                            onChange={e => setTipoFicha(e.target.value)}
                                                            style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1.5px solid var(--border)', fontWeight: '600', color: '#0f172a', fontSize: '13.5px' }}
                                                        >
                                                            <option value="Ingreso">Ingreso / Preocupacional</option>
                                                            <option value="Periódico">Periódico / Control Anual</option>
                                                            <option value="Retiro">Retiro / Cese Laboral</option>
                                                            <option value="Reintegro">Reintegro / Post-Incapacidad</option>
                                                            <option value="Gestante">Gestante / Lactante</option>
                                                            <option value="Discapacidad">Cambio de Puesto / Discapacidad</option>
                                                        </select>
                                                    </label>
                                                    <label className="field">
                                                        <span>Tipo de Atención <span className="field-req-star">*</span></span>
                                                        <select
                                                            aria-label="Tipo de Atención"
                                                            value={tipoAtencion}
                                                            onChange={e => setTipoAtencion(e.target.value)}
                                                        >
                                                            <option value="primaria">Primaria (Consulta Inicial)</option>
                                                            <option value="secundaria">Subsecuente (Seguimiento)</option>
                                                        </select>
                                                        <small style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                                                            La atención primaria inicia un nuevo tratamiento en la evolución del paciente.
                                                        </small>
                                                    </label>
                                                    <label className="field">
                                                        <span>Motivo de la Atención Médica <span className="field-req-star">*</span></span>
                                                        <textarea
                                                            rows={3}
                                                            style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid var(--border)', fontFamily: 'inherit' }}
                                                            aria-invalid={!!consultaErrores.motivoConsulta}
                                                            value={motivoConsulta}
                                                            onChange={e => setMotivoConsulta(e.target.value)}
                                                            placeholder="Ej: Evaluación preocupacional, molestias osteomusculares, control de reintegro..."
                                                        />
                                                        {errorConsulta('motivoConsulta')}
                                                    </label>
                                                    <label className="field">
                                                        <span>Enfermedad o Sintomatología Actual <span className="field-req-star">*</span></span>
                                                        <textarea
                                                            rows={3}
                                                            style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid var(--border)', fontFamily: 'inherit' }}
                                                            aria-invalid={!!consultaErrores.enfermedadActual}
                                                            value={enfermedadActual}
                                                            onChange={e => setEnfermedadActual(e.target.value)}
                                                            placeholder="Detalle de síntomas, tiempo de evolución, intensidad..."
                                                        />
                                                        {errorConsulta('enfermedadActual')}
                                                    </label>
                                                </div>
                                            </div>
                                        )}

                                        {consultaActiveStep === 2 && (
                                            <div>
                                                <h3 style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Shield size={16} /> 3. Antecedentes & Factores de Riesgo Ocupacionales
                                                </h3>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                    <label className="field">
                                                        <span>Historial de Puestos de Trabajo y Exposición Anterior</span>
                                                        <textarea
                                                            rows={3}
                                                            style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid var(--border)', fontFamily: 'inherit' }}
                                                            value={antecedentesOcupacionales}
                                                            onChange={e => setAntecedentesOcupacionales(e.target.value)}
                                                            placeholder="Detalle cargos anteriores, años de servicio, riesgos conocidos..."
                                                        />
                                                    </label>
                                                    <label className="field">
                                                        <span>Examen Físico Dirigido por Sistemas <span className="field-req-star">*</span></span>
                                                        <textarea
                                                            rows={3}
                                                            style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid var(--border)', fontFamily: 'inherit' }}
                                                            aria-invalid={!!consultaErrores.examenFisico}
                                                            value={examenFisico}
                                                            onChange={e => setExamenFisico(e.target.value)}
                                                            placeholder="Hallazgos en cabeza, cuello, tórax, postura, miembros superiores e inferiores..."
                                                        />
                                                        {errorConsulta('examenFisico')}
                                                    </label>
                                                </div>
                                            </div>
                                        )}

                                        {consultaActiveStep === 3 && (
                                            <div>
                                                <h3 style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Stethoscope size={16} /> 4. Diagnóstico Médico Ocupacional (CIE-10)
                                                </h3>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                    <label className="field">
                                                        <span>Diagnóstico Principal (Código CIE-10) <span className="field-req-star">*</span></span>
                                                        <input
                                                            type="text"
                                                            aria-invalid={!!consultaErrores.diagnosticoCie}
                                                            value={diagnosticoCie}
                                                            onChange={e => setDiagnosticoCie(e.target.value)}
                                                            placeholder="Ej: M54.5 - Lumbalgia no especificada / Z57.1 - Exposición Ocupacional a Ruido"
                                                        />
                                                        {errorConsulta('diagnosticoCie')}
                                                    </label>
                                                    <label className="field">
                                                        <span>Plan de Tratamiento / Indicaciones Médicas <span className="field-req-star">*</span></span>
                                                        <textarea
                                                            rows={3}
                                                            style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid var(--border)', fontFamily: 'inherit' }}
                                                            aria-invalid={!!consultaErrores.planTratamiento}
                                                            value={planTratamiento}
                                                            onChange={e => setPlanTratamiento(e.target.value)}
                                                            placeholder="Tratamiento farmacológico, recomendaciones biomecánicas, pausas activas..."
                                                        />
                                                        {errorConsulta('planTratamiento')}
                                                    </label>
                                                </div>
                                            </div>
                                        )}

                                        {consultaActiveStep === 4 && (
                                            <div>
                                                <h3 style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <FileCheck size={16} /> 5. Dictamen de Aptitud Médica Ocupacional
                                                </h3>
                                                <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '16px' }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => setAptitudLaboral('apto')}
                                                        style={{
                                                            padding: '16px',
                                                            borderRadius: '12px',
                                                            border: aptitudLaboral === 'apto' ? '2px solid #16a34a' : '1px solid #cbd5e1',
                                                            background: aptitudLaboral === 'apto' ? '#f0fdf4' : '#fff',
                                                            cursor: 'pointer',
                                                            textAlign: 'center'
                                                        }}
                                                    >
                                                        <CheckCircle size={26} color="#16a34a" style={{ marginBottom: '6px' }} />
                                                        <strong style={{ display: 'block', color: '#166534', fontSize: '14px' }}>APTO</strong>
                                                        <span style={{ fontSize: '11px', color: '#475569' }}>Sin restricciones para el puesto</span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => setAptitudLaboral('apto_restriccion')}
                                                        style={{
                                                            padding: '16px',
                                                            borderRadius: '12px',
                                                            border: aptitudLaboral === 'apto_restriccion' ? '2px solid #d97706' : '1px solid #cbd5e1',
                                                            background: aptitudLaboral === 'apto_restriccion' ? '#fffbeb' : '#fff',
                                                            cursor: 'pointer',
                                                            textAlign: 'center'
                                                        }}
                                                    >
                                                        <AlertTriangle size={26} color="#d97706" style={{ marginBottom: '6px' }} />
                                                        <strong style={{ display: 'block', color: '#92400e', fontSize: '14px' }}>APTO CON RESTRICCIÓN</strong>
                                                        <span style={{ fontSize: '11px', color: '#475569' }}>Requiere adaptaciones/limitaciones</span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => setAptitudLaboral('no_apto')}
                                                        style={{
                                                            padding: '16px',
                                                            borderRadius: '12px',
                                                            border: aptitudLaboral === 'no_apto' ? '2px solid #dc2626' : '1px solid #cbd5e1',
                                                            background: aptitudLaboral === 'no_apto' ? '#fef2f2' : '#fff',
                                                            cursor: 'pointer',
                                                            textAlign: 'center'
                                                        }}
                                                    >
                                                        <AlertOctagon size={26} color="#dc2626" style={{ marginBottom: '6px' }} />
                                                        <strong style={{ display: 'block', color: '#991b1b', fontSize: '14px' }}>NO APTO</strong>
                                                        <span style={{ fontSize: '11px', color: '#475569' }}>Incapacidad para el puesto actual</span>
                                                    </button>
                                                </div>

                                                {aptitudLaboral === 'apto_restriccion' && (
                                                    <label className="field">
                                                        <span>Detalle de Restricciones & Adaptaciones del Puesto <span className="field-req-star">*</span></span>
                                                        <textarea
                                                            rows={3}
                                                            style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid var(--border)', fontFamily: 'inherit' }}
                                                            aria-invalid={!!consultaErrores.restriccionesOcupacionales}
                                                            value={restriccionesOcupacionales}
                                                            onChange={e => setRestriccionesOcupacionales(e.target.value)}
                                                            placeholder="Ej: No levantar cargas mayores a 10kg, realizar pausas activas de 5 min por hora..."
                                                        />
                                                        {errorConsulta('restriccionesOcupacionales')}
                                                    </label>
                                                )}
                                            </div>
                                        )}

                                        {consultaActiveStep === 5 && (
                                            <div>
                                                <h3 style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: '700', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Pill size={16} /> 7. Prescripción Médica y Recetario
                                                </h3>
                                                <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                                                    Prescribe medicamentos desde el inventario de Farmacia para la atención de este trabajador.
                                                </p>

                                                {/* BUSCADOR DE PRODUCTOS DE FARMACIA */}
                                                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                                                    <label style={{ fontSize: '12.5px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '6px' }}>
                                                        <Search size={15} color="var(--primary)" /> Buscar Medicamento en Catálogo de Farmacia
                                                    </label>
                                                    <div style={{ position: 'relative' }}>
                                                        <input
                                                            aria-label="Buscar Medicamento en Catálogo de Farmacia"
                                                            type="text"
                                                            value={farmaciaSearchQuery}
                                                            onChange={(e) => handleSearchFarmacia(e.target.value)}
                                                            placeholder="Escriba el nombre o código del producto en inventario (ej: Paracetamol, Ibuprofeno, Amoxicilina)..."
                                                            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', background: '#ffffff' }}
                                                        />
                                                        {farmaciaSearchLoading && (
                                                            <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', color: '#64748b' }}>Buscando...</span>
                                                        )}
                                                        {farmaciaSearchResults.length > 0 && (
                                                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', zIndex: 100, maxHeight: '200px', overflowY: 'auto', marginTop: '4px' }}>
                                                                {farmaciaSearchResults.map((prod) => (
                                                                    <div
                                                                        role="button" tabIndex={0} onKeyDown={onKeyActivate}
                                                                        key={prod.id}
                                                                        onClick={() => handleSelectFarmaciaProduct(prod)}
                                                                        style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px' }}
                                                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                                                                        onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                                                                    >
                                                                        <div>
                                                                            <strong style={{ color: '#0f172a' }}>{prod.nombre}</strong>
                                                                            <small style={{ display: 'block', color: '#64748b', fontSize: '11px' }}>
                                                                                Código: {prod.codigo} | Presentación: {prod.presentacion?.nombre || 'N/A'}
                                                                            </small>
                                                                        </div>
                                                                        <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                                                                            Stock: {prod.stock_cajas} cj / {prod.stock_unidades} ud
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* FORMULARIO DE DETALLE DEL MEDICAMENTO */}
                                                <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '20px' }}>
                                                    <h4 style={{ margin: '0 0 12px 0', fontSize: '13.5px', color: '#334155', fontWeight: '700' }}>Configurar Medicamento</h4>
                                                    <div className="clinical-fields-grid responsive-grid" style={{ gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
                                                        <div className="field" style={{ margin: 0 }}>
                                                            <span>Medicamento Prescrito <span className="field-req-star">*</span></span>
                                                            <input
                                                                aria-label="Medicamento Prescrito"
                                                                type="text"
                                                                value={prescripcionForm.detalle_medicamento}
                                                                onChange={(e) => setPrescripcionForm({ ...prescripcionForm, detalle_medicamento: e.target.value })}
                                                                placeholder="Ej: Amoxicilina 500mg"
                                                            />
                                                        </div>
                                                        <div className="field" style={{ margin: 0 }}>
                                                            <span>Dosis <span className="field-req-star">*</span></span>
                                                            <input
                                                                aria-label="Dosis"
                                                                type="text"
                                                                value={prescripcionForm.dosis}
                                                                onChange={(e) => setPrescripcionForm({ ...prescripcionForm, dosis: e.target.value })}
                                                                placeholder="Ej: 1 cápsula"
                                                            />
                                                        </div>
                                                        <div className="field" style={{ margin: 0 }}>
                                                            <span>Vía de Adm. <span className="field-req-star">*</span></span>
                                                            <select
                                                                aria-label="Vía de Adm."
                                                                value={prescripcionForm.via}
                                                                disabled={!!viaFarmacia}
                                                                onChange={(e) => setPrescripcionForm({ ...prescripcionForm, via: e.target.value })}
                                                            >
                                                                {VIAS_ADMINISTRACION.map(v => <option key={v} value={v}>{v}</option>)}
                                                            </select>
                                                            {viaFarmacia && <small style={{ display: 'block', marginTop: '4px', fontSize: '11px', color: '#64748b' }}>Registrada por Farmacia</small>}
                                                        </div>
                                                    </div>

                                                    {/* Sin "Cant. Cajas": la cantidad de cajas la define Farmacia al despachar */}
                                                    <div className="clinical-fields-grid responsive-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '12px' }}>
                                                        <div className="field" style={{ margin: 0 }}>
                                                            <span>Cada (Horas) <span className="field-req-star">*</span></span>
                                                            <input
                                                                aria-label="Cada (Horas)"
                                                                type="number"
                                                                min="1"
                                                                value={prescripcionForm.frecuencia}
                                                                onChange={(e) => setPrescripcionForm({ ...prescripcionForm, frecuencia: e.target.value })}
                                                            />
                                                        </div>
                                                        <div className="field" style={{ margin: 0 }}>
                                                            <span>Durante (Días) <span className="field-req-star">*</span></span>
                                                            <input
                                                                aria-label="Durante (Días)"
                                                                type="number"
                                                                min="1"
                                                                value={prescripcionForm.duracion}
                                                                onChange={(e) => setPrescripcionForm({ ...prescripcionForm, duracion: e.target.value })}
                                                            />
                                                        </div>
                                                        <div className="field" style={{ margin: 0 }}>
                                                            <span>Cant. Unidades</span>
                                                            <input
                                                                aria-label="Cant. Unidades"
                                                                type="number"
                                                                min="0"
                                                                value={prescripcionForm.cantidad_unidades}
                                                                onChange={(e) => setPrescripcionForm({ ...prescripcionForm, cantidad_unidades: e.target.value })}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div style={{ marginTop: '12px' }}>
                                                        <div className="field" style={{ margin: 0 }}>
                                                            <span>Indicaciones Adicionales / Observaciones</span>
                                                            <input
                                                                aria-label="Indicaciones Adicionales / Observaciones"
                                                                type="text"
                                                                value={prescripcionForm.observaciones}
                                                                onChange={(e) => setPrescripcionForm({ ...prescripcionForm, observaciones: e.target.value })}
                                                                placeholder="Ej: Tomar después de las comidas..."
                                                            />
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        className="action-button action-button--primary"
                                                        onClick={handleAddPrescripcionLine}
                                                        style={{ marginTop: '14px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                                    >
                                                        <Plus size={16} /> Agregar a la Receta
                                                    </button>
                                                </div>

                                                {/* LISTADO DE MEDICAMENTOS EN LA RECETA */}
                                                <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '16px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                        <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <Pill size={16} color="var(--primary)" /> Medicamentos Prescritos
                                                        </h4>
                                                        <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '3px 10px', borderRadius: '12px', fontWeight: '700', border: '1px solid #bae6fd' }}>
                                                            {prescripcionesList.length} medicamento(s)
                                                        </span>
                                                    </div>

                                                    {prescripcionesList.length === 0 ? (
                                                        <div style={{ textAlign: 'center', padding: '22px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1', color: '#475569', fontSize: '12px' }}>
                                                            <Pill size={22} color="#94a3b8" style={{ marginBottom: '6px', display: 'block', margin: '0 auto 6px' }} />
                                                            No ha agregado medicamentos a la receta. Use el buscador o el formulario para añadir prescripciones.
                                                        </div>
                                                    ) : (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                            {prescripcionesList.map((item, idx) => (
                                                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                                                    <div>
                                                                        <strong style={{ color: '#0f172a', fontSize: '13px', display: 'block' }}>{item.detalle_medicamento}</strong>
                                                                        <span style={{ fontSize: '11.5px', color: '#475569' }}>
                                                                            {item.dosis} · Cada {item.frecuencia} horas por {item.duracion} días ({item.via})
                                                                        </span>
                                                                        {item.observaciones && (
                                                                            <small style={{ display: 'block', color: '#64748b', fontSize: '11px', marginTop: '2px' }}>
                                                                                {item.observaciones}
                                                                            </small>
                                                                        )}
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemovePrescripcionLine(idx)}
                                                                        style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#d52525', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '600', flexShrink: 0 }}
                                                                    >
                                                                        <Trash2 size={13} /> Quitar
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {consultaActiveStep === 6 && (
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                                                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--primary-soft, #eff6ff)', color: 'var(--primary, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <BarChart3 size={22} />
                                                    </div>
                                                    <div>
                                                        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--primary)' }}>Punto 7: Histograma y Análisis de Signos Vitales</h3>
                                                        <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>Filtra y visualiza la distribución de frecuencia gráfica y tendencia del trabajador.</p>
                                                    </div>
                                                </div>

                                                <VitalSignsHistogram patient={patientSelected} isInline={true} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FOOTER DE PASOS (mismo diseño que Psicología, Medicina General y Odontología) */}
                        <footer className="clinical-modal__actions" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)' }}>
                            <button
                                type="button"
                                disabled={consultaActiveStep === 0}
                                onClick={() => { setConsultaErrores({}); setConsultaActiveStep(prev => prev - 1); }}
                                className="action-button action-button--light"
                            >
                                Atrás
                            </button>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="button" className="action-button action-button--danger" onClick={handleCancelConsulta}>
                                    Cancelar
                                </button>
                                {consultaActiveStep < stepsList.length - 1 ? (
                                    <button
                                        type="button"
                                        onClick={handleSiguientePasoConsulta}
                                        className="action-button action-button--primary"
                                    >
                                        Siguiente
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!validarConsultaCompleta()) return;
                                            // Contenido clínico de la ficha: solo lo registrado en esta atención (la identificación
                                            // del trabajador se toma de su perfil al consultar la ficha en Reportes)
                                            const hoy = localDateStr();
                                            const tallaM = parseFloat(vitalSigns.talla) > 3 ? parseFloat(vitalSigns.talla) / 100 : parseFloat(vitalSigns.talla);
                                            const imc = parseFloat(vitalSigns.peso) && tallaM ? (parseFloat(vitalSigns.peso) / (tallaM * tallaM)).toFixed(2) : '';
                                            const [cieCodigo, ...cieDesc] = diagnosticoCie.split('-');
                                            const aptitud = { apto: 'Apto', apto_restriccion: 'Apto con Restricción', no_apto: 'No Apto' }[aptitudLaboral];
                                            const contenidoFicha = {
                                                tipoAtencion,
                                                motivoConsulta,
                                                enfermedadActual,
                                                antecedentesPersonales,
                                                antecedentesOcupacionales,
                                                factoresRiesgo,
                                                examenFisico: { normal: examenFisico.toLowerCase().includes('normal'), descripcion: examenFisico },
                                                vitalSigns: { ...vitalSigns },
                                                constantes: {
                                                    pa: `${vitalSigns.paSystolic}/${vitalSigns.paDiastolic}`,
                                                    temp: vitalSigns.temp,
                                                    fc: vitalSigns.fc,
                                                    satO2: vitalSigns.spo2,
                                                    fr: vitalSigns.fr,
                                                    peso: vitalSigns.peso,
                                                    talla: tallaM ? tallaM.toFixed(2) : '',
                                                    imc,
                                                    perimetroAbd: ''
                                                },
                                                diagnosticoCie,
                                                diagnosticos: [{
                                                    num: 1,
                                                    desc: (cieDesc.length ? cieDesc.join('-') : diagnosticoCie).trim().toUpperCase(),
                                                    cie: cieDesc.length ? cieCodigo.trim().toUpperCase() : '',
                                                    pre: false,
                                                    def: true
                                                }],
                                                aptitud,
                                                aptitudLaboral,
                                                restriccionesOcupacionales,
                                                aptitudDetalle: {
                                                    apto: aptitudLaboral === 'apto',
                                                    aptoObservacion: aptitudLaboral === 'apto_restriccion',
                                                    aptoLimitaciones: aptitudLaboral === 'apto_restriccion',
                                                    noApto: aptitudLaboral === 'no_apto',
                                                    observacion: restriccionesOcupacionales,
                                                    limitacion: restriccionesOcupacionales
                                                },
                                                planTratamiento,
                                                prescripcionesList: [...prescripcionesList],
                                                recomendaciones: [
                                                    planTratamiento.toUpperCase(),
                                                    ...prescripcionesList.map(p => `TRATAMIENTO: ${p.detalle_medicamento} (${p.dosis}, cada ${p.frecuencia}h x ${p.duracion} días)`)
                                                ],
                                                profesional: {
                                                    fecha: hoy,
                                                    hora: new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }),
                                                    nombre: user?.name || '',
                                                    codigo: user?.numero_cedula || ''
                                                },
                                                ...(tipoFicha === 'Retiro' && {
                                                    fechaRetiro: hoy,
                                                    causaRetiro: motivoConsulta,
                                                    condSalida: {
                                                        satisfactorio: aptitudLaboral === 'apto',
                                                        conPatologiaComun: aptitudLaboral === 'apto_restriccion',
                                                        conSecuelaLaboral: aptitudLaboral === 'no_apto',
                                                        observacion: restriccionesOcupacionales,
                                                        recomendacionLegal: ''
                                                    }
                                                }),
                                                ...(tipoFicha === 'Reintegro' && { fechaReintegro: hoy, causaSalida: motivoConsulta }),
                                                ...(tipoFicha !== 'Retiro' && tipoFicha !== 'Reintegro' && { fechaIngreso: hoy })
                                            };

                                            // Ficha completa en el servidor: es la que se consulta e imprime en Reportes
                                            api.post('/medicina-ocupacional/fichas', {
                                                id_usuario_paciente: patientSelected.id,
                                                tipo: TIPO_FICHA_CLAVE[tipoFicha],
                                                fecha: hoy,
                                                contenido: contenidoFicha
                                            }).then(() => fetchFichasBackend()).catch((err) => {
                                                alert(`La ficha NO se guardó: ${err.response?.data?.message || 'No se pudo conectar con el servidor.'}`);
                                            });

                                            // Persistencia al backend si el paciente está registrado
                                            if (patientSelected?.id) {
                                                // Solo los signos vitales que el médico registró (sin valores inventados);
                                                // la talla se registra en centímetros, igual que en Enfermería
                                                const num = (v, parse = parseFloat) => {
                                                    const n = parse(v);
                                                    return Number.isFinite(n) ? n : null;
                                                };
                                                const signos = {
                                                    presion_arterial_sistolica: num(vitalSigns.paSystolic),
                                                    presion_arterial_diastolica: num(vitalSigns.paDiastolic),
                                                    frecuencia_cardiaca: num(vitalSigns.fc, v => parseInt(v, 10)),
                                                    frecuencia_respiratoria: num(vitalSigns.fr, v => parseInt(v, 10)),
                                                    temperatura: num(vitalSigns.temp),
                                                    peso: num(vitalSigns.peso),
                                                    talla: num(vitalSigns.talla)
                                                };
                                                if (Object.values(signos).some(v => v !== null)) {
                                                    api.post('/medicina-general/signos-vitales', {
                                                        id_usuario_paciente: patientSelected.id,
                                                        ...signos,
                                                        fecha: localDateStr()
                                                    }).catch(err => {
                                                        alert(err.response?.data?.message || 'No se pudieron guardar los signos vitales del trabajador.');
                                                    });
                                                }

                                                if (diagnosticoCie) {
                                                    api.post('/medicina-general/diagnosticos', {
                                                        id_usuario_paciente: patientSelected.id,
                                                        detalle_diagnostico: diagnosticoCie,
                                                        cie10: diagnosticoCie.includes('-') ? diagnosticoCie.split('-')[0].trim() : 'Z00.0',
                                                        presuntivo: false,
                                                        definitivo: true
                                                    }).catch(() => {});
                                                }

                                                if (tipoFicha === 'Ingreso' || tipoFicha === 'Periódico') {
                                                    api.post('/medicina-ocupacional/personal-nuevo', {
                                                        id_usuario_paciente: patientSelected.id,
                                                        fecha_ingreso: localDateStr()
                                                    }).catch(() => {});
                                                } else if (tipoFicha === 'Retiro') {
                                                    api.post('/medicina-ocupacional/cese-funciones', {
                                                        id_usuario_paciente: patientSelected.id,
                                                        fecha_salida: localDateStr(),
                                                        detalle_motivo_salida: motivoConsulta
                                                    }).catch(() => {});
                                                }

                                                api.post('/medicina-general/parte-diario', {
                                                    id_usuario_paciente: patientSelected.id,
                                                    fecha: localDateStr(),
                                                    tipo_atencion: tipoAtencion,
                                                    tipo: prescripcionesList.length > 0 ? 'curativo' : 'preventivo',
                                                    detalle_diagnostico: diagnosticoCie || `Evaluación ocupacional (${tipoFicha})`
                                                }).then(() => {
                                                    fetchParteDiario();
                                                    fetchCitas(); // la cita agendada de hoy queda completada
                                                }).catch((err) => {
                                                    console.error('Error al registrar parte diario:', err);
                                                    const msg = err.response?.data?.message || 'No se pudo conectar con el servidor.';
                                                    alert(`La atención NO se registró en el Parte Diario ni en Citas: ${msg}`);
                                                });

                                                if (vitalSigns.tipoSangre) {
                                                    api.post(`/medicina-ocupacional/patient/${patientSelected.id}/blood-type`, {
                                                        blood_type: vitalSigns.tipoSangre
                                                    }).catch(() => {});
                                                }
                                            }

                                            // Receta en el servidor: el Recetario la lee de ahí y Farmacia despacha
                                            // solo los medicamentos del inventario (los de compra externa van sin producto)
                                            if (prescripcionesList.length > 0) {
                                                api.post('/medicina-ocupacional/recetas-ocupacionales', {
                                                    id_usuario_paciente: patientSelected.id,
                                                    fecha: localDateStr(),
                                                    cie: diagnosticoCie,
                                                    lineas: prescripcionesList.map(p => ({
                                                        detalle_medicamento: p.detalle_medicamento,
                                                        detalle_dosis: p.dosis,
                                                        frecuencia_horas: parseInt(p.frecuencia, 10),
                                                        duracion_tratamiento_dias: parseInt(p.duracion, 10),
                                                        detalle_via_administracion: p.via,
                                                        id_producto_farmacia: p.disponible_farmacia === 'farmacia' ? p.id_producto_farmacia : null,
                                                        cantidad_cajas: parseInt(p.cantidad_cajas, 10) || 0,
                                                        cantidad_unidades: parseInt(p.cantidad_unidades, 10) || 0
                                                    }))
                                                }).then(() => fetchRecetasOcupacionales()).catch((err) => {
                                                    const data = err.response?.data;
                                                    const detalle = data?.errors ? Object.values(data.errors)[0]?.[0] : data?.message;
                                                    alert(`La receta NO se guardó: ${detalle || 'No se pudo conectar con el servidor.'}`);
                                                });
                                            }

                                            alert(`¡Atención Médica Ocupacional registrada exitosamente! Ficha (${tipoFicha}) emitida${prescripcionesList.length > 0 ? ' y receta enviada al Recetario' : ''}.`);
                                            setIsConsultaModalOpen(false);
                                        }}
                                        className="action-button action-button--success"
                                    >
                                        Finalizar y emitir ficha
                                    </button>
                                )}
                            </div>
                        </footer>
                    </section>
                </div>
            )}

            {/* MODAL NUEVO REGISTRO DE MATRIZ */}
            {matrixModalKey && (
                <MatrizRegistroModal
                    matrizKey={matrixModalKey}
                    today={todayStr}
                    onClose={() => setMatrixModalKey(null)}
                    onSaved={() => {
                        const key = matrixModalKey;
                        setMatrixModalKey(null);
                        showSystemToast('Registro guardado en la matriz.');
                        fetchMatrix(key);
                    }}
                />
            )}

            {/* MODAL HISTOGRAMA DE SIGNOS VITALES */}
            {isHistogramModalOpen && (
                <VitalSignsHistogram
                    isOpen={isHistogramModalOpen}
                    onClose={() => setIsHistogramModalOpen(false)}
                />
            )}

            {/* MODAL BUSCAR PACIENTE */}
            {isPatientSearchOpen && (
                <div className="clinical-modal show">
                    <div className="clinical-modal__backdrop" onClick={() => setIsPatientSearchOpen(false)}></div>
                    <div className="clinical-modal__dialog clinical-modal__dialog--compact" style={{ maxWidth: '560px' }}>
                        <header className="clinical-modal__header">
                            <div className="clinical-modal__patient">
                                <div className="clinical-modal__avatar"><Search size={18} /></div>
                                <div>
                                    <span style={{ textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>BUSCADOR CLÍNICO</span>
                                    <h2>Buscar Paciente por Cédula</h2>
                                </div>
                            </div>
                            <button aria-label="Cerrar" className="clinical-modal__close" onClick={() => setIsPatientSearchOpen(false)}><X size={16} /></button>
                        </header>

                        <div className="clinical-modal__body">
                            <form onSubmit={(e) => { e.preventDefault(); handleSearchPatient(searchTerm); }} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
                                <div className="patient-search-input" style={{ flex: 1, margin: 0 }}>
                                    <Search size={16} />
                                    <input
                                        aria-label="Ingrese número de cédula o nombre del paciente"
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => handleSearchPatient(e.target.value)}
                                        placeholder="Ingrese número de cédula o nombre del paciente..."
                                        autoFocus
                                    />
                                </div>
                                <button className="action-button action-button--accent" type="submit" style={{ minHeight: '44px', borderRadius: '10px', padding: '0 20px', whiteSpace: 'nowrap' }}>
                                    Buscar
                                </button>
                            </form>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto' }}>
                                {searchResults.length === 0 ? (
                                    <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', margin: '20px 0' }}>
                                        No se encontraron pacientes. Intente con otro término o registre un nuevo paciente.
                                    </p>
                                ) : (
                                    searchResults.map((p) => (
                                        <div
                                            role="button" tabIndex={0} onKeyDown={onKeyActivate}
                                            key={p.id || p.cedula}
                                            className="patient-suggestion"
                                            style={{ gridTemplateColumns: 'auto 1fr auto', display: 'grid', alignItems: 'center', cursor: 'pointer', padding: '12px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}
                                            onClick={() => selectPatient(p)}
                                        >
                                            <div className="patient-suggestion__avatar" style={{ background: '#e0f2fe', color: '#0369a1', fontWeight: '700' }}>
                                                {(p.nombres || '').charAt(0)}{(p.apellidos || '').charAt(0)}
                                            </div>
                                            <div className="patient-suggestion__identity">
                                                <strong style={{ color: '#0f172a', fontSize: '13.5px' }}>{p.nombres} {p.apellidos}</strong>
                                                <small style={{ color: '#64748b', fontSize: '11.5px' }}>Cédula: {p.cedula} · {p.puestoTrabajo || 'Servidor/Docente'}</small>
                                            </div>
                                            <button className="action-button action-button--primary" onClick={() => selectPatient(p)} style={{ fontSize: '11.5px', padding: '6px 12px' }}>
                                                Seleccionar <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL REGISTRAR NUEVO PACIENTE (IGUAL A MÉDICO GENERAL) */}
            {isPatientRegisterOpen && (
                <div className="clinical-modal show">
                    <div className="clinical-modal__backdrop" onClick={handleCancelPatientRegisterModal}></div>
                    <div className="clinical-modal__dialog clinical-modal__dialog--compact">
                        <header className="clinical-modal__header">
                            <div className="clinical-modal__patient">
                                <span className="clinical-modal__avatar"><UserPlus size={18} /></span>
                                <div>
                                    <span style={{ textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>REGISTRO DE USUARIO</span>
                                    <h2>Nuevo Paciente</h2>
                                </div>
                            </div>
                            <button aria-label="Cerrar" className="clinical-modal__close" type="button" onClick={handleCancelPatientRegisterModal}><X size={15} /></button>
                        </header>
                        <form onSubmit={handleSavePatientRegister} className="clinical-modal__body">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {/* Nombres y Apellidos Completos */}
                                <div className="premium-field-card">
                                    <div className="field-header">
                                        <div className="field-header__left">
                                            <span className="field-header__icon"><User size={15} /></span>
                                            <h4 id="medicoocupac-nombres-y-apellidos-completos-titulo" className="field-header__title">Nombres y Apellidos Completos</h4>
                                        </div>
                                        <span className="field-badge-req">Requerido</span>
                                    </div>
                                    <input aria-labelledby="medicoocupac-nombres-y-apellidos-completos-titulo"
                                        value={newPatientForm.nombre_completo || ''}
                                        onChange={(e) => setNewPatientForm({ ...newPatientForm, nombre_completo: e.target.value })}
                                        placeholder="Ingrese nombres y apellidos de acuerdo a la cédula o pasaporte"
                                        required
                                        style={{ border: !newPatientForm.nombre_completo ? '1.5px solid #b71a34' : '1.5px solid var(--border)' }}
                                    />
                                </div>

                                {/* Tipo de Documento y Número de Documento */}
                                <div className="clinical-fields-grid">
                                    <div className="premium-field-card">
                                        <div className="field-header">
                                            <div className="field-header__left">
                                                <span className="field-header__icon"><FileText size={15} /></span>
                                                <h4 id="medicoocupac-tipo-de-documento-titulo" className="field-header__title">Tipo de Documento</h4>
                                            </div>
                                            <span className="field-badge-req">Requerido</span>
                                        </div>
                                        <select aria-labelledby="medicoocupac-tipo-de-documento-titulo"
                                            value={newPatientForm.tipo_documento || 'cedula'}
                                            onChange={(e) => setNewPatientForm({ ...newPatientForm, tipo_documento: e.target.value, cedula: '', pais_origen: '' })}
                                            required
                                        >
                                            <option value="cedula">Cédula de Identidad</option>
                                            <option value="pasaporte">Pasaporte Extranjero</option>
                                        </select>
                                    </div>

                                    <div className="premium-field-card">
                                        <div className="field-header">
                                            <div className="field-header__left">
                                                <span className="field-header__icon"><FileText size={15} /></span>
                                                <h4 className="field-header__title">
                                                    {newPatientForm.tipo_documento === 'pasaporte' ? 'Número de Pasaporte' : 'Número de Cédula'}
                                                </h4>
                                            </div>
                                            <span className="field-badge-req">Requerido</span>
                                        </div>
                                        <input
                                            aria-label={newPatientForm.tipo_documento === 'pasaporte' ? 'Número de Pasaporte' : 'Número de Cédula'}
                                            value={newPatientForm.cedula || ''}
                                            onChange={(e) => setNewPatientForm({ ...newPatientForm, cedula: e.target.value })}
                                            placeholder={newPatientForm.tipo_documento === 'pasaporte' ? 'Ej. AB123456' : 'Ej. 0201234567'}
                                            required
                                            style={{ border: !newPatientForm.cedula ? '1.5px solid #b71a34' : '1.5px solid var(--border)' }}
                                        />
                                    </div>
                                </div>

                                {/* Tipo de Paciente y País de Origen */}
                                <div className="clinical-fields-grid">

                                    {newPatientForm.tipo_documento === 'pasaporte' && (
                                        <div className="premium-field-card">
                                            <div className="field-header">
                                                <div className="field-header__left">
                                                    <span className="field-header__icon"><MapPin size={15} /></span>
                                                    <h4 id="medicoocupac-pais-de-origen-titulo" className="field-header__title">País de Origen</h4>
                                                </div>
                                                <span className="field-badge-req">Requerido</span>
                                            </div>
                                            <select aria-labelledby="medicoocupac-pais-de-origen-titulo"
                                                value={newPatientForm.pais_origen || ''}
                                                onChange={(e) => setNewPatientForm({ ...newPatientForm, pais_origen: e.target.value })}
                                                required
                                            >
                                                <option value="">-- Seleccione un país --</option>
                                                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    )}
                                </div>

                                {/* Correo Electrónico Institucional */}
                                <div className="premium-field-card">
                                    <div className="field-header">
                                        <div className="field-header__left">
                                            <span className="field-header__icon"><Mail size={15} /></span>
                                            <h4 className="field-header__title">Correo Electrónico Institucional</h4>
                                        </div>
                                        <span className="field-badge-req">Requerido</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', border: !newPatientForm.correo ? '1.5px solid #b71a34' : '1.5px solid var(--border)', borderRadius: '12px', padding: '0 16px', background: '#ffffff', minHeight: '46px', boxSizing: 'border-box' }}>
                                        <input
                                            aria-label="nombre.apellido"
                                            type="text"
                                            value={newPatientForm.correo || ''}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/@.*/, '').trim();
                                                setNewPatientForm({ ...newPatientForm, correo: val });
                                            }}
                                            placeholder="nombre.apellido"
                                            required
                                            style={{
                                                border: 'none',
                                                outline: 'none',
                                                background: 'transparent',
                                                fontSize: '12.5px',
                                                fontFamily: 'inherit',
                                                fontWeight: 500,
                                                color: 'var(--text-primary)',
                                                flex: 1,
                                                padding: '0',
                                                margin: '0',
                                                height: '100%',
                                                minHeight: 'unset',
                                                boxShadow: 'none'
                                            }}
                                        />
                                        <span style={{ color: 'var(--text-muted)', fontSize: '12.5px', fontWeight: 600, paddingLeft: '14px', borderLeft: '1.5px solid var(--border)', userSelect: 'none', whiteSpace: 'nowrap' }}>
                                            @ueb.edu.ec
                                        </span>
                                    </div>
                                </div>

                                {/* Banner informativo */}
                                <div style={{ padding: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Info size={18} style={{ color: '#b71a34', flexShrink: 0 }} />
                                    <span style={{ fontSize: '12px', color: '#475467', lineHeight: 1.4 }}>
                                        Al registrar al paciente, el sistema generará automáticamente una <strong>contraseña temporal</strong> y la enviará de inmediato a su correo institucional. El paciente deberá cambiarla obligatoriamente al iniciar sesión.
                                    </span>
                                </div>
                            </div>

                            {registerError && (
                                <div role="alert" style={{ marginTop: '15px', color: '#b71a34', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <AlertTriangle size={14} /> {registerError}
                                </div>
                            )}

                            <footer className="clinical-modal__actions" style={{ marginTop: '20px' }}>
                                <button className="action-button action-button--light" type="button" onClick={handleCancelPatientRegisterModal}>Cancelar</button>
                                <button className="action-button action-button--accent" type="submit" disabled={registerLoading}>
                                    {registerLoading ? 'Registrando...' : 'Registrar paciente'}
                                </button>
                            </footer>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL REGISTRAR REINTEGRO */}
            {isReintegroModalOpen && (
                <div className="clinical-modal show">
                    <div className="clinical-modal__backdrop" onClick={() => setIsReintegroModalOpen(false)}></div>
                    <div className="clinical-modal__dialog clinical-modal__dialog--compact" style={{ maxWidth: '680px' }}>
                        <header className="clinical-modal__header">
                            <div className="clinical-modal__patient">
                                <span className="clinical-modal__avatar"><RefreshCw size={18} /></span>
                                <div>
                                    <span>Gestión de incapacidades</span>
                                    <h2>Registrar Reintegro Laboral</h2>
                                </div>
                            </div>
                            <button aria-label="Cerrar" className="clinical-modal__close" onClick={() => setIsReintegroModalOpen(false)}><X size={16} /></button>
                        </header>

                        <form onSubmit={handleSaveReintegro} className="clinical-modal__body">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div className="clinical-fields-grid">
                                    <div className="premium-field-card">
                                        <div className="field-header">
                                            <div className="field-header__left">
                                                <span className="field-header__icon"><FileText size={15} /></span>
                                                <h4 id="medicoocupac-cedula-trabajador-titulo" className="field-header__title">Cédula Trabajador</h4>
                                            </div>
                                            <span className="field-badge-req">Requerido</span>
                                        </div>
                                        <input aria-labelledby="medicoocupac-cedula-trabajador-titulo" type="text" required value={reintegroForm.pacienteCedula} onChange={e => setReintegroForm({ ...reintegroForm, pacienteCedula: e.target.value })} placeholder="1723456789" />
                                    </div>

                                    <div className="premium-field-card">
                                        <div className="field-header">
                                            <div className="field-header__left">
                                                <span className="field-header__icon"><User size={15} /></span>
                                                <h4 className="field-header__title">Nombre Trabajador</h4>
                                            </div>
                                            <span className="field-badge-req">Requerido</span>
                                        </div>
                                        <input aria-label="Nombre completo" type="text" required value={reintegroForm.pacienteNombre} onChange={e => setReintegroForm({ ...reintegroForm, pacienteNombre: e.target.value })} placeholder="Nombre completo" />
                                    </div>
                                </div>

                                <div className="clinical-fields-grid">
                                    <div className="premium-field-card">
                                        <div className="field-header">
                                            <div className="field-header__left">
                                                <span className="field-header__icon"><Briefcase size={15} /></span>
                                                <h4 id="medicoocupac-puesto-de-trabajo-titulo" className="field-header__title">Puesto de Trabajo</h4>
                                            </div>
                                            <span className="field-badge-req">Requerido</span>
                                        </div>
                                        <input aria-labelledby="medicoocupac-puesto-de-trabajo-titulo" type="text" required value={reintegroForm.puesto} onChange={e => setReintegroForm({ ...reintegroForm, puesto: e.target.value })} placeholder="Ej: Operario de Bodega" />
                                    </div>

                                    <div className="premium-field-card">
                                        <div className="field-header">
                                            <div className="field-header__left">
                                                <span className="field-header__icon"><Clock size={15} /></span>
                                                <h4 id="medicoocupac-dias-de-incapacidad-titulo" className="field-header__title">Días de Incapacidad</h4>
                                            </div>
                                            <span className="field-badge-req">Requerido</span>
                                        </div>
                                        <input aria-labelledby="medicoocupac-dias-de-incapacidad-titulo" type="number" required value={reintegroForm.diasIncapacidad} onChange={e => setReintegroForm({ ...reintegroForm, diasIncapacidad: e.target.value })} placeholder="15" />
                                    </div>
                                </div>

                                <div className="premium-field-card">
                                    <div className="field-header">
                                        <div className="field-header__left">
                                            <span className="field-header__icon"><Stethoscope size={15} /></span>
                                            <h4 id="medicoocupac-diagnostico-origen-iess-certificado-medi-titulo" className="field-header__title">Diagnóstico Origen (IESS / Certificado Médico)</h4>
                                        </div>
                                        <span className="field-badge-req">Requerido</span>
                                    </div>
                                    <input aria-labelledby="medicoocupac-diagnostico-origen-iess-certificado-medi-titulo" type="text" required value={reintegroForm.diagnosticoOrigen} onChange={e => setReintegroForm({ ...reintegroForm, diagnosticoOrigen: e.target.value })} placeholder="Ej: Hernia Discal L4-L5" />
                                </div>

                                <div className="premium-field-card">
                                    <div className="field-header">
                                        <div className="field-header__left">
                                            <span className="field-header__icon"><ClipboardList size={15} /></span>
                                            <h4 id="medicoocupac-recomendaciones-adaptaciones-del-puesto-titulo" className="field-header__title">Recomendaciones & Adaptaciones del Puesto</h4>
                                        </div>
                                    </div>
                                    <textarea aria-labelledby="medicoocupac-recomendaciones-adaptaciones-del-puesto-titulo" rows={3} value={reintegroForm.recomendaciones} onChange={e => setReintegroForm({ ...reintegroForm, recomendaciones: e.target.value })} placeholder="Ej: Reducción de jornada laboral a 6 horas por 15 días, silla ergonómica..." style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: '13px' }} />
                                </div>

                                <footer className="clinical-modal__actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                                    <button type="button" className="action-button action-button--light" onClick={() => setIsReintegroModalOpen(false)}>Cancelar</button>
                                    <button type="submit" className="action-button action-button--primary">Guardar Reintegro</button>
                                </footer>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* MODAL DE CONFIRMACIÓN DE CANCELACIÓN */}
            {confirmModal?.show && (
                <div className="modal show" style={{ zIndex: 999999, position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', display: 'grid', placeItems: 'center' }}>
                    <div className="modal__backdrop" onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}></div>
                    <div className="modal__content" style={{ border: 'none', position: 'relative', zIndex: 5001, margin: 'auto' }}>
                        <div className="modal__icon" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                            <AlertTriangle size={24} />
                        </div>
                        <h2>{confirmModal.title}</h2>
                        <p>{confirmModal.message}</p>
                        <div className="modal__actions">
                            <button className="modal__cancel" onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}>
                                Cancelar
                            </button>
                            <button className="modal__confirm" onClick={() => { confirmModal.onConfirm?.(); setConfirmModal(prev => ({ ...prev, show: false })); }}>
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL REGISTRAR NUEVA ORDEN DE EXAMEN */}
            {isExamModalOpen && (
                <div className="clinical-modal show">
                    <div className="clinical-modal__backdrop" onClick={handleCancelExamModal}></div>
                    <div className="clinical-modal__dialog clinical-modal__dialog--compact" style={{ maxWidth: '720px' }}>
                        <header className="clinical-modal__header">
                            <div className="clinical-modal__patient">
                                <span className="clinical-modal__avatar"><Stethoscope size={18} /></span>
                                <div>
                                    <span>SALUD OCUPACIONAL & DIAGNÓSTICO</span>
                                    <h2>Emitir Orden de Examen Médico & Laboratorio</h2>
                                </div>
                            </div>
                            <button aria-label="Cerrar" type="button" className="clinical-modal__close" onClick={handleCancelExamModal}><X size={15} /></button>
                        </header>

                        <form onSubmit={handleSaveExamOrder} className="clinical-modal__body">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {/* PACIENTE TRABAJADOR SELECCIONADO */}
                                <div className="premium-field-card span-12">
                                    <div className="field-header">
                                        <div className="field-header__left">
                                            <span className="field-header__icon"><User size={15} /></span>
                                            <h4 className="field-header__title">Paciente Trabajador Destinatario</h4>
                                        </div>
                                        <span className="field-badge-req">Seleccionado</span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '6px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '15px' }}>
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>
                                                {patientSelected ? `${patientSelected.nombres} ${patientSelected.apellidos}` : (examForm.pacienteNombre || 'Paciente Seleccionado')}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                                                C.I: {patientSelected?.cedula || examForm.pacienteCedula || 'N/A'} · Puesto: {patientSelected?.puestoTrabajo || 'Servidor/Docente'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* TIPO DE EXAMEN Y LABORATORIO */}
                                <div className="clinical-fields-grid">
                                    <div className="premium-field-card">
                                        <div className="field-header">
                                            <div className="field-header__left">
                                                <span className="field-header__icon"><Stethoscope size={15} /></span>
                                                <h4 id="medicoocupac-tipo-de-examen-requerido-titulo" className="field-header__title">Tipo de Examen Requerido</h4>
                                            </div>
                                            <span className="field-badge-req">Requerido</span>
                                        </div>
                                        <select aria-labelledby="medicoocupac-tipo-de-examen-requerido-titulo"
                                            value={examForm.examenTipo}
                                            onChange={e => setExamForm({ ...examForm, examenTipo: e.target.value })}
                                            required
                                        >
                                            <option value="Audiometría Tonal Ocupacional">Audiometría Tonal Ocupacional</option>
                                            <option value="Espirometría Simple Ocupacional">Espirometría Simple Ocupacional</option>
                                            <option value="Rayos X de Tórax (Rx AP y Lateral)">Rayos X de Tórax (Rx AP y Lateral)</option>
                                            <option value="Electrocardiograma de Reposo (ECG)">Electrocardiograma de Reposo (ECG)</option>
                                            <option value="Biometría Hemática + Perfil Lipídico">Biometría Hemática + Perfil Lipídico</option>
                                            <option value="Examen de Optometría Ocupacional">Examen de Optometría Ocupacional</option>
                                            <option value="Prueba de Esfuerzo / Ergometría">Prueba de Esfuerzo / Ergometría</option>
                                            <option value="Examen Toxicológico / Panel de Drogas">Examen Toxicológico / Panel de Drogas</option>
                                            <option value="Perfil Tiroideo / Químico Ocupacional">Perfil Tiroideo / Químico Ocupacional</option>
                                            <option value="Otro Examen Especializado">Otro Examen Especializado</option>
                                        </select>
                                    </div>

                                    <div className="premium-field-card">
                                        <div className="field-header">
                                            <div className="field-header__left">
                                                <span className="field-header__icon"><Building2 size={15} /></span>
                                                <h4 id="medicoocupac-laboratorio-proveedor-destino-titulo" className="field-header__title">Laboratorio / Proveedor Destino</h4>
                                            </div>
                                            <span className="field-badge-req">Requerido</span>
                                        </div>
                                        <select aria-labelledby="medicoocupac-laboratorio-proveedor-destino-titulo"
                                            value={examForm.laboratorio}
                                            onChange={e => setExamForm({ ...examForm, laboratorio: e.target.value })}
                                            required
                                        >
                                            <option value="Laboratorio Ocupacional Institucional">Laboratorio Ocupacional Institucional</option>
                                            <option value="Laboratorio Central Universitario">Laboratorio Central Universitario</option>
                                            <option value="Centro Diagnóstico Convenio UEB">Centro Diagnóstico Convenio UEB</option>
                                            <option value="Servicio Médico Interno / Enfermería">Servicio Médico Interno / Enfermería</option>
                                            <option value="Laboratorio Externo Particular">Laboratorio Externo Particular</option>
                                        </select>
                                    </div>
                                </div>

                                {/* MOTIVO E INDICACIÓN CLÍNICA */}
                                <div className="premium-field-card">
                                    <div className="field-header">
                                        <div className="field-header__left">
                                            <span className="field-header__icon"><ClipboardList size={15} /></span>
                                            <h4 id="medicoocupac-motivo-indicacion-clinica-ocupacional-titulo" className="field-header__title">Motivo / Indicación Clínica Ocupacional</h4>
                                        </div>
                                        <span className="field-badge-req">Requerido</span>
                                    </div>
                                    <input aria-labelledby="medicoocupac-motivo-indicacion-clinica-ocupacional-titulo"
                                        type="text"
                                        required
                                        value={examForm.motivo}
                                        onChange={e => setExamForm({ ...examForm, motivo: e.target.value })}
                                        placeholder="Ej: Vigilancia epidemiológica por exposición a ruido / Examen periódico anual..."
                                    />
                                </div>

                                {/* OBSERVACIONES E INDICACIONES */}
                                <div className="premium-field-card">
                                    <div className="field-header">
                                        <div className="field-header__left">
                                            <span className="field-header__icon"><Info size={15} /></span>
                                            <h4 id="medicoocupac-observaciones-e-indicaciones-para-el-tra-titulo" className="field-header__title">Observaciones e Indicaciones para el Trabajador</h4>
                                        </div>
                                    </div>
                                    <textarea aria-labelledby="medicoocupac-observaciones-e-indicaciones-para-el-tra-titulo"
                                        rows={3}
                                        value={examForm.observaciones}
                                        onChange={e => setExamForm({ ...examForm, observaciones: e.target.value })}
                                        placeholder="Ej: Acudir en ayunas de 8 a 12 horas, evitar exposición a ruido 14h antes del examen..."
                                        style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: '13px' }}
                                    />
                                </div>
                            </div>

                            <footer className="clinical-modal__actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                                <button type="button" className="action-button action-button--light" onClick={handleCancelExamModal}>Cancelar</button>
                                <button type="submit" className="action-button action-button--primary" disabled={examSaving}>{examSaving ? 'Emitiendo...' : 'Emitir Orden de Examen'}</button>
                            </footer>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL REGISTRAR / EDITAR RESULTADO DE EXAMEN */}
            {examResultModal.show && (
                <div className="clinical-modal show">
                    <div className="clinical-modal__backdrop" onClick={() => setExamResultModal({ show: false, item: null, resultadoText: '', estado: 'Realizado' })}></div>
                    <div className="clinical-modal__dialog clinical-modal__dialog--compact" style={{ maxWidth: '580px' }}>
                        <header className="clinical-modal__header">
                            <div className="clinical-modal__patient">
                                <span className="clinical-modal__avatar"><Upload size={18} /></span>
                                <div>
                                    <span>Informe Diagnóstico</span>
                                    <h2>Cargar Resultado de Examen Médico</h2>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                                        {examResultModal.item?.examen} — {examResultModal.item?.paciente}
                                    </p>
                                </div>
                            </div>
                            <button aria-label="Cerrar" className="clinical-modal__close" onClick={() => setExamResultModal({ show: false, item: null, resultadoText: '', estado: 'Realizado' })}><X size={16} /></button>
                        </header>

                        <div className="clinical-modal__body">
                            <form onSubmit={handleSaveExamResult}>
                                <div className="field" style={{ marginBottom: '14px' }}>
                                    <label htmlFor="medicoocupac-estado-del-examen">Estado del Examen *</label>
                                    <select id="medicoocupac-estado-del-examen"
                                        value={examResultModal.estado}
                                        onChange={e => setExamResultModal({ ...examResultModal, estado: e.target.value })}
                                        style={{ fontWeight: '600' }}
                                    >
                                        <option value="Realizado">Realizado / Completado</option>
                                        <option value="Pendiente">Pendiente de Procesamiento</option>
                                    </select>
                                </div>
                                <div className="field" style={{ marginBottom: '16px' }}>
                                    <label htmlFor="medicoocupac-resultado-dictamen-clinico">Resultado / Dictamen Clínico *</label>
                                    <textarea id="medicoocupac-resultado-dictamen-clinico"
                                        rows={4}
                                        required
                                        value={examResultModal.resultadoText}
                                        onChange={e => setExamResultModal({ ...examResultModal, resultadoText: e.target.value })}
                                        placeholder="Ingrese el resultado del laboratorio o informe médico (ej: Audición conservación bilateral normal, Capacidad vital forzada 95%, etc.)..."
                                    />
                                </div>
                                <footer className="clinical-modal__actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                    <button type="button" className="action-button action-button--light" onClick={() => setExamResultModal({ show: false, item: null, resultadoText: '', estado: 'Realizado' })}>Cancelar</button>
                                    <button type="submit" className="action-button action-button--primary">Guardar Resultado</button>
                                </footer>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {/* MODAL AGENDAR NUEVA CITA OCUPACIONAL */}
            {isAgendarCitaModalOpen && (
                <div className="clinical-modal show">
                    <div className="clinical-modal__backdrop" onClick={() => setIsAgendarCitaModalOpen(false)}></div>
                    <div className="clinical-modal__dialog clinical-modal__dialog--compact" style={{ maxWidth: '600px' }}>
                        <header className="clinical-modal__header" style={{ padding: '16px 20px', background: 'var(--primary)', color: 'white' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <CalendarCheck size={20} color="#38bdf8" />
                                <h3 style={{ margin: 0, fontSize: '15px', color: 'white', fontWeight: '700' }}>Agendar Nueva Cita Ocupacional</h3>
                            </div>
                            <button aria-label="Cerrar" className="clinical-modal__close" onClick={() => setIsAgendarCitaModalOpen(false)} style={{ color: 'white' }}><X size={15} /></button>
                        </header>
                        <div className="clinical-modal__body" style={{ padding: '20px' }}>
                            <form onSubmit={handleSaveNewCita}>
                                <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px', marginBottom: '14px' }}>
                                    <div className="field">
                                        <label htmlFor="medicoocupac-nombre-del-paciente">Nombre del Paciente *</label>
                                        <input id="medicoocupac-nombre-del-paciente" type="text" required value={newCitaForm.pacienteNombre} onChange={e => setNewCitaForm({ ...newCitaForm, pacienteNombre: e.target.value })} placeholder="Ej: Juan Carlos Pérez" />
                                    </div>
                                    <div className="field">
                                        <label htmlFor="medicoocupac-cedula">Cédula *</label>
                                        <input id="medicoocupac-cedula" type="text" required value={newCitaForm.cedula} onChange={e => setNewCitaForm({ ...newCitaForm, cedula: e.target.value })} placeholder="Ej: 1723456789" />
                                    </div>
                                </div>
                                <div className="field" style={{ marginBottom: '14px' }}>
                                    <label htmlFor="medicoocupac-puesto-area-trabajos">Puesto / Área Trabajos</label>
                                    <input id="medicoocupac-puesto-area-trabajos" type="text" value={newCitaForm.puesto} onChange={e => setNewCitaForm({ ...newCitaForm, puesto: e.target.value })} placeholder="Ej: Docente Auxiliar - Dirección de Ciencias" />
                                </div>
                                <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                                    <div className="field">
                                        <label htmlFor="medicoocupac-fecha">Fecha *</label>
                                        <input id="medicoocupac-fecha" type="date" required value={newCitaForm.fecha} onChange={e => setNewCitaForm({ ...newCitaForm, fecha: e.target.value })} />
                                    </div>
                                    <div className="field">
                                        <label htmlFor="medicoocupac-hora-inicio">Hora Inicio *</label>
                                        <input id="medicoocupac-hora-inicio" type="time" required value={newCitaForm.horaInicio} onChange={e => setNewCitaForm({ ...newCitaForm, horaInicio: e.target.value })} />
                                    </div>
                                    <div className="field">
                                        <label htmlFor="medicoocupac-hora-fin">Hora Fin *</label>
                                        <input id="medicoocupac-hora-fin" type="time" required value={newCitaForm.horaFin} onChange={e => setNewCitaForm({ ...newCitaForm, horaFin: e.target.value })} />
                                    </div>
                                </div>
                                <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px', marginBottom: '14px' }}>
                                    <div className="field">
                                        <label htmlFor="medicoocupac-tipo-de-evaluacion-ocupacional">Tipo de Evaluación Ocupacional *</label>
                                        <select id="medicoocupac-tipo-de-evaluacion-ocupacional" value={newCitaForm.tipoEvaluacion} onChange={e => setNewCitaForm({ ...newCitaForm, tipoEvaluacion: e.target.value })}>
                                            <option value="Evaluación Periódica">Evaluación Periódica</option>
                                            <option value="Evaluación Preocupacional">Evaluación Preocupacional / Ingreso</option>
                                            <option value="Reintegro Laboral">Reintegro Laboral</option>
                                            <option value="Evaluación de Salida / Retiro">Evaluación de Salida / Retiro</option>
                                            <option value="Evaluación Especial Ocupacional">Evaluación Especial Ocupacional</option>
                                        </select>
                                    </div>
                                    <div className="field">
                                        <label htmlFor="medicoocupac-prioridad">Prioridad</label>
                                        <select id="medicoocupac-prioridad" value={newCitaForm.prioridad} onChange={e => setNewCitaForm({ ...newCitaForm, prioridad: e.target.value })}>
                                            <option value="Normal">Normal</option>
                                            <option value="Alta">Alta / Urgente</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="field" style={{ marginBottom: '16px' }}>
                                    <label htmlFor="medicoocupac-motivo-observaciones">Motivo / Observaciones</label>
                                    <textarea id="medicoocupac-motivo-observaciones" rows={2} value={newCitaForm.motivo} onChange={e => setNewCitaForm({ ...newCitaForm, motivo: e.target.value })} placeholder="Detalle el motivo o requerimiento de la cita médica..." />
                                </div>
                                <footer className="clinical-modal__actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                    <button type="button" className="action-button action-button--light" onClick={() => setIsAgendarCitaModalOpen(false)}>Cancelar</button>
                                    <button type="submit" className="action-button action-button--primary">Agendar Cita</button>
                                </footer>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL VISTA PREVIA DE RECETARIO OFICIAL */}
            {selectedRecetaPreview && (
                <div className="clinical-modal show" style={{ zIndex: 9999 }}>
                    <div className="clinical-modal__backdrop" onClick={() => setSelectedRecetaPreview(null)}></div>
                    <div className="clinical-modal__dialog" style={{ width: 'min(900px, 95vw)', height: 'min(820px, 90vh)' }}>
                        <header className="clinical-modal__header">
                            <div className="clinical-modal__patient">
                                <span className="clinical-modal__avatar" style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#ffffff' }}>
                                    <Pill size={22} />
                                </span>
                                <div>
                                    <span style={{ color: 'rgba(255, 255, 255, 0.75)', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.8px', display: 'block' }}>
                                        PUESTO DE SALUD · BIENESTAR UNIVERSITARIO
                                    </span>
                                    <h2 style={{ margin: '2px 0 0', fontSize: '16px', color: '#ffffff', fontWeight: '800' }}>
                                        Formato Oficial de Recetario Médico ({selectedRecetaPreview.numero_receta || `REC-${selectedRecetaPreview.id}`})
                                    </h2>
                                </div>
                            </div>
                            <button aria-label="Cerrar" className="clinical-modal__close" type="button" onClick={() => setSelectedRecetaPreview(null)}>
                                <X size={16} />
                            </button>
                        </header>

                        <div className="clinical-modal__body" style={{ padding: '20px', background: '#f1f5f9' }}>
                            {/* HOJA SIMULADA DEL RECETARIO */}
                            <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '20px', fontSize: '11px', color: '#1e293b', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', width: '100%', boxSizing: 'border-box' }}>
                                {/* PARTE 1: RECETA OFICIAL */}
                                <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '10px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <strong style={{ fontSize: '16px', color: '#1e3a8a' }}>UEB</strong><br />
                                        <span style={{ fontSize: '11px', color: '#475569' }}>UNIVERSIDAD ESTATAL DE BOLÍVAR</span>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <h2 style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>BIENESTAR UNIVERSITARIO</h2>
                                        <h3 style={{ margin: '2px 0 0', fontSize: '12px', color: '#0284c7' }}>Puesto de Salud</h3>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <strong>RECETA N°:</strong> <span style={{ color: '#dc2626', fontWeight: 'bold' }}>{selectedRecetaPreview.numero_receta || `REC-${selectedRecetaPreview.id}`}</span><br />
                                        <span style={{ fontSize: '11px' }}>FECHA: {selectedRecetaPreview.fecha}</span>
                                    </div>
                                </div>

                                {/* DATOS GENERALES PACIENTE */}
                                <div style={{ background: '#f8fafc', padding: '6px 10px', fontWeight: 'bold', fontSize: '11px', border: '1px solid #94a3b8', marginBottom: '6px' }}>
                                    DATOS GENERALES DEL PACIENTE
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', border: '1px solid #cbd5e1', padding: '10px', borderRadius: '6px', marginBottom: '12px' }}>
                                    <div style={{ gridColumn: 'span 2' }}><strong>Apellidos y Nombres:</strong> {selectedRecetaPreview.paciente}</div>
                                    <div><strong>Documento/HCL:</strong> {selectedRecetaPreview.cedula}</div>
                                    <div><strong>Sexo:</strong> F [{selectedRecetaPreview.sexo === 'F' ? 'X' : ' '}] M [{selectedRecetaPreview.sexo === 'M' ? 'X' : ' '}]</div>
                                    <div style={{ gridColumn: 'span 3' }}><strong>Estado de Enfermedad:</strong> Agudo [{selectedRecetaPreview.estado_enfermedad === 'Agudo' ? 'X' : ' '}] Crónico [{selectedRecetaPreview.estado_enfermedad === 'Crónico' ? 'X' : ' '}]</div>
                                    <div><strong>Fecha nac:</strong> {selectedRecetaPreview.fecha_nacimiento || 'N/D'}</div>
                                    <div><strong>Edad:</strong> {selectedRecetaPreview.edad_anios || 0} años {selectedRecetaPreview.edad_meses || 0}m</div>
                                    <div><strong>CIE:</strong> {selectedRecetaPreview.cie || 'Z00.0'}</div>
                                    <div><strong>Peso:</strong> {selectedRecetaPreview.peso ? `${selectedRecetaPreview.peso} kg` : '-'}</div>
                                    <div><strong>Talla:</strong> {selectedRecetaPreview.talla ? `${selectedRecetaPreview.talla} cm` : '-'}</div>
                                    <div style={{ gridColumn: 'span 3' }}><strong>Alergias:</strong> {selectedRecetaPreview.alergias_si ? `SI - ${selectedRecetaPreview.alergias_detalle}` : 'NO (Ninguna)'}</div>
                                </div>

                                {/* DATOS MEDICAMENTO */}
                                <div style={{ background: '#f8fafc', padding: '6px 10px', fontWeight: 'bold', fontSize: '11px', border: '1px solid #94a3b8', marginBottom: '6px' }}>
                                    DATOS DEL MEDICAMENTO
                                </div>
                                <div style={{ overflowX: 'auto', width: '100%', marginBottom: '12px' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                                        <thead>
                                            <tr style={{ background: '#f1f5f9', border: '1px solid #94a3b8' }}>
                                                <th style={{ padding: '6px', textAlign: 'left' }}>Medicamento</th>
                                                <th style={{ padding: '6px' }}>Dosis</th>
                                                <th style={{ padding: '6px' }}>Frecuencia</th>
                                                <th style={{ padding: '6px' }}>Duración</th>
                                                <th style={{ padding: '6px' }}>Vía</th>
                                                <th style={{ padding: '6px' }}>Cantidad</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(selectedRecetaPreview.lineas || []).map((l, i) => (
                                                <tr key={i} style={{ border: '1px solid #cbd5e1' }}>
                                                    <td style={{ padding: '6px' }}><strong>{l.detalle_medicamento}</strong></td>
                                                    <td style={{ padding: '6px', textAlign: 'center' }}>{l.dosis || '-'}</td>
                                                    <td style={{ padding: '6px', textAlign: 'center' }}>Cada {l.frecuencia}h</td>
                                                    <td style={{ padding: '6px', textAlign: 'center' }}>{l.duracion} días</td>
                                                    <td style={{ padding: '6px', textAlign: 'center' }}>{l.via || 'Oral'}</td>
                                                    <td style={{ padding: '6px', textAlign: 'center' }}>{l.cantidad_texto || '1 caja'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* FIRMA Y VIGENCIA */}
                                <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', border: '1px solid #cbd5e1', padding: '10px', borderRadius: '6px', marginBottom: '8px' }}>
                                    <div>
                                        <strong>DATOS DEL PRESCRIPTOR:</strong><br />
                                        <span>Dr(a). {selectedRecetaPreview.prescriptor_nombre || 'Médico Ocupacional'}</span><br />
                                        <span style={{ fontSize: '11px', color: '#64748b' }}>ACESS: {selectedRecetaPreview.prescriptor_acess || 'ACESS-MED-84920'}</span>
                                    </div>
                                    <div>
                                        <strong>VÁLIDO / VERIFICADO:</strong><br />
                                        <span>{selectedRecetaPreview.valido_verificado || 'Farmacia Institucional'}</span>
                                    </div>
                                </div>
                                <div style={{ textTransform: 'uppercase', fontWeight: 'bold', textAlign: 'center', background: '#f1f5f9', padding: '4px', border: '1px solid #94a3b8', fontSize: '11px', marginBottom: '16px' }}>
                                    VIGENCIA MÁXIMA : (03) DÍAS
                                </div>

                                {/* PARTE 2: INDICACIONES Y HORARIOS */}
                                <div style={{ borderTop: '2px dashed #94a3b8', paddingTop: '12px', marginTop: '12px' }}>
                                    <div style={{ background: '#e0f2fe', color: '#0369a1', padding: '6px 10px', fontWeight: 'bold', fontSize: '11px', borderRadius: '4px', marginBottom: '10px' }}>
                                        INDICACIONES PARA EL PACIENTE Y HORARIOS DE TOMA
                                    </div>

                                    <div style={{ overflowX: 'auto', width: '100%', marginBottom: '12px' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                                            <thead>
                                                <tr style={{ background: '#f1f5f9', border: '1px solid #94a3b8' }}>
                                                    <th style={{ padding: '6px', textAlign: 'left' }}>Medicamento</th>
                                                    <th style={{ padding: '6px' }}>Dosis</th>
                                                    <th style={{ padding: '6px' }}>Frecuencia</th>
                                                    <th style={{ padding: '6px' }}>Vía</th>
                                                    <th style={{ padding: '6px', textAlign: 'center' }}>Mañana</th>
                                                    <th style={{ padding: '6px', textAlign: 'center' }}>Mediodía</th>
                                                    <th style={{ padding: '6px', textAlign: 'center' }}>Tarde</th>
                                                    <th style={{ padding: '6px', textAlign: 'center' }}>Noche</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(selectedRecetaPreview.lineas || []).map((l, i) => (
                                                    <tr key={i} style={{ border: '1px solid #cbd5e1' }}>
                                                        <td style={{ padding: '6px' }}><strong>{l.detalle_medicamento}</strong></td>
                                                        <td style={{ padding: '6px', textAlign: 'center' }}>{l.dosis || '-'}</td>
                                                        <td style={{ padding: '6px', textAlign: 'center' }}>c/{l.frecuencia}h</td>
                                                        <td style={{ padding: '6px', textAlign: 'center' }}>{l.via || 'Oral'}</td>
                                                        <td style={{ padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>{l.manana ? '✓' : '-'}</td>
                                                        <td style={{ padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>{l.mediodia ? '✓' : '-'}</td>
                                                        <td style={{ padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>{l.tarde ? '✓' : '-'}</td>
                                                        <td style={{ padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>{l.noche ? '✓' : '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px', border: '1px solid #cbd5e1', padding: '10px', borderRadius: '6px' }}>
                                        <div>
                                            <strong>DATOS DEL PRESCRIPTOR:</strong><br />
                                            <span>{selectedRecetaPreview.prescriptor_nombre || 'Dr. Médico Ocupacional'}</span>
                                        </div>
                                        <div>
                                            <strong>SIGNOS DE ALARMA & RECOMENDACIONES:</strong><br />
                                            <span>{selectedRecetaPreview.signos_alarma || 'Fiebre, mareo o rash alérgico.'}</span><br />
                                            <span style={{ color: '#475569' }}>{selectedRecetaPreview.recomendaciones_no_farmacologicas || 'Reposo e hidratación.'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ACCIONES DEL MODAL */}
                        <footer className="clinical-modal__actions" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: '10px', background: '#ffffff', borderTop: '1px solid var(--border)' }}>
                            <button className="action-button action-button--light" onClick={() => setSelectedRecetaPreview(null)}>
                                Cerrar
                            </button>
                            <button className="action-button action-button--accent" onClick={() => handlePrintRecetaForm(selectedRecetaPreview)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Printer size={16} /> Imprimir Recetario
                            </button>
                        </footer>
                    </div>
                </div>
            )}

            {/* MODAL DETALLE / VISOR EXACTO DEL FORMATO OFICIAL DE REINTEGRO LABORAL (FORMULARIO 077 REINTEGRO - EXCEL MSP) */}
            <OfficialFichaReintegroModal
                isOpen={isReintegroDetailModalOpen}
                onClose={() => setIsReintegroDetailModalOpen(false)}
                record={selectedReintegroDetail}
                uebBannerLogo={uebBannerLogo}
            />


            {/* MODAL DETALLE / VISOR EXACTO DEL FORMATO OFICIAL DE INGRESO / PERIÓDICO (FORMULARIO 077 - EXCEL CH DE INGRESO) */}
            <OfficialFichaIngresoModal
                isOpen={isIngresoDetailModalOpen}
                onClose={() => setIsIngresoDetailModalOpen(false)}
                record={selectedIngresoDetail}
                uebBannerLogo={uebBannerLogo}
            />

            {/* MODAL DETALLE / VISOR EXACTO DEL FORMATO OFICIAL DE RETIRO / CESE LABORAL (FORMULARIO 077 RETIRO - EXCEL MSP) */}
            <OfficialFichaRetiroModal
                isOpen={isRetiroDetailModalOpen}
                onClose={() => setIsRetiroDetailModalOpen(false)}
                record={selectedRetiroDetail}
                uebBannerLogo={uebBannerLogo}
            />

            {/* PANEL DE AYUDA */}
            <HelpPanel
                helpItems={[
                    { title: 'Paso 1: Buscar o Registrar Trabajador', content: 'Use el buscador de Cédula o nombre para cargar al trabajador. Si es nuevo, regístrelo en el sistema.' },
                    { title: 'Paso 2: Evaluación Ocupacional', content: 'Complete los pasos de la consulta ocupacional (Vigilancia, Antecedentes, Examen Físico, Aptitud Laboral y Prescripción Médica).' },
                    { title: 'Paso 3: Matriz de Riesgos y Exámenes', content: 'Emita órdenes de exámenes diagnósticos o genere certificados de aptitud laboral.' },
                    { title: 'Paso 4: Reportes y Fichas', content: 'Consulte partes diarios y fichas ocupacionales (Ingreso, Retiro, Reintegro).' }
                ]}
                contactInfo={{ email: 'soporte@ueb.edu.ec' }}
            />

            {toast.show && (
                <div role="status" aria-live="polite" style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    background: '#0f172a',
                    color: '#fff',
                    padding: '12px 20px',
                    borderRadius: '10px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                    zIndex: 99999,
                    fontSize: '13px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    animation: 'fadeIn 0.2s ease-out'
                }}>
                    <Info size={16} color="#38bdf8" />
                    <span>{toast.message}</span>
                </div>
            )}
        </div>
        </div>
    );
}