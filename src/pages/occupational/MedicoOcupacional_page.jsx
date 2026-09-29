import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import api from '../../api/axios';
import '../../medical.css';
import HelpPanel from '../../components/HelpPanel';
import UserProfileMenu from '../../components/UserProfileMenu';
import { useClinicalDraft } from '../../hooks/useClinicalDraft';
import { LAB_EXAM_CATEGORIES, LAB_EXAM_PRESETS } from '../../data/labExamsData';
import logoUeb from '../../assets/ueb.png';
import { logoBienestar } from '../../assets/logoBienestarBase64.js';
import { logoUebTexto } from '../../assets/logoUebTextoBase64.js';
import { headerBienestar } from '../../assets/headerBienestarBase64.js';
import OfficialFichaIngresoModal, { printOfficialIngresoForm, compileOfficialIngresoFormHtml } from './OfficialFichaIngresoModal';
import OfficialFichaRetiroModal, { printOfficialRetiroForm, compileOfficialRetiroFormHtml } from './OfficialFichaRetiroModal';
import OfficialFichaReintegroModal, { printOfficialReintegroForm, compileOfficialReintegroFormHtml } from './OfficialFichaReintegroModal';

const uebBannerLogo = logoUeb;

import {
    Menu,
    LogOut,
    Bell,
    Search,
    X,
    Save,
    History,
    FileText,
    Plus,
    PlusCircle,
    Calendar,
    ChevronDown,
    ChevronUp,
    ChevronRight,
    Activity,
    ClipboardList,
    CheckCircle,
    AlertTriangle,
    Stethoscope,
    User,
    UserPlus,
    Shield,
    ShieldAlert,
    CalendarCheck,
    CalendarDays,
    Info,
    TrendingUp,
    Heart,
    HeartHandshake,
    Thermometer,
    HeartPulse,
    Brain,
    Sparkles,
    BookOpen,
    Printer,
    FileCheck,
    FileSpreadsheet,
    MapPin,
    Clock,
    UserCheck,
    UserX,
    Baby,
    Mail,
    Eye,
    EyeOff,
    BarChart3,
    Accessibility,
    Pill,
    Package,
    Filter,
    Trash2,
    Briefcase,
    RefreshCw,
    FilePlus,
    Award,
    Upload,
    Download,
    AlertOctagon,
    Zap,
    Building2,
    Loader2,
    Edit2,
    ExternalLink
} from 'lucide-react';
import VitalSignsHistogram from '../../components/VitalSignsHistogram';

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
    const { isOffline, saveDraft, loadDraft, clearDraft } = useClinicalDraft('ocupacional', user?.id, patientId);

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
        fechaReintegro: new Date().toISOString().split('T')[0],
        restricciones: ''
    });

    // Mock/Saved Lists
    const [fichasData, setFichasData] = useState([
        {
            id: 'merchan-silvia',
            fecha: '2026-03-09',
            primerApellido: 'MERCHAN',
            segundoApellido: 'ORTIZ',
            primerNombre: 'SILVIA',
            segundoNombre: 'TATIANA',
            paciente: 'MERCHAN ORTIZ SILVIA TATIANA',
            cedula: '010672364-6',
            tipo: 'Ingreso',
            puesto: 'PROFESOR OCASIONAL TIEMPO COMPLETO',
            cargo: 'PROFESOR OCASIONAL TIEMPO COMPLETO',
            ciuo: 'C02',
            actividades: 'DOCENCIA',
            aptitud: 'Apto',
            estado: 'Completado',
            empresa: 'UNIVERSIDAD ESTATAL DE BOLIVAR',
            ruc: '0260000920001',
            ciiu: 'S/N',
            establecimiento: 'DEPARTAMENTO MEDICO U.E.B',
            numHistoriaClinica: '010672364-6',
            numArchivo: 'S/N',
            sexo: 'F',
            edad: 31,
            religion: 'Católica',
            grupoSanguineo: 'ORH+',
            lateralidad: 'DIESTRO',
            orientacionSexual: 'Heterosexual',
            identidadGenero: 'Femenino',
            discapacidad: { tiene: false, tipo: '', porcentaje: '' },
            fechaIngreso: '2026-03-09',
            telefono: '0982753658',
            motivoConsulta: 'EVALUACIÓN MÉDICA OCUPACIONAL PARA EL INGRESO AL PUESTO DE TRABAJO',
            antecedentesClinicos: 'QUERATOCONO BINOCULAR, RINITIS ALERGICA                    VACUNAS: 3 DOSIS PARA COVID-19, INFLUENZA',
            antecedentesQuirurgicos: 'CIRUGIA DE QUERATOCONO HACE 12 AÑOS                    ALERGIA: AL FRÍO AL POLVO ENTRE OTROS',
            ginecoObstetricos: {
                menarquia: '11 AÑOS',
                ciclos: 'REGULARES',
                fum: '2026-02-13',
                gestas: 0,
                partos: 0,
                cesareas: 0,
                abortos: 0,
                hijosVivos: 0,
                hijosMuertos: 0,
                vidaSexualActiva: false,
                planificacionFamiliar: false,
                tipoPlanificacion: '',
                papanicolaou: { realizada: true, tiempo: '3 MESES', resultado: 'NORMAL' },
                colposcopia: { realizada: false, resultado: 'NO APLICA' },
                mamografia: { realizada: false, resultado: 'NO APLICA' },
                ecoMamario: { realizada: false, resultado: 'NO APLICA' }
            },
            habitosToxicos: {
                tabaco: false,
                alcohol: false,
                drogas: false,
                actividadFisica: { tiene: true, cual: 'GYM 2 HORAS', tiempo: 'LUNES A VIERNES' },
                medicacionHabitual: { tiene: true, cual: 'LEVOCETERIZINA 5 MG', tiempo: 'PRN' }
            },
            empleosAnteriores: [
                {
                    empresa: 'UNIVERSIDAD CATÓLICA DE CUENCA',
                    puesto: 'DOCENTE',
                    actividades: 'DOCENCIA',
                    tiempo: '14 MESES',
                    riesgos: { fisico: true, mecanico: false, quimico: true, biologico: false, ergonomico: false, psicosocial: false },
                    observaciones: 'NINGUNA'
                }
            ],
            accidentesTrabajo: { calificado: false, fecha: '', especificaciones: '', observaciones: 'NINGUNA' },
            enfermedadesProfesionales: { calificado: false, fecha: '', especificaciones: '', observaciones: 'NINGUNA' },
            antecedentesFamiliares: {
                cardiovascular: true,
                descripcion: 'ABUELO MATERNO CON HIPERTENSION ARTERIAL'
            },
            factoresRiesgo: {
                puesto: 'FACULTAD DE CIENCIAS  DE LA EDUCACIÓN',
                actividades: 'DOCENCIA',
                fisico: ['Temperaturas altas', 'Temperaturas bajas'],
                mecanico: ['Caídas al mismo nivel', 'Caídas a diferente nivel'],
                quimico: [],
                biologico: ['Virus'],
                ergonomico: ['Posiciones estáticas'],
                psicosocial: ['Inestabilidad laboral'],
                medidasPreventivas: '1.- TEMPERATURAS BAJAS y ALTAS  : Uso de rropa adecuada dependindo el clima  . 2.- Caídas al mismo y distinto nivel:Capacitación de forma correcta para subir o bajar escalones   4.- Virus: Capacitación en medidas de bioseguridad para evitar el contagio.  5.- Posiciones estáticas:  Realizar pausas activas o ejercicios de estiramiento para evitar permanecer en posición sentada por tirmpos prolongados. 6.- Inestabilidad Laboral : Reunion con el Patrono y talento humano  para buscar una estabiliadad laboral'
            },
            actividadesExtraLaborales: 'NO',
            enfermedadActual: 'PACIENTE FEMENINA   DE  31  AÑOS DE EDAD ACUDE PARA UNA VALORACION PREOCUPACIONAL, AL MOMENTO NO REFIERE NINGUNA MOLESTIA.',
            organosSistemas: {
                normal: true,
                descripcion: 'Aparatos y sistemas aparentemente normales.'
            },
            constantes: {
                pa: '120/70',
                temp: '36',
                fc: '76',
                satO2: '96',
                fr: '20',
                peso: '63',
                talla: '1.60',
                imc: '24.61',
                perimetroAbd: '-'
            },
            examenFisico: {
                normal: true,
                descripcion: 'NO SE EVIDENCIA SIGNOS PATOLOGICOS'
            },
            examenesLab: [
                { examen: 'BIOMETRIA/QUIMICA', fecha: 'PENDIENTE', resultado: 'PENDIENTE RESULTADOS' },
                { examen: 'RX STABDRA DE TORAX', fecha: 'PENDIENTE', resultado: 'PENDIENTE RESULTADOS' },
                { examen: 'COPRO / EMO', fecha: 'PENDIENTE', resultado: 'PENDIENTE RESULTADOS' }
            ],
            diagnosticos: [
                { num: 1, desc: 'QUERATOCONO', cie: 'H186', pre: false, def: true },
                { num: 2, desc: 'RINITIS ALERGICA', cie: 'J304', pre: true, def: false }
            ],
            aptitudDetalle: {
                apto: true,
                aptoObservacion: false,
                aptoLimitaciones: false,
                noApto: false,
                observacion: 'Ninguna',
                limitacion: 'Uso adecuado de los Euipos de Proteccion  Individual'
            },
            recomendaciones: [
                'DIETA  HIPOCALORICA',
                'INGESTA DE LIQUIDOS A  LIBRE DEMANDA',
                'LAVADO CORRECTO DE MANOS',
                'EN CASO DE PRESENTAR ALGUNA MOLESTIA ACUDIR AL MEDICO OCUPACIONAL DE LA UEB',
                'PENDIENTE RESULTADOS DE EXÁMENES DE LABORATORIO Y DE IMEGEN'
            ],
            profesional: {
                fecha: '2026-03-09',
                hora: '11:38',
                nombre: 'DR. JORGE MORALES',
                codigo: '1804486288'
            }
        },
        {
            id: 1,
            fecha: '2026-09-10',
            primerApellido: 'PÉREZ',
            segundoApellido: 'GÓMEZ',
            primerNombre: 'JUAN',
            segundoNombre: 'CARLOS',
            paciente: 'Juan Carlos Pérez Gómez',
            cedula: '1723456789',
            tipo: 'Ingreso',
            puesto: 'ANALISTA DE SISTEMAS E INFRAESTRUCTURA TIC',
            cargo: 'ANALISTA DE SISTEMAS E INFRAESTRUCTURA TIC',
            ciuo: 'C03',
            actividades: 'ADMINISTRACIÓN DE SERVIDORES Y SOPORTE TÉCNICO A CAMPUS',
            aptitud: 'Apto',
            estado: 'Completado',
            empresa: 'UNIVERSIDAD ESTATAL DE BOLIVAR',
            ruc: '0260000920001',
            establecimiento: 'DEPARTAMENTO MEDICO U.E.B',
            numHistoriaClinica: '1723456789',
            numArchivo: 'TIC-042',
            sexo: 'M',
            edad: 29,
            religion: 'Católica',
            grupoSanguineo: 'O+',
            lateralidad: 'DIESTRO',
            orientacionSexual: 'Heterosexual',
            identidadGenero: 'Masculino',
            discapacidad: { tiene: false, tipo: '', porcentaje: '' },
            fechaIngreso: '2026-09-10',
            telefono: '0991234567',
            motivoConsulta: 'EVALUACIÓN MÉDICA PREOCUPACIONAL PARA INGRESO AL ÁREA DE TIC',
            antecedentesClinicos: 'NINGUNO DE RELEVANCIA CLÍNICA. NO ALERGIAS MEDICAMENTOSAS. VACUNAS COMPLETAS.',
            antecedentesQuirurgicos: 'NO REFIERE CIRUGÍAS PREVIAS.',
            habitosToxicos: {
                tabaco: false,
                alcohol: false,
                drogas: false,
                actividadFisica: { tiene: true, cual: 'CICLISMO DE MONTAÑA', tiempo: 'FINES DE SEMANA (3H)' },
                medicacionHabitual: { tiene: false, cual: '', tiempo: '' }
            },
            antecedentesFamiliares: {
                cardiovascular: false,
                descripcion: 'PADRES VIVOS SIN ENFERMEDADES CRÓNICAS DEGNERATIVAS RELEVANTES.'
            },
            factoresRiesgo: {
                puesto: 'DIRECCIÓN DE TECNOLOGÍAS DE INFORMACIÓN (TIC)',
                actividades: 'MANTENIMIENTO DE SERVIDORES Y CABLEADO ESTRUCTURADO',
                fisico: ['Ruido en centro de cómputo / datacenter'],
                mecanico: ['Caídas al mismo nivel'],
                quimico: [],
                biologico: ['Virus'],
                ergonomico: ['Sedestación prolongada', 'Movimientos repetitivos en digitación'],
                psicosocial: ['Carga mental'],
                medidasPreventivas: '1.- Uso de protección auditiva al ingresar a salas de servidores. 2.- Pausas activas visuales cada 50 minutos. 3.- Silla ergonómica regulable con apoyo lumbar.'
            },
            actividadesExtraLaborales: 'NO',
            enfermedadActual: 'PACIENTE MASCULINO DE 29 AÑOS REFIERE SENTIRSE EN BUEN ESTADO DE SALUD. NIEGA SÍNTOMAS ACTUALES.',
            organosSistemas: { normal: true, descripcion: 'Órganos de los sentidos y sistemas cardio-respiratorio sin alteraciones.' },
            constantes: {
                pa: '118/78',
                temp: '36.4',
                fc: '72',
                satO2: '98',
                fr: '18',
                peso: '69',
                talla: '1.71',
                imc: '23.60',
                perimetroAbd: '82'
            },
            examenFisico: {
                normal: true,
                descripcion: 'Paciente alerta y orientado. Cabeza y cuello normoconfigurados. Tórax simétrico, campos pulmonares limpios. Abdomen suave y depresible. Columna vertebral con arcos de movilidad conservados.'
            },
            examenesLab: [
                { examen: 'BIOMETRIA HEMÁTICA Y GLUCOSA', fecha: '2026-09-08', resultado: 'VALORES DENTRO DE LÍMITES NORMALES' },
                { examen: 'RX DE TÓRAX POSTEROANTERIOR', fecha: '2026-09-08', resultado: 'SIN LESIONES PLEUROPULMONARES ACTIVAS' },
                { examen: 'OPTOMETRÍA OCUPACIONAL', fecha: '2026-09-08', resultado: 'AGUDEZA VISUAL 20/20 AMBOS OJOS' }
            ],
            diagnosticos: [
                { num: 1, desc: 'EXAMEN MÉDICO GENERAL DE INGRESO LABORAL', cie: 'Z00.0', pre: false, def: true }
            ],
            aptitudDetalle: {
                apto: true,
                aptoObservacion: false,
                aptoLimitaciones: false,
                noApto: false,
                observacion: 'Ninguna',
                limitacion: 'Uso de Equipos de Protección Individual y seguimiento ergonómico'
            },
            recomendaciones: [
                'PAUSAS ACTIVAS VISUALES REGLA 20-20-20 FRENTE AL MONITOR',
                'MANTENER POSTURA ERGONÓMICA EN EL PUESTO DE TRABAJO',
                'HIDRATACIÓN CONTINUA DURANTE LA JORNADA',
                'CONTROL MÉDICO OCUPACIONAL ANUAL'
            ],
            profesional: {
                fecha: '2026-09-10',
                hora: '09:15',
                nombre: 'DR. JORGE MORALES',
                codigo: '1804486288'
            }
        },
        {
            id: 2,
            fecha: '2026-09-12',
            primerApellido: 'RODRIGUEZ',
            segundoApellido: 'ALMEIDA',
            primerNombre: 'MARIA',
            segundoNombre: 'FERNANDA',
            paciente: 'Maria Fernanda Rodriguez Almeida',
            cedula: '1712345678',
            tipo: 'Periódico',
            puesto: 'TÉCNICO DE LABORATORIO DE BIOQUÍMICA',
            cargo: 'TÉCNICO DE LABORATORIO DE BIOQUÍMICA',
            ciuo: 'C05',
            actividades: 'PREPARACIÓN DE REACTIVOS Y PROCESAMIENTO DE MUESTRAS',
            aptitud: 'Apto con Restricción',
            estado: 'Completado',
            empresa: 'UNIVERSIDAD ESTATAL DE BOLIVAR',
            ruc: '0260000920001',
            establecimiento: 'DEPARTAMENTO MEDICO U.E.B',
            numHistoriaClinica: '1712345678',
            numArchivo: 'LAB-108',
            sexo: 'F',
            edad: 42,
            religion: 'Católica',
            grupoSanguineo: 'A+',
            lateralidad: 'DIESTRO',
            orientacionSexual: 'Heterosexual',
            identidadGenero: 'Femenino',
            discapacidad: { tiene: false, tipo: '', porcentaje: '' },
            fechaIngreso: '2022-04-15',
            telefono: '0984567890',
            motivoConsulta: 'EVALUACIÓN MÉDICA PERIÓDICA ANUAL DE CONTROL OCUPACIONAL',
            antecedentesClinicos: 'LUMBALGIA MECÁNICA CRÓNICA EN TRATAMIENTO CONSERVADOR. GASTRITIS LEVE.',
            antecedentesQuirurgicos: 'CESÁREA HACE 8 AÑOS SIN COMPLICACIONES. ALERGIA: A LA PENICILINA.',
            ginecoObstetricos: {
                menarquia: '12 AÑOS',
                ciclos: 'REGULARES',
                fum: '2026-08-28',
                gestas: 2,
                partos: 1,
                cesareas: 1,
                abortos: 0,
                hijosVivos: 2,
                hijosMuertos: 0,
                vidaSexualActiva: true,
                planificacionFamiliar: true,
                tipoPlanificacion: 'DIU',
                papanicolaou: { realizada: true, tiempo: '6 MESES', resultado: 'NEGATIVO (NORMAL)' },
                colposcopia: { realizada: false, resultado: 'NO APLICA' },
                mamografia: { realizada: true, tiempo: '1 AÑO', resultado: 'BIRADS 1' },
                ecoMamario: { realizada: false, resultado: 'NO APLICA' }
            },
            habitosToxicos: {
                tabaco: false,
                alcohol: false,
                drogas: false,
                actividadFisica: { tiene: true, cual: 'NATACIÓN Y TERAPIA FÍSICA', tiempo: '2 VECES POR SEMANA' },
                medicacionHabitual: { tiene: true, cual: 'MELOXICAM 15 MG (EN CRISIS)', tiempo: 'PRN' }
            },
            antecedentesFamiliares: {
                cardiovascular: true,
                descripcion: 'MADRE HIPERTENSA. PADRE CON DIABETES MELLITUS TIPO 2 EN TRATAMIENTO.'
            },
            factoresRiesgo: {
                puesto: 'LABORATORIO DE CIENCIAS QUÍMICAS',
                actividades: 'MANIPULACIÓN DE PIPETAS, REACTIVOS QUÍMICOS Y MICROSCOPÍA',
                fisico: ['Iluminación focalizada'],
                mecanico: ['Cortes por material de vidrio', 'Caídas al mismo nivel'],
                quimico: ['Vapores de solventes orgánicos', 'Ácidos diluidos'],
                biologico: ['Bacterias y cultivos microbianos'],
                ergonomico: ['Bipedestación prolongada', 'Manipulación de cargas manuales > 8kg'],
                psicosocial: ['Exigencia de precisión'],
                medidasPreventivas: '1.- Uso continuo de bata de laboratorio, guantes de nitrilo y gafas de seguridad. 2.- No levantar reactivos que superen los 5 kg individualmente. 3.- Banco ergonómico de laboratorio regulable.'
            },
            actividadesExtraLaborales: 'NO',
            enfermedadActual: 'PACIENTE REFIERE EPISODIOS INTERMITENTES DE DOLOR LUMBAR TRAS JORNADAS CON BIPEDESTACIÓN PROLONGADA EN LABORATORIO.',
            organosSistemas: { normal: true, descripcion: 'Aparato locomotor con contractura paravertebral lumbar. Resto normal.' },
            constantes: {
                pa: '122/80',
                temp: '36.5',
                fc: '78',
                satO2: '97',
                fr: '19',
                peso: '64',
                talla: '1.63',
                imc: '24.09',
                perimetroAbd: '79'
            },
            examenFisico: {
                normal: false,
                descripcion: 'Columna lumbosacra con dolor a la palpación en masa paravertebral L4-L5 bilateral. Maniobra de Lasègue negativa bilateral. Fuerza y reflejos conservados en miembros inferiores.'
            },
            examenesLab: [
                { examen: 'BIOMETRIA Y QUÍMICA HEPÁTICA/RENAL', fecha: '2026-09-02', resultado: 'NORMAL' },
                { examen: 'RX COLUMNA LUMBOSACRA AP Y LATERAL', fecha: '2026-09-02', resultado: 'LEVE DISMINUCIÓN ESPACIO L5-S1' },
                { examen: 'EMO COMPLETO', fecha: '2026-09-02', resultado: 'NEGATIVO' }
            ],
            diagnosticos: [
                { num: 1, desc: 'LUMBALGIA MECÁNICA NO ESPECIFICADA', cie: 'M54.5', pre: false, def: true }
            ],
            aptitudDetalle: {
                apto: false,
                aptoObservacion: true,
                aptoLimitaciones: true,
                noApto: false,
                observacion: 'Requiere adaptaciones ergonómicas en puesto de laboratorio',
                limitacion: 'Restricción de levantamiento de cargas mayores a 5 kg. Alternar bipedestación con sedestación.'
            },
            recomendaciones: [
                'NO LEVANTAR CARGAS SUPERIORES A 5 KG DE FORMA UNILATERAL',
                'ALTERNAR POSICIONES DE PIE Y SENTADA MEDIANTE TABURETE ERGONÓMICO DE LABORATORIO',
                'CONTINUAR TERAPIA DE FORTALECIMIENTO DE LA FAJA ABDOMINOLUMBAR',
                'USO DE FAJA LUMBAR DURANTE ACTIVIDADES DE ALMACÉN DE REACTIVOS',
                'CONTROL EN EL DEPARTAMENTO MÉDICO EN 6 MESES'
            ],
            profesional: {
                fecha: '2026-09-12',
                hora: '10:40',
                nombre: 'DR. JORGE MORALES',
                codigo: '1804486288'
            }
        },
        {
            id: 3,
            fecha: '2026-09-14',
            primerApellido: 'LÓPEZ',
            segundoApellido: 'MENDOZA',
            primerNombre: 'CARLOS',
            segundoNombre: 'ALBERTO',
            paciente: 'Carlos Alberto López Mendoza',
            cedula: '1798765432',
            tipo: 'Retiro',
            puesto: 'TÉCNICO DE MANTENIMIENTO E INFRAESTRUCTURA',
            cargo: 'TÉCNICO DE MANTENIMIENTO E INFRAESTRUCTURA',
            ciuo: 'C07',
            actividades: 'MANTENIMIENTO PREVENTIVO, ELÉCTRICO Y DE EDIFICACIONES EN CAMPUS',
            aptitud: 'Satisfactorio',
            estado: 'Completado',
            empresa: 'UNIVERSIDAD ESTATAL DE BOLIVAR',
            ruc: '0260000920001',
            ciiu: 'S/N',
            establecimiento: 'DEPARTAMENTO MEDICO U.E.B',
            numHistoriaClinica: '1798765432',
            numArchivo: 'RET-2026-003',
            sexo: 'M',
            edad: 46,
            religion: 'Católica',
            grupoSanguineo: 'O+',
            lateralidad: 'DIESTRO',
            orientacionSexual: 'Heterosexual',
            identidadGenero: 'Masculino',
            discapacidad: { tiene: false, tipo: '', porcentaje: '' },
            fechaIngreso: '2021-06-01',
            fechaRetiro: '2026-09-14',
            tiempoServicio: '5 AÑOS 3 MESES',
            causaRetiro: 'FINALIZACIÓN DE CONTRATO LABORAL POR PLAZO FIJO',
            telefono: '0998765432',
            motivoConsulta: 'EVALUACIÓN MÉDICA OCUPACIONAL DE RETIRO / CESE LABORAL POR CULMINACIÓN DE CONTRATO',
            antecedentesClinicos: 'HIPERTENSIÓN ARTERIAL GRADO I CONTROLADA CON TRATAMIENTO. NO ALERGIAS MEDICAMENTOSAS.',
            antecedentesQuirurgicos: 'HERNIORRAFIA INGUINAL DERECHA HACE 6 AÑOS SIN COMPLICACIONES NI SECUELAS.',
            habitosToxicos: {
                tabaco: false,
                alcohol: false,
                drogas: false,
                actividadFisica: { tiene: true, cual: 'CAMINATA DIARIA', tiempo: '45 MINUTOS AL DÍA' },
                medicacionHabitual: { tiene: true, cual: 'LOSARTÁN 50 MG', tiempo: 'CADA 24 HORAS' }
            },
            empleosAnteriores: [
                {
                    empresa: 'CONSTRUCTORA GUAYAQUIL S.A.',
                    puesto: 'TÉCNICO DE INSTALACIONES',
                    actividades: 'INSTALACIONES ELÉCTRICAS',
                    tiempo: '4 AÑOS',
                    riesgos: { fisico: true, mecanico: true, quimico: false, biologico: false, ergonomico: true, psicosocial: false },
                    observaciones: 'NINGUNA'
                }
            ],
            accidentesTrabajo: { calificado: false, fecha: '', especificaciones: '', observaciones: 'NINGUNA NOVEDAD DURANTE SU PERIODO EN LA UEB' },
            enfermedadesProfesionales: { calificado: false, fecha: '', especificaciones: '', observaciones: 'SIN ENFERMEDADES OCUPACIONALES DIAGNOSTICADAS' },
            antecedentesFamiliares: {
                cardiovascular: true,
                descripcion: 'PADRE CON ANTECEDENTE DE HIPERTENSIÓN ARTERIAL.'
            },
            factoresRiesgo: {
                puesto: 'UNIDAD DE MANTENIMIENTO CAMPUS MATRIZ',
                actividades: 'MANTENIMIENTO PREVENTIVO Y CORRECTIVO',
                fisico: ['Ruido de herramientas', 'Vibraciones'],
                mecanico: ['Caídas al mismo y distinto nivel', 'Golpes o cortes por herramientas manuales'],
                quimico: ['Polvo ambiental y partículas en suspensión'],
                biologico: ['Virus estacionales'],
                ergonomico: ['Manipulación manual de cargas', 'Posturas forzadas'],
                psicosocial: ['Exigencia de tiempo de respuesta'],
                medidasPreventivas: '1.- Uso constante de calzado dieléctrico con punta reforzada, guantes de protección mecánica, protección auditiva y casco de seguridad. 2.- Capacitación en técnicas de levantamiento de cargas. 3.- Se verificó cumplimiento regular de pausas activas durante su permanencia.'
            },
            actividadesExtraLaborales: 'NO',
            enfermedadActual: 'PACIENTE MASCULINO DE 46 AÑOS DE EDAD ACUDE PARA EVALUACIÓN MÉDICA OCUPACIONAL DE RETIRO. AL MOMENTO SE ENCUENTRA ASINTOMÁTICO, SIN REFERENCIA DE ACCIDENTES NI ENFERMEDADES OCUPACIONALES DURANTE SU TIEMPO LABORAL.',
            organosSistemas: {
                normal: true,
                descripcion: 'Aparatos respiratorio, cardiovascular y osteoarticular sin alteraciones patológicas atribuibles a su puesto.'
            },
            constantes: {
                pa: '122/78',
                temp: '36.5',
                fc: '74',
                satO2: '97',
                fr: '18',
                peso: '74',
                talla: '1.68',
                imc: '26.22',
                perimetroAbd: '86'
            },
            examenFisico: {
                normal: true,
                descripcion: 'Paciente consciente, orientado y en buen estado general. Cabeza y cuello normosómicos. Agudeza visual conservada con lentes correctores. Tórax simétrico, campos pulmonares limpios y murmullo vesicular presente. Corazón rítmico normofonético. Abdomen blando, depresible, no doloroso, cicatriz de herniorrafia inguinal derecha antigua sin eventración. Extremidades con tono, fuerza 5/5 y arcos de movilidad articular completos. Sin evidencia de secuelas laborales.'
            },
            examenesLab: [
                { examen: 'AUDIOMETRÍA TONAL DE RETIRO', fecha: '2026-09-12', resultado: 'AUDICIÓN NORMAL BILATERAL SIN DESPLAZAMIENTO DEL UMBRAL AUDITIVO' },
                { examen: 'RX TÓRAX POSTEROANTERIOR DE RETIRO', fecha: '2026-09-12', resultado: 'CAMPOS PULMONARES Y SENOS COSTOFRENICOS LIBRES. SILUETA NORMAL' },
                { examen: 'BIOMETRIA HEMATICA Y QUIMICA', fecha: '2026-09-12', resultado: 'GLUCOSA: 94 MG/DL, COLESTEROL: 185 MG/DL, TRIGLICÉRIDOS: 140 MG/DL' },
                { examen: 'EVALUACIÓN ESPINOMETRICA / OSTEOMUSCULAR', fecha: '2026-09-12', resultado: 'COLUMNA VERTEBRAL SIN ALTERACIONES FUNCIONALES NI LIMITACIÓN' }
            ],
            diagnosticos: [
                { num: 1, desc: 'EXAMEN MÉDICO DE RETIRO OCUPACIONAL', cie: 'Z02.7', pre: false, def: true },
                { num: 2, desc: 'HIPERTENSIÓN ESENCIAL (PRIMARIA) CONTROLADA (PATOLOGÍA COMÚN)', cie: 'I10', pre: false, def: true }
            ],
            condSalida: {
                satisfactorio: true,
                conPatologiaComun: false,
                conSecuelaLaboral: false,
                observacion: 'El servidor concluye su relación laboral en condiciones físicas y de salud satisfactorias, sin enfermedades profesionales ni secuelas originadas por el trabajo.',
                recomendacionLegal: 'El trabajador finaliza sus labores en la institución en condiciones físicas y de salud adecuadas para su reinserción laboral.'
            },
            recomendaciones: [
                'CONTINUAR CON CONTROLES MÉDICOS PERIÓDICOS DE SU HIPERTENSIÓN ARTERIAL CON SU MÉDICO DE CABECERA',
                'MANTENER DIETA HIPOSÓDICA Y HÁBITOS DE VIDA SALUDABLE CON ACTIVIDAD FÍSICA AERÓBICA REGULAR',
                'SE ENTREGA CONSTANCIA OFICIAL DE EVALUACIÓN MÉDICA OCUPACIONAL DE RETIRO AL TRABAJADOR'
            ],
            profesional: {
                fecha: '2026-09-14',
                hora: '10:30',
                nombre: 'DR. JORGE MORALES',
                codigo: '1804486288'
            }
        },
        {
            id: 4,
            fecha: '2026-09-15',
            primerApellido: 'ALARCÓN',
            segundoApellido: 'QUINATOA',
            primerNombre: 'PEDRO',
            segundoNombre: 'JAVIER',
            paciente: 'Pedro Javier Alarcón Quinatoa',
            cedula: '2015066720',
            tipo: 'Ingreso',
            puesto: 'PROFESOR OCASIONAL TIEMPO COMPLETO',
            cargo: 'PROFESOR OCASIONAL TIEMPO COMPLETO',
            ciuo: 'C02',
            actividades: 'DOCENCIA UNIVERSITARIA, CÁTEDRA E INVESTIGACIÓN FORMATIVA',
            aptitud: 'Apto',
            estado: 'Completado',
            empresa: 'UNIVERSIDAD ESTATAL DE BOLIVAR',
            ruc: '0260000920001',
            establecimiento: 'DEPARTAMENTO MEDICO U.E.B',
            numHistoriaClinica: '2015066720',
            numArchivo: 'DOC-2026-088',
            sexo: 'M',
            edad: 38,
            religion: 'Católica',
            grupoSanguineo: 'O+',
            lateralidad: 'DIESTRO',
            orientacionSexual: 'Heterosexual',
            identidadGenero: 'Masculino',
            discapacidad: { tiene: false, tipo: '', porcentaje: '' },
            fechaIngreso: '2026-09-15',
            telefono: '0983112233',
            motivoConsulta: 'EVALUACIÓN MÉDICA PREOCUPACIONAL PARA EL INGRESO A LA DOCENCIA UNIVERSITARIA',
            antecedentesClinicos: 'NO REFIERE ENFERMEDADES CRÓNICAS DEGNERATIVAS. VACUNACIÓN COMPLETA COVID-19 E INFLUENZA.',
            antecedentesQuirurgicos: 'APENDICECTOMÍA HACE 10 AÑOS SIN SECUELAS. NO ALERGIAS MEDICAMENTOSAS.',
            habitosToxicos: {
                tabaco: false,
                alcohol: false,
                drogas: false,
                actividadFisica: { tiene: true, cual: 'FÚTBOL Y TROTE', tiempo: '2 VECES POR SEMANA (2H)' },
                medicacionHabitual: { tiene: false, cual: '', tiempo: '' }
            },
            empleosAnteriores: [
                {
                    empresa: 'COLEGIO NACIONAL BOLÍVAR',
                    puesto: 'DOCENTE DE MATEMÁTICAS',
                    actividades: 'DOCENCIA Y EVALUACIÓN',
                    tiempo: '5 AÑOS',
                    riesgos: { fisico: true, mecanico: false, quimico: false, biologico: false, ergonomico: true, psicosocial: true },
                    observaciones: 'NINGUNA'
                }
            ],
            antecedentesFamiliares: {
                cardiovascular: true,
                descripcion: 'PADRE FALLECIDO POR INFARTO AGUDO DE MIOCARDIO. MADRE HIPERTENSA CONTROLADA.'
            },
            factoresRiesgo: {
                puesto: 'FACULTAD DE CIENCIAS DE LA SALUD Y EDUCACIÓN',
                actividades: 'DOCENCIA UNIVERSITARIA EN AULAS Y LABORATORIOS',
                fisico: ['Ruido ambiental en aulas', 'Variaciones térmicas'],
                mecanico: ['Caídas al mismo y distinto nivel por escaleras'],
                quimico: [],
                biologico: ['Virus respiratorios estacionales'],
                ergonomico: ['Bipedestación prolongada durante clases', 'Uso continuo de la voz'],
                psicosocial: ['Carga mental y atención a estudiantes'],
                medidasPreventivas: '1.- Técnicas de impostación y descanso vocal. 2.- Pausas activas y cambio postural durante clases magistrales. 3.- Ropa adecuada a los cambios de clima en el campus.'
            },
            actividadesExtraLaborales: 'NO',
            enfermedadActual: 'PACIENTE MASCULINO DE 38 AÑOS ACUDE PARA RECONOCIMIENTO PREOCUPACIONAL. SE ENCUENTRA ASINTOMÁTICO.',
            organosSistemas: { normal: true, descripcion: 'Aparatos y sistemas evaluados dentro de límites normales.' },
            constantes: {
                pa: '124/82',
                temp: '36.6',
                fc: '74',
                satO2: '97',
                fr: '18',
                peso: '74',
                talla: '1.72',
                imc: '25.01',
                perimetroAbd: '86'
            },
            examenFisico: {
                normal: true,
                descripcion: 'Paciente consciente, orientado. Oídos y faringe normales, cuerdas vocales sin ronquera evidente. Corazón rítmico, ruidos bien timbrados. Pulmones ventilados. Abdomen blando no doloroso. Pulsos periféricos simétricos.'
            },
            examenesLab: [
                { examen: 'BIOMETRIA HEMÁTICA COMPLETA', fecha: '2026-09-11', resultado: 'NORMAL (LEUCOCITOS 6.800, HB 15.2)' },
                { examen: 'GLUCOSA Y PERFIL LIPÍDICO', fecha: '2026-09-11', resultado: 'GLUCOSA 91 MG/DL, COLESTEROL 188 MG/DL' },
                { examen: 'RX TÓRAX POSTEROANTERIOR', fecha: '2026-09-11', resultado: 'CAMPOS PULMONARES Y SILUETA CARDÍACA NORMALES' }
            ],
            diagnosticos: [
                { num: 1, desc: 'EVALUACIÓN MÉDICA GENERAL OCUPACIONAL (PREOCUPACIONAL)', cie: 'Z00.0', pre: false, def: true }
            ],
            aptitudDetalle: {
                apto: true,
                aptoObservacion: false,
                aptoLimitaciones: false,
                noApto: false,
                observacion: 'Ninguna',
                limitacion: 'Uso adecuado de los Equipos de Protección Individual y cuidado de la voz'
            },
            recomendaciones: [
                'TÉCNICAS DE HIGIENE VOCAL E HIDRATACIÓN ABUNDANTE DURANTE DICTADO DE CLASES',
                'PAUSAS ACTIVAS DE 5 MINUTOS TRAS CADA HORA DE CÁTEDRA',
                'CONTROL CARDIOVASCULAR ANUAL POR ANTECEDENTE FAMILIAR',
                'SEGUIMIENTO MÉDICO PERIÓDICO EN LA UNIDAD DE SALUD OCUPACIONAL'
            ],
            profesional: {
                fecha: '2026-09-15',
                hora: '11:20',
                nombre: 'DR. JORGE MORALES',
                codigo: '1804486288'
            }
        },
        {
            id: 5,
            fecha: '2026-09-16',
            primerApellido: 'RAMOS',
            segundoApellido: 'GRIJALVA',
            primerNombre: 'CYNTHIA',
            segundoNombre: 'GABRIELA',
            paciente: 'Cynthia Gabriela Ramos Grijalva',
            cedula: '1803869492',
            tipo: 'Periódico',
            puesto: 'DOCENTE TITULAR A TIEMPO COMPLETO',
            cargo: 'DOCENTE TITULAR A TIEMPO COMPLETO',
            ciuo: 'C02',
            actividades: 'DOCENCIA DE PREGRADO, INVESTIGACIÓN Y GESTIÓN ACADÉMICA',
            aptitud: 'Apto',
            estado: 'Completado',
            empresa: 'UNIVERSIDAD ESTATAL DE BOLIVAR',
            ruc: '0260000920001',
            establecimiento: 'DEPARTAMENTO MEDICO U.E.B',
            numHistoriaClinica: '1803869492',
            numArchivo: 'DOC-2026-014',
            sexo: 'F',
            edad: 34,
            religion: 'Católica',
            grupoSanguineo: 'A+',
            lateralidad: 'DIESTRO',
            orientacionSexual: 'Heterosexual',
            identidadGenero: 'Femenino',
            discapacidad: { tiene: false, tipo: '', porcentaje: '' },
            fechaIngreso: '2021-03-01',
            telefono: '0995544332',
            motivoConsulta: 'EVALUACIÓN MÉDICA PERIÓDICA ANUAL DE CONTROL OCUPACIONAL',
            antecedentesClinicos: 'ASTIGMATISMO MIÓPICO BILATERAL CORREGIDO CON LENTES. CEFALEAS TENSIONALES OCASIONALES.',
            antecedentesQuirurgicos: 'NO REFIERE CIRUGÍAS PREVIAS. ALERGIA: AL POLVO Y ÁCAROS.',
            ginecoObstetricos: {
                menarquia: '12 AÑOS',
                ciclos: 'REGULARES',
                fum: '2026-08-25',
                gestas: 1,
                partos: 1,
                cesareas: 0,
                abortos: 0,
                hijosVivos: 1,
                hijosMuertos: 0,
                vidaSexualActiva: true,
                planificacionFamiliar: true,
                tipoPlanificacion: 'PRESERVATIVO',
                papanicolaou: { realizada: true, tiempo: '6 MESES', resultado: 'NORMAL' },
                colposcopia: { realizada: false, resultado: 'NO APLICA' },
                mamografia: { realizada: false, resultado: 'NO APLICA' },
                ecoMamario: { realizada: true, tiempo: '1 AÑO', resultado: 'NORMAL' }
            },
            habitosToxicos: {
                tabaco: false,
                alcohol: false,
                drogas: false,
                actividadFisica: { tiene: true, cual: 'PILATES Y YOGA', tiempo: '3 VECES POR SEMANA' },
                medicacionHabitual: { tiene: true, cual: 'PARACETAMOL 500 MG', tiempo: 'PRN (DOLOR CEFÁLICO)' }
            },
            antecedentesFamiliares: {
                cardiovascular: false,
                descripcion: 'ABUELA MATERNA CON DIABETES MELLITUS TIPO 2.'
            },
            factoresRiesgo: {
                puesto: 'FACULTAD DE CIENCIAS AGROPECUARIAS',
                actividades: 'DOCENCIA TEÓRICA Y FORMULACIÓN DE PROYECTOS EN COMPUTADOR',
                fisico: ['Iluminación de pantallas de visualización de datos (PVD)'],
                mecanico: ['Caídas al mismo nivel'],
                quimico: [],
                biologico: ['Virus estacionales'],
                ergonomico: ['Sedestación prolongada en escritorio', 'Uso repetitivo de mouse y teclado'],
                psicosocial: ['Exigencia académica y plazos de entrega'],
                medidasPreventivas: '1.- Regla 20-20-20 para descanso de acomodación ocular. 2.- Soporte ergonómico de muñeca y pantalla a nivel de los ojos. 3.- Pausas activas con estiramientos cervicales.'
            },
            actividadesExtraLaborales: 'NO',
            enfermedadActual: 'PACIENTE REFIERE LEVE FATIGA OCULAR AL FINALIZAR JORNADAS PROLONGADAS DE REVISIÓN DIGITAL DE TRABAJOS DE TITULACIÓN.',
            organosSistemas: { normal: true, descripcion: 'Órganos de los sentidos: leve hiperemia conjuntival bilateral. Resto sin patología.' },
            constantes: {
                pa: '115/75',
                temp: '36.4',
                fc: '72',
                satO2: '98',
                fr: '17',
                peso: '58',
                talla: '1.62',
                imc: '22.10',
                perimetroAbd: '74'
            },
            examenFisico: {
                normal: true,
                descripcion: 'Consciente y orientada. Ojos simétricos con uso de lentes correctores. Cuello móvil con leve tensión paravertebral trapecial bilateral. Ruidos cardíacos y respiratorios limpios. Abdomen blando no doloroso. Extremidades íntegras.'
            },
            examenesLab: [
                { examen: 'BIOMETRIA HEMÁTICA', fecha: '2026-09-05', resultado: 'NORMAL' },
                { examen: 'QUÍMICA SANGUÍNEA (GLUCOSA, UREA, CREATININA)', fecha: '2026-09-05', resultado: 'VALORES NORMALES' },
                { examen: 'EVALUACIÓN OFTALMOLÓGICA', fecha: '2026-09-05', resultado: 'AGUDEZA CORREGIDA 20/20' }
            ],
            diagnosticos: [
                { num: 1, desc: 'ASTENOPIA / FATIGA VISUAL OCUPACIONAL', cie: 'H53.1', pre: false, def: true },
                { num: 2, desc: 'CERVICALGIA TENSIONAL LEVE', cie: 'M54.2', pre: true, def: false }
            ],
            aptitudDetalle: {
                apto: true,
                aptoObservacion: false,
                aptoLimitaciones: false,
                noApto: false,
                observacion: 'Ninguna',
                limitacion: 'Uso de lentes de descanso con filtro de luz azul y pausas activas'
            },
            recomendaciones: [
                'APLICAR REGLA 20-20-20: CADA 20 MINUTOS MIRAR A 20 PIES (6 METROS) DURANTE 20 SEGUNDOS',
                'USO DE LÁGRIMAS ARTIFICIALES LUBRICANTES SEGÚN REQUERIMIENTO',
                'EJERCICIOS DE ESTIRAMIENTO DE CUELLO Y HOMBROS 3 VECES AL DÍA',
                'CONTROL OCUPACIONAL ANUAL DE AGUDEZA VISUAL'
            ],
            profesional: {
                fecha: '2026-09-16',
                hora: '12:00',
                nombre: 'DR. JORGE MORALES',
                codigo: '1804486288'
            }
        },
        {
            id: 6,
            fecha: '2026-09-18',
            primerApellido: 'VALDIVIESO',
            segundoApellido: 'CÁRDENAS',
            primerNombre: 'MARIANA',
            segundoNombre: 'DE JESÚS',
            paciente: 'Mariana de Jesús Valdivieso Cárdenas',
            cedula: '0201948571',
            tipo: 'Retiro',
            puesto: 'ASISTENTE ADMINISTRATIVA DE VICERRECTORADO',
            cargo: 'ASISTENTE ADMINISTRATIVA DE VICERRECTORADO',
            ciuo: 'C04',
            actividades: 'GESTIÓN DOCUMENTAL, ARCHIVO DIGITAL Y ATENCIÓN A USUARIOS',
            aptitud: 'Satisfactorio',
            estado: 'Completado',
            empresa: 'UNIVERSIDAD ESTATAL DE BOLIVAR',
            ruc: '0260000920001',
            ciiu: 'S/N',
            establecimiento: 'DEPARTAMENTO MEDICO U.E.B',
            numHistoriaClinica: '0201948571',
            numArchivo: 'RET-2026-006',
            sexo: 'F',
            edad: 34,
            religion: 'Católica',
            grupoSanguineo: 'A+',
            lateralidad: 'DIESTRO',
            orientacionSexual: 'Heterosexual',
            identidadGenero: 'Femenino',
            discapacidad: { tiene: false, tipo: '', porcentaje: '' },
            fechaIngreso: '2022-01-10',
            fechaRetiro: '2026-09-18',
            tiempoServicio: '4 AÑOS 8 MESES',
            causaRetiro: 'RENUNCIA VOLUNTARIA POR MOTIVOS PERSONALES',
            telefono: '0981948571',
            motivoConsulta: 'EVALUACIÓN MÉDICA OCUPACIONAL DE RETIRO / CESE LABORAL POR RENUNCIA VOLUNTARIA',
            antecedentesClinicos: 'GASTRITIS CRÓNICA SUPERFICIAL. ASTIGMATISMO MIOPE CORREGIDO CON LENTES. NO ALERGIAS MEDICAMENTOSAS.',
            antecedentesQuirurgicos: 'NO REFIERE CIRUGÍAS PREVIAS.',
            ginecoObstetricos: {
                menarquia: '12 AÑOS',
                ciclos: 'REGULARES',
                fum: '2026-09-02',
                gestas: 1,
                partos: 1,
                cesareas: 0,
                abortos: 0,
                hijosVivos: 1,
                hijosMuertos: 0,
                vidaSexualActiva: true,
                planificacionFamiliar: true,
                tipoPlanificacion: 'PRESERVATIVO',
                papanicolaou: { realizada: true, tiempo: '5 MESES', resultado: 'NEGATIVO (NORMAL)' },
                colposcopia: { realizada: false, resultado: 'NO APLICA' },
                mamografia: { realizada: false, resultado: 'NO APLICA' },
                ecoMamario: { realizada: true, tiempo: '1 AÑO', resultado: 'NORMAL SIN HALLAZGOS' }
            },
            habitosToxicos: {
                tabaco: false,
                alcohol: false,
                drogas: false,
                actividadFisica: { tiene: true, cual: 'PILATES Y CAMINATA', tiempo: '3 VECES POR SEMANA' },
                medicacionHabitual: { tiene: false, cual: '', tiempo: '' }
            },
            accidentesTrabajo: { calificado: false, fecha: '', especificaciones: '', observaciones: 'SIN ANTECEDENTES DE ACCIDENTES LABORALES EN LA UEB' },
            enfermedadesProfesionales: { calificado: false, fecha: '', especificaciones: '', observaciones: 'SIN ENFERMEDADES OCUPACIONALES REGISTRADAS' },
            antecedentesFamiliares: {
                cardiovascular: false,
                descripcion: 'MADRE VIVA SANA. PADRE CON HIPERTENSIÓN ARTERIAL.'
            },
            factoresRiesgo: {
                puesto: 'VICERRECTORADO ACADÉMICO',
                actividades: 'GESTIÓN DOCUMENTAL Y REDACCIÓN EN COMPUTADOR',
                fisico: ['Iluminación de pantallas de visualización de datos (PVD)'],
                mecanico: ['Caídas al mismo nivel'],
                quimico: [],
                biologico: ['Virus estacionales'],
                ergonomico: ['Sedestación prolongada', 'Movimientos repetitivos de digitación'],
                psicosocial: ['Atención al público'],
                medidasPreventivas: '1.- Uso de descansapies y soporte ergonómico para teclado y mouse. 2.- Pausas activas visuales y musculares. 3.- Higiene postural.'
            },
            actividadesExtraLaborales: 'NO',
            enfermedadActual: 'FUNCIONARIA EN PROCESO DE CESE POR RENUNCIA VOLUNTARIA ACUDE A EVALUACIÓN MÉDICA OCUPACIONAL. ASINTOMÁTICA AL MOMENTO DE LA CONSULTA.',
            organosSistemas: {
                normal: true,
                descripcion: 'Aparatos y sistemas evaluados sin sintomatología aguda ni secuelas laborales.'
            },
            constantes: {
                pa: '116/74',
                temp: '36.4',
                fc: '70',
                satO2: '98',
                fr: '17',
                peso: '59',
                talla: '1.61',
                imc: '22.76',
                perimetroAbd: '75'
            },
            examenFisico: {
                normal: true,
                descripcion: 'Paciente lúcida, orientada temporo-espacialmente. Mucosas húmedas y normocoloreadas. Cuello sin adenopatías ni bocio, movimientos de flexo-extensión y rotación conservados. Cardiopulmonar normal sin ruidos sobreagregados. Abdomen suave, depresible, no doloroso a la palpación profunda. Miembros superiores e inferiores íntegros, reflejos osteotendinosos presentes y simétricos, fuerza muscular 5/5. Sin signos de síndrome de túnel carpiano (Phalen y Tinel negativos bilateral).'
            },
            examenesLab: [
                { examen: 'BIOMETRIA HEMÁTICA DE RETIRO', fecha: '2026-09-15', resultado: 'VALORES HEMATOLÓGICOS DENTRO DE LÍMITES NORMALES' },
                { examen: 'QUÍMICA SANGUÍNEA Y EMO', fecha: '2026-09-15', resultado: 'GLUCOSA: 88 MG/DL, FUNCIÓN RENAL NORMAL, EMO SIN ALTERACIONES' },
                { examen: 'AUDIOMETRÍA OCUPACIONAL DE SALIDA', fecha: '2026-09-15', resultado: 'CAPACIDAD AUDITIVA BILATERAL CONSERVADA (NORMOUDIENTE)' },
                { examen: 'EVALUACIÓN DE MIEMBROS SUPERIORES', fecha: '2026-09-15', resultado: 'MANIOBRAS DE PHALEN Y TINEL NEGATIVAS BILATERAL' }
            ],
            diagnosticos: [
                { num: 1, desc: 'EXAMEN MÉDICO DE RETIRO OCUPACIONAL', cie: 'Z02.7', pre: false, def: true },
                { num: 2, desc: 'ASTIGMATISMO MIOPE (PATOLOGÍA COMÚN CORREGIDA)', cie: 'H52.2', pre: false, def: true }
            ],
            condSalida: {
                satisfactorio: true,
                conPatologiaComun: false,
                conSecuelaLaboral: false,
                observacion: 'La servidora concluye sus funciones en la institución en óptimas condiciones de salud, sin secuelas ni afecciones vinculadas a sus labores.',
                recomendacionLegal: 'El trabajador finaliza sus labores en la institución en condiciones físicas y de salud adecuadas para su reinserción o cese.'
            },
            recomendaciones: [
                'CONTINUAR CON ESTILO DE VIDA SALUDABLE Y CHEQUEOS MÉDICOS PREVENTIVOS ANUALES',
                'SEGUIMIENTO OFTALMOLÓGICO ANUAL PARA CONTROL DE LENTES CORRECTORES',
                'SE EMITE Y ENTREGA CERTIFICADO MÉDICO DE RETIRO A LA INTERESADA'
            ],
            profesional: {
                fecha: '2026-09-18',
                hora: '11:15',
                nombre: 'DR. JORGE MORALES',
                codigo: '1804486288'
            }
        },
        { id: 7, fecha: '2026-09-19', paciente: 'Patricia Guamán Paredes', cedula: '0201889923', tipo: 'Gestante', puesto: 'Docente Ocasional', aptitud: 'Apto con Restricción', estado: 'Completado' },
        { id: 8, fecha: '2026-09-20', paciente: 'Sofía Paredes Montero', cedula: '0202114455', tipo: 'Lactante', puesto: 'Analista Financiera', aptitud: 'Apto', estado: 'Completado' },
        { id: 9, fecha: '2026-09-21', paciente: 'Roberto Silva Saltos', cedula: '0201654321', tipo: 'Discapacidad', puesto: 'Especialista en TIC', aptitud: 'Apto con Adaptación', estado: 'Completado' },
        { id: 10, fecha: '2026-09-22', paciente: 'Daniela Ortiz Ramos', cedula: '0201778899', tipo: 'Discapacidad', puesto: 'Bibliotecaria Universitaria', aptitud: 'Apto', estado: 'Completado' },
        { id: 11, fecha: '2026-09-23', paciente: 'Carlos Manuel Domínguez', cedula: '0201393659', tipo: 'Discapacidad', puesto: 'Docente de Agronomía', aptitud: 'Apto con Restricción', estado: 'Completado' }
    ]);

    const [reintegrosData, setReintegrosData] = useState([
        {
            id: 1,
            fecha: '2026-01-19',
            primerApellido: 'AGUALONGO',
            segundoApellido: 'AREVALO',
            primerNombre: 'MYRIAN',
            segundoNombre: 'DEL ROCIO',
            paciente: 'AGUALONGO AREVALO MYRIAN DEL ROCIO',
            cedula: '0201575900',
            sexo: 'F',
            edad: 41,
            puesto: 'C06',
            fechaUltimoDia: '2025-10-13',
            fechaReintegro: '2026-01-19',
            dias: 95,
            causaSalida: 'LICENCIA POR MATERNIDAD',
            motivo: 'EVALUACIÓN MÉDICA DE REINTEGRO EN EL PUESTO DE TRABAJO',
            enfermedadActual: 'Paciente acude para la valoracion medica de reintegro, al momento en buenas condiciones generales niega molestias.',
            constantes: {
                pa: '118/77',
                temp: '34,8',
                fc: '100',
                satO2: '92',
                fr: '20',
                peso: '52',
                talla: '1,46',
                imc: '30,00',
                novedades: ''
            },
            examenFisico: {
                extremidades: 'DOLOR DE TOBILLO'
            },
            examenesLab: [
                { examen: 'BIOMETRIA', fecha: '', resultado: 'PENDIENTE RESULTADOS DE EXÁMENES' },
                { examen: 'QUIMICA', fecha: '', resultado: 'PENDIENTE RESULTADOS DE EXÁMENES' },
                { examen: 'COPROPARASITARIO', fecha: '', resultado: 'PENDIENTE RESULTADOS DE EXÁMENES' },
                { examen: 'EMO', fecha: '', resultado: 'PENDIENTE RESULTADOS DE EXÁMENES' },
                { examen: 'RX DE AP Y LATERAL DE TOBILLO', fecha: '', resultado: 'NO APLICA' }
            ],
            diagnosticos: [
                { num: 1, desc: 'SEGUIMIENTO POSTPARTO DE RUTINA', cie: 'Z392', pre: false, def: true },
                { num: 2, desc: 'ATENCION Y EXAMEN DE MADRE EN PERIODO DE LACTANCIA', cie: 'Z391', pre: false, def: true }
            ],
            diagnostico: 'SEGUIMIENTO POSTPARTO DE RUTINA / ATENCION MADRE EN PERIODO LACTANCIA',
            tipo: 'Total',
            aptitud: 'Apto',
            aptitudDetalle: {
                apto: true,
                observacion: 'NINGUNA',
                limitacion: 'NINGUNA',
                reubicacion: 'NINGUNA'
            },
            recomendaciones: [
                '1.- MEDIDAS GENERALES',
                '2.- ALIMENTACION SALUDABLE',
                '3.- EVITAR REALIZAR ESFUERZO FISICO',
                '4.- CONSUMO DE LIQUIDOS',
                '5.- EN CASO DE PRESENTAR ALGUNA MOLESTIA ACUDIR AL MEDICO OCUPACIONAL DE LA U.E.B'
            ],
            profesional: {
                fecha: '2026-01-19',
                hora: '11:29',
                nombre: 'JORGE MORALES',
                codigo: '20191823'
            },
            estado: 'Aprobado'
        },
        {
            id: 2,
            fecha: '2026-09-08',
            primerApellido: 'GÓMEZ',
            segundoApellido: 'CHÁVEZ',
            primerNombre: 'ANA',
            segundoNombre: 'MARÍA',
            paciente: 'GÓMEZ CHÁVEZ ANA MARÍA',
            cedula: '1755443322',
            sexo: 'F',
            edad: 36,
            puesto: 'Secretaria General',
            fechaUltimoDia: '2026-08-20',
            fechaReintegro: '2026-09-08',
            dias: 15,
            causaSalida: 'INCAPACIDAD TEMPORAL',
            motivo: 'EVALUACIÓN MÉDICA DE REINTEGRO POR PATOLOGÍA OSTEOMUSCULAR',
            enfermedadActual: 'Paciente con evolución favorable post reposo médico por dolor articular.',
            constantes: { pa: '120/80', temp: '36,5', fc: '76', satO2: '98', fr: '18', peso: '60', talla: '1,60', imc: '23,44', novedades: '' },
            examenFisico: { extremidades: 'Movilidad articular conservada, maniobra de Phalen negativa.' },
            examenesLab: [{ examen: 'ELECTROMIOGRAFIA', fecha: '2026-09-01', resultado: 'NORMAL' }],
            diagnosticos: [{ num: 1, desc: 'SDR DE TÚNEL CARPIANO', cie: 'G560', pre: false, def: true }],
            diagnostico: 'SDR de Túnel Carpiano',
            tipo: 'Total',
            aptitud: 'Apto con Adaptación',
            aptitudDetalle: { apto: false, limitacion: 'Evitar digitación continua > 2 horas sin pausa', observacion: 'Pausas activas', reubicacion: 'NINGUNA' },
            recomendaciones: ['1.- Pausas activas cada 2 horas', '2.- Uso de mousepad ergonómico', '3.- Control médico en 6 meses'],
            profesional: { fecha: '2026-09-08', hora: '09:15', nombre: 'JORGE MORALES', codigo: '20191823' },
            estado: 'Aprobado'
        },
        {
            id: 3,
            fecha: '2026-09-11',
            primerApellido: 'TORRES',
            segundoApellido: 'MENDOZA',
            primerNombre: 'LUIS',
            segundoNombre: 'ALBERTO',
            paciente: 'TORRES MENDOZA LUIS ALBERTO',
            cedula: '1744332211',
            sexo: 'M',
            edad: 45,
            puesto: 'Operario de Bodega',
            fechaUltimoDia: '2026-08-10',
            fechaReintegro: '2026-09-11',
            dias: 30,
            causaSalida: 'CIRUGIA / REPOSO MEDICO',
            motivo: 'EVALUACIÓN MÉDICA DE REINTEGRO PROGRESIVO',
            enfermedadActual: 'Paciente acude tras reposo por lumbalgia mecánica severa.',
            constantes: { pa: '125/82', temp: '36,6', fc: '80', satO2: '97', fr: '19', peso: '78', talla: '1,70', imc: '26,99', novedades: '' },
            examenFisico: { extremidades: 'Fuerza muscular 4/5 en miembros inferiores.' },
            examenesLab: [{ examen: 'RMN COLUMNA LUMBAR', fecha: '2026-08-15', resultado: 'HERNIA DISCAL L4-L5' }],
            diagnosticos: [{ num: 1, desc: 'HERNIA DISCAL L4-L5', cie: 'M512', pre: false, def: true }],
            diagnostico: 'Hernia Discal L4-L5',
            tipo: 'Progresivo',
            aptitud: 'En Evaluación',
            aptitudDetalle: { apto: false, limitacion: 'No levantar cargas superiores a 10 kg', observacion: 'Reubicación temporal', reubicacion: 'Actividades de supervisión' },
            recomendaciones: ['1.- Evitar levantamiento de cargas pesadas', '2.- Fisioterapia de mantenimiento', '3.- Reevaluación en 30 días'],
            profesional: { fecha: '2026-09-11', hora: '10:30', nombre: 'JORGE MORALES', codigo: '20191823' },
            estado: 'Pendiente'
        }
    ]);

    const [examenesData, setExamenesData] = useState([
        {
            id: 1,
            fecha: '2026-09-05',
            paciente: 'Roberto Silva',
            cedula: '1723456789',
            examen: 'Audiometría Tonal Ocupacional',
            motivo: 'Vigilancia por Exposición a Ruido en Talleres',
            laboratorio: 'Laboratorio Ocupacional Institucional',
            prioridad: 'Normal',
            estado: 'Realizado',
            resultado: 'Audición conservación bilateral normal (0-20 dB)'
        },
        {
            id: 2,
            fecha: '2026-09-13',
            paciente: 'Elena Morales',
            cedula: '1718902341',
            examen: 'Espirometría Simple Ocupacional',
            motivo: 'Control de Exposición a Polvos & Solventes',
            laboratorio: 'Centro Diagnóstico Convenio',
            prioridad: 'Alta',
            estado: 'Pendiente',
            resultado: 'Pendiente de emisión por laboratorio'
        },
        {
            id: 3,
            fecha: '2026-09-14',
            paciente: 'Carlos Mendoza Ruiz',
            cedula: '1723456789',
            examen: 'Biometría Hemática + Perfil Lipídico',
            motivo: 'Evaluación Periódica Anual',
            laboratorio: 'Laboratorio Central Universitario',
            prioridad: 'Normal',
            estado: 'Realizado',
            resultado: 'Glucosa: 88 mg/dL | Colesterol Total: 175 mg/dL (Valores Normales)'
        }
    ]);

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
    const [activeBookArea, setActiveBookArea] = useState('medicina');
    const [activeBookRecord, setActiveBookRecord] = useState(null);
    const [historyPage, setHistoryPage] = useState(1);
    const HISTORY_PER_PAGE = 5;

    const [evolucionForm, setEvolucionForm] = useState({
        fecha: new Date().toISOString().split('T')[0],
        detalle_evolucion: '',
        prescripcion_medica: ''
    });

    const [areaHistories, setAreaHistories] = useState({
        ocupacional: [
            {
                id: 'evo-ocu-1',
                fecha: '2026-09-10',
                recordTitle: 'Control Aptitud Ocupacional',
                type: 'ocupacional',
                detalle_evolucion: 'Paciente refiere mejoría en sintomatología lumbar tras adaptación ergonómica de su puesto. Pausas activas cumplidas adecuadamente.',
                prescripcion_medica: 'Mantener pausas activas de 5 min por hora. Continuar con silla ergonómica.',
                medico: 'Dr. Medicina Ocupacional'
            },
            {
                id: 'evo-ocu-2',
                fecha: '2026-09-14',
                recordTitle: 'Seguimiento Reintegro Laboral',
                type: 'ocupacional',
                detalle_evolucion: 'Evaluación de reintegro post-incapacidad por túnel carpiano. Fuerza de prensión conservada sin dolor agudo al movimiento.',
                prescripcion_medica: 'Uso de férula de reposo nocturno. Control en 15 días.',
                medico: 'Dr. Medicina Ocupacional'
            }
        ],
        medicina: [
            {
                id: 'evo-med-1',
                fecha: '2026-09-02',
                recordTitle: 'Consulta General',
                type: 'medicina',
                detalle_evolucion: 'Cefalea tensional ocasional asociada a fatiga laboral. PA: 120/80 mmHg.',
                prescripcion_medica: 'Paracetamol 500mg VO cada 8 horas si hay dolor.',
                medico: 'Dr. Medicina General'
            }
        ],
        psicologia: [
            {
                id: 'evo-psi-1',
                fecha: '2026-08-25',
                recordTitle: 'Sesión Psicológica Ocupacional',
                type: 'psicologia',
                detalle_evolucion: 'Sesión de manejo de estrés laboral y técnicas de relajación diafragmática.',
                prescripcion_medica: 'Pautas de higiene del sueño y desconexión digital.',
                medico: 'Psic. Clínica'
            }
        ],
        odontologia: [
            {
                id: 'evo-odo-1',
                fecha: '2026-08-15',
                recordTitle: 'Control Odontológico Periódico',
                type: 'odontologia',
                detalle_evolucion: 'Profilaxis dental realizada. Sin caries activas detectadas.',
                prescripcion_medica: 'Uso de hilo dental diario y enjuague fluorado.',
                medico: 'Dra. Odontología'
            }
        ],
        enfermeria: [
            {
                id: 'evo-enf-1',
                fecha: '2026-09-01',
                recordTitle: 'Toma de Signos & Vacunación',
                type: 'enfermeria',
                detalle_evolucion: 'Administración de dosis de refuerzo vacuna Tétanos-Difteria (Td).',
                prescripcion_medica: 'Compresas frías en sitio de punción si presenta molestia.',
                medico: 'Lic. Enfermería'
            }
        ]
    });

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
            fecha: new Date().toISOString().split('T')[0],
            detalle_evolucion: '',
            prescripcion_medica: ''
        });

        alert('¡Nota de evolución registrada exitosamente!');
    };

    // Mock stock catalog for Farmacia de Enfermería
    const MOCK_FARMACIA_STOCK = [
        { id: 101, codigo: 'FAR-001', nombre: 'Paracetamol 500mg Tabletas', presentacion: 'Caja x 20 comprimidos', stock_cajas: 35, stock_unidades: 700, via: 'Oral' },
        { id: 102, codigo: 'FAR-002', nombre: 'Ibuprofeno 400mg Comprimidos', presentacion: 'Caja x 10 comprimidos', stock_cajas: 22, stock_unidades: 220, via: 'Oral' },
        { id: 103, codigo: 'FAR-003', nombre: 'Amoxicilina 500mg Cápsulas', presentacion: 'Caja x 12 cápsulas', stock_cajas: 15, stock_unidades: 180, via: 'Oral' },
        { id: 104, codigo: 'FAR-004', nombre: 'Diclofenaco Sódico 75mg Ampollas', presentacion: 'Caja x 5 ampollas', stock_cajas: 8, stock_unidades: 40, via: 'Intramuscular' },
        { id: 105, codigo: 'FAR-005', nombre: 'Omeprazol 20mg Cápsulas', presentacion: 'Frasco x 14 cápsulas', stock_cajas: 19, stock_unidades: 266, via: 'Oral' },
        { id: 106, codigo: 'FAR-006', nombre: 'Salbutamol 100mcg Inhalador', presentacion: 'Inhalador 200 dosis', stock_cajas: 5, stock_unidades: 5, via: 'Inhalatoria' },
        { id: 107, codigo: 'FAR-007', nombre: 'Loratadina 10mg Tabletas', presentacion: 'Caja x 10 comprimidos', stock_cajas: 40, stock_unidades: 400, via: 'Oral' },
        { id: 108, codigo: 'FAR-008', nombre: 'Complejo B Inyectable', presentacion: 'Caja x 3 ampollas', stock_cajas: 0, stock_unidades: 0, via: 'Intramuscular' }
    ];

    // Recetario & Prescripción State
    const [prescripcionesList, setPrescripcionesList] = useState([]);
    const [prescripcionForm, setPrescripcionForm] = useState({
        detalle_medicamento: '',
        dosis: '',
        via: 'Oral',
        frecuencia: '8',
        duracion: '3',
        cantidad_cajas: '1',
        cantidad_unidades: '0',
        disponible_farmacia: 'farmacia',
        observaciones: '',
        observacion_nodisponible: '',
        id_producto_farmacia: null
    });
    const todayStr = new Date().toISOString().slice(0, 10);
    const [activeReportSubTab, setActiveReportSubTab] = useState('diario');
    const isMatricesCat = ['catastroficas', 'accidentes', 'covid', 'ausentismo', 'embarazadas', 'psicosocial', 'enfermedades_nuevas', 'examenes_periodicos', 'discapacidad', 'vulnerables_patologias', 'personal_nuevo'].includes(activeReportSubTab);

    // State for Exámenes & Laboratorio Ocupacional
    const [activeLabCatTab, setActiveLabCatTab] = useState('todos');
    const [labItemSearchModal, setLabItemSearchModal] = useState('');
    const [examReportDate, setExamReportDate] = useState(new Date().toISOString().split('T')[0]);
    const [useExamDateFilter, setUseExamDateFilter] = useState(true);
    const [selectedExams, setSelectedExams] = useState(['Hemograma Completo', 'Audiometría Tonal Ocupacional', 'Colesterol', 'Triglicéridos']);
    const [customExamNotes, setCustomExamNotes] = useState('');

    const [examOrdersData, setExamOrdersData] = useState([
        {
            id: 1,
            fecha: new Date().toISOString().split('T')[0],
            paciente: 'Carlos Eduardo Ramírez',
            cedula: '0201234567',
            edad: '38 años',
            medicoSolicitante: 'Dr. Jorge Morales Torres',
            selectedExams: ['Hemograma Completo', 'Audiometría Tonal Ocupacional', 'Colesterol', 'Triglicéridos'],
            otrosExamenes: '',
            examen: 'Hemograma Completo, Colesterol, Triglicéridos...',
            motivo: 'Examen Periódico Ocupacional / Control Anual',
            laboratorio: 'Laboratorio Central Universitario UEB',
            prioridad: 'Normal',
            estado: 'Completado'
        },
        {
            id: 2,
            fecha: new Date().toISOString().split('T')[0],
            paciente: 'Ana Lucía Benavides',
            cedula: '0209876543',
            edad: '29 años',
            medicoSolicitante: 'Dr. Jorge Morales Torres',
            selectedExams: ['Espirometría Simple Ocupacional', 'Hemograma Completo', 'Glucosa'],
            otrosExamenes: '',
            examen: 'Espirometría Simple, Hemograma, Glucosa',
            motivo: 'Evaluación Espirométrica por Exposición a Polvos',
            laboratorio: 'Laboratorio Central Universitario UEB',
            prioridad: 'Alta',
            estado: 'Pendiente'
        },
        {
            id: 3,
            fecha: '2026-09-14',
            paciente: 'Roberto Carlos Mendoza',
            cedula: '0987654321',
            edad: '44 años',
            medicoSolicitante: 'Dr. Jorge Morales Torres',
            selectedExams: ['Hemograma Completo', 'Glucosa', 'Urea', 'Creatinina', 'Colesterol', 'HDL Colesterol', 'Triglicéridos', 'Físico, Químico y Sedimento'],
            otrosExamenes: '',
            examen: '8 Exámenes (Perfil Periódico Ocupacional Base)',
            motivo: 'Control Clínico Anual de Salud Ocupacional',
            laboratorio: 'Laboratorio Central Universitario UEB',
            prioridad: 'Normal',
            estado: 'Completado'
        }
    ]);

    // State for Matriz de Enfermedades Catastróficas o Huérfanas (UEB 2026)
    const [catastrophicSearchTerm, setCatastrophicSearchTerm] = useState('');
    const [catastrophicTabFilter, setCatastrophicTabFilter] = useState('todos');
    const [isCatastrophicModalOpen, setIsCatastrophicModalOpen] = useState(false);
    const [catastrophicForm, setCatastrophicForm] = useState({
        paciente: '',
        cedula: '',
        tipoEnfermedad: 'CÁNCER DE TIROIDES',
        clasificacion: 'Catastrófica',
        fechaDiagnostico: new Date().toISOString().split('T')[0],
        cargo: 'DOCENTE TITULAR',
        recibioTratamiento: 'SI',
        novedades: 'CONTROL Y SEGUIMIENTO'
    });

    const [catastroficasData, setCatastroficasData] = useState([
        {
            id: 1,
            numero: 1,
            paciente: 'AYALA GAVILANES DIANA CATALINA',
            cedula: '0201234567',
            tipoEnfermedad: 'CÁNCER DE TIROIDES / TUMOR HIPOFISIARIO',
            clasificacion: 'Catastrófica',
            fechaDiagnostico: '26/12/2014 - 20/03/2020',
            cargo: 'DOCENTE TITULAR',
            recibioTratamiento: 'SI',
            novedades: 'PENDIENTE CONTROLES CON ENDOCRINOLOGÍA'
        },
        {
            id: 2,
            numero: 2,
            paciente: 'MÁS CAMACHO MARÍA ROSA',
            cedula: '0202345678',
            tipoEnfermedad: 'CÁNCER DE MAMA',
            clasificacion: 'Catastrófica',
            fechaDiagnostico: 'mar-18',
            cargo: 'DOCENTE OCASIONAL',
            recibioTratamiento: 'SI',
            novedades: 'CONTROL Y SEGUIMIENTO'
        },
        {
            id: 3,
            numero: 3,
            paciente: 'BONILLA ROLDÁN MARÍA DE LOS ÁNGELES',
            cedula: '0203456789',
            tipoEnfermedad: 'CÁNCER DE TIROIDES',
            clasificacion: 'Catastrófica',
            fechaDiagnostico: 'nov-18',
            cargo: 'DOCENTE OCASIONAL',
            recibioTratamiento: 'SI',
            novedades: 'CONTROL Y SEGUIMIENTO'
        },
        {
            id: 4,
            numero: 4,
            paciente: 'AGUALONGO ARÉVALO MYRIAN DEL ROCÍO',
            cedula: '0204567890',
            tipoEnfermedad: 'CÁNCER DE TIROIDES',
            clasificacion: 'Catastrófica',
            fechaDiagnostico: 'nov-18',
            cargo: 'ANALISTA DE GESTIÓN ADMINISTRATIVA',
            recibioTratamiento: 'SI',
            novedades: 'CONTROL Y SEGUIMIENTO'
        }
    ]);

    // State for Matriz de Accidentes Laborales y Enfermedades Profesionales (UEB 2026)
    const [accidenteSearchTerm, setAccidenteSearchTerm] = useState('');
    const [accidenteTabFilter, setAccidenteTabFilter] = useState('todos');
    const [isAccidenteModalOpen, setIsAccidenteModalOpen] = useState(false);
    const [accidenteForm, setAccidenteForm] = useState({
        paciente: '',
        cedula: '',
        cargo: 'ANALISTA DE MANTENIMIENTO',
        fechaAccidente: new Date().toISOString().split('T')[0],
        lugar: 'TALLER DE MANTENIMIENTO',
        tipoAccidente: 'CORTE CON HERRAMIENTA EN MANO DERECHA',
        diagnostico: 'HERIDA CORTANTE EN PALMA DERECHA - REQUIRIÓ SUTURA',
        diasIncapacidad: '3 DÍAS',
        gravedad: 'LEVE',
        novedades: 'REPOSO MÉDICO FINALIZADO Y REINCORPORACIÓN COMPLETA'
    });

    const [accidentesLaboralesData, setAccidentesLaboralesData] = useState([
        {
            id: 1,
            numero: 1,
            paciente: 'RAMOS ZURITA EDISON MARCELO',
            cedula: '0201458963',
            cargo: 'ANALISTA DE MANTENIMIENTO',
            fechaAccidente: '15/02/2026 10:30',
            lugar: 'TALLER DE MANTENIMIENTO Y SERVICIOS GENERALES',
            tipoAccidente: 'CORTE EN MANO DERECHA CON HERRAMIENTA',
            diagnostico: 'HERIDA CORTANTE EN PALMA DERECHA - REQUIRIÓ SUTURA',
            diasIncapacidad: '3 DÍAS',
            gravedad: 'LEVE',
            novedades: 'REPOSO MÉDICO FINALIZADO Y REINCORPORACIÓN COMPLETA'
        },
        {
            id: 2,
            numero: 2,
            paciente: 'QUISHPE LARA JORGE ENRIQUE',
            cedula: '0201784512',
            cargo: 'DOCENTE INVESTIGADOR / LABORATORIOS',
            fechaAccidente: '04/04/2026 14:15',
            lugar: 'LABORATORIO DE QUÍMICA APLICADA',
            tipoAccidente: 'SALPICADURA DE REACTIVO LÍQUIDO',
            diagnostico: 'IRRITACIÓN OCULAR LEVE EN OJO IZQUIERDO',
            diasIncapacidad: '1 DÍA',
            gravedad: 'LEVE',
            novedades: 'ATENCIÓN INMEDIATA CON LAVADO Y SEGUIMIENTO OK'
        },
        {
            id: 3,
            numero: 3,
            paciente: 'SANTILLÁN MORA BEATRIZ ELIZABETH',
            cedula: '0200987456',
            cargo: 'ANALISTA DE GESTIÓN ADMINISTRATIVA',
            fechaAccidente: '10/05/2026 09:45',
            lugar: 'ESCALERAS PRINCIPALES DEL EDIFICIO ADMINISTRATIVO',
            tipoAccidente: 'CAÍDA A MISMO NIVEL POR TROPIEZO',
            diagnostico: 'ESGUINCE DE TOBILLO DERECHO GRADO I',
            diasIncapacidad: '5 DÍAS',
            gravedad: 'GRAVE CON INCAPACIDAD',
            novedades: 'INFORME ENVIADO AL IESS SALUD OCUPACIONAL'
        }
    ]);

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

    const [discapacidadData, setDiscapacidadData] = useState([
        { id: 1, numero: 1, paciente: 'ACEBEDO DEL VALLE GINA MARISOL', cedula: '0201234567', tipoDiscapacidad: 'FÍSICA', porcentaje: '40%', cargo: 'DOCENTE TITULAR', dependencia: 'FACULTAD DE CIENCIAS ADMINISTRATIVAS', condicionLaboral: 'NOMBRAMIENTO' },
        { id: 2, numero: 2, paciente: 'ARREGUIN SÁMANO MOISES', cedula: '0202345678', tipoDiscapacidad: 'VISUAL', porcentaje: '75%', cargo: 'DOCENTE TITULAR', dependencia: 'FACULTAD DE CIENCIAS DE LA SALUD Y DEL SER HUMANO', condicionLaboral: 'NOMBRAMIENTO' },
        { id: 3, numero: 3, paciente: 'ALVAREZ MORA CHRISTIAN FERNADO', cedula: '0203456789', tipoDiscapacidad: 'FÍSICA', porcentaje: '49%', cargo: 'ADMINISTRATIVO', dependencia: 'SERVICIOS INSTITUCIONALES', condicionLaboral: 'NOMBRAMIENTO' },
        { id: 4, numero: 4, paciente: 'BALLESTEROS JIMÉNEZ ROCÍO DE LAS MERCEDES', cedula: '0204567890', tipoDiscapacidad: 'VISUAL', porcentaje: '46%', cargo: 'DOCENTE TITULAR', dependencia: 'FACULTAD DE JURISPRUDENCIA', condicionLaboral: 'NOMBRAMIENTO' },
        { id: 5, numero: 5, paciente: 'BARRAGAN NARANJO ROLANDO GEOVANNY', cedula: '0205678901', tipoDiscapacidad: 'FÍSICA', porcentaje: '33%', cargo: 'OPERATIVO', dependencia: 'SERVICIOS INSTITUCIONALES', condicionLaboral: 'NOMBRAMIENTO' },
        { id: 6, numero: 6, paciente: 'BONILLA ALARCON LUIS ALFONOSO', cedula: '0206789012', tipoDiscapacidad: 'VISUAL', porcentaje: '62%', cargo: 'DOCENTE TITULAR', dependencia: 'FACULTAD DE JURISPRUDENCIA', condicionLaboral: 'NOMBRAMIENTO' },
        { id: 7, numero: 7, paciente: 'BONILLA SUAREZ JESUS REMIGIO', cedula: '0207890123', tipoDiscapacidad: 'FÍSICA', porcentaje: '53%', cargo: 'FINANCIERO', dependencia: 'FACULTAD DE CIENCIAS ADMINISTRATIVAS', condicionLaboral: 'NOMBRAMIENTO' },
        { id: 8, numero: 8, paciente: 'CHAVEZ CHACAN PILAR JANETH', cedula: '0208901234', tipoDiscapacidad: 'FÍSICA', porcentaje: '51%', cargo: 'DOCENTE TITULAR', dependencia: 'FACULTAD DE CIENCIAS ADMINISTRATIVAS', condicionLaboral: 'NOMBRAMIENTO' },
        { id: 9, numero: 9, paciente: 'ESPINOZA MORA KLEBER ESTUARDO', cedula: '0209012345', tipoDiscapacidad: 'FÍSICA', porcentaje: '30%', cargo: 'DOCENTE TITULAR', dependencia: 'FACULTAD DE CIENCIAS AGROPECUARIAS', condicionLaboral: 'NOMBRAMIENTO' },
        { id: 10, numero: 10, paciente: 'FLORES BALLESTEROS FABIAN RAFAEL', cedula: '0200123456', tipoDiscapacidad: 'VISUAL', porcentaje: '40%', cargo: 'TÉCNICO DOCENTE', dependencia: 'FACULTAD DE JURISPRUDENCIA', condicionLaboral: 'CONTRATO OCASIONAL' },
        { id: 11, numero: 11, paciente: 'GAIBOR GONZALEZ MARIELA ISABEL', cedula: '0201122334', tipoDiscapacidad: 'VISUAL', porcentaje: '75%', cargo: 'DOCENTE TITULAR', dependencia: 'FACULTAD DE CIENCIAS DE LA SALUD Y DEL SER HUMANO', condicionLaboral: 'NOMBRAMIENTO' },
        { id: 12, numero: 12, paciente: 'MURILLO BARRIONUEVO BEATRIZ DEL CARMEN', cedula: '0202233445', tipoDiscapacidad: 'VISUAL', porcentaje: '52%', cargo: 'ADMINISTRATIVO', dependencia: 'BIBLIOTECA', condicionLaboral: 'NOMBRAMIENTO' },
        { id: 13, numero: 13, paciente: 'NARANJO ESTRADA ANGEL TEODORO', cedula: '0203344556', tipoDiscapacidad: 'FÍSICA', porcentaje: '40%', cargo: 'DOCENTE TITULAR', dependencia: 'FACULTAD DE JURISPRUDENCIA', condicionLaboral: 'NOMBRAMIENTO' },
        { id: 14, numero: 14, paciente: 'NUÑEZ JIMENEZ VICTOR HUGO', cedula: '0204455667', tipoDiscapacidad: 'FÍSICA', porcentaje: '42%', cargo: 'DOCENTE TITULAR', dependencia: 'FACULTAD DE CIENCIAS DE LA EDUCACIÓN, SOCIALES, FILOSÓFICAS Y HUMANÍSTICAS', condicionLaboral: 'NOMBRAMIENTO' },
        { id: 15, numero: 15, paciente: 'RAMOS VISCARRA LORENZO NAPOLEON', cedula: '0205566778', tipoDiscapacidad: 'AUDITIVA', porcentaje: '41%', cargo: 'ADMINISTRATIVO', dependencia: 'TALENTO HUMANO', condicionLaboral: 'NOMBRAMIENTO' },
        { id: 16, numero: 16, paciente: 'REA GUAMAN MERY ROCIO', cedula: '0206677889', tipoDiscapacidad: 'VISUAL', porcentaje: '37%', cargo: 'DOCENTE TITULAR', dependencia: 'FACULTAD DE CIENCIAS DE LA SALUD Y DEL SER HUMANO', condicionLaboral: 'NOMBRAMIENTO' },
        { id: 17, numero: 17, paciente: 'SANCHEZ FRANCO PAUL OSWALDO', cedula: '0207788990', tipoDiscapacidad: 'FÍSICA', porcentaje: '44%', cargo: 'DOCENTE TITULAR', dependencia: 'FACULTAD DE CIENCIAS DE LA SALUD Y DEL SER HUMANO', condicionLaboral: 'NOMBRAMIENTO' },
        { id: 18, numero: 18, paciente: 'SIMALIZA LLUMIGUANO HOLGER JAVIER', cedula: '0208899001', tipoDiscapacidad: 'VISUAL', porcentaje: '49%', cargo: 'OPERATIVO', dependencia: 'SERVICIOS INSTITUCIONALES', condicionLaboral: 'NOMBRAMIENTO' },
        { id: 19, numero: 19, paciente: 'SUAREZ ALDAZ VIVIANA ELIZABETH', cedula: '0209900112', tipoDiscapacidad: 'FÍSICA', porcentaje: '40%', cargo: 'DOCENTE TITULAR', dependencia: 'FACULTAD DE CIENCIAS DE LA EDUCACIÓN, SOCIALES, FILOSÓFICAS Y HUMANÍSTICAS', condicionLaboral: 'NOMBRAMIENTO' },
        { id: 20, numero: 20, paciente: 'YUNDA DAVILA MATILDE ESPARTA', cedula: '0200011223', tipoDiscapacidad: 'VISUAL', porcentaje: '59%', cargo: 'ADMINISTRATIVO', dependencia: 'TALENTO HUMANO', condicionLaboral: 'NOMBRAMIENTO' },
        { id: 21, numero: 21, paciente: 'ZAVALA CARDENAS ERNESTO PAUL', cedula: '0201122335', tipoDiscapacidad: 'AUDITIVA', porcentaje: '39%', cargo: 'DOCENTE TITULAR', dependencia: 'EXTENSIÓN DE SAN MIGUEL', condicionLaboral: 'NOMBRAMIENTO' }
    ]);

    // State for Matriz de Exámenes Médicos y Fichas Periódicas por Mes (UEB)
    const [periodicosSearchTerm, setPeriodicosSearchTerm] = useState('');
    const [periodicosSelectedYear, setPeriodicosSelectedYear] = useState('2022');
    const [isPeriodicosModalOpen, setIsPeriodicosModalOpen] = useState(false);
    const [periodicosForm, setPeriodicosForm] = useState({
        mes: 'AGOSTO',
        anio: '2022',
        cantidad: '50'
    });

    const [periodicosData, setPeriodicosData] = useState([
        { id: 1, mes: 'AGOSTO', anio: 2022, cantidad: 5 },
        { id: 2, mes: 'SEPTIEMBRE', anio: 2022, cantidad: 68 },
        { id: 3, mes: 'OCTUBRE', anio: 2022, cantidad: 74 },
        { id: 4, mes: 'NOVIEMBRE', anio: 2022, cantidad: 55 },
        { id: 5, mes: 'DICIEMBRE', anio: 2022, cantidad: 37 }
    ]);

    // State for Matriz de Enfermedades Nuevas - Incidencia (UEB)
    const [nuevasSearchTerm, setNuevasSearchTerm] = useState('');
    const [nuevasSelectedYear, setNuevasSelectedYear] = useState('2022');
    const [isNuevasModalOpen, setIsNuevasModalOpen] = useState(false);
    const [nuevasForm, setNuevasForm] = useState({
        paciente: '',
        cedula: '',
        patologiaNueva: '',
        fechaAparecimiento: new Date().toISOString().split('T')[0]
    });

    const [nuevasData, setNuevasData] = useState([
        { id: 1, numero: 1, paciente: 'CHELA YAZUMA TEODORO', cedula: '0201234567', patologiaNueva: 'BRONQUITIS', fechaAparecimiento: '8/12/2022', anio: 2022 },
        { id: 2, numero: 2, paciente: 'GAROFALO PAREDES PIEDAD DEL CARMEN', cedula: '0202345678', patologiaNueva: 'POLIARTROSIS', fechaAparecimiento: '9/6/2021', anio: 2021 },
        { id: 3, numero: 3, paciente: 'GARCIA VELOZ RUTH ALICIA', cedula: '0203456789', patologiaNueva: 'ARTRITIS REUMATOIDE', fechaAparecimiento: '9/21/2022', anio: 2022 },
        { id: 4, numero: 4, paciente: 'PAZOS MONTERO HECTOR DAVID', cedula: '0204567890', patologiaNueva: 'TRASTORNO DEL DISCO LUMBAR', fechaAparecimiento: '11/9/2022', anio: 2022 },
        { id: 5, numero: 5, paciente: 'ARROYO MUÑOZ LICETH ALEXANDRA', cedula: '0205678901', patologiaNueva: 'HIPERPLASIA ENDOMETRIAL', fechaAparecimiento: '11/11/2022', anio: 2022 },
        { id: 6, numero: 6, paciente: 'GAIBOR CARDENAS GLADYS VANESSA', cedula: '0206789012', patologiaNueva: 'MIOMAS UTERINOS', fechaAparecimiento: '12/15/2022', anio: 2022 }
    ]);

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

    const [psicosocialData, setPsicosocialData] = useState([
        { id: 1, numero: 1, paciente: 'ZAVALA CARDENAS LORENA DEL ROCIO', cedula: '0201234567', tiposervidor: 'DOCENTE TITULAR', diagnostico: 'DEPRESION Y ANSIEDAD' },
        { id: 2, numero: 2, paciente: 'ZABALA CARDENAS HERNESTO PAUL', cedula: '0202345678', tiposervidor: 'ADMINISTRATIVO', diagnostico: 'DEPRESION Y ANSIEDAD' },
        { id: 3, numero: 3, paciente: 'BONILLA SUAREZ ANGEL PATRICIO', cedula: '0203456789', tiposervidor: 'ADMINISTRATIVO', diagnostico: 'EPISODIO DEPRESIVO MODERADO' },
        { id: 4, numero: 4, paciente: 'ROMERO QUIROGA KLEVER RENATO', cedula: '0204567890', tiposervidor: 'DOCENTE TITULAR', diagnostico: 'DEPRESION Y ANSIEDAD' },
        { id: 5, numero: 5, paciente: 'FLORES MENDOZA KARINA PAOLA', cedula: '0205678901', tiposervidor: 'ADMINISTRATIVO', diagnostico: 'DEPRESION Y ANSIEDAD' },
        { id: 6, numero: 6, paciente: 'NARANJO ANDRADE ELIANA ELIZABETH', cedula: '0206789012', tiposervidor: 'ADMINISTRATIVO', diagnostico: 'DEPRESION Y ANSIEDAD' },
        { id: 7, numero: 7, paciente: 'GARCIA LEON ANDREA CECILIA', cedula: '0207890123', tiposervidor: 'ADMINISTRATIVO', diagnostico: 'DEPRESION Y ANSIEDAD' },
        { id: 8, numero: 8, paciente: 'GAIBOR GONZALEZ MARIELA ISABEL', cedula: '0208901234', tiposervidor: 'DOCENTE TITULAR', diagnostico: 'DEPRESION Y ANSIEDAD' },
        { id: 9, numero: 9, paciente: 'VELOZ CAMINOS WILIAN JAVIER', cedula: '0209012345', tiposervidor: 'CODIGO', diagnostico: 'DEPRESION Y ANSIEDAD' },
        { id: 10, numero: 10, paciente: 'GUEVARA NUÑEZ EDELMIRA LILA', cedula: '0200123456', tiposervidor: 'DOCENTE TITULAR', diagnostico: 'DEPRESION Y ANSIEDAD' },
        { id: 11, numero: 11, paciente: 'AGUAGUIÑA MOYON GEOVANNY GONZALO', cedula: '0201122334', tiposervidor: 'CODIGO', diagnostico: 'DEPRESION Y ANSIEDAD' },
        { id: 12, numero: 12, paciente: 'BALLESTEROS MEDINA MARIA LORENA', cedula: '0202233445', tiposervidor: 'ADMINISTRATIVO', diagnostico: 'DEPRESION Y ANSIEDAD' },
        { id: 13, numero: 13, paciente: 'CHAVEZ CHACON PILAR JANETH', cedula: '0203344556', tiposervidor: 'DOCENTE TITULAR', diagnostico: 'DEPRESION Y ANSIEDAD' },
        { id: 14, numero: 14, paciente: 'GABILANEZ CARDENAS CLARITA VANESSA', cedula: '0204455667', tiposervidor: 'DOCENTE TITULAR', diagnostico: 'DEPRESION Y ANSIEDAD' },
        { id: 15, numero: 15, paciente: 'VELARDE GUILCA DELIA RAQUEL', cedula: '0205566778', tiposervidor: 'ADMINISTRATIVO', diagnostico: 'DEPRESION Y ANSIEDAD' },
        { id: 16, numero: 16, paciente: 'JOSE BLADIMIR GUARNIZO DELGADO', cedula: '0206677889', tiposervidor: 'DOCENTE TITULAR', diagnostico: 'DEPRESION Y ANSIEDAD' },
        { id: 17, numero: 17, paciente: 'ARROYO MUÑOZ LICETH ALEXANDRA', cedula: '0207788990', tiposervidor: 'ADMINISTRATIVO', diagnostico: 'DEPRESION Y ANSIEDAD' },
        { id: 18, numero: 18, paciente: 'CABEZAS RAMOS JORGE RENATO', cedula: '0208899001', tiposervidor: 'DOCENTE OCASIONAL', diagnostico: 'DEPRESION Y ANSIEDAD' },
        { id: 19, numero: 19, paciente: 'GAROFALO PAREDES PIEDAD DEL CARMEN', cedula: '0209900112', tiposervidor: 'CODIGO', diagnostico: 'DEPRESION Y ANSIEDAD' },
        { id: 20, numero: 20, paciente: 'DEL SALTO DOLY SILVANA', cedula: '0200011223', tiposervidor: 'DOCENTE TITULAR', diagnostico: 'DEPRESION Y ANSIEDAD' },
        { id: 21, numero: 21, paciente: 'IZA IZA SANDRA PATRICIA', cedula: '0201122335', tiposervidor: 'DOCENTE TITULAR', diagnostico: 'DEPRESION Y ANSIEDAD' },
        { id: 22, numero: 22, paciente: 'GAIBOR BECERRA ANGÉLICA MARIA', cedula: '0202233446', tiposervidor: 'DOCENTE TITULAR', diagnostico: 'DEPRESION Y ANSIEDAD' },
        { id: 23, numero: 23, paciente: 'GAVILANEZ CERDENAS CLARITA VANESSA', cedula: '0203344557', tiposervidor: 'DOCENTE TITULAR', diagnostico: 'DEPRESION Y ANSIEDAD' }
    ]);

    // State for Matriz de Enfermedades Nuevas (Incidencia UEB)
    const [enfermedadesNuevasSearchTerm, setEnfermedadesNuevasSearchTerm] = useState('');
    const [enfermedadesNuevasFilterYear, setEnfermedadesNuevasFilterYear] = useState('TODOS');
    const [enfermedadesNuevasSheetTab, setEnfermedadesNuevasSheetTab] = useState('hoja1');
    const [isEnfermedadesNuevasModalOpen, setIsEnfermedadesNuevasModalOpen] = useState(false);
    const [enfermedadesNuevasForm, setEnfermedadesNuevasForm] = useState({
        paciente: '',
        cedula: '',
        patologiaNueva: '',
        fechaAparecimiento: new Date().toISOString().split('T')[0],
        observaciones: 'REGISTRO DE INCIDENCIA DE PATOLOGÍA NUEVA'
    });

    const [enfermedadesNuevasData, setEnfermedadesNuevasData] = useState([
        {
            id: 1,
            paciente: 'CHELA YAZUMA TEODORO',
            cedula: '0201122334',
            patologiaNueva: 'BRONQUITIS',
            fechaAparecimiento: '8/12/2022',
            year: '2022'
        },
        {
            id: 2,
            paciente: 'GAROFALO PAREDES PIEDAD DEL CARMEN',
            cedula: '0209900112',
            patologiaNueva: 'POLIARTROSIS',
            fechaAparecimiento: '9/6/2021',
            year: '2021'
        },
        {
            id: 3,
            paciente: 'GARCIA VELOZ RUTH ALICIA',
            cedula: '0207890123',
            patologiaNueva: 'ARTRITIS REUMATOIDE',
            fechaAparecimiento: '9/21/2022',
            year: '2022'
        },
        {
            id: 4,
            paciente: 'PAZOS MONTERO HECTOR DAVID',
            cedula: '0204567890',
            patologiaNueva: 'TRASTORNO DEL DISCO LUMBAR',
            fechaAparecimiento: '11/9/2022',
            year: '2022'
        },
        {
            id: 5,
            paciente: 'ARROYO MUÑOZ LICETH ALEXANDRA',
            cedula: '0207788990',
            patologiaNueva: 'HIPERPLASIA ENDOMETRIAL',
            fechaAparecimiento: '11/11/2022',
            year: '2022'
        },
        {
            id: 6,
            paciente: 'MITE CARDENAS GLADYS VANESSA',
            cedula: '0205566778',
            patologiaNueva: 'MIOMAS UTERINOS',
            fechaAparecimiento: '12/15/2022',
            year: '2022'
        }
    ]);

    // State for Matriz de Exámenes Médicos y Fichas Periódicas por Mes (UEB)
    const [examenesPeriodicosSelectedYear, setExamenesPeriodicosSelectedYear] = useState('2022');
    const [examenesPeriodicosSheetTab, setExamenesPeriodicosSheetTab] = useState('hoja1');
    const [examenesPeriodicosShowAllMonths, setExamenesPeriodicosShowAllMonths] = useState(false);
    const [isExamenesPeriodicosModalOpen, setIsExamenesPeriodicosModalOpen] = useState(false);
    const [examenesPeriodicosForm, setExamenesPeriodicosForm] = useState({
        mes: 'ENERO',
        examenes: 0
    });

    const [examenesPeriodicosData, setExamenesPeriodicosData] = useState({
        '2022': [
            { id: 1, mes: 'ENERO', examenes: 0, total: 0 },
            { id: 2, mes: 'FEBRERO', examenes: 0, total: 0 },
            { id: 3, mes: 'MARZO', examenes: 0, total: 0 },
            { id: 4, mes: 'ABRIL', examenes: 0, total: 0 },
            { id: 5, mes: 'MAYO', examenes: 0, total: 0 },
            { id: 6, mes: 'JUNIO', examenes: 0, total: 0 },
            { id: 7, mes: 'JULIO', examenes: 0, total: 0 },
            { id: 8, mes: 'AGOSTO', examenes: 5, total: 5 },
            { id: 9, mes: 'SEPTIEMBRE', examenes: 68, total: 68 },
            { id: 10, mes: 'OCTUBRE', examenes: 74, total: 74 },
            { id: 11, mes: 'NOVIEMBRE', examenes: 55, total: 55 },
            { id: 12, mes: 'DICIEMBRE', examenes: 37, total: 37 }
        ],
        '2023': [
            { id: 1, mes: 'ENERO', examenes: 22, total: 22 },
            { id: 2, mes: 'FEBRERO', examenes: 35, total: 35 },
            { id: 3, mes: 'MARZO', examenes: 48, total: 48 },
            { id: 4, mes: 'ABRIL', examenes: 41, total: 41 },
            { id: 5, mes: 'MAYO', examenes: 60, total: 60 },
            { id: 6, mes: 'JUNIO', examenes: 52, total: 52 },
            { id: 7, mes: 'JULIO', examenes: 38, total: 38 },
            { id: 8, mes: 'AGOSTO', examenes: 18, total: 18 },
            { id: 9, mes: 'SEPTIEMBRE', examenes: 75, total: 75 },
            { id: 10, mes: 'OCTUBRE', examenes: 80, total: 80 },
            { id: 11, mes: 'NOVIEMBRE', examenes: 62, total: 62 },
            { id: 12, mes: 'DICIEMBRE', examenes: 40, total: 40 }
        ],
        '2024': [
            { id: 1, mes: 'ENERO', examenes: 28, total: 28 },
            { id: 2, mes: 'FEBRERO', examenes: 42, total: 42 },
            { id: 3, mes: 'MARZO', examenes: 55, total: 55 },
            { id: 4, mes: 'ABRIL', examenes: 47, total: 47 },
            { id: 5, mes: 'MAYO', examenes: 64, total: 64 },
            { id: 6, mes: 'JUNIO', examenes: 58, total: 58 },
            { id: 7, mes: 'JULIO', examenes: 43, total: 43 },
            { id: 8, mes: 'AGOSTO', examenes: 25, total: 25 },
            { id: 9, mes: 'SEPTIEMBRE', examenes: 82, total: 82 },
            { id: 10, mes: 'OCTUBRE', examenes: 88, total: 88 },
            { id: 11, mes: 'NOVIEMBRE', examenes: 70, total: 70 },
            { id: 12, mes: 'DICIEMBRE', examenes: 45, total: 45 }
        ],
        '2025': [
            { id: 1, mes: 'ENERO', examenes: 32, total: 32 },
            { id: 2, mes: 'FEBRERO', examenes: 46, total: 46 },
            { id: 3, mes: 'MARZO', examenes: 60, total: 60 },
            { id: 4, mes: 'ABRIL', examenes: 50, total: 50 },
            { id: 5, mes: 'MAYO', examenes: 68, total: 68 },
            { id: 6, mes: 'JUNIO', examenes: 62, total: 62 },
            { id: 7, mes: 'JULIO', examenes: 45, total: 45 },
            { id: 8, mes: 'AGOSTO', examenes: 30, total: 30 },
            { id: 9, mes: 'SEPTIEMBRE', examenes: 88, total: 88 },
            { id: 10, mes: 'OCTUBRE', examenes: 94, total: 94 },
            { id: 11, mes: 'NOVIEMBRE', examenes: 76, total: 76 },
            { id: 12, mes: 'DICIEMBRE', examenes: 48, total: 48 }
        ],
        '2026': [
            { id: 1, mes: 'ENERO', examenes: 38, total: 38 },
            { id: 2, mes: 'FEBRERO', examenes: 54, total: 54 },
            { id: 3, mes: 'MARZO', examenes: 65, total: 65 },
            { id: 4, mes: 'ABRIL', examenes: 58, total: 58 },
            { id: 5, mes: 'MAYO', examenes: 72, total: 72 },
            { id: 6, mes: 'JUNIO', examenes: 68, total: 68 },
            { id: 7, mes: 'JULIO', examenes: 42, total: 42 },
            { id: 8, mes: 'AGOSTO', examenes: 12, total: 12 },
            { id: 9, mes: 'SEPTIEMBRE', examenes: 70, total: 70 },
            { id: 10, mes: 'OCTUBRE', examenes: 80, total: 80 },
            { id: 11, mes: 'NOVIEMBRE', examenes: 60, total: 60 },
            { id: 12, mes: 'DICIEMBRE', examenes: 44, total: 44 }
        ]
    });

    // State for Matriz Censo de Embarazadas UEB 2026
    const [embarazadasSearchTerm, setEmbarazadasSearchTerm] = useState('');
    const [embarazadasSheetTab, setEmbarazadasSheetTab] = useState('hoja1'); // 'hoja1' | 'hoja2'
    const [isEmbarazadasModalOpen, setIsEmbarazadasModalOpen] = useState(false);
    const [embarazadasForm, setEmbarazadasForm] = useState({
        paciente: '',
        cedula: '',
        edad: '28',
        fum: new Date().toISOString().split('T')[0],
        semanasGestacion: '12 SEMANAS',
        fechaProbableParto: 'may-26',
        controles: '3',
        telefono: '0987654321'
    });

    const [embarazadasData, setEmbarazadasData] = useState([
        {
            id: 1,
            numero: 1,
            paciente: 'LEON MONAR PATRICIA DE LOURDES',
            cedula: '0201234567',
            edad: 36,
            semanasGestacion: '21 SEMANAS (14/01/2026)',
            fum: '25/08/2025',
            fechaProbableParto: 'may-26',
            controles: 7,
            telefono: '986268194'
        },
        {
            id: 2,
            numero: 2,
            paciente: 'CADMEN VARGAS MARÍA ANGÉLICA',
            cedula: '0202345678',
            edad: 37,
            semanasGestacion: '5 SEMANAS (16/01/2026)',
            fum: '28/11/2025',
            fechaProbableParto: 'sept-26',
            controles: 1,
            telefono: '986681504'
        },
        {
            id: 3,
            numero: 3,
            paciente: 'CHILLO MENDOZA GLORIA JANETH',
            cedula: '0203456789',
            edad: 34,
            semanasGestacion: '22 SEMANAS (19/03/2026)',
            fum: '14/10/2025',
            fechaProbableParto: 'jul-26',
            controles: 3,
            telefono: '993493525'
        }
    ]);

    // State for Matriz de Ausentismo Laboral (UEB 2026)
    const [ausentismoSearchTerm, setAusentismoSearchTerm] = useState('');
    const [ausentismoSelectedYear, setAusentismoSelectedYear] = useState('2026');
    const [ausentismoSelectedMonth, setAusentismoSelectedMonth] = useState('1'); // Enero
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

    const [ausentismoData, setAusentismoData] = useState([
        {
            id: 1,
            numeroCaso: 1,
            paciente: 'MONTEROS MONTERO RODRIGO AMARO',
            cedula: '0201458963',
            cargo: 'DOCENTE TITULAR',
            enfermedadComun: 'FARINGITIS AGUDA',
            enfermedadLaboral: '',
            accidenteLaboral: '',
            otrosMotivos: '',
            diasPerdidos: 1,
            totalHorasAusentismo: 8,
            totalHorasTrabajadas: 32,
            indiceAusentismo: '0,25',
            anio: 2026,
            mes: 1
        },
        {
            id: 2,
            numeroCaso: 2,
            paciente: 'MONA CANTUÑA EVELYN CAROLINA',
            cedula: '0201784512',
            cargo: 'ANALISTA DE INFORMACIÓN',
            enfermedadComun: '',
            enfermedadLaboral: '',
            accidenteLaboral: '',
            otrosMotivos: 'CONSULTA MÉD',
            diasPerdidos: 1,
            totalHorasAusentismo: 8,
            totalHorasTrabajadas: 32,
            indiceAusentismo: '0,25',
            anio: 2026,
            mes: 1
        },
        {
            id: 3,
            numeroCaso: 3,
            paciente: 'TORRES TORRES DEYSI ALEXANDRA',
            cedula: '0200987456',
            cargo: 'DOCENTE OCASIONAL',
            enfermedadComun: 'BRONQUITS',
            enfermedadLaboral: '',
            accidenteLaboral: '',
            otrosMotivos: '',
            diasPerdidos: 1,
            totalHorasAusentismo: 8,
            totalHorasTrabajadas: 32,
            indiceAusentismo: '0,25',
            anio: 2026,
            mes: 1
        },
        {
            id: 4,
            numeroCaso: 4,
            paciente: 'PACAILLANDARICARDO GUSTAVO',
            cedula: '0203547891',
            cargo: 'AUXILIAR DE SERVICIOS',
            enfermedadComun: 'TRASTORNO INTERNO DE LA ROD',
            enfermedadLaboral: '',
            accidenteLaboral: '',
            otrosMotivos: '',
            diasPerdidos: 1,
            totalHorasAusentismo: 8,
            totalHorasTrabajadas: 32,
            indiceAusentismo: '0,25',
            anio: 2026,
            mes: 1
        },
        {
            id: 5,
            numeroCaso: 5,
            paciente: 'GAVILANES CARDENAS CLARITA VANESSA',
            cedula: '0204781236',
            cargo: 'ANALISTA DE TESORERÍA',
            enfermedadComun: '',
            enfermedadLaboral: '',
            accidenteLaboral: '',
            otrosMotivos: 'CONSULTA MÉD',
            diasPerdidos: 2,
            totalHorasAusentismo: 16,
            totalHorasTrabajadas: 24,
            indiceAusentismo: '0,666666667',
            anio: 2026,
            mes: 1
        },
        {
            id: 6,
            numeroCaso: 6,
            paciente: 'ROMERO ACOSTA YESSEÑA',
            cedula: '0201597534',
            cargo: 'DOCENTE TITULAR',
            enfermedadComun: '',
            enfermedadLaboral: '',
            accidenteLaboral: '',
            otrosMotivos: 'CONSULTA MÉD',
            diasPerdidos: 1,
            totalHorasAusentismo: 8,
            totalHorasTrabajadas: 32,
            indiceAusentismo: '0,25',
            anio: 2026,
            mes: 1
        },
        {
            id: 7,
            numeroCaso: 7,
            paciente: 'ORDOÑEZ SANCHEZ WASHINGTON MARCELO',
            cedula: '0203698521',
            cargo: 'ANALISTA DE MANTENIMIENTO',
            enfermedadComun: 'RINOFARINGITIS AGUDA',
            enfermedadLaboral: '',
            accidenteLaboral: '',
            otrosMotivos: '',
            diasPerdidos: 1,
            totalHorasAusentismo: 8,
            totalHorasTrabajadas: 32,
            indiceAusentismo: '0,25',
            anio: 2026,
            mes: 1
        },
        {
            id: 8,
            numeroCaso: 8,
            paciente: 'NAVAS MONTES YONAIKER DEL MAR',
            cedula: '0207418529',
            cargo: 'DOCENTE INVESTIGADOR',
            enfermedadComun: 'DOLOR ABDOMINAL',
            enfermedadLaboral: '',
            accidenteLaboral: '',
            otrosMotivos: '',
            diasPerdidos: 1,
            totalHorasAusentismo: 8,
            totalHorasTrabajadas: 32,
            indiceAusentismo: '0,25',
            anio: 2026,
            mes: 1
        },
        {
            id: 9,
            numeroCaso: 9,
            paciente: 'JACOME MARTINEZ GLORIA CONSUELO',
            cedula: '0208529637',
            cargo: 'SECRETARIA EJECUTIVA',
            enfermedadComun: '',
            enfermedadLaboral: '',
            accidenteLaboral: '',
            otrosMotivos: 'CONSULTA MÉD',
            diasPerdidos: 1,
            totalHorasAusentismo: 8,
            totalHorasTrabajadas: 32,
            indiceAusentismo: '0,25',
            anio: 2026,
            mes: 1
        },
        {
            id: 10,
            numeroCaso: 10,
            paciente: 'ZAVALA CARDENAS LORENA DEL ROCIO',
            cedula: '0209638521',
            cargo: 'DOCENTE TITULAR',
            enfermedadComun: 'TRASTORNO BIPOLAR MIXTO',
            enfermedadLaboral: '',
            accidenteLaboral: '',
            otrosMotivos: '',
            diasPerdidos: 1,
            totalHorasAusentismo: 8,
            totalHorasTrabajadas: 32,
            indiceAusentismo: '0,25',
            anio: 2026,
            mes: 1
        },
        // Mes 2 (02-2026)
        {
            id: 11,
            numeroCaso: 1,
            paciente: 'MORALES CASTRO FERNANDO PATRICIO',
            cedula: '0203333333',
            cargo: 'DOCENTE TITULAR',
            enfermedadComun: 'LUMBAGO CON CIÁTICA',
            enfermedadLaboral: '',
            accidenteLaboral: '',
            otrosMotivos: '',
            diasPerdidos: 3,
            totalHorasAusentismo: 24,
            totalHorasTrabajadas: 32,
            indiceAusentismo: '0,75',
            anio: 2026,
            mes: 2
        },
        {
            id: 12,
            numeroCaso: 2,
            paciente: 'SALAZAR PAREDES GABRIELA FERNANDA',
            cedula: '0204444444',
            cargo: 'ANALISTA DE TALENTO HUMANO',
            enfermedadComun: '',
            enfermedadLaboral: '',
            accidenteLaboral: '',
            otrosMotivos: 'CONSULTA MÉD',
            diasPerdidos: 1,
            totalHorasAusentismo: 8,
            totalHorasTrabajadas: 32,
            indiceAusentismo: '0,25',
            anio: 2026,
            mes: 2
        },
        // Mes 3 (03-2026)
        {
            id: 13,
            numeroCaso: 1,
            paciente: 'ORTIZ GUAYANLEMA MANUEL MESÍAS',
            cedula: '0205555555',
            cargo: 'TÉCNICO DE MANTENIMIENTO',
            enfermedadComun: '',
            enfermedadLaboral: '',
            accidenteLaboral: 'CONTUSIÓN DE MANO POR CAÍDA',
            otrosMotivos: '',
            diasPerdidos: 2,
            totalHorasAusentismo: 16,
            totalHorasTrabajadas: 24,
            indiceAusentismo: '0,67',
            anio: 2026,
            mes: 3
        }
    ]);

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
        fechaEntregaResultados: new Date().toISOString().split('T')[0],
        pacienteConfirmado: '',
        pcr: true,
        pruebaRapida: false,
        altaMedica: true,
        diasAislamiento: '8',
        esDescartado: false
    });

    const [covidCasesData, setCovidCasesData] = useState([
        {
            id: 1,
            pacienteSospechoso: 'VEGA CRUZ AGNELIO ENRIQUE',
            tipoTrabajador: 'AUXILIAR DE SERVICIOS',
            lugarTrabajo: 'SERVICIOS INSTITUCIONALES',
            entregaResultados: '8/8/2022',
            pacienteConfirmado: 'VEGA CRUZ AGNELIO ENRIQUE',
            pcr: true,
            pruebaRapida: false,
            altaMedica: true,
            diasAislamiento: 5,
            anio: 2022,
            mes: 8
        },
        {
            id: 2,
            pacienteSospechoso: 'BELTRÁN AVILÉS NARCISA',
            tipoTrabajador: 'DOCENTE CONTRATADA',
            lugarTrabajo: 'FACULTAD DE CIENCIAS DE LA SALUD',
            entregaResultados: '12/1/2022',
            pacienteConfirmado: 'BELTRÁN AVILÉS NARCISA',
            pcr: true,
            pruebaRapida: false,
            altaMedica: true,
            diasAislamiento: 8,
            anio: 2022,
            mes: 12
        },
        {
            id: 3,
            pacienteSospechoso: 'SILVA ROBALINO MARÍA INÉS',
            tipoTrabajador: 'DOCENTE CONTRATADA',
            lugarTrabajo: 'FACULTAD DE CIENCIAS DE LA SALUD',
            entregaResultados: '12/8/2022',
            pacienteConfirmado: 'SILVA ROBALINO MARÍA INÉS',
            pcr: true,
            pruebaRapida: false,
            altaMedica: true,
            diasAislamiento: 4,
            anio: 2022,
            mes: 12
        },
        {
            id: 4,
            pacienteSospechoso: 'MARTÍNEZ BRITO KLÉVER BISMARK',
            tipoTrabajador: 'CONDUCTOR',
            lugarTrabajo: 'SERVICIOS INSTITUCIONALES',
            entregaResultados: 'DESCARTADO',
            pacienteConfirmado: '',
            pcr: false,
            pruebaRapida: false,
            altaMedica: false,
            diasAislamiento: 2,
            anio: 2022,
            mes: 12
        },
        {
            id: 5,
            pacienteSospechoso: 'JÁCOME BELTRÁN YANDRY FERNANDO',
            tipoTrabajador: 'ANALISTA DE INFORMACIÓN',
            lugarTrabajo: 'RECTORADO',
            entregaResultados: 'DESCARTADO',
            pacienteConfirmado: '',
            pcr: false,
            pruebaRapida: false,
            altaMedica: false,
            diasAislamiento: 0,
            anio: 2022,
            mes: 12
        }
    ]);
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
    const [selectedFichaWorkerId, setSelectedFichaWorkerId] = useState('merchan-silvia');
    const [selectedRecetaId, setSelectedRecetaId] = useState(1001);
    const [genReportMonth, setGenReportMonth] = useState(new Date().getMonth() + 1);
    const [genReportYear, setGenReportYear] = useState(new Date().getFullYear());
    const [reportMensualFecha, setReportMensualFecha] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });
    const [genReportLoading, setGenReportLoading] = useState(false);
    const [genReportData, setGenReportData] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '' });
    const showSystemToast = (message) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 3400);
    };
    const initialRecetas = [
        {
            id: 1001,
            numero_receta: 'REC-2026-001',
            fecha: todayStr,
            paciente: 'Juan Carlos Pérez Mendoza',
            cedula: '1723456789',
            hcl: 'HCL-1723456789',
            sexo: 'M',
            estado_enfermedad: 'Agudo',
            fecha_nacimiento: '1988-05-12',
            edad_anios: 38,
            edad_meses: 4,
            cie: 'J00 - Rinofaringitis Aguda',
            peso: '74.5',
            talla: '172',
            alergias_si: false,
            alergias_detalle: 'Ninguna conocida',
            puesto: 'Docente universitario',
            prescriptor_nombre: 'Dr. Fernando Vaca',
            prescriptor_acess: 'ACESS-MED-84920',
            valido_verificado: 'Lcda. María Silva',
            signos_alarma: 'Dificultad respiratoria, fiebre persistente mayor a 38.5°C por más de 48 horas.',
            recomendaciones_no_farmacologicas: 'Reposo relativo por 48 horas, abundante hidratación (2 a 3 litros de agua al día), evitar cambios bruscos de temperatura.',
            lineas: [
                {
                    detalle_medicamento: 'Paracetamol 500mg Comprimidos',
                    dosis: '500mg (1 comprimido)',
                    frecuencia: '8',
                    duracion: '3',
                    via: 'Oral',
                    cantidad_texto: '9 (Nueve comprimidos)',
                    disponible_farmacia: 'farmacia',
                    manana: true,
                    mediodia: true,
                    tarde: false,
                    noche: true
                },
                {
                    detalle_medicamento: 'Loratadina 10mg Comprimidos',
                    dosis: '10mg (1 comprimido)',
                    frecuencia: '24',
                    duracion: '5',
                    via: 'Oral',
                    cantidad_texto: '5 (Cinco comprimidos)',
                    disponible_farmacia: 'farmacia',
                    manana: false,
                    mediodia: false,
                    tarde: false,
                    noche: true
                }
            ],
            estado: 'Dispensado en Farmacia'
        },
        {
            id: 1002,
            numero_receta: 'REC-2026-002',
            fecha: '2026-09-14',
            paciente: 'Ana María Torres Valencia',
            cedula: '1802938475',
            hcl: 'HCL-1802938475',
            sexo: 'F',
            estado_enfermedad: 'Crónico',
            fecha_nacimiento: '1992-11-20',
            edad_anios: 33,
            edad_meses: 10,
            cie: 'M54.5 - Lumbalgia no especificada',
            peso: '62.0',
            talla: '160',
            alergias_si: true,
            alergias_detalle: 'AINEs (Ketorolaco)',
            puesto: 'Analista de Talento Humano',
            prescriptor_nombre: 'Dr. Fernando Vaca',
            prescriptor_acess: 'ACESS-MED-84920',
            valido_verificado: 'Lcda. María Silva',
            signos_alarma: 'Pérdida de fuerza o sensibilidad en miembros inferiores, dolor insoportable que no cede.',
            recomendaciones_no_farmacologicas: 'Pausas activas cada 45 minutos en oficina, higiene postural al sentarse, termoterapia local caliente 20 min.',
            lineas: [
                {
                    detalle_medicamento: 'Ibuprofeno 400mg Tabletas',
                    dosis: '400mg (1 tableta)',
                    frecuencia: '8',
                    duracion: '5',
                    via: 'Oral',
                    cantidad_texto: '15 (Quince tabletas)',
                    disponible_farmacia: 'farmacia',
                    manana: true,
                    mediodia: true,
                    tarde: false,
                    noche: true
                }
            ],
            estado: 'Dispensado en Farmacia'
        }
    ];

    const [recetasData, setRecetasData] = useState(initialRecetas);
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

    const [citasList, setCitasList] = useState([
        {
            id: 101,
            fecha: todayStr,
            hora_inicio: '08:30',
            hora_fin: '09:00',
            paciente: { name: 'Juan Carlos Pérez', cedula: '1723456789', puesto: 'Analista de Sistemas', area: 'Dirección de Tecnología' },
            tipo_evaluacion: 'Evaluación Periódica',
            motivo: 'Control anual de salud ocupacional y ergonomía',
            estado: 'confirmada',
            prioridad: 'Normal'
        },
        {
            id: 102,
            fecha: todayStr,
            hora_inicio: '09:15',
            hora_fin: '09:45',
            paciente: { name: 'María Fernanda Rodríguez', cedula: '1712345678', puesto: 'Docente Investigador', area: 'Facultad de Ciencias' },
            tipo_evaluacion: 'Reintegro Laboral',
            motivo: 'Evaluación post-incapacidad médica (30 días de reposo)',
            estado: 'programada',
            prioridad: 'Alta'
        },
        {
            id: 103,
            fecha: todayStr,
            hora_inicio: '10:00',
            hora_fin: '10:30',
            paciente: { name: 'Carlos Alberto Gomez', cedula: '1709876543', puesto: 'Técnico de Mantenimiento', area: 'Servicios Generales' },
            tipo_evaluacion: 'Evaluación Preocupacional',
            motivo: 'Examen de ingreso para área de alto riesgo físico',
            estado: 'completada',
            prioridad: 'Normal'
        },
        {
            id: 104,
            fecha: todayStr,
            hora_inicio: '11:00',
            hora_fin: '11:30',
            paciente: { name: 'Ana Isabel Morales', cedula: '1754321098', puesto: 'Secretaria Ejecutiva', area: 'Vicerrectorado' },
            tipo_evaluacion: 'Evaluación de Salida / Retiro',
            motivo: 'Examen de retiro por culminación de contrato',
            estado: 'programada',
            prioridad: 'Normal'
        },
        {
            id: 105,
            fecha: todayStr,
            hora_inicio: '14:00',
            hora_fin: '14:30',
            paciente: { name: 'Luis Fernando Torres', cedula: '1765432109', puesto: 'Chofer Institucional', area: 'Transporte' },
            tipo_evaluacion: 'Evaluación Periódica Especial',
            motivo: 'Evaluación de agudeza visual y psicotécnica',
            estado: 'cancelada',
            prioridad: 'Alta'
        }
    ]);

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

    const handleUpdateCitaStatus = async (id, newStatus) => {
        setCitasList(prev => prev.map(c => c.id === id ? { ...c, estado: newStatus } : c));
        try {
            if (newStatus === 'cancelada') {
                await api.patch(`/citas-medicas/${id}/cancelar`).catch(() => {});
            } else if (newStatus === 'confirmada') {
                await api.patch(`/citas-medicas/${id}/confirmar`).catch(() => {});
            } else if (newStatus === 'completada') {
                await api.patch(`/citas-medicas/${id}/completar`).catch(() => {});
            }
        } catch (err) {
            console.log("Cita status updated locally");
        }
    };

    const fetchCitas = async () => {
        try {
            const res = await api.get('/citas-medicas/doctor/citas', { params: { fecha: citasDate } });
            if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
                const mapped = res.data.data.map(c => {
                    const p = c.paciente || {};
                    const d = p.datos_identificacion || p.datosIdentificacion || {};
                    const nombre = d.primer_nombre
                        ? `${d.primer_nombre} ${d.segundo_nombre || ''} ${d.primer_apellido || ''} ${d.segundo_apellido || ''}`.trim()
                        : (p.name || 'Paciente');
                    return {
                        id: c.id,
                        pacienteNombre: nombre,
                        cedula: d.numero_identificacion || p.cedula || 'N/D',
                        fecha: c.fecha,
                        horaInicio: c.hora_inicio ? c.hora_inicio.slice(0, 5) : '08:00',
                        horaFin: c.hora_fin ? c.hora_fin.slice(0, 5) : '08:30',
                        motivo: c.motivo || 'Evaluación Médica Ocupacional',
                        tipoEvaluacion: c.tipo_atencion || 'Periódica',
                        prioridad: 'Normal',
                        estado: c.estado || 'programada',
                        paciente: { ...p, ...d, id: p.id || c.id_usuario_paciente, nombres: d.primer_nombre, apellidos: d.primer_apellido, cedula: d.numero_identificacion }
                    };
                });
                setCitasList(mapped);
            }
        } catch (err) {
            console.log("Citas backend offline or empty, using state fallback");
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

    const fetchReintegros = async () => {
        try {
            const res = await api.get('/medicina-ocupacional/reintegro-ueb');
            if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
                const mapped = res.data.data.map(r => {
                    const p = r.paciente || {};
                    const d = p.datos_identificacion || p.datosIdentificacion || {};
                    const nombre = d.primer_nombre
                        ? `${d.primer_nombre} ${d.segundo_nombre || ''} ${d.primer_apellido || ''} ${d.segundo_apellido || ''}`.trim()
                        : (p.name || 'Servidor');
                    const diasCalc = r.fecha_salida && r.fecha_reintegro
                        ? Math.ceil(Math.abs(new Date(r.fecha_reintegro) - new Date(r.fecha_salida)) / (1000 * 60 * 60 * 24))
                        : 30;
                    return {
                        id: r.id,
                        fecha: r.fecha_reintegro || r.created_at?.slice(0, 10),
                        fechaReintegro: r.fecha_reintegro,
                        fechaUltimoDia: r.fecha_salida,
                        paciente: nombre,
                        cedula: d.numero_identificacion || p.cedula || '0201575900',
                        puesto: p.cargo || 'Servidor Universitario',
                        dias: diasCalc,
                        causaSalida: r.detalle_motivo_salida,
                        diagnostico: r.detalle_motivo_salida,
                        tipo: 'Total',
                        aptitud: 'Apto',
                        estado: 'Aprobado',
                        patientSelected: { ...p, ...d, nombres: d.primer_nombre, apellidos: d.primer_apellido, cedula: d.numero_identificacion }
                    };
                });
                setReintegrosData(prev => {
                    const ids = new Set(mapped.map(m => m.id));
                    return [...mapped, ...prev.filter(pr => !ids.has(pr.id))];
                });
            }
        } catch (err) {
            console.log("Reintegros backend offline or empty");
        }
    };

    const fetchFichasBackend = async () => {
        try {
            const [ingresosRes, cesesRes] = await Promise.all([
                api.get('/medicina-ocupacional/personal-nuevo').catch(() => ({ data: { data: [] } })),
                api.get('/medicina-ocupacional/cese-funciones').catch(() => ({ data: { data: [] } }))
            ]);

            const newItems = [];
            if (Array.isArray(ingresosRes.data?.data)) {
                ingresosRes.data.data.forEach(item => {
                    const p = item.paciente || {};
                    const d = p.datos_identificacion || p.datosIdentificacion || {};
                    const nombre = d.primer_nombre ? `${d.primer_nombre} ${d.segundo_nombre || ''} ${d.primer_apellido || ''} ${d.segundo_apellido || ''}`.trim() : (p.name || 'Servidor');
                    newItems.push({
                        id: 'ing_' + item.id,
                        fecha: item.fecha_ingreso,
                        fechaIngreso: item.fecha_ingreso,
                        paciente: nombre,
                        cedula: d.numero_identificacion || p.cedula || 'N/D',
                        tipo: 'Ingreso',
                        puesto: p.cargo || 'Servidor UEB',
                        aptitud: 'Apto',
                        estado: 'Completado',
                        patientSelected: { ...p, ...d }
                    });
                });
            }
            if (Array.isArray(cesesRes.data?.data)) {
                cesesRes.data.data.forEach(item => {
                    const p = item.paciente || {};
                    const d = p.datos_identificacion || p.datosIdentificacion || {};
                    const nombre = d.primer_nombre ? `${d.primer_nombre} ${d.segundo_nombre || ''} ${d.primer_apellido || ''} ${d.segundo_apellido || ''}`.trim() : (p.name || 'Servidor');
                    newItems.push({
                        id: 'ces_' + item.id,
                        fecha: item.fecha_salida,
                        fechaRetiro: item.fecha_salida,
                        paciente: nombre,
                        cedula: d.numero_identificacion || p.cedula || 'N/D',
                        tipo: 'Retiro',
                        puesto: p.cargo || 'Servidor UEB',
                        causaRetiro: item.detalle_motivo_salida,
                        aptitud: 'Satisfactorio',
                        estado: 'Completado',
                        patientSelected: { ...p, ...d }
                    });
                });
            }
            if (newItems.length > 0) {
                setFichasData(prev => {
                    const ids = new Set(newItems.map(m => m.id));
                    return [...newItems, ...prev.filter(pr => !ids.has(pr.id))];
                });
            }
        } catch (err) {
            console.log("Fichas backend offline or empty");
        }
    };

    const fetchParteDiario = async () => {
        setParteDiarioLoading(true);
        try {
            const response = await api.get('/medicina-ocupacional/parte-diario')
                .catch(() => api.get('/medicina-general/parte-diario'))
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
        if (activeTab === 'reportes') {
            if (fichaSubTab === 'reintegro') fetchReintegros();
            if (fichaSubTab === 'ingreso' || fichaSubTab === 'cese') fetchFichasBackend();
        }
    }, [activeTab, activeReportSubTab, parteDiarioDate, citasDate, fichaSubTab, genReportMonth, genReportYear, reportCitasFecha, reportCitasEstado]);

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
        const fechaStr = item.fecha || new Date().toISOString().split('T')[0];
        const activeExams = item.selectedExams || ['Hemograma Completo', 'Audiometría Tonal Ocupacional'];
        const notes = item.otrosExamenes || customExamNotes || 'Ninguna observación adicional.';

        let categoriesHtml = '';
        Object.entries(LAB_EXAM_CATEGORIES).forEach(([catKey, category]) => {
            let itemsGridHtml = '';
            category.items.forEach(examItem => {
                const isChecked = activeExams.includes(examItem);
                itemsGridHtml += `
                    <div style="display: flex; align-items: center; gap: 4px; font-size: 8.5px; padding: 1px 0;">
                        <span style="font-weight: bold; font-family: monospace; font-size: 10px;">${isChecked ? '( X )' : '(   )'}</span>
                        <span style="${isChecked ? 'font-weight: bold; color: #0b3c5d;' : 'color: #334155;'}">${examItem}</span>
                    </div>
                `;
            });

            categoriesHtml += `
                <div style="border: 1px solid #000; margin-bottom: 6px; page-break-inside: avoid;">
                    <div style="background-color: #000; color: #fff; font-weight: bold; font-size: 9px; padding: 2px 6px; text-transform: uppercase;">
                        ${category.title}
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
                                <img src="${logoBienestar}" alt="Bienestar Universitario" style="max-height: 48px; object-fit: contain;" />
                            </td>
                            <td class="order-title">
                                UNIVERSIDAD ESTATAL DE BOLÍVAR<br/>
                                <span style="font-size: 10px; font-weight: bold;">DIRECCIÓN DE BIENESTAR UNIVERSITARIO · SALUD OCUPACIONAL</span><br/>
                                <span style="font-size: 11px; color: #0b3c5d;">ORDEN DE EXAMEN DE LABORATORIO CLÍNICO</span>
                            </td>
                            <td style="width: 140px; text-align: center; vertical-align: middle;">
                                <img src="${logoUebTexto}" alt="UEB" style="max-height: 40px; object-fit: contain;" />
                            </td>
                        </tr>
                    </table>

                    <table class="patient-card">
                        <tr>
                            <td class="patient-label">PACIENTE:</td>
                            <td style="font-weight: bold; width: 45%;">${patientName}</td>
                            <td class="patient-label">CÉDULA:</td>
                            <td style="font-weight: bold;">${cedula}</td>
                        </tr>
                        <tr>
                            <td class="patient-label">FECHA:</td>
                            <td>${fechaStr}</td>
                            <td class="patient-label">EDAD / SEXO:</td>
                            <td>${edad} / M-F</td>
                        </tr>
                        <tr>
                            <td class="patient-label">MÉDICO:</td>
                            <td>Dr. Jorge Morales Torres (Salud Ocupacional)</td>
                            <td class="patient-label">LABORATORIO:</td>
                            <td>${item.laboratorio || 'Laboratorio Central Universitario UEB'}</td>
                        </tr>
                    </table>

                    <div style="margin-bottom: 6px; font-weight: bold; font-size: 9.5px; text-transform: uppercase; color: #0b3c5d; border-bottom: 1px solid #000; padding-bottom: 2px;">
                        Exámenes Clínicos Solicitados
                    </div>

                    ${categoriesHtml}

                    <div style="margin-top: 6px; border: 1px solid #000; padding: 4px 6px; font-size: 8.5px; background: #fafafa;">
                        <strong>OBSERVACIONES / OTROS EXÁMENES:</strong> ${notes}
                    </div>

                    <div style="margin-top: 25px; display: flex; justify-content: space-around; text-align: center;">
                        <div style="width: 220px; border-top: 1px solid #000; padding-top: 4px; font-size: 8.5px;">
                            <strong>Dr. Jorge Morales Torres</strong><br/>
                            MÉDICO SALUD OCUPACIONAL<br/>
                            <span style="color: #64748b;">MSP / MDT / UEB</span>
                        </div>
                        <div style="width: 220px; border-top: 1px solid #000; padding-top: 4px; font-size: 8.5px;">
                            <strong>Firma del Paciente / Funcionario</strong><br/>
                            C.I.: ${cedula}
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
                <td style="padding: 6px; border: 1px solid #000; text-align: center;">${idx + 1}</td>
                <td style="padding: 6px; border: 1px solid #000; font-weight: bold;">${ord.paciente}<br/><small>C.I: ${ord.cedula}</small></td>
                <td style="padding: 6px; border: 1px solid #000;">${ord.examen}</td>
                <td style="padding: 6px; border: 1px solid #000;">${ord.motivo}</td>
                <td style="padding: 6px; border: 1px solid #000; text-align: center;">${ord.estado}</td>
            </tr>
        `).join('');

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
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
                    <img src="${logoBienestar}" alt="Bienestar Universitario" style="max-height: 48px; object-fit: contain;" />
                    <div style="text-align: center;">
                        <h2 style="margin: 0; font-size: 13px; color: #002040;">UNIVERSIDAD ESTATAL DE BOLÍVAR</h2>
                        <h3 style="margin: 2px 0; font-size: 11px; color: #0b3c5d;">DIRECCIÓN DE BIENESTAR UNIVERSITARIO · SALUD OCUPACIONAL</h3>
                        <p style="margin: 2px 0 0 0; font-size: 10px; font-weight: bold; color: #0284c7;">REPORTE DE ÓRDENES DE EXÁMENES DE LABORATORIO</p>
                    </div>
                    <img src="${logoUebTexto}" alt="UEB" style="max-height: 40px; object-fit: contain;" />
                </div>
                <p><strong>Fecha de Reporte:</strong> ${useExamDateFilter ? examReportDate : 'Todas las Fechas (Histórico)'} | <strong>Total Registros:</strong> ${filteredExamOrders.length}</p>
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
            fecha: new Date().toISOString().split('T')[0],
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
        setVulnerablesPatologiasSearchTerm(val);
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
            <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                <td style="padding: 7px 8px; border: 1px solid #94a3b8; text-align: center; font-weight: bold; font-size: 10px;">${idx + 1}</td>
                <td style="padding: 7px 8px; border: 1px solid #94a3b8; font-weight: 800; font-size: 10px; color: #0b3c5d;">${(item.paciente || '').toUpperCase()}<br/><small style="color: #64748b; font-weight: normal;">C.I: ${item.cedula || 'N/D'}</small></td>
                <td style="padding: 7px 8px; border: 1px solid #94a3b8; font-weight: 700; font-size: 9.5px; color: #0f172a;">${(item.tipoEnfermedad || '').toUpperCase()}</td>
                <td style="padding: 7px 8px; border: 1px solid #94a3b8; text-align: center; font-size: 9.5px;">${item.fechaDiagnostico || 'N/D'}</td>
                <td style="padding: 7px 8px; border: 1px solid #94a3b8; font-size: 9.5px; color: #334155;">${(item.cargo || '').toUpperCase()}</td>
                <td style="padding: 7px 8px; border: 1px solid #94a3b8; text-align: center; font-weight: bold; font-size: 10px; color: ${item.recibioTratamiento === 'SI' ? '#0284c7' : '#64748b'};">${item.recibioTratamiento || 'SI'}</td>
                <td style="padding: 7px 8px; border: 1px solid #94a3b8; font-size: 9px; font-weight: 600; color: #1e293b;">${(item.novedades || '').toUpperCase()}</td>
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
                            <img src="${logoBienestar}" alt="Bienestar Universitario" style="max-height: 48px; width: auto; object-fit: contain;" />
                        </td>
                        <td class="matrix-title">
                            <div style="font-size: 11px; font-weight: 900; color: #002040; text-transform: uppercase;">UNIVERSIDAD ESTATAL DE BOLÍVAR</div>
                            <div style="font-size: 9px; font-weight: 800; color: #0284c7; text-transform: uppercase;">DIRECCIÓN DE BIENESTAR UNIVERSITARIO · UNIDAD DE SEGURIDAD Y SALUD OCUPACIONAL</div>
                            <div style="font-size: 10px; font-weight: 900; color: #0b3c5d; margin-top: 2px;">
                                MATRIZ SOBRE ENFERMEDADES CATALOGADAS COMO CATASTRÓFICAS, CONFORME A LO ESTIPULADO POR EL MINISTERIO DE SALUD PÚBLICA DEL ECUADOR UEB 2026<br/>
                                <span style="font-size: 9px; font-weight: 700; color: #0284c7;">(${currentTabLabel})</span>
                            </div>
                        </td>
                        <td style="width: 140px; vertical-align: middle; text-align: right;">
                            <img src="${logoUebTexto}" alt="UEB" style="max-height: 40px; width: auto; object-fit: contain;" />
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
            fechaDiagnostico: new Date().toISOString().split('T')[0],
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
            <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                <td style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: center; font-weight: bold; font-size: 10px;">${idx + 1}</td>
                <td style="padding: 6px 8px; border: 1px solid #94a3b8; font-weight: 800; font-size: 10px; color: #0b3c5d;">
                    ${(item.paciente || '').toUpperCase()}<br/>
                    <small style="color: #64748b; font-weight: normal;">C.I: ${item.cedula || 'N/D'}</small>
                </td>
                <td style="padding: 6px 8px; border: 1px solid #94a3b8; font-size: 9.5px; color: #334155;">${(item.cargo || '').toUpperCase()}</td>
                <td style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: center; font-size: 9.5px;">${item.fechaAccidente || 'N/D'}</td>
                <td style="padding: 6px 8px; border: 1px solid #94a3b8; font-size: 9.5px; color: #334155;">${(item.lugar || '').toUpperCase()}</td>
                <td style="padding: 6px 8px; border: 1px solid #94a3b8; font-weight: 800; font-size: 9.5px; color: #b45309;">${(item.tipoAccidente || '').toUpperCase()}</td>
                <td style="padding: 6px 8px; border: 1px solid #94a3b8; font-size: 9.5px; color: #0f172a;">${(item.diagnostico || '').toUpperCase()}</td>
                <td style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: center; font-weight: bold; font-size: 10px; color: #d97706;">${item.diasIncapacidad || 'N/D'}</td>
                <td style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: center; font-weight: bold; font-size: 9.5px; color: ${(item.gravedad || '').includes('LEVE') ? '#0284c7' : '#dc2626'};">${item.gravedad || 'LEVE'}</td>
                <td style="padding: 6px 8px; border: 1px solid #94a3b8; font-size: 9px; font-weight: 600; color: #1e293b;">${(item.novedades || '').toUpperCase()}</td>
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
                            <img src="${logoBienestar}" alt="Bienestar Universitario" style="max-height: 48px; width: auto; object-fit: contain;" />
                        </td>
                        <td class="matrix-title">
                            <div style="font-size: 11px; font-weight: 900; color: #002040; text-transform: uppercase;">UNIVERSIDAD ESTATAL DE BOLÍVAR</div>
                            <div style="font-size: 9px; font-weight: 800; color: #b45309; text-transform: uppercase;">DIRECCIÓN DE BIENESTAR UNIVERSITARIO · UNIDAD DE SEGURIDAD Y SALUD OCUPACIONAL</div>
                            <div style="font-size: 10px; font-weight: 900; color: #0b3c5d; margin-top: 2px;">
                                MATRIZ DE REGISTRO DE ACCIDENTES DE TRABAJO Y ENFERMEDADES PROFESIONALES - UEB 2026<br/>
                                <span style="font-size: 9px; font-weight: 700; color: #d97706;">(${String(filterLabel).toUpperCase()})</span>
                            </div>
                        </td>
                        <td style="width: 140px; vertical-align: middle; text-align: right;">
                            <img src="${logoUebTexto}" alt="UEB" style="max-height: 40px; width: auto; object-fit: contain;" />
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
            fechaAccidente: new Date().toISOString().split('T')[0],
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
            <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                <td style="padding: 7px 10px; border: 1px solid #000000; font-weight: 800; font-size: 10px; color: #0b3c5d;">${(item.paciente || '').toUpperCase()}<br/><small style="color:#64748b; font-weight:normal;">C.I: ${item.cedula || 'N/D'}</small></td>
                <td style="padding: 7px 10px; border: 1px solid #000000; font-weight: 800; font-size: 10px; color: #15803d; text-align: center;">${(item.tipoDiscapacidad || '').toUpperCase()}</td>
                <td style="padding: 7px 10px; border: 1px solid #000000; text-align: center; font-weight: bold; font-size: 10px; color: #0284c7;">${item.porcentaje || 'N/D'}</td>
                <td style="padding: 7px 10px; border: 1px solid #000000; font-size: 9.5px; color: #334155;">${(item.cargo || '').toUpperCase()}</td>
                <td style="padding: 7px 10px; border: 1px solid #000000; font-size: 9.5px; color: #1e293b;">${(item.dependencia || '').toUpperCase()}</td>
                <td style="padding: 7px 10px; border: 1px solid #000000; text-align: center; font-weight: bold; font-size: 9.5px; color: #a16207;">${(item.condicionLaboral || '').toUpperCase()}</td>
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
                            <img src="${logoBienestar}" alt="Bienestar Universitario" style="max-height: 48px; width: auto; object-fit: contain;" />
                        </td>
                        <td style="text-align: center; vertical-align: middle;">
                            <div class="blue-banner" style="margin: 0; padding: 5px 10px; font-size: 11.5px;">UNIVERSIDAD ESTATAL DE BOLÍVAR · BIENESTAR UNIVERSITARIO · SALUD OCUPACIONAL</div>
                            <div class="orange-banner" style="margin: 0; padding: 6px 10px; font-size: 13px;">GRUPO VULNERABLE UNIVERSIDAD ESTATAL DE BOLÍVAR - 2026</div>
                        </td>
                        <td style="width: 140px; vertical-align: middle; text-align: right;">
                            <img src="${logoUebTexto}" alt="UEB" style="max-height: 40px; width: auto; object-fit: contain;" />
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

    const [vulnerablePatologiasData, setVulnerablePatologiasData] = useState({
        diabeticos: [
            { id: 1, nombre: 'ALBAN GARCIA DORINDA FABIOLA' },
            { id: 2, nombre: 'ALVARADO PACHECO EDDY STALIN' },
            { id: 3, nombre: 'BALLESTEROS MEDINA HIPATIA FERNANDA' },
            { id: 4, nombre: 'BARRAGAN AUCATOMA GUSTAVO DANIEL' },
            { id: 5, nombre: 'BUCHELI ESPINOZA CARLOS IVANOFF' },
            { id: 6, nombre: 'CARGUA SUAREZ SALOMON RODRIGO' }
        ],
        hipertensos: [
            { id: 1, nombre: 'AGUAY VARGAS MIRIAN JACKELINE' },
            { id: 2, nombre: 'ARROBA GARCIA JOSE VICENTE' },
            { id: 3, nombre: 'BALLESTEROS MEDINA HIPATIA FERNANDA' },
            { id: 4, nombre: 'BARRIONUEVO VELARDE TELMO FERNANDO' },
            { id: 5, nombre: 'BONILLA ALARCON LUIS ALFONSO' },
            { id: 6, nombre: 'BONILLA ALRCON LUIS ALFONSO' }
        ],
        adultoMayor: [
            { id: 1, nombre: 'CARGUA SUAREZ SALOMON RODRIGO', edad: '64 AÑOS' },
            { id: 2, nombre: 'CASTRO BERIO FIDEL ALBERTO', edad: '61 AÑOS' },
            { id: 3, nombre: 'DOMINGUEZ SANCHEZ CARLOS MANUEL', edad: '61 AÑOS' },
            { id: 4, nombre: 'HIDALGO ESCOBAR NILDA MARINA', edad: '65 AÑOS' },
            { id: 5, nombre: 'LOPEZ QUINCHA MARTHA', edad: '62 AÑOS' },
            { id: 6, nombre: 'PAZOS MONTERO HECTOR DAVID', edad: '63 AÑOS' }
        ],
        otras: [
            { id: 1, nombre: 'GUERRA NARANJO MARICELA ELENA', patologia: 'SARCOIDOSIS (AFECTACION DE LOS GANGLIOS LINFATICOS)' },
            { id: 2, nombre: 'BONILLA ROLDAN MARIA DE LOS ANGELES', patologia: 'CANCER DE TIROIDES' },
            { id: 3, nombre: 'AYALA GAVILANES DIANA CATALINA', patologia: 'CANCER DE TIROIDES' }
        ]
    });

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
                <td style="text-align: center; font-weight: bold; width: 35px; padding: 5px; border: 1px solid #cbd5e1;">${idx + 1}</td>
                <td style="font-size: 11px; padding: 5px; border: 1px solid #cbd5e1;">${item.nombre}</td>
            </tr>
        `).join('');

        const hipertensosHtml = (filtered.hipertensos || []).map((item, idx) => `
            <tr>
                <td style="text-align: center; font-weight: bold; width: 35px; padding: 5px; border: 1px solid #cbd5e1;">${idx + 1}</td>
                <td style="font-size: 11px; padding: 5px; border: 1px solid #cbd5e1;">${item.nombre}</td>
            </tr>
        `).join('');

        const adultoMayorHtml = (filtered.adultoMayor || []).map((item, idx) => `
            <tr>
                <td style="text-align: center; font-weight: bold; width: 35px; padding: 5px; border: 1px solid #cbd5e1;">${idx + 1}</td>
                <td style="font-size: 11px; padding: 5px; border: 1px solid #cbd5e1;">${item.nombre} ${item.edad ? '<b>(' + item.edad + ')</b>' : ''}</td>
            </tr>
        `).join('');

        const otrasHtml = (filtered.otras || []).map((item, idx) => `
            <tr>
                <td style="text-align: center; font-weight: bold; width: 35px; padding: 5px; border: 1px solid #cbd5e1;">${idx + 1}</td>
                <td style="font-size: 10px; padding: 5px; border: 1px solid #cbd5e1;">
                    <div><b>${item.nombre}</b></div>
                    <div style="color: #c0392b; font-weight: 600;">${item.patologia}</div>
                </td>
            </tr>
        `).join('');

        return `
            <!DOCTYPE html>
            <html>
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
                    <img src="${logoBienestar}" style="height: 48px; object-fit: contain;" alt="Bienestar Universitario" />
                    <div style="text-align: center;">
                        <div style="font-size: 12px; font-weight: 900; color: #002040;">UNIVERSIDAD ESTATAL DE BOLÍVAR</div>
                        <div style="font-size: 10px; font-weight: 800; color: #0284c7;">DIRECCIÓN DE BIENESTAR UNIVERSITARIO · SALUD OCUPACIONAL</div>
                        <div style="font-size: 11px; font-weight: 900; color: #0f172a; margin-top: 2px;">GRUPO VULNERABLE UNIVERSIDAD ESTATAL DE BOLIVAR</div>
                    </div>
                    <img src="${logoUebTexto}" style="height: 38px; object-fit: contain;" alt="UEB Logo" />
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
    const [personalNuevoSelectedYear, setPersonalNuevoSelectedYear] = useState('2026');
    const [personalNuevoSheetTab, setPersonalNuevoSheetTab] = useState('hoja1');
    const [isPersonalNuevoModalOpen, setIsPersonalNuevoModalOpen] = useState(false);
    const [personalNuevoForm, setPersonalNuevoForm] = useState({
        paciente: '',
        cedula: '',
        fechaIngreso: new Date().toISOString().split('T')[0],
        cargo: ''
    });

    const [personalNuevoData, setPersonalNuevoData] = useState([
        { id: 1, paciente: 'JORGE MARCELO TAPIA PALLO', cedula: '1719390609', fechaIngreso: '10/15/2025', anio: '2026', cargo: 'ESPECIALISTA EN SERVICIOS INSTITUCIONALES' },
        { id: 2, paciente: 'ALFREDO DAVID APUNTE GARCIA', cedula: '201747821', fechaIngreso: '2/25/2026', anio: '2026', cargo: 'AUXILIAR DE MANTENIMIENTO' },
        { id: 3, paciente: 'JIMMY DALTON CULQUI SISA', cedula: '250189891', fechaIngreso: '2/26/2026', anio: '2026', cargo: 'TRABAJADOR AGRICOLA' },
        { id: 4, paciente: 'SEGUNDO JUAN GUALPA GUASHPA', cedula: '201618741', fechaIngreso: '2/27/2026', anio: '2026', cargo: 'AUXILIAR DE MANTENIMIENTO' },
        { id: 5, paciente: 'ALARCON QUINATOA GINA JAQUELINE', cedula: '201506672', fechaIngreso: '3/9/2026', anio: '2026', cargo: 'PROFESOR OCASIONAL TIEMPO COMPLETO' },
        { id: 6, paciente: 'RAMOS GRIJALVA CYNTHIA GABRIELA', cedula: '180386949-2', fechaIngreso: '3/9/2026', anio: '2026', cargo: 'PROFESOR OCASIONAL TIEMPO COMPLETO' },
        { id: 7, paciente: 'DOMINGUEZ CAIZA JOSE NUIS', cedula: '20139365-9', fechaIngreso: '3/9/2026', anio: '2026', cargo: 'PROFESOR OCASIONAL TIEMPO COMPLETO' },
        { id: 8, paciente: 'SANCHEZ SMITH ANTONIO', cedula: '175688168-4', fechaIngreso: '3/9/2026', anio: '2026', cargo: 'PROFESOR OCASIONAL MEDIO TIEMPO' },
        { id: 9, paciente: 'REINOSO HARO ALEXIS GABRIEL', cedula: '060378952-0', fechaIngreso: '3/9/2026', anio: '2026', cargo: 'PROFESOR OCASIONAL TIEMPO COMPLETO' },
        { id: 10, paciente: 'LOMBEIDA AGUILAR MIGUEL ANGEL', cedula: '020202660-5', fechaIngreso: '3/9/2026', anio: '2026', cargo: 'PROFESOR OCASIONAL MEDIO TIEMPO' },
        { id: 11, paciente: 'ARGUELLO PAZMIÑO VERONICA JANETH', cedula: '020197654-5', fechaIngreso: '3/9/2026', anio: '2026', cargo: 'PROFESOR OCASIONAL TIEMPO COMPLETO' },
        { id: 12, paciente: 'MONTEROS PAZMIÑO JHONATAN ADRIAN', cedula: '020189139-7', fechaIngreso: '3/9/2026', anio: '2026', cargo: 'PROFESOR OCASIONAL TIEMPO COMPLETO' },
        { id: 13, paciente: 'CASTRO VASCONEZ NAHOMI PHENNELOPE', cedula: '020205156-1', fechaIngreso: '3/9/2026', anio: '2026', cargo: 'PROFESOR OCASIONAL TIEMPO PARCIAL' },
        { id: 14, paciente: 'BAYAS QUINCHA DARWIN ANDRES', cedula: '060495624-3', fechaIngreso: '3/9/2026', anio: '2026', cargo: 'PROFESOR OCASIONAL MEDIO TIEMPO' },
        { id: 15, paciente: 'COLLAY YANCHALIQUIN MARCELO HERNAN', cedula: '020233670-7', fechaIngreso: '3/9/2026', anio: '2026', cargo: 'PROFESOR OCASIONAL MEDIO TIEMPO' },
        { id: 16, paciente: 'BORJA BOEJA DAISY CORINA', cedula: '020231239-3', fechaIngreso: '3/9/2026', anio: '2026', cargo: 'PROFESOR OCASIONAL TIEMPO COMPLETO' },
        { id: 17, paciente: 'COBA TORRES ROMMEL SEBASTIAN', cedula: '172300335-4', fechaIngreso: '3/9/2026', anio: '2026', cargo: 'PROFESOR OCASIONAL TIEMPO COMPLETO' },
        { id: 18, paciente: 'GAIBOR GUAMAN BRAYAN DARIO', cedula: '020250237-3', fechaIngreso: '3/9/2026', anio: '2026', cargo: 'PROFESOR OCASIONAL MEDIO TIEMPO' },
        { id: 19, paciente: 'ALBAN TRUJILLO PAOLA ESTEFANIA', cedula: '020158119-6', fechaIngreso: '3/9/2026', anio: '2026', cargo: 'PROFESOR OCASIONAL TIEMPO COMPLETO' },
        { id: 20, paciente: 'PAZMIÑO ROMAN ALVARO ANDRES', cedula: '092598285-2', fechaIngreso: '3/9/2026', anio: '2026', cargo: 'PROFESOR OCASIONAL TIEMPO COMPLETO' },
        { id: 21, paciente: 'TORO MONAR KATHERYN DAYANA', cedula: '020215221-1', fechaIngreso: '3/9/2026', anio: '2026', cargo: 'PROFESOR OCASIONAL TIEMPO PARCIAL' },
        { id: 22, paciente: 'BASANTEZ SANCHEZ JENNY ESTHEFANIA', cedula: '020192758-9', fechaIngreso: '3/9/2026', anio: '2026', cargo: 'PROFESOR OCASIONAL TIEMPO COMPLETO' },
        { id: 23, paciente: 'GARCIA GARCIA VERONICA TATIANA', cedula: '020193218-3', fechaIngreso: '3/9/2026', anio: '2026', cargo: 'PROFESOR OCASIONAL TIEMPO COMPLETO' }
    ]);

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
                <td style="font-weight: bold; color: #1e293b; padding: 7px; border: 1px solid #cbd5e1;">${item.paciente}</td>
                <td style="text-align: center; font-family: monospace; font-size: 11px; padding: 7px; border: 1px solid #cbd5e1;">${item.cedula}</td>
                <td style="text-align: center; font-weight: bold; color: #15803d; padding: 7px; border: 1px solid #cbd5e1;">${item.fechaIngreso}</td>
                <td style="font-weight: bold; color: #334155; padding: 7px; border: 1px solid #cbd5e1;">${item.cargo}</td>
            </tr>
        `).join('');

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Matriz de Personal Nuevo UEB ${anioStr}</title>
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
                    Personal Nuevo que Ingresó en el Año ${anioStr}
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

        const dateVal = personalNuevoForm.fechaIngreso || new Date().toISOString().split('T')[0];
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
        setPersonalNuevoForm({ paciente: '', cedula: '', fechaIngreso: new Date().toISOString().split('T')[0], cargo: '' });
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
                <td style="padding: 7px 12px; border: 1px solid #000000; font-weight: 800; font-size: 10px; color: #0b3c5d;">${(item.mes || '').toUpperCase()}</td>
                <td style="padding: 7px 12px; border: 1px solid #000000; text-align: center; font-weight: bold; font-size: 10px; color: #334155;">${item.cantidad || 0}</td>
                <td style="padding: 7px 12px; border: 1px solid #000000; text-align: center; font-weight: 900; font-size: 10px; color: #0284c7;">${item.cantidad || 0}</td>
            </tr>
        `).join('');

        printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8"/>
                <title>MATRIZ DE EXÁMENES MÉDICOS Y FICHAS PERIÓDICAS - UEB ${anioStr}</title>
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
                    <span style="font-weight: bold; color: #c2410c; font-size: 12px;">Vista previa de impresión - UEB Matriz de Exámenes Periódicos por Mes (${anioStr})</span>
                    <button onclick="window.print()" style="background: #ea580c; color: #ffffff; border: none; padding: 6px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">
                        Imprimir Matriz Oficial (A4 Landscape)
                    </button>
                </div>

                <div style="padding: 4px;">
                    <div class="orange-banner">
                        <div style="display: flex; align-items: center; justify-content: space-between;">
                            <strong style="font-size: 18px; color: #ffffff;">UEB</strong>
                            <h1 class="banner-title">Matriz de EXAMENES Medicos y Fichas Periodicos ${anioStr}</h1>
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
                                <td style="padding: 8px 12px; border: 1px solid #000000; text-align: center; font-size: 11px; color: #0b3c5d;">${totalSum} EVALUACIONES</td>
                                <td style="padding: 8px 12px; border: 1px solid #000000; text-align: center; font-size: 12px; color: #0b3c5d;">${totalSum}</td>
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
                <td style="padding: 7px 10px; border: 1px solid #000000; font-weight: 800; font-size: 10px; color: #0b3c5d;">${(item.paciente || '').toUpperCase()}<br/><small style="color:#64748b; font-weight:normal;">C.I: ${item.cedula || 'N/D'}</small></td>
                <td style="padding: 7px 10px; border: 1px solid #000000; font-weight: 800; font-size: 10px; color: #15803d;">${(item.patologiaNueva || '').toUpperCase()}</td>
                <td style="padding: 7px 10px; border: 1px solid #000000; text-align: center; font-weight: bold; font-size: 10px; color: #ca8a04;">${item.fechaAparecimiento || 'N/D'}</td>
            </tr>
        `).join('');

        printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8"/>
                <title>MATRIZ DE ENFERMEDADES NUEVAS - UEB ${anioStr}</title>
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
                    <span style="font-weight: bold; color: #c2410c; font-size: 12px;">Vista previa de impresión - UEB Matriz de Enfermedades Nuevas (Incidencia ${anioStr})</span>
                    <button onclick="window.print()" style="background: #ea580c; color: #ffffff; border: none; padding: 6px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">
                        Imprimir Matriz Oficial (A4 Landscape)
                    </button>
                </div>

                <div style="padding: 4px;">
                    <div class="orange-banner">
                        <div style="display: flex; align-items: center; justify-content: space-between;">
                            <strong style="font-size: 18px; color: #ffffff;">UEB</strong>
                            <h1 class="banner-title">EMFERMEDAES NUEVAS ${anioStr} (INCINDECIA)</h1>
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
            fechaAparecimiento: new Date().toISOString().split('T')[0]
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
                <td style="padding: 6px 8px; border: 1px solid #000000; font-weight: 800; font-size: 10px; color: #0b3c5d;">${(item.paciente || '').toUpperCase()}<br/><small style="color:#64748b; font-weight:normal;">C.I: ${item.cedula || 'N/D'}</small></td>
                <td style="padding: 6px 8px; border: 1px solid #000000; font-weight: 700; font-size: 9.5px; color: #334155; text-align: center;">${(item.tiposervidor || '').toUpperCase()}</td>
                <td style="padding: 6px 8px; border: 1px solid #000000; font-weight: 800; font-size: 10px; color: #b91c1c;">${(item.diagnostico || '').toUpperCase()}</td>
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
            <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                <td style="padding: 7px 10px; border: 1px solid #000000; font-weight: 800; font-size: 10px; color: #0b3c5d;">${(item.paciente || '').toUpperCase()}<br/><small style="color:#64748b; font-weight:normal;">C.I: ${item.cedula || 'N/D'}</small></td>
                <td style="padding: 7px 10px; border: 1px solid #000000; font-weight: 800; font-size: 10px; color: #15803d;">${(item.patologiaNueva || '').toUpperCase()}</td>
                <td style="padding: 7px 10px; border: 1px solid #000000; font-weight: 700; font-size: 9.5px; color: #334155; text-align: center;">${item.fechaAparecimiento || ''}</td>
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
                        <img src="${logoBienestar}" style="height: 48px; object-fit: contain;" alt="Bienestar Universitario" />
                        <div style="text-align: center; flex: 1; padding: 0 10px;">
                            <div style="font-size: 11px; font-weight: 900; color: #002040;">UNIVERSIDAD ESTATAL DE BOLÍVAR</div>
                            <div style="font-size: 9px; font-weight: 800; color: #c2410c;">DIRECCIÓN DE BIENESTAR UNIVERSITARIO · SALUD OCUPACIONAL</div>
                            <h1 class="banner-title" style="margin: 2px 0 0 0; font-size: 13px; color: #000;">ENFERMEDADES NUEVAS (INCIDENCIA)</h1>
                        </div>
                        <img src="${logoUebTexto}" style="height: 38px; object-fit: contain;" alt="UEB" />
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

        const dateVal = enfermedadesNuevasForm.fechaAparecimiento || new Date().toISOString().split('T')[0];
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
            fechaAparecimiento: new Date().toISOString().split('T')[0],
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
                <td style="padding: 9px 16px; border: 1px solid #000000; font-weight: 800; font-size: 11px; color: #0b3c5d; text-align: left;">${item.mes}</td>
                <td style="padding: 9px 16px; border: 1px solid #000000; font-weight: 800; font-size: 11px; text-align: center;">${item.examenes || 0}</td>
                <td style="padding: 9px 16px; border: 1px solid #000000; font-weight: 900; font-size: 11px; color: #000000; text-align: right;">${item.total || 0}</td>
            </tr>
        `).join('');

        return `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8"/>
                <title>MATRIZ DE EXAMENES MEDICOS Y FICHAS PERIODICOS ${examenesPeriodicosSelectedYear} - UEB</title>
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
                            <h1 class="banner-title" style="margin: 3px 0 0 0; font-size: 13.5px; color: #000;">Matriz de Examenes Medicos y Fichas Periodicos ${examenesPeriodicosSelectedYear}</h1>
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
                            <td style="padding: 10px 16px; border: 1px solid #000000; text-align: center;">${totalExamenesPeriodicosYear}</td>
                            <td style="padding: 10px 16px; border: 1px solid #000000; text-align: right; font-size: 13px; color: #000;">${totalExamenesPeriodicosYear}</td>
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
                <td style="padding: 7px 8px; border: 1px solid #000000; font-weight: 800; font-size: 10px; color: #0b3c5d;">${(item.paciente || '').toUpperCase()}<br/><small style="color:#64748b; font-weight:normal;">C.I: ${item.cedula || 'N/D'}</small></td>
                <td style="padding: 7px 8px; border: 1px solid #000000; text-align: center; font-weight: bold; font-size: 10px; color: #854d0e;">${item.edad || 'N/D'}</td>
                <td style="padding: 7px 8px; border: 1px solid #000000; font-weight: 700; font-size: 9.5px; color: #ea580c; text-align: center;">${item.semanasGestacion || 'N/D'}</td>
                <td style="padding: 7px 8px; border: 1px solid #000000; text-align: center; font-weight: bold; font-size: 9.5px; color: #0284c7;">${item.fum || 'N/D'}</td>
                <td style="padding: 7px 8px; border: 1px solid #000000; text-align: center; font-weight: 800; font-size: 10px; color: #15803d;">${item.fechaProbableParto || 'N/D'}</td>
                <td style="padding: 7px 8px; border: 1px solid #000000; text-align: center; font-weight: bold; font-size: 10px; color: #a16207;">${item.controles || 0}</td>
                <td style="padding: 7px 8px; border: 1px solid #000000; text-align: center; font-weight: bold; font-size: 10px; color: #c2410c;">${item.telefono || 'N/D'}</td>
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
            fum: new Date().toISOString().split('T')[0],
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
            <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                <td style="padding: 6px 8px; border: 1px solid #000000; text-align: center; font-weight: bold; font-size: 10px;">${idx + 1}</td>
                <td style="padding: 6px 8px; border: 1px solid #000000; font-weight: 800; font-size: 10px; color: #0b3c5d;">${(item.paciente || '').toUpperCase()}<br/><small style="color:#64748b; font-weight:normal;">C.I: ${item.cedula || 'N/D'}</small></td>
                <td style="padding: 6px 8px; border: 1px solid #000000; font-size: 9.5px; color: #15803d; font-weight: 600;">${(item.enfermedadComun || '-').toUpperCase()}</td>
                <td style="padding: 6px 8px; border: 1px solid #000000; font-size: 9.5px; color: #b91c1c; font-weight: 600;">${(item.enfermedadLaboral || '-').toUpperCase()}</td>
                <td style="padding: 6px 8px; border: 1px solid #000000; font-size: 9.5px; color: #c2410c; font-weight: 600;">${(item.accidenteLaboral || '-').toUpperCase()}</td>
                <td style="padding: 6px 8px; border: 1px solid #000000; font-size: 9.5px; color: #a16207; font-weight: 600;">${(item.otrosMotivos || '-').toUpperCase()}</td>
                <td style="padding: 6px 8px; border: 1px solid #000000; text-align: center; font-weight: bold; font-size: 10px; color: #ea580c;">${item.diasPerdidos || 0}</td>
                <td style="padding: 6px 8px; border: 1px solid #000000; text-align: center; font-weight: bold; font-size: 10px; color: #0284c7;">${item.totalHorasAusentismo || 0}</td>
                <td style="padding: 6px 8px; border: 1px solid #000000; text-align: center; font-weight: bold; font-size: 10px; color: #0369a1;">${item.totalHorasTrabajadas || 0}</td>
                <td style="padding: 6px 8px; border: 1px solid #000000; text-align: center; font-weight: 900; font-size: 10px; color: #0b3c5d;">${item.indiceAusentismo || 0}</td>
            </tr>
        `).join('');

        return `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8"/>
                <title>MATRIZ DE AUSENTISMO LABORAL - UEB ${anioNombre}</title>
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
                        <img src="${logoBienestar}" style="height: 48px; object-fit: contain;" alt="Bienestar Universitario" />
                        <div style="text-align: center; flex: 1; padding: 0 10px;">
                            <div style="font-size: 11px; font-weight: 900; color: #002040;">UNIVERSIDAD ESTATAL DE BOLÍVAR</div>
                            <div style="font-size: 9px; font-weight: 800; color: #b45309;">DIRECCIÓN DE BIENESTAR UNIVERSITARIO · SALUD OCUPACIONAL</div>
                            <h1 class="banner-title" style="margin: 2px 0 0 0; font-size: 13px; color: #0b3c5d;">Registro de Ausentismo Laboral Mes de ${mesNombre} ${anioNombre}</h1>
                        </div>
                        <img src="${logoUebTexto}" style="height: 38px; object-fit: contain;" alt="UEB" />
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
                <td style="padding: 6px 8px; border: 1px solid #94a3b8; font-weight: 800; font-size: 9.5px; color: #0b3c5d;">${(item.pacienteSospechoso || '').toUpperCase()}</td>
                <td style="padding: 6px 8px; border: 1px solid #94a3b8; font-size: 9px; color: #334155;">${(item.tipoTrabajador || '').toUpperCase()}</td>
                <td style="padding: 6px 8px; border: 1px solid #94a3b8; font-size: 9px; color: #334155;">${(item.lugarTrabajo || '').toUpperCase()}</td>
                <td style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: center; font-weight: bold; font-size: 9.5px; color: ${item.entregaResultados === 'DESCARTADO' ? '#dc2626' : '#d97706'};">${item.entregaResultados || 'N/D'}</td>
                <td style="padding: 6px 8px; border: 1px solid #94a3b8; font-weight: 800; font-size: 9.5px; color: #dc2626;">${(item.pacienteConfirmado || '-').toUpperCase()}</td>
                <td style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: center; font-weight: bold; font-size: 11px;">${item.pcr ? 'X' : ''}</td>
                <td style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: center; font-weight: bold; font-size: 11px;">${item.pruebaRapida ? 'X' : ''}</td>
                <td style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: center; font-weight: bold; font-size: 11px;">${item.altaMedica ? 'X' : ''}</td>
                <td style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: center; font-weight: bold; font-size: 10px; color: #7030a0;">${item.diasAislamiento || 0}</td>
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
                                    <span style="font-size: 9.5px; font-weight: normal; color: #64748b;">PERÍODO: ${periodLabel}</span>
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
            fechaEntregaResultados: new Date().toISOString().split('T')[0],
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

                const userType = item.paciente?.estudio_carrera?.tipo_usuario?.nombre?.toLowerCase() || item.paciente?.estudioCarrera?.tipoUsuario?.nombre?.toLowerCase() || '';
                const carrera = item.paciente?.estudio_carrera?.carrera?.nombre || item.paciente?.estudioCarrera?.carrera?.nombre || '';
                const cargo = item.paciente?.cargo?.detalle_cargo || '';

                let areaDocenteCarrera = '';
                let areaAdministrativo = '';

                if (userType.includes('admin') || cargo) {
                    areaAdministrativo = cargo || 'Administrativo';
                    totalAdministrativo++;
                } else {
                    const rolPrefix = userType.includes('docente') ? 'Docente - ' : '';
                    areaDocenteCarrera = rolPrefix + (carrera || 'Carrera General');
                    totalDocenteCarrera++;
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
                        <td>${nombres}</td>
                        <td class="text-center">${cedula}</td>
                        <td>${tipoDiscapacidad || '-'}</td>
                        <td class="text-center">${edad}</td>
                        <td class="text-center">${esHombre ? 'X' : ''}</td>
                        <td class="text-center">${esMujer ? 'X' : ''}</td>
                        <td class="text-center">${esLgbti ? 'X' : ''}</td>
                        <td>${areaDocenteCarrera}</td>
                        <td>${areaAdministrativo}</td>
                        <td class="text-center">${esPrimera ? 'X' : ''}</td>
                        <td class="text-center">${esSubsecuente ? 'X' : ''}</td>
                        <td class="text-center">${esCertificado ? 'X' : ''}</td>
                        <td class="text-center">${esValidacion ? 'X' : ''}</td>
                        <td>${item.detalle_diagnostico || 'Evaluación general'}</td>
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
                        <div class="meta-date">FECHA: ${parteDiarioDate}</div>
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
                                <td class="text-center">${totalHombres}</td>
                                <td class="text-center">${totalMujeres}</td>
                                <td class="text-center">${totalLgbti}</td>
                                <td class="text-center">${totalDocenteCarrera}</td>
                                <td class="text-center">${totalAdministrativo}</td>
                                <td class="text-center">${totalPrimera}</td>
                                <td class="text-center">${totalSubsecuente}</td>
                                <td class="text-center">${totalCertificado}</td>
                                <td class="text-center">${totalValidacion}</td>
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

    const compileRecetaFormHtmlString = (receta, forPrint = false) => {
        if (!receta) return '<!DOCTYPE html><html><body><p style="padding:40px; text-align:center; color:#64748b; font-family:sans-serif;">Seleccione un paciente / expediente para visualizar su receta médica.</p></body></html>';

        const patientName = receta.paciente || 'Paciente';
        const cedula = receta.cedula || 'N/D';
        const fechaStr = receta.fecha ? receta.fecha.split('-').reverse().join(' / ') : 'dd / mm / aaaa';
        const numReceta = receta.numero_receta || `REC-${receta.id || '001'}`;

        const lineasHtmlPart1 = (receta.lineas || []).map((l, idx) => `
            <tr>
                <td><strong>${idx + 1}. ${l.detalle_medicamento}</strong></td>
                <td style="text-align:center;">${l.dosis || '-'}</td>
                <td style="text-align:center;">Cada ${l.frecuencia || '8'} horas</td>
                <td style="text-align:center;">${l.duracion || '3'} días</td>
                <td style="text-align:center;">${l.via || 'Oral'}</td>
                <td style="text-align:center;">${l.cantidad_texto || '1 caja'}</td>
            </tr>
        `).join('');

        const emptyRowsCountPart1 = Math.max(0, 4 - (receta.lineas || []).length);
        let emptyRowsPart1 = '';
        for (let i = 0; i < emptyRowsCountPart1; i++) {
            emptyRowsPart1 += `
                <tr style="height:22px;">
                    <td></td><td></td><td></td><td></td><td></td><td></td>
                </tr>
            `;
        }

        const lineasHtmlPart2 = (receta.lineas || []).map((l, idx) => `
            <tr>
                <td><strong>${l.detalle_medicamento}</strong></td>
                <td style="text-align:center;">${l.dosis || '-'}</td>
                <td style="text-align:center;">Cada ${l.frecuencia || '8'} horas</td>
                <td style="text-align:center;">${l.duracion || '3'} días</td>
                <td style="text-align:center;">${l.via || 'Oral'}</td>
                <td style="text-align:center;">${l.manana ? '✓' : ''}</td>
                <td style="text-align:center;">${l.mediodia ? '✓' : ''}</td>
                <td style="text-align:center;">${l.tarde ? '✓' : ''}</td>
                <td style="text-align:center;">${l.noche ? '✓' : ''}</td>
            </tr>
        `).join('');

        const emptyRowsCountPart2 = Math.max(0, 3 - (receta.lineas || []).length);
        let emptyRowsPart2 = '';
        for (let i = 0; i < emptyRowsCountPart2; i++) {
            emptyRowsPart2 += `
                <tr style="height:20px;">
                    <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                </tr>
            `;
        }

        return `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <title>Recetario Médico Ocupacional - ${numReceta}</title>
                <meta charset="utf-8" />
                <style>
                    @page { size: A4 portrait; margin: 8mm; }
                    body {
                        font-family: Arial, Helvetica, sans-serif;
                        font-size: 9px;
                        color: #1e293b;
                        margin: 0;
                        padding: 10px;
                        background: #f8fafc;
                        display: flex;
                        justify-content: center;
                    }
                    .receta-sheet {
                        background: #ffffff;
                        width: 190mm;
                        min-height: 270mm;
                        padding: 10mm;
                        box-sizing: border-box;
                        border: 1px solid #cbd5e1;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.05);
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;
                    }
                    .header-top {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        border-bottom: 2px solid #0f172a;
                        padding-bottom: 6px;
                        margin-bottom: 8px;
                    }
                    .header-title {
                        text-align: center;
                    }
                    .header-title h2 {
                        margin: 0;
                        font-size: 16px;
                        color: #0f172a;
                        font-weight: 800;
                    }
                    .header-title h3 {
                        margin: 2px 0 0 0;
                        font-size: 12px;
                        color: #0284c7;
                    }
                    .section-title {
                        background: #f1f5f9;
                        padding: 4px 8px;
                        font-weight: bold;
                        font-size: 9.5px;
                        border: 1px solid #94a3b8;
                        margin-top: 6px;
                        text-transform: uppercase;
                    }
                    table.grid-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 4px;
                    }
                    table.grid-table th, table.grid-table td {
                        border: 1px solid #64748b;
                        padding: 4px 6px;
                        font-size: 8.5px;
                    }
                    table.grid-table th {
                        background: #f8fafc;
                        font-weight: bold;
                        text-align: center;
                    }
                    .vigencia-banner {
                        border: 1px solid #0f172a;
                        text-align: center;
                        font-weight: bold;
                        padding: 4px;
                        margin: 6px 0;
                        font-size: 9px;
                        background: #f8fafc;
                    }
                    .dotted-separator {
                        border-bottom: 2px dashed #94a3b8;
                        margin: 12px 0;
                        position: relative;
                        text-align: center;
                    }
                    .dotted-separator span {
                        background: #fff;
                        padding: 0 8px;
                        font-size: 8px;
                        color: #64748b;
                        position: relative;
                        top: -7px;
                    }
                    @media print {
                        body { background: white; padding: 0; }
                        .receta-sheet { border: none; box-shadow: none; width: 100%; padding: 0; }
                    }
                </style>
            </head>
            <body>
                <div class="receta-sheet">
                    <div>
                        <!-- HEADER PARTE 1 -->
                        <div class="header-top" style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-bottom: 8px;">
                            <div style="width: 130px; text-align: left;">
                                <img src="${logoBienestar}" alt="Bienestar Universitario" style="max-height: 42px; width: auto; object-fit: contain;" />
                            </div>
                            <div class="header-title" style="text-align: center; flex: 1;">
                                <div style="font-size: 11px; font-weight: 900; color: #002040;">UNIVERSIDAD ESTATAL DE BOLÍVAR</div>
                                <h2 style="margin: 0; font-size: 13px; color: #0f172a; font-weight: 900;">DIRECCIÓN DE BIENESTAR UNIVERSITARIO</h2>
                                <h3 style="margin: 1px 0 0 0; font-size: 10.5px; color: #0284c7; font-weight: 800;">Puesto de Salud · Medicina Ocupacional</h3>
                            </div>
                            <div style="text-align: right; width: 130px;">
                                <strong>RECETA N°:</strong> <span style="color:#dc2626; font-size:11px;">${numReceta}</span><br/>
                                <span style="font-size:8.5px;">FECHA: ${fechaStr}</span>
                            </div>
                        </div>

                        <!-- DATOS GENERALES DEL PACIENTE -->
                        <div class="section-title">DATOS GENERALES DEL PACIENTE</div>
                        <table class="grid-table">
                            <tr>
                                <td colspan="3"><strong>Apellidos y Nombres:</strong> ${patientName}</td>
                                <td colspan="2"><strong>Documento identidad/ HCL:</strong> ${cedula}</td>
                                <td><strong>Sexo:</strong> F [${receta.sexo === 'F' ? 'X' : ' '}] M [${receta.sexo === 'M' ? 'X' : ' '}]</td>
                            </tr>
                            <tr>
                                <td colspan="6"><strong>Estado de Enfermedad:</strong> Agudo [${receta.estado_enfermedad === 'Agudo' ? 'X' : ' '}] &nbsp;&nbsp;&nbsp;&nbsp; Crónico [${receta.estado_enfermedad === 'Crónico' ? 'X' : ' '}]</td>
                            </tr>
                            <tr>
                                <td><strong>Fecha nac:</strong> ${receta.fecha_nacimiento || 'N/D'}</td>
                                <td><strong>Edad:</strong> ${receta.edad_anios || '0'} años ${receta.edad_meses || '0'} m</td>
                                <td colspan="4"><strong>CIE:</strong> ${receta.cie || 'Z00.0'}</td>
                            </tr>
                            <tr>
                                <td colspan="3"><strong>Peso (kg):</strong> ${receta.peso || '-'}</td>
                                <td colspan="3"><strong>Talla (cm):</strong> ${receta.talla || '-'}</td>
                            </tr>
                            <tr>
                                <td colspan="6"><strong>Alergias:</strong> SI [${receta.alergias_si ? 'X' : ' '}] NO [${!receta.alergias_si ? 'X' : ' '}] &nbsp;&nbsp;&nbsp;&nbsp; <strong>ESPECIFICAR:</strong> ${receta.alergias_detalle || 'Ninguna'}</td>
                            </tr>
                        </table>

                        <!-- DATOS DEL MEDICAMENTO -->
                        <div class="section-title">DATOS DEL MEDICAMENTO</div>
                        <table class="grid-table">
                            <thead>
                                <tr>
                                    <th style="width:40%;">Medicamento (DCI, forma farmacéutica y concentración)</th>
                                    <th style="width:12%;">Dosis</th>
                                    <th style="width:12%;">Frecuencia</th>
                                    <th style="width:10%;">Duración</th>
                                    <th style="width:12%;">Vía</th>
                                    <th style="width:14%;">Cantidad</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${lineasHtmlPart1}
                                ${emptyRowsPart1}
                            </tbody>
                        </table>

                        <!-- DATOS DEL PRESCRIPTOR PARTE 1 -->
                        <table class="grid-table" style="margin-top:8px;">
                            <tr>
                                <td style="width:50%; vertical-align:top;">
                                    <strong>DATOS DEL PRESCRIPTOR:</strong><br/>
                                    <strong>Apellido y Nombre:</strong> ${receta.prescriptor_nombre || 'Dr. Fernando Vaca'}<br/>
                                    <strong>Nro. Reg. Prof ACESS:</strong> ${receta.prescriptor_acess || 'ACESS-MED-84920'}<br/><br/>
                                    <strong>Firma:</strong> ___________________________________
                                </td>
                                <td style="width:50%; vertical-align:top;">
                                    <strong>VÁLIDO __________ VERIFICADO __________</strong><br/>
                                    <strong>Apellido y Nombre:</strong> ${receta.valido_verificado || 'Farmacia Bienestar'}<br/><br/><br/>
                                    <strong>Firma:</strong> ___________________________________
                                </td>
                            </tr>
                        </table>

                        <div class="vigencia-banner">VIGENCIA MÁXIMA : (03) días</div>

                        <!-- SEPARADOR -->
                        <div class="dotted-separator">
                            <span>INDICACIONES PARA EL USUARIO / PACIENTE</span>
                        </div>

                        <!-- PARTE 2: INDICACIONES -->
                        <table class="grid-table">
                            <tr>
                                <td style="width:60%;"><strong>Apellidos y Nombres del usuario/paciente:</strong> ${patientName}</td>
                                <td style="width:20%;"><strong>Nro. Receta:</strong> ${numReceta}</td>
                                <td style="width:20%;"><strong>Fecha prescripción:</strong> ${fechaStr}</td>
                            </tr>
                        </table>

                        <div class="section-title">INDICACIONES Y HORARIOS</div>
                        <table class="grid-table">
                            <thead>
                                <tr>
                                    <th style="width:35%;">Medicamento (DCI, concentración)</th>
                                    <th style="width:10%;">Dosis</th>
                                    <th style="width:12%;">Frecuencia</th>
                                    <th style="width:10%;">Duración</th>
                                    <th style="width:11%;">Vía</th>
                                    <th style="width:5.5%;">Mañana</th>
                                    <th style="width:5.5%;">Mediodía</th>
                                    <th style="width:5.5%;">Tarde</th>
                                    <th style="width:5.5%;">Noche</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${lineasHtmlPart2}
                                ${emptyRowsPart2}
                            </tbody>
                        </table>

                        <!-- DATOS PRESCRIPTOR & RECOMENDACIONES PARTE 2 -->
                        <table class="grid-table" style="margin-top:8px;">
                            <tr>
                                <td style="width:40%; vertical-align:top;">
                                    <strong>DATOS DEL PRESCRIPTOR:</strong><br/>
                                    <strong>Apellido y Nombre:</strong> ${receta.prescriptor_nombre || 'Dr. Fernando Vaca'}<br/>
                                    <strong>Nro. Reg. Profesional ACESS:</strong> ${receta.prescriptor_acess || 'ACESS-MED-84920'}<br/><br/>
                                    <strong>Firma:</strong> ____________________________
                                </td>
                                <td style="width:60%; vertical-align:top;">
                                    <strong>SIGNOS DE ALARMA:</strong> ${receta.signos_alarma || 'Fiebre persistente, intolerancia oral o reacción alérgica.'}<br/><br/>
                                    <strong>RECOMENDACIONES NO FARMACOLÓGICAS:</strong> ${receta.recomendaciones_no_farmacologicas || 'Reposo relativo e hidratación continua.'}
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>

                ${forPrint ? `
                <script>
                    window.onload = function() { window.print(); };
                </script>
                ` : ''}
            </body>
            </html>
        `;
    };

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
                const matchesFecha = !reportCitasFecha || cita.fecha === reportCitasFecha;
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
                        No se registraron citas para los criterios seleccionados (${formattedDate}).
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
                            <strong>${patientName}</strong><br/>
                            <span style="font-size: 7.5px; color: #64748b;">${puesto}</span>
                        </td>
                        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center; font-size: 8.5px;">${cedula}</td>
                        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center; font-size: 8.5px;">${cita.fecha || formattedDate}</td>
                        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center; font-size: 8.5px; font-weight: 600;">${horario}</td>
                        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-size: 8.5px;"><strong>${tipoEval}:</strong> ${motivo}</td>
                        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center; font-size: 8px;">
                            <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-weight: bold; background: ${estadoBadgeBg}; color: ${estadoBadgeColor};">${estado}</span>
                        </td>
                    </tr>
                `;
            }).join('');

            return `
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <title>Reporte de Citas Ocupacionales - ${formattedDate}</title>
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
                            <div><strong>FECHA REPORTE:</strong> ${formattedDate}</div>
                            <div><strong>ESTADO FILTRADO:</strong> ${reportCitasEstado.toUpperCase()}</div>
                            <div><strong>MÉDICO RESPONSABLE:</strong> ${doctorNameText}</div>
                        </div>

                        <div class="summary-grid">
                            <div class="summary-box">
                                <span>Total Citas</span>
                                <strong>${total}</strong>
                            </div>
                            <div class="summary-box">
                                <span>Completadas</span>
                                <strong style="color: #15803d;">${completadas}</strong>
                            </div>
                            <div class="summary-box">
                                <span>Confirmadas</span>
                                <strong style="color: #065f46;">${confirmadas}</strong>
                            </div>
                            <div class="summary-box">
                                <span>Programadas</span>
                                <strong style="color: #1e40af;">${programadas}</strong>
                            </div>
                            <div class="summary-box">
                                <span>Canceladas</span>
                                <strong style="color: #991b1b;">${canceladas}</strong>
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
                                <strong>${doctorNameText}</strong><br/>
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
            const res = await api.get('/medicina-ocupacional/parte-diario')
                .catch(() => api.get('/medicina-general/parte-diario'))
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

                const typeId = profile?.estudioCarrera?.id_tipo_usuario || profile?.estudio_carrera?.id_tipo_usuario || profile?.id_tipo_usuario;
                let userType = 'administrativos';
                if (typeId === 2) {
                    userType = 'estudiantes';
                    totalEstudiantes++;
                } else if (typeId === 3) {
                    userType = 'docentes';
                    totalDocentes++;
                } else if (typeId === 4 || typeId === 5) {
                    userType = 'administrativos';
                    totalAdministrativos++;
                } else {
                    const roleName = (profile?.role || '').toLowerCase();
                    if (roleName.includes('estud')) {
                        userType = 'estudiantes';
                        totalEstudiantes++;
                    } else if (roleName.includes('docen') || roleName.includes('prof')) {
                        userType = 'docentes';
                        totalDocentes++;
                    } else {
                        userType = 'administrativos';
                        totalAdministrativos++;
                    }
                }

                genderCounts[userType][genderKey]++;

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
                <!DOCTYPE html><html><body style="font-family: Arial, sans-serif; padding: 40px; text-align: center; color: #64748b;">
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
                            <td rowspan="${totalEstCareersCount || 1}" style="writing-mode: vertical-lr; transform: rotate(180deg); font-weight: bold; text-align: center; vertical-align: middle; background-color: #f1f5f9; width: 25px; border: 1px solid #000; font-size: 9px;">
                                ESTUDIANTES
                            </td>
                        `;
                        isFirstRow = false;
                    }

                    if (isFirstCareerInFac) {
                        html += `
                            <td rowspan="${facCareersCount}" style="background-color: #f8fafc; border: 1px solid #000; vertical-align: middle; font-size: 8px; width: 140px; font-weight: bold; text-align: left;">
                                ${f}
                            </td>
                        `;
                        isFirstCareerInFac = false;
                    }

                    html += `
                        <td style="border: 1px solid #000; font-size: 8px; text-align: left;">${cName}</td>
                        <td style="border: 1px solid #000; font-size: 8px; text-align: center;">${stats.hombres}</td>
                        <td style="border: 1px solid #000; font-size: 8px; text-align: center;">${stats.mujeres}</td>
                        <td style="border: 1px solid #000; font-size: 8px; text-align: center;">${stats.lgbti}</td>
                        <td style="border: 1px solid #000; font-size: 8px; text-align: center; font-weight: bold; background-color: #f1f5f9;">${stats.total}</td>
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
                    <td style="border: 1px solid #000; text-align: center;">${gc.estudiantes.hombres}</td>
                    <td style="border: 1px solid #000; text-align: center;">${gc.estudiantes.mujeres}</td>
                    <td style="border: 1px solid #000; text-align: center;">${gc.estudiantes.lgbti}</td>
                    <td style="border: 1px solid #000; text-align: center; font-weight: bold; background: #cbd5e1;">${data.totalEstudiantes || 0}</td>
                </tr>
            `;

            html += `
                <tr style="font-size: 8.5px; background: #e2e8f0; font-weight: bold;">
                    <td colspan="3" style="padding: 4px; border: 1px solid #000; text-align: left;">ADMINISTRATIVOS</td>
                    <td style="border: 1px solid #000; text-align: center;">${gc.administrativos.hombres}</td>
                    <td style="border: 1px solid #000; text-align: center;">${gc.administrativos.mujeres}</td>
                    <td style="border: 1px solid #000; text-align: center;">${gc.administrativos.lgbti}</td>
                    <td style="border: 1px solid #000; text-align: center; font-weight: bold; background: #cbd5e1;">${data.totalAdministrativos || 0}</td>
                </tr>
            `;

            html += `
                <tr style="font-size: 8.5px; background: #e2e8f0; font-weight: bold;">
                    <td colspan="3" style="padding: 4px; border: 1px solid #000; text-align: left;">DOCENTES</td>
                    <td style="border: 1px solid #000; text-align: center;">${gc.docentes.hombres}</td>
                    <td style="border: 1px solid #000; text-align: center;">${gc.docentes.mujeres}</td>
                    <td style="border: 1px solid #000; text-align: center;">${gc.docentes.lgbti}</td>
                    <td style="border: 1px solid #000; text-align: center; font-weight: bold; background: #cbd5e1;">${data.totalDocentes || 0}</td>
                </tr>
            `;

            const totalH = gc.estudiantes.hombres + gc.administrativos.hombres + gc.docentes.hombres;
            const totalM = gc.estudiantes.mujeres + gc.administrativos.mujeres + gc.docentes.mujeres;
            const totalL = gc.estudiantes.lgbti + gc.administrativos.lgbti + gc.docentes.lgbti;
            const grandTotal = data.totalPacientes || 0;

            html += `
                <tr style="font-size: 9px; background-color: #0f172a !important; color: #fff; font-weight: bold;">
                    <td colspan="3" style="padding: 5px; border: 1px solid #000; text-align: left; color: #fff;">TOTAL ATENCIONES</td>
                    <td style="border: 1px solid #000; text-align: center; color: #fff;">${totalH}</td>
                    <td style="border: 1px solid #000; text-align: center; color: #fff;">${totalM}</td>
                    <td style="border: 1px solid #000; text-align: center; color: #fff;">${totalL}</td>
                    <td style="border: 1px solid #000; text-align: center; font-weight: bold; color: #fff;">${grandTotal}</td>
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
                    <div><strong>RESPONSABLE:</strong> ${doctorNameText}</div>
                    <div><strong>PERIODO:</strong> ${selectedMonthText.toUpperCase()} ${genReportYear}</div>
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
                        <span>${doctorNameText}</span>
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

    const filteredFichas = fichasData.filter(item => {
        const matchesSearch = (item.paciente || '').toLowerCase().includes(fichaSearchTerm.toLowerCase()) ||
            (item.cedula || '').includes(fichaSearchTerm) ||
            (item.puesto || '').toLowerCase().includes(fichaSearchTerm.toLowerCase());

        if (!matchesSearch) return false;

        if (fichaSubTab === 'ingreso') {
            return item.tipo === 'Ingreso' || item.tipo === 'Periódico' || item.tipo === 'Preocupacional';
        }
        if (fichaSubTab === 'cese') {
            return item.tipo === 'Retiro' || item.tipo === 'Cese';
        }
        if (fichaSubTab === 'embarazadas') {
            return item.tipo === 'Gestante' || item.tipo === 'Lactante' || item.tipo === 'Embarazo';
        }
        if (fichaSubTab === 'discapacidad') {
            return item.tipo === 'Discapacidad' || item.tipo === 'Adaptación';
        }
        return true;
    });

    const filteredReintegros = reintegrosData.filter(item =>
        (item.paciente || '').toLowerCase().includes(fichaSearchTerm.toLowerCase()) ||
        (item.cedula || '').includes(fichaSearchTerm) ||
        (item.puesto || '').toLowerCase().includes(fichaSearchTerm.toLowerCase()) ||
        (item.diagnostico || '').toLowerCase().includes(fichaSearchTerm.toLowerCase())
    );

    const getActiveFichaList = () => {
        if (fichaSubTab === 'reintegro') {
            return filteredReintegros.length > 0 ? filteredReintegros : reintegrosData;
        }
        if (fichaSubTab === 'cese') {
            const retiro = filteredFichas.filter(f => f.tipo === 'Retiro' || f.tipo === 'Cese');
            return retiro.length > 0 ? retiro : fichasData.filter(f => f.tipo === 'Retiro' || f.tipo === 'Cese');
        }
        const ingreso = filteredFichas.filter(f => f.tipo === 'Ingreso' || f.tipo === 'Periódico' || f.tipo === 'Preocupacional');
        return ingreso.length > 0 ? ingreso : fichasData;
    };

    const activeFichas = getActiveFichaList();
    const selectedFichaRecord = (fichaSearchTerm.trim() && activeFichas.length > 0)
        ? activeFichas[0]
        : (activeFichas.find(f => String(f.id) === String(selectedFichaWorkerId)) || activeFichas[0] || fichasData[0]);

    const compileCurrentFicha077Html = (record = selectedFichaRecord, forPrint = false) => {
        const target = record || selectedFichaRecord;
        if (!target) return '<!DOCTYPE html><html><body><p>Seleccione un trabajador</p></body></html>';
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
                    <td style="text-align: center; font-weight: bold; color: #0284c7;">${item.fecha}</td>
                    <td style="font-weight: bold; text-transform: uppercase;">${item.paciente}</td>
                    <td style="text-align: center; font-family: monospace;">${item.cedula}</td>
                    <td style="text-transform: uppercase;">${item.puesto}</td>
                    <td style="text-align: center; font-weight: bold; color: #0369a1;">${item.dias} días</td>
                    <td>${item.diagnostico}</td>
                    <td style="text-align: center;">${item.tipo}</td>
                    <td style="text-align: center; font-weight: bold; color: ${item.estado === 'Aprobado' ? '#166534' : '#b45309'};">${item.estado}</td>
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
                    <td style="text-align: center; font-weight: bold; color: #0284c7;">${item.fecha}</td>
                    <td style="font-weight: bold; text-transform: uppercase;">${item.paciente}</td>
                    <td style="text-align: center; font-family: monospace;">${item.cedula}</td>
                    <td style="text-align: center; font-weight: bold; color: #334155;">${item.tipo}</td>
                    <td style="text-transform: uppercase;">${item.puesto}</td>
                    <td style="text-align: center; font-weight: bold; color: ${item.aptitud.includes('Restricción') || item.aptitud.includes('Adaptación') ? '#b45309' : item.aptitud.includes('No') ? '#dc2626' : '#15803d'};">${item.aptitud}</td>
                    <td style="text-align: center; font-weight: bold; color: #166534;">${item.estado || 'Completado'}</td>
                </tr>
            `).join('');
        }

        const html = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8" />
                <title>${title} - UEB Salud Ocupacional</title>
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
                        UNIVERSIDAD ESTATAL DE BOLÍVAR · ${title}
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
                        <div style="font-size: 10px; color: #64748b;">Fecha de Emisión: ${new Date().toLocaleDateString('es-EC')}</div>
                    </div>
                    <img src="${logoUebTexto}" style="height: 40px; object-fit: contain;" alt="Logo UEB" />
                </div>
                <div class="banner">
                    ${title}
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

        safePrintHtml(html, title);
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
                <title>Ficha Médica Ocupacional - ${item.paciente}</title>
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
                        Fecha de Emisión: ${new Date().toLocaleDateString('es-EC')}
                    </div>
                </div>

                <div class="banner">CERTIFICADO DE APTITUD MÉDICA OCUPACIONAL</div>

                <div class="section-title">1. DATOS DE IDENTIFICACIÓN DEL TRABAJADOR</div>
                <table class="grid">
                    <tr><th>Nombres y Apellidos</th><td style="font-weight: bold; text-transform: uppercase;">${item.paciente}</td></tr>
                    <tr><th>Cédula de Identidad</th><td style="font-family: monospace; font-weight: bold;">${item.cedula}</td></tr>
                    <tr><th>Puesto / Cargo Asignado</th><td style="text-transform: uppercase;">${item.puesto}</td></tr>
                    <tr><th>Tipo de Evaluación</th><td style="font-weight: bold; color: #0284c7;">${item.tipo}</td></tr>
                    <tr><th>Fecha de Evaluación</th><td>${item.fecha}</td></tr>
                </table>

                <div class="section-title">2. DICTAMEN DE APTITUD LABORAL</div>
                <div class="aptitud-box">
                    RESULTADO: ${item.aptitud}
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
                        C.I.: ${item.cedula}
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

        safePrintHtml(html, `Ficha Ocupacional - ${item.paciente}`);
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

    const handleSaveExamOrder = (e) => {
        e.preventDefault();
        const pacienteNombreFinal = patientSelected
            ? `${patientSelected.nombres} ${patientSelected.apellidos}`.trim()
            : (examForm.pacienteNombre || '');
        const pacienteCedulaFinal = patientSelected
            ? patientSelected.cedula
            : (examForm.pacienteCedula || '');

        if (!pacienteNombreFinal) {
            alert('Por favor seleccione un paciente antes de emitir la orden de examen.');
            return;
        }

        const newOrder = {
            id: Date.now(),
            fecha: new Date().toISOString().split('T')[0],
            paciente: pacienteNombreFinal,
            cedula: pacienteCedulaFinal,
            examen: examForm.examenTipo,
            motivo: examForm.motivo,
            laboratorio: examForm.laboratorio,
            prioridad: examForm.prioridad,
            estado: 'Pendiente',
            resultado: 'Pendiente de emisión por laboratorio'
        };
        setExamenesData([newOrder, ...examenesData]);
        setIsExamModalOpen(false);

        if (patientSelected?.id) {
            api.post('/medicina-ocupacional/orden-examen', {
                id_usuario_paciente: patientSelected.id,
                fecha: new Date().toISOString().split('T')[0],
                observaciones: examForm.motivo || 'Orden de examen ocupacional',
                otros_examenes: [examForm.examenTipo]
            }).catch(err => console.log('Exam order saved locally'));
        }

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
        if (!query || !query.trim()) {
            setFarmaciaSearchResults([]);
            return;
        }
        const qClean = query.trim().toLowerCase();
        const filteredLocal = MOCK_FARMACIA_STOCK.filter(prod =>
            (prod.nombre && prod.nombre.toLowerCase().includes(qClean)) ||
            (prod.codigo && prod.codigo.toLowerCase().includes(qClean))
        );

        try {
            const res = await api.get('/farmacia-search', { params: { query: query.trim() } });
            if (res.data && res.data.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
                setFarmaciaSearchResults(res.data.data);
                return;
            }
        } catch (err) {
            console.error('Error al buscar medicamentos en farmacia:', err);
        }

        setFarmaciaSearchResults(filteredLocal);
    };

    const handleSelectFarmaciaProduct = (prod) => {
        const hasStock = (prod.stock_cajas || 0) > 0 || (prod.stock_unidades || 0) > 0;
        const presentacionText = typeof prod.presentacion === 'object' && prod.presentacion !== null
            ? (prod.presentacion.nombre || '')
            : (prod.presentacion || '');
        const nombreCompleto = presentacionText ? `${prod.nombre} (${presentacionText})` : prod.nombre;

        setPrescripcionForm(prev => ({
            ...prev,
            detalle_medicamento: nombreCompleto,
            via: prod.via || 'Oral',
            id_producto_farmacia: prod.id,
            disponible_farmacia: hasStock ? 'farmacia' : 'no_disponible',
            observacion_nodisponible: hasStock ? '' : `Sin stock de ${prod.nombre} en Farmacia de Enfermería. Se envía receta alternativa para compra externa.`
        }));
        setFarmaciaSearchQuery('');
        setFarmaciaSearchResults([]);
    };

    const handleAddPrescripcionLine = () => {
        if (!prescripcionForm.detalle_medicamento.trim()) {
            alert('Por favor ingrese o seleccione el nombre del medicamento');
            return;
        }
        if (prescripcionForm.disponible_farmacia === 'no_disponible' && !prescripcionForm.observacion_nodisponible.trim()) {
            alert('Por favor especifique el detalle / observación en caso de que no haya la medicina en farmacia');
            return;
        }
        setPrescripcionesList(prev => [...prev, { ...prescripcionForm }]);
        setPrescripcionForm({
            detalle_medicamento: '',
            dosis: '',
            via: 'Oral',
            frecuencia: '8',
            duracion: '3',
            cantidad_cajas: '1',
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

    const selectPatient = async (p) => {
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

        if (patientSearchTarget === 'exam') {
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
        setIsConsultaModalOpen(true);
    };

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
                pais_origen: newPatientForm.pais_origen,
                id_tipo_usuario: parseInt(newPatientForm.id_tipo_usuario || 4)
            });

            const patientData = response.data.data;
            const formattedPatient = {
                id: patientData.id || patientData.id_usuario,
                nombres: patientData.primer_nombre || patientData.nombre_completo || newPatientForm.nombre_completo,
                apellidos: patientData.apellido_paterno || '',
                nombre_completo: patientData.nombre_completo || newPatientForm.nombre_completo,
                cedula: patientData.numero_cedula || newPatientForm.cedula,
                tipo_documento: newPatientForm.tipo_documento,
                id_tipo_usuario: newPatientForm.id_tipo_usuario,
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
                id_tipo_usuario: newPatientForm.id_tipo_usuario || 4,
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
            fechaReintegro: new Date().toISOString().split('T')[0],
            restricciones: ''
        });
    };

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
        <div className="medical-container">
            {/* OVERLAY PARA MÓVIL */}
            {isSidebarOpen && (
                <div
                    className="sidebar-overlay active"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

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
                    <button className="sidebar__close" onClick={() => setIsSidebarOpen(false)}>
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
                        <span className="navigation__icon"><ClipboardList size={18} /></span>
                        <span className="navigation__text">Exámenes</span>
                    </button>

                    <button
                        className={`navigation__item ${activeTab === 'evolucion' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('evolucion'); setIsSidebarOpen(false); }}
                    >
                        <span className="navigation__indicator"></span>
                        <span className="navigation__icon"><History size={18} /></span>
                        <span className="navigation__text">Evolución</span>
                    </button>

                    <button
                        className={`navigation__item ${activeTab === 'diario' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('diario'); setIsSidebarOpen(false); }}
                    >
                        <span className="navigation__indicator"></span>
                        <span className="navigation__icon"><CalendarCheck size={18} /></span>
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
                        className={`navigation__item ${activeTab === 'reportes' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('reportes'); setIsSidebarOpen(false); }}
                    >
                        <span className="navigation__indicator"></span>
                        <span className="navigation__icon"><BarChart3 size={18} /></span>
                        <span className="navigation__text">Reportes</span>
                    </button>
                </nav>

                <div className="sidebar__footer">
                    <button className="logout-button" onClick={handleLogoutClick}>
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
                        <button className="menu-button" onClick={() => setIsSidebarOpen(true)}>
                            <Menu size={20} />
                        </button>
                        <div>
                            <p className="breadcrumb">Medicina Ocupacional / <span>{activeTab.toUpperCase()}</span></p>
                            <h1>
                                {activeTab === 'atencion' ? 'Atención Médica Ocupacional (Consulta en Vivo)' :
                                    activeTab === 'examenes' ? 'Órdenes de Exámenes Médicos & Diagnóstico' :
                                        activeTab === 'evolucion' ? 'Seguimiento a Pacientes' :
                                            activeTab === 'diario' ? 'Parte Diario de Medicina Ocupacional' :
                                                activeTab === 'citas' ? 'Gestión de Citas & Agenda Médica Ocupacional' : 'Centro de Reportes & Estadísticas Ocupacionales'}
                            </h1>
                        </div>
                    </div>
                    <div className="topbar__right">
                        <button className="topbar-button" style={{ marginRight: '8px' }}>
                            <Bell size={18} />
                            <span className="notification-point"></span>
                        </button>
                        <UserProfileMenu />
                    </div>
                </header>

                <div className="content-body" style={{ padding: '24px' }}>

                    {/* PESTAÑA 1: ATENCIÓN CLÍNICA OCUPACIONAL */}
                    {activeTab === 'atencion' && (
                        <div className="tab-atencion-wrapper">
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
                                    onClick={openPatientSearch}
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
                                    <span className="vitals-action-card__icon" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}><BarChart3 size={24} /></span>
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
                            {/* SELECCIÓN DE PACIENTE */}
                            <section className="nurse-card patient-selector-card" style={{ marginBottom: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <div className="nurse-card__icon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}><User size={20} /></div>
                                        <div>
                                            <h3>Paciente para Evolución</h3>
                                            <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '12px' }}>
                                                {patientSelected ? (
                                                    <strong>{`${patientSelected.nombres || patientSelected.nombre_completo || ''} ${patientSelected.apellidos || ''}`.trim()} (Cédula: {patientSelected.cedula || patientSelected.numero_cedula})</strong>
                                                ) : (
                                                    "Ninguno - Debe buscar un paciente para consultar su evolución clínica."
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button className="action-button action-button--accent" onClick={() => openPatientSearch('evolucion')}>
                                            <Search size={14} /> Buscar Paciente
                                        </button>
                                    </div>
                                </div>
                            </section>

                            {!patientSelected ? (
                                <div className="patient-empty-state show">
                                    <User size={40} />
                                    <strong>No hay paciente seleccionado</strong>
                                    <p>Busca e introduce un paciente para consultar su historial médico por áreas.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {/* Header Card con Liquid Nav Bar */}
                                    <div className="card" style={{ borderRadius: '14px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', boxShadow: 'var(--shadow-sm)', flexWrap: 'wrap', gap: '15px' }}>
                                        <div>
                                            <span className="eyebrow" style={{ color: '#dc2626', fontWeight: '700' }}>HISTORIAL CLÍNICO</span>
                                            <h3 style={{ fontSize: '15px', fontWeight: '750', margin: '4px 0 0', color: 'var(--primary)' }}>Historial Clínico del Paciente</h3>
                                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Consulte la evolución y atenciones del paciente agrupadas por área clínica.</p>
                                        </div>

                                        {/* Liquid Navigation Bar */}
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
                                                    onClick={() => { setActiveBookArea(area.key); setActiveBookRecord(null); setHistoryPage(1); }}
                                                >
                                                    {area.icon}
                                                    <span>{area.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Table and Detail Grid */}
                                    <div className="historial-grid-container" style={{ gridTemplateColumns: activeBookRecord ? '1fr 1fr' : '1fr' }}>
                                        {/* Table Column Card */}
                                        <div className="card" style={{ padding: 0, borderRadius: '14px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', background: 'white' }}>
                                            {!areaHistories[activeBookArea] || areaHistories[activeBookArea].length === 0 ? (
                                                <div className="table-empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '50px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                                    <FileText size={36} style={{ marginBottom: '10px', opacity: 0.5 }} />
                                                    <strong style={{ fontSize: '13.5px', color: 'var(--text)' }}>Sin antecedentes registrados</strong>
                                                    <span style={{ fontSize: '11px', maxWidth: '280px', marginTop: '4px' }}>No se encontraron atenciones previas en el área seleccionada.</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
                                                        <table className="medical-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '480px' }}>
                                                            <thead>
                                                                <tr style={{ background: 'var(--surface-hover)', borderBottom: '1px solid var(--border)' }}>
                                                                    <th style={{ padding: '14px 16px', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>N°</th>
                                                                    <th style={{ padding: '14px 16px', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>Fecha</th>
                                                                    <th style={{ padding: '14px 16px', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>Especialidad</th>
                                                                    <th style={{ padding: '14px 16px', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>Detalle / Diagnóstico</th>
                                                                    <th style={{ padding: '14px 16px', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textAlign: 'right' }}>Acción</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {areaHistories[activeBookArea]
                                                                    .slice((historyPage - 1) * HISTORY_PER_PAGE, historyPage * HISTORY_PER_PAGE)
                                                                    .map((record, index) => {
                                                                        const rowNumber = (historyPage - 1) * HISTORY_PER_PAGE + index + 1;
                                                                        const isActive = activeBookRecord?.id === record.id;
                                                                        return (
                                                                            <tr
                                                                                key={record.id || index}
                                                                                style={{
                                                                                    borderBottom: '1px solid var(--border)',
                                                                                    background: isActive ? 'rgba(11, 49, 85, 0.04)' : 'transparent',
                                                                                    cursor: 'pointer'
                                                                                }}
                                                                                onClick={() => setActiveBookRecord(record)}
                                                                            >
                                                                                <td style={{ padding: '14px 16px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>
                                                                                    {rowNumber}
                                                                                </td>
                                                                                <td style={{ padding: '14px 16px', fontSize: '12px', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap' }}>
                                                                                    {(record.fecha || record.created_at || '').slice(0, 10)}
                                                                                </td>
                                                                                <td style={{ padding: '14px 16px' }}>
                                                                                    <span className={`evolution-badge evolution-badge--${activeBookArea}`}>
                                                                                        {record.recordTitle || record.type}
                                                                                    </span>
                                                                                </td>
                                                                                <td style={{ padding: '14px 16px', fontSize: '11.5px', color: 'var(--text-secondary)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                                    {record.detalle_evolucion || record.detalle_diagnostico || record.detalle_motivo || 'Ver detalles'}
                                                                                </td>
                                                                                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                                                                    <button
                                                                                        className={`action-button ${isActive ? 'action-button--accent' : 'action-button--primary'}`}
                                                                                        style={{ fontSize: '11px', minHeight: '30px', padding: '0 12px', borderRadius: '6px' }}
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            setActiveBookRecord(record);
                                                                                        }}
                                                                                    >
                                                                                        {isActive ? 'Viendo' : 'Ver Detalle'}
                                                                                    </button>
                                                                                </td>
                                                                            </tr>
                                                                        );
                                                                    })}
                                                            </tbody>
                                                        </table>
                                                    </div>

                                                    {Math.ceil((areaHistories[activeBookArea] || []).length / HISTORY_PER_PAGE) > 1 && (
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: 'var(--surface-hover)', borderTop: '1px solid var(--border)' }}>
                                                            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                                                                Mostrando {((historyPage - 1) * HISTORY_PER_PAGE) + 1} - {Math.min(historyPage * HISTORY_PER_PAGE, areaHistories[activeBookArea].length)} de {areaHistories[activeBookArea].length} registros
                                                            </span>
                                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                                <button
                                                                    disabled={historyPage === 1}
                                                                    onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                                                                    style={{ opacity: historyPage === 1 ? 0.5 : 1, padding: '4px 10px', borderRadius: '6px', fontSize: '11px', border: '1px solid var(--border)', cursor: historyPage === 1 ? 'not-allowed' : 'pointer' }}
                                                                >
                                                                    Anterior
                                                                </button>
                                                                <span style={{ fontSize: '11.5px', padding: '4px 8px', fontWeight: '600', color: 'var(--text)' }}>
                                                                    Página {historyPage} de {Math.ceil(areaHistories[activeBookArea].length / HISTORY_PER_PAGE)}
                                                                </span>
                                                                <button
                                                                    disabled={historyPage === Math.ceil(areaHistories[activeBookArea].length / HISTORY_PER_PAGE)}
                                                                    onClick={() => setHistoryPage(p => Math.min(Math.ceil(areaHistories[activeBookArea].length / HISTORY_PER_PAGE), p + 1))}
                                                                    style={{ opacity: historyPage === Math.ceil(areaHistories[activeBookArea].length / HISTORY_PER_PAGE) ? 0.5 : 1, padding: '4px 10px', borderRadius: '6px', fontSize: '11px', border: '1px solid var(--border)', cursor: historyPage === Math.ceil(areaHistories[activeBookArea].length / HISTORY_PER_PAGE) ? 'not-allowed' : 'pointer' }}
                                                                >
                                                                    Siguiente
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        {/* Detail Column Card */}
                                        {activeBookRecord && (
                                            <div className="premium-field-card clinical-detail-card" style={{ padding: '24px', position: 'sticky', top: '20px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0, 32, 64, 0.05)', paddingBottom: '12px', marginBottom: '16px' }}>
                                                    <div>
                                                        <span className="eyebrow" style={{ textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700 }}>Detalle Clínico</span>
                                                        <h4 style={{ margin: '4px 0 0', fontSize: '14px', color: 'var(--primary)', fontWeight: 800 }}>
                                                            {activeBookRecord.recordTitle || 'Ficha de Atención'}
                                                        </h4>
                                                        <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
                                                            Fecha: {(activeBookRecord.fecha || activeBookRecord.created_at || '').slice(0, 10)}
                                                        </p>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button
                                                            className="action-button action-button--light"
                                                            style={{ minHeight: '32px', width: '32px', padding: 0, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                            onClick={() => setActiveBookRecord(null)}
                                                        >
                                                            <X size={15} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '500px', overflowY: 'auto', paddingRight: '4px', flex: 'none' }} className="clinical-modal__body">
                                                    <div className="preview-paper-field">
                                                        <span>Notas de Evolución & Detalle</span>
                                                        <p style={{ fontStyle: 'italic', background: '#fff9e6', padding: '12px', borderRadius: '8px', border: '1px solid #ffe89e', lineHeight: '1.5', margin: 0 }}>
                                                            {activeBookRecord.detalle_evolucion || activeBookRecord.detalle_diagnostico || 'Sin observaciones registradas.'}
                                                        </p>
                                                    </div>
                                                    <div className="preview-paper-field">
                                                        <span>Prescripción y Plan Farmacéutico</span>
                                                        <p style={{ background: '#f0fdf4', padding: '12px', borderRadius: '8px', border: '1px solid #bbf7d0', color: '#166534', margin: 0 }}>
                                                            {activeBookRecord.prescripcion_medica || 'Sin prescripción indicada.'}
                                                        </p>
                                                    </div>
                                                    {activeBookRecord.medico && (
                                                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '4px' }}>
                                                            Registrado por: <strong>{activeBookRecord.medico}</strong>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* SECCIÓN DE RECETARIOS Y PRESCRIPCIONES DEL PACIENTE */}
                                    <div className="card" style={{ borderRadius: '14px', padding: '20px', background: 'white', boxShadow: 'var(--shadow-sm)', marginTop: '20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ background: '#f0fdf4', color: '#166534', padding: '8px', borderRadius: '8px' }}>
                                                    <Pill size={18} />
                                                </div>
                                                <div>
                                                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--primary)' }}>Recetarios & Prescripciones del Paciente</h3>
                                                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>Histórico de recetas médicas emitidas para este trabajador/estudiante.</p>
                                                </div>
                                            </div>
                                            <span className="eyebrow" style={{ color: '#166534' }}>
                                                {recetasData.filter(r => r.cedula === patientSelected.cedula || r.paciente.toLowerCase().includes((patientSelected.nombres || patientSelected.nombre_completo || '').toLowerCase())).length} RECETAS ENCONTRADAS
                                            </span>
                                        </div>

                                        {recetasData.filter(r => r.cedula === patientSelected.cedula || r.paciente.toLowerCase().includes((patientSelected.nombres || patientSelected.nombre_completo || '').toLowerCase())).length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                                                <Pill size={30} style={{ opacity: 0.4, marginBottom: '8px' }} />
                                                <p style={{ margin: 0, fontSize: '12px' }}>El paciente no registra recetarios u órdenes de medicamentos emitidas previamente.</p>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                {recetasData
                                                    .filter(r => r.cedula === patientSelected.cedula || r.paciente.toLowerCase().includes((patientSelected.nombres || patientSelected.nombre_completo || '').toLowerCase()))
                                                    .map((receta, idx) => (
                                                        <div key={idx} style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 16px', background: '#fafbfd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                                                            <div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <strong style={{ fontSize: '13px', color: 'var(--primary)' }}>{receta.numero_receta || `REC-${receta.id}`}</strong>
                                                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>· {receta.fecha}</span>
                                                                    <span style={{ fontSize: '10.5px', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                                                                        {receta.estado || 'Emitido'}
                                                                    </span>
                                                                </div>
                                                                <p style={{ margin: '6px 0 0', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                                                                    <strong>CIE:</strong> {receta.cie || 'General'} &nbsp;|&nbsp; <strong>Fármacos:</strong> {(receta.lineas || []).map(l => l.detalle_medicamento).join(', ') || receta.medicamentos}
                                                                </p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                className="action-button action-button--accent"
                                                                style={{ padding: '6px 14px', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
                                                                onClick={() => setSelectedRecetaPreview(receta)}
                                                            >
                                                                <Pill size={14} /> Ver / Imprimir Recetario
                                                            </button>
                                                        </div>
                                                    ))}
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
                                                    type="date"
                                                    value={parteDiarioDate}
                                                    onChange={(e) => setParteDiarioDate(e.target.value)}
                                                    style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px', fontSize: '11px', outline: 0 }}
                                                />
                                            </label>
                                            <button
                                                onClick={handlePrintParteDiario}
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
                                            <div className="psycho-kpi-card__icon" style={{ background: '#fef3c7', color: '#d97706' }}><FileCheck size={20} /></div>
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
                                            {parteDiarioList.map((item, idx) => {
                                                const patientIdent = item.paciente?.datos_identificacion || item.paciente?.datosIdentificacion || item.paciente?.identification;
                                                const patientName = patientIdent
                                                    ? `${patientIdent.primer_nombre || ''} ${patientIdent.segundo_nombre || ''} ${patientIdent.apellido_paterno || patientIdent.primer_apellido || ''} ${patientIdent.apellido_materno || ''}`.replace(/\s+/g, ' ').trim()
                                                    : item.paciente?.nombre_completo || item.paciente?.name || 'Paciente registrado';
                                                return (
                                                    <div key={idx} className="list-card" style={{ background: '#fafbfd' }}>
                                                        <div className="list-card__icon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                                                            <ClipboardList size={16} />
                                                        </div>
                                                        <div className="list-card__content">
                                                            <strong>{patientName}</strong>
                                                            <p>Consulta: {(item.tipo_atencion || 'general').toUpperCase()} · Diagnóstico: {item.detalle_diagnostico || 'Evaluación general'}</p>
                                                        </div>
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
                                            type="date"
                                            value={citasDate}
                                            onChange={(e) => setCitasDate(e.target.value)}
                                            style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px', fontSize: '11px', outline: 0 }}
                                        />
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handlePrintReporteCitas}
                                        className="action-button action-button--accent"
                                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                        title="Imprimir reporte de citas agendadas, completadas y canceladas"
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
                                                        cancelada: { bg: '#fef2f2', text: '#991b1b', border: '#fee2e2' }
                                                    }[cita.estado] || { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' };

                                                    return (
                                                        <tr key={cita.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                            <td style={{ padding: '14px 16px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>
                                                                {rowNumber}
                                                            </td>
                                                            <td style={{ padding: '14px 16px' }}>
                                                                <div style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--text)' }}>{patientName}</div>
                                                                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Cédula: {cedula}</div>
                                                            </td>
                                                            <td style={{ padding: '14px 16px' }}>
                                                                <div style={{ fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text)' }}>
                                                                    <Clock size={13} style={{ color: 'var(--accent)' }} />
                                                                    {cita.hora_inicio} - {cita.hora_fin}
                                                                </div>
                                                            </td>
                                                            <td style={{ padding: '14px 16px', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                                                                {cita.motivo || cita.tipo_evaluacion || 'Atención en Salud Ocupacional'}
                                                                <div style={{ fontSize: '10.5px', color: '#b45309', marginTop: '2px' }}>
                                                                    <strong>Mis Notas:</strong> {cita.notas_doctor || 'Atención registrada directamente por el profesional médico'}
                                                                </div>
                                                            </td>
                                                            <td style={{ padding: '14px 16px' }}>
                                                                <span style={{
                                                                    fontSize: '10px',
                                                                    fontWeight: '700',
                                                                    textTransform: 'uppercase',
                                                                    color: statusColors.text,
                                                                    background: statusColors.bg,
                                                                    padding: '4px 9px',
                                                                    borderRadius: '12px',
                                                                    border: `1px solid ${statusColors.border}`,
                                                                    display: 'inline-block'
                                                                }}>
                                                                    {cita.estado}
                                                                </span>
                                                                {(cita.confirmada_por_paciente || cita.estado === 'completada' || cita.estado === 'confirmada') && (
                                                                    <div style={{ marginTop: '4px', fontSize: '10px', color: '#15803d', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                                        <CheckCircle size={11} color="#15803d" /> Confirmada por paciente
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                                                    {cita.estado !== 'completada' && cita.estado !== 'cancelada' && (
                                                                        <button
                                                                            onClick={() => {
                                                                                setPatientSelected({ nombres: patientName, apellidos: '', cedula, puestoTrabajo: cita.paciente?.puesto || 'Servidor' });
                                                                                setIsConsultaModalOpen(true);
                                                                                handleUpdateCitaStatus(cita.id, 'completada');
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
                    {activeTab === 'reportes' && (
                        <div>
                            <section className="page-hero" style={{ marginBottom: '20px' }}>
                                <div>
                                    <span className="page-hero__label"><FileText size={14} style={{ marginRight: '6px', display: 'inline' }} /> Reportes y Gestión</span>
                                    <h2>Centro de Reportes de Salud Ocupacional</h2>
                                    <p>Genere, visualice e imprima los informes oficiales de atenciones, consumos y citas requeridos para las auditorías.</p>
                                </div>
                                <div className="page-hero__icon"><FileText size={34} /></div>
                            </section>

                            {/* NAVEGACIÓN ORGANIZADA: 2 CATEGORÍAS GRANDES + SELECT DESPLEGABLE */}
                            {(() => {
                                const isMatricesCat = ['catastroficas', 'accidentes', 'covid', 'ausentismo', 'embarazadas', 'psicosocial', 'enfermedades_nuevas', 'examenes_periodicos', 'discapacidad', 'vulnerables_patologias', 'personal_nuevo'].includes(activeReportSubTab);
                                return (
                                    <article className="nurse-card" style={{ padding: '14px 20px', marginBottom: '22px', borderRadius: '16px', background: '#ffffff', border: '1px solid var(--border, #e0e6ed)', boxShadow: '0 4px 18px rgba(0, 32, 64, 0.05)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                                            
                                            {/* Pestañas de Categoría Principal */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--primary-soft, #eaf0f5)', padding: '5px', borderRadius: '12px', border: '1px solid rgba(0,32,64,0.06)' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (isMatricesCat) setActiveReportSubTab('diario');
                                                    }}
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        padding: '9px 18px',
                                                        borderRadius: '9px',
                                                        fontSize: '12.5px',
                                                        fontWeight: '700',
                                                        letterSpacing: '0.3px',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease',
                                                        border: 'none',
                                                        backgroundColor: !isMatricesCat ? 'var(--primary, #002040)' : 'transparent',
                                                        color: !isMatricesCat ? '#ffffff' : 'var(--text-secondary, #5a6e7f)',
                                                        boxShadow: !isMatricesCat ? '0 4px 12px rgba(0, 32, 64, 0.2)' : 'none'
                                                    }}
                                                >
                                                    <FileText size={16} />
                                                    <span>REPORTES DE GESTIÓN</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (!isMatricesCat) setActiveReportSubTab('catastroficas');
                                                    }}
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        padding: '9px 18px',
                                                        borderRadius: '9px',
                                                        fontSize: '12.5px',
                                                        fontWeight: '700',
                                                        letterSpacing: '0.3px',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease',
                                                        border: 'none',
                                                        backgroundColor: isMatricesCat ? 'var(--primary, #002040)' : 'transparent',
                                                        color: isMatricesCat ? '#ffffff' : 'var(--text-secondary, #5a6e7f)',
                                                        boxShadow: isMatricesCat ? '0 4px 12px rgba(0, 32, 64, 0.2)' : 'none'
                                                    }}
                                                >
                                                    <FileSpreadsheet size={16} />
                                                    <span>MATRICES ESTADÍSTICAS</span>
                                                </button>
                                            </div>

                                            {/* Desplegable de Selección Específica */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1', maxWidth: '540px', minWidth: '280px' }}>
                                                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted, #8c9ba5)', textTransform: 'uppercase', letterSpacing: '0.6px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <Filter size={13} style={{ color: 'var(--primary, #002040)' }} />
                                                    {isMatricesCat ? 'Matriz:' : 'Reporte:'}
                                                </span>
                                                <div style={{ position: 'relative', width: '100%' }}>
                                                    <select
                                                        value={activeReportSubTab}
                                                        onChange={(e) => setActiveReportSubTab(e.target.value)}
                                                        style={{
                                                            width: '100%',
                                                            height: '42px',
                                                            padding: '0 36px 0 14px',
                                                            borderRadius: '10px',
                                                            border: '1.5px solid var(--border, #e0e6ed)',
                                                            backgroundColor: '#ffffff',
                                                            fontSize: '13px',
                                                            fontWeight: '700',
                                                            color: 'var(--primary, #002040)',
                                                            outline: 'none',
                                                            cursor: 'pointer',
                                                            boxShadow: '0 2px 8px rgba(0, 32, 64, 0.04)',
                                                            appearance: 'none',
                                                            WebkitAppearance: 'none',
                                                            transition: 'border-color 0.2s, box-shadow 0.2s'
                                                        }}
                                                    >
                                                        {!isMatricesCat ? (
                                                            <>
                                                                <option value="diario">Parte Diario de Atenciones del Día</option>
                                                                <option value="fichas">Fichas Médicas Ocupacionales (Ingreso / Cese / Reintegro)</option>
                                                                <option value="citas">Agendamiento y Control de Citas Médicas</option>
                                                                <option value="examenes">Órdenes de Exámenes & Laboratorio Clínico</option>
                                                                <option value="recetas">Prescripción Médica & Recetario Ocupacional</option>
                                                                <option value="mensual">Informe Estadístico Mensual Consolidado</option>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <option value="catastroficas">Matriz de Enfermedades Catastróficas o Huérfanas</option>
                                                                <option value="accidentes">Matriz de Accidentes Laborales y Enfermedades Profesionales</option>
                                                                <option value="covid">Matriz de Casos Sospechosos y Confirmados COVID-19</option>
                                                                <option value="ausentismo">Matriz de Ausentismo Laboral (Índice Horas Trabajadas/Ausentes)</option>
                                                                <option value="embarazadas">Matriz Censo de Embarazadas UEB (FPP / Semanas Gestación)</option>
                                                                <option value="psicosocial">Matriz de Riesgo Psicosocial (Ansiedad y Depresión)</option>
                                                                <option value="enfermedades_nuevas">Matriz de Enfermedades Nuevas (Incidencia UEB)</option>
                                                                <option value="examenes_periodicos">Matriz de Exámenes Médicos y Fichas Periódicas por Mes</option>
                                                                <option value="discapacidad">Matriz de Funcionarios con Discapacidad / Grupo Vulnerable</option>
                                                                <option value="vulnerables_patologias">Matriz de Grupos Vulnerables (Diabéticos, Hipertensos, Adulto Mayor, Otras)</option>
                                                                <option value="personal_nuevo">Matriz de Personal Nuevo que Ingresó en el Año</option>
                                                            </>
                                                        )}
                                                    </select>
                                                    <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary, #5a6e7f)' }} />
                                                </div>
                                            </div>

                                        </div>
                                    </article>
                                );
                            })()}

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
                                                    background: '#ef4444',
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
                                                    <span style={{ color: '#94a3b8', fontSize: '10px' }}>Vista previa del documento oficial para impresión</span>
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
                                                    <div className="spinner" style={{ border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid #fff', borderRadius: '50%', width: '32px', height: '32px', animation: 'spin 1s linear infinite' }}></div>
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
                                                        <button
                                                            type="button"
                                                            onClick={() => setFichaSearchTerm('')}
                                                            style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
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
                                                    background: '#ef4444',
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
                                                    <span style={{ color: '#94a3b8', fontSize: '10.5px' }}>
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
                                                        type="date"
                                                        value={reportCitasFecha}
                                                        onChange={(e) => setReportCitasFecha(e.target.value)}
                                                        style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px', fontSize: '11px', outline: 0 }}
                                                    />
                                                </label>
                                                <select
                                                    value={reportCitasEstado}
                                                    onChange={(e) => setReportCitasEstado(e.target.value)}
                                                    style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px', fontSize: '11.5px', outline: 0, background: 'white' }}
                                                >
                                                    <option value="all">Todos los estados</option>
                                                    <option value="programada">Programadas</option>
                                                    <option value="confirmada">Confirmadas</option>
                                                    <option value="completada">Completadas</option>
                                                    <option value="cancelada">Canceladas</option>
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
                                                    background: '#ef4444',
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
                                                    <span style={{ color: '#94a3b8', fontSize: '10px' }}>Vista previa del documento oficial para impresión</span>
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
                                                    <div className="spinner" style={{ border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid #fff', borderRadius: '50%', width: '32px', height: '32px', animation: 'spin 1s linear infinite' }}></div>
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
                                                                <td>{item.fecha}</td>
                                                                <td>
                                                                    <strong>{item.paciente}</strong>
                                                                    <small style={{ display: 'block', color: '#64748b', fontSize: '11px' }}>C.I: {item.cedula}</small>
                                                                </td>
                                                                <td>
                                                                    <span className="badge-role" style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '8px', fontSize: '11.5px', fontWeight: '600' }}>
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
                                                            <button
                                                                type="button"
                                                                onClick={() => setRecetasSearchNombre('')}
                                                                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Filtro por fecha */}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <CalendarDays size={16} color="var(--accent)" />
                                                        <input
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
                                                        background: '#ef4444',
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
                                                        <span style={{ color: '#94a3b8', fontSize: '10.5px' }}>
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
                                                    background: '#ef4444',
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
                                                    <span style={{ color: '#94a3b8', fontSize: '10px' }}>Vista previa del documento oficial para impresión</span>
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
                                                    <div className="spinner" style={{ border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid #fff', borderRadius: '50%', width: '32px', height: '32px', animation: 'spin 1s linear infinite' }}></div>
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
                                                    <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '10px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '12px' }}>FORMATO UEB</span>
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
                                                <div className="search-bar" style={{ maxWidth: '320px', margin: 0 }}>
                                                    <Search size={16} />
                                                    <input
                                                        type="text"
                                                        placeholder="Buscar por paciente, cédula o examen..."
                                                        value={examSearchTerm}
                                                        onChange={(e) => setExamSearchTerm(e.target.value)}
                                                    />
                                                    {examSearchTerm && (
                                                        <button onClick={() => setExamSearchTerm('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                                                            <X size={14} />
                                                        </button>
                                                    )}
                                                </div>

                                                {/* SELECTOR DE FECHA CON OPCIÓN HISTÓRICO */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                    <CalendarDays size={16} color="#0284c7" />
                                                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#334155' }}>Fecha Emisión:</span>
                                                    <input
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
                                                                <td style={{ padding: '10px 14px', color: '#334155' }}>{ord.fecha}</td>
                                                                <td style={{ padding: '10px 14px' }}>
                                                                    <div style={{ fontWeight: 'bold', color: '#0b3c5d' }}>{ord.paciente}</div>
                                                                    <div style={{ fontSize: '10px', color: '#64748b' }}>C.I: {ord.cedula}</div>
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
                                                                        fontSize: '10px',
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
                                                            <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
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
                            {isMatricesCat && (() => {
                                const meta = getActiveMatrixMeta();
                                return (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        {/* PANEL DE CONTROL SUPERIOR */}
                                        <article className="nurse-card span-12" style={{ borderRadius: '14px', padding: '18px 20px', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                                                {/* BÚSQUEDA DE PACIENTE O CÉDULA */}
                                                <div style={{ position: 'relative', flex: '1', minWidth: '260px', maxWidth: '420px' }}>
                                                    <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                                    <input
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
                                                                color: meta.activeSubtab === tab.id ? '#ffffff' : '#64748b',
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
                                                    <span style={{ background: '#e11d48', color: '#ffffff', fontSize: '10px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.5px' }}>PDF</span>
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

                        </div>
                    )}
                </div>
            </main>


            {/* MODAL REGISTRO FUNCIONARIO DISCAPACIDAD */}
            
            {/* --- MODAL REGISTRO GRUPOS VULNERABLES (PATOLOGÍAS) --- */}
            
            {/* --- MODAL REGISTRO DE AUSENTISMO LABORAL --- */}
            {isAusentismoModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100">
                        <div className="bg-[#facc15] text-slate-900 p-4 flex justify-between items-center border-b border-yellow-400">
                            <div className="flex items-center gap-2">
                                <FileSpreadsheet size={20} className="text-slate-900" />
                                <h3 className="font-bold text-base uppercase">Registrar Caso en Matriz de Ausentismo</h3>
                            </div>
                            <button
                                onClick={() => setIsAusentismoModalOpen(false)}
                                className="text-slate-700 hover:text-slate-900 p-1 rounded-lg hover:bg-yellow-300"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveAusentismoRecord} className="p-6 space-y-4">
                            {/* Buscar Paciente en Sistema */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Buscar Paciente / Funcionario
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Escriba cédula o nombres para autocompletar..."
                                        value={patientSearchTerm}
                                        onChange={(e) => {
                                            setPatientSearchTerm(e.target.value);
                                            handleSearchPatients(e.target.value);
                                        }}
                                        className="w-full pl-3 pr-8 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                                    />
                                    {isSearchingPatients && (
                                        <Loader2 className="animate-spin absolute right-2.5 top-2.5 text-yellow-600" size={16} />
                                    )}
                                </div>
                                {searchResults.length > 0 && (
                                    <div className="max-h-36 overflow-y-auto bg-white border border-slate-200 rounded-lg mt-1 divide-y shadow-sm">
                                        {searchResults.map(p => (
                                            <div
                                                key={p.id}
                                                onClick={() => {
                                                    setPatientSelected(p);
                                                    setAusentismoForm({
                                                        ...ausentismoForm,
                                                        paciente: `${p.nombres} ${p.apellidos}`.toUpperCase(),
                                                        cedula: p.cedula,
                                                        cargo: p.puestoTrabajo || 'SERVIDOR/DOCENTE'
                                                    });
                                                    setSearchResults([]);
                                                }}
                                                className="p-2 text-xs hover:bg-yellow-50 cursor-pointer flex justify-between"
                                            >
                                                <span className="font-bold">{p.nombres} {p.apellidos}</span>
                                                <span className="text-slate-500">{p.cedula} · {p.puestoTrabajo}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nombre Completo</label>
                                    <input
                                        type="text"
                                        required
                                        value={patientSelected ? `${patientSelected.nombres} ${patientSelected.apellidos}` : ausentismoForm.paciente}
                                        onChange={(e) => setAusentismoForm({ ...ausentismoForm, paciente: e.target.value })}
                                        placeholder="Ej: MONTEROS MONTERO RODRIGO"
                                        className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 uppercase"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Cédula</label>
                                    <input
                                        type="text"
                                        value={patientSelected?.cedula || ausentismoForm.cedula}
                                        onChange={(e) => setAusentismoForm({ ...ausentismoForm, cedula: e.target.value })}
                                        placeholder="020XXXXXXX"
                                        className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Motivo de Ausentismo</label>
                                    <select
                                        value={ausentismoForm.motivoTipo}
                                        onChange={(e) => setAusentismoForm({ ...ausentismoForm, motivoTipo: e.target.value })}
                                        className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                                    >
                                        <option value="enfermedad_comun">Enfermedad Común</option>
                                        <option value="enfermedad_laboral">Enfermedad Laboral</option>
                                        <option value="accidente_laboral">Accidente Laboral</option>
                                        <option value="otros">Otros Motivos / Consulta Médica</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Diagnóstico / Detalle</label>
                                    <input
                                        type="text"
                                        required
                                        value={ausentismoForm.diagnostico}
                                        onChange={(e) => setAusentismoForm({ ...ausentismoForm, diagnostico: e.target.value })}
                                        placeholder="Ej: FARINGITIS AGUDA / CONSULTA MÉD"
                                        className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 uppercase"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Días Perdidos</label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={ausentismoForm.diasPerdidos}
                                        onChange={(e) => {
                                            const d = parseInt(e.target.value) || 1;
                                            setAusentismoForm({
                                                ...ausentismoForm,
                                                diasPerdidos: e.target.value,
                                                horasAusentismo: String(d * 8)
                                            });
                                        }}
                                        className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Horas Ausencia</label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={ausentismoForm.horasAusentismo}
                                        onChange={(e) => setAusentismoForm({ ...ausentismoForm, horasAusentismo: e.target.value })}
                                        className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 font-bold text-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Horas Trabajadas</label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={ausentismoForm.horasTrabajadas}
                                        onChange={(e) => setAusentismoForm({ ...ausentismoForm, horasTrabajadas: e.target.value })}
                                        className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 font-bold text-sky-700"
                                    />
                                </div>
                            </div>

                            {/* Indicador en tiempo real del Índice */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex justify-between items-center">
                                <div>
                                    <span className="text-[11px] font-bold text-blue-900 block">Índice de Ausentismo Calculado:</span>
                                    <span className="text-[10px] text-blue-700">Fórmula: Horas Ausencia ({ausentismoForm.horasAusentismo || 0}) / Horas Trabajadas ({ausentismoForm.horasTrabajadas || 1})</span>
                                </div>
                                <span className="text-base font-black text-blue-700">
                                    {((parseInt(ausentismoForm.horasAusentismo) || 0) / (parseInt(ausentismoForm.horasTrabajadas) || 1)).toFixed(3).replace('.', ',')}
                                </span>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsAusentismoModalOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 text-xs font-bold bg-[#facc15] hover:bg-yellow-400 text-slate-900 rounded-lg shadow-md"
                                >
                                    Guardar en Matriz
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL REGISTRO CENSO DE EMBARAZADAS --- */}
            {isEmbarazadasModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100">
                        <div className="bg-[#00b0f0] text-slate-900 p-4 flex justify-between items-center border-b border-sky-400">
                            <div className="flex items-center gap-2">
                                <Baby size={20} className="text-slate-900" />
                                <h3 className="font-bold text-base uppercase">Registrar en Censo de Embarazadas UEB</h3>
                            </div>
                            <button
                                onClick={() => setIsEmbarazadasModalOpen(false)}
                                className="text-slate-800 hover:text-slate-950 p-1 rounded-lg hover:bg-sky-300"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveEmbarazadasRecord} className="p-6 space-y-4">
                            {/* Buscar Paciente en Sistema */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Buscar Paciente / Funcionaria
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Escriba cédula o nombres para autocompletar..."
                                        value={patientSearchTerm}
                                        onChange={(e) => {
                                            setPatientSearchTerm(e.target.value);
                                            handleSearchPatients(e.target.value);
                                        }}
                                        className="w-full pl-3 pr-8 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                                    />
                                    {isSearchingPatients && (
                                        <Loader2 className="animate-spin absolute right-2.5 top-2.5 text-sky-600" size={16} />
                                    )}
                                </div>
                                {searchResults.length > 0 && (
                                    <div className="max-h-36 overflow-y-auto bg-white border border-slate-200 rounded-lg mt-1 divide-y shadow-sm">
                                        {searchResults.map(p => (
                                            <div
                                                key={p.id}
                                                onClick={() => {
                                                    setPatientSelected(p);
                                                    setEmbarazadasForm({
                                                        ...embarazadasForm,
                                                        paciente: `${p.nombres} ${p.apellidos}`.toUpperCase(),
                                                        cedula: p.cedula,
                                                        edad: String(p.edad || 30)
                                                    });
                                                    setSearchResults([]);
                                                }}
                                                className="p-2 text-xs hover:bg-sky-50 cursor-pointer flex justify-between"
                                            >
                                                <span className="font-bold">{p.nombres} {p.apellidos}</span>
                                                <span className="text-slate-500">{p.cedula} · {p.edad ? `${p.edad} años` : ''}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nombre Completo</label>
                                    <input
                                        type="text"
                                        required
                                        value={patientSelected ? `${patientSelected.nombres} ${patientSelected.apellidos}` : embarazadasForm.paciente}
                                        onChange={(e) => setEmbarazadasForm({ ...embarazadasForm, paciente: e.target.value })}
                                        placeholder="Ej: LEON MONAR PATRICIA"
                                        className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 uppercase"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Edad</label>
                                    <input
                                        type="number"
                                        required
                                        min="16"
                                        max="60"
                                        value={patientSelected?.edad || embarazadasForm.edad}
                                        onChange={(e) => setEmbarazadasForm({ ...embarazadasForm, edad: e.target.value })}
                                        className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">FUM (Última Menstruación)</label>
                                    <input
                                        type="date"
                                        required
                                        value={embarazadasForm.fum}
                                        onChange={(e) => {
                                            const fumVal = e.target.value;
                                            let fppCalc = embarazadasForm.fechaProbableParto;
                                            let semCalc = embarazadasForm.semanasGestacion;
                                            try {
                                                const fumDate = new Date(fumVal);
                                                if (!isNaN(fumDate.getTime())) {
                                                    const fppDate = new Date(fumDate.getTime() + 280 * 24 * 60 * 60 * 1000);
                                                    const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];
                                                    const yearShort = String(fppDate.getFullYear()).slice(-2);
                                                    fppCalc = `${monthNames[fppDate.getMonth()]}-${yearShort}`;
                                                    const diffMs = new Date().getTime() - fumDate.getTime();
                                                    const diffWeeks = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7)));
                                                    const todayFormatted = new Date().toLocaleDateString('es-EC');
                                                    semCalc = `${diffWeeks} SEMANAS (${todayFormatted})`;
                                                }
                                            } catch (err) {}
                                            setEmbarazadasForm({
                                                ...embarazadasForm,
                                                fum: fumVal,
                                                fechaProbableParto: fppCalc,
                                                semanasGestacion: semCalc
                                            });
                                        }}
                                        className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">FPP Calculada</label>
                                    <input
                                        type="text"
                                        required
                                        value={embarazadasForm.fechaProbableParto}
                                        onChange={(e) => setEmbarazadasForm({ ...embarazadasForm, fechaProbableParto: e.target.value })}
                                        placeholder="may-26"
                                        className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 font-bold text-emerald-700"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Semanas de Gestación</label>
                                    <input
                                        type="text"
                                        required
                                        value={embarazadasForm.semanasGestacion}
                                        onChange={(e) => setEmbarazadasForm({ ...embarazadasForm, semanasGestacion: e.target.value })}
                                        placeholder="21 SEMANAS (14/01/2026)"
                                        className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 font-bold text-orange-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Controles Prenatales</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={embarazadasForm.controles}
                                        onChange={(e) => setEmbarazadasForm({ ...embarazadasForm, controles: e.target.value })}
                                        className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 font-bold text-blue-700"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Teléfono de Contacto</label>
                                <input
                                    type="text"
                                    required
                                    value={embarazadasForm.telefono}
                                    onChange={(e) => setEmbarazadasForm({ ...embarazadasForm, telefono: e.target.value })}
                                    placeholder="0986268194"
                                    className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsEmbarazadasModalOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 text-xs font-bold bg-[#00b0f0] hover:bg-sky-500 text-slate-900 rounded-lg shadow-md font-bold"
                                >
                                    Guardar en Censo
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL REGISTRO DE RIESGO PSICOSOCIAL (ANSIEDAD Y DEPRESIÓN) --- */}
            {isPsicosocialModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100">
                        <div className="bg-[#c55a11] text-white p-4 flex justify-between items-center border-b border-orange-700">
                            <div className="flex items-center gap-2">
                                <Brain size={20} className="text-white" />
                                <h3 className="font-bold text-base uppercase">Registrar Caso de Riesgo Psicosocial UEB</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsPsicosocialModalOpen(false)}
                                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSavePsicosocialRecord} className="p-6 space-y-4">
                            {/* Buscar Paciente en Sistema */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Buscar Paciente / Funcionario
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Escriba cédula o nombres para autocompletar..."
                                        value={patientSearchTerm}
                                        onChange={(e) => {
                                            setPatientSearchTerm(e.target.value);
                                            handleSearchPatients(e.target.value);
                                        }}
                                        className="w-full pl-3 pr-8 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                    />
                                    {isSearchingPatients && (
                                        <Loader2 className="animate-spin absolute right-2.5 top-2.5 text-orange-600" size={16} />
                                    )}
                                </div>
                                {searchResults.length > 0 && (
                                    <div className="max-h-36 overflow-y-auto bg-white border border-slate-200 rounded-lg mt-1 divide-y shadow-sm">
                                        {searchResults.map(p => (
                                            <div
                                                key={p.id}
                                                onClick={() => {
                                                    setPatientSelected(p);
                                                    setPsicosocialForm({
                                                        ...psicosocialForm,
                                                        paciente: `${p.nombres} ${p.apellidos}`.toUpperCase(),
                                                        cedula: p.cedula || '0201234567'
                                                    });
                                                    setSearchResults([]);
                                                }}
                                                className="p-2 text-xs hover:bg-orange-50 cursor-pointer flex justify-between"
                                            >
                                                <span className="font-bold">{p.nombres} {p.apellidos}</span>
                                                <span className="text-slate-500">{p.cedula} · {p.tipo || 'Funcionario'}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nombres y Apellidos</label>
                                    <input
                                        type="text"
                                        required
                                        value={patientSelected ? `${patientSelected.nombres} ${patientSelected.apellidos}` : psicosocialForm.paciente}
                                        onChange={(e) => setPsicosocialForm({ ...psicosocialForm, paciente: e.target.value })}
                                        placeholder="Ej: ZAVALA CARDENAS LORENA DEL ROCIO"
                                        className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 uppercase"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Cédula</label>
                                    <input
                                        type="text"
                                        required
                                        value={patientSelected?.cedula || psicosocialForm.cedula}
                                        onChange={(e) => setPsicosocialForm({ ...psicosocialForm, cedula: e.target.value })}
                                        placeholder="0201234567"
                                        className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tipo de Servidor</label>
                                <select
                                    value={psicosocialForm.tiposervidor}
                                    onChange={(e) => setPsicosocialForm({ ...psicosocialForm, tiposervidor: e.target.value })}
                                    className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 font-bold"
                                >
                                    <option value="DOCENTE TITULAR">DOCENTE TITULAR</option>
                                    <option value="ADMINISTRATIVO">ADMINISTRATIVO</option>
                                    <option value="CODIGO">CODIGO (CÓDIGO DE TRABAJO)</option>
                                    <option value="DOCENTE OCASIONAL">DOCENTE OCASIONAL</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Diagnóstico Psicosocial</label>
                                <input
                                    type="text"
                                    required
                                    value={psicosocialForm.diagnostico}
                                    onChange={(e) => setPsicosocialForm({ ...psicosocialForm, diagnostico: e.target.value })}
                                    placeholder="Ej: DEPRESION Y ANSIEDAD"
                                    className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 font-bold uppercase text-red-700"
                                />
                                <div className="flex gap-1 mt-1 flex-wrap">
                                    {['DEPRESION Y ANSIEDAD', 'EPISODIO DEPRESIVO MODERADO', 'TRASTORNO DE ANSIEDAD GENERALIZADA', 'ESTRÉS LABORAL / BURNOUT'].map(d => (
                                        <button
                                            key={d}
                                            type="button"
                                            onClick={() => setPsicosocialForm({ ...psicosocialForm, diagnostico: d })}
                                            className="text-[10px] bg-slate-100 hover:bg-orange-100 text-slate-700 px-2 py-0.5 rounded cursor-pointer border border-slate-200"
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Observaciones / Plan de Intervención</label>
                                <textarea
                                    rows={2}
                                    value={psicosocialForm.observaciones}
                                    onChange={(e) => setPsicosocialForm({ ...psicosocialForm, observaciones: e.target.value })}
                                    className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                    placeholder="Seguimiento por Salud Ocupacional y Psicología Institucional..."
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsPsicosocialModalOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 text-xs font-bold bg-[#c55a11] hover:bg-orange-700 text-white rounded-lg shadow-md font-bold"
                                >
                                    Guardar en Matriz
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL REGISTRO DE ENFERMEDAD NUEVA (INCIDENCIA UEB) --- */}
            {isEnfermedadesNuevasModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100">
                        <div className="bg-[#ed7d31] text-white p-4 flex justify-between items-center border-b border-orange-600">
                            <div className="flex items-center gap-2">
                                <Sparkles size={20} className="text-white" />
                                <h3 className="font-bold text-base uppercase">Registrar Enfermedad Nueva (Incidencia UEB)</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsEnfermedadesNuevasModalOpen(false)}
                                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveEnfermedadesNuevasRecord} className="p-6 space-y-4">
                            {/* Buscar Paciente en Sistema */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Buscar Paciente / Funcionario
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Escriba cédula o nombres para autocompletar..."
                                        value={patientSearchTerm}
                                        onChange={(e) => {
                                            setPatientSearchTerm(e.target.value);
                                            handleSearchPatients(e.target.value);
                                        }}
                                        className="w-full pl-3 pr-8 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                    />
                                    {isSearchingPatients && (
                                        <Loader2 className="animate-spin absolute right-2.5 top-2.5 text-orange-600" size={16} />
                                    )}
                                </div>
                                {searchResults.length > 0 && (
                                    <div className="max-h-36 overflow-y-auto bg-white border border-slate-200 rounded-lg mt-1 divide-y shadow-sm">
                                        {searchResults.map(p => (
                                            <div
                                                key={p.id}
                                                onClick={() => {
                                                    setPatientSelected(p);
                                                    setEnfermedadesNuevasForm({
                                                        ...enfermedadesNuevasForm,
                                                        paciente: `${p.nombres} ${p.apellidos}`.toUpperCase(),
                                                        cedula: p.cedula || '0201234567'
                                                    });
                                                    setSearchResults([]);
                                                }}
                                                className="p-2 text-xs hover:bg-orange-50 cursor-pointer flex justify-between"
                                            >
                                                <span className="font-bold">{p.nombres} {p.apellidos}</span>
                                                <span className="text-slate-500">{p.cedula} · {p.tipo || 'Funcionario'}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nombres y Apellidos</label>
                                    <input
                                        type="text"
                                        required
                                        value={patientSelected ? `${patientSelected.nombres} ${patientSelected.apellidos}` : enfermedadesNuevasForm.paciente}
                                        onChange={(e) => setEnfermedadesNuevasForm({ ...enfermedadesNuevasForm, paciente: e.target.value })}
                                        placeholder="Ej: CHELA YAZUMA TEODORO"
                                        className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 uppercase font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Cédula</label>
                                    <input
                                        type="text"
                                        required
                                        value={patientSelected?.cedula || enfermedadesNuevasForm.cedula}
                                        onChange={(e) => setEnfermedadesNuevasForm({ ...enfermedadesNuevasForm, cedula: e.target.value })}
                                        placeholder="0201234567"
                                        className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Patología Nueva (Incidencia)</label>
                                <input
                                    type="text"
                                    required
                                    value={enfermedadesNuevasForm.patologiaNueva}
                                    onChange={(e) => setEnfermedadesNuevasForm({ ...enfermedadesNuevasForm, patologiaNueva: e.target.value })}
                                    placeholder="Ej: BRONQUITIS, POLIARTROSIS, etc."
                                    className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 font-bold uppercase text-emerald-700"
                                />
                                <div className="flex gap-1 mt-1 flex-wrap">
                                    {['BRONQUITIS', 'POLIARTROSIS', 'ARTRITIS REUMATOIDE', 'TRASTORNO DEL DISCO LUMBAR', 'HIPERPLASIA ENDOMETRIAL', 'MIOMAS UTERINOS'].map(d => (
                                        <button
                                            key={d}
                                            type="button"
                                            onClick={() => setEnfermedadesNuevasForm({ ...enfermedadesNuevasForm, patologiaNueva: d })}
                                            className="text-[10px] bg-slate-100 hover:bg-orange-100 text-slate-700 px-2 py-0.5 rounded cursor-pointer border border-slate-200"
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Fecha de Aparecimiento</label>
                                <input
                                    type="date"
                                    required
                                    value={enfermedadesNuevasForm.fechaAparecimiento}
                                    onChange={(e) => setEnfermedadesNuevasForm({ ...enfermedadesNuevasForm, fechaAparecimiento: e.target.value })}
                                    className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 font-bold"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Observaciones / Criterio Médico Ocupacional</label>
                                <textarea
                                    rows={2}
                                    value={enfermedadesNuevasForm.observaciones}
                                    onChange={(e) => setEnfermedadesNuevasForm({ ...enfermedadesNuevasForm, observaciones: e.target.value })}
                                    className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                    placeholder="Detalles del diagnóstico, evolución o seguimiento..."
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsEnfermedadesNuevasModalOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 text-xs font-bold bg-[#ed7d31] hover:bg-orange-700 text-white rounded-lg shadow-md font-bold"
                                >
                                    Guardar Patología
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL REGISTRO / ACTUALIZACIÓN EXÁMENES MÉDICOS Y FICHAS PERIÓDICAS --- */}
            {isExamenesPeriodicosModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
                        <div className="bg-[#ed7d31] text-white p-4 flex justify-between items-center border-b border-orange-600">
                            <div className="flex items-center gap-2">
                                <Calendar size={20} className="text-white" />
                                <h3 className="font-bold text-base uppercase">Actualizar Exámenes - Año {examenesPeriodicosSelectedYear}</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsExamenesPeriodicosModalOpen(false)}
                                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveExamenesPeriodicosRecord} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Mes a Registrar / Actualizar
                                </label>
                                <select
                                    value={examenesPeriodicosForm.mes}
                                    onChange={(e) => {
                                        const selectedMes = e.target.value;
                                        const currentYearList = examenesPeriodicosData[examenesPeriodicosSelectedYear] || [];
                                        const existing = currentYearList.find(i => i.mes.toUpperCase() === selectedMes.toUpperCase());
                                        setExamenesPeriodicosForm({
                                            mes: selectedMes,
                                            examenes: existing ? existing.examenes : 0
                                        });
                                    }}
                                    className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 font-bold"
                                >
                                    {[
                                        'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
                                        'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
                                    ].map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Total de Exámenes Médicos y Fichas Periódicas
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    required
                                    value={examenesPeriodicosForm.examenes}
                                    onChange={(e) => setExamenesPeriodicosForm({ ...examenesPeriodicosForm, examenes: e.target.value })}
                                    placeholder="Ej: 68"
                                    className="w-full p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 font-extrabold text-blue-900"
                                />
                                <p className="text-[11px] text-slate-500 mt-1">
                                    Este valor se registrará como el total oficial completado para el mes de {examenesPeriodicosForm.mes} en el año {examenesPeriodicosSelectedYear}.
                                </p>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsExamenesPeriodicosModalOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 text-xs font-bold bg-[#ed7d31] hover:bg-orange-700 text-white rounded-lg shadow-md font-bold"
                                >
                                    Guardar en Matriz
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL REGISTRO PERSONAL NUEVO QUE INGRESÓ --- */}
            {isPersonalNuevoModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100">
                        <div className="bg-[#ea580c] text-white p-4 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <UserPlus size={20} />
                                <h3 className="font-bold text-base uppercase">Registrar Personal Nuevo que Ingresó</h3>
                            </div>
                            <button
                                onClick={() => setIsPersonalNuevoModalOpen(false)}
                                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSavePersonalNuevoRecord} className="p-6 space-y-4">
                            {/* Buscar Paciente en Sistema */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Buscar Paciente Existente
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Escriba cédula o nombres para autocompletar..."
                                        value={patientSearchTerm}
                                        onChange={(e) => {
                                            setPatientSearchTerm(e.target.value);
                                            handleSearchPatients(e.target.value);
                                        }}
                                        className="w-full pl-3 pr-8 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                    />
                                    {isSearchingPatients && (
                                        <Loader2 className="animate-spin absolute right-2.5 top-2.5 text-orange-600" size={16} />
                                    )}
                                </div>
                                {searchResults.length > 0 && (
                                    <div className="max-h-36 overflow-y-auto bg-white border border-slate-200 rounded-lg mt-1 divide-y shadow-sm">
                                        {searchResults.map(p => (
                                            <div
                                                key={p.id}
                                                onClick={() => {
                                                    setPatientSelected(p);
                                                    setPersonalNuevoForm({
                                                        ...personalNuevoForm,
                                                        paciente: `${p.nombres} ${p.apellidos}`.toUpperCase(),
                                                        cedula: p.cedula,
                                                        cargo: p.puestoTrabajo || ''
                                                    });
                                                    setSearchResults([]);
                                                }}
                                                className="p-2 text-xs hover:bg-orange-50 cursor-pointer flex justify-between"
                                            >
                                                <span className="font-bold">{p.nombres} {p.apellidos}</span>
                                                <span className="text-slate-500">{p.cedula}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Nombre Completo */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Nombre y Apellido *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={personalNuevoForm.paciente}
                                    onChange={(e) => setPersonalNuevoForm({ ...personalNuevoForm, paciente: e.target.value })}
                                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-bold uppercase"
                                    placeholder="EJ: ALFREDO DAVID APUNTE GARCIA"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Cédula *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={personalNuevoForm.cedula}
                                        onChange={(e) => setPersonalNuevoForm({ ...personalNuevoForm, cedula: e.target.value })}
                                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-bold font-mono"
                                        placeholder="EJ: 201747821"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Fecha de Ingreso *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={personalNuevoForm.fechaIngreso}
                                        onChange={(e) => setPersonalNuevoForm({ ...personalNuevoForm, fechaIngreso: e.target.value })}
                                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-bold"
                                    />
                                </div>
                            </div>

                            {/* Cargo */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Cargo Institucional *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={personalNuevoForm.cargo}
                                    onChange={(e) => setPersonalNuevoForm({ ...personalNuevoForm, cargo: e.target.value })}
                                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-bold uppercase"
                                    placeholder="EJ: PROFESOR OCASIONAL TIEMPO COMPLETO / AUXILIAR DE MANTENIMIENTO"
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-2 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsPersonalNuevoModalOpen(false)}
                                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[#ea580c] text-white rounded-lg text-xs font-bold hover:bg-orange-700 shadow-sm"
                                >
                                    Guardar Ingreso
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            {isVulnerablePatologiasModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100">
                        <div className="bg-[#0070c0] text-white p-4 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <HeartPulse size={20} />
                                <h3 className="font-bold text-base uppercase">Registrar Paciente en Grupo Vulnerable</h3>
                            </div>
                            <button
                                onClick={() => setIsVulnerablePatologiasModalOpen(false)}
                                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveVulnerablePatologiaRecord} className="p-6 space-y-4">
                            {/* Buscar Paciente en Sistema */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Buscar Paciente Existente
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Escriba cédula o nombres..."
                                        value={patientSearchTerm}
                                        onChange={(e) => {
                                            setPatientSearchTerm(e.target.value);
                                            handleSearchPatients(e.target.value);
                                        }}
                                        className="w-full pl-3 pr-8 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                    {isSearchingPatients && (
                                        <Loader2 className="animate-spin absolute right-2.5 top-2.5 text-blue-600" size={16} />
                                    )}
                                </div>
                                {searchResults.length > 0 && (
                                    <div className="max-h-36 overflow-y-auto bg-white border border-slate-200 rounded-lg mt-1 divide-y shadow-sm">
                                        {searchResults.map(p => (
                                            <div
                                                key={p.id}
                                                onClick={() => {
                                                    setPatientSelected(p);
                                                    setVulnerablePatologiasForm({
                                                        ...vulnerablePatologiasForm,
                                                        paciente: `${p.nombres} ${p.apellidos}`.toUpperCase(),
                                                        cedula: p.cedula
                                                    });
                                                    setSearchResults([]);
                                                }}
                                                className="p-2 text-xs hover:bg-blue-50 cursor-pointer flex justify-between"
                                            >
                                                <span className="font-bold">{p.nombres} {p.apellidos}</span>
                                                <span className="text-slate-500">{p.cedula}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Nombre completo */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Nombres y Apellidos *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={vulnerablePatologiasForm.paciente}
                                    onChange={(e) => setVulnerablePatologiasForm({ ...vulnerablePatologiasForm, paciente: e.target.value })}
                                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-bold uppercase"
                                    placeholder="EJ: ALBAN GARCIA DORINDA FABIOLA"
                                />
                            </div>

                            {/* Selección de Grupo */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Grupo Vulnerable *
                                </label>
                                <select
                                    value={vulnerablePatologiasForm.grupo}
                                    onChange={(e) => setVulnerablePatologiasForm({ ...vulnerablePatologiasForm, grupo: e.target.value })}
                                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-bold"
                                >
                                    <option value="diabeticos">GRUPO DE DIABÉTICOS</option>
                                    <option value="hipertensos">GRUPO DE HIPERTENSOS</option>
                                    <option value="adultoMayor">GRUPO DE ADULTO MAYOR</option>
                                    <option value="otras">OTRAS ENFERMEDADES</option>
                                </select>
                            </div>

                            {/* Edad (si es adulto mayor) */}
                            {vulnerablePatologiasForm.grupo === 'adultoMayor' && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Edad (en Años)
                                    </label>
                                    <input
                                        type="number"
                                        value={vulnerablePatologiasForm.edad}
                                        onChange={(e) => setVulnerablePatologiasForm({ ...vulnerablePatologiasForm, edad: e.target.value })}
                                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-bold"
                                        placeholder="EJ: 64"
                                    />
                                </div>
                            )}

                            {/* Patología / Diagnóstico (si es Otras Enfermedades) */}
                            {vulnerablePatologiasForm.grupo === 'otras' && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Patología / Diagnóstico Específico
                                    </label>
                                    <input
                                        type="text"
                                        value={vulnerablePatologiasForm.patologia}
                                        onChange={(e) => setVulnerablePatologiasForm({ ...vulnerablePatologiasForm, patologia: e.target.value })}
                                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-bold uppercase"
                                        placeholder="EJ: SARCOIDOSIS (AFECTACION DE LOS GANGLIOS LINFATICOS)"
                                    />
                                </div>
                            )}

                            <div className="pt-4 flex justify-end gap-2 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsVulnerablePatologiasModalOpen(false)}
                                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[#0070c0] text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm"
                                >
                                    Guardar Registro
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            {isDiscapacidadModalOpen && (
                <div className="clinical-modal show" style={{ zIndex: 1080 }}>
                    <div className="clinical-modal__backdrop" onClick={() => setIsDiscapacidadModalOpen(false)}></div>
                    <section className="clinical-modal__dialog" style={{ maxWidth: '580px' }}>
                        <header className="clinical-modal__header" style={{ background: '#0070c0', color: '#ffffff' }}>
                            <div className="clinical-modal__patient">
                                <span className="clinical-modal__avatar" style={{ background: '#ea580c', color: '#fff' }}>DIS</span>
                                <div>
                                    <span style={{ color: '#bae6fd', fontWeight: 'bold', fontSize: '11px' }}>MATRIZ DE DISCAPACIDAD Y VULNERABILIDAD</span>
                                    <h2 style={{ color: '#ffffff', margin: 0, fontSize: '16px' }}>Registrar Funcionario con Discapacidad</h2>
                                </div>
                            </div>
                            <button className="clinical-modal__close" onClick={() => setIsDiscapacidadModalOpen(false)}><X size={15} color="#fff" /></button>
                        </header>

                        <form onSubmit={handleSaveDiscapacidadRecord} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div>
                                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>BUSCAR PACIENTE REGISTRADO</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        placeholder="Escriba cédula o nombres para autocompletar..."
                                        value={patientSearchTerm}
                                        onChange={(e) => {
                                            setPatientSearchTerm(e.target.value);
                                            handleSearchPatients(e.target.value);
                                        }}
                                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '12px' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>NOMBRES Y APELLIDOS *</label>
                                <input
                                    type="text"
                                    required
                                    value={discapacidadForm.paciente}
                                    onChange={(e) => setDiscapacidadForm({ ...discapacidadForm, paciente: e.target.value })}
                                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}
                                    placeholder="EJ: ACEBEDO DEL VALLE GINA MARISOL"
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>TIPO DE DISCAPACIDAD</label>
                                    <select
                                        value={discapacidadForm.tipoDiscapacidad}
                                        onChange={(e) => setDiscapacidadForm({ ...discapacidadForm, tipoDiscapacidad: e.target.value })}
                                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '12px', fontWeight: 'bold' }}
                                    >
                                        <option value="FÍSICA">FÍSICA</option>
                                        <option value="VISUAL">VISUAL</option>
                                        <option value="AUDITIVA">AUDITIVA</option>
                                        <option value="INTELECTUAL">INTELECTUAL</option>
                                        <option value="PSICOSOCIAL">PSICOSOCIAL</option>
                                        <option value="MÚLTIPLE">MÚLTIPLE</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>PORCENTAJE %</label>
                                    <input
                                        type="text"
                                        required
                                        value={discapacidadForm.porcentaje}
                                        onChange={(e) => setDiscapacidadForm({ ...discapacidadForm, porcentaje: e.target.value })}
                                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '12px', fontWeight: 'bold' }}
                                        placeholder="EJ: 40%"
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>CARGO</label>
                                    <input
                                        type="text"
                                        value={discapacidadForm.cargo}
                                        onChange={(e) => setDiscapacidadForm({ ...discapacidadForm, cargo: e.target.value })}
                                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '12px', textTransform: 'uppercase' }}
                                        placeholder="EJ: DOCENTE TITULAR"
                                    />
                                </div>

                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>CONDICIÓN LABORAL</label>
                                    <select
                                        value={discapacidadForm.condicionLaboral}
                                        onChange={(e) => setDiscapacidadForm({ ...discapacidadForm, condicionLaboral: e.target.value })}
                                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '12px', fontWeight: 'bold' }}
                                    >
                                        <option value="NOMBRAMIENTO">NOMBRAMIENTO</option>
                                        <option value="CONTRATO OCASIONAL">CONTRATO OCASIONAL</option>
                                        <option value="CÓDIGO DE TRABAJO">CÓDIGO DE TRABAJO</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>DEPENDENCIA / FACULTAD</label>
                                <input
                                    type="text"
                                    value={discapacidadForm.dependencia}
                                    onChange={(e) => setDiscapacidadForm({ ...discapacidadForm, dependencia: e.target.value })}
                                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '12px', textTransform: 'uppercase' }}
                                    placeholder="EJ: FACULTAD DE CIENCIAS ADMINISTRATIVAS"
                                />
                            </div>

                            <div style={{ display: 'flex', justifySelf: 'end', gap: '8px', marginTop: '10px' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsDiscapacidadModalOpen(false)}
                                    style={{ padding: '8px 16px', borderRadius: '8px', background: '#f1f5f9', border: 'none', color: '#475569', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    style={{ padding: '8px 20px', borderRadius: '8px', background: '#0070c0', border: 'none', color: '#ffffff', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                    Guardar Funcionario
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}

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
                                <span className="header-autosave-badge" title="Borrador respaldado automáticamente">
                                    <CheckCircle size={13} color="#f87171" /> Guardado {new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </span>
                                <button className="clinical-modal__close" onClick={handleCancelConsulta}><X size={15} /></button>
                            </div>
                        </header>

                        <div className="clinical-modal__body">
                            <div className="anamnesis-container">
                                {/* STEPPER CLINICO */}
                                <div className="clinical-stepper">
                                    {stepsList.map((step, idx) => (
                                        <React.Fragment key={idx}>
                                            <div
                                                className={`stepper-step ${consultaActiveStep === idx ? 'active' : ''} ${consultaActiveStep > idx ? 'completed' : ''}`}
                                                onClick={() => setConsultaActiveStep(idx)}
                                            >
                                                <div className="stepper-step__circle">{idx + 1}</div>
                                                <span className="stepper-step__label">{step.label}</span>
                                            </div>
                                            {idx < stepsList.length - 1 && <div className="stepper-separator" />}
                                        </React.Fragment>
                                    ))}
                                </div>

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
                                                        <span>PA SISTÓLICA (MMHG)</span>
                                                        <input type="number" step="0.1" value={vitalSigns.paSystolic} onChange={e => setVitalSigns({ ...vitalSigns, paSystolic: e.target.value })} placeholder="Ej: 120" />
                                                    </label>
                                                    <label className="field">
                                                        <span>PA DIASTÓLICA (MMHG)</span>
                                                        <input type="number" step="0.1" value={vitalSigns.paDiastolic} onChange={e => setVitalSigns({ ...vitalSigns, paDiastolic: e.target.value })} placeholder="Ej: 80" />
                                                    </label>
                                                    <label className="field">
                                                        <span>FRECUENCIA CARDIACA (LPM)</span>
                                                        <input type="number" value={vitalSigns.fc} onChange={e => setVitalSigns({ ...vitalSigns, fc: e.target.value })} placeholder="Ej: 75" />
                                                    </label>
                                                    <label className="field">
                                                        <span>FRECUENCIA RESPIRATORIA (RPM)</span>
                                                        <input type="number" value={vitalSigns.fr} onChange={e => setVitalSigns({ ...vitalSigns, fr: e.target.value })} placeholder="Ej: 18" />
                                                    </label>
                                                    <label className="field">
                                                        <span>TEMPERATURA (°C)</span>
                                                        <input type="number" step="0.1" value={vitalSigns.temp} onChange={e => setVitalSigns({ ...vitalSigns, temp: e.target.value })} placeholder="Ej: 36.5" />
                                                    </label>
                                                    <label className="field">
                                                        <span>TALLA (CM)</span>
                                                        <input type="number" step="0.1" value={vitalSigns.talla} onChange={e => setVitalSigns({ ...vitalSigns, talla: e.target.value })} placeholder="Ej: 170" />
                                                    </label>
                                                    <label className="field">
                                                        <span>PESO (KG)</span>
                                                        <input type="number" step="0.1" value={vitalSigns.peso} onChange={e => setVitalSigns({ ...vitalSigns, peso: e.target.value })} placeholder="Ej: 70" />
                                                    </label>
                                                    <label className="field">
                                                        <span>SATURACIÓN SPO2 (%)</span>
                                                        <input type="number" value={vitalSigns.spo2} onChange={e => setVitalSigns({ ...vitalSigns, spo2: e.target.value })} placeholder="Ej: 98" />
                                                    </label>

                                                    <div className="premium-field-card" style={{ gridColumn: 'span 2', marginTop: '8px', padding: '14px', border: '1px solid rgba(0,32,64,0.08)' }}>
                                                        <div className="field-header" style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <div className="field-header__left" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                <span className="field-header__icon"><ShieldAlert size={14} color="var(--accent)" /></span>
                                                                <h4 className="field-header__title" style={{ margin: 0, fontSize: '12px', fontWeight: 'bold' }}>Tipo de Sangre</h4>
                                                            </div>
                                                            <span className="field-badge-opt" style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>OPCIONAL</span>
                                                        </div>
                                                        <select
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
                                                        <span>Motivo de la Atención Médica</span>
                                                        <textarea
                                                            rows={3}
                                                            style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid var(--border)', fontFamily: 'inherit' }}
                                                            value={motivoConsulta}
                                                            onChange={e => setMotivoConsulta(e.target.value)}
                                                            placeholder="Ej: Evaluación preocupacional, molestias osteomusculares, control de reintegro..."
                                                        />
                                                    </label>
                                                    <label className="field">
                                                        <span>Enfermedad o Sintomatología Actual</span>
                                                        <textarea
                                                            rows={3}
                                                            style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid var(--border)', fontFamily: 'inherit' }}
                                                            value={enfermedadActual}
                                                            onChange={e => setEnfermedadActual(e.target.value)}
                                                            placeholder="Detalle de síntomas, tiempo de evolución, intensidad..."
                                                        />
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
                                                        <span>Examen Físico Dirigido por Sistemas</span>
                                                        <textarea
                                                            rows={3}
                                                            style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid var(--border)', fontFamily: 'inherit' }}
                                                            value={examenFisico}
                                                            onChange={e => setExamenFisico(e.target.value)}
                                                            placeholder="Hallazgos en cabeza, cuello, tórax, postura, miembros superiores e inferiores..."
                                                        />
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
                                                        <span>Diagnóstico Principal (Código CIE-10)</span>
                                                        <input
                                                            type="text"
                                                            value={diagnosticoCie}
                                                            onChange={e => setDiagnosticoCie(e.target.value)}
                                                            placeholder="Ej: M54.5 - Lumbalgia no especificada / Z57.1 - Exposición Ocupacional a Ruido"
                                                        />
                                                    </label>
                                                    <label className="field">
                                                        <span>Plan de Tratamiento / Indicaciones Médicas</span>
                                                        <textarea
                                                            rows={3}
                                                            style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid var(--border)', fontFamily: 'inherit' }}
                                                            value={planTratamiento}
                                                            onChange={e => setPlanTratamiento(e.target.value)}
                                                            placeholder="Tratamiento farmacológico, recomendaciones biomecánicas, pausas activas..."
                                                        />
                                                    </label>
                                                </div>
                                            </div>
                                        )}

                                        {consultaActiveStep === 4 && (
                                            <div>
                                                <h3 style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <FileCheck size={16} /> 5. Dictamen de Aptitud Médica Ocupacional
                                                </h3>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '16px' }}>
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
                                                        <span>Detalle de Restricciones & Adaptaciones del Puesto</span>
                                                        <textarea
                                                            rows={3}
                                                            style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid var(--border)', fontFamily: 'inherit' }}
                                                            value={restriccionesOcupacionales}
                                                            onChange={e => setRestriccionesOcupacionales(e.target.value)}
                                                            placeholder="Ej: No levantar cargas mayores a 10kg, realizar pausas activas de 5 min por hora..."
                                                        />
                                                    </label>
                                                )}
                                            </div>
                                        )}

                                        {consultaActiveStep === 5 && (
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                                                    <h3 style={{ fontSize: '15px', color: 'var(--primary)', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <Pill size={18} /> Punto 7: Prescripción Médica & Recetario Ocupacional
                                                    </h3>
                                                    <span style={{ fontSize: '11.5px', background: '#dbeafe', color: '#1e40af', padding: '4px 10px', borderRadius: '12px', fontWeight: '700', border: '1px solid #bfdbfe', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                        <CheckCircle size={13} /> Conexión con Farmacia / Enfermería
                                                    </span>
                                                </div>

                                                {/* BUSCADOR DE FARMACIA */}
                                                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                                                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', display: 'inline-flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
                                                        <Search size={14} /> Buscar Medicamento en Catálogo de Farmacia de Enfermería
                                                    </label>
                                                    <div style={{ position: 'relative' }}>
                                                        <input
                                                            type="text"
                                                            value={farmaciaSearchQuery}
                                                            onChange={(e) => handleSearchFarmacia(e.target.value)}
                                                            placeholder="Escriba nombre o código (ej: Paracetamol, Ibuprofeno, Amoxicilina)..."
                                                            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', background: '#ffffff' }}
                                                        />
                                                        {farmaciaSearchResults.length > 0 && (
                                                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', zIndex: 100, maxHeight: '200px', overflowY: 'auto', marginTop: '4px' }}>
                                                                {farmaciaSearchResults.map((prod) => {
                                                                    const presentacionStr = typeof prod.presentacion === 'object' && prod.presentacion !== null
                                                                        ? (prod.presentacion.nombre || 'General')
                                                                        : (prod.presentacion || 'General');
                                                                    const hasStock = (prod.stock_cajas || 0) > 0 || (prod.stock_unidades || 0) > 0;
                                                                    return (
                                                                        <div
                                                                            key={prod.id}
                                                                            onClick={() => handleSelectFarmaciaProduct(prod)}
                                                                            style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px' }}
                                                                            onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                                                                            onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                                                                        >
                                                                            <div>
                                                                                <strong style={{ color: '#0f172a' }}>{prod.nombre}</strong>
                                                                                <small style={{ display: 'block', color: '#64748b', fontSize: '11px' }}>
                                                                                    Código: {prod.codigo || 'S/C'} | {presentacionStr}
                                                                                </small>
                                                                            </div>
                                                                            <span style={{
                                                                                background: hasStock ? '#dcfce7' : '#fef2f2',
                                                                                color: hasStock ? '#15803d' : '#dc2626',
                                                                                padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700'
                                                                            }}>
                                                                                {hasStock ? `Stock: ${prod.stock_cajas || 0} cj / ${prod.stock_unidades || 0} ud` : 'SIN STOCK'}
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* FORMULARIO DE DETALLE DEL MEDICAMENTO */}
                                                <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                                                    <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#334155', fontWeight: '700' }}>Configurar Medicamento Prescrito</h4>

                                                    <div className="clinical-fields-grid" style={{ gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                                        <label className="field">
                                                            <span>Medicamento Prescrito *</span>
                                                            <input
                                                                type="text"
                                                                value={prescripcionForm.detalle_medicamento}
                                                                onChange={(e) => setPrescripcionForm({ ...prescripcionForm, detalle_medicamento: e.target.value })}
                                                                placeholder="Ej: Paracetamol 500mg Tabletas"
                                                            />
                                                        </label>
                                                        <label className="field">
                                                            <span>Dosis Indicada</span>
                                                            <input
                                                                type="text"
                                                                value={prescripcionForm.dosis}
                                                                onChange={(e) => setPrescripcionForm({ ...prescripcionForm, dosis: e.target.value })}
                                                                placeholder="Ej: 1 comprimido"
                                                            />
                                                        </label>
                                                        <label className="field">
                                                            <span>Vía de Administración</span>
                                                            <select
                                                                value={prescripcionForm.via}
                                                                onChange={(e) => setPrescripcionForm({ ...prescripcionForm, via: e.target.value })}
                                                            >
                                                                <option value="Oral">Oral</option>
                                                                <option value="Intravenosa">Intravenosa</option>
                                                                <option value="Intramuscular">Intramuscular</option>
                                                                <option value="Tópica">Tópica</option>
                                                                <option value="Oftálmica">Oftálmica</option>
                                                                <option value="Sublingual">Sublingual</option>
                                                                <option value="Inhalatoria">Inhalatoria</option>
                                                            </select>
                                                        </label>
                                                    </div>

                                                    <div className="clinical-fields-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                                        <label className="field">
                                                            <span>Frecuencia (Horas)</span>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={prescripcionForm.frecuencia}
                                                                onChange={(e) => setPrescripcionForm({ ...prescripcionForm, frecuencia: e.target.value })}
                                                            />
                                                        </label>
                                                        <label className="field">
                                                            <span>Duración (Días)</span>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={prescripcionForm.duracion}
                                                                onChange={(e) => setPrescripcionForm({ ...prescripcionForm, duracion: e.target.value })}
                                                            />
                                                        </label>
                                                        <label className="field">
                                                            <span>Cant. Cajas</span>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={prescripcionForm.cantidad_cajas}
                                                                onChange={(e) => setPrescripcionForm({ ...prescripcionForm, cantidad_cajas: e.target.value })}
                                                            />
                                                        </label>
                                                        <label className="field">
                                                            <span>Cant. Unidades</span>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={prescripcionForm.cantidad_unidades}
                                                                onChange={(e) => setPrescripcionForm({ ...prescripcionForm, cantidad_unidades: e.target.value })}
                                                            />
                                                        </label>
                                                    </div>

                                                    {/* SELECCIÓN DE DISPONIBILIDAD EN FARMACIA */}
                                                    <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
                                                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '8px' }}>
                                                            Disponibilidad en Farmacia de Enfermería:
                                                        </span>
                                                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                                            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', cursor: 'pointer', fontWeight: '600', color: '#166534' }}>
                                                                <input
                                                                    type="radio"
                                                                    name="disponible_farmacia"
                                                                    checked={prescripcionForm.disponible_farmacia === 'farmacia'}
                                                                    onChange={() => setPrescripcionForm({ ...prescripcionForm, disponible_farmacia: 'farmacia' })}
                                                                    style={{ accentColor: '#16a34a' }}
                                                                />
                                                                Dispensar en Farmacia de Enfermería
                                                            </label>
                                                            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', cursor: 'pointer', fontWeight: '600', color: '#b45309' }}>
                                                                <input
                                                                    type="radio"
                                                                    name="disponible_farmacia"
                                                                    checked={prescripcionForm.disponible_farmacia === 'no_disponible'}
                                                                    onChange={() => setPrescripcionForm({ ...prescripcionForm, disponible_farmacia: 'no_disponible' })}
                                                                    style={{ accentColor: '#d97706' }}
                                                                />
                                                                No disponible en Farmacia / Fármaco Alternativo Enviado
                                                            </label>
                                                        </div>
                                                    </div>

                                                    {/* CAMPO DE DETALLE CUANDO NO HAY MEDICINA */}
                                                    {prescripcionForm.disponible_farmacia === 'no_disponible' && (
                                                        <div className="field" style={{ marginBottom: '12px' }}>
                                                            <span style={{ color: '#b45309', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                                                <AlertTriangle size={14} /> Detalle en Caso de No Disponibilidad / Alternativa Enviada *
                                                            </span>
                                                            <textarea
                                                                rows={2}
                                                                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #fcd34d', background: '#fffbeb', fontSize: '12.5px', fontFamily: 'inherit' }}
                                                                value={prescripcionForm.observacion_nodisponible}
                                                                onChange={(e) => setPrescripcionForm({ ...prescripcionForm, observacion_nodisponible: e.target.value })}
                                                                placeholder="Especifique el motivo de no disponibilidad en farmacia institucional o detalle la alternativa / receta externa enviada al trabajador..."
                                                            />
                                                        </div>
                                                    )}

                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                                                        <button
                                                            type="button"
                                                            onClick={handleAddPrescripcionLine}
                                                            className="action-button action-button--primary"
                                                            style={{ padding: '8px 16px', fontSize: '12.5px', borderRadius: '8px' }}
                                                        >
                                                            <Plus size={15} style={{ marginRight: '4px' }} /> Agregar Medicamento a la Receta
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* TABLA DE MEDICAMENTOS EN LA RECETA ACTUAL */}
                                                <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                                                    <div style={{ background: '#f8fafc', padding: '10px 14px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <strong style={{ fontSize: '13px', color: '#0f172a', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                            <ClipboardList size={15} /> Medicamentos Prescritos ({prescripcionesList.length})
                                                        </strong>
                                                        <span style={{ fontSize: '11.5px', color: '#64748b' }}>Serán registrados en el Recetario Médico Ocupacional</span>
                                                    </div>

                                                    {prescripcionesList.length === 0 ? (
                                                        <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                                                            No se han agregado medicamentos a esta receta aún.
                                                        </div>
                                                    ) : (
                                                        <div className="table-responsive">
                                                            <table className="table" style={{ width: '100%', fontSize: '12px' }}>
                                                                <thead>
                                                                    <tr>
                                                                        <th>Medicamento</th>
                                                                        <th>Dosis & Vía</th>
                                                                        <th>Frecuencia / Duración</th>
                                                                        <th>Origen / Dispensación</th>
                                                                        <th style={{ textAlign: 'right' }}>Acciones</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {prescripcionesList.map((item, idx) => (
                                                                        <tr key={idx}>
                                                                            <td>
                                                                                <strong>{item.detalle_medicamento}</strong>
                                                                                {item.cantidad_cajas > 0 && <small style={{ display: 'block', color: '#64748b' }}>Cant: {item.cantidad_cajas} cj / {item.cantidad_unidades} ud</small>}
                                                                            </td>
                                                                            <td>{item.dosis} ({item.via})</td>
                                                                            <td>Cada {item.frecuencia}h por {item.duracion} días</td>
                                                                            <td>
                                                                                {item.disponible_farmacia === 'farmacia' ? (
                                                                                    <span style={{ padding: '3px 8px', borderRadius: '12px', background: '#f0fdf4', color: '#166534', fontWeight: '700', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                                                        <CheckCircle size={11} /> Farmacia Enfermería
                                                                                    </span>
                                                                                ) : (
                                                                                    <div>
                                                                                        <span style={{ padding: '3px 8px', borderRadius: '12px', background: '#fffbeb', color: '#b45309', fontWeight: '700', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                                                            <AlertTriangle size={11} /> No Disponible / Alternativo
                                                                                        </span>
                                                                                        {item.observacion_nodisponible && (
                                                                                            <small style={{ display: 'block', color: '#92400e', fontSize: '11px', marginTop: '2px' }}>
                                                                                                {item.observacion_nodisponible}
                                                                                            </small>
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                            </td>
                                                                            <td style={{ textAlign: 'right' }}>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleRemovePrescripcionLine(idx)}
                                                                                    style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                                                                >
                                                                                    <Trash2 size={12} /> Eliminar
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
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

                        <footer className="clinical-modal__actions" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)' }}>
                            <button
                                disabled={consultaActiveStep === 0}
                                onClick={() => setConsultaActiveStep(prev => prev - 1)}
                                className="action-button action-button--light"
                                style={{ opacity: consultaActiveStep === 0 ? 0.5 : 1, cursor: consultaActiveStep === 0 ? 'not-allowed' : 'pointer' }}
                            >
                                Anterior
                            </button>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="button" className="action-button action-button--light" onClick={handleCancelConsulta}>
                                    Cerrar
                                </button>
                                {consultaActiveStep < stepsList.length - 1 ? (
                                    <button
                                        onClick={() => setConsultaActiveStep(prev => prev + 1)}
                                        className="action-button action-button--primary"
                                    >
                                        Siguiente Paso
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            const newRecord = {
                                                id: Date.now(),
                                                fecha: new Date().toISOString().split('T')[0],
                                                fechaIngreso: new Date().toISOString().split('T')[0],
                                                paciente: patientSelected ? `${patientSelected.nombres || ''} ${patientSelected.apellidos || ''}`.trim() : 'Paciente Ocupacional',
                                                primerApellido: patientSelected?.apellidos ? patientSelected.apellidos.trim().split(/\s+/)[0] : '',
                                                segundoApellido: patientSelected?.apellidos ? patientSelected.apellidos.trim().split(/\s+/).slice(1).join(' ') : '',
                                                primerNombre: patientSelected?.nombres ? patientSelected.nombres.trim().split(/\s+/)[0] : '',
                                                segundoNombre: patientSelected?.nombres ? patientSelected.nombres.trim().split(/\s+/).slice(1).join(' ') : '',
                                                cedula: patientSelected?.cedula || patientSelected?.ci || '1723456789',
                                                tipo: tipoFicha,
                                                puesto: puestoTrabajo || patientSelected?.puestoTrabajo || patientSelected?.cargo || 'Servidor/Docente',
                                                cargo: puestoTrabajo || patientSelected?.puestoTrabajo || patientSelected?.cargo || 'Servidor/Docente',
                                                ciuo: patientSelected?.ciuo || 'C02',
                                                actividades: patientSelected?.actividades || 'ACTIVIDADES ADMINISTRATIVAS Y DOCENCIA',
                                                area: areaTrabajo || patientSelected?.area || 'Campus Matriz',
                                                sexo: patientSelected?.sexo || 'M',
                                                edad: patientSelected?.edad || 32,
                                                religion: patientSelected?.religion || 'Católica',
                                                grupoSanguineo: vitalSigns.tipoSangre || patientSelected?.tipo_sangre || 'ORH+',
                                                lateralidad: patientSelected?.lateralidad || 'DIESTRO',
                                                orientacionSexual: patientSelected?.orientacion_sexual || 'Heterosexual',
                                                identidadGenero: patientSelected?.identidad_genero || (patientSelected?.sexo === 'F' ? 'Femenino' : 'Masculino'),
                                                discapacidad: patientSelected?.discapacidad || { tiene: false, tipo: '', porcentaje: '' },
                                                telefono: patientSelected?.celular || patientSelected?.telefono || '0987654321',
                                                motivoConsulta: motivoConsulta || 'EVALUACIÓN MÉDICA OCUPACIONAL PARA EL PUESTO DE TRABAJO',
                                                enfermedadActual: enfermedadActual || 'PACIENTE ASINTOMÁTICO AL MOMENTO DEL EXAMEN.',
                                                antecedentesClinicos: antecedentesPersonales || 'NINGUNO RELEVANTE REFERIDO POR EL PACIENTE',
                                                antecedentesPersonales: antecedentesPersonales || 'NINGUNO RELEVANTE',
                                                antecedentesOcupacionales: antecedentesOcupacionales || 'LABORES PREVIAS EN EL ÁREA',
                                                factoresRiesgo: factoresRiesgo.length > 0 ? factoresRiesgo : ['Ergonómico', 'Físico'],
                                                examenFisico: {
                                                    normal: !examenFisico || examenFisico.toLowerCase().includes('normal'),
                                                    descripcion: examenFisico || 'NO SE EVIDENCIA SIGNOS PATOLÓGICOS'
                                                },
                                                constantes: {
                                                    pa: vitalSigns.paSystolic && vitalSigns.paDiastolic ? `${vitalSigns.paSystolic}/${vitalSigns.paDiastolic}` : '120/80',
                                                    temp: vitalSigns.temp || '36.5',
                                                    fc: vitalSigns.fc || '75',
                                                    satO2: vitalSigns.spo2 || '98',
                                                    fr: vitalSigns.fr || '18',
                                                    peso: vitalSigns.peso || '70',
                                                    talla: vitalSigns.talla ? (parseFloat(vitalSigns.talla) > 3 ? (parseFloat(vitalSigns.talla) / 100).toFixed(2) : vitalSigns.talla) : '1.70',
                                                    imc: vitalSigns.imc || '24.2',
                                                    perimetroAbd: '-'
                                                },
                                                vitalSigns: { ...vitalSigns },
                                                diagnosticoCie: diagnosticoCie || 'Z00.0 - Examen médico general',
                                                diagnosticos: diagnosticoCie ? [
                                                    {
                                                        num: 1,
                                                        desc: diagnosticoCie.includes('-') ? diagnosticoCie.split('-')[1].trim().toUpperCase() : diagnosticoCie.toUpperCase(),
                                                        cie: diagnosticoCie.includes('-') ? diagnosticoCie.split('-')[0].trim().toUpperCase() : 'Z00.0',
                                                        pre: false,
                                                        def: true
                                                    }
                                                ] : [
                                                    { num: 1, desc: 'EXAMEN MÉDICO GENERAL OCUPACIONAL', cie: 'Z00.0', pre: false, def: true }
                                                ],
                                                aptitud: aptitudLaboral === 'apto' ? 'Apto' : aptitudLaboral === 'apto_restriccion' ? 'Apto con Restricción' : 'No Apto',
                                                aptitudLaboral,
                                                restriccionesOcupacionales,
                                                aptitudDetalle: {
                                                    apto: aptitudLaboral === 'apto',
                                                    aptoObservacion: aptitudLaboral === 'apto_restriccion',
                                                    aptoLimitaciones: aptitudLaboral === 'apto_restriccion',
                                                    noApto: aptitudLaboral === 'no_apto',
                                                    observacion: restriccionesOcupacionales || 'Ninguna',
                                                    limitacion: restriccionesOcupacionales || 'Uso adecuado de los Equipos de Protección Individual (EPP)'
                                                },
                                                planTratamiento: planTratamiento || 'MEDIDAS HIGIÉNICO DIETÉTICAS Y ERGONÓMICAS',
                                                prescripcionesList: [...prescripcionesList],
                                                recomendaciones: [
                                                    planTratamiento || 'PAUSAS ACTIVAS CADA 2 HORAS EN LA JORNADA LABORAL',
                                                    'USO ADECUADO Y PERMANENTE DE EQUIPOS DE PROTECCIÓN INDIVIDUAL (EPP)',
                                                    'INGESTA ADECUADA DE LÍQUIDOS Y HÁBITOS DE VIDA SALUDABLES',
                                                    'EN CASO DE PRESENTAR SÍNTOMAS ACUDIR AL DISPENSARIO MÉDICO DE LA UEB',
                                                    ...(prescripcionesList.length > 0 ? prescripcionesList.map(p => `TRATAMIENTO: ${p.detalle_medicamento} (${p.dosis}, cada ${p.frecuencia}h x ${p.duracion} días)`) : [])
                                                ],
                                                profesional: {
                                                    fecha: new Date().toISOString().split('T')[0],
                                                    hora: new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }),
                                                    nombre: user?.nombre || 'DR. JORGE MORALES',
                                                    codigo: user?.cedula || '1804486288'
                                                },
                                                fechaRetiro: new Date().toISOString().split('T')[0],
                                                fechaReintegro: new Date().toISOString().split('T')[0],
                                                fechaUltimoDia: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                                                dias: 30,
                                                causaSalida: motivoConsulta || 'REPOSO MÉDICO AUTORIZADO',
                                                causaRetiro: motivoConsulta || 'CULMINACIÓN DE RELACIÓN LABORAL',
                                                tiempoServicio: 'SEGÚN EXPEDIENTE INSTITUCIONAL',
                                                condSalida: {
                                                    satisfactorio: aptitudLaboral === 'apto',
                                                    conPatologiaComun: aptitudLaboral === 'apto_restriccion',
                                                    conSecuelaLaboral: aptitudLaboral === 'no_apto',
                                                    observacion: restriccionesOcupacionales || 'El trabajador no presenta enfermedades profesionales ni secuelas originadas por el trabajo en la institución.',
                                                    recomendacionLegal: 'El trabajador finaliza sus labores en la institución en condiciones físicas y de salud adecuadas para su reinserción o cese.'
                                                },
                                                patientSelected: patientSelected ? { ...patientSelected } : null,
                                                estado: 'Completado'
                                            };
                                            setFichasData(prev => [newRecord, ...prev]);
                                            if (tipoFicha === 'Reintegro') {
                                                setReintegrosData(prev => [newRecord, ...prev]);
                                            }

                                            // Persistencia al backend si el paciente está registrado
                                            if (patientSelected?.id) {
                                                api.post('/medicina-general/signos-vitales', {
                                                    id_usuario_paciente: patientSelected.id,
                                                    presion_arterial_sistolica: parseFloat(vitalSigns.paSystolic) || 120,
                                                    presion_arterial_diastolica: parseFloat(vitalSigns.paDiastolic) || 80,
                                                    frecuencia_cardiaca: parseInt(vitalSigns.fc) || 75,
                                                    frecuencia_respiratoria: parseInt(vitalSigns.fr) || 18,
                                                    temperatura: parseFloat(vitalSigns.temp) || 36.5,
                                                    peso: parseFloat(vitalSigns.peso) || 70,
                                                    talla: parseFloat(vitalSigns.talla) || 1.70,
                                                    fecha: new Date().toISOString().split('T')[0]
                                                }).catch(() => {});

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
                                                        fecha_ingreso: new Date().toISOString().split('T')[0]
                                                    }).catch(() => {});
                                                } else if (tipoFicha === 'Retiro' || tipoFicha === 'Cese') {
                                                    api.post('/medicina-ocupacional/cese-funciones', {
                                                        id_usuario_paciente: patientSelected.id,
                                                        fecha_salida: new Date().toISOString().split('T')[0],
                                                        detalle_motivo_salida: motivoConsulta || 'Cese laboral institucional'
                                                    }).catch(() => {});
                                                } else if (tipoFicha === 'Reintegro') {
                                                    api.post('/medicina-ocupacional/reintegro-ueb', {
                                                        id_usuario_paciente: patientSelected.id,
                                                        fecha_salida: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
                                                        fecha_reintegro: new Date().toISOString().split('T')[0],
                                                        detalle_motivo_salida: motivoConsulta || 'Reintegro a funciones laborales'
                                                    }).catch(() => {});
                                                }

                                                api.post('/medicina-general/parte-diario', {
                                                    id_usuario_paciente: patientSelected.id,
                                                    fecha: new Date().toISOString().split('T')[0],
                                                    tipo_atencion: 'primaria',
                                                    condicion: 'evaluacion_ocupacional'
                                                }).catch(() => {});

                                                if (vitalSigns.tipoSangre) {
                                                    api.post(`/medicina-ocupacional/patient/${patientSelected.id}/blood-type`, {
                                                        blood_type: vitalSigns.tipoSangre
                                                    }).catch(() => {});
                                                }
                                            }

                                            // Guardar también en el Recetario si existen medicamentos prescritos
                                            if (prescripcionesList.length > 0) {
                                                const todosEnFarmacia = prescripcionesList.every(i => i.disponible_farmacia === 'farmacia');
                                                const todosExternos = prescripcionesList.every(i => i.disponible_farmacia === 'no_disponible');

                                                let estadoReceta = 'Dispensación Parcial';
                                                if (todosEnFarmacia) estadoReceta = 'Dispensado en Farmacia';
                                                if (todosExternos) estadoReceta = 'Recetado Externamente';

                                                const medicamentosTexto = prescripcionesList.map(i => {
                                                    let txt = `${i.detalle_medicamento} (${i.dosis}, c/${i.frecuencia}h x ${i.duracion}d)`;
                                                    if (i.disponible_farmacia === 'no_disponible') {
                                                        txt += ` [NO DISPONIBLE: ${i.observacion_nodisponible || 'Compra externa / Alternativa enviada'}]`;
                                                    } else {
                                                        txt += ` [Dispensar en Farmacia Enfermería]`;
                                                    }
                                                    return txt;
                                                }).join(' | ');

                                                const newRecetaRecord = {
                                                    id: Date.now() + 1,
                                                    fecha: new Date().toISOString().split('T')[0],
                                                    paciente: patientSelected ? `${patientSelected.nombres} ${patientSelected.apellidos}` : 'Paciente Trabajo',
                                                    cedula: patientSelected?.cedula || '1723456789',
                                                    puesto: patientSelected?.puestoTrabajo || 'Servidor/Docente',
                                                    medicamentos: medicamentosTexto,
                                                    lineas: [...prescripcionesList],
                                                    estado: estadoReceta
                                                };
                                                setRecetasData(prev => [newRecetaRecord, ...prev]);
                                            }

                                            alert(`¡Atención Médica Ocupacional registrada exitosamente! Ficha (${tipoFicha}) emitida${prescripcionesList.length > 0 ? ' y receta enviada al Recetario' : ''}.`);
                                            setIsConsultaModalOpen(false);
                                        }}
                                        className="action-button action-button--accent"
                                    >
                                        <Save size={16} style={{ marginRight: '6px' }} /> Finalizar & Emitir Ficha
                                    </button>
                                )}
                            </div>
                        </footer>
                    </section>
                </div>
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
                                    <span style={{ textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.5px' }}>BUSCADOR CLÍNICO</span>
                                    <h2>Buscar Paciente por Cédula</h2>
                                </div>
                            </div>
                            <button className="clinical-modal__close" onClick={() => setIsPatientSearchOpen(false)}><X size={16} /></button>
                        </header>

                        <div className="clinical-modal__body">
                            <form onSubmit={(e) => { e.preventDefault(); handleSearchPatient(searchTerm); }} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
                                <div className="patient-search-input" style={{ flex: 1, margin: 0 }}>
                                    <Search size={16} />
                                    <input
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
                                    <span style={{ textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.5px' }}>REGISTRO DE USUARIO</span>
                                    <h2>Nuevo Paciente</h2>
                                </div>
                            </div>
                            <button className="clinical-modal__close" type="button" onClick={handleCancelPatientRegisterModal}><X size={15} /></button>
                        </header>
                        <form onSubmit={handleSavePatientRegister} className="clinical-modal__body">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {/* Nombres y Apellidos Completos */}
                                <div className="premium-field-card">
                                    <div className="field-header">
                                        <div className="field-header__left">
                                            <span className="field-header__icon"><User size={15} /></span>
                                            <h4 className="field-header__title">Nombres y Apellidos Completos</h4>
                                        </div>
                                        <span className="field-badge-req">Requerido</span>
                                    </div>
                                    <input
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
                                                <h4 className="field-header__title">Tipo de Documento</h4>
                                            </div>
                                            <span className="field-badge-req">Requerido</span>
                                        </div>
                                        <select
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
                                    <div className="premium-field-card" style={{ gridColumn: newPatientForm.tipo_documento === 'pasaporte' ? 'span 1' : 'span 2' }}>
                                        <div className="field-header">
                                            <div className="field-header__left">
                                                <span className="field-header__icon"><UserCheck size={15} /></span>
                                                <h4 className="field-header__title">Tipo de Paciente</h4>
                                            </div>
                                            <span className="field-badge-req">Requerido</span>
                                        </div>
                                        <select
                                            value={newPatientForm.id_tipo_usuario || 4}
                                            onChange={(e) => setNewPatientForm({ ...newPatientForm, id_tipo_usuario: parseInt(e.target.value) })}
                                            required
                                        >
                                            <option value={4}>Personal Administrativo</option>
                                            <option value={3}>Docente / Profesor</option>
                                            <option value={5}>Servidor Público / Código de Trabajo</option>
                                            <option value={2}>Estudiante Universitario</option>
                                        </select>
                                    </div>

                                    {newPatientForm.tipo_documento === 'pasaporte' && (
                                        <div className="premium-field-card">
                                            <div className="field-header">
                                                <div className="field-header__left">
                                                    <span className="field-header__icon"><MapPin size={15} /></span>
                                                    <h4 className="field-header__title">País de Origen</h4>
                                                </div>
                                                <span className="field-badge-req">Requerido</span>
                                            </div>
                                            <select
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
                                <div style={{ marginTop: '15px', color: '#b71a34', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                            <button className="clinical-modal__close" onClick={() => setIsReintegroModalOpen(false)}><X size={16} /></button>
                        </header>

                        <form onSubmit={handleSaveReintegro} className="clinical-modal__body">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div className="clinical-fields-grid">
                                    <div className="premium-field-card">
                                        <div className="field-header">
                                            <div className="field-header__left">
                                                <span className="field-header__icon"><FileText size={15} /></span>
                                                <h4 className="field-header__title">Cédula Trabajador</h4>
                                            </div>
                                            <span className="field-badge-req">Requerido</span>
                                        </div>
                                        <input type="text" required value={reintegroForm.pacienteCedula} onChange={e => setReintegroForm({ ...reintegroForm, pacienteCedula: e.target.value })} placeholder="1723456789" />
                                    </div>

                                    <div className="premium-field-card">
                                        <div className="field-header">
                                            <div className="field-header__left">
                                                <span className="field-header__icon"><User size={15} /></span>
                                                <h4 className="field-header__title">Nombre Trabajador</h4>
                                            </div>
                                            <span className="field-badge-req">Requerido</span>
                                        </div>
                                        <input type="text" required value={reintegroForm.pacienteNombre} onChange={e => setReintegroForm({ ...reintegroForm, pacienteNombre: e.target.value })} placeholder="Nombre completo" />
                                    </div>
                                </div>

                                <div className="clinical-fields-grid">
                                    <div className="premium-field-card">
                                        <div className="field-header">
                                            <div className="field-header__left">
                                                <span className="field-header__icon"><Briefcase size={15} /></span>
                                                <h4 className="field-header__title">Puesto de Trabajo</h4>
                                            </div>
                                            <span className="field-badge-req">Requerido</span>
                                        </div>
                                        <input type="text" required value={reintegroForm.puesto} onChange={e => setReintegroForm({ ...reintegroForm, puesto: e.target.value })} placeholder="Ej: Operario de Bodega" />
                                    </div>

                                    <div className="premium-field-card">
                                        <div className="field-header">
                                            <div className="field-header__left">
                                                <span className="field-header__icon"><Clock size={15} /></span>
                                                <h4 className="field-header__title">Días de Incapacidad</h4>
                                            </div>
                                            <span className="field-badge-req">Requerido</span>
                                        </div>
                                        <input type="number" required value={reintegroForm.diasIncapacidad} onChange={e => setReintegroForm({ ...reintegroForm, diasIncapacidad: e.target.value })} placeholder="15" />
                                    </div>
                                </div>

                                <div className="premium-field-card">
                                    <div className="field-header">
                                        <div className="field-header__left">
                                            <span className="field-header__icon"><Stethoscope size={15} /></span>
                                            <h4 className="field-header__title">Diagnóstico Origen (IESS / Certificado Médico)</h4>
                                        </div>
                                        <span className="field-badge-req">Requerido</span>
                                    </div>
                                    <input type="text" required value={reintegroForm.diagnosticoOrigen} onChange={e => setReintegroForm({ ...reintegroForm, diagnosticoOrigen: e.target.value })} placeholder="Ej: Hernia Discal L4-L5" />
                                </div>

                                <div className="premium-field-card">
                                    <div className="field-header">
                                        <div className="field-header__left">
                                            <span className="field-header__icon"><ClipboardList size={15} /></span>
                                            <h4 className="field-header__title">Recomendaciones & Adaptaciones del Puesto</h4>
                                        </div>
                                    </div>
                                    <textarea rows={3} value={reintegroForm.recomendaciones} onChange={e => setReintegroForm({ ...reintegroForm, recomendaciones: e.target.value })} placeholder="Ej: Reducción de jornada laboral a 6 horas por 15 días, silla ergonómica..." style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: '13px' }} />
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
                            <button type="button" className="clinical-modal__close" onClick={handleCancelExamModal}><X size={15} /></button>
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
                                                <h4 className="field-header__title">Tipo de Examen Requerido</h4>
                                            </div>
                                            <span className="field-badge-req">Requerido</span>
                                        </div>
                                        <select
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
                                                <h4 className="field-header__title">Laboratorio / Proveedor Destino</h4>
                                            </div>
                                            <span className="field-badge-req">Requerido</span>
                                        </div>
                                        <select
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
                                            <h4 className="field-header__title">Motivo / Indicación Clínica Ocupacional</h4>
                                        </div>
                                        <span className="field-badge-req">Requerido</span>
                                    </div>
                                    <input
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
                                            <h4 className="field-header__title">Observaciones e Indicaciones para el Trabajador</h4>
                                        </div>
                                    </div>
                                    <textarea
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
                                <button type="submit" className="action-button action-button--primary">Emitir Orden de Examen</button>
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
                            <button className="clinical-modal__close" onClick={() => setExamResultModal({ show: false, item: null, resultadoText: '', estado: 'Realizado' })}><X size={16} /></button>
                        </header>

                        <div className="clinical-modal__body">
                            <form onSubmit={handleSaveExamResult}>
                                <div className="form-group" style={{ marginBottom: '14px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Estado del Examen *</label>
                                    <select
                                        className="form-control"
                                        value={examResultModal.estado}
                                        onChange={e => setExamResultModal({ ...examResultModal, estado: e.target.value })}
                                        style={{ fontWeight: '600' }}
                                    >
                                        <option value="Realizado">Realizado / Completado</option>
                                        <option value="Pendiente">Pendiente de Procesamiento</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Resultado / Dictamen Clínico *</label>
                                    <textarea
                                        rows={4}
                                        required
                                        className="form-control"
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
                            <button className="clinical-modal__close" onClick={() => setIsAgendarCitaModalOpen(false)} style={{ color: 'white' }}><X size={15} /></button>
                        </header>
                        <div className="clinical-modal__body" style={{ padding: '20px' }}>
                            <form onSubmit={handleSaveNewCita}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px', marginBottom: '14px' }}>
                                    <div>
                                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Nombre del Paciente *</label>
                                        <input type="text" required className="form-control" value={newCitaForm.pacienteNombre} onChange={e => setNewCitaForm({ ...newCitaForm, pacienteNombre: e.target.value })} placeholder="Ej: Juan Carlos Pérez" />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Cédula *</label>
                                        <input type="text" required className="form-control" value={newCitaForm.cedula} onChange={e => setNewCitaForm({ ...newCitaForm, cedula: e.target.value })} placeholder="Ej: 1723456789" />
                                    </div>
                                </div>
                                <div style={{ marginBottom: '14px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Puesto / Área Trabajos</label>
                                    <input type="text" className="form-control" value={newCitaForm.puesto} onChange={e => setNewCitaForm({ ...newCitaForm, puesto: e.target.value })} placeholder="Ej: Docente Auxiliar - Dirección de Ciencias" />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                                    <div>
                                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Fecha *</label>
                                        <input type="date" required className="form-control" value={newCitaForm.fecha} onChange={e => setNewCitaForm({ ...newCitaForm, fecha: e.target.value })} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Hora Inicio *</label>
                                        <input type="time" required className="form-control" value={newCitaForm.horaInicio} onChange={e => setNewCitaForm({ ...newCitaForm, horaInicio: e.target.value })} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Hora Fin *</label>
                                        <input type="time" required className="form-control" value={newCitaForm.horaFin} onChange={e => setNewCitaForm({ ...newCitaForm, horaFin: e.target.value })} />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px', marginBottom: '14px' }}>
                                    <div>
                                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Tipo de Evaluación Ocupacional *</label>
                                        <select className="form-control" value={newCitaForm.tipoEvaluacion} onChange={e => setNewCitaForm({ ...newCitaForm, tipoEvaluacion: e.target.value })}>
                                            <option value="Evaluación Periódica">Evaluación Periódica</option>
                                            <option value="Evaluación Preocupacional">Evaluación Preocupacional / Ingreso</option>
                                            <option value="Reintegro Laboral">Reintegro Laboral</option>
                                            <option value="Evaluación de Salida / Retiro">Evaluación de Salida / Retiro</option>
                                            <option value="Evaluación Especial Ocupacional">Evaluación Especial Ocupacional</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Prioridad</label>
                                        <select className="form-control" value={newCitaForm.prioridad} onChange={e => setNewCitaForm({ ...newCitaForm, prioridad: e.target.value })}>
                                            <option value="Normal">Normal</option>
                                            <option value="Alta">Alta / Urgente</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Motivo / Observaciones</label>
                                    <textarea rows={2} className="form-control" value={newCitaForm.motivo} onChange={e => setNewCitaForm({ ...newCitaForm, motivo: e.target.value })} placeholder="Detalle el motivo o requerimiento de la cita médica..." />
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
                                    <span style={{ color: 'rgba(255, 255, 255, 0.75)', textTransform: 'uppercase', fontSize: '9px', letterSpacing: '0.8px', display: 'block' }}>
                                        PUESTO DE SALUD · BIENESTAR UNIVERSITARIO
                                    </span>
                                    <h2 style={{ margin: '2px 0 0', fontSize: '16px', color: '#ffffff', fontWeight: '800' }}>
                                        Formato Oficial de Recetario Médico ({selectedRecetaPreview.numero_receta || `REC-${selectedRecetaPreview.id}`})
                                    </h2>
                                </div>
                            </div>
                            <button className="clinical-modal__close" type="button" onClick={() => setSelectedRecetaPreview(null)}>
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
                                        <span style={{ fontSize: '9px', color: '#475569' }}>UNIVERSIDAD ESTATAL DE BOLÍVAR</span>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <h2 style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>BIENESTAR UNIVERSITARIO</h2>
                                        <h3 style={{ margin: '2px 0 0', fontSize: '12px', color: '#0284c7' }}>Puesto de Salud</h3>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <strong>RECETA N°:</strong> <span style={{ color: '#dc2626', fontWeight: 'bold' }}>{selectedRecetaPreview.numero_receta || `REC-${selectedRecetaPreview.id}`}</span><br />
                                        <span style={{ fontSize: '10px' }}>FECHA: {selectedRecetaPreview.fecha}</span>
                                    </div>
                                </div>

                                {/* DATOS GENERALES PACIENTE */}
                                <div style={{ background: '#f8fafc', padding: '6px 10px', fontWeight: 'bold', fontSize: '10.5px', border: '1px solid #94a3b8', marginBottom: '6px' }}>
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
                                <div style={{ background: '#f8fafc', padding: '6px 10px', fontWeight: 'bold', fontSize: '10.5px', border: '1px solid #94a3b8', marginBottom: '6px' }}>
                                    DATOS DEL MEDICAMENTO
                                </div>
                                <div style={{ overflowX: 'auto', width: '100%', marginBottom: '12px' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
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
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', border: '1px solid #cbd5e1', padding: '10px', borderRadius: '6px', marginBottom: '8px' }}>
                                    <div>
                                        <strong>DATOS DEL PRESCRIPTOR:</strong><br />
                                        <span>Dr(a). {selectedRecetaPreview.prescriptor_nombre || 'Médico Ocupacional'}</span><br />
                                        <span style={{ fontSize: '9.5px', color: '#64748b' }}>ACESS: {selectedRecetaPreview.prescriptor_acess || 'ACESS-MED-84920'}</span>
                                    </div>
                                    <div>
                                        <strong>VÁLIDO / VERIFICADO:</strong><br />
                                        <span>{selectedRecetaPreview.valido_verificado || 'Farmacia Institucional'}</span>
                                    </div>
                                </div>
                                <div style={{ textTransform: 'uppercase', fontWeight: 'bold', textAlign: 'center', background: '#f1f5f9', padding: '4px', border: '1px solid #94a3b8', fontSize: '10px', marginBottom: '16px' }}>
                                    VIGENCIA MÁXIMA : (03) DÍAS
                                </div>

                                {/* PARTE 2: INDICACIONES Y HORARIOS */}
                                <div style={{ borderTop: '2px dashed #94a3b8', paddingTop: '12px', marginTop: '12px' }}>
                                    <div style={{ background: '#e0f2fe', color: '#0369a1', padding: '6px 10px', fontWeight: 'bold', fontSize: '10.5px', borderRadius: '4px', marginBottom: '10px' }}>
                                        INDICACIONES PARA EL PACIENTE Y HORARIOS DE TOMA
                                    </div>

                                    <div style={{ overflowX: 'auto', width: '100%', marginBottom: '12px' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
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

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px', border: '1px solid #cbd5e1', padding: '10px', borderRadius: '6px' }}>
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

            {/* MODAL VISOR EN PANTALLA: REPORTE GENERAL DE MATRICES / FICHAS */}
            {isReportMatrixModalOpen && (
                <div className="clinical-modal-backdrop" onClick={() => setIsReportMatrixModalOpen(false)}>
                    <div
                        className="clinical-modal"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            maxWidth: '1200px',
                            width: '95vw',
                            maxHeight: '92vh',
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            boxShadow: '0 25px 60px rgba(0, 32, 96, 0.35)',
                            border: '1px solid #cbd5e1'
                        }}
                    >
                        {/* HEADER DEL MODAL */}
                        <header className="clinical-modal__header" style={{ background: '#002060', color: '#ffffff', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ background: '#ffffff', padding: '4px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}>
                                    <img src={uebBannerLogo} alt="UEB" style={{ height: '32px', objectFit: 'contain' }} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', letterSpacing: '0.3px', color: '#ffffff' }}>
                                        UNIVERSIDAD ESTATAL DE BOLÍVAR · INFORME OFICIAL
                                    </h3>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#93c5fd' }}>
                                        {fichaSubTab === 'reintegro' ? 'Registro de Reintegro Laboral y Adaptación Ocupacional' :
                                         fichaSubTab === 'ingreso' ? 'Fichas Médicas Ocupacionales de Ingreso / Periódicas' :
                                         fichaSubTab === 'cese' ? 'Fichas Médicas de Retiro / Cese Laboral' :
                                         fichaSubTab === 'embarazadas' ? 'Vigilancia Médica de Gestantes y Lactantes' :
                                         fichaSubTab === 'discapacidad' ? 'Fichas Ocupacionales de Funcionarios con Discapacidad' :
                                         fichaSubTab === 'vulnerables_patologias' ? 'Fichas de Grupos Vulnerables (Patologías)' :
                                         'Fichas de Personal Nuevo que Ingresó'}
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <button
                                    type="button"
                                    onClick={handlePrintFichasMatrix}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        background: '#0284c7',
                                        color: '#ffffff',
                                        border: 'none',
                                        padding: '7px 14px',
                                        borderRadius: '8px',
                                        fontWeight: '700',
                                        fontSize: '12px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Printer size={15} /> Imprimir / PDF
                                </button>
                                <button
                                    type="button"
                                    onClick={handleExportFichasCSV}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        background: '#334155',
                                        color: '#ffffff',
                                        border: 'none',
                                        padding: '7px 14px',
                                        borderRadius: '8px',
                                        fontWeight: '700',
                                        fontSize: '12px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Download size={15} /> Exportar CSV
                                </button>
                                <button
                                    type="button"
                                    className="close-button"
                                    onClick={() => setIsReportMatrixModalOpen(false)}
                                    style={{ color: '#ffffff', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </header>

                        {/* CUERPO DEL INFORME */}
                        <div className="clinical-modal__body" style={{ padding: '24px', overflowY: 'auto', background: '#f8fafc' }}>
                            <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
                                {/* ENCABEZADO INSTITUCIONAL */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #002060', paddingBottom: '12px', marginBottom: '16px' }}>
                                    <img src={uebBannerLogo} alt="Logo UEB" style={{ height: '52px', objectFit: 'contain' }} />
                                    <div style={{ textAlign: 'right', fontSize: '11px', color: '#475569' }}>
                                        <div style={{ fontWeight: '800', color: '#002060', fontSize: '12px' }}>UNIVERSIDAD ESTATAL DE BOLÍVAR</div>
                                        <div>DIRECCIÓN DE BIENESTAR UNIVERSITARIO · SALUD OCUPACIONAL</div>
                                        <div>Fecha de Generación: {new Date().toLocaleDateString('es-EC')}</div>
                                    </div>
                                </div>

                                {/* BANNER DEL REPORTE */}
                                <div style={{ background: '#002060', color: '#ffffff', padding: '12px 16px', borderRadius: '8px', textAlign: 'center', fontWeight: '800', fontSize: '15px', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '16px' }}>
                                    {fichaSubTab === 'reintegro' ? 'REGISTRO DE REINTEGRO LABORAL Y ADAPTACIÓN OCUPACIONAL' :
                                     fichaSubTab === 'ingreso' ? 'FICHAS MÉDICAS OCUPACIONALES DE INGRESO / PERIÓDICAS' :
                                     fichaSubTab === 'cese' ? 'FICHAS MÉDICAS DE RETIRO / CESE LABORAL' :
                                     fichaSubTab === 'embarazadas' ? 'VIGILANCIA MÉDICA DE GESTANTES Y LACTANTES' :
                                     fichaSubTab === 'discapacidad' ? 'FICHAS OCUPACIONALES DE FUNCIONARIOS CON DISCAPACIDAD' :
                                     fichaSubTab === 'vulnerables_patologias' ? 'FICHAS DE GRUPOS VULNERABLES (PATOLOGÍAS)' :
                                     'FICHAS DE PERSONAL NUEVO QUE INGRESÓ'}
                                </div>

                                {/* TABLA DE DATOS */}
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                                        <thead>
                                            {fichaSubTab === 'reintegro' ? (
                                                <tr style={{ background: '#0284c7', color: '#ffffff', textTransform: 'uppercase', textAlign: 'center' }}>
                                                    <th style={{ padding: '8px 6px', border: '1px solid #0369a1', width: '35px' }}>N°</th>
                                                    <th style={{ padding: '8px 6px', border: '1px solid #0369a1' }}>Fecha Reintegro</th>
                                                    <th style={{ padding: '8px 6px', border: '1px solid #0369a1' }}>Trabajador</th>
                                                    <th style={{ padding: '8px 6px', border: '1px solid #0369a1' }}>Cédula</th>
                                                    <th style={{ padding: '8px 6px', border: '1px solid #0369a1' }}>Puesto</th>
                                                    <th style={{ padding: '8px 6px', border: '1px solid #0369a1' }}>Días Incapacidad</th>
                                                    <th style={{ padding: '8px 6px', border: '1px solid #0369a1' }}>Diagnóstico Origen</th>
                                                    <th style={{ padding: '8px 6px', border: '1px solid #0369a1' }}>Modalidad</th>
                                                    <th style={{ padding: '8px 6px', border: '1px solid #0369a1' }}>Estado</th>
                                                </tr>
                                            ) : (
                                                <tr style={{ background: '#0284c7', color: '#ffffff', textTransform: 'uppercase', textAlign: 'center' }}>
                                                    <th style={{ padding: '8px 6px', border: '1px solid #0369a1', width: '35px' }}>N°</th>
                                                    <th style={{ padding: '8px 6px', border: '1px solid #0369a1' }}>Fecha Evaluación</th>
                                                    <th style={{ padding: '8px 6px', border: '1px solid #0369a1' }}>Trabajador / Paciente</th>
                                                    <th style={{ padding: '8px 6px', border: '1px solid #0369a1' }}>Cédula</th>
                                                    <th style={{ padding: '8px 6px', border: '1px solid #0369a1' }}>Tipo de Evaluación</th>
                                                    <th style={{ padding: '8px 6px', border: '1px solid #0369a1' }}>Puesto de Trabajo</th>
                                                    <th style={{ padding: '8px 6px', border: '1px solid #0369a1' }}>Dictamen de Aptitud</th>
                                                    <th style={{ padding: '8px 6px', border: '1px solid #0369a1' }}>Estado</th>
                                                </tr>
                                            )}
                                        </thead>
                                        <tbody>
                                            {fichaSubTab === 'reintegro' ? (
                                                filteredReintegros.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={9} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                                                            No se encontraron registros de reintegro laboral.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredReintegros.map((item, idx) => (
                                                        <tr key={item.id || idx} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                                            <td style={{ border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold', padding: '7px 6px' }}>{idx + 1}</td>
                                                            <td style={{ border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold', color: '#0284c7', padding: '7px 6px' }}>{item.fecha}</td>
                                                            <td style={{ border: '1px solid #cbd5e1', fontWeight: 'bold', textTransform: 'uppercase', padding: '7px 8px' }}>{item.paciente}</td>
                                                            <td style={{ border: '1px solid #cbd5e1', textAlign: 'center', fontFamily: 'monospace', padding: '7px 6px' }}>{item.cedula}</td>
                                                            <td style={{ border: '1px solid #cbd5e1', textTransform: 'uppercase', padding: '7px 8px' }}>{item.puesto}</td>
                                                            <td style={{ border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold', color: '#0369a1', padding: '7px 6px' }}>{item.dias} días</td>
                                                            <td style={{ border: '1px solid #cbd5e1', padding: '7px 8px' }}>{item.diagnostico}</td>
                                                            <td style={{ border: '1px solid #cbd5e1', textAlign: 'center', padding: '7px 6px' }}>{item.tipo}</td>
                                                            <td style={{ border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold', color: item.estado === 'Aprobado' ? '#166534' : '#b45309', padding: '7px 6px' }}>
                                                                {item.estado}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )
                                            ) : (
                                                filteredFichas.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                                                            No se encontraron fichas médicas registradas en esta categoría.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredFichas.map((item, idx) => (
                                                        <tr key={item.id || idx} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                                            <td style={{ border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold', padding: '7px 6px' }}>{idx + 1}</td>
                                                            <td style={{ border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold', color: '#0284c7', padding: '7px 6px' }}>{item.fecha}</td>
                                                            <td style={{ border: '1px solid #cbd5e1', fontWeight: 'bold', textTransform: 'uppercase', padding: '7px 8px' }}>{item.paciente}</td>
                                                            <td style={{ border: '1px solid #cbd5e1', textAlign: 'center', fontFamily: 'monospace', padding: '7px 6px' }}>{item.cedula}</td>
                                                            <td style={{ border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold', color: '#334155', padding: '7px 6px' }}>{item.tipo}</td>
                                                            <td style={{ border: '1px solid #cbd5e1', textTransform: 'uppercase', padding: '7px 8px' }}>{item.puesto}</td>
                                                            <td style={{ border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold', color: (item.aptitud || '').includes('Restricción') ? '#b45309' : (item.aptitud || '').includes('No') ? '#dc2626' : '#15803d', padding: '7px 6px' }}>
                                                                {item.aptitud}
                                                            </td>
                                                            <td style={{ border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold', color: '#166534', padding: '7px 6px' }}>
                                                                {item.estado || 'Completado'}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* FIRMAS DE RESPONSABILIDAD */}
                                <div style={{ marginTop: '36px', display: 'flex', justifyContent: 'space-around', textAlign: 'center', fontSize: '11px', paddingTop: '20px', borderTop: '1px dashed #cbd5e1' }}>
                                    <div>
                                        <div style={{ borderTop: '1px solid #000', width: '240px', margin: '0 auto 4px auto', paddingTop: '4px', fontWeight: 'bold' }}>
                                            MÉDICO OCUPACIONAL
                                        </div>
                                        <div style={{ color: '#64748b' }}>Unidad de Salud Ocupacional - UEB</div>
                                    </div>
                                    <div>
                                        <div style={{ borderTop: '1px solid #000', width: '240px', margin: '0 auto 4px auto', paddingTop: '4px', fontWeight: 'bold' }}>
                                            RESPONSABLE SEGURIDAD Y SALUD
                                        </div>
                                        <div style={{ color: '#64748b' }}>Dirección de Talento Humano - UEB</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FOOTER DEL MODAL */}
                        <footer className="clinical-modal__actions" style={{ padding: '14px 24px', display: 'flex', justifyContent: 'flex-end', gap: '10px', background: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
                            <button
                                type="button"
                                className="action-button action-button--light"
                                onClick={() => setIsReportMatrixModalOpen(false)}
                            >
                                Cerrar
                            </button>
                            <button
                                type="button"
                                className="action-button action-button--accent"
                                onClick={handlePrintFichasMatrix}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            >
                                <Printer size={15} /> Imprimir / Guardar en PDF
                            </button>
                        </footer>
                    </div>
                </div>
            )}

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
                <div style={{
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
    );
}