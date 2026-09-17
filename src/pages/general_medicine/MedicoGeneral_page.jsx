import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import api from '../../api/axios';
import '../../medical.css'; // Estilos unificados médicos y psicológicos
import HelpPanel from '../../components/HelpPanel';
import UserProfileMenu from '../../components/UserProfileMenu';
import PasswordRequirements from '../../components/PasswordRequirements';
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
    Mail,
    Eye,
    EyeOff,
    BarChart3,
    Pill,
    Package,
    Filter,
    Trash2
} from 'lucide-react';
import VitalSignsHistogram from '../../components/VitalSignsHistogram';
import FarmaciaInventarioTab from '../../components/farmacia/FarmaciaInventarioTab';

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

const getAnatomicalRegion = (x, y) => {
    if (x === null || y === null || x === undefined || y === undefined) return '';
    const side = x < 50 ? "Frente" : "Espalda";
    const relativeX = x < 50 ? x * 2 : (x - 50) * 2;
    let region = "Cuerpo";
    if (y < 20) region = "Cabeza / Cráneo";
    else if (y >= 20 && y < 25) region = "Cuello";
    else if (y >= 25 && y < 43) {
        if (relativeX < 30) region = side === "Frente" ? "Brazo Derecho" : "Brazo Izquierdo";
        else if (relativeX > 70) region = side === "Frente" ? "Brazo Izquierdo" : "Brazo Derecho";
        else region = side === "Frente" ? "Tórax" : "Espalda Superior";
    } else if (y >= 43 && y < 56) {
        if (relativeX < 30) region = side === "Frente" ? "Mano Derecha" : "Mano Izquierda";
        else if (relativeX > 70) region = side === "Frente" ? "Mano Izquierda" : "Mano Derecha";
        else region = side === "Frente" ? "Abdomen" : "Espalda Inferior / Lumbar";
    } else {
        if (relativeX < 50) region = side === "Frente" ? "Pierna Derecha" : "Pierna Izquierda";
        else region = side === "Frente" ? "Pierna Izquierda" : "Pierna Derecha";
    }
    return `${region} (${side})`;
};

