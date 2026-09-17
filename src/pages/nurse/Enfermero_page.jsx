import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import api from '../../api/axios';
import '../../medical.css';
import HelpPanel from '../../components/HelpPanel';
import UserProfileMenu from '../../components/UserProfileMenu';
import PasswordRequirements from '../../components/PasswordRequirements';
import { useClinicalDraft } from '../../hooks/useClinicalDraft';
import VitalSignsHistogram from '../../components/VitalSignsHistogram';
import FarmaciaInventarioTab from '../../components/farmacia/FarmaciaInventarioTab';
import FarmaciaDespachoTab from '../../components/farmacia/FarmaciaDespachoTab';
import FarmaciaPresentacionesTab from '../../components/farmacia/FarmaciaPresentacionesTab';

// Importación de iconos de Lucide
import {
    HeartPulse,
    Search,
    Activity,
    ClipboardList,
    BriefcaseMedical,
    History,
    LogOut,
    Menu,
    Bell,
    ChevronDown,
    ShieldCheck,
    Pill,
    PackageCheck,
    Boxes,
    UserSearch,
    ScanLine,
    Stethoscope,
    ChevronRight,
    UserPlus,
    Pencil,
    Save,
    X,
    Syringe,
    Bandage,
    Wind,
    Scissors,
    Droplets,
    ListChecks,
    Check,
    CalendarCheck,
    CalendarDays,
    ChevronLeft,
    Download,
    FileText,
    CheckCircle,
    BarChart3,
    UserRound,
    Trash2,
    AlertTriangle,
    Eye,
    Clock,
    Thermometer,
    Ruler,
    Scale,
    MapPin,
    User,
    Brain,
    Shield,
    BookOpen,
    Mail,
    Globe,
    Printer,
    UserCheck,
    HeartHandshake,
    TrendingUp,
    FileCheck,
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
    'República Dominicana', 'República del Congo', 'Ruanda', 'Rumanía', 'Rusia', 'Samoa',
    'San Cristóbal y Nieves', 'San Marino', 'San Vicente y las Granadinas', 'Santa Lucía',
    'Santo Tomé y Príncipe', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leona', 'Singapur', 'Siria',
    'Somalia', 'Sri Lanka', 'Suazilandia', 'Sudáfrica', 'Sudán', 'Sudán del Sur', 'Suecia', 'Suiza',
    'Surinam', 'Tailandia', 'Tanzania', 'Tayikistán', 'Timor Oriental', 'Togo', 'Tonga',
    'Trinidad y Tobago', 'Túnez', 'Turkmenistán', 'Turquía', 'Tuvalu', 'Ucrania', 'Uganda',
    'Uruguay', 'Uzbekistán', 'Vanuatu', 'Venezuela', 'Vietnam', 'Yemen', 'Yibuti', 'Zambia', 'Zimbabue'
];

