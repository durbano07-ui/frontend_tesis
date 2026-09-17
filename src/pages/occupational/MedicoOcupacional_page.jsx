import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import api from '../../api/axios';
import '../../medical.css';
import HelpPanel from '../../components/HelpPanel';
import UserProfileMenu from '../../components/UserProfileMenu';
import { useClinicalDraft } from '../../hooks/useClinicalDraft';

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
    BookOpen,
    Printer,
    FileCheck,
    FileSpreadsheet,
    MapPin,
    Clock,
    UserCheck,
    UserX,
    Mail,
    Eye,
    EyeOff,
    BarChart3,
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
    Building2
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
    const [fichaSubTab, setFichaSubTab] = useState('ingreso'); // 'ingreso' | 'cese' | 'embarazadas' | 'discapacidad'
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
    const [isExamModalOpen, setIsExamModalOpen] = useState(false);
    const [isFichaModalOpen, setIsFichaModalOpen] = useState(false);
    const [activeActionModal, setActiveActionModal] = useState(null);
    const [viewingRecord, setViewingRecord] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null });
    const [patientSearchTarget, setPatientSearchTarget] = useState('consulta'); // 'consulta' | 'exam'

    // Patient & Search State
    const [searchTerm, setSearchTerm] = useState('');
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
        { id: 1, fecha: '2026-09-10', paciente: 'Juan Pérez', cedula: '1723456789', tipo: 'Ingreso', puesto: 'Analista de Sistemas', aptitud: 'Apto', estado: 'Completado' },
        { id: 2, fecha: '2026-09-12', paciente: 'Maria Rodriguez', cedula: '1712345678', tipo: 'Periódico', puesto: 'Técnico de Laboratorio', aptitud: 'Apto con Restricción', estado: 'Completado' },
        { id: 3, fecha: '2026-09-14', paciente: 'Carlos López', cedula: '1798765432', tipo: 'Retiro', puesto: 'Mantenimiento General', aptitud: 'Apto', estado: 'Completado' }
    ]);

    const [reintegrosData, setReintegrosData] = useState([
        { id: 1, fecha: '2026-09-08', paciente: 'Ana Gómez', cedula: '1755443322', tipo: 'Total', dias: 15, diagnostico: 'SDR de Túnel Carpiano', puesto: 'Secretaria General', aptitud: 'Apto con Adaptación', estado: 'Aprobado' },
        { id: 2, fecha: '2026-09-11', paciente: 'Luis Torres', cedula: '1744332211', tipo: 'Progresivo', dias: 30, diagnostico: 'Hernia Discal L4-L5', puesto: 'Operario de Bodega', aptitud: 'En Evaluación', estado: 'Pendiente' }
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
    const [parteDiarioDate, setParteDiarioDate] = useState(todayStr);
    const [parteDiarioList, setParteDiarioList] = useState([]);
    const [parteDiarioLoading, setParteDiarioLoading] = useState(false);
    const [reportCitasFecha, setReportCitasFecha] = useState(todayStr);
    const [reportCitasEstado, setReportCitasEstado] = useState('all');
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

    const handleUpdateCitaStatus = (id, newStatus) => {
        setCitasList(prev => prev.map(c => c.id === id ? { ...c, estado: newStatus } : c));
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
    }, [activeTab, activeReportSubTab, parteDiarioDate]);

    const getParteKPIs = () => {
        const total = parteDiarioList.length;
        const primarias = parteDiarioList.filter(item => item.tipo_atencion === 'primaria').length;
        const secundarias = parteDiarioList.filter(item => item.tipo_atencion === 'secundaria').length;
        const certificados = parteDiarioList.filter(item => item.tipo_atencion === 'certificadomedico').length;
        return { total, primarias, secundarias, certificados };
    };

    const handlePrintParteDiario = () => {
        try {
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                showSystemToast("El bloqueador de popups impidió abrir el reporte. Permita los popups.");
                return;
            }

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

            printWindow.document.write(`
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
                    <div class="header-container">
                        <div class="header-logo-left">
                            UEB <span>Universidad Estatal de Bolívar</span>
                        </div>
                        <div class="header-center">
                            <h1>UNIVERSIDAD ESTATAL DE BOLÍVAR</h1>
                            <h2>DEPARTAMENTO DE BIENESTAR UNIVERSITARIO</h2>
                            <h3>PARTE DIARIO - MEDICINA OCUPACIONAL</h3>
                        </div>
                        <div class="header-logo-right">
                            BIENESTAR UNIVERSITARIO<br/>
                            <span style="font-size: 8px; font-weight: normal; color: #555;">SALUD OCUPACIONAL</span>
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

                    <script>
                        window.onload = function() { window.print(); };
                    </script>
                    </div>
                </body>
                </html>
            `);
            printWindow.document.close();
        } catch (error) {
            console.error('Error al generar reporte:', error);
            showSystemToast("Error al generar el reporte del parte diario.");
        }
    };

    const handlePrintRecetaForm = (receta) => {
        try {
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                showSystemToast("El bloqueador de popups impidió abrir la receta. Permita los popups.");
                return;
            }

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

            printWindow.document.write(`
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
                            <div class="header-top">
                                <div>
                                    <strong style="font-size:14px; color:#1e3a8a;">UEB</strong><br/>
                                    <span style="font-size:7.5px; color:#475569;">UNIVERSIDAD ESTATAL DE BOLÍVAR</span>
                                </div>
                                <div class="header-title">
                                    <h2>BIENESTAR UNIVERSITARIO</h2>
                                    <h3>Puesto de Salud</h3>
                                </div>
                                <div style="text-align:right;">
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
                                        <strong>Apellido y Nombre:</strong> ${receta.prescriptor_nombre || 'Dr. Médico Ocupacional'}<br/>
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
                                        <th style="width:5.5%;">Mañana 🌅</th>
                                        <th style="width:5.5%;">Mediodía ☀️</th>
                                        <th style="width:5.5%;">Tarde 🌤️</th>
                                        <th style="width:5.5%;">Noche 🌙</th>
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
                                        <strong>Apellido y Nombre:</strong> ${receta.prescriptor_nombre || 'Dr. Médico Ocupacional'}<br/>
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

                    <script>
                        window.onload = function() { window.print(); };
                    </script>
                </body>
                </html>
            `);
            printWindow.document.close();
        } catch (e) {
            console.error(e);
            showSystemToast("Error al imprimir el recetario.");
        }
    };

    const handlePrintReporteCitas = () => {
        try {
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                alert("El bloqueador de popups impidió abrir el reporte. Permita los popups.");
                return;
            }

            const doctorNameText = user?.name || 'Médico Ocupacional';
            const formattedDate = citasDate ? citasDate : 'Todas las fechas';

            const rowsHtml = filteredCitas.map((cita, index) => {
                const patientName = cita.paciente?.name || cita.pacienteNombre || 'Paciente';
                const cedula = cita.paciente?.cedula || cita.cedula || 'N/D';
                const puesto = cita.paciente?.puesto || cita.puesto || 'Servidor';
                const estado = (cita.estado || 'programada').toUpperCase();
                const horario = `${cita.hora_inicio || ''} - ${cita.hora_fin || ''}`;
                const motivo = cita.motivo || 'Consulta Ocupacional';
                const tipoEval = cita.tipo_evaluacion || 'General';

                let estadoBadgeColor = '#1e40af';
                if (cita.estado === 'confirmada') estadoBadgeColor = '#065f46';
                if (cita.estado === 'completada') estadoBadgeColor = '#374151';
                if (cita.estado === 'cancelada') estadoBadgeColor = '#991b1b';

                return `
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${index + 1}</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${cita.fecha}</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${horario}</td>
                        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${patientName}<br/><small style="color: #666; font-weight: normal;">${puesto}</small></td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${cedula}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;"><strong>${tipoEval}:</strong> ${motivo}</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: ${estadoBadgeColor};">${estado}</td>
                    </tr>
                `;
            }).join('');

            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Reporte de Citas Ocupacionales - ${formattedDate}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
                        h2 { margin-bottom: 4px; color: #002040; }
                        table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
                        th { background-color: #f1f5f9; padding: 10px; border: 1px solid #ddd; }
                    </style>
                </head>
                <body>
                    <h2>UNIVERSIDAD TÉCNICA DE COTOPAXI</h2>
                    <h3>DIRECCIÓN DE BIENESTAR UNIVERSITARIO - SALUD OCUPACIONAL</h3>
                    <hr/>
                    <p><strong>Fecha de Emisión:</strong> ${new Date().toLocaleDateString('es-EC')} | <strong>Filtrado por Fecha:</strong> ${formattedDate}</p>
                    <p><strong>Médico Ocupacional:</strong> ${doctorNameText}</p>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Fecha</th>
                                <th>Horario</th>
                                <th>Paciente / Puesto</th>
                                <th>Cédula</th>
                                <th>Evaluación / Motivo</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml}
                        </tbody>
                    </table>
                    <script>window.onload = function() { window.print(); }</script>
                </body>
                </html>
            `);
            printWindow.document.close();
        } catch (err) {
            console.error(err);
        }
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

    // Search Patients Mock / API
    const handleSearchPatient = async (term = '') => {
        setSearchTerm(term);
        const defaultMock = [
            { id: '1', nombres: 'Carlos', apellidos: 'Mendoza Ruiz', cedula: '1723456789', puestoTrabajo: 'Docente Tiempo Completo', areaTrabajo: 'Facultad de Ingeniería' },
            { id: '2', nombres: 'Laura', apellidos: 'Castillo Vega', cedula: '1718902341', puestoTrabajo: 'Asistente Administrativa', areaTrabajo: 'Talento Humano' },
            { id: '3', nombres: 'Juan', apellidos: 'Pérez Gómez', cedula: '1798765432', puestoTrabajo: 'Analista de Sistemas', areaTrabajo: 'Tecnologías de Información' }
        ];

        if (!term || !term.trim()) {
            try {
                const res = await api.get('/patients/search?query=');
                if (res.data && res.data.data && res.data.data.length > 0) {
                    setSearchResults(res.data.data);
                    return;
                }
            } catch (err) { }
            setSearchResults(defaultMock);
            return;
        }

        try {
            const res = await api.get(`/patients/search?query=${encodeURIComponent(term)}`);
            if (res.data && res.data.data && res.data.data.length > 0) {
                setSearchResults(res.data.data);
                return;
            }
        } catch (err) { }

        const filtered = defaultMock.filter(p =>
            p.nombres.toLowerCase().includes(term.toLowerCase()) ||
            p.apellidos.toLowerCase().includes(term.toLowerCase()) ||
            p.cedula.includes(term)
        );
        setSearchResults(filtered);
    };

    const openPatientSearch = (target = 'consulta') => {
        setPatientSearchTarget(target);
        handleSearchPatient('');
        setIsPatientSearchOpen(true);
    };

    const selectPatient = (p) => {
        setPatientSelected(p);
        setPatientId(p.id || p.cedula);
        setIsPatientSearchOpen(false);
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

    const handleSaveReintegro = (e) => {
        e.preventDefault();
        const newRecord = {
            id: Date.now(),
            fecha: reintegroForm.fechaReintegro,
            paciente: reintegroForm.pacienteNombre,
            cedula: reintegroForm.pacienteCedula,
            tipo: reintegroForm.tipoReintegro === 'total' ? 'Total' : 'Progresivo',
            dias: reintegroForm.diasIncapacidad || 0,
            diagnostico: reintegroForm.diagnosticoOrigen,
            puesto: reintegroForm.puesto,
            aptitud: 'Aprobado',
            estado: 'Aprobado'
        };
        setReintegrosData([newRecord, ...reintegrosData]);
        setIsReintegroModalOpen(false);
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

                            <div className="liquid-nav" style={{ marginBottom: '20px' }}>
                                <button
                                    className={`liquid-nav__item ${activeReportSubTab === 'diario' ? 'active' : ''}`}
                                    onClick={() => setActiveReportSubTab('diario')}
                                >
                                    <ClipboardList size={16} />
                                    <span>Partes Diarios</span>
                                </button>
                                <button
                                    className={`liquid-nav__item ${activeReportSubTab === 'fichas' ? 'active' : ''}`}
                                    onClick={() => setActiveReportSubTab('fichas')}
                                >
                                    <FileText size={16} />
                                    <span>Fichas Ocupacionales</span>
                                </button>
                                <button
                                    className={`liquid-nav__item ${activeReportSubTab === 'citas' ? 'active' : ''}`}
                                    onClick={() => setActiveReportSubTab('citas')}
                                >
                                    <CalendarCheck size={16} />
                                    <span>Agendamiento de Citas</span>
                                </button>
                                <button
                                    className={`liquid-nav__item ${activeReportSubTab === 'examenes' ? 'active' : ''}`}
                                    onClick={() => setActiveReportSubTab('examenes')}
                                >
                                    <Stethoscope size={16} />
                                    <span>Exámenes & Laboratorio</span>
                                </button>
                                <button
                                    className={`liquid-nav__item ${activeReportSubTab === 'recetas' ? 'active' : ''}`}
                                    onClick={() => setActiveReportSubTab('recetas')}
                                >
                                    <Pill size={16} />
                                    <span>Recetario</span>
                                </button>
                                <button
                                    className={`liquid-nav__item ${activeReportSubTab === 'mensual' ? 'active' : ''}`}
                                    onClick={() => setActiveReportSubTab('mensual')}
                                >
                                    <FileText size={16} />
                                    <span>Informe Estadístico Mensual</span>
                                </button>
                            </div>

                            {/* SUBTAB: DIARIO */}
                            {activeReportSubTab === 'diario' && (
                                <div>
                                    <article className="nurse-card span-12 daily-header-card" style={{ borderRadius: '14px', padding: '20px' }}>
                                        <div className="daily-date-control" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '16px' }}>
                                            <div>
                                                <span className="eyebrow">PARTE DE LA JORNADA</span>
                                                <h3>Atenciones del día</h3>
                                                <p>Selecciona una fecha para consultar y exportar el reporte correspondiente.</p>
                                            </div>
                                            <div className="date-navigation" style={{ display: 'flex', gap: '8px' }}>
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
                                                    onClick={() => handlePrintParteDiario()}
                                                    className="action-button action-button--accent"
                                                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                                >
                                                    <Printer size={14} /> Imprimir Reporte
                                                </button>
                                            </div>
                                        </div>

                                        <section className="psycho-kpis" style={{ marginTop: '20px' }}>
                                            <div className="psycho-kpi-card">
                                                <div className="psycho-kpi-card__icon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}><UserCheck size={20} /></div>
                                                <div className="psycho-kpi-card__info">
                                                    <span>Atendidos Hoy</span>
                                                    <strong>0</strong>
                                                </div>
                                            </div>
                                            <div className="psycho-kpi-card">
                                                <div className="psycho-kpi-card__icon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}><HeartHandshake size={20} /></div>
                                                <div className="psycho-kpi-card__info">
                                                    <span>Evaluación Periódica</span>
                                                    <strong>0</strong>
                                                </div>
                                            </div>
                                            <div className="psycho-kpi-card">
                                                <div className="psycho-kpi-card__icon" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}><TrendingUp size={20} /></div>
                                                <div className="psycho-kpi-card__info">
                                                    <span>Reintegros</span>
                                                    <strong>0</strong>
                                                </div>
                                            </div>
                                            <div className="psycho-kpi-card">
                                                <div className="psycho-kpi-card__icon" style={{ background: '#fef3c7', color: '#d97706' }}><FileCheck size={20} /></div>
                                                <div className="psycho-kpi-card__info">
                                                    <span>Fichas Médicas</span>
                                                    <strong>0</strong>
                                                </div>
                                            </div>
                                        </section>
                                    </article>

                                    <article className="nurse-card span-12" style={{ marginTop: '20px', borderRadius: '14px', padding: '20px' }}>
                                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                            No hay atenciones registradas en el diario para la fecha seleccionada.
                                        </div>
                                    </article>
                                </div>
                            )}

                            {/* SUBTAB: FICHAS OCUPACIONALES */}
                            {activeReportSubTab === 'fichas' && (
                                <div>
                                    <div className="card" style={{ borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                                        {/* BARRA SUPERIOR: SUBPESTAÑAS DE TIPO DE FICHA + ACCIONES */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                                            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
                                                <button
                                                    type="button"
                                                    className={`history-tab ${fichaSubTab === 'ingreso' ? 'active' : ''}`}
                                                    onClick={() => setFichaSubTab('ingreso')}
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                                                >
                                                    <FileCheck size={16} /> Ingreso / Periódico
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`history-tab ${fichaSubTab === 'cese' ? 'active' : ''}`}
                                                    onClick={() => setFichaSubTab('cese')}
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                                                >
                                                    <UserX size={16} /> Retiro / Cese
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`history-tab ${fichaSubTab === 'reintegro' ? 'active' : ''}`}
                                                    onClick={() => setFichaSubTab('reintegro')}
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                                                >
                                                    <RefreshCw size={16} /> Reintegro Laboral
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`history-tab ${fichaSubTab === 'embarazadas' ? 'active' : ''}`}
                                                    onClick={() => setFichaSubTab('embarazadas')}
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                                                >
                                                    <Heart size={16} /> Gestantes / Lactantes
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`history-tab ${fichaSubTab === 'discapacidad' ? 'active' : ''}`}
                                                    onClick={() => setFichaSubTab('discapacidad')}
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                                                >
                                                    <ShieldAlert size={16} /> Discapacidad
                                                </button>
                                            </div>

                                            {fichaSubTab === 'reintegro' ? (
                                                <button
                                                    type="button"
                                                    className="action-button action-button--primary"
                                                    onClick={() => setIsReintegroModalOpen(true)}
                                                    style={{ padding: '10px 18px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '8px', borderRadius: '12px' }}
                                                >
                                                    <Plus size={16} /> Registrar Reintegro
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="action-button action-button--primary"
                                                    onClick={openPatientSearch}
                                                    style={{ padding: '10px 18px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '8px', borderRadius: '12px' }}
                                                >
                                                    <Plus size={16} /> Nueva Ficha Ocupacional
                                                </button>
                                            )}
                                        </div>

                                        {/* FILTRO Y BUSCADOR */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', gap: '12px', flexWrap: 'wrap' }}>
                                            <div className="patient-search-input" style={{ width: '100%', maxWidth: '400px' }}>
                                                <Search size={16} />
                                                <input
                                                    type="text"
                                                    placeholder="Buscar por paciente, cédula o puesto de trabajo..."
                                                    value={fichaSearchTerm}
                                                    onChange={e => setFichaSearchTerm(e.target.value)}
                                                />
                                            </div>
                                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                                                {fichaSubTab === 'reintegro' ? 'Reintegros filtrados:' : 'Expedientes filtrados:'} <strong>{fichaSubTab === 'reintegro' ? filteredReintegros.length : filteredFichas.length}</strong>
                                            </div>
                                        </div>

                                        {/* TABLA ESTILIZADA */}
                                        {fichaSubTab === 'reintegro' ? (
                                            <div className="table-responsive">
                                                <table className="table" style={{ width: '100%' }}>
                                                    <thead>
                                                        <tr>
                                                            <th>Fecha Reintegro</th>
                                                            <th>Trabajador</th>
                                                            <th>Cédula</th>
                                                            <th>Puesto</th>
                                                            <th>Días Incapacidad</th>
                                                            <th>Diagnóstico Origen</th>
                                                            <th>Modalidad</th>
                                                            <th style={{ textAlign: 'right' }}>Estado</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {filteredReintegros.length === 0 ? (
                                                            <tr>
                                                                <td colSpan="8" style={{ textAlign: 'center', padding: '36px 16px', color: '#64748b', fontSize: '13.5px' }}>
                                                                    No hay registros de reintegro laboral en este apartado.
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            filteredReintegros.map(item => (
                                                                <tr key={item.id}>
                                                                    <td>{item.fecha}</td>
                                                                    <td><strong>{item.paciente}</strong></td>
                                                                    <td>{item.cedula}</td>
                                                                    <td>{item.puesto}</td>
                                                                    <td><strong style={{ color: '#0369a1' }}>{item.dias} días</strong></td>
                                                                    <td>{item.diagnostico}</td>
                                                                    <td><span className="badge-role" style={{ background: '#f1f5f9', color: '#334155' }}>{item.tipo}</span></td>
                                                                    <td style={{ textAlign: 'right' }}>
                                                                        <span style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '11.5px', fontWeight: '700', background: item.estado === 'Aprobado' ? '#f0fdf4' : '#fffbeb', color: item.estado === 'Aprobado' ? '#166534' : '#b45309' }}>
                                                                            {item.estado}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="table-responsive">
                                                <table className="table" style={{ width: '100%' }}>
                                                    <thead>
                                                        <tr>
                                                            <th>Fecha</th>
                                                            <th>Paciente</th>
                                                            <th>Cédula</th>
                                                            <th>Tipo Ficha</th>
                                                            <th>Puesto de Trabajo</th>
                                                            <th>Dictamen Aptitud</th>
                                                            <th style={{ textAlign: 'right' }}>Acciones</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {filteredFichas.length === 0 ? (
                                                            <tr>
                                                                <td colSpan="7" style={{ textAlign: 'center', padding: '36px 16px', color: '#64748b', fontSize: '13.5px' }}>
                                                                    No hay fichas ocupacionales registradas en este apartado.
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            filteredFichas.map(item => (
                                                                <tr key={item.id}>
                                                                    <td>{item.fecha}</td>
                                                                    <td><strong>{item.paciente}</strong></td>
                                                                    <td>{item.cedula}</td>
                                                                    <td>
                                                                        <span className="badge-role" style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '8px', fontSize: '11.5px', fontWeight: '600' }}>
                                                                            {item.tipo}
                                                                        </span>
                                                                    </td>
                                                                    <td>{item.puesto}</td>
                                                                    <td>
                                                                        <span style={{
                                                                            padding: '5px 12px',
                                                                            borderRadius: '20px',
                                                                            fontSize: '11.5px',
                                                                            fontWeight: '700',
                                                                            display: 'inline-flex',
                                                                            alignItems: 'center',
                                                                            gap: '6px',
                                                                            background: item.aptitud.includes('Restricción') ? '#fffbeb' : item.aptitud.includes('No') ? '#fef2f2' : '#f0fdf4',
                                                                            color: item.aptitud.includes('Restricción') ? '#b45309' : item.aptitud.includes('No') ? '#dc2626' : '#15803d',
                                                                            border: item.aptitud.includes('Restricción') ? '1px solid #fef3c7' : item.aptitud.includes('No') ? '1px solid #fecdd3' : '1px solid #dcfce7'
                                                                        }}>
                                                                            {item.aptitud.includes('Restricción') ? <AlertTriangle size={12} /> : item.aptitud.includes('No') ? <AlertOctagon size={12} /> : <CheckCircle size={12} />}
                                                                            {item.aptitud}
                                                                        </span>
                                                                    </td>
                                                                    <td style={{ textAlign: 'right' }}>
                                                                        <button
                                                                            type="button"
                                                                            className="action-button action-button--light"
                                                                            style={{ padding: '6px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', borderRadius: '8px' }}
                                                                            onClick={() => alert(`Generando PDF de la Ficha Ocupacional de ${item.paciente}`)}
                                                                        >
                                                                            <Printer size={14} /> Imprimir PDF
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
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
                                                <button className="action-button action-button--accent" onClick={handlePrintReporteCitas} style={{ display: 'flex', alignItems: 'center', gap: '6px', minHeight: '34px' }}>
                                                    <Printer size={14} /> Imprimir Reporte
                                                </button>
                                            </div>
                                        </div>
                                    </article>

                                    <article className="nurse-card span-12" style={{ borderRadius: '14px', padding: '20px' }}>
                                        {citasList.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                                No hay citas registradas en la fecha y filtros seleccionados.
                                            </div>
                                        ) : (
                                            <div style={{ overflowX: 'auto' }}>
                                                <table className="daily-table" style={{ width: '100%' }}>
                                                    <thead>
                                                        <tr>
                                                            <th>Hora</th>
                                                            <th>Paciente</th>
                                                            <th>Cédula</th>
                                                            <th>Evaluación / Motivo</th>
                                                            <th style={{ textAlign: 'center' }}>Estado</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {citasList.map((cita) => {
                                                            const patientName = cita.paciente?.name || cita.pacienteNombre || '—';
                                                            const cedula = cita.paciente?.cedula || cita.cedula || '—';
                                                            const isCancel = cita.estado === 'cancelada';
                                                            const isDone = cita.estado === 'completada';

                                                            return (
                                                                <tr key={cita.id}>
                                                                    <td style={{ fontWeight: 600, color: 'var(--primary)', whiteSpace: 'nowrap' }}>
                                                                        {cita.hora_inicio} - {cita.hora_fin}
                                                                    </td>
                                                                    <td>
                                                                        <strong>{patientName}</strong>
                                                                    </td>
                                                                    <td>{cedula}</td>
                                                                    <td>{cita.tipo_evaluacion || cita.motivo || 'Consulta General'}</td>
                                                                    <td style={{ textAlign: 'center' }}>
                                                                        <span style={{
                                                                            fontSize: '9.5px',
                                                                            fontWeight: '750',
                                                                            textTransform: 'uppercase',
                                                                            padding: '3px 8px',
                                                                            borderRadius: '12px',
                                                                            background: isCancel ? 'rgba(183, 26, 52, 0.1)' : isDone ? 'rgba(22, 131, 93, 0.1)' : 'rgba(0, 32, 64, 0.08)',
                                                                            color: isCancel ? 'var(--accent)' : isDone ? 'var(--success)' : 'var(--primary)'
                                                                        }}>
                                                                            {cita.estado}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </article>
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

                            {/* SUBTAB: RECETARIO OCUPACIONAL */}
                            {activeReportSubTab === 'recetas' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <article className="nurse-card span-12" style={{ borderRadius: '14px', padding: '20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', width: '100%', marginBottom: '16px' }}>
                                            <div>
                                                <span className="eyebrow">REGISTRO DE FARMACIA Y PRESCRIPCIÓN</span>
                                                <h3>Buscador de Recetarios Médicos Ocupacionales</h3>
                                                <p>Consulte, descargue e imprima los recetarios oficiales emitidos en el puesto de salud ocupacional.</p>
                                            </div>
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                                <div style={{ position: 'relative' }}>
                                                    <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                                    <input
                                                        type="text"
                                                        placeholder="Buscar por paciente o cédula..."
                                                        value={recetasSearchNombre}
                                                        onChange={(e) => setRecetasSearchNombre(e.target.value)}
                                                        style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '7px 12px 7px 32px', fontSize: '11.5px', minWidth: '220px', outline: 0 }}
                                                    />
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <CalendarDays size={16} color="var(--accent)" />
                                                    <input
                                                        type="date"
                                                        value={recetasSearchFecha}
                                                        onChange={(e) => setRecetasSearchFecha(e.target.value)}
                                                        style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px', fontSize: '11.5px', outline: 0 }}
                                                    />
                                                    {recetasSearchFecha && (
                                                        <button className="action-button action-button--light" style={{ padding: '4px 8px', fontSize: '10px' }} onClick={() => setRecetasSearchFecha('')}>
                                                            Limpiar fecha
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ overflowX: 'auto', width: '100%' }}>
                                            <table className="medical-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                                <thead>
                                                    <tr style={{ background: 'var(--surface-hover)', borderBottom: '1px solid var(--border)' }}>
                                                        <th style={{ padding: '12px 14px', fontSize: '11px', color: 'var(--text-muted)' }}>N° Receta</th>
                                                        <th style={{ padding: '12px 14px', fontSize: '11px', color: 'var(--text-muted)' }}>Fecha</th>
                                                        <th style={{ padding: '12px 14px', fontSize: '11px', color: 'var(--text-muted)' }}>Paciente</th>
                                                        <th style={{ padding: '12px 14px', fontSize: '11px', color: 'var(--text-muted)' }}>Cédula</th>
                                                        <th style={{ padding: '12px 14px', fontSize: '11px', color: 'var(--text-muted)' }}>CIE / Diagnóstico</th>
                                                        <th style={{ padding: '12px 14px', fontSize: '11px', color: 'var(--text-muted)' }}>Estado</th>
                                                        <th style={{ padding: '12px 14px', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'right' }}>Acción</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {recetasData.filter(r => {
                                                        const matchNombre = !recetasSearchNombre.trim() ||
                                                            r.paciente.toLowerCase().includes(recetasSearchNombre.trim().toLowerCase()) ||
                                                            r.cedula.includes(recetasSearchNombre.trim());
                                                        const matchFecha = !recetasSearchFecha || r.fecha === recetasSearchFecha;
                                                        return matchNombre && matchFecha;
                                                    }).length === 0 ? (
                                                        <tr>
                                                            <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                                                                No se encontraron recetarios que coincidan con la búsqueda.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        recetasData.filter(r => {
                                                            const matchNombre = !recetasSearchNombre.trim() ||
                                                                r.paciente.toLowerCase().includes(recetasSearchNombre.trim().toLowerCase()) ||
                                                                r.cedula.includes(recetasSearchNombre.trim());
                                                            const matchFecha = !recetasSearchFecha || r.fecha === recetasSearchFecha;
                                                            return matchNombre && matchFecha;
                                                        }).map((receta, idx) => (
                                                            <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                                                                <td style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--primary)' }}>
                                                                    {receta.numero_receta || `REC-${receta.id}`}
                                                                </td>
                                                                <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>{receta.fecha}</td>
                                                                <td style={{ padding: '12px 14px', fontWeight: '600' }}>{receta.paciente}</td>
                                                                <td style={{ padding: '12px 14px' }}>{receta.cedula}</td>
                                                                <td style={{ padding: '12px 14px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                    {receta.cie || 'Evaluación Médica'}
                                                                </td>
                                                                <td style={{ padding: '12px 14px' }}>
                                                                    <span style={{ fontSize: '10.5px', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                                                                        {receta.estado || 'Emitido'}
                                                                    </span>
                                                                </td>
                                                                <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                                                                    <button
                                                                        type="button"
                                                                        className="action-button action-button--accent"
                                                                        style={{ padding: '5px 12px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                                                        onClick={() => setSelectedRecetaPreview(receta)}
                                                                    >
                                                                        <Pill size={14} /> Ver Receta
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </article>
                                </div>
                            )}

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
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <CalendarDays size={16} color="var(--accent)" />
                                                    <input
                                                        type="month"
                                                        value={reportMensualFecha}
                                                        onChange={(e) => setReportMensualFecha(e.target.value)}
                                                        style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px', fontSize: '11px', outline: 0 }}
                                                    />
                                                </label>
                                                <button className="action-button action-button--accent" onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '6px', minHeight: '34px' }}>
                                                    <Printer size={14} /> Imprimir Reporte
                                                </button>
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
                                                    <span style={{ color: '#fff', fontSize: '12.5px', fontWeight: 600 }}>Informe_Estadistico_Mensual_Ocupacional.pdf</span>
                                                    <span style={{ color: '#94a3b8', fontSize: '10px' }}>Vista previa del documento oficial para impresión</span>
                                                </div>
                                            </div>
                                            <button
                                                className="action-button action-button--accent"
                                                onClick={() => window.print()}
                                                style={{ display: 'flex', alignItems: 'center', gap: '6px', minHeight: '32px', fontSize: '11.5px', borderRadius: '8px', padding: '0 14px' }}
                                            >
                                                <Printer size={14} /> Imprimir / Descargar
                                            </button>
                                        </div>
                                        <div style={{ background: '#334155', padding: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#94a3b8', minHeight: '350px' }}>
                                            <span>Informe acumulado listo para auditorías institucionales y Ministerio del Trabajo.</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

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
                                                paciente: patientSelected ? `${patientSelected.nombres} ${patientSelected.apellidos}` : 'Paciente Trabajo',
                                                cedula: patientSelected?.cedula || '1723456789',
                                                tipo: tipoFicha,
                                                puesto: patientSelected?.puestoTrabajo || 'Servidor/Docente',
                                                aptitud: aptitudLaboral === 'apto' ? 'Apto' : aptitudLaboral === 'apto_restriccion' ? 'Apto con Restricción' : 'No Apto',
                                                estado: 'Completado'
                                            };
                                            setFichasData(prev => [newRecord, ...prev]);

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
                                                    <th style={{ padding: '6px', textAlign: 'center' }}>Mañana 🌅</th>
                                                    <th style={{ padding: '6px', textAlign: 'center' }}>Mediodía ☀️</th>
                                                    <th style={{ padding: '6px', textAlign: 'center' }}>Tarde 🌤️</th>
                                                    <th style={{ padding: '6px', textAlign: 'center' }}>Noche 🌙</th>
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

            {/* PANEL DE AYUDA */}
            <HelpPanel
                helpItems={[
                    { title: 'Paso 1: Buscar o Registrar Trabajador', content: 'Use el buscador de Cédula o nombre para cargar al trabajador. Si es nuevo, regístrelo en el sistema.' },
                    { title: 'Paso 2: Evaluación Ocupacional', content: 'Complete los pasos de la consulta ocupacional (Vigilancia, Antecedentes, Examen Físico, Aptitud Laboral y Prescripción Médica).' },
                    { title: 'Paso 3: Matriz de Riesgos y Exámenes', content: 'Emita órdenes de exámenes diagnósticos o genere certificados de aptitud laboral.' },
                    { title: 'Paso 4: Reportes y Fichas', content: 'Consulte partes diarios y fichas ocupacionales (Ingreso, Retiro, Reintegro, Gestantes, Discapacidad).' }
                ]}
                contactInfo={{ email: 'soporte@ueb.edu.ec' }}
            />
        </div>
    );
}