const MedicoGeneral_page = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    // Estado de pestañas activas
    // 'ficha' | 'evolucion' | 'diario' | 'historial'
    const [activeTab, setActiveTab] = useState('ficha');

    const [citasList, setCitasList] = useState([]);
    const [citasLoading, setCitasLoading] = useState(false);
    const [citasDate, setCitasDate] = useState(new Date().toISOString().slice(0, 10));
    const [citasPage, setCitasPage] = useState(1);
    const CITAS_PER_PAGE = 12;
    const [historyPage, setHistoryPage] = useState(1);
    const HISTORY_PER_PAGE = 8;
    const [completingCita, setCompletingCita] = useState(null);
    const [notasDoctor, setNotasDoctor] = useState('');
    const [savingNotas, setSavingNotas] = useState(false);

    // Estados de Centro de Reportes
    const [activeReportSubTab, setActiveReportSubTab] = useState('diario');
    const [genReportLoading, setGenReportLoading] = useState(false);
    const [genReportData, setGenReportData] = useState(null);
    const [reportMensualFecha, setReportMensualFecha] = useState(new Date().toISOString().slice(0, 7));

    // Menú colapsable y estados visuales
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '' });

    // Paciente seleccionado
    const [selectedPatient, setSelectedPatient] = useState(null);

    // Draft local & Offline resilience
    const patientId = selectedPatient?.id_usuario || selectedPatient?.id;
    const { isOffline, saveDraft, loadDraft, clearDraft, draftLastSaved } = useClinicalDraft('medicina', user?.id, patientId);

    // Modales globales de búsqueda y registro
    const [isPatientSearchOpen, setIsPatientSearchOpen] = useState(false);
    const [isPatientRegisterOpen, setIsPatientRegisterOpen] = useState(false);
    const [isFichaModalOpen, setIsFichaModalOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Formulario de registro rápido de paciente
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
    // 1. ESTADOS DE CONSULTA MÉDICA (Ficha)
    // ==========================================
    const [isHistogramModalOpen, setIsHistogramModalOpen] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const steps = [
        { key: 'signos', label: '1. Signos Vitales' },
        { key: 'motivo', label: '2. Motivo y Enfermedad' },
        { key: 'antecedentes', label: '3. Antecedentes' },
        { key: 'organos', label: '4. Org. y Sistemas' },
        { key: 'examen_fisico', label: '5. Examen Físico' },
        { key: 'diagnostico', label: '6. Diag. y Tratamiento' },
        { key: 'prescripcion', label: '7. Prescripción Médica' },
        { key: 'histograma', label: '8. Histograma' }
    ];
    const handlePrevStep = () => {
        if (currentStepIndex > 0) setCurrentStepIndex(currentStepIndex - 1);
    };
    const handleNextStep = () => {
        if (currentStepIndex < steps.length - 1) setCurrentStepIndex(currentStepIndex + 1);
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

    // Estados para 3D Book - Historial de paciente por áreas
    const [areaHistories, setAreaHistories] = useState({
        medicina: [],
        psicologia: [],
        odontologia: [],
        enfermeria: []
    });
    const [areaHistoriesLoading, setAreaHistoriesLoading] = useState(false);
    const [activeBookArea, setActiveBookArea] = useState('medicina'); // 'medicina' | 'psicologia' | 'odontologia' | 'enfermeria' | null
    const [activeBookRecord, setActiveBookRecord] = useState(null);

    // Estado de modal de confirmación custom
    const [confirmModal, setConfirmModal] = useState({
        show: false,
        title: '',
        message: '',
        onConfirm: null
    });

    const [fichaRawData, setFichaRawData] = useState({
        signos: null,
        motivo: null,
        enfermedad: null,
        antecedentePersonal: null,
        antecedenteFamiliar: null,
        organos: null,
        examen_fisico: null,
        diagnostico: null,
        plan: null,
        parte_diario: null,
        receta: null
    });

    const [fichaForm, setFichaForm] = useState({
        // A. Signos Vitales
        presion_arterial_diastolica: '',
        presion_arterial_sistolica: '',
        frecuencia_cardiaca: '',
        frecuencia_respiratoria: '',
        temperatura: '',
        talla: '',
        peso: '',

        // B. Motivo y Enfermedad Actual
        detalle_motivo: '',
        detalle_enfermedad_actual: '',

        // C. Antecedentes
        detalle_antecedente_personal: '',
        detalle_antecedente_familiar: '',

        // D. Revisión por Órganos
        detalle_revision_organos: '',

        // E. Examen Físico
        detalle_examen_fisico: '',
        altura_x: null,
        altura_y: null,

        // F. Diagnóstico y Tratamiento
        detalle_diagnostico: '',
        cie10: '',
        presuntivo: false,
        definitivo: false,
        detalle_plan_terapeutico: '',

        // G. Parte Diario Estadístico
        tipo_atencion: 'primaria',
        tipo: 'curativo',

        // H. Prescripción Médica (Receta de Farmacia)
        prescripcion_lineas: []
    });

    // Estados para la Prescripción Médica (Punto 7 - Farmacia)
    const [farmaciaSearchQuery, setFarmaciaSearchQuery] = useState('');
    const [farmaciaSearchResults, setFarmaciaSearchResults] = useState([]);
    const [farmaciaSearchLoading, setFarmaciaSearchLoading] = useState(false);
    const [prescripcionLineForm, setPrescripcionLineForm] = useState({
        detalle_medicamento: '',
        id_producto_farmacia: null,
        detalle_dosis: '1 tableta',
        detalle_via_administracion: 'Oral',
        frecuencia_horas: 8,
        duracion_tratamiento_dias: 3,
        cantidad_cajas: 1,
        cantidad_unidades: 0,
        observaciones: ''
    });

    const handleSearchFarmacia = async (query) => {
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
        setPrescripcionLineForm(prev => ({
            ...prev,
            detalle_medicamento: `${product.nombre} (${product.presentacion?.nombre || 'General'})`,
            id_producto_farmacia: product.id,
            observaciones: `Stock actual: ${product.stock_cajas} cajas / ${product.stock_unidades} unidades`
        }));
        setFarmaciaSearchQuery('');
        setFarmaciaSearchResults([]);
    };

    const handleAddPrescripcionLine = () => {
        if (!prescripcionLineForm.detalle_medicamento.trim()) {
            showSystemToast('Por favor ingrese o seleccione el nombre del medicamento.');
            return;
        }
        const newLine = {
            id_temp: Date.now(),
            ...prescripcionLineForm
        };
        setFichaForm(prev => ({
            ...prev,
            prescripcion_lineas: [...(prev.prescripcion_lineas || []), newLine]
        }));
        setPrescripcionLineForm({
            detalle_medicamento: '',
            id_producto_farmacia: null,
            detalle_dosis: '1 tableta',
            detalle_via_administracion: 'Oral',
            frecuencia_horas: 8,
            duracion_tratamiento_dias: 3,
            cantidad_cajas: 1,
            cantidad_unidades: 0,
            observaciones: ''
        });
        showSystemToast('Medicamento agregado a la receta.');
    };

    const handleRemovePrescripcionLine = (idTemp) => {
        setFichaForm(prev => ({
            ...prev,
            prescripcion_lineas: (prev.prescripcion_lineas || []).filter(line => line.id_temp !== idTemp)
        }));
        showSystemToast('Medicamento removido de la receta.');
    };

    // ==========================================
    // 2. ESTADOS DE EVOLUCIÓN CLÍNICA
    // ==========================================
    const [evolucionList, setEvolucionList] = useState([]);
    const [evolucionLoading, setEvolucionLoading] = useState(false);
    const [evolucionForm, setEvolucionForm] = useState({
        fecha: new Date().toISOString().slice(0, 10),
        detalle_evolucion: '',
        prescripcion_medica: ''
    });

    // ==========================================
    // 3. ESTADOS DE PARTE DIARIO (CONSULTAS)
    // ==========================================
    const [parteDiarioDate, setParteDiarioDate] = useState(new Date().toISOString().slice(0, 10));
    const [parteDiarioList, setParteDiarioList] = useState([]);
    const [parteDiarioLoading, setParteDiarioLoading] = useState(false);

    // ==========================================
    // 4. ESTADOS DE HISTORIAL GENERAL
    // ==========================================
    const [historialList, setHistorialList] = useState([]);
    const [historialSearch, setHistorialSearch] = useState('');

    const showSystemToast = (message) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 3400);
    };

    const toggleAccordion = (key) => {
        setActiveAccordion(prev => (prev === key ? '' : key));
    };

    // ==========================================
    // BÚSQUEDA Y REGISTRO DE PACIENTES
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

    const handleSelectPatient = async (patient, forceOpenModal = false) => {
        setSelectedPatient(patient);
        setIsPatientSearchOpen(false);
        setModalSearchCedula('');
        setModalSearchResults([]);
        showSystemToast(`Paciente seleccionado: ${patient?.nombre_completo || patient?.name || 'Paciente'}`);

        // Si la pestaña activa es evolución o historial, solo seleccionamos el paciente para consultar sus registros
        if ((activeTab === 'evolucion' || activeTab === 'historial') && !forceOpenModal) {
            return;
        }

        setActiveTab('ficha');
        setIsFichaModalOpen(true);

        const pId = patient?.id || patient?.id_usuario || patient?.id_usuario_paciente;
        if (pId) {
            try {
                await api.post('/citas-medicas/atender-paciente', {
                    id_usuario_paciente: pId,
                    rol_doctor: 'medico_general',
                    motivo: 'Atención en Medicina General'
                });
                fetchCitasDoctor();
            } catch (err) {
                console.error("Error al auto-sincronizar cita:", err);
            }
        }
    };

    const handleQuickRegisterPatient = async (e) => {
        e.preventDefault();
        setRegisterLoading(true);
        setRegisterError('');

        try {
            // Autocompletar el correo en submit si no tiene @
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
                setIsFichaModalOpen(true);
            }
        } catch (err) {
            console.error(err);
            setRegisterError(err.response?.data?.message || 'Error al registrar. Verifica el correo institucional.');
        } finally {
            setRegisterLoading(false);
        }
    };

    const handleCloseFichaForm = () => {
        setIsFichaModalOpen(false);
        setSelectedPatient(null);
        setCurrentStepIndex(0);
        resetFichaForm();
        if (activeTab === 'atencion') {
            setActiveTab('ficha');
        }
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
    // EFECTOS AL SELECCIONAR PACIENTE
    // ==========================================
    useEffect(() => {
        if (selectedPatient) {
            const patientId = selectedPatient?.id_usuario || selectedPatient?.id_usuario_paciente || selectedPatient?.user_id || selectedPatient?.id;
            if (patientId) {
                setActiveBookArea('medicina');
                setActiveBookRecord(null);
                fetchPatientFicha(patientId);
                fetchEvoluciones(patientId);
                fetchPatientHistoryByArea(patientId);
            }
        } else {
            resetFichaForm();
            setEvolucionList([]);
            setActiveBookArea('medicina');
            setActiveBookRecord(null);
            setAreaHistories({
                medicina: [],
                psicologia: [],
                odontologia: [],
                enfermeria: []
            });
        }
    }, [selectedPatient]);

    const resetFichaForm = () => {
        setFichaRawData({
            signos: null,
            motivo: null,
            enfermedad: null,
            antecedentePersonal: null,
            antecedenteFamiliar: null,
            organos: null,
            examen_fisico: null,
            diagnostico: null,
            plan: null,
            parte_diario: null,
            receta: null
        });
        setFichaForm({
            presion_arterial_diastolica: '',
            presion_arterial_sistolica: '',
            frecuencia_cardiaca: '',
            frecuencia_respiratoria: '',
            temperatura: '',
            talla: '',
            peso: '',
            detalle_motivo: '',
            detalle_enfermedad_actual: '',
            detalle_antecedente_personal: '',
            detalle_antecedente_familiar: '',
            detalle_revision_organos: '',
            detalle_examen_fisico: '',
            altura_x: null,
            altura_y: null,
            detalle_diagnostico: '',
            cie10: '',
            presuntivo: false,
            definitivo: false,
            detalle_plan_terapeutico: '',
            tipo_atencion: 'primaria',
            tipo: 'curativo',
            prescripcion_lineas: []
        });
        setFarmaciaSearchQuery('');
        setFarmaciaSearchResults([]);
    };

    // Auto-save form draft to localStorage
    useEffect(() => {
        if (selectedPatient && fichaForm) {
            saveDraft(fichaForm);
        }
    }, [fichaForm, selectedPatient, saveDraft]);

    // ==========================================
    // CONTROLADORES DE API - FICHA CLÍNICA
    // ==========================================
    const fetchPatientFicha = async (patientId) => {
        if (!patientId) return;
        setFichaLoading(true);
        try {
            const today = new Date().toISOString().slice(0, 10);
            const [
                signosRes,
                motivoRes,
                enfermedadRes,
                antecedentesRes,
                organosRes,
                examenRes,
                diagRes,
                planRes,
                dailyRes
            ] = await Promise.all([
                api.get('/medicina-general/signos-vitales', { params: { id_usuario_paciente: patientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/medicina-general/motivo-consulta', { params: { id_usuario_paciente: patientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/medicina-general/enfermedades-actuales', { params: { id_usuario_paciente: patientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/medicina-general/antecedentes', { params: { id_usuario_paciente: patientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/medicina-general/revision-organos', { params: { id_usuario_paciente: patientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/medicina-general/examen-fisico', { params: { id_usuario_paciente: patientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/medicina-general/diagnosticos', { params: { id_usuario_paciente: patientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/medicina-general/planes-terapeuticos', { params: { id_usuario_paciente: patientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/medicina-general/parte-diario', { params: { id_usuario_paciente: patientId } }).catch(() => ({ data: { data: [] } })),
                api.get(`/medicina-general/patient/${patientId}/blood-type`).catch(() => ({ data: { data: null } }))
            ]);

            const getArrayData = (res) => (res && res.data && Array.isArray(res.data.data)) ? res.data.data : [];
            const latestSignos = getArrayData(signosRes)[0] || null;
            const motivo = getArrayData(motivoRes)[0] || null;
            const enfermedad = getArrayData(enfermedadRes)[0] || null;
            const antecedenteList = getArrayData(antecedenteRes);
            const antecedentePersonal = antecedenteList.find(item => item.tipo && String(item.tipo).toLowerCase() === 'personal') || null;
            const antecedenteFamiliar = antecedenteList.find(item => item.tipo && String(item.tipo).toLowerCase() === 'familiar') || null;
            const organos = getArrayData(organosRes)[0] || null;
            const examen_fisico = getArrayData(examenRes)[0] || null;
            const diagnostico = getArrayData(diagnosticoRes)[0] || null;
            const plan = getArrayData(planRes)[0] || null;
            const bloodTypeData = bloodTypeRes?.data?.data;
            const bloodType = bloodTypeData ? (bloodTypeData.tipoSangre || bloodTypeData.tipo_sangre) : null;
            const parte_diario = parteDiarioList.find(item => (item.fecha ? item.fecha.slice(0, 10) : '') === today) || null;

            const isSignosFromToday = latestSignos && (
                latestSignos.fecha === today ||
                (latestSignos.created_at && latestSignos.created_at.slice(0, 10) === today)
            );

            setFichaRawData({
                signos: isSignosFromToday ? latestSignos : null,
                motivo: null,
                enfermedad: null,
                antecedentePersonal,
                antecedenteFamiliar,
                organos: null,
                examen_fisico: null,
                diagnostico: null,
                plan: null,
                parte_diario: null,
                bloodType
            });

            const initialFormState = {
                presion_arterial_diastolica: latestSignos?.presion_arterial_diastolica || '',
                presion_arterial_sistolica: latestSignos?.presion_arterial_sistolica || '',
                frecuencia_cardiaca: latestSignos?.frecuencia_cardiaca || '',
                frecuencia_respiratoria: latestSignos?.frecuencia_respiratoria || '',
                temperatura: latestSignos?.temperatura || '',
                talla: latestSignos?.talla || '',
                peso: latestSignos?.peso || '',
                id_tipo_sangre: bloodType ? bloodType.id || '' : '',
                detalle_motivo: '',
                detalle_enfermedad_actual: '',
                detalle_antecedente_personal: antecedentePersonal?.detalle_antecedente || '',
                detalle_antecedente_familiar: antecedenteFamiliar?.detalle_antecedente || '',
                detalle_revision_organos: '',
                detalle_examen_fisico: '',
                altura_x: null,
                altura_y: null,
                detalle_diagnostico: '',
                cie10: '',
                presuntivo: true,
                definitivo: false,
                detalle_plan_terapeutico: '',
                tipo_atencion: 'primaria',
                tipo: 'curativo'
            };

            const savedDraft = loadDraft();
            if (savedDraft?.formData) {
                const dbPersonal = antecedentePersonal?.detalle_antecedente || '';
                const dbFamiliar = antecedenteFamiliar?.detalle_antecedente || '';
                const draftPersonal = savedDraft.formData.detalle_antecedente_personal;
                const draftFamiliar = savedDraft.formData.detalle_antecedente_familiar;

                setFichaForm({
                    ...initialFormState,
                    ...savedDraft.formData,
                    detalle_antecedente_personal: (draftPersonal && draftPersonal.trim() !== '') ? draftPersonal : dbPersonal,
                    detalle_antecedente_familiar: (draftFamiliar && draftFamiliar.trim() !== '') ? draftFamiliar : dbFamiliar
                });
                showSystemToast("Borrador no guardado recuperado automáticamente.");
            } else {
                setFichaForm(initialFormState);
            }
        } catch (err) {
            console.error("Error al cargar la ficha clínica:", err);
            showSystemToast("Error al cargar la anamnesis del paciente.");
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

    const handleSaveFichaSection = async (sectionKey) => {
        if (!selectedPatient) return false;
        setFichaSaving(true);
        const patientId = selectedPatient?.id_usuario || selectedPatient?.id_usuario_paciente || selectedPatient?.user_id || selectedPatient?.id;
        const today = new Date().toISOString().slice(0, 10);

        try {
            if (sectionKey === 'signos') {
                const payload = {
                    id_usuario_paciente: patientId,
                    fecha: today,
                    presion_arterial_diastolica: parseFloat(fichaForm.presion_arterial_diastolica) || null,
                    presion_arterial_sistolica: parseFloat(fichaForm.presion_arterial_sistolica) || null,
                    frecuencia_cardiaca: parseInt(fichaForm.frecuencia_cardiaca) || null,
                    frecuencia_respiratoria: parseInt(fichaForm.frecuencia_respiratoria) || null,
                    temperatura: parseFloat(fichaForm.temperatura) || null,
                    talla: parseFloat(fichaForm.talla) || null,
                    peso: parseFloat(fichaForm.peso) || null
                };
                if (fichaRawData.signos) {
                    await api.put(`/medicina-general/signos-vitales/${fichaRawData.signos.id}`, payload);
                } else {
                    const res = await api.post('/medicina-general/signos-vitales', payload);
                    setFichaRawData(prev => ({ ...prev, signos: res.data.data }));
                }

                if (fichaForm.id_tipo_sangre) {
                    await api.post(`/medicina-general/patient/${patientId}/blood-type`, {
                        id_tipo_sangre: parseInt(fichaForm.id_tipo_sangre)
                    });
                }
            }

            if (sectionKey === 'motivo') {
                const payloadMotivo = { id_usuario_paciente: patientId, detalle_motivo: fichaForm.detalle_motivo };
                const payloadEnfermedad = { id_usuario_paciente: patientId, detalle_enfermedad_actual: fichaForm.detalle_enfermedad_actual };

                if (fichaRawData.motivo) {
                    await api.put(`/medicina-general/motivo-consulta/${fichaRawData.motivo.id}`, payloadMotivo);
                } else {
                    const res = await api.post('/medicina-general/motivo-consulta', payloadMotivo);
                    setFichaRawData(prev => ({ ...prev, motivo: res.data.data }));
                }

                if (fichaRawData.enfermedad) {
                    await api.put(`/medicina-general/enfermedades-actuales/${fichaRawData.enfermedad.id}`, payloadEnfermedad);
                } else {
                    const res = await api.post('/medicina-general/enfermedades-actuales', payloadEnfermedad);
                    setFichaRawData(prev => ({ ...prev, enfermedad: res.data.data }));
                }
            }

            if (sectionKey === 'antecedentes') {
                const promises = [];

                // Guardar Personal (Siempre actualiza el existente de este paciente)
                const payloadPersonal = {
                    id_usuario_paciente: patientId,
                    tipo: 'personal',
                    detalle_antecedente: fichaForm.detalle_antecedente_personal
                };
                if (fichaRawData.antecedentePersonal) {
                    promises.push(
                        api.put(`/medicina-general/antecedentes/${fichaRawData.antecedentePersonal.id}`, payloadPersonal)
                            .then(res => ({ key: 'antecedentePersonal', data: res.data.data }))
                    );
                } else if (fichaForm.detalle_antecedente_personal.trim() !== '') {
                    promises.push(
                        api.post('/medicina-general/antecedentes', payloadPersonal)
                            .then(res => ({ key: 'antecedentePersonal', data: res.data.data }))
                    );
                }

                // Guardar Familiar (Siempre actualiza el existente de este paciente)
                const payloadFamiliar = {
                    id_usuario_paciente: patientId,
                    tipo: 'familiar',
                    detalle_antecedente: fichaForm.detalle_antecedente_familiar
                };
                if (fichaRawData.antecedenteFamiliar) {
                    promises.push(
                        api.put(`/medicina-general/antecedentes/${fichaRawData.antecedenteFamiliar.id}`, payloadFamiliar)
                            .then(res => ({ key: 'antecedenteFamiliar', data: res.data.data }))
                    );
                } else if (fichaForm.detalle_antecedente_familiar.trim() !== '') {
                    promises.push(
                        api.post('/medicina-general/antecedentes', payloadFamiliar)
                            .then(res => ({ key: 'antecedenteFamiliar', data: res.data.data }))
                    );
                }

                if (promises.length > 0) {
                    const results = await Promise.all(promises);
                    setFichaRawData(prev => {
                        const updated = { ...prev };
                        results.forEach(r => {
                            updated[r.key] = r.data;
                        });
                        return updated;
                    });
                }
            }

            if (sectionKey === 'organos') {
                const payload = { id_usuario_paciente: patientId, detalle_revision_organos: fichaForm.detalle_revision_organos };
                if (fichaRawData.organos) {
                    await api.put(`/medicina-general/revision-organos/${fichaRawData.organos.id}`, payload);
                } else {
                    const res = await api.post('/medicina-general/revision-organos', payload);
                    setFichaRawData(prev => ({ ...prev, organos: res.data.data }));
                }
            }

            if (sectionKey === 'examen_fisico') {
                const payload = {
                    id_usuario_paciente: patientId,
                    detalle_examen_fisico: fichaForm.detalle_examen_fisico,
                    altura_x: fichaForm.altura_x !== null ? parseInt(fichaForm.altura_x) : null,
                    altura_y: fichaForm.altura_y !== null ? parseInt(fichaForm.altura_y) : null
                };
                if (fichaRawData.examen_fisico) {
                    await api.put(`/medicina-general/examen-fisico/${fichaRawData.examen_fisico.id}`, payload);
                } else {
                    const res = await api.post('/medicina-general/examen-fisico', payload);
                    setFichaRawData(prev => ({ ...prev, examen_fisico: res.data.data }));
                }
            }

            if (sectionKey === 'diagnostico') {
                const payloadDiag = {
                    id_usuario_paciente: patientId,
                    detalle_diagnostico: fichaForm.detalle_diagnostico,
                    cie10: fichaForm.cie10,
                    presuntivo: fichaForm.presuntivo,
                    definitivo: fichaForm.definitivo
                };
                const payloadPlan = { id_usuario_paciente: patientId, detalle_plan_terapeutico: fichaForm.detalle_plan_terapeutico };

                if (fichaRawData.diagnostico) {
                    await api.put(`/medicina-general/diagnosticos/${fichaRawData.diagnostico.id}`, payloadDiag);
                } else {
                    const res = await api.post('/medicina-general/diagnosticos', payloadDiag);
                    setFichaRawData(prev => ({ ...prev, diagnostico: res.data.data }));
                }

                if (fichaRawData.plan) {
                    await api.put(`/medicina-general/planes-terapeuticos/${fichaRawData.plan.id}`, payloadPlan);
                } else {
                    const res = await api.post('/medicina-general/planes-terapeuticos', payloadPlan);
                    setFichaRawData(prev => ({ ...prev, plan: res.data.data }));
                }

                // Parte diario
                const dailyPayload = {
                    id_usuario_paciente: patientId,
                    fecha: today,
                    tipo_atencion: fichaForm.tipo_atencion,
                    tipo: fichaForm.tipo,
                    detalle_diagnostico: fichaForm.detalle_diagnostico
                };

                if (fichaRawData.parte_diario) {
                    await api.put(`/medicina-general/parte-diario/${fichaRawData.parte_diario.id}`, dailyPayload);
                } else {
                    const res = await api.post('/medicina-general/parte-diario', dailyPayload);
                    setFichaRawData(prev => ({ ...prev, parte_diario: res.data.data }));
                }
            }

            clearDraft();
            showSystemToast("Sección clínica guardada.");
            setSaveFeedback({
                show: true,
                success: true,
                title: "¡Guardado con éxito!",
                message: "La información médica ha sido consolidada en el servidor."
            });
            return true;
        } catch (err) {
            console.error(err);
            showSystemToast("Error al guardar la información clínica.");
            setSaveFeedback({
                show: true,
                success: false,
                title: "Error al guardar",
                message: err.response?.data?.message || "Ocurrió un inconveniente al procesar la solicitud."
            });
            return false;
        } finally {
            setFichaSaving(false);
        }
    };

    // ==========================================
    // CONTROLADORES DE API - EVOLUCIÓN CLÍNICA
    // ==========================================
    const fetchEvoluciones = async (patientId) => {
        if (!patientId) return;
        setEvolucionLoading(true);
        try {
            const res = await api.get('/medicina-general/historial-evolucion', {
                params: { id_usuario_paciente: patientId }
            }).catch(() => ({ data: { data: [] } }));
            setEvolucionList(Array.isArray(res?.data?.data) ? res.data.data : []);
        } catch (err) {
            console.error(err);
            setEvolucionList([]);
        } finally {
            setEvolucionLoading(false);
        }
    };

    const fetchPatientHistoryByArea = async (patientId) => {
        if (!patientId) return;
        setAreaHistoriesLoading(true);
        try {
            const [
                medEvolRes, medDiarioRes, medSignosRes, medExamenRes,
                psiEvolRes, psiDiarioRes,
                odoEvolRes, odoDiarioRes,
                enfVitalsRes, enfDiarioRes
            ] = await Promise.all([
                api.get('/medicina-general/historial-evolucion', { params: { id_usuario_paciente: patientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/medicina-general/parte-diario', { params: { id_usuario_paciente: patientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/medicina-general/signos-vitales', { params: { id_usuario_paciente: patientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/medicina-general/examen-fisico', { params: { id_usuario_paciente: patientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/psicologia/historial-evolucion', { params: { id_usuario_paciente: patientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/psicologia/parte-diario', { params: { id_usuario_paciente: patientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/odontologia/historial-evolucion', { params: { id_usuario_paciente: patientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/odontologia/parte-diario-odontologia', { params: { id_usuario_paciente: patientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/enfermeria/signos-vitales', { params: { id_usuario_paciente: patientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/enfermeria/parte-diario', { params: { id_usuario_paciente: patientId } }).catch(() => ({ data: { data: [] } }))
            ]);

            const getSafeArray = (res) => (res && res.data && Array.isArray(res.data.data)) ? res.data.data : [];

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

            const medEvol = filterByPatient(getSafeArray(medEvolRes));
            const medDiario = filterByPatient(getSafeArray(medDiarioRes));
            const medSignos = filterByPatient(getSafeArray(medSignosRes));
            const medExamen = filterByPatient(getSafeArray(medExamenRes));

            const psiEvol = filterByPatient(getSafeArray(psiEvolRes));
            const psiDiario = filterByPatient(getSafeArray(psiDiarioRes));

            const odoEvol = filterByPatient(getSafeArray(odoEvolRes));
            const odoDiario = filterByPatient(getSafeArray(odoDiarioRes));

            const enfVitals = filterByPatient(getSafeArray(enfVitalsRes));
            const enfDiario = filterByPatient(getSafeArray(enfDiarioRes));

            const cleanDate = (x) => ({
                ...x,
                fecha: x.fecha ? String(x.fecha).slice(0, 10) : (x.created_at ? String(x.created_at).slice(0, 10) : '')
            });

            setAreaHistories({
                medicina: [
                    ...medEvol.map(x => ({ ...cleanDate(x), type: 'evolucion', recordTitle: 'Evolución Clínica' })),
                    ...medDiario.map(x => ({ ...cleanDate(x), type: 'diario', recordTitle: 'Consulta de Jornada' })),
                    ...medSignos.map(x => ({ ...cleanDate(x), type: 'signos', recordTitle: 'Signos Vitales' })),
                    ...medExamen.map(x => ({ ...cleanDate(x), type: 'examen_fisico', recordTitle: 'Examen Físico' }))
                ].sort((a, b) => new Date(b.fecha || b.created_at) - new Date(a.fecha || a.created_at)),

                psicologia: [
                    ...psiEvol.map(x => ({ ...cleanDate(x), type: 'evolucion', recordTitle: 'Sesión Psicológica' })),
                    ...psiDiario.map(x => ({ ...cleanDate(x), type: 'diario', recordTitle: 'Consulta de Psicología' }))
                ].sort((a, b) => new Date(b.fecha || b.created_at) - new Date(a.fecha || a.created_at)),

                odontologia: [
                    ...odoEvol.map(x => ({ ...cleanDate(x), type: 'evolucion', recordTitle: 'Evolución Dental' })),
                    ...odoDiario.map(x => ({ ...cleanDate(x), type: 'diario', recordTitle: 'Consulta Odontológica' }))
                ].sort((a, b) => new Date(b.fecha || b.created_at) - new Date(a.fecha || a.created_at)),

                enfermeria: [
                    ...enfVitals.map(x => ({ ...cleanDate(x), type: 'vitals', recordTitle: 'Signos Vitales' })),
                    ...enfDiario.map(x => ({ ...cleanDate(x), type: 'diario', recordTitle: 'Procedimiento de Enfermería' }))
                ].sort((a, b) => new Date(b.fecha || b.created_at) - new Date(a.fecha || a.created_at))
            });
        } catch (err) {
            console.error("Error al cargar historiales por área:", err);
        } finally {
            setAreaHistoriesLoading(false);
        }
    };

    const handleSaveEvolucion = async (e) => {
        e.preventDefault();
        const patientId = selectedPatient?.id_usuario || selectedPatient?.id_usuario_paciente || selectedPatient?.user_id || selectedPatient?.id;
        if (!patientId || !evolucionForm.detalle_evolucion.trim()) return;

        try {
            await api.post('/medicina-general/historial-evolucion', {
                id_usuario_paciente: patientId,
                fecha: evolucionForm.fecha,
                detalle_evolucion: evolucionForm.detalle_evolucion,
                prescripcion_medica: evolucionForm.prescripcion_medica
            });

            // Registro automático diario
            await api.post('/medicina-general/parte-diario', {
                id_usuario_paciente: patientId,
                fecha: evolucionForm.fecha,
                tipo_atencion: 'secundaria',
                tipo: 'curativo',
                detalle_diagnostico: `Evolución clínica: ${evolucionForm.detalle_evolucion}`
            }).catch(() => { });

            showSystemToast("Evolución médica guardada.");
            setEvolucionForm(prev => ({ ...prev, detalle_evolucion: '', prescripcion_medica: '' }));
            fetchEvoluciones(patientId);
        } catch (err) {
            console.error(err);
            showSystemToast("Error al registrar evolución médica.");
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
                        ? `/medicina-general/historial-evolucion/${record.id}`
                        : `/medicina-general/parte-diario/${record.id}`;

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
            const diagnosis = isEvol
                ? (record.detalle_evolucion || 'Consulta Médica General')
                : (record.detalle_diagnostico || record.detalle_motivo || 'Atención en Medicina General');

            const htmlContent = `
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <title>Certificado Médico General</title>
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
                            <div class="logo-main">Universidad Estatal de Bolívar</div>
                            <div class="logo-sub">DEPARTAMENTO DE BIENESTAR UNIVERSITARIO</div>
                        </div>

                        <div class="certificate-title">CERTIFICADO MÉDICO GENERAL</div>

                        <div class="certificate-body">
                            Por medio de la presente, se hace constar y se certifica que el/la paciente 
                            <span class="bold-text">${selectedPatient.nombre_completo || selectedPatient.name || '—'}</span>, con cédula de identidad número 
                            <span class="bold-text">${selectedPatient.cedula || selectedPatient.numero_cedula || selectedPatient.datosIdentificacion?.numero_cedula || '—'}</span>, fue atendido/a en el consultorio de Medicina General el día 
                            <span class="bold-text">${record.fecha || (record.created_at ? record.created_at.slice(0, 10) : '—')}</span>, presentando el diagnóstico / motivo de consulta de: 
                            <span class="bold-text">${diagnosis}</span>.
                            <br/><br/>
                            Se expide la presente certificación a petición de la parte interesada para los fines pertinentes que se estimen convenientes.
                        </div>

                        <div class="footer-date">
                            Guaranda, ${dayNum} de ${monthName} de ${year}
                        </div>

                        <div class="signatures-container">
                            <div class="signature-box">
                                <div class="signature-line"></div>
                                <div class="bold-text" style="font-size: 12px;">${userProfile?.name || 'Médico General'}</div>
                                <div class="credentials">Medicina General - Bienestar Universitario</div>
                                <div class="credentials">Universidad Estatal de Bolívar</div>
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
            `;
            printWindow.document.open();
            printWindow.document.write(htmlContent);
            printWindow.document.close();
        } catch (error) {
            console.error('Error al imprimir certificado:', error);
            showSystemToast("Error al procesar la impresión del certificado.");
        }
    };

    const handleDownloadHistoriaClinicaPdf = async (patientId, targetDate) => {
        showSystemToast("Generando reporte imprimible...");
        const actualPatientId = patientId || selectedPatient?.id_usuario || selectedPatient?.id;
        try {
            // 1. Fetch complete profile and history lists
            const [
                profileRes,
                signosRes,
                motivoRes,
                antecedentesRes,
                enfermedadRes,
                organosRes,
                examenRes,
                diagnosticoRes,
                planRes,
                evolucionRes
            ] = await Promise.all([
                api.get(`/medicina-general/pacientes/${actualPatientId}/perfil`),
                api.get('/medicina-general/signos-vitales', { params: { id_usuario_paciente: actualPatientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/medicina-general/motivo-consulta', { params: { id_usuario_paciente: actualPatientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/medicina-general/antecedentes', { params: { id_usuario_paciente: actualPatientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/medicina-general/enfermedades-actuales', { params: { id_usuario_paciente: actualPatientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/medicina-general/revision-organos', { params: { id_usuario_paciente: actualPatientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/medicina-general/examen-fisico', { params: { id_usuario_paciente: actualPatientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/medicina-general/diagnosticos', { params: { id_usuario_paciente: actualPatientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/medicina-general/planes-terapeuticos', { params: { id_usuario_paciente: actualPatientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/medicina-general/historial-evolucion', { params: { id_usuario_paciente: actualPatientId } }).catch(() => ({ data: { data: [] } }))
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

            const dateStr = targetDate ? targetDate.slice(0, 10) : null;

            const motivos = dateStr ? motivoRes.data.data.filter(m => (m.created_at || '').slice(0, 10) === dateStr) : motivoRes.data.data;
            const antecedentesPersonales = antecedentesRes.data.data.filter(a => a.tipo === 'personal' || a.tipo === 'personales');
            const antecedentesFamiliares = antecedentesRes.data.data.filter(a => a.tipo === 'familiar' || a.tipo === 'familiares');
            const enfermedades = dateStr ? enfermedadRes.data.data.filter(e => (e.created_at || '').slice(0, 10) === dateStr) : enfermedadRes.data.data;
            const revisiones = dateStr ? organosRes.data.data.filter(o => (o.created_at || '').slice(0, 10) === dateStr) : organosRes.data.data;
            const examenFisico = dateStr ? examenRes.data.data.filter(ex => (ex.created_at || '').slice(0, 10) === dateStr) : examenRes.data.data;
            const diagnosticos = dateStr ? diagnosticoRes.data.data.filter(d => (d.created_at || '').slice(0, 10) === dateStr) : diagnosticoRes.data.data;
            const planes = dateStr ? planRes.data.data.filter(p => (p.created_at || '').slice(0, 10) === dateStr) : planRes.data.data;
            const evoluciones = dateStr ? evolucionRes.data.data.filter(ev => (ev.fecha || ev.created_at || '').slice(0, 10) === dateStr) : evolucionRes.data.data;
            const signos = dateStr ? signosRes.data.data.filter(s => (s.fecha || s.created_at || '').slice(0, 10) === dateStr) : signosRes.data.data;

            // 2. Generate HTML structure matching the sheet images
            const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Historia Clínica - Medicina General</title>
    <style>
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
            .no-print { display: none; }
            body, table, th, td {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
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
                <div style="font-weight: bold; font-size: 12px; color: #b71a34; line-height: 1.1;">BIENESTAR</div>
                <div style="font-size: 9px; color: #002040; letter-spacing: 0.5px;">UNIVERSITARIO</div>
                <div style="font-size: 7px; color: #666; margin-top: 2px;">PUESTO DE SALUD</div>
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

    <!-- PAGINA 2: HISTORIA CLÍNICA MEDICINA GENERAL -->
    <table class="header-table">
        <tr>
            <td class="header-title">Historia Clínica Medicina General</td>
            <td class="header-logo-container">
                <div style="font-weight: bold; font-size: 12px; color: #b71a34; line-height: 1.1;">BIENESTAR</div>
                <div style="font-size: 9px; color: #002040; letter-spacing: 0.5px;">UNIVERSITARIO</div>
            </td>
        </tr>
    </table>

    <div class="clinical-history-section-header">1 Motivo de Consulta</div>
    <div class="clinical-history-section-content">
        ${motivos.length > 0 ? motivos.map(m => `<div>• ${m.detalle_motivo} <span style="color:#666; font-size:8px;">(${m.fecha})</span></div>`).join('') : 'Sin registros.'}
    </div>

    <div class="clinical-history-section-header">2 Antecedentes Personales</div>
    <div class="clinical-history-section-content">
        ${antecedentesPersonales.length > 0 ? antecedentesPersonales.map(a => `<div>• ${a.detalle_antecedente}</div>`).join('') : 'Sin registros.'}
    </div>

    <div class="clinical-history-section-header">3 Antecedentes Familiares</div>
    <div class="clinical-history-section-content">
        ${antecedentesFamiliares.length > 0 ? antecedentesFamiliares.map(a => `<div>• ${a.detalle_antecedente}</div>`).join('') : 'Sin registros.'}
    </div>

    <div class="clinical-history-section-header">4 Enfermedad Actual</div>
    <div class="clinical-history-section-content">
        ${enfermedades.length > 0 ? enfermedades.map(e => `<div>• ${e.detalle_enfermedad_actual}</div>`).join('') : 'Sin registros.'}
    </div>

    <div class="clinical-history-section-header">5 Revisión Actual de Órganos y Sistemas</div>
    <div class="clinical-history-section-content">
        ${revisiones.length > 0 ? revisiones.map(r => `<div>• ${r.detalle_revision_organos}</div>`).join('') : 'Sin registros.'}
    </div>

    <div class="clinical-history-section-header">6 Signos Vitales</div>
    <table class="data-table" style="margin-bottom: 12px;">
        <thead>
            <tr class="form-label">
                <th>Fecha</th>
                <th>Presión Arterial</th>
                <th>Frec. Cardíaca</th>
                <th>Frec. Respiratoria</th>
                <th>Temperatura</th>
                <th>Talla</th>
                <th>Peso</th>
            </tr>
        </thead>
        <tbody>
            ${signos.length > 0 ? signos.map(sv => `
                <tr class="text-center" style="font-size: 10px;">
                    <td>${sv.fecha}</td>
                    <td>${sv.presion_arterial_sistolica || '—'}/${sv.presion_arterial_diastolica || '—'} mmHg</td>
                    <td>${sv.frecuencia_cardiaca || '—'} lpm</td>
                    <td>${sv.frecuencia_respiratoria || '—'} rpm</td>
                    <td>${sv.temperatura || '—'} ºC</td>
                    <td>${sv.talla || '—'} cm</td>
                    <td>${sv.peso || '—'} kg</td>
                </tr>
            `).join('') : '<tr><td colspan="7" class="text-center">Sin registros.</td></tr>'}
        </tbody>
    </table>

    <div class="clinical-history-section-header">7 Examen Físico</div>
    <div class="clinical-history-section-content">
        ${examenFisico.length > 0 ? examenFisico.map(ex => `<div>• ${ex.altura_x !== null && ex.altura_y !== null ? `<strong>[Localización: ${getAnatomicalRegion(ex.altura_x, ex.altura_y)}]</strong> ` : ''}${ex.detalle_examen_fisico}</div>`).join('') : 'Sin registros.'}
    </div>

    <div class="clinical-history-section-header">8 Diagnósticos</div>
    <table class="data-table" style="margin-bottom: 12px;">
        <thead>
            <tr class="form-label">
                <th style="width: 5%;">No.</th>
                <th style="width: 65%;">Diagnósticos</th>
                <th style="width: 15%;">CIE-10</th>
                <th style="width: 7%;">PRE</th>
                <th style="width: 8%;">DEF</th>
            </tr>
        </thead>
        <tbody>
            ${diagnosticos.length > 0 ? diagnosticos.map((d, idx) => `
                <tr style="font-size: 10px;">
                    <td class="text-center">${idx + 1}</td>
                    <td>${d.detalle_diagnostico}</td>
                    <td class="text-center">${d.cie10 || '—'}</td>
                    <td class="text-center">${d.presuntivo ? 'X' : ''}</td>
                    <td class="text-center">${d.definitivo ? 'X' : ''}</td>
                </tr>
            `).join('') : '<tr><td colspan="5" class="text-center">Sin registros.</td></tr>'}
        </tbody>
    </table>

    <div class="clinical-history-section-header">9 Planes Terapéuticos</div>
    <div class="clinical-history-section-content">
        ${planes.length > 0 ? planes.map(p => `<div>• ${p.detalle_plan_terapeutico}</div>`).join('') : 'Sin registros.'}
    </div>

    </div>
    <div class="page-break"></div>
    <div class="page-sheet">

    <!-- PAGINA 3: HOJA DE EVOLUCIÓN MEDICINA GENERAL -->
    <table class="header-table">
        <tr>
            <td class="header-title">Hoja de Evolución Medicina General</td>
            <td class="header-logo-container">
                <div style="font-weight: bold; font-size: 12px; color: #b71a34; line-height: 1.1;">BIENESTAR</div>
                <div style="font-size: 9px; color: #002040; letter-spacing: 0.5px;">UNIVERSITARIO</div>
            </td>
        </tr>
    </table>

    <table class="data-table">
        <thead>
            <tr class="form-label">
                <th style="width: 15%;">Fecha</th>
                <th style="width: 50%;">Evolución</th>
                <th style="width: 35%;">Prescripción Médica</th>
            </tr>
        </thead>
        <tbody>
            ${evoluciones.length > 0 ? evoluciones.map(ev => `
                <tr style="font-size: 10px; vertical-align: top;">
                    <td class="text-center" style="padding: 10px 5px;">${ev.fecha}</td>
                    <td style="padding: 10px;">${ev.detalle_evolucion}</td>
                    <td style="padding: 10px;">${ev.prescripcion_medica || 'Sin prescripciones.'}</td>
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

    // ==========================================
    // CONTROLADORES DE API - PARTE DIARIO
    // ==========================================
    const fetchParteDiario = async () => {
        setParteDiarioLoading(true);
        try {
            const response = await api.get('/medicina-general/parte-diario').catch(() => ({ data: { data: [] } }));
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

    useEffect(() => {
        if (activeTab === 'diario' || (activeTab === 'historial' && activeReportSubTab === 'diario')) {
            fetchParteDiario();
        }
    }, [activeTab, activeReportSubTab, parteDiarioDate]);

    // ==========================================
    // INFORME ESTADÍSTICO MENSUAL DE MEDICINA GENERAL
    // ==========================================
    const fetchAndCompileGeneralReport = async (dateVal = reportMensualFecha) => {
        setGenReportLoading(true);
        try {
            const res = await api.get('/medicina-general/parte-diario').catch(() => ({ data: { data: [] } }));
            const list = res.data?.data || [];

            const catRes = await api.get('/user-profile/catalogos').catch(() => ({ data: { facultades: [], carreras: [] } }));
            const dbFacultades = catRes.data?.facultades || [];
            const dbCarreras = catRes.data?.carreras || [];

            const filteredPartes = list.filter(item => {
                const rawDate = item.fecha || item.created_at;
                if (!rawDate) return false;
                return String(rawDate).trim().slice(0, 7) === dateVal;
            });

            const uniquePatientIds = [...new Set(filteredPartes.map(item => item.id_usuario_paciente))].filter(Boolean);

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
                profileMap[item.pid] = item.profile;
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

            dbCarreras.forEach(c => {
                const parentFac = dbFacultades.find(f => f.id === c.id_facultad);
                const repFacName = getReportingFacultyName(parentFac?.nombre, c.nombre);
                if (statsByFacultyAndCareer[repFacName]) {
                    statsByFacultyAndCareer[repFacName][c.nombre] = {
                        hombres: 0, mujeres: 0, lgbti: 0, total: 0
                    };
                }
            });

            let totalEstudiantes = 0;
            let totalAdministrativos = 0;
            let totalDocentes = 0;

            let genderCounts = {
                estudiantes: { hombres: 0, mujeres: 0, lgbti: 0 },
                administrativos: { hombres: 0, mujeres: 0, lgbti: 0 },
                docentes: { hombres: 0, mujeres: 0, lgbti: 0 }
            };

            filteredPartes.forEach(item => {
                const profile = profileMap[item.id_usuario_paciente] || item.paciente;

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
                let userType = 'estudiantes';
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

    useEffect(() => {
        if (activeTab === 'historial' && activeReportSubTab === 'mensual') {
            fetchAndCompileGeneralReport(reportMensualFecha);
        }
    }, [activeTab, activeReportSubTab, reportMensualFecha]);

    const compileGeneralReportHtmlString = (data) => {
        if (!data) return '';

        const monthsText = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        const monthNum = parseInt((reportMensualFecha || '').split('-')[1]) || 1;
        const yearNum = parseInt((reportMensualFecha || '').split('-')[0]) || 2026;
        const selectedMonthText = monthsText[monthNum - 1] || 'Enero';

        const doctorNameText = user?.name ? user.name.toUpperCase() : 'PROFESIONAL RESPONSABLE';

        let totalEstCareersCount = 0;
        data.reportingFaculties.forEach(f => {
            totalEstCareersCount += Object.keys(data.statsByFacultyAndCareer[f] || {}).length;
        });

        const renderTable1Rows = () => {
            let html = '';
            let isFirstRow = true;

            data.reportingFaculties.forEach(f => {
                const careers = data.statsByFacultyAndCareer[f] || {};
                const careerNames = Object.keys(careers);
                const facCareersCount = careerNames.length;
                if (facCareersCount === 0) return;

                let isFirstCareerInFac = true;

                careerNames.forEach(cName => {
                    const stats = careers[cName];
                    html += `<tr>`;

                    if (isFirstRow) {
                        html += `
                            <td rowspan="${totalEstCareersCount}" style="writing-mode: vertical-lr; transform: rotate(180deg); font-weight: bold; text-align: center; vertical-align: middle; background-color: #f1f5f9; width: 25px; border: 1px solid #000; font-size: 10px;">
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

            html += `
                <tr style="font-size: 8.5px; background: #e2e8f0; font-weight: bold;">
                    <td colspan="3" style="padding: 4px; border: 1px solid #000; text-align: left;">ESTUDIANTES</td>
                    <td style="border: 1px solid #000; text-align: center;">${data.genderCounts.estudiantes.hombres}</td>
                    <td style="border: 1px solid #000; text-align: center;">${data.genderCounts.estudiantes.mujeres}</td>
                    <td style="border: 1px solid #000; text-align: center;">${data.genderCounts.estudiantes.lgbti}</td>
                    <td style="border: 1px solid #000; text-align: center; font-weight: bold; background: #cbd5e1;">${data.totalEstudiantes}</td>
                </tr>
            `;

            html += `
                <tr style="font-size: 8.5px; background: #e2e8f0; font-weight: bold;">
                    <td colspan="3" style="padding: 4px; border: 1px solid #000; text-align: left;">ADMINISTRATIVOS</td>
                    <td style="border: 1px solid #000; text-align: center;">${data.genderCounts.administrativos.hombres}</td>
                    <td style="border: 1px solid #000; text-align: center;">${data.genderCounts.administrativos.mujeres}</td>
                    <td style="border: 1px solid #000; text-align: center;">${data.genderCounts.administrativos.lgbti}</td>
                    <td style="border: 1px solid #000; text-align: center; font-weight: bold; background: #cbd5e1;">${data.totalAdministrativos}</td>
                </tr>
            `;

            html += `
                <tr style="font-size: 8.5px; background: #e2e8f0; font-weight: bold;">
                    <td colspan="3" style="padding: 4px; border: 1px solid #000; text-align: left;">DOCENTES</td>
                    <td style="border: 1px solid #000; text-align: center;">${data.genderCounts.docentes.hombres}</td>
                    <td style="border: 1px solid #000; text-align: center;">${data.genderCounts.docentes.mujeres}</td>
                    <td style="border: 1px solid #000; text-align: center;">${data.genderCounts.docentes.lgbti}</td>
                    <td style="border: 1px solid #000; text-align: center; font-weight: bold; background: #cbd5e1;">${data.totalDocentes}</td>
                </tr>
            `;

            const totalH = data.genderCounts.estudiantes.hombres + data.genderCounts.administrativos.hombres + data.genderCounts.docentes.hombres;
            const totalM = data.genderCounts.estudiantes.mujeres + data.genderCounts.administrativos.mujeres + data.genderCounts.docentes.mujeres;
            const totalL = data.genderCounts.estudiantes.lgbti + data.genderCounts.administrativos.lgbti + data.genderCounts.docentes.lgbti;
            const grandTotal = data.totalPacientes;

            html += `
                <tr style="font-size: 9px; background-color: #0f172a !important; color: #fff; font-weight: bold;">
                    <td colspan="3" style="padding: 5px; border: 1px solid #000; text-align: left;">TOTAL ATENCIONES</td>
                    <td style="border: 1px solid #000; text-align: center;">${totalH}</td>
                    <td style="border: 1px solid #000; text-align: center;">${totalM}</td>
                    <td style="border: 1px solid #000; text-align: center;">${totalL}</td>
                    <td style="border: 1px solid #000; text-align: center; font-weight: bold;">${grandTotal}</td>
                </tr>
            `;

            return html;
        };

        return `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <title>Informe Estadístico Mensual - Medicina General</title>
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
                <div class="header-title">
                    <h1>UNIVERSIDAD ESTATAL DE BOLÍVAR</h1>
                    <h2>DEPARTAMENTO DE BIENESTAR UNIVERSITARIO</h2>
                    <h3>INFORME ESTADÍSTICO MENSUAL DE MEDICINA GENERAL</h3>
                </div>

                <div class="meta-grid">
                    <div><strong>UNIDAD OPERATIVA:</strong> MEDICINA GENERAL</div>
                    <div><strong>RESPONSABLE:</strong> ${doctorNameText}</div>
                    <div><strong>PERIODO:</strong> ${selectedMonthText.toUpperCase()} ${yearNum}</div>
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
                        <strong>Médico/a General Responsable</strong><br/>
                        <span>${doctorNameText}</span>
                    </div>
                </div>

                <script>
                    window.onload = function() { window.print(); };
                </script>
            </body>
            </html>
        `;
    };

    const handlePrintGeneralReport = () => {
        if (!genReportData) return;
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            showSystemToast("El bloqueador de popups impidió abrir el reporte. Permita los popups.");
            return;
        }
        printWindow.document.write(compileGeneralReportHtmlString(genReportData));
        printWindow.document.close();
    };

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

            // Cálculo de edad en base a la fecha de nacimiento
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

            // Contadores de totales para las columnas estadísticas
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

                // Tipo de discapacidad
                const hasDisability = item.paciente?.discapacidades && item.paciente.discapacidades.length > 0;
                const tipoDiscapacidad = hasDisability ? item.paciente.discapacidades.map(d => d.detalle_discapacidad).join(', ') : '';

                // Género (Hombre / Mujer / LGBTI)
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

                // Área (Docente / Carrera o Administrativo)
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

                // Tipo de Atención (Primera / Subsecuente / Certificado Médico / Validación)
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

            // Se rellenan filas vacías hasta un mínimo de 12 para que coincida exactamente con la estética del formato físico
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
                    <title>Parte Diario de Medicina - UEB</title>
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
                            border-bottom: 2px solid #000;
                            padding-bottom: 8px;
                            margin-bottom: 12px;
                        }
                        .header-logo-left {
                            font-weight: bold;
                            font-size: 14px;
                            color: #0b2240;
                        }
                        .header-logo-left span {
                            color: #b71a34;
                            display: block;
                            font-size: 8px;
                        }
                        .header-center { text-align: center; }
                        .header-center h1 { margin: 0; font-size: 13px; font-weight: bold; }
                        .header-center h2 { margin: 2px 0 0; font-size: 11px; font-weight: bold; }
                        .header-center h3 { margin: 2px 0 0; font-size: 10px; font-weight: bold; color: #444; }
                        .header-logo-right { text-align: right; font-weight: bold; font-size: 10px; color: #0b2240; }
                        .meta-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
                        .meta-date { font-size: 11px; font-weight: bold; border: 1px solid #000; padding: 4px 10px; background-color: #fff; }
                        .meta-tag { font-size: 12px; font-weight: bold; border: 2px solid #000; padding: 3px 12px; letter-spacing: 1px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 5px; }
                        th, td { border: 1px solid #000; padding: 5px 3px; font-size: 8.5px; vertical-align: middle; }
                        th { font-weight: bold; text-align: center; }
                        .th-num { width: 3%; background-color: #ffffff !important; }
                        .th-nombres { width: 23%; background-color: #fef9c3 !important; }
                        .th-cedula { width: 8%; background-color: #dcfce7 !important; }
                        .th-discapacidad { width: 11%; background-color: #dbeafe !important; }
                        .th-edad { width: 4%; background-color: #fce7f3 !important; }
                        .th-genero { width: 8%; background-color: #fef08a !important; }
                        .th-area { width: 16%; background-color: #dbeafe !important; }
                        .th-atencion { width: 12%; background-color: #ffedd5 !important; }
                        .th-diag { width: 15%; background-color: #dcfce7 !important; }
                        .sub-header th { font-size: 7px; padding: 3px 1px; font-weight: bold; }
                        .text-center { text-align: center; }
                        tr.empty-row td { height: 24px; }
                        .total-row { background-color: #fef9c3 !important; font-weight: bold; }
                        .total-row td { border-top: 2px solid #000; }
                        @media print {
                            body { background-color: transparent; padding: 0; margin: 0; display: block; min-height: auto; }
                            .page-sheet { width: 100%; min-height: auto; padding: 0; box-shadow: none; border-radius: 0; }
                            body, table, th, td { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                        }
                    </style>
                </head>
                <body>
                    <div class="page-sheet">
                    <div class="header-container">
                        <div class="header-logo-left">
                            UEB <span>Universidad Estatal de Bolívar</span>
                        </div>
                        <div class="header-center">
                            <h1>UNIVERSIDAD ESTATAL DE BOLÍVAR</h1>
                            <h2>DEPARTAMENTO DE BIENESTAR UNIVERSITARIO</h2>
                            <h3>PARTE DIARIO - CAMPUS LA MATRIZ</h3>
                        </div>
                        <div class="header-logo-right">
                            BIENESTAR UNIVERSITARIO<br/>
                            <span style="font-size: 8px; font-weight: normal; color: #555;">PUESTO DE SALUD</span>
                        </div>
                    </div>

                    <div class="meta-info">
                        <div class="meta-date">FECHA: ${parteDiarioDate}</div>
                        <div class="meta-tag">MEDICINA</div>
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
                            <strong>Responsable de Medicina General</strong><br/>
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

    // ==========================================
    // CONTROLADORES DE API - HISTORIAL GENERAL
    // ==========================================
    const fetchHistorialGeneral = async () => {
        try {
            const [evolucionRes, diarioRes, signosRes] = await Promise.all([
                api.get('/medicina-general/historial-evolucion').catch(() => ({ data: { data: [] } })),
                api.get('/medicina-general/parte-diario').catch(() => ({ data: { data: [] } })),
                api.get('/medicina-general/signos-vitales').catch(() => ({ data: { data: [] } }))
            ]);

            const getSafeArray = (res) => (res && res.data && Array.isArray(res.data.data)) ? res.data.data : [];

            const mappedEvol = getSafeArray(evolucionRes).map(item => ({
                id: `evolucion-${item.id}`,
                type: 'evolucion',
                fecha: item.fecha ? item.fecha.slice(0, 10) : '',
                paciente: item.paciente,
                detalle: `Evolución: ${item.detalle_evolucion} · Indicación: ${item.prescripcion_medica || 'Ninguna'}`
            }));

            const mappedDiario = getSafeArray(diarioRes).map(item => ({
                id: `diario-${item.id}`,
                type: 'diario',
                fecha: item.fecha ? item.fecha.slice(0, 10) : '',
                paciente: item.paciente,
                detalle: `Atención: ${(item.tipo_atencion || 'general').toUpperCase()} · Diagnóstico: ${item.detalle_diagnostico || 'Evaluación'}`
            }));

            const mappedSignos = getSafeArray(signosRes).map(item => ({
                id: `signos-${item.id}`,
                type: 'signos',
                fecha: item.fecha ? item.fecha.slice(0, 10) : '',
                paciente: item.paciente,
                detalle: `Signos Vitales: PA: ${item.presion_arterial_sistolica}/${item.presion_arterial_diastolica} · Temp: ${item.temperatura}°C · Peso: ${item.peso}kg`
            }));

            setHistorialList([...mappedEvol, ...mappedDiario, ...mappedSignos].sort((a, b) => (b.fecha > a.fecha ? 1 : -1)));
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
            showToast("Cita confirmada exitosamente");
        } catch (err) {
            alert(err.response?.data?.message || "Error al confirmar la cita");
        }
    };

    const handleCancelarCita = async (citaId) => {
        if (!window.confirm("¿Está seguro de que desea cancelar esta cita?")) return;
        try {
            await api.patch(`/citas-medicas/${citaId}/cancelar`);
            fetchCitasDoctor();
            showToast("Cita cancelada exitosamente");
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
            showToast("Cita completada y notas guardadas");
        } catch (err) {
            alert(err.response?.data?.message || "Error al completar la cita");
        } finally {
            setSavingNotas(false);
        }
    };

    const handlePrintReporteCitas = () => {
        try {
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                showToast("El bloqueador de popups impidió abrir el reporte. Permita los popups.");
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
                const pIdent = cita.paciente?.datos_identificacion || cita.paciente?.datosIdentificacion;
                const patientName = pIdent
                    ? `${pIdent.primer_nombre} ${pIdent.segundo_nombre || ''} ${pIdent.apellido_paterno} ${pIdent.apellido_materno || ''}`.replace(/\s+/g, ' ').trim()
                    : cita.paciente?.name || 'Paciente';
                const cedula = pIdent?.numero_cedula || 'N/D';
                const estado = (cita.estado || 'programada').toUpperCase();
                const horario = `${cita.hora_inicio || ''} - ${cita.hora_fin || ''}`;
                const motivo = cita.motivo || 'Consulta en Medicina General';
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
                    <title>Reporte de Citas Médicas - Medicina General UEB</title>
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
                            <div class="header-logo">
                                UEB <span>Universidad Estatal de Bolívar</span>
                            </div>
                            <div class="header-center">
                                <h1>UNIVERSIDAD ESTATAL DE BOLÍVAR</h1>
                                <h2>DEPARTAMENTO DE BIENESTAR UNIVERSITARIO</h2>
                                <h3 style="margin: 2px 0 0; font-size: 10px; font-weight: bold; color: #b71a34;">REPORTE DE CITAS Y CONSULTAS - MEDICINA GENERAL</h3>
                            </div>
                            <div style="text-align: right; font-size: 9px;">
                                <strong>FECHA FILTRO:</strong><br/>${formattedDate}
                            </div>
                        </div>

                        <div class="meta-info">
                            <div><strong>Médico/a General Responsable:</strong> ${doctorNameText}</div>
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
                                <strong>Médico/a General Responsable</strong><br/>
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
            const searchText = historialSearch.toLowerCase();
            const pIdent = item.paciente?.datos_identificacion || item.paciente?.datosIdentificacion;
            const patientName = (pIdent
                ? `${pIdent.primer_nombre} ${pIdent.apellido_paterno}`
                : item.paciente?.name || ''
            ).toLowerCase();
            const patientCedula = pIdent?.numero_cedula || '';
            const details = item.detalle.toLowerCase();

            if (searchText && !patientName.includes(searchText) && !patientCedula.includes(searchText) && !details.includes(searchText)) {
                return false;
            }
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
                        <div className="brand__logo" style={{ background: '#0284c7' }}>
                            <Stethoscope size={20} color="white" />
                        </div>
                        <div className="brand__text">
                            <strong>Bienestar</strong>
                            <span>Medicina General</span>
                        </div>
                        <button className="sidebar__close" onClick={() => setIsSidebarOpen(false)}>
                            <X size={18} />
                        </button>
                    </div>

                    <p className="sidebar__label">ATENCIÓN INTEGRAL</p>
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
                        <button
                            className={`navigation__item ${activeTab === 'farmacia-inventario' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('farmacia-inventario'); setIsSidebarOpen(false); }}
                        >
                            <span className="navigation__indicator"></span>
                            <span className="navigation__icon"><Package size={18} /></span>
                            <span className="navigation__text">Inventario</span>
                        </button>
                    </nav>

                    <div className="sidebar__footer">
                        <button className="logout-button" onClick={handleLogoutClick}>
                            <span className="logout-button__icon"><LogOut size={16} /></span>
                            <span>Cerrar sesión</span>
                        </button>
                        <p className="system-version">Sistema BU · M. General</p>
                    </div>
                </aside>

                {/* CONTENIDO PRINCIPAL */}
                <main className="main-content">
                    {/* TOPBAR */}
                    <header className="topbar">
                        <div className="topbar__left">
                            <button className="menu-button" onClick={() => setIsSidebarOpen(true)}>
                                <Menu size={20} />
                            </button>
                            <div>
                                <p className="breadcrumb">Medicina General / <span>{activeTab === 'historial' ? 'REPORTES' : activeTab === 'farmacia-inventario' ? 'INVENTARIO' : activeTab.toUpperCase()}</span></p>
                                <h1>
                                    {activeTab === 'ficha' ? 'Consulta Médica' :
                                        activeTab === 'evolucion' ? 'Seguimiento a Pacientes' :
                                            activeTab === 'diario' ? 'Parte Diario de Medicina General' :
                                                activeTab === 'citas' ? 'Gestión de Citas' :
                                                    activeTab === 'farmacia-inventario' ? 'Inventario de Medicamentos e Insumos' : 'Centro de Reportes de Medicina General'}
                                </h1>
                            </div>
                        </div>
                        <div className="topbar__right">
                            <button className="topbar-button" style={{ marginRight: '8px' }}><Bell size={18} /><span className="notification-point"></span></button>
                            <UserProfileMenu />
                        </div>
                    </header>

                    <div className="content">
                        {/* PESTAÑA 1: HERO Y SELECTOR SI NO HAY PACIENTE */}
                        {activeTab === 'ficha' && (
                            <div>
                                <section className="page-hero vitals-choice-hero">
                                    <div>
                                        <span className="page-hero__label"><Stethoscope size={14} style={{ marginRight: '6px', display: 'inline' }} /> Valoración Médica</span>
                                        <h2>¿Qué deseas realizar?</h2>
                                        <p>Selecciona una opción para iniciar el registro de signos vitales, antecedentes y diagnóstico del paciente.</p>
                                    </div>
                                    <div className="page-hero__icon"><Stethoscope size={34} /></div>
                                </section>

                                <section className="vitals-action-grid">
                                    <button
                                        className="vitals-action-card vitals-action-card--primary"
                                        onClick={() => { setModalSearchCedula(''); setModalSearchResults([]); setIsPatientSearchOpen(true); }}
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
                                            setNewPatientForm({ nombre_completo: '', tipo_documento: 'cedula', cedula: '', pais_origen: '', tipo: 'Estudiante', correo: '', password: '' });
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

                        {/* PESTAÑA 2: EVOLUCION */}
                        {activeTab === 'evolucion' && (
                            <div>
                                <section className="nurse-card patient-selector-card" style={{ marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                            <div className="nurse-card__icon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}><User size={20} /></div>
                                            <div>
                                                <h3>Paciente para Evolución</h3>
                                                <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '12px' }}>
                                                    {selectedPatient ? (
                                                        <strong>{selectedPatient.nombre_completo} (Cédula: {selectedPatient.cedula || selectedPatient.numero_cedula})</strong>
                                                    ) : (
                                                        "Ninguno - Debe buscar un paciente para consultar su evolución clínica."
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button className="action-button action-button--accent" onClick={() => { setModalSearchCedula(''); setModalSearchResults([]); setIsPatientSearchOpen(true); }}>
                                                <Search size={14} /> Buscar Paciente
                                            </button>
                                        </div>
                                    </div>
                                </section>

                                {!selectedPatient ? (
                                    <div className="patient-empty-state show">
                                        <User size={40} />
                                        <strong>No hay paciente seleccionado</strong>
                                        <p>Busca e introduce un paciente para consultar su historial médico por áreas.</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        {/* Header Card */}
                                        <div className="card" style={{ borderRadius: '14px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', boxShadow: 'var(--shadow-sm)', flexWrap: 'wrap', gap: '15px' }}>
                                            <div>
                                                <span className="eyebrow">HISTORIAL CLÍNICO</span>
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
                                                {areaHistoriesLoading ? (
                                                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Cargando registros...</div>
                                                ) : !areaHistories[activeBookArea] || areaHistories[activeBookArea].length === 0 ? (
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
                                                                                        {record.detalle_evolucion || record.detalle_diagnostico || record.detalle_motivo || record.procedimiento?.nombre_procedimiento || 'Ver detalles'}
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

                                                        {Math.ceil(areaHistories[activeBookArea].length / HISTORY_PER_PAGE) > 1 && (
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

                                            {/* Detail Column */}
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
                                                            {activeBookArea === 'medicina' && (
                                                                <button
                                                                    className="action-button action-button--accent"
                                                                    style={{ fontSize: '11px', minHeight: '32px', padding: '0 12px', borderRadius: '8px' }}
                                                                    onClick={() => handleDownloadHistoriaClinicaPdf(selectedPatient.id_usuario || selectedPatient.id, activeBookRecord?.fecha || activeBookRecord?.created_at)}
                                                                    title="Descargar Historia Clínica PDF"
                                                                >
                                                                    <FileText size={14} /> PDF
                                                                </button>
                                                            )}
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
                                                        {activeBookArea === 'medicina' && (
                                                            <>
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
                                                                {activeBookRecord.type === 'diario' && (
                                                                    <>
                                                                        <div className="preview-paper-field">
                                                                            <span>Tipo de Atención</span>
                                                                            <strong style={{ textTransform: 'capitalize' }}>{activeBookRecord.tipo_atencion} ({activeBookRecord.tipo || 'Preventivo'})</strong>
                                                                        </div>
                                                                        <div className="preview-paper-field">
                                                                            <span>Diagnóstico</span>
                                                                            <p style={{ fontWeight: '600', margin: 0 }}>{activeBookRecord.detalle_diagnostico}</p>
                                                                        </div>
                                                                    </>
                                                                )}
                                                                {activeBookRecord.type === 'signos' && (
                                                                    <>
                                                                        <div className="preview-vitals-grid">
                                                                            <div>
                                                                                <span>Presión Arterial</span>
                                                                                <strong>{activeBookRecord.presion_arterial_sistolica || '—'}/{activeBookRecord.presion_arterial_diastolica || '—'}</strong>
                                                                                <small>mmHg</small>
                                                                            </div>
                                                                            <div>
                                                                                <span>Frec. Cardíaca</span>
                                                                                <strong>{activeBookRecord.frecuencia_cardiaca || '—'}</strong>
                                                                                <small>lpm</small>
                                                                            </div>
                                                                            <div>
                                                                                <span>Frec. Respiratoria</span>
                                                                                <strong>{activeBookRecord.frecuencia_respiratoria || '—'}</strong>
                                                                                <small>rpm</small>
                                                                            </div>
                                                                            <div>
                                                                                <span>Temperatura</span>
                                                                                <strong>{activeBookRecord.temperatura || '—'}</strong>
                                                                                <small>°C</small>
                                                                            </div>
                                                                            <div>
                                                                                <span>Talla</span>
                                                                                <strong>{activeBookRecord.talla || '—'}</strong>
                                                                                <small>cm</small>
                                                                            </div>
                                                                            <div>
                                                                                <span>Peso</span>
                                                                                <strong>{activeBookRecord.peso || '—'}</strong>
                                                                                <small>kg</small>
                                                                            </div>
                                                                        </div>
                                                                    </>
                                                                )}
                                                                {activeBookRecord.type === 'examen_fisico' && (
                                                                    <>
                                                                        <div className="preview-paper-field">
                                                                            <span>Descripción del Examen Físico</span>
                                                                            <p style={{ fontStyle: 'italic', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', lineHeight: '1.5', margin: 0 }}>
                                                                                {activeBookRecord.detalle_examen_fisico}
                                                                            </p>
                                                                        </div>
                                                                        {activeBookRecord.altura_x !== null && activeBookRecord.altura_y !== null && (
                                                                            <div className="preview-paper-field">
                                                                                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                                    <MapPin size={14} style={{ color: 'var(--primary)' }} /> Región Registrada: {getAnatomicalRegion(activeBookRecord.altura_x, activeBookRecord.altura_y)} (Coordenadas: {activeBookRecord.altura_x}%, {activeBookRecord.altura_y}%)
                                                                                </span>
                                                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', marginTop: '8px' }}>
                                                                                    <svg
                                                                                        viewBox="0 0 200 220"
                                                                                        style={{
                                                                                            width: '100%',
                                                                                            height: '180px',
                                                                                            background: 'white',
                                                                                            borderRadius: '8px',
                                                                                            border: '1px solid var(--border)',
                                                                                            userSelect: 'none'
                                                                                        }}
                                                                                    >
                                                                                        <g id="front-view-preview">
                                                                                            <path
                                                                                                d="M 50,20 C 44,20 40,24 40,30 C 40,36 44,40 50,40 C 56,40 60,36 60,30 C 60,24 56,20 50,20 Z M 47,40 L 53,40 L 53,46 L 47,46 Z M 32,48 C 28,48 26,52 26,56 L 24,96 C 24,100 28,102 30,102 L 34,102 L 32,150 L 38,210 L 46,210 L 48,150 L 50,150 L 52,150 L 54,210 L 62,210 L 68,150 L 66,102 L 70,102 C 72,102 76,100 76,96 L 74,56 C 74,52 72,48 68,48 Z"
                                                                                                fill="#e2e8f0"
                                                                                                stroke="#64748b"
                                                                                                strokeWidth="1.5"
                                                                                            />
                                                                                            <text x="50" y="215" textAnchor="middle" style={{ fontSize: '10px', fill: '#64748b', fontWeight: 'bold' }}>FRENTE</text>
                                                                                        </g>
                                                                                        <g id="back-view-preview">
                                                                                            <path
                                                                                                d="M 150,20 C 144,20 140,24 140,30 C 140,36 144,40 150,40 C 156,40 160,36 160,30 C 160,24 156,20 150,20 Z M 147,40 L 153,40 L 153,46 L 147,46 Z M 132,48 C 128,48 126,52 126,56 L 124,96 C 124,100 128,102 130,102 L 134,102 L 132,150 L 138,210 L 146,210 L 148,150 L 150,150 L 152,150 L 154,210 L 162,210 L 168,150 L 166,102 L 170,102 C 172,102 176,100 176,96 L 74,56 C 74,52 172,48 168,48 Z"
                                                                                                fill="#cbd5e1"
                                                                                                stroke="#475569"
                                                                                                strokeWidth="1.5"
                                                                                            />
                                                                                            <text x="150" y="215" textAnchor="middle" style={{ fontSize: '10px', fill: '#475569', fontWeight: 'bold' }}>ESPALDA</text>
                                                                                        </g>
                                                                                        <g>
                                                                                            <circle
                                                                                                cx={(activeBookRecord.altura_x / 100) * 200}
                                                                                                cy={(activeBookRecord.altura_y / 100) * 220}
                                                                                                r="8"
                                                                                                fill="rgba(183, 26, 52, 0.4)"
                                                                                            />
                                                                                            <circle
                                                                                                cx={(activeBookRecord.altura_x / 100) * 200}
                                                                                                cy={(activeBookRecord.altura_y / 100) * 220}
                                                                                                r="3.5"
                                                                                                fill="#b71a34"
                                                                                                stroke="white"
                                                                                                strokeWidth="1"
                                                                                            />
                                                                                        </g>
                                                                                    </svg>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                )}
                                                                {activeBookRecord.type === 'diario' && activeBookRecord.procedimiento && (
                                                                    <>
                                                                        <div className="preview-paper-field">
                                                                            <span>Procedimiento Clínico</span>
                                                                            <strong>{activeBookRecord.procedimiento?.nombre_procedimiento || 'Procedimiento menor'}</strong>
                                                                        </div>
                                                                        <div className="preview-paper-field">
                                                                            <span>Observaciones y Detalles</span>
                                                                            <p style={{ fontStyle: 'italic', lineHeight: '1.5', margin: 0 }}>
                                                                                {activeBookRecord.detalle_procedimiento || 'Sin observaciones.'}
                                                                            </p>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </>
                                                        )}

                                                        {activeBookArea === 'psicologia' && (
                                                            <>
                                                                {activeBookRecord.type === 'evolucion' && (
                                                                    <>
                                                                        <div className="preview-paper-field">
                                                                            <span>Detalle de Evolución Psicológica</span>
                                                                            <p style={{ fontStyle: 'italic', background: '#f5f3ff', padding: '12px', borderRadius: '8px', border: '1px solid #ddd6fe', lineHeight: '1.5', margin: 0 }}>
                                                                                {activeBookRecord.detalle_evolucion}
                                                                            </p>
                                                                        </div>
                                                                        <div className="preview-paper-field">
                                                                            <span>Prescripción / Recomendaciones</span>
                                                                            <p style={{ background: '#f0fdfa', padding: '12px', borderRadius: '8px', border: '1px solid #99f6e4', color: '#0f766e', margin: 0 }}>
                                                                                {activeBookRecord.prescripcion_medica || 'Sin recomendaciones registradas.'}
                                                                            </p>
                                                                        </div>
                                                                    </>
                                                                )}
                                                                {activeBookRecord.type === 'diario' && (
                                                                    <>
                                                                        <div className="preview-paper-field">
                                                                            <span>Tipo de Atención</span>
                                                                            <strong style={{ textTransform: 'capitalize' }}>{activeBookRecord.tipo_atencion} - {activeBookRecord.tipo_atencion2 || 'General'}</strong>
                                                                        </div>
                                                                        <div className="preview-paper-field">
                                                                            <span>Diagnóstico Clínico</span>
                                                                            <p style={{ fontWeight: '600', margin: 0 }}>{activeBookRecord.detalle_diagnostico}</p>
                                                                        </div>
                                                                        {activeBookRecord.procedimiento && (
                                                                            <div className="preview-paper-field">
                                                                                <span>Procedimiento / Terapia</span>
                                                                                <p style={{ margin: 0 }}>{activeBookRecord.procedimiento}</p>
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </>
                                                        )}

                                                        {activeBookArea === 'odontologia' && (
                                                            <>
                                                                {activeBookRecord.type === 'evolucion' && (
                                                                    <>
                                                                        <div className="preview-paper-field">
                                                                            <span>Detalle de Evolución Dental</span>
                                                                            <p style={{ fontStyle: 'italic', background: '#ecfdf5', padding: '12px', borderRadius: '8px', border: '1px solid #a7f3d0', lineHeight: '1.5', margin: 0 }}>
                                                                                {activeBookRecord.detalle_evolucion}
                                                                            </p>
                                                                        </div>
                                                                        <div className="preview-paper-field">
                                                                            <span>Prescripción / Indicación</span>
                                                                            <p style={{ background: '#f0fdf4', padding: '12px', borderRadius: '8px', border: '1px solid #bbf7d0', color: '#166534', margin: 0 }}>
                                                                                {activeBookRecord.prescripcion_medica || 'Ninguna.'}
                                                                            </p>
                                                                        </div>
                                                                    </>
                                                                )}
                                                                {activeBookRecord.type === 'diario' && (
                                                                    <>
                                                                        <div className="preview-paper-field">
                                                                            <span>Tipo de Atención</span>
                                                                            <strong style={{ textTransform: 'capitalize' }}>{activeBookRecord.tipo_atencion} ({activeBookRecord.tipo_atencion2 || 'General'})</strong>
                                                                        </div>
                                                                        <div className="preview-paper-field">
                                                                            <span>Diagnóstico</span>
                                                                            <p style={{ fontWeight: '600', margin: 0 }}>{activeBookRecord.detalle_diagnostico}</p>
                                                                        </div>
                                                                        <div className="preview-paper-field">
                                                                            <span>Procedimiento Dental Realizado</span>
                                                                            <strong style={{ color: 'var(--accent)' }}>{activeBookRecord.procedimiento || 'Ninguno'}</strong>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </>
                                                        )}

                                                        {activeBookArea === 'enfermeria' && (
                                                            <>
                                                                {activeBookRecord.type === 'vitals' && (
                                                                    <>
                                                                        <div className="preview-vitals-grid">
                                                                            <div>
                                                                                <span>Presión Arterial</span>
                                                                                <strong>{activeBookRecord.presion_arterial_sistolica || '—'}/{activeBookRecord.presion_arterial_diastolica || '—'}</strong>
                                                                                <small>mmHg</small>
                                                                            </div>
                                                                            <div>
                                                                                <span>Frec. Cardíaca</span>
                                                                                <strong>{activeBookRecord.frecuencia_cardiaca || '—'}</strong>
                                                                                <small>lpm</small>
                                                                            </div>
                                                                            <div>
                                                                                <span>Frec. Respiratoria</span>
                                                                                <strong>{activeBookRecord.frecuencia_respiratoria || '—'}</strong>
                                                                                <small>rpm</small>
                                                                            </div>
                                                                            <div>
                                                                                <span>Temperatura</span>
                                                                                <strong>{activeBookRecord.temperatura || '—'}</strong>
                                                                                <small>°C</small>
                                                                            </div>
                                                                            <div>
                                                                                <span>Talla</span>
                                                                                <strong>{activeBookRecord.talla || '—'}</strong>
                                                                                <small>cm</small>
                                                                            </div>
                                                                            <div>
                                                                                <span>Peso</span>
                                                                                <strong>{activeBookRecord.peso || '—'}</strong>
                                                                                <small>kg</small>
                                                                            </div>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </>
                                                        )}

                                                        {/* Acciones de Certificado */}
                                                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(0,32,64,0.05)' }}>
                                                            {activeBookRecord.tipo_atencion === 'certificadomedico' ? (
                                                                <button
                                                                    className="action-button action-button--accent"
                                                                    onClick={() => handlePrintSessionCertificate(activeBookRecord)}
                                                                    style={{ width: '100%', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                                                >
                                                                    <Printer size={16} /> Imprimir Certificado
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    className="action-button action-button--accent"
                                                                    onClick={() => handleIssueCertificate(activeBookRecord)}
                                                                    style={{ width: '100%', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                                                >
                                                                    <FileCheck size={16} /> Otorgar Certificado
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* PESTAÑA 3: PARTE DIARIO */}
                        {activeTab === 'diario' && (
                            <div>
                                <section className="page-hero">
                                    <div>
                                        <span className="page-hero__label"><ClipboardList size={14} style={{ marginRight: '6px', display: 'inline' }} /> Consulta de Jornada</span>
                                        <h2>Parte Diario de Medicina</h2>
                                        <p>Visualice las atenciones del consultorio clínico general en la fecha seleccionada.</p>
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

                        {/* PESTAÑA 4: REPORTES Y PARTES (REEMPLAZA HISTORIAL GENERAL) */}
                        {activeTab === 'historial' && (
                            <div>
                                <section className="page-hero" style={{ marginBottom: '20px' }}>
                                    <div>
                                        <span className="page-hero__label"><FileText size={14} style={{ marginRight: '6px', display: 'inline' }} /> Reportes y Gestión</span>
                                        <h2>Centro de Reportes de Medicina General</h2>
                                        <p>Genere, visualice e imprima los informes oficiales requeridos para las auditorías y entrega a sus superiores.</p>
                                    </div>
                                    <div className="page-hero__icon"><FileText size={34} /></div>
                                </section>

                                {/* Liquid Navigation for Reports */}
                                <div className="liquid-nav" style={{ marginBottom: '20px' }}>
                                    <button
                                        type="button"
                                        className={`liquid-nav__item ${activeReportSubTab === 'diario' ? 'active' : ''}`}
                                        onClick={() => setActiveReportSubTab('diario')}
                                    >
                                        <ClipboardList size={16} />
                                        <span>Partes Diarios</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`liquid-nav__item ${activeReportSubTab === 'citas' ? 'active' : ''}`}
                                        onClick={() => setActiveReportSubTab('citas')}
                                    >
                                        <CalendarCheck size={16} />
                                        <span>Agendamiento de Citas</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`liquid-nav__item ${activeReportSubTab === 'mensual' ? 'active' : ''}`}
                                        onClick={() => setActiveReportSubTab('mensual')}
                                    >
                                        <FileText size={16} />
                                        <span>Informe Estadístico Mensual</span>
                                    </button>
                                </div>

                                {/* SUB-TAB 1: PARTE DIARIO */}
                                {activeReportSubTab === 'diario' && (
                                    <div>
                                        <section className="nurse-card daily-header-card" style={{ marginBottom: '20px' }}>
                                            <div className="daily-date-control" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '15px' }}>
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
                                                    <button
                                                        onClick={handlePrintParteDiario}
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
                                                        No hay atenciones registradas en el diario para la fecha seleccionada.
                                                    </div>
                                                ) : (
                                                    <table className="evolution-table">
                                                        <thead>
                                                            <tr>
                                                                <th>#</th>
                                                                <th>Paciente</th>
                                                                <th>Cédula</th>
                                                                <th>Edad</th>
                                                                <th>Motivo</th>
                                                                <th>Diagnóstico (CIE-10)</th>
                                                                <th>Tipo Atención</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {parteDiarioList.map((item, idx) => {
                                                                const patient = item.paciente;
                                                                const pIdent = patient?.datos_identificacion || patient?.datosIdentificacion || patient?.identification;
                                                                const name = pIdent
                                                                    ? `${pIdent.primer_nombre || ''} ${pIdent.segundo_nombre || ''} ${pIdent.apellido_paterno || pIdent.primer_apellido || ''} ${pIdent.apellido_materno || ''}`.replace(/\s+/g, ' ').trim()
                                                                    : patient?.nombre_completo || patient?.name || 'Paciente';
                                                                const cedula = pIdent?.numero_cedula || pIdent?.numero_identificacion || patient?.cedula || patient?.numero_cedula || patient?.numero_identificacion || 'N/I';

                                                                let age = 'N/I';
                                                                const bdateStr = pIdent?.fecha_nacimiento || patient?.fecha_nacimiento;
                                                                if (bdateStr) {
                                                                    const bdate = new Date(bdateStr);
                                                                    if (!isNaN(bdate.getTime())) {
                                                                        const diffMs = Date.now() - bdate.getTime();
                                                                        const ageDate = new Date(diffMs);
                                                                        age = Math.abs(ageDate.getUTCFullYear() - 1970);
                                                                    }
                                                                }

                                                                return (
                                                                    <tr key={item.id || idx}>
                                                                        <td style={{ fontWeight: 'bold' }}>{idx + 1}</td>
                                                                        <td>{name}</td>
                                                                        <td>{cedula}</td>
                                                                        <td>{age}</td>
                                                                        <td>{item.motivo_consulta || item.sintomas || 'S/M'}</td>
                                                                        <td>{item.diagnostico || item.cie10 || 'N/A'}</td>
                                                                        <td>
                                                                            <span className={`evolution-badge evolution-badge--${item.tipo_atencion === 'primaria' ? 'medicina' : item.tipo_atencion === 'secundaria' ? 'psicologia' : 'odontologia'}`}>
                                                                                {item.tipo_atencion || 'Primaria'}
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

                                {/* SUB-TAB 2: INFORME ESTADÍSTICO MENSUAL */}
                                {activeReportSubTab === 'mensual' && (
                                    <div>
                                        <section className="nurse-card daily-header-card" style={{ marginBottom: '20px' }}>
                                            <div className="daily-date-control" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '15px' }}>
                                                <div>
                                                    <span className="eyebrow">MATRIZ ESTADÍSTICA OFICIAL</span>
                                                    <h3>Informe Estadístico Mensual de Medicina General</h3>
                                                    <p>Matriz oficial de atenciones clasificadas por carrera, facultad, tipo de usuario y género.</p>
                                                </div>
                                                <div className="date-navigation" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <CalendarDays size={16} color="var(--accent)" />
                                                        <input
                                                            type="month"
                                                            value={reportMensualFecha}
                                                            onChange={(e) => setReportMensualFecha(e.target.value)}
                                                            style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px', fontSize: '11px', outline: 0 }}
                                                        />
                                                    </label>
                                                    <button
                                                        onClick={handlePrintGeneralReport}
                                                        className="action-button action-button--accent"
                                                        disabled={genReportLoading || !genReportData}
                                                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                                    >
                                                        <Printer size={14} /> Imprimir Matriz Oficial
                                                    </button>
                                                </div>
                                            </div>
                                        </section>

                                        {/* VISTA PREVIA DE LA MATRIZ */}
                                        <div className="card" style={{ padding: '20px', borderRadius: '16px', overflowX: 'auto' }}>
                                            {genReportLoading ? (
                                                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                                                    Compilando estadísticas mensuales...
                                                </div>
                                            ) : !genReportData ? (
                                                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                                                    No se pudieron obtener los datos del periodo seleccionado.
                                                </div>
                                            ) : (
                                                <div style={{ width: '100%', minWidth: '750px' }}>
                                                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                                                        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>UNIVERSIDAD ESTATAL DE BOLÍVAR</h3>
                                                        <h4 style={{ margin: '2px 0', fontSize: '13px', color: '#475569' }}>DEPARTAMENTO DE BIENESTAR UNIVERSITARIO</h4>
                                                        <h5 style={{ margin: '2px 0', fontSize: '12px', color: '#b71a34', fontWeight: '800' }}>INFORME ESTADÍSTICO MENSUAL DE MEDICINA GENERAL</h5>
                                                    </div>

                                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', border: '1.5px solid #000' }}>
                                                        <thead>
                                                            <tr style={{ background: '#f1f5f9' }}>
                                                                <th colSpan="3" style={{ border: '1px solid #000', padding: '6px' }}>FACULTAD Y CARRERA / USUARIOS</th>
                                                                <th style={{ border: '1px solid #000', padding: '6px', width: '70px', textAlign: 'center' }}>HOMBRES</th>
                                                                <th style={{ border: '1px solid #000', padding: '6px', width: '70px', textAlign: 'center' }}>MUJERES</th>
                                                                <th style={{ border: '1px solid #000', padding: '6px', width: '70px', textAlign: 'center' }}>LGBTI</th>
                                                                <th style={{ border: '1px solid #000', padding: '6px', width: '80px', textAlign: 'center' }}>TOTAL</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {genReportData.reportingFaculties.map(fac => {
                                                                const careers = genReportData.statsByFacultyAndCareer[fac] || {};
                                                                const careerNames = Object.keys(careers);
                                                                return careerNames.map((cName, cIdx) => {
                                                                    const stats = careers[cName];
                                                                    return (
                                                                        <tr key={`${fac}-${cName}`}>
                                                                            {cIdx === 0 && (
                                                                                <td rowSpan={careerNames.length} style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold', background: '#f8fafc', verticalAlign: 'middle' }}>
                                                                                    {fac}
                                                                                </td>
                                                                            )}
                                                                            <td style={{ border: '1px solid #000', padding: '6px' }}>{cName}</td>
                                                                            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>Estudiante</td>
                                                                            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{stats.hombres}</td>
                                                                            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{stats.mujeres}</td>
                                                                            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{stats.lgbti}</td>
                                                                            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 'bold', background: '#f1f5f9' }}>{stats.total}</td>
                                                                        </tr>
                                                                    );
                                                                });
                                                            })}
                                                            <tr style={{ background: '#e2e8f0', fontWeight: 'bold' }}>
                                                                <td colSpan="3" style={{ border: '1px solid #000', padding: '6px' }}>TOTAL ESTUDIANTES</td>
                                                                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{genReportData.genderCounts.estudiantes.hombres}</td>
                                                                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{genReportData.genderCounts.estudiantes.mujeres}</td>
                                                                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{genReportData.genderCounts.estudiantes.lgbti}</td>
                                                                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', background: '#cbd5e1' }}>{genReportData.totalEstudiantes}</td>
                                                            </tr>
                                                            <tr style={{ background: '#e2e8f0', fontWeight: 'bold' }}>
                                                                <td colSpan="3" style={{ border: '1px solid #000', padding: '6px' }}>TOTAL ADMINISTRATIVOS</td>
                                                                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{genReportData.genderCounts.administrativos.hombres}</td>
                                                                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{genReportData.genderCounts.administrativos.mujeres}</td>
                                                                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{genReportData.genderCounts.administrativos.lgbti}</td>
                                                                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', background: '#cbd5e1' }}>{genReportData.totalAdministrativos}</td>
                                                            </tr>
                                                            <tr style={{ background: '#e2e8f0', fontWeight: 'bold' }}>
                                                                <td colSpan="3" style={{ border: '1px solid #000', padding: '6px' }}>TOTAL DOCENTES</td>
                                                                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{genReportData.genderCounts.docentes.hombres}</td>
                                                                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{genReportData.genderCounts.docentes.mujeres}</td>
                                                                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{genReportData.genderCounts.docentes.lgbti}</td>
                                                                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', background: '#cbd5e1' }}>{genReportData.totalDocentes}</td>
                                                            </tr>
                                                            <tr style={{ background: '#0f172a', color: '#fff', fontWeight: 'bold' }}>
                                                                <td colSpan="3" style={{ border: '1px solid #000', padding: '7px' }}>TOTAL ATENCIONES GENERALES</td>
                                                                <td style={{ border: '1px solid #000', padding: '7px', textAlign: 'center' }}>
                                                                    {genReportData.genderCounts.estudiantes.hombres + genReportData.genderCounts.administrativos.hombres + genReportData.genderCounts.docentes.hombres}
                                                                </td>
                                                                <td style={{ border: '1px solid #000', padding: '7px', textAlign: 'center' }}>
                                                                    {genReportData.genderCounts.estudiantes.mujeres + genReportData.genderCounts.administrativos.mujeres + genReportData.genderCounts.docentes.mujeres}
                                                                </td>
                                                                <td style={{ border: '1px solid #000', padding: '7px', textAlign: 'center' }}>
                                                                    {genReportData.genderCounts.estudiantes.lgbti + genReportData.genderCounts.administrativos.lgbti + genReportData.genderCounts.docentes.lgbti}
                                                                </td>
                                                                <td style={{ border: '1px solid #000', padding: '7px', textAlign: 'center' }}>
                                                                    {genReportData.totalPacientes}
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* PESTAÑA 5: GESTIÓN DE CITAS */}
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
                                                        const pIdent = cita.paciente?.datos_identificacion || cita.paciente?.datosIdentificacion;
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
                                                                        {['programada', 'confirmada'].includes(cita.estado) ? (
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
                                                                        ) : (
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
                                                                                className="action-button action-button--light"
                                                                                style={{ fontSize: '11px', minHeight: '30px', padding: '0 10px', borderRadius: '6px' }}
                                                                            >
                                                                                Ver Paciente
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

                        {/* PESTAÑA 6: FARMACIA - INVENTARIO */}
                        {activeTab === 'farmacia-inventario' && (
                            <FarmaciaInventarioTab showSystemToast={showSystemToast} />
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
                                    <div key={idx} className="patient-suggestion" style={{ gridTemplateColumns: 'auto 1fr auto', display: 'grid' }}>
                                        <div className="patient-suggestion__avatar">
                                            {(pat.nombre_completo || pat.name || '').split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                        </div>
                                        <div className="patient-suggestion__identity">
                                            <strong>{pat.nombre_completo || pat.name || 'Sin nombre'}</strong>
                                            <small>Cédula: {pat.cedula || pat.numero_cedula} · Correo: {pat.email || 'N/D'}</small>
                                        </div>
                                        <button className="action-button action-button--primary" onClick={() => handleSelectPatient(pat)}>
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
                                            <h4 className="field-header__title">Nombres y Apellidos Completos</h4>
                                        </div>
                                        <span className="field-badge-req">Requerido</span>
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
                                                <h4 className="field-header__title">Tipo de Documento</h4>
                                            </div>
                                            <span className="field-badge-req">Requerido</span>
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
                                                    {newPatientForm.tipo_documento === 'pasaporte' ? 'Número de Pasaporte' : 'Número de Cédula'}
                                                </h4>
                                            </div>
                                            <span className="field-badge-req">Requerido</span>
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
                                                <h4 className="field-header__title">Tipo de Paciente</h4>
                                            </div>
                                            <span className="field-badge-req">Requerido</span>
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
                                                    <h4 className="field-header__title">País de Origen</h4>
                                                </div>
                                                <span className="field-badge-req">Requerido</span>
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
                                            <h4 className="field-header__title">Correo Electrónico Institucional</h4>
                                        </div>
                                        <span className="field-badge-req">Requerido</span>
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

            {/* MODAL GLOBAL: VALORACIÓN CLÍNICA (Anamnesis) */}
            {isFichaModalOpen && (
                <div className="clinical-modal show">
                    <div className="clinical-modal__backdrop" onClick={handleCancelFicha}></div>
                    <section className="clinical-modal__dialog">
                        <header className="clinical-modal__header">
                            <div className="clinical-modal__patient">
                                <span className="clinical-modal__avatar">MG</span>
                                <div>
                                    <span>Expediente Clínico General</span>
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
                                <div style={{ textAlign: 'center', padding: '40px' }}>Cargando expediente clínico...</div>
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
                                                <div>
                                                    <h3 style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><HeartPulse size={16} /> 1. Registro de Signos Vitales</h3>
                                                    <div className="clinical-fields-grid">
                                                        <label className="field">
                                                            <span>PA Sistólica (mmHg)</span>
                                                            <input type="number" step="0.1" value={fichaForm.presion_arterial_sistolica} onChange={(e) => setFichaForm({ ...fichaForm, presion_arterial_sistolica: e.target.value })} placeholder="Ej: 120" />
                                                        </label>
                                                        <label className="field">
                                                            <span>PA Diastólica (mmHg)</span>
                                                            <input type="number" step="0.1" value={fichaForm.presion_arterial_diastolica} onChange={(e) => setFichaForm({ ...fichaForm, presion_arterial_diastolica: e.target.value })} placeholder="Ej: 80" />
                                                        </label>
                                                        <label className="field">
                                                            <span>Frecuencia Cardiaca (lpm)</span>
                                                            <input type="number" value={fichaForm.frecuencia_cardiaca} onChange={(e) => setFichaForm({ ...fichaForm, frecuencia_cardiaca: e.target.value })} placeholder="Ej: 75" />
                                                        </label>
                                                        <label className="field">
                                                            <span>Frecuencia Respiratoria (rpm)</span>
                                                            <input type="number" value={fichaForm.frecuencia_respiratoria} onChange={(e) => setFichaForm({ ...fichaForm, frecuencia_respiratoria: e.target.value })} placeholder="Ej: 18" />
                                                        </label>
                                                        <label className="field">
                                                            <span>Temperatura (°C)</span>
                                                            <input type="number" step="0.1" value={fichaForm.temperatura} onChange={(e) => setFichaForm({ ...fichaForm, temperatura: e.target.value })} placeholder="Ej: 36.5" />
                                                        </label>
                                                        <label className="field">
                                                            <span>Talla (cm)</span>
                                                            <input type="number" step="0.1" value={fichaForm.talla} onChange={(e) => setFichaForm({ ...fichaForm, talla: e.target.value })} placeholder="Ej: 170" />
                                                        </label>
                                                        <label className="field">
                                                            <span>Peso (kg)</span>
                                                            <input type="number" step="0.1" value={fichaForm.peso} onChange={(e) => setFichaForm({ ...fichaForm, peso: e.target.value })} placeholder="Ej: 70" />
                                                        </label>
                                                        <div className="premium-field-card" style={{ gridColumn: 'span 2', marginTop: '8px', padding: '14px', border: '1px solid rgba(0,32,64,0.08)' }}>
                                                            <div className="field-header" style={{ marginBottom: '8px' }}>
                                                                <div className="field-header__left" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                    <span className="field-header__icon"><ShieldAlert size={14} color="var(--accent)" /></span>
                                                                    <h4 className="field-header__title" style={{ margin: 0, fontSize: '12px', fontWeight: 'bold' }}>Tipo de Sangre</h4>
                                                                </div>
                                                                <span className="field-badge-opt" style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Opcional</span>
                                                            </div>
                                                            <select
                                                                value={fichaForm.id_tipo_sangre || ''}
                                                                onChange={(e) => setFichaForm({ ...fichaForm, id_tipo_sangre: e.target.value })}
                                                                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1.5px solid var(--border)' }}
                                                            >
                                                                <option value="">Seleccionar tipo de sangre...</option>
                                                                <option value="1">A+</option>
                                                                <option value="2">A-</option>
                                                                <option value="3">B+</option>
                                                                <option value="4">B-</option>
                                                                <option value="5">AB+</option>
                                                                <option value="6">AB-</option>
                                                                <option value="7">O+</option>
                                                                <option value="8">O-</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {currentStepIndex === 1 && (
                                                <div>
                                                    <h3 style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={16} /> 2. Motivo de Consulta y Enfermedad Actual</h3>
                                                    <div className="field field--full">
                                                        <span>Motivo de Consulta *</span>
                                                        <textarea
                                                            value={fichaForm.detalle_motivo}
                                                            onChange={(e) => setFichaForm({ ...fichaForm, detalle_motivo: e.target.value })}
                                                            placeholder="Describa el motivo de ingreso del paciente..."
                                                            rows={2}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="field field--full" style={{ marginTop: '12px' }}>
                                                        <span>Historia de la Enfermedad Actual *</span>
                                                        <textarea
                                                            value={fichaForm.detalle_enfermedad_actual}
                                                            onChange={(e) => setFichaForm({ ...fichaForm, detalle_enfermedad_actual: e.target.value })}
                                                            placeholder="Cronología y sintomatología reportada..."
                                                            rows={3}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {currentStepIndex === 2 && (
                                                <div>
                                                    <h3 style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Shield size={16} /> 3. Antecedentes Personales y Familiares</h3>
                                                    <div className="field field--full">
                                                        <span>Antecedentes Personales (Patológicos, Quirúrgicos, Alergias, etc.)</span>
                                                        <textarea
                                                            value={fichaForm.detalle_antecedente_personal}
                                                            onChange={(e) => setFichaForm({ ...fichaForm, detalle_antecedente_personal: e.target.value })}
                                                            placeholder="Describa alergias, cirugías previas, patologías de importancia..."
                                                            rows={2}
                                                        />
                                                    </div>
                                                    <div className="field field--full" style={{ marginTop: '16px' }}>
                                                        <span>Antecedentes Familiares (Diabetes, Hipertensión, Cáncer, etc.)</span>
                                                        <textarea
                                                            value={fichaForm.detalle_antecedente_familiar}
                                                            onChange={(e) => setFichaForm({ ...fichaForm, detalle_antecedente_familiar: e.target.value })}
                                                            placeholder="Describa patologías crónicas presentes en familiares directos..."
                                                            rows={2}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {currentStepIndex === 3 && (
                                                <div>
                                                    <h3 style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={16} /> 4. Revisión de Órganos y Sistemas</h3>
                                                    <div className="field field--full">
                                                        <span>Hallazgos de la Revisión *</span>
                                                        <textarea
                                                            value={fichaForm.detalle_revision_organos}
                                                            onChange={(e) => setFichaForm({ ...fichaForm, detalle_revision_organos: e.target.value })}
                                                            placeholder="Detalle alteraciones en sistemas (Respiratorio, Digestivo, Cardio, etc.)..."
                                                            rows={3}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {currentStepIndex === 4 && (
                                                <div>
                                                    <h3 style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Stethoscope size={16} /> 5. Examen Físico Regional</h3>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px', alignItems: 'start' }}>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                            <div className="field field--full" style={{ margin: 0 }}>
                                                                <span>Descripción del Examen Físico *</span>
                                                                <textarea
                                                                    value={fichaForm.detalle_examen_fisico}
                                                                    onChange={(e) => setFichaForm({ ...fichaForm, detalle_examen_fisico: e.target.value })}
                                                                    placeholder="Detalle exploración física (Cabeza, Cuello, Tórax, Abdomen)..."
                                                                    rows={6}
                                                                    required
                                                                    style={{ minHeight: '130px' }}
                                                                />
                                                            </div>
                                                            {fichaForm.altura_x !== null && (
                                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '11px' }}>
                                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text)' }}>
                                                                        <MapPin size={14} style={{ color: 'var(--primary)' }} /> <strong>Región de Referencia:</strong> {getAnatomicalRegion(fichaForm.altura_x, fichaForm.altura_y)} (Coordenadas: {fichaForm.altura_x}%, {fichaForm.altura_y}%)
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setFichaForm(prev => ({ ...prev, altura_x: null, altura_y: null }))}
                                                                        style={{ color: '#b71a34', background: 'none', border: 0, fontWeight: 'bold', cursor: 'pointer', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                                                                    >
                                                                        [Remover Ubicación]
                                                                    </button>
                                                                </div>
                                                            )}
                                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                                <Info size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} /> Seleccione un punto sobre el esquema corporal (frontal/dorsal) para asociarlo al hallazgo clínico.
                                                            </span>
                                                        </div>

                                                        {/* Muñeco Anatómico Interactivo */}
                                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                                            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--primary)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Esquema Corporal Referencial</span>
                                                            <svg
                                                                viewBox="0 0 200 230"
                                                                onClick={(e) => {
                                                                    const svg = e.currentTarget;
                                                                    const pt = svg.createSVGPoint();
                                                                    pt.x = e.clientX;
                                                                    pt.y = e.clientY;
                                                                    const svgPoint = pt.matrixTransform(svg.getScreenCTM().inverse());

                                                                    const x = Math.max(0, Math.min(100, Math.round((svgPoint.x / 200) * 100)));
                                                                    const y = Math.max(0, Math.min(100, Math.round((svgPoint.y / 230) * 100)));

                                                                    const regionName = getAnatomicalRegion(x, y);
                                                                    setFichaForm(prev => {
                                                                        const oldRegion = prev.altura_x !== null
                                                                            ? getAnatomicalRegion(prev.altura_x, prev.altura_y)
                                                                            : null;
                                                                        const rawDesc = prev.detalle_examen_fisico || '';
                                                                        const currentDesc = rawDesc.trim();
                                                                        let newDesc;
                                                                        console.log("SVG CLICKED:", { x, y, regionName, oldRegion, rawDesc, currentDesc });

                                                                        const oldRegionTrimmed = oldRegion ? oldRegion.trim() : '';

                                                                        if (currentDesc === '' || currentDesc === '-' || currentDesc === 'Ninguno') {
                                                                            newDesc = `${regionName} - `;
                                                                            console.log("Matched branch 1 (empty):", newDesc);
                                                                        } else if (oldRegionTrimmed && currentDesc.startsWith(`${oldRegionTrimmed} -`)) {
                                                                            const remainingText = currentDesc.slice(`${oldRegionTrimmed} -`.length).trim();
                                                                            newDesc = `${regionName} - ${remainingText}`;
                                                                            if (!remainingText) newDesc += ' ';
                                                                            console.log("Matched branch 2 (starts with oldRegion + ' -'):", newDesc);
                                                                        } else if (oldRegionTrimmed && currentDesc.startsWith(oldRegionTrimmed)) {
                                                                            const remainingText = currentDesc.slice(oldRegionTrimmed.length).trim();
                                                                            newDesc = `${regionName} ${remainingText}`;
                                                                            if (!remainingText) newDesc += ' ';
                                                                            console.log("Matched branch 3 (starts with oldRegion):", newDesc);
                                                                        } else {
                                                                            newDesc = rawDesc;
                                                                            console.log("Matched branch 4 (else - manual edit):", newDesc);
                                                                        }
                                                                        return {
                                                                            ...prev,
                                                                            altura_x: x,
                                                                            altura_y: y,
                                                                            detalle_examen_fisico: newDesc
                                                                        };
                                                                    });
                                                                }}
                                                                style={{
                                                                    width: '100%',
                                                                    height: '280px',
                                                                    background: 'linear-gradient(135deg,#f0f4ff,#e8f0fe)',
                                                                    borderRadius: '14px',
                                                                    border: '1px solid var(--border)',
                                                                    cursor: 'crosshair',
                                                                    userSelect: 'none'
                                                                }}
                                                            >
                                                                {/* ---- FRONT HUMAN SILHOUETTE (x≈50 center) ---- */}
                                                                <g id="front">
                                                                    {/* Head */}
                                                                    <ellipse cx="60" cy="30" rx="14" ry="17" fill="#dde3f0" stroke="#94a3b8" strokeWidth="1.2" />
                                                                    {/* Neck */}
                                                                    <rect x="55" y="46" width="10" height="10" rx="2" fill="#dde3f0" stroke="#94a3b8" strokeWidth="1" />
                                                                    {/* Torso */}
                                                                    <path d="M42,56 Q40,100 44,130 L76,130 Q80,100 78,56 Z" fill="#dde3f0" stroke="#94a3b8" strokeWidth="1.2" />
                                                                    {/* Left arm */}
                                                                    <path d="M42,58 Q32,65 26,80 Q22,95 24,115 Q28,118 32,116 Q34,98 38,84 Q42,72 46,62 Z" fill="#dde3f0" stroke="#94a3b8" strokeWidth="1.1" />
                                                                    {/* Right arm */}
                                                                    <path d="M78,58 Q88,65 94,80 Q98,95 96,115 Q92,118 88,116 Q86,98 82,84 Q78,72 74,62 Z" fill="#dde3f0" stroke="#94a3b8" strokeWidth="1.1" />
                                                                    {/* Left hand */}
                                                                    <ellipse cx="28" cy="120" rx="5" ry="7" fill="#dde3f0" stroke="#94a3b8" strokeWidth="1" />
                                                                    {/* Right hand */}
                                                                    <ellipse cx="92" cy="120" rx="5" ry="7" fill="#dde3f0" stroke="#94a3b8" strokeWidth="1" />
                                                                    {/* Left leg */}
                                                                    <path d="M44,130 Q40,165 38,200 Q42,202 50,202 Q52,168 55,135 Z" fill="#dde3f0" stroke="#94a3b8" strokeWidth="1.1" />
                                                                    {/* Right leg */}
                                                                    <path d="M76,130 Q80,165 82,200 Q78,202 70,202 Q68,168 65,135 Z" fill="#dde3f0" stroke="#94a3b8" strokeWidth="1.1" />
                                                                    {/* Left foot */}
                                                                    <ellipse cx="44" cy="205" rx="8" ry="5" fill="#dde3f0" stroke="#94a3b8" strokeWidth="1" />
                                                                    {/* Right foot */}
                                                                    <ellipse cx="76" cy="205" rx="8" ry="5" fill="#dde3f0" stroke="#94a3b8" strokeWidth="1" />
                                                                    <text x="60" y="225" textAnchor="middle" style={{ fontSize: '8px', fill: '#64748b', fontWeight: '700', letterSpacing: '1px' }}>FRENTE</text>
                                                                </g>

                                                                {/* ---- BACK HUMAN SILHOUETTE (x≈150 center) ---- */}
                                                                <g id="back">
                                                                    {/* Head */}
                                                                    <ellipse cx="150" cy="30" rx="14" ry="17" fill="#c8d0e8" stroke="#7e8eb5" strokeWidth="1.2" />
                                                                    {/* Neck */}
                                                                    <rect x="145" y="46" width="10" height="10" rx="2" fill="#c8d0e8" stroke="#7e8eb5" strokeWidth="1" />
                                                                    {/* Torso */}
                                                                    <path d="M132,56 Q130,100 134,130 L166,130 Q170,100 168,56 Z" fill="#c8d0e8" stroke="#7e8eb5" strokeWidth="1.2" />
                                                                    {/* Left arm */}
                                                                    <path d="M132,58 Q122,65 116,80 Q112,95 114,115 Q118,118 122,116 Q124,98 128,84 Q132,72 136,62 Z" fill="#c8d0e8" stroke="#7e8eb5" strokeWidth="1.1" />
                                                                    {/* Right arm */}
                                                                    <path d="M168,58 Q178,65 184,80 Q188,95 186,115 Q182,118 178,116 Q176,98 172,84 Q168,72 164,62 Z" fill="#c8d0e8" stroke="#7e8eb5" strokeWidth="1.1" />
                                                                    {/* Left hand */}
                                                                    <ellipse cx="118" cy="120" rx="5" ry="7" fill="#c8d0e8" stroke="#7e8eb5" strokeWidth="1" />
                                                                    {/* Right hand */}
                                                                    <ellipse cx="182" cy="120" rx="5" ry="7" fill="#c8d0e8" stroke="#7e8eb5" strokeWidth="1" />
                                                                    {/* Left leg */}
                                                                    <path d="M134,130 Q130,165 128,200 Q132,202 140,202 Q142,168 145,135 Z" fill="#c8d0e8" stroke="#7e8eb5" strokeWidth="1.1" />
                                                                    {/* Right leg */}
                                                                    <path d="M166,130 Q170,165 172,200 Q168,202 160,202 Q158,168 155,135 Z" fill="#c8d0e8" stroke="#7e8eb5" strokeWidth="1.1" />
                                                                    {/* Left foot */}
                                                                    <ellipse cx="134" cy="205" rx="8" ry="5" fill="#c8d0e8" stroke="#7e8eb5" strokeWidth="1" />
                                                                    {/* Right foot */}
                                                                    <ellipse cx="166" cy="205" rx="8" ry="5" fill="#c8d0e8" stroke="#7e8eb5" strokeWidth="1" />
                                                                    <text x="150" y="225" textAnchor="middle" style={{ fontSize: '8px', fill: '#475569', fontWeight: '700', letterSpacing: '1px' }}>ESPALDA</text>
                                                                </g>

                                                                {/* ---- PIN MARKER ---- */}
                                                                {fichaForm.altura_x !== null && fichaForm.altura_y !== null && (
                                                                    <g>
                                                                        <circle
                                                                            cx={(fichaForm.altura_x / 100) * 200}
                                                                            cy={(fichaForm.altura_y / 100) * 230}
                                                                            r="10"
                                                                            fill="rgba(183, 26, 52, 0.35)"
                                                                        >
                                                                            <animate attributeName="r" values="6;14;6" dur="1.5s" repeatCount="indefinite" />
                                                                            <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.5s" repeatCount="indefinite" />
                                                                        </circle>
                                                                        <circle
                                                                            cx={(fichaForm.altura_x / 100) * 200}
                                                                            cy={(fichaForm.altura_y / 100) * 230}
                                                                            r="4"
                                                                            fill="#b71a34"
                                                                            stroke="white"
                                                                            strokeWidth="1.5"
                                                                        />
                                                                    </g>
                                                                )}
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {currentStepIndex === 5 && (
                                                <div>
                                                    <h3 style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><ClipboardList size={16} /> 6. Diagnóstico, Plan Terapéutico y Diario</h3>
                                                    <div className="clinical-fields-grid" style={{ gridTemplateColumns: '1.2fr 0.8fr', alignItems: 'end', gap: '20px' }}>
                                                        <label className="field" style={{ margin: 0 }}>
                                                            <span>CIE-10 / Diagnóstico Principal *</span>
                                                            <input type="text" value={fichaForm.cie10} onChange={(e) => setFichaForm({ ...fichaForm, cie10: e.target.value })} placeholder="Ej: J18 - Neumonía..." required />
                                                        </label>
                                                        <div style={{ display: 'flex', gap: '24px', paddingBottom: '12px' }}>
                                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: '600', color: '#334155', cursor: 'pointer', margin: 0 }}>
                                                                <input
                                                                    type="radio"
                                                                    name="tipo_diagnostico"
                                                                    checked={fichaForm.presuntivo}
                                                                    onChange={() => setFichaForm({ ...fichaForm, presuntivo: true, definitivo: false })}
                                                                    style={{ width: '16px', height: '16px', accentColor: 'var(--accent, #b71a34)' }}
                                                                />
                                                                <span>Presuntivo</span>
                                                            </label>
                                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: '600', color: '#334155', cursor: 'pointer', margin: 0 }}>
                                                                <input
                                                                    type="radio"
                                                                    name="tipo_diagnostico"
                                                                    checked={fichaForm.definitivo}
                                                                    onChange={() => setFichaForm({ ...fichaForm, definitivo: true, presuntivo: false })}
                                                                    style={{ width: '16px', height: '16px', accentColor: 'var(--accent, #b71a34)' }}
                                                                />
                                                                <span>Definitivo</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="field field--full" style={{ marginTop: '12px' }}>
                                                        <span>Descripción Diagnóstica *</span>
                                                        <textarea
                                                            value={fichaForm.detalle_diagnostico}
                                                            onChange={(e) => setFichaForm({ ...fichaForm, detalle_diagnostico: e.target.value })}
                                                            placeholder="Detalle clínico del diagnóstico..."
                                                            rows={2}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="field field--full" style={{ marginTop: '12px' }}>
                                                        <span>Plan Terapéutico / Tratamiento Indicado *</span>
                                                        <textarea
                                                            value={fichaForm.detalle_plan_terapeutico}
                                                            onChange={(e) => setFichaForm({ ...fichaForm, detalle_plan_terapeutico: e.target.value })}
                                                            placeholder="Medicamentos indicados, dosis y frecuencia..."
                                                            rows={3}
                                                            required
                                                        />
                                                    </div>

                                                    <div className="clinical-form-section" style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                                                        <div className="clinical-fields-grid">
                                                            <div className="field">
                                                                <span>Tipo de Atención *</span>
                                                                <select value={fichaForm.tipo_atencion} onChange={(e) => setFichaForm({ ...fichaForm, tipo_atencion: e.target.value })}>
                                                                    <option value="primaria">Primaria (Consulta Inicial)</option>
                                                                    <option value="secundaria">Secundaria (Seguimiento)</option>
                                                                </select>
                                                            </div>
                                                            <div className="field">
                                                                <span>Clasificación de Consulta *</span>
                                                                <select value={fichaForm.tipo} onChange={(e) => setFichaForm({ ...fichaForm, tipo: e.target.value })}>
                                                                    <option value="curativo">Curativo</option>
                                                                    <option value="preventivo">Preventivo</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {steps[currentStepIndex].key === 'prescripcion' && (
                                                <div className="clinical-form-section">
                                                    <div className="clinical-form-section__title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--primary-soft, #eff6ff)', color: 'var(--primary, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <Pill size={22} />
                                                            </div>
                                                            <div>
                                                                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Punto 7: Prescripción Médica / Receta</h3>
                                                                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Conéctese al inventario de Farmacia para prescribir y generar orden de despacho.</p>
                                                            </div>
                                                        </div>
                                                        <span style={{ fontSize: '12px', background: '#dbeafe', color: '#1e40af', padding: '6px 12px', borderRadius: '16px', fontWeight: '700', border: '1px solid #bfdbfe' }}>
                                                            ✓ Despacho Automático en Farmacia
                                                        </span>
                                                    </div>

                                                    {/* BUSCADOR DE PRODUCTOS DE FARMACIA */}
                                                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                                                        <label style={{ fontSize: '12.5px', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>
                                                            🔍 Buscar Medicamento en Catálogo de Farmacia
                                                        </label>
                                                        <div style={{ position: 'relative' }}>
                                                            <input
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
                                                        <div className="clinical-fields-grid" style={{ gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
                                                            <div className="field" style={{ margin: 0 }}>
                                                                <span>Medicamento Prescrito *</span>
                                                                <input
                                                                    type="text"
                                                                    value={prescripcionLineForm.detalle_medicamento}
                                                                    onChange={(e) => setPrescripcionLineForm({ ...prescripcionLineForm, detalle_medicamento: e.target.value })}
                                                                    placeholder="Ej: Paracetamol 500mg Tabletas"
                                                                />
                                                            </div>
                                                            <div className="field" style={{ margin: 0 }}>
                                                                <span>Dosis Indicada</span>
                                                                <input
                                                                    type="text"
                                                                    value={prescripcionLineForm.detalle_dosis}
                                                                    onChange={(e) => setPrescripcionLineForm({ ...prescripcionLineForm, detalle_dosis: e.target.value })}
                                                                    placeholder="Ej: 1 tableta"
                                                                />
                                                            </div>
                                                            <div className="field" style={{ margin: 0 }}>
                                                                <span>Vía de Administración</span>
                                                                <select
                                                                    value={prescripcionLineForm.detalle_via_administracion}
                                                                    onChange={(e) => setPrescripcionLineForm({ ...prescripcionLineForm, detalle_via_administracion: e.target.value })}
                                                                >
                                                                    <option value="Oral">Oral</option>
                                                                    <option value="Intravenosa">Intravenosa</option>
                                                                    <option value="Intramuscular">Intramuscular</option>
                                                                    <option value="Tópica">Tópica</option>
                                                                    <option value="Oftálmica">Oftálmica</option>
                                                                    <option value="Sublingual">Sublingual</option>
                                                                    <option value="Inhalatoria">Inhalatoria</option>
                                                                </select>
                                                            </div>
                                                        </div>

                                                        <div className="clinical-fields-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginTop: '12px' }}>
                                                            <div className="field" style={{ margin: 0 }}>
                                                                <span>Frecuencia (Horas)</span>
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    value={prescripcionLineForm.frecuencia_horas}
                                                                    onChange={(e) => setPrescripcionLineForm({ ...prescripcionLineForm, frecuencia_horas: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="field" style={{ margin: 0 }}>
                                                                <span>Duración (Días)</span>
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    value={prescripcionLineForm.duracion_tratamiento_dias}
                                                                    onChange={(e) => setPrescripcionLineForm({ ...prescripcionLineForm, duracion_tratamiento_dias: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="field" style={{ margin: 0 }}>
                                                                <span>Cant. Cajas</span>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    value={prescripcionLineForm.cantidad_cajas}
                                                                    onChange={(e) => setPrescripcionLineForm({ ...prescripcionLineForm, cantidad_cajas: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="field" style={{ margin: 0 }}>
                                                                <span>Cant. Unidades</span>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    value={prescripcionLineForm.cantidad_unidades}
                                                                    onChange={(e) => setPrescripcionLineForm({ ...prescripcionLineForm, cantidad_unidades: e.target.value })}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div style={{ marginTop: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                            <div style={{ flex: 1 }}>
                                                                <input
                                                                    type="text"
                                                                    value={prescripcionLineForm.observaciones}
                                                                    onChange={(e) => setPrescripcionLineForm({ ...prescripcionLineForm, observaciones: e.target.value })}
                                                                    placeholder="Observaciones / Indicaciones especiales..."
                                                                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                                                                />
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={handleAddPrescripcionLine}
                                                                style={{ background: 'var(--primary)', color: '#ffffff', border: 'none', padding: '9px 16px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                                                            >
                                                                <Plus size={15} /> Agregar a la Receta
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* TABLA DE RECETA ACTUAL */}
                                                    <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                                                        <div style={{ background: '#f8fafc', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <strong style={{ fontSize: '13px', color: '#0f172a' }}>📋 Medicamentos en la Receta</strong>
                                                            <span style={{ fontSize: '12px', color: '#64748b', background: '#e2e8f0', padding: '2px 8px', borderRadius: '10px' }}>
                                                                {(fichaForm.prescripcion_lineas || []).length} ítem(s)
                                                            </span>
                                                        </div>

                                                        {(!fichaForm.prescripcion_lineas || fichaForm.prescripcion_lineas.length === 0) ? (
                                                            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                                                                No hay medicamentos agregados a la receta aún. Use el formulario superior para añadir fármacos.
                                                            </div>
                                                        ) : (
                                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                                                                <thead style={{ background: '#f1f5f9', color: '#475569', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase' }}>
                                                                    <tr>
                                                                        <th style={{ padding: '10px 14px' }}>Medicamento</th>
                                                                        <th style={{ padding: '10px 14px' }}>Dosis & Vía</th>
                                                                        <th style={{ padding: '10px 14px', textAlign: 'center' }}>Frecuencia / Duración</th>
                                                                        <th style={{ padding: '10px 14px', textAlign: 'center' }}>Cantidad Solicitada</th>
                                                                        <th style={{ padding: '10px 14px', textAlign: 'center' }}>Acción</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {(fichaForm.prescripcion_lineas || []).map((item) => (
                                                                        <tr key={item.id_temp} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                                            <td style={{ padding: '10px 14px', fontWeight: '600', color: '#0f172a' }}>
                                                                                {item.detalle_medicamento}
                                                                                {item.id_producto_farmacia && (
                                                                                    <span style={{ display: 'block', fontSize: '10.5px', color: '#0284c7', fontWeight: '700' }}>✓ Vinculado a Inventario Farmacia</span>
                                                                                )}
                                                                            </td>
                                                                            <td style={{ padding: '10px 14px', color: '#475569' }}>
                                                                                {item.detalle_dosis} ({item.detalle_via_administracion})
                                                                            </td>
                                                                            <td style={{ padding: '10px 14px', textAlign: 'center', color: '#475569' }}>
                                                                                Cada {item.frecuencia_horas}h por {item.duracion_tratamiento_dias} días
                                                                            </td>
                                                                            <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: '600', color: '#1e293b' }}>
                                                                                {item.cantidad_cajas} cj / {item.cantidad_unidades} ud
                                                                            </td>
                                                                            <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleRemovePrescripcionLine(item.id_temp)}
                                                                                    style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                                                                >
                                                                                    <Trash2 size={13} /> Eliminar
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {steps[currentStepIndex].key === 'histograma' && (
                                                <div className="clinical-form-section">
                                                    <div className="clinical-form-section__title" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--primary-soft, #eff6ff)', color: 'var(--primary, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <BarChart3 size={22} />
                                                        </div>
                                                        <div>
                                                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Punto 8: Histograma y Análisis de Signos Vitales</h3>
                                                            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Filtra y visualiza la distribución de frecuencia gráfica del paciente.</p>
                                                        </div>
                                                    </div>
                                                    <VitalSignsHistogram patient={selectedPatient} isInline={true} />
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

            {/* TOAST DE SISTEMA */}
            <div className={`toast ${toast.show ? 'show' : ''}`}>
                <CheckCircle size={16} /> <span>{toast.message}</span>
            </div>

            {/* MODAL DE FEEDBACK */}
            {saveFeedback.show && (
                <div style={{
                    position: 'fixed',
                    bottom: '28px',
                    right: '28px',
                    zIndex: 99999,
                    maxWidth: '340px',
                    width: '100%',
                    background: saveFeedback.success ? 'var(--primary)' : '#b71a34',
                    color: '#fff',
                    borderRadius: '14px',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 8px 32px rgba(0,20,64,0.28)',
                    animation: 'slideInRight 0.3s ease'
                }}>
                    <span style={{ flexShrink: 0 }}>
                        {saveFeedback.success ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                    </span>
                    <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: '12px', fontWeight: '700' }}>{saveFeedback.title}</p>
                        {saveFeedback.message && <p style={{ margin: '2px 0 0', fontSize: '11px', opacity: 0.85 }}>{saveFeedback.message}</p>}
                    </div>
                    <button
                        onClick={() => setSaveFeedback(prev => ({ ...prev, show: false }))}
                        style={{ background: 'none', border: 0, color: '#fff', cursor: 'pointer', padding: '2px', opacity: 0.8, flexShrink: 0 }}
                    >
                        <X size={15} />
                    </button>
                </div>
            )}

            {/* MODAL DEL LIBRO DE HISTORIAL POR ÁREA - REMOVED IN FAVOR OF IN-PAGE TABLE */}

            {/* MODAL DE CONFIRMACIÓN CUSTOM */}
            {confirmModal.show && (
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
                            <div className="field">
                                <span>Notas Médicas de la Consulta *</span>
                                <textarea
                                    required
                                    value={notasDoctor}
                                    onChange={(e) => setNotasDoctor(e.target.value)}
                                    placeholder="Ingrese el diagnóstico final, recomendaciones o indicaciones de la consulta..."
                                    rows={4}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px', minHeight: '100px' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
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

            {/* MODAL HISTOGRAMA DE SIGNOS VITALES */}
            {isHistogramModalOpen && (
                <VitalSignsHistogram
                    patient={selectedPatient}
                    onClose={() => setIsHistogramModalOpen(false)}
                />
            )}

            {/* PANEL DE AYUDA */}
            <HelpPanel
                helpItems={[
                    { title: 'Paso 1: Buscar o Registrar Paciente', content: 'Use el buscador de Cédula en la parte superior derecha para seleccionar al paciente. Si es la primera vez que asiste, haga clic en "Registrar Paciente" para crear su ficha rápidamente.' },
                    { title: 'Paso 2: Completar Ficha de Atención', content: 'Llene las secciones de la ficha (Antecedentes, Motivo, Signos Vitales, Examen Físico, Diagnóstico, Planes). Recuerde que el Motivo de Consulta y el Diagnóstico son obligatorios. El Diagnóstico debe ser Presuntivo o Definitivo, pero no ambos.' },
                    { title: 'Paso 3: Guardar Secciones Clínicas', content: 'Presione "Guardar" en cada bloque individual para registrar los cambios en la sesión de atención del día de forma segura.' },
                    { title: 'Paso 4: Ver Historial y Exportar PDF', content: 'Abra el "Libro de Historiales" del paciente, seleccione la fecha de la consulta en la lista izquierda y presione "[PDF]" para abrir el reporte clínico en una nueva pestaña listo para su revisión o impresión.' }
                ]}
                contactInfo={{ email: 'soporte@ueb.edu.ec' }}
            />
        </div>
    );
};

class MedicoGeneralErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error in MedicoGeneral_page:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '40px', background: '#fff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
                    <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '24px', borderRadius: '14px', maxWidth: '800px', margin: '40px auto', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ marginTop: 0, fontSize: '18px', fontWeight: 'bold' }}>Error en la vista de Medicina General</h2>
                        <p style={{ fontSize: '13px' }}>Se produjo un inconveniente al renderizar esta sección:</p>
                        <pre style={{ background: '#fff', padding: '14px', borderRadius: '8px', overflow: 'auto', fontSize: '12px', border: '1px solid #fca5a5', color: '#7f1d1d', fontWeight: 'bold' }}>
                            {this.state.error?.toString()}
                        </pre>
                        <button
                            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
                            style={{ background: '#dc2626', color: '#fff', border: 0, padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', marginTop: '12px' }}
                        >
                            Recargar vista
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

const MedicoGeneralWithBoundary = () => (
    <MedicoGeneralErrorBoundary>
        <MedicoGeneral_page />
    </MedicoGeneralErrorBoundary>
);

export default MedicoGeneralWithBoundary;