const Enfermero_page = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    // Estado para cambiar de pestaña activa
    // 'vitals' | 'diario' | 'catalog' | 'historial'
    const [activeTab, setActiveTab] = useState('vitals');
    const [activeReportSubTab, setActiveReportSubTab] = useState('diario');
    const [pendingDespachosCount, setPendingDespachosCount] = useState(0);

    // Menú colapsable en móviles
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Asistente flotante
    const [showHelp, setShowHelp] = useState(false);

    // Toast de notificaciones
    const [toast, setToast] = useState({ show: false, message: '' });

    // Estado global de paciente seleccionado
    const [selectedPatient, setSelectedPatient] = useState(null);

    // Draft local & Offline resilience
    const patientId = selectedPatient?.id_usuario || selectedPatient?.id;
    const { isOffline, saveDraft, loadDraft, clearDraft, draftLastSaved } = useClinicalDraft('enfermeria', user?.id, patientId);

    // Estados para 3D Books - Enfermería
    const [areaHistories, setAreaHistories] = useState({
        medicina: [],
        psicologia: [],
        odontologia: [],
        enfermeria: []
    });
    const [areaHistoriesLoading, setAreaHistoriesLoading] = useState(false);
    const [activeBookArea, setActiveBookArea] = useState('enfermeria');
    const [activeBookRecord, setActiveBookRecord] = useState(null);

    // Estados de Paginaciones Estandarizadas
    const [parteDiarioPage, setParteDiarioPage] = useState(1);
    const [catalogPage, setCatalogPage] = useState(1);
    const [historialPage, setHistorialPage] = useState(1);
    const ITEMS_PER_PAGE = 8;
    const [confirmModal, setConfirmModal] = useState({
        show: false,
        title: '',
        message: '',
        onConfirm: null
    });

    const showSystemToast = (message) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 3400);
    };

    // ==========================================
    // 1. ESTADOS Y MODALES DE SIGNOS VITALES
    // ==========================================
    const [vitalsModalSearchOpen, setVitalsModalSearchOpen] = useState(false);
    const [vitalsModalRegisterOpen, setVitalsModalRegisterOpen] = useState(false);
    const [vitalsModalFormOpen, setVitalsModalFormOpen] = useState(false);
    const [vitalsBookPreviewOpen, setVitalsBookPreviewOpen] = useState(false);
    const [isHistogramModalOpen, setIsHistogramModalOpen] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const steps = [
        { key: 'vitals', label: '1. Signos Vitales' },
        { key: 'attention', label: '2. Atención Realizada' },
        { key: 'histogram', label: '3. Histograma de Signos' }
    ];
    const validateVitalsStep = () => {
        return (
            vitalsForm.presion_arterial_sistolica &&
            vitalsForm.presion_arterial_diastolica &&
            vitalsForm.frecuencia_cardiaca &&
            vitalsForm.frecuencia_respiratoria &&
            vitalsForm.temperatura &&
            vitalsForm.talla &&
            vitalsForm.peso
        );
    };

    const handlePrevStep = () => {
        if (currentStepIndex > 0) setCurrentStepIndex(currentStepIndex - 1);
    };
    const handleNextStep = () => {
        setValidationTriggered(true);
        if (currentStepIndex === 0 && !validateVitalsStep()) {
            showSystemToast('Por favor complete todos los campos obligatorios marcados en rojo.');
            return;
        }
        setValidationTriggered(false);
        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
        }
    };

    const [modalSearchCedula, setModalSearchCedula] = useState('');
    const [modalSearchResults, setModalSearchResults] = useState([]);
    const [modalSearchLoading, setModalSearchLoading] = useState(false);
    const [modalSearchError, setModalSearchError] = useState('');

    // Formulario de Registro Rápido de Paciente Nuevo
    const [newPatientForm, setNewPatientForm] = useState({
        nombre_completo: '',
        tipo_documento: 'cedula', // 'cedula' | 'pasaporte'
        cedula: '',
        pais_origen: '',
        id_tipo_usuario: 2,
        tipo: 'Estudiante',
        correo: ''
    });
    const [quickValidationTriggered, setQuickValidationTriggered] = useState(false);
    const [validationTriggered, setValidationTriggered] = useState(false);
    const [registerLoading, setRegisterLoading] = useState(false);
    const [registerError, setRegisterError] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const getQuickInputStyle = (value) => {
        if (quickValidationTriggered && !value) {
            return { border: '1.5px solid #b71a34', background: '#fef2f2' };
        }
        return {};
    };

    const getQuickEmailInputStyle = (value) => {
        if (quickValidationTriggered && !value) {
            return { display: 'flex', alignItems: 'center', border: '1.5px solid #b71a34', borderRadius: '12px', padding: '0 16px', background: '#fef2f2', minHeight: '46px', boxSizing: 'border-box' };
        }
        return { display: 'flex', alignItems: 'center', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '0 16px', background: '#fcfdfe', minHeight: '46px', boxSizing: 'border-box' };
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

    // Formulario de Signos Vitales y Procedimiento
    const [vitalsForm, setVitalsForm] = useState({
        fecha: new Date().toISOString().slice(0, 10),
        hora: new Date().toTimeString().slice(0, 5),
        presion_arterial_sistolica: '',
        presion_arterial_diastolica: '',
        frecuencia_cardiaca: '',
        frecuencia_respiratoria: '',
        temperatura: '',
        talla: '',
        peso: '',
        id_usuario_medico_general: '',
        id_procedimiento_enfermeria: [], // Array de IDs del catalogo
        tipo_atencion: 'primaria', // primaria, secundaria
        tipo: 'curativo', // curativo, preventivo
        detalle_procedimiento: '',
        detalle_medicacion: ''
    });
    const [proceduresCatalog, setProceduresCatalog] = useState([]);

    // Campus y médicos del mismo campus
    const [myCampusId, setMyCampusId] = useState(null);
    const [campusList, setCampusList] = useState([]);
    const [doctoresCampus, setDoctoresCampus] = useState([]);
    const [campusSetupModal, setCampusSetupModal] = useState(false);
    const [campusSetupValue, setCampusSetupValue] = useState('');
    const [campusSetupSaving, setCampusSetupSaving] = useState(false);

    // Custom searchable doctor selector states
    const [isDoctorDropdownOpen, setIsDoctorDropdownOpen] = useState(false);
    const [doctorSearchQuery, setDoctorSearchQuery] = useState('');

    // Custom searchable procedure selector states
    const [vitalsProcedureDropdownOpen, setVitalsProcedureDropdownOpen] = useState(false);
    const [vitalsProcedureSearchQuery, setVitalsProcedureSearchQuery] = useState('');

    const fetchCampusData = async () => {
        try {
            // Obtener catálogo de campus disponibles desde medicina ocupacional
            const catalogRes = await api.get('/medicina-ocupacional/usuario-lugar-de-trabajo');
            // Usamos una petición a un endpoint de referencia para listar todos los campus
            // El listado de campus viene de los doctores registrados; haremos una llamada separada
        } catch (err) {
            console.error('Error cargando campus:', err);
        }
    };

    const fetchMyCampus = async () => {
        try {
            const res = await api.get('/medicina-ocupacional/usuario-lugar-de-trabajo');
            const data = res.data.data || [];
            if (data.length > 0) {
                const firstRecord = data[0];
                // El backend ahora devuelve lugar_trabajo como relacion embebida
                const campusId = firstRecord.id_lugar_trabajo || firstRecord.lugar_trabajo?.id;
                setMyCampusId(campusId);
                fetchDoctoresByCampus(campusId);
            } else {
                // No tiene campus asignado, mostrar modal de configuracion
                fetchAllCampuses();
                setCampusSetupModal(true);
            }
        } catch (err) {
            console.error('Error al verificar campus:', err);
        }
    };

    const fetchAllCampuses = async () => {
        try {
            const res = await api.get('/medicina-ocupacional/campus');
            const list = (res.data.data || []).map(c => ({ id: c.id, nombre: c.nombre }));
            setCampusList(list);
        } catch (err) {
            console.error('Error cargando campus disponibles:', err);
        }
    };

    const fetchTodosLosDoctores = async () => {
        try {
            // Traer todos los médicos con su campus (sin filtro)
            const res = await api.get('/medical-staff/doctores');
            setDoctoresCampus(res.data.data || []);
        } catch (err) {
            console.error('Error al cargar médicos:', err);
        }
    };

    // Se mantiene por compatibilidad (se puede usar para filtrar luego)
    const fetchDoctoresByCampus = async (campusId) => {
        fetchTodosLosDoctores();
    };

    const handleSaveCampusSetup = async () => {
        if (!campusSetupValue) return;
        setCampusSetupSaving(true);
        try {
            await api.post('/medicina-ocupacional/usuario-lugar-de-trabajo', {
                id_lugar_trabajo: parseInt(campusSetupValue)
            });
            const campusId = parseInt(campusSetupValue);
            setMyCampusId(campusId);
            fetchDoctoresByCampus(campusId);
            setCampusSetupModal(false);
            showSystemToast('Campus de trabajo configurado correctamente.');
        } catch (err) {
            console.error('Error guardando campus:', err);
            showSystemToast('No se pudo guardar el campus. Intenta de nuevo.');
        } finally {
            setCampusSetupSaving(false);
        }
    };

    // Cargar catálogo de procedimientos
    const fetchProcedures = async () => {
        try {
            const response = await api.get('/enfermeria/procedimientos');
            setProceduresCatalog(response.data.data);
        } catch (err) {
            console.error('Error cargando procedimientos:', err);
        }
    };

    const fetchPendingDespachos = async () => {
        try {
            const res = await api.get('/v1/receta-farmacia/pendientes-despacho');
            setPendingDespachosCount((res.data.data || []).length);
        } catch (err) {
            console.error('Error al cargar conteo de recetas pendientes:', err);
        }
    };

    useEffect(() => {
        fetchProcedures();
        fetchMyCampus();
        fetchTodosLosDoctores();
        fetchPendingDespachos();
    }, []);

    const handleModalPatientSearch = async (e) => {
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

    const handleQuickRegisterPatient = async (e) => {
        e.preventDefault();
        setQuickValidationTriggered(true);

        if (!newPatientForm.nombre_completo || !newPatientForm.cedula || !newPatientForm.correo) {
            setRegisterError('Por favor, complete todos los campos obligatorios en rojo.');
            return;
        }
        if (newPatientForm.tipo_documento === 'pasaporte' && !newPatientForm.pais_origen) {
            setRegisterError('Para pacientes con pasaporte, indique el país de origen.');
            return;
        }

        setRegisterLoading(true);
        setRegisterError('');

        try {
            const finalEmail = newPatientForm.correo.includes('@') ? newPatientForm.correo.trim() : `${newPatientForm.correo.trim()}@ueb.edu.ec`;

            const response = await api.post('/users/register-patient', {
                email: finalEmail,
                cedula: newPatientForm.cedula,
                nombre_completo: newPatientForm.nombre_completo,
                tipo_documento: newPatientForm.tipo_documento,
                pais_origen: newPatientForm.pais_origen,
                id_tipo_usuario: newPatientForm.id_tipo_usuario || 2,
                tipo: newPatientForm.tipo
            });

            const patientData = response.data.data;

            setSelectedPatient(patientData);
            setVitalsModalRegisterOpen(false);
            setQuickValidationTriggered(false);
            setNewPatientForm({
                nombre_completo: '',
                tipo_documento: 'cedula',
                cedula: '',
                pais_origen: '',
                id_tipo_usuario: 2,
                tipo: 'Estudiante',
                correo: ''
            });
            showSystemToast('Paciente registrado correctamente. Se envió su clave temporal por correo.');

            // Abrimos directamente el formulario clínico
            openVitalsFormFor(patientData);
        } catch (err) {
            console.error(err);
            setRegisterError(err.response?.data?.message || 'Error al registrar. Verifica la cédula o el correo.');
        } finally {
            setRegisterLoading(false);
        }
    };

    const openVitalsFormFor = async (patient) => {
        setSelectedPatient(patient);
        setCurrentStepIndex(0);

        const pId = patient.id_usuario || patient.id_usuario_paciente || patient.user_id || patient.id;
        if (pId) {
            try {
                await api.post('/citas-medicas/atender-paciente', {
                    id_usuario_paciente: pId,
                    rol_doctor: 'enfermero',
                    motivo: 'Atención en Enfermería'
                });
            } catch (err) {
                console.error("Error al auto-sincronizar cita en enfermería:", err);
            }
        }

        const initialFormState = {
            fecha: new Date().toISOString().slice(0, 10),
            hora: new Date().toTimeString().slice(0, 5),
            presion_arterial_sistolica: '',
            presion_arterial_diastolica: '',
            frecuencia_cardiaca: '',
            frecuencia_respiratoria: '',
            temperatura: '',
            talla: '',
            peso: '',
            id_usuario_medico_general: '',
            id_procedimiento_enfermeria: [],
            tipo_atencion: 'primaria',
            tipo: 'curativo',
            detalle_procedimiento: '',
            detalle_medicacion: ''
        };

        const savedDraft = loadDraft();
        if (savedDraft?.formData) {
            setVitalsForm({ ...initialFormState, ...savedDraft.formData });
            showSystemToast("Borrador de enfermería recuperado automáticamente.");
        } else {
            setVitalsForm(initialFormState);
        }

        setVitalsModalSearchOpen(false);
        setVitalsModalFormOpen(true);
    };

    // Auto-save form draft to localStorage
    useEffect(() => {
        if (selectedPatient && vitalsForm) {
            saveDraft(vitalsForm);
        }
    }, [vitalsForm, selectedPatient, saveDraft]);

    const validateAttentionStep = () => {
        return (
            vitalsForm.hora &&
            vitalsForm.tipo_atencion &&
            vitalsForm.tipo &&
            vitalsForm.id_procedimiento_enfermeria &&
            vitalsForm.id_procedimiento_enfermeria.length > 0
        );
    };

    const handleVitalsFormSubmit = (e) => {
        e.preventDefault();
        setValidationTriggered(true);

        if (!validateVitalsStep()) {
            setCurrentStepIndex(0);
            showSystemToast('Por favor complete los signos vitales obligatorios en rojo.');
            return;
        }

        if (!validateAttentionStep()) {
            showSystemToast('Por favor complete todos los campos de atención obligatorios en rojo.');
            return;
        }

        setValidationTriggered(false);
        setVitalsModalFormOpen(false);
        setVitalsBookPreviewOpen(true);
    };

    const handleCancelVitals = () => {
        setConfirmModal({
            show: true,
            title: '¿Cancelar consulta?',
            message: '¿Está seguro de que desea cancelar la atención actual? Se perderán todos los datos no guardados de esta consulta.',
            onConfirm: () => {
                setVitalsModalFormOpen(false);
                setSelectedPatient(null);
                setCurrentStepIndex(0);
                setValidationTriggered(false);
            }
        });
    };

    const handleSaveClinicalRecord = async () => {
        const patientUserId = selectedPatient?.id_usuario || selectedPatient?.id_usuario_paciente || selectedPatient?.user_id || selectedPatient?.id;
        if (!patientUserId) {
            showSystemToast('Error: No se ha seleccionado un paciente válido.');
            return;
        }

        try {
            // Guardar Signos Vitales
            await api.post('/enfermeria/signos-vitales', {
                id_usuario_paciente: parseInt(patientUserId),
                id_usuario_medico_general: vitalsForm.id_usuario_medico_general ? parseInt(vitalsForm.id_usuario_medico_general) : null,
                fecha: vitalsForm.fecha || new Date().toISOString().slice(0, 10),
                presion_arterial_sistolica: vitalsForm.presion_arterial_sistolica ? parseFloat(vitalsForm.presion_arterial_sistolica) : null,
                presion_arterial_diastolica: vitalsForm.presion_arterial_diastolica ? parseFloat(vitalsForm.presion_arterial_diastolica) : null,
                frecuencia_cardiaca: vitalsForm.frecuencia_cardiaca ? parseInt(vitalsForm.frecuencia_cardiaca) : null,
                frecuencia_respiratoria: vitalsForm.frecuencia_respiratoria ? parseInt(vitalsForm.frecuencia_respiratoria) : null,
                temperatura: vitalsForm.temperatura ? parseFloat(vitalsForm.temperatura) : null,
                talla: vitalsForm.talla ? parseFloat(vitalsForm.talla) : null,
                peso: vitalsForm.peso ? parseFloat(vitalsForm.peso) : null
            });

            // Guardar Parte Diario por cada procedimiento seleccionado
            const rawProcs = vitalsForm.id_procedimiento_enfermeria;
            const selectedProcs = Array.isArray(rawProcs) ? rawProcs : (rawProcs ? [rawProcs] : []);

            if (selectedProcs.length > 0) {
                for (const procItem of selectedProcs) {
                    const procId = typeof procItem === 'object' ? procItem?.id : procItem;
                    const parsedId = procId ? parseInt(procId) : null;
                    await api.post('/enfermeria/parte-diario', {
                        id_usuario_paciente: parseInt(patientUserId),
                        fecha: vitalsForm.fecha || new Date().toISOString().slice(0, 10),
                        tipo_atencion: vitalsForm.tipo_atencion || 'primaria',
                        tipo: vitalsForm.tipo || 'curativo',
                        detalle_procedimiento: vitalsForm.detalle_procedimiento || null,
                        detalle_medicacion: vitalsForm.detalle_medicacion || null,
                        id_procedimiento_enfermeria: parsedId && !isNaN(parsedId) ? parsedId : null
                    });
                }
            } else {
                await api.post('/enfermeria/parte-diario', {
                    id_usuario_paciente: parseInt(patientUserId),
                    fecha: vitalsForm.fecha || new Date().toISOString().slice(0, 10),
                    tipo_atencion: vitalsForm.tipo_atencion || 'primaria',
                    tipo: vitalsForm.tipo || 'curativo',
                    detalle_procedimiento: vitalsForm.detalle_procedimiento || null,
                    detalle_medicacion: vitalsForm.detalle_medicacion || null,
                    id_procedimiento_enfermeria: null
                });
            }

            clearDraft();
            setVitalsBookPreviewOpen(false);
            setVitalsModalFormOpen(false);
            setValidationTriggered(false);
            showSystemToast('Atención y signos vitales guardados con éxito.');
            setSelectedPatient(null);
            setActiveTab('historial');
            fetchParteDiario();
        } catch (err) {
            console.error('Error al guardar registro clínico:', err, err.response?.data);
            const backendMsg = err.response?.data?.message || (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(' | ') : null);
            showSystemToast(`Error: ${backendMsg || 'Verifique los datos ingresados.'}`);
        }
    };

    // ==========================================
    // 2. ESTADOS DE PARTE DIARIO (CONSULTA)
    // ==========================================
    const [parteDiarioDate, setParteDiarioDate] = useState(new Date().toISOString().slice(0, 10));
    const [parteDiarioList, setParteDiarioList] = useState([]);
    const [parteDiarioSearch, setParteDiarioSearch] = useState('');
    const [parteDiarioLoading, setParteDiarioLoading] = useState(false);

    const fetchParteDiario = async () => {
        setParteDiarioLoading(true);
        try {
            const response = await api.get('/enfermeria/parte-diario');
            // Filtrar del lado del cliente por fecha (comparando solo la fecha YYYY-MM-DD)
            const filtered = response.data.data.filter(item => {
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

    const getFilteredParteDiario = () => {
        return parteDiarioList.filter(item => {
            const patientName = (item.paciente?.datos_identificacion
                ? `${item.paciente.datos_identificacion.primer_nombre} ${item.paciente.datos_identificacion.apellido_paterno}`
                : item.paciente?.name || ''
            ).toLowerCase();
            const patientCedula = item.paciente?.datos_identificacion?.numero_cedula || '';
            const search = parteDiarioSearch.toLowerCase();
            return patientName.includes(search) || patientCedula.includes(search) || (item.procedimiento?.nombre_procedimiento || '').toLowerCase().includes(search);
        });
    };

    const handlePrintParteDiario = async () => {
        if (parteDiarioList.length === 0) {
            showSystemToast('No hay atenciones en esta fecha para generar el reporte.');
            return;
        }

        let detailedList = [];
        let allVitals = [];
        try {
            showSystemToast('Cargando datos de pacientes y signos vitales...');
            // Fetch signs and detailed profiles
            const vitalsResponse = await api.get('/enfermeria/signos-vitales');
            allVitals = vitalsResponse.data.data || [];

            detailedList = await Promise.all(
                parteDiarioList.map(async (item) => {
                    try {
                        const res = await api.get(`/medicina-general/pacientes/${item.id_usuario_paciente}/perfil`);
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

        const tableRowsHtml = detailedList.map((item, idx) => {
            const pIdent = item.paciente?.datos_identificacion || item.paciente?.datosIdentificacion || {};
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

            // Match signs
            const v = allVitals.find(sv =>
                String(sv.id_usuario_paciente) === String(item.id_usuario_paciente) &&
                sv.fecha && sv.fecha.slice(0, 10) === parteDiarioDate
            ) || {};

            const pa = v.presion_arterial_sistolica && v.presion_arterial_diastolica
                ? `${v.presion_arterial_sistolica}/${v.presion_arterial_diastolica}`
                : '—';
            const fc = v.frecuencia_cardiaca || '—';
            const fr = v.frecuencia_respiratoria || '—';
            const temp = v.temperatura ? `${v.temperatura}°C` : '—';
            const talla = v.talla ? `${v.talla}cm` : '—';
            const peso = v.peso ? `${v.peso}kg` : '—';

            return `
                <tr>
                    <td>${idx + 1}</td>
                    <td class="left-align font-bold">${fullName}</td>
                    <td>${cedula}</td>
                    <td>${age}</td>
                    <td>${isMale ? 'X' : ''}</td>
                    <td>${isFemale ? 'X' : ''}</td>
                    <td>${isLgbti ? 'X' : ''}</td>
                    <td>${isEstudiante ? 'X' : ''}</td>
                    <td class="left-align">${careerName}</td>
                    <td>${isDocente ? 'X' : ''}</td>
                    <td>${isAdministrativo ? 'X' : ''}</td>
                    <td>${pa}</td>
                    <td>${fc}</td>
                    <td>${fr}</td>
                    <td>${temp}</td>
                    <td>${talla}</td>
                    <td>${peso}</td>
                    <td class="left-align">${item.procedimiento?.nombre_procedimiento || 'Procedimiento menor'}</td>
                    <td class="left-align">${item.detalle_procedimiento || 'Sin observaciones.'}</td>
                </tr>
            `;
        }).join('');

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
                <title>Parte Diario de Enfermería - ${formattedDate}</title>
                <style>
                    @page {
                        size: A4 landscape;
                        margin: 10mm;
                    }
                    body {
                        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                        font-size: 8px;
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
                        padding: 2.5px;
                        text-align: center;
                        vertical-align: middle;
                    }
                    th {
                        font-weight: bold;
                        font-size: 7.5px;
                    }
                    /* Colores de cabeceras según el formato físico */
                    .th-num { width: 25px; background-color: #ffedd5 !important; }
                    .th-nombres { width: 140px; background-color: #fef9c3 !important; }
                    .th-cedula { width: 65px; background-color: #dcfce7 !important; }
                    .th-edad { width: 25px; background-color: #fce7f3 !important; }
                    .th-genero { background-color: #fef08a !important; }
                    .th-comunidad { background-color: #dbeafe !important; }
                    .th-vitals { background-color: #fee2e2 !important; }
                    .th-procedimiento { width: 110px; background-color: #ffedd5 !important; }
                    .th-obs { width: 180px; background-color: #dcfce7 !important; }
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
                            <div style="width: 80px;"></div>
                            <div class="header-title">
                                <h1>Universidad Estatal de Bolívar</h1>
                                <h2>Bienestar Estudiantil</h2>
                                <h3>Enfermería</h3>
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
                                    <th rowspan="2" class="th-cedula">CÉDULA</th>
                                    <th rowspan="2" class="th-edad">Edad</th>
                                    <th colspan="3" class="th-genero">GÉNERO</th>
                                    <th colspan="3" class="th-comunidad">COMUNIDAD</th>
                                    <th colspan="6" class="th-vitals">SIGNOS VITALES</th>
                                    <th rowspan="2" class="th-procedimiento">PROCEDIMIENTO</th>
                                    <th rowspan="2" class="th-obs">OBSERVACIÓN / MED.</th>
                                </tr>
                                <tr class="sub-header">
                                    <th style="width: 15px;">H</th>
                                    <th style="width: 15px;">M</th>
                                    <th style="width: 20px;">LGBTI</th>
                                    <th style="width: 20px;">EST.</th>
                                    <th style="width: 80px;">CARRERA</th>
                                    <th style="width: 20px;">DOC.</th>
                                    <th style="width: 20px;">ADM.</th>
                                    <th style="width: 35px;">P.A.</th>
                                    <th style="width: 25px;">F.C.</th>
                                    <th style="width: 25px;">F.R.</th>
                                    <th style="width: 25px;">TEMP.</th>
                                    <th style="width: 25px;">TALLA</th>
                                    <th style="width: 25px;">PESO</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tableRowsHtml}
                                ${emptyRowsHtml}
                                <tr class="bg-totals">
                                    <td colspan="4" class="left-align font-bold">TOTAL</td>
                                    <td>${sumHombre}</td>
                                    <td>${sumMujer}</td>
                                    <td>${sumLgbti}</td>
                                    <td>${sumEstudiante}</td>
                                    <td></td>
                                    <td>${sumDocente}</td>
                                    <td>${sumAdministrativo}</td>
                                    <td colspan="6"></td>
                                    <td colspan="2"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="signatures-container">
                        <div class="signature-box">
                            <div class="signature-line"></div>
                            <strong>Enfermero/a: ${user?.name || 'Profesional Responsable'}</strong><br>
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

    const fetchPatientHistoryByArea = async (patientId) => {
        setAreaHistoriesLoading(true);
        try {
            const [
                medEvolRes, medDiarioRes, medSignosRes,
                psiEvolRes, psiDiarioRes,
                odoEvolRes, odoDiarioRes,
                enfVitalsRes, enfDiarioRes
            ] = await Promise.all([
                api.get('/medicina-general/historial-evolucion', { params: { id_usuario_paciente: patientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/medicina-general/parte-diario', { params: { id_usuario_paciente: patientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/medicina-general/signos-vitales', { params: { id_usuario_paciente: patientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/psicologia/historial-evolucion', { params: { id_usuario_paciente: patientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/psicologia/parte-diario', { params: { id_usuario_paciente: patientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/odontologia/historial-evolucion', { params: { id_usuario_paciente: patientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/odontologia/parte-diario-odontologia', { params: { id_usuario_paciente: patientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/enfermeria/signos-vitales', { params: { id_usuario_paciente: patientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/enfermeria/parte-diario', { params: { id_usuario_paciente: patientId } }).catch(() => ({ data: { data: [] } }))
            ]);

            const filterByPatient = (list) => {
                if (!Array.isArray(list)) return [];
                return list.filter(item =>
                    item.id_usuario_paciente === patientId ||
                    item.id_paciente === patientId ||
                    item.paciente?.id === patientId ||
                    item.paciente?.id_usuario === patientId ||
                    String(item.id_usuario_paciente) === String(patientId)
                );
            };

            const medEvol = filterByPatient(medEvolRes.data.data);
            const medDiario = filterByPatient(medDiarioRes.data.data);
            const medSignos = filterByPatient(medSignosRes.data.data);

            const psiEvol = filterByPatient(psiEvolRes.data.data);
            const psiDiario = filterByPatient(psiDiarioRes.data.data);

            const odoEvol = filterByPatient(odoEvolRes.data.data);
            const odoDiario = filterByPatient(odoDiarioRes.data.data);

            const enfVitals = filterByPatient(enfVitalsRes.data.data);
            const enfDiario = filterByPatient(enfDiarioRes.data.data);

            setAreaHistories({
                medicina: [
                    ...medEvol.map(x => ({ ...x, type: 'evolucion', recordTitle: 'Evolución Clínica' })),
                    ...medDiario.map(x => ({ ...x, type: 'diario', recordTitle: 'Consulta de Jornada' })),
                    ...medSignos.map(x => ({ ...x, type: 'signos', recordTitle: 'Signos Vitales' }))
                ].sort((a, b) => new Date(b.fecha || b.created_at) - new Date(a.fecha || a.created_at)),

                psicologia: [
                    ...psiEvol.map(x => ({ ...x, type: 'evolucion', recordTitle: 'Sesión Psicológica' })),
                    ...psiDiario.map(x => ({ ...x, type: 'diario', recordTitle: 'Consulta de Psicología' }))
                ].sort((a, b) => new Date(b.fecha || b.created_at) - new Date(a.fecha || a.created_at)),

                odontologia: [
                    ...odoEvol.map(x => ({ ...x, type: 'evolucion', recordTitle: 'Evolución Dental' })),
                    ...odoDiario.map(x => ({ ...x, type: 'diario', recordTitle: 'Consulta Odontológica' }))
                ].sort((a, b) => new Date(b.fecha || b.created_at) - new Date(a.fecha || a.created_at)),

                enfermeria: [
                    ...enfVitals.map(x => ({ ...x, type: 'vitals', recordTitle: 'Signos Vitales' })),
                    ...enfDiario.map(x => ({ ...x, type: 'diario', recordTitle: 'Procedimiento de Enfermería' }))
                ].sort((a, b) => new Date(b.fecha || b.created_at) - new Date(a.fecha || a.created_at))
            });
        } catch (err) {
            console.error("Error al cargar historiales por área:", err);
        } finally {
            setAreaHistoriesLoading(false);
        }
    };

    useEffect(() => {
        if (selectedPatient) {
            setActiveBookArea('enfermeria');
            setActiveBookRecord(null);
            fetchPatientHistoryByArea(selectedPatient.id_usuario || selectedPatient.id);
        } else {
            setActiveBookArea('enfermeria');
            setActiveBookRecord(null);
            setAreaHistories({
                medicina: [],
                psicologia: [],
                odontologia: [],
                enfermeria: []
            });
        }
    }, [selectedPatient]);

    useEffect(() => {
        if (activeTab === 'diario' || activeTab === 'historial') {
            fetchParteDiario();
        }
    }, [activeTab, parteDiarioDate]);

    // KPIs de la jornada actual
    const getParteKPIs = () => {
        const uniquePatients = new Set(parteDiarioList.map(item => item.id_usuario_paciente));
        const withProcedures = parteDiarioList.filter(item => item.id_procedimiento_enfermeria !== null);
        const primarias = parteDiarioList.filter(item => item.tipo_atencion === 'primaria' || !item.tipo_atencion).length;
        const secundarias = parteDiarioList.filter(item => item.tipo_atencion === 'secundaria').length;
        const certificados = parteDiarioList.filter(item => item.tipo_atencion === 'certificadomedico').length;
        return {
            total: parteDiarioList.length,
            procedures: withProcedures.length,
            patients: uniquePatients.size,
            primarias,
            secundarias,
            certificados
        };
    };

    // ==========================================
    // 3. ESTADOS DE CATÁLOGO DE PROCEDIMIENTOS
    // ==========================================
    const [newProcedureName, setNewProcedureName] = useState('');
    const [procedureSearchQuery, setProcedureSearchQuery] = useState('');

    const handleAddProcedure = async (e) => {
        e.preventDefault();
        if (!newProcedureName.trim()) return;

        try {
            await api.post('/enfermeria/procedimientos', {
                nombre_procedimiento: newProcedureName
            });
            setNewProcedureName('');
            fetchProcedures();
            showSystemToast('Procedimiento agregado correctamente al catálogo.');
        } catch (err) {
            console.error(err);
            showSystemToast('Error al agregar el procedimiento.');
        }
    };

    const handleDeleteProcedure = (id) => {
        setConfirmModal({
            show: true,
            title: 'Eliminar Procedimiento',
            message: '¿Está seguro de eliminar este procedimiento del catálogo?',
            onConfirm: async () => {
                try {
                    await api.delete(`/enfermeria/procedimientos/${id}`);
                    fetchProcedures();
                    showSystemToast('Procedimiento eliminado.');
                } catch (err) {
                    console.error(err);
                    showSystemToast('No se puede eliminar el procedimiento ya que está en uso en atenciones registradas.');
                }
            }
        });
    };

    // ==========================================
    // 4. ESTADOS DE HISTORIAL GENERAL
    // ==========================================
    const [historialList, setHistorialList] = useState([]);
    const [historialType, setHistorialType] = useState('all'); // all | vitals | attention
    const [historialSearch, setHistorialSearch] = useState('');
    const [historialDateFrom, setHistorialDateFrom] = useState('');
    const [historialDateTo, setHistorialDateTo] = useState('');

    const fetchHistorialGeneral = async () => {
        try {
            // Obtenemos partes y signos vitales
            const [vitalsRes, partsRes] = await Promise.all([
                api.get('/enfermeria/signos-vitales'),
                api.get('/enfermeria/parte-diario')
            ]);

            const mappedVitals = vitalsRes.data.data.map(item => ({
                id: `vitals-${item.id}`,
                type: 'vitals',
                fecha: item.fecha ? item.fecha.slice(0, 10) : '',
                paciente: item.paciente,
                detalle: `Presión: ${item.presion_arterial_sistolica || '—'}/${item.presion_arterial_diastolica || '—'} mmHg · FC: ${item.frecuencia_cardiaca || '—'} lpm · Temp: ${item.temperatura || '—'} °C`
            }));

            const mappedAttentions = partsRes.data.data.map(item => ({
                id: `attention-${item.id}`,
                type: 'attention',
                fecha: item.fecha ? item.fecha.slice(0, 10) : '',
                paciente: item.paciente,
                detalle: `${item.procedimiento?.nombre_procedimiento || 'Procedimiento menor'} · ${item.detalle_procedimiento || 'Sin observaciones.'}`
            }));

            setHistorialList([...mappedVitals, ...mappedAttentions]);
        } catch (err) {
            console.error(err);
        }
    };

    // General history useEffect removed since Reportes tab only shows daily report for now

    const getFilteredHistorial = () => {
        return historialList.filter(item => {
            // Filtro por tipo
            if (historialType === 'vitals' && item.type !== 'vitals') return false;
            if (historialType === 'attention' && item.type !== 'attention') return false;

            // Filtro por texto
            const searchText = historialSearch.toLowerCase();
            const patientName = (item.paciente?.datos_identificacion
                ? `${item.paciente.datos_identificacion.primer_nombre} ${item.paciente.datos_identificacion.apellido_paterno}`
                : item.paciente?.name || ''
            ).toLowerCase();
            const patientCedula = item.paciente?.datos_identificacion?.numero_cedula || '';
            const details = item.detalle.toLowerCase();

            if (searchText && !patientName.includes(searchText) && !patientCedula.includes(searchText) && !details.includes(searchText)) {
                return false;
            }

            // Filtro por fechas
            if (historialDateFrom && item.fecha < historialDateFrom) return false;
            if (historialDateTo && item.fecha > historialDateTo) return false;

            return true;
        });
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

    return (
        <div className="nurse-shell">
            <div className="app">
                <div className={`overlay ${isSidebarOpen ? 'show' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>

                {/* SIDEBAR */}
                <aside className={`sidebar ${isSidebarOpen ? 'show' : ''}`}>
                    <div className="brand">
                        <div className="brand__logo">
                            <HeartPulse size={20} color="white" />
                        </div>
                        <div className="brand__text">
                            <strong>Sección</strong>
                            <span>Enfermería</span>
                        </div>
                        <button className="sidebar__close" onClick={() => setIsSidebarOpen(false)}>
                            <X size={18} />
                        </button>
                    </div>

                    <nav className="navigation">
                        <p className="sidebar__label" style={{ margin: '8px 14px 6px 14px' }}>ATENCIÓN CLÍNICA</p>
                        <button
                            className={`navigation__item ${activeTab === 'vitals' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('vitals'); setIsSidebarOpen(false); }}
                        >
                            <span className="navigation__indicator"></span>
                            <span className="navigation__icon"><Activity size={18} /></span>
                            <span className="navigation__text">Signos vitales</span>
                        </button>
                        <button
                            className={`navigation__item ${activeTab === 'diario' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('diario'); setIsSidebarOpen(false); }}
                        >
                            <span className="navigation__indicator"></span>
                            <span className="navigation__icon"><CalendarCheck size={18} /></span>
                            <span className="navigation__text">Parte diario</span>
                        </button>
                        <button
                            className={`navigation__item ${activeTab === 'catalog' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('catalog'); setIsSidebarOpen(false); }}
                        >
                            <span className="navigation__indicator"></span>
                            <span className="navigation__icon"><BriefcaseMedical size={18} /></span>
                            <span className="navigation__text">Procedimientos</span>
                        </button>
                        <button
                            className={`navigation__item ${activeTab === 'historial' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('historial'); setIsSidebarOpen(false); }}
                        >
                            <span className="navigation__indicator"></span>
                            <span className="navigation__icon"><FileText size={18} /></span>
                            <span className="navigation__text">Reportes</span>
                        </button>

                        <p className="sidebar__label" style={{ margin: '20px 14px 6px 14px' }}>FARMACIA E INVENTARIO</p>
                        <button
                            className={`navigation__item ${activeTab === 'farmacia-inventario' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('farmacia-inventario'); setIsSidebarOpen(false); }}
                        >
                            <span className="navigation__indicator"></span>
                            <span className="navigation__icon"><Pill size={18} /></span>
                            <span className="navigation__text">Inventario</span>
                        </button>
                        <button
                            className={`navigation__item ${activeTab === 'farmacia-despacho' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('farmacia-despacho'); setIsSidebarOpen(false); }}
                        >
                            <span className="navigation__indicator"></span>
                            <span className="navigation__icon"><PackageCheck size={18} /></span>
                            <span className="navigation__text">Despacho Recetas</span>
                            {pendingDespachosCount > 0 && (
                                <span className="navigation__badge">
                                    {pendingDespachosCount}
                                </span>
                            )}
                        </button>
                        <button
                            className={`navigation__item ${activeTab === 'farmacia-presentaciones' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('farmacia-presentaciones'); setIsSidebarOpen(false); }}
                        >
                            <span className="navigation__indicator"></span>
                            <span className="navigation__icon"><Boxes size={18} /></span>
                            <span className="navigation__text">Presentaciones</span>
                        </button>
                    </nav>

                    <div className="sidebar__footer">
                        <button className="logout-button" onClick={handleLogoutClick}>
                            <span className="logout-button__icon"><LogOut size={16} /></span>
                            <span>Cerrar sesión</span>
                        </button>
                        <p className="system-version">Sistema BU · Enfermería</p>
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
                                <p className="breadcrumb">Enfermería / <span>{
                                    activeTab === 'vitals' ? 'ATENCIÓN Y SIGNOS VITALES' :
                                        activeTab === 'diario' ? 'PARTE DIARIO' :
                                            activeTab === 'catalog' ? 'PROCEDIMIENTOS' :
                                                activeTab === 'farmacia-inventario' ? 'INVENTARIO' :
                                                    activeTab === 'farmacia-despacho' ? 'DESPACHO DE RECETAS' :
                                                        activeTab === 'farmacia-presentaciones' ? 'CATÁLOGO DE PRESENTACIONES' : 'REPORTES'
                                }</span></p>
                                <h1>{
                                    activeTab === 'vitals' ? 'Atención de Pacientes y Toma de Signos' :
                                        activeTab === 'diario' ? 'Parte Diario de Enfermería' :
                                            activeTab === 'catalog' ? 'Procedimientos de Enfermería' :
                                                activeTab === 'farmacia-inventario' ? 'Inventario de Medicamentos e Insumos' :
                                                    activeTab === 'farmacia-despacho' ? 'Despacho de Recetas Médicas' :
                                                        activeTab === 'farmacia-presentaciones' ? 'Catálogo de Presentaciones' : 'Centro de Reportes Oficiales'
                                }</h1>
                            </div>
                        </div>
                        <div className="topbar__right">
                            <button className="topbar-button" style={{ marginRight: '8px' }}><Bell size={18} /><span className="notification-point"></span></button>
                            <UserProfileMenu />
                        </div>
                    </header>

                    {/* VISTAS DINÁMICAS SEGÚN TABS */}
                    <div className="content">
                        {/* PESTAÑA 1: SIGNOS VITALES */}
                        {activeTab === 'vitals' && (
                            <div>
                                <section className="page-hero vitals-choice-hero">
                                    <div>
                                        <span className="page-hero__label"><Activity size={14} style={{ marginRight: '6px', display: 'inline' }} /> Atención clínica</span>
                                        <h2>¿Qué deseas realizar?</h2>
                                        <p>Selecciona una acción para iniciar la atención o crear la ficha de un paciente nuevo.</p>
                                    </div>
                                    <div className="page-hero__icon"><HeartPulse size={34} /></div>
                                </section>

                                <section className="vitals-action-grid">
                                    <button
                                        className="vitals-action-card vitals-action-card--primary"
                                        onClick={() => { setModalSearchCedula(''); setModalSearchResults([]); setVitalsModalSearchOpen(true); }}
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
                                            setVitalsModalRegisterOpen(true);
                                        }}
                                    >
                                        <span className="vitals-action-card__glow"></span>
                                        <span className="vitals-action-card__icon"><UserPlus size={24} /></span>
                                        <span className="vitals-action-card__content">
                                            <small>Crear nuevo paciente</small>
                                            <strong>Registrar paciente</strong>
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

                        {/* PESTAÑA 2: PARTE DIARIO */}
                        {activeTab === 'diario' && (
                            <div>
                                <section className="page-hero">
                                    <div>
                                        <span className="page-hero__label"><ClipboardList size={14} style={{ marginRight: '6px', display: 'inline' }} /> Consulta de jornada</span>
                                        <h2>Parte diario de Enfermería</h2>
                                        <p>Consulta las atenciones registradas desde Ficha y Anamnesis en la fecha indicada.</p>
                                    </div>
                                    <div className="page-hero__icon"><CalendarCheck size={34} /></div>
                                </section>

                                <section className="nurse-card daily-header-card" style={{ marginTop: '20px', marginBottom: '20px' }}>
                                    <div className="daily-date-control" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '15px' }}>
                                        <div>
                                            <span className="eyebrow">PARTE DE LA JORNADA</span>
                                            <h3>Atenciones del día</h3>
                                            <p>Selecciona una fecha para consultar los registros.</p>
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
                                            <div className="psycho-kpi-card__icon" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}><TrendingUp size={20} /></div>
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
                                </section>

                                <section className="nurse-card">
                                    <div className="nurse-card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                                        <div>
                                            <span className="eyebrow">REGISTROS</span>
                                            <h3>Listado de Atenciones</h3>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <div className="patient-search-input procedure-search">
                                                <Search size={16} />
                                                <input
                                                    value={parteDiarioSearch}
                                                    onChange={(e) => setParteDiarioSearch(e.target.value)}
                                                    placeholder="Buscar paciente, cédula o procedimiento..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="evolution-table-container" style={{ marginTop: '15px' }}>
                                        {parteDiarioLoading ? (
                                            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>Cargando atenciones...</div>
                                        ) : parteDiarioList.length === 0 ? (
                                            <div className="table-empty">
                                                <CalendarCheck size={35} />
                                                <strong>Sin atenciones registradas</strong>
                                                <span>No se registran procedimientos de enfermería para la fecha {parteDiarioDate}.</span>
                                            </div>
                                        ) : (
                                            <>
                                                {(() => {
                                                    const filtered = getFilteredParteDiario();
                                                    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
                                                    const currentPage = Math.min(parteDiarioPage, totalPages);
                                                    const paginatedItems = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

                                                    return (
                                                        <>
                                                            <table className="evolution-table">
                                                                <thead>
                                                                    <tr>
                                                                        <th>Hora</th>
                                                                        <th>Paciente</th>
                                                                        <th>Procedimiento(s)</th>
                                                                        <th>Observación</th>
                                                                        <th>Estado</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {paginatedItems.map((item, idx) => (
                                                                        <tr key={idx}>
                                                                            <td style={{ fontWeight: 'bold' }}>{new Date(item.created_at).toTimeString().slice(0, 5)}</td>
                                                                            <td>
                                                                                <div className="person-cell">
                                                                                    <div>
                                                                                        <strong>{item.paciente?.datos_identificacion ? `${item.paciente.datos_identificacion.primer_nombre} ${item.paciente.datos_identificacion.apellido_paterno}` : item.paciente?.name}</strong>
                                                                                        <span>{item.paciente?.datos_identificacion?.numero_cedula || 'Sin cédula'}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                            <td>
                                                                                {(() => {
                                                                                    if (Array.isArray(item.id_procedimiento_enfermeria)) {
                                                                                        const list = proceduresCatalog.filter(p => item.id_procedimiento_enfermeria.includes(p.id));
                                                                                        return list.map(p => p.nombre_procedimiento).join(', ');
                                                                                    }
                                                                                    return item.procedimiento?.nombre_procedimiento || 'Ninguno';
                                                                                })()}
                                                                            </td>
                                                                            <td>{item.detalle_procedimiento || 'Sin observaciones.'}</td>
                                                                            <td>
                                                                                <span className="evolution-badge evolution-badge--enfermeria">
                                                                                    Completada
                                                                                </span>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>

                                                            {filtered.length > ITEMS_PER_PAGE && (
                                                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '20px', paddingTop: '15px', borderTop: '1px solid var(--border)' }}>
                                                                    <button
                                                                        onClick={() => setParteDiarioPage(prev => Math.max(prev - 1, 1))}
                                                                        disabled={currentPage === 1}
                                                                        style={{
                                                                            padding: '6px 14px',
                                                                            borderRadius: '8px',
                                                                            border: '1px solid var(--border)',
                                                                            background: currentPage === 1 ? '#f1f5f9' : '#fff',
                                                                            color: currentPage === 1 ? '#94a3b8' : 'var(--primary)',
                                                                            fontSize: '11.5px',
                                                                            fontWeight: '600',
                                                                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                                                                        }}
                                                                    >
                                                                        ← Anterior
                                                                    </button>
                                                                    <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: '600' }}>
                                                                        Página {currentPage} de {totalPages}
                                                                    </span>
                                                                    <button
                                                                        onClick={() => setParteDiarioPage(prev => Math.min(prev + 1, totalPages))}
                                                                        disabled={currentPage === totalPages}
                                                                        style={{
                                                                            padding: '6px 14px',
                                                                            borderRadius: '8px',
                                                                            border: '1px solid var(--border)',
                                                                            background: currentPage === totalPages ? '#f1f5f9' : '#fff',
                                                                            color: currentPage === totalPages ? '#94a3b8' : 'var(--primary)',
                                                                            fontSize: '11.5px',
                                                                            fontWeight: '600',
                                                                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                                                                        }}
                                                                    >
                                                                        Siguiente →
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </>
                                                    );
                                                })()}
                                            </>
                                        )}
                                    </div>
                                </section>
                            </div>
                        )}



                        {/* PESTAÑA 3: CONFIGURACIÓN DE PROCEDIMIENTOS */}
                        {activeTab === 'catalog' && (
                            <div>
                                <section className="page-hero">
                                    <div>
                                        <span className="page-hero__label"><BriefcaseMedical size={14} style={{ marginRight: '6px', display: 'inline' }} /> Catálogo clínico</span>
                                        <h2>Procedimientos de Enfermería</h2>
                                        <p>Administra los tipos de atenciones disponibles para asociarlos en el parte diario.</p>
                                    </div>
                                </section>

                                <section className="module-grid" style={{ marginTop: '20px' }}>
                                    <article className="nurse-card span-12">
                                        <div className="nurse-card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
                                            <div>
                                                <h3>Gestión del Catálogo</h3>
                                                <p>Agrega nuevos procedimientos y administra el catálogo actual.</p>
                                            </div>
                                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                                                {/* Formulario para agregar */}
                                                <form onSubmit={handleAddProcedure} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <div className="patient-search-input" style={{ minWidth: '240px' }}>
                                                        <BriefcaseMedical size={16} />
                                                        <input
                                                            value={newProcedureName}
                                                            onChange={(e) => setNewProcedureName(e.target.value)}
                                                            placeholder="Nuevo procedimiento..."
                                                            required
                                                        />
                                                    </div>
                                                    <button className="action-button action-button--accent" type="submit" style={{ minHeight: '46px', borderRadius: '12px' }}>
                                                        <Save size={14} /> Registrar
                                                    </button>
                                                </form>

                                                {/* Buscador en el catálogo */}
                                                <div className="patient-search-input">
                                                    <Search size={16} />
                                                    <input
                                                        value={procedureSearchQuery}
                                                        onChange={(e) => setProcedureSearchQuery(e.target.value)}
                                                        placeholder="Buscar en catálogo..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ overflowX: 'auto', marginTop: '24px' }}>
                                            <table className="daily-table" style={{ width: '100%' }}>
                                                <thead>
                                                    <tr>
                                                        <th style={{ width: '60px', textAlign: 'center' }}>N°</th>
                                                        <th>Procedimiento de Enfermería</th>
                                                        <th>Estado</th>
                                                        <th style={{ width: '120px', textAlign: 'center' }}>Acción</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {proceduresCatalog
                                                        .filter(p => p.nombre_procedimiento.toLowerCase().includes(procedureSearchQuery.toLowerCase()))
                                                        .map((proc, idx) => (
                                                            <tr key={proc.id || idx}>
                                                                <td style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--text-secondary)' }}>{idx + 1}</td>
                                                                <td style={{ fontWeight: '600', color: 'var(--primary)' }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                        <span>{proc.nombre_procedimiento}</span>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--success)', background: 'var(--success-soft)', padding: '3px 8px', borderRadius: '12px' }}>
                                                                        Activo en Catálogo
                                                                    </span>
                                                                </td>
                                                                <td style={{ textAlign: 'center' }}>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleDeleteProcedure(proc.id)}
                                                                        className="action-button action-button--outline"
                                                                        style={{ padding: '3px 8px', minHeight: '28px', fontSize: '11px', borderRadius: '6px', borderColor: '#fca5a5', color: '#dc2626', margin: '0 auto' }}
                                                                        title="Eliminar procedimiento"
                                                                    >
                                                                        Eliminar
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    }
                                                    {proceduresCatalog.filter(p => p.nombre_procedimiento.toLowerCase().includes(procedureSearchQuery.toLowerCase())).length === 0 && (
                                                        <tr>
                                                            <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                                                                No se encontraron procedimientos en el catálogo.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </article>
                                </section>
                            </div>
                        )}

                        {/* PESTAÑA 4: REPORTES GENERALES (PARTE DIARIO) */}
                        {activeTab === 'historial' && (
                            <div>
                                <section className="page-hero" style={{ marginBottom: '20px' }}>
                                    <div>
                                        <span className="page-hero__label"><FileText size={14} style={{ marginRight: '6px', display: 'inline' }} /> Reportes y Gestión</span>
                                        <h2>Centro de Reportes de Enfermería</h2>
                                        <p>Genere, visualice e imprima los informes oficiales requeridos para las auditorías y entrega a sus superiores.</p>
                                    </div>
                                    <div className="page-hero__icon"><FileText size={34} /></div>
                                </section>

                                <div className="liquid-nav" style={{ marginBottom: '20px' }}>
                                    <button
                                        className={`liquid-nav__item ${activeReportSubTab === 'diario' ? 'active' : ''}`}
                                        onClick={() => { setActiveReportSubTab('diario'); setParteDiarioPage(1); }}
                                    >
                                        <ClipboardList size={16} />
                                        <span>Parte Diario</span>
                                    </button>
                                </div>

                                {activeReportSubTab === 'diario' && (
                                    <div>
                                        <section className="nurse-card daily-header-card" style={{ marginBottom: '20px' }}>
                                            <div className="daily-date-control" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '15px' }}>
                                                <div>
                                                    <span className="eyebrow">REPORTE DIARIO DE ATENCIONES</span>
                                                    <h3>Parte Diario de la Jornada</h3>
                                                    <p>Selecciona una fecha para visualizar y descargar el reporte del día.</p>
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
                                                    <div className="psycho-kpi-card__icon" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}><TrendingUp size={20} /></div>
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
                                        </section>

                                        <section className="nurse-card">
                                            <div className="nurse-card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                                                <div>
                                                    <span className="eyebrow">REGISTROS</span>
                                                    <h3>Listado de Atenciones</h3>
                                                </div>
                                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                    <div className="patient-search-input procedure-search">
                                                        <Search size={16} />
                                                        <input
                                                            value={parteDiarioSearch}
                                                            onChange={(e) => setParteDiarioSearch(e.target.value)}
                                                            placeholder="Buscar en este parte"
                                                        />
                                                    </div>
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
                                                    <>
                                                        {(() => {
                                                            const filtered = getFilteredParteDiario();
                                                            const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
                                                            const currentPage = Math.min(parteDiarioPage, totalPages);
                                                            const paginatedItems = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

                                                            return (
                                                                <>
                                                                    <table className="evolution-table">
                                                                        <thead>
                                                                            <tr>
                                                                                <th>Hora</th>
                                                                                <th>Paciente</th>
                                                                                <th>Procedimiento(s)</th>
                                                                                <th>Observación</th>
                                                                                <th>Estado</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {paginatedItems.map((item, idx) => (
                                                                                <tr key={idx}>
                                                                                    <td style={{ fontWeight: 'bold' }}>{new Date(item.created_at).toTimeString().slice(0, 5)}</td>
                                                                                    <td>
                                                                                        <div className="person-cell">
                                                                                            <div>
                                                                                                <strong>{item.paciente?.datos_identificacion ? `${item.paciente.datos_identificacion.primer_nombre} ${item.paciente.datos_identificacion.apellido_paterno}` : item.paciente?.name}</strong>
                                                                                                <span>{item.paciente?.datos_identificacion?.numero_cedula || 'Sin cédula'}</span>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        {(() => {
                                                                                            if (Array.isArray(item.id_procedimiento_enfermeria)) {
                                                                                                const list = proceduresCatalog.filter(p => item.id_procedimiento_enfermeria.includes(p.id));
                                                                                                return list.map(p => p.nombre_procedimiento).join(', ');
                                                                                            }
                                                                                            return item.procedimiento?.nombre_procedimiento || 'Ninguno';
                                                                                        })()}
                                                                                    </td>
                                                                                    <td>{item.detalle_procedimiento || 'Sin observaciones.'}</td>
                                                                                    <td>
                                                                                        <span className="evolution-badge evolution-badge--enfermeria">
                                                                                            Completada
                                                                                        </span>
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>

                                                                    {filtered.length > ITEMS_PER_PAGE && (
                                                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '20px', paddingTop: '15px', borderTop: '1px solid var(--border)' }}>
                                                                            <button
                                                                                onClick={() => setParteDiarioPage(prev => Math.max(prev - 1, 1))}
                                                                                disabled={currentPage === 1}
                                                                                style={{
                                                                                    padding: '6px 14px',
                                                                                    borderRadius: '8px',
                                                                                    border: '1px solid var(--border)',
                                                                                    background: currentPage === 1 ? '#f1f5f9' : '#fff',
                                                                                    color: currentPage === 1 ? '#94a3b8' : 'var(--primary)',
                                                                                    fontSize: '11.5px',
                                                                                    fontWeight: '600',
                                                                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                                                                                }}
                                                                            >
                                                                                ← Anterior
                                                                            </button>
                                                                            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: '600' }}>
                                                                                Página {currentPage} de {totalPages}
                                                                            </span>
                                                                            <button
                                                                                onClick={() => setParteDiarioPage(prev => Math.min(prev + 1, totalPages))}
                                                                                disabled={currentPage === totalPages}
                                                                                style={{
                                                                                    padding: '6px 14px',
                                                                                    borderRadius: '8px',
                                                                                    border: '1px solid var(--border)',
                                                                                    background: currentPage === totalPages ? '#f1f5f9' : '#fff',
                                                                                    color: currentPage === totalPages ? '#94a3b8' : 'var(--primary)',
                                                                                    fontSize: '11.5px',
                                                                                    fontWeight: '600',
                                                                                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                                                                                }}
                                                                            >
                                                                                Siguiente →
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            );
                                                        })()}
                                                    </>
                                                )}
                                            </div>
                                        </section>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* PESTAÑA 5: FARMACIA - INVENTARIO */}
                        {activeTab === 'farmacia-inventario' && (
                            <FarmaciaInventarioTab showSystemToast={showSystemToast} />
                        )}

                        {/* PESTAÑA 6: FARMACIA - DESPACHO DE RECETAS */}
                        {activeTab === 'farmacia-despacho' && (
                            <FarmaciaDespachoTab showSystemToast={showSystemToast} onDespachoUpdated={setPendingDespachosCount} />
                        )}

                        {/* PESTAÑA 7: FARMACIA - PRESENTACIONES */}
                        {activeTab === 'farmacia-presentaciones' && (
                            <FarmaciaPresentacionesTab showSystemToast={showSystemToast} />
                        )}
                    </div>
                </main>
            </div>

            {/* ==========================================
               MODAL: BUSCADOR DE PACIENTE
            ========================================== */}
            {vitalsModalSearchOpen && (
                <div className="clinical-modal show">
                    <div className="clinical-modal__backdrop" onClick={() => setVitalsModalSearchOpen(false)}></div>
                    <div className="clinical-modal__dialog clinical-modal__dialog--compact">
                        <header className="clinical-modal__header">
                            <div className="clinical-modal__patient">
                                <div className="clinical-modal__avatar"><Search size={18} /></div>
                                <div>
                                    <span>Buscador clínico</span>
                                    <h2>Buscar Paciente por Cédula</h2>
                                </div>
                            </div>
                            <button className="clinical-modal__close" onClick={() => setVitalsModalSearchOpen(false)}><X size={15} /></button>
                        </header>

                        <div className="clinical-modal__body">
                            <form onSubmit={handleModalPatientSearch} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
                                    <div key={idx} className="patient-suggestion" style={{ gridTemplateColumns: 'auto 1fr auto', display: 'grid' }}>
                                        <div className="patient-suggestion__avatar">
                                            {(pat.nombre_completo || pat.name || '').split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                        </div>
                                        <div className="patient-suggestion__identity">
                                            <strong>{pat.nombre_completo || pat.name || 'Sin nombre'}</strong>
                                            <small>Cédula: {pat.numero_cedula || pat.cedula} · Correo: {pat.email || 'N/D'}</small>
                                        </div>
                                        <button className="attend-patient-button" onClick={() => openVitalsFormFor(pat)}>
                                            Seleccionar <ChevronRight size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ==========================================
               MODAL: REGISTRAR PACIENTE NUEVO (RAPIDO)
            ========================================== */}
            {vitalsModalRegisterOpen && (
                <div className="clinical-modal show">
                    <div className="clinical-modal__backdrop" onClick={() => { setVitalsModalRegisterOpen(false); setQuickValidationTriggered(false); }}></div>
                    <section className="clinical-modal__dialog clinical-modal__dialog--compact">
                        <header className="clinical-modal__header">
                            <div className="clinical-modal__patient">
                                <span className="clinical-modal__avatar"><UserPlus size={18} /></span>
                                <div>
                                    <span>Nueva ficha</span>
                                    <h2>Registrar paciente nuevo</h2>
                                </div>
                            </div>
                            <button className="clinical-modal__close" onClick={() => { setVitalsModalRegisterOpen(false); setQuickValidationTriggered(false); }}><X size={15} /></button>
                        </header>
                        <form onSubmit={handleQuickRegisterPatient} className="clinical-modal__body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {registerError && (
                                <div className="alert alert-danger" style={{ color: '#b71a34', marginBottom: '10px' }}>
                                    {registerError}
                                </div>
                            )}

                            <div className="premium-field-card">
                                <div className="field-header">
                                    <div className="field-header__left">
                                        <span className="field-header__icon"><User size={15} /></span>
                                        <h4 className="field-header__title">Nombres y Apellidos Completos</h4>
                                    </div>
                                    <span className="field-badge-req">Requerido</span>
                                </div>
                                <input
                                    value={newPatientForm.nombre_completo}
                                    onChange={(e) => setNewPatientForm({ ...newPatientForm, nombre_completo: e.target.value })}
                                    placeholder="Ej: Maria Fernanda Lopez Gomez"
                                    style={getQuickInputStyle(newPatientForm.nombre_completo)}
                                    required
                                />
                            </div>

                            <div className="clinical-fields-grid">
                                <div className="premium-field-card">
                                    <div className="field-header">
                                        <div className="field-header__left">
                                            <span className="field-header__icon"><ShieldCheck size={15} /></span>
                                            <h4 className="field-header__title">Tipo de Documento</h4>
                                        </div>
                                        <span className="field-badge-req">Requerido</span>
                                    </div>
                                    <select
                                        value={newPatientForm.tipo_documento}
                                        onChange={(e) => setNewPatientForm({ ...newPatientForm, tipo_documento: e.target.value, cedula: '', pais_origen: '' })}
                                    >
                                        <option value="cedula">Cédula de Identidad</option>
                                        <option value="pasaporte">Pasaporte (Extranjero)</option>
                                    </select>
                                </div>

                                <div className="premium-field-card">
                                    <div className="field-header">
                                        <div className="field-header__left">
                                            <span className="field-header__icon"><ShieldCheck size={15} /></span>
                                            <h4 className="field-header__title">{newPatientForm.tipo_documento === 'pasaporte' ? 'Número de Pasaporte' : 'Número de Cédula'}</h4>
                                        </div>
                                        <span className="field-badge-req">Requerido</span>
                                    </div>
                                    <input
                                        value={newPatientForm.cedula}
                                        onChange={(e) => setNewPatientForm({ ...newPatientForm, cedula: e.target.value })}
                                        placeholder={newPatientForm.tipo_documento === 'pasaporte' ? 'Ej: AB123456' : 'Ej: 0201234567'}
                                        maxLength={newPatientForm.tipo_documento === 'pasaporte' ? 20 : 10}
                                        style={getQuickInputStyle(newPatientForm.cedula)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="clinical-fields-grid">
                                <div className="premium-field-card" style={{ gridColumn: newPatientForm.tipo_documento === 'pasaporte' ? 'span 1' : 'span 2' }}>
                                    <div className="field-header">
                                        <div className="field-header__left">
                                            <span className="field-header__icon"><UserRound size={15} /></span>
                                            <h4 className="field-header__title">Tipo de Paciente</h4>
                                        </div>
                                        <span className="field-badge-req">Requerido</span>
                                    </div>
                                    <select
                                        value={newPatientForm.id_tipo_usuario || 2}
                                        onChange={(e) => {
                                            const selectedId = Number(e.target.value);
                                            const roleMap = {
                                                2: 'Estudiante',
                                                3: 'Docente',
                                                4: 'Administrativo',
                                                5: 'Servidor Público / Código de Trabajo'
                                            };
                                            setNewPatientForm({
                                                ...newPatientForm,
                                                id_tipo_usuario: selectedId,
                                                tipo: roleMap[selectedId] || 'Estudiante'
                                            });
                                        }}
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
                                                <span className="field-header__icon"><Globe size={15} /></span>
                                                <h4 className="field-header__title">País de Origen</h4>
                                            </div>
                                            <span className="field-badge-req">Requerido</span>
                                        </div>
                                        <select
                                            value={newPatientForm.pais_origen}
                                            onChange={(e) => setNewPatientForm({ ...newPatientForm, pais_origen: e.target.value })}
                                            style={getQuickInputStyle(newPatientForm.pais_origen)}
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
                                        <h4 className="field-header__title">Correo Institucional</h4>
                                    </div>
                                    <span className="field-badge-req">Requerido</span>
                                </div>
                                <div style={getQuickEmailInputStyle(newPatientForm.correo)}>
                                    <input
                                        type="text"
                                        value={newPatientForm.correo}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/@.*/, '').trim();
                                            setNewPatientForm({ ...newPatientForm, correo: val });
                                        }}
                                        placeholder="usuario.estudiante"
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
                                        required
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

                            <footer className="clinical-modal__actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                                <button className="action-button action-button--light" type="button" onClick={() => { setVitalsModalRegisterOpen(false); setQuickValidationTriggered(false); }}>Cancelar</button>
                                <button className="action-button action-button--accent" type="submit" disabled={registerLoading}>
                                    {registerLoading ? 'Registrando...' : 'Registrar paciente'}
                                </button>
                            </footer>
                        </form>
                    </section>
                </div>
            )}

            {/* ==========================================
               MODAL: FORMULARIO DE SIGNOS VITALES
            ========================================== */}
            {vitalsModalFormOpen && (
                <div className="clinical-modal show">
                    <div className="clinical-modal__backdrop" onClick={handleCancelVitals}></div>
                    <section className="clinical-modal__dialog">
                        <header className="clinical-modal__header">
                            <div className="clinical-modal__patient">
                                <span className="clinical-modal__avatar">SV</span>
                                <div>
                                    <span>Valoración clínica</span>
                                    <h2>{selectedPatient?.nombre_completo}</h2>
                                    <p>Cédula: {selectedPatient?.numero_cedula}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {draftLastSaved && !isOffline && (
                                    <span className="header-autosave-badge" title={`Borrador respaldado automáticamente a las ${draftLastSaved}`}>
                                        <CheckCircle size={13} color="#f87171" /> Guardado {draftLastSaved}
                                    </span>
                                )}
                                <button className="clinical-modal__close" onClick={handleCancelVitals}><X size={15} /></button>
                            </div>
                        </header>
                        <form onSubmit={handleVitalsFormSubmit} className="clinical-modal__body">
                            {isOffline && (
                                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '10px 16px', borderRadius: '10px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', fontWeight: '600' }}>
                                    <ShieldCheck size={16} color="#dc2626" />
                                    <span>Conexión a internet perdida. Tus avances se están guardando localmente en tiempo real.</span>
                                </div>
                            )}
                            {/* STEPPER CLINICO */}
                            <div className="clinical-stepper">
                                {steps.map((step, idx) => (
                                    <React.Fragment key={step.key}>
                                        <div
                                            className={`stepper-step ${currentStepIndex === idx ? 'active' : ''} ${currentStepIndex > idx ? 'completed' : ''}`}
                                        >
                                            <div className="stepper-step__circle">{idx + 1}</div>
                                            <span className="stepper-step__label">{step.label}</span>
                                        </div>
                                        {idx < steps.length - 1 && <div className="stepper-separator" />}
                                    </React.Fragment>
                                ))}
                            </div>

                            {/* CONTENIDO DEL PASO ACTIVO */}
                            {currentStepIndex === 0 && (
                                <div className="clinical-form-section">
                                    <div className="clinical-form-section__title">
                                        <Activity size={24} />
                                        <div>
                                            <h3>Signos Vitales y Biometría</h3>
                                            <p>Registra los valores clínicos obtenidos durante la atención inicial.</p>
                                        </div>
                                    </div>
                                    <div className="clinical-fields-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>

                                        <div className="premium-field-card">
                                            <div className="field-header">
                                                <div className="field-header__left">
                                                    <span className="field-header__icon"><Activity size={15} /></span>
                                                    <h4 className="field-header__title">Presión Sistólica</h4>
                                                </div>
                                                <span className="field-badge-req">Requerido</span>
                                            </div>
                                            <div className="input-with-unit">
                                                <input
                                                    type="number"
                                                    value={vitalsForm.presion_arterial_sistolica}
                                                    onChange={(e) => setVitalsForm({ ...vitalsForm, presion_arterial_sistolica: e.target.value })}
                                                    placeholder="120"
                                                    style={getInputStyle(vitalsForm.presion_arterial_sistolica)}
                                                    required
                                                />
                                                <small>mmHg</small>
                                            </div>
                                        </div>

                                        <div className="premium-field-card">
                                            <div className="field-header">
                                                <div className="field-header__left">
                                                    <span className="field-header__icon"><Activity size={15} /></span>
                                                    <h4 className="field-header__title">Presión Diastólica</h4>
                                                </div>
                                                <span className="field-badge-req">Requerido</span>
                                            </div>
                                            <div className="input-with-unit">
                                                <input
                                                    type="number"
                                                    value={vitalsForm.presion_arterial_diastolica}
                                                    onChange={(e) => setVitalsForm({ ...vitalsForm, presion_arterial_diastolica: e.target.value })}
                                                    placeholder="80"
                                                    style={getInputStyle(vitalsForm.presion_arterial_diastolica)}
                                                    required
                                                />
                                                <small>mmHg</small>
                                            </div>
                                        </div>

                                        <div className="premium-field-card">
                                            <div className="field-header">
                                                <div className="field-header__left">
                                                    <span className="field-header__icon"><HeartPulse size={15} /></span>
                                                    <h4 className="field-header__title">Frecuencia Cardíaca</h4>
                                                </div>
                                                <span className="field-badge-req">Requerido</span>
                                            </div>
                                            <div className="input-with-unit">
                                                <input
                                                    type="number"
                                                    value={vitalsForm.frecuencia_cardiaca}
                                                    onChange={(e) => setVitalsForm({ ...vitalsForm, frecuencia_cardiaca: e.target.value })}
                                                    placeholder="72"
                                                    style={getInputStyle(vitalsForm.frecuencia_cardiaca)}
                                                    required
                                                />
                                                <small>lpm</small>
                                            </div>
                                        </div>

                                        <div className="premium-field-card">
                                            <div className="field-header">
                                                <div className="field-header__left">
                                                    <span className="field-header__icon"><Wind size={15} /></span>
                                                    <h4 className="field-header__title">Frecuencia Respiratoria</h4>
                                                </div>
                                                <span className="field-badge-req">Requerido</span>
                                            </div>
                                            <div className="input-with-unit">
                                                <input
                                                    type="number"
                                                    value={vitalsForm.frecuencia_respiratoria}
                                                    onChange={(e) => setVitalsForm({ ...vitalsForm, frecuencia_respiratoria: e.target.value })}
                                                    placeholder="16"
                                                    style={getInputStyle(vitalsForm.frecuencia_respiratoria)}
                                                    required
                                                />
                                                <small>rpm</small>
                                            </div>
                                        </div>

                                        <div className="premium-field-card">
                                            <div className="field-header">
                                                <div className="field-header__left">
                                                    <span className="field-header__icon"><Thermometer size={15} /></span>
                                                    <h4 className="field-header__title">Temperatura</h4>
                                                </div>
                                                <span className="field-badge-req">Requerido</span>
                                            </div>
                                            <div className="input-with-unit">
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={vitalsForm.temperatura}
                                                    onChange={(e) => setVitalsForm({ ...vitalsForm, temperatura: e.target.value })}
                                                    placeholder="36.5"
                                                    style={getInputStyle(vitalsForm.temperatura)}
                                                    required
                                                />
                                                <small>°C</small>
                                            </div>
                                        </div>

                                        <div className="premium-field-card">
                                            <div className="field-header">
                                                <div className="field-header__left">
                                                    <span className="field-header__icon"><Ruler size={15} /></span>
                                                    <h4 className="field-header__title">Talla (Estatura)</h4>
                                                </div>
                                                <span className="field-badge-req">Requerido</span>
                                            </div>
                                            <div className="input-with-unit">
                                                <input
                                                    type="number"
                                                    value={vitalsForm.talla}
                                                    onChange={(e) => setVitalsForm({ ...vitalsForm, talla: e.target.value })}
                                                    placeholder="160"
                                                    style={getInputStyle(vitalsForm.talla)}
                                                    required
                                                />
                                                <small>cm</small>
                                            </div>
                                        </div>

                                        <div className="premium-field-card" style={{ gridColumn: 'span 2' }}>
                                            <div className="field-header">
                                                <div className="field-header__left">
                                                    <span className="field-header__icon"><Scale size={15} /></span>
                                                    <h4 className="field-header__title">Peso Corporal</h4>
                                                </div>
                                                <span className="field-badge-req">Requerido</span>
                                            </div>
                                            <div className="input-with-unit">
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={vitalsForm.peso}
                                                    onChange={(e) => setVitalsForm({ ...vitalsForm, peso: e.target.value })}
                                                    placeholder="60.0"
                                                    style={getInputStyle(vitalsForm.peso)}
                                                    required
                                                />
                                                <small>kg</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStepIndex === 1 && (
                                <div className="clinical-form-section">
                                    <div className="clinical-form-section__title">
                                        <BriefcaseMedical size={24} />
                                        <div>
                                            <h3>Atención realizada</h3>
                                            <p>Registra el procedimiento realizado en la consulta.</p>
                                        </div>
                                    </div>
                                    <div className="clinical-fields-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                                        <div className="premium-field-card">
                                            <div className="field-header">
                                                <div className="field-header__left">
                                                    <span className="field-header__icon"><Clock size={15} /></span>
                                                    <h4 className="field-header__title">Hora de Atención</h4>
                                                </div>
                                                <span className="field-badge-req">Requerido</span>
                                            </div>
                                            <input
                                                type="time"
                                                value={vitalsForm.hora}
                                                onChange={(e) => setVitalsForm({ ...vitalsForm, hora: e.target.value })}
                                                style={getInputStyle(vitalsForm.hora)}
                                                required
                                            />
                                        </div>

                                        <div className="premium-field-card">
                                            <div className="field-header">
                                                <div className="field-header__left">
                                                    <span className="field-header__icon"><BriefcaseMedical size={15} /></span>
                                                    <h4 className="field-header__title">Tipo de Atención</h4>
                                                </div>
                                                <span className="field-badge-req">Requerido</span>
                                            </div>
                                            <select
                                                value={vitalsForm.tipo_atencion}
                                                onChange={(e) => setVitalsForm({ ...vitalsForm, tipo_atencion: e.target.value })}
                                                style={getInputStyle(vitalsForm.tipo_atencion)}
                                            >
                                                <option value="primaria">Primaria (Consulta Inicial)</option>
                                                <option value="secundaria">Secundaria (Revisión)</option>
                                            </select>
                                        </div>

                                        <div className="premium-field-card">
                                            <div className="field-header">
                                                <div className="field-header__left">
                                                    <span className="field-header__icon"><Syringe size={15} /></span>
                                                    <h4 className="field-header__title">Finalidad de Consulta</h4>
                                                </div>
                                                <span className="field-badge-req">Requerido</span>
                                            </div>
                                            <select
                                                value={vitalsForm.tipo}
                                                onChange={(e) => setVitalsForm({ ...vitalsForm, tipo: e.target.value })}
                                                style={getInputStyle(vitalsForm.tipo)}
                                            >
                                                <option value="curativo">Curativo</option>
                                                <option value="preventivo">Preventivo</option>
                                            </select>
                                        </div>
                                        {(() => {
                                            const getDocName = (d) => d?.nombre_completo || d?.name || d?.email || (d?.id ? `Médico #${d.id}` : '');
                                            const selectedDoctor = doctoresCampus.find(d => String(d.id) === String(vitalsForm.id_usuario_medico_general));
                                            const filteredDoctors = doctoresCampus.filter(d =>
                                                getDocName(d).toLowerCase().includes(doctorSearchQuery.toLowerCase())
                                            );

                                            return (
                                                <label className="field" style={{ gridColumn: 'span 3', position: 'relative' }}>
                                                    <span>Médico General asignado</span>

                                                    {/* Selector visible */}
                                                    <div
                                                        onClick={() => setIsDoctorDropdownOpen(!isDoctorDropdownOpen)}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            width: '100%',
                                                            padding: '10px 16px',
                                                            borderRadius: '12px',
                                                            border: '1.5px solid var(--border)',
                                                            background: 'var(--input-bg, #fcfdfe)',
                                                            cursor: 'pointer',
                                                            fontSize: '13px',
                                                            color: 'var(--text-primary)',
                                                            minHeight: '46px',
                                                            boxSizing: 'border-box',
                                                            transition: 'all 0.15s ease',
                                                            borderColor: isDoctorDropdownOpen ? 'var(--primary)' : 'var(--border)'
                                                        }}
                                                    >
                                                        {selectedDoctor ? (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                                <span style={{ fontWeight: 'normal', color: 'var(--text-primary)' }}>{getDocName(selectedDoctor)}</span>
                                                                {selectedDoctor.campuses?.[0]?.nombre && (
                                                                    <span style={{
                                                                        padding: '2px 8px',
                                                                        borderRadius: '20px',
                                                                        background: 'var(--primary-soft)',
                                                                        color: 'var(--primary)',
                                                                        fontSize: '10px',
                                                                        fontWeight: 500
                                                                    }}>
                                                                        {selectedDoctor.campuses[0].nombre}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span style={{ color: 'var(--text-muted)' }}>Sin asignar</span>
                                                        )}
                                                        <ChevronDown size={16} style={{ transition: 'transform 0.2s ease', transform: isDoctorDropdownOpen ? 'rotate(180deg)' : 'none', color: 'var(--text-muted)' }} />
                                                    </div>

                                                    {/* Panel de dropdown */}
                                                    {isDoctorDropdownOpen && (
                                                        <>
                                                            <div
                                                                onClick={() => { setIsDoctorDropdownOpen(false); setDoctorSearchQuery(''); }}
                                                                style={{ position: 'fixed', inset: 0, zIndex: 998 }}
                                                            />
                                                            <div
                                                                style={{
                                                                    position: 'absolute',
                                                                    top: 'calc(100% + 4px)',
                                                                    left: 0,
                                                                    right: 0,
                                                                    background: 'var(--surface, #fff)',
                                                                    borderRadius: '14px',
                                                                    border: '1px solid var(--border)',
                                                                    boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
                                                                    zIndex: 999,
                                                                    overflow: 'hidden',
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    maxHeight: '260px',
                                                                    animation: 'fadeIn 0.15s ease'
                                                                }}
                                                            >
                                                                {/* Input de Buscador */}
                                                                <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border)', padding: '10px 14px', background: 'var(--input-bg, #fcfdfe)', gap: '8px' }}>
                                                                    <Search size={14} style={{ color: 'var(--text-muted)' }} />
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Buscar médico por nombre..."
                                                                        value={doctorSearchQuery}
                                                                        onChange={(e) => setDoctorSearchQuery(e.target.value)}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        style={{
                                                                            border: 'none',
                                                                            background: 'transparent',
                                                                            outline: 'none',
                                                                            fontSize: '13px',
                                                                            color: 'var(--text-primary)',
                                                                            width: '100%',
                                                                            padding: 0
                                                                        }}
                                                                    />
                                                                    {doctorSearchQuery && (
                                                                        <X
                                                                            size={14}
                                                                            onClick={(e) => { e.stopPropagation(); setDoctorSearchQuery(''); }}
                                                                            style={{ color: 'var(--text-muted)', cursor: 'pointer' }}
                                                                        />
                                                                    )}
                                                                </div>

                                                                {/* Lista de médicos */}
                                                                <div style={{ overflowY: 'auto', flex: 1, padding: '6px' }}>
                                                                    <div
                                                                        onClick={() => {
                                                                            setVitalsForm({ ...vitalsForm, id_usuario_medico_general: '' });
                                                                            setIsDoctorDropdownOpen(false);
                                                                            setDoctorSearchQuery('');
                                                                        }}
                                                                        style={{
                                                                            padding: '10px 14px',
                                                                            borderRadius: '8px',
                                                                            cursor: 'pointer',
                                                                            fontSize: '13px',
                                                                            color: !vitalsForm.id_usuario_medico_general ? 'var(--primary)' : 'var(--text-secondary)',
                                                                            background: !vitalsForm.id_usuario_medico_general ? 'var(--primary-soft)' : 'transparent',
                                                                            fontWeight: 'normal',
                                                                            transition: 'all 0.15s ease'
                                                                        }}
                                                                    >
                                                                        Sin asignar
                                                                    </div>

                                                                    {filteredDoctors.length > 0 ? (
                                                                        filteredDoctors.map((d) => {
                                                                            const isSelected = String(vitalsForm.id_usuario_medico_general) === String(d.id);
                                                                            const campusName = d.campuses?.[0]?.nombre || '';
                                                                            return (
                                                                                <div
                                                                                    key={d.id}
                                                                                    onClick={() => {
                                                                                        setVitalsForm({ ...vitalsForm, id_usuario_medico_general: d.id });
                                                                                        setIsDoctorDropdownOpen(false);
                                                                                        setDoctorSearchQuery('');
                                                                                    }}
                                                                                    style={{
                                                                                        padding: '10px 14px',
                                                                                        borderRadius: '8px',
                                                                                        cursor: 'pointer',
                                                                                        display: 'flex',
                                                                                        alignItems: 'center',
                                                                                        justifyContent: 'space-between',
                                                                                        background: isSelected ? 'var(--primary-soft)' : 'transparent',
                                                                                        color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                                                                                        fontWeight: 'normal',
                                                                                        transition: 'all 0.15s ease',
                                                                                        marginTop: '2px'
                                                                                    }}
                                                                                >
                                                                                    <span style={{ fontSize: '13px', color: isSelected ? 'var(--primary)' : 'var(--text-primary)', fontWeight: 'normal' }}>{getDocName(d)}</span>
                                                                                    {campusName && (
                                                                                        <span style={{
                                                                                            padding: '2px 8px',
                                                                                            borderRadius: '20px',
                                                                                            background: isSelected ? 'var(--primary)' : 'var(--border)',
                                                                                            color: isSelected ? 'white' : 'var(--text-secondary)',
                                                                                            fontSize: '10px',
                                                                                            fontWeight: 500
                                                                                        }}>
                                                                                            {campusName}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            );
                                                                        })
                                                                    ) : (
                                                                        <div style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center' }}>
                                                                            No se encontraron médicos.
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </label>
                                            );
                                        })()}
                                        {(() => {
                                            const selectedProcs = proceduresCatalog.filter(p => vitalsForm.id_procedimiento_enfermeria.includes(p.id));
                                            const filteredProcs = proceduresCatalog.filter(p =>
                                                p.nombre_procedimiento.toLowerCase().includes(vitalsProcedureSearchQuery.toLowerCase())
                                            );

                                            return (
                                                <label className="field" style={{ gridColumn: 'span 3', position: 'relative' }}>
                                                    <span>Procedimiento(s) realizado(s) *</span>

                                                    {/* Trigger Selector */}
                                                    <div
                                                        onClick={() => setVitalsProcedureDropdownOpen(!vitalsProcedureDropdownOpen)}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            width: '100%',
                                                            padding: '8px 16px',
                                                            borderRadius: '12px',
                                                            border: `1.5px solid ${validationTriggered && vitalsForm.id_procedimiento_enfermeria.length === 0 ? '#dc2626' : (vitalsProcedureDropdownOpen ? 'var(--primary)' : 'var(--border)')}`,
                                                            background: 'var(--input-bg, #fcfdfe)',
                                                            cursor: 'pointer',
                                                            fontSize: '13px',
                                                            color: 'var(--text-primary)',
                                                            minHeight: '46px',
                                                            boxSizing: 'border-box',
                                                            transition: 'all 0.15s ease'
                                                        }}
                                                    >
                                                        {selectedProcs.length > 0 ? (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', maxWidth: '90%' }}>
                                                                {selectedProcs.map((p) => (
                                                                    <span
                                                                        key={p.id}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation(); // Evitar abrir/cerrar el dropdown
                                                                            setVitalsForm({
                                                                                ...vitalsForm,
                                                                                id_procedimiento_enfermeria: vitalsForm.id_procedimiento_enfermeria.filter(id => id !== p.id)
                                                                            });
                                                                        }}
                                                                        style={{
                                                                            display: 'inline-flex',
                                                                            alignItems: 'center',
                                                                            gap: '6px',
                                                                            padding: '3px 8px',
                                                                            borderRadius: '20px',
                                                                            background: 'var(--primary-soft)',
                                                                            color: 'var(--primary)',
                                                                            fontSize: '11px',
                                                                            fontWeight: 500
                                                                        }}
                                                                    >
                                                                        {p.nombre_procedimiento}
                                                                        <span style={{
                                                                            display: 'inline-flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            width: '12px',
                                                                            height: '12px',
                                                                            borderRadius: '50%',
                                                                            background: 'rgba(0, 0, 0, 0.08)',
                                                                            color: 'var(--primary)',
                                                                            fontSize: '9px',
                                                                            lineHeight: 1,
                                                                            cursor: 'pointer'
                                                                        }}>×</span>
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span style={{ color: 'var(--text-muted)' }}>Selecciona uno o más procedimientos...</span>
                                                        )}
                                                        <ChevronDown size={16} style={{ transition: 'transform 0.2s ease', transform: vitalsProcedureDropdownOpen ? 'rotate(180deg)' : 'none', color: 'var(--text-muted)' }} />
                                                    </div>

                                                    {/* Dropdown Panel */}
                                                    {vitalsProcedureDropdownOpen && (
                                                        <>
                                                            <div
                                                                onClick={() => { setVitalsProcedureDropdownOpen(false); setVitalsProcedureSearchQuery(''); }}
                                                                style={{ position: 'fixed', inset: 0, zIndex: 998 }}
                                                            />
                                                            <div
                                                                style={{
                                                                    position: 'absolute',
                                                                    top: 'calc(100% + 4px)',
                                                                    left: 0,
                                                                    right: 0,
                                                                    background: 'var(--surface, #fff)',
                                                                    borderRadius: '14px',
                                                                    border: '1px solid var(--border)',
                                                                    boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
                                                                    zIndex: 999,
                                                                    overflow: 'hidden',
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    maxHeight: '260px',
                                                                    animation: 'fadeIn 0.15s ease'
                                                                }}
                                                            >
                                                                {/* Search Input */}
                                                                <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border)', padding: '10px 14px', background: 'var(--input-bg, #fcfdfe)', gap: '8px' }}>
                                                                    <Search size={14} style={{ color: 'var(--text-muted)' }} />
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Buscar procedimiento..."
                                                                        value={vitalsProcedureSearchQuery}
                                                                        onChange={(e) => setVitalsProcedureSearchQuery(e.target.value)}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        style={{
                                                                            border: 'none',
                                                                            background: 'transparent',
                                                                            outline: 'none',
                                                                            fontSize: '13px',
                                                                            color: 'var(--text-primary)',
                                                                            width: '100%',
                                                                            padding: 0
                                                                        }}
                                                                    />
                                                                    {vitalsProcedureSearchQuery && (
                                                                        <X
                                                                            size={14}
                                                                            onClick={(e) => { e.stopPropagation(); setVitalsProcedureSearchQuery(''); }}
                                                                            style={{ color: 'var(--text-muted)', cursor: 'pointer' }}
                                                                        />
                                                                    )}
                                                                </div>

                                                                {/* List Items */}
                                                                <div style={{ overflowY: 'auto', flex: 1, padding: '6px' }}>
                                                                    {filteredProcs.length > 0 ? (
                                                                        filteredProcs.map((p) => {
                                                                            const isSelected = vitalsForm.id_procedimiento_enfermeria.includes(p.id);
                                                                            return (
                                                                                <div
                                                                                    key={p.id}
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        const current = [...vitalsForm.id_procedimiento_enfermeria];
                                                                                        if (isSelected) {
                                                                                            setVitalsForm({
                                                                                                ...vitalsForm,
                                                                                                id_procedimiento_enfermeria: current.filter(id => id !== p.id)
                                                                                            });
                                                                                        } else {
                                                                                            setVitalsForm({
                                                                                                ...vitalsForm,
                                                                                                id_procedimiento_enfermeria: [...current, p.id]
                                                                                            });
                                                                                        }
                                                                                    }}
                                                                                    style={{
                                                                                        padding: '10px 14px',
                                                                                        borderRadius: '8px',
                                                                                        cursor: 'pointer',
                                                                                        display: 'flex',
                                                                                        alignItems: 'center',
                                                                                        justifyContent: 'space-between',
                                                                                        background: isSelected ? 'var(--primary-soft)' : 'transparent',
                                                                                        color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                                                                                        fontWeight: 'normal',
                                                                                        transition: 'all 0.15s ease',
                                                                                        marginTop: '2px'
                                                                                    }}
                                                                                >
                                                                                    <span style={{ fontSize: '13px', color: isSelected ? 'var(--primary)' : 'var(--text-primary)', fontWeight: 'normal' }}>
                                                                                        {p.nombre_procedimiento}
                                                                                    </span>
                                                                                    <div style={{
                                                                                        width: '18px',
                                                                                        height: '18px',
                                                                                        borderRadius: '6px',
                                                                                        border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--text-muted)'}`,
                                                                                        background: isSelected ? 'var(--primary)' : 'transparent',
                                                                                        display: 'flex',
                                                                                        alignItems: 'center',
                                                                                        justifyContent: 'center',
                                                                                        transition: 'all 0.15s ease',
                                                                                        flexShrink: 0
                                                                                    }}>
                                                                                        {isSelected && (
                                                                                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: '#fff' }}>
                                                                                                <path d="M9 1L3.5 6.5L1 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                                            </svg>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })
                                                                    ) : (
                                                                        <div style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center' }}>
                                                                            No se encontraron procedimientos.
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                    {validationTriggered && vitalsForm.id_procedimiento_enfermeria.length === 0 && (
                                                        <small style={{ color: '#dc2626', marginTop: '6px', display: 'block' }}>Debe seleccionar al menos un procedimiento.</small>
                                                    )}
                                                </label>
                                            );
                                        })()}
                                        <div className="premium-field-card" style={{ gridColumn: 'span 3' }}>
                                            <div className="field-header">
                                                <div className="field-header__left">
                                                    <span className="field-header__icon"><FileText size={15} /></span>
                                                    <h4 className="field-header__title">Observaciones de Enfermería</h4>
                                                </div>
                                                <span className="field-badge-opt">Opcional</span>
                                            </div>
                                            <textarea
                                                value={vitalsForm.detalle_procedimiento}
                                                onChange={(e) => setVitalsForm({ ...vitalsForm, detalle_procedimiento: e.target.value })}
                                                placeholder="Detalla observaciones clínicamente relevantes sobre la atención..."
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStepIndex === 2 && (
                                <div className="clinical-form-section">
                                    <div className="clinical-form-section__title" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--primary-soft, #eff6ff)', color: 'var(--primary, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <BarChart3 size={22} />
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Punto 3: Histograma y Análisis de Signos Vitales</h3>
                                            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Filtra y visualiza la distribución de frecuencia histórica de signos vitales.</p>
                                        </div>
                                    </div>
                                    <VitalSignsHistogram patient={selectedPatient} isInline={true} />
                                </div>
                            )}

                            <footer className="clinical-modal__actions" style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginTop: '20px' }}>
                                <button className="action-button action-button--light" type="button" onClick={handlePrevStep} disabled={currentStepIndex === 0}>
                                    Atrás
                                </button>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button className="action-button action-button--danger" type="button" onClick={handleCancelVitals}>
                                        Cancelar
                                    </button>
                                    {currentStepIndex < steps.length - 1 ? (
                                        <button className="action-button action-button--primary" type="button" onClick={handleNextStep}>
                                            Siguiente
                                        </button>
                                    ) : (
                                        <button className="action-button action-button--success" type="submit">
                                            Generar Vista Previa
                                        </button>
                                    )}
                                </div>
                            </footer>
                        </form>
                    </section>
                </div>
            )}

            {/* ==========================================
               MODAL: VISTA PREVIA CLINICA ADAPTADA
            ========================================== */}
            {vitalsBookPreviewOpen && (
                <div className="clinical-modal show">
                    <div className="clinical-modal__backdrop" onClick={() => setVitalsBookPreviewOpen(false)}></div>
                    <div className="clinical-modal__dialog" style={{ maxWidth: '600px' }}>
                        <header className="clinical-modal__header">
                            <div className="clinical-modal__patient">
                                <span className="clinical-modal__avatar"><ShieldCheck size={18} /></span>
                                <div>
                                    <span>Vista previa de atención</span>
                                    <h2>Confirmar Registro Clínico</h2>
                                </div>
                            </div>
                            <button className="clinical-modal__close" onClick={() => setVitalsBookPreviewOpen(false)}><X size={15} /></button>
                        </header>

                        <div className="clinical-modal__body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {/* Patient info card */}
                            <div className="premium-field-card" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '15px', alignItems: 'center', background: 'var(--primary-soft)', padding: '16px', borderRadius: '12px' }}>
                                <div className="person-avatar" style={{ width: '45px', height: '45px', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary)', color: '#fff', borderRadius: '50%', fontWeight: 'bold' }}>
                                    {selectedPatient?.nombre_completo?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <span className="eyebrow" style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase' }}>PACIENTE</span>
                                    <h3 style={{ margin: '2px 0 0', fontSize: '15px', color: 'var(--primary)', fontWeight: 'bold' }}>{selectedPatient?.nombre_completo}</h3>
                                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>Cédula: {selectedPatient?.numero_cedula || selectedPatient?.cedula || '—'} · Tipo: {selectedPatient?.tipo || selectedPatient?.tipo_usuario || 'Paciente'}</p>
                                </div>
                            </div>

                            {/* Vitals preview */}
                            <div>
                                <span className="eyebrow" style={{ display: 'block', marginBottom: '8px', fontSize: '10px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>SIGNOS VITALES</span>
                                <div className="preview-vitals-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Presión Arterial</span>
                                        <strong style={{ display: 'block', fontSize: '15px', color: 'var(--primary)', marginTop: '4px' }}>{vitalsForm.presion_arterial_sistolica || '—'}/{vitalsForm.presion_arterial_diastolica || '—'}</strong>
                                        <small style={{ fontSize: '10px', color: 'var(--text-muted)' }}>mmHg</small>
                                    </div>
                                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Frec. Cardíaca</span>
                                        <strong style={{ display: 'block', fontSize: '15px', color: 'var(--primary)', marginTop: '4px' }}>{vitalsForm.frecuencia_cardiaca || '—'}</strong>
                                        <small style={{ fontSize: '10px', color: 'var(--text-muted)' }}>lpm</small>
                                    </div>
                                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Frec. Respiratoria</span>
                                        <strong style={{ display: 'block', fontSize: '15px', color: 'var(--primary)', marginTop: '4px' }}>{vitalsForm.frecuencia_respiratoria || '—'}</strong>
                                        <small style={{ fontSize: '10px', color: 'var(--text-muted)' }}>rpm</small>
                                    </div>
                                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Temperatura</span>
                                        <strong style={{ display: 'block', fontSize: '15px', color: 'var(--primary)', marginTop: '4px' }}>{vitalsForm.temperatura || '—'}</strong>
                                        <small style={{ fontSize: '10px', color: 'var(--text-muted)' }}>°C</small>
                                    </div>
                                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Talla</span>
                                        <strong style={{ display: 'block', fontSize: '15px', color: 'var(--primary)', marginTop: '4px' }}>{vitalsForm.talla || '—'}</strong>
                                        <small style={{ fontSize: '10px', color: 'var(--text-muted)' }}>cm</small>
                                    </div>
                                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Peso</span>
                                        <strong style={{ display: 'block', fontSize: '15px', color: 'var(--primary)', marginTop: '4px' }}>{vitalsForm.peso || '—'}</strong>
                                        <small style={{ fontSize: '10px', color: 'var(--text-muted)' }}>kg</small>
                                    </div>
                                </div>
                            </div>

                            {/* Procedure preview */}
                            <div className="premium-field-card" style={{ padding: '16px', borderRadius: '12px' }}>
                                <span className="eyebrow" style={{ display: 'block', fontSize: '10px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>PROCEDIMIENTO</span>
                                <h4 style={{ margin: '4px 0 0', color: 'var(--primary)', fontWeight: '600', fontSize: '13.5px' }}>
                                    {proceduresCatalog.find(p => p.id === Number(vitalsForm.id_procedimiento_enfermeria))?.nombre_procedimiento || 'Procedimiento menor'}
                                </h4>
                            </div>

                            {/* Notes preview */}
                            <div className="premium-field-card" style={{ padding: '16px', borderRadius: '12px' }}>
                                <span className="eyebrow" style={{ display: 'block', fontSize: '10px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>OBSERVACIONES DE ENFERMERÍA</span>
                                <p style={{ margin: '4px 0 0', fontStyle: 'italic', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                                    {vitalsForm.detalle_procedimiento || 'Sin observaciones adicionales.'}
                                </p>
                            </div>

                            {/* Signature block */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '15px', marginTop: '10px' }}>
                                <div>
                                    <span className="eyebrow" style={{ display: 'block', fontSize: '10px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>RESPONSABLE</span>
                                    <strong style={{ display: 'block', fontSize: '12px', color: 'var(--primary)' }}>{user?.name || 'Andrea Molina'}</strong>
                                    <small style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Firma Digital de Enfermería</small>
                                </div>
                                <div className="preview-state" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--success-soft)', padding: '8px 12px', borderRadius: '8px', color: 'var(--success)' }}>
                                    <ShieldCheck size={16} />
                                    <span style={{ fontSize: '11px', fontWeight: 'bold' }}>Listo para firmar</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '15px' }}>
                                <button className="action-button action-button--light" onClick={() => setVitalsBookPreviewOpen(false)} style={{ borderRadius: '8px', minHeight: '38px' }}>
                                    Cancelar
                                </button>
                                <button className="action-button action-button--outline" onClick={() => { setVitalsBookPreviewOpen(false); setVitalsModalFormOpen(true); }} style={{ borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', minHeight: '38px' }}>
                                    <Pencil size={12} /> Editar
                                </button>
                                <button className="action-button action-button--accent" onClick={handleSaveClinicalRecord} style={{ borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', minHeight: '38px' }}>
                                    <Save size={12} /> Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TOAST SYSTEM */}
            <div className={`toast ${toast.show ? 'show' : ''}`} style={{ zIndex: 9999999 }}>
                <CheckCircle size={16} />
                <span>{toast.message}</span>
            </div>

            {/* PANEL DE AYUDA COMPARTIDO */}
            <HelpPanel
                helpItems={[
                    { title: 'Paso 1: Buscar o Seleccionar Paciente', content: 'Use el buscador superior derecho por número de Cédula. Si no está registrado en el sistema, presione "Registrar paciente nuevo" para ingresarlo.' },
                    { title: 'Paso 2: Registro de Signos Vitales', content: 'Haga clic en "Atender" para abrir el formulario clínico. Llene la presión sistólica/diastólica, frecuencia cardíaca, respiración, temperatura, talla y peso.' },
                    { title: 'Paso 3: Declaración de Procedimiento', content: 'En el paso 2 del formulario, seleccione el procedimiento de enfermería realizado de la lista y añada cualquier observación clínica relevante.' },
                    { title: 'Paso 4: Confirmación y Guardado', content: 'Avance para ver la Vista Previa interactiva en formato de libro. Si los datos son correctos, haga clic en "Guardar" para registrar la valoración.' }
                ]}
                contactInfo={{ email: 'soporte@ueb.edu.ec' }}
            />


            {/* MODAL CONFIGURACIÓN DE CAMPUS */}
            {campusSetupModal && (
                <div className="clinical-modal show">
                    <div className="clinical-modal__backdrop" onClick={() => setCampusSetupModal(false)}></div>
                    <section className="clinical-modal__dialog" style={{ maxWidth: '480px', height: 'auto', maxHeight: '90vh' }}>
                        <header className="clinical-modal__header">
                            <div className="clinical-modal__patient">
                                <span className="clinical-modal__avatar"><MapPin size={18} /></span>
                                <div>
                                    <span>Configuración inicial</span>
                                    <h2>Seleccionar Campus de Atención</h2>
                                </div>
                            </div>
                            <button className="clinical-modal__close" onClick={() => setCampusSetupModal(false)}><X size={15} /></button>
                        </header>
                        <div className="clinical-modal__body" style={{ padding: '20px' }}>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                                Selecciona el campus universitario donde estás prestando servicios hoy para registrar correctamente los partes diarios:
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                                {campusesCatalog.map(c => (
                                    <div
                                        key={c.id}
                                        onClick={() => setNurseCampusId(c.id)}
                                        style={{
                                            padding: '12px 16px',
                                            borderRadius: '10px',
                                            border: `2px solid ${nurseCampusId === c.id ? 'var(--primary)' : 'var(--border)'}`,
                                            background: nurseCampusId === c.id ? 'var(--primary-soft)' : '#fff',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            fontWeight: nurseCampusId === c.id ? 'bold' : 'normal',
                                            color: nurseCampusId === c.id ? 'var(--primary)' : 'var(--text-primary)'
                                        }}
                                    >
                                        <span>{c.nombre}</span>
                                        {nurseCampusId === c.id && <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>✓</span>}
                                    </div>
                                ))}
                            </div>

                            <footer className="clinical-modal__actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button className="action-button action-button--primary" onClick={handleSaveCampusSetup} disabled={campusSetupSaving} style={{ width: '100%' }}>
                                    {campusSetupSaving ? 'Guardando...' : 'Guardar Configuración'}
                                </button>
                            </footer>
                        </div>
                    </section>
                </div>
            )}

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

            {/* MODAL HISTOGRAMA DE SIGNOS VITALES */}
            {isHistogramModalOpen && (
                <VitalSignsHistogram
                    patient={selectedPatient}
                    onClose={() => setIsHistogramModalOpen(false)}
                />
            )}

            {/* PANEL DE AYUDA */}
            <HelpPanel
                helpItems={
                    [
                        { title: '¿Cómo registrar un parte diario?', content: 'Busca al paciente por nombre o cédula en la barra de búsqueda. Al encontrarlo, presiona "Atender" para abrir el formulario de registro. Completa los signos vitales y los datos de la atención, luego guarda.' },
                        { title: '¿Cómo ver el historial de un paciente?', content: 'En la pestaña "Historial Clínico" puedes buscar pacientes y ver todas sus atenciones previas de enfermería. Puedes filtrar por rango de fechas.' },
                        { title: '¿Cómo registrar signos vitales?', content: 'Los signos vitales (temperatura, presión arterial, frecuencia cardíaca, etc.) se registran en la sección de "Atención" al abrir el modal de un paciente. Son campos obligatorios para el parte diario.' },
                        { title: '¿Cómo cerrar sesión de forma segura?', content: 'Presiona "Cerrar sesión" en la parte inferior del menú lateral. Se mostrará un modal de confirmación antes de salir.' },
                    ]
                }
                contactInfo={{ email: 'soporte@ueb.edu.ec' }}
            />
        </div>
    );
};

export default Enfermero_page;
