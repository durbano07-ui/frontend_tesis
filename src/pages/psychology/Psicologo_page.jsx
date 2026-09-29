import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import api from '../../api/axios';
import '../../medical.css'; // Estilos unificados médicos y psicológicos
import HelpPanel from '../../components/HelpPanel';
import UserProfileMenu from '../../components/UserProfileMenu';
import NotificationMenu from '../../components/NotificationMenu';
import PasswordRequirements from '../../components/PasswordRequirements';
import { useClinicalDraft } from '../../hooks/useClinicalDraft';
import { logoBienestar } from '../../assets/logoBienestarBase64.js';

import {
    Menu,
    LogOut,
    Bell,
    Search,
    X,
    Save,
    History,
    Brain,
    FileText,
    TrendingUp,
    Plus,
    Calendar,
    ChevronDown,
    ChevronUp,
    ChevronRight,
    ChevronLeft,
    Activity,
    ClipboardList,
    CheckCircle,
    AlertTriangle,
    Stethoscope,
    User,
    UserPlus,
    CalendarCheck,
    CalendarDays,
    BookOpen,
    UserCheck,
    HeartHandshake,
    FileCheck,
    Printer,
    Clock,
    ArrowRight,
    Briefcase,
    Heart,
    Eye,
    Smile,
    Compass,
    MessageSquare,
    Zap,
    AlertCircle,
    Mail,
    Shield,
    MapPin,
    EyeOff,
    Info
} from 'lucide-react';

const COUNTRIES = [
    'Afganistán', 'Albania', 'Alemania', 'Andorra', 'Angola', 'Antigua y Barbuda', 'Arabia Saudita',
    'Argelia', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaiyán', 'Bahamas', 'Bangladés',
    'Barbados', 'Baréin', 'Bélgica', 'Belice', 'Benín', 'Bielorrusia', 'Bolivia', 'Bosnia y Herzegovina',
    'Botsuana', 'Brasil', 'Brunéi', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Bután', 'Cabo Verde',
    'Camboya', 'Camerún', 'Canadá', 'Catar', 'Chad', 'Chile', 'China', 'Chipre', 'Colombia', 'Comoras',
    'Corea del Norte', 'Corea del Sur', 'Costa Rica', 'Costa de Marfil', 'Croacia', 'Cuba',
    'Dinamarca', 'Djibouti', 'Dominica', 'Ecuador', 'Egipto', 'El Salvador', 'Emiratos Árabes Unidos',
    'Eritrea', 'Eslovaquia', 'Eslovenia', 'España', 'Estados Unidos', 'Estonia', 'Etiopía', 'Filipinas',
    'Finlandia', 'Fiyi', 'Francia', 'Gabón', 'Gambia', 'Georgia', 'Ghana', 'Granada', 'Grecia',
    'Guatemala', 'Guinea', 'Guinea-Bisáu', 'Guinea Ecuatorial', 'Guyana', 'Haití', 'Honduras',
    'Hungría', 'India', 'Indonesia', 'Irak', 'Irán', 'Irlanda', 'Islandia', 'Islas Marshall',
    'Islas Salomón', 'Israel', 'Italia', 'Jamaica', 'Japón', 'Jordania', 'Kazajistán', 'Kenia',
    'Kirguistán', 'Kiribati', 'Kuwait', 'Laos', 'Lesoto', 'Letonia', 'Líbano', 'Liberia', 'Libia',
    'Liechtenstein', 'Lituania', 'Luxemburgo', 'Madagascar', 'Malasia', 'Malaui', 'Maldivas',
    'Mali', 'Malta', 'Marruecos', 'Mauricio', 'Mauritania', 'México', 'Micronesia', 'Moldavia',
    'Mónaco', 'Mongolia', 'Montenegro', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal',
    'Nicaragua', 'Níger', 'Nigeria', 'Noruega', 'Nueva Zelanda', 'Omán', 'Países Bajos', 'Pakistán',
    'Palaos', 'Palestina', 'Panamá', 'Papúa Nueva Guinea', 'Paraguay', 'Perú', 'Polonia', 'Portugal',
    'Reino Unido', 'República Centroafricana', 'República Checa', 'República Democrática del Congo',
    'República Dominicana', 'República del Congo', 'Ruanda', 'Rumanía', 'Rusia', 'Samoa', 'San Cristóbal y Nieves',
    'San Marino', 'San Vicente y las Granadinas', 'Santa Lucía', 'Santo Tomé y Príncipe', 'Senegal',
    'Serbia', 'Seychelles', 'Sierra Leona', 'Singapur', 'Siria', 'Somalia', 'Sri Lanka', 'Suazilandia',
    'Sudáfrica', 'Sudán', 'Sudán del Sur', 'Suecia', 'Suiza', 'Surinam', 'Tailandia', 'Tanzania',
    'Tayikistán', 'Timor Oriental', 'Togo', 'Tonga', 'Trinidad y Tobago', 'Túnez', 'Turkmenistán',
    'Turquía', 'Tuvalu', 'Ucrania', 'Uganda', 'Uruguay', 'Uzbekistán', 'Vanuatu', 'Venezuela',
    'Vietnam', 'Yemen', 'Yibuti', 'Zambia', 'Zimbabue'
];

const Psicologo_page = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    // Estado para cambiar de pestaña activa
    // 'ficha' | 'diario' | 'evolucion' | 'historial'
    const [activeTab, setActiveTab] = useState('ficha');

    // Menú colapsable en móviles y barra lateral
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Toast de notificaciones
    const [toast, setToast] = useState({ show: false, message: '' });

    // Estado global de paciente seleccionado
    const [selectedPatient, setSelectedPatient] = useState(null);

    // Draft local & Offline resilience
    const patientId = selectedPatient?.id_usuario || selectedPatient?.id;
    const { isOffline, saveDraft, loadDraft, clearDraft, draftLastSaved } = useClinicalDraft('psicologia', user?.id, patientId);

    // Modales de búsqueda y registro
    const [isPatientSearchOpen, setIsPatientSearchOpen] = useState(false);
    const [isPatientRegisterOpen, setIsPatientRegisterOpen] = useState(false);
    const [isFichaModalOpen, setIsFichaModalOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Formulario de registro rápido
    const [newPatientForm, setNewPatientForm] = useState({
        nombre_completo: '',
        tipo_documento: 'cedula', // 'cedula' | 'pasaporte'
        cedula: '',
        pais_origen: '',
        id_tipo_usuario: 2, // 2: Estudiante, 3: Docente, 4: Administrativo, 5: Código de Trabajo
        correo: ''
    });
    const [registerLoading, setRegisterLoading] = useState(false);
    const [registerError, setRegisterError] = useState('');

    // Búsqueda de paciente
    const [modalSearchCedula, setModalSearchCedula] = useState('');
    const [modalSearchResults, setModalSearchResults] = useState([]);
    const [modalSearchLoading, setModalSearchLoading] = useState(false);
    const [modalSearchError, setModalSearchError] = useState('');

    // ==========================================
    // 1. ESTADOS DE FICHA CLÍNICA (ANAMNESIS)
    // ==========================================
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [validationTriggered, setValidationTriggered] = useState(false);
    const steps = [
        { key: 'motivo', label: '1. Motivo y Anamnesis' },
        { key: 'historiales', label: '2. Historial de Vida' },
        { key: 'mental', label: '3. Estado Mental' },
        { key: 'pruebas', label: '4. Pruebas Aplicadas' },
        { key: 'diagnostico', label: '5. Diag. y Diario' }
    ];
    const handlePrevStep = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(currentStepIndex - 1);
            setValidationTriggered(false);
        }
    };
    const handleNextStep = () => {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
            setValidationTriggered(false);
        }
    };
    const handleSaveAndContinue = async () => {
        const activeStepKey = steps[currentStepIndex].key;
        const success = await handleSaveFichaSection(activeStepKey);
        if (success) {
            handleNextStep();
        }
    };
    const handleSaveAndFinish = async () => {
        const activeStepKey = steps[currentStepIndex].key;
        const success = await handleSaveFichaSection(activeStepKey);
        if (success) {
            handleCloseFichaForm();
        }
    };
    const [fichaLoading, setFichaLoading] = useState(false);
    const [fichaSaving, setFichaSaving] = useState(false);
    const [saveFeedback, setSaveFeedback] = useState({ show: false, success: true, title: '', message: '' });

    // Estados para 3D Book - Psicología
    const [areaHistories, setAreaHistories] = useState({ psicologia: [] });
    const [areaHistoriesLoading, setAreaHistoriesLoading] = useState(false);
    const [activeBookArea, setActiveBookArea] = useState('psicologia');
    const [activeBookRecord, setActiveBookRecord] = useState(null);

    // Estado de modal de confirmación custom
    const [confirmModal, setConfirmModal] = useState({
        show: false,
        title: '',
        message: '',
        onConfirm: null
    });

    const [bookCurrentPage, setBookCurrentPage] = useState(1);
    const [bookMonthFilter, setBookMonthFilter] = useState('all');

    useEffect(() => {
        setBookCurrentPage(1);
        setBookMonthFilter('all');
    }, [activeBookArea, areaHistories]);

    // Valores crudos cargados del backend para saber si actualizar (PUT) o crear (POST)
    const [fichaRawData, setFichaRawData] = useState({
        motivo: null,
        psico_personal: null,
        psico_familiar: null,
        laboral: null,
        social: null,
        sexual: null,
        patologia: null,
        mental: null,
        pruebas: null,
        analisis: null,
        conclusion: null,
        diagnostico: null,
        pronostico: null,
        recomendacion: null,
        parte_diario: null
    });

    // Estado de los inputs del formulario de Ficha Clínica
    const [fichaForm, setFichaForm] = useState({
        detalle_motivo: '',
        psicoanamnesis_personal: '',
        psicoanamnesis_familiar: '',
        detalle_laboral: '',
        detalle_social: '',
        detalle_sexual: '',
        detalle_patologia: '',
        // Examen estado mental
        apariencia: '',
        actitud: '',
        juicio: '',
        sueno: '',
        apetito: '',
        afectividad: '',
        orientacion: '',
        atencion: '',
        memoria: '',
        lenguaje: '',
        pensamiento: '',
        conducta_motora: '',
        // Pruebas y análisis
        detalle_prueba_aplicada: '',
        detalle_analisis_resultados: '',
        // Conclusiones, diagnóstico y parte diario automático
        detalle_conclusion: '',
        detalle_diagnostico: '',
        detalle_pronostico: '',
        detalle_recomendacion: '',
        // Parte Diario automático asociado
        tipo_atencion: 'primaria', // primaria | secundaria
        tipo_atencion2: 'curativo' // curativo | preventivo
    });

    // ==========================================
    // 2. ESTADOS DE PARTE DIARIO (CONSULTAS DEL DÍA)
    // ==========================================
    const [parteDiarioDate, setParteDiarioDate] = useState(new Date().toISOString().slice(0, 10));
    const [parteDiarioList, setParteDiarioList] = useState([]);
    const [parteDiarioLoading, setParteDiarioLoading] = useState(false);

    // ==========================================
    // 3. ESTADOS DE SESIONES DE EVOLUCIÓN
    // ==========================================
    const [evolucionList, setEvolucionList] = useState([]);
    const [evolucionLoading, setEvolucionLoading] = useState(false);
    const [selectedEvolucion, setSelectedEvolucion] = useState(null);
    const [evolucionForm, setEvolucionForm] = useState({
        sesion_numero: 1,
        fecha: new Date().toISOString().slice(0, 10),
        detalle_evolucion: ''
    });
    // Tratamientos agrupados y control de despliegue
    const [expandedTreatments, setExpandedTreatments] = useState({});
    const [evolutionViewMode, setEvolutionViewMode] = useState('tratamientos'); // 'tratamientos' | 'todas'

    const toggleTreatment = (treatmentId, defaultState = true) => {
        setExpandedTreatments(prev => {
            const currentVal = prev[treatmentId];
            return {
                ...prev,
                [treatmentId]: currentVal !== undefined ? !currentVal : !defaultState
            };
        });
    };

    // ==========================================
    // 4. ESTADOS DE HISTORIAL GENERAL
    // ==========================================
    const [historialList, setHistorialList] = useState([]);
    const [patientProfilesCache, setPatientProfilesCache] = useState({});
    const [historialType, setHistorialType] = useState('all'); // all | evolucion | diario
    const [historialSearch, setHistorialSearch] = useState('');
    const [historialDate, setHistorialDate] = useState('');

    // Estados para el Módulo de Reportes Clínicos
    const [activeReportSubTab, setActiveReportSubTab] = useState('diario'); // diario | citas
    const [reportCitasFecha, setReportCitasFecha] = useState(new Date().toISOString().slice(0, 10)); // hoy
    const [reportCitasEstado, setReportCitasEstado] = useState('all'); // all | pendiente | confirmada | cancelada | completada
    const [reportCitasList, setReportCitasList] = useState([]);
    const [reportCitasLoading, setReportCitasLoading] = useState(false);

    const fetchReportCitas = async () => {
        setReportCitasLoading(true);
        try {
            const res = await api.get('/citas-medicas/doctor/citas');
            const allCitas = res.data.data || [];
            const filtered = allCitas.filter(cita => {
                if (!cita.fecha) return false;
                const citaDateStr = String(cita.fecha).slice(0, 10);
                const matchFecha = reportCitasFecha ? citaDateStr === reportCitasFecha : true;
                const matchEstado = reportCitasEstado === 'all' ? true : (cita.estado === reportCitasEstado);
                return matchFecha && matchEstado;
            });
            setReportCitasList(filtered);
        } catch (err) {
            console.error("Error al cargar citas para reporte:", err);
            showSystemToast("Error al cargar citas para el reporte.");
        } finally {
            setReportCitasLoading(false);
        }
    };

    const handlePrintReporteCitasRango = () => {
        if (reportCitasList.length === 0) {
            showSystemToast('No hay citas en esta fecha para generar el reporte.');
            return;
        }

        const formattedFecha = new Date(reportCitasFecha + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

        const total = reportCitasList.length;
        const completadas = reportCitasList.filter(c => c.estado === 'completada').length;
        const canceladas = reportCitasList.filter(c => c.estado === 'cancelada').length;
        const programadas = reportCitasList.filter(c => c.estado === 'programada').length;
        const confirmadas = reportCitasList.filter(c => c.estado === 'confirmada').length;

        const tableRowsHtml = reportCitasList.map((cita, idx) => {
            const pIdent = cita.paciente?.datos_identificacion || cita.paciente?.datosIdentificacion || cita.paciente?.identification || {};
            const fullName = `${pIdent.primer_nombre || ''} ${pIdent.segundo_nombre || ''} ${pIdent.apellido_paterno || ''} ${pIdent.apellido_materno || ''}`.trim() || cita.paciente?.name || cita.paciente?.email || '—';
            const cedula = pIdent.numero_cedula || '—';
            const statusUpper = (cita.estado || '').toUpperCase();

            return `
                <tr>
                    <td>${idx + 1}</td>
                    <td class="left-align font-bold">${fullName}</td>
                    <td>${cedula}</td>
                    <td>${cita.fecha}</td>
                    <td>${cita.hora_inicio} - ${cita.hora_fin}</td>
                    <td class="left-align">${cita.motivo || '—'}</td>
                    <td class="font-bold status-${cita.estado}">${statusUpper}</td>
                </tr>
            `;
        }).join('');

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <title>Reporte de Citas de Psicología - ${formattedFecha}</title>
                <style>
                    @page {
                        size: A4 portrait;
                        margin: 15mm;
                    }
                    body {
                        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                        font-size: 10px;
                        color: #333;
                        margin: 0;
                        padding: 10px;
                        background-color: #f3f4f6;
                        display: flex;
                        justify-content: center;
                        align-items: flex-start;
                        min-height: 100vh;
                        box-sizing: border-box;
                    }
                    .page-sheet {
                        background-color: #ffffff;
                        width: 210mm;
                        min-height: 297mm;
                        padding: 15mm;
                        box-sizing: border-box;
                        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                        border-radius: 8px;
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;
                    }
                    .header {
                        display: flex;
                        align-items: center;
                        border-bottom: 2px solid #000;
                        padding-bottom: 8px;
                        margin-bottom: 15px;
                    }
                    .header-title {
                        text-align: center;
                        flex-grow: 1;
                    }
                    .header-title h1 {
                        font-size: 15px;
                        margin: 0 0 2px 0;
                        text-transform: uppercase;
                        font-weight: bold;
                        color: #000;
                    }
                    .header-title h2 {
                        font-size: 12px;
                        margin: 0 0 2px 0;
                        font-weight: 500;
                        color: #444;
                        text-transform: uppercase;
                    }
                    .header-title h3 {
                        font-size: 12px;
                        margin: 0;
                        font-weight: bold;
                        color: #000;
                        letter-spacing: 0.5px;
                    }
                    .date-box {
                        border: 1px solid #000;
                        padding: 6px 10px;
                        font-weight: bold;
                        font-size: 10px;
                        background-color: #f3f4f6;
                        text-align: center;
                        line-height: 1.3;
                    }
                    .summary-section {
                        display: grid;
                        grid-template-columns: repeat(5, 1fr);
                        gap: 10px;
                        margin-bottom: 15px;
                        background: #f8fafc;
                        border: 1px solid #e2e8f0;
                        padding: 10px;
                        border-radius: 6px;
                    }
                    .summary-card {
                        text-align: center;
                    }
                    .summary-card span {
                        font-size: 8px;
                        text-transform: uppercase;
                        color: #64748b;
                        font-weight: 600;
                        display: block;
                    }
                    .summary-card strong {
                        font-size: 14px;
                        color: #0f172a;
                        display: block;
                        margin-top: 2px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 20px;
                    }
                    th, td {
                        border: 1px solid #000;
                        padding: 6px;
                        text-align: center;
                        vertical-align: middle;
                        font-size: 8.5px;
                    }
                    th {
                        font-weight: bold;
                        background-color: #f1f5f9;
                    }
                    .left-align {
                        text-align: left;
                        padding-left: 6px;
                    }
                    .font-bold {
                        font-weight: bold;
                    }
                    .status-completada {
                        color: #15803d;
                    }
                    .status-cancelada {
                        color: #b91c1c;
                    }
                    .status-confirmada {
                        color: #1d4ed8;
                    }
                    .status-programada {
                        color: #b45309;
                    }
                    .signatures-container {
                        margin-top: 40px;
                        display: flex;
                        justify-content: flex-end;
                        padding-right: 20px;
                    }
                    .signature-box {
                        text-align: center;
                        width: 220px;
                    }
                    .signature-line {
                        border-top: 1.5px solid #000;
                        margin-bottom: 6px;
                        width: 100%;
                    }
                    @media print {
                        body {
                            background-color: transparent;
                            padding: 0;
                            margin: 0;
                            display: block;
                            min-height: auto;
                        }
                        .page-sheet {
                            width: 100%;
                            min-height: auto;
                            padding: 0;
                            box-shadow: none;
                            border-radius: 0;
                        }
                        body, table, th, td {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="page-sheet">
                    <div>
                        <header class="header">
                            <div style="width: 110px; display: flex; align-items: center;">
                                <img src="${logoBienestar}" alt="Bienestar Universitario UEB" style="max-height: 44px; width: auto; object-fit: contain;" />
                            </div>
                            <div class="header-title">
                                <h1>Universidad Estatal de Bolívar</h1>
                                <h2>Bienestar Estudiantil</h2>
                                <h3>Reporte de Citas de Psicología</h3>
                            </div>
                            <div class="date-box">
                                FECHA:<br>${formattedFecha}
                            </div>
                        </header>

                        <div class="summary-section">
                            <div class="summary-card">
                                <span>Total Citas</span>
                                <strong>${total}</strong>
                            </div>
                            <div class="summary-card">
                                <span>Completadas</span>
                                <strong class="status-completada">${completadas}</strong>
                            </div>
                            <div class="summary-card">
                                <span>Confirmadas</span>
                                <strong class="status-confirmada">${confirmadas}</strong>
                            </div>
                            <div class="summary-card">
                                <span>Programadas</span>
                                <strong class="status-programada">${programadas}</strong>
                            </div>
                            <div class="summary-card">
                                <span>Canceladas</span>
                                <strong class="status-cancelada">${canceladas}</strong>
                            </div>
                        </div>

                        <table>
                            <thead>
                                <tr>
                                    <th style="width: 25px;">N°</th>
                                    <th style="width: 150px;">Paciente</th>
                                    <th style="width: 75px;">Cédula</th>
                                    <th style="width: 70px;">Fecha</th>
                                    <th style="width: 85px;">Horario</th>
                                    <th>Motivo de Cita</th>
                                    <th style="width: 80px;">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tableRowsHtml}
                            </tbody>
                        </table>
                    </div>

                    <div class="signatures-container">
                        <div class="signature-box">
                            <div class="signature-line"></div>
                            <strong>Firma del Profesional Responsable</strong>
                            <p style="margin: 2px 0 0; font-size: 8.5px; color: #64748b;">Psicólogo Clínico</p>
                        </div>
                    </div>
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    useEffect(() => {
        if (activeTab === 'historial' && activeReportSubTab === 'citas') {
            fetchReportCitas();
        }
    }, [activeTab, activeReportSubTab, reportCitasFecha, reportCitasEstado]);

    // Appointments states
    const [citasList, setCitasList] = useState([]);
    const [citasLoading, setCitasLoading] = useState(false);
    const [citasDate, setCitasDate] = useState(new Date().toISOString().slice(0, 10));
    const [citasPage, setCitasPage] = useState(1);
    const CITAS_PER_PAGE = 12;
    const [completingCita, setCompletingCita] = useState(null);
    const [notasDoctor, setNotasDoctor] = useState('');
    const [savingNotas, setSavingNotas] = useState(false);

    const showSystemToast = (message) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 3400);
    };

    // ==========================================
    // BÚSQUEDA Y SELECCIÓN DE PACIENTES
    // ==========================================
    const handleModalSearch = async (e) => {
        if (e) e.preventDefault();
        const query = modalSearchCedula.trim();
        if (!query) return;

        setModalSearchLoading(true);
        setModalSearchError('');
        setModalSearchResults([]);

        try {
            const response = await api.get(`/users/search-by-cedula`, {
                params: { cedula: query }
            });
            const data = response.data.data;
            if (Array.isArray(data)) {
                setModalSearchResults(data);
                if (data.length === 0) setModalSearchError('Paciente no encontrado');
            } else if (data) {
                setModalSearchResults([data]);
            } else {
                setModalSearchError('Paciente no encontrado');
            }
        } catch (err) {
            console.error(err);
            setModalSearchError(err.response?.data?.message || 'Paciente no encontrado');
        } finally {
            setModalSearchLoading(false);
        }
    };

    const handleInputChange = async (val) => {
        setModalSearchCedula(val);
        const query = val.trim();
        if (!query) {
            setModalSearchResults([]);
            setModalSearchError('');
            return;
        }

        try {
            const response = await api.get(`/users/search-by-cedula`, {
                params: { cedula: query }
            });
            const data = response.data.data;
            if (Array.isArray(data)) {
                setModalSearchResults(data);
            } else if (data) {
                setModalSearchResults([data]);
            } else {
                setModalSearchResults([]);
            }
        } catch (err) {
            console.error(err);
            setModalSearchResults([]);
        }
    };

    // Registro rápido de paciente
    const handleEmailBlur = () => {
        if (newPatientForm.correo && !newPatientForm.correo.includes('@')) {
            setNewPatientForm(prev => ({
                ...prev,
                correo: `${prev.correo.trim()}@ueb.edu.ec`
            }));
        }
    };

    const handleQuickRegisterPatient = async (e) => {
        e.preventDefault();
        setRegisterLoading(true);
        setRegisterError('');

        try {
            let finalEmail = newPatientForm.correo.trim();
            if (finalEmail && !finalEmail.includes('@')) {
                finalEmail = `${finalEmail}@ueb.edu.ec`;
            }

            const response = await api.post('/users/register-patient', {
                email: finalEmail,
                cedula: newPatientForm.cedula,
                nombre_completo: newPatientForm.nombre_completo,
                tipo_documento: newPatientForm.tipo_documento,
                pais_origen: newPatientForm.pais_origen,
                id_tipo_usuario: parseInt(newPatientForm.id_tipo_usuario || 2)
            });

            const patientData = response.data.data;

            setSelectedPatient(patientData);
            setIsPatientRegisterOpen(false);
            showSystemToast('Paciente registrado correctamente. Se ha enviado su contraseña temporal por correo.');

            if (activeTab === 'ficha') {
                openFichaFormFor(patientData);
            }
        } catch (err) {
            console.error(err);
            setRegisterError(err.response?.data?.message || 'Error al registrar. Verifica el correo institucional.');
        } finally {
            setRegisterLoading(false);
        }
    };

    const handleSelectPatient = async (patient, forceOpenModal = false) => {
        setSelectedPatient(patient);
        setIsPatientSearchOpen(false);
        setModalSearchCedula('');
        setModalSearchResults([]);
        showSystemToast(`Paciente seleccionado: ${patient.nombre_completo || patient.name || 'Paciente'}`);

        // Si la pestaña activa es evolución o historial, solo seleccionamos el paciente para consultar sus registros
        if ((activeTab === 'evolucion' || activeTab === 'historial') && !forceOpenModal) {
            return;
        }

        setActiveTab('ficha');
        openFichaFormFor(patient);

        const pId = patient.id_usuario || patient.id;
        if (pId) {
            try {
                await api.post('/citas-medicas/atender-paciente', {
                    id_usuario_paciente: pId,
                    rol_doctor: 'psicologo',
                    motivo: 'Atención en Psicología'
                });
                fetchCitasDoctor();
            } catch (err) {
                console.error("Error al auto-sincronizar cita:", err);
            }
        }
    };

    const openFichaFormFor = (patient) => {
        setSelectedPatient(patient);
        setIsFichaModalOpen(true);
    };

    // Cargar la Ficha Clínica completa del Paciente Seleccionado
    useEffect(() => {
        if (selectedPatient) {
            const patientId = selectedPatient.id_usuario || selectedPatient.id;
            setActiveBookArea('psicologia');
            setActiveBookRecord(null);
            fetchPatientFicha(patientId);
            fetchEvoluciones(patientId);
            fetchPatientHistoryByArea(patientId);
        } else {
            resetFichaForm();
            setEvolucionList([]);
            setActiveBookArea('psicologia');
            setActiveBookRecord(null);
            setAreaHistories({ psicologia: [] });
        }
    }, [selectedPatient]);

    const resetFichaForm = () => {
        setFichaRawData({
            motivo: null,
            psico_personal: null,
            psico_familiar: null,
            laboral: null,
            social: null,
            sexual: null,
            patologia: null,
            mental: null,
            pruebas: null,
            analisis: null,
            conclusion: null,
            diagnostico: null,
            pronostico: null,
            recomendacion: null,
            parte_diario: null
        });
        setFichaForm({
            detalle_motivo: '',
            psicoanamnesis_personal: '',
            psicoanamnesis_familiar: '',
            detalle_laboral: '',
            detalle_social: '',
            detalle_sexual: '',
            detalle_patologia: '',
            apariencia: '',
            actitud: '',
            juicio: '',
            sueno: '',
            apetito: '',
            afectividad: '',
            orientacion: '',
            atencion: '',
            memoria: '',
            lenguaje: '',
            pensamiento: '',
            conducta_motora: '',
            detalle_prueba_aplicada: '',
            detalle_analisis_resultados: '',
            detalle_conclusion: '',
            detalle_diagnostico: '',
            detalle_pronostico: '',
            detalle_recomendacion: '',
            tipo_atencion: 'primaria',
            tipo_atencion2: 'curativo'
        });
        setValidationTriggered(false);
    };

    const getInputStyle = (value) => {
        const isEmpty = !value || (typeof value === 'string' && value.trim() === '');
        if (validationTriggered && isEmpty) {
            return {
                borderColor: '#dc2626',
                boxShadow: '0 0 0 1px rgba(220, 38, 38, 0.25)',
                backgroundColor: 'rgba(220, 38, 38, 0.01)',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
            };
        }
        return {
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
        };
    };

    const fetchPatientFicha = async (patientId) => {
        setFichaLoading(true);
        try {
            // Always start completely clean so that every new consultation
            // creates fresh records (POST) instead of overwriting existing ones (PUT).
            setFichaRawData({
                motivo: null,
                psico_personal: null,
                psico_familiar: null,
                laboral: null,
                social: null,
                sexual: null,
                patologia: null,
                mental: null,
                pruebas: null,
                analisis: null,
                conclusion: null,
                diagnostico: null,
                pronostico: null,
                recomendacion: null,
                parte_diario: null
            });

            // Fetch prior history to auto-fill the form
            let priorPersonalAnamnesis = '';
            let priorFamiliarAnamnesis = '';
            let priorLaboral = '';
            let priorSocial = '';
            let priorPatologia = '';

            try {
                const [psicoRes, laboralRes, socialRes, patologiaRes] = await Promise.all([
                    api.get('/psicologia/psicoanamnesis', { params: { id_usuario_paciente: patientId } }).catch(() => ({ data: { data: [] } })),
                    api.get('/psicologia/historial-laboral', { params: { id_usuario_paciente: patientId } }).catch(() => ({ data: { data: [] } })),
                    api.get('/psicologia/historial-social', { params: { id_usuario_paciente: patientId } }).catch(() => ({ data: { data: [] } })),
                    api.get('/psicologia/patologias', { params: { id_usuario_paciente: patientId } }).catch(() => ({ data: { data: [] } }))
                ]);

                const psicoList = psicoRes.data.data || [];
                const personalItem = psicoList.find(item => item.tipo === 'personal');
                const familiarItem = psicoList.find(item => item.tipo === 'familiar');
                if (personalItem) priorPersonalAnamnesis = personalItem.detalle_psicoanamnesis || '';
                if (familiarItem) priorFamiliarAnamnesis = familiarItem.detalle_psicoanamnesis || '';

                const laboralList = laboralRes.data.data || [];
                if (laboralList.length > 0) priorLaboral = laboralList[0].detalle_laboral || '';

                const socialList = socialRes.data.data || [];
                if (socialList.length > 0) priorSocial = socialList[0].detalle_social || '';

                const patologiaList = patologiaRes.data.data || [];
                if (patologiaList.length > 0) priorPatologia = patologiaList[0].detalle_patologia || '';
            } catch (errHistory) {
                console.error("Error fetching prior patient history:", errHistory);
            }

            const initialFormState = {
                detalle_motivo: '',
                psicoanamnesis_personal: priorPersonalAnamnesis,
                psicoanamnesis_familiar: priorFamiliarAnamnesis,
                detalle_laboral: priorLaboral,
                detalle_social: priorSocial,
                detalle_sexual: '',
                detalle_patologia: priorPatologia,
                apariencia: '',
                actitud: '',
                juicio: '',
                sueno: '',
                apetito: '',
                afectividad: '',
                orientacion: '',
                atencion: '',
                memoria: '',
                lenguaje: '',
                pensamiento: '',
                conducta_motora: '',
                detalle_prueba_aplicada: '',
                detalle_analisis_resultados: '',
                detalle_conclusion: '',
                detalle_diagnostico: '',
                detalle_pronostico: '',
                detalle_recomendacion: '',
                tipo_atencion: 'primaria',
                tipo_atencion2: 'curativo'
            };

            const savedDraft = loadDraft();
            if (savedDraft?.formData) {
                setFichaForm({ ...initialFormState, ...savedDraft.formData });
                showSystemToast("Borrador psicológico no guardado recuperado automáticamente.");
            } else {
                setFichaForm(initialFormState);
            }
        } catch (err) {
            console.error("Error al cargar la ficha clínica:", err);
            showSystemToast("Error al cargar los datos clínicos del paciente.");
        } finally {
            setFichaLoading(false);
        }
    };

    // Auto-save form draft to localStorage
    useEffect(() => {
        if (selectedPatient && fichaForm) {
            saveDraft(fichaForm);
        }
    }, [fichaForm, selectedPatient, saveDraft]);

    const saveAutomaticParteDiario = async (patientId) => {
        const today = new Date().toISOString().slice(0, 10);
        const dailyPayload = {
            id_usuario_paciente: patientId,
            fecha: today,
            tipo_atencion: fichaForm.tipo_atencion || 'primaria',
            tipo_atencion2: fichaForm.tipo_atencion2 || 'curativo',
            detalle_diagnostico: fichaForm.detalle_diagnostico.trim() !== ''
                ? fichaForm.detalle_diagnostico
                : (fichaForm.detalle_motivo.trim() !== '' ? fichaForm.detalle_motivo : 'Valoración clínica / Anamnesis')
        };

        try {
            if (fichaRawData.parte_diario) {
                await api.put(`/psicologia/parte-diario/${fichaRawData.parte_diario.id}`, dailyPayload);
            } else {
                const res = await api.post('/psicologia/parte-diario', dailyPayload);
                setFichaRawData(prev => ({ ...prev, parte_diario: res.data.data }));
            }
        } catch (err) {
            console.error("Error al registrar parte diario automático:", err);
        }
    };

    const handleSaveFichaSection = async (sectionKey) => {
        if (!selectedPatient) return false;
        setFichaSaving(true);

        const patientId = selectedPatient.id_usuario || selectedPatient.id;

        // Validation check for mandatory fields per section
        let hasErrors = false;
        if (sectionKey === 'motivo') {
            if (!fichaForm.detalle_motivo?.trim()) {
                hasErrors = true;
            }
        } else if (sectionKey === 'historiales') {
            // Section 2 fields are optional if patient doesn't present them
            // Only error if every single field is empty
            if (!fichaForm.detalle_laboral?.trim() && !fichaForm.detalle_social?.trim() && !fichaForm.detalle_sexual?.trim() && !fichaForm.detalle_patologia?.trim()) {
                hasErrors = false;
            }
        } else if (sectionKey === 'diagnostico') {
            if (!fichaForm.detalle_diagnostico?.trim()) {
                hasErrors = true;
            }
        }

        if (hasErrors) {
            setValidationTriggered(true);
            setFichaSaving(false);
            showSystemToast("Por favor complete todos los campos obligatorios marcados en rojo.");
            return false;
        }

        try {
            if (sectionKey === 'motivo') {
                // Motivo de Consulta
                if (fichaForm.detalle_motivo.trim() !== '') {
                    if (fichaRawData.motivo) {
                        await api.put(`/psicologia/motivo-consulta/${fichaRawData.motivo.id}`, { detalle_motivo: fichaForm.detalle_motivo });
                    } else {
                        const res = await api.post('/psicologia/motivo-consulta', { id_usuario_paciente: patientId, detalle_motivo: fichaForm.detalle_motivo });
                        setFichaRawData(prev => ({ ...prev, motivo: res.data.data }));
                    }
                }

                // Psicoanamnesis Personal (Siempre actualiza el existente de este paciente)
                if (fichaForm.psicoanamnesis_personal.trim() !== '') {
                    if (fichaRawData.psico_personal) {
                        const res = await api.put(`/psicologia/psicoanamnesis/${fichaRawData.psico_personal.id}`, { detalle_psicoanamnesis: fichaForm.psicoanamnesis_personal, tipo: 'personal' });
                        setFichaRawData(prev => ({ ...prev, psico_personal: res.data.data }));
                    } else {
                        const res = await api.post('/psicologia/psicoanamnesis', { id_usuario_paciente: patientId, detalle_psicoanamnesis: fichaForm.psicoanamnesis_personal, tipo: 'personal' });
                        setFichaRawData(prev => ({ ...prev, psico_personal: res.data.data }));
                    }
                }

                // Psicoanamnesis Familiar (Siempre actualiza el existente de este paciente)
                if (fichaForm.psicoanamnesis_familiar.trim() !== '') {
                    if (fichaRawData.psico_familiar) {
                        const res = await api.put(`/psicologia/psicoanamnesis/${fichaRawData.psico_familiar.id}`, { detalle_psicoanamnesis: fichaForm.psicoanamnesis_familiar, tipo: 'familiar' });
                        setFichaRawData(prev => ({ ...prev, psico_familiar: res.data.data }));
                    } else {
                        const res = await api.post('/psicologia/psicoanamnesis', { id_usuario_paciente: patientId, detalle_psicoanamnesis: fichaForm.psicoanamnesis_familiar, tipo: 'familiar' });
                        setFichaRawData(prev => ({ ...prev, psico_familiar: res.data.data }));
                    }
                }
            }

            if (sectionKey === 'historiales') {
                // Laboral (Siempre actualiza el existente)
                if (fichaForm.detalle_laboral.trim() !== '') {
                    if (fichaRawData.laboral) {
                        await api.put(`/psicologia/historial-laboral/${fichaRawData.laboral.id}`, { detalle_laboral: fichaForm.detalle_laboral });
                    } else {
                        const res = await api.post('/psicologia/historial-laboral', { id_usuario_paciente: patientId, detalle_laboral: fichaForm.detalle_laboral });
                        setFichaRawData(prev => ({ ...prev, laboral: res.data.data }));
                    }
                }
                // Social (Siempre actualiza el existente)
                if (fichaForm.detalle_social.trim() !== '') {
                    if (fichaRawData.social) {
                        await api.put(`/psicologia/historial-social/${fichaRawData.social.id}`, { detalle_social: fichaForm.detalle_social });
                    } else {
                        const res = await api.post('/psicologia/historial-social', { id_usuario_paciente: patientId, detalle_social: fichaForm.detalle_social });
                        setFichaRawData(prev => ({ ...prev, social: res.data.data }));
                    }
                }
                // Sexual (Siempre actualiza el existente)
                if (fichaForm.detalle_sexual.trim() !== '') {
                    if (fichaRawData.sexual) {
                        await api.put(`/psicologia/historial-sexual/${fichaRawData.sexual.id}`, { detalle_sexual: fichaForm.detalle_sexual });
                    } else {
                        const res = await api.post('/psicologia/historial-sexual', { id_usuario_paciente: patientId, detalle_sexual: fichaForm.detalle_sexual });
                        setFichaRawData(prev => ({ ...prev, sexual: res.data.data }));
                    }
                }
                // Patología (Siempre actualiza el existente)
                if (fichaForm.detalle_patologia.trim() !== '') {
                    if (fichaRawData.patologia) {
                        await api.put(`/psicologia/patologias/${fichaRawData.patologia.id}`, { detalle_patologia: fichaForm.detalle_patologia });
                    } else {
                        const res = await api.post('/psicologia/patologias', { id_usuario_paciente: patientId, detalle_patologia: fichaForm.detalle_patologia });
                        setFichaRawData(prev => ({ ...prev, patologia: res.data.data }));
                    }
                }
            }

            if (sectionKey === 'mental') {
                const payload = {
                    id_usuario_paciente: patientId,
                    apariencia: fichaForm.apariencia,
                    actitud: fichaForm.actitud,
                    juicio: fichaForm.juicio,
                    sueno: fichaForm.sueno,
                    apetito: fichaForm.apetito,
                    afectividad: fichaForm.afectividad,
                    orientacion: fichaForm.orientacion,
                    atencion: fichaForm.atencion,
                    memoria: fichaForm.memoria,
                    lenguaje: fichaForm.lenguaje,
                    pensamiento: fichaForm.pensamiento,
                    conducta_motora: fichaForm.conducta_motora
                };
                if (fichaRawData.mental) {
                    await api.put(`/psicologia/examen-estado-mental/${fichaRawData.mental.id}`, payload);
                } else {
                    const res = await api.post('/psicologia/examen-estado-mental', payload);
                    setFichaRawData(prev => ({ ...prev, mental: res.data.data }));
                }
            }

            if (sectionKey === 'pruebas') {
                // Pruebas aplicadas
                if (fichaForm.detalle_prueba_aplicada.trim() !== '') {
                    if (fichaRawData.pruebas) {
                        await api.put(`/psicologia/pruebas-aplicadas/${fichaRawData.pruebas.id}`, { detalle_prueba_aplicada: fichaForm.detalle_prueba_aplicada });
                    } else {
                        const res = await api.post('/psicologia/pruebas-aplicadas', { id_usuario_paciente: patientId, detalle_prueba_aplicada: fichaForm.detalle_prueba_aplicada });
                        setFichaRawData(prev => ({ ...prev, pruebas: res.data.data }));
                    }
                }
                // Análisis
                if (fichaForm.detalle_analisis_resultados.trim() !== '') {
                    if (fichaRawData.analisis) {
                        await api.put(`/psicologia/analisis-resultados/${fichaRawData.analisis.id}`, { detalle_analisis_resultados: fichaForm.detalle_analisis_resultados });
                    } else {
                        const res = await api.post('/psicologia/analisis-resultados', { id_usuario_paciente: patientId, detalle_analisis_resultados: fichaForm.detalle_analisis_resultados });
                        setFichaRawData(prev => ({ ...prev, analisis: res.data.data }));
                    }
                }
            }

            if (sectionKey === 'diagnostico') {
                // Conclusion
                if (fichaForm.detalle_conclusion.trim() !== '') {
                    if (fichaRawData.conclusion) {
                        await api.put(`/psicologia/conclusiones/${fichaRawData.conclusion.id}`, { detalle_conclusion: fichaForm.detalle_conclusion });
                    } else {
                        const res = await api.post('/psicologia/conclusiones', { id_usuario_paciente: patientId, detalle_conclusion: fichaForm.detalle_conclusion });
                        setFichaRawData(prev => ({ ...prev, conclusion: res.data.data }));
                    }
                }
                // Diagnóstico
                if (fichaForm.detalle_diagnostico.trim() !== '') {
                    if (fichaRawData.diagnostico) {
                        await api.put(`/psicologia/diagnostico/${fichaRawData.diagnostico.id}`, { detalle_diagnostico: fichaForm.detalle_diagnostico });
                    } else {
                        const res = await api.post('/psicologia/diagnostico', { id_usuario_paciente: patientId, detalle_diagnostico: fichaForm.detalle_diagnostico });
                        setFichaRawData(prev => ({ ...prev, diagnostico: res.data.data }));
                    }
                }
                // Pronóstico
                if (fichaForm.detalle_pronostico.trim() !== '') {
                    if (fichaRawData.pronostico) {
                        await api.put(`/psicologia/pronostico/${fichaRawData.pronostico.id}`, { detalle_pronostico: fichaForm.detalle_pronostico });
                    } else {
                        const res = await api.post('/psicologia/pronostico', { id_usuario_paciente: patientId, detalle_pronostico: fichaForm.detalle_pronostico });
                        setFichaRawData(prev => ({ ...prev, pronostico: res.data.data }));
                    }
                }
                // Recomendación
                if (fichaForm.detalle_recomendacion.trim() !== '') {
                    if (fichaRawData.recomendacion) {
                        await api.put(`/psicologia/recomendacion/${fichaRawData.recomendacion.id}`, { detalle_recomendacion: fichaForm.detalle_recomendacion });
                    } else {
                        const res = await api.post('/psicologia/recomendacion', { id_usuario_paciente: patientId, detalle_recomendacion: fichaForm.detalle_recomendacion });
                        setFichaRawData(prev => ({ ...prev, recomendacion: res.data.data }));
                    }
                }

            }

            // Registrar/Actualizar automáticamente el parte diario de la atención en base a lo que se guardó
            await saveAutomaticParteDiario(patientId);

            clearDraft();
            showSystemToast("¡Sección guardada correctamente!");
            return true;
        } catch (err) {
            console.error("Error al guardar la sección:", err);
            const errMsg = err.response?.data?.message || err.response?.statusText || err.message || "Error desconocido";
            showSystemToast(`Error al guardar: ${errMsg}`);
            return false;
        } finally {
            setFichaSaving(false);
        }
    };

    // Cierre del Formulario
    const handleCloseFichaForm = () => {
        setIsFichaModalOpen(false);
        setSelectedPatient(null);
        setCurrentStepIndex(0);
        resetFichaForm();
    };

    const handleCancelFicha = () => {
        setConfirmModal({
            show: true,
            title: '¿Cancelar consulta?',
            message: '¿Está seguro de que desea cancelar la atención actual? Se perderán todos los datos no guardados de esta consulta.',
            onConfirm: () => {
                handleCloseFichaForm();
                showSystemToast('Atención cancelada. Los datos fueron descartados.');
            }
        });
    };

    // ==========================================
    // 2. PARTE DIARIO (CONSULTAS DEL DÍA)
    // ==========================================
    const fetchParteDiario = async () => {
        setParteDiarioLoading(true);
        try {
            const response = await api.get('/psicologia/parte-diario');
            // Filtrar del lado del cliente por fecha (comparando solo la fecha YYYY-MM-DD)
            const filtered = response.data.data.filter(item => {
                const itemDate = item.fecha ? item.fecha.slice(0, 10) : '';
                return itemDate === parteDiarioDate;
            });
            setParteDiarioList(filtered);

            // Precargar perfiles de los pacientes en el parte diario
            const patientIds = [...new Set(filtered.map(item => item.id_usuario_paciente || item.paciente?.id).filter(Boolean))];
            if (patientIds.length > 0) {
                const profiles = await Promise.all(
                    patientIds.map(async (pId) => {
                        try {
                            const res = await api.get(`/psicologia/pacientes/${pId}/perfil`);
                            return { id: pId, data: res.data.data };
                        } catch (e) {
                            console.error('Error precargando perfil para parte diario:', pId, e);
                            return { id: pId, data: null };
                        }
                    })
                );

                setPatientProfilesCache(prev => {
                    const next = { ...prev };
                    profiles.forEach(p => {
                        if (p.data) {
                            next[p.id] = p.data;
                        }
                    });
                    return next;
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setParteDiarioLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'diario') {
            fetchParteDiario();
        }
    }, [activeTab, parteDiarioDate]);

    const handlePrintParteDiario = async () => {
        if (parteDiarioList.length === 0) {
            showSystemToast('No hay atenciones en esta fecha para generar el reporte.');
            return;
        }

        // Cargar los perfiles completos de cada paciente en paralelo desde la API existente (para no tocar el backend)
        let detailedList = [];
        try {
            showSystemToast('Cargando datos detallados de los pacientes...');
            detailedList = await Promise.all(
                parteDiarioList.map(async (item) => {
                    try {
                        const res = await api.get(`/psicologia/pacientes/${item.id_usuario_paciente}/perfil`);
                        return { ...item, paciente: res.data.data };
                    } catch (e) {
                        console.error('Error al cargar perfil de paciente:', item.id_usuario_paciente, e);
                        return item;
                    }
                })
            );
        } catch (err) {
            console.error('Error al cargar datos detallados del diario:', err);
            detailedList = parteDiarioList;
        }

        let sumHombre = 0;
        let sumMujer = 0;
        let sumLgbti = 0;
        let sumEstudiante = 0;
        let sumDocente = 0;
        let sumAdministrativo = 0;
        let sumPrimera = 0;
        let sumSubsecuente = 0;
        let sumCertificado = 0;
        const tableRowsHtml = detailedList.map((item, idx) => {
            const pIdent = item.paciente?.datos_identificacion || item.paciente?.datosIdentificacion || item.paciente?.identification || {};
            const primerNombre = pIdent.primer_nombre || '';
            const segundoNombre = pIdent.segundo_nombre || '';
            const apellidoPaterno = pIdent.apellido_paterno || '';
            const apellidoMaterno = pIdent.apellido_materno || '';
            const fullName = `${primerNombre} ${segundoNombre} ${apellidoPaterno} ${apellidoMaterno}`.trim() || item.paciente?.name || item.paciente?.email || '—';
            const cedula = pIdent.numero_cedula || 'Sin perfil';

            let age = '—';
            if (pIdent.fecha_nacimiento) {
                const birth = new Date(pIdent.fecha_nacimiento);
                const diff = Date.now() - birth.getTime();
                const ageDate = new Date(diff);
                age = Math.abs(ageDate.getUTCFullYear() - 1970);
            }

            let disability = '';
            const disList = item.paciente?.disabilities || item.paciente?.discapacidades || [];
            if (Array.isArray(disList) && disList.length > 0) {
                disability = disList.map(d => d.detalle_discapacidad || d.nombre || 'Sí').join(', ');
            } else if (item.paciente?.autopercepcion?.discapacidad || item.paciente?.demographic?.discapacidad) {
                disability = item.paciente?.autopercepcion?.discapacidad || item.paciente?.demographic?.discapacidad;
            }

            const demo = item.paciente?.autopercepcion || item.paciente?.demographic || {};
            const genderObj = demo?.genero || {};
            const genderName = (genderObj?.nombre || '').toLowerCase();
            let isMale = false;
            let isFemale = false;
            let isLgbti = false;

            if (genderName.includes('masc') || genderName.includes('homb') || genderName === 'h') {
                isMale = true;
                sumHombre++;
            } else if (genderName.includes('fem') || genderName.includes('muj') || genderName === 'm') {
                isFemale = true;
                sumMujer++;
            } else if (genderName.includes('lgbt') || genderName.includes('otro') || genderName.includes('diver')) {
                isLgbti = true;
                sumLgbti++;
            }

            const estudio = item.paciente?.estudio_carrera || item.paciente?.estudioCarrera || item.paciente?.career_study;
            const tipoUsuarioObj = estudio?.tipo_usuario || estudio?.tipoUsuario || {};
            const tipoUsuarioNombre = (tipoUsuarioObj?.nombre || '').toLowerCase();
            const userTypeVal = item.paciente?.id_tipo_usuario || estudio?.id_tipo_usuario;

            let isEstudiante = false;
            let isDocente = false;
            let isAdministrativo = false;

            if (tipoUsuarioNombre.includes('estud') || userTypeVal === 1 || (estudio && !tipoUsuarioNombre.includes('docen') && !tipoUsuarioNombre.includes('admin') && !tipoUsuarioNombre.includes('trabaj'))) {
                isEstudiante = true;
                sumEstudiante++;
            } else if (tipoUsuarioNombre.includes('docen') || userTypeVal === 2) {
                isDocente = true;
                sumDocente++;
            } else if (tipoUsuarioNombre.includes('admin') || tipoUsuarioNombre.includes('trabaj') || tipoUsuarioNombre.includes('serv') || userTypeVal === 3) {
                isAdministrativo = true;
                sumAdministrativo++;
            }

            const careerName = isEstudiante ? (estudio?.carrera?.nombre || '—') : '—';

            let isPrimera = false;
            let isSubsecuente = false;
            let isCertificado = false;

            if (item.tipo_atencion === 'primaria') {
                isPrimera = true;
                sumPrimera++;
            } else if (item.tipo_atencion === 'secundaria') {
                isSubsecuente = true;
                sumSubsecuente++;
            } else if (item.tipo_atencion === 'certificadomedico') {
                isCertificado = true;
                sumCertificado++;
            }

            return `
                <tr>
                    <td>${idx + 1}</td>
                    <td class="left-align font-bold">${fullName}</td>
                    <td>${cedula}</td>
                    <td>${age}</td>
                    <td>${disability || '—'}</td>
                    <td>${isMale ? 'X' : ''}</td>
                    <td>${isFemale ? 'X' : ''}</td>
                    <td>${isLgbti ? 'X' : ''}</td>
                    <td>${isEstudiante ? 'X' : ''}</td>
                    <td class="left-align">${careerName}</td>
                    <td>${isDocente ? 'X' : ''}</td>
                    <td>${isAdministrativo ? 'X' : ''}</td>
                    <td>${isPrimera ? 'X' : ''}</td>
                    <td>${isSubsecuente ? 'X' : ''}</td>
                    <td>${isCertificado ? 'X' : ''}</td>
                    <td class="left-align">${item.detalle_diagnostico || '—'}</td>
                </tr>
            `;
        }).join('');

        // Rellenar con filas vacías para completar la grilla visual (hasta 15 filas)
        const emptyRowsCount = Math.max(0, 15 - detailedList.length);
        let emptyRowsHtml = '';
        for (let i = 0; i < emptyRowsCount; i++) {
            emptyRowsHtml += `
                <tr>
                    <td>${detailedList.length + i + 1}</td>
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
                    <td></td>
                </tr>
            `;
        }

        const formattedDate = new Date(parteDiarioDate + 'T00:00:00').toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <title>Parte Diario de Psicología - ${formattedDate}</title>
                <style>
                    @page {
                        size: A4 landscape;
                        margin: 10mm;
                    }
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
                        padding: 15mm;
                        box-sizing: border-box;
                        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                        border-radius: 8px;
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;
                    }
                    .header {
                        display: flex;
                        align-items: center;
                        border-bottom: 2px solid #000;
                        padding-bottom: 5px;
                        margin-bottom: 12px;
                    }
                    .header-title {
                        text-align: center;
                        flex-grow: 1;
                    }
                    .header-title h1 {
                        font-size: 13px;
                        margin: 0 0 1px 0;
                        text-transform: uppercase;
                        font-weight: bold;
                        color: #000;
                    }
                    .header-title h2 {
                        font-size: 11px;
                        margin: 0 0 1px 0;
                        font-weight: 500;
                        color: #444;
                        text-transform: uppercase;
                    }
                    .header-title h3 {
                        font-size: 11px;
                        margin: 0;
                        font-weight: bold;
                        color: #000;
                        letter-spacing: 0.5px;
                    }
                    .date-box {
                        border: 1px solid #000;
                        padding: 4px 8px;
                        font-weight: bold;
                        font-size: 10px;
                        background-color: #f3f4f6;
                        text-align: center;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 15px;
                    }
                    th, td {
                        border: 1px solid #000;
                        padding: 3px;
                        text-align: center;
                        vertical-align: middle;
                    }
                    th {
                        font-weight: bold;
                        font-size: 8px;
                    }
                    /* Colores de cabeceras según el formato físico */
                    .th-num { width: 25px; background-color: #ffedd5 !important; }
                    .th-nombres { width: 160px; background-color: #fef9c3 !important; }
                    .th-cedula { width: 70px; background-color: #dcfce7 !important; }
                    .th-edad { width: 30px; background-color: #fce7f3 !important; }
                    .th-discapacidad { width: 90px; background-color: #dbeafe !important; }
                    .th-genero { background-color: #fef08a !important; }
                    .th-comunidad { background-color: #dbeafe !important; }
                    .th-atencion { background-color: #ffedd5 !important; }
                    .th-diag { width: 260px; background-color: #dcfce7 !important; }
                    .sub-header th {
                        background-color: #ffffff !important;
                        font-size: 7.5px;
                        font-weight: bold;
                    }
                    .left-align {
                        text-align: left;
                        padding-left: 5px;
                    }
                    .font-bold {
                        font-weight: bold;
                    }
                    .bg-totals {
                        background-color: #fef9c3 !important;
                        font-weight: bold;
                    }
                    .signatures-container {
                        margin-top: 25px;
                        display: flex;
                        justify-content: flex-end;
                        padding-right: 50px;
                    }
                    .signature-box {
                        text-align: center;
                        width: 240px;
                    }
                    .signature-line {
                        border-top: 1.5px solid #000;
                        margin-bottom: 4px;
                        width: 100%;
                    }
                    @media print {
                        body {
                            background-color: transparent;
                            padding: 0;
                            margin: 0;
                            display: block;
                            min-height: auto;
                        }
                        .page-sheet {
                            width: 100%;
                            min-height: auto;
                            padding: 0;
                            box-shadow: none;
                            border-radius: 0;
                        }
                        body, table, th, td {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="page-sheet">
                    <div>
                        <header class="header">
                            <div style="width: 110px; display: flex; align-items: center;">
                                <img src="${logoBienestar}" alt="Bienestar Universitario UEB" style="max-height: 44px; width: auto; object-fit: contain;" />
                            </div>
                            <div class="header-title">
                                <h1>Universidad Estatal de Bolívar</h1>
                                <h2>Bienestar Estudiantil</h2>
                                <h3>Psicología</h3>
                            </div>
                            <div class="date-box">
                                FECHA:<br>${formattedDate}
                            </div>
                        </header>

                        <table>
                            <thead>
                                <tr>
                                    <th rowspan="2" class="th-num">N.-</th>
                                    <th rowspan="2" class="th-nombres">NOMBRES Y APELLIDOS</th>
                                    <th rowspan="2" class="th-cedula">NÚMERO DE CÉDULA</th>
                                    <th rowspan="2" class="th-edad">Edad</th>
                                    <th rowspan="2" class="th-discapacidad">Discapacidad</th>
                                    <th colspan="3" class="th-genero">GÉNERO</th>
                                    <th colspan="4" class="th-comunidad">COMUNIDAD UNIVERSITARIA</th>
                                    <th colspan="3" class="th-atencion">TIPO ATENCIÓN</th>
                                    <th rowspan="2" class="th-diag">DIAGNÓSTICO</th>
                                </tr>
                                <tr class="sub-header">
                                    <th style="width: 20px;">H</th>
                                    <th style="width: 20px;">M</th>
                                    <th style="width: 25px;">LGBTI</th>
                                    <th style="width: 20px;">EST.</th>
                                    <th style="width: 100px;">CARRERA</th>
                                    <th style="width: 20px;">DOC.</th>
                                    <th style="width: 20px;">ADM.</th>
                                    <th style="width: 20px;">1RA</th>
                                    <th style="width: 20px;">SUB.</th>
                                    <th style="width: 20px;">CERT.</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tableRowsHtml}
                                ${emptyRowsHtml}
                                <tr class="bg-totals">
                                    <td colspan="5" class="left-align font-bold">TOTAL</td>
                                    <td>${sumHombre}</td>
                                    <td>${sumMujer}</td>
                                    <td>${sumLgbti}</td>
                                    <td>${sumEstudiante}</td>
                                    <td></td>
                                    <td>${sumDocente}</td>
                                    <td>${sumAdministrativo}</td>
                                    <td>${sumPrimera}</td>
                                    <td>${sumSubsecuente}</td>
                                    <td>${sumCertificado}</td>
                                    <td></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="signatures-container">
                        <div class="signature-box">
                            <div class="signature-line"></div>
                            <strong>Psicólogo/a: ${user?.name || 'Profesional Responsable'}</strong><br>
                            <span>Responsable de Bienestar Estudiantil</span>
                        </div>
                    </div>
                </div>

                <script>
                    window.onload = function() {
                        window.print();
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    // ==========================================
    // 3. SESIONES DE EVOLUCIÓN (SEGUIMIENTO)
    // ==========================================
    const fetchEvoluciones = async (patientId) => {
        setEvolucionLoading(true);
        try {
            const res = await api.get('/psicologia/historial-evolucion', {
                params: { id_usuario_paciente: patientId }
            });
            setEvolucionList(res.data.data);
            if (res.data.data.length > 0) {
                setEvolucionForm(prev => ({ ...prev, sesion_numero: res.data.data.length + 1 }));
            } else {
                setEvolucionForm(prev => ({ ...prev, sesion_numero: 1 }));
            }
        } catch (err) {
            console.error("Error al cargar evoluciones:", err);
        } finally {
            setEvolucionLoading(false);
        }
    };

    const fetchPatientHistoryByArea = async (patientId) => {
        setAreaHistoriesLoading(true);
        try {
            const [evolRes, diarioRes] = await Promise.all([
                api.get('/psicologia/historial-evolucion', { params: { id_usuario_paciente: patientId } }),
                api.get('/psicologia/parte-diario', { params: { id_usuario_paciente: patientId } })
            ]);
            const mappedEvol = (evolRes.data.data || []).map(item => ({
                ...item,
                type: 'evolucion',
                recordTitle: `Evolución Sesión #${item.sesion_numero}`,
                tipo_atencion: item.tipo_atencion || (Number(item.sesion_numero) > 1 ? 'secundaria' : 'primaria'),
                fecha: item.fecha ? item.fecha.slice(0, 10) : ''
            }));
            const mappedDiario = (diarioRes.data.data || []).map(item => ({
                ...item,
                type: 'diario',
                recordTitle: 'Atención Diario Psicología',
                tipo_atencion: item.tipo_atencion || 'primaria',
                fecha: item.fecha ? item.fecha.slice(0, 10) : ''
            }));

            // Evitar duplicados automáticos entre historial-evolución y parte-diario
            const seenKeys = new Set();
            const uniqueRecords = [];
            mappedEvol.forEach(item => {
                seenKeys.add(`${item.fecha}_${item.sesion_numero}`);
                uniqueRecords.push(item);
            });
            mappedDiario.forEach(item => {
                const match = item.detalle_diagnostico && item.detalle_diagnostico.match(/Sesión de evolución N°\s*(\d+)/i);
                if (match && seenKeys.has(`${item.fecha}_${match[1]}`)) {
                    return; // Ya representado con más detalle en mappedEvol
                }
                uniqueRecords.push(item);
            });

            const combined = uniqueRecords.sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
            setAreaHistories({ psicologia: combined });
        } catch (err) {
            console.error("Error al cargar historial por área:", err);
        } finally {
            setAreaHistoriesLoading(false);
        }
    };

    // Algoritmo clínico para agrupar citas en Ciclos de Tratamiento:
    // 1. Atención "Primaria (Primera Vez)" inicia un tratamiento (y cierra el anterior si estaba activo).
    // 2. Atención "Secundaria (Subsecuente / Evolución)" continúa el tratamiento activo.
    // 3. Cuando ocurre otra "Primaria", el tratamiento previo se cierra automáticamente y se inicia uno nuevo.
    const processCitasAndTreatments = (records = []) => {
        // Ordenar cronológicamente (de la cita más antigua a la más reciente)
        const sorted = [...records].sort((a, b) => {
            const dateA = a.fecha || a.created_at || '';
            const dateB = b.fecha || b.created_at || '';
            if (dateA === dateB) return (a.id || 0) - (b.id || 0);
            return dateA.localeCompare(dateB);
        });

        const treatmentsList = [];
        let currentTreatment = null;
        let treatmentIndex = 1;

        sorted.forEach(record => {
            const isExplicitSecundaria = record.tipo_atencion === 'secundaria' ||
                (record.type === 'evolucion' && Number(record.sesion_numero) > 1);

            // Inicia un nuevo tratamiento si es 'primaria' O si no hay ningún tratamiento activo aún
            const startsNewTreatment = record.tipo_atencion === 'primaria' ||
                (record.type === 'evolucion' && Number(record.sesion_numero) === 1) ||
                (!currentTreatment && !isExplicitSecundaria);

            if (startsNewTreatment) {
                // Si había un tratamiento previo en curso, se CIERRA automáticamente
                if (currentTreatment) {
                    currentTreatment.estado = 'cerrado';
                    currentTreatment.fecha_fin = currentTreatment.citas[currentTreatment.citas.length - 1]?.fecha || currentTreatment.fecha_inicio;
                }

                // Inicia un nuevo ciclo de tratamiento
                currentTreatment = {
                    id: `tratamiento-${treatmentIndex}`,
                    numero: treatmentIndex,
                    fecha_inicio: record.fecha || (record.created_at || '').slice(0, 10),
                    fecha_fin: record.fecha || (record.created_at || '').slice(0, 10),
                    diagnostico: record.detalle_diagnostico || record.detalle_motivo || record.detalle_evolucion || 'Atención y Valoración Psicológica',
                    tipo_atencion2: record.tipo_atencion2 || 'curativo',
                    estado: 'en_curso', // Permanece en curso hasta que una próxima cita sea Primaria
                    citas: [record],
                    cita_inicial: record
                };
                record.treatmentId = currentTreatment.id;
                record.treatmentNumero = treatmentIndex;
                record.treatmentEstado = 'en_curso';
                treatmentsList.push(currentTreatment);
                treatmentIndex++;
            } else {
                // Continúa el tratamiento activo actual
                if (!currentTreatment) {
                    currentTreatment = {
                        id: `tratamiento-${treatmentIndex}`,
                        numero: treatmentIndex,
                        fecha_inicio: record.fecha || (record.created_at || '').slice(0, 10),
                        fecha_fin: record.fecha || (record.created_at || '').slice(0, 10),
                        diagnostico: record.detalle_diagnostico || record.detalle_evolucion || 'Tratamiento Psicoterapéutico',
                        tipo_atencion2: record.tipo_atencion2 || 'curativo',
                        estado: 'en_curso',
                        citas: [record],
                        cita_inicial: record
                    };
                    treatmentsList.push(currentTreatment);
                    treatmentIndex++;
                } else {
                    currentTreatment.citas.push(record);
                    currentTreatment.fecha_fin = record.fecha || (record.created_at || '').slice(0, 10);
                }
                record.treatmentId = currentTreatment.id;
                record.treatmentNumero = currentTreatment.numero;
                record.treatmentEstado = currentTreatment.estado;
            }
        });

        // Asegurar que las citas vinculadas tengan referencia al tratamiento y su estado final
        treatmentsList.forEach(t => {
            t.citas.forEach(c => {
                c.treatment = t;
                c.treatmentEstado = t.estado;
            });
        });

        return treatmentsList;
    };

    const treatments = useMemo(() => {
        return processCitasAndTreatments(areaHistories.psicologia || []);
    }, [areaHistories.psicologia]);

    const handleSaveEvolucion = async (e) => {
        e.preventDefault();
        if (!selectedPatient) return;

        try {
            const patientId = selectedPatient.id_usuario || selectedPatient.id;
            await api.post('/psicologia/historial-evolucion', {
                id_usuario_paciente: patientId,
                sesion_numero: evolucionForm.sesion_numero,
                fecha: evolucionForm.fecha,
                detalle_evolucion: evolucionForm.detalle_evolucion
            });

            // Registrar también de forma automática la atención en el parte diario
            const today = new Date().toISOString().slice(0, 10);
            const dailyPayload = {
                id_usuario_paciente: patientId,
                fecha: today,
                tipo_atencion: parseInt(evolucionForm.sesion_numero, 10) > 1 ? 'secundaria' : 'primaria',
                tipo_atencion2: 'curativo',
                detalle_diagnostico: `Sesión de evolución N° ${evolucionForm.sesion_numero}: ${evolucionForm.detalle_evolucion}`
            };

            const diarioRes = await api.get('/psicologia/parte-diario', {
                params: { id_usuario_paciente: patientId }
            });
            const existingDiario = diarioRes.data.data.find(item => (item.fecha ? item.fecha.slice(0, 10) : '') === today);

            if (existingDiario) {
                await api.put(`/psicologia/parte-diario/${existingDiario.id}`, dailyPayload);
            } else {
                await api.post('/psicologia/parte-diario', dailyPayload);
            }

            showSystemToast("Sesión de evolución guardada correctamente.");
            setEvolucionForm(prev => ({ ...prev, detalle_evolucion: '' }));
            fetchEvoluciones(patientId);
        } catch (err) {
            console.error(err);
            showSystemToast("Error al guardar la sesión de evolución.");
        }
    };

    // ==========================================
    // 4. HISTORIAL GENERAL
    // ==========================================
    const fetchHistorialGeneral = async () => {
        try {
            const [evolucionRes, diarioRes] = await Promise.all([
                api.get('/psicologia/historial-evolucion'),
                api.get('/psicologia/parte-diario')
            ]);

            const mappedEvolucion = evolucionRes.data.data.map(item => ({
                id: `evolucion-${item.id}`,
                type: 'evolucion',
                fecha: item.fecha ? item.fecha.slice(0, 10) : '',
                paciente: item.paciente,
                id_usuario_paciente: item.id_usuario_paciente || item.paciente?.id,
                detalle: `Sesión N° ${item.sesion_numero} · Evolución: ${item.detalle_evolucion}`
            }));

            const mappedDiario = diarioRes.data.data.map(item => ({
                id: `diario-${item.id}`,
                type: 'diario',
                fecha: item.fecha ? item.fecha.slice(0, 10) : '',
                paciente: item.paciente,
                id_usuario_paciente: item.id_usuario_paciente || item.paciente?.id,
                detalle: `Atención: ${item.tipo_atencion.toUpperCase()} (${item.tipo_atencion2}) · Diagnóstico: ${item.detalle_diagnostico}`
            }));

            const allRecords = [...mappedEvolucion, ...mappedDiario];
            setHistorialList(allRecords);

            // Cargar en segundo plano los perfiles de los pacientes en la lista
            const patientIds = [...new Set(allRecords.map(item => item.id_usuario_paciente).filter(Boolean))];
            const profiles = await Promise.all(
                patientIds.map(async (pId) => {
                    try {
                        const res = await api.get(`/psicologia/pacientes/${pId}/perfil`);
                        return { id: pId, data: res.data.data };
                    } catch (e) {
                        console.error('Error precargando perfil de paciente en historial:', pId, e);
                        return { id: pId, data: null };
                    }
                })
            );

            const cache = {};
            profiles.forEach(p => {
                if (p.data) {
                    cache[p.id] = p.data;
                }
            });
            setPatientProfilesCache(cache);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (activeTab === 'historial') {
            fetchHistorialGeneral();
        }
    }, [activeTab]);

    // Appointments (Citas Médicas) actions
    const fetchCitasDoctor = async () => {
        setCitasLoading(true);
        try {
            const res = await api.get('/citas-medicas/doctor/citas', {
                params: {
                    fecha: citasDate
                }
            });
            setCitasList(res.data.data);
        } catch (err) {
            console.error("Error loading doctor appointments:", err);
        } finally {
            setCitasLoading(false);
        }
    };

    const handleConfirmarCita = async (citaId) => {
        try {
            await api.patch(`/citas-medicas/${citaId}/confirmar`);
            fetchCitasDoctor();
            showSystemToast("Cita confirmada exitosamente");
        } catch (err) {
            alert(err.response?.data?.message || "Error al confirmar la cita");
        }
    };

    const handleCancelarCita = async (citaId) => {
        if (!window.confirm("¿Está seguro de que desea cancelar esta cita?")) return;
        try {
            await api.patch(`/citas-medicas/${citaId}/cancelar`);
            fetchCitasDoctor();
            showSystemToast("Cita cancelada exitosamente");
        } catch (err) {
            alert(err.response?.data?.message || "Error al cancelar la cita");
        }
    };

    const handleCompletarCitaSubmit = async (e) => {
        e.preventDefault();
        if (!completingCita) return;
        setSavingNotas(true);
        try {
            await api.patch(`/citas-medicas/${completingCita.id}/completar`, {
                notas_doctor: notasDoctor
            });
            setCompletingCita(null);
            setNotasDoctor('');
            fetchCitasDoctor();
            showSystemToast("Cita completada y notas guardadas");
        } catch (err) {
            alert(err.response?.data?.message || "Error al completar la cita");
        } finally {
            setSavingNotas(false);
        }
    };

    const handleNavigateToCitasFromNotif = (fecha) => {
        if (fecha) {
            setCitasDate(fecha);
        }
        setActiveTab('citas');
    };

    const handlePrintReporteCitas = () => {
        try {
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                showSystemToast("El bloqueador de popups impidió abrir el reporte. Permita los popups.");
                return;
            }

            const doctorNameText = user?.name || 'Profesional Responsable';
            const formattedDate = citasDate ? citasDate : 'Todas las fechas';

            const totalCitas = citasList.length;
            const countProgramadas = citasList.filter(c => c.estado === 'programada').length;
            const countConfirmadas = citasList.filter(c => c.estado === 'confirmada').length;
            const countCompletadas = citasList.filter(c => c.estado === 'completada').length;
            const countCanceladas = citasList.filter(c => c.estado === 'cancelada').length;

            const rowsHtml = citasList.map((cita, index) => {
                const pIdent = cita.paciente?.datos_identificacion || cita.paciente?.datosIdentificacion || cita.paciente?.identification;
                const patientName = pIdent
                    ? `${pIdent.primer_nombre} ${pIdent.segundo_nombre || ''} ${pIdent.apellido_paterno} ${pIdent.apellido_materno || ''}`.replace(/\s+/g, ' ').trim()
                    : cita.paciente?.name || 'Paciente';
                const cedula = pIdent?.numero_cedula || 'N/D';
                const estado = (cita.estado || 'programada').toUpperCase();
                const horario = `${cita.hora_inicio || ''} - ${cita.hora_fin || ''}`;
                const motivo = cita.motivo || 'Consulta en Psicología';
                const fechaCita = cita.fecha ? String(cita.fecha).slice(0, 10) : citasDate;

                let estadoBadgeColor = '#1e40af';
                if (cita.estado === 'confirmada') estadoBadgeColor = '#065f46';
                if (cita.estado === 'completada') estadoBadgeColor = '#374151';
                if (cita.estado === 'cancelada') estadoBadgeColor = '#991b1b';

                return `
                    <tr>
                        <td style="text-align: center;">${index + 1}</td>
                        <td style="text-align: center;">${fechaCita}</td>
                        <td style="text-align: center;">${horario}</td>
                        <td>${patientName}</td>
                        <td style="text-align: center;">${cedula}</td>
                        <td>${motivo}</td>
                        <td style="text-align: center; font-weight: bold; color: ${estadoBadgeColor};">${estado}</td>
                    </tr>
                `;
            }).join('');

            const emptyRowsHtml = citasList.length === 0 ? `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 20px; color: #666;">No hay citas agendadas o registradas para la fecha seleccionada.</td>
                </tr>
            ` : '';

            printWindow.document.write(`
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <title>Reporte de Citas Médicas - Psicología UEB</title>
                    <meta charset="utf-8" />
                    <style>
                        @page { size: A4 portrait; margin: 12mm; }
                        body {
                            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                            font-size: 10px;
                            color: #333;
                            margin: 0;
                            padding: 30px 20px;
                            background-color: #e2e8f0;
                            display: flex;
                            justify-content: center;
                        }
                        .page-sheet {
                            background-color: #ffffff;
                            width: 210mm;
                            max-width: 100%;
                            margin: 0 auto;
                            min-height: 297mm;
                            padding: 18mm 15mm;
                            box-sizing: border-box;
                            box-shadow: 0 10px 25px -5px rgba(0,0,0,0.2);
                            border-radius: 8px;
                        }
                        .header-container {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            border-bottom: 2px solid #000;
                            padding-bottom: 8px;
                            margin-bottom: 15px;
                        }
                        .header-logo {
                            font-weight: bold;
                            font-size: 14px;
                            color: #0b2240;
                        }
                        .header-logo span {
                            color: #b71a34;
                            display: block;
                            font-size: 8px;
                        }
                        .header-center { text-align: center; }
                        .header-center h1 { margin: 0; font-size: 14px; font-weight: bold; }
                        .header-center h2 { margin: 2px 0 0; font-size: 11px; font-weight: bold; color: #444; }
                        .meta-info {
                            display: flex;
                            justify-content: space-between;
                            margin-bottom: 15px;
                            background: #f8fafc;
                            padding: 8px 12px;
                            border: 1px solid #cbd5e1;
                            border-radius: 6px;
                            font-size: 10px;
                        }
                        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                        th, td { border: 1px solid #000; padding: 6px 5px; font-size: 9px; vertical-align: middle; }
                        th { background-color: #f1f5f9; font-weight: bold; text-align: center; }
                        .totals-grid {
                            display: grid;
                            grid-template-columns: repeat(5, 1fr);
                            gap: 10px;
                            margin-top: 15px;
                            text-align: center;
                        }
                        .stat-box {
                            border: 1px solid #cbd5e1;
                            padding: 8px;
                            border-radius: 6px;
                            background: #fff;
                        }
                        .stat-box strong { display: block; font-size: 14px; margin-top: 2px; }
                        @media print {
                            body { background: transparent; padding: 0; display: block; }
                            .page-sheet { box-shadow: none; padding: 0; border-radius: 0; width: 100%; max-width: none; margin: 0; }
                        }
                    </style>
                </head>
                <body>
                    <div class="page-sheet">
                        <div class="header-container">
                            <div class="header-logo" style="display: flex; align-items: center;">
                                <img src="${logoBienestar}" alt="Bienestar Universitario UEB" style="max-height: 48px; width: auto; object-fit: contain;" />
                            </div>
                            <div class="header-center">
                                <h1>UNIVERSIDAD ESTATAL DE BOLÍVAR</h1>
                                <h2>DEPARTAMENTO DE BIENESTAR UNIVERSITARIO</h2>
                                <h3 style="margin: 2px 0 0; font-size: 10px; font-weight: bold; color: #b71a34;">REPORTE DE CITAS Y CONSULTAS - PSICOLOGÍA</h3>
                            </div>
                            <div style="text-align: right; font-size: 9px;">
                                <strong>FECHA FILTRO:</strong><br/>${formattedDate}
                            </div>
                        </div>

                        <div class="meta-info">
                            <div><strong>Psicólogo/a Responsable:</strong> ${doctorNameText}</div>
                            <div><strong>Total de Citas en Registro:</strong> ${totalCitas}</div>
                        </div>

                        <div class="totals-grid">
                            <div class="stat-box" style="border-left: 4px solid #3b82f6;">
                                <span style="font-size: 8px; color: #64748b;">PROGRAMADAS</span>
                                <strong>${countProgramadas}</strong>
                            </div>
                            <div class="stat-box" style="border-left: 4px solid #10b981;">
                                <span style="font-size: 8px; color: #64748b;">CONFIRMADAS</span>
                                <strong>${countConfirmadas}</strong>
                            </div>
                            <div class="stat-box" style="border-left: 4px solid #64748b;">
                                <span style="font-size: 8px; color: #64748b;">COMPLETADAS</span>
                                <strong>${countCompletadas}</strong>
                            </div>
                            <div class="stat-box" style="border-left: 4px solid #ef4444;">
                                <span style="font-size: 8px; color: #64748b;">CANCELADAS</span>
                                <strong>${countCanceladas}</strong>
                            </div>
                            <div class="stat-box" style="border-left: 4px solid #0b2240;">
                                <span style="font-size: 8px; color: #64748b;">TOTAL REGISTROS</span>
                                <strong>${totalCitas}</strong>
                            </div>
                        </div>

                        <table>
                            <thead>
                                <tr>
                                    <th style="width: 4%;">N°</th>
                                    <th style="width: 12%;">FECHA</th>
                                    <th style="width: 13%;">HORARIO</th>
                                    <th style="width: 25%;">PACIENTE</th>
                                    <th style="width: 12%;">CÉDULA</th>
                                    <th style="width: 22%;">MOTIVO / CONSULTA</th>
                                    <th style="width: 12%;">ESTADO</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rowsHtml}
                                ${emptyRowsHtml}
                            </tbody>
                        </table>

                        <div style="margin-top: 50px; display: flex; justify-content: space-around; font-size: 9px;">
                            <div style="text-align: center; border-top: 1px solid #000; width: 220px; padding-top: 5px;">
                                <strong>Psicólogo/a Responsable</strong><br/>
                                <span>${doctorNameText}</span>
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
            console.error('Error al generar reporte de citas:', error);
        }
    };

    useEffect(() => {
        if (activeTab === 'citas') {
            fetchCitasDoctor();
        }
    }, [activeTab, citasDate]);

    const getFilteredHistorial = () => {
        return historialList.filter(item => {
            if (historialType === 'evolucion' && item.type !== 'evolucion') return false;
            if (historialType === 'diario' && item.type !== 'diario') return false;

            const searchText = historialSearch.toLowerCase();
            const patientDetails = patientProfilesCache[item.id_usuario_paciente] || item.paciente;
            const pIdent = patientDetails?.datos_identificacion || patientDetails?.datosIdentificacion || patientDetails?.identification;
            const patientName = (pIdent
                ? `${pIdent.primer_nombre} ${pIdent.apellido_paterno}`
                : patientDetails?.name || patientDetails?.email || 'Paciente'
            ).toLowerCase();
            const patientCedula = pIdent?.numero_cedula || '';
            const details = item.detalle.toLowerCase();

            if (searchText && !patientName.includes(searchText) && !patientCedula.includes(searchText) && !details.includes(searchText)) {
                return false;
            }

            if (historialDate && item.fecha && item.fecha.slice(0, 10) !== historialDate) return false;

            return true;
        });
    };

    const handleDownloadHistoriaClinicaPdf = async (patientId, recordId) => {
        showSystemToast("Generando reporte imprimible...");
        const actualPatientId = patientId || selectedPatient?.id_usuario || selectedPatient?.id;
        try {
            // 1. Fetch complete profile and history lists
            const [
                profileRes,
                motivoRes,
                psicoRes,
                laboralRes,
                socialRes,
                sexualRes,
                patologiaRes,
                mentalRes,
                pruebasRes,
                analisisRes,
                conclusionesRes,
                diagnosticoRes,
                pronosticoRes,
                recomendacionRes,
                evolucionRes
            ] = await Promise.all([
                api.get(`/psicologia/pacientes/${actualPatientId}/perfil`),
                api.get('/psicologia/motivo-consulta', { params: { id_usuario_paciente: actualPatientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/psicologia/psicoanamnesis', { params: { id_usuario_paciente: actualPatientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/psicologia/historial-laboral', { params: { id_usuario_paciente: actualPatientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/psicologia/historial-social', { params: { id_usuario_paciente: actualPatientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/psicologia/historial-sexual', { params: { id_usuario_paciente: actualPatientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/psicologia/patologias', { params: { id_usuario_paciente: actualPatientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/psicologia/examen-estado-mental', { params: { id_usuario_paciente: actualPatientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/psicologia/pruebas-aplicadas', { params: { id_usuario_paciente: actualPatientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/psicologia/analisis-resultados', { params: { id_usuario_paciente: actualPatientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/psicologia/conclusiones', { params: { id_usuario_paciente: actualPatientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/psicologia/diagnostico', { params: { id_usuario_paciente: actualPatientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/psicologia/pronostico', { params: { id_usuario_paciente: actualPatientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/psicologia/recomendacion', { params: { id_usuario_paciente: actualPatientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/psicologia/historial-evolucion', { params: { id_usuario_paciente: actualPatientId } }).catch(() => ({ data: { data: [] } }))
            ]);

            const patient = profileRes.data.data;
            const ident = patient.datos_identificacion || {};
            const dirs = patient.direcciones || [];

            const dirProcedencia = dirs.find(d => d.id_tipo_direccion === 1) || dirs[0] || {};
            const dirResidencia = dirs.find(d => d.id_tipo_direccion === 2) || dirs[0] || {};

            // Calculate age
            const birthdate = ident.fecha_nacimiento;
            let age = '—';
            if (birthdate) {
                const birth = new Date(birthdate);
                const diff = Date.now() - birth.getTime();
                const ageDate = new Date(diff);
                age = Math.abs(ageDate.getUTCFullYear() - 1970);
            }

            // Determine which ordinal consultation this record corresponds to.
            // Strategy: sort all parte_diario records for this patient chronologically (ASC by created_at),
            // find the position of the selected record by its id, then pick that same index
            // from each other section (also sorted ASC). This works because each consultation
            // creates exactly one record per section in the same save operation.
            const getByIndex = (recordsList, idx) => {
                if (!recordsList || recordsList.length === 0) return null;
                // Sort ascending by created_at so index 0 = first ever consultation
                const sorted = [...recordsList].sort((a, b) => {
                    const ta = new Date(a.created_at || a.fecha || 0).getTime();
                    const tb = new Date(b.created_at || b.fecha || 0).getTime();
                    return ta - tb;
                });
                // Clamp to available records (if fewer records than consultations, return last available)
                const clampedIdx = Math.min(idx, sorted.length - 1);
                return clampedIdx >= 0 ? sorted[clampedIdx] : null;
            };

            // Find the ordinal index of the selected parte_diario record
            const allDiarios = (await api.get('/psicologia/parte-diario', { params: { id_usuario_paciente: actualPatientId } }).catch(() => ({ data: { data: [] } }))).data.data;
            const sortedDiarios = [...allDiarios].sort((a, b) => {
                const ta = new Date(a.created_at || a.fecha || 0).getTime();
                const tb = new Date(b.created_at || b.fecha || 0).getTime();
                return ta - tb;
            });
            const consultationIndex = sortedDiarios.findIndex(d => d.id === recordId);
            // If the record is not found (e.g. evolucion type), fall back to last record
            const idx = consultationIndex >= 0 ? consultationIndex : sortedDiarios.length - 1;

            const closestMotivo = getByIndex(motivoRes.data.data, idx);
            const motivos = closestMotivo ? [closestMotivo] : [];

            const allPsicoPersonal = psicoRes.data.data.filter(item => item.tipo === 'personal');
            const closestPsicoPersonal = getByIndex(allPsicoPersonal, idx);
            const psico_personal = closestPsicoPersonal ? [closestPsicoPersonal] : [];

            const allPsicoFamiliar = psicoRes.data.data.filter(item => item.tipo === 'familiar');
            const closestPsicoFamiliar = getByIndex(allPsicoFamiliar, idx);
            const psico_familiar = closestPsicoFamiliar ? [closestPsicoFamiliar] : [];

            const closestLaboral = getByIndex(laboralRes.data.data, idx);
            const laborales = closestLaboral ? [closestLaboral] : [];

            const closestSocial = getByIndex(socialRes.data.data, idx);
            const sociales = closestSocial ? [closestSocial] : [];

            const closestSexual = getByIndex(sexualRes.data.data, idx);
            const sexuales = closestSexual ? [closestSexual] : [];

            const closestPatologia = getByIndex(patologiaRes.data.data, idx);
            const patologias = closestPatologia ? [closestPatologia] : [];

            const closestMental = getByIndex(mentalRes.data.data, idx);
            const mental = closestMental || {};

            const closestPrueba = getByIndex(pruebasRes.data.data, idx);
            const pruebas = closestPrueba ? [closestPrueba] : [];

            const closestAnalisis = getByIndex(analisisRes.data.data, idx);
            const analisis = closestAnalisis ? [closestAnalisis] : [];

            const closestConclusion = getByIndex(conclusionesRes.data.data, idx);
            const conclusiones = closestConclusion ? [closestConclusion] : [];

            const closestDiagnostico = getByIndex(diagnosticoRes.data.data, idx);
            const diagnosticos = closestDiagnostico ? [closestDiagnostico] : [];

            const closestPronostico = getByIndex(pronosticoRes.data.data, idx);
            const pronosticos = closestPronostico ? [closestPronostico] : [];

            const closestRecomendacion = getByIndex(recomendacionRes.data.data, idx);
            const recomendaciones = closestRecomendacion ? [closestRecomendacion] : [];

            const closestEvolucion = getByIndex(evolucionRes.data.data, idx);
            const evoluciones = closestEvolucion ? [closestEvolucion] : [];

            // 2. Generate HTML layout matching the psychology printable sheet
            const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Historia Clínica Psicológica</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 15mm;
        }
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 11px;
            color: #333333;
            margin: 0;
            padding: 20px;
            line-height: 1.3;
            background-color: #f1f5f9;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .page-sheet {
            background-color: #ffffff;
            width: 210mm;
            min-height: 297mm;
            padding: 20mm;
            box-sizing: border-box;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            border-radius: 8px;
            margin-bottom: 25px;
        }
        .page-break {
            page-break-after: always;
        }
        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        .header-table td {
            border: 1px solid #000000;
            padding: 8px;
            vertical-align: middle;
        }
        .header-title {
            font-size: 16px;
            font-weight: bold;
            text-align: center;
            text-transform: uppercase;
        }
        .header-logo-container {
            width: 150px;
            text-align: center;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }
        .data-table td, .data-table th {
            border: 1px solid #000000;
            padding: 5px 8px;
            vertical-align: middle;
        }
        .form-label {
            background-color: #e6f0fa;
            font-weight: bold;
            font-size: 9px;
            text-align: center;
            text-transform: uppercase;
        }
        .form-value {
            min-height: 20px;
            font-size: 10px;
        }
        .text-center {
            text-align: center;
        }
        .w-50 {
            width: 50%;
        }
        .checkbox-container {
            font-size: 10px;
        }
        .clinical-history-section-header {
            background-color: #d0e1f9;
            font-weight: bold;
            padding: 4px 8px;
            border: 1px solid #000000;
            font-size: 10px;
            text-transform: uppercase;
            margin-top: 10px;
        }
        .clinical-history-section-content {
            border: 1px solid #000000;
            padding: 8px;
            min-height: 35px;
            font-size: 10px;
            margin-bottom: 12px;
            background-color: #ffffff;
        }
        @media print {
            body {
                background-color: transparent;
                padding: 0;
                margin: 0;
                display: block;
            }
            .page-sheet {
                width: 100%;
                min-height: auto;
                padding: 0;
                box-shadow: none;
                border-radius: 0;
                margin-bottom: 0;
                background-color: transparent;
            }
        }
    </style>
</head>
<body>
    <div class="page-sheet">

    <!-- PAGINA 1: DATOS DE IDENTIFICACIÓN -->
    <table class="header-table">
        <tr>
            <td class="header-title">Datos de Identificación</td>
            <td class="header-logo-container">
                <img src="${logoBienestar}" alt="Bienestar Universitario UEB" style="max-height: 48px; width: auto; max-width: 140px; object-fit: contain;" />
            </td>
        </tr>
    </table>

    <table class="data-table">
        <tr>
            <td class="form-label" style="width: 20%;">Apellido Paterno</td>
            <td class="form-label" style="width: 20%;">Apellido Materno</td>
            <td class="form-label" style="width: 20%;">Primer Nombre</td>
            <td class="form-label" style="width: 20%;">Segundo Nombre</td>
            <td class="form-label" style="width: 12%;">Nº de Cédula</td>
            <td class="form-label" style="width: 8%;">Edad</td>
        </tr>
        <tr>
            <td class="form-value text-center">${ident.apellido_paterno || '—'}</td>
            <td class="form-value text-center">${ident.apellido_materno || '—'}</td>
            <td class="form-value text-center">${ident.primer_nombre || '—'}</td>
            <td class="form-value text-center">${ident.segundo_nombre || '—'}</td>
            <td class="form-value text-center">${ident.numero_cedula || '—'}</td>
            <td class="form-value text-center">${age}</td>
        </tr>
    </table>

    <table class="data-table" style="margin-top: 10px;">
        <tr>
            <th class="form-label w-50">Dirección de Procedencia</th>
            <th class="form-label w-50">Dirección de Residencia Actual</th>
        </tr>
        <tr>
            <td>
                <table style="width:100%; border-collapse:collapse;">
                    <tr>
                        <td style="border:none; padding:3px 0; font-weight:bold; width:30%;">Provincia:</td>
                        <td style="border:none; padding:3px 0;">${dirProcedencia.provincia?.nombre_provincia || '—'}</td>
                    </tr>
                    <tr>
                        <td style="border:none; padding:3px 0; font-weight:bold;">Cantón:</td>
                        <td style="border:none; padding:3px 0;">${dirProcedencia.canton?.nombre_canton || '—'}</td>
                    </tr>
                    <tr>
                        <td style="border:none; padding:3px 0; font-weight:bold;">Dirección:</td>
                        <td style="border:none; padding:3px 0;">${dirProcedencia.direccion_referencia || '—'}</td>
                    </tr>
                    <tr>
                        <td style="border:none; padding:3px 0; font-weight:bold;">Teléfono:</td>
                        <td style="border:none; padding:3px 0;">${dirProcedencia.telefono_convencional || '—'}</td>
                    </tr>
                    <tr>
                        <td style="border:none; padding:3px 0; font-weight:bold;">Nacionalidad:</td>
                        <td style="border:none; padding:3px 0;">${dirProcedencia.nacionalidad || 'Ecuatoriana'}</td>
                    </tr>
                </table>
            </td>
            <td>
                <table style="width:100%; border-collapse:collapse;">
                    <tr>
                        <td style="border:none; padding:3px 0; font-weight:bold; width:30%;">Provincia:</td>
                        <td style="border:none; padding:3px 0;">${dirResidencia.provincia?.nombre_provincia || '—'}</td>
                    </tr>
                    <tr>
                        <td style="border:none; padding:3px 0; font-weight:bold;">Cantón:</td>
                        <td style="border:none; padding:3px 0;">${dirResidencia.canton?.nombre_canton || '—'}</td>
                    </tr>
                    <tr>
                        <td style="border:none; padding:3px 0; font-weight:bold;">Dirección:</td>
                        <td style="border:none; padding:3px 0;">${dirResidencia.direccion_referencia || '—'}</td>
                    </tr>
                    <tr>
                        <td style="border:none; padding:3px 0; font-weight:bold;">Teléfono:</td>
                        <td style="border:none; padding:3px 0;">${dirResidencia.telefono_convencional || '—'}</td>
                    </tr>
                    <tr>
                        <td style="border:none; padding:3px 0; font-weight:bold;">Nacionalidad:</td>
                        <td style="border:none; padding:3px 0;">${dirResidencia.nacionalidad || 'Ecuatoriana'}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <table class="data-table" style="margin-top: 10px;">
        <tr>
            <td class="form-label" style="width: 25%;">Lugar de Nacimiento</td>
            <td class="form-label" style="width: 20%;">Fecha de Nacimiento</td>
            <td class="form-label" style="width: 20%;">Género</td>
            <td class="form-label" style="width: 20%;">Estado Civil</td>
            <td class="form-label" style="width: 15%;">Nro. Hijos</td>
        </tr>
        <tr>
            <td class="form-value text-center">${dirResidencia.nacionalidad || '—'}</td>
            <td class="form-value text-center">${ident.fecha_nacimiento || '—'}</td>
            <td class="form-value text-center checkbox-container">
                M (${(patient.autopercepcion?.genero?.nombre_genero === 'Masculino') ? 'X' : ' '}) &nbsp;
                F (${(patient.autopercepcion?.genero?.nombre_genero === 'Femenino') ? 'X' : ' '}) &nbsp;
                LGBTI (${(patient.autopercepcion?.genero?.nombre_genero === 'LGBTI') ? 'X' : ' '})
            </td>
            <td class="form-value text-center">${patient.autopercepcion?.estado_civil?.nombre_estado_civil || '—'}</td>
            <td class="form-value text-center">${patient.hijos?.length || 0}</td>
        </tr>
    </table>

    <table class="data-table" style="margin-top: 10px;">
        <tr>
            <td class="form-label" style="width: 20%;">Autoidentificación Étnica</td>
            <td class="form-value checkbox-container">
                Blanco (${(patient.autopercepcion?.identificacion_etnica?.nombre_etnia === 'Blanco') ? 'X' : ' '}) &nbsp;&nbsp;&nbsp;
                Mestizo (${(patient.autopercepcion?.identificacion_etnica?.nombre_etnia === 'Mestizo') ? 'X' : ' '}) &nbsp;&nbsp;&nbsp;
                Afrodescendiente (${(patient.autopercepcion?.identificacion_etnica?.nombre_etnia === 'Afrodescendiente') ? 'X' : ' '}) &nbsp;&nbsp;&nbsp;
                Indígena (${(patient.autopercepcion?.identificacion_etnica?.nombre_etnia === 'Indígena') ? 'X' : ' '}) &nbsp;&nbsp;&nbsp;
                Montubio (${(patient.autopercepcion?.identificacion_etnica?.nombre_etnia === 'Montubio') ? 'X' : ' '}) &nbsp;&nbsp;&nbsp;
                Otros (${(patient.autopercepcion?.identificacion_etnica?.nombre_etnia === 'Otros') ? 'X' : ' '} )
            </td>
        </tr>
    </table>

    <table class="data-table" style="margin-top: 10px;">
        <tr>
            <td class="form-label" style="width: 40%;">Facultad</td>
            <td class="form-label" style="width: 45%;">Carrera</td>
            <td class="form-label" style="width: 15%;">Ciclo</td>
        </tr>
        <tr>
            <td class="form-value text-center">${patient.estudio_carrera?.facultad?.nombre_facultad || '—'}</td>
            <td class="form-value text-center">${patient.estudio_carrera?.carrera?.nombre_carrera || '—'}</td>
            <td class="form-value text-center">${patient.estudio_carrera?.ciclo?.nombre_ciclo || '—'}</td>
        </tr>
    </table>

    <table class="data-table" style="margin-top: 10px;">
        <tr>
            <th class="form-label" colspan="3">En Caso de Emergencia Comunicarse con:</th>
        </tr>
        <tr>
            <td class="form-label" style="width: 40%;">Parentesco / Nombre</td>
            <td class="form-label" style="width: 30%;">Teléfono</td>
            <td class="form-label" style="width: 30%;">Celular</td>
        </tr>
        ${patient.contactos_emergencia && patient.contactos_emergencia.length > 0 ?
                    patient.contactos_emergencia.map(c => `
                <tr>
                    <td class="form-value text-center">${c.parentesco} - ${c.nombre_completo}</td>
                    <td class="form-value text-center">${c.telefono || '—'}</td>
                    <td class="form-value text-center">${c.celular || '—'}</td>
                </tr>
            `).join('') : `
                <tr>
                    <td class="form-value text-center" colspan="3">Sin contactos registrados.</td>
                </tr>
            `
                }
    </table>

    </div>
    <div class="page-break"></div>
    <div class="page-sheet">

    <!-- PAGINA 2: HISTORIA CLÍNICA PSICOLÓGICA -->
    <table class="header-table">
        <tr>
            <td class="header-title">Historia Clínica Psicológica</td>
            <td class="header-logo-container">
                <img src="${logoBienestar}" alt="Bienestar Universitario UEB" style="max-height: 48px; width: auto; max-width: 140px; object-fit: contain;" />
            </td>
        </tr>
    </table>

    <div class="clinical-history-section-header">1 Motivo de Consulta</div>
    <div class="clinical-history-section-content">
        ${motivos.length > 0 ? motivos.map(m => `<div>• ${m.detalle_motivo}</div>`).join('') : 'Sin registros.'}
    </div>

    <div class="clinical-history-section-header">2 Fuentes de Información</div>
    <div class="clinical-history-section-content">
        Familiar, entrevista con paciente.
    </div>

    <div class="clinical-history-section-header">3 Psicoanamnesis Personal</div>
    <div class="clinical-history-section-content">
        ${psico_personal.length > 0 ? psico_personal.map(p => `<div>• ${p.detalle_psicoanamnesis}</div>`).join('') : 'Sin registros.'}
    </div>

    <div class="clinical-history-section-header">4 Psicoanamnesis Familiar</div>
    <div class="clinical-history-section-content">
        ${psico_familiar.length > 0 ? psico_familiar.map(p => `<div>• ${p.detalle_psicoanamnesis}</div>`).join('') : 'Sin registros.'}
    </div>

    <div class="clinical-history-section-header">5 Historia Laboral</div>
    <div class="clinical-history-section-content">
        ${laborales.length > 0 ? laborales.map(l => `<div>• ${l.detalle_laboral}</div>`).join('') : 'Sin registros.'}
    </div>

    <div class="clinical-history-section-header">6 Historia Social</div>
    <div class="clinical-history-section-content">
        ${sociales.length > 0 ? sociales.map(s => `<div>• ${s.detalle_social}</div>`).join('') : 'Sin registros.'}
    </div>

    <div class="clinical-history-section-header">7 Historia Sexual</div>
    <div class="clinical-history-section-content">
        ${sexuales.length > 0 ? sexuales.map(s => `<div>• ${s.detalle_sexual}</div>`).join('') : 'Sin registros.'}
    </div>

    <div class="clinical-history-section-header">8 Patologías</div>
    <div class="clinical-history-section-content">
        ${patologias.length > 0 ? patologias.map(p => `<div>• ${p.detalle_patologia}</div>`).join('') : 'Sin registros.'}
    </div>

    <div class="clinical-history-section-header">9 Examen Estado Mental</div>
    <table class="data-table" style="margin-bottom: 12px;">
        <tbody>
            <tr>
                <td style="font-weight: bold; background-color: #f8fafc; width: 20%;">APARIENCIA</td>
                <td style="width: 30%;">${mental.apariencia || '—'}</td>
                <td style="font-weight: bold; background-color: #f8fafc; width: 20%;">ORIENTACIÓN</td>
                <td style="width: 30%;">${mental.orientacion || '—'}</td>
            </tr>
            <tr>
                <td style="font-weight: bold; background-color: #f8fafc;">ACTITUD</td>
                <td>${mental.actitud || '—'}</td>
                <td style="font-weight: bold; background-color: #f8fafc;">ATENCIÓN</td>
                <td>${mental.atencion || '—'}</td>
            </tr>
            <tr>
                <td style="font-weight: bold; background-color: #f8fafc;">JUICIO</td>
                <td>${mental.juicio || '—'}</td>
                <td style="font-weight: bold; background-color: #f8fafc;">MEMORIA</td>
                <td>${mental.memoria || '—'}</td>
            </tr>
            <tr>
                <td style="font-weight: bold; background-color: #f8fafc;">SUEÑO</td>
                <td>${mental.sueno || '—'}</td>
                <td style="font-weight: bold; background-color: #f8fafc;">LENGUAJE</td>
                <td>${mental.lenguaje || '—'}</td>
            </tr>
            <tr>
                <td style="font-weight: bold; background-color: #f8fafc;">APETITO</td>
                <td>${mental.apetito || '—'}</td>
                <td style="font-weight: bold; background-color: #f8fafc;">PENSAMIENTO</td>
                <td>${mental.pensamiento || '—'}</td>
            </tr>
            <tr>
                <td style="font-weight: bold; background-color: #f8fafc;">AFECTIVIDAD</td>
                <td>${mental.afectividad || '—'}</td>
                <td style="font-weight: bold; background-color: #f8fafc;">CONDUCTA MOTORA</td>
                <td>${mental.conducta_motora || '—'}</td>
            </tr>
        </tbody>
    </table>

    <div class="clinical-history-section-header">10 Pruebas Psicológicas Aplicadas</div>
    <div class="clinical-history-section-content">
        ${pruebas.length > 0 ? pruebas.map(p => `<div>• ${p.detalle_prueba_aplicada}</div>`).join('') : 'Sin registros.'}
    </div>

    </div>
    <div class="page-break"></div>
    <div class="page-sheet">

    <!-- PAGINA 3: EVALUACIÓN Y RESULTADOS -->
    <table class="header-table">
        <tr>
            <td class="header-title">Evaluación Psicológica y Resultados</td>
            <td class="header-logo-container">
                <img src="${logoBienestar}" alt="Bienestar Universitario UEB" style="max-height: 48px; width: auto; max-width: 140px; object-fit: contain;" />
            </td>
        </tr>
    </table>

    <div class="clinical-history-section-header">11 Análisis e Interpretación de Resultados</div>
    <div class="clinical-history-section-content">
        ${analisis.length > 0 ? analisis.map(a => `<div>• ${a.detalle_analisis_resultados}</div>`).join('') : 'Sin registros.'}
    </div>

    <div class="clinical-history-section-header">12 Conclusiones</div>
    <div class="clinical-history-section-content">
        ${conclusiones.length > 0 ? conclusiones.map(c => `<div>• ${c.detalle_conclusion}</div>`).join('') : 'Sin registros.'}
    </div>

    <div class="clinical-history-section-header">13 Diagnóstico</div>
    <div class="clinical-history-section-content">
        ${diagnosticos.length > 0 ? diagnosticos.map(d => `<div>• ${d.detalle_diagnostico}</div>`).join('') : 'Sin registros.'}
    </div>

    <div class="clinical-history-section-header">14 Pronóstico</div>
    <div class="clinical-history-section-content">
        ${pronosticos.length > 0 ? pronosticos.map(p => `<div>• ${p.detalle_pronostico}</div>`).join('') : 'Sin registros.'}
    </div>

    <div class="clinical-history-section-header">15 Recomendaciones</div>
    <div class="clinical-history-section-content">
        ${recomendaciones.length > 0 ? recomendaciones.map(r => `<div>• ${r.detalle_recomendacion}</div>`).join('') : 'Sin registros.'}
    </div>

    </div>
    <div class="page-break"></div>
    <div class="page-sheet">

    <!-- PAGINA 4: HOJA DE EVOLUCIÓN PSICOLOGÍA -->
    <table class="header-table">
        <tr>
            <td class="header-title">Hoja de Evolución Psicología</td>
            <td class="header-logo-container">
                <img src="${logoBienestar}" alt="Bienestar Universitario UEB" style="max-height: 48px; width: auto; max-width: 140px; object-fit: contain;" />
            </td>
        </tr>
    </table>

    <table class="data-table">
        <thead>
            <tr class="form-label">
                <th style="width: 15%;">Fecha</th>
                <th style="width: 15%;">Sesión Nº</th>
                <th style="width: 70%;">Evolución</th>
            </tr>
        </thead>
        <tbody>
            ${evoluciones.length > 0 ? evoluciones.map(ev => `
                <tr style="font-size: 10px; vertical-align: top;">
                    <td class="text-center" style="padding: 10px 5px;">${ev.fecha || (ev.created_at ? ev.created_at.slice(0, 10) : '')}</td>
                    <td class="text-center" style="padding: 10px 5px; font-weight: bold;">Sesión #${ev.sesion_numero}</td>
                    <td style="padding: 10px;">${ev.detalle_evolucion}</td>
                </tr>
            `).join('') : '<tr><td colspan="3" class="text-center" style="padding: 20px;">Sin evoluciones registradas.</td></tr>'}
        </tbody>
    </table>
    </div>
</body>
</html>
            `;

            // 3. Open in a new tab
            const newWindow = window.open('', '_blank');
            if (newWindow) {
                newWindow.document.open();
                newWindow.document.write(htmlContent);
                newWindow.document.close();
            } else {
                showSystemToast("El bloqueador de popups impidió abrir la ventana. Permita los popups para este sitio.");
            }

        } catch (error) {
            console.error('Error al generar la impresión:', error);
            showSystemToast("Error al cargar la información y preparar la impresión.");
        }
    };

    const handleIssueCertificate = (record) => {
        setConfirmModal({
            show: true,
            title: 'Emitir Certificado Médico',
            message: '¿Desea emitir el certificado médico para esta atención? Al confirmar, estará visible tanto para usted como para el paciente.',
            onConfirm: async () => {
                try {
                    const isEvol = record.type === 'evolucion';
                    const endpoint = isEvol
                        ? `/psicologia/historial-evolucion/${record.id}`
                        : `/psicologia/parte-diario/${record.id}`;

                    const payload = {
                        tipo_atencion: 'certificadomedico'
                    };

                    await api.put(endpoint, payload);
                    showSystemToast("Certificado médico emitido con éxito.");
                    setActiveBookRecord(prev => ({ ...prev, tipo_atencion: 'certificadomedico' }));
                    if (selectedPatient) {
                        fetchPatientHistoryByArea(selectedPatient.id_usuario || selectedPatient.id);
                    }
                } catch (error) {
                    console.error('Error al otorgar certificado:', error);
                    showSystemToast("Error al otorgar el certificado.");
                }
            }
        });
    };

    const handlePrintSessionCertificate = (record) => {
        if (!selectedPatient) return;
        try {
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                showSystemToast("El bloqueador de popups impidió abrir la ventana. Permita los popups.");
                return;
            }

            const today = new Date();
            const year = today.getFullYear();
            const months = [
                "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
            ];
            const monthName = months[today.getMonth()];
            const dayNum = today.getDate();

            const isEvol = record.type === 'evolucion';
            const diagnosis = isEvol ? 'Consulta/Evolución Psicológica' : (record.detalle_diagnostico || 'Evaluación Psicológica');

            const htmlContent = `
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <title>Certificado Psicológico</title>
                    <style>
                        body {
                            font-family: 'Georgia', Times, serif;
                            color: #1e293b;
                            margin: 0;
                            padding: 40px;
                            background-color: #ffffff;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            min-height: 100vh;
                            box-sizing: border-box;
                        }
                        .certificate-border {
                            border: 8px double #0b2240;
                            padding: 50px;
                            width: 100%;
                            max-width: 750px;
                            border-radius: 4px;
                            box-shadow: 0 0 15px rgba(0,0,0,0.05);
                            position: relative;
                            box-sizing: border-box;
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 40px;
                        }
                        .logo-main {
                            font-size: 20px;
                            font-weight: bold;
                            color: #0b2240;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                        }
                        .logo-sub {
                            font-size: 11px;
                            color: #b71a34;
                            font-weight: bold;
                            margin-top: 5px;
                            letter-spacing: 0.5px;
                        }
                        .certificate-title {
                            text-align: center;
                            font-size: 26px;
                            font-weight: bold;
                            color: #0b2240;
                            margin: 30px 0;
                            letter-spacing: 2px;
                            text-shadow: 0 1px 1px rgba(0,0,0,0.1);
                        }
                        .certificate-body {
                            font-size: 13.5px;
                            line-height: 1.8;
                            text-align: justify;
                            margin-bottom: 50px;
                        }
                        .bold-text {
                            font-weight: bold;
                            color: #000;
                        }
                        .footer-date {
                            text-align: right;
                            font-style: italic;
                            margin-bottom: 60px;
                            font-size: 12px;
                        }
                        .signatures-container {
                            display: flex;
                            justify-content: center;
                            margin-top: 40px;
                        }
                        .signature-box {
                            width: 300px;
                            text-align: center;
                        }
                        .signature-line {
                            border-top: 1.5px solid #475569;
                            margin-top: 50px;
                            margin-bottom: 6px;
                        }
                        .credentials {
                            font-size: 10.5px;
                            color: #475569;
                        }
                        @media print {
                            body {
                                padding: 0;
                                background-color: transparent;
                            }
                            .certificate-border {
                                border: 8px double #000;
                                box-shadow: none;
                                padding: 40px 30px;
                                margin: 0;
                                width: 100%;
                                max-width: 100%;
                            }
                            body, table, th, td {
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="certificate-border">
                        <div class="header">
                            <div style="margin-bottom: 12px; display: flex; justify-content: center;">
                                <img src="${logoBienestar}" alt="Bienestar Universitario UEB" style="max-height: 58px; width: auto; object-fit: contain;" />
                            </div>
                            <div class="logo-main">Universidad Estatal de Bolívar</div>
                            <div class="logo-sub">DEPARTAMENTO DE BIENESTAR UNIVERSITARIO</div>
                        </div>

                        <div class="certificate-title">CERTIFICADO CLÍNICO</div>

                        <div class="certificate-body">
                            Por medio de la presente, se hace constar y se certifica que el/la estudiante 
                            <span class="bold-text">${selectedPatient.nombre_completo}</span>, con cédula de identidad número 
                            <span class="bold-text">${selectedPatient.cedula || selectedPatient.numero_cedula || '—'}</span>, asistió 
                            a la consulta del área de <span class="bold-text">Psicología Clínica</span> el día 
                            <span class="bold-text">${record.fecha}</span>.
                            <br><br>
                            El paciente recibió atención y soporte psicoterapéutico individualizado, registrando en su ficha clínica el diagnóstico 
                            de <span class="bold-text">"${diagnosis}"</span>, mostrando una respuesta favorable y cooperativa durante la sesión.
                            <br><br>
                            Se expide el presente documento a petición de la parte interesada para los fines legales, académicos o personales pertinentes.
                        </div>

                        <div class="footer-date">
                            Dado y firmado en la ciudad de Guaranda, a los ${dayNum} días del mes de ${monthName} del año ${year}.
                        </div>

                        <div class="signatures-container">
                            <div class="signature-box">
                                <div class="signature-line"></div>
                                <strong style="font-size: 13px; color: #0f172a;">${user?.name || 'Psicólogo/a Responsable'}</strong><br>
                                <span class="credentials">Responsable del Área de Psicología</span><br>
                                <span class="credentials">Bienestar Universitario</span>
                            </div>
                        </div>
                    </div>

                    <script>
                        window.onload = function() {
                            window.print();
                        }
                    </script>
                </body>
                </html>
            `;

            printWindow.document.open();
            printWindow.document.write(htmlContent);
            printWindow.document.close();
        } catch (err) {
            console.error("Error al generar certificado:", err);
            showSystemToast("Error al preparar la impresión del certificado.");
        }
    };

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

    const toggleAccordion = (key) => {
        setActiveAccordion(prev => (prev === key ? '' : key));
    };

    return (
        <div className="nurse-shell">
            <div className="app">
                <div className={`overlay ${isSidebarOpen ? 'show' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>

                {/* SIDEBAR */}
                <aside className={`sidebar ${isSidebarOpen ? 'show' : ''}`}>
                    <div className="brand">
                        <div className="brand__logo">
                            <Brain size={20} color="white" />
                        </div>
                        <div className="brand__text">
                            <strong>Sección</strong>
                            <span>Psicología</span>
                        </div>
                        <button className="sidebar__close" onClick={() => setIsSidebarOpen(false)}>
                            <X size={18} />
                        </button>
                    </div>

                    <p className="sidebar__label">ATENCIÓN CLÍNICA</p>
                    <nav className="navigation">
                        <button
                            className={`navigation__item ${activeTab === 'ficha' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('ficha'); setIsSidebarOpen(false); }}
                        >
                            <span className="navigation__indicator"></span>
                            <span className="navigation__icon"><FileText size={18} /></span>
                            <span className="navigation__text">Consulta</span>
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
                            className={`navigation__item ${activeTab === 'evolucion' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('evolucion'); setIsSidebarOpen(false); }}
                        >
                            <span className="navigation__indicator"></span>
                            <span className="navigation__icon"><TrendingUp size={18} /></span>
                            <span className="navigation__text">Evolución</span>
                        </button>
                        <button
                            className={`navigation__item ${activeTab === 'historial' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('historial'); setIsSidebarOpen(false); }}
                        >
                            <span className="navigation__indicator"></span>
                            <span className="navigation__icon"><FileText size={18} /></span>
                            <span className="navigation__text">Reportes</span>
                        </button>
                        <button
                            className={`navigation__item ${activeTab === 'citas' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('citas'); setIsSidebarOpen(false); }}
                        >
                            <span className="navigation__indicator"></span>
                            <span className="navigation__icon"><Calendar size={18} /></span>
                            <span className="navigation__text">Gestión de Citas</span>
                        </button>
                    </nav>

                    <div className="sidebar__footer">
                        <button className="logout-button" onClick={handleLogoutClick}>
                            <span className="logout-button__icon"><LogOut size={16} /></span>
                            <span>Cerrar sesión</span>
                        </button>
                        <p className="system-version">Sistema BU · Psicología</p>
                    </div>
                </aside>

                {/* MAIN CONTENT CONTAINER */}
                <main className="main-content">
                    {/* TOPBAR */}
                    <header className="topbar">
                        <div className="topbar__left">
                            <button className="menu-button" onClick={() => setIsSidebarOpen(true)}>
                                <Menu size={20} />
                            </button>
                            <div>
                                <p className="breadcrumb">Psicología / <span>{activeTab.toUpperCase()}</span></p>
                                <h1>
                                    {activeTab === 'ficha' ? 'Consulta Médica' :
                                        activeTab === 'diario' ? 'Parte Diario de Psicología' :
                                            activeTab === 'evolucion' ? 'Seguimiento a Pacientes' :
                                                activeTab === 'citas' ? 'Gestión de Citas' : 'Historial Clínico'}
                                </h1>
                            </div>
                        </div>
                        <div className="topbar__right">
                            <NotificationMenu onNavigateToCitas={handleNavigateToCitasFromNotif} />
                            <UserProfileMenu />
                        </div>
                    </header>

                    {/* DYNAMIC SCENE CONTAINER */}
                    <div className="content">
                        {/* PESTAÑA 1: FICHA CLINICA & ANAMNESIS (¿Qué deseas realizar?) */}
                        {activeTab === 'ficha' && (
                            <div>
                                <section className="page-hero vitals-choice-hero">
                                    <div>
                                        <span className="page-hero__label"><Brain size={14} style={{ marginRight: '6px', display: 'inline' }} /> Valoración Médica</span>
                                        <h2>¿Qué deseas realizar?</h2>
                                        <p>Selecciona una acción para iniciar la atención o registrar la anamnesis de un paciente nuevo.</p>
                                    </div>
                                    <div className="page-hero__icon"><Brain size={34} /></div>
                                </section>

                                <section className="vitals-action-grid">
                                    <button
                                        className="vitals-action-card vitals-action-card--primary"
                                        onClick={() => { setModalSearchCedula(''); setModalSearchResults([]); setIsPatientSearchOpen(true); }}
                                    >
                                        <span className="vitals-action-card__glow"></span>
                                        <span className="vitals-action-card__icon"><Stethoscope size={24} /></span>
                                        <span className="vitals-action-card__content">
                                            <small>Atención General</small>
                                            <strong>Atender paciente</strong>
                                        </span>
                                        <span className="vitals-action-card__arrow"><ChevronRight size={20} /></span>
                                    </button>

                                    <button
                                        className="vitals-action-card vitals-action-card--secondary"
                                        onClick={() => {
                                            setNewPatientForm({ nombre_completo: '', tipo_documento: 'cedula', cedula: '', pais_origen: '', tipo: 'Estudiante', correo: '' });
                                            setRegisterError('');
                                            setIsPatientRegisterOpen(true);
                                        }}
                                    >
                                        <span className="vitals-action-card__glow"></span>
                                        <span className="vitals-action-card__icon"><UserPlus size={24} /></span>
                                        <span className="vitals-action-card__content">
                                            <small>Crear Nuevo Paciente</small>
                                            <strong>Registrar paciente</strong>
                                        </span>
                                        <span className="vitals-action-card__arrow"><ChevronRight size={20} /></span>
                                    </button>
                                </section>
                            </div>
                        )}

                        {/* PESTAÑA 2: PARTE DIARIO */}
                        {activeTab === 'diario' && (
                            <div>
                                <section className="page-hero">
                                    <div>
                                        <span className="page-hero__label"><ClipboardList size={14} style={{ marginRight: '6px', display: 'inline' }} /> Consulta de jornada</span>
                                        <h2>Parte diario de Psicología</h2>
                                        <p>Consulta las atenciones registradas desde Ficha y Anamnesis en la fecha indicada.</p>
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
                                                    onClick={handlePrintParteDiario}
                                                    className="action-button action-button--accent"
                                                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                                >
                                                    <FileText size={14} /> Ver Reporte
                                                </button>
                                            </div>
                                        </div>
                                    </article>

                                    <article className="nurse-card span-12" style={{ marginTop: '20px' }}>
                                        {parteDiarioLoading ? (
                                            <div style={{ textAlign: 'center', padding: '30px' }}>Cargando atenciones del diario...</div>
                                        ) : parteDiarioList.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                                No hay atenciones registradas en el diario para la fecha seleccionada.
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                <div style={{
                                                    display: 'flex',
                                                    flexWrap: 'wrap',
                                                    gap: '16px',
                                                    padding: '10px 14px',
                                                    background: '#f8fafc',
                                                    borderRadius: '8px',
                                                    marginBottom: '10px',
                                                    border: '1px dashed var(--border)',
                                                    alignItems: 'center',
                                                    fontSize: '11px',
                                                    color: 'var(--text-muted)'
                                                }}>
                                                    <strong style={{ color: 'var(--text-secondary)', marginRight: '4px' }}>Leyenda:</strong>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                                                            <HeartHandshake size={12} />
                                                        </span>
                                                        <span>Atención Primaria</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                                                            <TrendingUp size={12} />
                                                        </span>
                                                        <span>Sesión de Evolución (Secundaria)</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: '#fef3c7', color: '#d97706' }}>
                                                            <FileCheck size={12} />
                                                        </span>
                                                        <span>Certificado Médico</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: '#e9f8f2', color: 'var(--success)' }}>
                                                            <CheckCircle size={12} />
                                                        </span>
                                                        <span>Validación</span>
                                                    </div>
                                                </div>

                                                {parteDiarioList.map((item, idx) => {
                                                    const patientDetails = patientProfilesCache[item.id_usuario_paciente || item.paciente?.id] || item.paciente;
                                                    const pIdent = patientDetails?.datos_identificacion || patientDetails?.datosIdentificacion || patientDetails?.identification;
                                                    const pName = pIdent
                                                        ? `${pIdent.primer_nombre} ${pIdent.apellido_paterno}`
                                                        : patientDetails?.name || patientDetails?.email || 'Paciente';

                                                    let itemIcon = <ClipboardList size={16} />;
                                                    let iconBg = 'var(--primary-soft)';
                                                    let iconColor = 'var(--primary)';

                                                    if (item.tipo_atencion === 'primaria') {
                                                        itemIcon = <HeartHandshake size={16} />;
                                                        iconBg = 'var(--primary-soft)';
                                                        iconColor = 'var(--primary)';
                                                    } else if (item.tipo_atencion === 'secundaria') {
                                                        itemIcon = <TrendingUp size={16} />;
                                                        iconBg = 'var(--accent-soft)';
                                                        iconColor = 'var(--accent)';
                                                    } else if (item.tipo_atencion === 'certificadomedico') {
                                                        itemIcon = <FileCheck size={16} />;
                                                        iconBg = '#fef3c7';
                                                        iconColor = '#d97706';
                                                    } else if (item.tipo_atencion === 'validacion') {
                                                        itemIcon = <CheckCircle size={16} />;
                                                        iconBg = '#e9f8f2';
                                                        iconColor = 'var(--success)';
                                                    }

                                                    return (
                                                        <div key={idx} className="list-card" style={{ background: '#fafbfd' }}>
                                                            <div className="list-card__icon" style={{ background: iconBg, color: iconColor }}>
                                                                {itemIcon}
                                                            </div>
                                                            <div className="list-card__content">
                                                                <strong>{pName}</strong>
                                                                <p>Atención: {item.tipo_atencion.toUpperCase()} · Diagnóstico: {item.detalle_diagnostico}</p>
                                                            </div>
                                                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>
                                                                {item.tipo_atencion2.toUpperCase()}
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

                        {/* TAB 3: SESIONES DE EVOLUCIÓN */}
                        {activeTab === 'evolucion' && (
                            <div>
                                <section className="page-hero" style={{ marginBottom: '20px' }}>
                                    <div>
                                        <span className="page-hero__label"><TrendingUp size={14} style={{ marginRight: '6px', display: 'inline' }} /> Seguimiento Clínico</span>
                                        <h2>Evolución y Seguimiento de Pacientes</h2>
                                        <p>Consulte el expediente clínico, historial de consultas psicológicas y el seguimiento continuo de cada paciente atendido.</p>
                                    </div>
                                    <div className="page-hero__icon"><TrendingUp size={34} /></div>
                                </section>

                                <section className="nurse-card patient-selector-card" style={{ marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                            <div className="nurse-card__icon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <h3 style={{ margin: 0 }}>Paciente de Seguimiento</h3>
                                                <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '12px' }}>
                                                    {selectedPatient ? (
                                                        <strong>{selectedPatient.nombre_completo} (Cédula: {selectedPatient.cedula || selectedPatient.numero_cedula})</strong>
                                                    ) : (
                                                        "Ninguno - Debe buscar un paciente para consultar su evolución clínica."
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            className="action-button action-button--accent"
                                            onClick={() => { setModalSearchCedula(''); setModalSearchResults([]); setIsPatientSearchOpen(true); }}
                                        >
                                            <Search size={14} /> Buscar Paciente
                                        </button>
                                    </div>
                                </section>

                                {!selectedPatient ? (
                                    <div className="patient-empty-state show">
                                        <User size={40} />
                                        <strong>No hay paciente seleccionado</strong>
                                        <p>Busca e introduce un paciente para consultar su historial de psicología clínica.</p>
                                    </div>
                                ) : (
                                    <div style={{ padding: '10px 0' }}>
                                        <div style={{ marginBottom: '24px' }}>
                                            <h3 style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '18px', margin: 0 }}>Historial Clínico de Psicología</h3>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: '4px 0 0' }}>Consulte el seguimiento psicoterapéutico y consultas del paciente.</p>
                                        </div>

                                        {/* Table and Detail Grid */}
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
                                            {/* Column: Treatments List / All Consultations */}
                                            <div style={{ minWidth: 0, width: '100%' }}>
                                                {areaHistoriesLoading ? (
                                                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Cargando registros...</div>
                                                ) : !areaHistories.psicologia || areaHistories.psicologia.length === 0 ? (
                                                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontStyle: 'italic', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                                        No se registran antecedentes en psicología.
                                                    </div>
                                                ) : (
                                                    <div>
                                                        {/* Top bar with count & view mode toggle */}
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                                                                {treatments.length} {treatments.length === 1 ? 'tratamiento registrado' : 'tratamientos registrados'} · {areaHistories.psicologia.length} {areaHistories.psicologia.length === 1 ? 'cita' : 'citas en total'}
                                                            </div>
                                                            <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px', gap: '4px' }}>
                                                                <button
                                                                    type="button"
                                                                    style={{
                                                                        padding: '4px 12px',
                                                                        fontSize: '11px',
                                                                        fontWeight: 600,
                                                                        border: 'none',
                                                                        borderRadius: '6px',
                                                                        cursor: 'pointer',
                                                                        background: evolutionViewMode === 'tratamientos' ? '#ffffff' : 'transparent',
                                                                        color: evolutionViewMode === 'tratamientos' ? 'var(--primary)' : 'var(--text-muted)',
                                                                        boxShadow: evolutionViewMode === 'tratamientos' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                                                                    }}
                                                                    onClick={() => setEvolutionViewMode('tratamientos')}
                                                                >
                                                                    Agrupado por Tratamiento
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    style={{
                                                                        padding: '4px 12px',
                                                                        fontSize: '11px',
                                                                        fontWeight: 600,
                                                                        border: 'none',
                                                                        borderRadius: '6px',
                                                                        cursor: 'pointer',
                                                                        background: evolutionViewMode === 'todas' ? '#ffffff' : 'transparent',
                                                                        color: evolutionViewMode === 'todas' ? 'var(--primary)' : 'var(--text-muted)',
                                                                        boxShadow: evolutionViewMode === 'todas' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                                                                    }}
                                                                    onClick={() => setEvolutionViewMode('todas')}
                                                                >
                                                                    Todas las Citas
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {evolutionViewMode === 'tratamientos' ? (
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                                                {treatments.slice().reverse().map(treatment => {
                                                                    const isExpanded = expandedTreatments[treatment.id] !== undefined
                                                                        ? expandedTreatments[treatment.id]
                                                                        : (treatment.estado === 'en_curso' || treatments.length === 1);

                                                                    return (
                                                                        <div
                                                                            key={treatment.id}
                                                                            style={{
                                                                                background: '#ffffff',
                                                                                border: treatment.estado === 'en_curso' ? '1.5px solid rgba(0, 32, 64, 0.22)' : '1px solid #e2e8f0',
                                                                                borderRadius: '12px',
                                                                                overflow: 'hidden',
                                                                                boxShadow: treatment.estado === 'en_curso' ? '0 4px 12px rgba(0, 32, 64, 0.06)' : '0 1px 4px rgba(0,0,0,0.03)',
                                                                                transition: 'all 0.2s ease'
                                                                            }}
                                                                        >
                                                                            {/* Header */}
                                                                            <div
                                                                                style={{
                                                                                    padding: '12px 16px',
                                                                                    display: 'flex',
                                                                                    justifyContent: 'space-between',
                                                                                    alignItems: 'center',
                                                                                    cursor: 'pointer',
                                                                                    background: isExpanded ? 'rgba(0, 32, 64, 0.02)' : '#ffffff',
                                                                                    borderBottom: isExpanded ? '1px solid #edf2f7' : 'none',
                                                                                    gap: '12px',
                                                                                    flexWrap: 'wrap'
                                                                                }}
                                                                                onClick={() => toggleTreatment(treatment.id, treatment.estado === 'en_curso')}
                                                                            >
                                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 240px', minWidth: 0 }}>
                                                                                    <div style={{
                                                                                        width: '36px',
                                                                                        height: '36px',
                                                                                        borderRadius: '10px',
                                                                                        background: treatment.estado === 'en_curso' ? 'var(--primary-soft)' : '#f1f5f9',
                                                                                        color: treatment.estado === 'en_curso' ? 'var(--primary)' : '#64748b',
                                                                                        display: 'flex',
                                                                                        alignItems: 'center',
                                                                                        justifyContent: 'center',
                                                                                        flexShrink: 0
                                                                                    }}>
                                                                                        <HeartHandshake size={19} />
                                                                                    </div>
                                                                                    <div style={{ minWidth: 0 }}>
                                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                                                            <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.4px' }}>
                                                                                                Tratamiento #{treatment.numero}
                                                                                            </span>
                                                                                            {treatment.estado === 'en_curso' ? (
                                                                                                <span style={{ fontSize: '10px', fontWeight: 700, background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                                                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }}></span> En Curso
                                                                                                </span>
                                                                                            ) : (
                                                                                                <span style={{ fontSize: '10px', fontWeight: 600, background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '10px' }}>
                                                                                                    ✓ Cerrado
                                                                                                </span>
                                                                                            )}
                                                                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                                                                · {treatment.citas.length} {treatment.citas.length === 1 ? 'cita' : 'citas'}
                                                                                            </span>
                                                                                        </div>
                                                                                        <h4 style={{ margin: '3px 0 0', fontSize: '13px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={treatment.diagnostico}>
                                                                                            {treatment.diagnostico}
                                                                                        </h4>
                                                                                        <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
                                                                                            Inicio: <strong>{treatment.fecha_inicio}</strong> {treatment.fecha_fin !== treatment.fecha_inicio ? `· Última: ${treatment.fecha_fin}` : ''}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>

                                                                                <button
                                                                                    type="button"
                                                                                    className="action-button action-button--light"
                                                                                    style={{ fontSize: '11px', padding: '4px 10px', minHeight: '28px', borderRadius: '7px', display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        toggleTreatment(treatment.id, treatment.estado === 'en_curso');
                                                                                    }}
                                                                                >
                                                                                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                                                    <span>{isExpanded ? 'Ocultar Citas' : `Desplegar Citas (${treatment.citas.length})`}</span>
                                                                                </button>
                                                                            </div>

                                                                            {/* Citas del Tratamiento Desplegadas */}
                                                                            {isExpanded && (
                                                                                <div style={{ padding: '8px', background: '#fafbfc' }}>
                                                                                    <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                                                                                        <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', textAlign: 'left', margin: 0 }}>
                                                                                            <colgroup>
                                                                                                <col style={{ width: '80px' }} />
                                                                                                <col style={{ width: '85px' }} />
                                                                                                <col style={{ width: '88px' }} />
                                                                                                <col style={{ width: 'auto' }} />
                                                                                                <col style={{ width: '92px' }} />
                                                                                            </colgroup>
                                                                                            <thead>
                                                                                                <tr style={{ background: '#fafcff', borderBottom: '1px solid #e2e8f0' }}>
                                                                                                    <th style={{ padding: '8px 10px', fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>Cita</th>
                                                                                                    <th style={{ padding: '8px 10px', fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>Fecha</th>
                                                                                                    <th style={{ padding: '8px 10px', fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>Nivel</th>
                                                                                                    <th style={{ padding: '8px 10px', fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>Detalle Clínico</th>
                                                                                                    <th style={{ padding: '8px 10px', fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', textAlign: 'center' }}>Acción</th>
                                                                                                </tr>
                                                                                            </thead>
                                                                                            <tbody>
                                                                                                {treatment.citas.map((cita, cIdx) => (
                                                                                                    <tr
                                                                                                        key={cita.id || cIdx}
                                                                                                        style={{
                                                                                                            borderBottom: cIdx === treatment.citas.length - 1 ? 'none' : '1px solid #f1f5f9',
                                                                                                            background: activeBookRecord?.id === cita.id ? 'rgba(0, 32, 64, 0.05)' : 'transparent',
                                                                                                            cursor: 'pointer',
                                                                                                            transition: 'background 0.15s ease'
                                                                                                        }}
                                                                                                        onClick={() => setActiveBookRecord(cita)}
                                                                                                    >
                                                                                                        <td style={{ padding: '8px 10px', fontWeight: 700, color: 'var(--primary)', fontSize: '11px', whiteSpace: 'nowrap' }}>
                                                                                                            {cIdx === 0 ? 'Cita #1' : `Cita #${cIdx + 1}`}
                                                                                                        </td>
                                                                                                        <td style={{ padding: '8px 10px', fontSize: '11px', color: '#334155', whiteSpace: 'nowrap' }}>
                                                                                                            {(cita.fecha || cita.created_at || '').slice(0, 10)}
                                                                                                        </td>
                                                                                                        <td style={{ padding: '8px 10px' }}>
                                                                                                            <span style={{
                                                                                                                background: (cita.tipo_atencion === 'primaria' || cIdx === 0) ? 'var(--primary-soft)' : 'var(--accent-soft)',
                                                                                                                color: (cita.tipo_atencion === 'primaria' || cIdx === 0) ? 'var(--primary)' : 'var(--accent)',
                                                                                                                padding: '2px 7px',
                                                                                                                borderRadius: '5px',
                                                                                                                fontSize: '10px',
                                                                                                                fontWeight: 700,
                                                                                                                display: 'inline-block',
                                                                                                                whiteSpace: 'nowrap'
                                                                                                            }}>
                                                                                                                {(cita.tipo_atencion === 'primaria' || cIdx === 0) ? 'Primaria' : 'Secundaria'}
                                                                                                            </span>
                                                                                                        </td>
                                                                                                        <td
                                                                                                            style={{
                                                                                                                padding: '8px 10px',
                                                                                                                fontSize: '11px',
                                                                                                                color: '#475569',
                                                                                                                overflow: 'hidden',
                                                                                                                textOverflow: 'ellipsis',
                                                                                                                whiteSpace: 'nowrap'
                                                                                                            }}
                                                                                                            title={cita.detalle_evolucion || cita.detalle_diagnostico || cita.detalle_motivo || 'Consulta registrada'}
                                                                                                        >
                                                                                                            {cita.detalle_evolucion || cita.detalle_diagnostico || cita.detalle_motivo || 'Consulta registrada'}
                                                                                                        </td>
                                                                                                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                                                                                            <button
                                                                                                                type="button"
                                                                                                                className="action-button action-button--primary"
                                                                                                                style={{
                                                                                                                    fontSize: '10.5px',
                                                                                                                    minHeight: '26px',
                                                                                                                    padding: '0 8px',
                                                                                                                    borderRadius: '6px',
                                                                                                                    whiteSpace: 'nowrap',
                                                                                                                    width: '100%',
                                                                                                                    maxWidth: '82px',
                                                                                                                    display: 'inline-flex',
                                                                                                                    alignItems: 'center',
                                                                                                                    justifyContent: 'center'
                                                                                                                }}
                                                                                                                onClick={(e) => {
                                                                                                                    e.stopPropagation();
                                                                                                                    setActiveBookRecord(cita);
                                                                                                                }}
                                                                                                            >
                                                                                                                Ver Detalle
                                                                                                            </button>
                                                                                                        </td>
                                                                                                    </tr>
                                                                                                ))}
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
                                                            /* Vista de todas las citas */
                                                            <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
                                                                <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', textAlign: 'left', margin: 0 }}>
                                                                    <colgroup>
                                                                        <col style={{ width: '85px' }} />
                                                                        <col style={{ width: '110px' }} />
                                                                        <col style={{ width: '90px' }} />
                                                                        <col style={{ width: 'auto' }} />
                                                                        <col style={{ width: '92px' }} />
                                                                    </colgroup>
                                                                    <thead>
                                                                        <tr style={{ background: '#fafcff', borderBottom: '1px solid #e2e8f0' }}>
                                                                            <th style={{ padding: '9px 10px', fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>Fecha</th>
                                                                            <th style={{ padding: '9px 10px', fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>Tratamiento</th>
                                                                            <th style={{ padding: '9px 10px', fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>Nivel</th>
                                                                            <th style={{ padding: '9px 10px', fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>Detalle / Diagnóstico</th>
                                                                            <th style={{ padding: '9px 10px', fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', textAlign: 'center' }}>Acción</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {areaHistories.psicologia.map((record, index) => {
                                                                            const isPrimaria = record.tipo_atencion === 'primaria';
                                                                            return (
                                                                                <tr
                                                                                    key={record.id || index}
                                                                                    style={{
                                                                                        borderBottom: index === areaHistories.psicologia.length - 1 ? 'none' : '1px solid #f1f5f9',
                                                                                        background: activeBookRecord?.id === record.id ? 'rgba(0, 32, 64, 0.05)' : 'transparent',
                                                                                        cursor: 'pointer'
                                                                                    }}
                                                                                    onClick={() => setActiveBookRecord(record)}
                                                                                >
                                                                                    <td style={{ padding: '9px 10px', fontSize: '11px', color: '#334155', whiteSpace: 'nowrap' }}>
                                                                                        {(record.fecha || record.created_at || '').slice(0, 10)}
                                                                                    </td>
                                                                                    <td style={{ padding: '9px 10px' }}>
                                                                                        {record.treatment ? (
                                                                                            <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--primary)', background: '#f1f5f9', padding: '2px 6px', borderRadius: '5px' }}>
                                                                                                Tratamiento #{record.treatment.numero}
                                                                                            </span>
                                                                                        ) : (
                                                                                            <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>-</span>
                                                                                        )}
                                                                                    </td>
                                                                                    <td style={{ padding: '9px 10px' }}>
                                                                                        <span style={{
                                                                                            background: isPrimaria ? 'var(--primary-soft)' : 'var(--accent-soft)',
                                                                                            color: isPrimaria ? 'var(--primary)' : 'var(--accent)',
                                                                                            padding: '2px 7px',
                                                                                            borderRadius: '5px',
                                                                                            fontSize: '10px',
                                                                                            fontWeight: 700,
                                                                                            display: 'inline-block',
                                                                                            whiteSpace: 'nowrap'
                                                                                        }}>
                                                                                            {isPrimaria ? 'Primaria' : 'Secundaria'}
                                                                                        </span>
                                                                                    </td>
                                                                                    <td
                                                                                        style={{
                                                                                            padding: '9px 10px',
                                                                                            fontSize: '11px',
                                                                                            color: '#475569',
                                                                                            overflow: 'hidden',
                                                                                            textOverflow: 'ellipsis',
                                                                                            whiteSpace: 'nowrap'
                                                                                        }}
                                                                                        title={record.detalle_evolucion || record.detalle_diagnostico || record.detalle_motivo || 'Ver detalles'}
                                                                                    >
                                                                                        {record.detalle_evolucion || record.detalle_diagnostico || record.detalle_motivo || 'Ver detalles'}
                                                                                    </td>
                                                                                    <td style={{ padding: '9px 10px', textAlign: 'center' }}>
                                                                                        <button
                                                                                            type="button"
                                                                                            className="action-button action-button--primary"
                                                                                            style={{
                                                                                                fontSize: '10.5px',
                                                                                                minHeight: '26px',
                                                                                                padding: '0 8px',
                                                                                                borderRadius: '6px',
                                                                                                whiteSpace: 'nowrap',
                                                                                                width: '100%',
                                                                                                maxWidth: '82px'
                                                                                            }}
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                setActiveBookRecord(record);
                                                                                            }}
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
                                                <div
                                                    style={{
                                                        background: '#ffffff',
                                                        borderRadius: '14px',
                                                        border: '1.5px solid rgba(0, 32, 64, 0.12)',
                                                        boxShadow: '0 6px 20px rgba(0, 32, 64, 0.07)',
                                                        padding: '20px',
                                                        position: 'sticky',
                                                        top: '20px',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '14px'
                                                    }}
                                                >
                                                    {/* Header */}
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #edf2f7', paddingBottom: '12px', gap: '10px' }}>
                                                        <div style={{ minWidth: 0 }}>
                                                            <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 800, letterSpacing: '0.5px', display: 'block' }}>
                                                                Detalle Clínico de Consulta
                                                            </span>
                                                            <h4 style={{ margin: '3px 0 0', fontSize: '14.5px', color: 'var(--primary)', fontWeight: 800 }}>
                                                                {activeBookRecord.recordTitle || (activeBookRecord.type === 'evolucion' ? 'Sesión de Evolución' : 'Atención Psicológica')}
                                                            </h4>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                                                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                                    Fecha: <strong>{(activeBookRecord.fecha || activeBookRecord.created_at || '').slice(0, 10)}</strong>
                                                                </span>
                                                                {activeBookRecord.treatment && (
                                                                    <span style={{
                                                                        fontSize: '10px',
                                                                        fontWeight: 700,
                                                                        background: activeBookRecord.treatment.estado === 'en_curso' ? '#dcfce7' : '#f1f5f9',
                                                                        color: activeBookRecord.treatment.estado === 'en_curso' ? '#15803d' : '#64748b',
                                                                        padding: '2px 8px',
                                                                        borderRadius: '10px',
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        gap: '3px'
                                                                    }}>
                                                                        Tratamiento #{activeBookRecord.treatment.numero} ({activeBookRecord.treatment.estado === 'en_curso' ? 'En Curso' : 'Cerrado'})
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                                            <button
                                                                type="button"
                                                                className="action-button action-button--accent"
                                                                style={{ fontSize: '11px', minHeight: '30px', padding: '0 10px', borderRadius: '7px', display: 'flex', alignItems: 'center', gap: '5px' }}
                                                                onClick={() => handleDownloadHistoriaClinicaPdf(selectedPatient.id_usuario || selectedPatient.id, activeBookRecord?.id)}
                                                                title="Descargar Historia Clínica PDF"
                                                            >
                                                                <FileText size={13} /> PDF
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="action-button action-button--light"
                                                                style={{ minHeight: '30px', width: '30px', padding: 0, borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                                onClick={() => setActiveBookRecord(null)}
                                                                title="Cerrar detalle"
                                                            >
                                                                <X size={15} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Content Fields */}
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                        {/* Nivel de Atención */}
                                                        <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                            <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, display: 'block', letterSpacing: '0.4px' }}>
                                                                Nivel de Atención
                                                            </span>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                                                                <span style={{
                                                                    background: activeBookRecord.tipo_atencion === 'primaria' ? 'var(--primary-soft)' : 'var(--accent-soft)',
                                                                    color: activeBookRecord.tipo_atencion === 'primaria' ? 'var(--primary)' : 'var(--accent)',
                                                                    padding: '2px 8px',
                                                                    borderRadius: '5px',
                                                                    fontSize: '11px',
                                                                    fontWeight: 700
                                                                }}>
                                                                    {activeBookRecord.tipo_atencion === 'primaria' ? 'Primaria (Primera Vez)' : activeBookRecord.tipo_atencion === 'secundaria' ? 'Secundaria (Evolución)' : (activeBookRecord.tipo_atencion || 'Atención General')}
                                                                </span>
                                                                <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'capitalize' }}>
                                                                    · {activeBookRecord.tipo_atencion2 || 'Curativo'}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Diagnóstico Clínico */}
                                                        {(activeBookRecord.detalle_diagnostico || activeBookRecord.diagnostico) && (
                                                            <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, display: 'block', letterSpacing: '0.4px' }}>
                                                                    Diagnóstico Clínico
                                                                </span>
                                                                <p style={{ margin: '3px 0 0', fontSize: '12.5px', fontWeight: 600, color: '#0f172a' }}>
                                                                    {activeBookRecord.detalle_diagnostico || activeBookRecord.diagnostico}
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* Evolución / Notas Clínicas */}
                                                        {(activeBookRecord.detalle_evolucion || activeBookRecord.detalle_motivo) && (
                                                            <div style={{ background: '#f5f3ff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd6fe' }}>
                                                                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#6d28d9', fontWeight: 700, display: 'block', letterSpacing: '0.4px' }}>
                                                                    Detalle de Evolución Psicológica
                                                                </span>
                                                                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#3b0764', lineHeight: '1.5', fontStyle: 'italic' }}>
                                                                    {activeBookRecord.detalle_evolucion || activeBookRecord.detalle_motivo}
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* Procedimiento */}
                                                        {activeBookRecord.procedimiento && (
                                                            <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, display: 'block', letterSpacing: '0.4px' }}>
                                                                    Procedimiento / Terapia Aplicada
                                                                </span>
                                                                <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#334155' }}>
                                                                    {activeBookRecord.procedimiento}
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* Prescripción */}
                                                        {activeBookRecord.prescripcion_medica && (
                                                            <div style={{ background: '#f0fdf4', padding: '10px 12px', borderRadius: '8px', border: '1px solid #99f6e4' }}>
                                                                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#0f766e', fontWeight: 700, display: 'block', letterSpacing: '0.4px' }}>
                                                                    Prescripción / Recomendaciones
                                                                </span>
                                                                <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#134e4a', lineHeight: '1.4' }}>
                                                                    {activeBookRecord.prescripcion_medica}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Footer Actions */}
                                                    <div style={{ paddingTop: '8px', borderTop: '1px solid #edf2f7' }}>
                                                        {activeBookRecord.tipo_atencion === 'certificadomedico' ? (
                                                            <button
                                                                type="button"
                                                                className="action-button action-button--accent"
                                                                onClick={() => handlePrintSessionCertificate(activeBookRecord)}
                                                                style={{ width: '100%', fontWeight: 700, fontSize: '12px', minHeight: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: '8px' }}
                                                            >
                                                                <Printer size={15} /> Imprimir Certificado
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                className="action-button action-button--accent"
                                                                onClick={() => handleIssueCertificate(activeBookRecord)}
                                                                style={{ width: '100%', fontWeight: 700, fontSize: '12px', minHeight: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: '8px' }}
                                                            >
                                                                <FileCheck size={15} /> Otorgar Certificado
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 4: HISTORIAL CLINICO GENERAL */}
                        {activeTab === 'historial' && (
                            <div>
                                <section className="page-hero" style={{ marginBottom: '20px' }}>
                                    <div>
                                        <span className="page-hero__label"><FileText size={14} style={{ marginRight: '6px', display: 'inline' }} /> Reportes y Gestión</span>
                                        <h2>Centro de Reportes de Psicología</h2>
                                        <p>Genere, visualice e imprima los informes oficiales requeridos para las auditorías y entrega a sus superiores.</p>
                                    </div>
                                    <div className="page-hero__icon"><FileText size={34} /></div>
                                </section>

                                {/* Liquid Navigation for Reports */}
                                <div className="liquid-nav" style={{ marginBottom: '20px' }}>
                                    <button
                                        className={`liquid-nav__item ${activeReportSubTab === 'diario' ? 'active' : ''}`}
                                        onClick={() => setActiveReportSubTab('diario')}
                                    >
                                        <ClipboardList size={16} />
                                        <span>Parte Diario</span>
                                    </button>
                                    <button
                                        className={`liquid-nav__item ${activeReportSubTab === 'citas' ? 'active' : ''}`}
                                        onClick={() => setActiveReportSubTab('citas')}
                                    >
                                        <CalendarCheck size={16} />
                                        <span>Reporte de Citas</span>
                                    </button>
                                </div>

                                {/* Report Content Area */}
                                {activeReportSubTab === 'diario' && (
                                    <div>
                                        <section className="nurse-card daily-header-card" style={{ marginBottom: '20px' }}>
                                            <div className="daily-date-control" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '15px' }}>
                                                <div>
                                                    <span className="eyebrow">REPORTE DIARIO DE ATENCIONES</span>
                                                    <h3>Parte Diario de la Jornada</h3>
                                                    <p>Seleccione una fecha para visualizar y descargar el reporte del día.</p>
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
                                                        onClick={handlePrintParteDiario}
                                                        className="action-button action-button--accent"
                                                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                                    >
                                                        <Printer size={14} /> Imprimir Reporte
                                                    </button>
                                                </div>
                                            </div>
                                        </section>

                                        <section className="nurse-card">
                                            <div className="nurse-card__header">
                                                <div>
                                                    <span className="eyebrow">REGISTROS</span>
                                                    <h3>Listado de Atenciones</h3>
                                                </div>
                                            </div>
                                            <div className="evolution-table-container" style={{ marginTop: '15px' }}>
                                                {parteDiarioLoading ? (
                                                    <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>Cargando atenciones...</div>
                                                ) : parteDiarioList.length === 0 ? (
                                                    <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                                        No hay atenciones registradas para la fecha seleccionada.
                                                    </div>
                                                ) : (
                                                    <table className="evolution-table">
                                                        <thead>
                                                            <tr>
                                                                <th>Hora</th>
                                                                <th>Paciente</th>
                                                                <th>Cédula</th>
                                                                <th>Tipo Atención</th>
                                                                <th>Diagnóstico / Observación</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {parteDiarioList.map((item, idx) => {
                                                                const patientDetails = patientProfilesCache[item.id_usuario_paciente || item.paciente?.id] || item.paciente;
                                                                const pIdent = patientDetails?.datos_identificacion || patientDetails?.datosIdentificacion || patientDetails?.identification;
                                                                const pName = pIdent
                                                                    ? `${pIdent.primer_nombre || ''} ${pIdent.apellido_paterno || ''}`.trim()
                                                                    : patientDetails?.name || item.paciente_nombre || '—';
                                                                const pCedula = pIdent?.numero_cedula || item.paciente_cedula || '—';

                                                                let displayHora = '—';
                                                                if (item.hora_inicio) {
                                                                    displayHora = item.hora_inicio;
                                                                } else if (item.created_at) {
                                                                    try {
                                                                        const dateObj = new Date(item.created_at.replace(' ', 'T'));
                                                                        if (!isNaN(dateObj.getTime())) {
                                                                            displayHora = dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
                                                                        }
                                                                    } catch (e) {
                                                                        console.error("Error parsing created_at time:", e);
                                                                    }
                                                                }

                                                                return (
                                                                    <tr key={item.id || idx}>
                                                                        <td style={{ fontWeight: 'bold' }}>{displayHora}</td>
                                                                        <td>{pName}</td>
                                                                        <td>{pCedula}</td>
                                                                        <td>
                                                                            <span className={`evolution-badge evolution-badge--${item.tipo_atencion === 'primaria' ? 'medicina' : item.tipo_atencion === 'secundaria' ? 'psicologia' : 'odontologia'}`}>
                                                                                {item.tipo_atencion === 'primaria' ? 'Primaria' : item.tipo_atencion === 'secundaria' ? 'Secundaria' : 'Certificado'}
                                                                            </span>
                                                                        </td>
                                                                        <td>{item.detalle_diagnostico || '—'}</td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                )}
                                            </div>
                                        </section>
                                    </div>
                                )}

                                {activeReportSubTab === 'citas' && (
                                    <div>
                                        <section className="nurse-card daily-header-card" style={{ marginBottom: '20px' }}>
                                            <div className="daily-date-control" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '15px' }}>
                                                <div>
                                                    <span className="eyebrow">REPORTE GESTIÓN DE CITAS</span>
                                                    <h3>Reporte de Citas Programadas</h3>
                                                    <p>Seleccione la fecha y estado para exportar el reporte gerencial.</p>
                                                </div>
                                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
                                                        <span>Fecha:</span>
                                                        <input
                                                            type="date"
                                                            value={reportCitasFecha}
                                                            onChange={(e) => setReportCitasFecha(e.target.value)}
                                                            style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px', outline: 0 }}
                                                        />
                                                    </label>
                                                    <select
                                                        value={reportCitasEstado}
                                                        onChange={(e) => setReportCitasEstado(e.target.value)}
                                                        style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px', fontSize: '11px', outline: 0, background: 'white' }}
                                                    >
                                                        <option value="all">Todos los Estados</option>
                                                        <option value="programada">Programadas</option>
                                                        <option value="confirmada">Confirmadas</option>
                                                        <option value="completada">Completadas</option>
                                                        <option value="cancelada">Canceladas</option>
                                                    </select>
                                                    <button
                                                        onClick={handlePrintReporteCitasRango}
                                                        className="action-button action-button--accent"
                                                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                                    >
                                                        <Printer size={14} /> Imprimir Reporte
                                                    </button>
                                                </div>
                                            </div>
                                        </section>

                                        <section className="nurse-card">
                                            <div className="nurse-card__header">
                                                <div>
                                                    <span className="eyebrow">REGISTROS</span>
                                                    <h3>Citas Filtradas ({reportCitasList.length})</h3>
                                                </div>
                                            </div>
                                            <div className="evolution-table-container" style={{ marginTop: '15px' }}>
                                                {reportCitasLoading ? (
                                                    <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>Cargando citas...</div>
                                                ) : reportCitasList.length === 0 ? (
                                                    <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                                        No hay citas que coincidan con los filtros establecidos.
                                                    </div>
                                                ) : (
                                                    <table className="evolution-table">
                                                        <thead>
                                                            <tr>
                                                                <th>Fecha</th>
                                                                <th>Hora</th>
                                                                <th>Paciente</th>
                                                                <th>Cédula</th>
                                                                <th>Motivo</th>
                                                                <th>Estado</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {reportCitasList.map((cita, idx) => {
                                                                const pIdent = cita.paciente?.datos_identificacion || cita.paciente?.datosIdentificacion || cita.paciente?.identification || {};
                                                                const fullName = `${pIdent.primer_nombre || ''} ${pIdent.apellido_paterno || ''}`.trim() || cita.paciente?.name || cita.paciente?.email || '—';
                                                                const cedula = pIdent.numero_cedula || '—';
                                                                return (
                                                                    <tr key={cita.id || idx}>
                                                                        <td style={{ fontWeight: 'bold' }}>{cita.fecha}</td>
                                                                        <td>{cita.hora_inicio} - {cita.hora_fin}</td>
                                                                        <td>{fullName}</td>
                                                                        <td>{cedula}</td>
                                                                        <td>{cita.motivo || '—'}</td>
                                                                        <td>
                                                                            <span className={`evolution-badge evolution-badge--\${cita.estado === 'completada' ? 'enfermeria' : cita.estado === 'cancelada' ? 'odontologia' : cita.estado === 'confirmada' ? 'medicina' : 'psicologia'}`}>
                                                                                {cita.estado}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                )}
                                            </div>
                                        </section>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* PESTAÑA 5: GESTIÓN DE CITAS */}
                        {activeTab === 'citas' && (
                            <div className="citas-manager" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <section className="page-hero">
                                    <div>
                                        <span className="page-hero__label"><Calendar size={14} style={{ marginRight: '6px', display: 'inline' }} /> Control de Agenda</span>
                                        <h2>Agenda de Consultas de Psicología</h2>
                                        <p>Gestione las citas programadas, el control de asistencias y la agenda de atenciones psicológicas de estudiantes y funcionarios.</p>
                                    </div>
                                    <div className="page-hero__icon"><Calendar size={34} /></div>
                                </section>

                                <div className="card" style={{ borderRadius: '14px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', boxShadow: 'var(--shadow-sm)' }}>
                                    <div>
                                        <span className="eyebrow">AGENDA POR FECHA</span>
                                        <h3 style={{ fontSize: '15px', fontWeight: '750', margin: '4px 0 0', color: 'var(--primary)' }}>Citas Programadas</h3>
                                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Seleccione una fecha para visualizar y gestionar la agenda del día.</p>
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

                                {citasLoading ? (
                                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Cargando agenda de citas...</span>
                                    </div>
                                ) : citasList.length === 0 ? (
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
                                                        const pIdent = cita.paciente?.datos_identificacion || cita.paciente?.datosIdentificacion || cita.paciente?.identification;
                                                        const patientName = pIdent
                                                            ? `${pIdent.primer_nombre} ${pIdent.segundo_nombre || ''} ${pIdent.apellido_paterno} ${pIdent.apellido_materno || ''}`.replace(/\s+/g, ' ').trim()
                                                            : cita.paciente?.name || 'Paciente';

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
                                                                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Cédula: {pIdent?.numero_cedula || 'N/D'}</div>
                                                                </td>
                                                                <td style={{ padding: '14px 16px' }}>
                                                                    <div style={{ fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text)' }}>
                                                                        <Clock size={13} style={{ color: 'var(--accent)' }} />
                                                                        {cita.hora_inicio} - {cita.hora_fin}
                                                                    </div>
                                                                </td>
                                                                <td style={{ padding: '14px 16px', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                                                                    {cita.motivo || 'Consulta general'}
                                                                    {cita.notas_doctor && (
                                                                        <div style={{ fontSize: '10.5px', color: '#b45309', marginTop: '2px' }}>
                                                                            <strong>Mis Notas:</strong> {cita.notas_doctor}
                                                                        </div>
                                                                    )}
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
                                                                    {cita.confirmada_por_paciente && (
                                                                        <div style={{ marginTop: '4px', fontSize: '10px', color: '#15803d', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                                            <CheckCircle size={11} color="#15803d" /> Confirmada por paciente
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                                                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                                                        {['programada', 'confirmada'].includes(cita.estado) && (
                                                                            <>
                                                                                <button
                                                                                    onClick={() => {
                                                                                        const patObj = cita.paciente ? {
                                                                                            id: cita.paciente.id,
                                                                                            id_usuario: cita.paciente.id,
                                                                                            name: `${cita.paciente.datos_identificacion?.primer_nombre || cita.paciente.name || ''} ${cita.paciente.datos_identificacion?.apellido_paterno || ''}`.trim(),
                                                                                            nombre_completo: `${cita.paciente.datos_identificacion?.primer_nombre || cita.paciente.name || ''} ${cita.paciente.datos_identificacion?.apellido_paterno || ''}`.trim(),
                                                                                            datosIdentificacion: cita.paciente.datosIdentificacion || cita.paciente.datos_identificacion
                                                                                        } : { id: cita.id_usuario_paciente, id_usuario: cita.id_usuario_paciente };
                                                                                        handleSelectPatient(patObj, true);
                                                                                    }}
                                                                                    className="action-button action-button--primary"
                                                                                    style={{ fontSize: '11px', minHeight: '30px', padding: '0 10px', borderRadius: '6px', background: 'var(--primary)', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                                                                >
                                                                                    <Stethoscope size={13} /> Atender
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => { setCompletingCita(cita); setNotasDoctor(''); }}
                                                                                    className="action-button action-button--accent"
                                                                                    style={{ fontSize: '11px', minHeight: '30px', padding: '0 10px', borderRadius: '6px' }}
                                                                                >
                                                                                    Completar
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => handleCancelarCita(cita.id)}
                                                                                    className="action-button action-button--light"
                                                                                    style={{ fontSize: '11px', minHeight: '30px', padding: '0 10px', borderRadius: '6px', color: '#b91c1c' }}
                                                                                >
                                                                                    Cancelar
                                                                                </button>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>

                                        {Math.ceil(citasList.length / CITAS_PER_PAGE) > 1 && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: 'var(--surface-hover)', borderTop: '1px solid var(--border)' }}>
                                                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                                                    Mostrando {((citasPage - 1) * CITAS_PER_PAGE) + 1} - {Math.min(citasPage * CITAS_PER_PAGE, citasList.length)} de {citasList.length} citas
                                                </span>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <button
                                                        disabled={citasPage === 1}
                                                        onClick={() => setCitasPage(p => Math.max(1, p - 1))}
                                                        style={{ opacity: citasPage === 1 ? 0.5 : 1, padding: '4px 10px', borderRadius: '6px', fontSize: '11px', border: '1px solid var(--border)', cursor: citasPage === 1 ? 'not-allowed' : 'pointer' }}
                                                    >
                                                        Anterior
                                                    </button>
                                                    <span style={{ fontSize: '11.5px', padding: '4px 8px', fontWeight: '600', color: 'var(--text)' }}>
                                                        Página {citasPage} de {Math.ceil(citasList.length / CITAS_PER_PAGE)}
                                                    </span>
                                                    <button
                                                        disabled={citasPage === Math.ceil(citasList.length / CITAS_PER_PAGE)}
                                                        onClick={() => setCitasPage(p => Math.min(Math.ceil(citasList.length / CITAS_PER_PAGE), p + 1))}
                                                        style={{ opacity: citasPage === Math.ceil(citasList.length / CITAS_PER_PAGE) ? 0.5 : 1, padding: '4px 10px', borderRadius: '6px', fontSize: '11px', border: '1px solid var(--border)', cursor: citasPage === Math.ceil(citasList.length / CITAS_PER_PAGE) ? 'not-allowed' : 'pointer' }}
                                                    >
                                                        Siguiente
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* MODAL GLOBAL: BUSCADOR DE PACIENTE */}
            {isPatientSearchOpen && (
                <div className="clinical-modal show">
                    <div className="clinical-modal__backdrop" onClick={() => setIsPatientSearchOpen(false)}></div>
                    <div className="clinical-modal__dialog clinical-modal__dialog--compact">
                        <header className="clinical-modal__header">
                            <div className="clinical-modal__patient">
                                <div className="clinical-modal__avatar"><Search size={18} /></div>
                                <div>
                                    <span>Buscador clínico</span>
                                    <h2>Buscar Paciente por Cédula</h2>
                                </div>
                            </div>
                            <button className="clinical-modal__close" onClick={() => setIsPatientSearchOpen(false)}><X size={16} /></button>
                        </header>

                        <div className="clinical-modal__body">
                            <form onSubmit={handleModalSearch} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <div className="patient-search-input" style={{ flex: 1 }}>
                                    <Search size={16} />
                                    <input
                                        value={modalSearchCedula}
                                        onChange={(e) => handleInputChange(e.target.value)}
                                        placeholder="Ingrese número de cédula o nombre del paciente..."
                                        required
                                    />
                                </div>
                                <button className="action-button action-button--accent" type="submit" disabled={modalSearchLoading} style={{ minHeight: '46px', borderRadius: '12px' }}>
                                    {modalSearchLoading ? "Buscando..." : "Buscar"}
                                </button>
                            </form>

                            {modalSearchError && (
                                <div style={{ marginTop: '15px', color: '#b71a34', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <AlertTriangle size={14} /> {modalSearchError}
                                </div>
                            )}

                            <div style={{ marginTop: '20px' }}>
                                {modalSearchResults.map((pat, idx) => (
                                    <div key={idx} className="patient-suggestion" style={{ gridTemplateColumns: '1fr auto', display: 'grid' }}>
                                        <div className="patient-suggestion__identity">
                                            <strong>{pat.nombre_completo || pat.name || 'Sin nombre'}</strong>
                                            <small>Cédula: {pat.cedula} · Correo: {pat.email || 'N/D'}</small>
                                        </div>
                                        <button className="attend-patient-button" onClick={() => handleSelectPatient(pat)}>
                                            Seleccionar <ChevronRight size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL GLOBAL: REGISTRAR NUEVO PACIENTE */}
            {isPatientRegisterOpen && (
                <div className="clinical-modal show">
                    <div className="clinical-modal__backdrop" onClick={() => setIsPatientRegisterOpen(false)}></div>
                    <div className="clinical-modal__dialog clinical-modal__dialog--compact">
                        <header className="clinical-modal__header">
                            <div className="clinical-modal__patient">
                                <span className="clinical-modal__avatar"><UserPlus size={18} /></span>
                                <div>
                                    <span>Registro de usuario</span>
                                    <h2>Nuevo Paciente</h2>
                                </div>
                            </div>
                            <button className="clinical-modal__close" onClick={() => setIsPatientRegisterOpen(false)}><X size={15} /></button>
                        </header>
                        <form onSubmit={handleQuickRegisterPatient} className="clinical-modal__body">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div className="premium-field-card">
                                    <div className="field-header">
                                        <div className="field-header__left">
                                            <span className="field-header__icon"><User size={15} /></span>
                                            <h4 className="field-header__title">Nombres y Apellidos Completos <span className="field-req-star">*</span></h4>
                                        </div>
                                    </div>
                                    <input
                                        value={newPatientForm.nombre_completo}
                                        onChange={(e) => setNewPatientForm({ ...newPatientForm, nombre_completo: e.target.value })}
                                        placeholder="Ingrese nombres y apellidos de acuerdo a la cédula o pasaporte"
                                        required
                                        style={{ border: !newPatientForm.nombre_completo ? '1.5px solid #b71a34' : '1.5px solid var(--border)' }}
                                    />
                                </div>

                                <div className="clinical-fields-grid">
                                    <div className="premium-field-card">
                                        <div className="field-header">
                                            <div className="field-header__left">
                                                <span className="field-header__icon"><FileText size={15} /></span>
                                                <h4 className="field-header__title">Tipo de Documento <span className="field-req-star">*</span></h4>
                                            </div>
                                        </div>
                                        <select
                                            value={newPatientForm.tipo_documento}
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
                                                    {newPatientForm.tipo_documento === 'pasaporte' ? 'Número de Pasaporte' : 'Número de Cédula'} <span className="field-req-star">*</span>
                                                </h4>
                                            </div>
                                        </div>
                                        <input
                                            value={newPatientForm.cedula}
                                            onChange={(e) => setNewPatientForm({ ...newPatientForm, cedula: e.target.value })}
                                            placeholder={newPatientForm.tipo_documento === 'pasaporte' ? 'Ej. AB123456' : 'Ej. 0201234567'}
                                            required
                                            style={{ border: !newPatientForm.cedula ? '1.5px solid #b71a34' : '1.5px solid var(--border)' }}
                                        />
                                    </div>
                                </div>

                                <div className="clinical-fields-grid">
                                    <div className="premium-field-card" style={{ gridColumn: newPatientForm.tipo_documento === 'pasaporte' ? 'span 1' : 'span 2' }}>
                                        <div className="field-header">
                                            <div className="field-header__left">
                                                <span className="field-header__icon"><UserCheck size={15} /></span>
                                                <h4 className="field-header__title">Tipo de Paciente <span className="field-req-star">*</span></h4>
                                            </div>
                                        </div>
                                        <select
                                            value={newPatientForm.id_tipo_usuario || 2}
                                            onChange={(e) => setNewPatientForm({ ...newPatientForm, id_tipo_usuario: parseInt(e.target.value) })}
                                            required
                                        >
                                            <option value={2}>Estudiante Universitario</option>
                                            <option value={3}>Docente / Profesor</option>
                                            <option value={4}>Personal Administrativo</option>
                                            <option value={5}>Servidor Público / Código de Trabajo</option>
                                        </select>
                                    </div>

                                    {newPatientForm.tipo_documento === 'pasaporte' && (
                                        <div className="premium-field-card">
                                            <div className="field-header">
                                                <div className="field-header__left">
                                                    <span className="field-header__icon"><MapPin size={15} /></span>
                                                    <h4 className="field-header__title">País de Origen <span className="field-req-star">*</span></h4>
                                                </div>
                                            </div>
                                            <select
                                                value={newPatientForm.pais_origen}
                                                onChange={(e) => setNewPatientForm({ ...newPatientForm, pais_origen: e.target.value })}
                                                required
                                            >
                                                <option value="">-- Seleccione un país --</option>
                                                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    )}
                                </div>

                                <div className="premium-field-card">
                                    <div className="field-header">
                                        <div className="field-header__left">
                                            <span className="field-header__icon"><Mail size={15} /></span>
                                            <h4 className="field-header__title">Correo Electrónico Institucional <span className="field-req-star">*</span></h4>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', border: !newPatientForm.correo ? '1.5px solid #b71a34' : '1.5px solid var(--border)', borderRadius: '12px', padding: '0 16px', background: '#ffffff', minHeight: '46px', boxSizing: 'border-box' }}>
                                        <input
                                            type="text"
                                            value={newPatientForm.correo}
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
                                <button className="action-button action-button--light" type="button" onClick={() => setIsPatientRegisterOpen(false)}>Cancelar</button>
                                <button className="action-button action-button--accent" type="submit" disabled={registerLoading}>
                                    {registerLoading ? 'Registrando...' : 'Registrar paciente'}
                                </button>
                            </footer>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL GLOBAL: FORMULARIO DE FICHA CLÍNICA & ANAMNESIS */}
            {isFichaModalOpen && (
                <div className="clinical-modal show">
                    <div className="clinical-modal__backdrop" onClick={handleCancelFicha}></div>
                    <section className="clinical-modal__dialog">
                        <header className="clinical-modal__header">
                            <div className="clinical-modal__patient">
                                <span className="clinical-modal__avatar">FC</span>
                                <div>
                                    <span>Anamnesis e Historial</span>
                                    <h2>{selectedPatient?.nombre_completo}</h2>
                                    <p>Cédula: {selectedPatient?.cedula || selectedPatient?.numero_cedula}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {draftLastSaved && !isOffline && (
                                    <span className="header-autosave-badge" title={`Borrador respaldado automáticamente a las ${draftLastSaved}`}>
                                        <CheckCircle size={13} color="#f87171" /> Guardado {draftLastSaved}
                                    </span>
                                )}
                                <button className="clinical-modal__close" onClick={handleCancelFicha}><X size={15} /></button>
                            </div>
                        </header>
                        <div className="clinical-modal__body">
                            {isOffline && (
                                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '10px 16px', borderRadius: '10px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', fontWeight: '600' }}>
                                    <AlertTriangle size={16} color="#dc2626" />
                                    <span>Conexión a internet perdida. Tus avances se están guardando localmente en tiempo real.</span>
                                </div>
                            )}
                            {fichaLoading ? (
                                <div style={{ textAlign: 'center', padding: '40px' }}>Cargando datos clínicos del paciente...</div>
                            ) : (
                                <div className="anamnesis-container">
                                    {/* STEPPER CLINICO */}
                                    <div className="clinical-stepper">
                                        {steps.map((step, idx) => (
                                            <React.Fragment key={step.key}>
                                                <div
                                                    className={`stepper-step ${currentStepIndex === idx ? 'active' : ''} ${currentStepIndex > idx ? 'completed' : ''}`}
                                                    onClick={() => setCurrentStepIndex(idx)}
                                                >
                                                    <div className="stepper-step__circle">{idx + 1}</div>
                                                    <span className="stepper-step__label">{step.label}</span>
                                                </div>
                                                {idx < steps.length - 1 && <div className="stepper-separator" />}
                                            </React.Fragment>
                                        ))}
                                    </div>

                                    {/* CONTENIDO DEL PASO ACTIVO */}
                                    <div className="anamnesis-section-card" style={{ border: 'none', boxShadow: 'none' }}>
                                        <div className="anamnesis-section-body" style={{ padding: '0' }}>
                                            {currentStepIndex === 0 && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                        <h3 style={{ fontSize: '15px', color: 'var(--primary)', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <Brain size={18} color="var(--accent)" /> 1. Motivo de Consulta y Anamnesis
                                                        </h3>
                                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Paso 1 de 5</span>
                                                    </div>

                                                    <div className="premium-field-card">
                                                        <div className="field-header">
                                                            <div className="field-header__left">
                                                                <span className="field-header__icon"><Brain size={15} /></span>
                                                                <h4 className="field-header__title">Motivo de Consulta Principal <span className="field-req-star">*</span></h4>
                                                            </div>
                                                        </div>
                                                        <textarea
                                                            value={fichaForm.detalle_motivo}
                                                            onChange={(e) => setFichaForm(prev => ({ ...prev, detalle_motivo: e.target.value }))}
                                                            placeholder="Describa el motivo principal manifestado por el paciente o derivación clínica..."
                                                            rows={3}
                                                            style={getInputStyle(fichaForm.detalle_motivo)}
                                                        />
                                                        <span className="field-hint">Defina los síntomas o causas prioritarias de consulta.</span>
                                                    </div>

                                                    <div className="clinical-fields-grid">
                                                        <div className="premium-field-card">
                                                            <div className="field-header">
                                                                <div className="field-header__left">
                                                                    <span className="field-header__icon"><User size={15} /></span>
                                                                    <h4 className="field-header__title">Anamnesis Personal <span className="field-req-star">*</span></h4>
                                                                </div>
                                                            </div>
                                                            <textarea
                                                                value={fichaForm.psicoanamnesis_personal}
                                                                onChange={(e) => setFichaForm(prev => ({ ...prev, psicoanamnesis_personal: e.target.value }))}
                                                                placeholder="Antecedentes psicológicos, desarrollo biopsicosocial e hitos vitales del paciente..."
                                                                rows={4}
                                                                style={getInputStyle(fichaForm.psicoanamnesis_personal)}
                                                            />
                                                        </div>
                                                        <div className="premium-field-card">
                                                            <div className="field-header">
                                                                <div className="field-header__left">
                                                                    <span className="field-header__icon"><HeartHandshake size={15} /></span>
                                                                    <h4 className="field-header__title">Anamnesis Familiar <span className="field-req-star">*</span></h4>
                                                                </div>
                                                            </div>
                                                            <textarea
                                                                value={fichaForm.psicoanamnesis_familiar}
                                                                onChange={(e) => setFichaForm(prev => ({ ...prev, psicoanamnesis_familiar: e.target.value }))}
                                                                placeholder="Dinámica familiar, antecedentes psiquiátricos o psicosociales en el núcleo de origen..."
                                                                rows={4}
                                                                style={getInputStyle(fichaForm.psicoanamnesis_familiar)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {currentStepIndex === 1 && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                        <h3 style={{ fontSize: '15px', color: 'var(--primary)', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <FileText size={18} color="var(--accent)" /> 2. Historial de Vida y Patologías
                                                        </h3>
                                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Paso 2 de 5</span>
                                                    </div>

                                                    <div className="clinical-fields-grid">
                                                        <div className="premium-field-card">
                                                            <div className="field-header">
                                                                <div className="field-header__left">
                                                                    <span className="field-header__icon"><Briefcase size={15} /></span>
                                                                    <h4 className="field-header__title">Historial Laboral / Académico <span className="field-req-star">*</span></h4>
                                                                </div>
                                                            </div>
                                                            <textarea
                                                                value={fichaForm.detalle_laboral}
                                                                onChange={(e) => setFichaForm(prev => ({ ...prev, detalle_laboral: e.target.value }))}
                                                                placeholder="Adaptabilidad académica/laboral, desempeño, nivel de estrés o sobrecarga..."
                                                                rows={3}
                                                                style={getInputStyle(fichaForm.detalle_laboral)}
                                                            />
                                                        </div>
                                                        <div className="premium-field-card">
                                                            <div className="field-header">
                                                                <div className="field-header__left">
                                                                    <span className="field-header__icon"><UserCheck size={15} /></span>
                                                                    <h4 className="field-header__title">Historial Social y Entorno <span className="field-req-star">*</span></h4>
                                                                </div>
                                                            </div>
                                                            <textarea
                                                                value={fichaForm.detalle_social}
                                                                onChange={(e) => setFichaForm(prev => ({ ...prev, detalle_social: e.target.value }))}
                                                                placeholder="Redes de apoyo, habilidades interpersonales, actividades recreativas..."
                                                                rows={3}
                                                                style={getInputStyle(fichaForm.detalle_social)}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="clinical-fields-grid">
                                                        <div className="premium-field-card">
                                                            <div className="field-header">
                                                                <div className="field-header__left">
                                                                    <span className="field-header__icon"><Heart size={15} /></span>
                                                                    <h4 className="field-header__title">Historial Sexual y de Pareja <span className="field-req-star">*</span></h4>
                                                                </div>
                                                            </div>
                                                            <textarea
                                                                value={fichaForm.detalle_sexual}
                                                                onChange={(e) => setFichaForm(prev => ({ ...prev, detalle_sexual: e.target.value }))}
                                                                placeholder="Vida afectiva, relación de pareja, estabilidad emocional y ámbito psicosexual..."
                                                                rows={3}
                                                                style={getInputStyle(fichaForm.detalle_sexual)}
                                                            />
                                                        </div>
                                                        <div className="premium-field-card">
                                                            <div className="field-header">
                                                                <div className="field-header__left">
                                                                    <span className="field-header__icon"><Activity size={15} /></span>
                                                                    <h4 className="field-header__title">Patologías y Antecedentes Clínicos <span className="field-req-star">*</span></h4>
                                                                </div>
                                                            </div>
                                                            <textarea
                                                                value={fichaForm.detalle_patologia}
                                                                onChange={(e) => setFichaForm(prev => ({ ...prev, detalle_patologia: e.target.value }))}
                                                                placeholder="Diagnósticos médicos o psiquiátricos previos, medicación actual, consumo de sustancias..."
                                                                rows={3}
                                                                style={getInputStyle(fichaForm.detalle_patologia)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {currentStepIndex === 2 && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                        <h3 style={{ fontSize: '15px', color: 'var(--primary)', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <Activity size={18} color="var(--accent)" /> 3. Examen del Estado Mental
                                                        </h3>
                                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Paso 3 de 5</span>
                                                    </div>

                                                    {/* CLUSTER 1: APARIENCIA Y CONDUCTA */}
                                                    <div className="mental-cluster">
                                                        <div className="mental-cluster__header">
                                                            <div className="mental-cluster__icon"><Eye size={18} /></div>
                                                            <div className="mental-cluster__title">
                                                                <h4>Cluster I: Apariencia, Actitud y Juicio</h4>
                                                                <p>Observación conductual directa e inspección clínica inicial</p>
                                                            </div>
                                                        </div>
                                                        <div className="mental-status-grid">
                                                            <div className="mental-status-card">
                                                                <label><Eye size={13} style={{ color: 'var(--accent)' }} /> Apariencia física</label>
                                                                <input value={fichaForm.apariencia} onChange={(e) => setFichaForm(prev => ({ ...prev, apariencia: e.target.value }))} placeholder="Ej. Aseado, alineado, marcha normal..." />
                                                            </div>
                                                            <div className="mental-status-card">
                                                                <label><UserCheck size={13} style={{ color: 'var(--accent)' }} /> Actitud inicial</label>
                                                                <input value={fichaForm.actitud} onChange={(e) => setFichaForm(prev => ({ ...prev, actitud: e.target.value }))} placeholder="Ej. Colaboradora, reservada, evasiva..." />
                                                            </div>
                                                            <div className="mental-status-card">
                                                                <label><Compass size={13} style={{ color: 'var(--accent)' }} /> Juicio y raciocinio</label>
                                                                <input value={fichaForm.juicio} onChange={(e) => setFichaForm(prev => ({ ...prev, juicio: e.target.value }))} placeholder="Ej. Conservado, introspección presente..." />
                                                            </div>
                                                            <div className="mental-status-card">
                                                                <label><Activity size={13} style={{ color: 'var(--accent)' }} /> Conducta motora</label>
                                                                <input value={fichaForm.conducta_motora} onChange={(e) => setFichaForm(prev => ({ ...prev, conducta_motora: e.target.value }))} placeholder="Ej. Eutónico, intranquilidad psicomotora..." />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* CLUSTER 2: ESFERA AFECTIVA Y FISIOLÓGICA */}
                                                    <div className="mental-cluster">
                                                        <div className="mental-cluster__header">
                                                            <div className="mental-cluster__icon" style={{ background: '#0b3155' }}><Smile size={18} /></div>
                                                            <div className="mental-cluster__title">
                                                                <h4>Cluster II: Esfera Afectiva y Constantes Fisiológicas</h4>
                                                                <p>Valoración de estado de ánimo, patrones de descanso y alimentación</p>
                                                            </div>
                                                        </div>
                                                        <div className="mental-status-grid">
                                                            <div className="mental-status-card">
                                                                <label><Clock size={13} style={{ color: 'var(--primary)' }} /> Calidad del sueño</label>
                                                                <input value={fichaForm.sueno} onChange={(e) => setFichaForm(prev => ({ ...prev, sueno: e.target.value }))} placeholder="Ej. Insomnio de conciliación, reparador..." />
                                                            </div>
                                                            <div className="mental-status-card">
                                                                <label><Heart size={13} style={{ color: 'var(--primary)' }} /> Apetito y nutrición</label>
                                                                <input value={fichaForm.apetito} onChange={(e) => setFichaForm(prev => ({ ...prev, apetito: e.target.value }))} placeholder="Ej. Normorexia, hiporexia..." />
                                                            </div>
                                                            <div className="mental-status-card">
                                                                <label><Smile size={13} style={{ color: 'var(--primary)' }} /> Afectividad y estado de ánimo</label>
                                                                <input value={fichaForm.afectividad} onChange={(e) => setFichaForm(prev => ({ ...prev, afectividad: e.target.value }))} placeholder="Ej. Eutímico, anhedonia, lábil, congruente..." />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* CLUSTER 3: ESFERA COGNITIVA, LENGUAJE Y PENSAMIENTO */}
                                                    <div className="mental-cluster">
                                                        <div className="mental-cluster__header">
                                                            <div className="mental-cluster__icon" style={{ background: '#b71a34' }}><Brain size={18} /></div>
                                                            <div className="mental-cluster__title">
                                                                <h4>Cluster III: Funciones Cognitivas y Procesos del Pensamiento</h4>
                                                                <p>Orientación, capacidad atencional, memoria y estructuración del discurso</p>
                                                            </div>
                                                        </div>
                                                        <div className="mental-status-grid">
                                                            <div className="mental-status-card">
                                                                <label><Compass size={13} style={{ color: 'var(--accent)' }} /> Orientación</label>
                                                                <input value={fichaForm.orientacion} onChange={(e) => setFichaForm(prev => ({ ...prev, orientacion: e.target.value }))} placeholder="Ej. Autopsíquica y alopsíquica conservada..." />
                                                            </div>
                                                            <div className="mental-status-card">
                                                                <label><Zap size={13} style={{ color: 'var(--accent)' }} /> Atención y concentración</label>
                                                                <input value={fichaForm.atencion} onChange={(e) => setFichaForm(prev => ({ ...prev, atencion: e.target.value }))} placeholder="Ej. Normoproséxico, hipoproséxico..." />
                                                            </div>
                                                            <div className="mental-status-card">
                                                                <label><FileText size={13} style={{ color: 'var(--accent)' }} /> Memoria</label>
                                                                <input value={fichaForm.memoria} onChange={(e) => setFichaForm(prev => ({ ...prev, memoria: e.target.value }))} placeholder="Ej. Conservada reciente y remota..." />
                                                            </div>
                                                            <div className="mental-status-card">
                                                                <label><MessageSquare size={13} style={{ color: 'var(--accent)' }} /> Lenguaje</label>
                                                                <input value={fichaForm.lenguaje} onChange={(e) => setFichaForm(prev => ({ ...prev, lenguaje: e.target.value }))} placeholder="Ej. Fluido, tono modulado, coherente..." />
                                                            </div>
                                                            <div className="mental-status-card" style={{ gridColumn: 'span 2' }}>
                                                                <label><Brain size={13} style={{ color: 'var(--accent)' }} /> Curso y contenido del pensamiento</label>
                                                                <input value={fichaForm.pensamiento} onChange={(e) => setFichaForm(prev => ({ ...prev, pensamiento: e.target.value }))} placeholder="Ej. Lógico, estructurado, ausente de ideación delirante..." />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {currentStepIndex === 3 && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                        <h3 style={{ fontSize: '15px', color: 'var(--primary)', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <TrendingUp size={18} color="var(--accent)" /> 4. Pruebas Aplicadas y Análisis
                                                        </h3>
                                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Paso 4 de 5</span>
                                                    </div>

                                                    <div className="clinical-fields-grid">
                                                        <div className="premium-field-card">
                                                            <div className="field-header">
                                                                <div className="field-header__left">
                                                                    <span className="field-header__icon"><FileText size={15} /></span>
                                                                    <h4 className="field-header__title">Pruebas Psicométricas / Proyectivas <span className="field-req-star">*</span></h4>
                                                                </div>
                                                            </div>
                                                            <textarea
                                                                value={fichaForm.detalle_prueba_aplicada}
                                                                onChange={(e) => setFichaForm(prev => ({ ...prev, detalle_prueba_aplicada: e.target.value }))}
                                                                placeholder="Detalle reactivos o pruebas administradas (Ej. BDI-II, HTP, WAIS-IV, Inventario de Ansiedad de Beck)..."
                                                                rows={4}
                                                                style={getInputStyle(fichaForm.detalle_prueba_aplicada)}
                                                            />
                                                        </div>
                                                        <div className="premium-field-card">
                                                            <div className="field-header">
                                                                <div className="field-header__left">
                                                                    <span className="field-header__icon"><TrendingUp size={15} /></span>
                                                                    <h4 className="field-header__title">Análisis e Interpretación de Resultados <span className="field-req-star">*</span></h4>
                                                                </div>
                                                            </div>
                                                            <textarea
                                                                value={fichaForm.detalle_analisis_resultados}
                                                                onChange={(e) => setFichaForm(prev => ({ ...prev, detalle_analisis_resultados: e.target.value }))}
                                                                placeholder="Síntesis cuantitativa/cualitativa de puntajes, patrones de conducta y correlación clínica..."
                                                                rows={4}
                                                                style={getInputStyle(fichaForm.detalle_analisis_resultados)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {currentStepIndex === 4 && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                        <h3 style={{ fontSize: '15px', color: 'var(--primary)', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <CheckCircle size={18} color="var(--accent)" /> 5. Conclusiones, Diagnóstico y Diario Estadístico
                                                        </h3>
                                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Paso 5 de 5</span>
                                                    </div>

                                                    <div className="clinical-fields-grid">
                                                        <div className="premium-field-card">
                                                            <div className="field-header">
                                                                <div className="field-header__left">
                                                                    <span className="field-header__icon"><Brain size={15} /></span>
                                                                    <h4 className="field-header__title">Conclusiones Clínicas <span className="field-req-star">*</span></h4>
                                                                </div>
                                                            </div>
                                                            <textarea
                                                                value={fichaForm.detalle_conclusion}
                                                                onChange={(e) => setFichaForm(prev => ({ ...prev, detalle_conclusion: e.target.value }))}
                                                                placeholder="Conclusiones conceptuales del caso psicoterapéutico..."
                                                                rows={3}
                                                                style={getInputStyle(fichaForm.detalle_conclusion)}
                                                            />
                                                        </div>
                                                        <div className="premium-field-card">
                                                            <div className="field-header">
                                                                <div className="field-header__left">
                                                                    <span className="field-header__icon"><CheckCircle size={15} /></span>
                                                                    <h4 className="field-header__title">Diagnóstico Clínico (CIE-10 / DSM-5) <span className="field-req-star">*</span></h4>
                                                                </div>
                                                            </div>
                                                            <textarea
                                                                value={fichaForm.detalle_diagnostico}
                                                                onChange={(e) => setFichaForm(prev => ({ ...prev, detalle_diagnostico: e.target.value }))}
                                                                placeholder="Ingrese código y denominación diagnóstica (Ej. F41.1 Trastorno de ansiedad generalizada)..."
                                                                rows={3}
                                                                required
                                                                style={getInputStyle(fichaForm.detalle_diagnostico)}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="clinical-fields-grid">
                                                        <div className="premium-field-card">
                                                            <div className="field-header">
                                                                <div className="field-header__left">
                                                                    <span className="field-header__icon"><TrendingUp size={15} /></span>
                                                                    <h4 className="field-header__title">Pronóstico Clínico <span className="field-req-star">*</span></h4>
                                                                </div>
                                                            </div>
                                                            <textarea
                                                                value={fichaForm.detalle_pronostico}
                                                                onChange={(e) => setFichaForm(prev => ({ ...prev, detalle_pronostico: e.target.value }))}
                                                                placeholder="Evolución proyectada de la sintomatología según adherencia al plan..."
                                                                rows={3}
                                                                style={getInputStyle(fichaForm.detalle_pronostico)}
                                                            />
                                                        </div>
                                                        <div className="premium-field-card">
                                                            <div className="field-header">
                                                                <div className="field-header__left">
                                                                    <span className="field-header__icon"><FileText size={15} /></span>
                                                                    <h4 className="field-header__title">Recomendaciones y Plan Terapéutico <span className="field-req-star">*</span></h4>
                                                                </div>
                                                            </div>
                                                            <textarea
                                                                value={fichaForm.detalle_recomendacion}
                                                                onChange={(e) => setFichaForm(prev => ({ ...prev, detalle_recomendacion: e.target.value }))}
                                                                placeholder="Pautas psicoterapéuticas, frecuencia de sesiones, derivaciones o tareas en casa..."
                                                                rows={3}
                                                                style={getInputStyle(fichaForm.detalle_recomendacion)}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* PARTE DIARIO AUTOMÁTICO */}
                                                    <div className="premium-field-card" style={{ background: '#f8fafc', borderColor: 'rgba(0,32,64,0.12)' }}>
                                                        <div className="field-header">
                                                            <div className="field-header__left">
                                                                <span className="field-header__icon" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}><ClipboardList size={16} /></span>
                                                                <div>
                                                                    <h4 className="field-header__title">Registro Estadístico en Diario de Atención</h4>
                                                                    <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Asocia automáticamente la consulta al informe estadístico de la jornada.</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="clinical-fields-grid" style={{ marginTop: '6px' }}>
                                                            <div className="field">
                                                                <span>Nivel de Atención *</span>
                                                                <select
                                                                    value={fichaForm.tipo_atencion}
                                                                    onChange={(e) => setFichaForm(prev => ({ ...prev, tipo_atencion: e.target.value }))}
                                                                    required
                                                                    style={getInputStyle(fichaForm.tipo_atencion)}
                                                                >
                                                                    <option value="primaria">Primaria (Primera Vez)</option>
                                                                    <option value="secundaria">Secundaria (Subsecuente / Evolución)</option>
                                                                </select>
                                                                {fichaForm.tipo_atencion === 'primaria' ? (
                                                                    <div style={{ fontSize: '10.5px', color: '#1e40af', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                                        <Info size={12} />
                                                                        <span>Inicia un nuevo tratamiento (cierra el tratamiento anterior si existía uno activo).</span>
                                                                    </div>
                                                                ) : (
                                                                    <div style={{ fontSize: '10.5px', color: '#047857', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                                        <Info size={12} />
                                                                        <span>Continúa el tratamiento activo como sesión de evolución y seguimiento.</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="field">
                                                                <span>Tipo de Atención *</span>
                                                                <select
                                                                    value={fichaForm.tipo_atencion2}
                                                                    onChange={(e) => setFichaForm(prev => ({ ...prev, tipo_atencion2: e.target.value }))}
                                                                    required
                                                                    style={getInputStyle(fichaForm.tipo_atencion2)}
                                                                >
                                                                    <option value="curativo">Curativo (Tratamiento / Psicoterapia)</option>
                                                                    <option value="preventivo">Preventivo (Orientación / Tamizaje)</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* FOOTER DE PASOS */}
                                    <footer className="clinical-modal__actions" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                                        <button type="button" className="action-button action-button--light" onClick={handlePrevStep} disabled={currentStepIndex === 0 || fichaSaving}>
                                            Atrás
                                        </button>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button type="button" className="action-button action-button--danger" onClick={handleCancelFicha} disabled={fichaSaving}>
                                                Cancelar
                                            </button>
                                            {currentStepIndex < steps.length - 1 ? (
                                                <button type="button" className="action-button action-button--primary" onClick={handleSaveAndContinue} disabled={fichaSaving}>
                                                    {fichaSaving ? 'Guardando...' : 'Guardar y continuar'}
                                                </button>
                                            ) : (
                                                <button type="button" className="action-button action-button--success" onClick={handleSaveAndFinish} disabled={fichaSaving}>
                                                    {fichaSaving ? 'Guardando...' : 'Guardar y finalizar'}
                                                </button>
                                            )}
                                        </div>
                                    </footer>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            )}

            {/* TOAST SYSTEM */}
            <div className={`toast ${toast.show ? 'show' : ''}`}>
                <CheckCircle size={16} /> <span>{toast.message}</span>
            </div>

            {/* MODAL DE FEEDBACK DE GUARDADO */}
            {saveFeedback.show && createPortal(
                <div className="clinical-modal show" style={{ position: 'fixed', inset: 0, zIndex: 9999999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="clinical-modal__backdrop" onClick={(e) => { e.stopPropagation(); setSaveFeedback(prev => ({ ...prev, show: false })); }} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(6px)' }}></div>
                    <div className="clinical-modal__dialog clinical-modal__dialog--compact" style={{ maxWidth: '400px', borderRadius: '16px', overflow: 'hidden', position: 'relative', zIndex: 10, margin: 'auto' }} onClick={(e) => e.stopPropagation()}>
                        <header className="clinical-modal__header" style={{ background: saveFeedback.success ? 'var(--primary)' : '#b71a34', color: '#fff', padding: '16px 20px' }}>
                            <div className="clinical-modal__patient" style={{ gap: '10px' }}>
                                <span className="clinical-modal__avatar" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {saveFeedback.success ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                                </span>
                                <div>
                                    <h2 style={{ fontSize: '15px', color: '#fff', margin: 0 }}>{saveFeedback.title}</h2>
                                </div>
                            </div>
                            <button className="clinical-modal__close" onClick={(e) => { e.stopPropagation(); setSaveFeedback(prev => ({ ...prev, show: false })); }} style={{ color: '#fff' }}><X size={15} /></button>
                        </header>
                        <div className="clinical-modal__body" style={{ padding: '24px 20px', textAlign: 'center' }}>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 20px' }}>
                                {saveFeedback.message}
                            </p>
                            <button
                                className="action-button action-button--accent"
                                onClick={(e) => { e.stopPropagation(); setSaveFeedback(prev => ({ ...prev, show: false })); }}
                                style={{ width: '100%', minHeight: '40px', borderRadius: '10px', background: saveFeedback.success ? 'var(--primary)' : '#b71a34', border: 0, color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* MODAL DEL LIBRO DE HISTORIAL POR ÁREA - REMOVED */}

            {/* MODAL DE CONFIRMACIÓN CUSTOM */}
            {confirmModal.show && (
                <div className="modal show" style={{ zIndex: 999999, position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', display: 'grid', placeItems: 'center' }}>
                    <div className="modal__backdrop" onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}></div>
                    <div className="modal__content" style={{ border: 'none', position: 'relative', zIndex: 1000000, margin: 'auto' }}>
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

            {/* MODAL GLOBAL: COMPLETAR CITA CON NOTAS */}
            {completingCita && (
                <div className="clinical-modal show" style={{ zIndex: 9999 }}>
                    <div className="clinical-modal__backdrop" onClick={() => setCompletingCita(null)}></div>
                    <div className="clinical-modal__dialog clinical-modal__dialog--compact" style={{ maxWidth: '480px' }}>
                        <header className="clinical-modal__header">
                            <div className="clinical-modal__patient">
                                <span className="clinical-modal__avatar"><FileText size={18} /></span>
                                <div>
                                    <span>Completar Consulta</span>
                                    <h2>{completingCita.paciente?.datos_identificacion
                                        ? `${completingCita.paciente.datos_identificacion.primer_nombre} ${completingCita.paciente.datos_identificacion.apellido_paterno}`
                                        : completingCita.paciente?.name || 'Paciente'}</h2>
                                </div>
                            </div>
                            <button className="clinical-modal__close" onClick={() => setCompletingCita(null)}><X size={15} /></button>
                        </header>
                        <form onSubmit={handleCompletarCitaSubmit} className="clinical-modal__body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="premium-field-card">
                                <div className="field-header">
                                    <div className="field-header__left">
                                        <span className="field-header__icon"><FileText size={15} /></span>
                                        <h4 className="field-header__title">Notas Clínicas y Observaciones <span className="field-req-star">*</span></h4>
                                    </div>
                                </div>
                                <textarea
                                    required
                                    value={notasDoctor}
                                    onChange={(e) => setNotasDoctor(e.target.value)}
                                    placeholder="Registre la síntesis de la consulta, recomendaciones o pautas acordadas con el paciente..."
                                    rows={4}
                                    style={{ width: '100%', minHeight: '110px' }}
                                />
                                <span className="field-hint">Estas observaciones quedarán registradas en el historial de la cita.</span>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
                                <button type="button" className="action-button action-button--light" onClick={() => setCompletingCita(null)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="action-button action-button--primary" disabled={savingNotas}>
                                    {savingNotas ? "Guardando..." : "Guardar y Completar"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <HelpPanel
                helpItems={[
                    { title: 'Paso 1: Buscar o Seleccionar Paciente', content: 'Ingrese el número de cédula del paciente en la barra superior derecha y haga clic en Buscar. Seleccione al paciente de los resultados.' },
                    { title: 'Paso 2: Registrar Ficha Psicológica', content: 'Llene las secciones del expediente incluyendo Psicoanamnesis (Personal y Familiar), Historial Laboral, Social y Sexual, y el Examen del Estado Mental. Cada sección cuenta con su propio botón Guardar.' },
                    { title: 'Paso 3: Diagnóstico y Pruebas Aplicadas', content: 'Registre los resultados de las pruebas aplicadas, el análisis del caso, las conclusiones diagnósticas correspondientes y el pronóstico del paciente.' },
                    { title: 'Paso 4: Ver Historial y Exportar PDF', content: 'Abra el Libro de Historiales del paciente, seleccione la sesión correspondiente y haga clic en "Abrir PDF Completo" para ver el informe psicoterapéutico en una nueva pestaña listo para imprimir.' }
                ]}
                contactInfo={{ email: 'soporte@ueb.edu.ec' }}
            />
        </div>
    );
};

export default Psicologo_page;
